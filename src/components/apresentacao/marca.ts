// Base visual do vídeo de apresentação (e de futuros vídeos pergunta e resposta).
// Cores e fontes da marca num lugar só, para os componentes de
// src/components/apresentacao/ não repetirem valores.
import { loadFont as carregarAlfaSlab } from "@remotion/google-fonts/AlfaSlabOne";
import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
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
// Rodada 9: tipografia do CTA do bloco 08, em CAIXA ALTA (exceção ao padrão de caixa de frase, pedida
// pelo Matheus: pendente de aprovação do JR). Carregada com o mesmo método do Inter (@remotion/google-fonts).
const anton = carregarAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const alfaSlab = carregarAlfaSlab("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export type FonteImpacto = {
  familia: string;
  peso: number;
  larguraEm: number; // largura média de uma letra MAIÚSCULA, em em (para caber o texto na tela)
  espaco: string; // letter-spacing
  engrossar?: number; // contorno na mesma cor, em em: dá "peso" a fonte que só tem o peso 400
};

const ANTON: FonteImpacto = { familia: anton.fontFamily, peso: 400, larguraEm: 0.5, espaco: "0.02em" };
const ALFA_SLAB: FonteImpacto = { familia: alfaSlab.fontFamily, peso: 400, larguraEm: 0.82, espaco: "0.01em" };

// Par A: Anton no texto; Alfa Slab One só no "MÉTODO JR". Par B: Anton em tudo, e o "MÉTODO JR" se
// diferencia só pela cor dourada, pelo tamanho e por um contorno que engrossa a letra (o "peso").
export const PARES_TIPOGRAFIA_CTA = {
  A: { texto: ANTON, destaque: ALFA_SLAB },
  B: { texto: ANTON, destaque: { ...ANTON, engrossar: 0.035 } },
} as const;

// FONTE PENDENTE DE APROVAÇÃO DO JR. Para trocar, mude só esta linha: "A" ou "B".
export const PAR_TIPOGRAFIA_CTA: keyof typeof PARES_TIPOGRAFIA_CTA = "A";
export const TIPOGRAFIA_CTA: { texto: FonteImpacto; destaque: FonteImpacto } = PARES_TIPOGRAFIA_CTA[PAR_TIPOGRAFIA_CTA];
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
