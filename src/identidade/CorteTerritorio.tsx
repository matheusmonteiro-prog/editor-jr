import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FONTES } from "../cortes/fontes";
import { avisoEmDuasLinhas } from "../components/cortes/estiloCortes";
import { normalizar, SFX, VozTrecho } from "../cortes/CorteCurto";
import { corteSchema, montarLinha, paraCorte, seg } from "../cortes/receita";
import { COR_T, CURVA_T, F_FORTE, F_ROTULO, F_TEXTO, F_TITULO, progresso } from "./estiloTerritorio";
import { CurvasDeNivel } from "./CurvasDeNivel";

// PROTÓTIPO v2 (12/11/2026): identidade "Território" aplicada ao MESMO conteúdo do corte aprovado
// 2810-01b (mesmos trechos, mesma voz). Não mexe no CorteDividido. Só vertical (1080x1920).
// v2, pedidos do Matheus: fontes modernas (Archivo Black / Space Mono), JR enquadrado com chapéu e
// rosto (sem zoom exagerado), janelas maiores, sombreado de baixo mais leve, legenda em maiúsculas
// com palavras-chave coloridas, toques modernos (título cinético, marca-texto, punch-in, barra de
// progresso, grão).

export const corteTerritorioSchema = z.object({
  video: z.string(),
  corte: corteSchema,
  volumeMusica: z.number().min(0).max(0.3).default(0.06),
  arroba: z.string().default("jroinvestidorsertanejo"),
  logo: z.string().default("images/logo-jr.png"),
  aviso: z.string().default("Este conteúdo tem caráter exclusivamente educacional."),
});
type Props = z.infer<typeof corteTerritorioSchema>;

const W = 1080;
type Rect = [number, number, number, number]; // x, y, largura, altura (px)
type Foco = [number, number]; // centro x (fração da fonte 16:9) e zoom

// Enquadramentos. A imagem sempre começa no topo da fonte (o chapéu aparece inteiro) e nunca mostra
// a parte de baixo da fonte (textos antigos do v1). Caixas quase quadradas = chapéu e rosto inteiros.
const LAYOUT: Record<string, { r: Rect; f: Foco }> = {
  abertura: { r: [0, 640, 1080, 1080], f: [0.49, 1] }, // JR dominante, chamada em cima
  loteBaixo: { r: [0, 820, 1080, 900], f: [0.49, 1] }, // quadro em cima, JR embaixo
  janela: { r: [40, 880, 620, 620], f: [0.49, 1] }, // infográfico domina, JR em janela à esquerda
  janelaDir: { r: [420, 880, 620, 620], f: [0.49, 1] }, // comparação, JR à direita
  close: { r: [0, 560, 1080, 1160], f: [0.49, 1.12] }, // frase forte: rosto um pouco maior
  alto: { r: [500, 360, 540, 580], f: [0.49, 1] }, // JR no alto à direita, gráfico largo embaixo
  regua: { r: [0, 620, 1080, 900], f: [0.49, 1] }, // volta ao JR em plano mais aberto, régua em cima
  fecho: { r: [230, 880, 620, 620], f: [0.49, 1] }, // encerramento: pergunta domina
};
const FONTE_UTIL = 0.62; // fração de cima da fonte que pode aparecer

// Momentos de ênfase (tempo do vídeo longo): a câmera dá um "punch-in" leve.
const ENFASE = [201.28, 209.37, 214.2, 176.96, 181.02, 221.9];

// Palavras-chave da legenda: a cor diz o assunto.
const CHAVE: Record<string, string> = {
  terra: COR_T.terra,
  soja: COR_T.terra,
  boi: COR_T.terra,
  fazenda: COR_T.terra,
  megasena: COR_T.ouroClaro,
  loteria: COR_T.ouroClaro,
  sozinho: COR_T.ouroClaro,
  maioria: COR_T.ouroClaro,
  investidor: COR_T.ouroClaro,
  benchmark: COR_T.ouroClaro,
  sim: COR_T.verde,
  valorizacao: COR_T.verde,
  bastante: COR_T.verde,
  crescimento: COR_T.verde,
  acoes: COR_T.verde,
  nao: COR_T.terracota,
  dividendo: COR_T.terracota,
  dividendos: COR_T.terracota,
  pouco: COR_T.terracota,
};

type Q = (t: number) => number; // tempo do vídeo longo -> quadro dentro da cena

