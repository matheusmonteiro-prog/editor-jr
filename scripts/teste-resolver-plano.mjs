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
