import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { KIT, progresso, temaSchema } from "./kitV3";

// Kit v3, seção 2.1: fundo das telas explicativas (anexo 3 do Matheus).
// Lavoura com gráfico de velas, bem escura, com zoom lento e uma linha amarela fina
// se desenhando. Substitui o verde chapado. Sem número, sem eixo, sem preço.
// A imagem padrão é PROVISÓRIA (composição de cena-8-amanhecer + cena-7-grafico).
// 04/11 (pedido A-003 do Matheus: "o fundo deve estar em movimento leve"): além do zoom, a imagem
// flutua devagar em ciclos (deriva + "respiração"), um brilho suave atravessa a cena e a linha se
// redesenha de tempos em tempos. Tudo em ciclos, então funciona em cena de 3 s ou de 1 min.

export const fundoExplicativoSchema = z.object({
  imagem: z.string().default("images/kit-v3/fundo-explicativo-provisorio.jpg"),
  zoomFinal: z.number().min(1).max(1.3).default(1.08),
  // Força do escurecimento (vinheta em alfa do verde-escuro), 0 a 1.
  escurecer: z.number().min(0).max(1).default(0.62),
  mostrarLinha: z.boolean().default(true),
  opacidadeLinha: z.number().min(0).max(0.4).default(0.15),
  corLinha: zColor().default("#FFC629"),
  framesLinha: z.number().min(1).default(50),
  // Intensidade do movimento contínuo (0 = parado, 1 = padrão do kit).
  movimento: z.number().min(0).max(2).default(1),
  // Duração de um ciclo da deriva, em segundos (maior = mais lento).
  cicloSegundos: z.number().min(4).max(60).default(16),
  // 04/11 (A-011): "claro" = papel bege com textura leve (sem a lavoura), linha em marrom.
  tema: temaSchema.default("escuro"),
  // O bege pode variar de vídeo para vídeo.
  corFundoClaro: zColor().default("#F5F0E6"),
  duracaoFrames: z.number().min(10).default(300),
});

type Props = z.input<typeof fundoExplicativoSchema>;

// Linha decorativa subindo (coordenadas em 1920×1080, escaladas pelo viewBox).
const LINHA = "M-20 900 L180 820 L330 860 L520 700 L700 740 L900 560 L1080 600 L1300 420 L1500 470 L1720 280 L1940 240";
const COMPRIMENTO = 2700; // comprimento aproximado da linha acima, para o traço se desenhar

export const FundoExplicativo: React.FC<Props> = ({
  imagem = "images/kit-v3/fundo-explicativo-provisorio.jpg",
  zoomFinal = 1.08,
  escurecer = 0.62,
  mostrarLinha = true,
  opacidadeLinha = 0.15,
  corLinha = KIT.amarelo,
  framesLinha = 50,
  movimento = 1,
  cicloSegundos = 16,
  tema = "escuro",
  corFundoClaro = KIT.creme,
  duracaoFrames = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const onda = (periodo: number, fase = 0) => Math.sin((2 * Math.PI * t) / periodo + fase);
  // Deriva lenta (até ~1,6% da tela) e respiração do zoom (±2%), em ciclos diferentes para
  // não parecer repetitivo.
  const dx = 1.6 * movimento * onda(cicloSegundos);
  const dy = 0.9 * movimento * onda(cicloSegundos * 1.37, 1.1);
  const respira = 0.02 * movimento * onda(cicloSegundos * 0.8, 0.4);
  // Brilho que atravessa a cena da esquerda para a direita a cada ciclo.
  const brilhoX = ((t / (cicloSegundos * 1.2)) % 1) * 140 - 20;
  // A linha se redesenha a cada ~2 ciclos (some, desenha de novo).
  const cicloLinha = Math.max(framesLinha * 3, Math.round(cicloSegundos * 2 * fps));

  // Zoom lento e linear durante a cena inteira (kit, seção 7).
  const zoom = interpolate(frame, [0, duracaoFrames], [1, zoomFinal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fLinha = movimento > 0 ? frame % cicloLinha : frame;
  const desenho = progresso(fLinha, 6, framesLinha) * (1 - progresso(fLinha, cicloLinha - 12, 12));

  const a1 = (escurecer * 0.55).toFixed(3);
  const a2 = Math.min(1, escurecer).toFixed(3);
  const a3 = Math.min(1, escurecer * 1.45).toFixed(3);

  if (tema === "claro") {
    // Papel bege: grão fino + manchas largas que flutuam devagar (o mesmo ciclo do escuro).
    return (
      <Sequence name="FundoExplicativo">
        <AbsoluteFill style={{ backgroundColor: corFundoClaro, overflow: "hidden" }}>
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: "-4%",
              width: "108%",
              height: "108%",
              transform: `translate(${dx}%, ${dy}%) scale(${(1 + respira).toFixed(4)})`,
            }}
          >
            <filter id="papel-manchas">
              <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={3} seed={7} />
              <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.18  0 0 0 0.9 0" />
            </filter>
            <filter id="papel-grao">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
              <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.6 0" />
            </filter>
            <rect width="1920" height="1080" filter="url(#papel-manchas)" opacity={0.1} />
            <rect width="1920" height="1080" filter="url(#papel-grao)" opacity={0.12} />
          </svg>
          {/* Bordas um pouco mais escuras (papel), sem cor nova */}
          <AbsoluteFill
            style={{
              background: "radial-gradient(ellipse at 50% 45%, rgba(142,72,19,0) 55%, rgba(142,72,19,0.10) 100%)",
            }}
          />
          {mostrarLinha ? (
            <svg
              viewBox="0 0 1920 1080"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: opacidadeLinha * 0.8 }}
            >
              <path
                d={LINHA}
                fill="none"
                stroke={corLinha === KIT.amarelo ? KIT.marrom : corLinha}
                strokeWidth={3}
                strokeDasharray={COMPRIMENTO}
                strokeDashoffset={COMPRIMENTO * (1 - desenho)}
              />
            </svg>
          ) : null}
        </AbsoluteFill>
      </Sequence>
    );
  }

  return (
    <Sequence name="FundoExplicativo">
      <AbsoluteFill style={{ backgroundColor: KIT.verde, overflow: "hidden" }}>
        <Img
          src={staticFile(imagem)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // +4% de folga para a deriva nunca mostrar a borda da imagem.
            transform: `translate(${dx}%, ${dy}%) scale(${(zoom + 0.04 + respira).toFixed(4)})`,
            transformOrigin: "60% 45%",
          }}
        />
        {/* Brilho suave atravessando (alfa do amarelo do kit, bem fraco) */}
        {movimento > 0 ? (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 35% 60% at ${brilhoX}% 45%, rgba(255,198,41,${(0.07 * Math.min(1, movimento)).toFixed(3)}) 0%, rgba(255,198,41,0) 100%)`,
            }}
          />
        ) : null}
        {/* Vinheta só em alfa do verde-escuro: foco no centro, bordas escuras. */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(15,42,29,${a1}) 0%, rgba(15,42,29,${a2}) 55%, rgba(8,22,15,${a3}) 100%)`,
          }}
        />
        {mostrarLinha ? (
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: opacidadeLinha }}
          >
            <path
              d={LINHA}
              fill="none"
              stroke={corLinha}
              strokeWidth={3}
              strokeDasharray={COMPRIMENTO}
              strokeDashoffset={COMPRIMENTO * (1 - desenho)}
            />
          </svg>
        ) : null}
      </AbsoluteFill>
    </Sequence>
  );
};
