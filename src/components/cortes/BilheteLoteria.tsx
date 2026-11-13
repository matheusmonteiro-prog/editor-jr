import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { COR_CORTE, entrada, FONTE_MONO, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Bilhete de aposta genérico (ilustração, sem marca de loteria): grade de números e algumas dezenas
// marcadas, que vão sendo circuladas. Os números marcados são decorativos, não um resultado real.

export const bilheteLoteriaSchema = z.object({
  titulo: z.string().default("APOSTA"),
  cor: z.enum(NOMES_COR).default("verdeMetodo"),
  marcados: z.array(z.number().min(1).max(60)).default([4, 13, 22, 37, 41, 58]),
  largura: z.number().default(420),
  rotacao: z.number().min(-15).max(15).default(-4),
});
type Props = z.input<typeof bilheteLoteriaSchema>;

export const BilheteLoteria: React.FC<Props> = ({
  titulo = "APOSTA",
  cor = "verdeMetodo",
  marcados = [4, 13, 22, 37, 41, 58],
  largura = 420,
  rotacao = -4,
}) => {
  const frame = useCurrentFrame();
  const p = entrada(frame, 0, 10);
  const u = largura / 420;
  const c = COR_CORTE[cor];
  const ordem = new Map(marcados.map((n, i) => [n, i]));
  return (
    <div
      style={{
        width: largura,
        backgroundColor: COR_CORTE.papelClaro,
        boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
        padding: 18 * u,
        boxSizing: "border-box",
        transform: `translateY(${(1 - p) * 40}px) rotate(${rotacao}deg)`,
        opacity: p,
        borderTop: `${10 * u}px solid ${c}`,
      }}
    >
      <div style={{ fontFamily: FONTE_TITULO, fontSize: 30 * u, color: c, marginBottom: 10 * u }}>{titulo.toUpperCase()}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 * u }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const n = i + 1;
          const k = ordem.get(n);
          const m = k === undefined ? 0 : interpolate(frame, [10 + k * 4, 14 + k * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={n}
              style={{
                fontFamily: FONTE_MONO,
                fontWeight: 700,
                fontSize: 15 * u,
                textAlign: "center",
                lineHeight: `${26 * u}px`,
                borderRadius: "50%",
                color: m > 0.5 ? COR_CORTE.papelClaro : COR_CORTE.carvao,
                backgroundColor: m > 0 ? c : "transparent",
                transform: `scale(${k === undefined ? 1 : 0.7 + 0.3 * m})`,
                opacity: k === undefined ? 0.55 : 1,
              }}
            >
              {String(n).padStart(2, "0")}
            </div>
          );
        })}
      </div>
    </div>
  );
};
