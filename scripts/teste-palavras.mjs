// Teste do scripts/palavras.mjs (critério 4.3/4.4 da Etapa 4).
// Rodar: node scripts/teste-palavras.mjs
// Imprime "OK" ou lista as falhas (e sai com código 1).
//
// A lista abaixo são as 15 PRIMEIRAS palavras do videos/teste-jr.palavras.json (valores reais,
// copiados em 13/10/2026), escritas aqui dentro para o teste rodar em qualquer PC, sem o arquivo.
import {aplicarGlossario, acharPalavra, normalizar, ErroPalavras} from './palavras.mjs';

const PALAVRAS = [
  {text: 'é', startMs: 0, endMs: 450, timestampMs: 620, confidence: 0.370372},
  {text: ' comprar', startMs: 450, endMs: 950, timestampMs: 980, confidence: 0.976608},
  {text: ' empresas', startMs: 950, endMs: 1800, timestampMs: 1460, confidence: 0.942651},
  {text: ' boas', startMs: 1800, endMs: 2220, timestampMs: 1880, confidence: 0.961786},
  {text: ' pelo', startMs: 2220, endMs: 2750, timestampMs: 2280, confidence: 0.880313},
  {text: ' preço', startMs: 2750, endMs: 3270, timestampMs: 2560, confidence: 0.915886},
  {text: ' certo', startMs: 3270, endMs: 3840, timestampMs: 3200, confidence: 0.99469},
  {text: ' pra', startMs: 3840, endMs: 4430, timestampMs: 4560, confidence: 0.435013},
  {text: ' longo', startMs: 4430, endMs: 4750, timestampMs: 4820, confidence: 0.824646},
  {text: ' prazo.', startMs: 4750, endMs: 5400, timestampMs: 5120, confidence: 0.986088},
  {text: ' Se', startMs: 5400, endMs: 5490, timestampMs: 5460, confidence: 0.116565},
  {text: ' você', startMs: 5490, endMs: 5710, timestampMs: 5620, confidence: 0.941702},
  {text: ' comprar', startMs: 5710, endMs: 6020, timestampMs: 5760, confidence: 0.824414},
  {text: ' uma', startMs: 6020, endMs: 6150, timestampMs: 5880, confidence: 0.450133},
  {text: ' medalha', startMs: 6150, endMs: 6460, timestampMs: 6080, confidence: 0.148929},
];

const falhas = [];
let total = 0;

const igual = (nome, obtido, esperado) => {
  total++;
  const a = JSON.stringify(obtido);
  const b = JSON.stringify(esperado);
  if (a !== b) falhas.push(`${nome}: obtido ${a}, esperado ${b}`);
};

// Espera um ErroPalavras cuja mensagem contenha `trecho`.
const erro = (nome, fn, trecho) => {
  total++;
  try {
    fn();
    falhas.push(`${nome}: esperava erro, mas não deu`);
  } catch (e) {
    if (!(e instanceof ErroPalavras)) falhas.push(`${nome}: erro de tipo errado (${e?.constructor?.name}): ${e?.message}`);
    else if (!e.message.includes(trecho)) falhas.push(`${nome}: mensagem "${e.message}" não contém "${trecho}"`);
  }
};

// ---- normalizar
igual('normalizar acento+maiúscula', normalizar(' Preço '), 'preco');
igual('normalizar pontuação colada', normalizar(' prazo.'), 'prazo');
igual('normalizar maiúscula com acento', normalizar('ÉPOCA!'), 'epoca');
igual('normalizar pontuação dos dois lados', normalizar('"Olá,"'), 'ola');
igual('normalizar vazio', normalizar('   '), '');
igual('normalizar não-texto', normalizar(undefined), '');
igual('normalizar mantém hífen no meio', normalizar('guarda-chuva.'), 'guarda-chuva');

