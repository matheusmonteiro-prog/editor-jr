// Mini servidor local TEMPORARIO do teste de recorte (13/11/2026). Só escuta em 127.0.0.1:3901.
// Entrega entradaX.mp4, index.html e app.js da pasta PASTA_RECORTE e recebe de volta os .webm do recorte.
// Uso: PASTA_RECORTE=<pasta> node scripts/recorte-fundo/servidor.mjs   (docs/guia-recorte-fundo.md)
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const aqui = process.env.PASTA_RECORTE ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ""));
const tipos = { ".html": "text/html", ".js": "text/javascript", ".mp4": "video/mp4", ".wasm": "application/wasm" };
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (req.method === "POST" && u.pathname === "/log") { let s = ""; req.on("data", (d) => (s += d)); req.on("end", () => { fs.appendFileSync(path.join(aqui, "log.txt"), s + "\n"); res.end("ok"); }); return; }
  if (req.method === "POST" && u.pathname === "/salvar") { const nome = path.basename(u.searchParams.get("nome")); const w = fs.createWriteStream(path.join(aqui, nome)); req.pipe(w); w.on("finish", () => res.end("ok")); return; }
  let f = u.pathname === "/" ? "index.html" : u.pathname.slice(1); f = path.join(aqui, path.basename(f));
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end("nao achei"); }
  const st = fs.statSync(f), tipo = tipos[path.extname(f)] || "application/octet-stream", rg = req.headers.range;
  if (rg) { const [a, b] = rg.replace("bytes=", "").split("-"); const ini = +a, fim = b ? +b : st.size - 1; res.writeHead(206, { "Content-Type": tipo, "Content-Range": `bytes ${ini}-${fim}/${st.size}`, "Accept-Ranges": "bytes", "Content-Length": fim - ini + 1 }); return fs.createReadStream(f, { start: ini, end: fim }).pipe(res); }
  res.writeHead(200, { "Content-Type": tipo, "Content-Length": st.size, "Accept-Ranges": "bytes" }); fs.createReadStream(f).pipe(res);
}).listen(3901, "127.0.0.1", () => console.log("servidor em http://127.0.0.1:3901"));
