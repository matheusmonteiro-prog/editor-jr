import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR, MOLA } from "./marca";

// Ícone de compartilhar (rodada 9, grupo "Compartilhe com quem precisa disso" do bloco 08): três
// nós ligados por duas linhas. Em "quem precisa" uma setinha sai do ícone para a direita e acende,
// em sequência, 3 círculos pequenos (pessoas, sem rosto), dourados. Traço fino creme, sem sombra
// nem blur. Vai dentro do GrupoCaindo.

type Props = {
  y: number; // centro, fração da altura
  seta: number; // frame (relativo à Sequence) em que a setinha começa a sair
  pessoas: number[]; // frame em que cada círculo acende (3)
  tamanho?: number; // fração da largura (lado do ícone)
};

// Uma "pessoa" sem rosto: cabeça (círculo) e ombros (arco), em 24 x 24.
const Pessoa: React.FC<{ acesa: number }> = ({ acesa }) => (
  <g opacity={0.25 + 0.75 * acesa} transform={`translate(12 12) scale(${0.85 + 0.15 * acesa}) translate(-12 -12)`}>
    <circle cx={12} cy={8} r={4.2} fill={COR.dourado} />
    <path d="M3.5 21 C3.5 15.8 7.2 13.6 12 13.6 C16.8 13.6 20.5 15.8 20.5 21 Z" fill={COR.dourado} />
  </g>
);

export const CompartilharPessoas: React.FC<Props> = ({ y, seta, pessoas, tamanho = 0.1 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lado = width * tamanho;
  const traco = Math.max(2, width * 0.0035);

  // Setinha: cresce do ícone para a direita em 9 frames.
  const avanco = interpolate(frame - seta, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const comprimento = width * 0.1;
  const pessoa = lado * 0.7;
  const espaco = pessoa * 1.2;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * y,
        transform: "translateY(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: lado * 0.35,
      }}
    >
      {/* Ícone de compartilhar: 3 nós ligados. */}
      <svg width={lado} height={lado} viewBox="0 0 48 48" fill="none" stroke={COR.creme} strokeWidth={traco * (48 / lado)} strokeLinecap="round">
        <line x1={14} y1={22} x2={34} y2={12} />
        <line x1={14} y1={26} x2={34} y2={36} />
        <circle cx={11} cy={24} r={6} fill={COR.fundo} />
        <circle cx={37} cy={10} r={6} fill={COR.fundo} />
        <circle cx={37} cy={38} r={6} fill={COR.fundo} />
      </svg>

      {/* Setinha que sai do ícone. */}
      <svg width={comprimento} height={lado * 0.4} viewBox={`0 0 ${comprimento} ${lado * 0.4}`} fill="none" stroke={COR.dourado} strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={lado * 0.2} x2={comprimento * 0.92 * avanco} y2={lado * 0.2} />
        {avanco > 0.6 ? (
          <polyline
            points={`${comprimento * 0.92 * avanco - lado * 0.14},${lado * 0.2 - lado * 0.12} ${comprimento * 0.92 * avanco},${lado * 0.2} ${comprimento * 0.92 * avanco - lado * 0.14},${lado * 0.2 + lado * 0.12}`}
          />
        ) : null}
      </svg>

      {/* 3 pessoas, acendendo em sequência. */}
      <div style={{ display: "flex", gap: espaco - pessoa }}>
        {pessoas.map((quando, i) => {
          const acesa = spring({ frame: frame - quando, fps, config: MOLA, durationInFrames: 10 });
          return (
            <svg key={i} width={pessoa} height={pessoa} viewBox="0 0 24 24">
              <Pessoa acesa={Math.min(1, Math.max(0, acesa))} />
            </svg>
          );
        })}
      </div>
    </div>
  );
};
