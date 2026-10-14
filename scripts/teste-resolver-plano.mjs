// Teste do scripts/resolver-plano.mjs (passo 3b da Etapa 4, critérios 4.3 e 4.2).
// Rodar: node scripts/teste-resolver-plano.mjs
// Imprime "OK (N casos)" ou lista as falhas (e sai com código 1).
//
// A lista de palavras, o glossário e o plano estão escritos AQUI DENTRO, para o teste rodar em
// qualquer PC sem arquivo de vídeo nem transcrição. Nada é gravado em planos/: o plano resolvido
// que passa pelo validador vai para uma pasta temporária, apagada no fim.
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolverPlano, formatarInicio, montarCaminhoSaida, ErroResolver} from './resolver-plano.mjs';
import {criarParaFrameCortado} from '../src/utils/tempoCortado.ts';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALIDADOR = path.join(RAIZ, 'scripts', 'validar-plano.mjs');
const FPS = 30;

const p = (text, startMs, endMs) => ({text, startMs, endMs, timestampMs: startMs + 10, confidence: 0.9});

// Palavras do Whisper (com o espaço na frente e a pontuação colada, como vêm de verdade).
const PALAVRAS = [
  p(' O', 0, 300),
  p(' juro', 1000, 1500), // juro, 1ª vez
  p(' cai.', 1500, 2200),
  p(' O', 2200, 2400),
  p(' juro', 5450, 5900), // juro, 2ª vez (arredondamento: 5450 ms vira 0:05.4)
  p(' sobe,', 6000, 6500),
  p(' eipô', 12300, 12800), // o Whisper errou "Apple"
  p(' boa', 31200, 31600),
  p(' fim', 161600, 162000), // 161600 ms vira 2:41.6
  p(' juro', 90000, 90400), // juro, 3ª vez (só pra ter 3)
];
const PARES = {eipô: 'Apple'};

const elemento = (id, extra = {}) => ({
  id,
  componente: 'Checkmark',
  descricao: `teste ${id}`,
  texto: `texto ${id}`,
  duracao: 2,
  posicao: 'topo',
  slot: 1,
  ilustrativo: false,
  tempo_estimado: false,
  props: {x: 300, y: 300, tamanho: 120, cor: '#F5F0E6', corFundo: '#0F2A1D', mostrarFundo: true, duracaoFrames: 60},
  ...extra,
});

const falhas = [];
let total = 0;

const igual = (nome, obtido, esperado) => {
  total++;
  const a = JSON.stringify(obtido);
  const b = JSON.stringify(esperado);
  if (a !== b) falhas.push(`${nome}: obtido ${a}, esperado ${b}`);
};

// Espera um ErroResolver cuja mensagem contenha TODOS os trechos.
const erro = (nome, fn, ...trechos) => {
  total++;
  try {
    fn();
    falhas.push(`${nome}: esperava erro, mas não deu`);
  } catch (e) {
    if (!(e instanceof ErroResolver)) {
      falhas.push(`${nome}: erro de tipo errado (${e?.constructor?.name}): ${e?.message}`);
      return;
    }
    for (const t of trechos) {
      if (!e.message.includes(t)) falhas.push(`${nome}: mensagem "${e.message}" não contém "${t}"`);
    }
  }
};

const resolver1 = (el, pares = PARES) => resolverPlano({video: 'x', elementos: [el]}, PALAVRAS, pares).elementos[0];

// ---- formatarInicio
igual('formatarInicio 161600 -> 2:41.6', formatarInicio(161600), '2:41.6');
igual('formatarInicio 5450 -> 0:05.4 (para baixo)', formatarInicio(5450), '0:05.4');
igual('formatarInicio 5499 -> 0:05.4 (nunca sobe)', formatarInicio(5499), '0:05.4');
igual('formatarInicio 0 -> 0:00.0', formatarInicio(0), '0:00.0');
igual('formatarInicio 99 -> 0:00.0', formatarInicio(99), '0:00.0');
igual('formatarInicio 59999 -> 0:59.9', formatarInicio(59999), '0:59.9');
igual('formatarInicio 60000 -> 1:00.0', formatarInicio(60000), '1:00.0');
igual('formatarInicio 600000 -> 10:00.0', formatarInicio(600000), '10:00.0');

// ---- ocorrência 1 e 2 da mesma palavra, e ocorrência omitida (padrão 1)
igual('ocorrência 1', resolver1(elemento('a', {naPalavra: 'juro', ocorrencia: 1})).inicio, '0:01.0');
igual('ocorrência 2', resolver1(elemento('b', {naPalavra: 'juro', ocorrencia: 2})).inicio, '0:05.4');
igual('ocorrência 3', resolver1(elemento('c', {naPalavra: 'juro', ocorrencia: 3})).inicio, '1:30.0');
igual('ocorrência omitida vale 1', resolver1(elemento('d', {naPalavra: 'juro'})).inicio, '0:01.0');

