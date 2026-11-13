// Edita um vídeo que JÁ EXISTE pela API da Higgsfield (ex.: trocar a roupa do JR), 06/11/2026.
// Pedido A-017. O JR autorizou mandar o vídeo dele para a Higgsfield (Matheus, 06/11/2026).
//
// Passo 1, NÃO gasta crédito: sobe o vídeo e as imagens e pergunta o preço de cada modelo.
//   node scripts/editar-video-ia.mjs --video out/testes-06-11/higgsfield-trecho-limpo-5s.mp4 \
//     --imagem referencias/camisa-ref-frente.jpg --imagem referencias/camisa-ref-detalhes.jpg --estimar
// Passo 2, GASTA crédito (só com o "ok" escrito do Matheus):
//   node scripts/editar-video-ia.mjs --modelo kling-std --saida roupa-teste-1.mp4 --confirmar
//   (usa o vídeo/imagens já subidos no passo 1, guardados em public/videos/cenas/editar-video-ia.uploads.json)
// Retomar sem gastar: node scripts/editar-video-ia.mjs --saida roupa-teste-1.mp4 --retomar
//
// Modelos (docs.higgsfield.ai, lidos em 06/11/2026):
//   kling-std / kling-pro   POST /kling-video/omni/video-edit  (vídeo de 3 a 10 s, até 4 imagens, mode std|pro)
//   seedance-720 / -1080    POST /bytedance/seedance-2.5/video-edit (vídeo de 4 a 30 s, resolução, sem áudio gerado)
// Preço: POST /estimate/<endpoint> com o mesmo corpo (rota documentada para outro modelo; aqui é testada).
// Pedido que falha não é cobrado. O resultado fica 7 dias na Higgsfield.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(RAIZ, ".env"), quiet: true });
const API = "https://api.higgsfield.ai";
const PASTA = path.join(RAIZ, "public", "videos", "cenas");
const UPLOADS = path.join(PASTA, "editar-video-ia.uploads.json");
const FINAIS = ["completed", "failed", "nsfw", "canceled"];

const PROMPT_ROUPA =
  "Replace only the man's t-shirt with the dark olive green western shirt from the reference images: " +
  "long sleeves, pointed collar, western yoke, flap pockets, pearl snap buttons, same twill fabric and color. " +
  "Keep his face, expression, hat, skin, hands, lip movement, body motion, camera framing, lighting and background " +
  "exactly the same as the source video. Natural fabric folds that follow his movement. Photorealistic.";

const MODELOS = {
  "kling-std": { rota: "kling-video/omni/video-edit", corpo: (v, imgs, p) => ({ prompt: p, video_urls: [v], image_urls: imgs.slice(0, 4), mode: "std" }) },
  "kling-pro": { rota: "kling-video/omni/video-edit", corpo: (v, imgs, p) => ({ prompt: p, video_urls: [v], image_urls: imgs.slice(0, 4), mode: "pro" }) },
  "seedance-480": { rota: "bytedance/seedance-2.5/video-edit", corpo: (v, imgs, p) => ({ prompt: p, video_url: v, image_urls: imgs, resolution: "480p", generate_audio: false }) },
  "seedance-720": { rota: "bytedance/seedance-2.5/video-edit", corpo: (v, imgs, p) => ({ prompt: p, video_url: v, image_urls: imgs, resolution: "720p", generate_audio: false }) },
  "seedance-1080": { rota: "bytedance/seedance-2.5/video-edit", corpo: (v, imgs, p) => ({ prompt: p, video_url: v, image_urls: imgs, resolution: "1080p", generate_audio: false }) },
};

// Cena NOVA a partir de fotos + áudio (11/11/2026, A-019): Seedance 2.5 reference-to-video. Não usa vídeo
// de entrada. A doc da Higgsfield não diz que a boca sincroniza com o áudio: é o que o teste confere.
// Campos (docs.higgsfield.ai, lidos em 11/11/2026): image_urls 1-30, audio_urls 1-10, duration 4-30 s,
// resolution 480p|720p|1080p, generate_audio.
// Wan 2.7 image-to-video (docs/higgsfield/catalogo.md): image_url = 1º quadro, audio_url = "driving audio"
// (áudio que conduz o vídeo), end_image_url opcional (último quadro), duration 2-15 s, 720p|1080p.
const NEGATIVO = "nodding, looking down, head bobbing, fast or nervous movements, camera movement, zoom, " +
  "different person, changed face, distorted face, extra fingers, text, subtitles, watermark";
