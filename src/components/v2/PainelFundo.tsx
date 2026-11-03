import React from "react";
import {
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// Folha chapada que tampa o vídeo base (a tela do OBS) enquanto a câmera está
// numa caixa menor. No plano: vem ANTES de gráficos e legenda na lista
// "elementos" (o último fica por cima). A câmera troca de caixa de uma vez,
// então o painel entra 0,7 s antes da troca e sai 0,7 s depois da volta.

const FORMATOS = {
  "dividida-direita": { left: 0.5, largura: 0.5, lado: 1 },
  "dividida-esquerda": { left: 0, largura: 0.5, lado: -1 },
  "tela-pequena-esquerda": { left: 0, largura: 1, lado: 1, janela: "esquerda" },
  "tela-pequena-direita": { left: 0, largura: 1, lado: -1, janela: "direita" },
  "tela-cheia": { left: 0, largura: 1, lado: 1 },
} as const;

// Janela da tela pequena, em fração do menor lado do vídeo (384 px e margem de
// 77 px em 1920x1080). Raio: os 28 px do kit.
const LADO_JANELA = 0.356;
const MARGEM_JANELA = 0.0713;
const RAIO_JANELA = 0.026;

export const painelFundoSchema = z.object({
  formato: z
    .enum([
      "dividida-direita",
      "dividida-esquerda",
      "tela-pequena-esquerda",
      "tela-pequena-direita",
      "tela-cheia",
    ])
    .default("dividida-direita"),
  cor: z.enum(["#0F2A1D", "#F5F0E6"]).default("#0F2A1D"),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(1).default(21),
  framesSaida: z.number().min(1).default(21),
});

type Props = z.infer<typeof painelFundoSchema>;

export const PainelFundo: React.FC<Props> = ({
  formato = "dividida-direita",
  cor = "#0F2A1D",
  duracaoFrames = 150,
  framesEntrada = 21,
  framesSaida = 21,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const config = FORMATOS[formato];
  const janela = "janela" in config ? config.janela : null;

  // interpolate, e não spring: precisa estar 100% no lugar no quadro exato em que a
  // câmera troca de caixa (a spring para em 99,5% e deixaria uma fresta do OBS).
  const entrada = interpolate(frame, [0, framesEntrada], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saida = interpolate(frame, [duracaoFrames - framesSaida, duracaoFrames], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deslocamento = (1 - entrada + saida) * config.lado * 100;

  const menorLado = Math.min(width, height);
  const ladoJanela = menorLado * LADO_JANELA;
  const margemJanela = menorLado * MARGEM_JANELA;

  return (
    <Sequence name="PainelFundo">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: width * config.left,
          width: width * config.largura,
          height,
          overflow: "hidden",
          backgroundColor: janela ? "transparent" : cor,
          transform: `translateX(${deslocamento}%)`,
        }}
      >
        {janela ? (
          // O buraco é a própria div: a borda sem desfoque pinta a folha em
          // volta dela, e o overflow corta no limite da tela.
          <div
            style={{
              position: "absolute",
              top: height - margemJanela - ladoJanela,
              left: janela === "esquerda" ? margemJanela : width - margemJanela - ladoJanela,
              width: ladoJanela,
              height: ladoJanela,
              borderRadius: menorLado * RAIO_JANELA,
              boxShadow: `0 0 0 ${width + height}px ${cor}`,
            }}
          />
        ) : null}
      </div>
    </Sequence>
  );
};
