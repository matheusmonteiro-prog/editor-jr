import React from "react";
import {
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["600"],
  subsets: ["latin"],
});

export const contadorSchema = z.object({
  valorInicial: z.number(),
  valorFinal: z.number(),
  prefixo: z.string().default("R$ "),
  casasDecimais: z.number().min(0).max(4).default(2),
  rotulo: z.string().optional(),
  corCard: zColor().default("#0F2A1D"),
  corNumero: zColor().default("#F5F0E6"),
  corRotulo: zColor().default("#F5F0E6"),
  duracaoFramesContagem: z.number().min(1).default(45),
  framesSaida: z.number().min(1).default(15),
  duracaoFrames: z.number().min(10).default(90),
  tamanhoFonte: z.number().min(0.01).max(0.5).default(0.09),
  top: z.number().min(0).max(1).default(0.38),
});

type Props = z.infer<typeof contadorSchema>;

const formatarValor = (valor: number, casasDecimais: number) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor);

export const Contador: React.FC<Props> = ({
  valorInicial,
  valorFinal,
  prefixo,
  casasDecimais,
  rotulo,
  corCard,
  corNumero,
  corRotulo,
  duracaoFramesContagem,
  framesSaida,
  duracaoFrames,
  tamanhoFonte,
  top,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const valorAtual = interpolate(
    frame,
    [0, duracaoFramesContagem],
    [valorInicial, valorFinal],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fontSize = width * tamanhoFonte;

  return (
    <Sequence name="Contador" freeze={15}>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          top: `${top * 100}%`,
          display: "flex",
          justifyContent: "center",
          opacity: saida,
        }}
      >
        <div
          style={{
            backgroundColor: corCard,
            borderRadius: 28,
            padding: `${fontSize * 0.4}px ${fontSize * 0.8}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: fontSize * 0.15,
          }}
        >
          {rotulo && (
            <span
              style={{
                color: corRotulo,
                fontFamily,
                fontWeight: 600,
                fontSize: fontSize * 0.3,
                opacity: 0.85,
              }}
            >
              {rotulo}
            </span>
          )}
          <span
            style={{
              color: corNumero,
              fontFamily,
              fontWeight: 600,
              fontSize,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {prefixo}
            {formatarValor(valorAtual, casasDecimais)}
          </span>
        </div>
      </div>
    </Sequence>
  );
};
