import React from "react";
import { clamp } from "../../utils/clamp";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Cena, Movimento, TipoTransicao } from "../../dados/apresentacao";
import type { LinhaDoTempo } from "../../utils/linhaDoTempoApresentacao";
import { acharBloco } from "../../utils/linhaDoTempoApresentacao";
import { BrilhoRadial } from "./BrilhoRadial";
import { COR, comAlfa } from "./marca";
import { GraficoSubindo } from "./GraficoSubindo";
import { Particulas } from "./Particulas";
import { RaiosDeLuz } from "./RaiosDeLuz";
import { SolEReflexo } from "./SolEReflexo";

// Fundo do vídeo: uma foto por cena, com movimento lento (zoom ou pan),
// escurecimento #0F2A1D e a transição de entrada de cada cena.
// A cena nova entra POR CIMA e a antiga continua se movendo por baixo até
// sumir: nunca aparece tela preta. A cena antiga também recebe o "empurrão"
// da transição seguinte (empurrão vertical, deslize, zoom atravessando).

// Sem tingimento verde por cima da arte desde a rodada 5 (na rodada 4 era uma camada de 30% em modo
// "color"); a constante e a camada saíram na auditoria de 22/10/2026.

const suave = Easing.bezier(0.65, 0, 0.35, 1);

const transformMovimento = (m: Movimento, t: number): string => {
  if (m.tipo === "zoom") {
    return `scale(${interpolate(t, [0, 1], [m.de, m.para])})`;
  }
  if (m.tipo === "zoomEDeslocamento") {
    const y = interpolate(t, [0, 1], [m.deY, m.paraY]) * 100;
    return `translateY(${y}%) scale(${interpolate(t, [0, 1], [m.de, m.para])})`;
  }
  if (m.tipo === "panVertical") {
    const y = interpolate(t, [0, 1], [m.deY, m.paraY]) * 100;
    return `scale(${m.zoom}) translateY(${y}%)`;
  }
  const x = interpolate(t, [0, 1], [m.deX, m.paraX]) * 100;
  const y = interpolate(t, [0, 1], [m.deY, m.paraY]) * 100;
  return `scale(${m.zoom}) translate(${x}%, ${y}%)`;
};

// Recorte diagonal: progresso 0 = nada visível, 1 = tela toda.
const recorteDiagonal = (p: number) => {
  const x1 = p * 160;
  const x2 = x1 - 60;
  return `polygon(0% 0%, ${x1}% 0%, ${x2}% 100%, 0% 100%)`;
};

type EfeitoEntrada = { estilo: React.CSSProperties; camadaFrente?: React.ReactNode; faixa?: React.CSSProperties };

const efeitoEntrada = (tipo: TipoTransicao, p: number): EfeitoEntrada => {
  const e = suave(p);
  switch (tipo) {
    case "flashWipe":
      return {
        estilo: { clipPath: recorteDiagonal(e) },
        camadaFrente: (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 30% 30%, ${comAlfa(COR.dourado, 0.85)} 0%, ${comAlfa(
                COR.dourado,
                0.3,
              )} 45%, ${comAlfa(COR.dourado, 0)} 80%)`,
              opacity: interpolate(p, [0, 0.35, 1], [0, 0.75, 0], clamp),
              mixBlendMode: "screen",
            }}
          />
        ),
      };
    case "empurraoVertical":
      return { estilo: { transform: `translateY(${(1 - e) * 100}%)` } };
    case "zoomAtravessa":
      return { estilo: { opacity: e, transform: `scale(${1.25 - 0.25 * e})` } };
    case "deslizeHorizontal":
      return { estilo: { transform: `translateX(${(1 - e) * 100}%)` } };
    case "deslizeEsquerda":
      return { estilo: { transform: `translateX(${-(1 - e) * 100}%)` } };
    case "empurraoDescendo":
      return { estilo: { transform: `translateY(${-(1 - e) * 100}%)` } };
    case "mascaraCircular":
      // 90% cobre até os cantos de baixo (o centro está a 45% da altura).
      return { estilo: p >= 1 ? {} : { clipPath: `circle(${e * 90}% at 50% 45%)` } };
    case "wipeDiagonal":
      // A faixa verde-escura vai na frente da foto nova.
      return {
        estilo: { clipPath: recorteDiagonal(Math.max(0, e * 1.2 - 0.2)) },
        faixa: { clipPath: recorteDiagonal(Math.min(1, e * 1.2)), backgroundColor: COR.fundo },
      };
    case "fusaoBrilho":
      return {
        estilo: { opacity: e },
        camadaFrente: (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 45%, ${comAlfa(COR.dourado, 0.6)} 0%, ${comAlfa(
                COR.dourado,
                0,
              )} 65%)`,
              opacity: interpolate(p, [0, 0.5, 1], [0, 0.7, 0], clamp),
              mixBlendMode: "screen",
            }}
          />
        ),
      };
    default:
      return { estilo: {} };
  }
};

