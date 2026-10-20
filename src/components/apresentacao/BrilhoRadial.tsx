import React from "react";
import { useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Brilho dourado radial (atrás do logo, spotlight do bloco 01, cartela).
// Gradiente só em alfa: dourado → transparente.
export const BrilhoRadial: React.FC<{
  x: number; // fração da largura
  y: number; // fração da altura
  raio: number; // fração da largura
  intensidade: number; // 0 a 1
}> = ({ x, y, raio, intensidade }) => {
  const { width, height } = useVideoConfig();
  const r = width * raio;
  return (
    <div
      style={{
        position: "absolute",
        left: width * x - r,
        top: height * y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${comAlfa(COR.dourado, 0.55)} 0%, ${comAlfa(
          COR.dourado,
          0.18,
        )} 40%, ${comAlfa(COR.dourado, 0)} 70%)`,
        opacity: intensidade,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
