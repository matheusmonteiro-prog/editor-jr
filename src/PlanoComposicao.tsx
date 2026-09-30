import React, { useMemo } from "react";
import { OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
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
};

type ElementoPlano = {
  id: string;
  componente: string | string[] | "a confirmar";
  inicio: string; // "m:ss", tempo no vídeo ORIGINAL
  duracao: number; // segundos
  duracaoFrames?: number;
  props: Record<string, any> | "a confirmar";
};

export type Plano = {
  video: string;
  orientacao: string;
  elementos: ElementoPlano[];
};

export type PlanoComposicaoProps = {
  videoSrc: string; // caminho relativo a public/, ex: "videos/0926-cortado-v1.mp4"
  plano: Plano;
  cortes: { trechos: TrechoCortado[] };
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

export const PlanoComposicao: React.FC<PlanoComposicaoProps> = ({
  videoSrc,
  plano,
  cortes,
}) => {
  const { fps } = useVideoConfig();
  const paraFrameCortado = useMemo(
    () => criarParaFrameCortado(cortes.trechos, fps),
    [cortes, fps],
  );

  return (
    <>
      <OffthreadVideo src={staticFile(videoSrc)} />
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