// O que acontece com a cena ANTIGA enquanto a seguinte entra.
const efeitoSaida = (tipoSeguinte: TipoTransicao | undefined, p: number): React.CSSProperties => {
  const e = suave(p);
  switch (tipoSeguinte) {
    case "empurraoVertical":
      return { transform: `translateY(${-e * 35}%)` };
    case "deslizeHorizontal":
      return { transform: `translateX(${-e * 35}%)` };
    case "deslizeEsquerda":
      return { transform: `translateX(${e * 35}%)` };
    case "empurraoDescendo":
      return { transform: `translateY(${e * 35}%)` };
    case "zoomAtravessa":
      return { transform: `scale(${1 + e * 0.6})` };
    default:
      return {};
  }
};

// Mídia da cena (imagem, vídeo em loop ou nada) com movimento, reenquadramento,
// e desfoque. Estrutura (de fora para dentro):
//   recorte (overflow hidden) > filtro (grayscale/blur, NÃO escalado, então o
//   desfoque tem sempre os px pedidos) > movimento (transform) > mídia.
// Vídeo de fundo, sempre mudo. Em loop se for mais curto que `frames`; corta no fim se for mais
// longo. Com `esticar`, toca mais devagar (até 0,5x) para cobrir `frames` sem repetir.
// Duração null = o arquivo não existe: não desenha nada (fica o verde-escuro).
const VideoFundo: React.FC<{
  arquivo: string;
  duracaoSeg: number | null | undefined;
  frames: number;
  esticar?: boolean;
  estilo: React.CSSProperties;
}> = ({ arquivo, duracaoSeg, frames, esticar, estilo }) => {
  const { fps } = useVideoConfig();
  if (duracaoSeg === null) return null;
  const framesVideo = duracaoSeg ? duracaoSeg * fps : frames;
  const velocidade = esticar ? Math.min(1, Math.max(0.5, framesVideo / frames)) : 1;
  return (
    <Loop durationInFrames={Math.max(1, Math.floor(framesVideo / velocidade))}>
      <OffthreadVideo src={staticFile(arquivo)} muted playbackRate={velocidade} style={estilo} />
    </Loop>
  );
};

// Frames de cross-fade entre os vídeos de uma cena "sequencia".
export const FRAMES_CRUZAMENTO = 10;

// Início (relativo à cena) de cada vídeo de uma "sequencia": fatias iguais da parte própria da cena.
export const fatiasSequencia = (quantidade: number, duracaoPropria: number): number[] =>
  new Array(quantidade).fill(0).map((_, i) => Math.round((i * duracaoPropria) / quantidade));

