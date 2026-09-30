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

// Componente v2 — do zero. Duas barras verticais, sem números em lugar
// nenhum (nem como opção) — "alturaRelativa" é só uma proporção visual
// (0 a 1), nunca um dado exibido na tela.

const barraSchema = z.object({
  label: z.string(),
  alturaRelativa: z.number().min(0).max(1),
  cor: zColor(),
  destaque: z.boolean(),
  frameEntrada: z.number().min(0),
});

export const barrasDueloSchema = z.object({
  // Opcional (29/09/2026): padrão transparente, pra não tampar o vídeo por
  // engano quando usado como camada.
  corFundo: zColor().optional(),
  barras: z.array(barraSchema),
  legenda: z.string(),
  mostrarLegenda: z.boolean(),
  larguraBarra: z.number().min(0.02).max(0.5),
  alturaMaxima: z.number().min(0.05).max(0.9),
  // Opcional (26/09/2026): PNG de fundo transparente, de
  // public/images/personagens/. Sem ela, o componente funciona igual a
  // antes. Revela (fade + escala) depois que a barra de destaque cresce.
  imagemPersonagem: z.string().optional(),
  tamanhoImagemPersonagem: z.number().min(0.05).max(0.6).optional(),
});

type Props = z.infer<typeof barrasDueloSchema>;
type Barra = z.infer<typeof barraSchema>;

const Coluna: React.FC<{
  barra: Barra;
  x: number;
  larguraBarra: number;
  alturaMaximaPx: number;
  baseY: number;
}> = ({ barra, x, larguraBarra, alturaMaximaPx, baseY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - barra.frameEntrada;

  const progresso = spring({
    frame: local,
    fps,
    config: barra.destaque
      ? { damping: 14, stiffness: 120, mass: 0.7 }
      : { damping: 22, stiffness: 60, mass: 1 },
  });
  const progressoClamp = Math.max(0, Math.min(1, progresso));
  const alturaAtual = interpolate(
    progressoClamp,
    [0, 1],
    [0, alturaMaximaPx * barra.alturaRelativa],
  );
  const opacityLabel = interpolate(local, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const respiro = barra.destaque
    ? 1 + Math.sin(Math.max(0, local - 40) / 8) * 0.015
    : 1;

  const topoY = baseY - alturaAtual;
  const glow = barra.destaque
    ? `0 0 ${larguraBarra * 0.25}px ${barra.cor}`
    : "none";

  return (
    <g transform={`translate(${x}, 0)`}>
      <g
        style={{
          transform: `scale(${respiro})`,
          transformOrigin: `${larguraBarra / 2}px ${baseY}px`,
        }}
      >
        <rect
          x={0}
          y={topoY}
          width={larguraBarra}
          height={alturaAtual}
          rx={larguraBarra * 0.12}
          fill={barra.cor}
          style={{ filter: barra.destaque ? `drop-shadow(${glow})` : "none" }}
        />
      </g>
      <text
        x={larguraBarra / 2}
        y={baseY + larguraBarra * 0.28}
        fill="#c7cad1"
        fontSize={larguraBarra * 0.22}
        fontFamily="'Arial Narrow', Arial, sans-serif"
        textAnchor="middle"
        opacity={opacityLabel}
        letterSpacing={1}
      >
        {barra.label.toUpperCase()}
      </text>
    </g>
  );
};

export const BarrasDuelo: React.FC<Props> = ({
  corFundo = "transparent",
  barras,
  legenda,
  mostrarLegenda,
  larguraBarra,
  alturaMaxima,
  imagemPersonagem,
  tamanhoImagemPersonagem = 0.24,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const barraDestaque =
    barras.find((b) => b.destaque) ?? barras[barras.length - 1];
  const framePersonagem = (barraDestaque?.frameEntrada ?? 0) + 55;
  const entradaPersonagem = spring({
    frame: frame - framePersonagem,
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.7 },
  });
  const escalaPersonagem = interpolate(entradaPersonagem, [0, 1], [0.6, 1]);
  const tamanhoImagemPx = width * tamanhoImagemPersonagem;

  const larguraBarraPx = width * larguraBarra;
  const alturaMaximaPx = height * alturaMaxima;
  const espacamento = larguraBarraPx * 1.5;
  const larguraSvg = espacamento * barras.length + larguraBarraPx;
  const baseY = alturaMaximaPx + larguraBarraPx * 0.6;
  const alturaSvg = baseY + larguraBarraPx * 0.6;

  return (
    <Sequence name="BarrasDuelo">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <svg
          width={larguraSvg}
          height={alturaSvg}
          viewBox={`0 0 ${larguraSvg} ${alturaSvg}`}
        >
          <line
            x1={0}
            y1={baseY}
            x2={larguraSvg}
            y2={baseY}
            stroke="#ffffff"
            strokeOpacity={0.15}
            strokeWidth={2}
          />
          {barras.map((barra, i) => (
            <Coluna
              key={barra.label}
              barra={barra}
              x={espacamento * i + larguraBarraPx * 0.25}
              larguraBarra={larguraBarraPx}
              alturaMaximaPx={alturaMaximaPx}
              baseY={baseY}
            />
          ))}
          {mostrarLegenda && (
            <text
              x={12}
              y={20}
              fill="#8a8f9c"
              fontSize={16}
              fontFamily="'Arial Narrow', Arial, sans-serif"
              letterSpacing={1}
            >
              {legenda.toUpperCase()}
            </text>
          )}
        </svg>
        {imagemPersonagem && (
          <div
            style={{
              position: "absolute",
              top: "6%",
              right: "8%",
              width: tamanhoImagemPx,
              height: tamanhoImagemPx,
              opacity: Math.min(1, entradaPersonagem),
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
    </Sequence>
  );
};
