import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR } from "./marca";

// Sino de notificação (rodada 9, grupo "ative as notificações" do bloco 08): sino vetorial dourado
// que balança como um pêndulo (rotação que amortece, ~3 oscilações) com uma bolinha de notificação
// que pisca uma vez. Só traço e preenchimento liso, sem sombra nem blur. Vai dentro do GrupoCaindo.

const OSCILACOES = 3;
const DURACAO_BALANCO = 36; // frames do primeiro balanço até parar

type Props = {
  y: number; // centro, fração da altura
  balanco: number; // frame (relativo à Sequence) em que começa o balanço
  tamanho?: number; // fração da largura
};

export const SinoNotificacao: React.FC<Props> = ({ y, balanco, tamanho = 0.16 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lado = width * tamanho;
  const f = frame - balanco;

  // Pêndulo amortecido: ângulo = amplitude × decaimento × seno.
  const amplitude = 24;
  const decaimento = interpolate(f, [0, DURACAO_BALANCO], [1, 0], clamp);
  const angulo = f < 0 ? 0 : amplitude * decaimento * Math.sin((f / DURACAO_BALANCO) * OSCILACOES * 2 * Math.PI);

  // A bolinha aparece com o primeiro balanço, pisca uma vez (cresce, some, volta) e fica.
  const bolinha = interpolate(f, [0, 3, 8, 11, 14], [0, 1.25, 1, 0.55, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * y,
        display: "flex",
        justifyContent: "center",
        transform: "translateY(-50%)",
      }}
    >
      <svg width={lado} height={lado} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
        <g style={{ transformOrigin: "24px 5px", transform: `rotate(${angulo}deg)` }}>
          {/* Corpo do sino. */}
          <path
            d="M24 6 C16.5 6 12 11.5 12 18.5 V27 L8 33 H40 L36 27 V18.5 C36 11.5 31.5 6 24 6 Z"
            fill={COR.dourado}
          />
          {/* Badalo. */}
          <path d="M19.5 36.5 C20.2 39.3 21.9 41 24 41 C26.1 41 27.8 39.3 28.5 36.5 Z" fill={COR.dourado} />
          {/* Argola de cima. */}
          <circle cx={24} cy={5} r={2.2} fill={COR.dourado} />
        </g>
        {/* Bolinha de notificação, fixa no canto (não balança). */}
        <circle cx={37} cy={11} r={5.2 * bolinha} fill={COR.creme} />
      </svg>
    </div>
  );
};
