import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, FONTE_ROTULO } from "./marca";

// Pílula chapada do CTA final (bloco 08): fundo creme #F5F0E6, texto #0F2A1D, raio de
// 28 px, SEM sombra, SEM borda e SEM transparência. Entra com mola (escala 0,7 → 1).
type Props = {
  texto: string;
  inicio: number; // frame (relativo à Sequence)
  top: number; // fração da altura (topo)
  tamanho?: number; // fração da largura
  // Variante discreta (rodada 5d): texto creme sobre #0F2A1D, menor. Sem borda, sem sombra.
  discreta?: boolean;
  // Saída (rodada 5d): frame em que começa a sair (10 frames, translateY + opacidade).
  saida?: number;
  saidaPara?: "cima" | "baixo";
};

export const PilulaCta: React.FC<Props> = ({ texto, inicio, top, tamanho = 0.04, discreta = false, saida, saidaPara = "baixo" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p = spring({ frame: frame - inicio, fps, config: { damping: 12, mass: 1 }, durationInFrames: 12 });
  if (frame < inicio) return null;
  const fontSize = width * tamanho;
  // Opacidade só do movimento de entrada (a pílula em si é opaca).
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  const op = interpolate(frame - inicio, [0, 3], [0, 1], clamp) * (1 - q);
  const deslocY = (saidaPara === "cima" ? -1 : 1) * q * height * 0.03;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        display: "flex",
        justifyContent: "center",
        opacity: op,
        transform: `translateY(${deslocY}px) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
      }}
    >
      <div
        style={{
          backgroundColor: discreta ? COR.fundo : COR.creme,
          color: discreta ? COR.creme : COR.fundo,
          borderRadius: 28,
          padding: discreta ? `${fontSize * 0.5}px ${fontSize * 1.1}px` : `${fontSize * 0.6}px ${fontSize * 1.3}px`,
          fontFamily: FONTE_ROTULO,
          fontWeight: 600,
          letterSpacing: ESPACO_ROTULO,
          fontSize,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {texto.toLocaleUpperCase("pt-BR")}
      </div>
    </div>
  );
};
