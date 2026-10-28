import React from "react";
import { clamp } from "../../utils/clamp";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COR, comAlfa } from "./marca";

// Bloco 04 (rodada 7): dá vida ao gráfico que JÁ ESTÁ na foto images/cena-4-dourado.png
// (940 x 1672). A linha da foto é redesenhada em SVG por cima, nas mesmas coordenadas da imagem,
// e cresce da base até a seta durante a resposta; as barras acendem de baixo para cima quando a
// ponta passa por elas; no fim, um brilho dourado pulsa na seta.
// Fica DENTRO da camada de movimento da cena (FundoCenas), então acompanha o zoom/pan da foto.
// Coordenadas medidas na imagem original com uma grade de 50 px.

type Props = {
  inicio: number; // frame (relativo à cena) em que a linha começa a crescer
  duracao: number; // frames até chegar à seta
};

const LINHA: [number, number][] = [
  [52, 1128], [100, 1112], [150, 1105], [222, 1103], [262, 1081], [298, 1090], [332, 1057],
  [370, 1070], [405, 1033], [432, 1041], [497, 990], [555, 913], [590, 925], [655, 823],
  [720, 828], [775, 800], [843, 702],
];
// Barras: [esquerda, direita, topo]; a base de todas é y = 1133.
const BASE = 1133;
const BARRAS: [number, number, number][] = [
  [105, 136, 1116], [155, 185, 1116], [203, 234, 1109], [254, 288, 1092], [308, 335, 1081],
  [354, 382, 1077], [401, 430, 1053], [449, 478, 1030], [497, 514, 1050], [514, 538, 1034],
  [557, 585, 987], [603, 631, 926], [650, 668, 888], [668, 692, 871], [710, 730, 916],
  [746, 767, 898], [783, 803, 833], [820, 841, 833], [857, 877, 833],
];

// Comprimento acumulado de cada ponto da linha.
const ACUMULADO = LINHA.reduce<number[]>((acc, p, i) => {
  if (i === 0) return [0];
  const [x0, y0] = LINHA[i - 1];
  return [...acc, acc[i - 1] + Math.hypot(p[0] - x0, p[1] - y0)];
}, []);
const TOTAL = ACUMULADO[ACUMULADO.length - 1];

// Ponto da linha numa fração 0..1 do comprimento.
const pontoNa = (e: number): [number, number] => {
  const alvo = e * TOTAL;
  for (let i = 1; i < LINHA.length; i++) {
    if (alvo <= ACUMULADO[i]) {
      const t = (alvo - ACUMULADO[i - 1]) / (ACUMULADO[i] - ACUMULADO[i - 1]);
      return [
        LINHA[i - 1][0] + (LINHA[i][0] - LINHA[i - 1][0]) * t,
        LINHA[i - 1][1] + (LINHA[i][1] - LINHA[i - 1][1]) * t,
      ];
    }
  }
  return LINHA[LINHA.length - 1];
};

export const GraficoSubindo: React.FC<Props> = ({ inicio, duracao }) => {
  const frame = useCurrentFrame();
  const e = interpolate(frame, [inicio, inicio + duracao], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const visivel = interpolate(frame, [inicio - 6, inicio], [0, 1], clamp);
  const [px, py] = pontoNa(e);
  const caminho = LINHA.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const chegou = interpolate(frame, [inicio + duracao - 4, inicio + duracao + 4], [0, 1], clamp);
  const pulso = interpolate(frame - (inicio + duracao), [0, 8, 30], [0, 1, 0.35], clamp);
  // As barras acendem numa varredura da 1ª à última (a última fica à direita da seta).
  const varredura = 40 + (900 - 40) * e;

  return (
    <svg
      viewBox="0 0 940 1672"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: visivel, mixBlendMode: "screen" }}
    >
      {/* Barras acendendo de baixo para cima quando a ponta passa. */}
      {BARRAS.map(([esq, dir, topo]) => {
        const h = interpolate(varredura, [esq - 10, dir + 20], [0, 1], clamp);
        const altura = (BASE - topo) * h;
        return (
          <rect
            key={`${esq}-${topo}`}
            x={esq}
            y={BASE - altura}
            width={dir - esq}
            height={altura}
            fill={comAlfa(COR.dourado, 0.38)}
            stroke={comAlfa("#FFE9A8", 0.8)}
            strokeWidth={1.5}
          />
        );
      })}
      {/* Linha: brilho largo + traço claro, crescendo da base até a seta. */}
      <path
        d={caminho}
        fill="none"
        stroke={comAlfa(COR.dourado, 0.45)}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - e}
      />
      <path
        d={caminho}
        fill="none"
        stroke="#FFF1C2"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - e}
      />
      {/* Ponta da linha. */}
      {e > 0 && e < 1 ? (
        <>
          <circle cx={px} cy={py} r={26} fill={comAlfa(COR.dourado, 0.35)} />
          <circle cx={px} cy={py} r={8} fill="#FFF6D8" />
        </>
      ) : null}
      {/* Seta e brilho final. */}
      <polyline
        points="818,707 843,702 838,727"
        fill="none"
        stroke="#FFF1C2"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={chegou}
      />
      <circle cx={843} cy={702} r={70 * (0.6 + 0.4 * pulso)} fill="url(#brilho-seta)" opacity={pulso} />
      <defs>
        <radialGradient id="brilho-seta">
          <stop offset="0%" stopColor="#FFF1C2" stopOpacity={0.9} />
          <stop offset="35%" stopColor={COR.dourado} stopOpacity={0.45} />
          <stop offset="100%" stopColor={COR.dourado} stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
};
