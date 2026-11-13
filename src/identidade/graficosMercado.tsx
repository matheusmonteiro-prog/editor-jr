import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CURVA_T, F_FORTE, F_ROTULO, progresso } from "./estiloTerritorio";

// Peças do modelo 3 "Cartografia viva do capital" (12/11/2026, em teste).
// Gráficos CONCEITUAIS: os valores são gerados por código (semente fixa) só para desenhar a forma
// de um gráfico de bolsa. Nunca são cotações reais; toda tela que usa isto mostra o selo
// "DEMONSTRAÇÃO VISUAL · SEM DADOS REAIS".

export type Paleta = {
  texto: string;
  apagado: string;
  ouro: string;
  alta: string; // candle de alta (verde)
  baixa: string; // candle de baixa (vermelho controlado)
  terra: string;
  campo: string; // verde da folha na lavoura
};

export type Candle = { o: number; c: number; h: number; l: number; v: number };

const rnd = (s: number) => {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Passeio aleatório com tendência (tendencia > 0 sobe). Mesma semente = mesmo gráfico sempre.
export const gerarCandles = (n: number, semente: number, tendencia: number): Candle[] => {
  const lista: Candle[] = [];
  let preco = 100;
  for (let i = 0; i < n; i++) {
    const o = preco;
    const passo = (rnd(semente + i * 3.1) - 0.5) * 7 + tendencia;
    const c = o + passo;
    const h = Math.max(o, c) + rnd(semente + i * 5.7) * 3.2;
    const l = Math.min(o, c) - rnd(semente + i * 7.3) * 3.2;
    const v = 30 + rnd(semente + i * 2.3) * 50 + Math.abs(passo) * 6;
    lista.push({ o, c, h, l, v });
    preco = c;
  }
  return lista;
};

// Selo obrigatório dos gráficos conceituais.
export const SeloDemo: React.FC<{ x: number; y: number; cor: string }> = ({ x, y, cor }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: F_ROTULO, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: cor }}>DEMONSTRAÇÃO VISUAL · SEM DADOS REAIS</div>
);

// Marco de divisa (o marco de concreto que demarca a terra) usado como marcador de gráfico:
// poste com cruz gravada no topo e uma haste até o ponto marcado.
export const Marco: React.FC<{ x: number; y: number; cor: string; corTexto: string; rotulo?: string; de: number; haste?: number; lado?: "esq" | "dir" }> = ({
  x,
  y,
  cor,
  corTexto,
  rotulo,
  de,
  haste = 70,
  lado = "dir",
}) => {
  const f = useCurrentFrame();
  const p = progresso(f, de, 12);
  const topo = y - haste * p;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={x} y1={y} x2={x} y2={topo} stroke={cor} strokeWidth={3} />
      <circle cx={x} cy={y} r={7 * p} fill={cor} />
      <g transform={`translate(${x},${topo}) scale(${p})`} opacity={p}>
        <path d="M-15,0 L15,0 L11,-34 L-11,-34 Z" fill={cor} />
        <path d="M-6,-24 L6,-24 M0,-30 L0,-18" stroke={corTexto === "#1E1E1C" ? "#EFE8DA" : "#08170F"} strokeWidth={3} />
      </g>
      {rotulo ? (
        <text
          x={lado === "dir" ? x + 24 : x - 24}
          y={topo - 12}
          textAnchor={lado === "dir" ? "start" : "end"}
          fontFamily={F_FORTE}
          fontSize={32}
          fill={corTexto}
          opacity={progresso(f, de + 6, 8)}
        >
          {rotulo}
        </text>
      ) : null}
    </svg>
  );
};

