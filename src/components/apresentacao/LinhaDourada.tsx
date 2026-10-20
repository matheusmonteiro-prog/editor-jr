import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Linha dourada fina que atravessa a tela de um lado ao outro (esquerda →
// direita) em `duracao` frames e fica como divisória até `saida`.
export const LinhaDourada: React.FC<{
  inicio: number;
  duracao?: number;
  top: number; // fração da altura
  saida?: number;
}> = ({ inicio, duracao = 12, top, saida }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const p = interpolate(frame - inicio, [0, duracao], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  if (p <= 0 || q >= 1) return null;
  const espessura = Math.max(2, height * (3 / 1920));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: height * top - espessura / 2,
        width: width * p,
        height: espessura,
        backgroundColor: COR.dourado,
        boxShadow: `0 0 ${espessura * 4}px ${comAlfa(COR.dourado, 0.55)}`,
        opacity: 1 - q,
      }}
    />
  );
};
