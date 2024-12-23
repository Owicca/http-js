import * as net from "net";


export type TCPConn = {
    socket: net.Socket,
    err: null|Error,
    ended: boolean,
    reader: null|{
        resolve: (value: Buffer) => void,
        reject: (reason: Error) => void,
    }
};

function soInit(socket: net.Socket): TCPConn {
    const conn: TCPConn = {
        socket: socket,
        err: null,
        ended: false,
        reader: null,
    };

    socket.on('data', (data: Buffer) => {
        console.assert(conn.reader);

        conn.socket.pause();

        conn.reader!.resolve(data);

        conn.reader = null;
    });

    socket.on('end', () => {
        conn.ended = true;

        if(conn.reader) {
            conn.reader.resolve(Buffer.from(''));
            conn.reader = null;
        }
    });

    socket.on('error', (err) => {
        conn.err = err;

        if(conn.reader) {
            conn.reader.reject(err);
            conn.reader = null;
        }
    });

    return conn;
}

function soRead(conn: TCPConn): Promise<Buffer> {
    console.assert(!conn.reader);

    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }

        if (conn.ended) {
            resolve(Buffer.from(''));
            return;
        }

        conn.reader = {
            resolve: resolve,
            reject: reject
        };

        conn.socket.resume();
    });
}

function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
    console.assert(data.length > 0);

    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }

        conn.socket.write(data, (err?: Error) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export {soInit, soRead, soWrite};