const net = require('net');
const crypto = require('crypto');
servers = {};//存放内网转发客户端socket
clients = {};//存放外网访问客户socket
userdata={
    '8001':'m8848'
}
function action(r){
    //对外服务 r为外网访问客户socket
    r.setEncoding('hex');
    let address = ''+r.remoteAddress+r.remotePort;
    clients[address] = r;
    let serverid = userdata[r.localPort];
    console.log(serverid);
    r.on('error',(e)=>{//外网客户断开，置为null
        if(clients[address]!=null){
            clients[address]=null
        }
        console.log(e);
    });
    r.on('end',()=>{//外网客户断开，置为null
        if(clients[address]!=null){
            clients[address]=null
        }
        console.log('onend');
    });
    r.on('data',(e)=>{//收到数据转发给内网
        
        if(servers[serverid]!=null){
            console.log(e.toString(),serverid);
            servers[serverid].write(address+'|'+e);
        }
    })
}
function forword(r){
    //转发服务 r为内网转发客户端socket
    r.setEncoding('hex');
    let id = '';
    r.on('error',(e)=>{
        id!=''?servers[id] = null:'';
    });
    r.on('end',()=>{
        id!=''?servers[id] = null:'';
    });
    r.on('data',(e)=>{//收到内网的数据
        let estr = Buffer.from(e,'hex').toString();
        //console.log(estr.indexOf('auth:'));
        if(estr.indexOf('auth:')==0){//注册内网服务
            let token = estr.replace('auth:','')
            id = token;
            if(servers[id]==null){
                servers[id] = r;
            }
        }else{//转发给外网客户socket
            let mark = estr.indexOf('|',0);
            let address = estr.substr(0,mark);
            let data = estr.replace(address+'|','');
            console.log(address,Buffer.from(data,'hex').toString('utf8'));
            if(clients[address]!=null){//外网客户还存在
                clients[address].write(Buffer.from(data,'hex'));
            }
        }
    })
}
net.createServer(action).listen(8001).on('error',(e)=>{console.log(e);});
net.createServer(forword).listen(7640).on('error',(e)=>{console.log(e);});
setInterval(() => {
    console.log(Object.keys(servers),Object.keys(clients));
}, 2000);