// Gráfico de candles com volume e média móvel. Com "deCampo", começa como LAVOURA vista de cima
// (fileiras com folhas, solo marrom) e cada fileira vira um candle: a fileira encolhe até o pavio,
// o corpo cresce, a cor vira verde/vermelho, o solo dá lugar à grade.
export const GraficoCandles: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  dados: Candle[];
  de: number; // quadro em que as fileiras/candles começam a aparecer
  deCampo?: number; // quadro em que a lavoura começa a virar gráfico
  paleta: Paleta;
  alturaVolume?: number;
  media?: boolean;
}> = ({ x, y, w, h, dados, de, deCampo, paleta, alturaVolume = 90, media = true }) => {
  const f = useCurrentFrame();
  const n = dados.length;
  const max = Math.max(...dados.map((d) => d.h));
  const min = Math.min(...dados.map((d) => d.l));
  const vmax = Math.max(...dados.map((d) => d.v));
  const yv = (v: number) => y + ((max - v) / (max - min)) * h;
  const passo = w / n;
  const bw = passo * 0.56;
  const virar = (i: number) => (deCampo === undefined ? 1 : progresso(f, deCampo + i * 0.7, 14, CURVA_T));
  const fimMorf = (deCampo ?? de) + n * 0.7 + 14;
  const mGeral = deCampo === undefined ? 1 : progresso(f, deCampo, 18);
  const pMedia = progresso(f, fimMorf, 22, CURVA_T);
  const caminhoMedia = useMemo(() => {
    const pts: string[] = [];
    dados.forEach((_, i) => {
      if (i < 4) return;
      const m = dados.slice(i - 4, i + 1).reduce((a, d) => a + d.c, 0) / 5;
      pts.push(`${(x + (i + 0.5) * passo).toFixed(1)},${yv(m).toFixed(1)}`);
    });
    return `M${pts.join("L")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, x, y, w, h]);

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* solo da lavoura (some) e grade do gráfico (aparece) */}
      {deCampo !== undefined ? <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} rx={6} fill={paleta.terra} opacity={0.16 * (1 - mGeral) * progresso(f, de, 10)} /> : null}
      {[0, 0.25, 0.5, 0.75, 1].map((k) => (
        <line key={k} x1={x} x2={x + w} y1={y + k * h} y2={y + k * h} stroke={paleta.apagado} strokeWidth={1.2} strokeDasharray="4 8" opacity={mGeral * 0.6} />
      ))}
      {dados.map((d, i) => {
        const cx = x + (i + 0.5) * passo;
        const ap = progresso(f, de + i * 1.1, 8);
        const m = virar(i);
        const alta = d.c >= d.o;
        const cor = alta ? paleta.alta : paleta.baixa;
        const topoLinha = y + (yv(d.h) - y) * m;
        const baseLinha = y + h + (yv(d.l) - y - h) * m;
        const yb1 = yv(Math.max(d.o, d.c));
        const yb2 = yv(Math.min(d.o, d.c));
        const folhas = deCampo === undefined ? [] : Array.from({ length: Math.floor(h / 30) }, (_, k) => y + 14 + k * 30);
        const vol = progresso(f, fimMorf + i * 0.6, 10);
        return (
          <g key={i} opacity={ap}>
            {/* fileira da lavoura: haste e folhas */}
            {m < 1 ? (
              <g opacity={1 - m}>
                <line x1={cx} x2={cx} y1={topoLinha} y2={baseLinha} stroke={paleta.campo} strokeWidth={3} />
                {folhas.map((fy, k) => (
                  <ellipse key={k} cx={cx + (k % 2 === 0 ? -6 : 6)} cy={fy} rx={6} ry={3} fill={paleta.campo} transform={`rotate(${k % 2 === 0 ? -30 : 30} ${cx} ${fy})`} />
                ))}
              </g>
            ) : null}
            {/* candle: pavio e corpo */}
            <g opacity={m}>
              <line x1={cx} x2={cx} y1={topoLinha} y2={baseLinha} stroke={cor} strokeWidth={3} />
              <rect x={cx - (bw * m) / 2} y={yb1} width={bw * m} height={Math.max(3, yb2 - yb1)} fill={cor} rx={2} />
            </g>
            {/* volume */}
            <rect x={cx - bw / 2} y={y + h + 24 + alturaVolume * (1 - (d.v / vmax) * vol)} width={bw} height={alturaVolume * (d.v / vmax) * vol} fill={cor} opacity={0.45} />
          </g>
        );
      })}
      {media ? <path d={caminhoMedia} fill="none" stroke={paleta.ouro} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pMedia} /> : null}
      <text x={x + w} y={y + h + 24 + alturaVolume + 30} textAnchor="end" fontFamily={F_ROTULO} fontWeight={700} fontSize={19} letterSpacing={2} fill={paleta.apagado} opacity={alturaVolume > 0 ? mGeral : 0}>
        VOLUME
      </text>
      {media ? (
        <text x={x} y={y - 16} fontFamily={F_ROTULO} fontWeight={700} fontSize={19} letterSpacing={2} fill={paleta.ouro} opacity={pMedia}>
          ── MÉDIA MÓVEL
        </text>
      ) : null}
    </svg>
  );
};

// Corte do solo: a camada fina de cima é o que a terra "paga" (renda/dividendo); as camadas de baixo,
// grossas, são o valor que se acumula (valorização). Metáfora conceitual, sem números.
export const Estratos: React.FC<{ x: number; y: number; w: number; h: number; paleta: Paleta; deRenda: number; deValor: number }> = ({ x, y, w, h, paleta, deRenda, deValor }) => {
  const f = useCurrentFrame();
  const pr = progresso(f, deRenda, 12);
  const camadas = [
    { cor: "#A0623A", k: 0.24 },
    { cor: "#7A4526", k: 0.3 },
    { cor: "#5A311B", k: 0.34 },
  ];
  const topoSolo = y + 64;
  const altSolo = h - 64;
  let acc = 0;
  // superfície ondulada com a lavoura
  const sup = `M${x},${topoSolo} C${x + w * 0.25},${topoSolo - 14} ${x + w * 0.5},${topoSolo + 12} ${x + w * 0.75},${topoSolo - 8} S${x + w},${topoSolo + 4} ${x + w},${topoSolo}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <clipPath id="soloCorte">
          <rect x={x} y={topoSolo - 20} width={w} height={altSolo + 20} rx={8} />
        </clipPath>
      </defs>
      {/* camada fina de cima: a renda (dividendo) */}
      <g clipPath="url(#soloCorte)">
        <rect x={x} y={topoSolo - 20} width={w * pr} height={20 + altSolo * 0.08} fill={paleta.baixa} opacity={0.85} />
        {camadas.map((c, i) => {
          const y0 = topoSolo + altSolo * 0.08 + acc * altSolo;
          acc += c.k;
          const pv = progresso(f, deValor + (camadas.length - 1 - i) * 5, 12, CURVA_T);
          const alt = c.k * altSolo;
          return <rect key={i} x={x} y={y0 + alt * (1 - pv)} width={w} height={alt * pv + 1} fill={c.cor} />;
        })}
        {/* pedrinhas */}
        {Array.from({ length: 26 }, (_, k) => (
          <circle key={k} cx={x + rnd(k * 3.3) * w} cy={topoSolo + altSolo * (0.2 + rnd(k * 7.7) * 0.75)} r={3 + rnd(k) * 4} fill="#000" opacity={0.18 * progresso(f, deValor + 10, 10)} />
        ))}
      </g>
      <path d={sup} fill="none" stroke={paleta.campo} strokeWidth={4} opacity={progresso(f, 0, 10)} />
      {Array.from({ length: 18 }, (_, k) => {
        const px = x + 20 + (k * (w - 40)) / 17;
        return <path key={k} d={`M${px},${topoSolo - 4} l-6,-18 M${px},${topoSolo - 4} l6,-18 M${px},${topoSolo - 4} l0,-24`} stroke={paleta.campo} strokeWidth={3} opacity={progresso(f, 2 + k * 0.5, 8)} />;
      })}
      {/* seta de valor acumulado, do fundo para cima */}
      <g opacity={progresso(f, deValor + 14, 10)}>
        <line x1={x + w + 30} y1={y + h} x2={x + w + 30} y2={y + h - (h - 90) * progresso(f, deValor + 14, 18, CURVA_T)} stroke={paleta.alta} strokeWidth={6} />
        <path d={`M${x + w + 16},${y + 110} L${x + w + 30},${y + 86} L${x + w + 44},${y + 110} Z`} fill={paleta.alta} opacity={progresso(f, deValor + 30, 6)} />
      </g>
    </svg>
  );
};
