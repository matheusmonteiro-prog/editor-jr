import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";
import { FRAMES_ATE_PULSO_LOGO } from "../../utils/sfxApresentacao";

// Logo do JR como uma PLACA em CSS 3D (o logo é um PNG plano).
// - Entrada: gira uma volta completa no eixo Y, desacelera e para de frente.
// - Voo: encolhe em trajetória curva até o canto superior direito.
// - Volta: do canto ao centro girando ao contrário (cartela final).
// Espessura: cópias escurecidas atrás da frente. Luz direcional baixa: o
// brilho da frente muda com o ângulo, como luz de fim de tarde vinda da esquerda.

type Pose = { x: number; y: number; largura: number }; // frações

type Props = {
  src: string;
  inicioGiro: number; // frame global
  inicioVoo: number; // frame global: começa a ir para o canto
  inicioVolta: number; // frame global: começa a voltar ao centro
  centro?: Pose;
  canto?: Pose;
  centroFinal?: Pose; // onde o logo pousa na volta (padrão: o mesmo centro da entrada)
};

const CAMADAS_ESPESSURA = 6;

export const Logo3D: React.FC<Props> = ({
  src,
  inicioGiro,
  inicioVoo,
  inicioVolta,
  centro = { x: 0.5, y: 0.33, largura: 0.62 },
  canto = { x: 0.865, y: 0.128, largura: 0.2 },
  centroFinal,
}) => {
  const fim = centroFinal ?? centro;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  // Entrada girando: 360° → 0°, com spring (desacelera e assenta).
  const pGiro = spring({ frame: frame - inicioGiro, fps, config: { damping: 14, mass: 1 }, durationInFrames: 45 });
  // Voo para o canto: 24 frames, curva para cima.
  const pVoo = spring({ frame: frame - inicioVoo, fps, config: { damping: 14, mass: 1 }, durationInFrames: 24 });
  // Rodada 3: o logo inteiro SOBE do fundo com spring até o centro final e dá um pulso.
  const pVolta = spring({ frame: frame - inicioVolta, fps, config: { damping: 12, mass: 1 }, durationInFrames: 30 });

  let x: number;
  let y: number;
  let largura: number;
  let anguloY: number;
  let opacidade = 1;

  if (frame < inicioVoo) {
    x = centro.x;
    y = centro.y;
    largura = centro.largura * interpolate(pGiro, [0, 1], [0.55, 1]);
    anguloY = 360 * (1 - pGiro);
    opacidade = interpolate(frame - inicioGiro, [0, 8], [0, 1], clamp);
  } else if (frame < inicioVolta) {
    const p = Math.min(1.05, pVoo);
    x = interpolate(p, [0, 1], [centro.x, canto.x]);
    // Curva: sobe antes de chegar (arco de parábola).
    const arco = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI) * 0.06;
    y = interpolate(p, [0, 1], [centro.y, canto.y]) - arco;
    largura = interpolate(p, [0, 1], [centro.largura, canto.largura]);
    // Balanço leve no canto para não parecer adesivo.
    const balanco = Math.sin((frame - inicioVoo) / 25) * 10 * Math.min(1, Math.max(0, p));
    anguloY = interpolate(p, [0, 0.5, 1], [0, -25, 0]) + balanco;
    // O logo pequeno do canto some pouco antes de o logo final subir.
    opacidade = interpolate(frame, [inicioVolta - 8, inicioVolta], [1, 0], clamp);
  } else {
    x = fim.x;
    y = interpolate(pVolta, [0, 1], [1.12, fim.y]);
    largura = fim.largura;
    anguloY = 0;
  }
  // Pulso único do logo final (1 → 1,1 → 1 em 10 frames), depois que ele pousa.
  const pulso = interpolate(frame - (inicioVolta + FRAMES_ATE_PULSO_LOGO), [0, 5, 10], [1, 1.1, 1], clamp);

  const lado = width * largura;
  // Luz: 1 de frente, mais forte quando a face aponta para a esquerda (luz baixa).
  const rad = (anguloY * Math.PI) / 180;
  const luz = 0.82 + 0.28 * Math.cos(rad - 0.5);
  const espessura = lado * 0.012;

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - lado / 2,
        top: height * y - lado / 2,
        width: lado,
        height: lado,
        perspective: lado * 3,
        opacity: opacidade,
        transform: frame >= inicioVolta ? `scale(${pulso})` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${anguloY}deg)`,
        }}
      >
        {/* Espessura: camadas escuras atrás da frente. */}
        {new Array(CAMADAS_ESPESSURA).fill(0).map((_, i) => (
          <Img
            key={i}
            src={staticFile(src)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              transform: `translateZ(${-(i + 1) * espessura}px)`,
              filter: "brightness(0.38) sepia(0.6)",
            }}
          />
        ))}
        {/* Verso: a mesma arte, girada, para ler certo quando a placa vira. */}
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            transform: `translateZ(${-(CAMADAS_ESPESSURA + 1) * espessura}px) rotateY(180deg)`,
            backfaceVisibility: "hidden",
            filter: `brightness(${luz * 0.85})`,
          }}
        />
        {/* Frente. */}
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            filter: `brightness(${luz}) drop-shadow(0 ${lado * 0.03}px ${lado * 0.05}px ${comAlfa(COR.fundo, 0.9)})`,
          }}
        />
      </div>
    </div>
  );
};
