import React from "react";
import {
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// Componente v2 — UM personagem só, camada própria (regra de 26/09/2026:
// cada elemento visual que aparece em momento diferente é uma <Sequence>
// própria, nunca escondido dentro de outro componente). PNG de fundo
// transparente, de public/images/personagens/. Tamanho e posição em fração
// da largura/altura do vídeo.

export const personagemImagemSchema = z.object({
  imagem: z.string(),
  top: z.number().min(0).max(1),
  left: z.number().min(0).max(1),
  tamanho: z.number().min(0.05).max(0.8),
  duracaoFrames: z.number().min(10),
  framesSaida: z.number().min(1),
});

type Props = z.infer<typeof personagemImagemSchema>;

export const PersonagemImagem: React.FC<Props> = ({
  imagem,
  top,
  left,
  tamanho,
  duracaoFrames,
  framesSaida,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.7 },
  });
  const escala = interpolate(entrada, [0, 1], [0.6, 1]);
  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tamanhoPx = width * tamanho;

  return (
    <Sequence name={`PersonagemImagem: ${imagem}`}>
      <div
        style={{
          position: "absolute",
          left: width * left,
          top: height * top,
          width: tamanhoPx,
          height: tamanhoPx,
          opacity: Math.min(1, entrada) * saida,
          transform: `scale(${escala})`,
        }}
      >
        <Img
          src={staticFile(`images/personagens/${imagem}`)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </Sequence>
  );
};
