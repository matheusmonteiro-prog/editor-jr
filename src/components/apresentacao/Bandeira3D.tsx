import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, MOLA, comAlfa } from "./marca";

// Bandeira como uma PLACA em CSS 3D, no estilo do Logo3D (rodada 7, bloco 02).
// - Entrada: gira no eixo Y vindo de lado, sobe um pouco e cresce, com spring; para virada
//   levemente para o centro da tela.
// - Depois flutua devagar (sobe/desce e balança alguns graus).
// - Luz direcional baixa vinda da esquerda (o brilho muda com o ângulo), fosca: sem reflexo.
// - Espessura: uma placa escura atrás da frente (sem filtro por frame).

type Props = {
  src: string; // relativo a public/
  proporcao: number; // largura / altura da imagem (Brasil 10/7, EUA 19/10)
  x: number; // centro, fração da largura
  y: number; // centro, fração da altura
  largura: number; // fração da largura
  lado: "esquerda" | "direita"; // de que lado da tela fica (vira para o centro)
  inicio: number; // frame (relativo à Sequence)
  saida?: number;
};

export const Bandeira3D: React.FC<Props> = ({ src, proporcao, x, y, largura, lado, inicio, saida }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const sinal = lado === "esquerda" ? 1 : -1; // a da esquerda vira para a direita e vice-versa
  const p = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 18 });
  const op = interpolate(frame - inicio, [0, 5], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);

  // Flutuação leve depois de assentar (ciclo de ~3 s).
  const t = (frame - inicio) / fps;
  const flutua = interpolate(frame - inicio, [12, 24], [0, 1], clamp);
  const balanco = Math.sin(t * 2.1) * 4 * flutua;
  const sobeDesce = Math.sin(t * 1.7) * height * 0.004 * flutua;

  const anguloY = sinal * interpolate(p, [0, 1], [100, 18]) + balanco;
  const anguloX = interpolate(p, [0, 1], [-12, -4]);
  const ladoPx = width * largura;
  const alturaPx = ladoPx / proporcao;
  const espessura = ladoPx * 0.025;
  const raio = alturaPx * 0.06;

  const rad = (anguloY * Math.PI) / 180;
  const luz = 0.86 + 0.18 * Math.cos(rad - 0.5);

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - ladoPx / 2,
        top: height * y - alturaPx / 2,
        width: ladoPx,
        height: alturaPx,
        perspective: ladoPx * 4,
        opacity: op * (1 - q),
        transform: `translateY(${(1 - p) * height * 0.02 + sobeDesce - q * height * 0.03}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${anguloX}deg) rotateY(${anguloY}deg)`,
        }}
      >
        {/* Espessura: placa escura atrás da frente. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: raio,
            backgroundColor: "#1a1a14",
            transform: `translateZ(${-espessura}px)`,
            boxShadow: `0 ${alturaPx * 0.12}px ${alturaPx * 0.25}px ${comAlfa(COR.fundo, 0.75)}`,
          }}
        />
        {/* Frente: a bandeira, fosca, com a luz baixa. */}
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            borderRadius: raio,
            backfaceVisibility: "hidden",
            filter: `brightness(${luz}) saturate(0.9)`,
          }}
        />
      </div>
    </div>
  );
};