const corpoSeedance = (m, imgs, auds, p, dur) => ({ prompt: p, image_urls: imgs, audio_urls: auds, duration: dur, resolution: m.res, aspect_ratio: "16:9", generate_audio: false });
const corpoWan = (m, imgs, auds, p, dur) => ({ prompt: p, image_url: imgs[0], ...(imgs[1] ? { end_image_url: imgs[1] } : {}), audio_url: auds[0], duration: dur, resolution: m.res, negative_prompt: NEGATIVO, prompt_extend: false });
const MODELOS_CENA = {
  "seedance-ref-480": { rota: "bytedance/seedance-2.5/reference-to-video", res: "480p", corpo: corpoSeedance },
  "seedance-ref-720": { rota: "bytedance/seedance-2.5/reference-to-video", res: "720p", corpo: corpoSeedance },
  "seedance-ref-1080": { rota: "bytedance/seedance-2.5/reference-to-video", res: "1080p", corpo: corpoSeedance },
  "wan27-720": { rota: "wan/v2.7/image-to-video", res: "720p", corpo: corpoWan },
  "wan27-1080": { rota: "wan/v2.7/image-to-video", res: "1080p", corpo: corpoWan },
};
const corpoCena = (m, imgs, auds, p, dur) => m.corpo(m, imgs, auds, p, dur);

const arg = (n) => { const i = process.argv.indexOf(n); return i === -1 ? undefined : process.argv[i + 1]; };
const varios = (n) => process.argv.flatMap((a, i) => (a === n ? [process.argv[i + 1]] : []));
const tem = (n) => process.argv.includes(n);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function cabecalho() {
  const id = process.env.HF_API_KEY_ID, seg = process.env.HF_API_KEY_SECRET;
  if (!id || !seg) throw new Error("Faltam HF_API_KEY_ID / HF_API_KEY_SECRET no .env");
  return { Authorization: `Key ${id}:${seg}`, "Content-Type": "application/json" };
}

async function chamar(metodo, url, corpo) {
  const r = await fetch(url, { method: metodo, headers: cabecalho(), body: corpo ? JSON.stringify(corpo) : undefined });
  const texto = await r.text();
  let json; try { json = JSON.parse(texto); } catch { json = { bruto: texto.slice(0, 500) }; }
  return { ok: r.ok, status: r.status, json };
}

