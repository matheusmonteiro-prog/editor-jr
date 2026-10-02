import React from "react";
import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — aviso de compliance (CVM).
//
// O TEXTO do aviso NUNCA é decidido aqui: vem sempre do plano de edição, via
// prop "texto". O padrão (string vazia) é só um placeholder genérico — o
// texto oficial e a eventual exigência de tempo mínimo em tela são decisão
// do Matheus (ver docs/perguntas-pendentes.md).
//
// Mesma composição serve pra vertical e horizontal: tudo em fração de
// width/height via useVideoConfig(), sem variante separada (ver
// ARQUITETURA.md seção 6, "não criar variante horizontal sem pedido
// explícito"). "posicao" só aceita topo/rodape (nunca centro) pra nunca
// cobrir o rosto do JR, que fica centralizado por padrão (ver seção 3).

export const avisoCVMSchema = z.object({
  texto: z.string().default(""),
  posicao: z.enum(["topo", "rodape"]).default("rodape"),
  tamanhoFonte: z.number().min(0.005).max(0.1).default(0.022),
  corTexto: zColor().default("#F5F0E6"),
  corFundo: zColor().default("rgba(15, 42, 29, 0.78)"),
  mostrarFundo: z.boolean().default(true),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof avisoCVMSchema>;

export const AvisoCVM: React.FC<Props> = ({
  texto = "",
  posicao = "rodape",
  tamanhoFonte = 0.022,
  corTexto = "#F5F0E6",
  corFundo = "rgba(15, 42, 29, 0.78)",
  mostrarFundo = true,
  duracaoFrames = 150,
  framesEntrada = 15,
  framesSaida = 15,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

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
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: posicao === "topo" ? "flex-start" : "flex-end",
          padding: `${fontSize * 0.6}px 0`,
        }}
      >
        <span
          style={{
            color: corTexto,
            backgroundColor: mostrarFundo ? corFundo : "transparent",
            fontSize,
            fontWeight: 600,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            lineHeight: 1.4,
            padding: mostrarFundo ? `${fontSize * 0.4}px ${fontSize * 0.8}px` : 0,
            borderRadius: mostrarFundo ? fontSize * 0.25 : 0,
            maxWidth: "90%",
            opacity: opacidade,
          }}
        >
          {texto}
        </span>
      </div>
    </Sequence>
  );
};
