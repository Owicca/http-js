const {Buffer} = require("node:buffer");
const {soInit, soRead, soWrite} = require("./tcp");

function DynBuf() {
    return {
        data: Buffer.from([]),
        length: 0
    };
}

function bufPush(buf, data) {
    const newLen = buf.length + data.length;

    if (buf.data.length < newLen) {
        let cap = Math.max(buf.data.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }

        const grown = Buffer.alloc(cap);
        buf.data.copy(grown, 0, 0);
        buf.data = grown;
    }

    data.copy(buf.data, buf.length, 0);

    buf.length = newLen
}

function bufPop(buf, len) {
    buf.data.copyWithin(0, len, buf.length);
    buf.length -= len;
}

function cutMessage(buf) {
    const idx = buf.data.subarray(0, buf.length).indexOf('\n');
    if (idx < 0) {
        return null;
    }

    const msg = Buffer.from(buf.data.subarray(0, idx+1));
    bufPop(buf, idx+1);
    return msg;
}

async function serveClient(socket) {
    const conn = soInit(socket);
    const buf = DynBuf();

    while (true) {
        const msg = cutMessage(buf);
        if (!msg) {
            const data = await soRead(conn);
            bufPush(buf, data);

            if (data.length === 0) {
                return;
            }

            continue;
        }

        if (msg.equals(Buffer.from('quit\n'))) {
            await soWrite(conn, Buffer.from('Bye.\n'));
            socket.destroy();
            return;
        } else {
            const reply = Buffer.concat([Buffer.from('Echo: '), msg]);
            await soWrite(conn, reply);
        }
    }
}

module.exports = {serveClient};