// ---- arredondamento: 5450 ms vira 0:05.4 (já coberto acima); 161600 vira 2:41.6
igual('arredondamento 161600', resolver1(elemento('e', {naPalavra: 'fim'})).inicio, '2:41.6');

// ---- palavra com glossário: o Whisper escreveu "eipô"; o plano pede "Apple"
igual('glossário: pede "Apple" (corrigida)', resolver1(elemento('f', {naPalavra: 'Apple'})).inicio, '0:12.3');
erro(
  'glossário: "eipô" não existe mais depois da correção',
  () => resolver1(elemento('g', {naPalavra: 'eipô'})),
  '[g]',
  'não aparece',
);
igual('sem glossário: pede "eipô" (bruta)', resolver1(elemento('h', {naPalavra: 'eipô'}), {}).inicio, '0:12.3');

// ---- erros, sempre com o id do elemento
erro('palavra inexistente', () => resolver1(elemento('x1', {naPalavra: 'dólar'})), '[x1]', 'não aparece');
erro(
  'ocorrência além do total',
  () => resolver1(elemento('x2', {naPalavra: 'juro', ocorrencia: 9})),
  '[x2]',
  'aparece 3 vez(es)',
  '9ª',
);
erro(
  'ocorrência inválida (0)',
  () => resolver1(elemento('x3', {naPalavra: 'juro', ocorrencia: 0})),
  '[x3]',
  'inteiro maior ou igual a 1',
);
erro(
  'naPalavra + inicio juntos',
  () => resolver1(elemento('x4', {naPalavra: 'juro', inicio: '0:03'})),
  '[x4]',
  '"naPalavra" e "inicio" ao mesmo tempo',
);
erro('naPalavra vazio', () => resolver1(elemento('x5', {naPalavra: '  '})), '[x5]', 'precisa ser uma palavra');
erro(
  'frase (mais de uma palavra)',
  () => resolver1(elemento('x6', {naPalavra: 'juro cai'})),
  '[x6]',
  'mais de uma palavra',
);
erro(
  'vários erros saem juntos, cada um com seu id',
  () =>
    resolverPlano(
      {video: 'x', elementos: [elemento('y1', {naPalavra: 'dólar'}), elemento('y2', {naPalavra: 'juro', ocorrencia: 9})]},
      PALAVRAS,
      PARES,
    ),
  '2 elemento(s)',
  '[y1]',
  '[y2]',
);
erro('plano sem elementos', () => resolverPlano({video: 'x'}, PALAVRAS, PARES), 'lista "elementos"');
erro('glossário inválido', () => resolverPlano({elementos: []}, PALAVRAS, ['a']), 'Glossário inválido');

// ---- naPalavra e ocorrencia saem; o resto fica; a ordem das chaves é mantida
{
  const el = elemento('z', {naPalavra: 'juro', ocorrencia: 2});
  delete el.id;
  el.id = 'z'; // id fica depois das outras chaves de propósito: a ordem deve ser a do original
  const novo = resolver1(el);
  igual('resolvido: naPalavra removido', 'naPalavra' in novo, false);
  igual('resolvido: ocorrencia removido', 'ocorrencia' in novo, false);
  igual('resolvido: inicio presente', novo.inicio, '0:05.4');
  const antes = Object.keys(el).filter((k) => k !== 'ocorrencia').map((k) => (k === 'naPalavra' ? 'inicio' : k));
  igual('resolvido: inicio ocupa o lugar do naPalavra', Object.keys(novo), antes);
  igual('resolvido: o resto do elemento igual', {...novo, inicio: undefined}, {...el, naPalavra: undefined, ocorrencia: undefined, inicio: undefined});
}

// ---- elemento sem naPalavra fica igual (inclusive o inicio escrito à mão)
{
  const a = elemento('manual', {inicio: '0:07.5'});
  const b = elemento('manual2', {inicio: '1:05'});
  const r = resolverPlano({video: 'x', elementos: [a, b]}, PALAVRAS, PARES);
  igual('sem naPalavra: elementos iguais', r.elementos, [a, b]);
}

// ---- o plano original não muda; a cópia não compartilha objetos
{
  const original = {
    video: 'x',
    orientacao: 'vertical',
    elementos: [elemento('o1', {naPalavra: 'juro', ocorrencia: 2}), elemento('o2', {inicio: '0:09'})],
    camera: [{id: 'c1', inicio: '0:00', duracao: 3}],
  };
  const instantaneo = JSON.stringify(original);
  const r = resolverPlano(original, PALAVRAS, PARES);
  igual('original: não foi alterado', JSON.stringify(original), instantaneo);
  igual('original: copia é outro objeto', r === original, false);
  igual('original: elementos é outra lista', r.elementos === original.elementos, false);
  igual('original: elemento resolvido é outro objeto', r.elementos[0] === original.elementos[0], false);
  igual('original: elemento comum não é o mesmo objeto', r.elementos[1] === original.elementos[1], false);
  igual('original: camera copiada igual', r.camera, original.camera);
  igual('original: camera é outra lista', r.camera === original.camera, false);
  // as palavras e o glossário também não mudam
  const pal = JSON.stringify(PALAVRAS);
  const par = JSON.stringify(PARES);
  resolverPlano(original, PALAVRAS, PARES);
  igual('palavras: não foram alteradas', JSON.stringify(PALAVRAS), pal);
  igual('glossário: não foi alterado', JSON.stringify(PARES), par);
}

