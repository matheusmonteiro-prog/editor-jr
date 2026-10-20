import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Raios de luz leves saindo do canto superior esquerdo, balançando devagar.
// Gradiente só em alfa (dourado → transparente).
export const RaiosDeLuz: React.FC<{ opacidade?: number }> = ({ opacidade = 0.16 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const raios = [
    { angulo: 28, largura: 0.1, fase: 0 },
    { angulo: 38, largura: 0.06, fase: 1.7 },
    { angulo: 48, largura: 0.12, fase: 3.1 },
    { angulo: 60, largura: 0.05, fase: 4.4 },
  ];
  const comprimento = Math.hypot(width, height) * 1.1;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", mixBlendMode: "screen" }}>
      {raios.map((r, i) => {
        const balanco = Math.sin(frame / 45 + r.fase) * 2;
        const pulso = 0.7 + 0.3 * Math.sin(frame / 30 + r.fase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -width * 0.08,
              top: -height * 0.04,
              width: comprimento,
              height: width * r.largura,
              transformOrigin: "0% 50%",
              transform: `rotate(${r.angulo + balanco}deg)`,
              background: `linear-gradient(90deg, ${comAlfa(COR.dourado, 0.9)} 0%, ${comAlfa(
                COR.dourado,
                0.25,
              )} 45%, ${comAlfa(COR.dourado, 0)} 85%)`,
              filter: `blur(${width * 0.012}px)`,
              opacity: opacidade * pulso,
            }}
          />
        );
      })}
    </div>
  );
};
