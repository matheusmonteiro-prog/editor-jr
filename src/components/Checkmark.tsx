import React from "react";
import {
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const checkmarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  tamanho: z.number().min(10),
  cor: zColor(),
  corFundo: zColor(),
  mostrarFundo: z.boolean(),
  duracaoFrames: z.number().min(10),
});

type Props = z.infer<typeof checkmarkSchema>;

const framesEntrada = 15;
const framesSaida = 12;

export const Checkmark: React.FC<Props> = ({
  x,
  y,
  tamanho,
  cor,
  corFundo,
  mostrarFundo,
  duracaoFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
    durationInFrames: framesEntrada,
  });

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = Math.min(entrada, saida);
  const scale = interpolate(entrada, [0, 1], [0.4, 1]);

  return (
    <Sequence name="Checkmark">
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
        }}
      >
        <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
          {mostrarFundo && <circle cx={50} cy={50} r={48} fill={corFundo} />}
          <path
            d="M 28 52 L 44 68 L 74 34"
            fill="none"
            stroke={cor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Sequence>
  );
};
