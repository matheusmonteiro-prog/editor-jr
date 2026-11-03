import React from "react";
import {
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Anton";

// Palavra de impacto do kit (4.4): Anton inclinada, terço inferior, entra de 170% a 100%
// em 0,4 s. Anton é provisória até o Matheus escolher a fonte.
const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export const textoImpactoSchema = z.object({
  texto: z.string().default("Minha paixão é números"),
  destaque: z.string().default("números"), // trecho do texto na cor de destaque
  y: z.number().min(0).max(1).default(0.8), // centro do texto
  tamanhoFonte: z.number().min(0.01).max(0.2).default(0.06), // fração da largura
  corTexto: zColor().default("#F5F0E6"),
  corDestaque: zColor().default("#EFAF20"),
  corContorno: zColor().default("#0F2A1D"),
  duracaoFrames: z.number().min(10).default(90),
  framesEntrada: z.number().min(1).default(12),
  framesSaida: z.number().min(1).default(8),
});

type Props = z.infer<typeof textoImpactoSchema>;

export const TextoImpacto: React.FC<Props> = ({
  texto = "Minha paixão é números",
  destaque = "números",
  y = 0.8,
  tamanhoFonte = 0.06,
  corTexto = "#F5F0E6",
  corDestaque = "#EFAF20",
  corContorno = "#0F2A1D",
  duracaoFrames = 90,
  framesEntrada = 12,
  framesSaida = 8,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const escala = interpolate(frame, [0, framesEntrada], [1.7, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const opacidade = Math.min(
    interpolate(frame, [0, 3], [0, 1], clamp),
    interpolate(frame, [duracaoFrames - framesSaida, duracaoFrames], [1, 0], clamp),
  );

  const i = destaque ? texto.toUpperCase().indexOf(destaque.toUpperCase()) : -1;
  const maiusculo = texto.toUpperCase();

  return (
    <Sequence name="TextoImpacto">
      <div
        style={{
          position: "absolute",
          left: width * 0.05,
          width: width * 0.9,
          top: height * y,
          textAlign: "center",
          fontFamily,
          fontSize: width * tamanhoFonte,
          lineHeight: 1.1,
          color: corTexto,
          WebkitTextStroke: `${width * 0.0035}px ${corContorno}`,
          paintOrder: "stroke fill",
          opacity: opacidade,
          transform: `translateY(-50%) skewX(-8deg) scale(${escala})`,
        }}
      >
        {i < 0 ? (
          maiusculo
        ) : (
          <>
            {maiusculo.slice(0, i)}
            <span style={{ color: corDestaque }}>{maiusculo.slice(i, i + destaque.length)}</span>
            {maiusculo.slice(i + destaque.length)}
          </>
        )}
      </div>
    </Sequence>
  );
};
