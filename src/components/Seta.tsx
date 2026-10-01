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

// Redesenhada (01/10/2026) — traço "desenhado à mão" (mesma técnica do
// CirculoDestaque: pontos fixos com pequeno desvio perpendicular, ligados por
// curva suave, em vez de uma linha/arco geometricamente perfeito). Entrada
// desenhando até a ponta, saída com fade completo. Nada em pixel fixo — tudo
// em fração de width/height do useVideoConfig().

export const setaSchema = z.object({
  xInicial: z.number().min(0).max(1).default(0.25),
  yInicial: z.number().min(0).max(1).default(0.7),
  xFinal: z.number().min(0).max(1).default(0.6),
  yFinal: z.number().min(0).max(1).default(0.35),
  cor: zColor().default("#EFAF20"),
  espessura: z.number().min(0.001).max(0.05).default(0.008),
  curvatura: z.enum(["reta", "curva"]).default("curva"),
  duracaoFrames: z.number().min(10).default(60),
  // Novas (01/10/2026): antes só existia entrada (sem conceito de saída).
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof setaSchema>;

// Desvio perpendicular de cada ponto intermediário, fixo (não aleatório) —
// "curva" balança mais que "reta", que fica quase reta (só a imperfeição
// natural de um traço à mão, nunca uma reta geométrica perfeita).
const FATORES_CURVA = [0.1, -0.16, 0.08];
const FATORES_RETA = [0.02, -0.03, 0.015];

type Ponto = { x: number; y: number };

// Liga uma lista de pontos com curvas suaves (quadráticas via ponto médio) —
// mesma técnica do GraficoCrescimento, aqui pra um traço aberto (não fechado).
const criarPathSuave = (pontos: Ponto[]): string => {
  let d = `M ${pontos[0].x} ${pontos[0].y}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const atual = pontos[i];
    const proximo = pontos[i + 1];
    const meioX = (atual.x + proximo.x) / 2;
    const meioY = (atual.y + proximo.y) / 2;
    d += ` Q ${atual.x} ${atual.y} ${meioX} ${meioY}`;
  }
  const ultimo = pontos[pontos.length - 1];
  d += ` T ${ultimo.x} ${ultimo.y}`;
  return d;
};

export const Seta: React.FC<Props> = ({
  xInicial = 0.25,
  yInicial = 0.7,
  xFinal = 0.6,
  yFinal = 0.35,
  cor = "#EFAF20",
  espessura = 0.008,
  curvatura = "curva",
  duracaoFrames = 60,
  framesEntrada = 15,
  framesSaida = 15,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const xInicialPx = width * xInicial;
  const yInicialPx = height * yInicial;
  const xFinalPx = width * xFinal;
  const yFinalPx = height * yFinal;

  const dx = xFinalPx - xInicialPx;
  const dy = yFinalPx - yInicialPx;
  const comprimento = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / comprimento;
  const perpY = dx / comprimento;

  const fatores = curvatura === "curva" ? FATORES_CURVA : FATORES_RETA;
  const pontos: Ponto[] = [{ x: xInicialPx, y: yInicialPx }];
  fatores.forEach((fator, i) => {
    const t = (i + 1) / (fatores.length + 1);
    const baseX = xInicialPx + dx * t;
    const baseY = yInicialPx + dy * t;
    const offset = comprimento * fator;
    pontos.push({ x: baseX + perpX * offset, y: baseY + perpY * offset });
  });
  pontos.push({ x: xFinalPx, y: yFinalPx });

  const path = criarPathSuave(pontos);
  const penultimo = pontos[pontos.length - 2];
  const anguloFinalRad = Math.atan2(yFinalPx - penultimo.y, xFinalPx - penultimo.x);

  // Truque do "pathLength": fixa o comprimento virtual do traço em 100,
  // independente da geometria real do spline.
  const progresso = interpolate(frame, [0, framesEntrada], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // A ponta só aparece nos últimos 25% da entrada — proporcional a
  // framesEntrada, não um número de frames fixo.
  const inicioPonta = framesEntrada * 0.75;
  const progressoPonta = interpolate(
    frame,
    [inicioPonta, framesEntrada],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.spring({ damping: 12, stiffness: 200, mass: 0.5 }),
    },
  );
  const opacityPonta = Math.min(1, progressoPonta);
  const escalaPonta = interpolate(progressoPonta, [0, 1], [0.3, 1]);

  const opacitySaida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const anguloFinalDeg = (anguloFinalRad * 180) / Math.PI;
  const espessuraPx = width * espessura;
  const tamanhoPontaPx = espessuraPx * 4;

  return (
    <Sequence name="Seta">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", top: 0, left: 0, opacity: opacitySaida }}
      >
        <path
          d={path}
          fill="none"
          stroke={cor}
          strokeWidth={espessuraPx}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - progresso}
        />
        <g
          transform={`translate(${xFinalPx}, ${yFinalPx}) rotate(${anguloFinalDeg}) scale(${escalaPonta})`}
          style={{ opacity: opacityPonta }}
        >
          <polygon
            points={`0,0 ${-tamanhoPontaPx},${-tamanhoPontaPx / 2} ${-tamanhoPontaPx},${tamanhoPontaPx / 2}`}
            fill={cor}
          />
        </g>
      </svg>
    </Sequence>
  );
};
