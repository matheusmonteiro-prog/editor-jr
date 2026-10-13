import React from "react";
import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — o @ do Instagram num canto, num card chapado. Só entra quando
// o roteiro pedir (como o AvisoCVM) e o @ vem do pedido a cada vez: nenhum @ fixo
// no código. Não reproduz ícone/logo de nenhuma plataforma — só texto.
// Tamanhos em fração da largura/altura do vídeo (0 a 1), nunca pixel fixo,
// pra funcionar igual em vertical e horizontal.

export const arrobaInstagramSchema = z.object({
  usuario: z.string().min(1), // obrigatório, sem padrão; com ou sem "@" na frente
  posicao: z
    .enum(["superior-esquerdo", "superior-direito", "inferior-esquerdo", "inferior-direito"])
    .default("superior-esquerdo"),
  tamanhoFonte: z.number().min(0.01).max(0.2).default(0.03),
  margem: z.number().min(0).max(0.3).default(0.04),
  corTexto: zColor().default("#F5F0E6"),
  corCard: zColor().default("#0F2A1D"),
  corDestaque: zColor().default("#EFAF20"),
  // Opcional: padrão transparente, pra não tampar o vídeo por engano quando
  // usado como camada (mesma regra dos outros componentes do catálogo).
  corFundo: zColor().optional(),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(15),
});

type Props = z.infer<typeof arrobaInstagramSchema>;

export const ArrobaInstagram: React.FC<Props> = ({
  usuario,
  posicao = "superior-esquerdo",
  tamanhoFonte = 0.03,
  margem = 0.04,
  corTexto = "#F5F0E6",
  corCard = "#0F2A1D",
  corDestaque = "#EFAF20",
  corFundo = "transparent",
  duracaoFrames = 150,
  framesEntrada = 15,
  framesSaida = 15,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacidade = interpolate(
    frame,
    [0, framesEntrada, duracaoFrames - framesSaida, duracaoFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const limpo = usuario.trim();
  const texto = `@${(limpo.startsWith("@") ? limpo.slice(1) : limpo).trim()}`;

  const ehDireito = posicao.includes("direito");
  const ehSuperior = posicao.includes("superior");

  const fontSize = width * tamanhoFonte;

  const estiloPosicao: React.CSSProperties = {
    position: "absolute",
    ...(ehSuperior ? { top: height * margem } : { bottom: height * margem }),
    ...(ehDireito ? { right: width * margem } : { left: width * margem }),
  };

  return (
    <Sequence name="ArrobaInstagram">
      <div style={{ position: "absolute", inset: 0, backgroundColor: corFundo }}>
        <div
          style={{
            ...estiloPosicao,
            opacity: opacidade,
            backgroundColor: corCard,
            borderBottom: `${fontSize * 0.08}px solid ${corDestaque}`,
            borderRadius: fontSize * 0.25,
            padding: `${fontSize * 0.4}px ${fontSize * 0.8}px`,
          }}
        >
          <span
            style={{
              color: corTexto,
              fontSize,
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {texto}
          </span>
        </div>
      </div>
    </Sequence>
  );
};
