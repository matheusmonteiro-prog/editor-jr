import React, { useMemo } from "react";
import { clamp } from "./utils/clamp";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { BLOCOS, CENAS, ESCALA_FINAL_LOGO, FPS, LOGO, LOGO_ESCURO, SONS, VARIACAO_CTA, VOLUMES } from "./dados/apresentacao";
import type { Ativo, Bloco, CardCheck, MarcaDeTempo } from "./dados/apresentacao";
import { acharBloco, frameDaMarca, montarLinhaDoTempo } from "./utils/linhaDoTempoApresentacao";
import { planoMoedas } from "./utils/moedasApresentacao";
import {
  FRAMES_CRESCER_LOGO,
  FRAMES_SFX,
  FRAMES_STAGGER_SAIDA,
  eventosSfx,
  inicioCrescerLogo,
  inicioVoltaLogo,
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
import { GraficoVelas } from "./components/apresentacao/GraficoVelas";
import { PizzaGomos } from "./components/apresentacao/PizzaGomos";
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
import { GrupoCaindo } from "./components/apresentacao/GrupoCaindo";
import { BotaoSeguir } from "./components/apresentacao/BotaoSeguir";
import { SinoNotificacao } from "./components/apresentacao/SinoNotificacao";
import { CompartilharPessoas } from "./components/apresentacao/CompartilharPessoas";

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
    ...BLOCOS.flatMap((b) => [b.pergunta?.audio, b.resposta.audio, ...(b.resposta.seguintes ?? []).map((x) => x.audio)]).filter(
      (c): c is string => typeof c === "string",
    ),
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
      {arquivo ? <Html5Audio src={staticFile(arquivo)} volume={() => evento.volume} playbackRate={evento.velocidade ?? 1} /> : null}
    </Sequence>
  );
};

// Saída das palavras: termina junto com o fim do bloco.
const saidaTexto = (b: BlocoNoTempo, palavras: number) => b.duracao - (12 + palavras * 3);

