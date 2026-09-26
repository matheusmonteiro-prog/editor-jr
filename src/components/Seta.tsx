import React from "react";
import {
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const setaSchema = z.object({
  xInicial: z.number(),
  yInicial: z.number(),
  xFinal: z.number(),
  yFinal: z.number(),
  cor: zColor(),
  espessura: z.number().min(1),
  curvatura: z.enum(["reta", "curva"]),
  duracaoFrames: z.number().min(1),
});

type Props = z.infer<typeof setaSchema>;

// Ponto de controle para a curva: desloca o meio da linha na perpendicular.
// Fator maior = curva mais acentuada. 0 daria uma linha reta.
const FATOR_CURVATURA = 0.25;

export const Seta: React.FC<Props> = ({
  xInicial,
  yInicial,
  xFinal,
  yFinal,
  cor,
  espessura,
  curvatura,
  duracaoFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const dx = xFinal - xInicial;
  const dy = yFinal - yInicial;
  const comprimento = Math.sqrt(dx * dx + dy * dy) || 1;

  let path: string;
  let anguloFinalRad: number;

  if (curvatura === "curva") {
    const meioX = (xInicial + xFinal) / 2;
    const meioY = (yInicial + yFinal) / 2;
    // Vetor perpendicular unitário à linha, escalado pelo tamanho dela.
    const perpX = -dy / comprimento;
    const perpY = dx / comprimento;
    const offset = comprimento * FATOR_CURVATURA;
    const controleX = meioX + perpX * offset;
    const controleY = meioY + perpY * offset;
    path = `M ${xInicial} ${yInicial} Q ${controleX} ${controleY} ${xFinal} ${yFinal}`;
    // Tangente da curva quadrática em t=1 aponta de "controle" para o ponto final.
    anguloFinalRad = Math.atan2(yFinal - controleY, xFinal - controleX);
  } else {
    path = `M ${xInicial} ${yInicial} L ${xFinal} ${yFinal}`;
    anguloFinalRad = Math.atan2(dy, dx);
  }

  // Truque do "pathLength": fixa o comprimento virtual do traço em 100,
  // independente da geometria real. Assim o dash/offset funciona igual pra
  // linha reta ou curva, sem precisar calcular o comprimento da curva.
  const progresso = interpolate(frame, [0, duracaoFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // A pontinha só aparece nos últimos 25% do traço — proporcional a
  // duracaoFrames, não um número de frames fixo. Easing.spring() roda a
  // física da mola normalizada dentro do intervalo do interpolate, então o
  // "pop" sempre termina exatamente em frame === duracaoFrames, seja ele 10,
  // 40 ou 100.
  const inicioPonta = duracaoFrames * 0.75;
  const progressoPonta = interpolate(
    frame,
    [inicioPonta, duracaoFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.spring({ damping: 12, stiffness: 200, mass: 0.5 }),
    },
  );
  const opacitySeta = Math.min(1, progressoPonta);
  const escalaSeta = interpolate(progressoPonta, [0, 1], [0.3, 1]);

  const anguloFinalDeg = (anguloFinalRad * 180) / Math.PI;
  const tamanhoPonta = espessura * 3 + 8;

  return (
    <Sequence name="Seta">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d={path}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - progresso}
        />
        <g
          transform={`translate(${xFinal}, ${yFinal}) rotate(${anguloFinalDeg}) scale(${escalaSeta})`}
          style={{ opacity: opacitySeta }}
        >
          <polygon
            points={`0,0 ${-tamanhoPonta},${-tamanhoPonta / 2} ${-tamanhoPonta},${tamanhoPonta / 2}`}
            fill={cor}
          />
        </g>
      </svg>
    </Sequence>
  );
};
