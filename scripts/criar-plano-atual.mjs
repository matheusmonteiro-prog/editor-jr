#!/usr/bin/env node
/**
 * criar-plano-atual.mjs — cria o "plano atual" de um vídeo a partir do plano original.
 *
 * Uso:
 *   node scripts/criar-plano-atual.mjs <nome-do-plano>      (ex.: 0926.plano  ou  teste-kit-v3)
 *
 * O que faz:
 *   1. Confere o nome contra a lista real de planos/*.json (sem caminho livre, sem "..").
 *   2. Valida o ORIGINAL (scripts/validar-plano.mjs, sem shell). Inválido = aborta (código 1)
 *      ANTES de criar qualquer arquivo.
 *   3. Copia planos/<nome>.json para planos/atual/<video>.atual.json, byte a byte, SOMENTE se
 *      ainda não existir (flag de "não sobrescrever"). Se já existe: avisa e sai com código 0.
 *   4. Valida a cópia e imprime o caminho.
 *   5. Cria planos/atual/LEIAME.txt (só se não existir) com a regra de uso.
 *
 * O original NUNCA é escrito. Nada é apagado.
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, constants, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_PLANOS = join(RAIZ, 'planos');
const PASTA_ATUAL = join(PASTA_PLANOS, 'atual');
const VALIDADOR = join(RAIZ, 'scripts', 'validar-plano.mjs');

const falhar = (texto) => {
  console.error(texto);
  process.exit(1);
};

const nome = process.argv[2];
if (!nome || process.argv.length > 3) falhar('Uso: node scripts/criar-plano-atual.mjs <nome-do-plano>   (ex.: 0926.plano)');

const permitidos = readdirSync(PASTA_PLANOS, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith('.json'))
  .map((d) => d.name.slice(0, -'.json'.length));
if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(nome) || nome.includes('..') || !permitidos.includes(nome)) {
  falhar(`Plano "${nome}" não é aceito. Use um destes (nome sem .json):\n${permitidos.map((p) => `  ${p}`).join('\n')}`);
}

const original = join(PASTA_PLANOS, `${nome}.json`);

const validar = (arquivo, rotulo) => {
  const v = spawnSync(process.execPath, [VALIDADOR, arquivo], { encoding: 'utf8' });
  if (v.status !== 0) {
    process.stderr.write(v.stdout ?? '');
    process.stderr.write(v.stderr ?? '');
    falhar(`\nABORTADO: o validador achou erro em ${rotulo} (código ${v.status ?? 'sem código'}).`);
  }
  console.log(`${rotulo}: ${(v.stdout ?? '').match(/Resumo:.*/)?.[0] ?? 'válido'}`);
};

// "video" do plano ("0926" ou "videos/0926-cortado-v1.mp4") vira o nome do vídeo.
let dadosOriginal;
try {
  dadosOriginal = JSON.parse(readFileSync(original, 'utf8'));
} catch (e) {
  falhar(`Não consegui ler ${original} como JSON: ${e.message}`);
}
const bruto = typeof dadosOriginal.video === 'string' ? dadosOriginal.video : '';
const video = bruto.replace(/^.*[\\/]/, '').replace(/\.[A-Za-z0-9]+$/, '');
if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(video)) {
  falhar(`O plano não tem um campo "video" aproveitável para nomear o plano atual (veio ${JSON.stringify(dadosOriginal.video)}).`);
}

const destino = join(PASTA_ATUAL, `${video}.atual.json`);
if (existsSync(destino)) {
  console.log(`Já existe: planos/atual/${video}.atual.json — não sobrescrevi nada.`);
  console.log(destino);
  process.exit(0);
}

validar(original, `original planos/${nome}.json`);

mkdirSync(PASTA_ATUAL, { recursive: true });
copyFileSync(original, destino, constants.COPYFILE_EXCL); // falha se já existir (nunca sobrescreve)

const leiame = join(PASTA_ATUAL, 'LEIAME.txt');
if (!existsSync(leiame)) {
  writeFileSync(
    leiame,
    [
      'PLANO ATUAL (planos/atual/)',
      '',
      'Regra: editar SÓ estes arquivos (<video>.atual.json). O plano original em planos/ não é tocado.',
      '',
      '- Cada arquivo nasce de uma cópia exata do original (scripts/criar-plano-atual.mjs).',
      '- O script nunca sobrescreve: se o plano atual já existe, ele só avisa.',
      '- Depois de qualquer edição, rodar: node scripts/validar-plano.mjs planos/atual/<video>.atual.json',
      '- Render com conferência: node scripts/render-final.mjs <composicao> <saida> --plano atual/<video>.atual.json',
      '',
    ].join('\n'),
    { encoding: 'utf8', flag: 'wx' },
  );
}

validar(destino, `cópia planos/atual/${video}.atual.json`);
console.log(`Plano atual criado: ${destino}`);
