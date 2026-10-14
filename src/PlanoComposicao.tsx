import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CamadaVideo } from "./components/v2/CamadaVideo";
import { ImagemFade } from "./components/ImagemFade";
import { GraficoLinha } from "./components/GraficoLinha";
import { ColagemCenas } from "./components/ColagemCenas";
import { ComparacaoBarras } from "./components/ComparacaoBarras";
import { TextoDestaque } from "./components/TextoDestaque";
import { Seta } from "./components/Seta";
import { Checkmark } from "./components/Checkmark";
import { ListaCheck } from "./components/v2/ListaCheck";
import { ColagemFotos } from "./components/v2/ColagemFotos";
import { TextoContraste } from "./components/v2/TextoContraste";
import { LegendaDiscreta } from "./components/v2/LegendaDiscreta";
import { BarrasDuelo } from "./components/v2/BarrasDuelo";
import { GraficoCrescimento } from "./components/v2/GraficoCrescimento";
import { PersonagemImagem } from "./components/v2/PersonagemImagem";
import { CallToAction } from "./components/v2/CallToAction";
import { CirculoDestaque } from "./components/v2/CirculoDestaque";
import { Spotlight } from "./components/v2/Spotlight";
import { Contador } from "./components/v2/Contador";
import { AvisoCVM } from "./components/v2/AvisoCVM";
import { ArrobaInstagram } from "./components/v2/ArrobaInstagram";
import { LegendaAnimada } from "./components/v2/LegendaAnimada";
import { criarParaFrameCortado, type TrechoCortado } from "./utils/tempoCortado";

// Lê um plano de edição (formato de planos/0926.plano.json) e monta a
// composição: vídeo de fundo + uma <Sequence> por elemento, com o(s)
// componente(s) do catálogo dentro. Não é genérico pra qualquer formato de
// plano — só pra esse já em uso.

const CATALOGO: Record<string, React.ComponentType<any>> = {
  ImagemFade,
  GraficoLinha,
  ColagemCenas,
  ComparacaoBarras,
  TextoDestaque,
  Seta,
  Checkmark,
  ListaCheck,
  ColagemFotos,
  TextoContraste,
  LegendaDiscreta,
  BarrasDuelo,
  GraficoCrescimento,
  PersonagemImagem,
  CallToAction,
  CirculoDestaque,
  Spotlight,
  Contador,
  AvisoCVM,
  ArrobaInstagram,
  LegendaAnimada,
};

type ElementoPlano = {
  id: string;
  componente: string | string[] | "a confirmar";
  inicio: string; // "m:ss", tempo no vídeo ORIGINAL
  duracao: number; // segundos
  duracaoFrames?: number;
  props: Record<string, any> | "a confirmar";
};

// Um trecho em que a câmera aparece. Tempos no vídeo ORIGINAL; caixa em
// fração de width/height (centro em x, y).
type TrechoCamera = {
  id: string;
  inicio: string; // "m:ss"
  duracao: number; // segundos
  x?: number;
  y?: number;
  largura?: number;
  altura?: number;
  ajuste?: string; // "cobrir" (padrão) ou "conter"; string porque o JSON importado não guarda o literal
  framesEntrada?: number;
  framesSaida?: number;
};

// Item da lista "audio" do plano (fora de "elementos"). Música: toca o vídeo todo,
// com fade de entrada e saída. Efeito: começa em "inicio" ("m:ss" do vídeo ORIGINAL)
// ou no mesmo frame de um elemento ("elemento" = id). "arquivo" é relativo a public/.
type ItemAudio = {
  id: string;
  tipo: string; // "musica" ou "efeito" (string porque o JSON importado não guarda o literal)
  arquivo: string;
  volume?: number; // 0 a 1
  framesEntrada?: number; // só música
  framesSaida?: number; // só música
  loop?: boolean; // só música
  inicio?: string; // só efeito
  elemento?: string; // só efeito
};

export type Plano = {
  video: string;
  orientacao: string;
  elementos: ElementoPlano[];
  audio?: ItemAudio[];
  camera?: TrechoCamera[];
  // Atraso da câmera em relação à tela, em segundos (padrão 0). Positivo = câmera
  // atrasada (o arquivo toca de mais à frente); negativo = câmera adiantada (espera).
  deslocamentoCamera?: number;
};

export type PlanoComposicaoProps = {
  videoSrc: string; // caminho relativo a public/, ex: "videos/0926-cortado-v1.mp4"
  plano: Plano;
  cortes: { trechos: TrechoCortado[] };
  cameraSrc?: string; // sem ela (ou sem plano.camera), nada de câmera
  cameraRepetirFrames?: number; // só pra arquivo de teste mais curto que o vídeo
};

