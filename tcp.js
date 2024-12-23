function TCPConn(socket = null, err = null, ended = false, reader = null) {
    let self = this;

    self.socket = socket;
    self.err = err;
    self.ended = ended;

    self.reader = reader;

    return self;
}

function soInit(socket) {
    const conn = TCPConn(socket, null, false, null);

    socket.on('data', (data) => {
        console.assert(conn.reader);

        conn.socket.pause();

        conn.reader.resolve(data);

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

function soRead(conn) {
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

function soWrite(conn, data) {
    console.assert(data.length > 0);

    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }

        conn.socket.write(data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {TCPConn, soInit, soRead, soWrite};