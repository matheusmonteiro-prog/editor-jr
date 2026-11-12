import { createHash } from "node:crypto";

// Regras puras do servidor do editor (fatia 5, abrir planos). Sem disco e sem rede: recebem
// textos e listas de nomes e devolvem decisões. Dá para testar pelo Node.

// Nome de plano = nome do arquivo em planos/ sem ".json" (ex.: "0926.plano", "teste-kit-v3").
// Só letras minúsculas, números, "-" e "."; sem "/", "\" nem "..".
export const REGRA_NOME_PLANO = /^[a-z0-9][a-z0-9.-]*$/;
export const nomeDePlanoSeguro = (nome) =>
  typeof nome === "string" && nome.length <= 120 && REGRA_NOME_PLANO.test(nome) && !nome.includes("..");

// O campo "video" do plano vira parte de um nome de arquivo: só letras, números e "-".
// Um caminho (ex.: "videos/0926-cortado-v1.mp4", como nos planos de exemplo) é recusado.
export const REGRA_NOME_VIDEO = /^[a-z0-9][a-z0-9-]*$/i;

// Resumo de um plano para a lista: fps, orientação e se está "completo" (dá para abrir).
export const resumirPlano = (texto) => {
  let plano;
  try {
    plano = JSON.parse(texto);
  } catch {
    return { completo: false, motivo: "JSON inválido", fps: null, orientacao: null, video: null };
  }
  if (typeof plano !== "object" || plano === null || Array.isArray(plano)) {
    return { completo: false, motivo: "não é um plano", fps: null, orientacao: null, video: null };
  }
  const fps = typeof plano.fps === "number" && Number.isFinite(plano.fps) && plano.fps > 0 ? plano.fps : null;
  const orientacao = plano.orientacao === "vertical" || plano.orientacao === "horizontal" ? plano.orientacao : null;
  const video = typeof plano.video === "string" ? plano.video : null;
  const faltas = [];
  if (fps === null) faltas.push('sem "fps"');
  if (orientacao === null) faltas.push('sem "orientacao" (vertical ou horizontal)');
  if (!Array.isArray(plano.elementos)) faltas.push('sem lista "elementos"');
  return { completo: faltas.length === 0, motivo: faltas.join(", ") || null, fps, orientacao, video };
};

// Vídeo de fundo: public/videos/<video>-cortado-vN.mp4, a versão N MAIS ALTA.
// Recebe a lista de nomes da pasta (o disco é lido por quem chama).
export const escolherVideoCortado = (nomesDaPasta, video) => {
  if (typeof video !== "string" || !REGRA_NOME_VIDEO.test(video)) return null;
  const prefixo = `${video.toLowerCase()}-cortado-v`;
  let melhor = null;
  for (const nome of nomesDaPasta) {
    const baixo = nome.toLowerCase();
    if (!baixo.startsWith(prefixo) || !baixo.endsWith(".mp4")) continue;
    const meio = baixo.slice(prefixo.length, -".mp4".length);
    if (!/^\d+$/.test(meio)) continue; // ex.: "0926-cortado-v1-falso.mp4" fica de fora
    const versao = Number(meio);
    if (melhor === null || versao > melhor.versao) melhor = { arquivo: nome, versao };
  }
  return melhor;
};

// Cortes: videos/<video>.cortes.json. Devolve só o que o editor usa (trechos e duracaoFinal).
export const resumirCortes = (texto) => {
  let c;
  try {
    c = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!c || !Array.isArray(c.trechos)) return null;
  const trechos = c.trechos
    .filter((t) => t && Number.isFinite(t.inicio) && Number.isFinite(t.fim) && t.fim > t.inicio)
    .map((t) => (t.gancho === undefined ? { inicio: t.inicio, fim: t.fim } : { inicio: t.inicio, fim: t.fim, gancho: t.gancho }));
  if (trechos.length === 0) return null;
  const duracaoFinal = Number.isFinite(c.duracaoFinal) && c.duracaoFinal > 0 ? c.duracaoFinal : null;
  return { trechos, duracaoFinal };
};

