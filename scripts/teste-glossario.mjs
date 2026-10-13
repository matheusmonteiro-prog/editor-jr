// Teste do glossário no scripts/transcrever.mjs (critério 4.4 da Etapa 4).
// Rodar: node scripts/teste-glossario.mjs
// Imprime "OK" ou lista as falhas (e sai com código 1).
//
// Não roda o Whisper, não lê videos/ e não grava nada no projeto: a lista de palavras é pequena
// e está escrita aqui dentro. Os arquivos de glossário usados nos casos de erro ficam numa pasta
// temporária do sistema, apagada no fim.
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {corrigirPalavras, lerGlossario, textoCompacto} from './transcrever.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Uma frase curta com a palavra errada " eipô," (como o Whisper escreveu: espaço na frente e
// pontuação colada). Tempos e confianças inventados, só para conferir que não mudam.
const BRUTA = [
  {text: ' ele', startMs: 0, endMs: 300, timestampMs: 100, confidence: 0.91},
  {text: ' comprou', startMs: 300, endMs: 900, timestampMs: 640, confidence: 0.82},
  {text: ' uma', startMs: 900, endMs: 1100, timestampMs: 950, confidence: 0.77},
  {text: ' ação', startMs: 1100, endMs: 1700, timestampMs: 1320, confidence: 0.88},
  {text: ' da', startMs: 1700, endMs: 1900, timestampMs: 1750, confidence: 0.95},
  {text: ' eipô,', startMs: 1900, endMs: 2500, timestampMs: 2310, confidence: 0.31},
  {text: ' e', startMs: 2500, endMs: 2600, timestampMs: 2540, confidence: 0.6},
  {text: ' gostou.', startMs: 2600, endMs: 3400, timestampMs: 3100, confidence: 0.93},
];
const PARES = {eipô: 'Apple'};

const falhas = [];
let total = 0;

const igual = (nome, obtido, esperado) => {
  total++;
  const a = JSON.stringify(obtido);
  const b = JSON.stringify(esperado);
  if (a !== b) falhas.push(`${nome}: obtido ${a}, esperado ${b}`);
};

const erro = (nome, fn, trecho) => {
  total++;
  try {
    fn();
    falhas.push(`${nome}: esperava erro, mas não deu`);
  } catch (e) {
    if (!e.message.includes(trecho)) falhas.push(`${nome}: mensagem "${e.message}" não contém "${trecho}"`);
  }
};

// ---- o glossário troca o texto da palavra
{
  const bruta = BRUTA.map((p) => Object.freeze({...p}));
  Object.freeze(bruta); // congelada: qualquer alteração na lista bruta dá erro
  const antes = JSON.stringify(bruta);

  const {palavras, trocadas} = corrigirPalavras(bruta, PARES);

  igual('troca o texto da palavra errada', palavras[5].text, ' Apple,');
  igual('conta 1 palavra trocada', trocadas, 1);
  igual('as outras palavras ficam iguais', palavras.filter((_, i) => i !== 5).map((p) => p.text), bruta.filter((_, i) => i !== 5).map((p) => p.text));

  // startMs, endMs, timestampMs e confidence NÃO mudam, em nenhuma palavra
  for (const campo of ['startMs', 'endMs', 'timestampMs', 'confidence']) {
    igual(`${campo} não muda`, palavras.map((p) => p[campo]), bruta.map((p) => p[campo]));
  }

  // a lista bruta não é alterada, e a nova não é a mesma lista nem divide objetos com ela
  igual('lista bruta não é alterada', JSON.stringify(bruta), antes);
  igual('lista corrigida é outra lista', palavras === bruta, false);
  igual('objeto da palavra trocada é novo', palavras[5] === bruta[5], false);

  // ---- a linha do .txt sai corrigida
  const comGlossario = textoCompacto(palavras);
  igual('linha do .txt sai corrigida', comGlossario.texto, '0:00 ele comprou uma ação da Apple, e gostou.\n');
  igual('a palavra errada não aparece no .txt corrigido', comGlossario.texto.includes('eipô'), false);

  // ---- sem glossário, o .txt sai como antes
  const semGlossario = textoCompacto(bruta);
  igual('sem glossário o .txt sai como antes', semGlossario.texto, '0:00 ele comprou uma ação da eipô, e gostou.\n');
  igual('mesmo nº de linhas com e sem glossário', comGlossario.linhas, semGlossario.linhas);
  igual('mesmo tempo no início da linha', comGlossario.texto.split(' ')[0], semGlossario.texto.split(' ')[0]);
}

