import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Inter";

// Legenda por frase: mostra uma frase por vez, palavra a palavra. Os tempos das
// palavras já chegam em FRAMES do vídeo cortado, relativos ao início do Sequence.
// Contorno chapado (-webkit-text-stroke), sem blur e sem textShadow; tudo em fração
// de width/height. Fonte provisória: Inter (decisão do Matheus, 08/10/2026).

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

const palavraSchema = z.object({
  texto: z.string(),
  inicioFrames: z.number().min(0),
  fimFrames: z.number().min(0),
  destaque: z.boolean().default(false),
});

export const legendaAnimadaSchema = z.object({
  palavras: z.array(palavraSchema),
  // corTexto e corDestaque saem da paleta da marca por decisão do Matheus (14/10/2026);
  // o plano pode voltar às cores da marca (#F5F0E6 e #EFAF20) pelas props.
  corTexto: zColor().default("#FFFDF7"),
  corDestaque: zColor().default("#FFB800"),
  corContorno: zColor().default("#0F2A1D"),
  tamanhoFonte: z.number().min(0.01).max(0.3).default(0.07), // fração da largura
  posicaoX: z.number().min(0).max(1).default(0.5), // centro horizontal do bloco, fração da largura
  posicaoY: z.number().min(0).max(1).default(0.78), // centro da frase, fração da altura
  larguraMaxima: z.number().min(0.1).max(1).default(0.9), // fração da largura
  maiusculas: z.boolean().default(true), // caixa alta só na hora de desenhar
  maxPalavrasPorFrase: z.number().min(1).max(12).default(4),
  pausaQuebraMs: z.number().min(0).default(700), // pausa que fecha a frase
});

type Props = z.input<typeof legendaAnimadaSchema>;
type Palavra = z.input<typeof palavraSchema>; // destaque pode faltar (padrão false)

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Junta palavras consecutivas em frases: fecha a frase ao chegar em `maxPalavras`
// ou quando a pausa até a próxima palavra for >= `pausaFrames`.
const agruparEmFrases = (palavras: Palavra[], maxPalavras: number, pausaFrames: number): Palavra[][] => {
  const ordenadas = [...palavras].sort((a, b) => a.inicioFrames - b.inicioFrames);
  const frases: Palavra[][] = [];
  for (const p of ordenadas) {
    const atual = frases[frases.length - 1];
    const ultima = atual?.[atual.length - 1];
    const pausou = ultima !== undefined && p.inicioFrames - ultima.fimFrames >= pausaFrames;
    if (!atual || atual.length >= maxPalavras || pausou) frases.push([p]);
    else atual.push(p);
  }
  return frases;
};

export const LegendaAnimada: React.FC<Props> = ({
  palavras = [],
  corTexto = "#FFFDF7", // fora da paleta da marca, por decisão do Matheus (ver o schema)
  corDestaque = "#FFB800", // idem
  corContorno = "#0F2A1D",
  tamanhoFonte = 0.07,
  posicaoX = 0.5,
  posicaoY = 0.78,
  larguraMaxima = 0.9,
  maiusculas = true,
  maxPalavrasPorFrase = 4,
  pausaQuebraMs = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const frases = useMemo(
    () => agruparEmFrases(palavras, maxPalavrasPorFrase, Math.round((pausaQuebraMs * fps) / 1000)),
    [palavras, maxPalavrasPorFrase, pausaQuebraMs, fps],
  );

  // A frase atual vai do começo da 1ª palavra ao fim da última (pelo menos 1 frame).
  const atual = frases.find((frase) => {
    const inicio = frase[0].inicioFrames;
    const fim = Math.max(...frase.map((p) => p.fimFrames), inicio + 1);
    return frame >= inicio && frame < fim;
  });
  if (!atual) return null;

  const fontePx = width * tamanhoFonte;
  // Centro em posicaoX; a largura é larguraMaxima, mas encolhe perto das bordas para o
  // bloco nunca passar do quadro (a distância até a borda mais próxima vale 2x de cada lado).
  const centroX = Math.min(1, Math.max(0, posicaoX));
  const larguraBloco = width * Math.min(larguraMaxima, 2 * Math.min(centroX, 1 - centroX));

  return (
    <div
      style={{
        position: "absolute",
        left: width * centroX,
        top: height * posicaoY,
        width: larguraBloco,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: fontePx * 0.28,
        rowGap: fontePx * 0.1,
        textAlign: "center",
      }}
    >
      {atual.map((p, i) => {
        const entrou = frame >= p.inicioFrames;
        // Entrada curta com spring: sobe, cresce e aparece.
        const s = spring({
          frame: frame - p.inicioFrames,
          fps,
          config: { damping: 14, stiffness: 220, mass: 0.6 },
          durationInFrames: 8,
        });
        return (
          <span
            key={`${p.inicioFrames}-${i}`}
            style={{
              // Palavra que ainda não foi dita ocupa o lugar (a frase não "anda").
              visibility: entrou ? "visible" : "hidden",
              display: "inline-block",
              fontFamily,
              fontWeight: 800,
              fontSize: fontePx,
              lineHeight: 1.15,
              color: p.destaque ? corDestaque : corTexto,
              WebkitTextStroke: `${fontePx * 0.12}px ${corContorno}`,
              paintOrder: "stroke fill",
              opacity: interpolate(s, [0, 1], [0, 1], clamp),
              transform: `translateY(${(1 - s) * fontePx * 0.25}px) scale(${0.88 + 0.12 * s})`,
            }}
          >
            {maiusculas ? p.texto.toLocaleUpperCase("pt-BR") : p.texto}
          </span>
        );
      })}
    </div>
  );
};
