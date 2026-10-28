import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR, MOLA } from "./marca";

// Pizza segmentada do bloco 02, ao lado da linha "ETFs" (rodada 9): a "cesta" de ativos. Os gomos
// acendem um por um, em sequência, em dourado. Traço fino creme, sem sombra nem blur. Fica na linha do
// card ETFS, à direita dele: nasce na borda do card (escala 0 → 1) e desliza alguns px para a direita,
// com um pequeno quique, na hora da palavra "ETFs".

const GOMOS = 6;
const FRAMES_ENTRE_GOMOS = 6;

type Props = {
  tamanho: number; // fração da largura (diâmetro)
  inicio: number; // frame (relativo à Sequence) em que nasce
};

// Ponto na borda do círculo de raio r (centro 50,50); ângulo em graus, 0 = topo, sentido horário.
const ponto = (r: number, graus: number) => {
  const rad = ((graus - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
};

export const PizzaGomos: React.FC<Props> = ({ tamanho, inicio }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const p = spring({ frame: frame - inicio, fps, config: { damping: 9, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  const op = interpolate(frame - inicio, [0, 3], [0, 1], clamp);
  const lado = width * tamanho;
  const raio = 44;
  const passo = 360 / GOMOS;
  const folga = 1.6; // espaço entre os gomos, em graus

  return (
    <div
      style={{
        flexShrink: 0,
        width: lado,
        height: lado,
        opacity: op,
        transformOrigin: "0% 50%",
        transform: `translateX(${(1 - p) * -width * 0.025}px) scale(${p})`,
      }}
    >
      <svg width={lado} height={lado} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
        {new Array(GOMOS).fill(0).map((_, i) => {
          const de = i * passo + folga;
          const ate = (i + 1) * passo - folga;
          const a = ponto(raio, de);
          const b = ponto(raio, ate);
          // O gomo acende (e dá um pulso curto) quando chega a vez dele.
          const tAcende = inicio + 10 + i * FRAMES_ENTRE_GOMOS;
          const acende = spring({ frame: frame - tAcende, fps, config: MOLA, durationInFrames: 10 });
          const aceso = Math.min(1, Math.max(0, acende));
          const meio = ((de + ate) / 2 - 90) * (Math.PI / 180);
          const afasta = 2.2 * aceso;
          return (
            <path
              key={i}
              d={`M 50 50 L ${a.x} ${a.y} A ${raio} ${raio} 0 0 1 ${b.x} ${b.y} Z`}
              fill={COR.dourado}
              fillOpacity={0.1 + 0.9 * aceso}
              stroke={COR.creme}
              strokeOpacity={0.85 - 0.45 * aceso}
              strokeWidth={1.1}
              strokeLinejoin="round"
              transform={`translate(${Math.cos(meio) * afasta} ${Math.sin(meio) * afasta})`}
            />
          );
        })}
      </svg>
    </div>
  );
};
