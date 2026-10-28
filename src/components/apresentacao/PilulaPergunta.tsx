import React from "react";
import { clamp } from "../../utils/clamp";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, FONTE_ROTULO, MOLA, comAlfa } from "./marca";

// Pílula no topo da zona segura: pergunta em caixa alta + contador "1/8".
// Entra de cima com spring (overshoot leve) em 10 frames; sai subindo.

type Props = {
  texto: string;
  contador?: string;
  inicio: number;
  saida?: number;
  top?: number; // fração da altura
  esquerda?: number; // fração da largura
  larguraMax?: number; // fração da largura
  tamanho?: number; // fração da largura
};

export const PilulaPergunta: React.FC<Props> = ({
  texto,
  contador,
  inicio,
  saida,
  top = 0.1,
  esquerda = 0.06,
  larguraMax = 0.7,
  tamanho = 0.036,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fontSize = width * tamanho;

  const p = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 10 });
  const opEntrada = interpolate(frame - inicio, [0, 4], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: height * top,
        left: width * esquerda,
        maxWidth: width * larguraMax,
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.7,
        padding: `${fontSize * 0.55}px ${fontSize * 0.9}px`,
        borderRadius: fontSize * 2,
        backgroundColor: comAlfa(COR.fundo, 0.82),
        border: `${Math.max(1, width * 0.0016)}px solid ${comAlfa(COR.dourado, 0.7)}`,
        boxShadow: `0 ${fontSize * 0.3}px ${fontSize}px ${comAlfa(COR.fundo, 0.6)}`,
        fontFamily: FONTE_ROTULO,
        fontWeight: 600,
        letterSpacing: ESPACO_ROTULO,
        fontSize,
        lineHeight: 1.2,
        color: COR.creme,
        opacity: opEntrada * (1 - q),
        transform: `translateY(${(1 - p) * -height * 0.08 - q * height * 0.03}px)`,
      }}
    >
      <span>{texto.toLocaleUpperCase("pt-BR")}</span>
      {contador ? (
        <span
          style={{
            color: COR.dourado,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            paddingLeft: fontSize * 0.7,
            borderLeft: `${Math.max(1, width * 0.0012)}px solid ${comAlfa(COR.creme, 0.25)}`,
          }}
        >
          {contador}
        </span>
      ) : null}
    </div>
  );
};
