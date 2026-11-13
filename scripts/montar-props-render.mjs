#!/usr/bin/env node
/**
 * montar-props-render.mjs — monta o arquivo de props da composição "PlanoAtual" (fatia 5b).
 *
 * Uso:
 *   node scripts/montar-props-render.mjs <plano> [--saida <nome.json>] [--sobrescrever]
 *     <plano>  = nome de um .json de planos/ ou planos/atual/ (ex.: 0926.plano.json ou
 *                atual/0926.atual.json), conferido contra a lista REAL das duas pastas.
 *     --saida  = só o NOME do arquivo (fica sempre em out/); padrão: props-<plano>.json
 *                (com "/" trocado por "-", ex.: out/props-atual-0926.atual.json).
 *     --sobrescrever = permite trocar um arquivo de props que já existe (sem ela: erro).
 *
 * O que faz, nesta ordem (qualquer problema = código 1 e nada gravado):
 *   1. valida o plano com scripts/validar-plano.mjs (sem shell);
 *   2. escolhe o vídeo com a MESMA regra do editor (escolherVideoCortado, de
 *      editor/regrasServidor.mjs): public/videos/<video>-cortado-vN.mp4 com o N mais alto;
 *   3. lê videos/<video>.cortes.json e filtra os trechos como o editor (resumirCortes);
 *   4. grava { videoSrc, plano, cortes } em out/<saida>.
 * <video> é o campo "video" do plano. Sem vídeo ou sem cortes: erro claro.
 *
 * Também exporta montarProps() para o scripts/render-final.mjs usar sem duplicar regra.
 */

