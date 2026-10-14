#!/usr/bin/env node
/**
 * resolver-plano.mjs — converte "naPalavra" (+ "ocorrencia") em "inicio" num plano de edição.
 * Passo 3b da Etapa 4 (critério 4.3). Roda ANTES do validador: o validador não entende
 * naPalavra e dá erro se ele chegar sem "inicio" (scripts/validar-plano.mjs).
 *
 * Em vez de digitar o tempo à mão, o plano aponta a palavra e qual vez ela aparece:
 *   { "id": "juro", "naPalavra": "juros", "ocorrencia": 2, ... }
 * e este script troca isso por  "inicio": "2:41.6"  (formato "m:ss.d", um décimo).
 *
 * O núcleo é a função PURA resolverPlano(plano, palavras, pares): não lê nem grava arquivo,
 * não tem caminho fixo e não altera o que recebe. A linha de comando (no fim) é que lê os
 * arquivos e grava o resultado.
 *
 * Uso (CLI):
 *   node scripts/resolver-plano.mjs --plano planos/0926.plano.json --palavras videos/0926.palavras.json
 *   node scripts/resolver-plano.mjs --plano ... --palavras ... --glossario meu-glossario.json
 *   node scripts/resolver-plano.mjs --plano ... --palavras ... --refazer
 *   node scripts/resolver-plano.mjs --plano ... --palavras ... --saida minha-pasta
 *
 *   --plano CAMINHO     plano de entrada (obrigatório)
 *   --palavras CAMINHO  videos/<nome>.palavras.json, o Caption[] bruto do Whisper (obrigatório)
 *   --glossario CAMINHO glossário (opcional; padrão: glossario.json na raiz do projeto, se existir)
 *   --saida PASTA       grava nessa pasta em vez de planos/ (a pasta tem de existir)
 *   --refazer           permite sobrescrever o arquivo de saída
 *
 * Saída: planos/<nome>.resolvido.json (<nome> = nome do plano sem ".json" nem ".plano"), ou
 * <PASTA>/<nome>.resolvido.json com --saida.
 * O plano de entrada nunca é alterado. Sem --refazer, não sobrescreve um arquivo existente.
 *
 * Regras:
 * - inicio = startMs da palavra ARREDONDADO PARA BAIXO ao décimo (161600 -> "2:41.6").
 * - O glossário é aplicado ANTES de procurar: "naPalavra" casa com o texto já corrigido.
 * - ocorrencia omitida vale 1. naPalavra e ocorrencia saem do elemento resolvido.
 * - Elemento com naPalavra E inicio é erro (o script não adivinha qual vale).
 * - Todos os erros saem juntos, cada um com o id do elemento.
 */

import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {aplicarGlossario, acharPalavra, ErroPalavras} from './palavras.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GLOSSARIO_PADRAO = join(RAIZ, 'glossario.json');

export class ErroResolver extends Error {
  constructor(mensagem, problemas = []) {
    super(mensagem);
    this.problemas = problemas;
  }
}

/**
 * Milissegundos -> "m:ss.d", arredondando PARA BAIXO ao décimo (nunca para cima: o elemento
 * não pode entrar depois da palavra). 161600 -> "2:41.6"; 5450 -> "0:05.4".
 */
export const formatarInicio = (ms) => {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) {
    throw new ErroResolver(`startMs inválido (veio ${JSON.stringify(ms)}).`);
  }
  const decimos = Math.floor(ms / 100);
  const minutos = Math.floor(decimos / 600);
  const resto = decimos % 600;
  const segundos = Math.floor(resto / 10);
  return `${minutos}:${String(segundos).padStart(2, '0')}.${resto % 10}`;
};

/**
 * Devolve uma CÓPIA do plano em que cada elemento com "naPalavra" ganhou "inicio" e perdeu
 * "naPalavra" e "ocorrencia". Elementos sem naPalavra ficam idênticos. `palavras` é o Caption[]
 * bruto; `pares` é o glossário { "errada": "certa" } (pode ser null/undefined).
 * Lança ErroResolver (com .problemas) se algum elemento não puder ser resolvido.
 */
