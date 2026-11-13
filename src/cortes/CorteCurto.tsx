import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { CURVA, FONTE_KIT, KIT } from "../components/v2/kitV3";
import { LegendaAnimada } from "../components/v2/LegendaAnimada";
import { FONTES } from "./fontes";
import { corteSchema, duracaoCorte, montarLinha, paraCorte, seg, type Corte, type TrechoNoCorte } from "./receita";

// Corte curto vertical (9:16) montado POR CIMA da câmera e da voz do vídeo longo (12/11/2026).
// Não recorta o mp4 pronto: as camadas do longo são 16:9 e ficariam cortadas. Aqui cada corte tem
// as camadas dele: título no topo, legenda palavra a palavra, impactos, zoom seco nos cortes,
// barra de progresso e fecho com a imagem parada. Receita em cortes/<video>.cortes.json.

export const corteCurtoSchema = z.object({
  video: z.string().default("2026-10-28"),
  xPadrao: z.number().min(0).max(1).default(0.48),
  corte: corteSchema,
  volumeMusica: z.number().min(0).max(0.3).default(0.06),
});
type Props = z.infer<typeof corteCurtoSchema>;

const COR = { creme: KIT.creme, amarelo: KIT.amarelo, vermelho: KIT.vermelho } as const;
export const SFX = {
  impacto: "audio/apresentacao/sfx/sfx-impacto.mp3",
  whoosh: "audio/apresentacao/sfx/sfx-whoosh.mp3",
  moeda: "audio/apresentacao/sfx/sfx-moeda.mp3",
  pop: "sfx/sfx-compartilhar-pop.mp3",
} as const;

export const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "");

// "Mega-Sena" não quebra de linha no hífen (troca pelo hífen que não quebra).
const semQuebraNoHifen = (t: string) => t.replace(/-/g, "‑");

// Contorno verde-escuro POR FORA da letra (paint-order), sem as falhas do stroke por dentro.
const contorno = (W: number, forca = 0.006): React.CSSProperties => ({
  WebkitTextStroke: `${W * forca}px ${KIT.verde}`,
  paintOrder: "stroke fill",
  textShadow: "0 6px 28px rgba(0,0,0,0.55)",
});

// Texto com palavras em amarelo (comparação sem acento e sem pontuação).
const ComDestaque: React.FC<{ texto: string; destaques: string[] }> = ({ texto, destaques }) => {
  const alvo = new Set(destaques.map(normalizar));
  return (
    <>
      {texto.split(" ").map((p, i) => (
        <span key={i} style={{ color: alvo.has(normalizar(p)) ? KIT.amarelo : undefined }}>
          {i > 0 ? " " : ""}
          {semQuebraNoHifen(p)}
        </span>
      ))}
    </>
  );
};

// ---------- Câmera: recorte vertical da fonte 16:9, em volta do JR ----------
const CameraVertical: React.FC<{ src: string; trecho: TrechoNoCorte; x: number; parado?: boolean }> = ({
  src,
  trecho,
  x,
  parado,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const larguraFonte = (H * 16) / 9; // a fonte ocupa a altura toda
  const esquerda = Math.min(0, Math.max(W - larguraFonte, W / 2 - x * larguraFonte));
  const zoomBase = trecho.zoom ?? (trecho.indice % 2 === 1 ? 1.06 : 1);
  // Aproximação lenta dentro do trecho + "soco" curto na entrada de cada corte (menos no 1º).
  const lento = parado ? 1 : interpolate(frame, [0, trecho.frames], [1, 1.035], { extrapolateRight: "clamp" });
  const soco =
    trecho.indice === 0 || parado
      ? 1
      : interpolate(frame, [0, 6], [1.07, 1], { extrapolateRight: "clamp", easing: CURVA });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: KIT.verde }}>
      <AbsoluteFill style={{ transform: `scale(${zoomBase * lento * soco})`, transformOrigin: "50% 30%" }}>
        <div style={{ position: "absolute", top: 0, left: esquerda, width: larguraFonte, height: H }}>
          <OffthreadVideo
            src={staticFile(src)}
            muted
            trimBefore={parado ? seg(trecho.ate) - 1 : seg(trecho.de)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Faixa de vidro no terço de baixo: desfoca o texto antigo gravado na fonte (pílulas e impactos do
// v1, entre 60% e 86% da altura) e dá fundo para a legenda. Bordas suaves em cima e embaixo.
const FaixaVidro: React.FC = () => {
  const { height: H } = useVideoConfig();
  const mascara = "linear-gradient(to bottom, transparent 0%, #000 18%, #000 100%)";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: H * 0.56,
        height: H * 0.44,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        backgroundColor: "rgba(15,42,29,0.74)",
        maskImage: mascara,
        WebkitMaskImage: mascara,
      }}
    />
  );
};