import { spawnSync } from 'node:child_process';
import { constants, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { escolherVideoCortado, resumirCortes } from '../editor/regrasServidor.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_PLANOS = join(RAIZ, 'planos');
const PASTA_OUT = join(RAIZ, 'out');
const VALIDADOR = join(RAIZ, 'scripts', 'validar-plano.mjs');

class ErroProps extends Error {}

const listarJson = (pasta) => {
  try {
    return readdirSync(pasta, { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.json')).map((d) => d.name);
  } catch {
    return [];
  }
};

// Planos aceitos: os .json de planos/ e de planos/atual/ (com o prefixo "atual/").
export const planosPermitidos = () => [...listarJson(PASTA_PLANOS), ...listarJson(join(PASTA_PLANOS, 'atual')).map((n) => `atual/${n}`)];

export const conferirNomeDoPlano = (nome) => {
  const permitidos = planosPermitidos();
  if (typeof nome !== 'string' || !/^(atual\/)?[A-Za-z0-9._-]+\.json$/.test(nome) || nome.includes('..') || !permitidos.includes(nome)) {
    throw new ErroProps(`Plano "${nome}" não é aceito. Use um destes (planos/ ou planos/atual/):\n${permitidos.map((p) => `  ${p}`).join('\n') || '  (nenhum)'}`);
  }
  return join(PASTA_PLANOS, nome);
};

export const validarPlano = (arquivo, rotulo) => {
  const v = spawnSync(process.execPath, [VALIDADOR, arquivo], { encoding: 'utf8', shell: false, windowsHide: true });
  if (v.status !== 0) {
    throw new ErroProps(`${v.stdout ?? ''}${v.stderr ?? ''}\nABORTADO: o validador achou erro em ${rotulo} (código ${v.status ?? 'sem código'}). Nada foi gravado.`);
  }
  return (v.stdout ?? '').match(/Resumo:.*/)?.[0] ?? 'válido';
};

const nomeDeSaidaPadrao = (nomePlano) => `props-${nomePlano.replace(/\.json$/, '').replace(/\//g, '-')}.json`;

// Monta e grava o arquivo de props. Devolve { arquivo, videoSrc, trechos, duracaoFinal }.
export const montarProps = ({ plano: nomePlano, saida = null, sobrescrever = false, validar = true }) => {
  const arquivoPlano = conferirNomeDoPlano(nomePlano);
  const nomeSaida = saida ?? nomeDeSaidaPadrao(nomePlano);
  if (!/^[A-Za-z0-9._-]+\.json$/.test(nomeSaida) || nomeSaida.includes('..') || basename(nomeSaida) !== nomeSaida) {
    throw new ErroProps(`--saida "${nomeSaida}" não é aceito: use só um nome de arquivo .json (ele fica sempre em out/).`);
  }
  const resumo = validar ? validarPlano(arquivoPlano, `planos/${nomePlano}`) : null;

  let plano;
  try {
    plano = JSON.parse(readFileSync(arquivoPlano, 'utf8'));
  } catch (e) {
    throw new ErroProps(`Não consegui ler planos/${nomePlano} como JSON: ${e.message}`);
  }

  const escolhido = escolherVideoCortado(listarArquivos(join(RAIZ, 'public', 'videos')), plano.video);
  if (!escolhido) {
    throw new ErroProps(
      `Sem vídeo de fundo para "${nomePlano}": procurei public/videos/${typeof plano.video === 'string' ? plano.video : '<video>'}-cortado-vN.mp4 ` +
        `(campo "video" do plano: ${JSON.stringify(plano.video)}). Nada foi gravado.`,
    );
  }
  const arquivoCortes = join(RAIZ, 'videos', `${plano.video}.cortes.json`);
  let cortes = null;
  try {
    cortes = resumirCortes(readFileSync(arquivoCortes, 'utf8'));
  } catch {
    cortes = null;
  }
  if (!cortes) {
    throw new ErroProps(`Sem cortes para "${nomePlano}": videos/${plano.video}.cortes.json não existe ou não tem trechos válidos. Nada foi gravado.`);
  }

  const videoSrc = `videos/${escolhido.arquivo}`; // relativo a public/ (staticFile), como o editor
  mkdirSync(PASTA_OUT, { recursive: true });
  const destino = join(PASTA_OUT, nomeSaida);
  if (existsSync(destino) && !sobrescrever) {
    throw new ErroProps(`Já existe out/${nomeSaida}. Use --sobrescrever para trocar (nada foi gravado).`);
  }
  writeFileSync(destino, `${JSON.stringify({ videoSrc, plano, cortes }, null, 2)}\n`, { encoding: 'utf8', flag: sobrescrever ? 'w' : 'wx' });
  return { arquivo: destino, videoSrc, trechos: cortes.trechos.length, duracaoFinal: cortes.duracaoFinal, resumo };
};

function listarArquivos(pasta) {
  try {
    return readdirSync(pasta, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
  } catch {
    return [];
  }
}

// ---------- linha de comando ----------
const rodandoDireto = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (rodandoDireto) {
  const argv = process.argv.slice(2);
  const opcao = (nome) => {
    const i = argv.indexOf(`--${nome}`);
    return i === -1 ? null : argv[i + 1] ?? '';
  };
  const posicionais = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--saida');
  if (posicionais.length !== 1) {
    console.error('Uso: node scripts/montar-props-render.mjs <plano> [--saida <nome.json>] [--sobrescrever]   (ex.: atual/0926.atual.json)');
    process.exit(1);
  }
  try {
    const r = montarProps({ plano: posicionais[0], saida: opcao('saida'), sobrescrever: argv.includes('--sobrescrever') });
    console.log(`Plano válido: planos/${posicionais[0]} (${r.resumo})`);
    console.log(`Vídeo: ${r.videoSrc} · cortes: ${r.trechos} trechos${r.duracaoFinal ? ` · duracaoFinal ${r.duracaoFinal.toFixed(2)} s` : ''}`);
    console.log(`Props gravadas: ${r.arquivo}`);
  } catch (e) {
    console.error(e instanceof ErroProps ? e.message : `Erro: ${e.message}`);
    process.exit(1);
  }
}