// Movimento da troca de bloco: o conteúdo entra deslizando de um lado (ou de baixo/cima).
const EntradaBloco: React.FC<{ direcao?: Bloco["entrada"]; children: React.ReactNode }> = ({ direcao, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
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
const el0 = (t: BlocoNoTempo, bloco: Bloco): number => {
  const cta = bloco.elemento;
  return cta.tipo === "cta" ? t.respostaInicio + t.respostaFrames + cta.cartela.fechoDepoisFrames : t.duracao - 14;
};

// Rodada 9: posições do CTA do bloco 08 (topo em fração da altura; tamanho em fração da largura).
// Tipografia em CAIXA ALTA (Anton / Alfa Slab One), pendente de aprovação do JR. Hierarquia: "MÉTODO JR"
// (o maior texto) > "EM BREVE" > os grupos que caem. As variações "a" e "b" mudam só o movimento de "MÉTODO JR".
const LAYOUT_CTA = {
  // Os grupos que caem ocupam o mesmo palco, abaixo da pílula da pergunta e acima do logo.
  grupo: {
    top: 0.2,
    tamanhoSiga: 0.2,
    tamanhoTexto: 0.1,
    tamanhoNovidade: 0.06,
    topNovidade: 0.225,
    iconeSiga: 0.352,
    iconeNotificacoes: 0.335,
    iconeCompartilhe: 0.31,
  },
  emBreve: { top: 0.285, tamanho: 0.1 },
  marca: { top: 0.355, tamanho: 0.2 },
} as const;
// Rodada 9: posição vertical dos 3 cards do bloco 02 (fração da altura). Espaço maior entre eles; "BRASIL E EUA"
// desce um pouco mais.
const TOPO_CARDS_02 = [0.48, 0.6, 0.745];

// Rodada 9: ponto da faixa de fundo em que a música começa (1:35), em segundos.
const INICIO_TRILHA_SEGUNDOS = 95;

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
  const saidaCta = el0(t, bloco);
  // Momento da fala (áudio 1, 2 ou 3, em segundos desde o início do arquivo) → frame relativo ao bloco,
  // já descontando o silêncio cortado do começo de cada áudio.
  const noMarca = (m: MarcaDeTempo) => frameDaMarca(t, m, fps);
  // Frame em que um card entra: na hora da palavra (emSegundos, Whisper) ou numa fração da fala.
  const entradaDoCard = (card: CardCheck) =>
    card.emSegundos !== undefined
      ? t.respostaInicio + Math.round(card.emSegundos * fps)
      : Math.round(resp + t.respostaFrames * (card.emFracao ?? 0));
  const el = bloco.elemento;
  // O sorteio das moedas é fixo (semente do bloco): calculado uma vez, não a cada frame.
  const moedas = useMemo(() => planoMoedas(bloco.moedas, t), [bloco.moedas, t]);

  return (
    <AbsoluteFill>
      {/* Moedas caindo: por cima do fundo e por trás de todo o texto (entram primeiro). */}
      {moedas.map((m, i) => (
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
          {/* Rodada 9: o contador chega a 15 durante a palavra "15" da fala (1,34–1,75 s). */}
          <ContadorImpacto
            valorFinal={el.valorFinal}
            prefixo={el.prefixo}
            rotulo={el.rotulo}
            inicio={resp}
            duracaoContagem={45}
            curva="linear"
            saida={fimElementos}
            top={0.2}
          />
          {/* 3 linhas (AÇÕES, ETFs, BRASIL E EUA), cada uma entra na hora da palavra. AÇÕES e ETFs ficam
              alinhadas à ESQUERDA, com o ícone de gráfico saindo da borda direita do card; "BRASIL E EUA"
              continua centralizado (com as bandeiras). */}
          {el.cards.map((card, i) => (
            <CardCheckFlip
              key={card.texto}
              texto={card.texto}
              destaque={card.destaque}
              inicio={entradaDoCard(card)}
              saida={fimElementos + i * 3}
              top={TOPO_CARDS_02[i] ?? 0.74}
              alinhar={card.icone ? "esquerda" : "centro"}
              lateral={
                card.icone === "velas" ? (
                  <GraficoVelas largura={0.27} inicio={entradaDoCard(card) + 6} />
                ) : card.icone === "pizza" ? (
                  <PizzaGomos tamanho={0.2} inicio={entradaDoCard(card) + 6} />
                ) : null
              }
            />
          ))}
          {/* Bandeiras 3D dos dois lados da linha, entrando logo depois dela. */}
          {el.cards.flatMap((card, i) =>
            (card.bandeiras ?? []).map((b, k) => (
              <Bandeira3D
                key={b.arquivo}
                src={b.arquivo}
                proporcao={b.proporcao}
                lado={k === 0 ? "esquerda" : "direita"}
                x={k === 0 ? 0.105 : 0.895}
                y={TOPO_CARDS_02[i] ?? 0.74}
                largura={0.15}
                inicio={entradaDoCard(card) + 6 + k * 4}
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
            const entra = entradaDoCard(card) + 10;
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
              inicio={entradaDoCard(card)}
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
            primeiroNoCentro={8}
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
        // Bloco 08: a chamada vem em grupos que caem de cima e saem caindo, cada um no tempo da fala
        // (dois áudios). Depois da fala, sem áudio: "EM BREVE", "MÉTODO JR" e o fecho.
        <>
          {/* Partículas douradas SUBINDO, leves, o bloco todo (único bloco com partículas subindo). */}
          <Particulas semente="cta-subindo" quantidade={34} opacidade={0.75} tamanhoMax={0.0065} />
          {/* 1. SIGA (áudio 1) + botão SEGUIR → SEGUINDO. */}
          <GrupoCaindo
            texto={el.siga.texto}
            inicio={noMarca(el.siga.entra)}
            saida={noMarca(el.siga.sai)}
            top={LAYOUT_CTA.grupo.top}
            tamanho={LAYOUT_CTA.grupo.tamanhoSiga}
          >
            <BotaoSeguir y={LAYOUT_CTA.grupo.iconeSiga} toque={noMarca(el.siga.toque)} />
          </GrupoCaindo>
          {/* 2. AS REDES SOCIAIS (áudio 2); os ícones do rodapé pulsam em "sociais". */}
          <GrupoCaindo
            texto={el.redes.texto}
            destaque={el.redes.destaque}
            inicio={noMarca(el.redes.entra)}
            saida={noMarca(el.redes.sai)}
            top={LAYOUT_CTA.grupo.top}
            tamanho={LAYOUT_CTA.grupo.tamanhoTexto}
          />
          {/* 3. COMPARTILHE: ícone de compartilhar, seta e 3 pessoas. */}
          <GrupoCaindo
            texto={el.compartilhe.texto}
            inicio={noMarca(el.compartilhe.entra)}
            saida={noMarca(el.compartilhe.sai)}
            top={LAYOUT_CTA.grupo.top}
            tamanho={LAYOUT_CTA.grupo.tamanhoTexto}
          >
            <CompartilharPessoas
              y={LAYOUT_CTA.grupo.iconeCompartilhe}
              seta={noMarca(el.compartilhe.seta)}
              pessoas={el.compartilhe.pessoas.map(noMarca)}
            />
          </GrupoCaindo>
          {/* 4. ATIVE AS NOTIFICAÇÕES: sino que balança. */}
          <GrupoCaindo
            texto={el.notificacoes.texto}
            destaque={el.notificacoes.destaque}
            inicio={noMarca(el.notificacoes.entra)}
            saida={noMarca(el.notificacoes.sai)}
            top={LAYOUT_CTA.grupo.top}
            tamanho={LAYOUT_CTA.grupo.tamanhoTexto}
          >
            <SinoNotificacao y={LAYOUT_CTA.grupo.iconeNotificacoes} balanco={noMarca(el.notificacoes.balanco)} />
          </GrupoCaindo>
          {/* 5. PARA NÃO PERDER NENHUMA NOVIDADE: linha menor, sai ao fim do áudio 2. */}
          <GrupoCaindo
            texto={el.novidade.texto}
            inicio={noMarca(el.novidade.entra)}
            saida={noMarca(el.novidade.sai)}
            top={LAYOUT_CTA.grupo.topNovidade}
            tamanho={LAYOUT_CTA.grupo.tamanhoNovidade}
          />
          {/* 6. Cartela final (áudio 3): "EM BREVE" cai na palavra "Em breve"; "MÉTODO JR" entra com impacto em "Método JR". */}
          <GrupoCaindo
            texto={el.cartela.emBreve}
            inicio={noMarca(el.cartela.emBreveEm)}
            saida={saidaCta + 3 * FRAMES_STAGGER_SAIDA}
            framesSaida={10}
            saidaPara="cima"
            espaco="0.1em"
            top={LAYOUT_CTA.emBreve.top}
            tamanho={LAYOUT_CTA.emBreve.tamanho}
          />
          <MarcaCta
            texto={el.cartela.marca}
            variante={variacaoCta}
            inicio={noMarca(el.cartela.marcaEm)}
            saida={saidaCta + 4 * FRAMES_STAGGER_SAIDA}
            top={LAYOUT_CTA.marca.top}
            tamanho={LAYOUT_CTA.marca.tamanho}
          />
          {variacaoCta === "b" ? (
            <Particulas
              modo="explosao"
              quantidade={40}
              semente="metodo-jr"
              inicio={noMarca(el.cartela.marcaEm) + 4}
              duracao={36}
              centroY={LAYOUT_CTA.marca.top + 0.05}
              tamanhoMax={0.009}
            />
          ) : null}
          {/* Ícones das redes: entram em "redes sociais", pulsam em "sociais" e ficam até o fecho. */}
          <IconesRedes
            redes={el.redesSociais}
            inicio={noMarca(el.redes.entra)}
            pulsoEm={noMarca(el.redes.pulsoIcones)}
            saida={saidaCta + 6 * FRAMES_STAGGER_SAIDA}
            top={0.845}
            tamanho={0.11}
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
  // Pontos de som e marcos do fecho dependem só da linha do tempo: calculados uma vez, não a cada frame.
  const { eventos, inicioVolta, inicioCrescer } = useMemo(
    () => ({
      eventos: eventosSfx(linha, fps),
      inicioVolta: inicioVoltaLogo(linha, fps),
      inicioCrescer: inicioCrescerLogo(linha),
    }),
    [linha, fps],
  );
  // Volume da música: fade-in, 0,20 até o bloco 07, 0,35 no bloco 08, fade-out no fim, e
  // ducking: baixa para 0,15 (na proporção) enquanto qualquer efeito toca.
  const volumeMusica = (f: number) => {
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
          crescerInicio={inicioCrescer}
          crescerFim={inicioCrescer + FRAMES_CRESCER_LOGO}
          escalaFinal={ESCALA_FINAL_LOGO}
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
            {/* Cada áudio da resposta: o silêncio do começo é cortado por código (startFrom) e o do fim,
                pela duração da Sequence; os arquivos originais não são editados. */}
            {t.partes.map((parte, k) => (
              <Sequence
                key={parte.audio}
                name={`Voz resposta ${k + 1} ${bloco.id}${parte.existe ? "" : " (FALTA ARQUIVO, mudo)"}`}
                from={t.inicio + parte.inicio}
                durationInFrames={parte.frames}
                layout={parte.existe ? undefined : "none"}
              >
                {parte.existe ? <Html5Audio src={staticFile(parte.audio)} startFrom={Math.round(parte.corteDe * fps)} /> : null}
              </Sequence>
            ))}
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
          {/* Rodada 9: a faixa começa no ponto 1:35 (95 s), não no início do arquivo. */}
          <Html5Audio src={staticFile(SONS.trilha)} volume={volumeMusica} startFrom={Math.round(INICIO_TRILHA_SEGUNDOS * FPS)} />
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
  const base = interpolate(frame, [20, 50], [0, 0.55], clamp);
  const spot = interpolate(frame, [spotlightDe, spotlightDe + 15], [0, 0.45], clamp);
  const some = interpolate(frame, [fim - 24, fim - 8], [1, 0], clamp);
  return <BrilhoRadial x={0.5} y={0.33} raio={0.55 + spot * 0.2} intensidade={(base + spot) * some} />;
};

export const VideoApresentacao: React.FC<VideoApresentacaoProps> = ({ duracoes, ativos, variacaoCta }) => {
  const { fps } = useVideoConfig();
  // A linha do tempo só muda quando as durações dos áudios mudam: calculada uma vez, não a cada frame.
  const linha = useMemo(() => montarLinhaDoTempo(BLOCOS, duracoes ?? {}, fps), [duracoes, fps]);
  return (
    <Camadas linha={linha} duracoes={duracoes ?? {}} ativos={ativos ?? []} variacaoCta={variacaoCta ?? VARIACAO_CTA} />
  );
};
