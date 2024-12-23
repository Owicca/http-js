const net = require("net");
const {serveClient} = require("./http");

let addr = "localhost";
let port = 3000;

async function newConn(socket) {
    console.log('new connection: ', socket.remoteAddress, socket.remotePort);

    try {
        await serveClient(socket);
    } catch (exc) {
        console.error('exception: ', exc);
    } finally {
        socket.destroy();
    }
}

function Run(addr, port) {
    const server = net.createServer({
        pauseOnConnect: true
    });

    server.on('connection', newConn);
    server.on('error', (err) => {throw err;});

    console.log(`Listening on: ${addr}:${port}`);
    
    server.listen({
        host: addr,
        port: port,
        allowHalfOpen: true
    })
}

Run(addr, port);