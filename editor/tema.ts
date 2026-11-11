import type { CSSProperties } from "react";

// Tema do editor: verde da marca, chapado (sem blur, sem sombra). Tamanhos em rem: o html muda
// de tamanho com a largura da tela (editor/index.html), e tudo acompanha.

export const COR = {
  verde: "#0F2A1D",
  creme: "#F5F0E6",
  amarelo: "#EFAF20",
  vermelho: "#E4573D",
} as const;

// Camadas chapadas: o creme da marca com pouca opacidade sobre o verde (não é blur).
export const VEU = {
  leve: "rgba(245,240,230,0.06)",
  medio: "rgba(245,240,230,0.12)",
  linha: "rgba(245,240,230,0.2)",
} as const;

export const botaoAmarelo: CSSProperties = {
  padding: "0.35rem 0.8rem",
  font: "inherit",
  fontWeight: 700,
  color: COR.verde,
  background: COR.amarelo,
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer",
};

export const botaoContorno: CSSProperties = {
  ...botaoAmarelo,
  color: COR.creme,
  background: "transparent",
  border: `1px solid ${VEU.linha}`,
};

export const caixaTexto = (invalida: boolean): CSSProperties => ({
  width: "100%",
  minWidth: 0,
  padding: "0.25rem 0.4rem",
  font: "inherit",
  color: COR.verde,
  background: invalida ? "#FFE1DB" : COR.creme,
  border: `2px solid ${invalida ? COR.vermelho : "transparent"}`,
  borderRadius: "0.25rem",
});

export const mensagemErro: CSSProperties = { color: COR.vermelho, fontSize: "0.8rem", marginTop: "0.2rem" };
