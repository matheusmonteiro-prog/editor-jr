#!/usr/bin/env node
/**
 * render-final.mjs — monta o comando `npx remotion render` final pro
 * editor-jr (vertical 1080x1920 ou horizontal 1920x1080, 30fps).
 *
 * Caminho de saída: PASTA_OUT, a mesma variável usada em
 * scripts/folha-contato.mjs. No Windows, sem a variável definida, cai no
 * padrão local (~/editor-jr/out, via os.homedir()); dentro do WSL — onde o
 * render de fato funciona hoje, ver ARQUITETURA.md "Ambiente de render
 * (WSL)" — o caminho real é ~/editor-jr/out dentro do Linux, que é outro
 * filesystem. A mesma variável de ambiente resolve os dois: define
 * PASTA_OUT no ambiente onde o script rodar.
 *
 * Uso:
 *   node scripts/render-final.mjs <composicao> <nome-saida> [--formato vertical|horizontal] [--dry-run]
 *
 * --dry-run só imprime o comando montado, nunca executa nada.
 * SEM --dry-run o script executa `npx remotion render` de verdade — nunca
 * rodar assim numa máquina onde o render está bloqueado (ver ARQUITETURA.md,
 * erro 0xC0E90002 do Controle de aplicativos do Windows).
 *
 * Flags de resolução/fps usadas abaixo (--width/--height/--fps) foram
 * confirmadas na saída real de `npx remotion render --help` — ver
 * docs/etapa8-notas.md. --codec e --video-bitrate também existem lá, e são
 * opcionais aqui (sem valor, usa o padrão do Remotion).
 */

import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const posicionais = argv.filter((a) => !a.startsWith('--'));
const [composicao, nomeSaida] = posicionais;

const opcao = (nome, padrao = null) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : argv[i + 1];
};
const temFlag = (nome) => argv.includes(`--${nome}`);

if (!composicao || !nomeSaida) {
  console.error(
    'Uso: node scripts/render-final.mjs <composicao> <nome-saida> [--formato vertical|horizontal] [--codec X] [--video-bitrate X] [--dry-run]',
  );
  process.exit(1);
}

const formato = opcao('formato', 'vertical');
if (formato !== 'vertical' && formato !== 'horizontal') {
  console.error(`--formato inválido: "${formato}" (use "vertical" ou "horizontal")`);
  process.exit(1);
}

// Etapa 8 pede só estes dois formatos, 30fps.
const RESOLUCAO = {
  vertical: { width: 1080, height: 1920 },
  horizontal: { width: 1920, height: 1080 },
};
const { width, height } = RESOLUCAO[formato];
const fps = 30;

const pastaOut = process.env.PASTA_OUT ?? join(homedir(), 'editor-jr', 'out');
const caminhoSaida = join(pastaOut, `${nomeSaida}.mp4`);

const codec = opcao('codec');
const videoBitrate = opcao('video-bitrate');

const args = [
  'remotion',
  'render',
  'src/index.ts',
  composicao,
  caminhoSaida,
  '--width', String(width),
  '--height', String(height),
  '--fps', String(fps),
];
if (codec) args.push('--codec', codec);
if (videoBitrate) args.push('--video-bitrate', videoBitrate);

const comandoLegivel = `npx ${args.join(' ')}`;

if (temFlag('dry-run')) {
  console.log(comandoLegivel);
  process.exit(0);
}

console.log(`Rodando: ${comandoLegivel}`);
const resultado = spawnSync('npx', args, { stdio: 'inherit', shell: true });
process.exit(resultado.status ?? 1);
