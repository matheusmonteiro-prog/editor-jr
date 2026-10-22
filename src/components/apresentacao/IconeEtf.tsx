import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, MOLA, comAlfa } from "./marca";

// Ícone de ETF (rodada 7, bloco 02): "cesta" como uma pizza estilizada em traço creme, com UMA
// fatia dourada que se afasta um pouco do centro (a carteira diversificada). SVG inline, pequeno.
// Entra com mola (escala + leve giro) logo depois do card; a fatia sai do lugar depois.

type Props = {
  x: number; // centro, fração da largura
  y: number; // centro, fração da altura
  tamanho: number; // fração da largura
  inicio: number; // frame (relativo à Sequence)
  saida?: number;
};

// Ponto na borda do círculo (raio r, ângulo em graus, 0 = topo, sentido horário).
const ponto = (r: number, graus: number) => {
  const rad = ((graus - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
};

export const IconeEtf: React.FC<Props> = ({ x, y, tamanho, inicio, saida }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const p = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 14 });
  const op = interpolate(frame - inicio, [0, 5], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  // A fatia dourada se afasta do centro depois que o ícone assenta.
  const afasta = interpolate(frame - inicio, [12, 22], [0, 1], clamp) * 7;

  const lado = width * tamanho;
  const r = 40;
  const a = ponto(r, 20);
  const b = ponto(r, 110);
  const meio = ponto(1, 65); // direção da fatia
  const dx = (meio.x - 50) * afasta;
  const dy = (meio.y - 50) * afasta;
  const traco = 4; // em unidades do viewBox (100): ~2-3 px na tela

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - lado / 2,
        top: height * y - lado / 2,
        width: lado,
        height: lado,
        opacity: op * (1 - q),
        transform: `translateY(${-q * height * 0.03}px) scale(${interpolate(p, [0, 1], [0.5, 1])}) rotate(${interpolate(p, [0, 1], [-40, 0])}deg)`,
      }}
    >
      <svg viewBox="0 0 100 100" width={lado} height={lado} style={{ overflow: "visible" }}>
        {/* Círculo e as divisões das outras fatias, em traço creme. */}
        <circle cx={50} cy={50} r={r} fill="none" stroke={COR.creme} strokeWidth={traco} strokeOpacity={0.9} />
        {[110, 200, 290].map((g) => {
          const e = ponto(r, g);
          return <line key={g} x1={50} y1={50} x2={e.x} y2={e.y} stroke={COR.creme} strokeWidth={traco} strokeOpacity={0.9} />;
        })}
        <line x1={50} y1={50} x2={a.x} y2={a.y} stroke={COR.creme} strokeWidth={traco} strokeOpacity={0.9} />
        {/* Fatia dourada (20° a 110°), afastada do centro. */}
        <path
          d={`M ${50 + dx} ${50 + dy} L ${a.x + dx} ${a.y + dy} A ${r} ${r} 0 0 1 ${b.x + dx} ${b.y + dy} Z`}
          fill={COR.dourado}
          stroke={COR.dourado}
          strokeWidth={traco}
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 ${lado * 0.04}px ${comAlfa(COR.dourado, 0.5)})` }}
        />
      </svg>
    </div>
  );
};
