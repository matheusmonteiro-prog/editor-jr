// Servidor local do editor (fatia 3). Uso: npm run editor  →  http://127.0.0.1:5173/editor/
//
// Um processo só: este arquivo escuta em 127.0.0.1:5173 (nunca na rede), responde as rotas
// /api/* e passa todo o resto ao Vite, ligado aqui dentro em modo middleware
// (https://vite.dev/config/server-options#server-middlewaremode). Sem pacote novo.
//
// Rotas de gravar (só POST, só JSON, só de uma página aberta em 127.0.0.1:5173 ou localhost:5173):
//   POST /api/copias   { plano: "teste-kit-v3", conteudo: {...} } → grava planos/copias/<nome gerado aqui>
//   POST /api/validar  { arquivo: "<nome de uma cópia>" }         → roda scripts/validar-plano.mjs nela
//   POST /api/salvar-atual { plano: "0926.atual", hashEsperado, conteudo } → grava planos/atual/<nome>.json
//        SÓ se: o nome está na lista real de planos/atual/; o hash do arquivo no disco = hashEsperado
//        (senão 409, nada gravado); o conteúdo passa no validador (rodado numa cópia
//        planos/copias/<nome>.validacao-…json; erro = 422, nada gravado). Antes de gravar guarda a
//        versão anterior em planos/copias/<nome>.anterior-AAAA-MM-DD-HHMMSS.json ("wx"); grava num
//        temporário dentro de planos/atual/ e troca por rename. Um salvar por vez (fila).
//        Nunca grava no original (planos/*.json) nem fora de planos/atual/.
// Rotas de ler (só GET; fatia 5):
//   GET /api/planos              → nomes de planos/*.json e de planos/atual/*.json (pasta "atual"),
//                                  com fps, orientação e "completo"
//   GET /api/plano?nome=<nome>   → o plano + hash SHA-256 do arquivo (nome tem de estar na lista)
//   GET /api/hash-plano?nome=<nome> → só o hash (o editor consulta a cada 5 s)
//   GET /api/fundo?nome=<nome>   → vídeo de fundo (public/videos/<video>-cortado-vN.mp4, N mais alto)
//                                  e cortes (videos/<video>.cortes.json), achados AQUI pelo campo
//                                  "video" do plano; o navegador nunca manda caminho
//   GET /api/biblioteca          → arquivos de mídia de public/{images,sfx,music,audio,midia}
//                                  (pasta, tipo, tamanho). Só leitura; não existe rota de apagar.
//   GET /api/etiquetas-sfx       → etiquetas de public/sfx/catalogo.json (se existir; só leitura)
//
// Travas: o navegador nunca manda caminho; o nome da cópia é gerado aqui; só grava em
// planos/copias/; nunca sobrescreve (flag "wx"); corpo até 1 MB; validador sem shell.
// GET: o navegador NÃO manda Origin num GET da própria página, então a trava é: Host certo,
// Origin (se vier) certo e Sec-Fetch-Site (se vier) "same-origin" ou "none".

import http from "node:http";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer as criarVite } from "vite";
import {
  PASTAS_BIBLIOTECA,
  caminhoDeMidiaSeguro,
  decidirHash,
  escolherVideoCortado,
  hashDe,
  juntarListas,
  lerEtiquetasSfx,
  nomeAnterior,
  nomeDePlanoSeguro,
  nomeValidacao,
  resumirCortes,
  resumirPlano,
  tipoDeMidia,
} from "./regrasServidor.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENDERECO = "127.0.0.1";
// 5173 sempre; EDITOR_PORTA só para teste com outro editor já aberto (continua só em 127.0.0.1).
const PORTA = /^\d{4,5}$/.test(process.env.EDITOR_PORTA ?? "") ? Number(process.env.EDITOR_PORTA) : 5173;
const PASTA_PLANOS = path.join(RAIZ, "planos");
const PASTA_COPIAS = path.join(PASTA_PLANOS, "copias");
const PASTA_ATUAL = path.join(PASTA_PLANOS, "atual");
const VALIDADOR = path.join(RAIZ, "scripts", "validar-plano.mjs");
const PASTA_VIDEOS_PUBLICOS = path.join(RAIZ, "public", "videos"); // vídeo de fundo
const PASTA_CORTES = path.join(RAIZ, "videos"); // <video>.cortes.json
const LIMITE_CORPO = 1024 * 1024; // 1 MB
const LIMITE_SAIDA = 200 * 1024; // texto do validador devolvido à página
const TEMPO_VALIDADOR_MS = 60_000;

