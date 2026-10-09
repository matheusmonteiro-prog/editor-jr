import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// Teste T6 — "vídeos virais flutuando": planos 3D em CSS
// (perspective / translateZ / rotateY), todos tocando o mesmo vídeo.
// Telas laterais entram uma a uma, flutuam, a cena orbita e elas recuam.

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Tela = {
  x: number; // fração da largura, a partir do centro
  y: number; // fração da altura, a partir do centro
  z: number; // fração da largura (negativo = mais ao fundo)
  giro: number; // rotateY em graus (positivo: gira pra dentro, no lado esquerdo)
  largura: number; // fração da largura
  inicio: number; // frame do vídeo em que a tela começa a tocar
  veu: number; // 0–1, véu escuro chapado
  entrada?: number; // uso interno: frame em que a tela entra
};

// Esquerda: giro positivo. Direita: giro negativo.
const TELAS_PADRAO: Tela[] = [
  { x: -0.36, y: -0.24, z: 0.1, giro: 24, largura: 0.28, inicio: 150, veu: 0 },
  { x: 0.36, y: 0.26, z: 0.05, giro: -24, largura: 0.28, inicio: 300, veu: 0 },
  { x: -0.37, y: 0.22, z: -0.25, giro: 30, largura: 0.26, inicio: 450, veu: 0.25 },
  { x: 0.37, y: -0.26, z: -0.3, giro: -30, largura: 0.26, inicio: 600, veu: 0.3 },
  { x: -0.33, y: -0.02, z: -0.6, giro: 35, largura: 0.3, inicio: 750, veu: 0.45 },
  { x: 0.33, y: 0.0, z: -0.65, giro: -35, largura: 0.3, inicio: 880, veu: 0.5 },
];

type Props = {
  videoSrc?: string;
  telas?: Tela[];
  larguraCentro?: number; // fração da largura
  proporcaoVideo?: number; // largura / altura do vídeo (2160 / 3872)
  titulo?: string;
  destaque?: string; // palavra do título em dourado (tem que estar em `titulo`)
  amplitudeFlutuacao?: number; // fração da altura (centro)
  amplitudeLateral?: number; // fração da altura (telas laterais)
  periodoFlutuacao?: number; // frames de um ciclo
  distanciaEntrada?: number; // fração da largura, de onde as telas vêm (fundo)
  inicioEntradas?: number; // frame da primeira tela lateral
  intervaloEntradas?: number; // frames entre uma tela e a próxima
  inicioOrbita?: number;
  duracaoOrbita?: number; // frames (um ciclo de seno)
  anguloOrbita?: number; // graus (±)
  inicioSaida?: number; // frame em que as laterais recuam
  corFundo?: string;
  corCreme?: string;
  corDourado?: string;
};

