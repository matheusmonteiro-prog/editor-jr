import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { marcasDaRegua, type Bloco } from "./regrasLinhaDoTempo";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  duracaoArrastada,
  inicioArrastado,
  passoDoRotulo,
  proximoZoom,
  segundoDoPonto,
  segundosDoDeslocamento,
} from "./regrasInteracao";
import { COR, VEU, botaoContorno } from "./tema";
import type { BlocoAudio } from "./regrasBiblioteca";

// Linha do tempo (pacote A). Uma faixa por camada, um bloco por elemento.
//   - clicar no bloco: seleciona e o Player pula para o início dele
//   - arrastar o bloco: muda o início; puxar a ponta direita: muda a duração (décimos de segundo)
//   - clicar ou arrastar na régua (ou na agulha): o Player vai junto
//   - zoom: botões − e +, ou Ctrl + roda do mouse em cima da linha do tempo
// As contas ficam em regrasInteracao.ts; quem muda o plano é o App (aplicarInicio/aplicarDuracao,
// passando pelo histórico: um arraste inteiro = um passo do desfazer).

type Props = {
  blocos: Bloco[];
  faixas: number;
  regua: number; // segundos (tempo ORIGINAL)
  agulhaSeg: number; // posição atual do Player, convertida para tempo original
  selecionado: number | null; // índice do elemento
  fps: number | null; // do plano (para conferir a duração ao esticar)
  aoClicar: (indice: number) => void; // seleciona e pula
  aoSelecionar: (indice: number) => void; // só seleciona (começo de um arraste)
  aoProcurar: (segundoOriginal: number) => void; // régua e agulha
  aoArrastarInicio: (indice: number, inicio: string, sessao: string) => void;
  aoArrastarDuracao: (indice: number, segundos: number, sessao: string) => void;
  aoFimArraste: () => void;
  // Faixa de áudio (pacote B): só ver e selecionar (Delete apaga, pelo histórico). Sem arrastar.
  audios: BlocoAudio[];
  audioSelecionado: number | null;
  aoSelecionarAudio: (indice: number) => void;
};

const ALTURA_FAIXA = "1.7rem";
const ALTURA_REGUA = "1.4rem";
const LIMIAR_PX = 3; // abaixo disso é clique, não arraste

type Arraste =
  | { tipo: "mover" | "esticar"; indice: number; x0: number; inicio0: number; duracao0: number; sessao: string; moveu: boolean }
  | { tipo: "agulha" };

