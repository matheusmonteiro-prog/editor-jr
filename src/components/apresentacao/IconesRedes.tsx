import React from "react";
import { clamp } from "../../utils/clamp";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { RedeSocial } from "../../dados/apresentacao";
import { COR } from "./marca";

// Bloco 08 (rodada 6): ícones das redes em linha, pequenos, MONOCROMÁTICOS (creme), desenhados
// à mão em SVG (traço simples, sem as cores originais das marcas). Entram um de cada vez
// (fade + sobe + escala com mola) e depois flutuam de leve. Saem para baixo no fecho.

type Props = {
  redes: RedeSocial[];
  inicio: number; // frame (relativo à Sequence) do 1º ícone
  saida?: number;
  top: number; // fração da altura (centro da linha)
  tamanho?: number; // fração da largura de cada ícone
  cor?: string;
  stagger?: number; // frames entre um ícone e o próximo
  pulsoEm?: number; // frame (relativo à Sequence) em que o 1º ícone dá o pulso de escala
  staggerPulso?: number; // frames entre o pulso de um ícone e o do próximo (padrão 3)
};

const TRACO = 1.7; // no viewBox de 24

const Desenho: React.FC<{ rede: RedeSocial; cor: string }> = ({ rede, cor }) => {
  const traco = { fill: "none", stroke: cor, strokeWidth: TRACO, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (rede === "youtube") {
    return (
      <>
        <rect x={2} y={5.5} width={20} height={13} rx={4} {...traco} />
        <path d="M10 9.2 L15.2 12 L10 14.8 Z" fill={cor} />
      </>
    );
  }
  if (rede === "tiktok") {
    return <path d="M13.5 3.5 V15.2 A3.6 3.6 0 1 1 9.9 11.6 M13.5 3.5 C13.9 6.2 15.8 8 18.5 8.2" {...traco} />;
  }
  if (rede === "instagram") {
    return (
      <>
        <rect x={3} y={3} width={18} height={18} rx={5} {...traco} />
        <circle cx={12} cy={12} r={4.2} {...traco} />
        <circle cx={17.2} cy={6.8} r={1.1} fill={cor} />
      </>
    );
  }
  if (rede === "facebook") {
    return (
      <>
        <circle cx={12} cy={12} r={9.5} {...traco} />
        <path d="M13.2 21.4 V11 A2.6 2.6 0 0 1 15.8 8.4 H16.8 M10.2 13.4 H16" {...traco} />
      </>
    );
  }
  // X: faixa larga em contorno (de cima à esquerda para baixo à direita) e o traço fino cruzando.
  return (
    <>
      <path d="M3.5 3.5 H8.4 L20.5 20.5 H15.6 Z" {...traco} />
      <path d="M20 3.5 L13.7 10.6 M10.3 13.4 L4 20.5" {...traco} />
    </>
  );
};

export const IconesRedes: React.FC<Props> = ({ redes, inicio, saida, top, tamanho = 0.06, cor = COR.creme, stagger = 4, pulsoEm, staggerPulso = 3 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame < inicio) return null;
  const lado = width * tamanho;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        display: "flex",
        justifyContent: "center",
        gap: lado * 0.75,
        transform: "translateY(-50%)",
      }}
    >
      {redes.map((rede, i) => {
        const local = frame - inicio - i * stagger;
        const p = spring({ frame: local, fps, config: { damping: 14, mass: 1 }, durationInFrames: 16 });
        const op = interpolate(local, [0, 6], [0, 1], clamp);
        // Saída também em stagger, para baixo.
        const q = saida === undefined ? 0 : interpolate(frame - saida - i * 2, [0, 10], [0, 1], clamp);
        const flutua = Math.sin((frame + i * 9) / 18) * lado * 0.05;
        const y = (1 - p) * lado * 0.5 + flutua + q * height * 0.03;
        // Rodada 9: pulso de escala (1 → 1,3 → 1) em "redes sociais", ícone por ícone, a cada `staggerPulso` frames.
        const pulso = pulsoEm === undefined ? 1 : interpolate(frame - pulsoEm - i * staggerPulso, [0, 5, 11], [1, 1.3, 1], clamp);
        return (
          <svg
            key={rede}
            width={lado}
            height={lado}
            viewBox="0 0 24 24"
            style={{ opacity: op * (1 - q), transform: `translateY(${y}px) scale(${interpolate(p, [0, 1], [0.8, 1]) * pulso})` }}
          >
            <Desenho rede={rede} cor={cor} />
          </svg>
        );
      })}
    </div>
  );
};
