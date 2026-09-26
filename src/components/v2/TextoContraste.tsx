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
import { zColor } from "@remotion/zod-types";

// Componente v2 — do zero. Duas palavras em contraste: uma positiva (com
// check verde desenhado + glow) e uma negativa (cinza, riscada num frame
// configurável). Tamanhos em fração da largura do vídeo.

export const textoContrasteSchema = z.object({
  corFundo: zColor(),
  textoPositivo: z.string(),
  textoNegativo: z.string(),
  corPositivo: zColor(),
  corNegativo: zColor(),
  frameRisco: z.number().min(0),
  duracaoFramesRisco: z.number().min(1),
  tamanhoFontePositivo: z.number().min(0.005).max(0.5),
  tamanhoFonteNegativo: z.number().min(0.005).max(0.5),
  // Opcional (26/09/2026): PNG de fundo transparente, de
  // public/images/personagens/. Sem ela, o componente funciona igual a
  // antes. Entra junto com o texto positivo, com zoom.
  imagemPersonagem: z.string().optional(),
  tamanhoImagemPersonagem: z.number().min(0.05).max(0.6).optional(),
});

type Props = z.infer<typeof textoContrasteSchema>;

const framesDesenhoCheck = 14;

export const TextoContraste: React.FC<Props> = ({
  corFundo,
  textoPositivo,
  textoNegativo,
  corPositivo,
  corNegativo,
  frameRisco,
  duracaoFramesRisco,
  tamanhoFontePositivo,
  tamanhoFonteNegativo,
  imagemPersonagem,
  tamanhoImagemPersonagem = 0.22,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const entradaPositivo = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.6 },
  });
  const opacityPositivo = Math.min(1, entradaPositivo);
  const translatePositivo = interpolate(entradaPositivo, [0, 1], [30, 0]);
  const escalaPersonagem = interpolate(entradaPositivo, [0, 1], [0.6, 1]);
  const tamanhoImagemPx = width * tamanhoImagemPersonagem;

  const progressoCheck = interpolate(
    frame,
    [framesDesenhoCheck, framesDesenhoCheck * 2],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacityNegativo = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const progressoRisco = interpolate(
    frame,
    [frameRisco, frameRisco + duracaoFramesRisco],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fontePositivo = width * tamanhoFontePositivo;
  const fonteNegativo = width * tamanhoFonteNegativo;
  const checkTamanho = fontePositivo * 0.9;

  return (
    <Sequence name="TextoContraste">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: width * 0.07,
          gap: width * 0.03,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: fontePositivo * 0.4,
            opacity: opacityPositivo,
            transform: `translateY(${translatePositivo}px)`,
          }}
        >
          <span
            style={{
              color: corPositivo,
              fontSize: fontePositivo,
              fontWeight: 800,
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              letterSpacing: 1,
              textTransform: "uppercase",
              textShadow: `0 0 ${fontePositivo * 0.3}px ${corPositivo}99`,
            }}
          >
            {textoPositivo}
          </span>
          <svg width={checkTamanho} height={checkTamanho} viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={46}
              fill={corPositivo}
              fillOpacity={0.15}
            />
            <path
              d="M 26 52 L 43 70 L 76 30"
              fill="none"
              stroke={corPositivo}
              strokeWidth={11}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - progressoCheck}
            />
          </svg>
          {imagemPersonagem && (
            <div
              style={{
                width: tamanhoImagemPx,
                height: tamanhoImagemPx,
                transform: `scale(${escalaPersonagem})`,
                flexShrink: 0,
              }}
            >
              <Img
                src={staticFile(`images/personagens/${imagemPersonagem}`)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            opacity: opacityNegativo,
          }}
        >
          <span
            style={{
              color: corNegativo,
              fontSize: fonteNegativo,
              fontWeight: 800,
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {textoNegativo}
          </span>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              height: fonteNegativo * 0.06,
              width: `${progressoRisco}%`,
              backgroundColor: corNegativo,
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>
    </Sequence>
  );
};
