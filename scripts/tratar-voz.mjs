#!/usr/bin/env node
/**
 * tratar-voz.mjs — tratamento de voz do JR com FFmpeg (04/11/2026).
 * Corrige tom (graves exagerados, falta de clareza), nivela o volume e leva ao alvo de loudness.
 * NÃO remove eco/reverberação: o FFmpeg não tem filtro para isso (ver docs/guia-edicao.md, "Eco").
 *
 * Uso:
 *   node scripts/tratar-voz.mjs <entrada.mp4|wav> <saida.wav> [--preset colada|jr] [--lufs -14]
 *                               [--gate] [--gate-forte] [--inicio 12.5 --duracao 30]
 *
 * Presets:
 *   colada  receita sugerida pelo Matheus (04/11): ronco, ruído leve, graves +1, 250 Hz -1,5,
 *           presença +2 e brilho +1, compressão leve.
 *   jr      a mesma receita + correções medidas no áudio de 28/10 (clareza 1 a 6 kHz muito abaixo
 *           dos médios, "caixote" em 180 a 300 Hz). É o padrão.
 *
 * --gate / --gate-forte: troca o compressor por um "portão" (agate), que abaixa o volume nas
 *   pausas sem mexer na fala. Achado em 04/11: o compressor estava fazendo o oposto do que eu
 *   queria — ele REALÇA a cauda de eco/sala nas pausas (reduz a diferença entre fala e sala).
 *   Medido na amostra de teste: vale entre sílabas de 26,7 dB (com compressor) para 29,3 dB
 *   (sem nenhum dos dois) e 34,4 dB (com --gate-forte). Use só depois de OUVIR: um portão forte
 *   pode cortar o final de alguma palavra (risco real, não testado por ouvido).
 *   Pensado para vir DEPOIS do WPE (ver scripts/dereverberar-wpe.py); sozinho, o portão reduz o
 *   que sobra entre as sílabas mas não tira o que fica dentro da fala.
 *
 * O volume é medido numa primeira passada e aplicado numa segunda (loudnorm em dois passos),
 * para chegar ao alvo com precisão. Alvo padrão -14 LUFS, pico -1,5 dBTP (kit, seção 13).
 */
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
const [entrada, saida] = pos;
const opcao = (n, p = null) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? p : argv[i + 1];
};
if (!entrada || !saida) {
  console.error("Uso: node scripts/tratar-voz.mjs <entrada> <saida.wav> [--preset colada|jr] [--lufs -14] [--inicio s --duracao s]");
  process.exit(1);
}
const preset = opcao("preset", "jr");
const lufs = Number(opcao("lufs", "-14"));
const inicio = opcao("inicio");
const duracao = opcao("duracao");
const gate = argv.includes("--gate");
const gateForte = argv.includes("--gate-forte");

const base = [
  "highpass=f=75",
  "afftdn=nr=6:nf=-45:tn=1",
  "equalizer=f=120:t=q:w=1:g=1",
  "equalizer=f=250:t=q:w=1:g=-1.5",
  "equalizer=f=3000:t=q:w=1:g=2",
  "equalizer=f=6500:t=q:w=1:g=1",
];
const extraJr = [
  "highpass=f=85", // segundo passe: ronco mais firme (24 dB/oitava no total)
  "equalizer=f=180:t=q:w=1:g=-2",
  "equalizer=f=300:t=q:w=1.2:g=-2",
  "equalizer=f=2800:t=q:w=0.9:g=2",
  "highshelf=f=6000:g=3",
];
const comp = "acompressor=threshold=0.125:ratio=2.5:attack=15:release=120:makeup=1.15";
const portao = gateForte
  ? "agate=threshold=0.05:ratio=8:attack=3:release=140:range=0.04"
  : "agate=threshold=0.035:ratio=6:attack=3:release=180:range=0.08";
const dinamica = gate || gateForte ? portao : comp;
const cadeia = [...base, ...(preset === "jr" ? extraJr : []), dinamica];
if (preset !== "colada" && preset !== "jr") {
  console.error(`Preset desconhecido: ${preset}`);
  process.exit(1);
}

const recorte = [...(inicio ? ["-ss", inicio] : []), ...(duracao ? ["-t", duracao] : [])];
const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

// Passo 1: mede o volume da voz já tratada.
const alvo = `I=${lufs}:TP=-1.5:LRA=7`;
const p1 = ff(["-y", ...recorte, "-i", entrada, "-vn", "-af", `${cadeia.join(",")},loudnorm=${alvo}:print_format=json`, "-f", "null", "-"]);
const json = /\{[\s\S]*"target_offset"[\s\S]*?\}/.exec(p1.stderr)?.[0];
if (!json) {
  console.error("Não consegui medir o volume.\n" + p1.stderr.slice(-800));
  process.exit(1);
}
const m = JSON.parse(json);

// Passo 2: aplica com as medidas (linear, sem "respiração" de volume).
const loud2 = `loudnorm=${alvo}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
const p2 = ff(["-y", ...recorte, "-i", entrada, "-vn", "-af", `${cadeia.join(",")},${loud2}`, "-ar", "48000", "-c:a", "pcm_s24le", saida]);
if (p2.status !== 0) {
  console.error(p2.stderr.slice(-800));
  process.exit(1);
}
console.log(`ok: ${saida} (preset ${preset}, alvo ${lufs} LUFS; antes ${m.input_i} LUFS)`);
