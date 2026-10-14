#!/usr/bin/env node
/**
 * resolver-plano.mjs — converte "naPalavra" (+ "ocorrencia") em "inicio" num plano de edição
 * e "legendaPalavras" (+ "destaques") em props.palavrasMs.
 * Passo 3b da Etapa 4 (critério 4.3) e etapa B3 do 4.5. Roda ANTES do validador: o validador
 * não entende naPalavra e dá erro se ele chegar sem "inicio" (scripts/validar-plano.mjs).
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
 * - LegendaAnimada com "legendaPalavras": { "de": "m:ss.d", "ate": "m:ss.d" } (tempo do ORIGINAL):
 *   as palavras (já com o glossário) cujo startMs cai em [de, ate], limites INCLUSIVOS, viram
 *   props.palavrasMs = [{ texto, inicioMs, fimMs, destaque? }]. texto sem espaço nas pontas;
 *   fimMs = endMs (se endMs < startMs, vale startMs). "destaques": ["poupança", ...] marca
 *   destaque true nas palavras de mesma forma normalizada (sem acento/maiúscula/pontuação).
 *   legendaPalavras e destaques saem do elemento resolvido. Se faltar "inicio", grava inicio = "de";
 *   se faltar "duracao" E "duracaoFrames", grava duracao = ate - de (segundos). Valor que o elemento
 *   já trouxe é mantido.
 * - Avisos (não são erro; não mudam o plano devolvido): destaque que não casa com nenhuma palavra
 *   do trecho, e "inicio" do elemento depois do "de" (palavras antes dele ficam sem legenda).
 *   resolverPlano(plano, palavras, pares, { avisar }) chama avisar(mensagem) para cada um. Vale também com componente em lista
 *   (["LegendaAnimada", ...]): palavrasMs vai em props.LegendaAnimada.
 * - Todos os erros saem juntos, cada um com o id do elemento.
 */

import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {aplicarGlossario, acharPalavra, normalizar, ErroPalavras} from './palavras.mjs';

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

// "m:ss" ou "m:ss.d" (UM dígito decimal) -> ms. Mesma regra do validador. null se mal formado.
const tempoParaMs = (tempo) => {
  if (typeof tempo !== 'string') return null;
  const m = /^(\d+):(\d{1,2})(?:\.(\d))?$/.exec(tempo);
  if (!m || Number(m[2]) >= 60) return null;
  return (Number(m[1]) * 60 + Number(m[2])) * 1000 + (m[3] === undefined ? 0 : Number(m[3]) * 100);
};

/**
 * Trata "legendaPalavras"/"destaques" de UM elemento. Devolve o elemento novo (sem as duas
 * chaves, com props.palavrasMs) ou, havendo problema, empurra para `problemas` e devolve `el`.
 */
const resolverLegenda = (el, id, corrigidas, problemas, avisar) => {
  const erros = [];
  const L = el.legendaPalavras;

  // Onde fica props.palavrasMs: props (componente único) ou props.LegendaAnimada (lista).
  const ehUnico = el.componente === 'LegendaAnimada';
  const ehLista = Array.isArray(el.componente) && el.componente.includes('LegendaAnimada');
  if (!ehUnico && !ehLista) {
    erros.push(`"legendaPalavras" só vale em componente LegendaAnimada (este é ${JSON.stringify(el.componente)}).`);
  }

  let deMs = null;
  let ateMs = null;
  if (L === null || typeof L !== 'object' || Array.isArray(L)) {
    erros.push('"legendaPalavras" precisa ser { "de": "m:ss.d", "ate": "m:ss.d" }.');
  } else {
    deMs = tempoParaMs(L.de);
    ateMs = tempoParaMs(L.ate);
    if (deMs === null) erros.push(`legendaPalavras.de mal formado (${JSON.stringify(L.de)}): use "m:ss" ou "m:ss.d".`);
    if (ateMs === null) erros.push(`legendaPalavras.ate mal formado (${JSON.stringify(L.ate)}): use "m:ss" ou "m:ss.d".`);
    if (deMs !== null && ateMs !== null && ateMs <= deMs) {
      erros.push(`legendaPalavras.ate (${L.ate}) precisa ser depois de "de" (${L.de}).`);
    }
  }

  let alvos = new Set();
  const D = el.destaques;
  if (D !== undefined) {
    if (!Array.isArray(D) || D.some((d) => typeof d !== 'string' || normalizar(d) === '')) {
      erros.push('"destaques" precisa ser uma lista de palavras (textos não vazios).');
    } else {
      alvos = new Set(D.map(normalizar));
    }
  }

  let propsAlvo = null; // objeto onde palavrasMs entra
  if (ehUnico || ehLista) {
    const props = el.props === undefined ? {} : el.props;
    const ehObjeto = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
    propsAlvo = ehUnico ? props : (props?.LegendaAnimada ?? {});
    if (!ehObjeto(props) || !ehObjeto(propsAlvo)) {
      erros.push(`"props" precisa ser um objeto para receber palavrasMs (veio ${JSON.stringify(el.props)}).`);
      propsAlvo = null;
    } else if (propsAlvo.palavrasMs !== undefined) {
      erros.push('tem "legendaPalavras" E props.palavrasMs ao mesmo tempo — deixe só um dos dois.');
    }
  }

  const lista = [];
  if (erros.length === 0) {
    for (const w of corrigidas) {
      if (typeof w?.startMs !== 'number' || !Number.isFinite(w.startMs)) continue;
      if (w.startMs < deMs || w.startMs > ateMs) continue;
      const texto = typeof w.text === 'string' ? w.text.trim() : '';
      if (texto === '') continue;
      const fimMs = typeof w.endMs === 'number' && w.endMs >= w.startMs ? w.endMs : w.startMs;
      const item = {texto, inicioMs: w.startMs, fimMs};
      if (alvos.has(normalizar(texto))) item.destaque = true;
      lista.push(item);
    }
    if (lista.length === 0) erros.push(`nenhuma palavra entre ${L.de} e ${L.ate} na transcrição.`);
  }

  if (erros.length > 0) {
    for (const e of erros) problemas.push(`[${id}] ${e}`);
    return el;
  }

  // Avisos: destaque sem acerto no trecho; elemento que entra depois do "de".
  const usados = new Set(lista.map((w) => normalizar(w.texto)));
  for (const d of Array.isArray(D) ? D : []) {
    if (!usados.has(normalizar(d))) {
      avisar(`[${id}] destaque "${d.trim()}" não casa com nenhuma palavra entre ${L.de} e ${L.ate}.`);
    }
  }
  const inicioMs = tempoParaMs(el.inicio);
  if (inicioMs !== null && inicioMs > deMs) {
    avisar(
      `[${id}] "inicio" (${el.inicio}) é depois do "de" da legenda (${L.de}): as palavras antes dele ficam sem legenda.`,
    );
  }

  const resolvido = {};
  for (const [chave, valor] of Object.entries(el)) {
    if (chave === 'legendaPalavras' || chave === 'destaques') continue;
    resolvido[chave] = valor;
  }
  // Só preenche o que faltou; o que o elemento trouxe é mantido.
  if (resolvido.inicio === undefined) resolvido.inicio = L.de;
  if (resolvido.duracao === undefined && resolvido.duracaoFrames === undefined) {
    resolvido.duracao = (ateMs - deMs) / 1000;
  }
  if (ehUnico) {
    resolvido.props = {...propsAlvo, palavrasMs: lista};
  } else {
    resolvido.props = {...el.props, LegendaAnimada: {...propsAlvo, palavrasMs: lista}};
  }
  return resolvido;
};

