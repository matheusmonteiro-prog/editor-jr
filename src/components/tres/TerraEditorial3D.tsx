// JR 3D EDITORIAL WORLDS: Estudo C (híbrido 2D/3D), 13/11/2026. Pedido do Matheus a partir de um prompt
// de direção de arte (ChatGPT) + pesquisa: cenário 3D sofisticado para o impacto, gráfico 2D DE FRENTE para a
// leitura (perspectiva 3D distorce valores; ver docs/guia-3d.md, seção 6).
//
// Fala do JR (28/10, 159,8–164,8 s): "O dividendo é pouco, mas a valorização é grande."
// - Diorama de uma propriedade: relevo, lavoura em fileiras (instâncias), pasto, estrada de terra, árvores,
//   silos, corte do solo em camadas (incluindo terra roxa) sobre base grafite.
// - Gráfico conceitual, MESMA escala para os dois: linha do valor do patrimônio subindo x renda anual
//   em barrinhas que mal saem do chão. A renda sai da fazenda em pulsos periódicos (fluxo de caixa).
// Sem avatar nesta etapa (pedido). Sem números na tela (gráfico marcado como ilustração conceitual).
// Tudo pelo quadro do Remotion; proibido useFrame() (skill oficial, 3d.md).
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { FONTE_KIT, progresso } from "../v2/kitV3";
import { cores3D } from "./estilo3D";

export const terraEditorial3DSchema = z.object({
  voz: z.string().default("videos/2026-10-28-voz-wpe8-calma20.wav"),
  inicioSegundos: z.number().default(159.8),
  comVoz: z.boolean().default(true),
});
type Props = z.infer<typeof terraEditorial3DSchema>;

// ---------- Paleta DARK, "Cinematic Territory" ----------
// Cores do kit (padrão 13/11/2026): src/components/tres/estilo3D.ts
const c = cores3D("escuro");
const COR = { creme: c.texto, cremeSuave: c.textoSuave, ouro: c.ouro, verde: c.verde, base: c.base, card: c.card, fundo: c.fundo };

const W = 1920, H = 1080, FOV = 30, DESLOCA_X = 420;

import { altura, ARVORES, Arvore, criarBase, criarTerreno, Plantas, SILO, Silos } from "./dioramaFazenda";

