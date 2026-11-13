// JR 3D Editorial Worlds: a IDEIA INICIAL refeita com os elementos novos (13/11/2026, pedido do Matheus:
// "gere outro seguindo a ideia inicial porém com os novos elementos").
// Ideia inicial (Teste3D-Terra-Valorizacao): terra -> dividendo pouco -> valorização grande -> a maquete abre em
// 3 camadas (TERRA, VALORIZAÇÃO, DIVIDENDO) e se reúne, JR na moldura chanfrada.
// Elementos novos: diorama da fazenda (relevo, lavoura, silos, corte do solo com terra roxa), luz de fim de tarde,
// renda em pulsos saindo do silo, e o dado num quadro que SEMPRE OLHA PARA A CÂMERA (sem perspectiva
// distorcendo valor), com patrimônio e dividendo na MESMA escala.
// Fala do JR (28/10, 159,8–164,8 s): "O dividendo é pouco, mas a valorização é grande."
// Tudo pelo quadro do Remotion; proibido useFrame() (skill oficial, 3d.md).
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FONTE_KIT, progresso } from "../v2/kitV3";
import { cores3D } from "./estilo3D";
import { altura, ARVORES, Arvore, criarBase, criarTerreno, Plantas, raioBorda, SILO, Silos } from "./dioramaFazenda";
import { estiloJR, MOLDURA, poligono } from "./TerraValorizacao3D";

export const terraCamadas3DSchema = z.object({
  video: z.string().default("videos/2026-10-28-final-v1-filtro-natural-v2.mp4"),
  voz: z.string().default("videos/2026-10-28-voz-wpe8-calma20.wav"),
  inicioSegundos: z.number().default(159.8),
});
type Props = z.infer<typeof terraCamadas3DSchema>;

// Cores do kit (padrão 13/11/2026): src/components/tres/estilo3D.ts
const c = cores3D("escuro");
const COR = { creme: c.texto, cremeSuave: c.textoSuave, ouro: c.ouro, verde: c.verde, base: c.base, fundo: c.fundo };
const W = 1920, H = 1080, FOV = 30, DESLOCA_X = 210;

// Quadros, presos à fala: "dividendo" f20 · "pouco" f36–48 · "valorização" f55 · "grande" f81–100.
const T = { quadro: 10, renda: 20, linha: 55, abre: 98, fecha: 128, fim: 150 };
const abertura = (f: number) => progresso(f, T.abre, 18) - progresso(f, T.fecha, 18);
const SOLO_DESCE = 1.25, QUADRO_SOBE = 0.4;

