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

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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

// ---------------------------------------------------------------- catálogo de componentes (via AST)

// Lê os .tsx do catálogo (nunca os executa — JSX não roda em Node puro, só
// faz parsing da árvore de sintaxe) pra saber quais props cada componente
// exige no plano. Roda de novo a cada execução: não existe arquivo
// catalogo-props.json pra ficar desatualizado.

const PASTAS_CATALOGO = [
  path.join(RAIZ, 'src', 'components'),
  path.join(RAIZ, 'src', 'components', 'v2'),
];

const listarArquivosComponentes = () => {
  const arquivos = [];
  for (const pasta of PASTAS_CATALOGO) {
    let nomes;
    try {
      nomes = readdirSync(pasta);
    } catch {
      continue;
    }
    for (const nome of nomes) {
      if (nome.endsWith('.tsx')) arquivos.push(path.join(pasta, nome));
    }
  }
  return arquivos;
};

// Segue a cadeia de chamadas de uma prop (ex.: z.number().min(0).max(1).default(0.5))
// coletando os nomes dos métodos encontrados, até a raiz da cadeia.
const nomesDaCadeia = (node) => {
  const nomes = new Set();
  let atual = node;
  while (ts.isCallExpression(atual) && ts.isPropertyAccessExpression(atual.expression)) {
    nomes.add(atual.expression.name.text);
    atual = atual.expression.expression;
  }
  return nomes;
};

// Acha a chamada-base da cadeia (`z.number()`, `z.enum([...])`, `zColor()`
// etc.) pra inferir um tipo aproximado da prop, sem executar o schema de
// verdade (não dá pra importar o .tsx direto em Node puro — ver nota grande
// mais abaixo, em checarPropsDeUmComponente). Cobre só os tipos usados hoje
// no catálogo; o que não reconhecer vira `tipo: null` (sem checagem de tipo
// pra essa prop, só de presença).
const tipoDaCadeia = (node) => {
  let atual = node;
  while (ts.isCallExpression(atual)) {
    if (ts.isPropertyAccessExpression(atual.expression)) {
      const objeto = atual.expression.expression;
      if (ts.isIdentifier(objeto) && objeto.text === 'z') {
        const metodo = atual.expression.name.text;
        if (metodo === 'enum') {
          const valores = [];
          const arg = atual.arguments[0];
          if (arg && ts.isArrayLiteralExpression(arg)) {
            for (const el of arg.elements) {
              if (ts.isStringLiteral(el)) valores.push(el.text);
            }
          }
          return { tipo: 'enum', valoresEnum: valores };
        }
        if (['number', 'string', 'boolean', 'array', 'object'].includes(metodo)) {
          return { tipo: metodo, valoresEnum: null };
        }
        return { tipo: null, valoresEnum: null }; // z.any(), z.record() etc. — não coberto
      }
      atual = atual.expression.expression;
      continue;
    }
    if (ts.isIdentifier(atual.expression) && atual.expression.text === 'zColor') {
      return { tipo: 'string', valoresEnum: null }; // cor é string no JSON do plano
    }
    break;
  }
  return { tipo: null, valoresEnum: null };
};

// Lê um .tsx e procura `export const xSchema = z.object({...})` no nível
// mais alto do arquivo. Retorna [{ nome, obrigatoria }] ou null se não achar
// nenhum schema exportado nesse formato.
const extrairPropsDoArquivo = (caminho) => {
  let texto;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch {
    return null;
  }
  const sourceFile = ts.createSourceFile(caminho, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let resultado = null;
  for (const node of sourceFile.statements) {
    if (resultado) break;
    if (!ts.isVariableStatement(node)) continue;
    const exportado = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exportado) continue;

    for (const decl of node.declarationList.declarations) {
      const init = decl.initializer;
      const chamaZObject =
        init &&
        ts.isCallExpression(init) &&
        ts.isPropertyAccessExpression(init.expression) &&
        init.expression.name.text === 'object' &&
        ts.isIdentifier(init.expression.expression) &&
        init.expression.expression.text === 'z' &&
        init.arguments[0] &&
        ts.isObjectLiteralExpression(init.arguments[0]);
      if (!chamaZObject) continue;

      const props = [];
      for (const prop of init.arguments[0].properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const nome = prop.name.getText(sourceFile);
        const cadeia = nomesDaCadeia(prop.initializer);
        const obrigatoria = !cadeia.has('optional') && !cadeia.has('default');
        const { tipo, valoresEnum } = tipoDaCadeia(prop.initializer);
        props.push({ nome, obrigatoria, tipo, valoresEnum });
      }
      resultado = props;
      break;
    }
  }
  return resultado;
};

