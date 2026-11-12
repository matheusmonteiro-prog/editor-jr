import React, { useState } from "react";
import type { ElementoEditor, PlanoEditor } from "./regrasPlano";
import {
  DIRECOES_ANIMACAO,
  LADOS_ANIMACAO,
  TIPOS_ANIMACAO,
  animacaoDe,
  conferirFrames,
  maximoDeQuadros,
  type Animacao,
  type LadoAnimacao,
} from "./regrasAnimacao";
import { botaoContorno, caixaTexto, mensagemErro } from "./tema";

// Seção "Animação" do painel lateral: entrada e saída do elemento (tipo, duração em quadros,
// direção no "deslizar") e "tirar" por lado. As regras ficam em regrasAnimacao.ts. A duração
// digitada fica num rascunho; só valor VÁLIDO sobe para o plano. Quem usa remonta a seção (key)
// quando o plano muda por fora.

const NOME_TIPO: Record<string, string> = { fade: "Aparecer (fade)", deslizar: "Deslizar", zoom: "Zoom" };
const NOME_LADO: Record<LadoAnimacao, string> = { entrada: "Entrada", saida: "Saída" };

const LadoDaAnimacao: React.FC<{
  plano: PlanoEditor;
  el: ElementoEditor;
  lado: LadoAnimacao;
  fps: number | null;
  aoMudar: (mudanca: Partial<Animacao>, digitando: boolean) => void;
  aoTirar: () => void;
}> = ({ plano, el, lado, fps, aoMudar, aoTirar }) => {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const atual = animacaoDe(el, lado);
  const maximo = maximoDeQuadros(plano, el, lado);
  const texto = rascunho ?? (atual ? String(atual.frames) : "");
  const conferido = conferirFrames(texto, maximo);
  const semEspaco = maximo !== null && maximo < 1;
  const rotulo = `${NOME_LADO[lado]} de ${el.id}`;
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.85, marginBottom: "0.15rem" }}>{NOME_LADO[lado]}</span>
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
        <select
          aria-label={`tipo da ${rotulo}`}
          value={atual?.tipo ?? ""}
          disabled={semEspaco && !atual}
          title={semEspaco && !atual ? "O outro lado já ocupa o elemento todo" : undefined}
          onChange={(e) => (e.target.value === "" ? aoTirar() : aoMudar({ tipo: e.target.value as Animacao["tipo"] }, false))}
          style={{ ...caixaTexto(false), width: "auto" }}
        >
          <option value="">nenhuma (só a da peça)</option>
          {TIPOS_ANIMACAO.map((t) => (
            <option key={t} value={t}>
              {NOME_TIPO[t]}
            </option>
          ))}
        </select>
        {atual?.tipo === "deslizar" ? (
          <select
            aria-label={`direção da ${rotulo}`}
            value={atual.direcao ?? "esquerda"}
            onChange={(e) => aoMudar({ direcao: e.target.value as Animacao["direcao"] }, false)}
            style={{ ...caixaTexto(false), width: "auto" }}
            title={lado === "entrada" ? "De onde ela vem" : "Para onde ela vai"}
          >
            {DIRECOES_ANIMACAO.map((d) => (
              <option key={d} value={d}>
                {lado === "entrada" ? `vem da ${d}` : `vai para ${d}`}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {atual ? (
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", marginTop: "0.25rem" }}>
          <input
            aria-label={`quadros da ${rotulo}`}
            value={texto}
            inputMode="numeric"
            style={{ ...caixaTexto(!conferido.ok), width: "4.5rem" }}
            onChange={(e) => {
              setRascunho(e.target.value);
              const r = conferirFrames(e.target.value, maximo);
              if (r.ok) aoMudar({ frames: r.valor }, true);
            }}
          />
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            quadros{conferido.ok && fps ? ` = ${(conferido.valor / fps).toFixed(2).replace(".", ",")} s` : ""}
            {maximo !== null ? ` (até ${maximo})` : ""}
          </span>
          <button type="button" style={{ ...botaoContorno, padding: "0.1rem 0.4rem", fontSize: "0.75rem", marginLeft: "auto" }} onClick={aoTirar} title={`Tira a ${NOME_LADO[lado].toLowerCase()} deste elemento`}>
            tirar
          </button>
        </div>
      ) : null}
      {atual && !conferido.ok ? <div style={mensagemErro}>{conferido.erro} O vídeo continua com {atual.frames}.</div> : null}
    </div>
  );
};

export const PainelAnimacao: React.FC<{
  plano: PlanoEditor;
  el: ElementoEditor;
  fps: number | null;
  aoMudar: (lado: LadoAnimacao, mudanca: Partial<Animacao>, digitando: boolean) => void;
  aoTirar: (lado: LadoAnimacao) => void;
}> = ({ plano, el, fps, aoMudar, aoTirar }) => (
  <div>
    <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.4rem" }}>
      Soma por cima da animação que a peça já tem. A saída termina no último quadro do elemento.
    </div>
    {LADOS_ANIMACAO.map((lado) => (
      <LadoDaAnimacao key={lado} plano={plano} el={el} lado={lado} fps={fps} aoMudar={(m, d) => aoMudar(lado, m, d)} aoTirar={() => aoTirar(lado)} />
    ))}
  </div>
);