export const resolverPlano = (plano, palavras, pares) => {
  if (plano === null || typeof plano !== 'object' || !Array.isArray(plano.elementos)) {
    throw new ErroResolver('O plano precisa ser um objeto com a lista "elementos".');
  }
  if (!Array.isArray(palavras)) throw new ErroResolver('"palavras" precisa ser uma lista (o .palavras.json).');

  let corrigidas;
  try {
    corrigidas = aplicarGlossario(palavras, pares ?? {});
  } catch (e) {
    if (e instanceof ErroPalavras) throw new ErroResolver(`Glossário inválido: ${e.message}`);
    throw e;
  }

  const copia = structuredClone(plano);
  const problemas = [];

  copia.elementos = copia.elementos.map((el, i) => {
    if (el === null || typeof el !== 'object' || el.naPalavra === undefined) return el;
    const id = typeof el.id === 'string' && el.id.trim() !== '' ? el.id : `el-${i + 1}`;

    if (el.inicio !== undefined) {
      problemas.push(`[${id}] tem "naPalavra" e "inicio" ao mesmo tempo — deixe só um dos dois.`);
      return el;
    }

    let achada;
    try {
      achada = acharPalavra(corrigidas, el.naPalavra, el.ocorrencia === undefined ? 1 : el.ocorrencia);
    } catch (e) {
      if (e instanceof ErroPalavras) {
        problemas.push(`[${id}] ${e.message}`);
        return el;
      }
      throw e;
    }

    let inicio;
    try {
      inicio = formatarInicio(achada.startMs);
    } catch (e) {
      if (e instanceof ErroResolver) {
        problemas.push(`[${id}] ${e.message}`);
        return el;
      }
      throw e;
    }

    // Mantém a ordem das chaves: "inicio" ocupa o lugar de "naPalavra".
    const resolvido = {};
    for (const [chave, valor] of Object.entries(el)) {
      if (chave === 'naPalavra') resolvido.inicio = inicio;
      else if (chave !== 'ocorrencia') resolvido[chave] = valor;
    }
    return resolvido;
  });

  if (problemas.length > 0) {
    throw new ErroResolver(
      `Não consegui resolver ${problemas.length} elemento(s):\n` + problemas.map((p) => `  - ${p}`).join('\n'),
      problemas,
    );
  }
  return copia;
};

// ---------------------------------------------------------------- linha de comando

class ErroUso extends Error {}

const paraRelativo = (caminho) => {
  const rel = relative(RAIZ, caminho);
  return rel.startsWith('..') || isAbsolute(rel) ? caminho : rel.split('\\').join('/');
};

/**
 * Caminho do arquivo de saída. Sem `pastaSaida`, é planos/<nome>.resolvido.json na raiz do
 * projeto; com `pastaSaida` (opção --saida), é <pastaSaida>/<nome>.resolvido.json. Só monta o
 * caminho: não lê nem grava nada.
 */
export const montarCaminhoSaida = (caminhoDoPlano, pastaSaida) => {
  const nome = basename(caminhoDoPlano, extname(caminhoDoPlano)).replace(/\.plano$/, '');
  return join(pastaSaida ?? join(RAIZ, 'planos'), `${nome}.resolvido.json`);
};

const lerArgumentos = (argv) => {
  const opcoes = {refazer: false};
  const comValor = {'--plano': 'plano', '--palavras': 'palavras', '--glossario': 'glossario', '--saida': 'saida'};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--refazer') opcoes.refazer = true;
    else if (a in comValor) {
      const valor = argv[++i];
      if (valor === undefined || valor.startsWith('--')) throw new ErroUso(`A opção ${a} precisa de um valor.`);
      opcoes[comValor[a]] = resolve(process.cwd(), valor);
    } else throw new ErroUso(`Opção desconhecida: ${a}`);
  }
  if (!opcoes.plano) throw new ErroUso('Passe o plano: --plano planos/<nome>.plano.json');
  if (!opcoes.palavras) throw new ErroUso('Passe a transcrição: --palavras videos/<nome>.palavras.json');
  return opcoes;
};

