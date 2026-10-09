import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  LatheGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  Vector2,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadFont } from "@remotion/google-fonts/Inter";

// Teste T2 v2 — "moedas que crescem": 3 pilhas de moedas chanfradas caem,
// com reflexo de ambiente e sombra suave. Exceção de regra só neste teste:
// reflexo, sombra suave e brilho especular no objeto 3D (sem bloom/glow/blur).
// A câmera fica parada; quem gira/aproxima é o grupo das pilhas (equivale a
// orbitar).

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

// Escala 3D única: 1 U = diâmetro de uma moeda. Tudo abaixo é múltiplo dela.
const U = 1;

// Pseudoaleatório com semente (nunca Math.random: o frame precisa ser igual
// em toda renderização).
const semente = (n: number) => {
  let t = (n + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Props = {
  videoSrc?: string;
  moedasPorPilha?: number[]; // baixa, média, alta
  corMoeda?: string;
  corVerde?: string;
  corCreme?: string;
  opacidadeVeu?: number;
  atrasoEntrePilhas?: number; // frames
  frameInicioQueda?: number;
  intervaloMoedas?: number; // frames entre uma moeda e a próxima
  anguloInicial?: number; // graus
  anguloFinal?: number;
  inclinacao?: number; // graus (câmera "olhando de cima")
  metalness?: number;
  roughness?: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const rad = (g: number) => (g * Math.PI) / 180;

// Perfil da moeda (raio, altura), de baixo pra cima: borda chanfrada,
// degrau da borda e anel em relevo em cada face. Sem número nem letra.
const perfilMoeda = (R: number, h: number): Vector2[] => {
  const meia = h / 2;
  const relevo = 0.015 * U;
  const chanfro = 0.03 * U;
  const centro = meia - relevo; // face central, um pouco rebaixada
  const topo: [number, number][] = [
    [0, centro],
    [0.5 * R, centro],
    [0.5 * R, centro + relevo * 0.8], // anel em relevo
    [0.62 * R, centro + relevo * 0.8],
    [0.62 * R, centro],
    [0.8 * R, centro],
    [0.84 * R, meia], // degrau até a borda alta
    [0.95 * R, meia],
    [R, meia - chanfro], // chanfro
  ];
  const baixo = topo.map(([r, y]) => [r, -y] as [number, number]);
  // Lathe: face de baixo (centro → borda), lado, face de cima (borda → centro)
  // => normais pra fora (conferido na fórmula do LatheGeometry instalado).
  return [...baixo, ...topo.slice().reverse()].map(([r, y]) => new Vector2(r, y));
};

type CenaProps = Required<
  Pick<
    Props,
    | "moedasPorPilha"
    | "corMoeda"
    | "atrasoEntrePilhas"
    | "frameInicioQueda"
    | "intervaloMoedas"
    | "anguloInicial"
    | "anguloFinal"
    | "inclinacao"
    | "metalness"
    | "roughness"
  >
>;

const Cena: React.FC<CenaProps> = ({
  moedasPorPilha,
  corMoeda,
  atrasoEntrePilhas,
  frameInicioQueda,
  intervaloMoedas,
  anguloInicial,
  anguloFinal,
  inclinacao,
  metalness,
  roughness,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gl = useThree((s) => s.gl);

  const raio = 0.45 * U;
  const alturaMoeda = 0.2 * U;
  const espacoPilhas = 1.0 * U;
  const alturaQueda = 4 * U;

  // Mapa de ambiente gerado localmente (RoomEnvironment), sem baixar nada.
  const envMap = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const alvo = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    return alvo.texture;
  }, [gl]);

  const geometria = useMemo(
    () => new LatheGeometry(perfilMoeda(raio, alturaMoeda), 48),
    [raio, alturaMoeda],
  );

  // Câmera: -25° → 25° (20–130), assenta de frente (130–165) e segura.
  const angulo = interpolate(frame, [20, 130, 165], [anguloInicial, anguloFinal, 0], suave);
  const aproxima = interpolate(frame, [20, 150], [0, 1.7 * U], suave);
  // Luz principal passa devagar: o reflexo desliza nas moedas.
  const luzX = interpolate(frame, [0, 210], [-4 * U, 4 * U], clamp);

  const moedas = moedasPorPilha.flatMap((qtd, p) =>
    Array.from({ length: qtd }, (_, k) => {
      const id = p * 100 + k;
      const inicio = frameInicioQueda + p * atrasoEntrePilhas + k * intervaloMoedas;
      // spring com sobra (>1): o abs faz a moeda quicar pra cima em vez de afundar.
      const s = spring({
        frame: frame - inicio,
        fps,
        config: { damping: 12, stiffness: 110, mass: 0.8 },
      });
      const queda = 1 - s;
      const y = k * alturaMoeda + alturaMoeda / 2 + Math.abs(queda) * alturaQueda;
      // Assentamento fixo por moeda: leve inclinação e deslocamento.
      const x = (p - 1) * espacoPilhas + (semente(id + 1) - 0.5) * 0.05 * U;
      const z = (semente(id + 2) - 0.5) * 0.05 * U;
      const tiltX = rad((semente(id + 3) - 0.5) * 4);
      const tiltZ = rad((semente(id + 4) - 0.5) * 4);
      const voltasX = semente(id + 5) > 0.5 ? 2 : 1;
      const voltasZ = semente(id + 6) > 0.5 ? 1 : 0;
      return (
        <mesh
          key={id}
          geometry={geometria}
          visible={frame >= inicio}
          position={[x, y, z]}
          rotation={[
            tiltX + queda * 2 * Math.PI * voltasX,
            0,
            tiltZ + queda * 2 * Math.PI * voltasZ,
          ]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={corMoeda}
            metalness={metalness}
            roughness={roughness}
            envMap={envMap}
            envMapIntensity={1.1}
          />
        </mesh>
      );
    }),
  );

  return (
    <>
      <directionalLight
        position={[luzX, 6 * U, 4 * U]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={5}
        shadow-camera-left={-3 * U}
        shadow-camera-right={3 * U}
        shadow-camera-top={3 * U}
        shadow-camera-bottom={-3 * U}
        shadow-camera-near={0.5 * U}
        shadow-camera-far={20 * U}
      />
      {/* preenchimento fraco, sem sombra, do lado oposto */}
      <directionalLight position={[-4 * U, 2 * U, 5 * U]} intensity={0.5} />
      <group position={[0, 0, aproxima]} rotation={[rad(inclinacao), 0, 0]}>
        <group position={[0, -1.1 * U, 0]} rotation={[0, rad(angulo), 0]}>
          {moedas}
          {/* chão: só recebe sombra, sem cor visível */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10 * U, 10 * U]} />
            <shadowMaterial opacity={0.4} />
          </mesh>
        </group>
      </group>
    </>
  );
};

export const MoedasCrescendo: React.FC<Props> = ({
  videoSrc = "videos/0926-cortado-v1.mp4",
  moedasPorPilha = [4, 7, 11],
  corMoeda = "#EFAF20",
  corVerde = "#0F2A1D",
  corCreme = "#F5F0E6",
  opacidadeVeu = 0.55,
  atrasoEntrePilhas = 15,
  frameInicioQueda = 20,
  intervaloMoedas = 7,
  anguloInicial = -25,
  anguloFinal = 25,
  inclinacao = 22,
  metalness = 0.9,
  roughness = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tituloIn = interpolate(frame, [0, 20], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: corVerde }}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ background: corVerde, opacity: opacidadeVeu }} />

      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 10.5 * U], fov: 36 }}
        shadows
        style={{ position: "absolute", inset: 0 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
        }}
      >
        <Cena
          moedasPorPilha={moedasPorPilha}
          corMoeda={corMoeda}
          atrasoEntrePilhas={atrasoEntrePilhas}
          frameInicioQueda={frameInicioQueda}
          intervaloMoedas={intervaloMoedas}
          anguloInicial={anguloInicial}
          anguloFinal={anguloFinal}
          inclinacao={inclinacao}
          metalness={metalness}
          roughness={roughness}
        />
      </ThreeCanvas>

      <div
        style={{
          position: "absolute",
          top: height * 0.08,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: width * 0.075,
          color: corCreme,
          opacity: tituloIn,
          transform: `translateY(${(1 - tituloIn) * -height * 0.03}px)`,
        }}
      >
        SEU DINHEIRO <span style={{ color: corMoeda }}>CRESCENDO</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: height * 0.04,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: width * 0.026,
          color: corCreme,
          opacity: tituloIn,
        }}
      >
        ilustrativo
      </div>
    </AbsoluteFill>
  );
};
