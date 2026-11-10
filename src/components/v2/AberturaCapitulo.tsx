import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { estiloSubida, FONTE_KIT, KIT, progresso } from "./kitV3";
import { FundoExplicativo } from "./FundoExplicativo";

// Kit v3, seção 4.5 (anexo 6): abertura de capítulo, 2 a 3 s, tudo centralizado
// sobre o fundo explicativo bem escuro. "PARTE N" em amarelo, título em Montserrat Black
// (até 3 palavras) e subtítulo dizendo o que vai ser falado.

export const aberturaCapituloSchema = z.object({
  rotulo: z.string().default("Parte 1"),
  titulo: z.string().default("Terra x Bolsa"),
  subtitulo: z.string().default("valorização, dividendo e a régua do canal"),
  comFundo: z.boolean().default(true),
  // Vazio = sem logo (padrão desde 04/11, pedido A-004: o YouTube já mostra a marca do canal).
  logo: z.string().default(""),
  corDestaque: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(30).default(90),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof aberturaCapituloSchema>;

export const AberturaCapitulo: React.FC<Props> = ({
  rotulo = "Parte 1",
  titulo = "Terra x Bolsa",
  subtitulo = "valorização, dividendo e a régua do canal",
  comFundo = true,
  logo = "",
  corDestaque = KIT.amarelo,
  duracaoFrames = 90,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const fica = 1 - progresso(frame, duracaoFrames - framesSaida, framesSaida);
  const sub = W * 0.012;

  return (
    <Sequence name="AberturaCapitulo">
      <AbsoluteFill style={{ fontFamily: FONTE_KIT }}>
        {comFundo ? <FundoExplicativo duracaoFrames={duracaoFrames} corLinha={corDestaque} /> : null}
        {logo ? (
          <Img
            src={staticFile(logo)}
            style={{
              position: "absolute",
              left: W * 0.045,
              top: W * 0.032,
              width: W * 0.09,
              ...estiloSubida(progresso(frame, 0, 12) * fica, sub),
            }}
          />
        ) : null}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: W * 0.011,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: W * 0.015,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: corDestaque,
              ...estiloSubida(progresso(frame, 2, 15) * fica, sub),
            }}
          >
            {rotulo}
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: W * 0.073,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: KIT.creme,
              ...estiloSubida(progresso(frame, 7, 15) * fica, sub),
            }}
          >
            {titulo}
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: W * 0.02,
              lineHeight: 1.2,
              color: KIT.cremeSuave,
              ...estiloSubida(progresso(frame, 12, 15) * fica, sub),
            }}
          >
            {subtitulo}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};
