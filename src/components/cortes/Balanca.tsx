import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { COR_CORTE, entrada, FONTE_TITULO, NOMES_COR } from "./estiloCortes";

// Balança de comparação: dois pratos com rótulo e peso. Começa equilibrada e, no 1º passo, pende
// para o lado mais pesado. Sem números: o peso é só visual (não inventar dado).

export const balancaSchema = z.object({
  rotuloEsq: z.string().default("ESQUERDA"),
  apoioEsq: z.string().default(""),
  corEsq: z.enum(NOMES_COR).default("marrom"),
  pesoEsq: z.number().min(1).max(4).default(1),
  rotuloDir: z.string().default("DIREITA"),
  apoioDir: z.string().default(""),
  corDir: z.enum(NOMES_COR).default("verdeMetodo"),
  pesoDir: z.number().min(1).max(4).default(3),
  largura: z.number().default(760),
  passos: z.array(z.number()).default([]), // [quando pende]
});
type Props = z.input<typeof balancaSchema>;

const VB = { w: 600, h: 400 };

export const Balanca: React.FC<Props> = ({
  rotuloEsq = "ESQUERDA",
  apoioEsq = "",
  corEsq = "marrom",
  pesoEsq = 1,
  rotuloDir = "DIREITA",
  apoioDir = "",
  corDir = "verdeMetodo",
  pesoDir = 3,
  largura = 760,
  passos = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = entrada(frame, 0, 10);
  const pender = passos[0] === undefined ? 0 : spring({ frame: frame - passos[0], fps, config: { damping: 9, stiffness: 120 } });
  const lado = pesoDir === pesoEsq ? 0 : pesoDir > pesoEsq ? 1 : -1;
  const ang = (lado * 11 * pender * Math.PI) / 180;
  const cx = 300;
  const cy = 95;
  const braco = 215;
  const pontas = [-1, 1].map((s) => ({ x: cx + s * braco * Math.cos(ang), y: cy + s * braco * Math.sin(ang) }));
  const prato = (i: number, rotulo: string, apoio: string, cor: string, peso: number) => {
    const { x, y } = pontas[i];
    const yp = y + 120;
    return (
      <g key={i}>
        <line x1={x} y1={y} x2={x - 62} y2={yp} stroke={COR_CORTE.carvao} strokeWidth={2} />
        <line x1={x} y1={y} x2={x + 62} y2={yp} stroke={COR_CORTE.carvao} strokeWidth={2} />
        <path d={`M ${x - 78} ${yp} Q ${x} ${yp + 34} ${x + 78} ${yp} Z`} fill={COR_CORTE.carvao} />
        {Array.from({ length: peso }).map((_, k) => (
          <rect key={k} x={x - 34} y={yp - 22 - k * 24} width={68} height={22} rx={3} fill={cor} stroke={COR_CORTE.papelClaro} strokeWidth={2} />
        ))}
        <text x={x} y={yp + 66} textAnchor="middle" fontFamily={FONTE_TITULO} fontSize={30} fill={cor}>
          {rotulo.toUpperCase()}
        </text>
        {apoio ? (
          <text x={x} y={yp + 100} textAnchor="middle" fontFamily={FONTE_TITULO} fontSize={24} fill={COR_CORTE.carvao}>
            {apoio.toUpperCase()}
          </text>
        ) : null}
      </g>
    );
  };
  return (
    <svg
      width={largura}
      height={(largura * VB.h) / VB.w}
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      style={{ overflow: "visible", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}
    >
      <path d={`M ${cx} ${cy} L ${cx} 330`} stroke={COR_CORTE.carvao} strokeWidth={9} />
      <path d={`M ${cx - 70} 345 L ${cx + 70} 345 L ${cx + 40} 325 L ${cx - 40} 325 Z`} fill={COR_CORTE.carvao} />
      <line x1={pontas[0].x} y1={pontas[0].y} x2={pontas[1].x} y2={pontas[1].y} stroke={COR_CORTE.carvao} strokeWidth={10} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={13} fill={COR_CORTE.carvao} />
      {prato(0, rotuloEsq, apoioEsq, COR_CORTE[corEsq], pesoEsq)}
      {prato(1, rotuloDir, apoioDir, COR_CORTE[corDir], pesoDir)}
    </svg>
  );
};
