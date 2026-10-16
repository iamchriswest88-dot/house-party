// House Party Quiz — tiny relay server.
// Serves the game page and passes each player's state between phones and the big screen.
// The game itself runs in the host's browser; this server only relays, so a restart loses nothing important.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const PAGE = path.join(__dirname, "public", "index.html");
const MAX_STATE = 8 * 1024;       // bytes of state per player
const MAX_PEERS = 60;             // per room
const GRACE_MS = 15000;           // keep a dropped player listed while they reconnect

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  if (url === "/" || url === "/index.html") {
    fs.readFile(PAGE, (err, buf) => {
      if (err) { res.writeHead(500); return res.end("Page missing"); }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(buf);
    });
    return;
  }
  res.writeHead(302, { Location: "/" }); res.end();
});

// rooms: code -> Map(peerId -> { ws, data, timer })
const rooms = new Map();
const pending = new Set();

function broadcast(code) {
  if (pending.has(code)) return;
  pending.add(code);
  setImmediate(() => {
    pending.delete(code);
    const room = rooms.get(code);
    if (!room) return;
    const peers = [...room].map(([id, p]) => ({ id, data: p.data }));
    const msg = JSON.stringify({ t: "peers", peers });
    for (const p of room.values()) if (p.ws && p.ws.readyState === 1) p.ws.send(msg);
  });
}

const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 16 * 1024 });

wss.on("connection", ws => {
  let code = null, id = null;
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  ws.on("message", raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "join") {
      const c = String(m.room || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
      const pid = String(m.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
      if (!c || !pid) return;
      let room = rooms.get(c);
      if (!room) { room = new Map(); rooms.set(c, room); }
      const existing = room.get(pid);
      if (!existing && room.size >= MAX_PEERS) return ws.send(JSON.stringify({ t: "full" }));
      if (existing) { clearTimeout(existing.timer); if (existing.ws && existing.ws !== ws) existing.ws.terminate(); }
      const fresh = m.data && typeof m.data === "object" && Object.keys(m.data).length && JSON.stringify(m.data).length <= MAX_STATE;
      const data = fresh ? m.data : (existing ? existing.data : {});
      room.set(pid, { ws, data, timer: null });
      code = c; id = pid;
      broadcast(code);
    } else if (m.t === "set" && code) {
      const room = rooms.get(code); const p = room && room.get(id);
      if (!p || !m.data || typeof m.data !== "object") return;
      const next = Object.assign({}, p.data);
      for (const [k, v] of Object.entries(m.data)) { if (v === null) delete next[k]; else next[k] = v; }
      if (JSON.stringify(next).length > MAX_STATE) return;
      p.data = next;
      broadcast(code);
    }
  });

  ws.on("close", () => {
    if (!code) return;
    const room = rooms.get(code); const p = room && room.get(id);
    if (!p || p.ws !== ws) return;
    p.ws = null;
    p.timer = setTimeout(() => {
      room.delete(id);
      if (room.size === 0) rooms.delete(code); else broadcast(code);
    }, GRACE_MS);
  });
});

// Drop dead connections and keep the server awake while a game is open.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 25000);

server.listen(PORT, () => console.log(`House Party Quiz on http://localhost:${PORT}`));