// ---- espaço nas pontas (o text do Whisper vem com espaço na FRENTE)
// A lista de teste tem os dois tipos: 14 palavras com espaço na frente e 1 sem (a "é").
igual('lista de teste: palavras com espaço na frente', PALAVRAS.filter((p) => /^\s/.test(p.text)).length, 14);
igual('lista de teste: palavras sem espaço na frente', PALAVRAS.filter((p) => !/^\s/.test(p.text)).map((p) => p.text), ['é']);
igual('normalizar tira espaço na frente', normalizar(' comprar'), 'comprar');
igual('normalizar tira espaço atrás', normalizar('comprar '), 'comprar');
igual('normalizar tira vários espaços', normalizar('   comprar   '), 'comprar');
igual('normalizar tira tab e quebra de linha', normalizar('\t comprar \n'), 'comprar');
igual('normalizar tira espaço não separável', normalizar(' comprar '), 'comprar');
igual('normalizar espaço + pontuação juntos', normalizar('  prazo. '), 'prazo');
igual('espaço no meio fica (é termo de 2 palavras)', normalizar(' longo prazo '), 'longo prazo');
// palavra COM espaço na frente (" comprar") é encontrada; o termo pode ter espaço também
igual('acha palavra com espaço na frente', acharPalavra(PALAVRAS, 'comprar').indice, 1);
igual('termo com espaço na frente e atrás', acharPalavra(PALAVRAS, '  comprar ', 2).indice, 12);
igual('palavra com espaço na frente + pontuação', acharPalavra(PALAVRAS, 'prazo').indice, 9);
// palavra SEM espaço na frente ("é", a primeira) também
igual('acha palavra sem espaço na frente', acharPalavra(PALAVRAS, 'é'), {indice: 0, startMs: 0, endMs: 450, total: 1});
igual('acha "é" sem acento (e/é ficam iguais)', acharPalavra(PALAVRAS, 'e').indice, 0);
// espaços estranhos no text, que o Whisper poderia entregar
{
  const estranhas = [
    {text: ' Selic', startMs: 100, endMs: 200, timestampMs: 150, confidence: 0.9},
    {text: '  juros  ', startMs: 200, endMs: 300, timestampMs: 250, confidence: 0.9},
    {text: '\tSelic.', startMs: 300, endMs: 400, timestampMs: 350, confidence: 0.9},
  ];
  igual('espaço não separável na frente', acharPalavra(estranhas, 'selic', 1), {indice: 0, startMs: 100, endMs: 200, total: 2});
  igual('2ª ocorrência com tab na frente e ponto', acharPalavra(estranhas, 'Selic', 2), {indice: 2, startMs: 300, endMs: 400, total: 2});
  igual('espaços dos dois lados', acharPalavra(estranhas, 'juros').indice, 1);
}

// ---- acharPalavra: repetida ("comprar" nos índices 1 e 12; posições 2 e 13)
igual('1ª ocorrência (padrão)', acharPalavra(PALAVRAS, 'comprar'), {indice: 1, startMs: 450, endMs: 950, total: 2});
igual('1ª ocorrência explícita', acharPalavra(PALAVRAS, 'comprar', 1), {indice: 1, startMs: 450, endMs: 950, total: 2});
igual('2ª ocorrência', acharPalavra(PALAVRAS, 'comprar', 2), {indice: 12, startMs: 5710, endMs: 6020, total: 2});
erro('3ª ocorrência não existe', () => acharPalavra(PALAVRAS, 'comprar', 3), 'aparece 2 vez(es); você pediu a 3ª');

// ---- acento e maiúscula
igual('acento no termo', acharPalavra(PALAVRAS, 'PREÇO'), {indice: 5, startMs: 2750, endMs: 3270, total: 1});
igual('sem acento no termo', acharPalavra(PALAVRAS, 'preco'), {indice: 5, startMs: 2750, endMs: 3270, total: 1});
igual('maiúscula no texto (" Se")', acharPalavra(PALAVRAS, 'se'), {indice: 10, startMs: 5400, endMs: 5490, total: 1});
igual('acento no texto (" você")', acharPalavra(PALAVRAS, 'voce'), {indice: 11, startMs: 5490, endMs: 5710, total: 1});

