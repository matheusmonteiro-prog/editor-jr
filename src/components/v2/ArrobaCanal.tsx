import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FONTE_KIT, KIT, progresso } from "./kitV3";

// Kit v3, seção 5 (anexo 1, pedido do Matheus em 03/11): com o JR em tela cheia,
// só o @ do canal no canto superior direito. Sem card e sem logo; sombra escura
// suave para leitura (sombra, não brilho: exceção pedida).
// Diferente do ArrobaInstagram (que tem card e fica em qualquer canto).
// GRAFIA DO @ A CONFIRMAR pelo Matheus.

export const arrobaCanalSchema = z.object({
  usuario: z.string().min(1).default("jroinvestidorsertanejo"),
  tamanhoFonte: z.number().min(0.01).max(0.08).default(0.0208),
  margemTopo: z.number().min(0).max(0.2).default(0.04),
  margemDireita: z.number().min(0).max(0.2).default(0.05),
  corTexto: zColor().default("#F5F0E6"),
  duracaoFrames: z.number().min(10).default(150),
  framesEntrada: z.number().min(0).default(10),
  framesSaida: z.number().min(1).default(10),
});

type Props = z.input<typeof arrobaCanalSchema>;

export const ArrobaCanal: React.FC<Props> = ({
  usuario = "jroinvestidorsertanejo",
  tamanhoFonte = 0.0208,
  margemTopo = 0.04,
  margemDireita = 0.05,
  corTexto = KIT.creme,
  duracaoFrames = 150,
  framesEntrada = 10,
  framesSaida = 10,
}) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  // framesEntrada = 0: já começa visível (uso dentro da TransicaoJanela).
  const entrada = framesEntrada > 0 ? progresso(frame, 0, framesEntrada) : 1;
  const opacidade = entrada * (1 - progresso(frame, duracaoFrames - framesSaida, framesSaida));

  const limpo = usuario.trim().replace(/^@/, "");

  return (
    <Sequence name="ArrobaCanal">
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: W * margemTopo,
            right: W * margemDireita,
            opacity: opacidade,
            fontFamily: FONTE_KIT,
            fontWeight: 700,
            fontSize: W * tamanhoFonte,
            lineHeight: 1,
            color: corTexto,
            whiteSpace: "nowrap",
            textShadow: `0 ${W * 0.001}px ${W * 0.005}px rgba(0,0,0,0.45)`,
          }}
        >
          @{limpo}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
