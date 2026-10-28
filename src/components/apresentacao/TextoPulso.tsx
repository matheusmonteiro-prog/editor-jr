import React from "react";
import { clamp } from "../../utils/clamp";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, ESPACO_TITULO, FONTE_ROTULO, FONTE_TITULO, PESO_TITULO, comAlfa } from "./marca";

// Frase inteira que entra de uma vez (spring em escala) e, se `pulso` > 1, dá
// UMA batida só, como batimento de coração (1 → pulso → 1 em 10 frames).

type Props = {
  texto: string;
  inicio: number; // frame (relativo à Sequence)
  top: number; // fração da altura (topo)
  tamanho: number; // fração da largura
  cor?: string;
  fonte?: "titulo" | "rotulo";
  peso?: number; // peso da Inter nos títulos (padrão 800)
  escalaInicial?: number; // entra em escala a partir daqui, com overshoot (padrão 0,6)
  damping?: number; // mola da entrada (padrão 12)
  pulso?: number; // escala máxima da batida; 1 = sem batida
  saida?: number;
  larguraMax?: number; // fração da largura
  brilho?: boolean; // halo dourado suave junto da batida
};

export const TextoPulso: React.FC<Props> = ({
  texto,
  inicio,
  top,
  tamanho,
  cor = COR.creme,
  fonte = "titulo",
  peso = PESO_TITULO,
  escalaInicial = 0.6,
  damping = 12,
  pulso = 1,
  saida,
  larguraMax = 0.9,
  brilho = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const alto = texto.toLocaleUpperCase("pt-BR");
  const fontSize = Math.min(width * tamanho, (width * larguraMax) / (alto.length * 0.78));

  const p = spring({ frame: frame - inicio, fps, config: { damping, mass: 1 }, durationInFrames: 12 });
  const op = interpolate(frame - inicio, [0, 4], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  // A batida começa quando a frase já assentou.
  const batida = interpolate(frame - (inicio + 8), [0, 5, 10], [1, pulso, 1], clamp);
  const halo = brilho ? interpolate(frame - (inicio + 8), [0, 5, 22], [0, 0.8, 0.25], clamp) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        display: "flex",
        justifyContent: "center",
        opacity: op * (1 - q),
        transform: `translateY(${-q * height * 0.02}px) scale(${interpolate(p, [0, 1], [escalaInicial, 1]) * batida})`,
        transformOrigin: "50% 50%",
      }}
    >
      <span
        style={{
          fontFamily: fonte === "titulo" ? FONTE_TITULO : FONTE_ROTULO,
          fontWeight: fonte === "titulo" ? peso : 600,
          letterSpacing: fonte === "titulo" ? ESPACO_TITULO : ESPACO_ROTULO,
          fontSize,
          lineHeight: 1.1,
          color: cor,
          whiteSpace: "nowrap",
          textShadow: brilho ? `0 0 ${fontSize * 0.3}px ${comAlfa(COR.dourado, halo)}` : undefined,
        }}
      >
        {alto}
      </span>
    </div>
  );
};
