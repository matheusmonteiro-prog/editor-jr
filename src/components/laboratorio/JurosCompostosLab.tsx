import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Inter";

// LABORATÓRIO (fora do catálogo e fora de qualquer plano). Teste de liberdade criativa.
//
// Ideia: uma moeda nasce sozinha. A cada "ano" (passoFrames), cada moeda gera outra e o total
// dobra: 1, 2, 4, 8, 16, 32. A moeda nova sai da posição da "mãe" e desliza até o lugar dela,
// com um anel de dourado que se expande a cada dobra. No fim entra a frase "o dinheiro
// trabalha sozinho". Sem número de dinheiro na tela, só a forma do crescimento.

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

export const jurosCompostosLabSchema = z.object({
  // Opcional, sem .default(): padrão transparente para não tampar o vídeo se virar camada.
  corFundo: zColor().optional(),
  corMoeda: zColor().default("#EFAF20"),
  corSimbolo: zColor().default("#0F2A1D"),
  corTexto: zColor().default("#F5F0E6"),
  titulo: z.string().default("Juros compostos"),
  fraseFinal: z.string().default("o dinheiro trabalha sozinho"),
  palavraDestaque: z.string().default("sozinho"),
  mostrarAno: z.boolean().default(true),
  frameInicio: z.number().min(0).default(30),
  passoFrames: z.number().min(6).max(40).default(15),
  frameFrase: z.number().min(0).default(122),
  tamanhoMoeda: z.number().min(0.05).max(0.2).default(0.12),
  tamanhoTitulo: z.number().min(0.03).max(0.15).default(0.085),
  tamanhoFrase: z.number().min(0.03).max(0.12).default(0.066),
  centroY: z.number().min(0.2).max(0.8).default(0.5),
});

type Props = z.infer<typeof jurosCompostosLabSchema>;

const TOTAL_MOEDAS = 32; // 2^5: cinco dobras depois da moeda inicial
const PASSOS = 5;

// Encaixe hexagonal, em unidades de "passo" (distância entre centros). Ordenado do centro para
// fora: a moeda 0 fica no meio e o grupo cresce como uma flor. Fixo, nada aleatório.
const SLOTS = (() => {
  const pts: { x: number; y: number; d: number; a: number }[] = [];
  for (let r = -5; r <= 5; r++) {
    for (let q = -5; q <= 5; q++) {
      const x = q + r / 2;
      const y = r * 0.8660254;
      pts.push({
        x,
        y,
        d: Math.round(Math.hypot(x, y) * 1000) / 1000,
        a: Math.atan2(y, x),
      });
    }
  }
  pts.sort((p, q) => p.d - q.d || p.a - q.a);
  return pts.slice(0, TOTAL_MOEDAS);
})();

