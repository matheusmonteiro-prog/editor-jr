import React from "react";
import {
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

// Componente v2 — do zero. Fotos "impressas jogadas na mesa": borda branca,
// sombra, rotação leve, entrando uma por vez. Posições das fotos calculadas
// automaticamente a partir do índice (não pedem x/y na prop, só a lista).

const fotoSchema = z.object({
  src: z.string(),
  rotacao: z.number(),
  frameEntrada: z.number().min(0),
});

export const colagemFotosSchema = z.object({
  corFundo: zColor(),
  fotos: z.array(fotoSchema),
  etiqueta: z.string(),
  mostrarEtiqueta: z.boolean(),
  corEtiqueta: zColor(),
  larguraFoto: z.number().min(0.05).max(0.9),
  // Opcional (26/09/2026): PNG de fundo transparente, de
  // public/images/personagens/. Sem ela, o componente funciona igual a
  // antes. Entra por último, depois das fotos, com zoom.
  imagemPersonagem: z.string().optional(),
  tamanhoImagemPersonagem: z.number().min(0.05).max(0.6).optional(),
  frameEntradaPersonagem: z.number().min(0).optional(),
});

type Props = z.infer<typeof colagemFotosSchema>;
type Foto = z.infer<typeof fotoSchema>;

// Deslocamento de cada foto em fração da largura/altura da área — dá o
// efeito de "espalhadas", não empilhadas exatamente uma sobre a outra.
const OFFSETS = [
  { left: 0.06, top: 0.06 },
  { left: 0.42, top: 0.22 },
  { left: 0.18, top: 0.02 },
];

const Foto: React.FC<{
  foto: Foto;
  left: number;
  top: number;
  largura: number;
}> = ({ foto, left, top, largura }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - foto.frameEntrada;
  if (local < 0) return null;

  const progresso = spring({
    frame: local,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.8 },
  });
  const translateY = interpolate(progresso, [0, 1], [70, 0]);
  const escala = interpolate(progresso, [0, 1], [0.75, 1]);
  const rotacaoAtual = interpolate(
    progresso,
    [0, 1],
    [foto.rotacao * 2.2, foto.rotacao],
  );
  const opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: largura,
        opacity,
        transform: `translateY(${translateY}px) scale(${escala}) rotate(${rotacaoAtual}deg)`,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: largura * 0.035,
          paddingBottom: largura * 0.12,
          boxShadow: "0 1.2vw 2.4vw rgba(0,0,0,0.55)",
        }}
      >
        <Img
          src={staticFile(foto.src)}
          style={{ width: "100%", display: "block" }}
          durationInFrames={999}
        />
      </div>
    </div>
  );
};

export const ColagemFotos: React.FC<Props> = ({
  corFundo,
  fotos,
  etiqueta,
  mostrarEtiqueta,
  corEtiqueta,
  larguraFoto,
  imagemPersonagem,
  tamanhoImagemPersonagem = 0.3,
  frameEntradaPersonagem,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const opacityEtiqueta = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const larguraPx = width * larguraFoto;

  const ultimaFoto = fotos[fotos.length - 1];
  const framePersonagemPadrao = ultimaFoto ? ultimaFoto.frameEntrada + 20 : 0;
  const entradaPersonagem = spring({
    frame: frame - (frameEntradaPersonagem ?? framePersonagemPadrao),
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.7 },
  });
  const escalaPersonagem = interpolate(entradaPersonagem, [0, 1], [0.6, 1]);
  const tamanhoImagemPx = width * tamanhoImagemPersonagem;

  return (
    <Sequence name="ColagemFotos">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          position: "relative",
        }}
      >
        {mostrarEtiqueta && (
          <div
            style={{
              position: "absolute",
              top: "4%",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: opacityEtiqueta,
            }}
          >
            <span
              style={{
                color: corEtiqueta,
                fontSize: width * 0.026,
                fontWeight: 800,
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                letterSpacing: 3,
              }}
            >
              {etiqueta.toUpperCase()}
            </span>
          </div>
        )}
        {fotos.map((foto, i) => {
          const offset = OFFSETS[i % OFFSETS.length];
          return (
            <Foto
              key={foto.src + i}
              foto={foto}
              left={width * offset.left}
              top={width * offset.top}
              largura={larguraPx}
            />
          );
        })}
        {imagemPersonagem && (
          <div
            style={{
              position: "absolute",
              left: width * 0.05,
              bottom: "4%",
              width: tamanhoImagemPx,
              height: tamanhoImagemPx,
              opacity: Math.min(1, entradaPersonagem),
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