// ---- critério 4.2: o inicio resolvido passa pelo criarParaFrameCortado (com gancho)
{
  // "m:ss.d" -> segundos (a mesma conta do paraSegundos do PlanoComposicao.tsx).
  const segundos = (txt) => {
    const m = /^(\d+):(\d{2})\.(\d)$/.exec(txt);
    return Number(m[1]) * 60 + Number(m[2]) + Number(m[3]) / 10;
  };
  // Original: A [0,10] · C [12,20] · G [30,35] vira gancho e vai para o início.
  // Vídeo cortado: G 0–5 s, A 5–15 s, C 15–23 s.
  const trechos = [
    {inicio: 30, fim: 35, gancho: 1},
    {inicio: 0, fim: 10},
    {inicio: 12, fim: 20},
  ];
  const paraFrame = criarParaFrameCortado(trechos, FPS);
  const palavras = [p(' alfa', 2500, 2800), p(' beta', 12345, 12800), p(' gama', 31200, 31600)];
  const plano = {
    video: 'x',
    elementos: [
      elemento('na-A', {naPalavra: 'alfa'}),
      elemento('na-C', {naPalavra: 'beta'}),
      elemento('no-gancho', {naPalavra: 'gama'}),
    ],
  };
  const r = resolverPlano(plano, palavras, {});
  igual('4.2: inicios resolvidos', r.elementos.map((e) => e.inicio), ['0:02.5', '0:12.3', '0:31.2']);
  igual('4.2: alfa em A -> 5 + 2,5 s = frame 225', paraFrame(segundos(r.elementos[0].inicio)), 225);
  igual('4.2: beta (12345 ms, arredondado p/ 12,3) em C -> 15 + 0,3 s = frame 459', paraFrame(segundos(r.elementos[1].inicio)), 459);
  igual('4.2: gama dentro do gancho -> 1,2 s = frame 36', paraFrame(segundos(r.elementos[2].inicio)), 36);
}

// ---- plano resolvido passa pelo validador (e o não resolvido NÃO passa)
{
  const pasta = mkdtempSync(path.join(os.tmpdir(), 'resolver-plano-'));
  const rodarValidador = (plano, nome) => {
    const arquivo = path.join(pasta, nome);
    writeFileSync(arquivo, JSON.stringify(plano, null, 2));
    try {
      const saida = execFileSync(process.execPath, [VALIDADOR, arquivo], {cwd: RAIZ, encoding: 'utf8'});
      return {codigo: 0, saida};
    } catch (e) {
      return {codigo: e.status ?? 1, saida: (e.stdout ?? '') + (e.stderr ?? '')};
    }
  };
  try {
    const plano = {
      video: 'fixture',
      orientacao: 'vertical',
      elementos: [
        elemento('v1', {naPalavra: 'juro', ocorrencia: 2}),
        elemento('v2', {naPalavra: 'fim', slot: 2}),
      ],
    };
    const antes = rodarValidador(plano, 'nao-resolvido.plano.json');
    igual('validador: plano NÃO resolvido dá exit 1', antes.codigo, 1);
    igual(
      'validador: mensagem pede o resolvedor',
      antes.saida.includes('naPalavra ainda não resolvido: rode scripts/resolver-plano.mjs antes'),
      true,
    );
    const resolvido = resolverPlano(plano, PALAVRAS, PARES);
    const depois = rodarValidador(resolvido, 'resolvido.plano.json');
    igual('validador: plano resolvido dá exit 0', depois.codigo, 0);
    igual('validador: 0 erro(s), 0 aviso(s)', depois.saida.includes('Resumo: 0 erro(s), 0 aviso(s)'), true);
  } finally {
    rmSync(pasta, {recursive: true, force: true});
  }
}