// ---------- Tipografia cinética ----------
type Trecho = { t: string; cor?: string; caixa?: boolean };
// Título em Archivo Black maiúsculo; cada palavra entra com escala e desfoque (3 quadros entre elas).
// "caixa": marca-texto dourado que passa por trás da palavra.
const Titulo: React.FC<{ de: number; linhas: Trecho[][]; tam: number; x: number; y: number; passo?: number }> = ({ de, linhas, tam, x, y, passo = 3 }) => {
  const f = useCurrentFrame();
  let n = 0;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {linhas.map((linha, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", gap: `0 ${tam * 0.24}px`, marginBottom: tam * 0.06 }}>
          {linha.flatMap((tr, ti) =>
            tr.t.split(" ").map((palavra, pi) => {
              const ini = de + n++ * passo;
              const p = progresso(f, ini, 10);
              const pc = tr.caixa ? progresso(f, ini + 6, 8, CURVA_T) : 0;
              return (
                <span
                  key={`${ti}-${pi}`}
                  style={{
                    fontFamily: F_FORTE,
                    fontSize: tam,
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                    letterSpacing: -0.5,
                    color: tr.caixa ? (pc > 0.45 ? COR_T.profundo : COR_T.creme) : (tr.cor ?? COR_T.creme),
                    opacity: p,
                    transform: `translateY(${(1 - p) * tam * 0.35}px) scale(${1 + (1 - p) * 0.12})`,
                    filter: `blur(${(1 - p) * 8}px)`,
                    display: "inline-block",
                    padding: tr.caixa ? `0 ${tam * 0.12}px` : undefined,
                    backgroundImage: tr.caixa ? `linear-gradient(${COR_T.ouroClaro}, ${COR_T.ouroClaro})` : undefined,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${pc * 100}% 100%`,
                  }}
                >
                  {palavra}
                </span>
              );
            }),
          )}
        </div>
      ))}
    </div>
  );
};

const Rotulo: React.FC<{ de: number; texto: string; x: number; y: number; cor?: string; tamanho?: number }> = ({ de, texto, x, y, cor = COR_T.ouro, tamanho = 26 }) => {
  const f = useCurrentFrame();
  const p = progresso(f, de, 12);
  const letras = Math.round(texto.length * p);
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: F_ROTULO, fontWeight: 700, fontSize: tamanho, letterSpacing: 4, color: cor, whiteSpace: "nowrap" }}>
      {texto.slice(0, letras)}
      {p < 1 && p > 0 ? <span style={{ color: COR_T.ouroClaro }}>▌</span> : null}
    </div>
  );
};

const traco = (f: number, de: number, dur = 18) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progresso(f, de, dur, CURVA_T) });
const Aparece: React.FC<{ de: number; children: React.ReactNode; style: React.CSSProperties }> = ({ de, children, style }) => {
  const f = useCurrentFrame();
  const p = progresso(f, de, 10);
  return <div style={{ position: "absolute", opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${1 + (1 - p) * 0.1})`, filter: `blur(${(1 - p) * 6}px)`, ...style }}>{children}</div>;
};

// ---------- Cenas (o mesmo conteúdo do 2810-01b) ----------
const CenaAbertura: React.FC<{ q: Q }> = ({ q }) => (
  <AbsoluteFill>
    <Rotulo de={0} texto="CORTE 01 · TERRA × BOLSA" x={64} y={170} />
    <Titulo de={2} x={64} y={220} tam={112} linhas={[[{ t: "Ganhou na" }], [{ t: "Mega‑Sena?", caixa: true }]]} />
    <Aparece de={q(201.28)} style={{ left: 64, top: 492 }}>
      <div style={{ fontFamily: F_ROTULO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COR_T.creme, border: `2px solid ${COR_T.ouro}`, padding: "6px 16px" }}>SOZINHO</div>
    </Aparece>
  </AbsoluteFill>
);

const Parcela: React.FC<{ de: number; pts: [number, number][]; padrao: string; cor: string; nome: string; apoio?: string; lx: number; ly: number }> = ({
  de,
  pts,
  padrao,
  cor,
  nome,
  apoio,
  lx,
  ly,
}) => {
  const f = useCurrentFrame();
  const d = `M${pts.map((p) => p.join(",")).join("L")}Z`;
  const pf = progresso(f, de + 10, 12);
  const pl = progresso(f, de + 6, 10);
  return (
    <g>
      <path d={d} fill={`url(#${padrao})`} opacity={pf * 0.9} />
      <path d={d} fill="none" stroke={cor} strokeWidth={4} strokeLinejoin="round" {...traco(f, de)} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={6} fill={COR_T.ouro} opacity={progresso(f, de + i * 2, 6)} />
      ))}
      <g opacity={pl} transform={`translate(${lx},${ly + (1 - pl) * 12})`}>
        <text fontFamily={F_FORTE} fontSize={46} letterSpacing={2} fill={COR_T.creme} textAnchor="middle">
          {nome}
        </text>
        {apoio ? (
          <text y={36} fontFamily={F_ROTULO} fontWeight={700} fontSize={22} letterSpacing={3} fill={COR_T.cremeApagado} textAnchor="middle">
            {apoio}
          </text>
        ) : null}
      </g>
    </g>
  );
};

const CenaTerra: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="SE FOSSE VOCÊ" x={64} y={150} />
      <Titulo de={2} x={64} y={195} tam={80} linhas={[[{ t: "Compraria" }, { t: "terra?", cor: COR_T.terra }]]} />
      <svg width={W} height={520} style={{ position: "absolute", left: 0, top: 300 }}>
        <defs>
          <pattern id="hTerra" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="22" stroke={COR_T.terra} strokeWidth="3" opacity="0.6" />
          </pattern>
          <pattern id="hSoja" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <line x1="0" y1="0" x2="26" y2="0" stroke={COR_T.verde} strokeWidth="4" opacity="0.5" />
          </pattern>
          <pattern id="hBoi" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="3" fill={COR_T.creme} opacity="0.45" />
            <circle cx="23" cy="22" r="3" fill={COR_T.creme} opacity="0.45" />
          </pattern>
        </defs>
        <Parcela de={q(205.56)} pts={[[70, 40], [470, 14], [520, 270], [440, 470], [60, 420]]} padrao="hTerra" cor={COR_T.terra} nome="TERRA" apoio="fazenda" lx={285} ly={250} />
        <Parcela de={q(206.03)} pts={[[560, 30], [1010, 60], [1002, 230], [578, 226]]} padrao="hSoja" cor={COR_T.verde} nome="SOJA" lx={785} ly={150} />
        <Parcela de={q(206.6)} pts={[[580, 262], [1010, 272], [1014, 470], [470, 482], [546, 380]]} padrao="hBoi" cor={COR_T.creme} nome="BOI" lx={795} ly={390} />
        <g transform="translate(1030,-14)" opacity={progresso(f, 4, 12)}>
          <path d="M0,0 L10,30 L0,22 L-10,30 Z" fill={COR_T.ouro} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const CenaMaioria: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  const cols = 8;
  const total = 40;
  const cheios = 31; // proporção ilustrativa de "a maioria", sem número de pesquisa
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="PERGUNTA AO PÚBLICO" x={64} y={150} />
      <Titulo de={2} x={64} y={195} tam={72} linhas={[[{ t: "A" }, { t: "maioria", cor: COR_T.ouroClaro }], [{ t: "responderia…" }]]} />
      <svg width={W} height={460} style={{ position: "absolute", left: 0, top: 380 }}>
        {Array.from({ length: total }, (_, i) => {
          const cx = 118 + (i % cols) * 120;
          const cy = 36 + Math.floor(i / cols) * 88;
          const pr = progresso(f, 6 + i * 0.9, 8);
          const pc = progresso(f, 26 + i * 1.1, 8);
          return (
            <g key={i} opacity={pr}>
              <circle cx={cx} cy={cy} r={24} fill="none" stroke={COR_T.cremeApagado} strokeWidth={2.5} />
              {i < cheios ? <circle cx={cx} cy={cy} r={24 * pc} fill={COR_T.ouro} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 64, top: 820, fontFamily: F_ROTULO, fontSize: 20, letterSpacing: 2, color: COR_T.cremeApagado, opacity: progresso(f, 30, 10) }}>
        ilustração · sem número de pesquisa
      </div>
      <Aparece de={q(209.37)} style={{ left: 690, top: 1020 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 150, color: COR_T.verde, letterSpacing: -2 }}>SIM</div>
      </Aparece>
    </AbsoluteFill>
  );
};

const CenaBalanca: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  const dv = q(213.1);
  const vz = q(214.2);
  const hBarra = 110 * progresso(f, dv, 14);
  const perfil = "M580,780 L640,740 L690,752 L750,660 L800,680 L860,520 L910,540 L1010,280";
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="TERRA · O QUE ELA PAGA" x={64} y={150} />
      <div style={{ position: "absolute", left: 539, top: 210, width: 0, height: 600, borderLeft: `2px dashed ${COR_T.ouro}`, opacity: progresso(f, 2, 10) * 0.7 }} />
      <Rotulo de={2} texto="DIVIDENDO" x={64} y={220} cor={COR_T.creme} tamanho={34} />
      <div style={{ position: "absolute", left: 64, top: 780, width: 410, height: 3, backgroundColor: COR_T.cremeApagado }} />
      <div style={{ position: "absolute", left: 196, top: 780 - hBarra, width: 150, height: hBarra, backgroundColor: COR_T.terracota }} />
      <Aparece de={dv + 6} style={{ left: 120, top: 540 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 86, color: COR_T.terracota }}>POUCO</div>
      </Aparece>
      <Rotulo de={6} texto="VALORIZAÇÃO" x={580} y={220} cor={COR_T.creme} tamanho={34} />
      <svg width={W} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`${perfil} L1010,780 L580,780 Z`} fill={COR_T.verde} opacity={progresso(f, vz + 12, 12) * 0.18} />
        <path d={perfil} fill="none" stroke={COR_T.verde} strokeWidth={6} strokeLinejoin="round" {...traco(f, vz, 22)} />
        <circle cx={1010} cy={280} r={11} fill={COR_T.ouro} opacity={progresso(f, vz + 18, 6)} />
      </svg>
      <Aparece de={vz + 8} style={{ left: 580, top: 300 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 70, color: COR_T.verde }}>BASTANTE</div>
      </Aparece>
      {/* legenda de mapa, ao lado da janela do JR */}
      <div style={{ position: "absolute", left: 64, top: 960, fontFamily: F_ROTULO, fontWeight: 700, fontSize: 26, lineHeight: 2, color: COR_T.creme, opacity: progresso(f, vz + 14, 12) }}>
        <div>
          <span style={{ display: "inline-block", width: 26, height: 18, backgroundColor: COR_T.terracota, marginRight: 14 }} />
          paga pouco
        </div>
        <div>
          <span style={{ display: "inline-block", width: 26, height: 5, backgroundColor: COR_T.verde, marginRight: 14, verticalAlign: "middle" }} />
          valoriza
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Citação: único lugar com a serifa (Fraunces), para marcar a "fala do JR".
const CenaFrase: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  const p1 = progresso(f, q(176.96), 12);
  const p2 = progresso(f, q(178.6), 12);
  const estilo: React.CSSProperties = { fontFamily: F_TITULO, fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: COR_T.creme, letterSpacing: -1 };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 64, top: 160, width: 5, height: 300 * progresso(f, 0, 16), backgroundColor: COR_T.ouro }} />
      <div style={{ position: "absolute", left: 100, top: 160 }}>
        <div style={{ ...estilo, opacity: p1, filter: `blur(${(1 - p1) * 6}px)` }}>
          “<span style={{ fontStyle: "italic", fontWeight: 600, color: COR_T.terracota }}>Não sou</span> investidor
        </div>
        <div style={{ ...estilo, opacity: p2, filter: `blur(${(1 - p2) * 6}px)` }}>em dividendos.”</div>
      </div>
      <Rotulo de={q(178.74) + 4} texto="— JR" x={100} y={420} />
    </AbsoluteFill>
  );
};

const CenaCrescimento: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  const cr = q(181.02);
  const dv = q(182.19);
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="PREFERÊNCIA DO JR" x={64} y={150} />
      <Titulo de={Math.max(0, q(180.37) - 6)} x={64} y={195} tam={58} passo={4} linhas={[[{ t: "Ações de" }], [{ t: "crescimento", cor: COR_T.verde }]]} />
      <svg width={W} height={1520} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M64,1000 L64,1460 L1016,1460" fill="none" stroke={COR_T.cremeApagado} strokeWidth={2.5} {...traco(f, 2, 14)} />
        <path d="M64,1450 C330,1430 560,1360 720,1220 S900,1040 1000,1010" fill="none" stroke={COR_T.verde} strokeWidth={8} strokeLinecap="round" {...traco(f, cr, 22)} />
        <circle cx={1000} cy={1010} r={12} fill={COR_T.ouro} opacity={progresso(f, cr + 18, 6)} />
        <path d="M64,1400 L1000,1372" fill="none" stroke={COR_T.terracota} strokeWidth={5} strokeDasharray="16 12" opacity={progresso(f, dv, 10)} />
        <text x={640} y={1356} fontFamily={F_FORTE} fontSize={34} fill={COR_T.terracota} opacity={progresso(f, dv + 4, 10)}>
          DIVIDENDOS
        </text>
        <text x={600} y={1010} fontFamily={F_FORTE} fontSize={34} fill={COR_T.verde} opacity={progresso(f, cr + 14, 10)}>
          CRESCIMENTO
        </text>
      </svg>
      <div style={{ position: "absolute", left: 64, top: 965, fontFamily: F_ROTULO, fontSize: 20, color: COR_T.cremeApagado, opacity: progresso(f, 10, 10) }}>ilustrativo · sem escala · tempo →</div>
    </AbsoluteFill>
  );
};

