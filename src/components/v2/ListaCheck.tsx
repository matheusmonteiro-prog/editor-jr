import React from "react";
import {
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Componente v2 — do zero, não reaproveita o ListaCheck antigo (não existe
// um antigo; é novo). Tamanhos em fração da largura do vídeo (0 a 1), não
// pixels fixos — multiplicados por `width` aqui dentro.

const itemSchema = z.object({
  texto: z.string(),
  destaque: z.string(),
});

export const listaCheckSchema = z.object({
  corFundo: zColor(),
  itens: z.array(itemSchema),
  intervaloFrames: z.number().min(1),
  corTexto: zColor(),
  corDestaque: zColor(),
  corCheck: zColor(),
  tamanhoFonte: z.number().min(0.005).max(0.5),
  duracaoFrames: z.number().min(10),
  // Opcional (26/09/2026): PNG de fundo transparente, de
  // public/images/personagens/. Sem ela, o componente funciona igual a
  // antes. Ex.: um "mascote" ao lado da lista.
  imagemPersonagem: z.string().optional(),
  tamanhoImagemPersonagem: z.number().min(0.05).max(0.6).optional(),
});

type Props = z.infer<typeof listaCheckSchema>;
type Item = z.infer<typeof itemSchema>;

const framesEntradaItem = 18;
const framesDesenhoCheck = 12;
const framesSaidaGrupo = 25;

const CheckDesenhado: React.FC<{
  frame: number;
  tamanho: number;
  cor: string;
}> = ({ frame, tamanho, cor }) => {
  const progresso = interpolate(frame, [0, framesDesenhoCheck], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pop = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
    durationInFrames: framesDesenhoCheck,
  });
  const escala = interpolate(pop, [0, 1], [0.5, 1]);
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      style={{ transform: `scale(${escala})`, flexShrink: 0 }}
    >
      <circle cx={50} cy={50} r={46} fill={cor} fillOpacity={0.15} />
      <path
        d="M 26 52 L 43 70 L 76 30"
        fill="none"
        stroke={cor}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - progresso}
      />
    </svg>
  );
};

const ItemLinha: React.FC<{
  item: Item;
  frameEntrada: number;
  corTexto: string;
  corDestaque: string;
  corCheck: string;
  fontSize: number;
  checkTamanho: number;
}> = ({
  item,
  frameEntrada,
  corTexto,
  corDestaque,
  corCheck,
  fontSize,
  checkTamanho,
}) => {
  const frame = useCurrentFrame();
  const local = frame - frameEntrada;
  if (local < -5) return null;

  const entrada = spring({
    frame: local,
    fps: 30,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const entradaClamp = Math.max(0, Math.min(1, entrada));
  const translateX = interpolate(entradaClamp, [0, 1], [-1, 0], {
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const partes = item.texto.split(item.destaque);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.5,
        opacity,
        transform: `translateX(${translateX * 300}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(8,10,8,0.4)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: fontSize * 0.3,
          padding: `${fontSize * 0.35}px ${fontSize * 0.7}px`,
        }}
      >
        <span
          style={{
            color: corTexto,
            fontSize,
            fontWeight: 800,
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {partes[0]}
          <span style={{ color: corDestaque }}>{item.destaque}</span>
          {partes[1]}
        </span>
      </div>
      <CheckDesenhado
        frame={local - framesEntradaItem}
        tamanho={checkTamanho}
        cor={corCheck}
      />
    </div>
  );
};

export const ListaCheck: React.FC<Props> = ({
  corFundo,
  itens,
  intervaloFrames,
  corTexto,
  corDestaque,
  corCheck,
  tamanhoFonte,
  duracaoFrames,
  imagemPersonagem,
  tamanhoImagemPersonagem = 0.28,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const saida = interpolate(
    frame,
    [duracaoFrames - framesSaidaGrupo, duracaoFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateYSaida = interpolate(saida, [0, 1], [-40, 0]);

  const fontSize = width * tamanhoFonte;
  const checkTamanho = fontSize * 1.5;

  // O personagem entra por último, depois que os itens já apareceram.
  const framePersonagem =
    (itens.length - 1) * intervaloFrames + framesEntradaItem;
  const entradaPersonagem = spring({
    frame: frame - framePersonagem,
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.7 },
  });
  const escalaPersonagem = interpolate(entradaPersonagem, [0, 1], [0.6, 1]);
  const tamanhoImagemPx = width * tamanhoImagemPersonagem;

  return (
    <Sequence name="ListaCheck">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            paddingLeft: width * 0.07,
            gap: fontSize * 0.6,
            opacity: saida,
            transform: `translateY(${translateYSaida}px)`,
          }}
        >
          {itens.map((item, i) => (
            <ItemLinha
              key={item.texto}
              item={item}
              frameEntrada={i * intervaloFrames}
              corTexto={corTexto}
              corDestaque={corDestaque}
              corCheck={corCheck}
              fontSize={fontSize}
              checkTamanho={checkTamanho}
            />
          ))}
        </div>
        {imagemPersonagem && (
          <div
            style={{
              position: "absolute",
              right: width * 0.05,
              bottom: "6%",
              width: tamanhoImagemPx,
              height: tamanhoImagemPx,
              opacity: Math.min(1, entradaPersonagem) * saida,
              transform: `scale(${escalaPersonagem})`,
            }}
          >
            <Img
              src={staticFile(`images/personagens/${imagemPersonagem}`)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    </Sequence>
  );
};