// ---- chave com maiúscula e sem acento também casa; a pontuação colada é mantida
{
  const {palavras, trocadas} = corrigirPalavras(BRUTA, {EIPO: 'Apple'});
  igual('chave em maiúscula e sem acento casa', palavras[5].text, ' Apple,');
  igual('conta 1 troca', trocadas, 1);
}

// ---- glossário vazio ou sem acerto: nada muda
{
  const vazio = corrigirPalavras(BRUTA, {});
  igual('glossário vazio: 0 trocadas', vazio.trocadas, 0);
  igual('glossário vazio: texto igual', textoCompacto(vazio.palavras).texto, textoCompacto(BRUTA).texto);
  const semAcerto = corrigirPalavras(BRUTA, {selic: 'Selic'});
  igual('par que não acha nada: 0 trocadas', semAcerto.trocadas, 0);
}

// ---- pares inválidos
erro('pares que é lista', () => corrigirPalavras(BRUTA, ['a']), 'Glossário inválido');
erro('valor vazio', () => corrigirPalavras(BRUTA, {eipô: ' '}), 'Glossário inválido');

// ---- lerGlossario: arquivo inexistente, formato certo e formatos errados
const pasta = mkdtempSync(path.join(os.tmpdir(), 'teste-glossario-'));
try {
  const arq = (nome, conteudo) => {
    const caminho = path.join(pasta, nome);
    writeFileSync(caminho, typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo));
    return caminho;
  };

  igual('arquivo que não existe devolve null', lerGlossario(path.join(pasta, 'nao-existe.json')), null);
  igual(
    'formato certo (com _comentario)',
    lerGlossario(arq('certo.json', {_comentario: 'x', pares: {eipô: 'Apple'}})),
    {eipô: 'Apple'},
  );
  igual('formato certo (sem _comentario)', lerGlossario(arq('sem-comentario.json', {pares: {a: 'b'}})), {a: 'b'});
  erro('JSON quebrado', () => lerGlossario(arq('quebrado.json', '{ "pares": ')), 'não é um JSON válido');
  erro('sem o campo pares', () => lerGlossario(arq('sem-pares.json', {eipô: 'Apple'})), 'precisa ter');
  erro('pares que é lista', () => lerGlossario(arq('pares-lista.json', {pares: ['a']})), 'precisa ter');
  erro('pares nulo', () => lerGlossario(arq('pares-nulo.json', {pares: null})), 'precisa ter');
} finally {
  rmSync(pasta, {recursive: true, force: true});
}

// ---- o glossario.json de verdade, na raiz do projeto
{
  const caminho = path.join(RAIZ, 'glossario.json');
  const bruto = JSON.parse(readFileSync(caminho, 'utf8'));
  igual('glossario.json real: lê os pares', lerGlossario(caminho), bruto.pares);
  igual('glossario.json real: par de exemplo "eipô" -> "Apple"', bruto.pares['eipô'], 'Apple');
  igual('glossario.json real: marcado como EXEMPLO no _comentario', /EXEMPLO/.test(bruto._comentario ?? ''), true);
  // nenhum caminho dentro do arquivo
  igual('glossario.json real: sem caminho', /[A-Za-z]:[\\/]|\/Users\//.test(readFileSync(caminho, 'utf8')), false);
}

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