// ---- pontuação colada (" prazo.")
igual('termo sem ponto acha "prazo."', acharPalavra(PALAVRAS, 'prazo'), {indice: 9, startMs: 4750, endMs: 5400, total: 1});
igual('termo com ponto também', acharPalavra(PALAVRAS, 'prazo.'), {indice: 9, startMs: 4750, endMs: 5400, total: 1});

// ---- inexistente e ocorrencia inválida
erro('palavra inexistente', () => acharPalavra(PALAVRAS, 'selic'), 'não aparece');
erro('ocorrencia 0', () => acharPalavra(PALAVRAS, 'comprar', 0), 'inteiro maior ou igual a 1');
erro('ocorrencia negativa', () => acharPalavra(PALAVRAS, 'comprar', -1), 'inteiro maior ou igual a 1');
erro('ocorrencia não inteira', () => acharPalavra(PALAVRAS, 'comprar', 1.5), 'inteiro maior ou igual a 1');
erro('ocorrencia texto', () => acharPalavra(PALAVRAS, 'comprar', '2'), 'inteiro maior ou igual a 1');
erro('ocorrencia NaN', () => acharPalavra(PALAVRAS, 'comprar', NaN), 'inteiro maior ou igual a 1');
erro('termo vazio', () => acharPalavra(PALAVRAS, '  .  '), 'precisa ser uma palavra');
erro('termo com duas palavras', () => acharPalavra(PALAVRAS, 'longo prazo'), 'mais de uma palavra');
erro('lista que não é lista', () => acharPalavra(null, 'comprar'), 'deve ser uma lista');

// ---- glossário: troca texto, não muda tempo, não altera a original
{
  const original = PALAVRAS.map((p) => Object.freeze({...p})); // congelada: qualquer alteração dá erro
  Object.freeze(original);
  const instantaneo = JSON.stringify(original);

  const nova = aplicarGlossario(original, {'PRA': 'para', 'medalha': 'meta', 'prazo': 'período'});

  igual('glossário: lista nova tem o mesmo tamanho', nova.length, original.length);
  igual('glossário: " pra" vira " para" (mantém o espaço)', nova[7].text, ' para');
  igual('glossário: " medalha" vira " meta"', nova[14].text, ' meta');
  igual('glossário: " prazo." vira " período." (mantém a pontuação)', nova[9].text, ' período.');
  igual('glossário: palavra fora do glossário não muda', nova[1].text, ' comprar');

  // nenhum tempo nem confiança muda, em NENHUMA palavra
  const tempos = (l) => l.map((p) => [p.startMs, p.endMs, p.timestampMs, p.confidence]);
  igual('glossário: startMs/endMs/timestampMs/confidence idênticos', tempos(nova), tempos(original));

  // a original não foi tocada, e a lista nova não compartilha objetos com ela
  igual('glossário: a lista original ficou igual', JSON.stringify(original), instantaneo);
  igual('glossário: lista nova é outra lista', nova === original, false);
  igual('glossário: objetos novos (não os mesmos)', nova.some((p, i) => p === original[i]), false);

  // depois do glossário, a busca vê o texto corrigido
  igual('glossário: "para" agora é achado', acharPalavra(nova, 'para').indice, 7);
  erro('glossário: "pra" não existe mais', () => acharPalavra(nova, 'pra'), 'não aparece');
  igual('glossário: na original "pra" ainda existe', acharPalavra(original, 'pra').indice, 7);
}
igual('glossário vazio devolve cópia igual', JSON.stringify(aplicarGlossario(PALAVRAS, {})), JSON.stringify(PALAVRAS));
erro('glossário: pares inválidos (lista)', () => aplicarGlossario(PALAVRAS, ['a']), 'deve ser um objeto');
erro('glossário: pares nulos', () => aplicarGlossario(PALAVRAS, null), 'deve ser um objeto');
erro('glossário: valor vazio', () => aplicarGlossario(PALAVRAS, {pra: '  '}), 'texto não vazio');
erro('glossário: chave só pontuação', () => aplicarGlossario(PALAVRAS, {'...': 'x'}), 'fica vazia');

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
