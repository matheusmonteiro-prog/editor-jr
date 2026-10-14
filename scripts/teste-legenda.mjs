// Teste do src/utils/legenda.ts (converterPalavrasMs) com trechos sintéticos.
// Rodar: node scripts/teste-legenda.mjs
// Imprime "OK (N casos)" ou lista as falhas (e sai com código 1).
import { converterPalavrasMs } from '../src/utils/legenda.ts';
import { criarParaFrameCortado } from '../src/utils/tempoCortado.ts';

const FPS = 30;
const falhas = [];
let total = 0;

function igual(nome, obtido, esperado) {
  total++;
  const a = JSON.stringify(obtido);
  const b = JSON.stringify(esperado);
  if (a !== b) falhas.push(`${nome}: obtido ${a}, esperado ${b}`);
}

// Simples: A [0–10] e B [14–26]. Cortado: A 0–10 s (0–300), B 10–22 s (300–660).
const simples = [{ inicio: 0, fim: 10 }, { inicio: 14, fim: 26 }];
const pSimples = criarParaFrameCortado(simples, FPS);
const conv = (palavras, paraFrame, fromFrames = 0) =>
  converterPalavrasMs(palavras, { fromFrames, paraFrameCortado: paraFrame });

// 1. palavra dentro de trecho: 2 s → frame 60; 3 s → 90.
igual('dentro de trecho', conv([{ texto: 'boa', inicioMs: 2000, fimMs: 3000 }], pSimples),
  [{ texto: 'boa', inicioFrames: 60, fimFrames: 90, destaque: false }]);

// 2. palavra em silêncio cortado (11–13 s): cai no fim de A = começo de B (frame 300);
//    fim menor que 1 frame de duração → pelo menos inicio + 1.
igual('palavra no silencio cortado', conv([{ texto: 'eita', inicioMs: 11000, fimMs: 12000 }], pSimples),
  [{ texto: 'eita', inicioFrames: 300, fimFrames: 301, destaque: false }]);

// 2b. começa no silêncio e termina dentro de B (15 s → frame 330).
igual('comeca no silencio e termina em B', conv([{ texto: 'bom', inicioMs: 12500, fimMs: 15000 }], pSimples),
  [{ texto: 'bom', inicioFrames: 300, fimFrames: 330, destaque: false }]);

// 3. fim menor que início: fim vira início; duração mínima de 1 frame.
igual('fim menor que inicio', conv([{ texto: 'x', inicioMs: 5000, fimMs: 4000 }], pSimples),
  [{ texto: 'x', inicioFrames: 150, fimFrames: 151, destaque: false }]);

// 4. espaço na frente.
igual('espaco na frente', conv([{ texto: ' comprar', inicioMs: 1000, fimMs: 2000 }], pSimples),
  [{ texto: 'comprar', inicioFrames: 30, fimFrames: 60, destaque: false }]);
igual('espaco nas duas pontas', conv([{ texto: '  oi \n', inicioMs: 0, fimMs: 500 }], pSimples),
  [{ texto: 'oi', inicioFrames: 0, fimFrames: 15, destaque: false }]);

// 5. texto vazio / só espaço: descartado.
igual('texto vazio', conv([
  { texto: '', inicioMs: 0, fimMs: 500 },
  { texto: '   ', inicioMs: 500, fimMs: 900 },
  { texto: 'ok', inicioMs: 1000, fimMs: 1500 },
], pSimples), [{ texto: 'ok', inicioFrames: 30, fimFrames: 45, destaque: false }]);

// 6. lista fora de ordem: inicio nunca menor que o da anterior (a ordem da entrada é mantida).
igual('fora de ordem', conv([
  { texto: 'a', inicioMs: 5000, fimMs: 6000 },
  { texto: 'b', inicioMs: 2000, fimMs: 3000 }, // 60 → sobe para 150; fim 90 → inicio + 1
  { texto: 'c', inicioMs: 7000, fimMs: 8000 },
], pSimples), [
  { texto: 'a', inicioFrames: 150, fimFrames: 180, destaque: false },
  { texto: 'b', inicioFrames: 150, fimFrames: 151, destaque: false },
  { texto: 'c', inicioFrames: 210, fimFrames: 240, destaque: false },
]);

// 7. fromFrames: o Sequence começa em 90 (3 s); palavra em 4 s → 120 − 90 = 30.
//    Palavra antes do Sequence: max(0, ...).
igual('com from', conv([
  { texto: 'antes', inicioMs: 1000, fimMs: 2000 },
  { texto: 'depois', inicioMs: 4000, fimMs: 5000, destaque: true },
], pSimples, 90), [
  { texto: 'antes', inicioFrames: 0, fimFrames: 1, destaque: false },
  { texto: 'depois', inicioFrames: 30, fimFrames: 60, destaque: true },
]);

// 8. com gancho (movido): G [40–48] vai pro início, depois A [0–10] e C [14–26].
//    Cortado: G 0–240, A 240–540, C 540–900.
const gancho = [{ inicio: 40, fim: 48, gancho: 1 }, { inicio: 0, fim: 10 }, { inicio: 14, fim: 26 }];
const pGancho = criarParaFrameCortado(gancho, FPS);
igual('gancho: palavra no gancho', conv([{ texto: 'abre', inicioMs: 41000, fimMs: 42000 }], pGancho),
  [{ texto: 'abre', inicioFrames: 30, fimFrames: 60, destaque: false }]);
igual('gancho: palavra em A e em C', conv([
  { texto: 'um', inicioMs: 1000, fimMs: 2000 },
  { texto: 'dois', inicioMs: 15000, fimMs: 16000 },
], pGancho), [
  { texto: 'um', inicioFrames: 270, fimFrames: 300, destaque: false },
  { texto: 'dois', inicioFrames: 570, fimFrames: 600, destaque: false },
]);
// Palavra do gancho vem DEPOIS no vídeo original (40 s) mas ANTES no cortado; a entrada fica
// em ordem do original (A, G): G cai para o inicio da anterior (270) — regra "nunca menor".
igual('gancho: ordem do original (A depois G)', conv([
  { texto: 'um', inicioMs: 1000, fimMs: 2000 },
  { texto: 'abre', inicioMs: 41000, fimMs: 42000 },
], pGancho), [
  { texto: 'um', inicioFrames: 270, fimFrames: 300, destaque: false },
  { texto: 'abre', inicioFrames: 270, fimFrames: 271, destaque: false },
]);

// 9. entrada não alterada (nem os objetos, nem a lista).
{
  const entrada = [
    { texto: ' comprar ', inicioMs: 3000, fimMs: 2000 },
    { texto: '', inicioMs: 0, fimMs: 1 },
    { texto: 'b', inicioMs: 1000, fimMs: 2000, destaque: true },
  ];
  const antes = JSON.stringify(entrada);
  const saida = conv(entrada, pSimples);
  igual('entrada nao alterada', JSON.stringify(entrada), antes);
  total++;
  if (saida === entrada || saida.some((p) => entrada.includes(p))) falhas.push('saida reaproveita objeto da entrada');
}

// 10. lista vazia.
igual('lista vazia', conv([], pSimples), []);

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
