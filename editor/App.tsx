import React, { useEffect, useMemo, useRef, useState } from "react";
import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import { PlanoComposicao, type PlanoComposicaoProps } from "../src/PlanoComposicao";
import { criarParaFrameCortado } from "../src/utils/tempoCortado";
import { TabelaElementos } from "./TabelaElementos";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { calcularBlocos, paraSegundoOriginal } from "./regrasLinhaDoTempo";
import { criarHistorico, desfazer, podeDesfazer, podeRefazer, refazer, registrar } from "./historico";
import { acaoDoAtalho, ehEditavel } from "./atalhos";
import { aplicarPropriedade } from "./regrasPropriedades";
import { aplicarTransformar, passoTransformar, resetarTransformar } from "./regrasTransformar";
import { aplicarDeslocamento } from "./regrasMinimapa";
import { chaveDoDesenho, juntarMedida, semTransformacao, type Desenho, type EstadoMedida } from "./regrasDesenho";
import { medirDesenho, medirTodos, type MedidaDoQuadro } from "./medirDesenho";
import { CamadaDeEdicao } from "./CamadaDeEdicao";
import { valorTransformar } from "./regrasTransformar";
import { alvoDaCamada, audiosQueUsam, duplicarElemento, moverCamada, quadroComPasso, removerElemento, type DirecaoCamada } from "./regrasInteracao";
import { montarComposicao, type Composicao, type Fundo } from "./regrasAbrir";
import { PainelLateral, type ChaveSecao, type SecoesAbertas } from "./PainelLateral";
import { ALTURA_RODAPE, AvisoNoPalco, Casca, Palco } from "./Casca";
import { COR, VEU, botaoAmarelo, botaoContorno } from "./tema";
import {
  aplicarDuracao,
  aplicarInicio,
  conferirInicio,
  fpsDoPlano,
  nomeDaCopia,
  planoParaTexto,
  somarADuracao,
  somarAoInicio,
  type PlanoEditor,
} from "./regrasPlano";

// Editor (fatias 1 a 6). O App escolhe e carrega um plano de planos/ pelo servidor
// (npm run editor). O Editor (abaixo) é recriado a cada troca de plano: histórico zerado.
// O Vite roda na raiz do projeto, então public/ é servida em "/" e o staticFile("videos/...")
// do PlanoComposicao vira "/videos/...". O plano editado fica SÓ na memória da página; "Salvar"
// grava uma cópia nova em planos/copias/ e "Baixar cópia" manda para Downloads. O original
// nunca é gravado.
//
// Layout (fatia 6): barra fina no topo, vídeo à esquerda sem rolar, painel de ferramentas à
// direita, linha do tempo (ou aba Lista) embaixo. As regras ficam nos arquivos regras*.ts.

type Resultado = { tipo: "ok" | "erro"; texto: string };
type ItemLista = { nome: string; arquivo: string; completo: boolean; motivo: string | null; fps: number | null; orientacao: string | null; video: string | null };
type Aberto = { nome: string; arquivo: string; plano: PlanoEditor; fundo: Fundo };

// Lê a resposta do servidor; se não vier JSON, provavelmente a página foi aberta pelo
// "npm run editor:vite" (sem servidor).
const lerResposta = async (r: Response): Promise<Record<string, unknown>> => {
  try {
    return (await r.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`O servidor do editor não respondeu (código ${r.status}). Abra com "npm run editor".`);
  }
};

const buscar = async (rota: string) => {
  const r = await fetch(rota);
  const d = await lerResposta(r);
  if (!r.ok) throw new Error(String(d.erro ?? `Erro ${r.status}`));
  return d;
};

const postar = (rota: string, corpo: unknown) =>
  fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

