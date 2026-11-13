// JR 3D Editorial Worlds: gráfico de ações (13/11/2026, pedido do Matheus: "faz um gráfico para ver como ficaria").
// Fala do JR (28/10, 177,4–182,4 s): "...não sou um cara investidor em dividendos. Eu prefiro ações de
// crescimento do que dividendos."
// - Ação de crescimento: candles 3D (preço é candle; regra do guia-3d, seção 6).
// - Ação que paga muito dividendo: linha dourada quase parada + dividendos pagos num painel embaixo.
// - Mesma escala (base 100) para as duas. A câmera chega de lado (mostra o volume) e PARA DE FRENTE com
//   lente fechada antes de os valores importarem: sem perspectiva distorcendo a comparação.
// Dados conceituais (sem cotação real), marcados na tela. Tudo pelo quadro; proibido useFrame().
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FONTE_KIT, progresso } from "../v2/kitV3";
import { cores3D } from "./estilo3D";

export const graficoAcoes3DSchema = z.object({
  voz: z.string().default("videos/2026-10-28-voz-wpe8-calma20.wav"),
  inicioSegundos: z.number().default(177.4),
  comVoz: z.boolean().default(true),
});
type Props = z.infer<typeof graficoAcoes3DSchema>;

// Cores do kit (padrão 13/11/2026): src/components/tres/estilo3D.ts
const c = cores3D("escuro");
const COR = { creme: c.texto, cremeSuave: c.textoSuave, ouro: c.ouro, sobe: c.sobe, desce: c.desce, placa: c.placa, fundo: c.fundo };
const W = 1920, H = 1080, FOV = 18;

// ---------- Dados conceituais determinísticos ----------
const hash = (n: number) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const N = 24;
const CANDLES = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 100;
  for (let i = 0; i < N; i++) {
    const ruido = (hash(i * 3.7) - 0.55) * 22; // alguns candles de queda no caminho
    const c = p * (1 + 0.03) + ruido;
    out.push({ o: p, c, h: Math.max(p, c) + 1.5 + hash(i + 50) * 3, l: Math.min(p, c) - 1.5 - hash(i + 90) * 3 });
    p = c;
  }
  return out;
})();
// Pagadora de dividendo: preço "estabilizado, desvalorizando aos poucos" (fala do JR, 172–175 s).
const LINHA = Array.from({ length: N }, (_, i) => 100 - i * 0.45 + Math.sin(i * 1.3) * 1.6);
const PAGAMENTOS = [3, 7, 11, 15, 19, 23]; // dividendo a cada 4 períodos
const MIN = 85, MAX = Math.max(...CANDLES.map((c) => c.h)) + 4;

// Mundo: gráfico principal de x -5 a 5, preço de y -1.0 a 2.9; painel de dividendos de y -2.55 a -1.65.
const X0 = -5, X1 = 5, Y0 = -1.0, Y1 = 2.9, D0 = -2.55, D1 = -1.65;
const xi = (i: number) => X0 + 0.35 + (i / (N - 1)) * (X1 - X0 - 0.7);
const yp = (v: number) => Y0 + ((v - MIN) / (MAX - MIN)) * (Y1 - Y0);

// Quadros, presos à fala: "dividendos" f33 · "prefiro" f78 · "crescimento" f108 · "dividendos" f144.
const T = { linha: 14, candles: 74, compara: 126 };

// ---------- Câmera: chega de lado e termina de frente (lente fechada) ----------
const camera = (frame: number) => {
  const p = interpolate(frame, [0, 62], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ang = 0.95 * (1 - p);
  const raio = 37 - 11.5 * p;
  const alt = 4.2 * (1 - p) + 0.15;
  return { pos: new THREE.Vector3(Math.sin(ang) * raio, alt, Math.cos(ang) * raio), alvo: new THREE.Vector3(0, 0.15, 0) };
};
const ajustar = (c: THREE.PerspectiveCamera, frame: number) => {
  const { pos, alvo } = camera(frame);
  c.position.copy(pos);
  c.lookAt(alvo);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
};
const Camera: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(cam, frame);
  return null;
};
const naTela = (frame: number, p: THREE.Vector3) => {
  const c = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
  ajustar(c, frame);
  const v = p.clone().project(c);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
};