// ---------- Câmera: revelação (desce e se aproxima), depois deriva lenta até parar ----------
const camera = (frame: number) => {
  const p = interpolate(frame, [0, 75], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  const deriva = interpolate(frame, [75, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ang = 0.92 - 0.3 * p - 0.05 * deriva;
  const raio = 19.5 - 3.2 * p - 0.3 * deriva;
  const alt = 11.5 - 3.6 * p - 0.15 * deriva;
  return { pos: new THREE.Vector3(Math.sin(ang) * raio, alt, Math.cos(ang) * raio), alvo: new THREE.Vector3(-0.2, -0.1, 0) };
};
const ajustar = (c: THREE.PerspectiveCamera, frame: number) => {
  const { pos, alvo } = camera(frame);
  c.position.copy(pos);
  c.lookAt(alvo);
  c.setViewOffset(W, H, DESLOCA_X, 0, W, H);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
};
const Camera: React.FC<{ frame: number }> = ({ frame }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  ajustar(cam, frame);
  return null;
};
const naTela = (frame: number, p: THREE.Vector3) => {
  const c = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
  ajustar(c, frame);
  const v = p.clone().project(c);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
};

const Cena: React.FC<{ frame: number }> = ({ frame }) => {
  const terreno = useMemo(criarTerreno, []);
  const base = useMemo(criarBase, []);
  return (
    <>
      <Camera frame={frame} />
      <color attach="background" args={[COR.fundo]} />
      <fog attach="fog" args={[COR.fundo, 22, 40]} />
      {/* Luz: céu/chão suaves + sol de fim de tarde (sombra macia) + recorte frio por trás */}
      <hemisphereLight args={["#DCE7F0", "#3A2C1E", 1.05]} />
      <directionalLight position={[7, 6.5, 5]} intensity={2.6} color="#FFE2B8" castShadow
        shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-radius={4}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight position={[-6, 4, -7]} intensity={0.9} color="#9FC3E0" />
      <mesh geometry={terreno} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
      </mesh>
      <mesh geometry={base} position={[0, -1.3, 0]} receiveShadow>
        <meshStandardMaterial color={COR.base} roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Chão do estúdio, quase invisível, só para a sombra de contato da base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.66, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={COR.fundo} roughness={1} />
      </mesh>
      <Plantas />
      {ARVORES.map(([x, z, s], i) => <Arvore key={i} x={x} z={z} s={s} />)}
      <Silos />
    </>
  );
};

// ---------- Gráfico 2D de frente (leitura sem distorção) ----------
const CARD = { x: 1110, y: 175, w: 720, h: 690 };
const PLOT = { x: 70, y: 175, w: 600, h: 380 }; // dentro do card
const ANOS = 8;
// Conceitual: patrimônio crescendo com aceleração; renda pequena e regular. MESMA escala vertical.
const VALOR = Array.from({ length: ANOS }, (_, i) => 1 + 0.2 * i + 0.028 * i * i);
const RENDA = VALOR.map((v) => v * 0.035);
const MAX = VALOR[ANOS - 1] * 1.08;
const px = (i: number) => PLOT.x + (i / (ANOS - 1)) * PLOT.w;
const py = (v: number) => PLOT.y + PLOT.h - (v / MAX) * PLOT.h;

// Quadros, presos à fala: "dividendo" f20, "pouco" f36–48, "valorização" f55, "grande" f81–100.
const T = { card: 12, renda: 22, linha: 55, compara: 100 };

const Grafico: React.FC<{ frame: number }> = ({ frame }) => {
  const entra = progresso(frame, T.card, 16);
  const pLinha = interpolate(frame, [T.linha, T.linha + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const comp = progresso(frame, T.compara, 18);
  const nPts = pLinha * (ANOS - 1);
  const pts = VALOR.map((v, i) => [px(i), py(v)] as const);
  let caminho = "";
  for (let i = 0; i <= Math.floor(nPts); i++) caminho += `${i === 0 ? "M" : "L"}${pts[i][0]},${pts[i][1]} `;
  if (nPts < ANOS - 1 && pLinha > 0) {
    const i = Math.floor(nPts), f = nPts - i;
    caminho += `L${pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f},${pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f}`;
  }
  const area = pLinha > 0 ? `${caminho} L${pts[Math.min(ANOS - 1, Math.ceil(nPts))][0] - (nPts < ANOS - 1 ? (pts[Math.ceil(nPts)][0] - pts[Math.floor(nPts)][0]) * (1 - (nPts % 1)) : 0)},${PLOT.y + PLOT.h} L${PLOT.x},${PLOT.y + PLOT.h} Z` : "";
  const ultimo = pts[ANOS - 1];
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, opacity: entra,
      transform: `translateX(${(1 - entra) * 40}px)`, background: COR.card, border: "1px solid rgba(242,235,221,0.14)",
      borderRadius: 22, boxShadow: "0 30px 60px rgba(0,0,0,0.45)", fontFamily: FONTE_KIT, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 44, top: 38, fontWeight: 900, fontSize: 38, color: COR.creme, letterSpacing: 0.3, lineHeight: 1.12 }}>
        TERRA: VALORIZA MUITO,<br />PAGA POUCO
      </div>
      <div style={{ position: "absolute", left: 46, top: 132, fontWeight: 600, fontSize: 17, color: COR.cremeSuave, letterSpacing: 1.2 }}>
        ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS
      </div>
      <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="areaV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COR.verde} stopOpacity={0.28} />
            <stop offset="1" stopColor={COR.verde} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* grade discreta e eixo do tempo (mesma escala para patrimônio e renda) */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={PLOT.y + PLOT.h * (1 - f)} y2={PLOT.y + PLOT.h * (1 - f)} stroke={COR.creme} strokeOpacity={0.07} />
        ))}
        <line x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={PLOT.y + PLOT.h} y2={PLOT.y + PLOT.h} stroke={COR.creme} strokeOpacity={0.45} strokeWidth={1.5} />
        {VALOR.map((_, i) => (
          <text key={i} x={px(i)} y={PLOT.y + PLOT.h + 30} fill={COR.cremeSuave} fontSize={15} fontWeight={600} textAnchor="middle">{`ANO ${i + 1}`}</text>
        ))}
        {/* RENDA: barrinhas periódicas, uma por ano */}
        {RENDA.map((r, i) => {
          const p = progresso(frame, T.renda + 12 + i * 4, 8);
          const hBar = (r / MAX) * PLOT.h * p;
          return <rect key={i} x={px(i) - 13} y={PLOT.y + PLOT.h - hBar} width={26} height={hBar} rx={2} fill={COR.ouro} opacity={0.95} />;
        })}
        {/* VALORIZAÇÃO: área + linha + marcadores */}
        {area && <path d={area} fill="url(#areaV)" />}
        {caminho && <path d={caminho} fill="none" stroke={COR.verde} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map(([x, y], i) => (i <= nPts + 0.001 && pLinha > 0) ? (
          <circle key={i} cx={x} cy={y} r={6} fill={COR.fundo} stroke={COR.verde} strokeWidth={3} />
        ) : null)}
        {/* Comparação: chave da valorização x marca da renda no último ano */}
        {comp > 0 && (
          <g opacity={comp}>
            <line x1={ultimo[0] + 30} x2={ultimo[0] + 30} y1={PLOT.y + PLOT.h} y2={PLOT.y + PLOT.h - (PLOT.y + PLOT.h - ultimo[1]) * comp} stroke={COR.verde} strokeWidth={2} />
            <line x1={ultimo[0] + 24} x2={ultimo[0] + 36} y1={ultimo[1]} y2={ultimo[1]} stroke={COR.verde} strokeWidth={2} />
          </g>
        )}
      </svg>
      {/* Rótulos da comparação (texto em HTML, nítido) */}
      <div style={{ position: "absolute", left: 46, top: PLOT.y + PLOT.h + 62, display: "flex", gap: 34, fontWeight: 800, fontSize: 21, letterSpacing: 0.6 }}>
        <span style={{ color: COR.verde, opacity: progresso(frame, T.linha, 12) }}>━ VALOR DO PATRIMÔNIO</span>
        <span style={{ color: COR.ouro, opacity: progresso(frame, T.renda + 10, 12) }}>▮ RENDA ANUAL</span>
      </div>
      <div style={{ position: "absolute", left: PLOT.x + 6, top: PLOT.y + 14, fontWeight: 900, fontSize: 30, color: COR.verde,
        opacity: comp, transform: `translateY(${(1 - comp) * 12}px)` }}>
        VALORIZAÇÃO: GRANDE
      </div>
      <div style={{ position: "absolute", left: PLOT.x + 300, top: PLOT.y + PLOT.h - 52, fontWeight: 900, fontSize: 24, color: COR.ouro,
        opacity: comp, transform: `translateY(${(1 - comp) * 12}px)` }}>
        RENDA: POUCA
      </div>
    </div>
  );
};

