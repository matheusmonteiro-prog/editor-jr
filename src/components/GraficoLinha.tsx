import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
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
});

type Props = z.infer<typeof graficoLinhaSchema>;

// Pontos fixos que formam o desenho da linha (proporcionais à largura/altura do gráfico)
const pontosBase = [
  { x: 0.09, y: 0.67 },
  { x: 0.25, y: 0.57 },
  { x: 0.41, y: 0.62 },
  { x: 0.57, y: 0.43 },
  { x: 0.73, y: 0.33 },
  { x: 0.89, y: 0.21 },
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
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacityGeral = Math.min(entrada, saida);
  const scaleGeral = interpolate(entrada, [0, 1], [0.9, 1]);
  const translateY = interpolate(entrada, [0, 1], [30, 0]);

  const pontos = pontosBase.map((p) => ({ x: p.x * largura, y: p.y * altura }));

  const progressoLinha = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 60 },
  });
  const progressoClamp = Math.max(0, Math.min(1, progressoLinha));
  const pontosVisiveis = Math.max(
    1,
    Math.floor(progressoClamp * (pontos.length - 1)) + 1
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
  const numero = Math.round(interpolate(progressoClamp, [0, 1], [0, valorFinal]));
  const pulso = 6 + Math.sin(frame / 4) * 2;

  return (
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
        <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
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
              <circle cx={ultimoPonto.x} cy={ultimoPonto.y} r={pulso + 8} fill={corLinhaFim} fillOpacity={0.25} />
              <circle cx={ultimoPonto.x} cy={ultimoPonto.y} r={pulso} fill={corLinhaFim} />
            </>
          )}
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
        </svg>
      </div>
    </div>
  );
};

export const graficoLinhaDefaultProps: Props = {
  titulo: "Valorização",
  valorFinal: 32,
  corFundo: "#111318",
  corLinhaInicio: "#00d9ff",
  corLinhaFim: "#00ff9d",
  largura: 880,
  altura: 420,
  frameFimSaida: 140,
};
