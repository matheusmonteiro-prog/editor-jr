// Diorama da fazenda do JR (13/11/2026): terreno com relevo e corte do solo (terra roxa), lavoura instanciada,
// árvores, silos. Compartilhado pelos estudos 3D (TerraEditorial3D, TerraCamadas3D). Tudo determinístico.
import React, { useMemo } from "react";
import * as THREE from "three";

// ---------- Ruído determinístico (mesmo resultado em todo quadro e todo render) ----------
export const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
export const suave = (t: number) => t * t * (3 - 2 * t);
export const ruido = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  const u = suave(xf), v = suave(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x: number, y: number) => {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 4; i++) { s += amp * ruido(x * f, y * f); f *= 2.03; amp *= 0.5; }
  return s;
};

// ---------- Forma do terreno: retângulo de cantos orgânicos (superelipse com borda irregular) ----------
export const A = 4.4, B = 3.1, N = 4.5;
export const raioBorda = (ang: number) => {
  const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
  const r = Math.pow(Math.pow(c / A, N) + Math.pow(s / B, N), -1 / N);
  return r * (1 + 0.035 * (fbm(Math.cos(ang) * 2 + 7, Math.sin(ang) * 2 + 3) - 0.5) * 2);
};
export const ESTRADA = (x: number) => 1.75 + 0.32 * Math.sin(x * 0.7 + 0.6);
export const naEstrada = (x: number, z: number) => Math.abs(z - ESTRADA(x)) < 0.13;
export const naLavoura = (x: number, z: number) => x > -3.7 && x < 1.3 && z > -2.35 && z < 1.35;
export const altura = (x: number, z: number) => {
  let y = 0.42 * (fbm(x * 0.28 + 11, z * 0.28 + 5) - 0.5) + 0.12 * Math.sin(x * 0.45 + 0.4) * Math.cos(z * 0.5);
  if (naLavoura(x, z)) y *= 0.55; // lavoura em área mais plana
  if (naEstrada(x, z)) y -= 0.035; // estrada levemente rebaixada
  return y;
};

export const mistura = (c1: string, c2: string, t: number) => new THREE.Color(c1).lerp(new THREE.Color(c2), Math.min(1, Math.max(0, t)));