export const LinhaDoTempo: React.FC<Props> = ({
  blocos,
  faixas,
  regua,
  agulhaSeg,
  selecionado,
  fps,
  aoClicar,
  aoSelecionar,
  aoProcurar,
  aoArrastarInicio,
  aoArrastarDuracao,
  aoFimArraste,
  audios,
  audioSelecionado,
  aoSelecionarAudio,
}) => {
  const [zoom, setZoom] = useState(1);
  const [largura, setLargura] = useState(0);
  const rolagem = useRef<HTMLDivElement>(null); // a caixa que rola para os lados
  const conteudo = useRef<HTMLDivElement>(null); // o conteúdo com zoom (largura = zoom × caixa)
  const arraste = useRef<Arraste | null>(null);
  const ignorarClique = useRef(false);
  const contadorSessao = useRef(0);

  const nFaixas = Math.max(1, faixas);
  const agulhaPct = Math.min(100, Math.max(0, (agulhaSeg / regua) * 100));
  const marcas = marcasDaRegua(regua, passoDoRotulo(largura > 0 ? largura / regua : 0));

  // Largura real do conteúdo (para a régua não amontoar números).
  useLayoutEffect(() => {
    const el = conteudo.current;
    if (!el) return;
    const medir = () => setLargura(el.getBoundingClientRect().width);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Ao mudar o zoom, a agulha fica à vista (no meio da caixa).
  useLayoutEffect(() => {
    const r = rolagem.current;
    const c = conteudo.current;
    if (!r || !c) return;
    r.scrollLeft = Math.max(0, (agulhaPct / 100) * c.getBoundingClientRect().width - r.clientWidth / 2);
    // só quando o zoom muda (não a cada quadro do Player)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // Ctrl + roda do mouse = zoom. Ouvinte nativo com passive:false: só assim o preventDefault
  // impede o zoom da página inteira do navegador.
  useEffect(() => {
    const r = rolagem.current;
    if (!r) return;
    const aoRodar = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => proximoZoom(z, e.deltaY < 0 ? 1 : -1));
    };
    r.addEventListener("wheel", aoRodar, { passive: false });
    return () => r.removeEventListener("wheel", aoRodar);
  }, []);

  const retangulo = () => conteudo.current?.getBoundingClientRect() ?? null;

  // ---------- régua e agulha
  const procurarNoPonto = (xCliente: number) => {
    const r = retangulo();
    if (r) aoProcurar(segundoDoPonto(xCliente, r.left, r.width, regua));
  };
  const reguaDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { tipo: "agulha" };
    procurarNoPonto(e.clientX);
  };
  const reguaMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (arraste.current?.tipo === "agulha") procurarNoPonto(e.clientX);
  };
  const reguaUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    arraste.current = null;
  };

  // ---------- blocos
  const blocoDown = (e: React.PointerEvent<HTMLButtonElement>, b: Bloco) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const naAlca = (e.target as HTMLElement).dataset.alca === "1";
    contadorSessao.current += 1;
    arraste.current = {
      tipo: naAlca ? "esticar" : "mover",
      indice: b.indice,
      x0: e.clientX,
      inicio0: b.inicioSeg,
      duracao0: b.duracaoSeg,
      sessao: `${b.id}:${naAlca ? "duracao" : "inicio"}:${contadorSessao.current}`,
      moveu: false,
    };
  };
  const blocoMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const a = arraste.current;
    if (!a || a.tipo === "agulha") return;
    const dx = e.clientX - a.x0;
    if (!a.moveu && Math.abs(dx) < LIMIAR_PX) return;
    if (!a.moveu) {
      a.moveu = true;
      aoSelecionar(a.indice);
    }
    const r = retangulo();
    if (!r) return;
    const delta = segundosDoDeslocamento(dx, r.width, regua);
    if (a.tipo === "mover") {
      const texto = inicioArrastado(a.inicio0, delta);
      if (texto !== null) aoArrastarInicio(a.indice, texto, a.sessao);
    } else if (fps !== null) {
      const segundos = duracaoArrastada(a.duracao0, delta, fps);
      if (segundos !== null) aoArrastarDuracao(a.indice, segundos, a.sessao);
    }
  };
  const blocoUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const a = arraste.current;
    arraste.current = null;
    if (a && a.tipo !== "agulha" && a.moveu) {
      ignorarClique.current = true; // o "click" que o navegador manda depois não é clique
      aoFimArraste();
    }
    e.currentTarget.blur(); // o espaço depois não "aperta" o bloco: é tocar/pausar
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", fontSize: "0.75rem", marginBottom: "0.3rem" }}>
        <span style={{ opacity: 0.8 }}>
          Régua em tempo ORIGINAL (antes dos cortes). Arraste o bloco para mudar o início; puxe a ponta direita para a duração. Faixa mais
          alta = mais à frente do vídeo.
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.8 }}>Zoom</span>
        <button type="button" style={{ ...botaoContorno, padding: "0 0.5rem" }} disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => proximoZoom(z, -1))} title="Afastar (Ctrl + roda do mouse)">
          −
        </button>
        <span style={{ minWidth: "2.6rem", textAlign: "center" }}>{zoom}×</span>
        <button type="button" style={{ ...botaoContorno, padding: "0 0.5rem" }} disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => proximoZoom(z, 1))} title="Aproximar (Ctrl + roda do mouse)">
          +
        </button>
      </div>

      <div ref={rolagem} style={{ overflowX: "auto", overflowY: "hidden", background: VEU.leve, borderRadius: "0.25rem" }}>
        <div ref={conteudo} style={{ position: "relative", width: `${zoom * 100}%`, paddingBottom: "0.2rem" }}>
          {/* Régua: clicar ou arrastar leva o Player junto */}
          <div
            onPointerDown={reguaDown}
            onPointerMove={reguaMove}
            onPointerUp={reguaUp}
            onPointerCancel={reguaUp}
            title="Clique ou arraste para mover o vídeo"
            style={{ position: "relative", height: ALTURA_REGUA, borderBottom: `1px solid ${VEU.linha}`, cursor: "ew-resize", touchAction: "none", userSelect: "none" }}
          >
            {marcas.map((m) => (
              <div
                key={m.seg}
                style={{ position: "absolute", left: `${m.pct}%`, bottom: 0, height: m.rotulo ? "0.55rem" : "0.3rem", borderLeft: `1px solid ${VEU.linha}`, pointerEvents: "none" }}
              >
                {m.rotulo ? <span style={{ position: "absolute", bottom: "0.55rem", left: "0.15rem", fontSize: "0.7rem", whiteSpace: "nowrap" }}>{m.rotulo}</span> : null}
              </div>
            ))}
            {/* Cabeça da agulha (arrastar a régua = arrastar a agulha) */}
            <div
              style={{
                position: "absolute",
                left: `calc(${agulhaPct}% - 0.35rem)`,
                bottom: 0,
                width: "0.7rem",
                height: "0.7rem",
                background: COR.vermelho,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Faixas */}
          <div style={{ position: "relative", height: `calc(${nFaixas} * ${ALTURA_FAIXA} + 0.25rem)` }}>
            {Array.from({ length: nFaixas }, (_, f) => (
              <div
                key={f}
                style={{ position: "absolute", left: 0, right: 0, top: `calc(${f} * ${ALTURA_FAIXA} + 0.1rem)`, height: `calc(${ALTURA_FAIXA} - 0.2rem)`, background: VEU.leve }}
              />
            ))}
            {blocos.map((b) => {
              const ativo = b.indice === selecionado;
              // faixa maior = mais à frente = mais perto do topo da área
              const fila = nFaixas - 1 - b.faixa;
              return (
                <button
                  key={b.id}
                  type="button"
                  title={`${b.rotulo} · ${b.id} · início ${b.inicioSeg.toFixed(1)} s · ${b.duracaoSeg.toFixed(2)} s · camada ${b.faixa + 1} de ${nFaixas}`}
                  onPointerDown={(e) => blocoDown(e, b)}
                  onPointerMove={blocoMove}
                  onPointerUp={blocoUp}
                  onPointerCancel={blocoUp}
                  onClick={() => {
                    if (ignorarClique.current) {
                      ignorarClique.current = false;
                      return;
                    }
                    aoClicar(b.indice);
                  }}
                  style={{
                    position: "absolute",
                    left: `${b.esquerdaPct}%`,
                    width: `max(${b.larguraPct}%, 0.6rem)`,
                    top: `calc(${fila} * ${ALTURA_FAIXA} + 0.2rem)`,
                    height: `calc(${ALTURA_FAIXA} - 0.4rem)`,
                    padding: "0 0.6rem 0 0.4rem",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    textAlign: "left",
                    font: "inherit",
                    fontSize: "0.75rem",
                    color: COR.verde,
                    background: ativo ? COR.amarelo : COR.creme,
                    border: ativo ? `2px solid ${COR.creme}` : `1px solid ${VEU.linha}`,
                    borderRadius: "0.25rem",
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                  }}
                >
                  {b.rotulo} · {b.id}
                  {/* Alça da ponta direita: puxar muda a duração */}
                  <span
                    data-alca="1"
                    aria-hidden
                    style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "0.5rem", cursor: "ew-resize", background: "rgba(15,42,29,0.25)" }}
                  />
                </button>
              );
            })}
            {/* Agulha */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${agulhaPct}%`, width: 2, background: COR.vermelho, pointerEvents: "none" }} />
          </div>
          {/* Faixa de áudio: música = a régua toda; efeito = marcador no início dele */}
          <div style={{ position: "relative", height: ALTURA_FAIXA, marginTop: "0.2rem", background: VEU.leve }} title="Áudio do plano (audio[])">
            {audios.length === 0 ? (
              <span style={{ position: "absolute", left: "0.4rem", top: "0.2rem", fontSize: "0.7rem", opacity: 0.6 }}>♪ sem áudio (adicione pela aba Biblioteca)</span>
            ) : null}
            {audios.map((a) => {
              const escolhido = a.indice === audioSelecionado;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => aoSelecionarAudio(a.indice)}
                  title={`${a.tipo === "musica" ? "música" : "efeito"} · ${a.id} · ${a.arquivo}${a.tipo === "musica" ? "" : ` · início ${a.inicioSeg.toFixed(1)} s`} · Delete apaga`}
                  style={{
                    position: "absolute",
                    left: `${a.esquerdaPct}%`,
                    width: `${a.larguraPct}%`,
                    top: a.tipo === "musica" ? "55%" : "0.15rem",
                    bottom: a.tipo === "musica" ? "0.15rem" : "45%",
                    minWidth: "0.5rem",
                    padding: "0 0.25rem",
                    font: "inherit",
                    fontSize: "0.65rem",
                    textAlign: "left",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    color: COR.verde,
                    background: a.tipo === "musica" ? "rgba(245,240,230,0.55)" : "#8FD3FF",
                    border: escolhido ? `2px solid ${COR.amarelo}` : "1px solid rgba(0,0,0,0.3)",
                    borderRadius: "0.2rem",
                    cursor: "pointer",
                  }}
                >
                  ♪ {a.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
