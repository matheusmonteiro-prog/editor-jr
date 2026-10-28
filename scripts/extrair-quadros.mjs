#!/usr/bin/env node
/**
 * extrair-quadros.mjs — tira uma foto a cada N segundos de um vídeo ORIGINAL e gera um índice
 * com o minuto de cada uma. Serve para dar "visão" à IA que monta o plano de edição (ela recebe
 * imagem, não vídeo). EXPERIMENTO: não faz parte das etapas do ARQUITETURA.md.
 *
 * Saída (a pasta videos/ está no .gitignore):
 *   videos/<nome>.quadros/q-00m30s.jpg ...   uma foto por intervalo (JPEG, largura reduzida)
 *   videos/<nome>.quadros.txt                uma linha por foto: "m:ss nome-do-arquivo"
 *
 * Os tempos são os do vídeo ORIGINAL, no formato m:ss (o mesmo do .palavras.txt).
 *
 * Usa o ffmpeg e o ffprobe COMPLETOS do PATH do sistema. Nunca os do Remotion.
 * (Linux/WSL: sudo apt install ffmpeg · Windows: winget install Gyan.FFmpeg)
 * Não instala nada.
 *
 * Uso:
 *   node scripts/extrair-quadros.mjs --video videos/NOME.mp4
 *   node scripts/extrair-quadros.mjs --video videos/NOME.mp4 --intervalo 30 --largura 720
 *   node scripts/extrair-quadros.mjs --video videos/NOME.mp4 --refazer
 *
 * Opções:
 *   --video CAMINHO   vídeo original (obrigatório)
 *   --intervalo N     segundos entre fotos (padrão 30)
 *   --largura PX      largura das fotos em pixels; a altura mantém a proporção (padrão 720)
 *   --refazer         regrava as fotos e o índice mesmo que já existam (sem isso, o script
 *                     para em vez de sobrescrever; fotos antigas que não são mais geradas não
 *                     são apagadas)
 *
 * No fim imprime quantas fotos, o tamanho, a estimativa de tokens de imagem
 * (ceil(largura/28) x ceil(altura/28) por foto) e quantas mensagens de 20 imagens são
 * necessárias para subir no chat.
 *
 * Saída: 0 = ok · 1 = erro.
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- constantes (ajustáveis)

const INTERVALO_PADRAO = 30;
const LARGURA_PADRAO = 720;
const PIXELS_POR_TOKEN = 28; // fórmula oficial: ceil(largura/28) x ceil(altura/28) por foto
const IMAGENS_POR_MENSAGEM = 20;
const QUALIDADE_JPEG = '3'; // -q:v do ffmpeg: 2 (melhor) a 31 (pior)
const PASTA_VIDEOS = join(RAIZ, 'videos');

// ---------------------------------------------------------------- utilidades

class ErroUso extends Error {}

const rodar = (bin, args) => {
  const r = spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (r.error) throw new Error(`Não consegui rodar "${bin}": ${r.error.message}`);
  return r;
};

// Só o ffmpeg/ffprobe do PATH. Se não estiverem lá, para — não cai pro do Remotion.
const exigirBinario = (nome) => {
  const r = spawnSync(nome, ['-version'], {encoding: 'utf8', timeout: 10000});
  if (r.error || r.status !== 0) {
    throw new ErroUso(
      `Não achei "${nome}" no PATH do sistema.\n` +
        'Este script usa o FFmpeg completo (nunca o do Remotion).\n' +
        'Linux/WSL: sudo apt install ffmpeg · Windows: winget install Gyan.FFmpeg',
    );
  }
};

const paraRelativo = (caminho) => {
  const rel = relative(RAIZ, caminho);
  return rel.startsWith('..') || isAbsolute(rel) ? caminho : rel.split('\\').join('/');
};

// "m:ss" do tempo em segundos (minutos sem limite: 65 min -> "65:00").
const formatarTempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Nome que mostra o minuto: 30 -> "q-00m30s.jpg"
const nomeDaFoto = (s) =>
  `q-${String(Math.floor(s / 60)).padStart(2, '0')}m${String(s % 60).padStart(2, '0')}s.jpg`;

// ---------------------------------------------------------------- argumentos

const lerNumeroPositivo = (flag, valor) => {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErroUso(`${flag} precisa de um número inteiro maior que 0 (recebi "${valor}").`);
  return n;
};

const lerArgumentos = (argv) => {
  const opcoes = {video: null, intervalo: INTERVALO_PADRAO, largura: LARGURA_PADRAO, refazer: false};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--refazer') {
      opcoes.refazer = true;
    } else if (['--video', '--intervalo', '--largura'].includes(a)) {
      const valor = argv[++i];
      if (valor === undefined || valor.startsWith('--')) throw new ErroUso(`A opção ${a} precisa de um valor.`);
      if (a === '--video') opcoes.video = resolve(process.cwd(), valor);
      else if (a === '--intervalo') opcoes.intervalo = lerNumeroPositivo(a, valor);
      else opcoes.largura = lerNumeroPositivo(a, valor);
    } else {
      throw new ErroUso(`Argumento desconhecido: ${a}. Veja o topo do script.`);
    }
  }
  if (!opcoes.video) throw new ErroUso('Passe o vídeo original: --video videos/NOME.mp4');
  if (!existsSync(opcoes.video)) throw new ErroUso(`Vídeo não encontrado: ${opcoes.video}`);
  return opcoes;
};

// ---------------------------------------------------------------- ffprobe / ffmpeg

const duracaoEmSegundos = (video) => {
  const r = rodar('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', video]);
  const s = Number(String(r.stdout).trim());
  if (r.status !== 0 || !Number.isFinite(s) || s <= 0) throw new Error(`ffprobe não leu a duração de ${video}.`);
  return s;
};

// Largura e altura da primeira imagem gerada (já com a rotação aplicada).
const tamanhoDaImagem = (imagem) => {
  const r = rodar('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', imagem,
  ]);
  const [w, h] = String(r.stdout).trim().split(',').map(Number);
  if (r.status !== 0 || !w || !h) throw new Error(`ffprobe não leu o tamanho de ${imagem}.`);
  return {largura: w, altura: h};
};

// -ss ANTES do -i = busca rápida e no tempo certo; -frames:v 1 = uma foto; -2 no scale mantém a
// proporção com altura par. -y: só chega aqui se o usuário passou --refazer (ou nada existia).
const tirarFoto = (video, segundo, largura, destino) => {
  const r = rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(segundo), '-i', video,
    '-frames:v', '1', '-vf', `scale=${largura}:-2`, '-q:v', QUALIDADE_JPEG,
    destino,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg falhou na foto de ${formatarTempo(segundo)}:\n${r.stderr}`);
};

// ---------------------------------------------------------------- principal

const main = () => {
  const opcoes = lerArgumentos(process.argv.slice(2));
  exigirBinario('ffmpeg');
  exigirBinario('ffprobe');

  const nome = basename(opcoes.video, extname(opcoes.video));
  const pasta = join(PASTA_VIDEOS, `${nome}.quadros`);
  const indice = join(PASTA_VIDEOS, `${nome}.quadros.txt`);

  const existentes = [pasta, indice].filter((c) => existsSync(c));
  if (existentes.length > 0 && !opcoes.refazer) {
    throw new ErroUso(`Já existe ${existentes.map(paraRelativo).join(' e ')}. Para refazer de propósito, rode de novo com --refazer.`);
  }

  const duracao = duracaoEmSegundos(opcoes.video);
  const tempos = [];
  for (let t = 0; t < duracao; t += opcoes.intervalo) tempos.push(t);

  console.log('== Extraindo quadros ==');
  console.log(`vídeo:     ${paraRelativo(opcoes.video)} (${duracao.toFixed(1)} s)`);
  console.log(`intervalo: ${opcoes.intervalo} s · largura: ${opcoes.largura} px · ${tempos.length} foto(s)`);

  mkdirSync(pasta, {recursive: true});
  const linhas = [];
  for (const t of tempos) {
    const arquivo = nomeDaFoto(t);
    tirarFoto(opcoes.video, t, opcoes.largura, join(pasta, arquivo));
    linhas.push(`${formatarTempo(t)} ${arquivo}`);
  }
  writeFileSync(indice, linhas.join('\n') + '\n');

  const {largura, altura} = tamanhoDaImagem(join(pasta, nomeDaFoto(0)));
  const tokensPorFoto = Math.ceil(largura / PIXELS_POR_TOKEN) * Math.ceil(altura / PIXELS_POR_TOKEN);
  const mensagens = Math.ceil(tempos.length / IMAGENS_POR_MENSAGEM);

  console.log(`\nFotos:    ${tempos.length} -> ${paraRelativo(pasta)}/`);
  console.log(`Índice:   ${linhas.length} linhas -> ${paraRelativo(indice)}`);
  console.log(`Tamanho:  ${largura} x ${altura} px por foto`);
  console.log(
    `Tokens:   ~${tokensPorFoto} por foto (ceil(${largura}/28) x ceil(${altura}/28)) · ` +
      `~${tokensPorFoto * tempos.length} no total (estimativa)`,
  );
  console.log(`Chat:     ${mensagens} mensagem(ns) de até ${IMAGENS_POR_MENSAGEM} imagens`);
};

try {
  main();
} catch (e) {
  console.error(`\nERRO: ${e.message}`);
  process.exit(1);
}
