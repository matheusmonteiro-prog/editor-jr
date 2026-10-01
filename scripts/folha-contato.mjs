#!/usr/bin/env node
/**
 * folha-contato.mjs — monta uma folha de contato (1 quadro por elemento do
 * plano, no MEIO da duração dele) a partir de um vídeo já renderizado.
 *
 * Roda dentro do WSL — precisa do ffmpeg/ffprobe do Ubuntu (não do Windows)
 * e do vídeo já renderizado em ~/editor-jr/out/ (ver ~/render.sh).
 *
 * Uso:
 *   node scripts/folha-contato.mjs <plano> <render>
 *
 * Ex.: node scripts/folha-contato.mjs 0926 0926-final
 *   → lê planos/0926.plano.json, videos/0926.cortes.json,
 *     ~/editor-jr/out/0926-final.mp4
 *   → salva em ~/editor-jr/out/0926-final-folha-contato.png
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir, homedir } from 'node:os';
import { criarParaFrameCortado } from '../src/utils/tempoCortado.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const LARGURA_REDUZIDA = 360;

// ---------------------------------------------------------------- argumentos

const [nomePlano, nomeRender] = process.argv.slice(2);
if (!nomePlano || !nomeRender) {
  console.error('Uso: node scripts/folha-contato.mjs <plano> <render>');
  console.error('Ex.: node scripts/folha-contato.mjs 0926 0926-final');
  process.exit(1);
}

const caminhoPlano = join(RAIZ, 'planos', `${nomePlano}.plano.json`);
const caminhoCortes = join(RAIZ, 'videos', `${nomePlano}.cortes.json`);
const pastaOut = join(homedir(), 'editor-jr', 'out');
const caminhoRender = join(pastaOut, `${nomeRender}.mp4`);
const caminhoSaida = join(pastaOut, `${nomeRender}-folha-contato.png`);

for (const [rotulo, caminho] of [
  ['plano', caminhoPlano],
  ['cortes', caminhoCortes],
  ['render', caminhoRender],
]) {
  if (!existsSync(caminho)) {
    console.error(`Não achei o arquivo de ${rotulo}: ${caminho}`);
    process.exit(1);
  }
}

const plano = JSON.parse(readFileSync(caminhoPlano, 'utf8'));
const cortes = JSON.parse(readFileSync(caminhoCortes, 'utf8'));

// ---------------------------------------------------------------- fps do render (ffprobe)

const probeFps = spawnSync('ffprobe', [
  '-v', 'error',
  '-select_streams', 'v:0',
  '-show_entries', 'stream=r_frame_rate',
  '-of', 'default=noprint_wrappers=1:nokey=1',
  caminhoRender,
]);
if (probeFps.status !== 0) {
  console.error(`ffprobe falhou ao ler o fps do render:\n${probeFps.stderr}`);
  process.exit(1);
}
const [numFps, denFps] = probeFps.stdout.toString().trim().split('/').map(Number);
const fps = denFps ? numFps / denFps : numFps;
if (!Number.isFinite(fps) || fps <= 0) {
  console.error(`fps inválido lido do render: "${probeFps.stdout}"`);
  process.exit(1);
}

// ---------------------------------------------------------------- tempo → frame cortado

// Mesma lógica do src/PlanoComposicao.tsx (função local lá, não exportada —
// duplicada aqui porque é só essas duas linhas).
const paraSegundos = (tempo) => {
  const [minutos, segundos] = tempo.split(':').map(Number);
  return minutos * 60 + segundos;
};
const paraFrameCortado = criarParaFrameCortado(cortes.trechos, fps);

// ---------------------------------------------------------------- elementos

const pulados = [];
const elementos = [];
for (const el of plano.elementos) {
  if (el.componente === 'a confirmar' || el.props === 'a confirmar') {
    pulados.push(el.id);
    continue;
  }
  const from = paraFrameCortado(paraSegundos(el.inicio));
  const duracaoFrames = el.duracaoFrames ?? Math.round(el.duracao * fps);
  const frameMeio = from + Math.round(duracaoFrames / 2);
  elementos.push({ id: el.id, frame: frameMeio });
}

if (pulados.length > 0) {
  console.log(`Pulados (componente ou props "a confirmar"): ${pulados.join(', ')}`);
}
if (elementos.length === 0) {
  console.error('Nenhum elemento sobrou pra montar a folha de contato.');
  process.exit(1);
}

// ---------------------------------------------------------------- extração + montagem

const tmp = mkdtempSync(join(tmpdir(), 'folha-contato-'));

try {
  for (const [i, el] of elementos.entries()) {
    const segundo = el.frame / fps;
    const saida = join(tmp, `q${String(i).padStart(3, '0')}.png`);
    const r = spawnSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error',
      '-ss', String(segundo),
      '-i', caminhoRender,
      '-vframes', '1',
      '-vf', `scale=${LARGURA_REDUZIDA}:-1`,
      '-y', saida,
    ]);
    if (r.status !== 0) {
      console.error(`Falhou extraindo o quadro de "${el.id}" (${segundo.toFixed(2)}s):\n${r.stderr}`);
      process.exit(1);
    }
  }

  // Legenda (id do elemento) embutida via drawtext, só se achar uma fonte
  // utilizável. Se falhar em qualquer quadro, desiste de todas e lista no
  // terminal em vez disso — nunca mistura quadro com/sem legenda na mesma folha.
  const candidatosFonte = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  ];
  const fonte = candidatosFonte.find((f) => existsSync(f));

  let legendaEmbutida = false;
  if (fonte) {
    legendaEmbutida = true;
    for (const [i, el] of elementos.entries()) {
      const origem = join(tmp, `q${String(i).padStart(3, '0')}.png`);
      const comTexto = join(tmp, `l${String(i).padStart(3, '0')}.png`);
      const textoEscapado = el.id.replace(/[\\':]/g, '\\$&');
      const r = spawnSync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error',
        '-i', origem,
        '-vf',
        `drawtext=fontfile=${fonte}:text='${textoEscapado}':x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=3`,
        '-y', comTexto,
      ]);
      if (r.status !== 0) {
        legendaEmbutida = false;
        break;
      }
    }
  }

  if (!legendaEmbutida) {
    console.log('\nSem legenda embutida (fonte não encontrada ou drawtext falhou).');
    console.log('Ordem dos quadros na folha de contato:');
    elementos.forEach((el, i) => console.log(`  ${i + 1}. ${el.id}`));
  }

  const padraoEntrada = join(tmp, legendaEmbutida ? 'l%03d.png' : 'q%03d.png');
  const colunas = Math.ceil(Math.sqrt(elementos.length));
  const linhas = Math.ceil(elementos.length / colunas);

  const rTile = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error',
    '-i', padraoEntrada,
    '-vf', `tile=${colunas}x${linhas}`,
    '-y', caminhoSaida,
  ]);
  if (rTile.status !== 0) {
    console.error(`Falhou montando a folha de contato:\n${rTile.stderr}`);
    process.exit(1);
  }

  console.log(`\nFolha de contato salva em: ${caminhoSaida}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
