import React from "react";
import {
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const graficoLinhaSchema = z.object({
  titulo: z.string(),
  valorFinal: z.number(),
  corFundo: zColor(),
  corLinhaInicio: zColor(),
  corLinhaFim: zColor(),
  largura: z.number().min(100),
  altura: z.number().min(100),
  frameFimSaida: z.number().min(1),
  // Opcionais (26/09/2026, TesteRoteiro01): todos preservam o comportamento
  // atual quando omitidos, pra não quebrar as composições existentes.
  mostrarNumero: z.boolean().optional(),
  rotuloEixoX: z.string().optional(),
  oscilar: z.boolean().optional(),
  textoFinal: z.string().optional(),
});

type Props = z.infer<typeof graficoLinhaSchema>;

// Pontos fixos que formam o desenho da linha (proporcionais à largura/altura do gráfico)
const pontosBaseSuave = [
  { x: 0.09, y: 0.67 },
  { x: 0.25, y: 0.57 },
  { x: 0.41, y: 0.62 },
  { x: 0.57, y: 0.43 },
  { x: 0.73, y: 0.33 },
  { x: 0.89, y: 0.21 },
];

// Variante "realista", com pequenos recuos no meio do caminho em vez de uma
// reta perfeita — ainda fixa (não aleatória), só um desenho diferente.
const pontosBaseOscilante = [
  { x: 0.08, y: 0.72 },
  { x: 0.2, y: 0.6 },
  { x: 0.32, y: 0.66 },
  { x: 0.46, y: 0.48 },
  { x: 0.58, y: 0.55 },
  { x: 0.71, y: 0.38 },
  { x: 0.81, y: 0.44 },
  { x: 0.9, y: 0.2 },
];

export const GraficoLinha: React.FC<Props> = ({
  titulo,
  valorFinal,
  corFundo,
  corLinhaInicio,
  corLinhaFim,
  largura,
  altura,
  frameFimSaida,
  mostrarNumero = true,
  rotuloEixoX,
  oscilar = false,
  textoFinal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 90, mass: 0.6 },
  });
  const saida = interpolate(
    frame,
    [frameFimSaida - 30, frameFimSaida],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacityGeral = Math.min(entrada, saida);
  const scaleGeral = interpolate(entrada, [0, 1], [0.9, 1]);
  const translateY = interpolate(entrada, [0, 1], [30, 0]);

  const pontosBase = oscilar ? pontosBaseOscilante : pontosBaseSuave;
  const pontos = pontosBase.map((p) => ({ x: p.x * largura, y: p.y * altura }));

  const progressoLinha = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 60 },
  });
  const progressoClamp = Math.max(0, Math.min(1, progressoLinha));
  const pontosVisiveis = Math.max(
    1,
    Math.floor(progressoClamp * (pontos.length - 1)) + 1,
  );
  const pontosAtivos = pontos.slice(0, pontosVisiveis);

  const criarPathSuave = (pts: typeof pontos) => {
    if (pts.length < 2) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const atual = pts[i];
      const proximo = pts[i + 1];
      const meioX = (atual.x + proximo.x) / 2;
      d += ` Q ${atual.x} ${atual.y} ${meioX} ${(atual.y + proximo.y) / 2}`;
    }
    const ultimo = pts[pts.length - 1];
    d += ` T ${ultimo.x} ${ultimo.y}`;
    return d;
  };

  const linhaPath = criarPathSuave(pontosAtivos);
  const baseY = altura * 0.95;
  const areaPath = `${linhaPath} L ${pontosAtivos[pontosAtivos.length - 1].x} ${baseY} L ${pontosAtivos[0].x} ${baseY} Z`;
  const ultimoPonto = pontosAtivos[pontosAtivos.length - 1];
  const numero = Math.round(
    interpolate(progressoClamp, [0, 1], [0, valorFinal]),
  );
  const pulso = 6 + Math.sin(frame / 4) * 2;
  const popTextoFinal = interpolate(progressoClamp, [0.9, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Sequence name="GraficoLinha">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: opacityGeral,
            transform: `scale(${scaleGeral}) translateY(${translateY}px)`,
          }}
        >
          <svg
            width={largura}
            height={altura}
            viewBox={`0 0 ${largura} ${altura}`}
          >
            <defs>
              <linearGradient id="linhaGradiente" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={corLinhaInicio} />
                <stop offset="100%" stopColor={corLinhaFim} />
              </linearGradient>
              <linearGradient id="areaGradiente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={corLinhaFim} stopOpacity={0.35} />
                <stop offset="100%" stopColor={corLinhaFim} stopOpacity={0} />
              </linearGradient>
              <filter id="brilho">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={0}
                y1={(altura / 5.25) * (i + 1)}
                x2={largura}
                y2={(altura / 5.25) * (i + 1)}
                stroke="#ffffff"
                strokeOpacity={0.06}
                strokeWidth={1}
              />
            ))}
            <path d={areaPath} fill="url(#areaGradiente)" />
            <path
              d={linhaPath}
              fill="none"
              stroke="url(#linhaGradiente)"
              strokeWidth={5}
              strokeLinecap="round"
              filter="url(#brilho)"
            />
            {ultimoPonto && (
              <>
                <circle
                  cx={ultimoPonto.x}
                  cy={ultimoPonto.y}
                  r={pulso + 8}
                  fill={corLinhaFim}
                  fillOpacity={0.25}
                />
                <circle
                  cx={ultimoPonto.x}
                  cy={ultimoPonto.y}
                  r={pulso}
                  fill={corLinhaFim}
                />
              </>
            )}
            {mostrarNumero && (
              <text
                x={largura * 0.89}
                y={altura * 0.1}
                fill="white"
                fontSize={largura * 0.06}
                fontWeight={700}
                fontFamily="Arial, sans-serif"
                textAnchor="end"
              >
                +{numero}%
              </text>
            )}
            <text
              x={largura * 0.89}
              y={altura * 0.05}
              fill="#8a8f9c"
              fontSize={largura * 0.023}
              fontFamily="Arial, sans-serif"
              textAnchor="end"
              letterSpacing={2}
            >
              {titulo.toUpperCase()}
            </text>
            {rotuloEixoX && (
              <text
                x={largura / 2}
                y={altura * 0.985}
                fill="#8a8f9c"
                fontSize={largura * 0.02}
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
                letterSpacing={2}
              >
                {rotuloEixoX.toUpperCase()}
              </text>
            )}
            {textoFinal && ultimoPonto && (
              <text
                x={ultimoPonto.x}
                y={ultimoPonto.y - pulso - 16}
                fill={corLinhaFim}
                fontSize={largura * 0.045}
                fontWeight={800}
                fontFamily="Arial, sans-serif"
                textAnchor="middle"
                opacity={popTextoFinal}
              >
                {textoFinal.toUpperCase()}
              </text>
            )}
          </svg>
        </div>
      </div>
    </Sequence>
  );
};
