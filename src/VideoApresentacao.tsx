import React from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { BLOCOS, CENAS, ESCALA_FINAL_LOGO, LOGO, LOGO_ESCURO, SONS, VARIACAO_CTA, VOLUMES } from "./dados/apresentacao";
import type { Ativo, Bloco } from "./dados/apresentacao";
import { acharBloco, montarLinhaDoTempo } from "./utils/linhaDoTempoApresentacao";
import { planoMoedas } from "./utils/moedasApresentacao";
import {
  FRAMES_CRESCER_LOGO,
  FRAMES_SFX,
  FRAMES_STAGGER_SAIDA,
  eventosSfx,
  inicioCrescerLogo,
  inicioVoltaLogo,
  saidaFechoRelativa,
} from "./utils/sfxApresentacao";
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
import { Bandeira3D } from "./components/apresentacao/Bandeira3D";
import { IconeEtf } from "./components/apresentacao/IconeEtf";
import { EsteiraAtivos } from "./components/apresentacao/EsteiraAtivos";
import { ConvergenciaValor } from "./components/apresentacao/ConvergenciaValor";
import { ContadorImpacto } from "./components/apresentacao/ContadorImpacto";
import { TextoRiscado } from "./components/apresentacao/TextoRiscado";
import { Particulas } from "./components/apresentacao/Particulas";
import { WipeBloco } from "./components/apresentacao/WipeBloco";
import { ListaAtivos } from "./components/apresentacao/ListaAtivos";
import { IconesRedes } from "./components/apresentacao/IconesRedes";
import { FraseIcone } from "./components/apresentacao/FraseIcone";
import { MarcaCta } from "./components/apresentacao/MarcaCta";
import { PilulaCta } from "./components/apresentacao/PilulaCta";

// Vídeo de apresentação do JR: pergunta e resposta, sem câmera.
// Dados em src/dados/apresentacao.ts; duração calculada pelos áudios reais.

export type VideoApresentacaoProps = {
  // Preenchido pelo calculateMetadata (duração de cada áudio, em segundos;
  // null = arquivo não existe).
  duracoes?: Record<string, number | null>;
  // Preenchido pelo calculateMetadata: lista de ativos do bloco 06 (vazia = arquivo não existe).
  ativos?: Ativo[];
  // Rodada 7: força a variação do CTA do bloco 08 (para gerar os stills das duas). Sem ela, vale
  // VARIACAO_CTA de src/dados/apresentacao.ts.
  variacaoCta?: "a" | "b";
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
  const videosDeFundo = CENAS.flatMap((c) =>
    c.fonte.tipo === "video" ? [c.fonte.arquivo] : c.fonte.tipo === "sequencia" ? c.fonte.arquivos : [],
  );
  const caminhos = [
    ...BLOCOS.flatMap((b) => [b.pergunta?.audio, b.resposta.audio]).filter((c): c is string => typeof c === "string"),
    ...videosDeFundo,
  ];
  const medidas = await Promise.all(caminhos.map(medirAudio));
  const duracoes: Record<string, number | null> = {};
  caminhos.forEach((c, i) => (duracoes[c] = medidas[i]));
  const linha = montarLinhaDoTempo(BLOCOS, duracoes, FPS);
  return { durationInFrames: linha.total, fps: FPS, props: { ...props, duracoes, ativos: await lerAtivos() } };
};

