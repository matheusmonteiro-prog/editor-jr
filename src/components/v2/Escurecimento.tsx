import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Véu chapado que escurece a tela aos poucos, para fechar um vídeo. Fica por cima da câmera:
// no plano, vem antes dos elementos que devem continuar claros.

export const escurecimentoSchema = z.object({
  cor: zColor().default("#0F2A1D"),
  opacidade: z.number().min(0).max(1).default(0.45), // quanto escurece no fim
  framesEntrada: z.number().min(1).default(60),
});

type Props = z.infer<typeof escurecimentoSchema>;

export const Escurecimento: React.FC<Props> = ({
  cor = "#0F2A1D",
  opacidade = 0.45,
  framesEntrada = 60,
}) => {
  const frame = useCurrentFrame();
  return (
    <Sequence name="Escurecimento">
      <AbsoluteFill
        style={{
          backgroundColor: cor,
          opacity: interpolate(frame, [0, framesEntrada], [0, opacidade], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </Sequence>
  );
};
