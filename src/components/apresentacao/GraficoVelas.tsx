import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR } from "./marca";

// Velas (candles) ILUSTRATIVAS do bloco 02, ao lado da linha "AÇÕES" (rodada 9). Cada vela sobe e desce
// no próprio ritmo, de forma MISTA (umas sobem enquanto outras descem), SEM linha de tendência, SEM eixo
// e SEM número. Cores só da marca: dourado nas velas de alta, creme nas de baixa (nunca o verde #1DD41E).
// Nunca sugere ganho. O rótulo "ILUSTRATIVO" saiu a pedido do Matheus (rodada 9).
// Fica na linha do card AÇÕES, à direita dele: nasce na borda do card (escala 0 → 1) e desliza alguns
// px para a direita, com um pequeno quique, na hora da palavra "ações".

const QUANTIDADE = 7;

type Props = {
  largura: number; // fração da largura
  inicio: number; // frame (relativo à Sequence) em que nasce
};

export const GraficoVelas: React.FC<Props> = ({ largura, inicio }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const p = spring({ frame: frame - inicio, fps, config: { damping: 9, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  const op = interpolate(frame - inicio, [0, 3], [0, 1], clamp);

  const larguraPx = width * largura;
  const alturaPx = larguraPx * 0.95;
  const f = frame - inicio;
  const passo = 100 / QUANTIDADE;
  const corpoLargura = passo * 0.46;

  return (
    <div
      style={{
        flexShrink: 0,
        width: larguraPx,
        height: alturaPx,
        opacity: op,
        // Nasce na borda do card (escala 0 → 1, com quique) e desliza alguns px para a direita.
        transformOrigin: "0% 50%",
        transform: `translateX(${(1 - p) * -width * 0.025}px) scale(${p})`,
      }}
    >
      <svg width={larguraPx} height={alturaPx} viewBox="0 0 100 95" style={{ overflow: "visible" }}>
        {new Array(QUANTIDADE).fill(0).map((_, i) => {
          // Abertura e fechamento oscilam com fases e ritmos diferentes: ora a vela sobe, ora desce.
          const centro = 47.5 + 20 * Math.sin(f * 0.085 + i * 1.9);
          const tamanhoCorpo = 7 + 15 * Math.abs(Math.sin(f * 0.11 + i * 2.3));
          const sobe = Math.sin(f * 0.11 + i * 2.3 + 1.1) > 0;
          const topo = centro - tamanhoCorpo / 2;
          const cor = sobe ? COR.dourado : COR.creme;
          const cx = passo * i + passo / 2;
          const pavio = 8 + 5 * Math.abs(Math.sin(f * 0.07 + i));
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={topo - pavio} y2={topo + tamanhoCorpo + pavio} stroke={cor} strokeWidth={1.3} strokeLinecap="round" />
              <rect x={cx - corpoLargura / 2} y={topo} width={corpoLargura} height={tamanhoCorpo} rx={0.8} fill={cor} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