// ---------- Câmera ----------
const camera = (frame: number) => {
  const p = interpolate(frame, [0, 70], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  const d = interpolate(frame, [70, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ang = 0.95 - 0.32 * p - 0.06 * d;
  const raio = 24 - 3.5 * p - 0.4 * d;
  const alt = 11.5 - 3.4 * p - 0.2 * d;
  return { pos: new THREE.Vector3(Math.sin(ang) * raio, alt, Math.cos(ang) * raio), alvo: new THREE.Vector3(-0.1, 1.55, 0) };
};
const ajustar = (c: THREE.PerspectiveCamera, frame: number) => {
  const { pos, alvo } = camera(frame);
  c.position.copy(pos);
  c.lookAt(alvo);
  c.setViewOffset(W, H, DESLOCA_X, 0, W, H);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
};
const camFake = (frame: number) => {
  const c = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
  ajustar(c, frame);
  return c;
};
const naTela = (frame: number, p: THREE.Vector3) => {
  const v = p.clone().project(camFake(frame));
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
};
const Camera: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(cam, frame);
  return null;
};

// ---------- Quadro de dados que olha para a câmera ----------
const QUADRO = { w: 6.2, h: 2.7, centroY: 3.2 };
const ANOS = 8;
const VALOR = Array.from({ length: ANOS }, (_, i) => 1 + 0.2 * i + 0.028 * i * i); // conceitual
const RENDA = VALOR.map((v) => v * 0.035); // mesma escala: mal sai do chão
const MAX = VALOR[ANOS - 1] * 1.1;
const PX0 = -2.7, PX1 = 2.7, PY0 = -1.05, PY1 = 1.05;
const qx = (i: number) => PX0 + (i / (ANOS - 1)) * (PX1 - PX0);
const qy = (v: number) => PY0 + (v / MAX) * (PY1 - PY0);
// Posição e giro do quadro no mundo (giro = o da câmera: sempre de frente para quem assiste).
const quadroNoMundo = (frame: number) => {
  const c = camFake(frame);
  const centro = new THREE.Vector3(0, QUADRO.centroY + abertura(frame) * QUADRO_SOBE, 0);
  return { centro, giro: c.quaternion.clone() };
};
const ponto = (frame: number, x: number, y: number) => {
  const { centro, giro } = quadroNoMundo(frame);
  return new THREE.Vector3(x, y, 0.02).applyQuaternion(giro).add(centro);
};

const QuadroDados: React.FC<{ frame: number }> = ({ frame }) => {
  const { centro, giro } = quadroNoMundo(frame);
  const entra = progresso(frame, T.quadro, 16);
  const pLinha = interpolate(frame, [T.linha, T.linha + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const n = Math.max(2, Math.round(2 + pLinha * (ANOS * 6 - 2)));
  const tubo = useMemo(() => {
    if (pLinha <= 0) return null;
    const curva = new THREE.CatmullRomCurve3(VALOR.map((v, i) => new THREE.Vector3(qx(i), qy(v), 0.05)));
    const pts = curva.getSpacedPoints(ANOS * 6).slice(0, n);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(4, n * 2), 0.035, 10, false);
  }, [n, pLinha]);
  return (
    <group position={centro} quaternion={giro} scale={0.92 + 0.08 * entra}>
      {/* vidro escuro fosco + moldura fina */}
      <mesh>
        <planeGeometry args={[QUADRO.w, QUADRO.h]} />
        <meshBasicMaterial color="#06120C" transparent opacity={0.72 * entra} depthWrite={false} />
      </mesh>
      {[[0, QUADRO.h / 2, QUADRO.w, 0.02], [0, -QUADRO.h / 2, QUADRO.w, 0.02], [-QUADRO.w / 2, 0, 0.02, QUADRO.h], [QUADRO.w / 2, 0, 0.02, QUADRO.h]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.01]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={COR.creme} transparent opacity={0.35 * entra} />
        </mesh>
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <mesh key={f} position={[0, PY0 + f * (PY1 - PY0), 0.015]}>
          <planeGeometry args={[PX1 - PX0, 0.006]} />
          <meshBasicMaterial color={COR.creme} transparent opacity={0.1 * entra} />
        </mesh>
      ))}
      <mesh position={[0, PY0, 0.015]}>
        <planeGeometry args={[PX1 - PX0, 0.012]} />
        <meshBasicMaterial color={COR.creme} transparent opacity={0.5 * entra} />
      </mesh>
      {/* DIVIDENDO: barrinhas douradas, uma por ano, quando o pulso chega */}
      {RENDA.map((r, i) => {
        const p = progresso(frame, T.renda + 12 + i * 4, 6);
        const h = Math.max(0.001, (qy(r) - PY0) * p);
        return p > 0.01 ? (
          <mesh key={i} position={[qx(i), PY0 + h / 2, 0.04]}>
            <boxGeometry args={[0.2, h, 0.04]} />
            <meshStandardMaterial color={COR.ouro} emissive={COR.ouro} emissiveIntensity={0.35} />
          </mesh>
        ) : null;
      })}
      {/* VALORIZAÇÃO: linha do valor do patrimônio */}
      {tubo && (
        <mesh geometry={tubo}>
          <meshStandardMaterial color={COR.verde} emissive={COR.verde} emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
      )}
      {VALOR.map((v, i) => (i / (ANOS - 1) <= pLinha + 0.001 && pLinha > 0) ? (
        <mesh key={i} position={[qx(i), qy(v), 0.06]}>
          <circleGeometry args={[0.06, 24]} />
          <meshBasicMaterial color={COR.verde} />
        </mesh>
      ) : null)}
    </group>
  );
};

// Pulsos de renda: saem do topo do silo e caem na barra do ano, no quadro.
const PulsosRenda: React.FC<{ frame: number }> = ({ frame }) => {
  const origem = new THREE.Vector3(SILO.x, altura(SILO.x, SILO.z) + 0.95, SILO.z);
  return (
    <>
      {RENDA.map((_, i) => {
        const ini = T.renda + i * 4;
        const t = interpolate(frame, [ini, ini + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.5, 0, 0.3, 1) });
        if (t <= 0 || t >= 1) return null;
        const destino = ponto(frame, qx(i), PY0 + 0.05);
        const meio = origem.clone().add(destino).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.2, 0));
        const p = new THREE.QuadraticBezierCurve3(origem, meio, destino).getPoint(t);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.07, 20, 20]} />
            <meshStandardMaterial color={COR.ouro} emissive={COR.ouro} emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

const Cena: React.FC<{ frame: number }> = ({ frame }) => {
  const topo = useMemo(() => criarTerreno("topo"), []);
  const solo = useMemo(() => criarTerreno("solo"), []);
  const base = useMemo(criarBase, []);
  const tampa = useMemo(() => {
    const s = new THREE.Shape();
    for (let j = 0; j <= 200; j++) {
      const ang = (j / 200) * Math.PI * 2, r = raioBorda(ang) * 0.995;
      const x = Math.cos(ang) * r, z = -Math.sin(ang) * r;
      if (j === 0) s.moveTo(x, z); else s.lineTo(x, z);
    }
    return new THREE.ShapeGeometry(s, 4);
  }, []);
  const ab = abertura(frame);
  const ySolo = -ab * SOLO_DESCE;
  return (
    <>
      <Camera frame={frame} />
      <color attach="background" args={[COR.fundo]} />
      <fog attach="fog" args={[COR.fundo, 26, 46]} />
      <hemisphereLight args={["#DCE7F0", "#3A2C1E", 1.05]} />
      <directionalLight position={[7, 9, 6]} intensity={2.5} color="#FFE2B8" castShadow
        shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-radius={4}
        shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={8} shadow-camera-bottom={-7} />
      <directionalLight position={[-6, 4, -7]} intensity={0.9} color="#9FC3E0" />
      {/* CAMADA 2: a fazenda (superfície, lavoura, árvores, silos) */}
      <mesh geometry={topo} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} />
      </mesh>
      <Plantas />
      {ARVORES.map(([x, z, s], i) => <Arvore key={i} x={x} z={z} s={s} />)}
      <Silos />
      {/* CAMADA 1: TERRA (corte do solo + base), desce quando a maquete abre */}
      <group position={[0, ySolo, 0]}>
        <mesh geometry={solo} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        {/* Tampa de terra: quando a maquete abre, o solo aparece como uma fatia, não oco */}
        <mesh geometry={tampa} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
          <meshStandardMaterial color="#4E2A1C" roughness={1} />
        </mesh>
        <mesh geometry={base} position={[0, -1.3, 0]} receiveShadow>
          <meshStandardMaterial color={COR.base} roughness={0.7} metalness={0.15} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.66 - SOLO_DESCE, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color={COR.fundo} roughness={1} />
      </mesh>
      {/* CAMADA 3: o quadro de dados (sobe quando abre) */}
      <QuadroDados frame={frame} />
      <PulsosRenda frame={frame} />
    </>
  );
};