const CenaRegua: React.FC<{ q: Q }> = ({ q }) => {
  const f = useCurrentFrame();
  const pm = progresso(f, q(221.11), 12);
  const segs = 6;
  const larg = 952;
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="A RÉGUA DO JR" x={64} y={150} />
      <Titulo de={2} x={64} y={195} tam={76} linhas={[[{ t: "A" }, { t: "terra", cor: COR_T.terra }, { t: "é o" }], [{ t: "benchmark.", caixa: true }]]} />
      <div style={{ position: "absolute", left: 64, top: 470, width: larg, height: 18, display: "flex", border: `2px solid ${COR_T.creme}` }}>
        {Array.from({ length: segs }, (_, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: i % 2 === 0 ? COR_T.creme : "transparent", opacity: progresso(f, 4 + i * 2, 8) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 64 + larg * 0.5 - 80, top: 392, width: 160, textAlign: "center", opacity: pm, transform: `translateY(${(1 - pm) * -20}px)` }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 32, color: COR_T.terra }}>TERRA</div>
        <svg width={160} height={30}>
          <path d="M60,4 L100,4 L80,28 Z" fill={COR_T.terra} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const CenaFecho: React.FC<{ q: Q }> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="E VOCÊ?" x={64} y={160} />
      <Titulo de={2} x={64} y={205} tam={124} passo={4} linhas={[[{ t: "Terra", cor: COR_T.terra }], [{ t: "ou" }, { t: "Bolsa?", cor: COR_T.verde }]]} />
      <svg width={W} height={300} style={{ position: "absolute", left: 0, top: 540 }}>
        <path d="M70,40 L300,20 L340,170 L280,280 L60,250 Z" fill="none" stroke={COR_T.terra} strokeWidth={4} {...traco(f, 10)} />
        <path d="M720,270 C820,250 880,180 920,110 S980,30 1010,20" fill="none" stroke={COR_T.verde} strokeWidth={6} strokeLinecap="round" {...traco(f, 14)} />
        <path d="M720,280 L1016,280" stroke={COR_T.cremeApagado} strokeWidth={2} {...traco(f, 12)} />
      </svg>
    </AbsoluteFill>
  );
};

