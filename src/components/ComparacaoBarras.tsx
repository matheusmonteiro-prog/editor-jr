import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const barraSchema = z.object({
  label: z.string(),
  valorFinal: z.number(),
  cor: zColor(),
  corTopo: zColor(),
  frameEntrada: z.number().min(0),
  destaque: z.boolean(),
});

export const comparacaoBarrasSchema = z.object({
  corFundo: zColor(),
  valorMaximoEscala: z.number().min(1),
  larguraBarra: z.number().min(10),
  alturaMaximaBarra: z.number().min(10),
  barras: z.array(barraSchema),
});

type Props = z.infer<typeof comparacaoBarrasSchema>;
type BarraSchemaProps = z.infer<typeof barraSchema>;

type BarraProps = BarraSchemaProps & {
  x: number;
  valorMaximoEscala: number;
  larguraBarra: number;
  alturaMaximaBarra: number;
  baseY: number;
};

const Barra: React.FC<BarraProps> = ({
  label,
  valorFinal,
  valorMaximoEscala,
  x,
  cor,
  corTopo,
  frameEntrada,
  destaque,
  larguraBarra,
  alturaMaximaBarra,
  baseY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - frameEntrada;

  const progresso = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.9 },
  });
  const progressoClamp = Math.max(0, Math.min(1, progresso));

  const alturaAtual = interpolate(
    progressoClamp,
    [0, 1],
    [0, (valorFinal / valorMaximoEscala) * alturaMaximaBarra]
  );

  const valorContando = Math.round(
    interpolate(progressoClamp, [0, 1], [0, valorFinal])
  );

  const opacityLabel = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Leve "respiro" na barra de destaque depois que ela termina de subir
  const respiro = destaque
    ? 1 + Math.sin(Math.max(0, frame - frameEntrada - 40) / 8) * 0.015
    : 1;

  const topoY = baseY - alturaAtual;

  return (
    <g transform={`translate(${x}, 0)`}>
      <text
        x={larguraBarra / 2}
        y={topoY - 24}
        fill="white"
        fontSize={38}
        fontWeight={700}
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        opacity={opacityLabel}
      >
        {valorContando}%
      </text>

      <g style={{ transform: `scale(${respiro})`, transformOrigin: `${larguraBarra / 2}px ${baseY}px` }}>
        <rect
          x={0}
          y={topoY}
          width={larguraBarra}
          height={alturaAtual}
          rx={14}
          fill={`url(#grad-${label})`}
        />
        {destaque && (
          <rect
            x={0}
            y={topoY}
            width={larguraBarra}
            height={alturaAtual}
            rx={14}
            fill="none"
            stroke={corTopo}
            strokeWidth={2}
            strokeOpacity={0.5}
          />
        )}
      </g>

      <text
        x={larguraBarra / 2}
        y={baseY + 44}
        fill="#c7cad1"
        fontSize={22}
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        opacity={opacityLabel}
        letterSpacing={1}
      >
        {label.toUpperCase()}
      </text>

      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={corTopo} />
          <stop offset="100%" stopColor={cor} />
        </linearGradient>
      </defs>
    </g>
  );
};

export const ComparacaoBarras: React.FC<Props> = ({
  corFundo,
  valorMaximoEscala,
  larguraBarra,
  alturaMaximaBarra,
  barras,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entradaGeral = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 90 },
  });

  const opacityGeral = interpolate(entradaGeral, [0, 1], [0, 1]);

  const baseY = alturaMaximaBarra + 180;
  const espacamento = larguraBarra * 1.4;
  const larguraSvg = espacamento * barras.length + larguraBarra;
  const alturaSvg = baseY + 120;

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
      <div style={{ opacity: opacityGeral }}>
        <svg width={larguraSvg} height={alturaSvg} viewBox={`0 0 ${larguraSvg} ${alturaSvg}`}>
          <line x1={0} y1={baseY} x2={larguraSvg} y2={baseY} stroke="#ffffff" strokeOpacity={0.15} strokeWidth={2} />

          {barras.map((barra, i) => (
            <Barra
              key={barra.label}
              {...barra}
              x={espacamento * i + larguraBarra * 0.3}
              valorMaximoEscala={valorMaximoEscala}
              larguraBarra={larguraBarra}
              alturaMaximaBarra={alturaMaximaBarra}
              baseY={baseY}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export const comparacaoBarrasDefaultProps: Props = {
  corFundo: "#0d0f14",
  valorMaximoEscala: 30,
  larguraBarra: 220,
  alturaMaximaBarra: 380,
  barras: [
    { label: "Renda Fixa", valorFinal: 12, cor: "#3d5a80", corTopo: "#6ea8d8", frameEntrada: 0, destaque: false },
    { label: "Ações (JR)", valorFinal: 27, cor: "#0f9e6e", corTopo: "#00ff9d", frameEntrada: 20, destaque: true },
  ],
};
