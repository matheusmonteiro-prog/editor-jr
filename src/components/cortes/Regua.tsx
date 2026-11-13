import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { COR_CORTE, CURVA_CORTE, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Régua de comparação ("benchmark", "parâmetro", "referência"): a régua se desenha e, no 1º passo,
// a marca de referência desce num ponto dela com o rótulo. Sem números: não é escala de valor.

export const reguaSchema = z.object({
  rotuloMarca: z.string().default("REFERÊNCIA"),
  corMarca: z.enum(NOMES_COR).default("verdeMetodo"),
  posicaoMarca: z.number().min(0.05).max(0.95).default(0.5), // fração do comprimento
  legenda: z.string().default(""), // texto pequeno embaixo da régua
  largura: z.number().default(860),
  passos: z.array(z.number()).default([]), // [quando a marca desce]
});
type Props = z.input<typeof reguaSchema>;

export const Regua: React.FC<Props> = ({
  rotuloMarca = "REFERÊNCIA",
  corMarca = "verdeMetodo",
  posicaoMarca = 0.5,
  legenda = "",
  largura = 860,
  passos = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const desenho = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: CURVA_CORTE });
  const marca = passos[0] === undefined ? 1 : spring({ frame: frame - passos[0], fps, config: { damping: 11, stiffness: 180 } });
  const alturaRegua = largura * 0.11;
  const marcas = 24;
  const xm = largura * posicaoMarca;
  return (
    <div style={{ position: "relative", width: largura, height: alturaRegua * 3.4 }}>
      <div
        style={{
          position: "absolute",
          left: xm,
          top: 0,
          transform: `translate(-50%, ${(1 - marca) * -60}px)`,
          opacity: marca,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ backgroundColor: COR_CORTE[corMarca], color: COR_CORTE.papelClaro, fontFamily: FONTE_TITULO, fontSize: largura * 0.05, padding: "6px 18px", whiteSpace: "nowrap" }}>
          {rotuloMarca}
        </div>
        <div style={{ width: 0, height: 0, borderLeft: `${largura * 0.025}px solid transparent`, borderRight: `${largura * 0.025}px solid transparent`, borderTop: `${largura * 0.035}px solid ${COR_CORTE[corMarca]}` }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: alturaRegua * 1.25,
          width: largura,
          height: alturaRegua,
          backgroundColor: COR_CORTE.papelClaro,
          border: `3px solid ${COR_CORTE.carvao}`,
          boxSizing: "border-box",
          clipPath: `inset(0 ${(1 - desenho) * 100}% 0 0)`,
          boxShadow: "0 5px 12px rgba(0,0,0,0.2)",
        }}
      >
        {Array.from({ length: marcas + 1 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i / marcas) * (largura - 6),
              top: 0,
              width: 3,
              height: alturaRegua * (i % 4 === 0 ? 0.55 : 0.3),
              backgroundColor: COR_CORTE.carvao,
            }}
          />
        ))}
      </div>
      {legenda ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: alturaRegua * 2.5, textAlign: "center", fontFamily: FONTE_TITULO, fontSize: largura * 0.04, color: COR_CORTE.carvao, opacity: desenho }}>
          {legenda.toUpperCase()}
        </div>
      ) : null}
    </div>
  );
};