const MidiaDaCena: React.FC<{
  cena: Cena;
  t: number; // 0 a 1, progresso do movimento
  totalFrames: number;
  duracaoPropria: number;
  duracoes?: Record<string, number | null>;
  grafico?: { inicio: number; duracao: number }; // rodada 7: gráfico animado por cima da foto
}> = ({ cena, t, totalFrames, duracaoPropria, duracoes, grafico }) => {
  const frame = useCurrentFrame();
  const { fonte } = cena;
  if (fonte.tipo === "solido") return null;

  const enq = cena.enquadramento;
  const transform = `${
    enq ? `translate(${enq.x * 100}%, ${enq.y * 100}%) scale(${enq.escala}) ` : ""
  }${transformMovimento(cena.movimento, t)}`;
  const filtros = [
    cena.corNatural ? "" : cena.dessaturar ? "grayscale(1) contrast(1.05)" : "saturate(0.85) contrast(1.05)",
    cena.aquecer ? `sepia(${cena.aquecer})` : "",
    cena.desfoque ? `blur(${cena.desfoque}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const estiloMidia: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `50% ${cena.posicaoY}%`,
  };

  let midia: React.ReactNode;
  if (fonte.tipo === "imagem") {
    midia = <Img src={staticFile(fonte.arquivo)} style={estiloMidia} />;
  } else if (fonte.tipo === "video") {
    midia = (
      <VideoFundo
        arquivo={fonte.arquivo}
        duracaoSeg={duracoes?.[fonte.arquivo]}
        frames={totalFrames}
        esticar={cena.esticar}
        estilo={estiloMidia}
      />
    );
  } else {
    // Sequência: cada vídeo entra por cima do anterior com cross-fade; o último vai até o fim.
    const inicios = fatiasSequencia(fonte.arquivos.length, duracaoPropria);
    midia = fonte.arquivos.map((arquivo, i) => {
      const de = Math.max(0, inicios[i] - (i > 0 ? FRAMES_CRUZAMENTO : 0));
      const ate = i < inicios.length - 1 ? inicios[i + 1] : totalFrames;
      const op = i > 0 ? interpolate(frame, [de, de + FRAMES_CRUZAMENTO], [0, 1], clamp) : 1;
      return (
        <Sequence key={arquivo} name={arquivo} from={de} durationInFrames={ate - de}>
          <AbsoluteFill style={{ opacity: op }}>
            <VideoFundo
              arquivo={arquivo}
              duracaoSeg={duracoes?.[arquivo]}
              frames={ate - de}
              esticar={cena.esticar}
              estilo={estiloMidia}
            />
          </AbsoluteFill>
        </Sequence>
      );
    });
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: filtros || undefined }}>
        <AbsoluteFill style={{ transform }}>
          {midia}
          {grafico ? <GraficoSubindo inicio={grafico.inicio} duracao={grafico.duracao} /> : null}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CenaUnica: React.FC<{
  cena: Cena;
  duracaoPropria: number; // frames em que a cena é a principal
  framesSaida: number; // transição da cena seguinte (a antiga fica por baixo)
  transicaoSeguinte?: TipoTransicao;
  duracoes?: Record<string, number | null>;
  grafico?: { inicio: number; duracao: number };
}> = ({ cena, duracaoPropria, framesSaida, transicaoSeguinte, duracoes, grafico }) => {
  const frame = useCurrentFrame();
  const total = duracaoPropria + framesSaida;
  const t = interpolate(frame, [0, total], [0, 1], clamp);
  const pEntrada = cena.framesTransicao > 0 ? interpolate(frame, [0, cena.framesTransicao], [0, 1], clamp) : 1;
  const pSaida = framesSaida > 0 ? interpolate(frame, [duracaoPropria, total], [0, 1], clamp) : 0;
  const entrada = efeitoEntrada(cena.transicao, pEntrada);
  const saida = efeitoSaida(transicaoSeguinte, pSaida);
  const brilhoLogo = cena.brilhoLogo ? interpolate(frame, [10, 50], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill>
      {entrada.faixa ? <AbsoluteFill style={entrada.faixa} /> : null}
      <AbsoluteFill style={{ ...entrada.estilo, overflow: "hidden", isolation: "isolate" }}>
        <AbsoluteFill style={{ ...saida }}>
          {/* Fundo verde-escuro da marca: base de toda cena (e a cena inteira quando é "solido"). */}
          <AbsoluteFill style={{ backgroundColor: COR.fundo }} />
          <MidiaDaCena
            cena={cena}
            t={t}
            totalFrames={total}
            duracaoPropria={duracaoPropria}
            duracoes={duracoes}
            grafico={grafico}
          />
          {/* Escurecimento chapado + reforço em alfa atrás da pílula e do texto. */}
          {cena.escurecimento > 0 ? (
            <AbsoluteFill style={{ backgroundColor: COR.fundo, opacity: cena.escurecimento }} />
          ) : null}
          {cena.escurecimentoNeutro ? (
            <AbsoluteFill style={{ backgroundColor: "#000", opacity: cena.escurecimentoNeutro }} />
          ) : null}
          {cena.fonte.tipo !== "solido" && !cena.semDegrade ? (
            <AbsoluteFill
              style={{
                background: `linear-gradient(180deg, ${comAlfa(COR.fundo, 0.35)} 0%, ${comAlfa(
                  COR.fundo,
                  0,
                )} 22%, ${comAlfa(COR.fundo, 0.12)} 35%, ${comAlfa(COR.fundo, 0.12)} 65%, ${comAlfa(
                  COR.fundo,
                  0.3,
                )} 100%)`,
              }}
            />
          ) : null}
          {/* Rodada 9: vinheta radial verde-escura no canto superior direito (cenas 7 e 8). */}
          {cena.vinhetaTopoDireito ? (
            <AbsoluteFill
              style={{
                background: `radial-gradient(circle at top right, ${comAlfa(COR.fundo, 0.55)} 0%, ${comAlfa(
                  COR.fundo,
                  0,
                )} 55%)`,
              }}
            />
          ) : null}
          {cena.raiosDeLuz ? <RaiosDeLuz /> : null}
          {cena.particulas ? <Particulas semente={cena.nome} opacidade={cena.particulasOpacidade ?? 0.8} /> : null}
          {/* Rodada 9 (cena 2): brilho do sol que respira e reflexo nas moedas. Pendente de aprovação do JR. */}
          {cena.solEReflexo ? <SolEReflexo /> : null}
          {cena.brilhoLogo ? (
            <BrilhoRadial x={0.5} y={cena.brilhoY ?? 0.33} raio={0.6} intensidade={brilhoLogo} />
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      {entrada.camadaFrente ?? null}
    </AbsoluteFill>
  );
};

export const FundoCenas: React.FC<{
  cenas: Cena[];
  linha: LinhaDoTempo;
  duracoes?: Record<string, number | null>;
}> = ({ cenas, linha, duracoes }) => {
  return (
    <>
      {cenas.map((cena, i) => {
        const de = acharBloco(linha, cena.blocoInicial).inicio;
        const ultimo = acharBloco(linha, cena.blocoFinal);
        const ate = ultimo.inicio + ultimo.duracao;
        const seguinte = cenas[i + 1];
        const framesSaida = seguinte ? seguinte.framesTransicao : 0;
        // Rodada 7: o gráfico da foto cresce durante a resposta do bloco inicial da cena.
        const blocoGrafico = cena.graficoAnimado ? acharBloco(linha, cena.blocoInicial) : null;
        const grafico = blocoGrafico
          ? { inicio: blocoGrafico.respostaInicio, duracao: blocoGrafico.respostaFrames }
          : undefined;
        return (
          <Sequence key={cena.nome} name={cena.nome} from={de} durationInFrames={ate - de + framesSaida}>
            <CenaUnica
              cena={cena}
              duracaoPropria={ate - de}
              framesSaida={framesSaida}
              transicaoSeguinte={seguinte?.transicao}
              duracoes={duracoes}
              grafico={grafico}
            />
          </Sequence>
        );
      })}
    </>
  );
};
