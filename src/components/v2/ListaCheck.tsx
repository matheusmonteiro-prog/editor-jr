import React from "react";
import {
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — UM item só (uma frase + seu check), não uma lista. Cada
// frase que aparece em momento diferente é uma <Sequence> própria, com seu
// próprio "from", visível e editável na timeline do Studio — em vez de um
// array escondido dentro de uma prop. Ver ARQUITETURA.md, "regra de
// camadas" (26/09/2026).
//
// Tamanhos em fração da largura do vídeo (0 a 1), não pixels fixos.

export const listaCheckSchema = z.object({
  texto: z.string(),
  destaque: z.string(),
  top: z.number().min(0).max(1),
  // Opcional (29/09/2026): padrão transparente, pra não tampar o vídeo por
  // engano quando usado como camada.
  corFundo: zColor().optional(),
  // Opcional (29/09/2026): cor do card de vidro fosco, separada de
  // corFundo (que é a tela toda). Padrão = valor fixo que já existia antes
  // dessa prop existir.
  corCard: zColor().optional(),
  corTexto: zColor(),
  corDestaque: zColor(),
  corCheck: zColor(),
  tamanhoFonte: z.number().min(0.005).max(0.5),
  frameEntradaCheck: z.number().min(0),
  duracaoFrames: z.number().min(10),
  framesSaida: z.number().min(1),
});

type Props = z.infer<typeof listaCheckSchema>;

const framesDesenhoCheck = 12;

const CheckDesenhado: React.FC<{
  frame: number;
  tamanho: number;
  cor: string;
}> = ({ frame, tamanho, cor }) => {
  const progresso = interpolate(frame, [0, framesDesenhoCheck], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pop = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
    durationInFrames: framesDesenhoCheck,
  });
  const escala = interpolate(pop, [0, 1], [0.5, 1]);
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      style={{ transform: `scale(${escala})`, flexShrink: 0 }}
    >
      <circle cx={50} cy={50} r={46} fill={cor} fillOpacity={0.15} />
      <path
        d="M 26 52 L 43 70 L 76 30"
        fill="none"
        stroke={cor}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - progresso}
      />
    </svg>
  );
};

export const ListaCheck: React.FC<Props> = ({
  texto,
  destaque,
  top,
  corFundo = "transparent",
  corCard = "rgba(8,10,8,0.4)",
  corTexto,
  corDestaque,
  corCheck,
  tamanhoFonte,
  frameEntradaCheck,
  duracaoFrames,
  framesSaida,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  const entrada = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const entradaClamp = Math.max(0, Math.min(1, entrada));
  const translateX = interpolate(entradaClamp, [0, 1], [-1, 0], {
    easing: Easing.out(Easing.cubic),
  });
  const opacityEntrada = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateYSaida = interpolate(saida, [0, 1], [-30, 0]);

  const fontSize = width * tamanhoFonte;
  const checkTamanho = fontSize * 1.5;
  const partes = texto.split(destaque);

  return (
    <Sequence name={`ListaCheck: ${texto}`}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: corFundo,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: width * 0.07,
            top: height * top,
            display: "flex",
            alignItems: "center",
            gap: fontSize * 0.5,
            opacity: opacityEntrada * saida,
            transform: `translate(${translateX * 300}px, ${translateYSaida}px)`,
          }}
        >
          <div
            style={{
              backgroundColor: corCard,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: fontSize * 0.3,
              padding: `${fontSize * 0.35}px ${fontSize * 0.7}px`,
            }}
          >
            <span
              style={{
                color: corTexto,
                fontSize,
                fontWeight: 800,
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {partes[0]}
              <span style={{ color: corDestaque }}>{destaque}</span>
              {partes[1]}
            </span>
          </div>
          <CheckDesenhado
            frame={frame - frameEntradaCheck}
            tamanho={checkTamanho}
            cor={corCheck}
          />
        </div>
      </div>
    </Sequence>
  );
};
