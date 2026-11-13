// Teste 3D de verdade (13/11/2026, aula 8.1 do guia do curso, pedido do Matheus).
// Fala do JR no vídeo de 28/10 (159,8 a 164,8 s): "O dividendo é pouco, mas a valorização é grande."
// Maquete de um pedaço de terra (Three.js pelo @remotion/three): poucas moedas pequenas (dividendo),
// barras subindo (valorização); a maquete abre em 3 camadas (TERRA, VALORIZAÇÃO, DIVIDENDO) e se reúne.
// Tudo anda pelo quadro do Remotion (useCurrentFrame). Proibido useFrame() do R3F (skill oficial, 3d.md).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, interpolate, OffthreadVideo, Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { KIT, FONTE_KIT, progresso } from "../v2/kitV3";

export const terraValorizacao3DSchema = z.object({
  video: z.string().default("videos/2026-10-28-final-v1-filtro-natural-v2.mp4"),
  voz: z.string().default("videos/2026-10-28-voz-wpe8-calma20.wav"),
  inicioSegundos: z.number().default(159.8), // segundo da gravação em que o trecho começa
  corBarra: z.string().default("#1DD41E"), // verde do método (decisão do Matheus, Etapa 5)
  titulo: z.string().default("TERRA: VALORIZA MUITO, PAGA POUCO"),
});
type Props = z.infer<typeof terraValorizacao3DSchema>;

// O 3D ocupa a tela inteira (sem emenda de cor); a maquete é empurrada para a esquerda deslocando a
// "lente" (setViewOffset), e a moldura do JR fica por cima, à direita.
const AREA = { x: 0, y: 0, w: 1920, h: 1080 };
const FOV = 32;
const DESLOCA_X = 120; // px: quanto a maquete anda para a esquerda na tela

// Quadros (30 qps, contados do início do trecho), presos à fala medida pelo Whisper:
// "dividendo" 0,65 s · "pouco" 1,2 s · "valorização" 1,84 s · "grande" 2,7 s.
const T = { terra: 0, moedas: 20, barras: 55, abre: 98, fecha: 128, fim: 150 };

// Câmera: gira devagar em volta da maquete (sem volta completa, sem desorientar).
const camera = (frame: number) => {
  const ang = interpolate(frame, [0, T.fim], [-0.62, -0.2]);
  const raio = interpolate(frame, [0, T.abre, T.fecha, T.fim], [16.5, 15.0, 15.4, 14.6]);
  const alt = interpolate(frame, [0, T.abre, T.fecha, T.fim], [8.6, 7.8, 8.0, 7.2]);
  return { pos: new THREE.Vector3(Math.sin(ang) * raio, alt, Math.cos(ang) * raio), alvo: new THREE.Vector3(0, 2.4, 0) };
};
const ajustarLente = (c: THREE.PerspectiveCamera) => {
  c.setViewOffset(AREA.w, AREA.h, DESLOCA_X, 0, AREA.w, AREA.h);
  c.updateProjectionMatrix();
};

// Quanto cada camada sobe quando a maquete "abre".
const abertura = (frame: number) => progresso(frame, T.abre, 20) - progresso(frame, T.fecha, 20);
const ALTURA_CAMADA = { terra: 0, valorizacao: 1.3, dividendo: 4.9 };

const BARRAS = [0.7, 1.15, 1.6, 2.15, 2.8]; // alturas finais (ilustrativas, sem número na tela)
const MOEDAS: [number, number][] = [[1.7, 1.2], [2.35, 0.9], [2.0, 1.55]];

const Camera: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { pos, alvo } = camera(frame);
  cam.position.copy(pos);
  cam.lookAt(alvo);
  ajustarLente(cam);
  cam.updateMatrixWorld();
  return null;
};

const Placa: React.FC<{ y: number; opacidade: number }> = ({ y, opacidade }) => (
  <mesh position={[0, y, 0]} receiveShadow>
    <boxGeometry args={[6.3, 0.03, 4.3]} />
    <meshStandardMaterial color={KIT.creme} transparent opacity={opacidade} />
  </mesh>
);

