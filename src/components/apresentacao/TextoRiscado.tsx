import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_TITULO, FONTE_TITULO, PESO_TITULO, MOLA, comAlfa } from "./marca";

// Palavra (ou frase) que entra, é cortada por uma risca dourada e depois:
// - "recuar": sai para trás, diminuindo (bloco 05, "DIFÍCIL");
// - "apagar": fica fraca no lugar (bloco 07, "RECOMENDA COMPRA OU VENDA").

type Props = {
  texto: string;
  inicio: number;
  frameRisco: number;
  duracaoRisco: number;
  depois: "recuar" | "apagar";
  saida?: number;
  top: number; // fração da altura (centro)
  tamanho: number; // fração da largura
  larguraMax?: number;
};

export const TextoRiscado: React.FC<Props> = ({
  texto,
  inicio,
  frameRisco,
  duracaoRisco,
  depois,
  saida,
  top,
  tamanho,
  larguraMax = 0.86,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const linhas = texto.split("\n"); // quebra de linha manual: "\n" no texto
  // Linha longa diminui para caber em larguraMax (~0,74em por letra em caixa alta).
  const maiorLinha = Math.max(...linhas.map((l) => l.length));
  const fontSize = Math.min(width * tamanho, (width * larguraMax) / (maiorLinha * 0.74));

  const p = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 12 });
  const op = interpolate(frame - inicio, [0, 4], [0, 1], clamp);
  const risca = interpolate(frame - frameRisco, [0, duracaoRisco], [0, 1], clamp);
  const tDepois = frameRisco + duracaoRisco + 2;
  const recuo = interpolate(frame - tDepois, [0, 12], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);

  let escala = interpolate(p, [0, 1], [1.4, 1]);
  let opacidade = op * (1 - q);
  let deslocY = 0;
  if (depois === "recuar") {
    escala *= interpolate(recuo, [0, 1], [1, 0.5]);
    opacidade *= interpolate(recuo, [0, 1], [1, 0]);
  } else {
    opacidade *= interpolate(recuo, [0, 1], [1, 0.35]);
    deslocY = -recuo * height * 0.02;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: height * top,
        left: (width * (1 - larguraMax)) / 2,
        width: width * larguraMax,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(calc(-50% + ${deslocY}px)) scale(${escala})`,
        opacity: opacidade,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {linhas.map((linha, i) => {
          // Uma risca por linha, uma depois da outra, dentro de duracaoRisco.
          const fatia = 1 / linhas.length;
          const riscaLinha = interpolate(risca, [i * fatia, (i + 1) * fatia], [0, 1], clamp);
          return (
            <div key={i} style={{ position: "relative" }}>
              <span
                style={{
                  fontFamily: FONTE_TITULO,
                  fontWeight: PESO_TITULO,
                  letterSpacing: ESPACO_TITULO,
                  fontSize,
                  lineHeight: 1.12,
                  color: COR.creme,
                  whiteSpace: "nowrap",
                }}
              >
                {linha.toLocaleUpperCase("pt-BR")}
              </span>
              {/* Risca dourada atravessando, levemente inclinada. */}
              <div
                style={{
                  position: "absolute",
                  left: "-4%",
                  width: "108%",
                  top: "52%",
                  height: Math.max(3, fontSize * 0.09),
                  backgroundColor: COR.dourado,
                  borderRadius: fontSize,
                  transformOrigin: "0% 50%",
                  transform: `translateY(-50%) rotate(-3deg) scaleX(${riscaLinha})`,
                  boxShadow: `0 0 ${fontSize * 0.25}px ${comAlfa(COR.dourado, 0.6)}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
