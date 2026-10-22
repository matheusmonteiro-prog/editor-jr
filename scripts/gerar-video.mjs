// Gera um clipe de vídeo pela API da Higgsfield (Kling 3.0 Standard, texto para vídeo) e salva em
// public/videos/cenas/. Vídeo nunca vai para o Git (*.mp4 no .gitignore).
// Uso: node scripts/gerar-video.mjs --prompt "texto aqui" --saida a2-boi.mp4
//      [--duracao 3] [--proporcao 9:16]
//      node scripts/gerar-video.mjs --saida a2-boi.mp4 --retomar
//      node scripts/gerar-video.mjs --saida a2-boi.mp4 --retomar --pedido REQUEST_ID
// Assim que a API aceita o pedido, o ID fica salvo em public/videos/cenas/<saida>.pedido.json.
// Com --retomar, o script NÃO envia pedido novo (não gasta crédito): só consulta esse pedido e
// baixa o vídeo quando ficar pronto.
// Base: https://docs.higgsfield.ai/docs/models/kling-3/standard-text-to-video.md
// (duração de 3 a 15 s; proporção 16:9, 9:16 ou 1:1; som "off" porque o vídeo usa só a narração).
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(RAIZ, ".env") });

const ENDPOINT = "https://api.higgsfield.ai/kling-video/v3.0/std/text-to-video";
const INTERVALO_MS = 10000;
const LIMITE_MS = 30 * 60000; // vídeo demora: em 22/10/2026 a fila passou de 15 min
const STATUS_FINAIS = ["completed", "failed", "nsfw", "canceled"];
const PASTA = path.join(RAIZ, "public", "videos", "cenas");
const CATALOGO = path.join(RAIZ, "public", "images", "catalogo-gerados.json");

// Mesmo prompt = igual sem diferenciar maiúscula/minúscula e sem espaços nas pontas.
const normalizar = (texto) => texto.trim().toLowerCase();

async function lerCatalogo() {
  let bruto;
  try {
    bruto = await readFile(CATALOGO, "utf8");
  } catch (erro) {
    if (erro.code === "ENOENT") return [];
    throw erro;
  }
  const lista = JSON.parse(bruto);
  if (!Array.isArray(lista)) {
    throw new Error("catalogo-gerados.json precisa ser uma lista []");
  }
  return lista;
}

