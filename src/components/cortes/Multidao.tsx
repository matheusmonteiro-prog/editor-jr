import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { COR_CORTE, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Grupo de pessoas (bonecos chapados, sem rosto) para "a maioria", "o público", "todo mundo".
// Entram uma a uma; no 1º passo aparece a resposta (balão) sobre cada uma, em sequência.

export const multidaoSchema = z.object({
  quantidade: z.number().min(1).max(9).default(5),
  resposta: z.string().default("SIM"),
  corResposta: z.enum(NOMES_COR).default("verdeMetodo"),
  // Quantas respondem (as outras ficam sem balão). Padrão: todas menos uma ("a maioria").
  respondem: z.number().min(0).max(9).optional(),
  largura: z.number().default(820),
  passos: z.array(z.number()).default([]), // [quando aparecem as respostas]
});
type Props = z.input<typeof multidaoSchema>;

export const Multidao: React.FC<Props> = ({
  quantidade = 5,
  resposta = "SIM",
  corResposta = "verdeMetodo",
  respondem,
  largura = 820,
  passos = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = respondem ?? Math.max(0, quantidade - 1);
  const passo = largura / quantidade;
  const alt = passo * 1.9;
  // Quem fica sem resposta: a do meio-direita (não sempre a última).
  const semResposta = new Set(Array.from({ length: quantidade - n }, (_, k) => (Math.floor(quantidade / 2) + 1 + k * 2) % quantidade));
  return (
    <div style={{ position: "relative", width: largura, height: alt }}>
      {Array.from({ length: quantidade }).map((_, i) => {
        const s = spring({ frame: frame - i * 3, fps, config: { damping: 14, stiffness: 200 } });
        const r = passos[0] === undefined || semResposta.has(i) ? 0 : spring({ frame: frame - passos[0] - i * 3, fps, config: { damping: 12, stiffness: 220 } });
        const x = i * passo + passo / 2;
        const w = passo * 0.62;
        return (
          <div key={i} style={{ position: "absolute", left: x - w / 2, bottom: 0, width: w, height: alt, transform: `translateY(${(1 - s) * 40}px)`, opacity: s }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                transform: `translateX(-50%) scale(${r})`,
                backgroundColor: COR_CORTE[corResposta],
                color: COR_CORTE.papelClaro,
                fontFamily: FONTE_TITULO,
                fontSize: w * 0.3,
                padding: `${w * 0.05}px ${w * 0.12}px`,
                borderRadius: w * 0.06,
                opacity: interpolate(r, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              {resposta}
            </div>
            <div style={{ position: "absolute", left: "50%", top: alt * 0.3, width: w * 0.46, height: w * 0.46, marginLeft: -w * 0.23, borderRadius: "50%", backgroundColor: COR_CORTE.carvao }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: alt * 0.42, borderRadius: `${w * 0.45}px ${w * 0.45}px ${w * 0.08}px ${w * 0.08}px`, backgroundColor: COR_CORTE.carvao }} />
          </div>
        );
      })}
    </div>
  );
};
