import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { COR_CORTE, CURVA_CORTE, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Carimbo: texto numa moldura, torto, que "bate" no papel (cresce de 180% para 100% em ~170 ms).
// Para marcar uma conclusão ou uma posição ("PREFIRO", "SOZINHO"). Som de batida: no renderizador.

export const carimboSchema = z.object({
  texto: z.string().default("CARIMBO"),
  cor: z.enum(NOMES_COR).default("verdeMetodo"),
  largura: z.number().default(320), // só escala a letra; a moldura acompanha o texto
  rotacao: z.number().min(-25).max(25).default(-8),
});
type Props = z.input<typeof carimboSchema>;

export const Carimbo: React.FC<Props> = ({ texto = "CARIMBO", cor = "verdeMetodo", largura = 320, rotacao = -8 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp", easing: CURVA_CORTE });
  const fonte = largura * 0.16;
  const c = COR_CORTE[cor];
  return (
    <div
      style={{
        display: "inline-block",
        border: `${fonte * 0.12}px solid ${c}`,
        color: c,
        fontFamily: FONTE_TITULO,
        fontSize: fonte,
        lineHeight: 1,
        padding: `${fonte * 0.2}px ${fonte * 0.35}px`,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        backgroundColor: "rgba(251,248,241,0.55)",
        transform: `rotate(${rotacao}deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`,
        opacity: interpolate(p, [0, 0.4, 1], [0, 1, 0.92]),
        mixBlendMode: "multiply",
      }}
    >
      {texto}
    </div>
  );
};
