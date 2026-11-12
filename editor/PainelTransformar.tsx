import React, { useState } from "react";
import { botaoPasso } from "./CamposTempo";
import type { ElementoEditor, PlanoEditor } from "./regrasPlano";
import { Minimapa } from "./Minimapa";
import type { Desenho } from "./regrasDesenho";
import {
  CAMPOS_TRANSFORMAR,
  REGRAS_TRANSFORMAR,
  conferirTransformar,
  temTransformacao,
  valorTransformar,
  type CampoTransformar,
} from "./regrasTransformar";
import { botaoContorno, caixaTexto, mensagemErro } from "./tema";

// Seção "Transformar" do painel lateral: escala, opacidade e deslocamento x/y, com − e + e
// "voltar ao normal". As regras (limites, passo, tirar a chave no padrão) ficam em
// regrasTransformar.ts. O que você digita fica num rascunho; só valor VÁLIDO sobe para o plano.
// Quem usa remonta a seção (key) quando o plano muda por fora (−/+, desfazer).

const ROTULOS: Record<CampoTransformar, { titulo: string; dica: string }> = {
  escala: { titulo: "Escala", dica: "1 = tamanho normal; 2 = o dobro (cresce a partir do centro da tela)" },
  opacidade: { titulo: "Opacidade", dica: "1 = normal; 0 = invisível" },
  x: { titulo: "Posição X", dica: "fração da largura da tela; + = direita, − = esquerda" },
  y: { titulo: "Posição Y", dica: "fração da altura da tela; + = para baixo, − = para cima" },
};

const LinhaTransformar: React.FC<{
  el: ElementoEditor;
  campo: CampoTransformar;
  aoMudar: (valor: number) => void;
  aoPasso: (sinal: 1 | -1) => void;
}> = ({ el, campo, aoMudar, aoPasso }) => {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const atual = valorTransformar(el, campo);
  const texto = rascunho ?? String(atual);
  const conferido = conferirTransformar(campo, texto);
  const { minimo, maximo, passo } = REGRAS_TRANSFORMAR[campo];
  const { titulo, dica } = ROTULOS[campo];
  const rotulo = `${titulo} de ${el.id}`;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.85, marginBottom: "0.15rem" }} title={dica}>
        {titulo} <span style={{ opacity: 0.7 }}>({minimo} a {maximo})</span>
      </span>
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        <button type="button" style={botaoPasso} title={`${titulo} − ${passo}`} disabled={atual <= minimo} onClick={() => aoPasso(-1)}>
          −
        </button>
        <input
          aria-label={rotulo}
          title={dica}
          value={texto}
          style={caixaTexto(!conferido.ok)}
          onChange={(e) => {
            setRascunho(e.target.value);
            const r = conferirTransformar(campo, e.target.value);
            if (r.ok) aoMudar(r.valor);
          }}
        />
        <button type="button" style={botaoPasso} title={`${titulo} + ${passo}`} disabled={atual >= maximo} onClick={() => aoPasso(1)}>
          +
        </button>
      </div>
      {!conferido.ok ? <div style={mensagemErro}>{conferido.erro} O vídeo continua com {atual}.</div> : null}
    </div>
  );
};

export const PainelTransformar: React.FC<{
  plano: PlanoEditor;
  el: ElementoEditor;
  aoMoverNoMinimapa: (x: number, y: number, sessao: string) => void;
  aoEscalarNoMinimapa: (escala: number, sessao: string) => void;
  aoTerminarMinimapa: () => void;
  desenho: Desenho;
  aoMudar: (campo: CampoTransformar, valor: number) => void; // digitando (só valor válido)
  aoPasso: (campo: CampoTransformar, sinal: 1 | -1) => void;
  aoResetar: () => void;
}> = ({ plano, el, desenho, aoMoverNoMinimapa, aoEscalarNoMinimapa, aoTerminarMinimapa, aoMudar, aoPasso, aoResetar }) => (
  <div>
    <Minimapa plano={plano} el={el} aoMover={aoMoverNoMinimapa} aoEscalar={aoEscalarNoMinimapa} aoTerminar={aoTerminarMinimapa} aoResetar={aoResetar} desenho={desenho} />
    <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.4rem" }}>Vale para a peça inteira, por cima da animação dela.</div>
    {CAMPOS_TRANSFORMAR.map((campo) => (
      <LinhaTransformar key={campo} el={el} campo={campo} aoMudar={(v) => aoMudar(campo, v)} aoPasso={(s) => aoPasso(campo, s)} />
    ))}
    <button
      type="button"
      style={{ ...botaoContorno, padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
      disabled={!temTransformacao(el)}
      title={temTransformacao(el) ? "Tira escala, opacidade e posição deste elemento (volta ao jeito da peça)" : "Já está normal"}
      onClick={aoResetar}
    >
      Voltar ao normal
    </button>
  </div>
);