// Superfície de cima + parede com o corte do solo (camadas), montadas em anéis polares.
export const criarTerreno = (partes: "tudo" | "topo" | "solo" = "tudo") => {
  const NA = 240, NR = 70, NP = 28, FUNDO = -1.35;
  const pos: number[] = [], cor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NR; i++) {
    for (let j = 0; j < NA; j++) {
      const ang = (j / NA) * Math.PI * 2, k = i / NR, r = raioBorda(ang) * k;
      const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
      let y = altura(x, z);
      if (k > 0.94) y -= (k - 0.94) * 0.9; // borda arredondada
      pos.push(x, y, z);
      let c: THREE.Color;
      if (naEstrada(x, z)) c = mistura("#8C6A45", "#A88560", fbm(x * 3, z * 3));
      else if (naLavoura(x, z)) {
        const sulco = 0.5 + 0.5 * Math.sin(z * (Math.PI * 2) / 0.19);
        c = mistura("#3A2618", "#5A3E26", sulco * 0.8 + 0.2 * fbm(x * 4, z * 4));
      } else {
        const t = fbm(x * 0.9 + 3, z * 0.9 + 9);
        c = mistura("#3F6B30", "#7A9450", t);
        if (fbm(x * 2.2, z * 2.2) > 0.68) c.lerp(new THREE.Color("#9A9050"), 0.45); // pasto mais seco
      }
      cor.push(c.r, c.g, c.b);
    }
  }
  if (partes !== "solo") for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) {
    const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = (i + 1) * NA + j, d = (i + 1) * NA + ((j + 1) % NA);
    idx.push(a, b, c, b, d, c);
  }
  // Parede: do topo da borda até o fundo, com camadas de solo de contorno irregular.
  const base = pos.length / 3, anel = NR * NA;
  for (let p = 0; p <= NP; p++) {
    for (let j = 0; j < NA; j++) {
      const ox = pos[(anel + j) * 3], oy = pos[(anel + j) * 3 + 1], oz = pos[(anel + j) * 3 + 2];
      const y = oy + (FUNDO - oy) * (p / NP);
      pos.push(ox, y, oz);
      const prof = oy - y + 0.08 * (fbm(j * 0.08, p * 0.3) - 0.5);
      let c: THREE.Color;
      if (prof < 0.1) c = new THREE.Color("#3A2A1C");
      else if (prof < 0.55) c = mistura("#6E2A1A", "#82351F", fbm(j * 0.2, p)); // terra roxa
      else if (prof < 0.95) c = mistura("#A2643A", "#B87A48", fbm(j * 0.15, p * 2));
      else c = mistura("#5E5A54", "#77726A", hash(j, p));
      cor.push(c.r, c.g, c.b);
    }
  }
  if (partes !== "topo") for (let p = 0; p < NP; p++) for (let j = 0; j < NA; j++) {
    const a = base + p * NA + j, b = base + p * NA + ((j + 1) % NA);
    const c = base + (p + 1) * NA + j, d = base + (p + 1) * NA + ((j + 1) % NA);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(cor, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

// Base grafite (pedestal editorial) com o mesmo contorno, um pouco maior.
export const criarBase = () => {
  const s = new THREE.Shape();
  for (let j = 0; j <= 200; j++) {
    const ang = (j / 200) * Math.PI * 2, r = raioBorda(ang) * 1.07;
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    if (j === 0) s.moveTo(x, z); else s.lineTo(x, z);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 4 });
  g.rotateX(Math.PI / 2);
  return g;
};

// Lavoura: plantas em fileiras sobre o relevo (uma única malha instanciada, rápida).
export const criarPlantas = () => {
  const lista: { x: number; y: number; z: number; s: number; c: THREE.Color }[] = [];
  for (let z = -2.28; z < 1.3; z += 0.19) {
    for (let x = -3.65; x < 1.25; x += 0.062) {
      const jx = x + (hash(x * 9, z * 7) - 0.5) * 0.03;
      const ang = Math.atan2(z, jx);
      if (Math.hypot(jx, z) > raioBorda(ang) * 0.9 || naEstrada(jx, z)) continue;
      const s = 0.75 + 0.5 * hash(jx * 3, z * 5);
      lista.push({ x: jx, y: altura(jx, z), z, s, c: mistura("#2C5E27", "#5B9440", hash(jx * 13, z * 17) * 0.8 + fbm(jx, z) * 0.3) });
    }
  }
  return lista;
};

export const ARVORES: [number, number, number][] = [
  [-3.9, -1.6, 1.0], [-3.6, -2.3, 0.85], [2.0, -2.5, 1.1], [2.6, -2.2, 0.9], [3.3, -1.7, 1.05],
  [3.7, -0.9, 0.8], [-2.6, 2.45, 0.9], [-1.9, 2.7, 0.75],
];

export const Plantas: React.FC = () => {
  const lista = useMemo(criarPlantas, []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.042, 1), []);
  const ref = React.useCallback((m: THREE.InstancedMesh | null) => {
    if (!m) return;
    const o = new THREE.Object3D();
    lista.forEach((p, i) => {
      o.position.set(p.x, p.y + 0.05 * p.s, p.z);
      o.scale.set(p.s, p.s * 1.7, p.s);
      o.rotation.set(0, hash(p.x, p.z) * 6, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, p.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [lista]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, lista.length]} castShadow receiveShadow>
      <meshStandardMaterial roughness={0.85} />
    </instancedMesh>
  );
};

export const Arvore: React.FC<{ x: number; z: number; s: number }> = ({ x, z, s }) => {
  const y = altura(x, z);
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.44, 8]} />
        <meshStandardMaterial color="#4A3524" roughness={0.9} />
      </mesh>
      {[[0, 0.55, 0, 0.26], [0.13, 0.48, 0.06, 0.2], [-0.12, 0.5, -0.05, 0.21]].map(([cx, cy, cz, r], i) => (
        <mesh key={i} position={[cx, cy, cz]} castShadow receiveShadow>
          <icosahedronGeometry args={[r, 2]} />
          <meshStandardMaterial color={i === 0 ? "#2E5A2A" : "#3B6B31"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Silos de metal escovado + galpão: dão escala e são a "saída" da renda.
export const SILO = { x: 2.55, z: 0.95 };
export const Silos: React.FC = () => {
  const y = altura(SILO.x, SILO.z);
  return (
    <group position={[SILO.x, y, SILO.z]}>
      {[[0, 0], [0.5, 0.12]].map(([dx, dz], i) => (
        <group key={i} position={[dx, 0, dz]}>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.76, 40]} />
            <meshStandardMaterial color="#CDD1D3" metalness={0.35} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.84, 0]} castShadow>
            <coneGeometry args={[0.21, 0.18, 40]} />
            <meshStandardMaterial color="#B9BDBF" metalness={0.35} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.55, 0.16, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.32, 0.38]} />
        <meshStandardMaterial color="#D9D2C2" roughness={0.8} />
      </mesh>
      <mesh position={[-0.55, 0.38, 0.05]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.66, 0.06, 0.44]} />
        <meshStandardMaterial color="#7A2F22" roughness={0.6} />
      </mesh>
    </group>
  );
};
