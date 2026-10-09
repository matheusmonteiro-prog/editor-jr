import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { GraficoCrescimento } from "../components/v2/GraficoCrescimento";

// Teste T1 v2 — "raio-X da edição": 5 camadas se separam em 3D e se remontam.

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

type Props = {
  videoSrc?: string;
  titulo?: string;
  frase?: string;
  destaque?: string;
  corVerde?: string;
  corCreme?: string;
  corDourado?: string;
  anguloYMax?: number; // graus na inclinação
  anguloYOrbita?: number; // graus no fim da órbita
  anguloXMax?: number;
  escalaCena?: number;
  distanciaZ?: number; // fração da altura entre camadas
  intervaloCamadas?: number; // frames entre uma camada e a próxima
  framesSeparacao?: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

export const CamadasVidro: React.FC<Props> = ({
  videoSrc = "videos/0926-cortado-v1.mp4",
  titulo = "COMO A EDIÇÃO É MONTADA",
  frase = "SEU DINHEIRO",
  destaque = "TRABALHANDO",
  corVerde = "#0F2A1D",
  corCreme = "#F5F0E6",
  corDourado = "#EFAF20",
  anguloYMax = -28,
  anguloYOrbita = -18,
  anguloXMax = 12,
  escalaCena = 0.72,
  distanciaZ = 0.12,
  intervaloCamadas = 6,
  framesSeparacao = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Câmera: inclina (20–70), órbita (70–150), endireita (150–195).
  const rotY = interpolate(frame, [20, 70, 150, 195], [0, anguloYMax, anguloYOrbita, 0], suave);
  const oscilaX = frame > 70 && frame < 150 ? Math.sin((2 * Math.PI * (frame - 70)) / 80) * 2 : 0;
  const rotX = interpolate(frame, [20, 70, 150, 195], [0, anguloXMax, anguloXMax, 0], suave) + oscilaX;
  const soco = interpolate(frame, [195, 200, 205], [1, 1.02, 1], clamp);
  const escala = interpolate(frame, [20, 70, 150, 195], [1, escalaCena, escalaCena, 1], suave) * soco;

  // Remontagem com leve overshoot (1 - junta passa um pouco de 0).
  const junta = spring({ frame: frame - 150, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 45 });
  const fimSeparacao = (i: number) => 20 + i * intervaloCamadas + framesSeparacao;
  const abre = (i: number) =>
    spring({ frame: frame - 20 - i * intervaloCamadas, fps, config: { damping: 200 }, durationInFrames: framesSeparacao });
  const separacao = (i: number) => abre(i) * (1 - junta);
  // Etiquetas e camadas "só de raio-X" (grade, dado) somem sem overshoot.
  const visivelRaioX = (i: number) => abre(i) * (1 - Math.min(1, junta));

  const camada = (i: number): React.CSSProperties => ({
    transform: `translateZ(${(i - 2) * height * distanciaZ * separacao(i)}px)`,
    transformStyle: "preserve-3d",
  });
  const veu = (i: number) => (
    <AbsoluteFill style={{ background: corVerde, opacity: 0.4 * Math.max(0, separacao(i)) * ((4 - i) / 4) }} />
  );

  const etiqueta = (i: number, texto: string, left: number, top: number) => {
    const v = visivelRaioX(i);
    return (
      <div
        style={{
          position: "absolute",
          left: width * left,
          top: height * top,
          transform: `translateX(${(1 - v) * -width * 0.08}px)`,
          opacity: v,
          background: corDourado,
          color: corVerde,
          fontFamily,
          fontWeight: 800,
          fontSize: width * 0.03,
          padding: `${height * 0.006}px ${width * 0.025}px`,
          borderRadius: width * 0.05,
          letterSpacing: width * 0.002,
        }}
      >
        {texto}
      </div>
    );
  };

  const sombra = (left: number, top: number, w: number, h: number): React.CSSProperties => ({
    position: "absolute",
    left: width * left + width * 0.02,
    top: height * top + width * 0.02,
    width: width * w,
    height: height * h,
    background: `${corVerde}66`,
    borderRadius: width * 0.03,
  });
  const card = (left: number, top: number, w: number, h: number, bg: string): React.CSSProperties => ({
    position: "absolute",
    left: width * left,
    top: height * top,
    width: width * w,
    height: height * h,
    background: bg,
    borderRadius: width * 0.03,
    overflow: "hidden",
  });

  // Grade: piso em perspectiva no terço inferior.
  const gradeTop = height * 0.667;
  const gradeH = height - gradeTop;
  const fuga = { x: width / 2, y: -gradeH * 0.6 };
  const linhasH = Array.from({ length: 8 }, (_, k) => gradeH * Math.pow((k + 1) / 8, 1.8));
  const linhasV = Array.from({ length: 11 }, (_, k) => -width * 0.5 + (k * width * 2) / 10);

  const fraseSpring = spring({ frame: frame - 80, fps, config: { damping: 14, stiffness: 110 } });
  const flash = interpolate(frame, [195, 200, 205], [0, 1, 0], clamp);
  const corMoldura = flash > 0.5 ? corDourado : corCreme;
  const tituloV = interpolate(frame, [0, 20], [0, 1], clamp) * interpolate(frame, [205, 240], [1, 0], clamp);
  const cantoT = width * 0.012;
  const cantoL = width * 0.09;
  const margem = width * 0.04;

  return (
    <AbsoluteFill style={{ background: corVerde, perspective: height * 1.4 }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transform: `scale(${escala}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* 01 VÍDEO */}
        <AbsoluteFill style={camada(0)}>
          <OffthreadVideo src={staticFile(videoSrc)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {veu(0)}
          {etiqueta(0, "01 · VÍDEO", 0.06, 0.1)}
        </AbsoluteFill>

        {/* 02 GRADE */}
        <AbsoluteFill style={{ ...camada(1), opacity: visivelRaioX(1) }}>
          <svg width={width} height={gradeH} style={{ position: "absolute", top: gradeTop }}>
            <g stroke={corDourado} strokeOpacity={0.25} strokeWidth={width * 0.002}>
              {linhasH.map((y) => (
                <line key={y} x1={0} y1={y} x2={width} y2={y} />
              ))}
              {linhasV.map((x) => (
                <line key={x} x1={fuga.x + (x - fuga.x) * 0.15} y1={0} x2={x} y2={gradeH} />
              ))}
            </g>
          </svg>
          {veu(1)}
          {etiqueta(1, "02 · GRADE", 0.06, 0.63)}
        </AbsoluteFill>

        {/* 03 DADO */}
        <AbsoluteFill style={{ ...camada(2), opacity: visivelRaioX(2) }}>
          <div style={sombra(0.1, 0.2, 0.8, 0.3)} />
          <div style={card(0.1, 0.2, 0.8, 0.3, `${corVerde}CC`)}>
            <Sequence from={fimSeparacao(2)}>
              <GraficoCrescimento
                corLinha={corDourado}
                rotuloEixoX=""
                mostrarRotuloEixoX={false}
                textoIlustrativo="ilustrativo"
                mostrarTextoIlustrativo
                textoFinal=""
                mostrarTextoFinal={false}
                largura={0.7}
                altura={0.26}
                duracaoFramesDesenho={60}
              />
            </Sequence>
          </div>
          {veu(2)}
          {etiqueta(2, "03 · DADO", 0.1, 0.17)}
        </AbsoluteFill>

        {/* 04 TEXTO */}
        <AbsoluteFill style={camada(3)}>
          <div style={sombra(0.1, 0.6, 0.8, 0.16)} />
          <div
            style={{
              ...card(0.1, 0.6, 0.8, 0.16, corCreme),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontWeight: 800,
              fontSize: width * 0.075,
              lineHeight: 1.1,
              color: corVerde,
            }}
          >
            <div
              style={{
                opacity: Math.min(1, fraseSpring),
                transform: `translateY(${(1 - fraseSpring) * height * 0.03}px) scale(${0.8 + 0.2 * fraseSpring})`,
                textAlign: "center",
              }}
            >
              <div>{frase}</div>
              <div style={{ color: corDourado }}>{destaque}</div>
            </div>
          </div>
          {veu(3)}
          {etiqueta(3, "04 · TEXTO", 0.1, 0.57)}
        </AbsoluteFill>

        {/* 05 MOLDURA */}
        <AbsoluteFill style={camada(4)}>
          <div
            style={{
              position: "absolute",
              inset: margem,
              border: `${width * 0.004}px solid ${corMoldura}`,
            }}
          />
          {[
            { left: margem, top: margem, bl: true, bt: true },
            { right: margem, top: margem, br: true, bt: true },
            { left: margem, bottom: margem, bl: true, bb: true },
            { right: margem, bottom: margem, br: true, bb: true },
          ].map(({ bl, br, bt, bb, ...pos }, k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                ...pos,
                width: cantoL,
                height: cantoL,
                borderLeft: bl ? `${cantoT}px solid ${corDourado}` : undefined,
                borderRight: br ? `${cantoT}px solid ${corDourado}` : undefined,
                borderTop: bt ? `${cantoT}px solid ${corDourado}` : undefined,
                borderBottom: bb ? `${cantoT}px solid ${corDourado}` : undefined,
              }}
            />
          ))}
          {etiqueta(4, "05 · MOLDURA", 0.06, 0.05)}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Título fixo, fora do 3D */}
      <div
        style={{
          position: "absolute",
          top: height * 0.065,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: width * 0.035,
          letterSpacing: width * 0.004,
          color: corCreme,
          opacity: tituloV,
          transform: `translateY(${(1 - Math.min(1, frame / 20)) * -height * 0.02}px)`,
        }}
      >
        {titulo}
      </div>
    </AbsoluteFill>
  );
};