const Cena: React.FC<{ frame: number; fps: number; corBarra: string }> = ({ frame, fps, corBarra }) => {
  const ab = abertura(frame);
  const terraSobe = progresso(frame, T.terra, 18);
  const yVal = ab * ALTURA_CAMADA.valorizacao;
  const yDiv = ab * ALTURA_CAMADA.dividendo;
  const topoTerra = 0.6 * terraSobe;
  return (
    <>
      <Camera frame={frame} />
      {/* Fundo e névoa na cor do kit: o chão some no horizonte sem borda */}
      <color attach="background" args={[KIT.verde]} />
      <fog attach="fog" args={[KIT.verde, 24, 42]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 11, 7]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <directionalLight position={[-6, 4, -5]} intensity={0.35} color="#FFE7B0" />
      {/* Chão do estúdio (recebe a sombra de contato) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#123222" />
      </mesh>

      {/* CAMADA 1: TERRA (solo + faixa verde + fileiras de lavoura). Nasce da "planta" plana. */}
      <group scale={[1, Math.max(0.02, terraSobe), 1]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 0.5, 4]} />
          <meshStandardMaterial color="#6B4423" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.54, 0]} receiveShadow>
          <boxGeometry args={[6, 0.08, 4]} />
          <meshStandardMaterial color="#3E7A35" roughness={0.9} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-2.6 + i * 0.65, 0.62, -0.2]} castShadow>
            <boxGeometry args={[0.16, 0.1, 3.2]} />
            <meshStandardMaterial color="#5FA34A" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* CAMADA 2: VALORIZAÇÃO (barras que sobem em escada). Placa translúcida aparece quando abre. */}
      <group position={[0, topoTerra + yVal, 0]}>
        <Placa y={0.02} opacidade={0.28 * ab} />
        {BARRAS.map((h, i) => {
          const p = spring({ frame: frame - T.barras - i * 6, fps, config: { damping: 18, stiffness: 90 } });
          const alt = Math.max(0.001, h * p);
          return (
            <mesh key={i} visible={p > 0.01} position={[-2.2 + i * 0.95, 0.05 + alt / 2, 0.9 - i * 0.35]} castShadow receiveShadow>
              <boxGeometry args={[0.6, alt, 0.6]} />
              <meshStandardMaterial color={corBarra} roughness={0.45} metalness={0.05} />
            </mesh>
          );
        })}
      </group>

      {/* CAMADA 3: DIVIDENDO (só 3 moedas pequenas: "o dividendo é pouco") */}
      <group position={[0, topoTerra + yDiv, 0]}>
        <Placa y={0.02} opacidade={0.22 * ab} />
        {MOEDAS.map(([x, z], i) => {
          const p = spring({ frame: frame - T.moedas - i * 7, fps, config: { damping: 11, stiffness: 120 } });
          return (
            <mesh key={i} position={[x, 0.08 + (1 - p) * 1.6, z]} rotation={[0, i * 0.7, 0]} scale={Math.max(0.001, p)}>
              <cylinderGeometry args={[0.3, 0.3, 0.09, 48]} />
              <meshStandardMaterial color={KIT.amarelo} metalness={0.65} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </>
  );
};

// Projeta um ponto 3D para a tela (mesma câmera da cena), para os rótulos seguirem as camadas.
const naTela = (frame: number, p: THREE.Vector3) => {
  const { pos, alvo } = camera(frame);
  const c = new THREE.PerspectiveCamera(FOV, AREA.w / AREA.h, 0.1, 100);
  c.position.copy(pos);
  c.lookAt(alvo);
  ajustarLente(c);
  c.updateMatrixWorld();
  const v = p.clone().project(c);
  return { x: AREA.x + ((v.x + 1) / 2) * AREA.w, y: AREA.y + ((1 - v.y) / 2) * AREA.h };
};

const Rotulo: React.FC<{ frame: number; nome: string; ancora: THREE.Vector3; ordem: number; cor: string }> = ({ frame, nome, ancora, ordem, cor }) => {
  const entra = progresso(frame, T.abre + 6 + ordem * 4, 12);
  const sai = 1 - progresso(frame, T.fecha - 2, 10);
  const op = Math.min(entra, sai);
  if (op <= 0) return null;
  const a = naTela(frame, ancora);
  // Texto à esquerda da camada, linha de chamada curta até a borda da maquete.
  const fimTexto = a.x - 70;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
        <line x1={fimTexto + 12} y1={a.y} x2={fimTexto + 12 + 58 * entra} y2={a.y} stroke={KIT.creme} strokeWidth={2} strokeOpacity={0.75 * op} />
        <circle cx={a.x} cy={a.y} r={6} fill={cor} opacity={op} />
      </svg>
      <div style={{ position: "absolute", left: fimTexto - 330, top: a.y - 26, width: 330, textAlign: "right", fontFamily: FONTE_KIT,
        fontWeight: 900, fontSize: 40, letterSpacing: 1, color: cor, opacity: op, transform: `translateX(${(1 - entra) * -24}px)` }}>
        {nome}
      </div>
    </>
  );
};

// Moldura chanfrada do JR (sem remover fundo), à direita.
export const MOLDURA = { x: 1300, y: 150, w: 560, h: 800, chanfro: 46 };
export const poligono = (m: typeof MOLDURA, d = 0) =>
  [[m.chanfro + d, d], [m.w - d, d], [m.w - d, m.h - m.chanfro - d], [m.w - m.chanfro - d, m.h - d], [d, m.h - d], [d, m.chanfro + d]]
    .map(([x, y]) => `${x}px ${y}px`).join(", ");

// Onde o JR está na fonte (render v1 do 28/10), mesmos números do src/Video2810V3.tsx: até 163,17 s ele
// está na janelinha do v1 (JANELA_V1); de 163,17 a 163,9 s o v1 anima de volta para a tela cheia.
const JANELA_V1 = { x: 0.235, y: 0.045, largura: 0.53 };
const CURVA_V1_T = [163.17, 163.23, 163.3, 163.37, 163.43, 163.5, 163.6, 163.7, 163.83, 163.9];
const CURVA_V1_P = [0, 0.2, 0.44, 0.6, 0.73, 0.83, 0.9, 0.95, 0.98, 1];
export const estiloJR = (t: number): React.CSSProperties => {
  const p = interpolate(t, CURVA_V1_T, CURVA_V1_P, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l = JANELA_V1.largura + (1 - JANELA_V1.largura) * p;
  const x = JANELA_V1.x * (1 - p), y = JANELA_V1.y * (1 - p);
  // O pedaço 16:9 onde o JR está ocupa a altura da moldura, centrado na largura (rosto no meio).
  const s = MOLDURA.h / (l * 1080);
  return { position: "absolute", width: 1920 * s, height: 1080 * s, maxWidth: "none",
    left: -x * 1920 * s + (MOLDURA.w - l * 1920 * s) / 2, top: -y * 1080 * s };
};

export const TerraValorizacao3D: React.FC<Props> = ({ video, voz, inicioSegundos, corBarra, titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inicio = Math.round(inicioSegundos * fps);
  const entraJR = progresso(frame, 4, 16);
  const ab = abertura(frame);
  const topo = 0.6;
  return (
    <AbsoluteFill style={{ backgroundColor: KIT.verde }}>
      <Audio src={staticFile(voz)} trimBefore={inicio} />
      <div style={{ position: "absolute", left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h }}>
        <ThreeCanvas width={AREA.w} height={AREA.h} shadows camera={{ fov: FOV, near: 0.1, far: 100 }}>
          <Cena frame={frame} fps={fps} corBarra={corBarra} />
        </ThreeCanvas>
      </div>
      <Rotulo frame={frame} nome="DIVIDENDO" ordem={0} cor={KIT.amarelo} ancora={new THREE.Vector3(-3.15, topo + ab * ALTURA_CAMADA.dividendo + 0.03, 2.15)} />
      <Rotulo frame={frame} nome="VALORIZAÇÃO" ordem={1} cor={corBarra} ancora={new THREE.Vector3(-3.15, topo + ab * ALTURA_CAMADA.valorizacao + 0.03, 2.15)} />
      <Rotulo frame={frame} nome="TERRA" ordem={2} cor={KIT.creme} ancora={new THREE.Vector3(-3.0, 0.3, 2.0)} />
      <div style={{ position: "absolute", left: 90, top: 64, fontFamily: FONTE_KIT, fontWeight: 900, fontSize: 44, color: KIT.creme,
        opacity: progresso(frame, 2, 12), letterSpacing: 0.5 }}>
        {titulo}
      </div>
      {/* JR na moldura chanfrada, contorno duplo fino e sombra */}
      <div style={{ position: "absolute", left: MOLDURA.x, top: MOLDURA.y, width: MOLDURA.w, height: MOLDURA.h,
        opacity: entraJR, transform: `translateY(${(1 - entraJR) * 30}px)`, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.45))" }}>
        <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${poligono(MOLDURA)})`, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(video)} muted trimBefore={inicio} style={estiloJR(inicioSegundos + frame / fps)} />
        </div>
        <svg width={MOLDURA.w} height={MOLDURA.h} style={{ position: "absolute", inset: 0 }}>
          <polygon points={poligono(MOLDURA, 2).replace(/px/g, "")} fill="none" stroke={KIT.creme} strokeWidth={2} />
          <polygon points={poligono(MOLDURA, 10).replace(/px/g, "")} fill="none" stroke={KIT.creme} strokeOpacity={0.45} strokeWidth={1.5} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