const HOSTS_OK = new Set([`127.0.0.1:${PORTA}`, `localhost:${PORTA}`]);
const ORIGENS_OK = new Set([...HOSTS_OK].map((h) => `http://${h}`));

// Nomes: só letras minúsculas, números, "-" e "."; sem "/", "\" nem "..".
const NOME_PLANO = /^[a-z0-9][a-z0-9.-]*$/;
const NOME_COPIA = /^[a-z0-9][a-z0-9.-]*\.editado-\d{4}-\d{2}-\d{2}-\d{6}\.json$/;
const nomeSeguro = (nome, regra) =>
  typeof nome === "string" && nome.length <= 120 && regra.test(nome) && !nome.includes("..");

// O caminho final precisa estar DENTRO da pasta (Windows: sem diferenciar maiúscula).
const dentroDe = (pasta, alvo) =>
  path.resolve(alvo).toLowerCase().startsWith((path.resolve(pasta) + path.sep).toLowerCase());

const arquivosDa = async (pasta) => {
  try {
    return (await readdir(pasta, { withFileTypes: true })).filter((e) => e.isFile()).map((e) => e.name);
  } catch (erro) {
    if (erro.code === "ENOENT") return [];
    throw erro;
  }
};

const responder = (res, status, corpo) => {
  if (res.headersSent) return;
  const texto = JSON.stringify(corpo);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(texto),
    "Cache-Control": "no-store",
  });
  res.end(texto);
};

// Lê o corpo até 1 MB. Passou disso: 413 e fecha a conexão.
const lerCorpo = (req, res) =>
  new Promise((resolve) => {
    const partes = [];
    let total = 0;
    let estourou = false;
    req.on("data", (pedaco) => {
      if (estourou) return;
      total += pedaco.length;
      if (total > LIMITE_CORPO) {
        estourou = true;
        res.setHeader("Connection", "close");
        responder(res, 413, { erro: "Corpo maior que 1 MB." });
        resolve(null);
        return;
      }
      partes.push(pedaco);
    });
    req.on("end", () => {
      if (!estourou) resolve(Buffer.concat(partes).toString("utf8"));
    });
    req.on("error", () => resolve(null));
  });