const TIPOS = { ".wav": "audio/wav", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function subir(arquivo) {
  const tipo = TIPOS[path.extname(arquivo).toLowerCase()];
  if (!tipo) throw new Error(`Tipo não suportado: ${arquivo}`);
  const r = await chamar("POST", `${API}/files/generate-upload-url`, { content_type: tipo });
  if (!r.ok) throw new Error(`generate-upload-url ${r.status}: ${JSON.stringify(r.json)}`);
  // Credenciais NÃO vão para o endereço de armazenamento: só os cabeçalhos que a API mandou.
  const put = await fetch(r.json.upload_url, { method: "PUT", headers: r.json.upload_headers ?? { "Content-Type": tipo }, body: await readFile(path.resolve(RAIZ, arquivo)) });
  if (!put.ok) throw new Error(`upload ${put.status}: ${(await put.text()).slice(0, 300)}`);
  console.log(`subiu: ${arquivo}`);
  return r.json.public_url;
}

async function main() {
  await mkdir(PASTA, { recursive: true });
  const prompt = arg("--prompt") ?? PROMPT_ROUPA;

  // Modo cena nova: --cena --imagem a.jpg [--imagem b.jpg] --audio voz.wav --duracao 9 --estimar
  //                  depois: --cena --modelo seedance-ref-720 --duracao 9 --saida x.mp4 --confirmar
  if (tem("--cena") && tem("--estimar")) {
    const imagens = varios("--imagem"), audios = varios("--audio"), dur = Number(arg("--duracao") ?? 5);
    if (!imagens.length || !audios.length) throw new Error("Use --imagem e --audio");
    const up = { imagens: [], audios: [] };
    for (const im of imagens) up.imagens.push(await subir(im));
    for (const a of audios) up.audios.push(await subir(a));
    await writeFile(UPLOADS, JSON.stringify({ ...up, arquivosImagem: imagens, arquivosAudio: audios, em: new Date().toISOString() }, null, 2));
    for (const [nome, m] of Object.entries(MODELOS_CENA)) {
      const r = await chamar("POST", `${API}/estimate/${m.rota}`, corpoCena(m, up.imagens, up.audios, prompt, dur));
      console.log(`${nome.padEnd(18)} ${r.ok ? `US$ ${r.json.usd ?? JSON.stringify(r.json).slice(0, 400)}` : `sem estimativa (${r.status}) ${JSON.stringify(r.json).slice(0, 200)}`}`);
    }
    return;
  }

  if (tem("--estimar")) {
    const video = arg("--video"); const imagens = varios("--imagem");
    if (!video) throw new Error("Use --video <arquivo.mp4>");
    const up = { video: await subir(video), imagens: [] };
    for (const im of imagens) up.imagens.push(await subir(im));
    await writeFile(UPLOADS, JSON.stringify({ ...up, arquivoVideo: video, arquivosImagem: imagens, em: new Date().toISOString() }, null, 2));
    for (const [nome, m] of Object.entries(MODELOS)) {
      const r = await chamar("POST", `${API}/estimate/${m.rota}`, m.corpo(up.video, up.imagens, prompt));
      console.log(`${nome.padEnd(14)} ${r.ok ? `US$ ${r.json.usd ?? JSON.stringify(r.json)}` : `sem estimativa (${r.status}) ${JSON.stringify(r.json).slice(0, 200)}`}`);
    }
    return;
  }

  const saida = arg("--saida");
  if (!saida) throw new Error("Use --saida nome.mp4");
  const destino = path.join(PASTA, saida);
  const arqPedido = `${destino}.pedido.json`;
  let pedido;

  if (tem("--retomar")) {
    pedido = JSON.parse(await readFile(arqPedido, "utf8"));
  } else {
    if (!tem("--confirmar")) throw new Error("Gerar gasta crédito: precisa de --confirmar (com o ok do Matheus).");
    if (existsSync(destino) || existsSync(arqPedido)) throw new Error(`${saida} já existe (use outro nome ou --retomar).`);
    const up = JSON.parse(await readFile(UPLOADS, "utf8"));
    let r;
    if (tem("--cena")) {
      const m = MODELOS_CENA[arg("--modelo")];
      if (!m) throw new Error(`--modelo: ${Object.keys(MODELOS_CENA).join(" | ")}`);
      r = await chamar("POST", `${API}/${m.rota}`, corpoCena(m, up.imagens, up.audios, prompt, Number(arg("--duracao") ?? 5)));
    } else {
      const m = MODELOS[arg("--modelo")];
      if (!m) throw new Error(`--modelo: ${Object.keys(MODELOS).join(" | ")}`);
      r = await chamar("POST", `${API}/${m.rota}`, m.corpo(up.video, up.imagens, prompt));
    }
    if (!r.ok) throw new Error(`pedido ${r.status}: ${JSON.stringify(r.json)}`);
    pedido = { request_id: r.json.request_id, status_url: r.json.status_url, modelo: arg("--modelo"), prompt, em: new Date().toISOString() };
    await writeFile(arqPedido, JSON.stringify(pedido, null, 2));
    console.log(`pedido aceito: ${pedido.request_id}`);
  }

  const inicio = Date.now(); let espera = 2000;
  while (Date.now() - inicio < 40 * 60000) {
    const r = await chamar("GET", pedido.status_url ?? `${API}/requests/${pedido.request_id}/status`);
    const st = r.json.status;
    process.stdout.write(`\rstatus: ${st} (${Math.round((Date.now() - inicio) / 1000)} s)   `);
    if (FINAIS.includes(st)) {
      console.log();
      if (st !== "completed") throw new Error(`terminou como ${st}: ${JSON.stringify(r.json).slice(0, 300)}`);
      const url = r.json.video?.url;
      const v = await fetch(url);
      await writeFile(destino, Buffer.from(await v.arrayBuffer()));
      console.log(`ok: ${path.relative(RAIZ, destino)}`);
      return;
    }
    await dormir(espera); espera = Math.min(10000, espera * 1.5);
  }
  console.log("\nAinda na fila. Rode de novo com --retomar (não gasta).");
}

main().catch((e) => { console.error("erro:", e.message); process.exit(1); });