// Fallback: lê src/Composition.tsx pra mapear id="X" (da <Composition>) até
// o arquivo do schema importado, pros casos em que o nome do componente no
// plano não bate com nenhum nome de arquivo do catálogo.
const extrairMapaComposition = () => {
  const caminho = path.join(RAIZ, 'src', 'Composition.tsx');
  const texto = readFileSync(caminho, 'utf8');
  const sourceFile = ts.createSourceFile(caminho, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const importsPorNome = {};
  const resolverModulo = (especificador) => {
    if (!especificador.startsWith('.')) return null;
    return path.join(path.dirname(caminho), `${especificador}.tsx`);
  };

  const visitarTopo = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const arquivoAbsoluto = resolverModulo(node.moduleSpecifier.text);
      const clausula = node.importClause;
      if (arquivoAbsoluto && clausula?.namedBindings && ts.isNamedImports(clausula.namedBindings)) {
        for (const especifico of clausula.namedBindings.elements) {
          importsPorNome[especifico.name.text] = arquivoAbsoluto;
        }
      }
    }
    ts.forEachChild(node, visitarTopo);
  };
  visitarTopo(sourceFile);

  const pegarAtributo = (elemento, nomeAtributo) => {
    for (const attr of elemento.attributes.properties) {
      if (!ts.isJsxAttribute(attr) || attr.name.getText(sourceFile) !== nomeAtributo) continue;
      const init = attr.initializer;
      if (init && ts.isStringLiteral(init)) return init.text;
      if (init && ts.isJsxExpression(init) && init.expression && ts.isIdentifier(init.expression)) {
        return init.expression.text;
      }
    }
    return null;
  };

  const mapaIdParaCaminho = {};
  const visitarJsx = (node) => {
    const ehComposition =
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(sourceFile) === 'Composition';
    if (ehComposition) {
      const id = pegarAtributo(node, 'id');
      const nomeSchema = pegarAtributo(node, 'schema');
      if (id && nomeSchema && importsPorNome[nomeSchema]) {
        mapaIdParaCaminho[id] = importsPorNome[nomeSchema];
      }
    }
    ts.forEachChild(node, visitarJsx);
  };
  visitarJsx(sourceFile);

  return mapaIdParaCaminho;
};

const construirCatalogo = () => {
  const catalogo = {};

  // Regra principal: nome do arquivo = nome do componente.
  for (const caminho of listarArquivosComponentes()) {
    const nomeComponente = path.basename(caminho, '.tsx');
    catalogo[nomeComponente] = extrairPropsDoArquivo(caminho);
  }

  // Fallback: id do Composition.tsx, só pro que não bateu por nome de arquivo.
  try {
    const mapaPorId = extrairMapaComposition();
    for (const [id, caminhoSchema] of Object.entries(mapaPorId)) {
      if (!(id in catalogo)) catalogo[id] = extrairPropsDoArquivo(caminhoSchema);
    }
  } catch {
    // Composition.tsx ilegível: segue só com o que veio dos arquivos.
  }

  return catalogo;
};

const catalogo = construirCatalogo();

// ------------------------------------------------- catálogo REAL (runtime)