type Cena = { de: number; layout: keyof typeof LAYOUT; C: React.FC<{ q: Q }> };
const CENAS: Cena[] = [
  { de: 199.52, layout: "abertura", C: CenaAbertura },
  { de: 204.55, layout: "loteBaixo", C: CenaTerra },
  { de: 207.02, layout: "janela", C: CenaMaioria },
  { de: 211.92, layout: "janelaDir", C: CenaBalanca },
  { de: 176.8, layout: "close", C: CenaFrase },
  { de: 179.72, layout: "alto", C: CenaCrescimento },
  { de: 220.45, layout: "regua", C: CenaRegua },
];

// ---------- Legenda: MAIÚSCULAS, grupos curtos, palavra-chave colorida, palavra da vez ressaltada ----------
type Palavra = { texto: string; ini: number; fim: number; cor?: string };
const Legenda: React.FC<{ grupos: Palavra[][] }> = ({ grupos }) => {
  const f = useCurrentFrame();
  const g = grupos.find((gr) => f >= gr[0].ini && f < gr[gr.length - 1].fim + 6);
  if (!g) return null;
  const pg = progresso(f, g[0].ini, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 1540,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 0,
        opacity: pg,
        transform: `translateY(${(1 - pg) * 14}px)`,
      }}
    >
      {g.map((p, i) => {
        const ativa = f >= p.ini && f < p.fim;
        const pa = ativa ? progresso(f, p.ini, 4) : 0;
        const cor = p.cor ?? (ativa ? COR_T.ouroClaro : COR_T.creme);
        return (
          <span
            key={i}
            style={{
              fontFamily: F_TEXTO,
              fontWeight: 800,
              fontSize: 58,
              textTransform: "uppercase",
              color: cor,
              display: "inline-block",
              margin: "0 15px",
              transform: `scale(${1 + pa * 0.08})`,
              textShadow: "0 4px 0 rgba(0,0,0,0.35), 0 0 22px rgba(0,0,0,0.75)",
              borderBottom: `5px solid ${ativa ? cor : "transparent"}`,
              lineHeight: 1.15,
            }}
          >
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Rodapé: aviso (início e fim) e logo + @ no meio ----------
const Rodape: React.FC<{ aviso: string; arroba: string; logo: string }> = ({ aviso, arroba, logo }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: D } = useVideoConfig();
  const T = Math.round(3.6 * fps);
  const E = 15;
  const ini = 5;
  const fim1 = ini + T;
  const ini2 = D - T - E;
  const sobe = (a: number) => 1 - progresso(f, a, E);
  const desce = (a: number) => progresso(f, a, E, CURVA_T);
  const avisoY = f < fim1 ? sobe(ini) : f < ini2 ? desce(fim1) : sobe(ini2);
  const marcaY = f < fim1 ? 1 : f < ini2 ? sobe(fim1 + 6) : desce(ini2 - 6);
  const camada = (y: number): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `translateY(${y * 130}px)`,
    opacity: 1 - y,
  });
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1715, height: 150, overflow: "hidden" }}>
      <div style={camada(marcaY)}>
        <div style={{ width: 70, height: 2, backgroundColor: COR_T.ouro, marginRight: 22 }} />
        <Img src={staticFile(logo)} style={{ height: 78, width: 78, objectFit: "contain", marginRight: 16 }} />
        <div style={{ fontFamily: F_FORTE, fontSize: 30, letterSpacing: 1, color: COR_T.creme }}>@{arroba.toUpperCase()}</div>
        <div style={{ width: 70, height: 2, backgroundColor: COR_T.ouro, marginLeft: 22 }} />
      </div>
      <div style={camada(avisoY)}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `2px solid ${COR_T.ouro}`, paddingTop: 14 }}>
          <div style={{ fontFamily: F_FORTE, fontSize: 30, letterSpacing: 2, color: COR_T.profundo, backgroundColor: COR_T.ouroClaro, padding: "6px 14px" }}>AVISO</div>
          <div style={{ fontFamily: F_ROTULO, fontWeight: 700, fontSize: 33, lineHeight: 1.12, color: COR_T.creme, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {avisoEmDuasLinhas(aviso).map((l, i) => (l ? <div key={i}>{l}</div> : null))}
          </div>
        </div>
      </div>
      <Sequence from={ini}>
        <Audio src={staticFile("sfx/papel/aviso-sobe.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={ini2}>
        <Audio src={staticFile("sfx/papel/aviso-sobe.wav")} volume={0.28} />
      </Sequence>
    </div>
  );
};

const Saida: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [frames - 6, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// Grão de filme bem leve (acabamento "premium", tira o ar de tela de computador).
const Grao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={W} height={1920}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 6} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Composição ----------
export const CorteTerritorio: React.FC<Props> = ({ video, corte, volumeMusica, arroba, logo, aviso }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: total } = useVideoConfig();
  const fonte = FONTES[video];
  const linha = useMemo(() => montarLinha(corte), [corte]);
  const ultimo = linha[linha.length - 1];
  const fimFala = ultimo.inicio + ultimo.frames;

  const cenas = useMemo(() => {
    const lista = CENAS.map((c) => ({ ...c, ini: paraCorte(linha, c.de) ?? 0 }));
    lista.push({ de: 0, layout: "fecho", C: CenaFecho, ini: fimFala });
    return lista;
  }, [linha, fimFala]);
  const enfases = useMemo(() => ENFASE.map((t) => paraCorte(linha, t)).filter((v): v is number => v !== null), [linha]);

  // Enquadramento atual: o lote desliza de um layout para o outro em 16 quadros.
  let i = 0;
  cenas.forEach((c, k) => {
    if (frame >= c.ini) i = k;
  });
  const atual = LAYOUT[cenas[i].layout];
  const antes = LAYOUT[cenas[Math.max(0, i - 1)].layout];
  const p = i === 0 ? 1 : progresso(frame, cenas[i].ini, 16, CURVA_T);
  const mix = (a: number, b: number) => a + (b - a) * p;
  const [x, y, w, h] = atual.r.map((v, k) => mix(antes.r[k], v));
  const [cx, zoomBase] = atual.f.map((v, k) => mix(antes.f[k], v));
  // punch-in: +5% na palavra de ênfase, volta devagar
  const punch = frame >= fimFala ? 0 : Math.max(0, ...enfases.map((e) => interpolate(frame - e, [0, 4, 30], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const s = Math.max(w / 1920, h / (1080 * FONTE_UTIL)) * zoomBase * (1 + punch * 0.05);
  const vw = 1920 * s;
  const left = Math.min(0, Math.max(w - vw, w / 2 - cx * vw));
  const larga = w > 1000;
  const fadeTopo = interpolate(w, [700, 1080], [0, 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moldura = interpolate(w, [1000, 1060], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // topo da fonte: chapéu sempre inteiro
  const estiloVideo: React.CSSProperties = { position: "absolute", left, top: 0, width: vw, height: 1080 * s };

  // Legenda em grupos curtos (até 4 palavras, quebra na pontuação ou na pausa).
  const grupos = useMemo(() => {
    const corr = corte.legenda?.correcoes ?? {};
    const lista: Palavra[] = [];
    for (const tr of linha) {
      for (const pl of fonte.palavras) {
        const t0 = pl.startMs / 1000;
        if (t0 < tr.de || t0 >= tr.ate) continue;
        const bruto = pl.text.trim();
        const pont = bruto.match(/[.,?!]+$/)?.[0] ?? "";
        const c = corr[normalizar(bruto)];
        const texto = c !== undefined ? c.replace("-", "‑") + pont : bruto;
        const ini = tr.inicio + seg(t0) - seg(tr.de);
        const fim = tr.inicio + seg(Math.min(pl.endMs / 1000, tr.ate)) - seg(tr.de);
        lista.push({ texto, ini, fim: Math.max(ini + 1, fim), cor: CHAVE[normalizar(texto)] });
      }
    }
    const gs: Palavra[][] = [];
    let atualG: Palavra[] = [];
    lista.forEach((pl, k) => {
      const anterior = lista[k - 1];
      const quebra = atualG.length >= 4 || (anterior !== undefined && (/[.,?!]$/.test(anterior.texto) || pl.ini - anterior.fim > 10));
      if (quebra && atualG.length) {
        gs.push(atualG);
        atualG = [];
      }
      atualG.push(pl);
    });
    if (atualG.length) gs.push(atualG);
    return gs.map((g, k) => (gs[k + 1] ? g.map((pl, j) => (j === g.length - 1 ? { ...pl, fim: Math.min(pl.fim, gs[k + 1][0].ini - 6) } : pl)) : g));
  }, [linha, fonte.palavras, corte.legenda]);

  const desloc = interpolate(frame, [0, total], [0, -120]);
  const mascara = `linear-gradient(to bottom, transparent 0px, #000 ${fadeTopo}px, #000 calc(100% - ${fadeTopo}px), transparent 100%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: COR_T.profundo }}>
      {/* Mapa de fundo: curvas de nível que se desenham na abertura e derivam devagar */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 30% 20%, ${COR_T.floresta} 0%, ${COR_T.profundo} 75%)` }} />
      <AbsoluteFill style={{ transform: `translate(${desloc + i * -18}px, ${i * 10}px)` }}>
        <CurvasDeNivel
          largura={W + 300}
          altura={1920}
          cor={COR_T.creme}
          destaque={COR_T.ouro}
          opacidade={0.16}
          desenho={progresso(frame, 0, 45, CURVA_T)}
          centros={[
            { x: 860, y: 330, r: 620, aneis: 13, semente: 3 },
            { x: 120, y: 1250, r: 520, aneis: 10, semente: 8 },
          ]}
        />
      </AbsoluteFill>
      {Array.from({ length: 11 }, (_, k) => (
        <div key={k} style={{ position: "absolute", left: 0, top: 150 + k * 160, width: 18, height: 2, backgroundColor: COR_T.ouro, opacity: 0.5 }} />
      ))}

      {/* JR no lote */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          overflow: "hidden",
          borderRadius: larga ? 0 : 10,
          maskImage: larga ? mascara : undefined,
          WebkitMaskImage: larga ? mascara : undefined,
        }}
      >
        {linha.map((t) => (
          <Sequence key={t.indice} from={t.inicio} durationInFrames={t.frames} name={`Trecho ${t.indice + 1}`}>
            <div style={estiloVideo}>
              <OffthreadVideo src={staticFile(fonte.cameraSrc)} muted trimBefore={seg(t.de)} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          </Sequence>
        ))}
        {corte.segurarFim > 0 ? (
          <Sequence from={fimFala} name="Imagem parada">
            <Freeze frame={0}>
              <div style={estiloVideo}>
                <OffthreadVideo src={staticFile(fonte.cameraSrc)} muted trimBefore={seg(ultimo.ate) - 1} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>
            </Freeze>
          </Sequence>
        ) : null}
      </div>
      {linha.map((t) => (
        <Sequence key={`v${t.indice}`} from={t.inicio} durationInFrames={t.frames} name={`Voz ${t.indice + 1}`}>
          <VozTrecho src={fonte.vozSrc} t={t} />
        </Sequence>
      ))}

      {/* moldura do lote: fio dourado e marcos nos cantos (só quando o JR está em janela) */}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `2px solid ${COR_T.ouro}`, borderRadius: 10, opacity: moldura }} />
      {!larga
        ? [
            [x - 14, y - 14, 1, 1],
            [x + w + 14, y - 14, -1, 1],
            [x - 14, y + h + 14, 1, -1],
            [x + w + 14, y + h + 14, -1, -1],
          ].map(([mx, my, sx, sy], k) => (
            <svg key={k} width={40} height={40} style={{ position: "absolute", left: mx - 20, top: my - 20, opacity: moldura }}>
              <path d={`M20,${20 + 16 * sy} L20,20 L${20 + 16 * sx},20`} fill="none" stroke={COR_T.creme} strokeWidth={3} />
            </svg>
          ))
        : null}

      {/* Sombra leve só atrás da legenda e do rodapé (não cobre o JR) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, bottom: 0, background: "linear-gradient(to bottom, rgba(8,23,15,0) 0%, rgba(8,23,15,0.55) 45%, rgba(8,23,15,0.85) 100%)" }} />

      {/* Conteúdo de cada cena */}
      {cenas.map((c, k) => {
        const fimCena = k + 1 < cenas.length ? cenas[k + 1].ini : total;
        const q: Q = (t) => (paraCorte(linha, t) ?? c.ini) - c.ini;
        const C = c.C;
        return (
          <Sequence key={k} from={c.ini} durationInFrames={Math.max(1, fimCena - c.ini)} name={`Cena ${k + 1}: ${c.layout}`}>
            <Saida frames={fimCena - c.ini}>
              <C q={q} />
            </Saida>
            {k > 0 ? <Audio src={staticFile(SFX.whoosh)} volume={0.12} /> : null}
          </Sequence>
        );
      })}

      {/* Varredura: fio dourado que cruza a tela na troca de enquadramento */}
      {i > 0 && frame - cenas[i].ini < 14 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            top: interpolate(frame - cenas[i].ini, [0, 14], [120, 1480]),
            backgroundColor: COR_T.ouroClaro,
            opacity: interpolate(frame - cenas[i].ini, [0, 3, 11, 14], [0, 0.8, 0.8, 0]),
            boxShadow: `0 0 18px ${COR_T.ouro}`,
          }}
        />
      ) : null}

      <Sequence durationInFrames={fimFala} name="Legenda">
        <Legenda grupos={grupos} />
      </Sequence>
      {corte.quadroFecho?.faixa ? (
        <Sequence from={fimFala + 6} name="Faixa do fecho">
          <Legenda grupos={[[{ texto: corte.quadroFecho.faixa, ini: 0, fim: 999, cor: COR_T.ouroClaro }]]} />
        </Sequence>
      ) : null}

      <Rodape aviso={aviso} arroba={arroba} logo={logo} />

      {/* Barra de progresso fina no topo (o público vê que o vídeo é curto) */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: (W * frame) / Math.max(1, total - 1), backgroundColor: COR_T.ouro }} />
      <Grao />

      {fonte.musicaSrc ? (
        <Audio
          src={staticFile(fonte.musicaSrc)}
          trimBefore={seg(8)}
          volume={(fr) => volumeMusica * interpolate(fr, [0, 15, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
    </AbsoluteFill>
  );
};
