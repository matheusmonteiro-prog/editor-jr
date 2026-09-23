import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const cenaSchema = z.object({
  src: z.string(),
  x: z.number(),
  y: z.number(),
  largura: z.number().min(10),
  rotacaoFinal: z.number(),
  frameEntrada: z.number().min(0),
});

export const colagemCenasSchema = z.object({
  corFundo: zColor(),
  cenas: z.array(cenaSchema),
});

type Props = z.infer<typeof colagemCenasSchema>;

type CenaProps = z.infer<typeof cenaSchema>;

const Cena: React.FC<CenaProps> = ({ src, x, y, largura, rotacaoFinal, frameEntrada }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - frameEntrada;
  const progresso = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });
  if (localFrame < 0) return null;
  const translateY = interpolate(progresso, [0, 1], [80, 0]);
  const scale = interpolate(progresso, [0, 1], [0.7, 1]);
  const rotate = interpolate(progresso, [0, 1], [rotacaoFinal * 2, rotacaoFinal]);
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

export const ColagemCenas: React.FC<Props> = ({ corFundo, cenas }) => {
  return (
    <div style={{ flex: 1, backgroundColor: corFundo, position: "relative" }}>
      {cenas.map((cena, i) => (
        <Cena key={i} {...cena} />
      ))}
    </div>
  );
};

export const colagemCenasDefaultProps: Props = {
  corFundo: "#f0ebe0",
  cenas: [
    { src: "images/cena1.png", x: 40, y: 100, largura: 380, rotacaoFinal: -6, frameEntrada: 0 },
    { src: "images/cena2.png", x: 450, y: 80, largura: 380, rotacaoFinal: 4, frameEntrada: 25 },
    { src: "images/cena3.png", x: 860, y: 110, largura: 380, rotacaoFinal: -3, frameEntrada: 50 },
  ],
};