// O catálogo acima (nomes de arquivo em src/components) serve pra achar o
// schema de cada componente e checar as props. Mas quem decide se um nome
// realmente funciona no render é o objeto `CATALOGO` dentro de
// src/PlanoComposicao.tsx — se o nome não estiver lá (ex.: arquivo criado
// mas esquecido de importar/registrar), o Remotion quebra em runtime com
// "Componente desconhecido no catálogo". Por isso essa checagem lê o AST de
// PlanoComposicao.tsx direto, em vez de supor que todo .tsx em
// src/components vira um componente utilizável — não duplica lista, lê a
// fonte da verdade.
const extrairCatalogoReal = () => {
  const caminho = path.join(RAIZ, 'src', 'PlanoComposicao.tsx');
  let texto;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch {
    return null; // arquivo não existe: quem chama decide o que fazer
  }
  const sourceFile = ts.createSourceFile(caminho, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let nomes = null;
  const visitar = (node) => {
    if (nomes) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'CATALOGO' &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      nomes = [];
      for (const prop of node.initializer.properties) {
        // forma usada no arquivo: `{ ImagemFade, GraficoLinha, ... }`
        // (shorthand) — cada propriedade é o próprio nome importado.
        if (ts.isShorthandPropertyAssignment(prop)) nomes.push(prop.name.text);
        else if (ts.isPropertyAssignment(prop)) nomes.push(prop.name.getText(sourceFile));
      }
      return;
    }
    ts.forEachChild(node, visitar);
  };
  visitar(sourceFile);
  return nomes;
};

