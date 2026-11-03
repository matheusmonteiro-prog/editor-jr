#!/usr/bin/env node
/**
 * montar-corte-final.mjs — parte de um .cortes.json do cortar-silencio.mjs, tira os trechos
 * de fala que o Matheus mandou cortar e gera as duas bases do vídeo:
 *   public/videos/<nome>-fundo.mp4   fundo verde-escuro chapado + voz tratada
 *   public/videos/<nome>-camera.mp4  imagem do JR tratada, 1920x1080, sem som
 *   videos/<nome>.cortes.json        os trechos finais (tempos do ORIGINAL)
 *
 * O fundo é verde de propósito: quando o JR muda de caixa, o que aparece em volta é a cor do
 * kit, nunca a tela do OBS.
 *
 * Uso:
 *   node scripts/montar-corte-final.mjs --nome 2026-10-28 --tela "a.mkv" --camera "b.mkv" \
 *     --cortes "a.cortes.json" --remover 100.09-123.21 [--atraso 0.33]
 *
 * --remover  intervalos em segundos do original, separados por vírgula
 * --atraso   câmera atrasada em relação à voz, em segundos (padrão 0)
 * --mascara  PNG cinza 1920x1080: branco desfoca de leve (o fundo), preto fica nítido (o JR)
 *
 * Exige o FFmpeg completo no PATH (afftdn, acompressor e hqdn3d não existem no do Remotion).
 */
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';

const FPS = 30;
const FILTRO_VOZ = 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=20:release=250,loudnorm=I=-16:TP=-1.5:LRA=11'; // mesma cadeia do --limpar
const FILTRO_IMAGEM = 'hqdn3d=2:1.5:3:2.5,scale=1920:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0,eq=contrast=1.04:saturation=1.05:brightness=0.01';
const VERDE = '0x0F2A1D';

const argv = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : argv[i + 1];
};
const nome = opcao('nome');
const tela = opcao('tela');
const camera = opcao('camera');
const cortes = opcao('cortes');
if (!nome || !tela || !camera || !cortes) {
  console.error('Faltou --nome, --tela, --camera ou --cortes.');
  process.exit(1);
}
const atraso = Number(opcao('atraso', 0));
const mascara = opcao('mascara');
const remover = (opcao('remover', '') || '')
  .split(',')
  .filter(Boolean)
  .map((r) => r.split('-').map(Number));

// Tira de cada trecho os intervalos removidos.
export const subtrair = (trechos, intervalos) => {
  let partes = trechos.map((t) => ({inicio: t.inicio, fim: t.fim}));
  for (const [a, b] of intervalos) {
    partes = partes.flatMap((p) => {
      if (b <= p.inicio || a >= p.fim) return [p];
      const sobra = [];
      if (a > p.inicio) sobra.push({inicio: p.inicio, fim: a});
      if (b < p.fim) sobra.push({inicio: b, fim: p.fim});
      return sobra;
    });
  }
  return partes;
};

const base = JSON.parse(readFileSync(cortes, 'utf8'));
// Tudo na grade de quadros: imagem e voz cortam no mesmo ponto e não escorregam ao longo do vídeo.
const trechos = subtrair(base.trechos, remover)
  .map((t) => ({inicioQ: Math.round(t.inicio * FPS), fimQ: Math.round(t.fim * FPS)}))
  .filter((t) => t.fimQ > t.inicioQ);

const duracaoFinal = trechos.reduce((s, t) => s + (t.fimQ - t.inicioQ) / FPS, 0);
writeFileSync(
  `videos/${nome}.cortes.json`,
  JSON.stringify(
    {
      ...base,
      duracaoFinal,
      parametros: {...base.parametros, remover},
      trechos: trechos.map((t) => ({inicio: t.inicioQ / FPS, fim: t.fimQ / FPS})),
    },
    null,
    2,
  ),
);

const rodar = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], {stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Voz: cada pedaço com 10 ms de fade nas pontas, para o corte não estalar.
const pedacosVoz = trechos
  .map((t, i) => {
    const dur = (t.fimQ - t.inicioQ) / FPS;
    return `[0:a]atrim=${t.inicioQ / FPS}:${t.fimQ / FPS},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, dur - 0.01)}:d=0.01[a${i}]`;
  })
  .join(';');
const juntaVoz = `${trechos.map((_, i) => `[a${i}]`).join('')}concat=n=${trechos.length}:v=0:a=1,${FILTRO_VOZ},aresample=48000[voz]`;
rodar([
  '-i', tela,
  '-f', 'lavfi', '-i', `color=c=${VERDE}:s=1920x1080:r=${FPS}:d=${duracaoFinal}`,
  '-filter_complex', `${pedacosVoz};${juntaVoz}`,
  '-map', '1:v', '-map', '[voz]',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-t', String(duracaoFinal),
  `public/videos/${nome}-fundo.mp4`,
]);

// Imagem: os mesmos quadros, deslocados pelo atraso.
const desloc = Math.round(atraso * FPS);
const selecao = trechos.map((t) => `between(n,${t.inicioQ + desloc},${t.fimQ + desloc - 1})`).join('+');
const imagem = `[0:v]fps=${FPS},select='${selecao}',setpts=N/${FPS}/TB,${FILTRO_IMAGEM}`;
// ponytail: máscara fixa, serve porque a câmera não se mexe; se o JR sair da área, a borda dele desfoca.
const comFundoDesfocado = `${imagem},format=yuv444p,split[nitido][d];[d]gblur=sigma=9[desfocado];[1:v]format=gray,mergeplanes=0x000000:yuv444p[m];[nitido][desfocado][m]maskedmerge=shortest=1,format=yuv420p[v]`;
rodar([
  '-i', camera,
  ...(mascara ? ['-loop', '1', '-framerate', String(FPS), '-i', mascara] : []),
  '-filter_complex', mascara ? comFundoDesfocado : `${imagem}[v]`,
  '-map', '[v]', '-an', '-fps_mode', 'cfr', '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
  `public/videos/${nome}-camera.mp4`,
]);

console.log(`Trechos: ${trechos.length}. Duração final: ${duracaoFinal.toFixed(2)} s.`);
for (const f of [`public/videos/${nome}-fundo.mp4`, `public/videos/${nome}-camera.mp4`]) {
  if (!existsSync(f)) console.error(`Não gerou ${f}`);
}
