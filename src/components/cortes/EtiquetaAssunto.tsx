import React from "react";
import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { COR_CORTE, entrada, FONTE_TITULO } from "./estiloCortes";

// Etiqueta de assunto (canto de cima do quadro) ou título grande de abertura ("grande").
// Verde-escuro com texto creme; entra revelando da esquerda para a direita (máscara).

export const etiquetaAssuntoSchema = z.object({
  texto: z.string().default("ASSUNTO"),
  tamanho: z.enum(["pequena", "grande"]).default("pequena"),
  largura: z.number().default(1080), // largura da tela, para o tamanho da letra
  // Já inteira no quadro 0 (abertura: é o quadro que aparece parado no feed).
  imediata: z.boolean().default(false),
});
type Props = z.input<typeof etiquetaAssuntoSchema>;

export const EtiquetaAssunto: React.FC<Props> = ({ texto = "ASSUNTO", tamanho = "pequena", largura = 1080, imediata = false }) => {
  const frame = useCurrentFrame();
  const p = imediata ? 1 : entrada(frame, 0, 8);
  const grande = tamanho === "grande";
  const fonte = largura * (grande ? 0.058 : 0.03);
  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: COR_CORTE.verde,
        color: COR_CORTE.papelClaro,
        fontFamily: FONTE_TITULO,
        fontSize: fonte,
        lineHeight: 1.1,
        textTransform: "uppercase",
        padding: `${fonte * 0.32}px ${fonte * 0.5}px`,
        borderRadius: fonte * 0.12,
        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        whiteSpace: grande ? "normal" : "nowrap",
        textAlign: "center",
        maxWidth: largura * 0.86,
      }}
    >
      {texto.replace(/-/g, "‑")}
    </div>
  );
};
