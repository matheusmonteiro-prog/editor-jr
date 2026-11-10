import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { coresTema, estiloSubida, FONTE_KIT, KIT, progresso, temaSchema } from "./kitV3";
import { FundoExplicativo } from "./FundoExplicativo";

// Kit v3, seção 4.14 (anexo 2): pauta do vídeo, logo depois do gancho.
// Título de cartaz em caixa alta Amarelo JR e até 3 itens numerados, alinhados à esquerda.

const itemPautaSchema = z.object({
  texto: z.string(),
  complemento: z.string().default(""),
});

export const pautaSchema = z.object({
  titulo: z.string().default("Duas partes:"),
  itens: z
    .array(itemPautaSchema)
    .max(3)
    .default([
      { texto: "Quem é o JR", complemento: "(do sítio à Bolsa de Valores)" },
      { texto: "A terra como régua", complemento: "(valorização x dividendo)" },
    ]),
  comFundo: z.boolean().default(true),
  numerado: z.boolean().default(true),
  // Sem numeração: marcador antes de cada item (04/11, A-012: "com um ponto, fica mais didático").
  // Vazio = sem marcador.
  marcador: z.string().default("•"),
  tema: temaSchema.default("escuro"),
  corFundoClaro: zColor().default("#F5F0E6"),
  topo: z.number().min(0).max(0.8).default(0.24),
  // Opcional: quadro de entrada de cada item, preso ao tempo da fala.
  inicioItens: z.array(z.number().min(0)).default([]),
  // Vazio = sem logo (padrão desde 04/11, pedido A-004: o YouTube já mostra a marca do canal).
  logo: z.string().default(""),
  corDestaque: zColor().default("#FFC629"),
  framesEntreItens: z.number().min(1).default(12),
  duracaoFrames: z.number().min(30).default(150),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof pautaSchema>;

export const Pauta: React.FC<Props> = ({
  titulo = "Duas partes:",
  itens = [
    { texto: "Quem é o JR", complemento: "(do sítio à Bolsa de Valores)" },
    { texto: "A terra como régua", complemento: "(valorização x dividendo)" },
  ],
  comFundo = true,
  numerado = true,
  marcador = "•",
  tema = "escuro",
  corFundoClaro = KIT.creme,
  topo = 0.24,
  inicioItens = [],
  logo = "",
  corDestaque = KIT.amarelo,
  framesEntreItens = 12,
  duracaoFrames = 150,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const cores = coresTema(tema, corFundoClaro);
  // No tema claro, destaque em marrom (amarelo só sobre escuro), a não ser que outra cor seja passada.
  const cor = tema === "claro" && corDestaque === KIT.amarelo ? cores.destaque : corDestaque;
  const { width: W, height: H } = useVideoConfig();
  const fica = 1 - progresso(frame, duracaoFrames - framesSaida, framesSaida);
  const sub = W * 0.012;

  return (
    <Sequence name="Pauta">
      <AbsoluteFill style={{ fontFamily: FONTE_KIT }}>
        {comFundo ? (
          <FundoExplicativo duracaoFrames={duracaoFrames} corLinha={cor} tema={tema} corFundoClaro={corFundoClaro} />
        ) : null}
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
        <div
          style={{
            position: "absolute",
            left: W * 0.09,
            right: W * 0.09,
            top: H * topo,
            display: "flex",
            flexDirection: "column",
            gap: W * 0.024,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: W * 0.06,
              lineHeight: 1,
              textTransform: "uppercase",
              color: cor,
              ...estiloSubida(progresso(frame, 3, 14) * fica, sub),
            }}
          >
            {titulo}
          </div>
          {itens.map((item, i) => (
            <div
              key={`${item.texto}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: numerado || marcador ? "auto 1fr" : "1fr",
                columnGap: W * 0.01,
                ...estiloSubida(progresso(frame, inicioItens[i] ?? 3 + (i + 1) * framesEntreItens, 14) * fica, sub),
              }}
            >
              {numerado ? (
                <span style={{ fontWeight: 900, fontSize: W * 0.034, lineHeight: 1.1, color: cor }}>
                  {i + 1}.
                </span>
              ) : marcador ? (
                <span style={{ fontWeight: 900, fontSize: W * 0.034, lineHeight: 1.1, color: cor }}>{marcador}</span>
              ) : null}
              <span style={{ fontWeight: 800, fontSize: W * 0.034, lineHeight: 1.1, color: cores.texto }}>
                {item.texto}
              </span>
              {item.complemento ? (
                <span
                  style={{
                    gridColumn: numerado || marcador ? 2 : 1,
                    fontWeight: 500,
                    fontSize: W * 0.022,
                    lineHeight: 1.3,
                    color: cores.textoSuave,
                  }}
                >
                  {item.complemento}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
