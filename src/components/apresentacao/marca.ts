// Base visual do vídeo de apresentação (e de futuros vídeos pergunta e resposta).
// Cores e fontes da marca num lugar só, para os componentes de
// src/components/apresentacao/ não repetirem valores.
import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";

export const COR = {
  fundo: "#0F2A1D", // verde-escuro
  creme: "#F5F0E6",
  dourado: "#EFAF20", // destaque sobre escuro
  marrom: "#8E4813", // destaque sobre claro
} as const;

// Verde #1DD41E: RESERVADO para sinal de compra do Método JR. Não usar aqui.

// Rodada 4 (20/10/2026): Inter em TUDO (Fraunces e Space Grotesk saíram).
// Títulos e respostas: Inter 800. Rótulos, pílulas e números: Inter 600.
const inter = carregarInter("normal", {
  weights: ["600", "800"],
  subsets: ["latin", "latin-ext"],
});
export const FONTE_TITULO = inter.fontFamily;
export const FONTE_ROTULO = inter.fontFamily;
export const PESO_TITULO = 800;

// Caixa alta em tudo, com o espaçamento pedido para cada uso.
export const ESPACO_TITULO = "0.04em";
export const ESPACO_ROTULO = "0.08em";

// Spring padrão do vídeo: damping entre 10 e 14, mass 1 (exceção autorizada
// em 19/10/2026: overshoot e bounce suave liberados neste vídeo).
export const MOLA = { damping: 12, mass: 1 } as const;

// Fração 0..1 → rgba de uma cor hex da marca.
export const comAlfa = (hex: string, alfa: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
};