const Grade: React.FC = () => (
  <group position={[0, 0, -0.28]}>
    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
      <mesh key={f} position={[0, Y0 + f * (Y1 - Y0), 0.02]}>
        <boxGeometry args={[X1 - X0, 0.008, 0.01]} />
        <meshBasicMaterial color={COR.creme} transparent opacity={f === 0 ? 0.35 : 0.08} />
      </mesh>
    ))}
    <mesh position={[0, D0, 0.02]}>
      <boxGeometry args={[X1 - X0, 0.008, 0.01]} />
      <meshBasicMaterial color={COR.creme} transparent opacity={0.35} />
    </mesh>
    {/* linha do "base 100": onde as duas ações começam */}
    <mesh position={[0, yp(100), 0.02]}>
      <boxGeometry args={[X1 - X0, 0.012, 0.01]} />
      <meshBasicMaterial color={COR.creme} transparent opacity={0.22} />
    </mesh>
  </group>
);

const Candles: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <group>
    {CANDLES.map((k, i) => {
      const p = spring({ frame: frame - T.candles - i * 2.2, fps, config: { damping: 16, stiffness: 140 } });
      if (p <= 0.01) return null;
      const sobe = k.c >= k.o;
      const yo = yp(k.o), yc = yp(k.c), meio = (yo + yc) / 2;
      const corpo = Math.max(0.03, Math.abs(yc - yo)) * p;
      const pavio = (yp(k.h) - yp(k.l)) * p;
      return (
        <group key={i} position={[xi(i), 0, 0]}>
          <mesh position={[0, (yp(k.h) + yp(k.l)) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, Math.max(0.001, pavio), 8]} />
            <meshStandardMaterial color={COR.creme} roughness={0.6} />
          </mesh>
          <mesh position={[0, meio, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, corpo, 0.24]} />
            <meshStandardMaterial color={sobe ? COR.sobe : COR.desce} roughness={0.38} metalness={0.05} />
          </mesh>
        </group>
      );
    })}
  </group>
);

const LinhaDividendo: React.FC<{ frame: number }> = ({ frame }) => {
  const p = interpolate(frame, [T.linha, T.linha + 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const n = Math.max(2, Math.round(2 + p * (N * 4 - 2)));
  const geo = useMemo(() => {
    if (p <= 0) return null;
    const curva = new THREE.CatmullRomCurve3(LINHA.map((v, i) => new THREE.Vector3(xi(i), yp(v), 0.02)));
    const pts = curva.getSpacedPoints(N * 4).slice(0, n);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(4, n * 2), 0.04, 10, false);
  }, [n, p]);
  return (
    <group>
      {geo && (
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial color={COR.ouro} metalness={0.45} roughness={0.35} emissive={COR.ouro} emissiveIntensity={0.12} />
        </mesh>
      )}
      {/* Dividendos pagos: barras douradas no painel de baixo, quando a linha passa por elas */}
      {PAGAMENTOS.map((i) => {
        const chegou = progresso(frame, T.linha + (i / (N - 1)) * 48, 8);
        const h = 0.62 * chegou;
        return h > 0.005 ? (
          <mesh key={i} position={[xi(i), D0 + h / 2, 0]} castShadow>
            <boxGeometry args={[0.22, h, 0.22]} />
            <meshStandardMaterial color="#D9B25A" metalness={0.3} roughness={0.35} emissive={COR.ouro} emissiveIntensity={0.15} />
          </mesh>
        ) : null;
      })}
    </group>
  );
};

const Cena: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    <Camera frame={frame} />
    <color attach="background" args={[COR.fundo]} />
    <fog attach="fog" args={[COR.fundo, 30, 55]} />
    <hemisphereLight args={["#DCE7F0", "#2A2018", 1.15]} />
    <directionalLight position={[-3, 5, 14]} intensity={2.2} color="#FFE6C4" castShadow shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0004} shadow-radius={5} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} />
    <directionalLight position={[7, 2, -6]} intensity={0.8} color="#9FC3E0" />
    {/* Placa do gráfico (recebe a sombra dos candles: dá profundidade sem distorcer a leitura) */}
    <mesh position={[0, 0.05, -0.32]} receiveShadow>
      <boxGeometry args={[11.2, 6.4, 0.08]} />
      <meshStandardMaterial color={COR.placa} roughness={0.85} />
    </mesh>
    {/* Moldura fina de metal escovado em volta da placa */}
    {[[0, 3.27, 11.36, 0.08], [0, -3.17, 11.36, 0.08], [-5.64, 0.05, 0.08, 6.52], [5.64, 0.05, 0.08, 6.52]].map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, -0.26]} castShadow>
        <boxGeometry args={[w, h, 0.12]} />
        <meshStandardMaterial color="#8E949A" metalness={0.6} roughness={0.35} />
      </mesh>
    ))}
    <mesh position={[0, -3.35, 1.2]} receiveShadow>
      <boxGeometry args={[11.6, 0.18, 3.4]} />
      <meshStandardMaterial color="#17231D" roughness={0.75} metalness={0.1} />
    </mesh>
    <Grade />
    <LinhaDividendo frame={frame} />
    <Candles frame={frame} fps={fps} />
  </>
);