// Pulsos de renda: saem do silo (a produção) e caem na barra do ano no gráfico. Um por "ano".
const Pulsos: React.FC<{ frame: number }> = ({ frame }) => {
  const origem = naTela(frame, new THREE.Vector3(SILO.x, altura(SILO.x, SILO.z) + 1.0, SILO.z));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {RENDA.map((_, i) => {
        const ini = T.renda + i * 4;
        const t = interpolate(frame, [ini, ini + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.5, 0, 0.3, 1) });
        if (t <= 0 || t >= 1) return null;
        const dx = CARD.x + px(i), dy = CARD.y + PLOT.y + PLOT.h - 4;
        const cx = (origem.x + dx) / 2, cy = Math.min(origem.y, dy) - 160;
        const x = (1 - t) * (1 - t) * origem.x + 2 * (1 - t) * t * cx + t * t * dx;
        const y = (1 - t) * (1 - t) * origem.y + 2 * (1 - t) * t * cy + t * t * dy;
        return (<g key={i}><circle cx={x} cy={y} r={16} fill={COR.ouro} opacity={0.18} /><circle cx={x} cy={y} r={8} fill={COR.ouro} /></g>);
      })}
    </svg>
  );
};

export const TerraEditorial3D: React.FC<Props> = ({ voz, inicioSegundos, comVoz }) => {
  const frame = useCurrentFrame();
  const revela = progresso(frame, 0, 20);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      {comVoz && <Audio src={staticFile(voz)} trimBefore={Math.round(inicioSegundos * 30)} />}
      <AbsoluteFill style={{ opacity: revela }}>
        <ThreeCanvas width={W} height={H} shadows="soft" camera={{ fov: FOV, near: 0.1, far: 100 }}>
          <Cena frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* Vinheta suave para dar profundidade (não esconde nada da leitura) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <Pulsos frame={frame} />
      <Grafico frame={frame} />
    </AbsoluteFill>
  );
};
