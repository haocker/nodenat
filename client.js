const net = require('net');
const fs = require('fs');
let client = new net.Socket();
let clients = {};
client.setEncoding('utf-8');
client.connect(7640,'127.0.0.1',()=>{
    client.write('auth:m8848');
    setInterval(() => {
        client.write('auth:m8848');
    }, 10000);
})
client.on('data',(e)=>{
    //e = JSON.parse(e);
    console.log(e.toString());
    let mark = e.indexOf('|',0);
    let address = e.substr(0,mark);
    let data = e.replace(address+'|','');
    console.log(address);
    if(clients[address]==null){
        clients[address]=new net.Socket();
        clients[address].connect(1883,'49.235.247.145');
        clients[address].on('connect',(e)=>{
            clients[address].write(Buffer.from(data,'hex'));
        });
        clients[address].on('data',(e)=>{
            client.write(address+'|'+Buffer.from(e).toString('hex'));
        });
        clients[address].on('error',(e)=>{
            client.write('error');
        });
    }else{
        clients[address].write(Buffer.from(data,'hex'));
    }
    
    
    
    //client.write('m8848');
})
client.on('error',(e)=>{
    client.write('error');
});
client.on('end',(e)=>{
    process.exit(0);
});
setInterval(() => {
    console.log(Object.keys(clients));
}, 2000);