// Biblioteca (pacote B): só LEITURA de pastas fixas de public/. O navegador nunca manda caminho.
// Tipo pela extensão; o que não for mídia conhecida (ex.: .json, .gitkeep, .pedido.json) fica de fora.
// Áudio: as mesmas extensões que scripts/validar-plano.mjs aceita sem aviso (EXTENSOES_AUDIO).
// "videos/cenas" saiu (pedido do Matheus, 12/11/2026); "midia" entra se existir (pasta ausente =
// fica de fora, nada é criado).
export const PASTAS_BIBLIOTECA = ["images", "sfx", "music", "audio", "midia"];
const EXTENSOES = {
  imagem: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
  audio: [".mp3", ".wav", ".m4a", ".ogg", ".aac"],
  video: [".mp4", ".webm", ".mov"],
};
export const tipoDeMidia = (nome) => {
  if (typeof nome !== "string") return null;
  const baixo = nome.toLowerCase();
  for (const [tipo, lista] of Object.entries(EXTENSOES)) if (lista.some((e) => baixo.endsWith(e))) return tipo;
  return null;
};
// Caminho relativo a public/ (com "/") que dá para usar no plano e no navegador: sem "..", sem
// "\", sem começar com "/" e só com caracteres que o validador aceita em arquivo de áudio.
export const caminhoDeMidiaSeguro = (caminho) =>
  typeof caminho === "string" && caminho.length <= 300 && /^[A-Za-z0-9._\-/]+$/.test(caminho) && !caminho.startsWith("/") && !caminho.split("/").includes("..");

// Etiquetas de som (preparação): public/sfx/catalogo.json, formato
//   { "arquivo.mp3": { "etiquetas": ["transicao", "impacto"] } }
// Só o que é seguro passa: nome de arquivo de áudio sem pasta, até 20 etiquetas de texto curto
// (até 30 letras). JSON inválido ou fora do formato = nenhuma etiqueta (não quebra a biblioteca).
export const lerEtiquetasSfx = (texto) => {
  let bruto;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return {};
  }
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};
  const saida = {};
  for (const [nome, valor] of Object.entries(bruto)) {
    if (!/^[A-Za-z0-9._-]+$/.test(nome) || tipoDeMidia(nome) !== "audio") continue;
    const lista = valor && Array.isArray(valor.etiquetas) ? valor.etiquetas : [];
    const limpas = [...new Set(lista.filter((e) => typeof e === "string").map((e) => e.trim()).filter((e) => e.length > 0 && e.length <= 30))].slice(0, 20);
    if (limpas.length > 0) saida[nome] = limpas;
  }
  return saida;
};

// ---------- Plano atual (fatia 3 do "plano atual"): hash e decisão de gravar ----------
// planos/atual/<video>.atual.json aparece na lista com o nome "<video>.atual" e pasta "atual".
// Um nome de planos/atual/ igual a um de planos/ fica de fora (o de planos/ vence).
export const juntarListas = (dePlanos, deAtual) => {
  const nomes = new Set(dePlanos.map((p) => p.nome));
  return [...dePlanos, ...deAtual.filter((p) => !nomes.has(p.nome))];
};

// SHA-256 dos BYTES do arquivo (Buffer) ou de um texto (UTF-8), em hexadecimal.
export const hashDe = (conteudo) => createHash("sha256").update(conteudo).digest("hex");
export const REGRA_HASH = /^[0-9a-f]{64}$/;

// Decide o que o POST /api/salvar-atual faz com o hash. Nunca grava sem conferência.
export const decidirHash = (hashEsperado, hashNoDisco) => {
  if (typeof hashEsperado !== "string" || !REGRA_HASH.test(hashEsperado)) return { ok: false, status: 400, erro: "hashEsperado ausente ou inválido (64 letras hexadecimais)." };
  if (hashEsperado !== hashNoDisco) return { ok: false, status: 409, erro: "O arquivo mudou no disco desde que você abriu. Nada foi gravado." };
  return { ok: true };
};

// Nomes gerados AQUI (nunca vêm do navegador). Todos caem em planos/copias/.
export const nomeAnterior = (nome, carimbo) => `${nome}.anterior-${carimbo}.json`;
export const nomeValidacao = (nome, carimbo, sorte) => `${nome}.validacao-${carimbo}-${sorte}.json`;
