import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FONTES } from "../cortes/fontes";
import { avisoEmDuasLinhas } from "../components/cortes/estiloCortes";
import { normalizar, SFX, VozTrecho } from "../cortes/CorteCurto";
import { corteSchema, montarLinha, paraCorte, seg, type CenaCarto, type PecaCarto } from "../cortes/receita";
import { COR_T, CURVA_T, F_FORTE, F_ROTULO, F_TEXTO, F_TITULO, progresso } from "./estiloTerritorio";
import { CurvasDeNivel } from "./CurvasDeNivel";
import { Estratos, GraficoCandles, gerarCandles, Marco, SeloDemo, type Paleta } from "./graficosMercado";

// MODELO 3 (12/11/2026, EM TESTE): "Cartografia viva do capital" = fusão do papel explicativo
// (2810-01b, aprovado) com o Território (aprovado). Mesmo conteúdo do 2810-01b.
// - Dois ambientes da mesma identidade: DIA (papel de carta topográfica, para explicar o campo) e
//   NOITE (mapa verde-floresta, para a Bolsa). A troca é uma cortina com fio dourado.
// - Bolsa reconhecível: candles com pavio, volume e média móvel (conceituais, com selo).
// - Campo vira mercado: a lavoura vista de cima vira gráfico de candles; o corte do solo mostra a
//   renda (camada fina) e o valor acumulado (camadas grossas); o marco de divisa vira marcador.
// Não mexe no CorteDividido nem no CorteTerritorio.

export const corteCartografiaSchema = z.object({
  video: z.string(),
  corte: corteSchema,
  volumeMusica: z.number().min(0).max(0.3).default(0.06),
  arroba: z.string().default("jroinvestidorsertanejo"),
  logo: z.string().default("images/logo-jr.png"),
  aviso: z.string().default("Este conteúdo tem caráter exclusivamente educacional."),
  // Decisão do Matheus (12/11): cada vídeo usa UM ambiente só, do começo ao fim.
  // "verde" = mapa verde-floresta; "branco" = papel de carta topográfica.
  ambiente: z.enum(["verde", "branco"]).default("verde"),
  // "horizontal" = trecho explicativo do vídeo longo (16:9): mapa à esquerda (1080 px), JR à direita.
  formato: z.enum(["vertical", "horizontal"]).default("vertical"),
  // Centro horizontal do JR na fonte (0 a 1).
  xPadrao: z.number().min(0).max(1).default(0.49),
  // Trecho dentro do longo: sem voz, sem música, sem rodapé (aviso, logo e @ ficam no início e no fim do longo).
  modoLongo: z.boolean().default(false),
});
type Props = z.infer<typeof corteCartografiaSchema>;

const W = 1080;

// ---------- Ambientes ----------
type Tema = Paleta & { nome: "dia" | "noite"; destaque: string; caixa: string; caixaTexto: string; moldura: string };
const NOITE: Tema = {
  nome: "noite",
  texto: COR_T.creme,
  apagado: COR_T.cremeApagado,
  ouro: COR_T.ouro,
  destaque: COR_T.ouroClaro,
  alta: COR_T.verde,
  baixa: COR_T.terracota,
  terra: COR_T.terra,
  campo: "#8DBF6A",
  caixa: COR_T.ouroClaro,
  caixaTexto: COR_T.profundo,
  moldura: COR_T.ouro,
};
const PAPEL = "#EFE8DA";
const DIA: Tema = {
  nome: "dia",
  texto: "#1E1E1C",
  apagado: "rgba(30,30,28,0.5)",
  ouro: "#9A7430",
  destaque: "#0F2A1D",
  alta: "#1F7A47",
  baixa: "#C8432B",
  terra: "#8E4813",
  campo: "#4E7A2E",
  caixa: "#E2C285",
  caixaTexto: "#1E1E1C",
  moldura: "#1E1E1C",
};

// ---------- Enquadramentos (iguais ao Território v2: chapéu sempre inteiro) ----------
type Rect = [number, number, number, number];
const LAYOUT: Record<string, Rect> = {
  abertura: [0, 640, 1080, 1080],
  loteBaixo: [0, 820, 1080, 900],
  janela: [40, 880, 620, 620],
  janelaDir: [420, 880, 620, 620],
  close: [0, 560, 1080, 1160],
  alto: [500, 330, 540, 560],
  fecho: [230, 880, 620, 620],
};
const ZOOM: Record<string, number> = { close: 1.12 };
const FONTE_UTIL = 0.62;
const ENFASE = [201.28, 209.37, 214.2, 176.96, 181.02, 221.9];

const CHAVE: Record<string, keyof Paleta | "destaque"> = {
  terra: "terra",
  soja: "terra",
  boi: "terra",
  fazenda: "terra",
  megasena: "destaque",
  loteria: "destaque",
  sozinho: "destaque",
  maioria: "destaque",
  investidor: "destaque",
  benchmark: "destaque",
  sim: "alta",
  valorizacao: "alta",
  bastante: "alta",
  crescimento: "alta",
  acoes: "alta",
  nao: "baixa",
  dividendo: "baixa",
  dividendos: "baixa",
  pouco: "baixa",
};

type Q = (t: number) => number;
type CenaProps = { q: Q; t: Tema };

