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

export const textoDestaqueSchema = z.object({
  texto: z.string(),
  posicao: z.enum(["topo", "centro", "rodape"]),
  duracaoFrames: z.number().min(10),
  corTexto: zColor(),
  corFundo: zColor(),
  mostrarFundo: z.boolean(),
  tamanhoFonte: z.number().min(10),
});

type Props = z.infer<typeof textoDestaqueSchema>;

const framesEntrada = 12;
const framesSaida = 15;

const alinhamentoPorPosicao: Record<Props["posicao"], React.CSSProperties> = {
  topo: { alignItems: "flex-start", paddingTop: 80 },
  centro: { alignItems: "center" },
  rodape: { alignItems: "flex-end", paddingBottom: 80 },
};

export const TextoDestaque: React.FC<Props> = ({
  texto,
  posicao,
  duracaoFrames,
  corTexto,
  corFundo,
  mostrarFundo,
  tamanhoFonte,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.6 },
    durationInFrames: framesEntrada,
  });

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = Math.min(entrada, saida);
  const scale = interpolate(entrada, [0, 1], [0.85, 1]);

  return (
    <Sequence name="TextoDestaque">
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          ...alinhamentoPorPosicao[posicao],
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            backgroundColor: mostrarFundo ? corFundo : "transparent",
            padding: mostrarFundo ? "16px 32px" : 0,
            borderRadius: 12,
            textShadow: mostrarFundo ? "none" : "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          <span
            style={{
              color: corTexto,
              fontSize: tamanhoFonte,
              fontWeight: 800,
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {texto}
          </span>
        </div>
      </div>
    </Sequence>
  );
};