// ---- legendaPalavras / destaques -> props.palavrasMs (etapa B3 do 4.5)
{
  const leg = (id, extra = {}) => ({
    ...elemento(id),
    componente: 'LegendaAnimada',
    inicio: '0:01.0',
    duracao: 5,
    props: {tamanhoFonte: 0.07},
    ...extra,
  });
  const resolverLeg = (el, palavras = PALAVRAS, pares = PARES) =>
    resolverPlano({video: 'x', elementos: [el]}, palavras, pares).elementos[0];

  // intervalo com 3 palavras (juro 1000, cai. 1500, O 2200; o 2º juro, 5450, fica de fora)
  const tres = resolverLeg(leg('l1', {legendaPalavras: {de: '0:01.0', ate: '0:05.4'}}));
  igual('legenda: 3 palavras no intervalo', tres.props.palavrasMs, [
    {texto: 'juro', inicioMs: 1000, fimMs: 1500},
    {texto: 'cai.', inicioMs: 1500, fimMs: 2200},
    {texto: 'O', inicioMs: 2200, fimMs: 2400},
  ]);
  igual('legenda: texto sem espaço nas pontas', tres.props.palavrasMs.every((w) => w.texto === w.texto.trim()), true);
  igual('legenda: legendaPalavras removido', 'legendaPalavras' in tres, false);
  igual('legenda: destaques removido', 'destaques' in tres, false);
  igual('legenda: outras props mantidas', tres.props.tamanhoFonte, 0.07);
  igual('legenda: inicio do elemento mantido', tres.inicio, '0:01.0');

  // glossário aplicado antes: "eipô" sai como "Apple"
  igual(
    'legenda: glossário aplicado',
    resolverLeg(leg('l2', {legendaPalavras: {de: '0:12.0', ate: '0:13.0'}})).props.palavrasMs,
    [{texto: 'Apple', inicioMs: 12300, fimMs: 12800}],
  );
  igual(
    'legenda: sem glossário fica a palavra bruta',
    resolverLeg(leg('l2b', {legendaPalavras: {de: '0:12.0', ate: '0:13.0'}}), PALAVRAS, {}).props.palavrasMs[0].texto,
    'eipô',
  );

  // destaque com acento e maiúscula (e pontuação do "cai."); só as coincidentes ganham destaque: true
  igual(
    'legenda: destaques normalizados (JURO, Caí)',
    resolverLeg(leg('l3', {legendaPalavras: {de: '0:01.0', ate: '0:05.4'}, destaques: ['JURO', 'Caí']})).props.palavrasMs.map((w) => w.destaque),
    [true, true, undefined],
  );
  igual(
    'legenda: destaque pela forma corrigida pelo glossário (APPLE)',
    resolverLeg(leg('l3b', {legendaPalavras: {de: '0:12.0', ate: '0:13.0'}, destaques: ['APPLE']})).props.palavrasMs[0].destaque,
    true,
  );
  igual(
    'legenda: destaques vazio não marca ninguém',
    resolverLeg(leg('l3c', {legendaPalavras: {de: '0:01.0', ate: '0:02.0'}, destaques: []})).props.palavrasMs.some((w) => 'destaque' in w),
    false,
  );

  // limites inclusivos: startMs 1000 (juro) e 1500 (cai.) entram com de=1,0 e ate=1,5
  igual(
    'legenda: limites inclusivos nos dois lados',
    resolverLeg(leg('l4', {legendaPalavras: {de: '0:01.0', ate: '0:01.5'}})).props.palavrasMs.map((w) => w.inicioMs),
    [1000, 1500],
  );
  igual(
    'legenda: ate 0:01.4 deixa cai. (1500) de fora',
    resolverLeg(leg('l4b', {legendaPalavras: {de: '0:01.0', ate: '0:01.4'}})).props.palavrasMs.map((w) => w.inicioMs),
    [1000],
  );
  igual(
    'legenda: de 0:01.1 deixa juro (1000) de fora',
    resolverLeg(leg('l4c', {legendaPalavras: {de: '0:01.1', ate: '0:02.0'}})).props.palavrasMs.map((w) => w.inicioMs),
    [1500],
  );
  igual(
    'legenda: "m:ss" sem décimo também vale',
    resolverLeg(leg('l4d', {legendaPalavras: {de: '0:01', ate: '0:02'}})).props.palavrasMs.map((w) => w.inicioMs),
    [1000, 1500],
  );

  // endMs < startMs usa startMs; texto vazio é descartado
  igual(
    'legenda: endMs < startMs vira startMs; texto vazio some',
    resolverLeg(leg('l5', {legendaPalavras: {de: '0:00.0', ate: '0:03.0'}}), [p(' x', 1000, 500), p('  ', 2000, 2100), p(' y', 2500, 2600)], {}).props.palavrasMs,
    [{texto: 'x', inicioMs: 1000, fimMs: 1000}, {texto: 'y', inicioMs: 2500, fimMs: 2600}],
  );

  // componente em lista: palavrasMs vai em props.LegendaAnimada
  {
    const lista = resolverLeg({
      ...leg('l6'),
      componente: ['LegendaDiscreta', 'LegendaAnimada'],
      props: {LegendaDiscreta: {texto: 'oi'}, LegendaAnimada: {tamanhoFonte: 0.05}},
      legendaPalavras: {de: '0:12.0', ate: '0:13.0'},
    });
    igual('legenda: componente em lista', lista.props.LegendaAnimada.palavrasMs[0].texto, 'Apple');
    igual('legenda: lista mantém as outras props', [lista.props.LegendaDiscreta, lista.props.LegendaAnimada.tamanhoFonte], [{texto: 'oi'}, 0.05]);
  }

  // convive com naPalavra no mesmo elemento
  {
    const duplo = resolverLeg(leg('l7', {inicio: undefined, naPalavra: 'juro', ocorrencia: 2, legendaPalavras: {de: '0:05.0', ate: '0:07.0'}}));
    igual('legenda: naPalavra + legendaPalavras', [duplo.inicio, duplo.props.palavrasMs.length, 'naPalavra' in duplo], ['0:05.4', 2, false]);
  }

  // erros, sempre com o id
  erro(
    'legenda: em componente que não é LegendaAnimada',
    () => resolverLeg(elemento('e1', {legendaPalavras: {de: '0:01.0', ate: '0:02.0'}})),
    '[e1]',
    'só vale em componente LegendaAnimada',
  );
  erro('legenda: "de" mal formado', () => resolverLeg(leg('e2', {legendaPalavras: {de: 'abc', ate: '0:02.0'}})), '[e2]', 'de mal formado');
  erro('legenda: "ate" mal formado (segundos 61)', () => resolverLeg(leg('e3', {legendaPalavras: {de: '0:01.0', ate: '0:61.0'}})), '[e3]', 'ate mal formado');
  erro('legenda: "de" ausente', () => resolverLeg(leg('e3b', {legendaPalavras: {ate: '0:02.0'}})), '[e3b]', 'de mal formado');
  erro('legenda: ate igual a de', () => resolverLeg(leg('e4', {legendaPalavras: {de: '0:02.0', ate: '0:02.0'}})), '[e4]', 'precisa ser depois');
  erro('legenda: ate antes de de', () => resolverLeg(leg('e4b', {legendaPalavras: {de: '0:03.0', ate: '0:02.0'}})), '[e4b]', 'precisa ser depois');
  erro('legenda: nenhuma palavra no intervalo', () => resolverLeg(leg('e5', {legendaPalavras: {de: '0:20.0', ate: '0:25.0'}})), '[e5]', 'nenhuma palavra entre 0:20.0 e 0:25.0');
  erro(
    'legenda: legendaPalavras E props.palavrasMs',
    () => resolverLeg(leg('e6', {legendaPalavras: {de: '0:01.0', ate: '0:02.0'}, props: {palavrasMs: [{texto: 'a', inicioMs: 0, fimMs: 1}]}})),
    '[e6]',
    'props.palavrasMs',
  );
  erro('legenda: destaques sem legendaPalavras', () => resolverLeg(leg('e7', {destaques: ['juro']})), '[e7]', '"destaques" sem "legendaPalavras"');
  erro('legenda: destaques inválido', () => resolverLeg(leg('e8', {legendaPalavras: {de: '0:01.0', ate: '0:02.0'}, destaques: 'juro'})), '[e8]', 'lista de palavras');
  erro('legenda: legendaPalavras não é objeto', () => resolverLeg(leg('e9', {legendaPalavras: '0:01.0'})), '[e9]', '"legendaPalavras" precisa ser');
  erro(
    'legenda: erros de elementos diferentes saem juntos',
    () => resolverPlano({video: 'x', elementos: [leg('f1', {legendaPalavras: {de: 'x', ate: '0:02.0'}}), leg('f2', {legendaPalavras: {de: '0:20.0', ate: '0:25.0'}})]}, PALAVRAS, PARES),
    '2 elemento(s)',
    '[f1]',
    '[f2]',
  );

  // entrada não alterada; saída não compartilha objetos com a entrada
  {
    const original = {
      video: 'x',
      elementos: [leg('n1', {legendaPalavras: {de: '0:01.0', ate: '0:05.4'}, destaques: ['juro']})],
    };
    const antes = JSON.stringify(original);
    const pal = JSON.stringify(PALAVRAS);
    const r = resolverPlano(original, PALAVRAS, PARES);
    igual('legenda: plano de entrada não foi alterado', JSON.stringify(original), antes);
    igual('legenda: palavras de entrada não foram alteradas', JSON.stringify(PALAVRAS), pal);
    igual('legenda: props da saída é outro objeto', r.elementos[0].props === original.elementos[0].props, false);
    igual('legenda: entrada ainda sem palavrasMs', 'palavrasMs' in original.elementos[0].props, false);
  }

  // o plano resolvido (com palavrasMs) no validador: só mostramos o resultado, sem exigir
  // um veredito aqui (o que o validador faz com palavrasMs é informação, ver relatório).
  {
    const pasta = mkdtempSync(path.join(os.tmpdir(), 'resolver-legenda-'));
    try {
      const arquivo = path.join(pasta, 'legenda.plano.json');
      const plano = {
        video: 'fixture',
        orientacao: 'vertical',
        elementos: [leg('v-leg', {legendaPalavras: {de: '0:01.0', ate: '0:05.4'}, destaques: ['juro']})],
      };
      writeFileSync(arquivo, JSON.stringify(resolverPlano(plano, PALAVRAS, PARES), null, 2));
      const r = spawnSync(process.execPath, [VALIDADOR, arquivo], {cwd: RAIZ, encoding: 'utf8'});
      if (process.env.MOSTRAR_VALIDADOR) console.log((r.stdout ?? '') + (r.stderr ?? ''));
      igual('legenda: validador roda sem travar (exit 0 ou 1)', [0, 1].includes(r.status), true);
    } finally {
      rmSync(pasta, {recursive: true, force: true});
    }
  }
}

