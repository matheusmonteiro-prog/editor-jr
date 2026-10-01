import React from "react";
import {
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — do zero. Círculo "desenhado à mão" em volta de uma região
// da tela (uma palavra, um número, um ponto do vídeo), pra destacar. O
// traço se completa na entrada e some (fade) na saída. Nada de biblioteca de
// terceiro: a forma sketchy vem de uma elipse com pequenos desvios de raio,
// fixos (não aleatórios), ligados por curvas suaves — mesma técnica já usada
// em GraficoCrescimento para a linha "realista".

export const circuloDestaqueSchema = z.object({
  posicaoX: z.number().min(0).max(1).default(0.5),
  posicaoY: z.number().min(0).max(1).default(0.5),
  largura: z.number().min(0.02).max(1).default(0.3),
  altura: z.number().min(0.02).max(1).default(0.15),
  cor: zColor().default("#EFAF20"),
  espessura: z.number().min(0.001).max(0.05).default(0.006),
  duracaoFrames: z.number().min(10).default(60),
  framesEntrada: z.number().min(1).default(20),
  framesSaida: z.number().min(1).default(15),
  // Opcional: padrão transparente, pra não tampar o vídeo por engano quando
  // usado como camada (mesma regra dos outros componentes do catálogo).
  corFundo: zColor().optional(),
});

type Props = z.infer<typeof circuloDestaqueSchema>;

// Variação de raio por ponto ao redor da elipse, fixa (não aleatória) — dá o
// efeito de traço à mão livre, em vez de uma elipse geométrica perfeita.
const VARIACAO_RAIO = [
  1, 0.96, 1.03, 0.98, 1.05, 0.97, 1.02, 0.99, 1.04, 0.96, 1.01, 0.98,
];
const NUM_PONTOS = VARIACAO_RAIO.length;

const criarPathFechado = (pontos: { x: number; y: number }[]): string => {
  const ultimo = pontos[pontos.length - 1];
  const primeiro = pontos[0];
  const meioInicial = { x: (ultimo.x + primeiro.x) / 2, y: (ultimo.y + primeiro.y) / 2 };
  let d = `M ${meioInicial.x} ${meioInicial.y}`;
  for (let i = 0; i < pontos.length; i++) {
    const atual = pontos[i];
    const proximo = pontos[(i + 1) % pontos.length];
    const meio = { x: (atual.x + proximo.x) / 2, y: (atual.y + proximo.y) / 2 };
    d += ` Q ${atual.x} ${atual.y} ${meio.x} ${meio.y}`;
  }
  return d + " Z";
};

export const CirculoDestaque: React.FC<Props> = ({
  posicaoX = 0.5,
  posicaoY = 0.5,
  largura = 0.3,
  altura = 0.15,
  cor = "#EFAF20",
  espessura = 0.006,
  duracaoFrames = 60,
  framesEntrada = 20,
  framesSaida = 15,
  corFundo = "transparent",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cx = width * posicaoX;
  const cy = height * posicaoY;
  const rx = (width * largura) / 2;
  const ry = (height * altura) / 2;

  const pontos = VARIACAO_RAIO.map((fator, i) => {
    const angulo = (i / NUM_PONTOS) * Math.PI * 2;
    return {
      x: cx + Math.cos(angulo) * rx * fator,
      y: cy + Math.sin(angulo) * ry * fator,
    };
  });
  const path = criarPathFechado(pontos);

  const progressoTraco = interpolate(frame, [0, framesEntrada], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacitySaida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Sequence name="CirculoDestaque">
      <div style={{ position: "absolute", inset: 0, backgroundColor: corFundo }}>
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
            strokeWidth={width * espessura}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - progressoTraco}
            opacity={opacitySaida}
          />
        </svg>
      </div>
    </Sequence>
  );
};