// "m:ss" ou "m:ss.d" (UM dígito decimal) → segundos. Mesma regra do
// scripts/validar-plano.mjs: um plano que passou no validador não cai no erro.
const paraSegundos = (tempo: string): number => {
  const m = /^(\d+):(\d{1,2})(?:\.(\d))?$/.exec(tempo);
  if (!m || Number(m[2]) >= 60) {
    throw new Error(
      `Tempo inválido ${JSON.stringify(tempo)}: use "m:ss" ou "m:ss.d" (um dígito depois do ponto, sem vírgula, sem negativo, segundos < 60)`,
    );
  }
  return Number(m[1]) * 60 + Number(m[2]) + (m[3] === undefined ? 0 : Number(m[3]) / 10);
};

const renderizarComponente = (
  componente: ElementoPlano["componente"],
  props: ElementoPlano["props"],
): React.ReactNode => {
  if (typeof componente !== "string" && !Array.isArray(componente)) return null;
  if (props === "a confirmar" || componente === "a confirmar") return null;

  const nomes = Array.isArray(componente) ? componente : [componente];
  return (
    <>
      {nomes.map((nome) => {
        const Componente = CATALOGO[nome];
        if (!Componente) {
          throw new Error(`Componente desconhecido no catálogo: "${nome}"`);
        }
        const propsDoComponente = Array.isArray(componente)
          ? (props as Record<string, any>)[nome]
          : props;
        return <Componente key={nome} {...propsDoComponente} />;
      })}
    </>
  );
};

// UMA instância da câmera pela composição inteira (nunca uma Sequence por
// trecho, senão o vídeo recomeçaria): só a caixa e a opacidade mudam.
// Fora dos trechos fica montada com opacidade 0.
const CameraDoPlano: React.FC<{
  src: string;
  repetirFrames?: number;
  trechos: TrechoCamera[];
  paraFrameCortado: (segundoOriginal: number) => number;
  pularFrames?: number; // câmera atrasada: o arquivo toca de mais à frente
  esperaFrames?: number; // câmera adiantada: o arquivo só entra na timeline depois disso
}> = ({ src, repetirFrames, trechos, paraFrameCortado, pularFrames = 0, esperaFrames = 0 }) => {
  const frame = useCurrentFrame();
  const janelas = useMemo(
    () =>
      trechos.map((t) => {
        const inicio = paraSegundos(t.inicio);
        return { ...t, de: paraFrameCortado(inicio), ate: paraFrameCortado(inicio + t.duracao) };
      }),
    [trechos, paraFrameCortado],
  );

  const atual = janelas.find((j) => frame >= j.de && frame < j.ate);
  const caixa = atual ?? janelas[0];

  let opacidade = 0;
  if (atual) {
    const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
    const entrada = atual.framesEntrada ?? 0;
    const saida = atual.framesSaida ?? 0;
    const fadeIn = entrada > 0 ? interpolate(frame, [atual.de, atual.de + entrada], [0, 1], clamp) : 1;
    const fadeOut = saida > 0 ? interpolate(frame, [atual.ate - saida, atual.ate], [1, 0], clamp) : 1;
    opacidade = Math.min(fadeIn, fadeOut);
  }

  // Sequence layout="none" com from=0 não muda nada no DOM (deslocamento 0 = como antes).
  return (
    <Sequence from={esperaFrames} layout="none">
      <CamadaVideo
        src={src}
        mudo
        volume={0}
        repetirFrames={repetirFrames}
        x={caixa.x ?? 0.5}
        y={caixa.y ?? 0.5}
        largura={caixa.largura ?? 1}
        altura={caixa.altura ?? 1}
        ajuste={caixa.ajuste === "conter" ? "conter" : "cobrir"}
        opacidade={opacidade}
        pularFrames={pularFrames > 0 ? pularFrames : undefined}
      />
    </Sequence>
  );
};

// PROVISÓRIO: decidir de ouvido (o alvo de volume do projeto ainda não existe).
const VOLUME_MUSICA_PADRAO = 0.2;
const VOLUME_EFEITO_PADRAO = 1;

// Aviso uma vez só: o componente re-renderiza a cada quadro.
const avisosDados = new Set<string>();
const avisarUmaVez = (mensagem: string) => {
  if (avisosDados.has(mensagem)) return;
  avisosDados.add(mensagem);
  console.warn(mensagem);
};