// ---------- Tipografia ----------
type Trecho = { t: string; cor?: string; caixa?: boolean };
const Titulo: React.FC<{ de: number; linhas: Trecho[][]; tam: number; x: number; y: number; tema: Tema; passo?: number }> = ({ de, linhas, tam, x, y, tema, passo = 3 }) => {
  const f = useCurrentFrame();
  let n = 0;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {linhas.map((linha, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", gap: `0 ${tam * 0.24}px`, marginBottom: tam * 0.06 }}>
          {linha.flatMap((tr, ti) =>
            tr.t.split(" ").map((palavra, pi) => {
              const p = progresso(f, de + n++ * passo, 10);
              const pc = tr.caixa ? progresso(f, de + (n - 1) * passo + 6, 8, CURVA_T) : 0;
              return (
                <span
                  key={`${ti}-${pi}`}
                  style={{
                    fontFamily: F_FORTE,
                    fontSize: tam,
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                    letterSpacing: -0.5,
                    color: tr.caixa ? (pc > 0.45 ? tema.caixaTexto : tema.texto) : (tr.cor ?? tema.texto),
                    opacity: p,
                    transform: `translateY(${(1 - p) * tam * 0.35}px) scale(${1 + (1 - p) * 0.12})`,
                    filter: `blur(${(1 - p) * 8}px)`,
                    display: "inline-block",
                    padding: tr.caixa ? `0 ${tam * 0.12}px` : undefined,
                    backgroundImage: tr.caixa ? `linear-gradient(${tema.caixa}, ${tema.caixa})` : undefined,
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

const Rotulo: React.FC<{ de: number; texto: string; x: number; y: number; cor: string; tamanho?: number }> = ({ de, texto, x, y, cor, tamanho = 26 }) => {
  const f = useCurrentFrame();
  const p = progresso(f, de, 12);
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: F_ROTULO, fontWeight: 700, fontSize: tamanho, letterSpacing: 4, color: cor, whiteSpace: "nowrap" }}>
      {texto.slice(0, Math.round(texto.length * p))}
      {p < 1 && p > 0 ? "▌" : null}
    </div>
  );
};

const Aparece: React.FC<{ de: number; children: React.ReactNode; style: React.CSSProperties }> = ({ de, children, style }) => {
  const f = useCurrentFrame();
  const p = progresso(f, de, 10);
  return <div style={{ position: "absolute", opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${1 + (1 - p) * 0.1})`, filter: `blur(${(1 - p) * 6}px)`, ...style }}>{children}</div>;
};

const traco = (f: number, de: number, dur = 18) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progresso(f, de, dur, CURVA_T) });

// ---------- Cenas ----------
const CenaAbertura: React.FC<CenaProps> = ({ q, t }) => (
  <AbsoluteFill>
    <Rotulo de={0} texto="CORTE 01 · TERRA × BOLSA" x={64} y={170} cor={t.ouro} />
    <Titulo de={2} x={64} y={220} tam={112} tema={t} linhas={[[{ t: "Ganhou na" }], [{ t: "Mega‑Sena?", caixa: true }]]} />
    <Aparece de={q(201.28)} style={{ left: 64, top: 492 }}>
      <div style={{ fontFamily: F_ROTULO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: t.texto, border: `2px solid ${t.ouro}`, padding: "6px 16px" }}>SOZINHO</div>
    </Aparece>
  </AbsoluteFill>
);

// Dia: a terra desenhada a nanquim no papel (talhões com hachura de plantio).
const Talhao: React.FC<{ de: number; pts: [number, number][]; cor: string; nome: string; t: Tema; lx: number; ly: number; hachura: "linhas" | "pontos" | "diagonal" }> = ({
  de,
  pts,
  cor,
  nome,
  t,
  lx,
  ly,
  hachura,
}) => {
  const f = useCurrentFrame();
  const d = `M${pts.map((p) => p.join(",")).join("L")}Z`;
  const id = `h-${nome}`;
  return (
    <g>
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform={hachura === "diagonal" ? "rotate(35)" : hachura === "linhas" ? "rotate(-10)" : undefined}>
          {hachura === "pontos" ? <circle cx="8" cy="8" r="3" fill={cor} opacity="0.55" /> : <line x1="0" y1="0" x2={hachura === "linhas" ? 22 : 0} y2={hachura === "linhas" ? 0 : 22} stroke={cor} strokeWidth="3" opacity="0.5" />}
        </pattern>
      </defs>
      <path d={d} fill={`url(#${id})`} opacity={progresso(f, de + 10, 12)} />
      <path d={d} fill="none" stroke={cor} strokeWidth={4} strokeLinejoin="round" {...traco(f, de)} />
      <text x={lx} y={ly} textAnchor="middle" fontFamily={F_FORTE} fontSize={46} fill={t.texto} opacity={progresso(f, de + 6, 10)}>
        {nome}
      </text>
    </g>
  );
};

const CenaTerra: React.FC<CenaProps> = ({ q, t }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="FOLHA DE CAMPO · SE FOSSE VOCÊ" x={64} y={150} cor={t.ouro} />
      <Titulo de={2} x={64} y={195} tam={80} tema={t} linhas={[[{ t: "Compraria" }, { t: "terra?", cor: t.terra }]]} />
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(0,300)">
          <Talhao de={q(205.56)} pts={[[70, 40], [470, 14], [520, 270], [440, 470], [60, 420]]} cor={t.terra} nome="TERRA" t={t} lx={285} ly={260} hachura="diagonal" />
          <Talhao de={q(206.03)} pts={[[560, 30], [1010, 60], [1002, 230], [578, 226]]} cor={t.alta} nome="SOJA" t={t} lx={785} ly={160} hachura="linhas" />
          <Talhao de={q(206.6)} pts={[[580, 262], [1010, 272], [1014, 470], [470, 482], [546, 380]]} cor={t.texto} nome="BOI" t={t} lx={795} ly={400} hachura="pontos" />
          <g transform="translate(1030,-14)" opacity={progresso(f, 4, 12)}>
            <path d="M0,0 L10,30 L0,22 L-10,30 Z" fill={t.ouro} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const CenaMaioria: React.FC<CenaProps> = ({ q, t }) => {
  const f = useCurrentFrame();
  const cheios = 31; // proporção ilustrativa de "a maioria", sem número de pesquisa
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="PERGUNTA AO PÚBLICO" x={64} y={150} cor={t.ouro} />
      <Titulo de={2} x={64} y={195} tam={72} tema={t} linhas={[[{ t: "A" }, { t: "maioria", cor: t.terra }], [{ t: "responderia…" }]]} />
      <svg width={W} height={460} style={{ position: "absolute", left: 0, top: 380 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const cx = 118 + (i % 8) * 120;
          const cy = 36 + Math.floor(i / 8) * 88;
          const pc = progresso(f, 26 + i * 1.1, 8);
          return (
            <g key={i} opacity={progresso(f, 6 + i * 0.9, 8)}>
              <circle cx={cx} cy={cy} r={24} fill="none" stroke={t.apagado} strokeWidth={2.5} />
              {i < cheios ? <circle cx={cx} cy={cy} r={24 * pc} fill={t.alta} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 64, top: 820, fontFamily: F_ROTULO, fontSize: 20, letterSpacing: 2, color: t.apagado, opacity: progresso(f, 30, 10) }}>ilustração · sem número de pesquisa</div>
      <Aparece de={q(209.37)} style={{ left: 690, top: 1020 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 150, color: t.alta, letterSpacing: -2 }}>SIM</div>
      </Aparece>
    </AbsoluteFill>
  );
};

// Corte do solo: renda fina em cima, valor grosso embaixo.
const CenaSolo: React.FC<CenaProps> = ({ q, t }) => {
  const f = useCurrentFrame();
  const dv = q(213.1);
  const vz = q(214.2);
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="CORTE DO SOLO · O QUE A TERRA PAGA" x={64} y={150} cor={t.ouro} />
      <Estratos x={64} y={190} w={880} h={620} paleta={t} deRenda={dv} deValor={vz} />
      <Aparece de={dv + 4} style={{ left: 90, top: 300 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 40, color: "#FBF8F1", textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>DIVIDENDO: POUCO</div>
      </Aparece>
      <Aparece de={vz + 10} style={{ left: 90, top: 560 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 64, color: "#FBF8F1", lineHeight: 1, textShadow: "0 3px 10px rgba(0,0,0,0.45)" }}>
          VALORIZAÇÃO:
          <br />
          <span style={{ color: "#9FE0A8" }}>BASTANTE</span>
        </div>
      </Aparece>
      <div style={{ position: "absolute", left: 64, top: 960, fontFamily: F_ROTULO, fontWeight: 700, fontSize: 24, lineHeight: 1.9, color: t.texto, opacity: progresso(f, vz + 20, 12) }}>
        <div>
          <span style={{ display: "inline-block", width: 26, height: 12, backgroundColor: t.baixa, marginRight: 14 }} />
          renda de cima: fina
        </div>
        <div>
          <span style={{ display: "inline-block", width: 26, height: 22, backgroundColor: "#7A4526", marginRight: 14, verticalAlign: "middle" }} />
          valor de baixo: grosso
        </div>
        <div style={{ fontSize: 18, color: t.apagado, marginTop: 6 }}>metáfora · sem escala</div>
      </div>
    </AbsoluteFill>
  );
};

const CenaFrase: React.FC<CenaProps> = ({ q, t }) => {
  const f = useCurrentFrame();
  const p1 = progresso(f, q(176.96), 12);
  const p2 = progresso(f, q(178.6), 12);
  const estilo: React.CSSProperties = { fontFamily: F_TITULO, fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: t.texto, letterSpacing: -1 };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 64, top: 160, width: 5, height: 300 * progresso(f, 0, 16), backgroundColor: t.ouro }} />
      <div style={{ position: "absolute", left: 100, top: 160 }}>
        <div style={{ ...estilo, opacity: p1, filter: `blur(${(1 - p1) * 6}px)` }}>
          “<span style={{ fontStyle: "italic", fontWeight: 600, color: t.baixa }}>Não sou</span> investidor
        </div>
        <div style={{ ...estilo, opacity: p2, filter: `blur(${(1 - p2) * 6}px)` }}>em dividendos.”</div>
      </div>
      <Rotulo de={q(178.74) + 4} texto="— JR" x={100} y={420} cor={t.ouro} />
    </AbsoluteFill>
  );
};

// A virada: a lavoura vista de cima vira gráfico de candles (crescimento).
const DADOS_CRESC = gerarCandles(20, 11, 1.6);
const CenaCrescimento: React.FC<CenaProps> = ({ q, t }) => {
  const f = useCurrentFrame();
  const cr = q(181.02);
  const dv = q(182.19);
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="DA LAVOURA À BOLSA" x={64} y={150} cor={t.ouro} />
      <Titulo de={Math.max(0, q(180.37) - 6)} x={64} y={195} tam={56} passo={4} tema={t} linhas={[[{ t: "Ações de" }], [{ t: "crescimento", cor: t.alta }]]} />
      <GraficoCandles x={90} y={1010} w={900} h={290} dados={DADOS_CRESC} de={0} deCampo={cr - 10} paleta={t} alturaVolume={60} />
      <Marco x={90 + 900 - 22} y={1010} cor={t.ouro} corTexto={t.alta} rotulo="CRESCIMENTO" de={cr + 34} haste={36} lado="esq" />
      <Aparece de={dv} style={{ left: 64, top: 1446 }}>
        <div style={{ fontFamily: F_FORTE, fontSize: 30, color: t.baixa }}>DIVIDENDOS: NÃO É O FOCO DO JR</div>
      </Aparece>
      <SeloDemo x={64} y={1404} cor={t.apagado} />
      <div style={{ position: "absolute", left: 64, top: 940, fontFamily: F_ROTULO, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: t.campo, opacity: 1 - progresso(f, cr, 12) }}>LAVOURA VISTA DE CIMA</div>
    </AbsoluteFill>
  );
};

// Benchmark: candles da Bolsa medidos contra a régua da terra.
const DADOS_BENCH = gerarCandles(22, 4, 0.7);
const CenaRegua: React.FC<CenaProps> = ({ q, t }) => {
  const max = Math.max(...DADOS_BENCH.map((d) => d.h));
  const min = Math.min(...DADOS_BENCH.map((d) => d.l));
  const yRegua = 400 + ((max - (min + (max - min) * 0.45)) / (max - min)) * 260;
  const f = useCurrentFrame();
  const pr = progresso(f, q(221.11), 16, CURVA_T);
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="A RÉGUA DO JR" x={64} y={150} cor={t.ouro} />
      <Titulo de={2} x={64} y={195} tam={70} tema={t} linhas={[[{ t: "A" }, { t: "terra", cor: t.terra }, { t: "é o" }, { t: "benchmark.", caixa: true }]]} />
      <GraficoCandles x={110} y={400} w={880} h={260} dados={DADOS_BENCH} de={4} paleta={t} alturaVolume={0} media={false} />
      <svg width={W} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={110} x2={110 + 880 * pr} y1={yRegua} y2={yRegua} stroke={t.terra} strokeWidth={5} strokeDasharray="18 10" />
      </svg>
      <Marco x={110} y={yRegua} cor={t.terra} corTexto={t.terra} rotulo="TERRA = RÉGUA" de={q(221.11)} haste={150} />
      <SeloDemo x={110} y={700} cor={t.apagado} />
    </AbsoluteFill>
  );
};

const DADOS_FECHO = gerarCandles(10, 21, 1.4);
const CenaFecho: React.FC<CenaProps> = ({ t }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo de={0} texto="E VOCÊ?" x={64} y={160} cor={t.ouro} />
      <Titulo de={2} x={64} y={205} tam={124} passo={4} tema={t} linhas={[[{ t: "Terra", cor: t.terra }], [{ t: "ou" }, { t: "Bolsa?", cor: t.alta }]]} />
      <svg width={W} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M70,580 L300,560 L340,710 L280,820 L60,790 Z" fill="none" stroke={t.terra} strokeWidth={4} {...traco(f, 10)} />
      </svg>
      <GraficoCandles x={640} y={560} w={380} h={200} dados={DADOS_FECHO} de={12} paleta={t} alturaVolume={0} media={false} />
    </AbsoluteFill>
  );
};

// ---------- Cenas descritas na RECEITA (modelo 2, padrão novo de 12/11/2026) ----------
// As posições vêm em frações do "painel": a faixa livre onde o JR não está. Vale no 9:16 e no 16:9.
type Painel = { top: number; h: number };
const PAINEL_V: Record<string, Painel> = {
  abertura: { top: 120, h: 500 },
  loteBaixo: { top: 120, h: 660 },
  janela: { top: 120, h: 740 },
  janelaDir: { top: 120, h: 740 },
  close: { top: 120, h: 420 },
  alto: { top: 930, h: 600 },
  fecho: { top: 120, h: 740 },
};
const PAINEL_H: Painel = { top: 40, h: 740 };
// No 16:9 o JR fica à direita e o mapa ocupa os 1080 px da esquerda.
const JR_H: Rect = [1080, 0, 840, 1080];

const corDe = (t: Tema, nome: unknown): string => {
  if (typeof nome === "string" && nome.startsWith("#")) return nome;
  const v = (t as unknown as Record<string, unknown>)[typeof nome === "string" ? nome : "texto"];
  return typeof v === "string" ? v : t.texto;
};
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const TENDENCIA: Record<string, number> = { sobe: 1.6, lateral: 0.2, cai: -1.4 };

const lerTitulo = (linhas: string[][], t: Tema): Trecho[][] =>
  linhas.map((l) =>
    l.map((s) => {
      const i = s.lastIndexOf(":");
      if (i < 0) return { t: s };
      const nome = s.slice(i + 1);
      return nome === "caixa" ? { t: s.slice(0, i), caixa: true } : { t: s.slice(0, i), cor: corDe(t, nome) };
    }),
  );

const PecaCandles: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel; lavoura: boolean }> = ({ p, q, t, painel, lavoura }) => {
  const dados = useMemo(() => gerarCandles(num(p.props.n, 20), num(p.props.semente, 11), TENDENCIA[str(p.props.tendencia, "sobe")] ?? 1.6), [p.props]);
  const volume = p.props.volume === false ? 0 : 60;
  const em = q(p.em ?? 0);
  return (
    <GraficoCandles
      x={p.x * W}
      y={painel.top + p.y * painel.h}
      w={p.largura * W}
      h={p.altura * painel.h}
      dados={dados}
      de={lavoura ? 0 : Math.max(2, em)}
      deCampo={lavoura ? Math.max(0, em - 10) : undefined}
      paleta={t}
      alturaVolume={volume}
      media={p.props.media !== false}
    />
  );
};

const PecaRegua: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel }> = ({ p, q, t, painel }) => {
  const f = useCurrentFrame();
  const x = p.x * W;
  const y = painel.top + p.y * painel.h;
  const pr = progresso(f, q(p.em ?? 0), 16, CURVA_T);
  const cor = corDe(t, p.props.cor ?? "terra");
  return (
    <>
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={x} x2={x + p.largura * W * pr} y1={y} y2={y} stroke={cor} strokeWidth={5} strokeDasharray="18 10" />
      </svg>
      <Marco x={x} y={y} cor={cor} corTexto={cor} rotulo={str(p.props.rotulo, "REFERÊNCIA")} de={q(p.em ?? 0)} haste={num(p.props.haste, 110)} />
    </>
  );
};

const FORMAS_TALHAO: { pts: [number, number][]; lx: number; ly: number; hachura: "linhas" | "pontos" | "diagonal" }[] = [
  { pts: [[70, 40], [470, 14], [520, 270], [440, 470], [60, 420]], lx: 285, ly: 260, hachura: "diagonal" },
  { pts: [[560, 30], [1010, 60], [1002, 230], [578, 226]], lx: 785, ly: 160, hachura: "linhas" },
  { pts: [[580, 262], [1010, 272], [1014, 470], [470, 482], [546, 380]], lx: 795, ly: 400, hachura: "pontos" },
];
const PecaTalhoes: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel }> = ({ p, q, t, painel }) => {
  const itens = (Array.isArray(p.props.itens) ? p.props.itens : []) as { nome?: string; cor?: string; hachura?: "linhas" | "pontos" | "diagonal"; em?: number }[];
  const sx = (p.largura * W) / 960;
  const sy = (p.altura * painel.h) / 470;
  const s = Math.min(sx, sy);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${p.x * W - 60 * s},${painel.top + p.y * painel.h - 14 * s}) scale(${s})`}>
        {itens.slice(0, 3).map((it, i) => (
          <Talhao
            key={i}
            de={q(it.em ?? p.em ?? 0)}
            pts={FORMAS_TALHAO[i].pts}
            cor={corDe(t, it.cor ?? "terra")}
            nome={str(it.nome, "TALHÃO")}
            t={t}
            lx={FORMAS_TALHAO[i].lx}
            ly={FORMAS_TALHAO[i].ly}
            hachura={it.hachura ?? FORMAS_TALHAO[i].hachura}
          />
        ))}
      </g>
    </svg>
  );
};

const PecaPontos: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel }> = ({ p, q, t, painel }) => {
  const f = useCurrentFrame();
  const cols = num(p.props.colunas, 8);
  const linhas = num(p.props.linhas, 5);
  const cheios = num(p.props.cheios, 31); // proporção ilustrativa, sem número de pesquisa
  const x = p.x * W;
  const y = painel.top + p.y * painel.h;
  const w = p.largura * W;
  const h = p.altura * painel.h;
  const r = Math.min(w / cols, h / linhas) * 0.22;
  const ini = q(p.em ?? 0);
  const preencher = p.passos.length ? q(p.passos[0]) : ini + 20;
  return (
    <>
      <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: cols * linhas }, (_, i) => {
          const cx = x + ((i % cols) + 0.5) * (w / cols);
          const cy = y + (Math.floor(i / cols) + 0.5) * (h / linhas);
          return (
            <g key={i} opacity={progresso(f, ini + i * 0.9, 8)}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.apagado} strokeWidth={2.5} />
              {i < cheios ? <circle cx={cx} cy={cy} r={r * progresso(f, preencher + i * 1.1, 8)} fill={t.alta} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: x, top: y + h + 12, fontFamily: F_ROTULO, fontSize: 20, letterSpacing: 2, color: t.apagado, opacity: progresso(f, ini + 10, 10) }}>ilustração · sem número de pesquisa</div>
    </>
  );
};

const PecaFrase: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel }> = ({ p, q, t, painel }) => {
  const f = useCurrentFrame();
  const linhas = (Array.isArray(p.props.linhas) ? p.props.linhas : []).map(String);
  const destaque = str(p.props.destaque, "");
  const tam = num(p.props.tam, 88);
  const estilo: React.CSSProperties = { fontFamily: F_TITULO, fontWeight: 700, fontSize: tam, lineHeight: 1.05, color: t.texto, letterSpacing: -1 };
  const topo = painel.top + p.y * painel.h;
  return (
    <>
      <div style={{ position: "absolute", left: p.x * W, top: topo, width: 5, height: linhas.length * tam * 1.1 * progresso(f, q(p.em ?? 0), 16), backgroundColor: t.ouro }} />
      <div style={{ position: "absolute", left: p.x * W + 36, top: topo }}>
        {linhas.map((l, i) => {
          const pr = progresso(f, q(i === 0 ? (p.em ?? 0) : (p.passos[i - 1] ?? p.em ?? 0)), 12);
          const k = destaque ? l.indexOf(destaque) : -1;
          return (
            <div key={i} style={{ ...estilo, opacity: pr, filter: `blur(${(1 - pr) * 6}px)` }}>
              {i === 0 ? "“" : null}
              {k >= 0 ? (
                <>
                  {l.slice(0, k)}
                  <span style={{ fontStyle: "italic", fontWeight: 600, color: t.baixa }}>{destaque}</span>
                  {l.slice(k + destaque.length)}
                </>
              ) : (
                l
              )}
              {i === linhas.length - 1 ? "”" : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

const PecaTexto: React.FC<{ p: PecaCarto; q: Q; t: Tema; painel: Painel; carimbo: boolean }> = ({ p, q, t, painel, carimbo }) => {
  const f = useCurrentFrame();
  const pr = progresso(f, q(p.em ?? 0), 10);
  const cor = corDe(t, p.props.cor ?? "texto");
  const tam = num(p.props.tam, carimbo ? 30 : 40);
  const caixa = carimbo && p.props.borda !== false;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x * W,
        top: painel.top + p.y * painel.h,
        opacity: pr,
        transform: `translateY(${(1 - pr) * 24}px) scale(${1 + (1 - pr) * 0.1})`,
        filter: `blur(${(1 - pr) * 6}px)`,
        fontFamily: carimbo ? F_ROTULO : F_FORTE,
        fontWeight: carimbo ? 700 : undefined,
        fontSize: tam,
        letterSpacing: carimbo ? 6 : -1,
        lineHeight: 1.05,
        color: cor,
        whiteSpace: "pre",
        textTransform: "uppercase",
        border: caixa ? `2px solid ${t.ouro}` : undefined,
        padding: caixa ? "6px 16px" : undefined,
      }}
    >
      {str(p.props.texto, "")}
    </div>
  );
};

const CenaReceita: React.FC<CenaProps & { cena: CenaCarto; painel: Painel }> = ({ q, t, cena, painel }) => {
  const fatias = cena.pecas.filter((p) => p.peca === "candles" || p.peca === "lavouraCandles");
  return (
    <AbsoluteFill>
      {cena.rotulo ? <Rotulo de={0} texto={cena.rotulo} x={64} y={painel.top + 6} cor={t.ouro} /> : null}
      {cena.titulo.length ? <Titulo de={2} x={64} y={painel.top + (cena.rotulo ? 50 : 6)} tam={cena.tamanhoTitulo} tema={t} linhas={lerTitulo(cena.titulo, t)} /> : null}
      {cena.pecas.map((p, i) => {
        switch (p.peca) {
          case "candles":
          case "lavouraCandles":
            return <PecaCandles key={i} p={p} q={q} t={t} painel={painel} lavoura={p.peca === "lavouraCandles"} />;
          case "estratos":
            return <Estratos key={i} x={p.x * W} y={painel.top + p.y * painel.h} w={p.largura * W} h={p.altura * painel.h} paleta={t} deRenda={q(p.em ?? 0)} deValor={q(p.passos[0] ?? p.em ?? 0)} />;
          case "marco":
            return (
              <Marco
                key={i}
                x={p.x * W}
                y={painel.top + p.y * painel.h}
                cor={corDe(t, p.props.cor ?? "ouro")}
                corTexto={corDe(t, p.props.corTexto ?? p.props.cor ?? "alta")}
                rotulo={typeof p.props.rotulo === "string" ? p.props.rotulo : undefined}
                de={q(p.em ?? 0)}
                haste={num(p.props.haste, 70)}
                lado={p.props.lado === "esq" ? "esq" : "dir"}
              />
            );
          case "regua":
            return <PecaRegua key={i} p={p} q={q} t={t} painel={painel} />;
          case "talhoes":
            return <PecaTalhoes key={i} p={p} q={q} t={t} painel={painel} />;
          case "pontos":
            return <PecaPontos key={i} p={p} q={q} t={t} painel={painel} />;
          case "frase":
            return <PecaFrase key={i} p={p} q={q} t={t} painel={painel} />;
          default:
            return <PecaTexto key={i} p={p} q={q} t={t} painel={painel} carimbo={p.peca === "carimbo"} />;
        }
      })}
      {/* selo obrigatório: automático, sem opção de desligar */}
      {fatias.map((p, i) => (
        <SeloDemo key={`selo${i}`} x={Math.min(p.x * W, W - 700)}y={painel.top + (p.y + p.altura) * painel.h + (p.props.volume === false ? 0 : 60) + 22} cor={t.apagado} />
      ))}
    </AbsoluteFill>
  );
};

type Cena = { de: number; layout: string; tema: Tema; C: React.FC<CenaProps>; receita?: { cena: CenaCarto; painel: Painel } };
const CENAS: Cena[] = [
  { de: 199.52, layout: "abertura", tema: NOITE, C: CenaAbertura },
  { de: 204.55, layout: "loteBaixo", tema: DIA, C: CenaTerra },
  { de: 207.02, layout: "janela", tema: DIA, C: CenaMaioria },
  { de: 211.92, layout: "janelaDir", tema: DIA, C: CenaSolo },
  { de: 176.8, layout: "close", tema: NOITE, C: CenaFrase },
  { de: 179.72, layout: "alto", tema: NOITE, C: CenaCrescimento },
  { de: 220.45, layout: "loteBaixo", tema: DIA, C: CenaRegua },
];

// ---------- Legenda ----------
type Palavra = { texto: string; ini: number; fim: number; chave?: keyof Paleta | "destaque" };
type PosLegenda = { left: number; right: number; top: number; tam: number };
const LEGENDA_V: PosLegenda = { left: 50, right: 50, top: 1540, tam: 58 };
const Legenda: React.FC<{ grupos: Palavra[][]; tema: Tema; sobreVideo: boolean; pos?: PosLegenda }> = ({ grupos, tema, sobreVideo, pos = LEGENDA_V }) => {
  const f = useCurrentFrame();
  const g = grupos.find((gr) => f >= gr[0].ini && f < gr[gr.length - 1].fim + 6);
  if (!g) return null;
  const pg = progresso(f, g[0].ini, 6);
  // sobre o vídeo, sempre letra clara com sombra; sobre o papel, tinta escura
  const base = sobreVideo ? NOITE : tema;
  return (
    <div style={{ position: "absolute", left: pos.left, right: pos.right, top: pos.top, display: "flex", justifyContent: "center", flexWrap: "wrap", opacity: pg, transform: `translateY(${(1 - pg) * 14}px)` }}>
      {g.map((p, i) => {
        const ativa = f >= p.ini && f < p.fim;
        const pa = ativa ? progresso(f, p.ini, 4) : 0;
        const cor = p.chave ? base[p.chave] : ativa ? base.destaque : base.texto;
        return (
          <span
            key={i}
            style={{
              fontFamily: F_TEXTO,
              fontWeight: 800,
              fontSize: pos.tam,
              textTransform: "uppercase",
              color: cor,
              display: "inline-block",
              margin: "0 15px",
              transform: `scale(${1 + pa * 0.08})`,
              textShadow: sobreVideo ? "0 4px 0 rgba(0,0,0,0.35), 0 0 22px rgba(0,0,0,0.75)" : "none",
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

// ---------- Rodapé (sempre sobre a faixa verde de baixo) ----------
const Rodape: React.FC<{ aviso: string; arroba: string; logo: string; box?: { left: number; width: number; top: number } }> = ({ aviso, arroba, logo, box = { left: 0, width: W, top: 1715 } }) => {
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
  const camada = (y: number): React.CSSProperties => ({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${y * 130}px)`, opacity: 1 - y });
  return (
    <div style={{ position: "absolute", left: box.left, width: box.width, top: box.top, height: 150, overflow: "hidden" }}>
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
  return <AbsoluteFill style={{ opacity: interpolate(f, [frames - 6, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

const Grao: React.FC<{ id: string; opacidade: number; seed: number; w?: number; h?: number }> = ({ id, opacidade, seed, w = W, h = 1920 }) => (
  <AbsoluteFill style={{ opacity: opacidade, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <svg width={w} height={h}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  </AbsoluteFill>
);

const CENTROS = [
  { x: 860, y: 330, r: 620, aneis: 13, semente: 3 },
  { x: 120, y: 1250, r: 520, aneis: 10, semente: 8 },
];

// ---------- Composição ----------
export const CorteCartografia: React.FC<Props> = ({ video, corte, volumeMusica, arroba, logo, aviso, ambiente, formato, xPadrao, modoLongo }) => {
  const TEMA = ambiente === "branco" ? DIA : NOITE;
  const frame = useCurrentFrame();
  const { durationInFrames: total } = useVideoConfig();
  const fonte = FONTES[video];
  const linha = useMemo(() => montarLinha(corte), [corte]);
  const ultimo = linha[linha.length - 1];
  const fimFala = ultimo.inicio + ultimo.frames;
  const horizontal = formato === "horizontal";
  const CW = horizontal ? 1920 : W;
  const CH = horizontal ? 1080 : 1920;
  // Receita com "cenas" = padrão novo; sem "cenas" = o corte da Mega-Sena escrito no código (CENAS).
  const porReceita = corte.cenas.length > 0;

  const cenas = useMemo(() => {
    if (porReceita) {
      return corte.cenas
        .map((c): Cena & { ini: number } => ({
          de: c.de,
          layout: c.enquadramento,
          tema: TEMA,
          C: CenaFecho,
          receita: { cena: c, painel: horizontal ? PAINEL_H : (PAINEL_V[c.enquadramento] ?? PAINEL_V.loteBaixo) },
          ini: c.fecho ? fimFala : (paraCorte(linha, c.de) ?? 0),
        }))
        .sort((a, b) => a.ini - b.ini);
    }
    const lista: (Cena & { ini: number })[] = CENAS.map((c) => ({ ...c, tema: TEMA, ini: paraCorte(linha, c.de) ?? 0 }));
    lista.push({ de: 0, layout: "fecho", tema: TEMA, C: CenaFecho, ini: fimFala });
    return lista;
  }, [linha, fimFala, TEMA, porReceita, corte.cenas, horizontal]);
  const enfases = useMemo(() => (porReceita ? corte.enfases : ENFASE).map((t) => paraCorte(linha, t)).filter((v): v is number => v !== null), [linha, porReceita, corte.enfases]);
  const chaves = useMemo(() => (porReceita ? (corte.legenda.chaves as Record<string, keyof Paleta | "destaque">) : CHAVE), [porReceita, corte.legenda.chaves]);

  let i = 0;
  cenas.forEach((c, k) => {
    if (frame >= c.ini) i = k;
  });
  const cena = cenas[i];
  const anterior = cenas[Math.max(0, i - 1)];
  const p = i === 0 ? 1 : progresso(frame, cena.ini, 16, CURVA_T);
  const mix = (a: number, b: number) => a + (b - a) * p;
  const [x, y, w, h] = horizontal ? JR_H : LAYOUT[cena.layout].map((v, k) => mix(LAYOUT[anterior.layout][k], v));
  const zoomBase = horizontal ? 1 : mix(ZOOM[anterior.layout] ?? 1, ZOOM[cena.layout] ?? 1);
  const punch = frame >= fimFala ? 0 : Math.max(0, ...enfases.map((e) => interpolate(frame - e, [0, 4, 30], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const s = Math.max(w / 1920, h / (1080 * (horizontal ? 0.78 : FONTE_UTIL))) * zoomBase * (1 + punch * 0.05);
  const vw = 1920 * s;
  const left = Math.min(0, Math.max(w - vw, w / 2 - xPadrao * vw));
  const larga = w > 1000;
  const fadeTopo = interpolate(w, [700, 1080], [0, 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moldura = interpolate(w, [1000, 1060], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const estiloVideo: React.CSSProperties = { position: "absolute", left, top: 0, width: vw, height: 1080 * s };
  const mascara = `linear-gradient(to bottom, transparent 0px, #000 ${fadeTopo}px, #000 calc(100% - ${fadeTopo}px), transparent 100%)`;

  // Cortina entre ambientes: o papel desce (noite -> dia) ou é recolhido (dia -> noite).
  const trocou = cena.tema.nome !== anterior.tema.nome && i > 0;
  const recorteDia =
    cena.tema.nome === "dia" ? (trocou ? `inset(0 0 ${(1 - p) * 100}% 0)` : "inset(0 0 0 0)") : trocou ? `inset(${p * 100}% 0 0 0)` : "inset(100% 0 0 0)";
  const T = trocou && p < 0.5 ? anterior.tema : cena.tema;
  const sobreVideo = y + h > 1560 && x < 300 && x + w > 780;

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
        lista.push({ texto, ini, fim: Math.max(ini + 1, fim), chave: chaves[normalizar(texto)] });
      }
    }
    const gs: Palavra[][] = [];
    let g: Palavra[] = [];
    lista.forEach((pl, k) => {
      const ant = lista[k - 1];
      if ((g.length >= 4 || (ant !== undefined && (/[.,?!]$/.test(ant.texto) || pl.ini - ant.fim > 10))) && g.length) {
        gs.push(g);
        g = [];
      }
      g.push(pl);
    });
    if (g.length) gs.push(g);
    return gs.map((gr, k) => (gs[k + 1] ? gr.map((pl, j) => (j === gr.length - 1 ? { ...pl, fim: Math.min(pl.fim, gs[k + 1][0].ini - 6) } : pl)) : gr));
  }, [linha, fonte.palavras, corte.legenda, chaves]);

  const posLegenda: PosLegenda = horizontal ? { left: 40, right: CW - 1080 + 40, top: 790, tam: 46 } : LEGENDA_V;
  const desloc = interpolate(frame, [0, total], [0, -120]);
  const varredura = i > 0 && frame - cena.ini < 16;
  const yVarredura = trocou ? (cena.tema.nome === "dia" ? p * 1920 : p * 1920) : interpolate(frame - cena.ini, [0, 14], [120, 1480], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COR_T.profundo }}>
      {/* NOITE: mapa verde-floresta */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 30% 20%, ${COR_T.floresta} 0%, ${COR_T.profundo} 75%)` }} />
      <AbsoluteFill style={{ transform: `translate(${desloc + i * -18}px, ${i * 10}px)` }}>
        <CurvasDeNivel largura={CW + 300} altura={CH} cor={COR_T.creme} destaque={COR_T.ouro} opacidade={0.16} desenho={progresso(frame, 0, 45, CURVA_T)} centros={CENTROS} />
      </AbsoluteFill>

      {/* DIA: papel de carta topográfica (papel do modelo 1 + curvas do modelo 2) */}
      <AbsoluteFill style={{ clipPath: recorteDia, WebkitClipPath: recorteDia }}>
        <AbsoluteFill style={{ backgroundColor: PAPEL }} />
        <AbsoluteFill style={{ transform: `translate(${desloc + i * -18}px, ${i * 10}px)` }}>
          <CurvasDeNivel largura={CW + 300} altura={CH} cor="#0F2A1D" destaque="#8E4813" opacidade={0.13} centros={CENTROS} />
        </AbsoluteFill>
        <Grao id="graoPapel" opacidade={0.22} seed={3} w={CW} h={CH} />
        {/* faixa verde embaixo, para o rodapé */}
        <div style={{ position: "absolute", left: 0, right: horizontal ? CW - 1080 : 0, top: horizontal ? 905 : 1745, bottom: 0, background: "linear-gradient(to bottom, rgba(15,42,29,0) 0%, rgba(15,42,29,0.62) 30%, rgba(15,42,29,0.78) 100%)" }} />
      </AbsoluteFill>

      {Array.from({ length: horizontal ? 5 : 11 }, (_, k) => (
        <div key={k} style={{ position: "absolute", left: 0, top: 150 + k * 160, width: 18, height: 2, backgroundColor: T.ouro, opacity: 0.6 }} />
      ))}

      {/* JR no lote */}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: larga ? 0 : 10, maskImage: larga ? mascara : undefined, WebkitMaskImage: larga ? mascara : undefined }}>
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
          {modoLongo ? null : <VozTrecho src={fonte.vozSrc} t={t} />}
        </Sequence>
      ))}

      {/* moldura do lote + marcos de canto */}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `2px solid ${T.moldura}`, borderRadius: 10, opacity: moldura }} />
      {!larga
        ? [
            [x - 14, y - 14, 1, 1],
            [x + w + 14, y - 14, -1, 1],
            [x - 14, y + h + 14, 1, -1],
            [x + w + 14, y + h + 14, -1, -1],
          ].map(([mx, my, sx, sy], k) => (
            <svg key={k} width={40} height={40} style={{ position: "absolute", left: mx - 20, top: my - 20, opacity: moldura }}>
              <path d={`M20,${20 + 16 * sy} L20,20 L${20 + 16 * sx},20`} fill="none" stroke={T.ouro} strokeWidth={3} />
            </svg>
          ))
        : null}

      {/* sombra leve só atrás da legenda e do rodapé (noite) */}
      {T.nome === "noite" ? (
        <div style={{ position: "absolute", left: 0, right: horizontal ? CW - 1080 : 0, top: horizontal ? 760 : 1560, bottom: 0, background: "linear-gradient(to bottom, rgba(8,23,15,0) 0%, rgba(8,23,15,0.55) 45%, rgba(8,23,15,0.85) 100%)" }} />
      ) : (
        <div style={{ position: "absolute", left: 0, right: horizontal ? CW - 1080 : 0, top: horizontal ? 905 : 1745, bottom: 0, background: "linear-gradient(to bottom, rgba(15,42,29,0) 0%, rgba(15,42,29,0.62) 30%, rgba(15,42,29,0.78) 100%)" }} />
      )}

      {cenas.map((c, k) => {
        const fimCena = k + 1 < cenas.length ? cenas[k + 1].ini : total;
        const q: Q = (t) => (paraCorte(linha, t) ?? c.ini) - c.ini;
        const C = c.C;
        return (
          <Sequence key={k} from={c.ini} durationInFrames={Math.max(1, fimCena - c.ini)} name={`Cena ${k + 1}: ${c.layout} (${c.tema.nome})`}>
            <Saida frames={fimCena - c.ini}>
              {c.receita ? <CenaReceita q={q} t={c.tema} cena={c.receita.cena} painel={c.receita.painel} /> : <C q={q} t={c.tema} />}
            </Saida>
            {k > 0 ? <Audio src={staticFile(c.tema.nome !== cenas[k - 1].tema.nome ? "sfx/papel/papel-desliza.wav" : SFX.whoosh)} volume={c.tema.nome !== cenas[k - 1].tema.nome ? 0.35 : 0.12} /> : null}
          </Sequence>
        );
      })}

      {varredura ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 3,
            top: yVarredura,
            backgroundColor: COR_T.ouroClaro,
            opacity: trocou ? 1 - progresso(frame, cena.ini + 12, 4) : interpolate(frame - cena.ini, [0, 3, 11, 14], [0, 0.8, 0.8, 0], { extrapolateRight: "clamp" }),
            boxShadow: `0 0 18px ${COR_T.ouro}`,
          }}
        />
      ) : null}

      <Sequence durationInFrames={fimFala} name="Legenda">
        <Legenda grupos={grupos} tema={T} sobreVideo={sobreVideo} pos={posLegenda} />
      </Sequence>
      {corte.quadroFecho?.faixa ? (
        <Sequence from={fimFala + 6} name="Faixa do fecho">
          <Legenda grupos={[[{ texto: corte.quadroFecho.faixa, ini: 0, fim: 999, chave: "destaque" }]]} tema={NOITE} sobreVideo={false} pos={posLegenda} />
        </Sequence>
      ) : null}

      {modoLongo ? null : <Rodape aviso={aviso} arroba={arroba} logo={logo} box={horizontal ? { left: 0, width: 1080, top: 930 } : undefined} />}
      {modoLongo ? null : <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: (CW * frame) / Math.max(1, total - 1), backgroundColor: T.ouro }} />}

      {fonte.musicaSrc && !modoLongo ? (
        <Audio
          src={staticFile(fonte.musicaSrc)}
          trimBefore={seg(8)}
          volume={(fr) => volumeMusica * interpolate(fr, [0, 15, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
    </AbsoluteFill>
  );
};
