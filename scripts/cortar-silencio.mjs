#!/usr/bin/env node
/**
 * cortar-silencio.mjs — Etapa 2a do editor-jr
 *
 * Detecta as pausas de um vídeo, calcula os trechos com fala e grava
 * essa lista num JSON. Opcionalmente gera o mp4 já cortado.
 *
 * Usa o ffmpeg que vem junto com o Remotion. Não precisa instalar nada.
 *
 * Uso:
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --limiar -35 --pausa 1.0
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar --gancho 1:10-1:25
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- ffmpeg

const PACOTES_COMPOSITOR = {
  win32: '@remotion/compositor-win32-x64-msvc',
  darwin: '@remotion/compositor-darwin-x64',
  linux: '@remotion/compositor-linux-x64-gnu',
};

const acharBinario = (nome) => {
  const pacote = PACOTES_COMPOSITOR[process.platform];
  if (pacote) {
    const sufixo = process.platform === 'win32' ? '.exe' : '';
    const caminho = join(RAIZ, 'node_modules', ...pacote.split('/'), nome + sufixo);
    if (existsSync(caminho)) return caminho;
  }
  // Sem o binário do Remotion, tenta o que estiver instalado no sistema.
  return nome;
};

const FFMPEG = acharBinario('ffmpeg');
const FFPROBE = acharBinario('ffprobe');

const rodar = (bin, args) => {
  const r = spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (r.error) {
    throw new Error(`Não consegui rodar "${bin}": ${r.error.message}`);
  }
  return r;
};

// ---------------------------------------------------------------- tempo

const segParaTempo = (s) => {
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(2).padStart(5, '0');
  return `${m}:${r}`;
};

const tempoParaSeg = (txt) => {
  const partes = String(txt).split(':').map(Number);
  if (partes.some(Number.isNaN)) throw new Error(`Tempo inválido: ${txt}`);
  return partes.reduce((acc, n) => acc * 60 + n, 0);
};

// ---------------------------------------------------------------- argumentos

const argv = process.argv.slice(2);
const entrada = argv.find((a) => !a.startsWith('--'));

const opcao = (nome, padrao) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : argv[i + 1];
};

if (!entrada) {
  console.error('Faltou o vídeo. Ex.: node scripts/cortar-silencio.mjs videos/teste-jr.mp4');
  process.exit(1);
}
if (!existsSync(entrada)) {
  console.error(`Não achei o arquivo: ${entrada}`);
  process.exit(1);
}

const LIMIAR = Number(opcao('limiar', -30)); // dB: abaixo disso é considerado silêncio
const PAUSA = Number(opcao('pausa', 0.8)); // s: só pausas maiores que isso contam
const MARGEM = Number(opcao('margem', 0.15)); // s: folga antes/depois de cada fala
const MINIMO = Number(opcao('minimo', 0.3)); // s: descarta lascas de fala menores que isso
const GERAR = argv.includes('--gerar');
const GANCHO = opcao('gancho', null); // ex.: "1:10-1:25"

// ---------------------------------------------------------------- 1. duração

const probe = rodar(FFPROBE, [
  '-v',
  'error',
  '-show_entries',
  'format=duration',
  '-of',
  'default=noprint_wrappers=1:nokey=1',
  entrada,
]);
const DURACAO = Number(probe.stdout.trim());
if (!DURACAO) {
  console.error('Não consegui ler a duração do vídeo.');
  process.exit(1);
}

// ---------------------------------------------------------------- 2. detectar

console.log(`\nAnalisando ${entrada} (${segParaTempo(DURACAO)})...`);
console.log(`Limiar: ${LIMIAR}dB · pausa mínima: ${PAUSA}s · margem: ${MARGEM}s\n`);

// O ffmpeg do Remotion não traz o encoder "wrapped_avframe", então mandar o
// vídeo para o destino nulo dá erro. Como só interessa o áudio, descartamos o
// vídeo (-vn) e usamos um encoder de áudio que existe nessa build.
const deteccao = rodar(FFMPEG, [
  '-hide_banner',
  '-i',
  entrada,
  '-vn',
  '-af',
  `silencedetect=noise=${LIMIAR}dB:d=${PAUSA}`,
  '-c:a',
  'pcm_s16le',
  '-f',
  'null',
  '-',
]);

if (deteccao.status !== 0) {
  console.error('O ffmpeg falhou ao analisar o áudio:\n');
  console.error(deteccao.stderr);
  process.exit(1);
}

const log = deteccao.stderr ?? '';
const silencios = [];
for (const linha of log.split('\n')) {
  const ini = linha.match(/silence_start:\s*(-?[\d.]+)/);
  if (ini) silencios.push({inicio: Math.max(0, Number(ini[1])), fim: null});
  const fim = linha.match(/silence_end:\s*([\d.]+)/);
  if (fim && silencios.length) silencios[silencios.length - 1].fim = Number(fim[1]);
}
// Se o vídeo termina em silêncio, o último não tem fim.
if (silencios.length && silencios[silencios.length - 1].fim === null) {
  silencios[silencios.length - 1].fim = DURACAO;
}

// ---------------------------------------------------------------- 3. inverter

// Os trechos de fala são o oposto dos silêncios.
const falas = [];
let cursor = 0;
for (const s of silencios) {
  if (s.inicio > cursor) falas.push({inicio: cursor, fim: s.inicio});
  cursor = Math.max(cursor, s.fim);
}
if (cursor < DURACAO) falas.push({inicio: cursor, fim: DURACAO});

// Margem de folga, senão o corte come o começo das palavras.
const comFolga = falas.map((f) => ({
  inicio: Math.max(0, f.inicio - MARGEM),
  fim: Math.min(DURACAO, f.fim + MARGEM),
}));

// Junta os que a margem fez encostar um no outro.
const trechos = [];
for (const f of comFolga) {
  const ultimo = trechos[trechos.length - 1];
  if (ultimo && f.inicio <= ultimo.fim) {
    ultimo.fim = Math.max(ultimo.fim, f.fim);
  } else {
    trechos.push({...f});
  }
}

const finais = trechos.filter((t) => t.fim - t.inicio >= MINIMO);

// ---------------------------------------------------------------- 4. gancho

let ordem = finais;
if (GANCHO) {
  const [a, b] = GANCHO.split('-').map(tempoParaSeg);
  if (!(b > a)) throw new Error(`Gancho inválido: ${GANCHO}`);
  const dentro = finais.filter((t) => t.fim > a && t.inicio < b);
  if (dentro.length === 0) {
    console.warn(
      `Atenção: não há fala entre ${segParaTempo(a)} e ${segParaTempo(b)}. Gancho ignorado.\n`,
    );
  } else {
    // Recorta o gancho nas bordas pedidas e joga pro começo.
    const gancho = dentro.map((t) => ({
      inicio: Math.max(t.inicio, a),
      fim: Math.min(t.fim, b),
      gancho: true,
    }));
    const resto = finais.filter((t) => !(t.fim > a && t.inicio < b));
    ordem = [...gancho, ...resto];
  }
}

// ---------------------------------------------------------------- relatório

const somar = (lista) => lista.reduce((acc, t) => acc + (t.fim - t.inicio), 0);
const mantido = somar(finais);
const removido = DURACAO - mantido;

console.log('Pausas encontradas:');
if (silencios.length === 0) {
  console.log('  (nenhuma — tente um limiar menos rigoroso, ex.: --limiar -25)');
}
for (const s of silencios) {
  console.log(
    `  ${segParaTempo(s.inicio)} → ${segParaTempo(s.fim)}   (${(s.fim - s.inicio).toFixed(2)}s)`,
  );
}

console.log(`\nTrechos com fala: ${finais.length}`);
for (const [i, t] of finais.entries()) {
  console.log(
    `  ${String(i + 1).padStart(3)}. ${segParaTempo(t.inicio)} → ${segParaTempo(t.fim)}   (${(t.fim - t.inicio).toFixed(2)}s)`,
  );
}

console.log(`\n--- Resumo ---`);
console.log(`Original:  ${segParaTempo(DURACAO)}`);
console.log(`Sobra:     ${segParaTempo(mantido)}`);
console.log(`Cortado:   ${segParaTempo(removido)}  (${((removido / DURACAO) * 100).toFixed(1)}%)`);
console.log(`Cortes:    ${silencios.length}`);

// ---------------------------------------------------------------- JSON

const jsonPath = entrada.replace(/\.[^.]+$/, '') + '.cortes.json';
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      arquivo: entrada,
      duracaoOriginal: DURACAO,
      duracaoFinal: somar(ordem),
      parametros: {
        limiar: LIMIAR,
        pausa: PAUSA,
        margem: MARGEM,
        minimo: MINIMO,
        gancho: GANCHO,
      },
      silencios,
      trechos: ordem,
    },
    null,
    2,
  ),
);
console.log(`\nLista salva em: ${jsonPath}`);

if (!GERAR) {
  console.log('(Nenhum vídeo foi gerado. Rode de novo com --gerar quando estiver satisfeito.)\n');
  process.exit(0);
}

// ---------------------------------------------------------------- 5. gerar mp4

const tmp = join(dirname(entrada), '.tmp-cortes');
rmSync(tmp, {recursive: true, force: true});
mkdirSync(tmp, {recursive: true});

// Os pedaços saem com áudio PCM (sem compressão) dentro de .mov. AAC tem
// amostras de aquecimento no início de cada fluxo; grudar 21 fluxos AAC gera
// um áudio remendado que o parser de mp4 do Windows não lê. Com PCM não há
// aquecimento, e o AAC é gerado uma única vez, na junção final.
console.log(`\nRecortando ${ordem.length} trechos...`);
const pedacos = [];
for (const [i, t] of ordem.entries()) {
  const saida = join(tmp, `p${String(i).padStart(4, '0')}.mov`);
  const r = rodar(FFMPEG, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-ss',
    String(t.inicio),
    '-i',
    entrada,
    '-t',
    String(t.fim - t.inicio),
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '18',
    '-c:a',
    'pcm_s16le',
    '-ar',
    '44100',
    '-ac',
    '2',
    '-avoid_negative_ts',
    'make_zero',
    '-y',
    saida,
  ]);
  if (r.status !== 0) {
    console.error(`Falhou no trecho ${i + 1}:\n${r.stderr}`);
    process.exit(1);
  }
  pedacos.push(saida);
  process.stdout.write(`\r  ${i + 1}/${ordem.length}`);
}
console.log('');

const lista = join(tmp, 'lista.txt');
writeFileSync(
  lista,
  pedacos.map((p) => `file '${resolve(p).replace(/\\/g, '/')}'`).join('\n'),
);

// Versiona a saída: nunca sobrescreve um vídeo já exportado.
const base = entrada.replace(/\.[^.]+$/, '') + '-cortado-v';
const pasta = dirname(entrada);
const usados = readdirSync(pasta)
  .map((f) => f.match(/-cortado-v(\d+)\.mp4$/))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const versao = (usados.length ? Math.max(...usados) : 0) + 1;
const final = `${base}${versao}.mp4`;

// O vídeo é copiado (já foi codificado nos pedaços, não perde qualidade de
// novo). O áudio é comprimido aqui, uma vez só, virando um fluxo contínuo.
// +faststart põe o índice no começo do arquivo, o que ajuda os players.
console.log('Juntando...');
const junta = rodar(FFMPEG, [
  '-hide_banner',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  lista,
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-ar',
  '44100',
  '-ac',
  '2',
  '-movflags',
  '+faststart',
  '-y',
  final,
]);
if (junta.status !== 0) {
  console.error(`Falhou ao juntar:\n${junta.stderr}`);
  process.exit(1);
}

rmSync(tmp, {recursive: true, force: true});
console.log(`\nPronto: ${final}\n`);
