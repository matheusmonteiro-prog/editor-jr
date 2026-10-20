import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_ROTULO, ESPACO_TITULO, FONTE_ROTULO, FONTE_TITULO, MOLA, PESO_TITULO } from "./marca";

// Kinetic typography: palavra por palavra, cada uma entra com spring
// (de baixo ou em escala), 3 frames entre elas. A expressão do destaque
// acende em dourado por cima das mesmas letras, com pulso 1 → 1,15 → 1.
// Na saída, as palavras sobem e somem, também com 3 frames entre elas.

type Props = {
  texto: string;
  destaque?: string;
  inicio: number; // frame (relativo à Sequence) em que a 1ª palavra começa
  saida?: number; // frame em que a 1ª palavra começa a sair
  top: number; // fração da altura (topo do bloco de texto)
  tamanho: number; // fração da largura
  fonte?: "titulo" | "rotulo";
  damping?: number; // mola da entrada (padrão 12)
  deslocamentoY?: number; // fração da largura: quanto a palavra sobe ao entrar (padrão: 0,7 do corpo da letra)
  cor?: string;
  corDestaque?: string;
  larguraMax?: number; // fração da largura
  entrada?: "subir" | "escala";
  intervalo?: number; // frames entre palavras
  opacidadeMax?: number;
  peso?: number; // peso da Inter nos títulos (padrão 800)
  // Pulso extra em uma palavra (ex.: NINGUÉM 1 → 1,2 → 1). emFrame = quando
  // pulsa (padrão: logo que a palavra entra).
  pulsoPalavra?: { palavra: string; escala: number; emFrame?: number };
};

const normalizar = (s: string) => s.toLocaleUpperCase("pt-BR").replace(/[.,:;!?]/g, "");

// Índices das palavras que formam o destaque (a 1ª ocorrência).
const indicesDestaque = (palavras: string[], destaque?: string): Set<number> => {
  if (!destaque) return new Set();
  const alvo = destaque.split(/\s+/).map(normalizar);
  const norm = palavras.map(normalizar);
  for (let i = 0; i + alvo.length <= norm.length; i++) {
    if (alvo.every((p, k) => norm[i + k] === p)) {
      return new Set(alvo.map((_, k) => i + k));
    }
  }
  return new Set();
};

const DURACAO_ENTRADA = 12;
const DURACAO_SAIDA = 10;

export const TextoKinetic: React.FC<Props> = ({
  texto,
  destaque,
  inicio,
  saida,
  top,
  tamanho,
  fonte = "titulo",
  cor = COR.creme,
  corDestaque = COR.dourado,
  larguraMax = 0.86,
  entrada = "subir",
  intervalo = 3,
  opacidadeMax = 1,
  peso = PESO_TITULO,
  pulsoPalavra,
  damping = MOLA.damping,
  deslocamentoY,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // "\n" no texto = quebra de linha manual (vira a peça "\n").
  const soltas = texto
    .toLocaleUpperCase("pt-BR")
    .replace(/\n/g, " \n ")
    .split(/[ \t]+/)
    .filter((p) => p.length > 0);
  const indices = indicesDestaque(soltas, destaque);
  // O destaque de várias palavras ("NA PRÁTICA") vira uma peça só: entra
  // junto e nunca quebra de linha no meio.
  const palavras: string[] = [];
  const dourado = new Set<number>();
  soltas.forEach((p, i) => {
    if (indices.has(i) && indices.has(i - 1)) {
      palavras[palavras.length - 1] += ` ${p}`;
      return;
    }
    if (indices.has(i)) dourado.add(palavras.length);
    palavras.push(p);
  });
  // Ordem de entrada: só as palavras contam (a quebra de linha não gasta tempo).
  const ordem: number[] = [];
  let contadas = 0;
  palavras.forEach((p) => {
    ordem.push(contadas);
    if (p !== "\n") contadas++;
  });
  const fontSize = width * tamanho;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  return (
    <div
      style={{
        position: "absolute",
        top: height * top,
        left: (width * (1 - larguraMax)) / 2,
        width: width * larguraMax,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: fontSize * 0.34,
        rowGap: fontSize * 0.05,
        fontFamily: fonte === "titulo" ? FONTE_TITULO : FONTE_ROTULO,
        fontWeight: fonte === "titulo" ? peso : 600,
        letterSpacing: fonte === "titulo" ? ESPACO_TITULO : ESPACO_ROTULO,
        fontSize,
        lineHeight: 1.08,
        color: cor,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {palavras.map((palavra, i) => {
        if (palavra === "\n") {
          return <div key={i} style={{ flexBasis: "100%", height: 0 }} />;
        }
        const t0 = inicio + ordem[i] * intervalo;
        const p = spring({ frame: frame - t0, fps, config: { ...MOLA, damping }, durationInFrames: DURACAO_ENTRADA });
        const opEntrada = interpolate(frame - t0, [0, 5], [0, 1], clamp);

        let ySaida = 0;
        let opSaida = 1;
        if (saida !== undefined) {
          const ts = saida + ordem[i] * intervalo;
          const q = interpolate(frame - ts, [0, DURACAO_SAIDA], [0, 1], clamp);
          ySaida = -q * fontSize * 0.6;
          opSaida = 1 - q;
        }

        const transformEntrada =
          entrada === "subir"
            ? `translateY(${(1 - p) * (deslocamentoY !== undefined ? width * deslocamentoY : fontSize * 0.7)}px)`
            : `scale(${interpolate(p, [0, 1], [1.8, 1])})`;

        const ehDestaque = dourado.has(i);
        // O dourado acende quando a palavra já assentou.
        const tAcende = t0 + DURACAO_ENTRADA - 4;
        const acende = ehDestaque ? interpolate(frame - tAcende, [0, 4], [0, 1], clamp) : 0;
        const pulso = ehDestaque
          ? interpolate(frame - tAcende, [0, 4, 9], [1, 1.15, 1], clamp)
          : 1;

        const extra =
          pulsoPalavra && normalizar(palavra) === normalizar(pulsoPalavra.palavra)
            ? interpolate(
                frame - (pulsoPalavra.emFrame ?? t0 + DURACAO_ENTRADA),
                [0, 4, 8],
                [1, pulsoPalavra.escala, 1],
                clamp,
              )
            : 1;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              position: "relative",
              whiteSpace: "nowrap",
              opacity: opEntrada * opSaida * opacidadeMax,
              transform: `translateY(${ySaida}px) ${transformEntrada} scale(${pulso * extra})`,
              transformOrigin: "50% 60%",
            }}
          >
            {palavra}
            {ehDestaque ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  whiteSpace: "nowrap",
                  color: corDestaque,
                  opacity: acende,
                  textShadow: `0 0 ${fontSize * 0.25 * acende}px rgba(239, 175, 32, 0.45)`,
                }}
              >
                {palavra}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
