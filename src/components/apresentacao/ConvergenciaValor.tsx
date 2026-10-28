import React from "react";
import { clamp } from "../../utils/clamp";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, FONTE_ROTULO, comAlfa } from "./marca";

// Convergência de valor (rodada 7, bloco 03, selo "VALOR INTRÍNSECO"): uma linha DOURADA reta
// (valor intrínseco, estável) e uma linha CREME (preço de mercado) que ondula cada vez menos até
// encontrar a dourada num ponto marcado por um círculo dourado pulsante. Sem fórmula nem número.
// As duas linhas se desenham da esquerda para a direita; a creme continua ondulando devagar.

type Props = {
  y: number; // topo do painel, fração da altura
  inicio: number; // frame (relativo à Sequence)
  saida?: number;
  duracaoDesenho?: number; // frames para as linhas chegarem ao ponto de encontro
};

const LARGURA_VB = 400;
const ALTURA_VB = 100;
const X0 = 22; // início das linhas
const X_ENCONTRO = 335; // ponto de encontro
const X1 = 378; // fim das linhas (depois do encontro, seguem juntas)
const Y_VALOR = 58;

export const ConvergenciaValor: React.FC<Props> = ({ y, inicio, saida, duracaoDesenho = 36 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame - inicio;

  const op = interpolate(f, [0, 8], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  const desenho = interpolate(f, [4, 4 + duracaoDesenho], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const xAtual = X0 + (X1 - X0) * desenho;

  // Linha do preço: amplitude cai até zero no ponto de encontro; a fase anda com o tempo.
  const yPreco = (x: number) => {
    const u = Math.min(1, Math.max(0, (x - X0) / (X_ENCONTRO - X0)));
    const amplitude = 30 * Math.pow(1 - u, 1.5);
    return Y_VALOR - amplitude * Math.sin(u * Math.PI * 7 + f * 0.12);
  };
  const pontos: string[] = [];
  for (let x = X0; x <= xAtual; x += 2) pontos.push(`${x},${yPreco(x).toFixed(2)}`);

  const chegou = interpolate(xAtual, [X_ENCONTRO - 4, X_ENCONTRO + 6], [0, 1], clamp);
  const fChegada = 4 + duracaoDesenho * 0.86; // quando o desenho passa pelo encontro (aprox.)
  const pulso = chegou * (1 + 0.35 * Math.max(0, Math.sin(((f - fChegada) / 30) * Math.PI * 2)));

  const larguraPx = width * 0.8;
  const pxPorUnidade = larguraPx / LARGURA_VB;
  const fonte = width * 0.024;

  return (
    <div
      style={{
        position: "absolute",
        left: (width - larguraPx) / 2,
        top: height * y,
        width: larguraPx,
        height: larguraPx * (ALTURA_VB / LARGURA_VB) + fonte * 0.6,
        borderRadius: width * 0.03,
        backgroundColor: comAlfa(COR.fundo, 0.74),
        border: `${Math.max(1, width * 0.0014)}px solid ${comAlfa(COR.creme, 0.14)}`,
        opacity: op * (1 - q),
        transform: `translateY(${(1 - op) * height * 0.01 - q * height * 0.03}px)`,
      }}
    >
      <svg viewBox={`0 0 ${LARGURA_VB} ${ALTURA_VB}`} width={larguraPx} height={larguraPx * (ALTURA_VB / LARGURA_VB)}>
        {/* Valor intrínseco: reta dourada. */}
        <line
          x1={X0}
          y1={Y_VALOR}
          x2={xAtual}
          y2={Y_VALOR}
          stroke={COR.dourado}
          strokeWidth={2 / pxPorUnidade}
          strokeLinecap="round"
        />
        {/* Preço de mercado: linha creme ondulando até encontrar a dourada. */}
        <polyline
          points={pontos.join(" ")}
          fill="none"
          stroke={COR.creme}
          strokeOpacity={0.9}
          strokeWidth={1.5 / pxPorUnidade}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ponto de encontro: círculo dourado pulsando. */}
        <circle cx={X_ENCONTRO} cy={Y_VALOR} r={9 * pulso} fill={comAlfa(COR.dourado, 0.18 * chegou)} />
        <circle cx={X_ENCONTRO} cy={Y_VALOR} r={4 * chegou} fill={COR.dourado} />
        <text
          x={X0}
          y={16}
          fontFamily={FONTE_ROTULO}
          fontWeight={600}
          fontSize={fonte / pxPorUnidade}
          letterSpacing={ESPACO_ROTULO}
          fill={COR.creme}
          fillOpacity={0.85 * interpolate(f, [6, 14], [0, 1], clamp)}
        >
          PREÇO
        </text>
        <text
          x={X1}
          y={Y_VALOR + 24}
          textAnchor="end"
          fontFamily={FONTE_ROTULO}
          fontWeight={600}
          fontSize={fonte / pxPorUnidade}
          letterSpacing={ESPACO_ROTULO}
          fill={COR.dourado}
          fillOpacity={interpolate(f, [6, 14], [0, 1], clamp)}
        >
          VALOR
        </text>
      </svg>
    </div>
  );
};
