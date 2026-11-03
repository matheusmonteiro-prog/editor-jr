import React from "react";
import {
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Fraunces";

// Ícone que se desenha com um título: entra e sai conforme o JR conta a história.
// Traços de 24x24, linha fina, sem preenchimento (kit, seção 8; base Lucide).
// Sem cartão: grande, ícone em cima, para o painel verde. Com cartão: pequeno, em linha, sobre o vídeo.
const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });

const ICONES = {
  arvore: [
    "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",
    "M12 22v-3",
  ],
  predio: [
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
    "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
    "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    "M10 6h4",
    "M10 10h4",
    "M10 14h4",
    "M10 18h4",
  ],
  broto: [
    "M7 20h10",
    "M10 20c5.5-2.5.8-6.4 3-10",
    "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",
    "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",
  ],
  banco: ["M3 22h18", "M6 18v-7", "M10 18v-7", "M14 18v-7", "M18 18v-7", "M12 2l8 5H4z"],
  maleta: [
    "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  ],
  camisa: [
    "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",
  ],
  caminhao: [
    "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
    "M15 18H9",
    "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
    "M19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
    "M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  ],
  carro: [
    "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
    "M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
    "M9 17h6",
    "M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  ],
  martelo: [
    "m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8",
    "m16 16 6-6",
    "m8 8 6-6",
    "m9 7 8 8",
    "m21 11-8-8",
  ],
  boi: [
    "M4 4c0 3.5 2 5 4 5h8c2 0 4-1.5 4-5",
    "M8 9v7a4 4 0 0 0 8 0V9",
    "M10 13h.01",
    "M14 13h.01",
    "M10.5 17.5h.01",
    "M13.5 17.5h.01",
  ],
  pino: [
    "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",
    "M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  ],
  fabrica: [
    "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
    "M17 18h1",
    "M12 18h1",
    "M7 18h1",
  ],
  grafico: ["M22 7 13.5 15.5 8.5 10.5 2 17", "M16 7h6v6"],
  soja: [
    "M2 22 16 8",
    "M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
    "M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
    "M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
    "M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z",
    "M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
    "M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
    "M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
  ],
  moedas: [
    "M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0",
    "M18.09 10.37A6 6 0 1 1 10.34 18",
    "M7 6h1v4",
    "m16.71 13.88.7.71-2.82 2.82",
  ],
  terra: ["m8 3 4 8 5-5 5 15H2L8 3z"],
  bilhete: [
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
    "M13 5v2",
    "M13 17v2",
    "M13 11v2",
  ],
} as const;

export const elementoHistoriaSchema = z.object({
  icone: z
    .enum([
      "arvore",
      "predio",
      "broto",
      "banco",
      "maleta",
      "camisa",
      "caminhao",
      "carro",
      "martelo",
      "boi",
      "pino",
      "fabrica",
      "grafico",
      "soja",
      "moedas",
      "terra",
      "bilhete",
    ])
    .default("arvore"),
  titulo: z.string().default("Criado no sítio"),
  destaque: z.string().default("sítio"), // trecho do título na cor de destaque
  x: z.number().min(0).max(1).default(0.25), // sem cartão: centro. Com cartão: borda do lado de onde ele vem
  y: z.number().min(0).max(1).default(0.5),
  cartao: z.boolean().default(false), // placa chapada, em linha, para ficar legível sobre o vídeo
  direcao: z.enum(["esquerda", "direita"]).default("esquerda"), // de que lado entra e para que lado sai
  tamanhoIcone: z.number().min(0.02).max(0.4).default(0.13), // fração da largura
  tamanhoFonte: z.number().min(0.01).max(0.1).default(0.04), // fração da largura
  corTitulo: zColor().default("#F5F0E6"),
  corDestaque: zColor().default("#EFAF20"),
  corIcone: zColor().default("#EFAF20"),
  corCartao: zColor().default("#0F2A1D"),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(1).default(17), // 0,55 s
  framesDesenho: z.number().min(1).default(24),
  framesSaida: z.number().min(1).default(10),
});

type Props = z.infer<typeof elementoHistoriaSchema>;

export const ElementoHistoria: React.FC<Props> = ({
  icone = "arvore",
  titulo = "Criado no sítio",
  destaque = "sítio",
  x = 0.25,
  y = 0.5,
  cartao = false,
  direcao = "esquerda",
  tamanhoIcone = 0.13,
  tamanhoFonte = 0.04,
  corTitulo = "#F5F0E6",
  corDestaque = "#EFAF20",
  corIcone = "#EFAF20",
  corCartao = "#0F2A1D",
  duracaoFrames = 150,
  framesEntrada = 17,
  framesDesenho = 24,
  framesSaida = 10,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const curva = Easing.bezier(0.2, 0.7, 0.2, 1);

  const entrada = interpolate(frame, [0, framesEntrada], [0, 1], { ...clamp, easing: curva });
  const saida = interpolate(frame, [duracaoFrames - framesSaida, duracaoFrames], [0, 1], clamp);
  const desenho = interpolate(frame, [0, framesDesenho], [1, 0], { ...clamp, easing: curva });

  // Vem do lado oposto ao JR e sai para o mesmo lado.
  const sinal = direcao === "esquerda" ? 1 : -1;
  const deslocamento = sinal * width * 0.06 * (entrada - 1 - saida);

  const i = destaque ? titulo.indexOf(destaque) : -1;
  const lado = width * tamanhoIcone;

  const posicao: React.CSSProperties = cartao
    ? {
        ...(direcao === "esquerda" ? { left: width * x } : { right: width * (1 - x) }),
        flexDirection: "row",
        gap: width * 0.012,
        padding: `${height * 0.018}px ${width * 0.016}px`,
        borderRadius: width * 0.008,
        backgroundColor: corCartao,
        whiteSpace: "nowrap",
        transform: `translate(${deslocamento}px, -50%)`,
      }
    : {
        left: width * x,
        width: width * 0.42,
        flexDirection: "column",
        gap: height * 0.03,
        transform: `translate(calc(-50% + ${deslocamento}px), -50%)`,
      };

  return (
    <Sequence name={`ElementoHistoria: ${titulo}`}>
      <div
        style={{
          position: "absolute",
          top: height * y,
          display: "flex",
          alignItems: "center",
          opacity: entrada * (1 - saida),
          ...posicao,
        }}
      >
        <svg width={lado} height={lado} viewBox="0 0 24 24" fill="none" stroke={corIcone} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {ICONES[icone].map((d) => (
            <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={desenho} />
          ))}
        </svg>
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: width * tamanhoFonte,
            lineHeight: 1.08,
            textAlign: "center",
            color: corTitulo,
          }}
        >
          {i < 0 ? (
            titulo
          ) : (
            <>
              {titulo.slice(0, i)}
              <span style={{ color: corDestaque }}>{titulo.slice(i, i + destaque.length)}</span>
              {titulo.slice(i + destaque.length)}
            </>
          )}
        </div>
      </div>
    </Sequence>
  );
};