const catalogoReal = extrairCatalogoReal();
if (catalogoReal === null) {
  console.log(
    'Aviso: não consegui ler o CATALOGO real de src/PlanoComposicao.tsx — a checagem de ' +
      'componente inexistente no catálogo foi pulada.\n',
  );
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
  problemasGerais.push('campo "video" ausente ou vazio — informe o nome do vídeo, sem extensão (ex. "0926")');
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

// "componente"/"props" não podem mais ficar "a confirmar": essa saída era
// PROVISÓRIA, válida só "até existir docs/catalogo-componentes.md" (ver
// ARQUITETURA.md seção 7) — esse arquivo já existe desde 28/09/2026, então
// qualquer "a confirmar" restando hoje é um plano incompleto, que a
// PlanoComposicao renderiza como elemento vazio (nada aparece) sem avisar
// ninguém. Por isso agora é ERRO, não passa mais batido.
const validarComponenteOuProps = (valor) => {
  if (valor === undefined) return { ok: false, aConfirmar: false, msg: 'ausente' };
  if (valor === 'a confirmar') {
    return {
      ok: false,
      aConfirmar: true,
      msg:
        'ainda está "a confirmar" — escolha o componente real do catálogo (ver docs/catalogo-componentes.md) ' +
        'e preencha "props" com os dados dele antes de renderizar',
    };
  }
  const preenchido =
    (typeof valor === 'string' && valor.trim().length > 0) ||
    (typeof valor === 'object' && valor !== null);
  if (!preenchido) {
    return {
      ok: false,
      aConfirmar: false,
      msg: `deve ser um valor preenchido (objeto, string ou array) (veio ${JSON.stringify(valor)}) — preencha com o componente/props reais`,
    };
  }
  return { ok: true, aConfirmar: false };
};

const checagem1 = (el) => {
  const problemas = [];

  if (el.id === undefined) problemas.push('id ausente — adicione uma string única, ex. "criterio-1"');
  else if (typeof el.id !== 'string' || el.id.trim() === '')
    problemas.push(`id deve ser string não vazia (veio ${JSON.stringify(el.id)}) — use um texto curto e único`);

  const comp = validarComponenteOuProps(el.componente);
  if (!comp.ok) problemas.push(`componente ${comp.msg}`);

  if (el.descricao === undefined)
    problemas.push('descricao ausente — descreva em poucas palavras o que esse elemento mostra');
  else if (typeof el.descricao !== 'string' || el.descricao.trim() === '')
    problemas.push(`descricao deve ser string não vazia (veio ${JSON.stringify(el.descricao)})`);

  if (el.texto === undefined)
    problemas.push('texto ausente — escreva o texto que aparece na tela (ou a fala do JR, se for o caso)');
  else if (typeof el.texto !== 'string' || el.texto.trim() === '')
    problemas.push(`texto deve ser string não vazia (veio ${JSON.stringify(el.texto)})`);

  if (el.inicio === undefined)
    problemas.push('inicio ausente — use o formato m:ss referente ao vídeo ORIGINAL, ex. "1:05"');
  else if (paraSegundos(el.inicio) === null)
    problemas.push(
      `inicio deve estar no formato m:ss, com segundos < 60, e não pode ser negativo (veio ${JSON.stringify(el.inicio)}) — ex. "1:05"`,
    );

  if (el.duracao === undefined) problemas.push('duracao ausente — informe a duração em segundos (número > 0)');
  else if (typeof el.duracao !== 'number' || !Number.isFinite(el.duracao) || el.duracao <= 0)
    problemas.push(`duracao deve ser número > 0 (veio ${JSON.stringify(el.duracao)})`);

  if (el.posicao === undefined) problemas.push('posicao ausente — use "topo" ou "base"');
  else if (el.posicao !== 'topo' && el.posicao !== 'base')
    problemas.push(`posicao deve ser "topo" ou "base" (veio ${JSON.stringify(el.posicao)})`);

  if (el.slot === undefined) problemas.push('slot ausente — use um inteiro >= 1 (1 é o mais alto)');
  else if (!Number.isInteger(el.slot) || el.slot < 1)
    problemas.push(`slot deve ser inteiro >= 1 (veio ${JSON.stringify(el.slot)})`);

  if (el.ilustrativo === undefined) problemas.push('ilustrativo ausente — use true ou false');
  else if (typeof el.ilustrativo !== 'boolean')
    problemas.push(`ilustrativo deve ser boolean (veio ${JSON.stringify(el.ilustrativo)})`);

  if (el.tempo_estimado === undefined) problemas.push('tempo_estimado ausente — use true ou false');
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
// `label` é o "id" de verdade do elemento sempre que ele existir e for uma
// string não vazia — é isso que aparece em toda mensagem de erro/aviso, pra
// bater com o id que o Matheus vê no plano. Só cai pra "el-N (sem id
// válido)" quando o id está ausente/inválido (aí a checagem 1 já aponta o
// problema do id em separado).
const elementos = dados.elementos.map((el, i) => {
  const original = el && typeof el === 'object' ? el : {};
  const inicioSeg = paraSegundos(original.inicio);
  const duracaoOk =
    typeof original.duracao === 'number' && Number.isFinite(original.duracao) && original.duracao > 0;
  const fimSeg = inicioSeg !== null && duracaoOk ? inicioSeg + original.duracao : null;
  const label =
    typeof original.id === 'string' && original.id.trim() !== '' ? original.id : `el-${i + 1} (sem id válido)`;
  return { original, label, inicioSeg, fimSeg };
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

// Sem --duracao explícito, tenta carregar a duração do vídeo ORIGINAL de
// videos/<video>.cortes.json (campo "duracaoOriginal", gravado pelo
// cortar-silencio.mjs — ver ARQUITETURA.md Etapa 2). Evita exigir o
// Matheus digitar a duração à mão toda vez; se o arquivo não existir ou não
// tiver o campo, a checagem 5 continua pulando, como antes.
let duracaoFonte = duracaoMax !== null ? '--duracao' : null;
if (duracaoMax === null && typeof dados.video === 'string' && dados.video.trim() !== '') {
  const caminhoCortes = path.join(RAIZ, 'videos', `${dados.video}.cortes.json`);
  try {
    const cortes = JSON.parse(readFileSync(caminhoCortes, 'utf8'));
    if (typeof cortes.duracaoOriginal === 'number' && Number.isFinite(cortes.duracaoOriginal)) {
      duracaoMax = cortes.duracaoOriginal;
      duracaoFonte = caminhoCortes;
    }
  } catch {
    // Sem videos/<video>.cortes.json (ou JSON inválido): segue sem duração.
  }
}

if (duracaoMax === null) {
  console.log(
    'Aviso: sem --duracao e sem videos/<video>.cortes.json com "duracaoOriginal", a checagem 5 ' +
      '(elemento fora da duração do vídeo original) foi pulada.\n',
  );
} else if (duracaoFonte !== '--duracao') {
  console.log(`Duração do vídeo original carregada de ${duracaoFonte}: ${duracaoMax}s\n`);
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
  if (lista.length > 1)
    erro(lista.map((e) => e.label).join(','), `ids: id duplicado "${id}" — escolha um id diferente para cada elemento`);
}

// 3. colisão posicao+slot (mesma região da tela E tempos se cruzando) — é
// AVISO, não erro: pode ser proposital (ex.: transição), o Matheus decide
// olhando o Studio.
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
        aviso(
          `${a.label},${b.label}`,
          `colisao: mesma posicao/slot (${posicao}/${slot}), tempos se cruzam ` +
            `(${formatarTempo(a.inicioSeg)}-${formatarTempo(a.fimSeg)} x ${formatarTempo(b.inicioSeg)}-${formatarTempo(b.fimSeg)}) — ` +
            `ajuste o "slot" de um dos dois ou os tempos, se não for proposital`,
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
      `respiro: ${folga.toFixed(1)}s de folga entre os blocos — ok se for proposital; senão, encoste os tempos ` +
        `ou aumente a folga pra mais de 0.5s`,
    );
  }
}

// 5. "inicio" fora da duração do vídeo original (negativo já é pego pela
// checagem 1, porque o formato m:ss não aceita sinal de menos)
if (duracaoMax !== null) {
  for (const el of elementos) {
    if (el.inicioSeg !== null && el.inicioSeg > duracaoMax) {
      erro(
        el.label,
        `inicio: começa em ${formatarTempo(el.inicioSeg)}, mas o vídeo original só tem ${formatarTempo(duracaoMax)} ` +
          `— corrija "inicio" para um tempo dentro do vídeo`,
      );
    } else if (el.fimSeg !== null && el.fimSeg > duracaoMax) {
      erro(
        el.label,
        `duracao: termina em ${formatarTempo(el.fimSeg)}, mas o vídeo original só tem ${formatarTempo(duracaoMax)} ` +
          `— reduza "duracao" ou adiante "inicio"`,
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
    aviso(
      el.label,
      `cautela editorial: texto contém ${termos.map((t) => `"${t}"`).join(', ')} — reveja para não soar ` +
        `como garantia ou regra geral (ver ARQUITETURA.md seção 7)`,
    );
  }
}

// 7. ilustrativo=true com dígito no texto
for (const el of elementos) {
  const { ilustrativo, texto } = el.original;
  if (ilustrativo === true && typeof texto === 'string' && /\d/.test(texto)) {
    erro(
      el.label,
      `ilustrativo: texto tem dígito ("${texto}") mas ilustrativo=true — remova o número do texto, ou ` +
        `mude para ilustrativo=false se o dado for real`,
    );
  }
}

// 8. texto todo em caixa alta
for (const el of elementos) {
  const texto = el.original.texto;
  if (typeof texto !== 'string') continue;
  const letras = (texto.match(/\p{L}/gu) ?? []).length;
  const temMinuscula = /\p{Ll}/u.test(texto);
  if (letras > 3 && !temMinuscula) {
    aviso(
      el.label,
      `caixa alta: texto todo em maiúsculas ("${texto}") — a marca pede caixa de frase, ex. "${texto[0]}${texto.slice(1).toLowerCase()}"`,
    );
  }
}

// 9. componente existe no CATALOGO real + props obrigatórias/tipo, contra
// o schema de cada componente (via AST do TypeScript).
//
// Nota sobre "importar os schemas Zod direto": tentamos, mas cada arquivo de
// componente é .tsx — tem JSX no corpo do componente React — e pelo menos um
// deles (`Contador.tsx`) roda código de verdade no topo do módulo
// (`loadFont(...)` de `@remotion/google-fonts/Inter`, que baixa metadados de
// fonte). Um `import()` puro do Node não entende JSX/TS, e mesmo
// transpilando (dá pra fazer com o `typescript` que já é dependência, via
// `ts.transpileModule`) o import executaria esse código de topo de módulo —
// efeito colateral de rede dentro de um validador que deveria ser
// determinístico e rápido. Por isso a checagem de tipo usa o mesmo caminho
// já escolhido pelo resto do script (parsing do arquivo fonte, nunca
// execução): a função `tipoDaCadeia` acima lê a chamada-base de cada prop no
// `z.object({...})` (z.number/z.string/z.boolean/z.enum/z.array/z.object/
// zColor) sem rodar nada.
const checarPropsDeUmComponente = (nomeComponente, propsObjeto, rotulo) => {
  if (nomeComponente === 'a confirmar') return;

  if (catalogoReal !== null && !catalogoReal.includes(nomeComponente)) {
    erro(
      rotulo,
      `catalogo: componente "${nomeComponente}" não está registrado no CATALOGO de src/PlanoComposicao.tsx ` +
        `— isso quebra o render ("Componente desconhecido no catálogo"). Corrija o nome no plano, ou importe ` +
        `o componente e adicione-o ao objeto CATALOGO`,
    );
    return;
  }

  const entradaCatalogo = catalogo[nomeComponente];
  if (entradaCatalogo === undefined) {
    aviso(
      rotulo,
      `catalogo: componente "${nomeComponente}" não tem arquivo em src/components (ou src/components/v2), não dá pra checar props`,
    );
    return;
  }
  if (entradaCatalogo === null) {
    aviso(rotulo, `catalogo: componente "${nomeComponente}" não tem schema exportado, não dá pra checar props`);
    return;
  }
  if (typeof propsObjeto !== 'object' || propsObjeto === null || Array.isArray(propsObjeto)) {
    erro(rotulo, `props: faltou o objeto de props de "${nomeComponente}" — adicione "props": { ... } nesse elemento`);
    return;
  }

  const faltando = entradaCatalogo
    .filter((p) => p.obrigatoria && !(p.nome in propsObjeto))
    .map((p) => p.nome);
  if (faltando.length > 0) {
    erro(
      rotulo,
      `props: faltam props obrigatórias de "${nomeComponente}": ${faltando.join(', ')} — adicione esses campos em "props"`,
    );
  }

  for (const descricaoProp of entradaCatalogo) {
    if (!(descricaoProp.nome in propsObjeto) || !descricaoProp.tipo) continue; // ausente (já coberto acima) ou tipo não inferido
    const valor = propsObjeto[descricaoProp.nome];
    const tipoReal = Array.isArray(valor) ? 'array' : valor === null ? 'null' : typeof valor;
    let ok;
    if (descricaoProp.tipo === 'enum') {
      ok =
        tipoReal === 'string' &&
        (!descricaoProp.valoresEnum || descricaoProp.valoresEnum.length === 0 || descricaoProp.valoresEnum.includes(valor));
    } else {
      ok = tipoReal === descricaoProp.tipo;
    }
    if (!ok) {
      const esperado =
        descricaoProp.tipo === 'enum' && descricaoProp.valoresEnum?.length
          ? `um destes valores: ${descricaoProp.valoresEnum.map((v) => `"${v}"`).join(', ')}`
          : descricaoProp.tipo;
      erro(
        rotulo,
        `props: "${descricaoProp.nome}" de "${nomeComponente}" deveria ser ${esperado} ` +
          `(veio ${JSON.stringify(valor)}, tipo ${tipoReal}) — corrija o valor no plano`,
      );
    }
  }
};

for (const el of elementos) {
  const { componente, props } = el.original;
  if (componente === undefined || componente === 'a confirmar') continue;
  if (typeof props !== 'object' || props === null) continue; // já coberto pela checagem 1

  if (Array.isArray(componente)) {
    for (const nome of componente) {
      if (nome === 'a confirmar' || typeof nome !== 'string') continue;
      const propsDoComponente = Array.isArray(props) ? undefined : props[nome];
      checarPropsDeUmComponente(nome, propsDoComponente, el.label);
    }
  } else if (typeof componente === 'string') {
    checarPropsDeUmComponente(componente, props, el.label);
  }
}

// ---------------------------------------------------------------- saída

for (const linha of linhas) console.log(linha);
for (const el of elementos) {
  if (semProblema.has(el.label)) console.log(`[${el.label}] OK`);
}

console.log(`\nResumo: ${totalErros} erro(s), ${totalAvisos} aviso(s)`);
process.exit(totalErros > 0 ? 1 : 0);
