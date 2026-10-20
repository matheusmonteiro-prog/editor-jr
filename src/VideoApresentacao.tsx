import React from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { BLOCOS, CENAS, LOGO, SONS, VOLUMES } from "./dados/apresentacao";
import type { Bloco } from "./dados/apresentacao";
import { acharBloco, montarLinhaDoTempo } from "./utils/linhaDoTempoApresentacao";
import { planoMoedas } from "./utils/moedasApresentacao";
import { FRAMES_SFX, eventosSfx, inicioVoltaLogo } from "./utils/sfxApresentacao";
import type { EventoSfx } from "./utils/sfxApresentacao";
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
import { ListaRolando } from "./components/apresentacao/ListaRolando";
import { FraseIcone } from "./components/apresentacao/FraseIcone";
import { TextoPulso } from "./components/apresentacao/TextoPulso";
import { LinhaDourada } from "./components/apresentacao/LinhaDourada";

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
const MarcaSom: React.FC<{ evento: EventoSfx }> = ({ evento }) => {
  const arquivo = SONS[evento.tipo];
  return (
    <Sequence
      name={`SOM ${evento.nome}${arquivo ? "" : " (sem arquivo)"}`}
      from={Math.max(0, evento.frame)}
      durationInFrames={FRAMES_SFX[evento.tipo]}
      layout="none"
    >
      {arquivo ? <Html5Audio src={staticFile(arquivo)} volume={() => evento.volume} /> : null}
    </Sequence>
  );
};

// Saída das palavras: termina junto com o fim do bloco.
const saidaTexto = (b: BlocoNoTempo, palavras: number) => b.duracao - (12 + palavras * 3);