// ---- B3b: legenda preenche inicio e duracao; avisos opcionais
{
  // Elemento SEM inicio e SEM duracao (só o que o autor precisa escrever).
  const semTempo = (id, extra = {}) => {
    const base = elemento(id);
    delete base.duracao;
    return {...base, componente: 'LegendaAnimada', props: {tamanhoFonte: 0.07}, ...extra};
  };
  const resolverB = (el, opcoes) => resolverPlano({video: 'x', elementos: [el]}, PALAVRAS, PARES, opcoes).elementos[0];
  const L = {de: '0:01.0', ate: '0:05.4'};

  // preenche inicio = de e duracao = ate - de (segundos)
  const pre = resolverB(semTempo('t1', {legendaPalavras: L}));
  igual('B3b: inicio = de', pre.inicio, '0:01.0');
  igual('B3b: duracao = ate - de (4,4 s)', pre.duracao, 4.4);
  igual('B3b: duracao é número', typeof pre.duracao, 'number');
  igual('B3b: sem duracaoFrames criado', 'duracaoFrames' in pre, false);

  // mantém o que o elemento trouxe
  const mant = resolverB(semTempo('t2', {legendaPalavras: L, inicio: '0:00.5', duracao: 9}));
  igual('B3b: mantém inicio do elemento', mant.inicio, '0:00.5');
  igual('B3b: mantém duracao do elemento', mant.duracao, 9);

  // só inicio trazido: duracao ainda é preenchida; só duracao trazida: inicio ainda é preenchido
  igual('B3b: só inicio trazido -> duracao preenchida', resolverB(semTempo('t2b', {legendaPalavras: L, inicio: '0:00.5'})).duracao, 4.4);
  igual('B3b: só duracao trazida -> inicio preenchido', resolverB(semTempo('t2c', {legendaPalavras: L, duracao: 3})).inicio, '0:01.0');

  // duracaoFrames impede duracao (e é mantido)
  const df = resolverB(semTempo('t3', {legendaPalavras: L, duracaoFrames: 120}));
  igual('B3b: duracaoFrames impede duracao', ['duracao' in df, df.duracaoFrames], [false, 120]);
  igual('B3b: duracaoFrames não impede inicio', df.inicio, '0:01.0');

  // inicio vindo de naPalavra também conta como "trouxe inicio"
  const comNa = resolverB(semTempo('t3b', {naPalavra: 'juro', ocorrencia: 2, legendaPalavras: {de: '0:05.0', ate: '0:07.0'}}));
  igual('B3b: inicio de naPalavra mantido, duracao preenchida', [comNa.inicio, comNa.duracao], ['0:05.4', 2]);

  // avisos
  const avisos = [];
  const avisar = (a) => avisos.push(a);
  resolverB(semTempo('t4', {legendaPalavras: L, destaques: ['juro', 'dólar', 'Caí']}), {avisar});
  igual('B3b: aviso só do destaque sem acerto', avisos.length, 1);
  igual('B3b: aviso cita id, destaque e intervalo', ['[t4]', '"dólar"', '0:01.0', '0:05.4'].every((t) => avisos[0].includes(t)), true);

  avisos.length = 0;
  resolverB(semTempo('t5', {legendaPalavras: L, inicio: '0:02.0'}), {avisar});
  igual('B3b: aviso de inicio depois do de', avisos.length, 1);
  igual('B3b: aviso cita id e os dois tempos', ['[t5]', '0:02.0', '0:01.0'].every((t) => avisos[0].includes(t)), true);

  avisos.length = 0;
  resolverB(semTempo('t6', {legendaPalavras: L, inicio: '0:01.0'}), {avisar});
  resolverB(semTempo('t6b', {legendaPalavras: L, inicio: '0:00.5'}), {avisar});
  resolverB(semTempo('t6c', {legendaPalavras: L, destaques: ['juro']}), {avisar});
  igual('B3b: sem aviso quando inicio <= de e destaques casam', avisos, []);

  // sem o parâmetro opcional nada muda: mesmo resultado, sem erro
  const el7 = semTempo('t7', {legendaPalavras: L, destaques: ['dólar'], inicio: '0:03.0'});
  const sem = resolverPlano({video: 'x', elementos: [el7]}, PALAVRAS, PARES);
  const com = resolverPlano({video: 'x', elementos: [el7]}, PALAVRAS, PARES, {avisar: () => {}});
  const vazio = resolverPlano({video: 'x', elementos: [el7]}, PALAVRAS, PARES, {});
  igual('B3b: com e sem avisar devolvem o mesmo plano', [JSON.stringify(sem), JSON.stringify(vazio)], [JSON.stringify(com), JSON.stringify(com)]);

  // erro continua erro (e não emite aviso)
  avisos.length = 0;
  erro('B3b: erro continua sendo erro com avisar', () => resolverB(semTempo('t8', {legendaPalavras: {de: '0:20.0', ate: '0:25.0'}, destaques: ['x']}), {avisar}), '[t8]', 'nenhuma palavra');
  igual('B3b: erro não emite aviso', avisos, []);

  // entrada não alterada
  {
    const original = {video: 'x', elementos: [semTempo('t9', {legendaPalavras: L, destaques: ['dólar'], inicio: '0:02.0'})]};
    const antes = JSON.stringify(original);
    const r = resolverPlano(original, PALAVRAS, PARES, {avisar});
    igual('B3b: plano de entrada não foi alterado', JSON.stringify(original), antes);
    igual('B3b: entrada sem duracao continua sem', 'duracao' in original.elementos[0], false);
    igual('B3b: saída recebeu duracao', r.elementos[0].duracao, 4.4);
  }
}