const lerJson = (caminho, o_que) => {
  if (!existsSync(caminho)) throw new ErroUso(`Não existe ${o_que}: ${paraRelativo(caminho)}`);
  try {
    return JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (e) {
    throw new ErroUso(`${o_que} não é um JSON válido (${paraRelativo(caminho)}): ${e.message}`);
  }
};

// Devolve { pares, origem }. Glossário padrão ausente é só aviso; o passado por --glossario
// e ausente é erro. Arquivo que existe mas está errado PARA o script.
const carregarGlossario = (explicito) => {
  const caminho = explicito ?? GLOSSARIO_PADRAO;
  if (!existsSync(caminho)) {
    if (explicito) throw new ErroUso(`Não existe o glossário: ${paraRelativo(caminho)}`);
    console.log(`AVISO: glossário não encontrado em ${paraRelativo(caminho)}; seguindo sem correção.`);
    return {pares: {}, origem: null};
  }
  const bruto = lerJson(caminho, 'o glossário');
  const pares = bruto?.pares;
  if (pares === null || typeof pares !== 'object' || Array.isArray(pares)) {
    throw new ErroUso(
      `O glossário ${paraRelativo(caminho)} precisa ter { "pares": { "errado": "certo" } } ` +
        '(o campo "_comentario" é opcional).',
    );
  }
  return {pares, origem: caminho};
};

const main = () => {
  const opcoes = lerArgumentos(process.argv.slice(2));
  if (opcoes.saida) {
    if (!existsSync(opcoes.saida)) {
      throw new ErroUso(`A pasta de --saida não existe: ${paraRelativo(opcoes.saida)} (crie a pasta antes).`);
    }
    if (!statSync(opcoes.saida).isDirectory()) {
      throw new ErroUso(`O caminho de --saida não é uma pasta: ${paraRelativo(opcoes.saida)}`);
    }
  }
  const plano = lerJson(opcoes.plano, 'o plano');
  const palavras = lerJson(opcoes.palavras, 'a transcrição');
  const {pares, origem} = carregarGlossario(opcoes.glossario);

  const saida = montarCaminhoSaida(opcoes.plano, opcoes.saida);
  if (existsSync(saida) && !opcoes.refazer) {
    throw new ErroUso(
      `Já existe ${paraRelativo(saida)}. Para sobrescrever de propósito, rode de novo com --refazer.`,
    );
  }

  const resolvido = resolverPlano(plano, palavras, pares);

  if (!opcoes.saida) mkdirSync(dirname(saida), {recursive: true}); // só o planos/ padrão é criado
  writeFileSync(saida, JSON.stringify(resolvido, null, 2) + '\n', 'utf8');

  const feitos = plano.elementos
    .map((el, i) => ({el, novo: resolvido.elementos[i]}))
    .filter(({el}) => el?.naPalavra !== undefined);
  console.log(`Plano: ${paraRelativo(opcoes.plano)}`);
  console.log(`Palavras: ${paraRelativo(opcoes.palavras)} (${palavras.length} palavras)`);
  console.log(origem ? `Glossário: ${Object.keys(pares).length} par(es) em ${paraRelativo(origem)}` : 'Glossário: nenhum');
  for (const {el, novo} of feitos) {
    console.log(`  ${novo.id ?? '(sem id)'}: "${el.naPalavra}" (${el.ocorrencia ?? 1}ª) -> inicio ${novo.inicio}`);
  }
  console.log(`${feitos.length} elemento(s) resolvido(s). Gravado: ${paraRelativo(saida)}`);
};

// Só roda quando o arquivo é executado direto; importado (pelo teste), só entrega as funções.
const executadoDireto = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (executadoDireto) {
  try {
    main();
  } catch (e) {
    console.error(`\nERRO: ${e.message}`);
    process.exit(1);
  }
}
