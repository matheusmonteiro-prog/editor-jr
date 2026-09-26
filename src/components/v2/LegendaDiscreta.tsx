import React from "react";
import {
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — do zero. Legenda pequena, sem card, fade simples. Pra
// respiros entre cenas mais chamativas.

export const legendaDiscretaSchema = z.object({
  texto: z.string(),
  corTexto: zColor(),
  tamanhoFonte: z.number().min(0.005).max(0.5),
  posicao: z.enum(["topo", "centro", "rodape"]),
  duracaoFrames: z.number().min(10),
});

type Props = z.infer<typeof legendaDiscretaSchema>;

const alinhamentoPorPosicao: Record<Props["posicao"], React.CSSProperties> = {
  topo: { alignItems: "flex-start", paddingTop: "8%" },
  centro: { alignItems: "center" },
  rodape: { alignItems: "flex-end", paddingBottom: "8%" },
};

export const LegendaDiscreta: React.FC<Props> = ({
  texto,
  corTexto,
  tamanhoFonte,
  posicao,
  duracaoFrames,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 15, duracaoFrames - 15, duracaoFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Sequence name="LegendaDiscreta">
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          ...alinhamentoPorPosicao[posicao],
        }}
      >
        <span
          style={{
            color: corTexto,
            fontSize: width * tamanhoFonte,
            fontWeight: 700,
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            letterSpacing: 1,
            textAlign: "center",
            opacity,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}
        >
          {texto.toUpperCase()}
        </span>
      </div>
    </Sequence>
  );
};