function lerOpcao(nome) {
  const i = process.argv.indexOf(nome);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { HF_API_KEY_ID, HF_API_KEY_SECRET } = process.env;
  if (!HF_API_KEY_ID || !HF_API_KEY_SECRET) {
    console.log("Erro: HF_API_KEY_ID e HF_API_KEY_SECRET não encontrados no .env");
    process.exit(1);
  }

  const retomar = process.argv.includes("--retomar");
  let prompt = lerOpcao("--prompt");
  const saida = lerOpcao("--saida");
  const duracao = Number(lerOpcao("--duracao") ?? 3);
  const proporcao = lerOpcao("--proporcao") ?? "9:16";
  if (!saida || (!prompt && !retomar)) {
    console.log('Erro: passe --prompt "texto aqui" e --saida nome.mp4 (ou --saida nome.mp4 --retomar)');
    process.exit(1);
  }
  if (!/^[a-z0-9-]+\.mp4$/.test(saida)) {
    console.log("Erro: --saida precisa ser um nome sem espaço terminado em .mp4 (ex.: a2-boi.mp4)");
    process.exit(1);
  }
  if (!Number.isInteger(duracao) || duracao < 3 || duracao > 15) {
    console.log("Erro: --duracao precisa ser um número inteiro de 3 a 15");
    process.exit(1);
  }
  const destino = path.join(PASTA, saida);
  if (existsSync(destino)) {
    console.log(`Já existe: public/videos/cenas/${saida} (apague antes, se quiser gerar de novo)`);
    return;
  }

  const headers = {
    Authorization: `Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}`,
    "Content-Type": "application/json",
  };
  const arquivoPedido = path.join(PASTA, `${saida}.pedido.json`);

  let statusUrl;
  const idPedido = lerOpcao("--pedido");
  if (retomar && idPedido) {
    // Pedido sem arquivo salvo (ex.: enviado por uma versão antiga do script). Sem o prompt,
    // o catálogo não é atualizado aqui.
    statusUrl = `https://api.higgsfield.ai/requests/${idPedido}/status`;
    console.log(`Retomando o pedido ${idPedido} (sem enviar de novo)...`);
  } else if (retomar) {
    if (!existsSync(arquivoPedido)) {
      console.log(`Erro: não achei public/videos/cenas/${saida}.pedido.json (nada para retomar)`);
      process.exit(1);
    }
    const pedido = JSON.parse(await readFile(arquivoPedido, "utf8"));
    statusUrl = pedido.status_url;
    prompt = pedido.prompt;
    console.log(`Retomando o pedido ${pedido.request_id} (sem enviar de novo)...`);
  } else {
    const catalogo = await lerCatalogo();
    const existente = catalogo.find((entrada) => normalizar(entrada.prompt) === normalizar(prompt));
    if (existente) {
      console.log(`Já existe: ${existente.arquivo}`);
      return;
    }
    if (existsSync(arquivoPedido)) {
      console.log(`Já existe um pedido para ${saida}. Use --retomar para não gastar crédito de novo.`);
      return;
    }

    const envio = await fetch(ENDPOINT, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": randomUUID() },
      body: JSON.stringify({ prompt, duration: duracao, aspect_ratio: proporcao, sound: "off" }),
    });
    if (!envio.ok) {
      console.log(`Erro ao enviar: HTTP ${envio.status} ${await envio.text()}`);
      process.exit(1);
    }
    const resposta = await envio.json();
    statusUrl = resposta.status_url;
    if (!statusUrl) {
      console.log("Erro: a resposta não trouxe status_url");
      process.exit(1);
    }
    await mkdir(PASTA, { recursive: true });
    await writeFile(
      arquivoPedido,
      JSON.stringify({ request_id: resposta.request_id, status_url: statusUrl, prompt: prompt.trim() }, null, 2) + "\n",
    );
    console.log(`Enviado (${duracao} s, ${proporcao}). Pedido ${resposta.request_id} salvo. Aguardando...`);
  }

  const inicio = Date.now();
  let resultado;
  while (Date.now() - inicio < LIMITE_MS) {
    await dormir(INTERVALO_MS);
    const resposta = await fetch(statusUrl, { headers });
    if (!resposta.ok) {
      console.log(`Erro ao consultar status: HTTP ${resposta.status} ${await resposta.text()}`);
      process.exit(1);
    }
    const dados = await resposta.json();
    if (STATUS_FINAIS.includes(dados.status)) {
      resultado = dados;
      break;
    }
  }

  if (!resultado) {
    console.log(`Erro: passou de 15 min sem o resultado ficar pronto. Status: ${statusUrl}`);
    process.exit(1);
  }
  if (resultado.status !== "completed") {
    console.log(`Erro: a geração terminou com status "${resultado.status}"`);
    process.exit(1);
  }

  const urlVideo = resultado.video?.url;
  if (!urlVideo) {
    console.log("Erro: resultado completo, mas sem video.url");
    process.exit(1);
  }

  const arquivo = await fetch(urlVideo);
  if (!arquivo.ok) {
    console.log(`Erro ao baixar o vídeo: HTTP ${arquivo.status}`);
    process.exit(1);
  }

  await mkdir(PASTA, { recursive: true });
  await writeFile(destino, Buffer.from(await arquivo.arrayBuffer()));

  // Relê o catálogo agora (outro processo pode ter escrito enquanto este esperava).
  if (prompt) {
    const catalogo = await lerCatalogo();
    catalogo.push({ prompt: prompt.trim(), arquivo: `public/videos/cenas/${saida}` });
    await writeFile(CATALOGO, JSON.stringify(catalogo, null, 2) + "\n");
  }

  console.log(`Gerado: public/videos/cenas/${saida}`);
}

main().catch((erro) => {
  console.log(`Erro: ${erro.message}`);
  process.exit(1);
});
