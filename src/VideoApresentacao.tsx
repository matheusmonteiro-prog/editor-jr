import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { BLOCOS, CENAS, LOGO, SONS } from "./dados/apresentacao";
import type { Bloco } from "./dados/apresentacao";
import { acharBloco, montarLinhaDoTempo } from "./utils/linhaDoTempoApresentacao";
import type { BlocoNoTempo, LinhaDoTempo } from "./utils/linhaDoTempoApresentacao";
import { COR } from "./components/apresentacao/marca";
import { FundoCenas } from "./components/apresentacao/FundoCenas";
import { FioProgresso } from "./components/apresentacao/FioProgresso";
import { PilulaPergunta } from "./components/apresentacao/PilulaPergunta";
import { TextoKinetic } from "./components/apresentacao/TextoKinetic";
import { Logo3D } from "./components/apresentacao/Logo3D";
import { BrilhoRadial } from "./components/apresentacao/BrilhoRadial";
import { Moeda3D } from "./components/apresentacao/Moeda3D";
import { CardCheckFlip } from "./components/apresentacao/CardCheckFlip";
import { ContadorImpacto } from "./components/apresentacao/ContadorImpacto";
import { TextoRiscado } from "./components/apresentacao/TextoRiscado";
import { Particulas } from "./components/apresentacao/Particulas";
import { WipeBloco } from "./components/apresentacao/WipeBloco";
import { GradeAtivos3D } from "./components/v2/GradeAtivos3D";

// Vídeo de apresentação do JR: pergunta e resposta, sem câmera.
// Dados em src/dados/apresentacao.ts; duração calculada pelos áudios reais.

export type VideoApresentacaoProps = {
  // Preenchido pelo calculateMetadata (duração de cada áudio, em segundos;
  // null = arquivo não existe).
  duracoes?: Record<string, number | null>;
};

const FPS = 30;
const DURACAO_WIPE = 10;

// Duração de um áudio ou vídeo de public/ com Mediabunny (forma indicada pela
// documentação do Remotion 4.0.527: remotion.dev/docs/mediabunny/metadata).
const medirAudio = async (caminho: string): Promise<number | null> => {
  try {
    const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(staticFile(caminho)) });
    return await input.computeDuration();
  } catch {
    console.warn(`VideoApresentacao: arquivo "${caminho}" não existe ou não abriu; fica mudo/sem fundo.`);
    return null;
  }
};

export const calcularApresentacao: CalculateMetadataFunction<VideoApresentacaoProps> = async ({ props }) => {
  const videosDeFundo = CENAS.flatMap((c) => (c.fonte.tipo === "video" ? [c.fonte.arquivo] : []));
  const caminhos = [
    ...BLOCOS.flatMap((b) => [b.pergunta?.audio, b.resposta.audio]).filter((c): c is string => typeof c === "string"),
    ...videosDeFundo,
  ];
  const medidas = await Promise.all(caminhos.map(medirAudio));
  const duracoes: Record<string, number | null> = {};
  caminhos.forEach((c, i) => (duracoes[c] = medidas[i]));
  const linha = montarLinhaDoTempo(BLOCOS, duracoes, FPS);
  return { durationInFrames: linha.total, fps: FPS, props: { ...props, duracoes } };
};

// Marca na timeline do Studio onde entra um som. Sem arquivo, fica mudo.
const MarcaSom: React.FC<{ nome: string; arquivo?: string; from: number; volume?: number }> = ({
  nome,
  arquivo,
  from,
  volume = 0.8,
}) => (
  <Sequence name={`SOM ${nome}${arquivo ? "" : " (sem arquivo)"}`} from={from} durationInFrames={12} layout="none">
    {arquivo ? <Html5Audio src={staticFile(arquivo)} volume={volume} /> : null}
  </Sequence>
);

// Saída das palavras: termina junto com o fim do bloco.
const saidaTexto = (b: BlocoNoTempo, palavras: number) => b.duracao - (12 + palavras * 3);

