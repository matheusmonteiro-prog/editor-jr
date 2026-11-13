import { Easing, interpolate } from "remotion";
import { loadFont as carregarFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as carregarArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as carregarPlexMono } from "@remotion/google-fonts/IBMPlexMono";

// PROTÓTIPO (12/11/2026) da identidade "Território" (cartografia do capital + caderno de campo).
// Em teste: NÃO substitui o estilo aprovado do 2810-01b (src/cortes/CorteDividido.tsx).
// Fontes gratuitas (Google Fonts, licença OFL).
//   Fraunces: títulos editoriais (serifa com ar de publicação, itálico para o destaque)
//   Archivo: legenda (sem serifa, firme, boa no celular)
//   IBM Plex Mono: rótulos técnicos (cota, legenda de mapa, aviso)
export const F_TITULO = carregarFraunces("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
carregarFraunces("italic", { weights: ["600"], subsets: ["latin", "latin-ext"] });
export const F_TEXTO = carregarArchivo("normal", { weights: ["600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const F_MONO = carregarPlexMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;
// v2 (12/11, pedido do Matheus: "fontes mais modernas, igual às de antes"): títulos em Archivo Black
// maiúsculo e rótulos em Space Mono (as mesmas da versão B). Fraunces só na frase de citação.
export { FONTE_TITULO as F_FORTE, FONTE_MONO as F_ROTULO } from "../components/cortes/estiloCortes";

export const COR_T = {
  floresta: "#0F2A1D", // base institucional (o verde do kit)
  profundo: "#08170F", // fundo mais escuro
  grafite: "#1E1E1C",
  creme: "#F2EAD8", // texto e traço principal
  cremeApagado: "rgba(242,234,216,0.55)",
  ouro: "#C29A55", // dourado envelhecido: filete, cota, destaque (nunca preenchimento grande)
  ouroClaro: "#E2C285",
  terra: "#B0703F", // assunto do campo
  verde: "#7CC489", // lado bom sobre o escuro (Bolsa, crescimento)
  terracota: "#E0603F", // sinal: negação, lado que perde
} as const;

// Movimento: deliberado (entra e assenta), nunca quica.
export const CURVA_T = Easing.bezier(0.65, 0, 0.35, 1);
export const SAIDA_T = Easing.bezier(0.16, 1, 0.3, 1);
export const progresso = (frame: number, inicio: number, duracao: number, curva = SAIDA_T) =>
  interpolate(frame - inicio, [0, duracao], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: curva });
