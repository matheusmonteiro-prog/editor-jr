import React from "react";
import {
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — do zero. Linha "realista" (com recuos, não uma reta
// perfeita), sem nenhum número exibido em lugar nenhum — só forma
// ilustrativa. Ponto na ponta acompanha o traço.

export const graficoCrescimentoSchema = z.object({
  corFundo: zColor(),
  corLinha: zColor(),
  rotuloEixoX: z.string(),
  mostrarRotuloEixoX: z.boolean(),
  textoIlustrativo: z.string(),
  mostrarTextoIlustrativo: z.boolean(),
  textoFinal: z.string(),
  mostrarTextoFinal: z.boolean(),
  largura: z.number().min(0.1).max(0.95),
  altura: z.number().min(0.1).max(0.95),
  duracaoFramesDesenho: z.number().min(10),
  // Opcional (26/09/2026): PNG de fundo transparente, de
  // public/images/personagens/. Sem ela, o componente funciona igual a
  // antes. Revela aos poucos, acompanhando o progresso do traço.
  imagemPersonagem: z.string().optional(),
  tamanhoImagemPersonagem: z.number().min(0.05).max(0.6).optional(),
});

type Props = z.infer<typeof graficoCrescimentoSchema>;

// Pontos fixos (fração da largura/altura do gráfico) com pequenos recuos —
// realista, não uma reta perfeita. Fixos, não aleatórios.
const pontosBase = [
  { x: 0.06, y: 0.74 },
  { x: 0.18, y: 0.62 },
  { x: 0.3, y: 0.68 },
  { x: 0.44, y: 0.5 },
  { x: 0.56, y: 0.57 },
  { x: 0.69, y: 0.4 },
  { x: 0.8, y: 0.46 },
  { x: 0.92, y: 0.2 },
];

export const GraficoCrescimento: React.FC<Props> = ({
  corFundo,
  corLinha,
  rotuloEixoX,
  mostrarRotuloEixoX,
  textoIlustrativo,
  mostrarTextoIlustrativo,
  textoFinal,
  mostrarTextoFinal,
  largura,
  altura,
  duracaoFramesDesenho,
  imagemPersonagem,
  tamanhoImagemPersonagem = 0.26,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const larguraPx = width * largura;
  const alturaPx = height * altura;
  const tamanhoImagemPx = width * tamanhoImagemPersonagem;

  const entrada = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 90, mass: 0.6 },
  });
  const opacityGeral = Math.min(1, entrada);
  const translateY = interpolate(entrada, [0, 1], [30, 0]);

  const pontos = pontosBase.map((p) => ({
    x: p.x * larguraPx,
    y: p.y * alturaPx,
  }));

  const progressoLinha = spring({
    frame: frame - 12,
    fps,
    config: { damping: 20, stiffness: 60 },
    durationInFrames: duracaoFramesDesenho,
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
  const baseY = alturaPx * 0.95;
  const areaPath = `${linhaPath} L ${pontosAtivos[pontosAtivos.length - 1].x} ${baseY} L ${pontosAtivos[0].x} ${baseY} Z`;
  const ultimoPonto = pontosAtivos[pontosAtivos.length - 1];
  const pulso = 6 + Math.sin(frame / 4) * 2;
  const popTextoFinal = interpolate(progressoClamp, [0.9, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Revela aos poucos, acompanhando o desenho do traço (não só no fim).
  const escalaPersonagem = interpolate(progressoClamp, [0, 1], [0.7, 1]);

  return (
    <Sequence name="GraficoCrescimento">
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
            transform: `translateY(${translateY}px)`,
            position: "relative",
          }}
        >
          <svg
            width={larguraPx}
            height={alturaPx}
            viewBox={`0 0 ${larguraPx} ${alturaPx}`}
          >
            <defs>
              <linearGradient id="gc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={corLinha} stopOpacity={0.35} />
                <stop offset="100%" stopColor={corLinha} stopOpacity={0} />
              </linearGradient>
              <filter id="gc-brilho">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={areaPath} fill="url(#gc-area)" />
            <path
              d={linhaPath}
              fill="none"
              stroke={corLinha}
              strokeWidth={5}
              strokeLinecap="round"
              filter="url(#gc-brilho)"
            />
            {ultimoPonto && (
              <>
                <circle
                  cx={ultimoPonto.x}
                  cy={ultimoPonto.y}
                  r={pulso + 8}
                  fill={corLinha}
                  fillOpacity={0.25}
                />
                <circle
                  cx={ultimoPonto.x}
                  cy={ultimoPonto.y}
                  r={pulso}
                  fill={corLinha}
                />
              </>
            )}
            {mostrarTextoIlustrativo && (
              <text
                x={larguraPx * 0.98}
                y={alturaPx * 0.06}
                fill="#8a8f9c"
                fontSize={larguraPx * 0.023}
                fontFamily="'Arial Narrow', Arial, sans-serif"
                textAnchor="end"
                letterSpacing={2}
              >
                {textoIlustrativo.toUpperCase()}
              </text>
            )}
            {mostrarRotuloEixoX && (
              <text
                x={larguraPx / 2}
                y={alturaPx * 0.99}
                fill="#8a8f9c"
                fontSize={larguraPx * 0.02}
                fontFamily="'Arial Narrow', Arial, sans-serif"
                textAnchor="middle"
                letterSpacing={2}
              >
                {rotuloEixoX.toUpperCase()}
              </text>
            )}
            {mostrarTextoFinal && ultimoPonto && (
              <text
                x={ultimoPonto.x}
                y={ultimoPonto.y - pulso - 16}
                fill={corLinha}
                fontSize={larguraPx * 0.045}
                fontWeight={800}
                fontFamily="'Arial Narrow', Arial, sans-serif"
                textAnchor="middle"
                opacity={popTextoFinal}
              >
                {textoFinal.toUpperCase()}
              </text>
            )}
          </svg>
          {imagemPersonagem && (
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: alturaPx * 0.02,
                width: tamanhoImagemPx,
                height: tamanhoImagemPx,
                opacity: progressoClamp,
                transform: `scale(${escalaPersonagem})`,
              }}
            >
              <Img
                src={staticFile(`images/personagens/${imagemPersonagem}`)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>
    </Sequence>
  );
};
