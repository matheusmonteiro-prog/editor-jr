import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, FONTE_ROTULO, MOLA, comAlfa } from "./marca";

// Contador com motion forte para o vídeo de apresentação: mesma contagem e
// formato BR do Contador do catálogo, mais pulso a cada número e borrão de
// movimento vertical (SVG feGaussianBlur só no eixo Y) enquanto conta rápido.
// O Contador aprovado (src/components/v2/Contador.tsx) não foi alterado.

type Props = {
  valorFinal: number;
  prefixo: string;
  rotulo?: string; // sem rótulo: só o número
  inicio: number;
  duracaoContagem?: number;
  saida?: number;
  top: number; // fração da altura (topo do número)
  tamanho?: number; // fração da largura
  passoPulso?: number; // pulsa a cada N números (1 = a cada número; 20 para contagens grandes)
  curva?: "cubica" | "quadratica" | "linear"; // quadrática chega ao valor final de forma mais firme
  borraoMax?: number; // borrão de movimento máximo, fração do tamanho da fonte
};

const formatar = (v: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

export const ContadorImpacto: React.FC<Props> = ({
  valorFinal,
  prefixo,
  rotulo,
  inicio,
  duracaoContagem = 30,
  saida,
  top,
  tamanho = 0.3,
  passoPulso = 1,
  curva = "cubica",
  borraoMax = 0.05,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const fontSize = width * tamanho;

  const progresso = (f: number) =>
    interpolate(f - inicio, [0, duracaoContagem], [0, valorFinal], {
      ...clamp,
      easing:
        curva === "cubica" ? Easing.out(Easing.cubic) : curva === "quadratica" ? Easing.out(Easing.quad) : Easing.linear,
    });
  const valor = progresso(frame);
  const inteiro = Math.floor(valor + 1e-6);
  // Posição dentro do "degrau" do pulso (0 = acabou de entrar um degrau novo).
  const fracao = (valor % passoPulso) / passoPulso;
  const velocidade = Math.abs(progresso(frame) - progresso(frame - 1)); // números por frame

  // Pulso: cada número novo nasce maior e assenta.
  const pulso = valor >= valorFinal ? 1 : 1 + 0.14 * Math.pow(1 - fracao, 3);
  // Pulso final quando chega ao 15.
  const chegou = interpolate(frame - (inicio + duracaoContagem), [0, 4, 10], [1, 1.12, 1], clamp);
  const borrao = Math.min(fontSize * borraoMax, velocidade * fontSize * 0.04);

  const entrada = spring({ frame: frame - inicio, fps, config: MOLA, durationInFrames: 12 });
  const op = interpolate(frame - inicio, [0, 4], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  const idFiltro = "borrao-contador";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: op * (1 - q),
        transform: `translateY(${(1 - entrada) * fontSize * 0.3 - q * height * 0.03}px)`,
      }}
    >
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={idFiltro} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${borrao}`} />
        </filter>
      </svg>
      <div
        style={{
          fontFamily: FONTE_ROTULO,
          fontWeight: 600,
          fontSize,
          lineHeight: 1,
          color: COR.creme,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
          transform: `scale(${pulso * chegou})`,
          filter: borrao > 0.2 ? `url(#${idFiltro})` : undefined,
          textShadow: `0 0 ${fontSize * 0.12}px ${comAlfa(COR.dourado, 0.35)}`,
        }}
      >
        <span style={{ color: COR.dourado }}>{prefixo}</span>
        {formatar(inteiro)}
      </div>
      {rotulo ? (
        <div
          style={{
            marginTop: fontSize * 0.08,
            fontFamily: FONTE_ROTULO,
            fontWeight: 600,
            letterSpacing: ESPACO_ROTULO,
            fontSize: fontSize * 0.16,
            color: COR.creme,
            opacity: interpolate(frame - inicio, [6, 14], [0, 1], clamp),
          }}
        >
          {rotulo.toLocaleUpperCase("pt-BR")}
        </div>
      ) : null}
    </div>
  );
};