// ---------- Rótulos (HTML nítido), como no original: texto à esquerda, linha curta até a camada ----------
const Rotulo: React.FC<{ frame: number; nome: string; ancora: THREE.Vector3; cor: string; op: number; lado?: "esq" | "dir" }> = ({ frame, nome, ancora, cor, op, lado = "esq" }) => {
  if (op <= 0) return null;
  const a = naTela(frame, ancora);
  const esq = lado === "esq";
  const fimTexto = esq ? a.x - 70 : a.x + 70;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0 }} width={W} height={H}>
        <line x1={esq ? fimTexto + 12 : a.x} y1={a.y} x2={esq ? a.x : fimTexto - 12} y2={a.y} stroke={COR.creme} strokeWidth={2} strokeOpacity={0.7 * op} />
        <circle cx={a.x} cy={a.y} r={6} fill={cor} opacity={op} />
      </svg>
      <div style={{ position: "absolute", left: esq ? fimTexto - 360 : fimTexto, top: a.y - 24, width: 360, textAlign: esq ? "right" : "left",
        fontFamily: FONTE_KIT, fontWeight: 900, fontSize: 30, letterSpacing: 0.8, color: cor, opacity: op }}>
        {nome}
      </div>
    </>
  );
};

export const TerraCamadas3D: React.FC<Props> = ({ video, voz, inicioSegundos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inicio = Math.round(inicioSegundos * fps);
  const ab = abertura(frame);
  const entraJR = progresso(frame, 4, 16);
  const opRotulo = progresso(frame, T.abre + 6, 12);
  const opTerra = opRotulo * (1 - progresso(frame, T.fecha - 2, 10));
  const xBorda = -4.35;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Audio src={staticFile(voz)} trimBefore={inicio} />
      <AbsoluteFill style={{ opacity: progresso(frame, 0, 18) }}>
        <ThreeCanvas width={W} height={H} shadows="soft" camera={{ fov: FOV, near: 0.1, far: 100 }}>
          <Cena frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <Rotulo frame={frame} nome="TERRA" cor={COR.creme} op={opTerra} ancora={new THREE.Vector3(xBorda, -0.55 - ab * SOLO_DESCE, 0.6)} />
      <Rotulo frame={frame} nome="DIVIDENDO" cor={COR.ouro} op={Math.max(progresso(frame, T.renda + 36, 12) * 0.0, opRotulo)} ancora={ponto(frame, PX0 - 0.15, PY0 + 0.04)} />
      <Rotulo frame={frame} nome="VALORIZAÇÃO" cor={COR.verde} op={opRotulo} ancora={ponto(frame, PX0 - 0.15, qy(VALOR[0]) + 0.55)} />
      <div style={{ position: "absolute", left: 90, top: 54, fontFamily: FONTE_KIT, fontWeight: 900, fontSize: 44, color: COR.creme, opacity: progresso(frame, 2, 12) }}>
        TERRA: VALORIZA MUITO, PAGA POUCO
      </div>
      <div style={{ position: "absolute", left: 92, top: 110, fontFamily: FONTE_KIT, fontWeight: 600, fontSize: 16, letterSpacing: 1.2, color: COR.cremeSuave, opacity: progresso(frame, 6, 12) }}>
        ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS · MESMA ESCALA
      </div>
      {/* JR na moldura chanfrada (igual ao teste inicial) */}
      <div style={{ position: "absolute", left: MOLDURA.x, top: MOLDURA.y, width: MOLDURA.w, height: MOLDURA.h,
        opacity: entraJR, transform: `translateY(${(1 - entraJR) * 30}px)`, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.45))" }}>
        <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${poligono(MOLDURA)})`, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(video)} muted trimBefore={inicio} style={estiloJR(inicioSegundos + frame / fps)} />
        </div>
        <svg width={MOLDURA.w} height={MOLDURA.h} style={{ position: "absolute", inset: 0 }}>
          <polygon points={poligono(MOLDURA, 2).replace(/px/g, "")} fill="none" stroke={COR.creme} strokeWidth={2} />
          <polygon points={poligono(MOLDURA, 10).replace(/px/g, "")} fill="none" stroke={COR.creme} strokeOpacity={0.45} strokeWidth={1.5} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
