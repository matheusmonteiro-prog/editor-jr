import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  LatheGeometry,
  MeshStandardMaterial,
  PMREMGenerator,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadFont } from "@remotion/google-fonts/Inter";

// Teste T8 — "4 linhas": gráfico com eixos discretos, 4 linhas douradas,
// fita de preço creme que desce tocando as 4 e uma pilha de 4 moedas.
// Mesma técnica do MoedasCrescendo (moeda, material, RoomEnvironment, sombra
// suave de chão) — copiada aqui, não importada.

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

// Escala 3D única: 1 U = diâmetro de uma moeda. Tudo abaixo é múltiplo dela.
const U = 1;

// Pseudoaleatório com semente (nunca Math.random).
const semente = (n: number) => {
  let t = (n + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rad = (g: number) => (g * Math.PI) / 180;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Perfil da moeda (raio, altura), de baixo pra cima: borda chanfrada, degrau
// da borda e anel em relevo em cada face. Sem número nem letra.
const perfilMoeda = (R: number, h: number): Vector2[] => {
  const meia = h / 2;
  const relevo = 0.015 * U;
  const chanfro = 0.03 * U;
  const centro = meia - relevo;
  const topo: [number, number][] = [
    [0, centro],
    [0.5 * R, centro],
    [0.5 * R, centro + relevo * 0.8],
    [0.62 * R, centro + relevo * 0.8],
    [0.62 * R, centro],
    [0.8 * R, centro],
    [0.84 * R, meia],
    [0.95 * R, meia],
    [R, meia - chanfro],
  ];
  const baixo = topo.map(([r, y]) => [r, -y] as [number, number]);
  return [...baixo, ...topo.slice().reverse()].map(([r, y]) => new Vector2(r, y));
};

type Props = {
  progressoManual?: boolean; // true: usa `progressoLinha` em vez da animação
  progressoLinha?: number; // 0 a 1: quanto da fita aparece
  corFundo?: string;
  corDourado?: string;
  corCreme?: string;
  inclinacao?: number; // graus (câmera olhando de cima)
  giro?: number; // graus (rotação em Y no início; 0 = linhas retas)
  giroFinal?: number; // graus (rotação em Y depois que a câmera se afasta)
  distanciaInicial?: number; // distância da câmera (U)
  distanciaFinal?: number;
  titulo?: string;
  destaque?: string; // parte do título em dourado (tem que estar em `titulo`)
  rodape?: string;
  etiquetas?: string[];
  inicioDesenho?: number; // frame em que a fita começa
  fimDesenho?: number; // frame em que a fita termina
  inicioAfasta?: number;
  fimAfasta?: number;
  inicioSaida?: number; // título e etiquetas saem em fade até o último frame
};

// Gráfico (plano z = 0): eixos discretos, 4 linhas douradas escalonadas e uma
// fita de preço que desce tocando as 4 em sequência. Sem números.
const GX0 = -2.2 * U; // esquerda do gráfico (eixo Y)
const GX1 = 1.4 * U; // direita do gráfico
const GY0 = -4.1 * U; // base do gráfico (eixo X)
const GY1 = 4.1 * U; // topo do eixo Y
const ESPESSURA_EIXO = 0.03 * U;
const ESPESSURA_LINHA = 0.07 * U; // mais grossa que os eixos
const LINHAS_Y = [2.9 * U, 1.0 * U, -0.9 * U, -2.8 * U];
const TOQUES_X = [-1.4 * U, -0.55 * U, 0.3 * U, 1.15 * U];
const RAIO_FITA = 0.045 * U;
const FITA_Z = 0.12 * U; // um pouco à frente das linhas
const CENTRO_X = 0.18 * U; // desloca o conjunto (gráfico + moedas) pro meio

// Pilha de moedas ao lado direito
const MOEDAS = 4;
const RAIO_MOEDA = 0.45 * U;
const ALTURA_MOEDA = 0.2 * U;
const PILHA_X = 2.1 * U;
const ALTURA_QUEDA = 5 * U;

const SEGMENTOS_FITA = 240;
const LADOS_FITA = 8;
const FOV = 36;

// Fita de preço: começa alta à esquerda, desce com oscilações e toca cada
// linha dourada, da esquerda para a direita. O progresso de cada toque sai da
// própria curva (comprimento de arco, o mesmo que o TubeGeometry usa).
const construirFita = () => {
  const toque = (i: number) => new Vector3(TOQUES_X[i], LINHAS_Y[i], FITA_Z);
  const pts: Vector3[] = [
    new Vector3(GX0 + 0.2 * U, GY1 - 0.2 * U, FITA_Z),
    new Vector3(-1.8 * U, LINHAS_Y[0] + 0.75 * U, FITA_Z),
  ];
  const indiceToque: number[] = [];
  for (let i = 0; i < LINHAS_Y.length; i++) {
    indiceToque.push(pts.length);
    pts.push(toque(i));
    if (i < LINHAS_Y.length - 1) {
      const a = toque(i);
      const b = toque(i + 1);
      // oscilação entre dois toques (alterna pra cima/baixo)
      pts.push(new Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + (i % 2 ? -0.3 : 0.3) * U, FITA_Z));
    }
  }
  pts.push(new Vector3(GX1 + 0.05 * U, LINHAS_Y[LINHAS_Y.length - 1] - 0.3 * U, FITA_Z));

  const curva = new CatmullRomCurve3(pts);
  // Cada ponto de controle cai em t = índice / (n - 1); com divisões múltiplas
  // de (n - 1), o comprimento acumulado nesse ponto sai exato da tabela.
  const passo = 500;
  const divisoes = (pts.length - 1) * passo;
  curva.arcLengthDivisions = divisoes;
  const comprimentos = curva.getLengths(divisoes);
  const total = comprimentos[comprimentos.length - 1];
  const progresso = indiceToque.map((idx) => comprimentos[idx * passo] / total);
  return { curva, progresso };
};
const FITA = construirFita();
// Progresso (0–1) em que a fita chega em cada linha, calculado da própria curva.
export const PROGRESSO_CRUZAMENTOS = FITA.progresso;

// Estado da câmera/cena num frame. Usado pela cena 3D e pela projeção das
// etiquetas HTML, para as duas concordarem.
type CameraProps = {
  inclinacao: number;
  giro: number;
  giroFinal: number;
  distanciaInicial: number;
  distanciaFinal: number;
  inicioAfasta: number;
  fimAfasta: number;
};
const estadoCamera = (frame: number, c: CameraProps) => {
  const k = interpolate(frame, [c.inicioAfasta, c.fimAfasta], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return {
    inclinacao: c.inclinacao,
    giro: c.giro + (c.giroFinal - c.giro) * k,
    recuo: (c.distanciaFinal - c.distanciaInicial) * k, // grupo anda em -z
  };
};

// Projeta um ponto do gráfico na tela (px), igual ao que a câmera faz.
const projetar = (
  p: [number, number, number],
  est: { inclinacao: number; giro: number; recuo: number },
  distanciaInicial: number,
  width: number,
  height: number,
) => {
  const x0 = p[0] - CENTRO_X;
  const ry = rad(est.giro);
  const rx = rad(est.inclinacao);
  // Euler XYZ: primeiro gira em Y, depois em X
  const x1 = x0 * Math.cos(ry) + p[2] * Math.sin(ry);
  const z1 = -x0 * Math.sin(ry) + p[2] * Math.cos(ry);
  const y2 = p[1] * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = p[1] * Math.sin(rx) + z1 * Math.cos(rx) - est.recuo;
  const prof = distanciaInicial - z2;
  const tanH = Math.tan(rad(FOV / 2));
  const nx = x1 / (prof * tanH * (width / height));
  const ny = y2 / (prof * tanH);
  return { x: ((nx + 1) / 2) * width, y: ((1 - ny) / 2) * height };
};

type CenaProps = Required<
  Pick<
    Props,
    | "progressoManual"
    | "progressoLinha"
    | "corDourado"
    | "corCreme"
    | "inclinacao"
    | "giro"
    | "giroFinal"
    | "distanciaInicial"
    | "distanciaFinal"
    | "inicioDesenho"
    | "fimDesenho"
    | "inicioAfasta"
    | "fimAfasta"
  >
>;

// Frame em que a fita (progresso linear entre inicioDesenho e fimDesenho)
// chega em cada linha.
const frameToque = (i: number, ini: number, fim: number) => ini + FITA.progresso[i] * (fim - ini);

const Cena: React.FC<CenaProps> = ({
  progressoManual,
  progressoLinha,
  corDourado,
  corCreme,
  inclinacao,
  giro,
  giroFinal,
  distanciaInicial,
  distanciaFinal,
  inicioDesenho,
  fimDesenho,
  inicioAfasta,
  fimAfasta,
}) => {
  const gl = useThree((s) => s.gl);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mapa de ambiente gerado localmente (RoomEnvironment), sem baixar nada.
  const envMap = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const alvo = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    return alvo.texture;
  }, [gl]);

  const mat = useMemo(
    () => ({
      eixo: new MeshStandardMaterial({ color: corCreme, roughness: 1, metalness: 0, transparent: true, depthWrite: false }),
      // uma por linha: cada uma pisca/brilha sozinha ao ser tocada
      linhas: LINHAS_Y.map(
        () =>
          new MeshStandardMaterial({
            color: corDourado,
            roughness: 0.35,
            metalness: 0.8,
            envMap,
            envMapIntensity: 1.1,
            emissive: corDourado,
            emissiveIntensity: 0,
            transparent: true,
          }),
      ),
      fita: new MeshStandardMaterial({ color: corCreme, roughness: 0.45, metalness: 0.1, envMap, envMapIntensity: 0.6 }),
      // material da moeda do MoedasCrescendo
      moeda: new MeshStandardMaterial({ color: corDourado, roughness: 0.3, metalness: 0.9, envMap, envMapIntensity: 1.1 }),
    }),
    [envMap, corDourado, corCreme],
  );

  const geoMoeda = useMemo(() => new LatheGeometry(perfilMoeda(RAIO_MOEDA, ALTURA_MOEDA), 48), []);
  const geoFita = useMemo(
    () => new TubeGeometry(FITA.curva, SEGMENTOS_FITA, RAIO_FITA, LADOS_FITA, false),
    [],
  );

  // Progresso da fita: animado (25–200) ou manual.
  const progresso = progressoManual
    ? progressoLinha
    : interpolate(frame, [inicioDesenho, fimDesenho], [0, 1], clamp);
  // Mostra só o começo da fita (índices: segmentos × lados × 6).
  geoFita.setDrawRange(0, Math.round(Math.min(1, Math.max(0, progresso)) * SEGMENTOS_FITA) * LADOS_FITA * 6);

  // Fade das linhas e eixos (0–25).
  const entrada = interpolate(frame, [0, 25], [0, 1], clamp);
  mat.eixo.opacity = 0.3 * entrada;

  const toques = LINHAS_Y.map((_, i) => frameToque(i, inicioDesenho, fimDesenho));
  const linhas = LINHAS_Y.map((y, i) => {
    const t = frame - toques[i];
    const tocada = t >= 0 && !progressoManual;
    // vibra de leve (seno amortecido) e fica mais brilhante
    const vibra = tocada ? Math.sin((2 * Math.PI * t) / 6) * Math.exp(-t / 8) * 0.07 * U : 0;
    mat.linhas[i].opacity = entrada;
    mat.linhas[i].emissiveIntensity = tocada ? 0.2 + 0.7 * Math.exp(-t / 20) : 0;
    return (
      <mesh key={`l${i}`} position={[(GX0 + GX1) / 2, y + vibra, 0]} material={mat.linhas[i]} castShadow receiveShadow>
        <boxGeometry args={[GX1 - GX0, ESPESSURA_LINHA, ESPESSURA_LINHA]} />
      </mesh>
    );
  });

  const moedas = Array.from({ length: MOEDAS }, (_, k) => {
    const inicio = toques[k];
    // spring com sobra (>1): o abs faz a moeda quicar pra cima em vez de afundar.
    const s = spring({ frame: frame - inicio, fps, config: { damping: 12, stiffness: 110, mass: 0.8 } });
    const queda = 1 - s;
    const voltasX = semente(k + 5) > 0.5 ? 2 : 1;
    return (
      <mesh
        key={`m${k}`}
        geometry={geoMoeda}
        material={mat.moeda}
        visible={frame >= inicio}
        position={[
          PILHA_X + (semente(k + 1) - 0.5) * 0.05 * U,
          GY0 + k * ALTURA_MOEDA + ALTURA_MOEDA / 2 + Math.abs(queda) * ALTURA_QUEDA,
          (semente(k + 2) - 0.5) * 0.05 * U,
        ]}
        rotation={[rad((semente(k + 3) - 0.5) * 4) + queda * 2 * Math.PI * voltasX, 0, rad((semente(k + 4) - 0.5) * 4)]}
        castShadow
        receiveShadow
      />
    );
  });

  const est = estadoCamera(frame, { inclinacao, giro, giroFinal, distanciaInicial, distanciaFinal, inicioAfasta, fimAfasta });

  return (
    <>
      <directionalLight
        position={[-4 * U, 8 * U, 6 * U]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-8 * U}
        shadow-camera-right={8 * U}
        shadow-camera-top={8 * U}
        shadow-camera-bottom={-8 * U}
        shadow-camera-near={0.5 * U}
        shadow-camera-far={40 * U}
      />
      {/* preenchimento fraco, sem sombra, do lado oposto */}
      <directionalLight position={[4 * U, 3 * U, 6 * U]} intensity={0.5} />

      {/* a câmera fica parada; o grupo anda pra trás (afasta) e gira */}
      <group position={[0, 0, -est.recuo]} rotation={[rad(est.inclinacao), rad(est.giro), 0]}>
        <group position={[-CENTRO_X, 0, 0]}>
          {/* eixos discretos (creme a ~30%) */}
          <mesh position={[(GX0 + GX1) / 2, GY0, 0]} material={mat.eixo}>
            <boxGeometry args={[GX1 - GX0, ESPESSURA_EIXO, ESPESSURA_EIXO]} />
          </mesh>
          <mesh position={[GX0, (GY0 + GY1) / 2, 0]} material={mat.eixo}>
            <boxGeometry args={[ESPESSURA_EIXO, GY1 - GY0, ESPESSURA_EIXO]} />
          </mesh>
          {linhas}
          {/* a fita não projeta sombra: o tubo fino virava riscos no chão */}
          <mesh geometry={geoFita} material={mat.fita} />
          {moedas}
          {/* chão: só recebe sombra, sem cor visível */}
          <mesh position={[0, GY0 - 0.02 * U, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[16 * U, 16 * U]} />
            <shadowMaterial opacity={0.45} />
          </mesh>
        </group>
      </group>
    </>
  );
};

export const QuatroLinhasJR: React.FC<Props> = ({
  progressoManual = false,
  progressoLinha = 1,
  corFundo = "#0F2A1D",
  corDourado = "#EFAF20",
  corCreme = "#F5F0E6",
  inclinacao = 6,
  giro = 0,
  giroFinal = -12,
  distanciaInicial = 15,
  distanciaFinal = 17.5,
  titulo = "AS 4 LINHAS DO MÉTODO JR",
  destaque = "MÉTODO JR",
  rodape = "ilustrativo",
  etiquetas = ["1ª LINHA", "2ª LINHA", "3ª LINHA", "4ª LINHA"],
  inicioDesenho = 25,
  fimDesenho = 200,
  inicioAfasta = 200,
  fimAfasta = 260,
  inicioSaida = 260,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const est = estadoCamera(frame, { inclinacao, giro, giroFinal, distanciaInicial, distanciaFinal, inicioAfasta, fimAfasta });
  const saida = interpolate(frame, [inicioSaida, durationInFrames - 1], [1, 0], clamp);

  const tituloIn = interpolate(frame, [0, 25], [0, 1], clamp);
  const tituloV = tituloIn * saida;
  const [antes, depois = ""] = titulo.split(destaque);
  const rodapeV = interpolate(frame, [inicioAfasta, inicioAfasta + 15], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: corFundo }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, distanciaInicial * U], fov: FOV }}
        shadows
        style={{ position: "absolute", inset: 0 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
        }}
      >
        <Cena
          progressoManual={progressoManual}
          progressoLinha={progressoLinha}
          corDourado={corDourado}
          corCreme={corCreme}
          inclinacao={inclinacao}
          giro={giro}
          giroFinal={giroFinal}
          distanciaInicial={distanciaInicial}
          distanciaFinal={distanciaFinal}
          inicioDesenho={inicioDesenho}
          fimDesenho={fimDesenho}
          inicioAfasta={inicioAfasta}
          fimAfasta={fimAfasta}
        />
      </ThreeCanvas>

      {/* Etiquetas: pílula presa ao canto esquerdo de cada linha (projetada) */}
      {etiquetas.map((texto, i) => {
        const t = frame - frameToque(i, inicioDesenho, fimDesenho);
        if (t < 0 || progressoManual) return null;
        const s = spring({ frame: t, fps, config: { damping: 16, stiffness: 120 } });
        const pos = projetar([GX0 + 0.1 * U, LINHAS_Y[i] - 0.14 * U, 0], est, distanciaInicial, width, height);
        return (
          <div
            key={texto}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              background: corDourado,
              color: corFundo,
              fontFamily,
              fontWeight: 800,
              fontSize: width * 0.026,
              padding: `${height * 0.004}px ${width * 0.02}px`,
              borderRadius: width * 0.05,
              whiteSpace: "nowrap",
              opacity: Math.min(1, s) * saida,
              transform: `translateX(${(1 - Math.min(1, s)) * -width * 0.06}px)`,
            }}
          >
            {texto}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: height * 0.025,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: width * 0.05,
          color: corCreme,
          opacity: tituloV,
          transform: `translateY(${(1 - tituloIn) * -height * 0.02}px)`,
        }}
      >
        {antes}
        <span style={{ color: corDourado }}>{destaque}</span>
        {depois}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: height * 0.03,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: width * 0.022,
          color: corCreme,
          opacity: rodapeV,
        }}
      >
        {rodape}
      </div>
    </AbsoluteFill>
  );
};