/**
 * Devolve uma CÓPIA do plano em que cada elemento com "naPalavra" ganhou "inicio" e perdeu
 * "naPalavra" e "ocorrencia", e cada elemento com "legendaPalavras" ganhou props.palavrasMs
 * (perdendo "legendaPalavras" e "destaques"). Os demais ficam idênticos. `palavras` é o Caption[]
 * bruto; `pares` é o glossário { "errada": "certa" } (pode ser null/undefined).
 * Lança ErroResolver (com .problemas) se algum elemento não puder ser resolvido.
 * `opcoes.avisar` (opcional) recebe cada aviso (texto, com o id do elemento); sem ele, avisos
 * são ignorados. Não muda o plano devolvido.
 */
export const resolverPlano = (plano, palavras, pares, opcoes = {}) => {
  const avisar = typeof opcoes?.avisar === 'function' ? opcoes.avisar : () => {};
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

  const resolverNaPalavra = (el, id) => {
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
  };

  copia.elementos = copia.elementos.map((el, i) => {
    if (el === null || typeof el !== 'object') return el;
    const temNaPalavra = el.naPalavra !== undefined;
    // "destaques" sozinho também entra: sem "legendaPalavras" não tem o que destacar.
    const temLegenda = el.legendaPalavras !== undefined || el.destaques !== undefined;
    if (!temNaPalavra && !temLegenda) return el;
    const id = typeof el.id === 'string' && el.id.trim() !== '' ? el.id : `el-${i + 1}`;

    let atual = el;
    if (temNaPalavra) atual = resolverNaPalavra(atual, id);
    if (temLegenda) {
      if (atual.legendaPalavras === undefined) {
        problemas.push(`[${id}] tem "destaques" sem "legendaPalavras" — não há o que destacar.`);
      } else {
        atual = resolverLegenda(atual, id, corrigidas, problemas, avisar);
      }
    }
    return atual;
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

  const avisos = [];
  const resolvido = resolverPlano(plano, palavras, pares, {avisar: (a) => avisos.push(a)});

  if (!opcoes.saida) mkdirSync(dirname(saida), {recursive: true}); // só o planos/ padrão é criado
  writeFileSync(saida, JSON.stringify(resolvido, null, 2) + '\n', 'utf8');

  const feitos = plano.elementos
    .map((el, i) => ({el, novo: resolvido.elementos[i]}))
    .filter(({el}) => el?.naPalavra !== undefined);
  const legendas = plano.elementos
    .map((el, i) => ({el, novo: resolvido.elementos[i]}))
    .filter(({el}) => el?.legendaPalavras !== undefined);
  console.log(`Plano: ${paraRelativo(opcoes.plano)}`);
  console.log(`Palavras: ${paraRelativo(opcoes.palavras)} (${palavras.length} palavras)`);
  console.log(origem ? `Glossário: ${Object.keys(pares).length} par(es) em ${paraRelativo(origem)}` : 'Glossário: nenhum');
  for (const {el, novo} of feitos) {
    console.log(`  ${novo.id ?? '(sem id)'}: "${el.naPalavra}" (${el.ocorrencia ?? 1}ª) -> inicio ${novo.inicio}`);
  }
  for (const {el, novo} of legendas) {
    const lista = Array.isArray(novo.componente) ? novo.props.LegendaAnimada.palavrasMs : novo.props.palavrasMs;
    console.log(`  ${novo.id ?? '(sem id)'}: legendaPalavras ${el.legendaPalavras.de}–${el.legendaPalavras.ate} -> ${lista.length} palavra(s)`);
  }
  console.log(`${feitos.length} elemento(s) resolvido(s). Gravado: ${paraRelativo(saida)}`);
  if (legendas.length > 0) console.log(`${legendas.length} legenda(s) com palavrasMs gravada(s).`);
  for (const a of avisos) console.log(`AVISO: ${a}`);
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