const agoraNoNome = () => {
  const d = new Date();
  const d2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${d2(d.getMonth() + 1)}-${d2(d.getDate())}-${d2(d.getHours())}${d2(d.getMinutes())}${d2(d.getSeconds())}`;
};

// POST /api/copias
const salvarCopia = async (dados, res) => {
  const { plano, conteudo } = dados;
  if (!nomeSeguro(plano, NOME_PLANO)) return responder(res, 400, { erro: 'Nome de plano inválido (use só o nome, ex.: "teste-kit-v3").' });
  if (!(await listarPlanos()).some((p) => p.nome === plano)) {
    return responder(res, 400, { erro: `Plano "${plano}" não existe em planos/ nem em planos/atual/.` });
  }
  if (typeof conteudo !== "object" || conteudo === null || Array.isArray(conteudo) || !Array.isArray(conteudo.elementos)) {
    return responder(res, 400, { erro: 'O "conteudo" precisa ser um plano com a lista "elementos".' });
  }
  const arquivo = `${plano}.editado-${agoraNoNome()}.json`;
  const caminho = path.join(PASTA_COPIAS, arquivo);
  if (!nomeSeguro(arquivo, NOME_COPIA) || !dentroDe(PASTA_COPIAS, caminho)) {
    return responder(res, 400, { erro: "Nome de cópia inválido." });
  }
  await mkdir(PASTA_COPIAS, { recursive: true });
  try {
    await writeFile(caminho, `${JSON.stringify(conteudo, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (erro) {
    if (erro.code === "EEXIST") return responder(res, 409, { erro: `Já existe ${arquivo}. Nada foi gravado; tente de novo em 1 segundo.` });
    throw erro;
  }
  console.log(`[editor] cópia salva: planos/copias/${arquivo}`);
  return responder(res, 201, { arquivo });
};

// POST /api/validar
const validarCopia = async (dados, res) => {
  const { arquivo } = dados;
  if (!nomeSeguro(arquivo, NOME_COPIA)) return responder(res, 400, { erro: "Nome de cópia inválido." });
  if (!(await arquivosDa(PASTA_COPIAS)).includes(arquivo)) {
    return responder(res, 400, { erro: `Cópia "${arquivo}" não existe em planos/copias/.` });
  }
  const caminho = path.join(PASTA_COPIAS, arquivo);
  if (!dentroDe(PASTA_COPIAS, caminho)) return responder(res, 400, { erro: "Caminho fora de planos/copias/." });

  const r = await rodarValidador(caminho);
  if (r.falhou) return responder(res, 500, { erro: `Não consegui rodar o validador: ${r.falhou}` });
  if (r.tempoEsgotado) return responder(res, 504, { codigo: null, saida: r.saida, tempoEsgotado: true });
  return responder(res, 200, { codigo: r.codigo, saida: r.saida });
};

// Roda scripts/validar-plano.mjs num arquivo. Sem shell, argumentos fixos, até 60 s.
const rodarValidador = (caminho) =>
  new Promise((resolve) => {
    let saida = "";
    const juntar = (pedaco) => {
      if (saida.length < LIMITE_SAIDA) saida += pedaco.toString("utf8");
    };
    const filho = spawn(process.execPath, [VALIDADOR, caminho], { cwd: RAIZ, shell: false, windowsHide: true });
    const relogio = setTimeout(() => {
      filho.kill();
      resolve({ codigo: null, saida: `${saida}\n[tempo esgotado: 60 s]`, tempoEsgotado: true });
    }, TEMPO_VALIDADOR_MS);
    filho.stdout.on("data", juntar);
    filho.stderr.on("data", juntar);
    filho.on("error", (erro) => {
      clearTimeout(relogio);
      resolve({ codigo: null, saida, falhou: erro.message });
    });
    filho.on("close", (codigo) => {
      clearTimeout(relogio);
      resolve({ codigo, saida });
    });
  });

// POST /api/salvar-atual. Um por vez: a fila impede dois salvares lendo o mesmo hash.
let filaDoAtual = Promise.resolve();
const salvarAtual = (dados, res) => {
  const vez = filaDoAtual.then(() => salvarAtualAgora(dados, res));
  filaDoAtual = vez.catch(() => {});
  return vez;
};

const salvarAtualAgora = async (dados, res) => {
  const { plano, hashEsperado, conteudo } = dados;
  if (!nomeSeguro(plano, NOME_PLANO)) return responder(res, 400, { erro: "Nome de plano inválido." });
  // Só da lista REAL de planos/atual/ (o original, em planos/, nunca é aceito aqui).
  const item = (await listarPlanos()).find((p) => p.nome === plano && p.pasta === "atual");
  if (!item) return responder(res, 400, { erro: `"${plano}" não é um plano de planos/atual/.` });
  const destino = path.join(PASTA_ATUAL, `${plano}.json`);
  if (!dentroDe(PASTA_ATUAL, destino)) return responder(res, 400, { erro: "Caminho fora de planos/atual/." });
  if (typeof conteudo !== "object" || conteudo === null || Array.isArray(conteudo) || !Array.isArray(conteudo.elementos)) {
    return responder(res, 400, { erro: 'O "conteudo" precisa ser um plano com a lista "elementos".' });
  }

  // 1. Hash: quem mandou precisa ter visto a versão que está no disco agora.
  const anteriorBytes = await readFile(destino);
  const hashNoDisco = hashDe(anteriorBytes);
  const decisao = decidirHash(hashEsperado, hashNoDisco);
  if (!decisao.ok) return responder(res, decisao.status, { erro: decisao.erro, hashNoDisco });

  // 2. Valida EXATAMENTE o texto que seria gravado, numa cópia em planos/copias/.
  const texto = `${JSON.stringify(conteudo, null, 2)}\n`;
  const carimbo = agoraNoNome();
  await mkdir(PASTA_COPIAS, { recursive: true });
  const arquivoValidacao = nomeValidacao(plano, carimbo, randomBytes(3).toString("hex"));
  const caminhoValidacao = path.join(PASTA_COPIAS, arquivoValidacao);
  if (!dentroDe(PASTA_COPIAS, caminhoValidacao)) return responder(res, 400, { erro: "Caminho fora de planos/copias/." });
  await writeFile(caminhoValidacao, texto, { encoding: "utf8", flag: "wx" });
  const v = await rodarValidador(caminhoValidacao);
  if (v.falhou) return responder(res, 500, { erro: `Não consegui rodar o validador: ${v.falhou}. Nada foi gravado.` });
  if (v.codigo !== 0) {
    return responder(res, 422, { erro: "O validador achou erro. Nada foi gravado no plano atual.", codigo: v.codigo, saida: v.saida, validacao: arquivoValidacao });
  }

  // 3. Confere o hash de novo (o validador leva alguns segundos; alguém pode ter mexido).
  const hashAgora = hashDe(await readFile(destino));
  if (hashAgora !== hashNoDisco) return responder(res, 409, { erro: "O arquivo mudou no disco durante a validação. Nada foi gravado.", hashNoDisco: hashAgora });

  // 4. Guarda a versão anterior (nunca sobrescreve outra guardada).
  const arquivoAnterior = nomeAnterior(plano, carimbo);
  const caminhoAnterior = path.join(PASTA_COPIAS, arquivoAnterior);
  if (!dentroDe(PASTA_COPIAS, caminhoAnterior)) return responder(res, 400, { erro: "Caminho fora de planos/copias/." });
  try {
    await writeFile(caminhoAnterior, anteriorBytes, { flag: "wx" });
  } catch (erro) {
    if (erro.code === "EEXIST") return responder(res, 409, { erro: "Já houve um salvar neste mesmo segundo. Nada foi gravado; tente de novo em 1 segundo.", hashNoDisco });
    throw erro;
  }

  // 5. Grava num temporário DENTRO de planos/atual/ e troca por rename (atômico no mesmo disco).
  const temporario = path.join(PASTA_ATUAL, `.${plano}.gravando-${carimbo}-${randomBytes(3).toString("hex")}.tmp`);
  if (!dentroDe(PASTA_ATUAL, temporario)) return responder(res, 400, { erro: "Caminho fora de planos/atual/." });
  await writeFile(temporario, texto, { encoding: "utf8", flag: "wx" });
  await rename(temporario, destino);
  const hash = hashDe(Buffer.from(texto, "utf8"));
  console.log(`[editor] plano atual salvo: planos/atual/${plano}.json (anterior em planos/copias/${arquivoAnterior})`);
  return responder(res, 200, { hash, anterior: arquivoAnterior, validacao: arquivoValidacao, codigo: v.codigo, saida: v.saida });
};

// ---------- Rotas de ler (GET) ----------

// Lista de planos/*.json e planos/atual/*.json (só arquivos, só nomes que passam na regra).
// "arquivo" é relativo a planos/ ("0926.plano.json" ou "atual/0926.atual.json").
const listarPasta = async (pasta, rotulo) => {
  const lista = [];
  for (const nomeArquivo of (await arquivosDa(pasta)).sort()) {
    if (!nomeArquivo.toLowerCase().endsWith(".json")) continue;
    const nome = nomeArquivo.slice(0, -".json".length);
    if (!nomeDePlanoSeguro(nome)) continue;
    let resumo;
    try {
      resumo = resumirPlano(await readFile(path.join(pasta, nomeArquivo), "utf8"));
    } catch {
      resumo = { completo: false, motivo: "não consegui ler", fps: null, orientacao: null, video: null };
    }
    lista.push({ nome, arquivo: rotulo ? `${rotulo}/${nomeArquivo}` : nomeArquivo, pasta: rotulo || "planos", ...resumo });
  }
  return lista;
};
const listarPlanos = async () => juntarListas(await listarPasta(PASTA_PLANOS, ""), await listarPasta(PASTA_ATUAL, "atual"));

// Acha o plano pelo nome, só se ele estiver na lista (nunca monta caminho com o que veio).
const acharPlano = async (nome) => {
  if (!nomeDePlanoSeguro(nome)) return null;
  const item = (await listarPlanos()).find((p) => p.nome === nome);
  if (!item) return null;
  const pasta = item.pasta === "atual" ? PASTA_ATUAL : PASTA_PLANOS;
  const caminho = path.join(pasta, `${item.nome}.json`);
  return dentroDe(pasta, caminho) ? { item, caminho } : null;
};

const lerPlano = async (url, res) => {
  const achado = await acharPlano(url.searchParams.get("nome"));
  if (!achado) return responder(res, 400, { erro: "Plano inválido ou não existe em planos/." });
  if (!achado.item.completo) return responder(res, 400, { erro: `Plano incompleto: ${achado.item.motivo}.` });
  const bytes = await readFile(achado.caminho);
  const plano = JSON.parse(bytes.toString("utf8"));
  return responder(res, 200, { nome: achado.item.nome, arquivo: achado.item.arquivo, pasta: achado.item.pasta, hash: hashDe(bytes), plano });
};

const lerHashPlano = async (url, res) => {
  const achado = await acharPlano(url.searchParams.get("nome"));
  if (!achado) return responder(res, 400, { erro: "Plano inválido ou não existe em planos/." });
  return responder(res, 200, { nome: achado.item.nome, hash: hashDe(await readFile(achado.caminho)) });
};

const lerFundo = async (url, res) => {
  const achado = await acharPlano(url.searchParams.get("nome"));
  if (!achado) return responder(res, 400, { erro: "Plano inválido ou não existe em planos/." });
  const { video } = achado.item;
  const escolhido = escolherVideoCortado(await arquivosDa(PASTA_VIDEOS_PUBLICOS), video);
  let cortes = null;
  let cortesArquivo = null;
  if (typeof video === "string" && /^[a-z0-9][a-z0-9-]*$/i.test(video)) {
    const nomeCortes = `${video}.cortes.json`;
    if ((await arquivosDa(PASTA_CORTES)).includes(nomeCortes) && dentroDe(PASTA_CORTES, path.join(PASTA_CORTES, nomeCortes))) {
      cortes = resumirCortes(await readFile(path.join(PASTA_CORTES, nomeCortes), "utf8"));
      if (cortes) cortesArquivo = `videos/${nomeCortes}`;
    }
  }
  return responder(res, 200, {
    video,
    procurado: typeof video === "string" ? `public/videos/${video}-cortado-v*.mp4` : null,
    videoSrc: escolhido ? `videos/${escolhido.arquivo}` : null, // relativo a public/ (staticFile)
    versao: escolhido?.versao ?? null,
    cortesArquivo,
    cortes,
  });
};

// Biblioteca: varre SÓ as pastas fixas de public/, até 4 níveis, sem seguir atalho (symlink),
// no máximo 3000 arquivos. Devolve caminhos relativos a public/ (com "/"), que o Vite já serve.
const PASTA_PUBLIC = path.join(RAIZ, "public");
const LIMITE_BIBLIOTECA = 3000;
const listarBiblioteca = async () => {
  const itens = [];
  const varrer = async (relativa, nivel) => {
    if (nivel > 4 || itens.length >= LIMITE_BIBLIOTECA) return;
    const absoluta = path.join(PASTA_PUBLIC, ...relativa.split("/"));
    if (!dentroDe(PASTA_PUBLIC, absoluta)) return;
    let entradas;
    try {
      entradas = await readdir(absoluta, { withFileTypes: true });
    } catch {
      return; // pasta que não existe: fica de fora
    }
    entradas.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entradas) {
      if (itens.length >= LIMITE_BIBLIOTECA) return;
      const caminho = `${relativa}/${e.name}`;
      if (e.isDirectory()) await varrer(caminho, nivel + 1);
      else if (e.isFile()) {
        const tipo = tipoDeMidia(e.name);
        if (!tipo || !caminhoDeMidiaSeguro(caminho)) continue;
        let tamanho = null;
        try {
          tamanho = (await stat(path.join(PASTA_PUBLIC, ...caminho.split("/")))).size;
        } catch {}
        itens.push({ caminho, pasta: relativa.split("/")[0], nome: e.name, tipo, tamanho });
      }
    }
  };
  for (const pasta of PASTAS_BIBLIOTECA) await varrer(pasta, 1);
  return itens;
};

// Etiquetas de som: public/sfx/catalogo.json (caminho FIXO). Sem o arquivo = lista vazia.
const lerEtiquetas = async (_url, res) => {
  const arquivo = path.join(PASTA_PUBLIC, "sfx", "catalogo.json");
  let texto = null;
  try {
    texto = await readFile(arquivo, "utf8");
  } catch {}
  return responder(res, 200, { existe: texto !== null, etiquetas: texto === null ? {} : lerEtiquetasSfx(texto) });
};

const ROTAS_GET = {
  "/api/etiquetas-sfx": lerEtiquetas,
  "/api/biblioteca": async (_url, res) => responder(res, 200, { itens: await listarBiblioteca(), limite: LIMITE_BIBLIOTECA }),
  "/api/planos": async (_url, res) => responder(res, 200, { planos: await listarPlanos() }),
  "/api/plano": lerPlano,
  "/api/hash-plano": lerHashPlano,
  "/api/fundo": lerFundo,
};

const ROTAS = { "/api/copias": salvarCopia, "/api/validar": validarCopia, "/api/salvar-atual": salvarAtual };

const tratarApi = async (req, res, caminhoUrl) => {
  if (req.method === "OPTIONS") return responder(res, 403, { erro: "Pedido de permissão (CORS) recusado." });

  if (req.method === "GET") {
    const rotaGet = ROTAS_GET[caminhoUrl];
    if (!rotaGet) return responder(res, ROTAS[caminhoUrl] ? 405 : 404, { erro: ROTAS[caminhoUrl] ? "Esta rota é só POST." : "Rota não existe." });
    const origem = req.headers.origin;
    if (origem !== undefined && !ORIGENS_OK.has(origem)) return responder(res, 403, { erro: "Origem não permitida." });
    const site = req.headers["sec-fetch-site"];
    if (site !== undefined && site !== "same-origin" && site !== "none") return responder(res, 403, { erro: "Pedido de outro site recusado." });
    return rotaGet(new URL(req.url ?? "/", `http://${req.headers.host}`), res);
  }

  if (req.method !== "POST") return responder(res, 405, { erro: "Método não permitido." });
  if (ROTAS_GET[caminhoUrl]) return responder(res, 405, { erro: "Esta rota é só GET." });
  if (!ORIGENS_OK.has(req.headers.origin ?? "")) return responder(res, 403, { erro: "Origem não permitida." });
  const rota = ROTAS[caminhoUrl];
  if (!rota) return responder(res, 404, { erro: "Rota não existe." });
  if (!String(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
    return responder(res, 415, { erro: "Só application/json." });
  }
  if (Number(req.headers["content-length"] ?? 0) > LIMITE_CORPO) {
    res.setHeader("Connection", "close");
    return responder(res, 413, { erro: "Corpo maior que 1 MB." });
  }
  const texto = await lerCorpo(req, res);
  if (texto === null) return; // já respondeu 413 (ou a conexão caiu)
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return responder(res, 400, { erro: "JSON inválido." });
  }
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) return responder(res, 400, { erro: "Esperava um objeto JSON." });
  return rota(dados, res);
};

