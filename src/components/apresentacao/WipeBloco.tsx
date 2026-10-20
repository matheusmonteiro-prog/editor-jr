import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Troca de bloco: faixa verde-escura varrendo a tela na diagonal em 10
// frames, com um fio dourado na borda da frente. Fica por cima de tudo
// (menos do fio de progresso). Use dentro de uma Sequence que começa no
// frame da troca.
export const WipeBloco: React.FC<{ duracao?: number }> = ({ duracao = 10 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame, [0, duracao], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  if (p <= 0 || p >= 1) return null;

  const diagonal = Math.hypot(width, height);
  const largura = diagonal * 0.55;
  // Do canto inferior esquerdo ao superior direito (fora → fora).
  const desloc = interpolate(p, [0, 1], [-diagonal * 0.5 - largura, diagonal * 0.5 + largura * 0.2]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: width / 2 - largura / 2,
          top: height / 2 - diagonal,
          width: largura,
          height: diagonal * 2,
          transform: `rotate(35deg) translateX(${desloc}px)`,
          background: `linear-gradient(90deg, ${comAlfa(COR.fundo, 0)} 0%, ${comAlfa(COR.fundo, 0.95)} 25%, ${comAlfa(
            COR.fundo,
            0.95,
          )} 96%, ${COR.dourado} 98%, ${comAlfa(COR.dourado, 0)} 100%)`,
        }}
      />
    </div>
  );
};
