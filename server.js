// Local preview: builds the site, then serves ./dist at http://localhost:4000 (this computer only).
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { build } = require("./build");

const PORT = Number(process.env.PORT) || 4000;
const DIST = path.join(__dirname, "dist");
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

build();
// Rebuild when content.json or the stylesheet changes, so edits show on refresh.
for (const f of ["content.json", path.join("src", "styles.css")]) {
  fs.watchFile(path.join(__dirname, f), { interval: 500 }, () => { try { build(); } catch (e) { console.error("Couldn't rebuild: " + e.message); } });
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.normalize(path.join(DIST, urlPath === "/" ? "index.html" : urlPath));
  if (!file.startsWith(DIST + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(buf);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`Website preview: http://localhost:${PORT}  (edit content.json, then refresh)`));
