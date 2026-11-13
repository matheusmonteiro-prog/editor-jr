import React from "react";
import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { IconeKit, nomeIconeSchema } from "../v2/kitV3";
import { COR_CORTE, entrada, FONTE_MONO, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Cartão / documento de papel: rótulo pequeno (fonte de máquina), título forte, ícone opcional e
// itens (ou linhas cinza de "texto" quando não há itens). Entra subindo; cada item entra no seu passo.

export const cartaoDocumentoSchema = z.object({
  rotulo: z.string().default(""),
  titulo: z.string().default("TÍTULO"),
  corTitulo: z.enum(NOMES_COR).default("verde"),
  icone: nomeIconeSchema.default("nenhum"),
  itens: z.array(z.string()).default([]),
  linhas: z.number().min(0).max(6).default(3), // linhas cinza quando não há itens
  largura: z.number().default(360),
  rotacao: z.number().min(-15).max(15).default(0),
  // Quadros (relativos à entrada do cartão) em que cada item aparece.
  passos: z.array(z.number()).default([]),
  // Marca-texto amarelo que "pinta" o título (quadro relativo à entrada do cartão). Sem valor: sem marca.
  marcarEm: z.number().optional(),
});
type Props = z.input<typeof cartaoDocumentoSchema>;

export const CartaoDocumento: React.FC<Props> = ({
  rotulo = "",
  titulo = "TÍTULO",
  corTitulo = "verde",
  icone = "nenhum",
  itens = [],
  linhas = 3,
  largura = 360,
  rotacao = 0,
  passos = [],
  marcarEm,
}) => {
  const frame = useCurrentFrame();
  const p = entrada(frame, 0, 10);
  const u = largura / 360; // unidade
  // Título cabe na largura útil (Archivo Black em caixa alta ~0,78 em por letra; palavra mais longa).
  const util = largura - 44 * u - (icone !== "nenhum" ? 78 * u : 0);
  const maiorPalavra = Math.max(...titulo.split(" ").map((w) => w.length), 1);
  const fonteTitulo = Math.min(46 * u, util / (maiorPalavra * 0.78));
  return (
    <div
      style={{
        width: largura,
        backgroundColor: COR_CORTE.papelClaro,
        boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
        padding: `${18 * u}px ${22 * u}px ${22 * u}px`,
        transform: `translateY(${(1 - p) * 40}px) rotate(${rotacao}deg)`,
        opacity: p,
        boxSizing: "border-box",
      }}
    >
      {rotulo ? (
        <div style={{ fontFamily: FONTE_MONO, fontWeight: 700, fontSize: 19 * u, color: COR_CORTE.carvao, opacity: 0.7, letterSpacing: 1 }}>
          {rotulo.toUpperCase()}
        </div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 12 * u, marginTop: 4 * u }}>
        {icone !== "nenhum" ? <IconeKit nome={icone} cor={COR_CORTE[corTitulo]} tamanho={66 * u} /> : null}
        <div style={{ fontFamily: FONTE_TITULO, fontSize: fonteTitulo, lineHeight: 1.12, color: COR_CORTE[corTitulo], textTransform: "uppercase" }}>
          <span
            style={
              marcarEm === undefined
                ? undefined
                : {
                    // Faixa amarela na metade de baixo de cada linha, "pintada" da esquerda para a direita.
                    backgroundImage: "linear-gradient(transparent 48%, rgba(255,198,41,0.78) 48%, rgba(255,198,41,0.78) 94%, transparent 94%)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${entrada(frame, marcarEm, 8) * 100}% 100%`,
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                    padding: `0 ${4 * u}px`,
                  }
            }
          >
            {titulo}
          </span>
        </div>
      </div>
      <div style={{ marginTop: 14 * u }}>
        {itens.length > 0
          ? itens.map((t, i) => {
              const pi = entrada(frame, passos[i] ?? 6 + i * 5, 8);
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: FONTE_TITULO,
                    fontSize: 28 * u,
                    color: COR_CORTE.carvao,
                    marginTop: 8 * u,
                    opacity: pi,
                    transform: `translateX(${(1 - pi) * -16}px)`,
                    textTransform: "uppercase",
                  }}
                >
                  {t}
                </div>
              );
            })
          : Array.from({ length: linhas }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 7 * u,
                  width: `${[88, 74, 81, 60, 70, 50][i]}%`,
                  backgroundColor: COR_CORTE.cinza,
                  marginTop: 11 * u,
                  transformOrigin: "left",
                  transform: `scaleX(${entrada(frame, 4 + i * 2, 8)})`,
                }}
              />
            ))}
      </div>
    </div>
  );
};
