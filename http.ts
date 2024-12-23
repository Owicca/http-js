import {Buffer} from "node:buffer";
import * as net from "net";

import type { TCPConn } from "./tcp";
import {soInit, soRead, soWrite} from "./tcp";


type BodyReader = {
    length: number,
    read: () => Promise<Buffer>,
};

type HTTPReq = {
    method: string,
    uri: Buffer,
    version: string,
    headers: Buffer[],
};

type HTTPRes = {
    code: number,
    headers: Buffer[],
    body: BodyReader,
}

type DynBuf = {
    data: Buffer,
    length: number,
}

function bufPush(buf: DynBuf, data: Buffer): void {
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

function bufPop(buf: DynBuf, len: number): void {
    buf.data.copyWithin(0, len, buf.length);
    buf.length -= len;
}

function cutMessage(buf: DynBuf): null|Buffer {
    const idx = buf.data.subarray(0, buf.length).indexOf('\n');
    if (idx < 0) {
        return null;
    }

    const msg = Buffer.from(buf.data.subarray(0, idx+1));
    bufPop(buf, idx+1);
    return msg;
}

async function serveClient(socket: net.Socket): Promise<void> {
    const conn: TCPConn = soInit(socket);
    const buf: DynBuf = {
        data: Buffer.alloc(0),
        length: 0,
    };

    while (true) {
        const msg: null|Buffer = cutMessage(buf);
        if (!msg) {
            const data: Buffer = await soRead(conn);
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

export {serveClient};