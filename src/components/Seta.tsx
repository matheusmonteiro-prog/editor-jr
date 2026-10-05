import React from "react";
import {
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Redesenhada (05/10/2026) — uma curva suave e ampla (um arco, sem onda em S),
// feita como uma fita preenchida: fina na base, mais grossa perto da ponta, com
// bordas levemente irregulares (desvio fixo, não aleatório). A linha desenha da
// base até a ponta; a ponta é um V aberto (dois traços curtos) que aparece no
// fim do desenho. Saída com fade completo. Tudo em fração de width/height.

export const setaSchema = z.object({
  xInicial: z.number().min(0).max(1).default(0.25),
  yInicial: z.number().min(0).max(1).default(0.7),
  xFinal: z.number().min(0).max(1).default(0.6),
  yFinal: z.number().min(0).max(1).default(0.35),
  cor: zColor().default("#EFAF20"),
  espessura: z.number().min(0.001).max(0.05).default(0.008),
  curvatura: z.enum(["reta", "curva"]).default("curva"),
  duracaoFrames: z.number().min(10).default(60),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof setaSchema>;

type Ponto = { x: number; y: number };

const AMOSTRAS = 48;
const FRACAO_ESPESSURA_BASE = 0.25;
const ABERTURA_V_RAD = 0.5;
const COMPRIMENTO_V_EM_ESPESSURAS = 7;
const FRACAO_DESENHO_LINHA = 0.75;

// Desvio fixo de cada borda, em fração de `espessura` — dá o ar de traço à mão.
const irregularidade = (i: number, lado: number): number =>
  0.08 * Math.sin(i * 1.7 + lado * 2.1) + 0.05 * Math.sin(i * 3.9 + lado);

export const Seta: React.FC<Props> = ({
  xInicial = 0.25,
  yInicial = 0.7,
  xFinal = 0.6,
  yFinal = 0.35,
  cor = "#EFAF20",
  espessura = 0.008,
  curvatura = "curva",
  duracaoFrames = 60,
  framesEntrada = 15,
  framesSaida = 15,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const p0: Ponto = { x: width * xInicial, y: height * yInicial };
  const p2: Ponto = { x: width * xFinal, y: height * yFinal };
  const dx = p2.x - p0.x;
  const dy = p2.y - p0.y;
  const comprimento = Math.sqrt(dx * dx + dy * dy) || 1;

  // Ponto de controle deslocado só pra um lado: forma um arco único.
  const fatorArco = curvatura === "curva" ? 0.28 : 0.04;
  const p1: Ponto = {
    x: (p0.x + p2.x) / 2 + (-dy / comprimento) * comprimento * fatorArco,
    y: (p0.y + p2.y) / 2 + (dx / comprimento) * comprimento * fatorArco,
  };

  const ponto = (t: number): Ponto => {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
  };
  const tangente = (t: number): Ponto => {
    const tx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const ty = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const norma = Math.sqrt(tx * tx + ty * ty) || 1;
    return { x: tx / norma, y: ty / norma };
  };

  const espessuraPx = width * espessura;

  const framesLinha = framesEntrada * FRACAO_DESENHO_LINHA;
  const progressoLinha = interpolate(frame, [0, framesLinha], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Fita: borda esquerda indo, borda direita voltando. A largura depende da
  // posição na curva INTEIRA (tAbs), então não muda enquanto a linha cresce.
  const esquerda: Ponto[] = [];
  const direita: Ponto[] = [];
  for (let i = 0; i <= AMOSTRAS; i++) {
    const tAbs = progressoLinha * (i / AMOSTRAS);
    const centro = ponto(tAbs);
    const tg = tangente(tAbs);
    const normal = { x: -tg.y, y: tg.x };
    const perfil =
      FRACAO_ESPESSURA_BASE +
      (1 - FRACAO_ESPESSURA_BASE) * Math.pow(tAbs, 1.2);
    const meia = (espessuraPx * perfil) / 2;
    const ladoE = meia + espessuraPx * irregularidade(i, 0);
    const ladoD = meia + espessuraPx * irregularidade(i, 1);
    esquerda.push({
      x: centro.x + normal.x * ladoE,
      y: centro.y + normal.y * ladoE,
    });
    direita.push({
      x: centro.x - normal.x * ladoD,
      y: centro.y - normal.y * ladoD,
    });
  }
  const fita =
    `M ${esquerda[0].x} ${esquerda[0].y} ` +
    esquerda.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") +
    " " +
    direita
      .slice()
      .reverse()
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ") +
    " Z";

  // Ponta em V: nasce depois que a linha terminou, nos últimos 25% da entrada.
  const progressoV = interpolate(frame, [framesLinha, framesEntrada], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tgFinal = tangente(1);
  const voltaX = -tgFinal.x;
  const voltaY = -tgFinal.y;
  const braco = (angulo: number, escala: number): Ponto => {
    const cos = Math.cos(angulo);
    const sen = Math.sin(angulo);
    const comp = espessuraPx * COMPRIMENTO_V_EM_ESPESSURAS * escala * progressoV;
    return {
      x: p2.x + (voltaX * cos - voltaY * sen) * comp,
      y: p2.y + (voltaX * sen + voltaY * cos) * comp,
    };
  };
  const bracoA = braco(ABERTURA_V_RAD, 1);
  const bracoB = braco(-ABERTURA_V_RAD, 0.9);

  const opacidadeSaida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Sequence name="Seta">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: opacidadeSaida,
        }}
      >
        <path d={fita} fill={cor} stroke={cor} strokeWidth={espessuraPx * 0.1} strokeLinejoin="round" />
        {progressoV > 0 && (
          <g
            fill="none"
            stroke={cor}
            strokeWidth={espessuraPx * 0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={`M ${p2.x} ${p2.y} L ${bracoA.x} ${bracoA.y}`} />
            <path d={`M ${p2.x} ${p2.y} L ${bracoB.x} ${bracoB.y}`} />
          </g>
        )}
      </svg>
    </Sequence>
  );
};
