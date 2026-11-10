import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { estiloSubida, FONTE_KIT, KIT, progresso } from "./kitV3";
import { FundoExplicativo } from "./FundoExplicativo";

// Kit v3, seção 4.13 (anexo 8): "transcrição gráfica" de dois números.
// Rótulo de contexto, título curto, e dois blocos (rótulo + número grande) com uma seta
// amarela se desenhando entre eles. O segundo número sobe com contador a partir do primeiro.
// Rodapé com fonte e data é OBRIGATÓRIO. Sem dado real, deixar `ilustrativo` ligado.
// Feito para ficar sobre a TransicaoJanela (JR na janela do centro superior).

export const comparacaoNumerosSchema = z.object({
  rotulo: z.string().default("Ação exemplo · ilustrativo"),
  titulo: z.string().default("Preço x valor calculado"),
  rotuloAntes: z.string().default("Preço hoje"),
  valorAntes: z.number().default(32.4),
  rotuloDepois: z.string().default("Valor calculado"),
  valorDepois: z.number().default(38.1),
  prefixo: z.string().default("R$ "),
  casasDecimais: z.number().min(0).max(4).default(2),
  // Vermelho-terra só se for queda ou piora (kit, seção 2). Nunca o verde do método aqui.
  corDepois: z.enum(["creme", "amarelo", "vermelho"]).default("amarelo"),
  fonte: z.string().default("Fonte: [fonte] · [data]"),
  ilustrativo: z.boolean().default(true),
  comFundo: z.boolean().default(false),
  topo: z.number().min(0).max(0.7).default(0.33),
  framesContador: z.number().min(1).default(45),
  corDestaque: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(30).default(150),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof comparacaoNumerosSchema>;

const formatar = (v: number, casas: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v);

export const ComparacaoNumeros: React.FC<Props> = ({
  rotulo = "Ação exemplo · ilustrativo",
  titulo = "Preço x valor calculado",
  rotuloAntes = "Preço hoje",
  valorAntes = 32.4,
  rotuloDepois = "Valor calculado",
  valorDepois = 38.1,
  prefixo = "R$ ",
  casasDecimais = 2,
  corDepois = "amarelo",
  fonte = "Fonte: [fonte] · [data]",
  ilustrativo = true,
  comFundo = false,
  topo = 0.33,
  framesContador = 45,
  corDestaque = KIT.amarelo,
  duracaoFrames = 150,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const fica = 1 - progresso(frame, duracaoFrames - framesSaida, framesSaida);
  const sub = W * 0.012;

  const seta = progresso(frame, 18, 12);
  const conta = progresso(frame, 22, framesContador);
  const valorAtual = valorAntes + (valorDepois - valorAntes) * conta;

  const corNumeroDepois =
    corDepois === "vermelho" ? KIT.vermelho : corDepois === "creme" ? KIT.creme : corDestaque;

  const estiloRotulo: React.CSSProperties = {
    fontWeight: 600,
    fontSize: W * 0.0115,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    lineHeight: 1.2,
  };
  const estiloNumero: React.CSSProperties = {
    fontWeight: 800,
    fontSize: W * 0.0625,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  };

  return (
    <Sequence name="ComparacaoNumeros">
      <AbsoluteFill style={{ fontFamily: FONTE_KIT }}>
        {comFundo ? <FundoExplicativo duracaoFrames={duracaoFrames} corLinha={corDestaque} /> : null}
        <div
          style={{
            position: "absolute",
            left: W * 0.08,
            right: W * 0.08,
            top: H * topo,
            display: "flex",
            flexDirection: "column",
            gap: W * 0.004,
          }}
        >
          <div style={{ ...estiloRotulo, color: corDestaque, ...estiloSubida(progresso(frame, 0, 14) * fica, sub) }}>
            {rotulo}
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: W * 0.034,
              lineHeight: 1.05,
              color: corDestaque,
              ...estiloSubida(progresso(frame, 5, 14) * fica, sub),
            }}
          >
            {titulo}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "end",
              columnGap: W * 0.02,
              marginTop: W * 0.024,
              ...estiloSubida(progresso(frame, 10, 14) * fica, sub),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.006 }}>
              <div style={{ ...estiloRotulo, color: KIT.cremeSuave }}>{rotuloAntes}</div>
              <div style={{ ...estiloNumero, color: KIT.creme }}>
                {prefixo}
                {formatar(valorAntes, casasDecimais)}
              </div>
            </div>
            <svg width={W * 0.08} height={W * 0.04} viewBox="0 0 120 60" style={{ marginBottom: W * 0.012 }}>
              <path
                d="M6 30 H108 M88 12 L110 30 L88 48"
                fill="none"
                stroke={corDestaque}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={200}
                strokeDashoffset={200 * (1 - seta)}
              />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.006 }}>
              <div style={{ ...estiloRotulo, color: KIT.cremeSuave }}>{rotuloDepois}</div>
              <div style={{ ...estiloNumero, color: corNumeroDepois }}>
                {prefixo}
                {formatar(valorAtual, casasDecimais)}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: W * 0.08,
            bottom: H * 0.042,
            fontWeight: 500,
            fontSize: W * 0.0095,
            lineHeight: 1.3,
            color: KIT.cremeSuave,
            ...estiloSubida(progresso(frame, 15, 14) * fica, sub * 0.5),
          }}
        >
          {fonte}
          {ilustrativo ? " · números ilustrativos, não são dados reais" : ""}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
