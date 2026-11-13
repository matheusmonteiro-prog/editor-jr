import React, { useMemo } from "react";

// Curvas de nível (mapa topográfico) desenhadas por código: a "assinatura" da identidade Território.
// desenho: 0 a 1 (linhas se desenhando). Determinístico: mesma semente, mesmo desenho.
type Centro = { x: number; y: number; r: number; aneis: number; semente: number };

const ruido = (s: number) => {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const caminho = (c: Centro, k: number) => {
  const raio = (c.r * (k + 1)) / c.aneis;
  const fases = [0, 1, 2, 3].map((i) => ruido(c.semente * 7 + i) * Math.PI * 2);
  const pts: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const d =
      1 +
      0.16 * Math.sin(2 * a + fases[0] + k * 0.25) +
      0.09 * Math.sin(3 * a + fases[1] - k * 0.2) +
      0.05 * Math.sin(5 * a + fases[2] + k * 0.4) +
      0.03 * Math.sin(7 * a + fases[3]);
    pts.push(`${(c.x + Math.cos(a) * raio * d * 1.25).toFixed(1)},${(c.y + Math.sin(a) * raio * d).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
};

export const CurvasDeNivel: React.FC<{
  largura: number;
  altura: number;
  centros: Centro[];
  cor: string;
  opacidade?: number;
  desenho?: number;
  espessura?: number;
  destaque?: string; // cor da curva "mestra" (a cada 4)
}> = ({ largura, altura, centros, cor, opacidade = 1, desenho = 1, espessura = 1.4, destaque }) => {
  const linhas = useMemo(() => centros.flatMap((c, ci) => Array.from({ length: c.aneis }, (_, k) => ({ d: caminho(c, k), mestra: k % 4 === 3, chave: `${ci}-${k}` }))), [centros]);
  return (
    <svg width={largura} height={altura} style={{ position: "absolute", left: 0, top: 0, opacity: opacidade }}>
      {linhas.map((l) => (
        <path
          key={l.chave}
          d={l.d}
          fill="none"
          stroke={l.mestra && destaque ? destaque : cor}
          strokeWidth={l.mestra ? espessura * 1.8 : espessura}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - desenho}
        />
      ))}
    </svg>
  );
};