// Salvar: 1) grava a cópia em planos/copias/ (nome gerado pelo servidor) 2) roda o validador nela.
const salvarEValidar = async (nomePlano: string, plano: PlanoEditor): Promise<Resultado> => {
  const r1 = await postar("/api/copias", { plano: nomePlano, conteudo: plano });
  const d1 = await lerResposta(r1);
  if (!r1.ok) throw new Error(String(d1.erro ?? `Erro ${r1.status} ao salvar.`));
  const arquivo = String(d1.arquivo);

  const r2 = await postar("/api/validar", { arquivo });
  const d2 = await lerResposta(r2);
  if (!r2.ok) throw new Error(`Cópia salva em planos/copias/${arquivo}, mas o validador falhou: ${String(d2.erro ?? d2.saida ?? r2.status)}`);
  const codigo = d2.codigo;
  return {
    tipo: codigo === 0 ? "ok" : "erro",
    texto: `Cópia salva: planos/copias/${arquivo}\nValidador (código ${String(codigo)}${codigo === 0 ? ", sem erro" : ", COM ERRO"}):\n\n${String(d2.saida ?? "")}`,
  };
};

const baixarCopia = (arquivoOriginal: string, plano: PlanoEditor) => {
  const blob = new Blob([planoParaTexto(plano)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeDaCopia(arquivoOriginal, new Date());
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------- peças pequenas de tela

const rotuloBarra: React.CSSProperties = { fontWeight: 700 };

// Seletor de plano (na barra do topo) + planos incompletos escondidos, num pequeno menu.
const SeletorDePlano: React.FC<{
  lista: ItemLista[] | null;
  escolhido: string;
  carregando: boolean;
  aoEscolher: (nome: string) => void;
}> = ({ lista, escolhido, carregando, aoEscolher }) => {
  const completos = (lista ?? []).filter((p) => p.completo);
  const incompletos = (lista ?? []).filter((p) => !p.completo);
  return (
    <>
      <strong style={rotuloBarra}>Editor JR</strong>
      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span>Plano</span>
        <select
          value={escolhido}
          disabled={lista === null || carregando}
          onChange={(e) => aoEscolher(e.target.value)}
          style={{ font: "inherit", padding: "0.2rem 0.3rem", maxWidth: "20rem" }}
        >
          <option value="">{lista === null ? "carregando a lista…" : "— escolha um plano —"}</option>
          {completos.map((p) => (
            <option key={p.nome} value={p.nome}>
              {p.arquivo} ({p.orientacao}, {p.fps} fps)
            </option>
          ))}
        </select>
      </label>
      {carregando ? <span style={{ opacity: 0.8 }}>abrindo…</span> : null}
      {incompletos.length > 0 ? (
        <details style={{ position: "relative", fontSize: "0.85rem" }}>
          <summary style={{ cursor: "pointer", color: COR.amarelo }}>{incompletos.length} plano(s) incompleto(s)</summary>
          <div
            style={{ position: "absolute", top: "1.6rem", left: 0, zIndex: 10, width: "min(26rem, 80vw)", padding: "0.5rem 0.75rem", background: COR.verde, border: `1px solid ${COR.amarelo}`, borderRadius: "0.25rem" }}
          >
            <div style={{ marginBottom: "0.3rem", opacity: 0.85 }}>Escondidos da lista:</div>
            {incompletos.map((p) => (
              <div key={p.nome}>
                plano incompleto: {p.arquivo} ({p.motivo})
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
};

const Aba: React.FC<{ ativa: boolean; aoClicar: () => void; children: React.ReactNode }> = ({ ativa, aoClicar, children }) => (
  <button
    type="button"
    role="tab"
    aria-selected={ativa}
    onClick={aoClicar}
    style={{
      padding: "0.25rem 0.8rem",
      font: "inherit",
      fontSize: "0.85rem",
      fontWeight: ativa ? 700 : 400,
      color: ativa ? COR.verde : COR.creme,
      background: ativa ? COR.amarelo : "transparent",
      border: "none",
      borderRadius: "0.25rem 0.25rem 0 0",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

// De onde veio cada coisa (seção "Plano e vídeo" do painel lateral).
const Ficha: React.FC<{ aberto: Aberto; plano: PlanoEditor; composicao: Composicao }> = ({ aberto, plano, composicao }) => {
  const { fundo } = aberto;
  const linha: React.CSSProperties = { marginBottom: "0.35rem", overflowWrap: "anywhere" };
  return (
    <div style={{ fontSize: "0.8rem", lineHeight: 1.45 }}>
      <div style={linha}>
        <b>Plano:</b> planos/{aberto.arquivo} · {aberto.plano.orientacao} · {fpsDoPlano(aberto.plano)} fps · {plano.elementos.length} elemento(s)
      </div>
      <div style={linha}>
        <b>Vídeo de fundo:</b>{" "}
        {fundo.videoSrc ? (
          <>
            public/{fundo.videoSrc} (versão v{fundo.versao}, a mais alta de {fundo.procurado})
          </>
        ) : (
          <span style={{ color: COR.vermelho }}>nenhum: procurei {fundo.procurado ?? '(o plano não tem um "video" que sirva de nome)'}</span>
        )}
      </div>
      <div style={linha}>
        <b>Cortes e duração:</b>{" "}
        {composicao.pronta ? composicao.origemDuracao : fundo.cortesArquivo ? fundo.cortesArquivo : "sem arquivo de cortes (um trecho só, do tamanho do vídeo)"}
      </div>
      {composicao.pronta ? (
        <div style={linha}>
          <b>Player:</b> {composicao.width}×{composicao.height}, {composicao.fps} fps, {composicao.durationInFrames} quadros
        </div>
      ) : null}
      {aberto.plano.camera && aberto.plano.camera.length > 0 ? (
        <div style={{ ...linha, color: COR.amarelo }}>Este plano tem trechos de câmera: o editor ainda não mostra a câmera.</div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- App: escolher o plano

export const App: React.FC = () => {
  const [lista, setLista] = useState<ItemLista[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string>("");
  const [aberto, setAberto] = useState<Aberto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroAbrir, setErroAbrir] = useState<string | null>(null);

  useEffect(() => {
    buscar("/api/planos")
      .then((d) => setLista(d.planos as ItemLista[]))
      .catch((e: unknown) => setErroLista(e instanceof Error ? e.message : String(e)));
  }, []);

  const abrir = async (nome: string) => {
    setEscolhido(nome);
    setErroAbrir(null);
    if (nome === "") {
      setAberto(null);
      return;
    }
    setCarregando(true);
    try {
      const q = encodeURIComponent(nome);
      const [p, f] = await Promise.all([buscar(`/api/plano?nome=${q}`), buscar(`/api/fundo?nome=${q}`)]);
      setAberto({ nome, arquivo: String(p.arquivo), plano: p.plano as PlanoEditor, fundo: f as unknown as Fundo });
    } catch (e) {
      setAberto(null);
      setErroAbrir(e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  };

  const seletor = <SeletorDePlano lista={lista} escolhido={escolhido} carregando={carregando} aoEscolher={(n) => void abrir(n)} />;

  if (aberto) return <Editor key={aberto.nome} aberto={aberto} seletor={seletor} />;

  const erro = erroAbrir ?? erroLista;
  return (
    <Casca
      barra={seletor}
      palco={
        <AvisoNoPalco destaque={erro !== null}>
          {erro ?? "Escolha um plano na barra do topo para começar."}
        </AvisoNoPalco>
      }
      lateral={<p style={{ margin: 0, padding: "1rem 0.75rem", opacity: 0.85 }}>Ferramentas aparecem aqui quando você abrir um plano e clicar num bloco.</p>}
    />
  );
};

// ---------------------------------------------------------------- Editor: um plano aberto

const Editor: React.FC<{ aberto: Aberto; seletor: React.ReactNode }> = ({ aberto, seletor }) => {
  const { nome, arquivo, fundo } = aberto;
  const [historico, setHistorico] = useState(() => criarHistorico<PlanoEditor>(aberto.plano));
  const plano = historico.presente;
  // Sobe a cada mudança vinda de fora da caixa de texto (−/+, desfazer, refazer, cor): remonta
  // os campos para os rascunhos mostrarem o valor novo.
  const [versaoExterna, setVersaoExterna] = useState(0);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [frameAtual, setFrameAtual] = useState(0);
  const [duracaoVideo, setDuracaoVideo] = useState<number | null>(null);
  const [erroVideo, setErroVideo] = useState<string | null>(null);
  // O Player só monta depois que o palco é medido; por isso a referência é um estado (assim o
  // efeito da agulha roda quando o Player de fato existe).
  const [player, setPlayer] = useState<PlayerRef | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [aba, setAba] = useState<"linha" | "lista">("linha"); // Lista fica fechada por padrão
  const [abertas, setAbertas] = useState<SecoesAbertas>({ tempo: true, transformar: true, texto: true, cor: true, plano: true });

  // fps, tamanho e duração vêm do plano ABERTO (o original), não da edição: mudar um
  // elemento não muda o tamanho do vídeo.
  const composicao = useMemo(() => montarComposicao(aberto.plano, fundo, duracaoVideo), [aberto.plano, fundo, duracaoVideo]);
  const trechos = composicao.pronta ? composicao.trechos : [];
  const fps = composicao.pronta ? composicao.fps : (fpsDoPlano(aberto.plano) ?? 30);
  const paraFrameCortado = useMemo(() => (trechos.length > 0 ? criarParaFrameCortado(trechos, fps) : null), [trechos, fps]);

  // Agulha: "frameupdate" dispara a cada mudança de tempo, tocando ou procurando
  // (https://www.remotion.dev/docs/player/player#frameupdate).
  useEffect(() => {
    if (!player) return;
    const aoMudarQuadro: CallbackListener<"frameupdate"> = (e) => setFrameAtual(e.detail.frame);
    player.addEventListener("frameupdate", aoMudarQuadro);
    return () => player.removeEventListener("frameupdate", aoMudarQuadro);
  }, [player]);

  // Desenho real do elemento escolhido, medido no DOM do Player (medirDesenho.ts) depois de cada
  // quadro e de cada mudança no plano. Dois requestAnimationFrame: mede depois que o Player já
  // desenhou o quadro/plano novo. A medida vira "base" (sem a escala/posição atual) e fica
  // estável quando dois quadros diferentes seguidos batem (regrasDesenho.ts, juntarMedida).
  const [desenho, setDesenho] = useState<Desenho>({ estado: "sem-player", base: null });
  const [desenhoDoId, setDesenhoDoId] = useState<string | null>(null); // de qual elemento é a medida
  const memoriaDesenho = useRef(new Map<string, EstadoMedida & { chave: string }>());
  const elEscolhido = selecionado === null ? undefined : historico.presente.elementos[selecionado];
  // Overlay do vídeo: caixas de TODOS os elementos na tela neste quadro (medirTodos).
  const [medidaQuadro, setMedidaQuadro] = useState<MedidaDoQuadro | null>(null);
  useEffect(() => {
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => {
        setMedidaQuadro(medirTodos(player?.getContainerNode() ?? null, historico.presente.elementos.map((e) => e.id)));
        if (!elEscolhido) return;
        setDesenhoDoId(elEscolhido.id);
        const r = medirDesenho(player?.getContainerNode() ?? null, elEscolhido.id);
        const chave = chaveDoDesenho(elEscolhido as unknown as Record<string, unknown>);
        const guardada = memoriaDesenho.current.get(elEscolhido.id);
        const atual = guardada && guardada.chave === chave ? guardada : { chave, anterior: null, estavel: null };
        if (r.estado !== "medido") {
          setDesenho({ estado: r.estado, base: atual.estavel });
          return;
        }
        const base = semTransformacao(r.desenho, valorTransformar(elEscolhido, "escala"), valorTransformar(elEscolhido, "x"), valorTransformar(elEscolhido, "y"));
        const novo = { chave, ...juntarMedida(atual, { quadro: frameAtual, base }) };
        memoriaDesenho.current.set(elEscolhido.id, novo);
        setDesenho(novo.estavel ? { estado: "estavel", base: novo.estavel } : { estado: "animando", base });
      });
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [player, elEscolhido, frameAtual, historico.presente]);

  // Camadas: a ordem do elemento na lista decide quem fica na frente (PlanoComposicao desenha na
  // ordem do array). Trocar = mudar a posição na lista, passando pelo histórico (desfazer);
  // a seleção acompanha o elemento, e a linha do tempo e a lista se redesenham.
  const podeCamada = (direcao: DirecaoCamada) => selecionado !== null && alvoDaCamada(plano, selecionado, direcao) !== null;
  // Duplicar (Ctrl+D / botão): cópia logo acima, 0,5 s depois, id novo (regrasInteracao.ts).
  const duplicar = () => {
    if (selecionado === null) return;
    const r = duplicarElemento(plano, selecionado);
    if (r === null) return;
    setHistorico((h) => registrar(h, r.plano, null));
    setSelecionado(r.indice);
    setVersaoExterna((v) => v + 1);
  };

  const trocarCamada = (direcao: DirecaoCamada) => {
    if (selecionado === null) return;
    const r = moverCamada(plano, selecionado, direcao);
    if (r === null) return;
    setHistorico((h) => registrar(h, r.plano, null));
    setSelecionado(r.indice);
    setVersaoExterna((v) => v + 1);
  };

  // Teclado, só com o foco FORA de caixa de texto (regra em atalhos.ts):
  // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z, espaço, ← →, Shift+← →, Delete, Ctrl+] e Ctrl+[.
  const totalQuadros = composicao.pronta ? composicao.durationInFrames : 0;
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const acao = acaoDoAtalho({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        alvoEditavel: ehEditavel(e.target),
      });
      if (acao === null) return;
      e.preventDefault();
      if (acao === "desfazer" || acao === "refazer") {
        setHistorico((h) => (acao === "desfazer" ? desfazer(h) : refazer(h)));
        setVersaoExterna((v) => v + 1);
        return;
      }
      if (acao === "duplicar") {
        duplicar();
        return;
      }
      if (acao === "paraFrente" || acao === "paraTras") {
        trocarCamada(acao === "paraFrente" ? "frente" : "tras");
        return;
      }
      if (acao === "tocar") {
        // Tira o foco do botão clicado antes, senão o espaço também "aperta" o botão.
        if (e.target instanceof HTMLElement && e.target !== document.body) e.target.blur();
        player?.toggle();
        return;
      }
      if (acao === "remover") {
        if (selecionado === null) return;
        const el = plano.elementos[selecionado];
        if (!el) return;
        const usam = audiosQueUsam(plano, el.id);
        if (usam.length > 0) {
          setResultado({ tipo: "erro", texto: `Não apaguei "${el.id}": o efeito de áudio ${usam.map((a) => `"${a}"`).join(", ")} começa junto dele (audio[].elemento). Mude o áudio primeiro.` });
          return;
        }
        setHistorico((h) => registrar(h, removerElemento(h.presente, selecionado), null));
        setSelecionado(null);
        setVersaoExterna((v) => v + 1);
        return;
      }
      // Setas: 1 quadro; com Shift, 1 segundo (o fps do plano).
      if (!player || totalQuadros === 0) return;
      const passo = acao === "quadroAntes" ? -1 : acao === "quadroDepois" ? 1 : acao === "segundoAntes" ? -fps : fps;
      player.seekTo(quadroComPasso(player.getCurrentFrame(), passo, totalQuadros));
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [player, selecionado, plano, fps, totalQuadros]);

  // Régua e agulha: tempo original → quadro do vídeo cortado → seekTo.
  const procurar = (segundoOriginal: number) => {
    if (!player || paraFrameCortado === null || totalQuadros === 0) return;
    player.seekTo(quadroComPasso(paraFrameCortado(segundoOriginal), 0, totalQuadros));
  };

  // digitando = mesma "chave" junta as teclas num passo só do desfazer
  const mudar = (transformar: (p: PlanoEditor) => PlanoEditor, chave: string | null, externo: boolean) => {
    setHistorico((h) => registrar(h, transformar(h.presente), chave));
    if (externo) setVersaoExterna((v) => v + 1);
  };

  const passoInicio = (i: number, passo: number) =>
    mudar(
      (p) => {
        const texto = somarAoInicio(p.elementos[i].inicio, passo);
        return texto === null ? p : aplicarInicio(p, i, texto);
      },
      null,
      true,
    );

  const passoDuracao = (i: number, passo: number) =>
    mudar(
      (p) => {
        const f = fpsDoPlano(p);
        if (f === null) return p;
        const segundos = somarADuracao(p.elementos[i].duracao, passo, f);
        return segundos === null ? p : aplicarDuracao(p, i, segundos);
      },
      null,
      true,
    );

  // Selecionar = pular para o início do elemento: tempo original → quadro do vídeo cortado →
  // seekTo (https://www.remotion.dev/docs/player/player#playerref).
  const irPara = (i: number) => {
    setSelecionado(i);
    const inicio = conferirInicio(plano.elementos[i].inicio);
    if (!inicio.ok || paraFrameCortado === null) return;
    player?.seekTo(paraFrameCortado(inicio.segundos));
  };

  const voltar = () => {
    setHistorico((h) => desfazer(h));
    setVersaoExterna((v) => v + 1);
  };
  const avancar = () => {
    setHistorico((h) => refazer(h));
    setVersaoExterna((v) => v + 1);
  };

  const salvar = async () => {
    setSalvando(true);
    setResultado(null);
    try {
      setResultado(await salvarEValidar(nome, plano));
    } catch (erro) {
      setResultado({ tipo: "erro", texto: erro instanceof Error ? erro.message : String(erro) });
    } finally {
      setSalvando(false);
    }
  };

  const alternar = (chave: ChaveSecao) => setAbertas((a) => ({ ...a, [chave]: !a[chave] }));

  const props: PlanoComposicaoProps | null = useMemo(
    () => (composicao.pronta ? { videoSrc: composicao.videoSrc, plano, cortes: { trechos: composicao.trechos } } : null),
    [composicao, plano],
  );

  const { blocos, faixas, regua } = useMemo(() => calcularBlocos(plano, trechos), [plano, trechos]);
  const agulhaSeg = trechos.length > 0 ? paraSegundoOriginal(trechos, frameAtual, fps) : 0;

  const barra = (
    <>
      {seletor}
      <span aria-hidden style={{ width: 1, alignSelf: "stretch", background: VEU.linha }} />
      <button type="button" style={botaoContorno} disabled={!podeDesfazer(historico)} onClick={voltar} title="Desfazer (Ctrl+Z, fora das caixas de texto)">
        ↶ Desfazer
      </button>
      <button type="button" style={botaoContorno} disabled={!podeRefazer(historico)} onClick={avancar} title="Refazer (Ctrl+Y ou Ctrl+Shift+Z, fora das caixas de texto)">
        ↷ Refazer
      </button>
      <span style={{ fontSize: "0.8rem", opacity: 0.8 }} title="O histórico fica só na memória e zera ao trocar de plano">
        {historico.passado.length} passo(s)
      </span>
      <span style={{ flex: 1 }} />
      <button type="button" style={botaoContorno} onClick={() => baixarCopia(arquivo, plano)} title="Manda o plano editado para a pasta Downloads (reserva)">
        Baixar cópia
      </button>
      <button type="button" style={botaoAmarelo} disabled={salvando} onClick={salvar} title="Grava uma cópia nova em planos/copias/ e roda o validador nela. O original nunca é gravado.">
        {salvando ? "Salvando…" : "Salvar"}
      </button>
    </>
  );

  const palco = (
    <>
      {/* Sem cortes: o navegador lê a duração do vídeo (só os metadados, sem baixar tudo). */}
      {composicao.pronta === false && composicao.precisaDuracaoDoVideo && fundo.videoSrc ? (
        <video
          src={`/${fundo.videoSrc}`}
          preload="metadata"
          muted
          style={{ display: "none" }}
          onLoadedMetadata={(e) => setDuracaoVideo(e.currentTarget.duration)}
          onError={() => setErroVideo(`O navegador não conseguiu abrir /${fundo.videoSrc} para ler a duração.`)}
        />
      ) : null}
      {composicao.pronta && props ? (
        <Palco proporcao={composicao.width / composicao.height}>
          {(largura, altura) => (
            // O overlay fica no MESMO quadrado do Player, por cima (CamadaDeEdicao.tsx).
            <div style={{ position: "relative", width: largura, height: altura }}>
            <Player
              ref={setPlayer}
              component={PlanoComposicao}
              inputProps={props}
              durationInFrames={composicao.durationInFrames}
              compositionWidth={composicao.width}
              compositionHeight={composicao.height}
              fps={composicao.fps}
              controls
              // O espaço é tratado pelo editor (atalhos.ts); desligado aqui para não alternar 2 vezes.
              spaceKeyToPlayOrPause={false}
              acknowledgeRemotionLicense
              style={{ width: largura, height: altura }}
            />
            <CamadaDeEdicao
              plano={plano}
              medida={medidaQuadro}
              selecionado={selecionado}
              baseDoEscolhido={desenho.estado === "estavel" && desenhoDoId === elEscolhido?.id ? desenho.base : null}
              aoSelecionar={setSelecionado}
              aoMover={(i, x, y, sessao) => mudar((p) => aplicarDeslocamento(p, i, x, y), `arraste:${sessao}`, false)}
              aoEscalar={(i, escala, sessao) => mudar((p) => aplicarTransformar(p, i, "escala", escala), `arraste:${sessao}`, false)}
              aoTerminar={() => setVersaoExterna((v) => v + 1)}
            />
            </div>
          )}
        </Palco>
      ) : (
        <AvisoNoPalco destaque>{erroVideo ?? (composicao.pronta ? null : composicao.motivo)}</AvisoNoPalco>
      )}
    </>
  );

  const rodape = (
    <>
      <div role="tablist" style={{ flex: "none", display: "flex", gap: "0.25rem", padding: "0.3rem 0.75rem 0", borderBottom: `1px solid ${VEU.linha}` }}>
        <Aba ativa={aba === "linha"} aoClicar={() => setAba("linha")}>
          Linha do tempo
        </Aba>
        <Aba ativa={aba === "lista"} aoClicar={() => setAba("lista")}>
          Lista ({plano.elementos.length})
        </Aba>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0.5rem 0.75rem" }}>
        {aba === "linha" ? (
          <LinhaDoTempo
            blocos={blocos}
            faixas={faixas}
            regua={regua}
            agulhaSeg={agulhaSeg}
            selecionado={selecionado}
            fps={fpsDoPlano(plano)}
            aoClicar={irPara}
            aoSelecionar={setSelecionado}
            aoProcurar={procurar}
            // Um arraste inteiro = um passo do desfazer (mesma "chave" durante o arraste).
            aoArrastarInicio={(i, inicio, sessao) => mudar((p) => aplicarInicio(p, i, inicio), `arraste:${sessao}`, false)}
            aoArrastarDuracao={(i, segundos, sessao) => mudar((p) => aplicarDuracao(p, i, segundos), `arraste:${sessao}`, false)}
            aoFimArraste={() => setVersaoExterna((v) => v + 1)}
          />
        ) : (
          <TabelaElementos
            key={versaoExterna}
            plano={plano}
            selecionado={selecionado}
            aoMudarInicio={(i, inicio) => mudar((p) => aplicarInicio(p, i, inicio), `${plano.elementos[i].id}:inicio`, false)}
            aoMudarDuracao={(i, segundos) => mudar((p) => aplicarDuracao(p, i, segundos), `${plano.elementos[i].id}:duracao`, false)}
            aoPassoInicio={passoInicio}
            aoPassoDuracao={passoDuracao}
            aoSelecionar={irPara}
          />
        )}
      </div>
    </>
  );

  const lateral = (
    <PainelLateral
      plano={plano}
      indice={selecionado}
      versaoExterna={versaoExterna}
      abertas={abertas}
      aoAlternar={alternar}
      aoLimpar={() => setSelecionado(null)}
      podeFrente={podeCamada("frente")}
      podeTras={podeCamada("tras")}
      aoCamada={trocarCamada}
      aoMudarInicio={(i, inicio) => mudar((p) => aplicarInicio(p, i, inicio), `${plano.elementos[i].id}:inicio`, false)}
      aoMudarDuracao={(i, segundos) => mudar((p) => aplicarDuracao(p, i, segundos), `${plano.elementos[i].id}:duracao`, false)}
      aoPassoInicio={passoInicio}
      aoPassoDuracao={passoDuracao}
      aoMudarPropriedade={(i, dentroDe, campo, valor, digitando) =>
        mudar(
          (p) => aplicarPropriedade(p, i, dentroDe, campo, valor),
          digitando ? `${plano.elementos[i].id}:${dentroDe ?? ""}:${campo.campo}` : null,
          !digitando,
        )
      }
      aoMudarTransformar={(i, campo, valor) => mudar((p) => aplicarTransformar(p, i, campo, valor), `${plano.elementos[i].id}:transformar:${campo}`, false)}
      aoPassoTransformar={(i, campo, sinal) => mudar((p) => passoTransformar(p, i, campo, sinal), null, true)}
      aoResetarTransformar={(i) => mudar((p) => resetarTransformar(p, i), null, true)}
      // Minimapa: um arraste inteiro = um passo do desfazer (mesma sessão); no fim, os campos remontam.
      aoMoverNoMinimapa={(i, x, y, sessao) => mudar((p) => aplicarDeslocamento(p, i, x, y), `arraste:${sessao}`, false)}
      aoEscalarNoMinimapa={(i, escala, sessao) => mudar((p) => aplicarTransformar(p, i, "escala", escala), `arraste:${sessao}`, false)}
      aoTerminarMinimapa={() => setVersaoExterna((v) => v + 1)}
      desenho={desenhoDoId === elEscolhido?.id ? desenho : { estado: "fora", base: null }}
      podeDuplicar={selecionado !== null}
      aoDuplicar={duplicar}
      ficha={<Ficha aberto={aberto} plano={plano} composicao={composicao} />}
    />
  );

  // Resultado do Salvar: caixa flutuante chapada, acima do rodapé, que se fecha.
  const flutuante = resultado ? (
    <div
      role="status"
      style={{
        position: "fixed",
        right: "0.75rem",
        bottom: `calc(${ALTURA_RODAPE} + 0.6rem)`,
        zIndex: 20,
        width: "min(32rem, 92vw)",
        maxHeight: "42vh",
        overflow: "auto",
        padding: "0.6rem 0.75rem",
        background: COR.verde,
        border: `2px solid ${resultado.tipo === "ok" ? COR.amarelo : COR.vermelho}`,
        borderRadius: "0.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
        <strong style={{ color: resultado.tipo === "ok" ? COR.amarelo : COR.vermelho }}>{resultado.tipo === "ok" ? "Salvo" : "Problema ao salvar"}</strong>
        <button type="button" onClick={() => setResultado(null)} style={{ ...botaoContorno, padding: "0.1rem 0.5rem" }}>
          fechar
        </button>
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>{resultado.texto}</pre>
    </div>
  ) : null;

  return <Casca barra={barra} palco={palco} lateral={lateral} rodape={rodape} flutuante={flutuante} />;
};
