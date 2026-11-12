import React, { useState } from "react";
import { conferirDuracao, conferirInicio, type ElementoEditor } from "./regrasPlano";
import { COR, caixaTexto, mensagemErro } from "./tema";

// Campos de início e de duração, com − e + de 0,5 s. Usados pela lista (TabelaElementos) e pelo
// painel lateral (PainelLateral): a mesma regra nos dois lugares (regrasPlano.ts).
// O que você digita fica num rascunho; só valor VÁLIDO sobe para o plano (e para o Player).
// Quem usa remonta o campo (key) quando o plano muda por fora (−/+, desfazer, refazer), para o
// rascunho dar lugar ao valor novo.

export const PASSO_SEG = 0.5;

export const botaoPasso: React.CSSProperties = {
  flex: "none",
  width: "1.8rem",
  padding: "0.25rem 0",
  font: "inherit",
  fontWeight: 700,
  color: COR.verde,
  background: COR.amarelo,
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer",
};

const CampoComPassos: React.FC<{
  rotulo: string;
  valor: string;
  invalido: boolean;
  desligado?: boolean;
  aoEscrever: (valor: string) => void;
  aoPasso: (passo: number) => void;
}> = ({ rotulo, valor, invalido, desligado = false, aoEscrever, aoPasso }) => (
  <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
    <button type="button" style={botaoPasso} disabled={desligado} title={`${rotulo} − 0,5 s`} onClick={() => aoPasso(-PASSO_SEG)}>
      −
    </button>
    <input aria-label={rotulo} value={valor} disabled={desligado} style={caixaTexto(invalido)} onChange={(e) => aoEscrever(e.target.value)} />
    <button type="button" style={botaoPasso} disabled={desligado} title={`${rotulo} + 0,5 s`} onClick={() => aoPasso(PASSO_SEG)}>
      +
    </button>
  </div>
);

export const CampoInicio: React.FC<{
  el: ElementoEditor;
  aoMudar: (inicio: string) => void; // digitando (só valor válido)
  aoPasso: (passo: number) => void; // botões − e +
}> = ({ el, aoMudar, aoPasso }) => {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const texto = rascunho ?? el.inicio;
  const conferido = conferirInicio(texto);
  return (
    <>
      <CampoComPassos
        rotulo={`início de ${el.id}`}
        valor={texto}
        invalido={!conferido.ok}
        aoEscrever={(valor) => {
          setRascunho(valor);
          // Só o valor válido vai para o plano; inválido fica só na caixa.
          if (conferirInicio(valor).ok) aoMudar(valor);
        }}
        aoPasso={aoPasso}
      />
      {!conferido.ok ? <div style={mensagemErro}>{conferido.erro} O vídeo continua com {el.inicio}.</div> : null}
    </>
  );
};

export const CampoDuracao: React.FC<{
  el: ElementoEditor;
  fps: number | null; // null = o plano não tem "fps": a duração não pode ser editada
  aoMudar: (segundos: number) => void;
  aoPasso: (passo: number) => void;
}> = ({ el, fps, aoMudar, aoPasso }) => {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const texto = rascunho ?? String(el.duracao);
  const conferido = fps === null ? null : conferirDuracao(texto, fps);
  return (
    <>
      <CampoComPassos
        rotulo={`duração de ${el.id}`}
        valor={texto}
        invalido={conferido !== null && !conferido.ok}
        desligado={fps === null}
        aoEscrever={(valor) => {
          setRascunho(valor);
          if (fps === null) return;
          const d = conferirDuracao(valor, fps);
          if (d.ok) aoMudar(d.segundos);
        }}
        aoPasso={aoPasso}
      />
      {conferido !== null && !conferido.ok ? <div style={mensagemErro}>{conferido.erro} O vídeo continua com {el.duracao} s.</div> : null}
    </>
  );
};
