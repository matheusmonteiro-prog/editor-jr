#!/usr/bin/env node
/**
 * validar-plano.mjs — valida um plano de edição (JSON) do editor-jr
 *
 * Não mexe em componentes nem composições — só lê o JSON do plano e checa
 * a forma dele. Node puro, sem dependência nova.
 *
 * Uso:
 *   node scripts/validar-plano.mjs planos/exemplo-valido.json
 *   node scripts/validar-plano.mjs planos/exemplo-valido.json --duracao 180
 *
 * Sem --duracao, a checagem 5 (elemento terminando depois do fim do vídeo)
 * é pulada, com um aviso no topo da saída.
 */

import { readFileSync } from 'node:fs';

// ---------------------------------------------------------------- cli

const argv = process.argv.slice(2);
const caminho = argv.find((a) => !a.startsWith('--'));

const opcao = (nome) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? null : argv[i + 1];
};

if (!caminho) {
  console.error('Faltou o arquivo do plano. Ex.: node scripts/validar-plano.mjs planos/exemplo.json');
  process.exit(1);
}

let duracaoMax = null;
const duracaoTxt = opcao('duracao');
if (duracaoTxt !== null) {
  duracaoMax = Number(duracaoTxt);
  if (!Number.isFinite(duracaoMax) || duracaoMax <= 0) {
    console.error(`--duracao inválido: "${duracaoTxt}" (precisa ser um número de segundos > 0)`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------- leitura

let bruto;
try {
  bruto = readFileSync(caminho, 'utf8');
} catch {
  console.error(`Não achei o arquivo: ${caminho}`);
  process.exit(1);
}

let dados;
try {
  dados = JSON.parse(bruto);
} catch (e) {
  console.error(`JSON inválido em ${caminho}: ${e.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------- forma geral

if (typeof dados !== 'object' || dados === null || Array.isArray(dados)) {
  console.error('ERRO fatal: o plano precisa ser um objeto JSON (com video, orientacao, elementos).');
  process.exit(1);
}

if (!Array.isArray(dados.elementos)) {
  console.error('ERRO fatal: campo "elementos" deve ser uma lista (array).');
  process.exit(1);
}

const problemasGerais = [];
if (typeof dados.video !== 'string' || dados.video.trim() === '') {
  problemasGerais.push('campo "video" ausente ou vazio');
}
if (dados.orientacao !== 'vertical' && dados.orientacao !== 'horizontal') {
  problemasGerais.push(
    `campo "orientacao" deve ser "vertical" ou "horizontal" (veio ${JSON.stringify(dados.orientacao)})`,
  );
}

// ---------------------------------------------------------------- tempo

// "m:ss" → segundos. Formato inválido ou segundos >= 60 é falha da checagem 1
// (retorna null), não uma exceção solta.
const paraSegundos = (txt) => {
  if (typeof txt !== 'string') return null;
  const m = txt.match(/^(\d+):(\d{1,2})$/);
  if (!m) return null;
  const minutos = Number(m[1]);
  const segundos = Number(m[2]);
  if (segundos >= 60) return null;
  return minutos * 60 + segundos;
};

const formatarTempo = (seg) => {
  const m = Math.floor(seg / 60);
  const s = Math.round(seg % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ---------------------------------------------------------------- checagem 1

// "componente" e "props" aceitam o texto "a confirmar" (nunca é erro) ou
// qualquer valor preenchido (string não vazia, ou objeto/array).
const validarComponenteOuProps = (valor) => {
  if (valor === undefined) return { ok: false, msg: 'ausente' };
  if (valor === 'a confirmar') return { ok: true, aConfirmar: true };
  const preenchido =
    (typeof valor === 'string' && valor.trim().length > 0) ||
    (typeof valor === 'object' && valor !== null);
  if (!preenchido) {
    return {
      ok: false,
      aConfirmar: false,
      msg: `deve ser "a confirmar" ou um valor preenchido (objeto, string ou array) (veio ${JSON.stringify(valor)})`,
    };
  }
  return { ok: true, aConfirmar: false };
};

const checagem1 = (el) => {
  const problemas = [];

  if (el.id === undefined) problemas.push('id ausente');
  else if (typeof el.id !== 'string' || el.id.trim() === '')
    problemas.push(`id deve ser string não vazia (veio ${JSON.stringify(el.id)})`);

  const comp = validarComponenteOuProps(el.componente);
  if (!comp.ok) problemas.push(`componente ${comp.msg}`);

  if (el.descricao === undefined) problemas.push('descricao ausente');
  else if (typeof el.descricao !== 'string' || el.descricao.trim() === '')
    problemas.push(`descricao deve ser string não vazia (veio ${JSON.stringify(el.descricao)})`);

  if (el.texto === undefined) problemas.push('texto ausente');
  else if (typeof el.texto !== 'string' || el.texto.trim() === '')
    problemas.push(`texto deve ser string não vazia (veio ${JSON.stringify(el.texto)})`);

  if (el.inicio === undefined) problemas.push('inicio ausente');
  else if (paraSegundos(el.inicio) === null)
    problemas.push(`inicio deve estar no formato m:ss, com segundos < 60 (veio ${JSON.stringify(el.inicio)})`);

  if (el.duracao === undefined) problemas.push('duracao ausente');
  else if (typeof el.duracao !== 'number' || !Number.isFinite(el.duracao) || el.duracao <= 0)
    problemas.push(`duracao deve ser número > 0 (veio ${JSON.stringify(el.duracao)})`);

  if (el.posicao === undefined) problemas.push('posicao ausente');
  else if (el.posicao !== 'topo' && el.posicao !== 'base')
    problemas.push(`posicao deve ser "topo" ou "base" (veio ${JSON.stringify(el.posicao)})`);

  if (el.slot === undefined) problemas.push('slot ausente');
  else if (!Number.isInteger(el.slot) || el.slot < 1)
    problemas.push(`slot deve ser inteiro >= 1 (veio ${JSON.stringify(el.slot)})`);

  if (el.ilustrativo === undefined) problemas.push('ilustrativo ausente');
  else if (typeof el.ilustrativo !== 'boolean')
    problemas.push(`ilustrativo deve ser boolean (veio ${JSON.stringify(el.ilustrativo)})`);

  if (el.tempo_estimado === undefined) problemas.push('tempo_estimado ausente');
  else if (typeof el.tempo_estimado !== 'boolean')
    problemas.push(`tempo_estimado deve ser boolean (veio ${JSON.stringify(el.tempo_estimado)})`);

  const props = validarComponenteOuProps(el.props);
  if (!props.ok) problemas.push(`props ${props.msg}`);

  return { problemas, aConfirmar: comp.aConfirmar || props.aConfirmar };
};

// ---------------------------------------------------------------- checagem 6

// Radicais (garant*, valoriz*) e frases inteiras, com fronteira de palavra
// unicode (\p{L}) em vez de \b — \b não lida bem com acento. Símbolos não
// precisam de fronteira.
const SIMBOLOS = /[≠×=+]/gu;
const RADICAL = /(?<![\p{L}])(garant|valoriz)\p{L}*/giu;
const SEMPRE = /(?<![\p{L}])sempre(?![\p{L}])/giu;
const RENDE_MAIS = /(?<![\p{L}])rendem?\s+mais(?![\p{L}])/giu;

const termosCautela = (texto) => {
  const achados = new Set();
  for (const re of [SIMBOLOS, RADICAL, SEMPRE, RENDE_MAIS]) {
    for (const m of texto.matchAll(re)) achados.add(m[0]);
  }
  return [...achados];
};

// ---------------------------------------------------------------- normaliza

// Cada elemento vira { original, label, inicioSeg, fimSeg } pra alimentar as
// checagens de intervalo (2 a 5). inicioSeg/fimSeg ficam null quando não dá
// pra calcular (já vai sobrar erro da checagem 1 pra esse elemento).
const elementos = dados.elementos.map((el, i) => {
  const original = el && typeof el === 'object' ? el : {};
  const inicioSeg = paraSegundos(original.inicio);
  const duracaoOk =
    typeof original.duracao === 'number' && Number.isFinite(original.duracao) && original.duracao > 0;
  const fimSeg = inicioSeg !== null && duracaoOk ? inicioSeg + original.duracao : null;
  return { original, label: `el-${i + 1}`, inicioSeg, fimSeg };
});

// ---------------------------------------------------------------- rodar checagens

const linhas = [];
let totalErros = 0;
let totalAvisos = 0;
const semProblema = new Set(elementos.map((e) => e.label));

const erro = (labels, texto) => {
  linhas.push(`[${labels}] ERRO ${texto}`);
  totalErros++;
  for (const l of labels.split(',')) semProblema.delete(l);
};
const aviso = (labels, texto) => {
  linhas.push(`[${labels}] AVISO ${texto}`);
  totalAvisos++;
  for (const l of labels.split(',')) semProblema.delete(l);
};

if (duracaoMax === null) {
  console.log('Aviso: sem --duracao, a checagem 5 (elemento terminando depois do fim do vídeo) foi pulada.\n');
}

for (const msg of problemasGerais) {
  erro('geral', `estrutura: ${msg}`);
}

// 1. campos obrigatórios
let contagemAConfirmar = 0;
for (const el of elementos) {
  const { problemas, aConfirmar } = checagem1(el.original);
  if (aConfirmar) contagemAConfirmar++;
  if (problemas.length > 0) erro(el.label, `campos: ${problemas.join('; ')}`);
}
if (contagemAConfirmar > 0) {
  console.log(`${contagemAConfirmar} elementos com componente/props a confirmar\n`);
}

// 2. ids repetidos
const porId = new Map();
for (const el of elementos) {
  const id = el.original.id;
  if (typeof id === 'string' && id.trim() !== '') {
    if (!porId.has(id)) porId.set(id, []);
    porId.get(id).push(el);
  }
}
for (const [id, lista] of porId) {
  if (lista.length > 1) erro(lista.map((e) => e.label).join(','), `ids: id duplicado "${id}"`);
}

// 3. colisão posicao+slot
const porPosSlot = new Map();
for (const el of elementos) {
  const { posicao, slot } = el.original;
  const posSlotValido = (posicao === 'topo' || posicao === 'base') && Number.isInteger(slot) && slot >= 1;
  if (posSlotValido && el.inicioSeg !== null && el.fimSeg !== null) {
    const chave = `${posicao}:${slot}`;
    if (!porPosSlot.has(chave)) porPosSlot.set(chave, []);
    porPosSlot.get(chave).push(el);
  }
}
for (const [chave, lista] of porPosSlot) {
  const [posicao, slot] = chave.split(':');
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i];
      const b = lista[j];
      if (a.inicioSeg < b.fimSeg && b.inicioSeg < a.fimSeg) {
        erro(
          `${a.label},${b.label}`,
          `colisao: mesma posicao/slot (${posicao}/${slot}), tempos se cruzam ` +
            `(${formatarTempo(a.inicioSeg)}-${formatarTempo(a.fimSeg)} x ${formatarTempo(b.inicioSeg)}-${formatarTempo(b.fimSeg)})`,
        );
      }
    }
  }
}

// 4. respiro — une os intervalos de TODOS os elementos (a tela toda), não
// por posicao+slot. Elementos que se sobrepõem ou se encostam formam um
// bloco só; entre blocos consecutivos, folga > 0 e < 0.5s é aviso.
const comTempo = elementos
  .filter((el) => el.inicioSeg !== null && el.fimSeg !== null)
  .sort((a, b) => a.inicioSeg - b.inicioSeg);

const blocos = [];
for (const el of comTempo) {
  const ultimo = blocos[blocos.length - 1];
  if (ultimo && el.inicioSeg <= ultimo.fim) {
    if (el.fimSeg > ultimo.fim) {
      ultimo.fim = el.fimSeg;
      ultimo.elementoFim = el;
    }
  } else {
    blocos.push({ inicio: el.inicioSeg, fim: el.fimSeg, elementoInicio: el, elementoFim: el });
  }
}
for (let i = 0; i < blocos.length - 1; i++) {
  const atual = blocos[i];
  const proximo = blocos[i + 1];
  const folga = proximo.inicio - atual.fim;
  if (folga > 0 && folga < 0.5) {
    aviso(
      `${atual.elementoFim.label},${proximo.elementoInicio.label}`,
      `respiro: ${folga.toFixed(1)}s de folga entre os blocos`,
    );
  }
}

// 5. elemento termina depois do fim do vídeo (só com --duracao)
if (duracaoMax !== null) {
  for (const el of elementos) {
    if (el.fimSeg !== null && el.fimSeg > duracaoMax) {
      erro(
        el.label,
        `duracao: termina em ${formatarTempo(el.fimSeg)}, mas o vídeo só tem ${formatarTempo(duracaoMax)}`,
      );
    }
  }
}

// 6. cautela editorial
for (const el of elementos) {
  const texto = el.original.texto;
  if (typeof texto !== 'string') continue; // já reportado na checagem 1
  const termos = termosCautela(texto);
  if (termos.length > 0) {
    aviso(el.label, `cautela editorial: texto contém ${termos.map((t) => `"${t}"`).join(', ')}`);
  }
}

// 7. ilustrativo=true com dígito no texto
for (const el of elementos) {
  const { ilustrativo, texto } = el.original;
  if (ilustrativo === true && typeof texto === 'string' && /\d/.test(texto)) {
    erro(el.label, `ilustrativo: texto tem dígito ("${texto}") mas ilustrativo=true`);
  }
}

// 8. texto todo em caixa alta
for (const el of elementos) {
  const texto = el.original.texto;
  if (typeof texto !== 'string') continue;
  const letras = (texto.match(/\p{L}/gu) ?? []).length;
  const temMinuscula = /\p{Ll}/u.test(texto);
  if (letras > 3 && !temMinuscula) {
    aviso(el.label, `caixa alta: texto todo em maiúsculas ("${texto}") — a marca pede caixa de frase`);
  }
}

// ---------------------------------------------------------------- saída

for (const linha of linhas) console.log(linha);
for (const el of elementos) {
  if (semProblema.has(el.label)) console.log(`[${el.label}] OK`);
}

console.log(`\nResumo: ${totalErros} erro(s), ${totalAvisos} aviso(s)`);
process.exit(totalErros > 0 ? 1 : 0);
