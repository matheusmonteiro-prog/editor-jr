import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Poeira dourada subindo devagar. Posições sorteadas com random(semente) do
// Remotion: o mesmo frame dá sempre o mesmo desenho.
// modo "explosao": as partículas saem de um centro para fora (bloco 05).

type Props = {
  quantidade?: number;
  semente?: string;
  opacidade?: number; // multiplica a opacidade de cada partícula
  tamanhoMax?: number; // fração da largura
  modo?: "poeira" | "explosao";
  centroX?: number;
  centroY?: number;
  inicio?: number; // frame em que a explosão começa
  duracao?: number; // frames da explosão
};

export const Particulas: React.FC<Props> = ({
  quantidade = 40,
  semente = "poeira",
  opacidade = 1,
  tamanhoMax = 0.006,
  modo = "poeira",
  centroX = 0.5,
  centroY = 0.45,
  inicio = 0,
  duracao = 40,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {new Array(quantidade).fill(0).map((_, i) => {
        const r = (k: string) => random(`${semente}-${i}-${k}`);
        const tamanho = width * tamanhoMax * (0.35 + r("t") * 0.65);
        let x: number;
        let y: number;
        let op: number;

        if (modo === "poeira") {
          const velocidade = 0.0006 + r("v") * 0.0012; // fração da altura por frame
          const fase = r("f");
          const ciclo = (fase + frame * velocidade) % 1;
          x = width * (r("x") + Math.sin(frame / (40 + r("w") * 40) + i) * 0.01);
          y = height * (1.05 - ciclo * 1.1);
          // Pisca de leve e some nas pontas.
          const borda = interpolate(ciclo, [0, 0.1, 0.9, 1], [0, 1, 1, 0], clamp);
          op = (0.2 + r("o") * 0.4) * borda * (0.75 + 0.25 * Math.sin(frame / 9 + i));
        } else {
          const t = interpolate(frame - inicio, [0, duracao], [0, 1], clamp);
          const angulo = r("a") * Math.PI * 2;
          const alcance = (0.12 + r("d") * 0.3) * width;
          const saida = 1 - Math.pow(1 - t, 3);
          x = width * centroX + Math.cos(angulo) * alcance * saida;
          y = height * centroY + Math.sin(angulo) * alcance * saida * 0.6 - t * height * 0.03;
          op = t <= 0 ? 0 : interpolate(t, [0, 0.15, 1], [0, 0.9, 0], clamp) * (0.5 + r("o") * 0.5);
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - tamanho / 2,
              top: y - tamanho / 2,
              width: tamanho,
              height: tamanho,
              borderRadius: "50%",
              backgroundColor: COR.dourado,
              boxShadow: `0 0 ${tamanho * 2.5}px ${comAlfa(COR.dourado, 0.8)}`,
              opacity: op * opacidade,
            }}
          />
        );
      })}
    </div>
  );
};
