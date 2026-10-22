import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_TITULO, FONTE_TITULO, PESO_TITULO, comAlfa } from "./marca";

// "MÉTODO JR." do bloco 08 (rodada 7): a frase que fecha o CTA com força.
// Nas duas variações: entra em escala 1,3 → 1 com overshoot (mola solta), flash de brilho dourado
// POR TRÁS do texto e um pulso rápido de halo quando assenta.
// - "a" (peso): só a entrada com escala, flash redondo e halo.
// - "b" (revelação): o texto é revelado por uma máscara da esquerda para a direita, com um traço
//   de luz na borda da máscara; o flash é mais largo (elíptico) e, depois de assentar, um reflexo
//   passa pelas letras. (As partículas do estouro ficam no VideoApresentacao.)

type Props = {
  texto: string;
  inicio: number; // frame (relativo à Sequence)
  saida?: number;
  top: number; // fração da altura (topo)
  tamanho: number; // fração da largura (limitado para caber em larguraMax)
  larguraMax?: number; // fração da largura
  variante: "a" | "b";
};

export const MarcaCta: React.FC<Props> = ({ texto, inicio, saida, top, tamanho, larguraMax = 0.9, variante }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const alto = texto.toLocaleUpperCase("pt-BR");
  // Inter 800 em caixa alta com +0,04em: ~0,66em por letra (medido no still da rodada 6).
  const fontSize = Math.min(width * tamanho, (width * larguraMax) / (alto.length * 0.68));
  const f = frame - inicio;

  const p = spring({ frame: f, fps, config: { damping: 8, mass: 1 }, durationInFrames: 16 });
  const escala = interpolate(p, [0, 1], [1.3, 1]);
  const op = interpolate(f, [0, 3], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);

  // Flash dourado por trás: estoura junto com a entrada e baixa até um resto suave.
  const flash = interpolate(f, [0, 4, 10, 30], [0, 1, 0.7, 0.18], clamp);
  // Pulso rápido do halo nas letras quando assenta (por volta do frame 8).
  const halo = interpolate(f, [6, 10, 22], [0, 0.95, 0.3], clamp);

  // Variação b: máscara da esquerda para a direita em 9 frames e reflexo depois de assentar.
  const revela = variante === "b" ? interpolate(f, [0, 9], [0, 1], clamp) : 1;
  const reflexo = interpolate(f, [16, 30], [-0.3, 1.3], clamp);

  const alturaLinha = fontSize * 1.1;
  const flashLargura = variante === "b" ? width * 1.1 : fontSize * 4.2;
  const flashAltura = variante === "b" ? alturaLinha * 2.2 : fontSize * 4.2;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        height: alturaLinha,
        display: "flex",
        justifyContent: "center",
        opacity: op * (1 - q),
        transform: `translateY(${-q * height * 0.02}px)`,
      }}
    >
      {/* Flash dourado atrás do texto. */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - flashLargura / 2,
          top: alturaLinha / 2 - flashAltura / 2,
          width: flashLargura,
          height: flashAltura,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${comAlfa(COR.dourado, 0.75)} 0%, ${comAlfa(
            COR.dourado,
            0.25,
          )} 35%, ${comAlfa(COR.dourado, 0)} 70%)`,
          opacity: flash,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "relative",
          transform: `scale(${escala})`,
          transformOrigin: "50% 55%",
          clipPath: revela < 1 ? `inset(-20% ${(1 - revela) * 100}% -20% -5%)` : undefined,
        }}
      >
        <span
          style={{
            fontFamily: FONTE_TITULO,
            fontWeight: PESO_TITULO,
            letterSpacing: ESPACO_TITULO,
            fontSize,
            lineHeight: 1.1,
            color: COR.dourado,
            whiteSpace: "nowrap",
            textShadow: `0 0 ${fontSize * 0.3}px ${comAlfa(COR.dourado, halo)}`,
          }}
        >
          {alto}
        </span>
        {variante === "b" ? (
          <>
            {/* Reflexo passando pelas letras (só dentro do desenho das letras). */}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: FONTE_TITULO,
                fontWeight: PESO_TITULO,
                letterSpacing: ESPACO_TITULO,
                fontSize,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                color: "transparent",
                backgroundImage: `linear-gradient(100deg, ${comAlfa(COR.creme, 0)} ${reflexo * 100 - 12}%, ${comAlfa(
                  COR.creme,
                  0.85,
                )} ${reflexo * 100}%, ${comAlfa(COR.creme, 0)} ${reflexo * 100 + 12}%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              {alto}
            </span>
            {/* Traço de luz na borda da máscara, enquanto revela. */}
            {revela > 0 && revela < 1 ? (
              <div
                style={{
                  position: "absolute",
                  top: -alturaLinha * 0.15,
                  height: alturaLinha * 1.3,
                  left: `calc(${revela * 100}% - ${fontSize * 0.06}px)`,
                  width: fontSize * 0.12,
                  borderRadius: fontSize * 0.06,
                  backgroundColor: COR.creme,
                  boxShadow: `0 0 ${fontSize * 0.5}px ${comAlfa(COR.dourado, 0.9)}`,
                }}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};