// ---- linha de comando com --saida, numa pasta temporária do sistema (nada vai pra planos/)
{
  const RESOLVER = path.join(RAIZ, 'scripts', 'resolver-plano.mjs');
  const base = mkdtempSync(path.join(os.tmpdir(), 'resolver-cli-'));
  try {
    const nomePlano = `cli-teste-${process.pid}`;
    const arquivoPlano = path.join(base, `${nomePlano}.plano.json`);
    const arquivoPalavras = path.join(base, 'palavras.json');
    const arquivoGlossario = path.join(base, 'glossario.json');
    const pastaSaida = path.join(base, 'saida');
    mkdirSync(pastaSaida);
    writeFileSync(arquivoPlano, JSON.stringify({video: 'x', elementos: [elemento('cli-1', {naPalavra: 'juro', ocorrencia: 2})]}));
    writeFileSync(arquivoPalavras, JSON.stringify(PALAVRAS));
    writeFileSync(arquivoGlossario, JSON.stringify({pares: PARES}));
    const resultado = path.join(pastaSaida, `${nomePlano}.resolvido.json`);
    const foraDeSaida = path.join(RAIZ, 'planos', `${nomePlano}.resolvido.json`);
    const basicos = ['--plano', arquivoPlano, '--palavras', arquivoPalavras, '--glossario', arquivoGlossario];

    const cli = (...extra) => {
      const r = spawnSync(process.execPath, [RESOLVER, ...basicos, ...extra], {cwd: RAIZ, encoding: 'utf8'});
      return {codigo: r.status, saida: (r.stdout ?? '') + (r.stderr ?? '')};
    };

    // 1. grava com --saida
    const a = cli('--saida', pastaSaida);
    igual('CLI --saida: exit 0', a.codigo, 0);
    igual('CLI --saida: arquivo gravado na pasta', existsSync(resultado), true);
    igual('CLI --saida: nada gravado em planos/', existsSync(foraDeSaida), false);
    const gravado = JSON.parse(readFileSync(resultado, 'utf8'));
    igual('CLI --saida: inicio resolvido', gravado.elementos[0].inicio, '0:05.4');
    igual('CLI --saida: naPalavra e ocorrencia saíram', ['naPalavra' in gravado.elementos[0], 'ocorrencia' in gravado.elementos[0]], [false, false]);
    igual('CLI --saida: a saída diz o que gravou', a.saida.includes('1 elemento(s) resolvido(s)'), true);

    // 2. não sobrescreve sem --refazer (um texto-marca no arquivo prova que ele não foi tocado)
    writeFileSync(resultado, 'MARCA');
    const b = cli('--saida', pastaSaida);
    igual('CLI sem --refazer: exit 1', b.codigo, 1);
    igual('CLI sem --refazer: mensagem', b.saida.includes('Já existe') && b.saida.includes('--refazer'), true);
    igual('CLI sem --refazer: arquivo intocado', readFileSync(resultado, 'utf8'), 'MARCA');

    // 3. sobrescreve com --refazer
    const c = cli('--saida', pastaSaida, '--refazer');
    igual('CLI --refazer: exit 0', c.codigo, 0);
    igual('CLI --refazer: arquivo regravado', JSON.parse(readFileSync(resultado, 'utf8')).elementos[0].inicio, '0:05.4');

    // 4. pasta inexistente dá erro e exit 1, e a pasta não é criada
    const inexistente = path.join(base, 'nao-existe');
    const d = cli('--saida', inexistente);
    igual('CLI pasta inexistente: exit 1', d.codigo, 1);
    igual('CLI pasta inexistente: mensagem clara', d.saida.includes('A pasta de --saida não existe'), true);
    igual('CLI pasta inexistente: não foi criada', existsSync(inexistente), false);

    // 5. --saida apontando para um arquivo
    const e = cli('--saida', arquivoPalavras);
    igual('CLI --saida é arquivo: exit 1', e.codigo, 1);
    igual('CLI --saida é arquivo: mensagem', e.saida.includes('não é uma pasta'), true);

    // 6. --saida sem valor
    const f = cli('--saida');
    igual('CLI --saida sem valor: exit 1', f.codigo, 1);

    // 6b. legendaPalavras pela CLI: grava props.palavrasMs e diz quantas palavras
    {
      const nomeLeg = `cli-legenda-${process.pid}`;
      const planoLeg = path.join(base, `${nomeLeg}.plano.json`);
      writeFileSync(
        planoLeg,
        JSON.stringify({
          video: 'x',
          elementos: [
            {id: 'cli-leg', componente: 'LegendaAnimada', inicio: '0:01.0', duracao: 5, props: {}, legendaPalavras: {de: '0:01.0', ate: '0:05.4'}, destaques: ['juro']},
          ],
        }),
      );
      const g = spawnSync(
        process.execPath,
        [RESOLVER, '--plano', planoLeg, '--palavras', arquivoPalavras, '--glossario', arquivoGlossario, '--saida', pastaSaida],
        {cwd: RAIZ, encoding: 'utf8'},
      );
      const saidaLeg = (g.stdout ?? '') + (g.stderr ?? '');
      igual('CLI legenda: exit 0', g.status, 0);
      const el = JSON.parse(readFileSync(path.join(pastaSaida, `${nomeLeg}.resolvido.json`), 'utf8')).elementos[0];
      igual('CLI legenda: palavrasMs gravado (3 palavras, juro em destaque)', [el.props.palavrasMs.length, el.props.palavrasMs[0]], [3, {texto: 'juro', inicioMs: 1000, fimMs: 1500, destaque: true}]);
      igual('CLI legenda: legendaPalavras e destaques saíram', ['legendaPalavras' in el, 'destaques' in el], [false, false]);
      igual('CLI legenda: a saída conta as palavras', saidaLeg.includes('3 palavra(s)'), true);
      igual('CLI legenda: plano de entrada não foi alterado', JSON.parse(readFileSync(planoLeg, 'utf8')).elementos[0].legendaPalavras, {de: '0:01.0', ate: '0:05.4'});
    }

    // 6c. B3b pela CLI: elemento sem inicio e sem duracao + avisos impressos
    {
      const nomeB = `cli-legenda-b3b-${process.pid}`;
      const planoB = path.join(base, `${nomeB}.plano.json`);
      writeFileSync(
        planoB,
        JSON.stringify({
          video: 'x',
          elementos: [
            {id: 'b-sem-tempo', componente: 'LegendaAnimada', props: {}, legendaPalavras: {de: '0:01.0', ate: '0:05.4'}, destaques: ['dólar']},
            {id: 'b-tarde', componente: 'LegendaAnimada', inicio: '0:02.0', duracao: 3, props: {}, legendaPalavras: {de: '0:01.0', ate: '0:05.4'}},
          ],
        }),
      );
      const h = spawnSync(
        process.execPath,
        [RESOLVER, '--plano', planoB, '--palavras', arquivoPalavras, '--glossario', arquivoGlossario, '--saida', pastaSaida],
        {cwd: RAIZ, encoding: 'utf8'},
      );
      const saidaB = (h.stdout ?? '') + (h.stderr ?? '');
      igual('CLI B3b: exit 0', h.status, 0);
      const els = JSON.parse(readFileSync(path.join(pastaSaida, `${nomeB}.resolvido.json`), 'utf8')).elementos;
      igual('CLI B3b: inicio e duracao preenchidos', [els[0].inicio, els[0].duracao], ['0:01.0', 4.4]);
      igual('CLI B3b: valores do elemento mantidos', [els[1].inicio, els[1].duracao], ['0:02.0', 3]);
      igual('CLI B3b: aviso do destaque impresso', saidaB.includes('AVISO: [b-sem-tempo] destaque "dólar"'), true);
      igual('CLI B3b: aviso do inicio tardio impresso', saidaB.includes('AVISO: [b-tarde]') && saidaB.includes('depois do "de"'), true);
      igual('CLI B3b: aviso não vai para o arquivo', JSON.stringify(els).includes('AVISO'), false);
    }

    // 7. sem --saida o caminho continua planos/ (só o caminho montado, nada gravado lá)
    igual(
      'caminho sem --saida: planos/<nome>.resolvido.json',
      path.resolve(montarCaminhoSaida(path.join('qualquer', 'pasta', '0926.plano.json'))),
      path.resolve(RAIZ, 'planos', '0926.resolvido.json'),
    );
    igual('caminho sem ".plano" no nome', path.basename(montarCaminhoSaida('x/y.json')), 'y.resolvido.json');
    igual(
      'caminho com --saida: dentro da pasta',
      path.resolve(montarCaminhoSaida('x/0926.plano.json', pastaSaida)),
      path.resolve(pastaSaida, '0926.resolvido.json'),
    );
    igual('nada foi gravado em planos/ pelos testes da CLI', existsSync(foraDeSaida), false);
  } finally {
    rmSync(base, {recursive: true, force: true});
  }
}

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
