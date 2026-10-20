import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_TITULO, FONTE_TITULO, MOLA, comAlfa } from "./marca";

// Card de check no visual do ListaCheck (texto + check desenhado), entrando
// com FLIP 3D no eixo X (exceção visual do vídeo de apresentação).
// Uma palavra em dourado (destaque).

type Props = {
  texto: string;
  destaque: string;
  inicio: number;
  saida?: number;
  top: number; // fração da altura (centro do card)
  tamanho?: number; // fração da largura
};

const CheckDesenhado: React.FC<{ frame: number; tamanho: number }> = ({ frame, tamanho }) => {
  const progresso = interpolate(frame, [0, 10], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <circle cx={50} cy={50} r={46} fill={COR.dourado} fillOpacity={0.16} stroke={COR.dourado} strokeOpacity={0.6} strokeWidth={3} />
      <path
        d="M 26 52 L 43 70 L 76 30"
        fill="none"
        stroke={COR.dourado}
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

export const CardCheckFlip: React.FC<Props> = ({ texto, destaque, inicio, saida, top, tamanho = 0.068 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Texto longo diminui para o card caber em 86% da largura (estimativa:
  // ~0,74em por letra em caixa alta + check + margens ≈ 3,4em).
  const caberEm = (width * 0.86) / (texto.length * 0.74 + 3.4);
  const fontSize = Math.min(width * tamanho, caberEm);

  const p = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 14 });
  const angulo = interpolate(p, [0, 1], [-95, 0]);
  const op = interpolate(frame - inicio, [0, 4], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);

  const textoAlto = texto.toLocaleUpperCase("pt-BR");
  const alvo = destaque.toLocaleUpperCase("pt-BR");
  const pos = textoAlto.indexOf(alvo);
  const antes = pos >= 0 ? textoAlto.slice(0, pos) : textoAlto;
  const meio = pos >= 0 ? alvo : "";
  const depois = pos >= 0 ? textoAlto.slice(pos + alvo.length) : "";
  const acende = interpolate(frame - inicio, [12, 16], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        display: "flex",
        justifyContent: "center",
        perspective: width * 1.2,
        opacity: op * (1 - q),
        transform: `translateY(calc(-50% - ${q * height * 0.03}px))`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: fontSize * 0.45,
          padding: `${fontSize * 0.38}px ${fontSize * 0.6}px`,
          borderRadius: fontSize * 0.32,
          backgroundColor: comAlfa(COR.fundo, 0.86),
          border: `${Math.max(1, width * 0.0014)}px solid ${comAlfa(COR.creme, 0.18)}`,
          boxShadow: `0 ${fontSize * 0.35}px ${fontSize * 0.9}px ${comAlfa(COR.fundo, 0.7)}`,
          transformOrigin: "50% 0%",
          transform: `rotateX(${angulo}deg)`,
        }}
      >
        <CheckDesenhado frame={frame - inicio - 8} tamanho={fontSize * 1.2} />
        <span
          style={{
            fontFamily: FONTE_TITULO,
            fontWeight: 700,
            letterSpacing: ESPACO_TITULO,
            fontSize,
            color: COR.creme,
            whiteSpace: "nowrap",
          }}
        >
          {antes}
          <span style={{ position: "relative", display: "inline-block" }}>
            {meio}
            <span style={{ position: "absolute", left: 0, top: 0, color: COR.dourado, opacity: acende }}>{meio}</span>
          </span>
          {depois}
        </span>
      </div>
    </div>
  );
};
