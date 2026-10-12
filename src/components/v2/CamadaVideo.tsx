import React from "react";
import {
  Loop,
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
  opacidade: z.number().min(0).max(1).default(1), // animada de fora, sem remontar o vídeo
  repetirFrames: z.number().min(1).optional(), // duração do arquivo: repete (Loop) até o fim
  framesEntrada: z.number().min(0).default(0),
  framesSaida: z.number().min(0).default(0),
  // "cobrir" = objectFit cover, "conter" = contain. Sem ajuste: como antes
  // (nenhum objectFit), pra não mudar os testes que já usam a camada.
  ajuste: z.enum(["cobrir", "conter"]).optional(),
  // Pula esses frames do começo do arquivo (trimBefore do Remotion). Sem ele: como antes.
  pularFrames: z.number().int().min(0).optional(),
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
  opacidade = 1,
  repetirFrames,
  framesEntrada = 0,
  framesSaida = 0,
  ajuste = undefined,
  pularFrames = undefined,
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

  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      volume={volume}
      muted={mudo}
      trimBefore={pularFrames || undefined}
      style={{
        width: "100%",
        height: "100%",
        ...(ajuste ? { objectFit: ajuste === "conter" ? "contain" : "cover" } : {}),
      }}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - larguraPx / 2,
        top: height * y - alturaPx / 2,
        width: larguraPx,
        height: alturaPx,
        opacity: Math.min(entrada, saida) * opacidade,
      }}
    >
      {/* Loop fica só em volta do vídeo: caixa e opacidade seguem o frame da composição */}
      {repetirFrames !== undefined ? (
        <Loop durationInFrames={Math.max(1, repetirFrames - (pularFrames ?? 0))} layout="none">
          {video}
        </Loop>
      ) : (
        video
      )}
    </div>
  );
};
