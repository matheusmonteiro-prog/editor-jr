import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FONTE_KIT, KIT, progresso } from "./kitV3";

// Kit v3, seção 4.4 (anexos 4 e 5): palavra de impacto em Montserrat Black RETO, caixa alta.
// Substitui a Anton inclinada, reprovada pelo Matheus em 03/11.
// Linha 1 menor, em creme (contexto); linha 2 grande, em Amarelo JR (a palavra que bate,
// até 3 palavras). Terço inferior, sobre o JR, contorno verde-escuro fino.
// Entra com escala 170% → 100% em 0,4 s. O zoom seco do vídeo (115%) fica na camada da câmera.

export const impactoKitSchema = z.object({
  linha1: z.string().default("Quem é o investidor"),
  linha2: z.string().default("Sertanejo?"),
  tamanho1: z.number().min(0.01).max(0.1).default(0.036),
  tamanho2: z.number().min(0.02).max(0.15).default(0.073),
  margemBase: z.number().min(0).max(0.5).default(0.12),
  // Faixa escura na metade de baixo: cobre texto antigo gravado na fonte.
  // Entra e sai em CORTE SECO (A-005). 04/11 (A-008, "muito denso, deixa leve, quase transparente,
  // como um sombreado"): virou sombra leve. Texto antigo gravado na fonte NÃO é mais escondido por
  // ela: use um véu de desfoque na câmera (CameraJR `veus`) no mesmo trecho.
  faixa: z.boolean().default(false),
  // 04/11 (A-016): camada de cor translúcida SUBINDO DE BAIXO PARA CIMA (verde do kit), mais escura
  // embaixo e sumindo em cima. Sem elipse, sem "fumaça". A primeira versão (0.97) ficou escura demais.
  // Força embaixo (0 a 1): 0.7 = verde translúcido, a câmera ainda aparece por baixo.
  forcaFaixa: z.number().min(0).max(1).default(0.7),
  corDestaque: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(10).default(81),
  framesSaida: z.number().min(1).default(8),
});

type Props = z.input<typeof impactoKitSchema>;

export const ImpactoKit: React.FC<Props> = ({
  linha1 = "Quem é o investidor",
  linha2 = "Sertanejo?",
  tamanho1 = 0.036,
  tamanho2 = 0.073,
  margemBase = 0.12,
  faixa = false,
  forcaFaixa = 0.7,
  corDestaque = KIT.amarelo,
  duracaoFrames = 81,
  framesSaida = 8,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const fica = 1 - progresso(frame, duracaoFrames - framesSaida, framesSaida);

  const entrada = (atraso: number): React.CSSProperties => {
    const p = progresso(frame, atraso, 12);
    return { display: "block", opacity: p * fica, transform: `scale(${1.7 - 0.7 * p})` };
  };

  const base: React.CSSProperties = {
    fontFamily: FONTE_KIT,
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 0.98,
    WebkitTextStroke: `${W * 0.0014}px ${KIT.verde}`,
    paintOrder: "stroke fill",
    textShadow: `0 ${W * 0.002}px ${W * 0.009}px rgba(0,0,0,0.35)`,
  };

  return (
    <Sequence name="ImpactoKit">
      <AbsoluteFill>
        {faixa ? (
          <AbsoluteFill
            style={{
              background:
                `linear-gradient(to top, rgba(15,42,29,${forcaFaixa}) 0%, rgba(15,42,29,${(forcaFaixa * 0.8).toFixed(3)}) 28%, rgba(15,42,29,${(forcaFaixa * 0.35).toFixed(3)}) 44%, rgba(15,42,29,0) 60%)`,
            }}
          />
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: H * margemBase, textAlign: "center" }}>
          {linha1 ? (
            <span style={{ ...base, ...entrada(0), fontSize: W * tamanho1, color: KIT.creme, letterSpacing: "0.02em" }}>
              {linha1}
            </span>
          ) : null}
          <span style={{ ...base, ...entrada(4), fontSize: W * tamanho2, color: corDestaque }}>{linha2}</span>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
