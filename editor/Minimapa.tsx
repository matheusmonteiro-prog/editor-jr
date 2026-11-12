import React, { useEffect, useRef, useState } from "react";
import type { ElementoEditor, PlanoEditor } from "./regrasPlano";
import { valorTransformar } from "./regrasTransformar";
import { caixaDaPeca, caixaDoDesenho, deslocamentoArrastado, escalaDoCanto, geometria, origemDaEscala, tamanhoDaTela } from "./regrasMinimapa";
import type { Desenho } from "./regrasDesenho";
import { COR, VEU } from "./tema";

// Minimapa da tela (seção "Transformar"): a tela na proporção do plano e a caixa do elemento
// escolhido. Arrastar a caixa = deslocamento; puxar um canto = escala; duplo clique = normal.
// Contas: regrasMinimapa.ts. Gravação e limites: regrasTransformar.ts (via quem usa).
// Um arraste inteiro usa a MESMA sessão (chave do histórico) = 1 passo do desfazer.

type Arraste =
  | { tipo: "mover"; sessao: string; px0: number; py0: number; x0: number; y0: number }
  | { tipo: "canto"; sessao: string; px0: number; py0: number; escala0: number; centroX: number; centroY: number };

let contadorSessao = 0;

export const Minimapa: React.FC<{
  plano: PlanoEditor;
  el: ElementoEditor;
  aoMover: (x: number, y: number, sessao: string) => void;
  aoEscalar: (escala: number, sessao: string) => void;
  aoTerminar: () => void; // fim do arraste: os campos numéricos remontam com o valor novo
  aoResetar: () => void;
  desenho: Desenho; // desenho real medido no Player (App.tsx + medirDesenho.ts)
}> = ({ plano, el, aoMover, aoEscalar, aoTerminar, aoResetar, desenho }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(240);
  const [arraste, setArraste] = useState<Arraste | null>(null);

  useEffect(() => {
    const no = ref.current;
    if (!no) return;
    const medir = () => setLargura(no.clientWidth || 240);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(no);
    return () => obs.disconnect();
  }, []);

  const g = geometria(plano, largura);
  const escala = valorTransformar(el, "escala");
  const x = valorTransformar(el, "x");
  const y = valorTransformar(el, "y");
  // Caixa: o desenho real medido (com a escala/posição de agora). Sem Player (plano sem vídeo de
  // fundo): a camada de tela cheia, como antes. Fora do tempo: a última medida estável, em cinza.
  const ativo = desenho.estado === "estavel" || desenho.estado === "animando" || desenho.estado === "sem-player";
  const c = desenho.base ? caixaDoDesenho(g, desenho.base, escala, x, y) : desenho.estado === "sem-player" ? caixaDaPeca(g, escala, x, y) : null;
  const origem = origemDaEscala(g, x, y);
  const aviso =
    desenho.estado === "fora"
      ? "Leve a agulha até o elemento para medir o desenho."
      : desenho.estado === "vazio"
        ? "Neste quadro a peça não desenha nada visível."
        : desenho.estado === "animando"
          ? "Medindo (a peça ainda está animando)…"
          : desenho.estado === "sem-player"
            ? "Sem vídeo de fundo: a caixa mostra a camada da peça (tela inteira)."
            : "";
  const { largura: telaPx, altura: telaPxA } = tamanhoDaTela(plano);

  const ponto = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const comecar = (e: React.PointerEvent, tipo: "mover" | "canto") => {
    if (e.button !== 0 || !ativo || !c) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = ponto(e);
    const sessao = `minimapa:${el.id}:${++contadorSessao}`;
    setArraste(
      tipo === "mover"
        ? { tipo, sessao, px0: p.x, py0: p.y, x0: x, y0: y }
        : { tipo, sessao, px0: p.x, py0: p.y, escala0: escala, centroX: origem.x, centroY: origem.y },
    );
  };

  const mover = (e: React.PointerEvent) => {
    if (!arraste) return;
    const p = ponto(e);
    if (arraste.tipo === "mover") {
      const d = deslocamentoArrastado(g, arraste.x0, arraste.y0, p.x - arraste.px0, p.y - arraste.py0);
      aoMover(d.x, d.y, arraste.sessao);
    } else {
      aoEscalar(escalaDoCanto(arraste.escala0, { x: arraste.centroX, y: arraste.centroY }, { x: arraste.px0, y: arraste.py0 }, p), arraste.sessao);
    }
  };

  const soltar = () => {
    if (!arraste) return;
    setArraste(null);
    aoTerminar();
  };

  const alca = 10;
  const cantos = !c || !ativo ? [] : [
    [c.esquerda, c.topo],
    [c.esquerda + c.largura, c.topo],
    [c.esquerda, c.topo + c.altura],
    [c.esquerda + c.largura, c.topo + c.altura],
  ];
  const corCaixa = ativo ? COR.amarelo : "rgba(245,240,230,0.45)";

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div
        ref={ref}
        style={{ position: "relative", width: "100%", height: g.molduraA, overflow: "hidden", background: VEU.leve, borderRadius: "0.25rem", touchAction: "none", userSelect: "none" }}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        {/* a tela do vídeo, na proporção do plano */}
        <div
          title={`Tela ${telaPx}×${telaPxA}`}
          style={{ position: "absolute", left: g.origemX, top: g.origemY, width: g.telaL, height: g.telaA, background: COR.verde, border: `1px solid ${COR.creme}`, boxSizing: "border-box" }}
        >
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: 3, background: VEU.linha }} />
        </div>
        {/* a caixa do desenho da peça */}
        {c ? (
          <div
            role="slider"
            aria-label={`posição de ${el.id} na tela (arraste; duplo clique volta ao normal)`}
            aria-valuetext={`x ${x}, y ${y}, escala ${escala}`}
            aria-disabled={!ativo}
            title={ativo ? "Arraste para mover; puxe um canto para mudar a escala; duplo clique volta ao normal" : "Leve a agulha até o elemento"}
            onPointerDown={(e) => comecar(e, "mover")}
            onDoubleClick={ativo ? aoResetar : undefined}
            style={{
              position: "absolute",
              left: c.esquerda,
              top: c.topo,
              width: c.largura,
              height: c.altura,
              border: `2px ${desenho.estado === "animando" ? "dashed" : "solid"} ${corCaixa}`,
              background: ativo ? "rgba(239,175,32,0.15)" : "rgba(245,240,230,0.08)",
              boxSizing: "border-box",
              cursor: !ativo ? "not-allowed" : arraste?.tipo === "mover" ? "grabbing" : "grab",
            }}
          />
        ) : null}
        {cantos.map(([cx, cy], i) => (
          <div
            key={i}
            aria-hidden
            title="Puxe para mudar a escala"
            onPointerDown={(e) => comecar(e, "canto")}
            onDoubleClick={aoResetar}
            style={{ position: "absolute", left: cx - alca / 2, top: cy - alca / 2, width: alca, height: alca, background: COR.amarelo, border: `1px solid ${COR.verde}`, cursor: i === 0 || i === 3 ? "nwse-resize" : "nesw-resize" }}
          />
        ))}
      </div>
      <div style={{ fontSize: "0.7rem", opacity: 0.75, marginTop: "0.2rem" }}>
        {aviso || "A caixa amarela é o desenho da peça. A escala cresce a partir do centro da tela. Duplo clique: normal."}
      </div>
    </div>
  );
};
