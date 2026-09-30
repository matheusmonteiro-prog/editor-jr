import React from "react";
import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — botão de chamada ("Inscreva-se" etc.) que aparece num
// canto, pulsa pra chamar atenção e some. Não reproduz ícone/logo de
// nenhuma plataforma — é só um pill sólido com texto, na identidade JR.
// Tamanhos em fração da largura/altura do vídeo (0 a 1), nunca pixel fixo,
// pra funcionar igual em vertical e horizontal.

export const callToActionSchema = z.object({
  texto: z.string().default("Inscreva-se"),
  posicao: z
    .enum(["superior-esquerdo", "superior-direito", "inferior-esquerdo", "inferior-direito"])
    .default("inferior-direito"),
  corBotao: zColor().default("#EFAF20"),
  corTexto: zColor().default("#0F2A1D"),
  // Opcional: padrão transparente, pra não tampar o vídeo por engano quando
  // usado como camada (mesma regra dos outros componentes do catálogo).
  corFundo: zColor().optional(),
  tamanhoFonte: z.number().min(0.01).max(0.5).default(0.032),
  margem: z.number().min(0).max(0.3).default(0.05),
  duracaoFrames: z.number().min(10).default(90),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof callToActionSchema>;

export const CallToAction: React.FC<Props> = ({
  texto,
  posicao,
  corBotao,
  corTexto,
  corFundo = "transparent",
  tamanhoFonte,
  margem,
  duracaoFrames,
  framesEntrada,
  framesSaida,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
    durationInFrames: framesEntrada,
  });
  const entradaClamp = Math.max(0, Math.min(1, entrada));

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaida, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ehDireito = posicao.includes("direito");
  const ehSuperior = posicao.includes("superior");

  const deslocamentoEntrada = (1 - entradaClamp) * width * 0.08;
  const translateX = ehDireito ? deslocamentoEntrada : -deslocamentoEntrada;
  const translateY = ehSuperior ? -deslocamentoEntrada * 0.6 : deslocamentoEntrada * 0.6;
  const escala = interpolate(entradaClamp, [0, 1], [0.7, 1]);

  // Pulso contínuo (anel chapado, sem blur) pra chamar atenção enquanto o
  // botão está em tela — desliga sozinho durante entrada/saída.
  const ciclo = (Math.sin((frame / fps) * Math.PI * 2 * 1.2) + 1) / 2;
  const pulsoEscala = 1 + ciclo * 0.35;
  const pulsoOpacidade = (1 - ciclo) * 0.5 * entradaClamp * saida;

  const fontSize = width * tamanhoFonte;
  const paddingV = fontSize * 0.55;
  const paddingH = fontSize * 1;
  const raio = fontSize * 2;

  const estiloPosicao: React.CSSProperties = {
    position: "absolute",
    ...(ehSuperior ? { top: height * margem } : { bottom: height * margem }),
    ...(ehDireito ? { right: width * margem } : { left: width * margem }),
  };

  return (
    <Sequence name="CallToAction">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          position: "relative",
        }}
      >
        <div
          style={{
            ...estiloPosicao,
            opacity: saida,
            transform: `translate(${translateX}px, ${translateY}px) scale(${escala})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -fontSize * 0.3,
              borderRadius: raio + fontSize * 0.3,
              border: `${fontSize * 0.08}px solid ${corBotao}`,
              opacity: pulsoOpacidade,
              transform: `scale(${pulsoEscala})`,
            }}
          />
          <div
            style={{
              backgroundColor: corBotao,
              borderRadius: raio,
              padding: `${paddingV}px ${paddingH}px`,
            }}
          >
            <span
              style={{
                color: corTexto,
                fontSize,
                fontWeight: 800,
                fontFamily: "Arial, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {texto}
            </span>
          </div>
        </div>
      </div>
    </Sequence>
  );
};
