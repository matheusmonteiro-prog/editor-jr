// Teste do src/utils/tempoCortado.ts (T15): gancho movido, --copiar e tempo
// depois do último trecho. Rodar: node scripts/teste-tempo-cortado.mjs
// Imprime "OK" ou lista as falhas (e sai com código 1).
import { criarParaFrameCortado } from '../src/utils/tempoCortado.ts';

const FPS = 30;
const falhas = [];
let total = 0;

function conferir(nome, trechos, casos) {
  const paraFrame = criarParaFrameCortado(trechos, FPS);
  for (const [segundo, esperado] of casos) {
    total++;
    const obtido = paraFrame(segundo);
    if (obtido !== esperado) falhas.push(`${nome}: ${segundo}s → ${obtido}, esperado ${esperado}`);
  }
}

// Gancho movido: G [40–48] vai pro início, depois A [0–10] e C [14–26].
// Vídeo cortado: G 0–8 s, A 8–18 s, C 18–30 s (900 frames).
const movido = [
  { inicio: 40, fim: 48, gancho: 1 },
  { inicio: 0, fim: 10 },
  { inicio: 14, fim: 26 },
];
conferir('gancho movido', movido, [
  [0, 240], [2, 300], [5, 390], [10, 540],   // dentro de A
  [12, 540],                                 // silêncio entre A e C
  [14, 540], [20, 720], [26, 900],           // dentro de C
  [30, 900],                                 // silêncio entre C e G
  [40, 0], [44, 120], [48, 240],             // dentro do gancho
]);

// --copiar: cópia de G [40–48] no início e o trecho B [40–50] continua no lugar.
// Vídeo cortado: cópia 0–8 s, A 8–18 s, C 18–30 s, B 30–40 s (1200 frames).
const copiar = [
  { inicio: 40, fim: 48, gancho: 1 },
  { inicio: 0, fim: 10 },
  { inicio: 14, fim: 26 },
  { inicio: 40, fim: 50 },
];
conferir('--copiar', copiar, [
  [0, 240], [10, 540], [12, 540],
  [30, 900],                                 // silêncio entre C e B
  [40, 900], [44, 1020], [50, 1200],         // vale o lugar original, não a cópia
]);

// Depois do último trecho: nunca passa do fim do vídeo cortado.
conferir('depois do último', movido, [[60, 900]]);

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
