// Cuisine Miroir — serveur de salles pour deux joueurs.
// Aucune dépendance : sert index.html et gère un WebSocket minimal sur /ws.
// Chaque salle a un code de 4 lettres, un hôte (Cuisine Soleil) et un invité (Cuisine Lune).
// Le serveur ne fait que relayer les messages entre les deux joueurs d'une salle.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_PAYLOAD = 512 * 1024;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const STATIC = { '/': 'index.html', '/index.html': 'index.html', '/miroir': 'miroir.html', '/miroir.html': 'miroir.html' };

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }
  const file = STATIC[url];
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Introuvable');
    return;
  }
  fs.readFile(path.join(__dirname, file), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end();
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(data);
  });
});

// ---------- WebSocket minimal (RFC 6455) ----------
function parseFrame(buf) {
  if (buf.length < 2) return null;
  const fin = (buf[0] & 0x80) !== 0;
  const op = buf[0] & 0x0f;
  const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f;
  let off = 2;
  if (len === 126) {
    if (buf.length < 4) return null;
    len = buf.readUInt16BE(2);
    off = 4;
  } else if (len === 127) {
    if (buf.length < 10) return null;
    len = buf.readUInt32BE(2) * 2 ** 32 + buf.readUInt32BE(6);
    off = 10;
  }
  if (len > MAX_PAYLOAD) return { tooBig: true };
  const maskLen = masked ? 4 : 0;
  if (buf.length < off + maskLen + len) return null;
  let payload = buf.subarray(off + maskLen, off + maskLen + len);
  if (masked) {
    const mask = buf.subarray(off, off + 4);
    payload = Buffer.from(payload);
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
  }
  return { fin, op, payload, size: off + maskLen + len };
}

function buildFrame(op, payload) {
  const n = payload.length;
  let head;
  if (n < 126) {
    head = Buffer.from([0x80 | op, n]);
  } else if (n < 65536) {
    head = Buffer.alloc(4);
    head[0] = 0x80 | op;
    head[1] = 126;
    head.writeUInt16BE(n, 2);
  } else {
    head = Buffer.alloc(10);
    head[0] = 0x80 | op;
    head[1] = 127;
    head.writeUInt32BE(Math.floor(n / 2 ** 32), 2);
    head.writeUInt32BE(n >>> 0, 6);
  }
  return Buffer.concat([head, payload]);
}

const rooms = new Map();
const clients = new Set();

function newCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

class Client {
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.parts = [];
    this.alive = true;
    this.room = null;
    this.closed = false;
    clients.add(this);
    socket.setNoDelay(true);
    socket.on('data', (d) => this.onData(d));
    socket.on('close', () => this.cleanup());
    socket.on('error', () => this.cleanup());
  }

  onData(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    for (;;) {
      const fr = parseFrame(this.buf);
      if (!fr) break;
      if (fr.tooBig) {
        this.close();
        return;
      }
      this.buf = this.buf.subarray(fr.size);
      this.onFrame(fr);
      if (this.closed) return;
    }
  }

  onFrame(fr) {
    this.alive = true;
    if (fr.op === 0x8) return this.close();
    if (fr.op === 0x9) return this.raw(0xa, fr.payload);
    if (fr.op === 0xa) return;
    if (fr.op === 0x1 || fr.op === 0x2) {
      if (fr.fin) this.onMessage(fr.payload.toString('utf8'));
      else this.parts = [fr.payload];
    } else if (fr.op === 0x0) {
      this.parts.push(fr.payload);
      if (fr.fin) {
        const msg = Buffer.concat(this.parts).toString('utf8');
        this.parts = [];
        this.onMessage(msg);
      }
    }
  }

  raw(op, payload) {
    if (this.closed || this.socket.destroyed) return;
    this.socket.write(buildFrame(op, payload));
  }

  sendText(text) {
    this.raw(0x1, Buffer.from(text, 'utf8'));
  }

  send(obj) {
    this.sendText(JSON.stringify(obj));
  }

  onMessage(text) {
    let m;
    try {
      m = JSON.parse(text);
    } catch (e) {
      return;
    }
    if (!m || typeof m.t !== 'string') return;

    if (m.t === 'create') {
      this.leave();
      const code = newCode();
      const room = { code, host: this, guest: null };
      rooms.set(code, room);
      this.room = room;
      this.send({ t: 'created', code });
      return;
    }
    if (m.t === 'join') {
      const code = String(m.code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return this.send({ t: 'error', msg: 'Salle introuvable. Vérifie le code.' });
      if (room.host === this) return;
      if (room.guest) return this.send({ t: 'error', msg: 'Cette salle est déjà complète (2 joueurs).' });
      this.leave();
      room.guest = this;
      this.room = room;
      this.send({ t: 'joined', code });
      room.host.send({ t: 'partner' });
      return;
    }
    if (m.t === 'ping') return this.send({ t: 'pong', at: m.at });

    // Tout le reste est relayé au partenaire de la salle.
    const room = this.room;
    if (!room) return;
    const other = room.host === this ? room.guest : room.host;
    if (other) other.sendText(text);
  }

  leave() {
    const room = this.room;
    if (!room) return;
    this.room = null;
    if (room.host === this) {
      if (room.guest) {
        room.guest.send({ t: 'left', hostLeft: true });
        room.guest.room = null;
      }
      rooms.delete(room.code);
    } else if (room.guest === this) {
      room.guest = null;
      if (room.host) room.host.send({ t: 'left', hostLeft: false });
    }
  }

  close() {
    if (this.closed) return;
    this.raw(0x8, Buffer.alloc(0));
    this.cleanup();
  }

  cleanup() {
    if (this.closed) return;
    this.closed = true;
    this.leave();
    clients.delete(this);
    try {
      this.socket.end();
      this.socket.destroy();
    } catch (e) {
      /* déjà fermé */
    }
  }
}

server.on('upgrade', (req, socket) => {
  const url = (req.url || '').split('?')[0];
  const key = req.headers['sec-websocket-key'];
  if (url !== '/ws' || String(req.headers.upgrade || '').toLowerCase() !== 'websocket' || !key) {
    socket.destroy();
    return;
  }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );
  new Client(socket);
});

// Battement de cœur : coupe les connexions mortes et garde les autres ouvertes derrière le proxy.
setInterval(() => {
  for (const c of clients) {
    if (!c.alive) {
      c.cleanup();
      continue;
    }
    c.alive = false;
    c.raw(0x9, Buffer.alloc(0));
  }
}, 20000);

server.listen(PORT, () => {
  console.log('Cuisine Miroir en écoute sur le port ' + PORT);
});