// Lista "audio" do plano. Arquivo ausente ou ilegível NÃO derruba o render por conta
// daqui: o erro do <Html5Audio> vira só um aviso no console (o validador é quem
// confere se o arquivo existe).
const AudioDoPlano: React.FC<{
  itens: ItemAudio[];
  elementos: ElementoPlano[];
  paraFrameCortado: (segundoOriginal: number) => number;
}> = ({ itens, elementos, paraFrameCortado }) => {
  const { durationInFrames } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  return (
    <>
      {itens.map((item) => {
        const aoErrar = (erro: Error) => avisarUmaVez(`audio "${item.id}": ${erro.message}`);

        if (item.tipo === "musica") {
          const base = item.volume ?? VOLUME_MUSICA_PADRAO;
          const entrada = item.framesEntrada ?? 0;
          const saida = item.framesSaida ?? 0;
          // frame = quadro da composição (Sequence em 0; "extend" segue contando no loop).
          const volume = (frame: number) => {
            const fadeIn = entrada > 0 ? interpolate(frame, [0, entrada], [0, 1], clamp) : 1;
            const fadeOut =
              saida > 0 ? interpolate(frame, [durationInFrames - saida, durationInFrames], [1, 0], clamp) : 1;
            return base * Math.min(fadeIn, fadeOut);
          };
          return (
            <Sequence key={item.id} name={`audio-${item.id}`} from={0}>
              <Html5Audio
                src={staticFile(item.arquivo)}
                volume={volume}
                loop={item.loop === true}
                loopVolumeCurveBehavior="extend"
                onError={aoErrar}
              />
            </Sequence>
          );
        }

        if (item.tipo === "efeito") {
          const alvo = item.elemento !== undefined ? elementos.find((e) => e.id === item.elemento) : undefined;
          const inicio = alvo ? alvo.inicio : item.inicio;
          if (inicio === undefined) {
            avisarUmaVez(`audio "${item.id}": efeito sem "inicio" e sem "elemento" válido; ignorado.`);
            return null;
          }
          const from = paraFrameCortado(paraSegundos(inicio));
          return (
            <Sequence key={item.id} name={`audio-${item.id}`} from={from}>
              <Html5Audio
                src={staticFile(item.arquivo)}
                volume={item.volume ?? VOLUME_EFEITO_PADRAO}
                onError={aoErrar}
              />
            </Sequence>
          );
        }

        avisarUmaVez(`audio "${item.id}": tipo "${item.tipo}" desconhecido (use "musica" ou "efeito"); ignorado.`);
        return null;
      })}
    </>
  );
};

export const PlanoComposicao: React.FC<PlanoComposicaoProps> = ({
  videoSrc,
  plano,
  cortes,
  cameraSrc,
  cameraRepetirFrames,
}) => {
  const { fps } = useVideoConfig();
  const paraFrameCortado = useMemo(
    () => criarParaFrameCortado(cortes.trechos, fps),
    [cortes, fps],
  );

  // deslocamentoCamera (s): >0 câmera atrasada -> pula frames do arquivo;
  // <0 câmera adiantada -> o arquivo espera na timeline. Nunca frame negativo.
  const deslocamento = Number.isFinite(plano.deslocamentoCamera) ? (plano.deslocamentoCamera as number) : 0;
  const pularFrames = deslocamento > 0 ? Math.round(deslocamento * fps) : 0;
  const esperaFrames = deslocamento < 0 ? Math.round(-deslocamento * fps) : 0;

  return (
    <>
      {/* Tela (vídeo base). Caixa do tamanho da composição: com vídeo do mesmo
          tamanho, igual a antes; com composição menor, o vídeo cabe nela. */}
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(videoSrc)} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {cameraSrc && plano.camera && plano.camera.length > 0 ? (
        <Sequence name="camera">
          <CameraDoPlano
            src={cameraSrc}
            repetirFrames={cameraRepetirFrames}
            trechos={plano.camera}
            paraFrameCortado={paraFrameCortado}
            pularFrames={pularFrames}
            esperaFrames={esperaFrames}
          />
        </Sequence>
      ) : null}
      {plano.elementos.map((el) => {
        const from = paraFrameCortado(paraSegundos(el.inicio));
        const durationInFrames = el.duracaoFrames ?? Math.round(el.duracao * fps);
        return (
          <Sequence key={el.id} name={el.id} from={from} durationInFrames={durationInFrames}>
            {renderizarComponente(el.componente, el.props)}
          </Sequence>
        );
      })}
      {plano.audio && plano.audio.length > 0 ? (
        <AudioDoPlano itens={plano.audio} elementos={plano.elementos} paraFrameCortado={paraFrameCortado} />
      ) : null}
    </>
  );
};