// Lista de ativos do bloco 06 (public/…/ativos.json). Sem o arquivo, a lista fica vazia.
const lerAtivos = async (): Promise<Ativo[]> => {
  const el = BLOCOS.find((b) => b.elemento.tipo === "contadorLista")?.elemento;
  if (!el || el.tipo !== "contadorLista") return [];
  try {
    const resposta = await fetch(staticFile(el.arquivoAtivos));
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return (await resposta.json()) as Ativo[];
  } catch {
    console.warn(`VideoApresentacao: "${el.arquivoAtivos}" não existe ou não abriu; bloco 06 sem lista.`);
    return [];
  }
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

// Início da saída do fecho (bloco 08), relativo ao bloco; nos outros blocos não é usado.
const el0 = (t: BlocoNoTempo, bloco: Bloco, fps: number): number => {
  const cta = bloco.elemento;
  return cta.tipo === "cta" ? t.respostaInicio + Math.round(cta.pilulaEmSegundos * fps) + 20 : t.duracao - 14;
};

// Rodada 7: posições do CTA do bloco 08 em cada variação (fração da altura; tamanho em fração da largura).
const LAYOUT_CTA = {
  a: { chamada: { top: 0.215, tamanho: 0.105 }, acompanhe: 0.355, marca: 0.39 },
  b: { chamada: { top: 0.27, tamanho: 0.07 }, acompanhe: 0.33, marca: 0.36 },
} as const;

const ConteudoBloco: React.FC<{ bloco: Bloco; t: BlocoNoTempo; ativos: Ativo[]; variacaoCta: "a" | "b" }> = ({
  bloco,
  t,
  ativos,
  variacaoCta,
}) => {
  const { fps } = useVideoConfig();
  const resp = t.respostaInicio + 2; // a resposta aparece com os primeiros 2 frames do narrador
  const fimTexto = saidaTexto(t, (bloco.texto ?? "").split(/\s+/).length);
  const fimElementos = t.duracao - 14;
  // Fecho do bloco 08 (rodada 5d): frame (relativo ao bloco) em que os elementos começam a sair,
  // um de cada vez (stagger), os de cima para cima e os de baixo para baixo.
  const saidaCta = el0(t, bloco, fps);
  const el = bloco.elemento;

  return (
    <AbsoluteFill>
      {/* Moedas caindo: por cima do fundo e por trás de todo o texto (entram primeiro). */}
      {planoMoedas(bloco.moedas, t).map((m, i) => (
        <Moeda3D key={`moeda-${i}`} inicio={m.inicio} duracao={m.duracao} x={m.x} tamanho={m.tamanho} />
      ))}

      {/* Pílula: pergunta (com contador) ou chamada de abertura. */}
      {bloco.pergunta ? (
        <PilulaPergunta
          texto={bloco.pergunta.texto}
          contador={bloco.contador}
          inicio={0}
          saida={el.tipo === "cta" ? saidaCta : fimElementos}
        />
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
          {/* Rodada 7: ícone de ETF à direita do card "AÇÕES E ETFS" (lado da palavra ETFS). */}
          {el.cards.map((card, i) =>
            card.icone === "etf" ? (
              <IconeEtf
                key={`icone-${card.texto}`}
                x={0.915}
                y={0.47 + i * 0.1}
                tamanho={0.085}
                inicio={Math.round(resp + t.respostaFrames * card.emFracao) + 8}
                saida={fimElementos + i * 3}
              />
            ) : null,
          )}
          {/* Rodada 7: bandeiras 3D dos dois lados do card, entrando logo depois dele. */}
          {el.cards.flatMap((card, i) =>
            (card.bandeiras ?? []).map((b, k) => (
              <Bandeira3D
                key={b.arquivo}
                src={b.arquivo}
                proporcao={b.proporcao}
                lado={k === 0 ? "esquerda" : "direita"}
                x={k === 0 ? 0.105 : 0.895}
                y={0.47 + i * 0.1}
                largura={0.15}
                inicio={Math.round(resp + t.respostaFrames * card.emFracao) + 6 + k * 4}
                saida={fimElementos + i * 3}
              />
            )),
          )}
        </>
      ) : null}

      {el.tipo === "cards" ? (
        <>
          {/* Rodada 7: motion de cada selo, POR TRÁS dos selos. A esteira passa entre os dois selos
              (logo abaixo do 1º); a convergência fica logo abaixo do 2º. Começam quando o selo acende. */}
          {el.cards.map((card) => {
            const entra = Math.round(resp + t.respostaFrames * card.emFracao) + 10;
            if (card.animacao === "esteira") {
              return (
                <EsteiraAtivos
                  key={`esteira-${card.texto}`}
                  y={0.5}
                  inicio={entra}
                  saida={fimElementos}
                  selecoes={[entra + 30, entra + 75]}
                />
              );
            }
            if (card.animacao === "convergencia") {
              return (
                <ConvergenciaValor key={`convergencia-${card.texto}`} y={0.705} inicio={entra} saida={fimElementos + 3} />
              );
            }
            return null;
          })}
          {el.cards.map((card, i) => (
            <CardCheckFlip
              key={card.texto}
              texto={card.texto}
              destaque={card.destaque}
              inicio={Math.round(resp + t.respostaFrames * card.emFracao)}
              saida={fimElementos + i * 3}
              // Rodada 6: os dois selos empilhados no centro vertical, iguais e maiores.
              // Rodada 7: um pouco mais afastados (0,41/0,60 → 0,38/0,62) para a esteira caber entre eles.
              top={0.38 + i * 0.24}
              tamanho={0.09}
              largura={0.84}
              checkCheio
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
            const corte = (seg: number) => t.respostaInicio + Math.round(seg * fps);
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
          {/* Rodada 6: a lista de ativos rola nítida durante a pergunta (a 1ª linha chega ao centro
              logo depois da pílula; a última, quando a resposta começa) e vira textura atrás do contador. */}
          <ListaAtivos
            ativos={ativos}
            pasta={el.arquivoAtivos.slice(0, el.arquivoAtivos.lastIndexOf("/"))}
            primeiroNoCentro={14}
            ultimoNoCentro={resp}
          />
          <TextoKinetic texto={el.rotuloLista} fonte="rotulo" inicio={4} saida={resp - 8} top={0.235} tamanho={0.036} intervalo={2} />
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
        // desde o início do áudio da resposta). Só "MÉTODO JR." é dourado.
        <>
          {/* Partículas douradas SUBINDO, leves, o bloco todo (único bloco com partículas subindo). */}
          <Particulas semente="cta-subindo" quantidade={34} opacidade={0.75} tamanhoMax={0.0065} />
          {/* Rodada 7: teaser durante a pergunta. Entra palavra por palavra em escala, fica ~1 s e
              sai crescendo e sumindo logo antes de "SIGA ESTE CANAL". */}
          <TextoKinetic
            texto={el.teaser}
            fonte="titulo"
            entrada="escala"
            saidaModo="escala"
            damping={10}
            pulsoPalavra={{ palavra: "ninguém", escala: 1.15 }}
            inicio={el.teaserEntraFrame}
            saida={t.respostaInicio - 25}
            top={0.37}
            tamanho={0.08}
            larguraMax={0.94}
          />
          <TextoKinetic
            texto={el.chamada}
            fonte="titulo"
            damping={12}
            inicio={t.respostaInicio}
            saida={saidaCta + 2 * FRAMES_STAGGER_SAIDA}
            top={LAYOUT_CTA[variacaoCta].chamada.top}
            tamanho={LAYOUT_CTA[variacaoCta].chamada.tamanho}
          />
          <TextoKinetic
            texto={el.acompanhe}
            fonte="rotulo"
            damping={12}
            inicio={t.respostaInicio + Math.round(el.acompanheEmSegundos * fps)}
            saida={saidaCta + 3 * FRAMES_STAGGER_SAIDA}
            top={LAYOUT_CTA[variacaoCta].acompanhe}
            tamanho={0.042}
          />
          <MarcaCta
            texto={el.marca}
            variante={variacaoCta}
            inicio={t.respostaInicio + Math.round(el.marcaEmSegundos * fps)}
            saida={saidaCta + 4 * FRAMES_STAGGER_SAIDA}
            top={LAYOUT_CTA[variacaoCta].marca}
            tamanho={0.14}
          />
          {variacaoCta === "b" ? (
            <Particulas
              modo="explosao"
              quantidade={40}
              semente="metodo-jr"
              inicio={t.respostaInicio + Math.round(el.marcaEmSegundos * fps) + 4}
              duracao={36}
              centroY={LAYOUT_CTA.b.marca + 0.04}
              tamanhoMax={0.009}
            />
          ) : null}
          {/* Rodada 6: ícones das redes abaixo do logo; saem por último, para baixo. */}
          <IconesRedes
            redes={el.redes}
            inicio={t.respostaInicio + Math.round(el.redesEmSegundos * fps)}
            saida={saidaCta + 6 * FRAMES_STAGGER_SAIDA}
            top={0.835}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Camadas: React.FC<{
  linha: LinhaDoTempo;
  duracoes: Record<string, number | null>;
  ativos: Ativo[];
  variacaoCta: "a" | "b";
}> = ({ linha, duracoes, ativos, variacaoCta }) => {
  const { fps } = useVideoConfig();
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
    // Bloco 08: 0,12 durante a fala; depois que ela termina, sobe devagar até o máximo de 0,28.
    const fimFala = b08.inicio + b08.respostaInicio + b08.respostaFrames;
    const baixa = interpolate(f, [b08.inicio - 10, b08.inicio + 10], [VOLUMES.musica, VOLUMES.musicaCtaDuranteFala], clamp);
    const sobe = interpolate(f, [fimFala, fimFala + VOLUMES.subidaMusicaCtaFrames], [0, 1], clamp);
    const base = baixa + (VOLUMES.musicaCtaAposFala - VOLUMES.musicaCtaDuranteFala) * sobe;
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
  const ctaFinal = BLOCOS.find((b) => b.id === "08")?.elemento;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COR.fundo
      }}
    >
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
              <ConteudoBloco bloco={bloco} t={t} ativos={ativos} variacaoCta={variacaoCta} />
            </EntradaBloco>
          </Sequence>
        );
      })}

      <Sequence name="Logo 3D">
        <Logo3D
          src={LOGO}
          srcEspessura={LOGO_ESCURO}
          inicioGiro={b00.inicio + 4}
          inicioVoo={inicioVoo}
          inicioVolta={inicioVolta}
          centroFinal={{ x: 0.5, y: 0.585, largura: 0.55 }}
          crescerInicio={inicioCrescerLogo(linha)}
          crescerFim={inicioCrescerLogo(linha) + FRAMES_CRESCER_LOGO}
          escalaFinal={ESCALA_FINAL_LOGO}
        />
      </Sequence>

      {/* Pílula "EM BREVE NESTE CANAL": fica POR CIMA do logo, que cresce por trás dela no fim. */}
      {ctaFinal && ctaFinal.tipo === "cta" ? (
        <Sequence name="Pílula EM BREVE" from={b08.inicio} durationInFrames={b08.duracao}>
          <PilulaCta
            texto={ctaFinal.pilula}
            inicio={b08.respostaInicio + Math.round(ctaFinal.pilulaEmSegundos * fps)}
            saida={saidaFechoRelativa(linha) + 5 * FRAMES_STAGGER_SAIDA}
            saidaPara="baixo"
            top={0.735}
          />
        </Sequence>
      ) : null}

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

export const VideoApresentacao: React.FC<VideoApresentacaoProps> = ({ duracoes, ativos, variacaoCta }) => {
  const linha = montarLinhaDoTempo(BLOCOS, duracoes ?? {}, FPS);
  return (
    <Camadas linha={linha} duracoes={duracoes ?? {}} ativos={ativos ?? []} variacaoCta={variacaoCta ?? VARIACAO_CTA} />
  );
};