// ---------- Textos (HTML nítido, presos ao gráfico pela câmera) ----------
const Textos: React.FC<{ frame: number }> = ({ frame }) => {
  const assentou = progresso(frame, 48, 14);
  const ult = CANDLES[N - 1];
  const pc = naTela(frame, new THREE.Vector3(xi(N - 1), yp(ult.c), 0));
  const pl = naTela(frame, new THREE.Vector3(xi(N - 1), yp(LINHA[N - 1]), 0));
  const pd = naTela(frame, new THREE.Vector3(X0, D1 - 0.05, 0));
  const pb = naTela(frame, new THREE.Vector3(X0, yp(100), 0));
  const comp = progresso(frame, T.compara, 16);
  const rot = (o: number): React.CSSProperties => ({ position: "absolute", fontFamily: FONTE_KIT, fontWeight: 900, opacity: o, letterSpacing: 0.6 });
  return (
    <>
      <div style={{ ...rot(progresso(frame, 4, 14)), left: 96, top: 30, fontSize: 46, color: COR.creme }}>CRESCIMENTO x DIVIDENDOS</div>
      <div style={{ ...rot(progresso(frame, 8, 14)), left: 98, top: 90, fontSize: 17, fontWeight: 600, color: COR.cremeSuave, letterSpacing: 1.2 }}>
        ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS · PREÇO EM BASE 100
      </div>
      <div style={{ ...rot(assentou * 0.9), left: pb.x - 150, top: pb.y - 13, width: 132, textAlign: "right", fontSize: 18, fontWeight: 700, color: COR.cremeSuave }}>BASE 100</div>
      <div style={{ ...rot(assentou * progresso(frame, T.linha + 30, 12)), left: pd.x + 8, top: pd.y - 34, fontSize: 18, fontWeight: 800, color: COR.ouro }}>DIVIDENDOS PAGOS</div>
      <div style={{ ...rot(assentou * progresso(frame, T.linha + 40, 12)), left: pl.x + 28, top: pl.y - 16, fontSize: 22, color: COR.ouro, lineHeight: 1.1 }}>
        PAGA DIVIDENDO<br /><span style={{ fontSize: 17, fontWeight: 700 }}>preço parado</span>
      </div>
      <div style={{ ...rot(progresso(frame, T.candles + 50, 12)), left: pc.x + 28, top: pc.y - 18, fontSize: 22, color: COR.sobe, lineHeight: 1.1 }}>
        CRESCIMENTO<br /><span style={{ fontSize: 17, fontWeight: 700 }}>preço subindo</span>
      </div>
      {/* Fecho da comparação: a frase do JR, curta */}
      <div style={{ ...rot(comp), right: 96, top: 38, fontSize: 30, color: COR.creme, transform: `translateY(${(1 - comp) * 10}px)` }}>
        JR: <span style={{ color: COR.sobe }}>PREFIRO CRESCIMENTO</span>
      </div>
    </>
  );
};

export const GraficoAcoes3D: React.FC<Props> = ({ voz, inicioSegundos, comVoz }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      {comVoz && <Audio src={staticFile(voz)} trimBefore={Math.round(inicioSegundos * fps)} />}
      <AbsoluteFill style={{ opacity: progresso(frame, 0, 16) }}>
        <ThreeCanvas width={W} height={H} shadows="soft" camera={{ fov: FOV, near: 0.1, far: 200 }}>
          <Cena frame={frame} fps={fps} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)" }} />
      <Textos frame={frame} />
    </AbsoluteFill>
  );
};
