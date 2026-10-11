import React, { useMemo } from "react";
import {
  AbsoluteFill,
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

export type Plano = {
  video: string;
  orientacao: string;
  elementos: ElementoPlano[];
  camera?: TrechoCamera[];
  // Atraso da câmera em relação à tela, em segundos (padrão 0). Reservado:
  // o efeito vem numa fase seguinte; por enquanto é ignorado.
  deslocamentoCamera?: number;
};

export type PlanoComposicaoProps = {
  videoSrc: string; // caminho relativo a public/, ex: "videos/0926-cortado-v1.mp4"
  plano: Plano;
  cortes: { trechos: TrechoCortado[] };
  cameraSrc?: string; // sem ela (ou sem plano.camera), nada de câmera
  cameraRepetirFrames?: number; // só pra arquivo de teste mais curto que o vídeo
};

const paraSegundos = (tempo: string): number => {
  const [minutos, segundos] = tempo.split(":").map(Number);
  return minutos * 60 + segundos;
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
}> = ({ src, repetirFrames, trechos, paraFrameCortado }) => {
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

  return (
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
    />
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
    </>
  );
};
