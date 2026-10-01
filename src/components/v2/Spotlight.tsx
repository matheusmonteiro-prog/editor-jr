import React from "react";
import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Nota para a futura PlanoComposicao (Etapa 6): o Spotlight deve ficar
// ABAIXO dos cards (ex.: Contador) na ordem das camadas, já que ele escurece
// o resto da tela e um card por cima dele continuaria legível.

export const spotlightSchema = z.object({
  x: z.number().min(0).max(1).default(0.5),
  y: z.number().min(0).max(1).default(0.4),
  raio: z.number().min(0.02).max(0.6).default(0.18),
  corEscurecimento: zColor().default("#0F2A1D"),
  opacidadeEscurecimento: z.number().min(0).max(1).default(0.65),
  corBorda: zColor().default("#EFAF20"),
  espessuraBorda: z.number().min(0).default(2),
  framesEntrada: z.number().min(1).default(18),
  framesSaida: z.number().min(1).default(15),
  duracaoFrames: z.number().min(10).default(90),
  suavizacao: z.number().min(0).max(0.3).default(0),
});

type Props = z.infer<typeof spotlightSchema>;

export const Spotlight: React.FC<Props> = ({
  x = 0.5,
  y = 0.4,
  raio = 0.18,
  corEscurecimento = "#0F2A1D",
  opacidadeEscurecimento = 0.65,
  corBorda = "#EFAF20",
  espessuraBorda = 2,
  framesEntrada = 18,
  framesSaida = 15,
  duracaoFrames = 90,
  suavizacao = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.7 },
    durationInFrames: framesEntrada,
  });
  const entradaClamp = Math.max(0, Math.min(1, entrada));

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const raioAtualPx = width * raio * entradaClamp;
  const suavizacaoPx = width * suavizacao;
  const xPx = width * x;
  const yPx = height * y;

  const inicioTransicao = Math.max(0, raioAtualPx - suavizacaoPx);
  const mask = `radial-gradient(circle at ${xPx}px ${yPx}px, transparent 0px, transparent ${inicioTransicao}px, black ${raioAtualPx}px, black 100%)`;

  return (
    <Sequence name="Spotlight">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: corEscurecimento,
          opacity: opacidadeEscurecimento * saida,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      {espessuraBorda > 0 && (
        <div
          style={{
            position: "absolute",
            top: yPx - raioAtualPx,
            left: xPx - raioAtualPx,
            width: raioAtualPx * 2,
            height: raioAtualPx * 2,
            borderRadius: "50%",
            border: `${espessuraBorda}px solid ${corBorda}`,
            boxSizing: "border-box",
            opacity: saida,
          }}
        />
      )}
    </Sequence>
  );
};
