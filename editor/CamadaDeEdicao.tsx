import React, { useState } from "react";
import type { PlanoEditor } from "./regrasPlano";
import { valorTransformar } from "./regrasTransformar";
import { comTransformacao, semTransformacao, type Retangulo } from "./regrasDesenho";
import { deslocamentoArrastado, escalaDoCanto, type Geometria } from "./regrasMinimapa";
import { LIMIAR_PX, elementoSobOPonto, encaixeMagnetico, type Guia } from "./regrasVideo";
import type { MedidaDoQuadro } from "./medirDesenho";
import { COR } from "./tema";

// Camada de edição POR CIMA do Player: caixas das peças que estão na tela neste quadro.
// - A camada inteira tem pointer-events: none (cliques passam para o Player: play/pausa, controles).
//   Só as caixas capturam o mouse. A faixa de baixo (FAIXA_CONTROLES px) fica sempre livre, para a
//   barra de controles do Player.
// - Clicar numa peça escolhe o elemento MAIS À FRENTE sob o ponteiro (regrasVideo.ts) e já começa
//   a arrastar; puxar um canto do escolhido muda a escala a partir da origem do vídeo (centro da
//   tela + deslocamento), como o motor. Alt durante o arraste desliga o encaixe magnético.
// Contas: regrasMinimapa / regrasVideo / regrasDesenho. Gravação: quem usa (regrasTransformar +
// histórico, arraste inteiro = 1 passo pela mesma "sessão").

export const FAIXA_CONTROLES = 44;

type Arraste =
  | { tipo: "mover"; indice: number; sessao: string; px0: number; py0: number; x0: number; y0: number; escala: number; base: Retangulo }
  | { tipo: "canto"; indice: number; sessao: string; px0: number; py0: number; escala0: number; ox: number; oy: number };

let contador = 0;