// ---------- Título (gancho) no topo, o corte inteiro ----------
const Titulo: React.FC<{ texto: string; destaques: string[] }> = ({ texto, destaques }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  // Já visível no quadro 0 (é o que aparece parado no feed); só "assenta" em 6 quadros.
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 240 }, durationInFrames: 8 });
  return (
    <div
      style={{
        position: "absolute",
        top: H * 0.045,
        left: W * 0.07,
        right: W * 0.07,
        padding: `${W * 0.028}px ${W * 0.04}px`,
        backgroundColor: KIT.verde,
        borderRadius: W * 0.03,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        transform: `scale(${interpolate(s, [0, 1], [0.94, 1])})`,
        fontFamily: FONTE_KIT,
        fontWeight: 900,
        fontSize: W * 0.062,
        lineHeight: 1.12,
        textTransform: "uppercase",
        textAlign: "center",
        color: KIT.creme,
      }}
    >
      <ComDestaque texto={texto} destaques={destaques} />
    </div>
  );
};

// ---------- Impacto (kit 4.4 adaptado ao vertical): Montserrat Black reto, entra de 170% ----------
const Impacto: React.FC<{
  linhas: { texto: string; cor: keyof typeof COR; atraso: number }[];
  apoio?: string;
  frames: number;
}> = ({ linhas, apoio, frames }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const sair = interpolate(frame, [frames - 6, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: sair }}>
      <div style={{ position: "absolute", top: H * 0.61, width: W * 0.9, textAlign: "center" }}>
        {linhas.map((l, i) => {
          const p = interpolate(frame - l.atraso, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA });
          // Tamanho cabe na largura: Montserrat Black em caixa alta ~0,72 em por letra.
          const base = i === 0 && linhas.length > 1 && l.cor === "creme" ? 0.072 : 0.1;
          const tamanho = Math.min(base, 0.86 / (l.texto.length * 0.72));
          return (
            <div
              key={i}
              style={{
                fontFamily: FONTE_KIT,
                fontWeight: 900,
                fontSize: W * tamanho,
                lineHeight: 1.08,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                color: COR[l.cor],
                opacity: p,
                transform: `scale(${interpolate(p, [0, 1], [1.7, 1])})`,
                ...contorno(W),
                marginBottom: W * 0.012,
              }}
            >
              {l.texto}
            </div>
          );
        })}
        {apoio ? (
          <div
            style={{
              marginTop: W * 0.02,
              fontFamily: FONTE_KIT,
              fontWeight: 600,
              fontSize: W * 0.04,
              color: KIT.creme,
              opacity: interpolate(frame, [10, 20], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              textShadow: "0 3px 14px rgba(0,0,0,0.6)",
            }}
          >
            {apoio}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Fecho: pergunta para os comentários + "vídeo completo no canal" ----------
const Fecho: React.FC<{ fecho: NonNullable<Corte["fecho"]> }> = ({ fecho }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(15,42,29,${interpolate(frame, [0, 8], [0, 0.55], { extrapolateRight: "clamp" })})` }} />
      <div
        style={{
          position: "absolute",
          top: H * 0.6,
          left: W * 0.07,
          right: W * 0.07,
          textAlign: "center",
          transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
          opacity: s,
        }}
      >
        <div
          style={{
            fontFamily: FONTE_KIT,
            fontWeight: 900,
            fontSize: W * 0.088,
            lineHeight: 1.08,
            textTransform: "uppercase",
            color: KIT.creme,
            ...contorno(W),
          }}
        >
          <ComDestaque texto={fecho.texto} destaques={fecho.destaques} />
        </div>
        {fecho.apoio ? (
          <div style={{ marginTop: W * 0.04, fontFamily: FONTE_KIT, fontWeight: 700, fontSize: W * 0.045, color: KIT.creme }}>
            {fecho.apoio}
          </div>
        ) : null}
        {fecho.arroba ? (
          <div style={{ marginTop: W * 0.012, fontFamily: FONTE_KIT, fontWeight: 600, fontSize: W * 0.04, color: KIT.amarelo }}>
            @{fecho.arroba}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const BarraProgresso: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, height: W * 0.009, width: (W * frame) / Math.max(1, total - 1), backgroundColor: KIT.amarelo }} />
  );
};

// Voz de um trecho, com 2 quadros de entrada e saída (evita estalo no corte seco).
export const VozTrecho: React.FC<{ src: string; t: TrechoNoCorte }> = ({ src, t }) => (
  <Audio
    src={staticFile(src)}
    trimBefore={seg(t.de)}
    trimAfter={seg(t.ate)}
    volume={(f) => interpolate(f, [0, 2, t.frames - 2, t.frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
);

export const CorteCurto: React.FC<Props> = ({ video, xPadrao, corte, volumeMusica }) => {
  const fonte = FONTES[video];
  const linha = useMemo(() => montarLinha(corte), [corte]);
  const total = duracaoCorte(corte);
  const ultimo = linha[linha.length - 1];
  const fimFala = ultimo.inicio + ultimo.frames;

  // Impactos no tempo do corte.
  const impactos = useMemo(
    () =>
      corte.impactos.flatMap((im) => {
        const ini = paraCorte(linha, im.de);
        if (ini === null) return [];
        const fim = paraCorte(linha, im.ate - 1 / 30) ?? ini + seg(im.ate - im.de);
        return [
          {
            ...im,
            ini,
            frames: Math.max(10, fim - ini + 1),
            linhas: im.linhas.map((l) => ({ texto: l.texto, cor: l.cor, atraso: l.em === undefined ? 0 : Math.max(0, (paraCorte(linha, l.em) ?? ini) - ini) })),
          },
        ];
      }),
    [corte.impactos, linha],
  );

  // Legenda: palavras da transcrição que caem nos trechos, com correções e destaques da receita.
  // Some enquanto um impacto ou o fecho está na tela (não duplica o texto).
  const palavras = useMemo(() => {
    const destaques = new Set(corte.legenda.destaques.map(normalizar));
    const correcoes = Object.fromEntries(Object.entries(corte.legenda.correcoes).map(([k, v]) => [normalizar(k), v]));
    const ocupado = (f: number) => impactos.some((im) => f >= im.ini && f < im.ini + im.frames);
    const lista: { texto: string; inicioFrames: number; fimFrames: number; destaque: boolean }[] = [];
    for (const tr of linha) {
      for (const p of fonte.palavras) {
        const ini = p.startMs / 1000;
        if (ini < tr.de || ini >= tr.ate) continue;
        const f0 = tr.inicio + seg(ini) - seg(tr.de);
        const f1 = tr.inicio + seg(Math.min(p.endMs / 1000, tr.ate)) - seg(tr.de);
        if (ocupado(f0)) continue;
        const bruto = p.text.trim();
        const chave = normalizar(bruto);
        const pont = bruto.match(/[.,?!]+$/)?.[0] ?? "";
        const texto = correcoes[chave] !== undefined ? correcoes[chave] + pont : bruto;
        lista.push({ texto, inicioFrames: f0, fimFrames: Math.max(f0 + 1, f1), destaque: destaques.has(chave) });
      }
    }
    return lista;
  }, [corte.legenda, linha, fonte.palavras, impactos]);

  return (
    <AbsoluteFill style={{ backgroundColor: KIT.verde }}>
      {/* Câmera e voz, trecho a trecho (corte seco entre eles) */}
      {linha.map((t) => (
        <Sequence key={`c${t.indice}`} from={t.inicio} durationInFrames={t.frames} name={`Trecho ${t.indice + 1}: ${t.de}-${t.ate}s`}>
          <CameraVertical src={fonte.cameraSrc} trecho={t} x={t.x ?? xPadrao} />
          <VozTrecho src={fonte.vozSrc} t={t} />
        </Sequence>
      ))}
      {/* Fim: imagem parada (último quadro do último trecho), sem voz */}
      {corte.segurarFim > 0 ? (
        <Sequence from={fimFala} name="Imagem parada (fecho)">
          <Freeze frame={0}>
            <CameraVertical src={fonte.cameraSrc} trecho={ultimo} x={ultimo.x ?? xPadrao} parado />
          </Freeze>
        </Sequence>
      ) : null}

      <FaixaVidro />

      <Sequence name="Legenda">
        <LegendaAnimada
          palavras={palavras}
          tamanhoFonte={0.085}
          posicaoY={0.715}
          larguraMaxima={0.86}
          maxPalavrasPorFrase={3}
          corDestaque={KIT.amarelo}
          corContorno={KIT.verde}
        />
      </Sequence>

      {impactos.map((im, i) => (
        <Sequence key={`i${i}`} from={im.ini} durationInFrames={im.frames} name={`Impacto: ${im.linhas.map((l) => l.texto).join(" ")}`}>
          <Impacto linhas={im.linhas} apoio={im.apoio} frames={im.frames} />
          {im.som !== "nenhum" ? <Audio src={staticFile(SFX[im.som])} volume={0.3} /> : null}
        </Sequence>
      ))}

      <Sequence name="Título">
        <Titulo texto={corte.titulo.texto} destaques={corte.titulo.destaques} />
      </Sequence>

      {corte.fecho ? (
        <Sequence from={fimFala} name="Fecho">
          <Fecho fecho={corte.fecho} />
          <Audio src={staticFile(SFX.pop)} volume={0.35} />
        </Sequence>
      ) : null}

      <BarraProgresso total={total} />

      {fonte.musicaSrc ? (
        <Audio
          src={staticFile(fonte.musicaSrc)}
          trimBefore={seg(8)}
          volume={(f) =>
            volumeMusica *
            interpolate(f, [0, 15, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
