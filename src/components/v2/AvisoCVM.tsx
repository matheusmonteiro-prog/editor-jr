import React from "react";
import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — aviso de compliance (CVM), faixa de texto no canto inferior
// esquerdo, dentro da área segura. Tudo em fração de width/height via
// useVideoConfig(), então serve pra vertical e horizontal sem variante.
//
// TEXTO PROVISÓRIO: a definir pelo Matheus/JR antes de publicar qualquer
// vídeo (ver docs/perguntas-pendentes.md). O plano de edição pode sobrescrever.

const TEXTO_PROVISORIO =
  "Conteúdo informativo. Não constitui recomendação ou indicação de investimento.";

export const avisoCVMSchema = z.object({
  texto: z.string().default(TEXTO_PROVISORIO),
  tamanhoFonte: z.number().min(0.005).max(0.1).default(0.024),
  margemVertical: z.number().min(0).max(0.3).default(0.05),
  margemHorizontal: z.number().min(0).max(0.3).default(0.04),
  corTexto: zColor().default("#F5F0E6"),
  corFundo: zColor().optional(),
  corCard: zColor().default("rgba(15, 42, 29, 0.78)"),
  mostrarFundo: z.boolean().default(true),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof avisoCVMSchema>;

export const AvisoCVM: React.FC<Props> = ({
  texto = TEXTO_PROVISORIO,
  tamanhoFonte = 0.024,
  margemVertical = 0.05,
  margemHorizontal = 0.04,
  corTexto = "#F5F0E6",
  corFundo = "transparent",
  corCard = "rgba(15, 42, 29, 0.78)",
  mostrarFundo = true,
  duracaoFrames = 150,
  framesEntrada = 15,
  framesSaida = 15,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacidade = interpolate(
    frame,
    [0, framesEntrada, duracaoFrames - framesSaida, duracaoFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fontSize = width * tamanhoFonte;

  return (
    <Sequence name="AvisoCVM">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: corFundo,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: width * margemHorizontal,
            bottom: height * margemVertical,
            maxWidth: width * (1 - 2 * margemHorizontal),
            color: corTexto,
            backgroundColor: mostrarFundo ? corCard : "transparent",
            fontSize,
            fontWeight: 600,
            fontFamily: "Arial, sans-serif",
            textAlign: "left",
            lineHeight: 1.4,
            padding: mostrarFundo ? `${fontSize * 0.4}px ${fontSize * 0.8}px` : 0,
            borderRadius: mostrarFundo ? fontSize * 0.25 : 0,
            opacity: opacidade,
          }}
        >
          {texto}
        </span>
      </div>
    </Sequence>
  );
};