const servidor = http.createServer(async (req, res) => {
  try {
    // Host conferido em TODO pedido (protege contra DNS rebinding, inclusive nas rotas do Vite).
    if (!HOSTS_OK.has(req.headers.host ?? "")) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Host não permitido.");
      return;
    }
    const caminhoUrl = new URL(req.url ?? "/", `http://${req.headers.host}`).pathname;
    if (caminhoUrl === "/api" || caminhoUrl.startsWith("/api/")) {
      await tratarApi(req, res, caminhoUrl);
      return;
    }
    vite.middlewares(req, res, () => {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Não encontrado.");
    });
  } catch (erro) {
    console.error("[editor] erro:", erro);
    responder(res, 500, { erro: "Erro interno do servidor do editor." });
  }
});

const vite = await criarVite({
  configFile: false,
  root: RAIZ,
  publicDir: path.join(RAIZ, "public"),
  appType: "mpa",
  clearScreen: false,
  server: { middlewareMode: true, hmr: { server: servidor } },
  // Só a página do editor: sem isso o Vite procura .html no projeto inteiro (inclusive .vc-*).
  optimizeDeps: { entries: ["editor/index.html"] },
});

servidor.on("error", (erro) => {
  if (erro.code === "EADDRINUSE") console.error(`[editor] A porta ${PORTA} já está em uso. Feche o outro programa (ou o outro "npm run editor") e tente de novo.`);
  else console.error("[editor] erro no servidor:", erro);
  process.exit(1);
});

servidor.listen(PORTA, ENDERECO, () => {
  console.log(`[editor] pronto: http://${ENDERECO}:${PORTA}/editor/  (Ctrl+C para desligar)`);
});

const desligar = async () => {
  await vite.close();
  servidor.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
};
process.on("SIGINT", desligar);
process.on("SIGTERM", desligar);
