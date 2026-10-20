import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Moeda dourada em CSS 3D caindo pelo fundo, girando. Disco com borda em
// camadas (espessura) e luz baixa vinda da esquerda. Sem texto na moeda.

type Props = {
  inicio: number; // frame da Sequence em que a queda começa
  duracao?: number; // frames da queda
  x?: number; // fração da largura
  tamanho?: number; // fração da largura
  opacidade?: number;
};

const CAMADAS = 8;

export const Moeda3D: React.FC<Props> = ({ inicio, duracao = 28, x = 0.72, tamanho = 0.17, opacidade = 0.9 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = interpolate(frame - inicio, [0, duracao], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  if (frame < inicio || t >= 1) return null;

  const lado = width * tamanho;
  const y = interpolate(t, [0, 1], [-0.12, 1.12]) * height;
  const giroX = 25 + t * 540;
  const giroY = -20 + t * 260;
  const luz = 0.8 + 0.3 * Math.cos(((giroX + giroY) * Math.PI) / 180);
  const espessura = lado * 0.012;

  const face = (z: number, escuro: boolean, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        transform: `translateZ(${z}px)`,
        background: escuro
          ? COR.marrom
          : `radial-gradient(circle at 35% 30%, ${COR.creme} 0%, ${COR.dourado} 30%, ${COR.dourado} 62%, ${COR.marrom} 100%)`,
        boxShadow: escuro ? "none" : `inset 0 0 0 ${lado * 0.06}px ${comAlfa(COR.marrom, 0.55)}`,
        filter: escuro ? "none" : `brightness(${luz})`,
      }}
    >
      {!escuro ? (
        <div
          style={{
            position: "absolute",
            inset: lado * 0.17,
            borderRadius: "50%",
            border: `${lado * 0.025}px solid ${comAlfa(COR.marrom, 0.45)}`,
          }}
        />
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - lado / 2,
        top: y - lado / 2,
        width: lado,
        height: lado,
        perspective: lado * 4,
        opacity: opacidade,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${giroX}deg) rotateY(${giroY}deg)`,
        }}
      >
        {face(-(CAMADAS / 2) * espessura, false, "tras")}
        {new Array(CAMADAS).fill(0).map((_, i) => face((i - CAMADAS / 2) * espessura, true, `borda-${i}`))}
        {face((CAMADAS / 2) * espessura, false, "frente")}
      </div>
    </div>
  );
};