export const CamadaDeEdicao: React.FC<{
  plano: PlanoEditor;
  medida: MedidaDoQuadro | null;
  selecionado: number | null;
  baseDoEscolhido: Retangulo | null; // última medida estável do escolhido (sem transformação)
  aoSelecionar: (indice: number) => void;
  aoMover: (indice: number, x: number, y: number, sessao: string) => void;
  aoEscalar: (indice: number, escala: number, sessao: string) => void;
  aoTerminar: () => void;
}> = ({ plano, medida, selecionado, baseDoEscolhido, aoSelecionar, aoMover, aoEscalar, aoTerminar }) => {
  const [arraste, setArraste] = useState<Arraste | null>(null);
  const [guias, setGuias] = useState<Guia[]>([]);
  if (!medida || medida.tela.width <= 0) return null;
  const { tela } = medida;
  const g: Geometria = { telaL: tela.width, telaA: tela.height, origemX: tela.left, origemY: tela.top, molduraL: tela.width, molduraA: tela.height };
  const paraPx = (r: Retangulo) => ({ left: tela.left + r.x0 * tela.width, top: tela.top + r.y0 * tela.height, width: (r.x1 - r.x0) * tela.width, height: (r.y1 - r.y0) * tela.height });
  const valores = (i: number) => {
    const el = plano.elementos[i];
    return { s: valorTransformar(el, "escala"), x: valorTransformar(el, "x"), y: valorTransformar(el, "y") };
  };
  // Base (sem transformação) de um elemento ativo: a estável do escolhido, ou a medida de agora.
  const baseDe = (i: number): Retangulo | null => {
    if (arraste?.tipo === "mover" && arraste.indice === i) return arraste.base;
    if (i === selecionado && baseDoEscolhido) return baseDoEscolhido;
    const c = medida.caixas.find((k) => k.indice === i);
    if (!c) return null;
    const v = valores(i);
    return semTransformacao(c.desenho, v.s, v.x, v.y);
  };
  const desenhoAgora = (i: number): Retangulo | null => {
    const b = baseDe(i);
    if (!b) return null;
    const v = valores(i);
    return comTransformacao(b, v.s, v.x, v.y);
  };

  const pontoLocal = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).closest("[data-camada-edicao]")!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const pegarPeca = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const p = pontoLocal(e);
    const caixas = medida.caixas.map((c) => ({ indice: c.indice, desenho: desenhoAgora(c.indice) ?? c.desenho }));
    const i = elementoSobOPonto(caixas, (p.x - tela.left) / tela.width, (p.y - tela.top) / tela.height);
    if (i === null) return;
    const base = baseDe(i);
    if (!base) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    if (i !== selecionado) aoSelecionar(i);
    const v = valores(i);
    setArraste({ tipo: "mover", indice: i, sessao: `video:${plano.elementos[i].id}:${++contador}`, px0: p.x, py0: p.y, x0: v.x, y0: v.y, escala: v.s, base });
  };

  const pegarCanto = (e: React.PointerEvent) => {
    if (e.button !== 0 || selecionado === null) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = pontoLocal(e);
    const v = valores(selecionado);
    setArraste({ tipo: "canto", indice: selecionado, sessao: `video:${plano.elementos[selecionado].id}:${++contador}`, px0: p.x, py0: p.y, escala0: v.s, ox: tela.left + tela.width * (0.5 + v.x), oy: tela.top + tela.height * (0.5 + v.y) });
  };

  const mover = (e: React.PointerEvent) => {
    if (!arraste) return;
    const p = pontoLocal(e);
    if (arraste.tipo === "mover") {
      const d = deslocamentoArrastado(g, arraste.x0, arraste.y0, p.x - arraste.px0, p.y - arraste.py0);
      const m = encaixeMagnetico(arraste.base, arraste.escala, d.x, d.y, LIMIAR_PX / tela.width, LIMIAR_PX / tela.height, !e.altKey);
      setGuias(m.guias);
      aoMover(arraste.indice, m.x, m.y, arraste.sessao);
    } else {
      aoEscalar(arraste.indice, escalaDoCanto(arraste.escala0, { x: arraste.ox, y: arraste.oy }, { x: arraste.px0, y: arraste.py0 }, p), arraste.sessao);
    }
  };

  const soltar = () => {
    if (!arraste) return;
    setArraste(null);
    setGuias([]);
    aoTerminar();
  };

  const escolhido = selecionado === null ? null : desenhoAgora(selecionado);
  const ativo = selecionado !== null && medida.caixas.some((c) => c.indice === selecionado);
  const alca = 12;

  return (
    <div
      data-camada-edicao
      style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: FAIXA_CONTROLES, overflow: "hidden", pointerEvents: "none" }}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      {/* áreas de clique de cada peça na tela (invisíveis, contorno leve ao passar o mouse) */}
      {medida.caixas.map((c) => {
        const r = desenhoAgora(c.indice);
        if (!r) return null;
        return (
          <div
            key={plano.elementos[c.indice]?.id ?? c.indice}
            title={`${plano.elementos[c.indice]?.id ?? ""}: clique para escolher; arraste para mover (Alt: sem ímã)`}
            onPointerDown={pegarPeca}
            className="caixa-peca"
            style={{ position: "absolute", ...paraPx(r), pointerEvents: "auto", cursor: arraste ? "grabbing" : "grab", outline: c.indice === selecionado ? "none" : "1px dashed rgba(245,240,230,0.35)" }}
          />
        );
      })}
      {/* o escolhido: contorno amarelo e cantos */}
      {escolhido && ativo ? (
        <>
          <div style={{ position: "absolute", ...paraPx(escolhido), border: `2px solid ${COR.amarelo}`, boxSizing: "border-box", pointerEvents: "none" }} />
          {[
            [escolhido.x0, escolhido.y0],
            [escolhido.x1, escolhido.y0],
            [escolhido.x0, escolhido.y1],
            [escolhido.x1, escolhido.y1],
          ].map(([fx, fy], i) => (
            <div
              key={i}
              title="Puxe para mudar a escala"
              onPointerDown={pegarCanto}
              style={{ position: "absolute", left: tela.left + fx * tela.width - alca / 2, top: tela.top + fy * tela.height - alca / 2, width: alca, height: alca, background: COR.amarelo, border: `1px solid ${COR.verde}`, pointerEvents: "auto", cursor: i === 0 || i === 3 ? "nwse-resize" : "nesw-resize" }}
            />
          ))}
        </>
      ) : null}
      {/* guias do ímã */}
      {guias.map((gu) =>
        gu.eixo === "x" ? (
          <div key={`x${gu.valor}`} style={{ position: "absolute", left: tela.left + gu.valor * tela.width - 0.5, top: tela.top, width: 1, height: tela.height, background: "#FF3DCB", pointerEvents: "none" }} />
        ) : (
          <div key={`y${gu.valor}`} style={{ position: "absolute", top: tela.top + gu.valor * tela.height - 0.5, left: tela.left, height: 1, width: tela.width, background: "#FF3DCB", pointerEvents: "none" }} />
        ),
      )}
    </div>
  );
};