// Em qual dobra a moeda i nasce: 0 -> 0; 1 -> 1; 2-3 -> 2; 4-7 -> 3; 8-15 -> 4; 16-31 -> 5.
const passoDaMoeda = (i: number) => (i === 0 ? 0 : Math.floor(Math.log2(i)) + 1);
// A "mãe" é a moeda de mesmo índice dentro do grupo anterior.
const maeDaMoeda = (i: number) => (i === 0 ? 0 : i - 2 ** (passoDaMoeda(i) - 1));

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const JurosCompostosLab: React.FC<Props> = ({
  corFundo = "transparent",
  corMoeda = "#EFAF20",
  corSimbolo = "#0F2A1D",
  corTexto = "#F5F0E6",
  titulo = "Juros compostos",
  fraseFinal = "o dinheiro trabalha sozinho",
  palavraDestaque = "sozinho",
  mostrarAno = true,
  frameInicio = 30,
  passoFrames = 15,
  frameFrase = 122,
  tamanhoMoeda = 0.12,
  tamanhoTitulo = 0.085,
  tamanhoFrase = 0.066,
  centroY = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const passo = width * tamanhoMoeda; // distância entre centros, em px
  const diametro = passo * 0.9;
  const cx = width / 2;
  const cy = height * centroY;

  const posicao = (i: number) => ({
    x: cx + SLOTS[i].x * passo,
    y: cy + SLOTS[i].y * passo,
  });

  // Dobra mais recente já iniciada (0 a 5) e há quantos frames ela aconteceu.
  const passoAtual = Math.max(
    0,
    Math.min(PASSOS, Math.floor((frame - frameInicio) / passoFrames)),
  );
  const desdeDobra = frame - (frameInicio + passoAtual * passoFrames);

  const saida = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    clamp,
  );

  // Título: duas linhas de palavras entrando em sequência + sublinhado dourado que se desenha.
  const palavrasTitulo = titulo.split(" ");
  const sublinhado = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.7 },
  });

  const moedas = Array.from({ length: TOTAL_MOEDAS }, (_, i) => {
    const passoMoeda = passoDaMoeda(i);
    const aparece = frameInicio + passoMoeda * passoFrames;
    if (frame < aparece) return null;

    const p = spring({
      frame: frame - aparece,
      fps,
      config: { damping: 11, stiffness: 140, mass: 0.6 },
    });
    const destino = posicao(i);
    const origem = posicao(maeDaMoeda(i));
    const x = origem.x + (destino.x - origem.x) * p;
    const y = origem.y + (destino.y - origem.y) * p;

    const escalaNascimento = interpolate(p, [0, 1], [0.3, 1], {
      extrapolateLeft: "clamp",
    });
    // Moedas que já existiam dão um pulinho a cada dobra.
    const pulinho =
      passoMoeda < passoAtual
        ? interpolate(desdeDobra, [0, 5, 12], [1, 1.1, 1], clamp)
        : 1;
    const opacidade = interpolate(frame - aparece, [0, 3], [0, 1], clamp);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - diametro / 2,
          top: y - diametro / 2,
          width: diametro,
          height: diametro,
          borderRadius: "50%",
          backgroundColor: corMoeda,
          opacity: opacidade,
          transform: `scale(${escalaNascimento * pulinho})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: diametro * 0.12,
            borderRadius: "50%",
            border: `${diametro * 0.05}px solid ${corSimbolo}`,
            opacity: 0.35,
          }}
        />
        <span
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: diametro * 0.5,
            color: corSimbolo,
            lineHeight: 1,
          }}
        >
          $
        </span>
      </div>
    );
  });

  // Anel que se expande a cada dobra (um por dobra, só enquanto visível).
  const aneis = Array.from({ length: PASSOS }, (_, k) => {
    const t = frame - (frameInicio + (k + 1) * passoFrames);
    if (t < 0 || t > 20) return null;
    const d = interpolate(t, [0, 20], [passo * 1.2, passo * 8], clamp);
    return (
      <div
        key={`anel-${k}`}
        style={{
          position: "absolute",
          left: cx - d / 2,
          top: cy - d / 2,
          width: d,
          height: d,
          borderRadius: "50%",
          border: `${width * 0.006}px solid ${corMoeda}`,
          opacity: interpolate(t, [0, 20], [0.55, 0], clamp),
        }}
      />
    );
  });

  const palavrasFrase = fraseFinal.split(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: corFundo, opacity: saida }}>
      {/* título */}
      <div
        style={{
          position: "absolute",
          top: height * 0.1,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: width * tamanhoTitulo,
          color: corTexto,
          lineHeight: 1.05,
        }}
      >
        {palavrasTitulo.map((palavra, i) => {
          const e = spring({
            frame: frame - i * 5,
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.6 },
          });
          return (
            <span
              key={palavra + i}
              style={{
                opacity: Math.min(1, e),
                transform: `translateY(${interpolate(e, [0, 1], [height * 0.03, 0])}px)`,
              }}
            >
              {palavra}
            </span>
          );
        })}
        <div
          style={{
            marginTop: height * 0.012,
            height: width * 0.012,
            width: width * 0.4,
            borderRadius: width * 0.006,
            backgroundColor: corMoeda,
            transform: `scaleX(${Math.max(0, Math.min(1, sublinhado))})`,
          }}
        />
      </div>

      {/* "ano N" */}
      {mostrarAno && frame >= frameInicio ? (
        <div
          style={{
            position: "absolute",
            top: height * 0.255,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily,
            fontWeight: 800,
            fontSize: width * 0.04,
            color: corTexto,
            opacity: 0.75,
          }}
        >
          ano {passoAtual + 1}
        </div>
      ) : null}

      {/* anéis e moedas */}
      <div style={{ position: "absolute", inset: 0 }}>{aneis}</div>
      <div style={{ position: "absolute", inset: 0 }}>{moedas}</div>

      {/* frase final */}
      <div
        style={{
          position: "absolute",
          top: height * 0.78,
          left: width * 0.07,
          width: width * 0.86,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: width * 0.02,
          fontFamily,
          fontWeight: 800,
          fontSize: width * tamanhoFrase,
          lineHeight: 1.15,
        }}
      >
        {palavrasFrase.map((palavra, i) => {
          const e = spring({
            frame: frame - frameFrase - i * 5,
            fps,
            config: { damping: 14, stiffness: 130, mass: 0.6 },
          });
          return (
            <span
              key={palavra + i}
              style={{
                color: palavra === palavraDestaque ? corMoeda : corTexto,
                opacity: Math.max(0, Math.min(1, e)),
                transform: `translateY(${interpolate(e, [0, 1], [height * 0.025, 0])}px)`,
              }}
            >
              {palavra}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