const ConteudoBloco: React.FC<{ bloco: Bloco; t: BlocoNoTempo }> = ({ bloco, t }) => {
  const resp = t.respostaInicio + 2; // a resposta aparece com os primeiros 2 frames do narrador
  const fimTexto = saidaTexto(t, (bloco.texto ?? "").split(/\s+/).length);
  const fimElementos = t.duracao - 14;
  const el = bloco.elemento;

  return (
    <AbsoluteFill>
      {/* Pílula: pergunta (com contador) ou chamada de abertura. */}
      {bloco.pergunta ? (
        <PilulaPergunta texto={bloco.pergunta.texto} contador={bloco.contador} inicio={0} saida={fimElementos} />
      ) : bloco.pilula ? (
        <PilulaPergunta texto={bloco.pilula} inicio={2} saida={fimElementos} />
      ) : null}

      {el.tipo === "abertura" && bloco.texto ? (
        <>
          <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp} saida={fimTexto} top={0.555} tamanho={0.092} />
        </>
      ) : null}

      {el.tipo === "logoSpotlight" && bloco.texto ? (
        <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp} saida={fimTexto} top={0.56} tamanho={0.1} />
      ) : null}

      {el.tipo === "contadorCards" ? (
        <>
          <Moeda3D inicio={Math.round(resp + t.respostaFrames * el.moedaEmFracao)} x={0.78} />
          <ContadorImpacto
            valorFinal={el.valorFinal}
            prefixo={el.prefixo}
            rotulo={el.rotulo}
            inicio={resp}
            saida={fimElementos}
            top={0.2}
          />
          {el.cards.map((card, i) => (
            <CardCheckFlip
              key={card.texto}
              texto={card.texto}
              destaque={card.destaque}
              inicio={Math.round(resp + t.respostaFrames * card.emFracao)}
              saida={fimElementos + i * 3}
              top={0.47 + i * 0.1}
            />
          ))}
        </>
      ) : null}

      {el.tipo === "cards" ? (
        <>
          <Moeda3D inicio={Math.round(resp + t.respostaFrames * el.moedaEmFracao)} duracao={20} x={0.24} />
          {el.cards.map((card, i) => (
            <CardCheckFlip
              key={card.texto}
              texto={card.texto}
              destaque={card.destaque}
              inicio={Math.round(resp + t.respostaFrames * card.emFracao)}
              saida={fimElementos + i * 3}
              top={0.38 + i * 0.12}
              tamanho={0.072}
            />
          ))}
        </>
      ) : null}

      {el.tipo === "texto" && bloco.texto ? (
        <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp} saida={fimTexto} top={0.38} tamanho={0.085} />
      ) : null}

      {el.tipo === "contraste" && bloco.texto ? (
        el.depoisDoRisco === "recuar" ? (
          // Bloco 05: DIFÍCIL riscado sai para trás; FÁCIL E PRÁTICO entra em escala.
          <>
            <TextoRiscado
              texto={el.riscado}
              inicio={resp}
              frameRisco={resp + el.riscoAposFrames}
              duracaoRisco={el.duracaoRisco}
              depois="recuar"
              top={0.42}
              tamanho={0.17}
            />
            {el.particulas ? (
              <Particulas
                modo="explosao"
                quantidade={36}
                semente="facil"
                inicio={resp + el.riscoAposFrames + el.duracaoRisco + 6}
                duracao={36}
                centroY={0.44}
                tamanhoMax={0.009}
              />
            ) : null}
            <TextoKinetic
              texto={bloco.texto}
              destaque={bloco.destaque}
              inicio={resp + el.riscoAposFrames + el.duracaoRisco + 6}
              saida={fimTexto}
              top={0.37}
              tamanho={0.12}
              entrada="escala"
            />
          </>
        ) : (
          // Bloco 07: frase riscada fica fraca em cima; MOSTRA COMO FAZ entra embaixo.
          <>
            <TextoRiscado
              texto={el.riscado}
              inicio={resp}
              frameRisco={resp + el.riscoAposFrames}
              duracaoRisco={el.duracaoRisco}
              depois="apagar"
              saida={fimElementos}
              top={0.31}
              tamanho={0.082}
            />
            <TextoKinetic
              texto={bloco.texto}
              destaque={bloco.destaque}
              inicio={resp + el.riscoAposFrames + el.duracaoRisco + 4}
              saida={fimTexto}
              top={0.43}
              tamanho={0.115}
            />
            {el.legenda ? (
              <TextoKinetic
                texto={el.legenda}
                inicio={Math.round(resp + t.respostaFrames * (el.legendaEmFracao ?? 0.6))}
                saida={fimTexto}
                top={0.6}
                tamanho={0.036}
                fonte="rotulo"
                intervalo={2}
                opacidadeMax={0.85}
              />
            ) : null}
          </>
        )
      ) : null}

      {el.tipo === "grade" && bloco.texto ? (
        <>
          {/* A grade aparece apagada durante a pergunta e acende na resposta. */}
          <GradeAtivos3D frameInicio={resp} framesAntesDaOnda={Math.max(0, resp - 8)} duracaoFrames={t.duracao} framesSaida={14} centroY={0.4} largura={0.66} />
          <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp + 4} saida={fimTexto} top={0.575} tamanho={0.078} />
        </>
      ) : null}

      {el.tipo === "cartela" && bloco.texto ? (
        <>
          <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp} top={0.56} tamanho={0.095} />
          <TextoKinetic
            texto={el.linhaMenor}
            inicio={resp + el.linhaMenorAposFrames}
            top={0.655}
            tamanho={0.04}
            fonte="rotulo"
            intervalo={2}
            opacidadeMax={0.9}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Camadas: React.FC<{ linha: LinhaDoTempo; duracoes: Record<string, number | null> }> = ({ linha, duracoes }) => {
  const b00 = acharBloco(linha, "00");
  const b01 = acharBloco(linha, "01");
  const b08 = acharBloco(linha, "08");
  const inicioVoo = b01.inicio + b01.duracao - 22;
  const inicioVolta = b08.inicio + 4;

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <FundoCenas cenas={CENAS} linha={linha} duracoes={duracoes} />

      {/* Spotlight dourado em volta do logo (abertura e bloco 01). */}
      <Sequence name="Brilho do logo (00-01)" from={b00.inicio} durationInFrames={b01.inicio + b01.duracao - b00.inicio}>
        <BrilhoLogoInicial fim={b01.inicio + b01.duracao - b00.inicio} spotlightDe={b01.inicio - b00.inicio} />
      </Sequence>

      {BLOCOS.map((bloco) => {
        const t = acharBloco(linha, bloco.id);
        return (
          <Sequence key={bloco.id} name={`Bloco ${bloco.id}`} from={t.inicio} durationInFrames={t.duracao}>
            <ConteudoBloco bloco={bloco} t={t} />
          </Sequence>
        );
      })}

      <Sequence name="Logo 3D">
        <Logo3D src={LOGO} inicioGiro={b00.inicio + 4} inicioVoo={inicioVoo} inicioVolta={inicioVolta} />
      </Sequence>

      {/* Wipe diagonal em cada troca de bloco, encavalado com a pílula seguinte. */}
      {linha.blocos.slice(1).map((t) => (
        <Sequence key={`wipe-${t.id}`} name={`Wipe ${t.id}`} from={t.inicio - 4} durationInFrames={DURACAO_WIPE}>
          <WipeBloco duracao={DURACAO_WIPE} />
        </Sequence>
      ))}

      <FioProgresso />

      {/* Vozes. */}
      {BLOCOS.map((bloco) => {
        const t = acharBloco(linha, bloco.id);
        return (
          <React.Fragment key={`voz-${bloco.id}`}>
            {bloco.pergunta && t.perguntaExiste && t.perguntaInicio !== null ? (
              <Sequence name={`Voz pergunta ${bloco.id}`} from={t.inicio + t.perguntaInicio} durationInFrames={t.perguntaFrames}>
                <Html5Audio src={staticFile(bloco.pergunta.audio)} />
              </Sequence>
            ) : null}
            {t.respostaExiste ? (
              <Sequence name={`Voz resposta ${bloco.id}`} from={t.inicio + t.respostaInicio} durationInFrames={t.respostaFrames}>
                <Html5Audio src={staticFile(bloco.resposta.audio)} />
              </Sequence>
            ) : (
              <Sequence name={`Voz resposta ${bloco.id} (FALTA ARQUIVO, mudo)`} from={t.inicio + t.respostaInicio} durationInFrames={t.respostaFrames} layout="none">
                {null}
              </Sequence>
            )}
          </React.Fragment>
        );
      })}

      {/* Pontos de som: whoosh na troca de cena/bloco, tick na entrada da pílula. */}
      {linha.blocos.slice(1).map((t) => (
        <MarcaSom key={`whoosh-${t.id}`} nome={`whoosh ${t.id}`} arquivo={SONS.whoosh} from={t.inicio - 4} />
      ))}
      {linha.blocos.map((t) => (
        <MarcaSom key={`tick-${t.id}`} nome={`tick ${t.id}`} arquivo={SONS.tick} from={t.inicio + (t.id === "00" ? 2 : 0)} />
      ))}
      {SONS.trilha ? (
        <Sequence name="SOM trilha">
          <Html5Audio src={staticFile(SONS.trilha)} volume={0.15} />
        </Sequence>
      ) : (
        <Sequence name="SOM trilha (sem arquivo)" durationInFrames={1} layout="none">
          {null}
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// Brilho radial atrás do logo: sobe no bloco 00, fica mais forte (spotlight)
// no bloco 01 e some quando o logo voa para o canto.
const BrilhoLogoInicial: React.FC<{ fim: number; spotlightDe: number }> = ({ fim, spotlightDe }) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const base = interpolate(frame, [20, 50], [0, 0.55], clamp);
  const spot = interpolate(frame, [spotlightDe, spotlightDe + 15], [0, 0.45], clamp);
  const some = interpolate(frame, [fim - 24, fim - 8], [1, 0], clamp);
  return <BrilhoRadial x={0.5} y={0.33} raio={0.55 + spot * 0.2} intensidade={(base + spot) * some} />;
};

export const VideoApresentacao: React.FC<VideoApresentacaoProps> = ({ duracoes }) => {
  const linha = montarLinhaDoTempo(BLOCOS, duracoes ?? {}, FPS);
  return <Camadas linha={linha} duracoes={duracoes ?? {}} />;
};
