import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { estiloSubida, FONTE_KIT, IconeKit, KIT, nomeIconeSchema, progresso, TextoComDestaque } from "./kitV3";

// Kit v3, seção 6.2 (pedido do Matheus em 03/11): destaque de UM item sobre o vídeo do JR.
// Sem caixa atrás (a pílula verde saiu). Sempre no mesmo ponto: margem esquerda, terço
// inferior, longe do rosto e das mãos. Para leitura, escurece só aquele canto (alfa do
// verde-escuro) e o texto ganha sombra escura suave.
// Dois ou mais itens não usam este componente: viram lista no PainelDiagonal.

export const destaqueSoltoSchema = z.object({
  icone: nomeIconeSchema.default("predio"),
  texto: z.string().default("Fundo imobiliário"),
  destaque: z.string().default("imobiliário"),
  tamanhoFonte: z.number().min(0.01).max(0.06).default(0.025),
  margemEsquerda: z.number().min(0).max(0.2).default(0.05),
  margemBase: z.number().min(0).max(0.4).default(0.16),
  escurecerCanto: z.number().min(0).max(1).default(0.78),
  corDestaque: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(10).default(120),
  framesEntrada: z.number().min(1).default(14),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof destaqueSoltoSchema>;

export const DestaqueSolto: React.FC<Props> = ({
  icone = "predio",
  texto = "Fundo imobiliário",
  destaque = "imobiliário",
  tamanhoFonte = 0.025,
  margemEsquerda = 0.05,
  margemBase = 0.16,
  escurecerCanto = 0.78,
  corDestaque = KIT.amarelo,
  duracaoFrames = 120,
  framesEntrada = 14,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const fica = 1 - progresso(frame, duracaoFrames - framesSaida, framesSaida);
  const entrou = progresso(frame, 0, framesEntrada);
  const a = escurecerCanto;

  return (
    <Sequence name="DestaqueSolto">
      <AbsoluteFill style={{ fontFamily: FONTE_KIT }}>
        {/* Escurecimento só no canto inferior esquerdo (alfa do verde-escuro) */}
        <AbsoluteFill
          style={{
            opacity: entrou * fica,
            background: `radial-gradient(ellipse 55% 45% at 0% 100%, rgba(15,42,29,${a}) 0%, rgba(15,42,29,${(a * 0.58).toFixed(3)}) 45%, rgba(15,42,29,0) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: W * margemEsquerda,
            bottom: H * margemBase,
            display: "flex",
            alignItems: "center",
            gap: W * 0.011,
            textShadow: `0 ${W * 0.001}px ${W * 0.006}px rgba(0,0,0,0.5)`,
            ...estiloSubida(entrou * fica, W * 0.012),
          }}
        >
          <IconeKit nome={icone} cor={corDestaque} tamanho={W * tamanhoFonte * 1.16} />
          <span
            style={{
              fontWeight: 800,
              fontSize: W * tamanhoFonte,
              lineHeight: 1.1,
              color: KIT.creme,
              whiteSpace: "nowrap",
            }}
          >
            <TextoComDestaque texto={texto} destaque={destaque} cor={corDestaque} />
          </span>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
