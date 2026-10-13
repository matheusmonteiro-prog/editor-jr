/**
 * palavras.mjs — funções puras para trabalhar com a lista de palavras da transcrição
 * (o Caption[] de videos/<nome>.palavras.json). Núcleo do critério 4.3 (naPalavra/ocorrencia)
 * e do 4.4 (glossário) da Etapa 4.
 *
 * Módulo PURO: não lê nem grava arquivo, não tem caminho fixo e não altera o que recebe.
 * Quem usa (validador, scripts) é que lê o .palavras.json e passa a lista.
 *
 * Cada palavra é um objeto { text, startMs, endMs, timestampMs, confidence }. O `text` do
 * Whisper costuma vir com um espaço na frente (" comprar") e a pontuação colada (" prazo.").
 *
 * Exporta: normalizar, aplicarGlossario, acharPalavra, ErroPalavras.
 */

export class ErroPalavras extends Error {}

// Pontuação/símbolos (Unicode) nas pontas. O que está no meio da palavra fica.
const PONTAS = /^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu;

/**
 * Forma de comparação de uma palavra: minúsculas, sem acento, sem espaço nem pontuação nas
 * pontas. " Preço." -> "preco"; "ÉPOCA!" -> "epoca". Atenção: "é" e "e" ficam iguais.
 *
 * O `text` que o Whisper entrega costuma vir com um espaço na FRENTE (" comprar"; 377 das 378
 * palavras do teste-jr), por isso os espaços das pontas são sempre descartados (trim): quem
 * compara nunca precisa se preocupar com isso. Vale para qualquer espaço Unicode (tab, quebra
 * de linha, espaço não separável).
 */
export const normalizar = (texto) => {
  if (typeof texto !== 'string') return '';
  return texto
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim()
    .replace(PONTAS, '');
};

/**
 * Devolve uma NOVA lista em que cada palavra cujo texto normalizado é chave de `pares` tem o
 * `text` trocado pelo valor. startMs, endMs, timestampMs e confidence NÃO mudam. A lista de
 * entrada e seus objetos não são alterados. Só troca palavra por palavra (não casa frase).
 *
 * `pares` é um objeto { "eipô": "Apple", "gínio": "início" }. As chaves são comparadas na forma
 * normalizada (acento, maiúscula e pontuação nas pontas não importam).
 *
 * O espaço na frente e a pontuação no fim da palavra original são mantidos: " eipô," com
 * {"eipô": "Apple"} vira " Apple,". Assim as palavras continuam separadas e a pontuação (que
 * quebra linha no .palavras.txt) não some.
 */
export const aplicarGlossario = (palavras, pares) => {
  if (!Array.isArray(palavras)) throw new ErroPalavras('aplicarGlossario: "palavras" deve ser uma lista.');
  if (pares === null || typeof pares !== 'object' || Array.isArray(pares)) {
    throw new ErroPalavras('aplicarGlossario: "pares" deve ser um objeto { "errada": "certa" }.');
  }
  const mapa = new Map();
  for (const [chave, valor] of Object.entries(pares)) {
    const k = normalizar(chave);
    if (k === '') throw new ErroPalavras(`aplicarGlossario: a chave ${JSON.stringify(chave)} fica vazia depois de normalizar.`);
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new ErroPalavras(`aplicarGlossario: o valor de ${JSON.stringify(chave)} deve ser um texto não vazio.`);
    }
    mapa.set(k, valor.trim());
  }

  return palavras.map((p) => {
    const copia = {...p};
    if (typeof p.text !== 'string') return copia;
    const k = normalizar(p.text);
    if (!mapa.has(k)) return copia;
    const frente = /^\s*/u.exec(p.text)[0];
    const fim = /[\p{P}\p{S}\s]*$/u.exec(p.text)[0];
    copia.text = `${frente}${mapa.get(k)}${fim}`;
    return copia;
  });
};

/**
 * Acha a N-ésima ocorrência (contando a partir de 1) de `termo` na lista, comparando
 * normalizar(text) com normalizar(termo). Devolve { indice, startMs, endMs, total }:
 *   indice  = posição na lista, contando a partir de 0 (como um array)
 *   total   = quantas vezes a palavra aparece na lista inteira
 * Erro claro (ErroPalavras) se não achar, se a ocorrência pedida passa do total, ou se
 * `ocorrencia` não for um inteiro >= 1. Só uma palavra por vez: frase não é suportada.
 */
export const acharPalavra = (palavras, termo, ocorrencia = 1) => {
  if (!Array.isArray(palavras)) throw new ErroPalavras('acharPalavra: "palavras" deve ser uma lista.');
  if (typeof termo !== 'string' || normalizar(termo) === '') {
    throw new ErroPalavras(`acharPalavra: o termo precisa ser uma palavra (veio ${JSON.stringify(termo)}).`);
  }
  if (typeof ocorrencia !== 'number' || !Number.isInteger(ocorrencia) || ocorrencia < 1) {
    throw new ErroPalavras(
      `ocorrencia deve ser um número inteiro maior ou igual a 1, contando a partir de 1 (veio ${JSON.stringify(ocorrencia)}).`,
    );
  }
  const alvo = normalizar(termo);
  if (/\s/u.test(alvo)) {
    throw new ErroPalavras(`"${termo.trim()}" tem mais de uma palavra; por enquanto só uma palavra por vez é aceita.`);
  }

  const achadas = [];
  palavras.forEach((p, i) => {
    if (normalizar(p?.text) === alvo) achadas.push(i);
  });

  if (achadas.length === 0) {
    throw new ErroPalavras(`"${termo.trim()}" não aparece na transcrição.`);
  }
  if (ocorrencia > achadas.length) {
    throw new ErroPalavras(
      `"${termo.trim()}" aparece ${achadas.length} vez(es); você pediu a ${ocorrencia}ª.`,
    );
  }
  const indice = achadas[ocorrencia - 1];
  const {startMs, endMs} = palavras[indice];
  return {indice, startMs, endMs, total: achadas.length};
};