export const TelasFlutuantes: React.FC<Props> = ({
  videoSrc = "videos/0926-cortado-v1.mp4",
  telas = TELAS_PADRAO,
  larguraCentro = 0.62,
  proporcaoVideo = 2160 / 3872,
  titulo = "O QUE JÁ FUNCIONOU",
  destaque = "FUNCIONOU",
  amplitudeFlutuacao = 0.008,
  amplitudeLateral = 0.01,
  periodoFlutuacao = 100,
  distanciaEntrada = 2,
  inicioEntradas = 25,
  intervaloEntradas = 10,
  inicioOrbita = 110,
  duracaoOrbita = 90,
  anguloOrbita = 8,
  inicioSaida = 200,
  corFundo = "#0F2A1D",
  corCreme = "#F5F0E6",
  corDourado = "#EFAF20",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Flutuação entra aos poucos (100–120) para não dar tranco.
  const rampa = interpolate(frame, [100, 120], [0, 1], clamp);
  const flutuaCentro =
    Math.sin((2 * Math.PI * frame) / periodoFlutuacao) * amplitudeFlutuacao * height * rampa;

  // Órbita lenta: um ciclo de seno, começa e termina em 0°.
  const progOrbita = interpolate(frame, [inicioOrbita, inicioOrbita + duracaoOrbita], [0, 1], clamp);
  const orbita = Math.sin(2 * Math.PI * progOrbita) * anguloOrbita;

  const tituloIn = interpolate(frame, [0, 25], [0, 1], clamp);
  const tituloOut = interpolate(frame, [inicioSaida + 5, inicioSaida + 35], [1, 0], clamp);
  const tituloV = tituloIn * tituloOut;
  const [antes, depois = ""] = titulo.split(destaque);

  // Uma tela: sombra chapada (deslocada, sem desfoque) + moldura com o vídeo.
  const tela = (
    key: string,
    t: Tela,
    centro: boolean,
    opacidade = 1,
    zExtra = 0, // fração da largura, somada ao z da tela
    dy = 0, // px
  ): React.ReactElement => {
    const w = width * t.largura;
    const h = w / proporcaoVideo;
    const raio = width * 0.03;
    const pos = (extra: React.CSSProperties): React.CSSProperties => ({
      position: "absolute",
      left: width / 2 + width * t.x - w / 2,
      top: height / 2 + height * t.y - h / 2 + dy,
      width: w,
      height: h,
      borderRadius: raio,
      opacity: opacidade,
      transform: `translateZ(${width * (t.z + zExtra)}px) rotateY(${t.giro}deg)`,
      ...extra,
    });
    return (
      <React.Fragment key={key}>
        <div
          style={pos({
            background: `${corFundo}66`,
            marginLeft: width * 0.018,
            marginTop: width * 0.018,
            transform: `translateZ(${width * (t.z + zExtra) - 2}px) rotateY(${t.giro}deg)`,
          })}
        />
        <div
          style={pos({
            boxSizing: "border-box",
            border: `${width * 0.004}px solid ${corCreme}`,
            overflow: "hidden",
          })}
        >
          {/* Sequence layout="none": o vídeo da lateral só existe (e decodifica) depois que ela entra */}
          <Sequence from={centro ? 0 : t.entrada ?? 0} layout="none">
            <OffthreadVideo
              src={staticFile(videoSrc)}
              trimBefore={t.inicio}
              volume={centro ? 1 : 0}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
          {t.veu > 0 && (
            <AbsoluteFill style={{ background: corFundo, opacity: t.veu }} />
          )}
        </div>
      </React.Fragment>
    );
  };

  // Piso: plano deitado com grade dourada a 15%, sumindo na distância.
  const celula = width * 0.1;
  const linha = width * 0.002;
  const grade = `${corDourado}26`; // 0x26 = 15%
  const pisoW = width * 3;
  const pisoH = width * 2.4;

  return (
    <AbsoluteFill style={{ background: corFundo, perspective: width * 1.6 }}>
      <AbsoluteFill
        style={{ transformStyle: "preserve-3d", transform: `rotateY(${orbita}deg)` }}
      >
        <div
          style={{
            position: "absolute",
            left: width / 2 - pisoW / 2,
            top: height / 2 + height * 0.36 - pisoH / 2,
            width: pisoW,
            height: pisoH,
            backgroundImage: `linear-gradient(to right, ${grade} ${linha}px, transparent ${linha}px), linear-gradient(to bottom, ${grade} ${linha}px, transparent ${linha}px)`,
            backgroundSize: `${celula}px ${celula}px`,
            maskImage: "linear-gradient(to bottom, transparent, black 60%)",
            transform: `translateZ(${-width}px) rotateX(90deg)`,
          }}
        />
        {telas.map((t, i) => {
          const entrada = inicioEntradas + i * intervaloEntradas;
          const sobe = spring({
            frame: frame - entrada,
            fps,
            config: { damping: 14, stiffness: 90, mass: 0.8 },
          });
          const sai = spring({
            frame: frame - inicioSaida - i * 3,
            fps,
            config: { damping: 200 },
            durationInFrames: 25,
          });
          if (frame < entrada || sai >= 1) return null;
          // Vem de longe (z negativo grande) e, na saída, recua de volta.
          const zExtra = -distanciaEntrada * (1 - sobe + sai);
          const opacidade = interpolate(sobe, [0, 0.3], [0, 1], clamp) * (1 - sai);
          const dy =
            Math.sin((2 * Math.PI * frame) / (periodoFlutuacao * (1 + i * 0.12)) + i * 1.3) *
            amplitudeLateral *
            height *
            rampa;
          return tela(`lateral-${i}`, { ...t, entrada }, false, opacidade, zExtra, dy);
        })}
        {tela("centro", { x: 0, y: 0, z: 0, giro: 0, largura: larguraCentro, inicio: 0, veu: 0 }, true, 1, 0, flutuaCentro)}
      </AbsoluteFill>

      {/* Título fixo, fora do 3D */}
      <div
        style={{
          position: "absolute",
          top: height * 0.08,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: width * 0.07,
          color: corCreme,
          opacity: tituloV,
          transform: `translateY(${(1 - tituloV) * -height * 0.03}px)`,
        }}
      >
        {antes}
        <span style={{ color: corDourado }}>{destaque}</span>
        {depois}
      </div>
    </AbsoluteFill>
  );
};