// Movimento da troca de bloco: o conteúdo entra deslizando de um lado (ou de baixo/cima).
const EntradaBloco: React.FC<{ direcao?: Bloco["entrada"]; children: React.ReactNode }> = ({ direcao, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const e = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const d = 1 - e;
  const x = direcao === "direita" ? d * width * 0.4 : direcao === "esquerda" ? -d * width * 0.4 : 0;
  const y = direcao === "baixo" ? d * height * 0.2 : direcao === "cima" ? -d * height * 0.2 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)`, opacity: interpolate(frame, [0, 6], [0, 1], clamp) }}>
      {children}
    </AbsoluteFill>
  );
};

const ConteudoBloco: React.FC<{ bloco: Bloco; t: BlocoNoTempo }> = ({ bloco, t }) => {
  const resp = t.respostaInicio + 2; // a resposta aparece com os primeiros 2 frames do narrador
  const fimTexto = saidaTexto(t, (bloco.texto ?? "").split(/\s+/).length);
  const fimElementos = t.duracao - 14;
  const el = bloco.elemento;

  return (
    <AbsoluteFill>
      {/* Moedas caindo: por cima do fundo e por trás de todo o texto (entram primeiro). */}
      {planoMoedas(bloco.moedas, t).map((m, i) => (
        <Moeda3D key={`moeda-${i}`} inicio={m.inicio} duracao={m.duracao} x={m.x} tamanho={m.tamanho} />
      ))}

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
          <ContadorImpacto
            valorFinal={el.valorFinal}
            prefixo={el.prefixo}
            rotulo={el.rotulo}
            inicio={resp}
            duracaoContagem={SONS.contador ? FRAMES_SFX.contador : 30}
            curva="linear"
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

      {el.tipo === "contraste" && el.depoisDoRisco === "recuar" && bloco.texto ? (
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
      ) : null}

      {el.tipo === "contraste" && el.depoisDoRisco === "apagar" ? (
        // Bloco 07: a frase riscada fica fraca em cima; as 3 frases com ícone entram em corte seco.
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
          {/* As frases entram uma a uma e FICAM até o fim do bloco, empilhando de baixo para cima. */}
          {(el.frases ?? []).map((f, i, todas) => {
            const corte = (seg: number) => t.respostaInicio + Math.round(seg * 30);
            return (
              <FraseIcone
                key={f.texto}
                texto={f.texto}
                destaque={f.destaque}
                icone={f.icone}
                estiloFaz={f.estiloFaz}
                inicio={corte(f.emSegundos)}
                empurroes={todas.slice(i + 1).map((g) => corte(g.emSegundos))}
                top={0.58}
              />
            );
          })}
          {/* Legenda fixa embaixo, o bloco todo. */}
          {el.legenda ? (
            <TextoKinetic
              texto={el.legenda}
              inicio={resp}
              top={0.68}
              tamanho={0.036}
              fonte="rotulo"
              intervalo={2}
              opacidadeMax={0.85}
            />
          ) : null}
        </>
      ) : null}

      {el.tipo === "contadorLista" && bloco.texto ? (
        <>
          <ListaRolando />
          {/* O contador para em +400 meio segundo (folgaFinalFrames) antes do narrador terminar. */}
          <ContadorImpacto
            valorFinal={el.valorFinal}
            prefixo={el.prefixo}
            inicio={resp}
            duracaoContagem={
              SONS.contador
                ? FRAMES_SFX.contador
                : Math.max(10, t.respostaInicio + t.respostaFrames - el.folgaFinalFrames - resp)
            }
            saida={fimElementos}
            top={0.3}
            tamanho={0.3}
            passoPulso={el.passoPulso}
            curva="linear"
            borraoMax={0.02}
          />
          {/* Estouro de partículas douradas quando o contador bate em 400. */}
          <Particulas
            modo="explosao"
            quantidade={46}
            semente="mais-400"
            inicio={SONS.contador ? resp + FRAMES_SFX.contador : t.respostaInicio + t.respostaFrames - el.folgaFinalFrames}
            duracao={40}
            centroY={0.38}
            tamanhoMax={0.01}
          />
          <TextoKinetic texto={bloco.texto} destaque={bloco.destaque} inicio={resp + 4} saida={fimTexto} top={0.6} tamanho={0.078} />
        </>
      ) : null}

      {el.tipo === "cta" ? (
        // Bloco 08: chamada final. Cada parte entra no momento da fala (tempos em segundos
        // desde o início do áudio da resposta).
        <>
          {/* Partículas douradas SUBINDO, leves, o bloco todo (único bloco com partículas subindo). */}
          <Particulas semente="cta-subindo" quantidade={34} opacidade={0.75} tamanhoMax={0.0065} />
          <TextoKinetic
            texto={el.chamada}
            fonte="titulo"
            damping={10}
            deslocamentoY={20 / 1080}
            inicio={resp}
            top={0.2}
            tamanho={0.1}
          />
          <LinhaDourada inicio={t.respostaInicio + Math.round(el.linhaDouradaEmSegundos * 30)} duracao={12} top={0.335} />
          <TextoKinetic
            texto={el.miolo}
            fonte="titulo"
            cor={COR.creme}
            damping={12}
            destaque={el.palavraExtra}
            intervalo={4}
            inicio={t.respostaInicio + Math.round(el.mioloEmSegundos * 30)}
            top={0.355}
            tamanho={0.058}
            pulsoPalavra={{
              palavra: el.palavraExtra,
              escala: 1.15,
              emFrame: t.respostaInicio + Math.round(el.palavraExtraEmSegundos * 30),
            }}
          />
          <TextoPulso
            texto={el.marca}
            cor={COR.dourado}
            escalaInicial={0.7}
            damping={10}
            brilho
            inicio={t.respostaInicio + Math.round(el.marcaEmSegundos * 30)}
            top={0.675}
            tamanho={0.11}
          />
          <TextoPulso
            texto={el.fecho}
            fonte="titulo"
            inicio={t.respostaInicio + Math.round(el.fechoEmSegundos * 30)}
            top={0.77}
            tamanho={0.045}
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
  const eventos = eventosSfx(linha);
  // Volume da música: fade-in, 0,20 até o bloco 07, 0,35 no bloco 08, fade-out no fim, e
  // ducking: baixa para 0,15 (na proporção) enquanto qualquer efeito toca.
  const volumeMusica = (f: number) => {
    const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
    const entrada = interpolate(f, [0, VOLUMES.fadeInMusicaFrames], [0, 1], clamp);
    const saida = interpolate(f, [linha.total - VOLUMES.fadeOutMusicaFrames, linha.total], [1, 0], clamp);
    const base = interpolate(f, [b08.inicio - 10, b08.inicio + 10], [VOLUMES.musica, VOLUMES.musicaFinal], clamp);
    let duck = 0;
    for (const e of eventos) {
      if (f < e.frame - 4 || f > e.frame + FRAMES_SFX[e.tipo] + 8) continue;
      const w = interpolate(f, [e.frame - 4, e.frame, e.frame + FRAMES_SFX[e.tipo], e.frame + FRAMES_SFX[e.tipo] + 8], [0, 1, 1, 0], clamp);
      duck = Math.max(duck, w);
    }
    const fator = 1 - duck * (1 - VOLUMES.musicaComEfeito / VOLUMES.musica);
    return base * fator * entrada * saida;
  };

  const inicioVolta = inicioVoltaLogo(linha);

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
            <EntradaBloco direcao={bloco.entrada}>
              <ConteudoBloco bloco={bloco} t={t} />
            </EntradaBloco>
          </Sequence>
        );
      })}

      <Sequence name="Logo 3D">
        <Logo3D
          src={LOGO}
          inicioGiro={b00.inicio + 4}
          inicioVoo={inicioVoo}
          inicioVolta={inicioVolta}
          centroFinal={{ x: 0.5, y: 0.565, largura: 0.36 }}
        />
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

      {/* Pontos de som (todos em src/utils/sfxApresentacao.ts). Sem arquivo em SONS, ficam só marcados e mudos. */}
      {eventos.map((e) => (
        <MarcaSom key={`${e.nome}-${e.frame}`} evento={e} />
      ))}

      {/* Música de fundo: do frame 0, sem loop (é mais longa que o vídeo), fade-in e fade-out. */}
      {SONS.trilha ? (
        <Sequence name="Música de fundo">
          <Html5Audio src={staticFile(SONS.trilha)} volume={volumeMusica} />
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
