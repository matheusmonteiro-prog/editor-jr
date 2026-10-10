import React from "react";
import {
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// Um vídeo dentro de uma caixa (fração de width/height), fundo transparente.
// Sem barras nem corte: o vídeo preenche a caixa, então use largura/altura
// com a proporção do arquivo.

export const camadaVideoSchema = z.object({
  src: z.string(), // relativo a public/, ex.: "videos/tela.mp4"
  x: z.number().min(0).max(1).default(0.5), // centro da caixa
  y: z.number().min(0).max(1).default(0.5),
  largura: z.number().min(0.05).max(1).default(1),
  altura: z.number().min(0.05).max(1).default(1),
  volume: z.number().min(0).max(1).default(1),
  mudo: z.boolean().default(false),
  duracaoFrames: z.number().min(1).optional(), // sem ela, toca até o fim
  framesEntrada: z.number().min(0).default(0),
  framesSaida: z.number().min(0).default(0),
});

// z.input: as props com .default() podem ser omitidas ao usar o componente.
type Props = z.input<typeof camadaVideoSchema>;

export const CamadaVideo: React.FC<Props> = ({
  src,
  x = 0.5,
  y = 0.5,
  largura = 1,
  altura = 1,
  volume = 1,
  mudo = false,
  duracaoFrames,
  framesEntrada = 0,
  framesSaida = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Passou da duração: desmonta, o vídeo para de ser lido.
  if (duracaoFrames !== undefined && frame >= duracaoFrames) return null;

  const fim = duracaoFrames ?? durationInFrames;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const entrada =
    framesEntrada > 0 ? interpolate(frame, [0, framesEntrada], [0, 1], clamp) : 1;
  const saida =
    framesSaida > 0 ? interpolate(frame, [fim - framesSaida, fim], [1, 0], clamp) : 1;

  const larguraPx = width * largura;
  const alturaPx = height * altura;

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - larguraPx / 2,
        top: height * y - alturaPx / 2,
        width: larguraPx,
        height: alturaPx,
        opacity: Math.min(entrada, saida),
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        volume={volume}
        muted={mudo}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
