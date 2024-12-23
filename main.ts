import * as net from "net";
import {serveClient} from "./http";


let addr = "localhost";
let port = 3000;

async function newConn(socket: net.Socket): Promise<void> {
    console.log('new connection: ', socket.remoteAddress, socket.remotePort);

    try {
        await serveClient(socket);
    } catch (exc) {
        console.error('exception: ', exc);
    } finally {
        socket.destroy();
    }
}

function Run(addr: string, port: number) {
    const server = net.createServer({
        pauseOnConnect: true
    });

    server.on('connection', newConn);
    server.on('error', (err: Error) => {throw err;});

    console.log(`Listening on: ${addr}:${port}`);
    
    server.listen({
        host: addr,
        port: port,
        allowHalfOpen: true
    })
}

Run(addr, port);