import React from "react";
import { Secao } from "./Secao";
import { CampoDuracao, CampoInicio } from "./CamposTempo";
import { PainelPropriedades } from "./PainelPropriedades";
import { fpsDoPlano, situacaoDosElementos, type PlanoEditor } from "./regrasPlano";
import type { Campo } from "./regrasPropriedades";
import { COR, VEU, botaoContorno } from "./tema";
import { rotuloDoComponente } from "./nomes";
import { PainelTransformar } from "./PainelTransformar";
import type { CampoTransformar } from "./regrasTransformar";
import type { Desenho } from "./regrasDesenho";
import { PainelAnimacao } from "./PainelAnimacao";
import type { Animacao, LadoAnimacao } from "./regrasAnimacao";

// Painel lateral direito. Nada selecionado: o aviso "clique num bloco". Com um elemento
// selecionado: só as ferramentas dele, em seções que abrem e fecham: Tempo, Transformar, Animação, Texto e Cor.
// A seção "Plano e vídeo" (de onde veio cada coisa) fica sempre no fim.
// Não tem regra própria: usa CamposTempo, PainelPropriedades e regrasPlano.

export type ChaveSecao = "tempo" | "transformar" | "animacao" | "texto" | "cor" | "plano";
export type SecoesAbertas = Record<ChaveSecao, boolean>;

type Props = {
  plano: PlanoEditor;
  indice: number | null;
  versaoExterna: number; // sobe quando o plano muda por fora: remonta os campos
  abertas: SecoesAbertas;
  aoAlternar: (chave: ChaveSecao) => void;
  aoLimpar: () => void;
  // Camadas: a ordem do elemento na lista decide quem fica na frente. Os botões só funcionam
  // se existir outro elemento que se cruze no tempo naquela direção (senão a ordem não muda nada).
  podeFrente: boolean;
  podeTras: boolean;
  aoCamada: (direcao: "frente" | "tras") => void;
  aoMudarInicio: (indice: number, inicio: string) => void;
  aoMudarDuracao: (indice: number, segundos: number) => void;
  aoPassoInicio: (indice: number, passo: number) => void;
  aoPassoDuracao: (indice: number, passo: number) => void;
  aoMudarPropriedade: (indice: number, dentroDe: string | null, campo: Campo, valor: string, digitando: boolean) => void;
  aoMudarTransformar: (indice: number, campo: CampoTransformar, valor: number) => void;
  aoPassoTransformar: (indice: number, campo: CampoTransformar, sinal: 1 | -1) => void;
  aoResetarTransformar: (indice: number) => void;
  aoMudarAnimacao: (indice: number, lado: LadoAnimacao, mudanca: Partial<Animacao>, digitando: boolean) => void;
  aoTirarAnimacao: (indice: number, lado: LadoAnimacao) => void;
  aoMoverNoMinimapa: (indice: number, x: number, y: number, sessao: string) => void;
  aoEscalarNoMinimapa: (indice: number, escala: number, sessao: string) => void;
  aoTerminarMinimapa: () => void;
  desenho: Desenho; // desenho real do elemento escolhido, medido no Player
  podeDuplicar: boolean;
  aoDuplicar: () => void; // Ctrl+D: cópia logo acima, 0,5 s depois
  ficha: React.ReactNode;
};

export const PainelLateral: React.FC<Props> = ({
  plano,
  indice,
  versaoExterna,
  abertas,
  aoAlternar,
  aoLimpar,
  podeFrente,
  podeTras,
  aoCamada,
  aoMudarInicio,
  aoMudarDuracao,
  aoPassoInicio,
  aoPassoDuracao,
  aoMudarPropriedade,
  aoMudarTransformar,
  aoPassoTransformar,
  aoResetarTransformar,
  aoMudarAnimacao,
  aoTirarAnimacao,
  aoMoverNoMinimapa,
  aoEscalarNoMinimapa,
  aoTerminarMinimapa,
  desenho,
  podeDuplicar,
  aoDuplicar,
  ficha,
}) => {
  const el = indice === null ? undefined : plano.elementos[indice];
  const fps = fpsDoPlano(plano);
  const avisos = indice === null ? [] : (situacaoDosElementos(plano)[indice] ?? []);

  return (
    <div>
      {el && indice !== null ? (
        <>
          <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${VEU.linha}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline" }}>
              <strong style={{ overflowWrap: "anywhere" }}>{el.id}</strong>
              <button
                type="button"
                onClick={aoLimpar}
                style={{ flex: "none", font: "inherit", fontSize: "0.8rem", color: COR.creme, background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                limpar seleção
              </button>
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }} title={Array.isArray(el.componente) ? el.componente.join(" + ") : el.componente}>
              {rotuloDoComponente(el.componente)}
            </div>
            {avisos.map((a) => (
              <div key={a} style={{ fontSize: "0.8rem", color: COR.amarelo, marginTop: "0.2rem" }}>
                ⚠️ {a}
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <button
                type="button"
                style={{ ...botaoContorno, padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                disabled={!podeFrente}
                onClick={() => aoCamada("frente")}
                title={podeFrente ? "Passa este elemento para cima do próximo que aparece junto com ele (Ctrl+])" : "Nenhum elemento mais à frente aparece ao mesmo tempo: a ordem não mudaria nada"}
              >
                ↑ Trazer para frente
              </button>
              <button
                type="button"
                style={{ ...botaoContorno, padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                disabled={!podeTras}
                onClick={() => aoCamada("tras")}
                title={podeTras ? "Passa este elemento para baixo do anterior que aparece junto com ele (Ctrl+[)" : "Nenhum elemento mais atrás aparece ao mesmo tempo: a ordem não mudaria nada"}
              >
                ↓ Enviar para trás
              </button>
              <button
                type="button"
                style={{ ...botaoContorno, padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                disabled={!podeDuplicar}
                onClick={aoDuplicar}
                title="Cria uma cópia deste elemento logo acima dele, 0,5 s depois, com um id novo (Ctrl+D)"
              >
                ⧉ Duplicar
              </button>
            </div>
          </div>

          <Secao titulo="Tempo" aberta={abertas.tempo} aoAlternar={() => aoAlternar("tempo")}>
            <div key={`${indice}-${versaoExterna}`}>
              <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.4rem" }}>Tempos no vídeo ORIGINAL (antes dos cortes).</div>
              <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.85, marginBottom: "0.15rem" }}>Início (m:ss.d)</span>
              <CampoInicio el={el} aoMudar={(inicio) => aoMudarInicio(indice, inicio)} aoPasso={(passo) => aoPassoInicio(indice, passo)} />
              <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.85, margin: "0.6rem 0 0.15rem" }}>
                Duração (s){fps === null ? ' — o plano não tem "fps"' : ""}
              </span>
              <CampoDuracao el={el} fps={fps} aoMudar={(s) => aoMudarDuracao(indice, s)} aoPasso={(passo) => aoPassoDuracao(indice, passo)} />
            </div>
          </Secao>

          <Secao titulo="Transformar" aberta={abertas.transformar} aoAlternar={() => aoAlternar("transformar")}>
            <PainelTransformar
              key={`transformar-${indice}-${versaoExterna}`}
              plano={plano}
              el={el}
              aoMoverNoMinimapa={(x, y, sessao) => aoMoverNoMinimapa(indice, x, y, sessao)}
              aoEscalarNoMinimapa={(escala, sessao) => aoEscalarNoMinimapa(indice, escala, sessao)}
              aoTerminarMinimapa={aoTerminarMinimapa}
              desenho={desenho}
              aoMudar={(campo, valor) => aoMudarTransformar(indice, campo, valor)}
              aoPasso={(campo, sinal) => aoPassoTransformar(indice, campo, sinal)}
              aoResetar={() => aoResetarTransformar(indice)}
            />
          </Secao>

          <Secao titulo="Animação" aberta={abertas.animacao} aoAlternar={() => aoAlternar("animacao")}>
            <PainelAnimacao
              key={`animacao-${indice}-${versaoExterna}`}
              plano={plano}
              el={el}
              fps={fps}
              aoMudar={(lado, mudanca, digitando) => aoMudarAnimacao(indice, lado, mudanca, digitando)}
              aoTirar={(lado) => aoTirarAnimacao(indice, lado)}
            />
          </Secao>

          <Secao titulo="Texto" aberta={abertas.texto} aoAlternar={() => aoAlternar("texto")}>
            <PainelPropriedades key={`texto-${indice}-${versaoExterna}`} plano={plano} indice={indice} tipo="texto" aoMudar={aoMudarPropriedade} />
          </Secao>

          <Secao titulo="Cor" aberta={abertas.cor} aoAlternar={() => aoAlternar("cor")}>
            <PainelPropriedades key={`cor-${indice}-${versaoExterna}`} plano={plano} indice={indice} tipo="cor" aoMudar={aoMudarPropriedade} />
          </Secao>
        </>
      ) : (
        <p style={{ margin: 0, padding: "1rem 0.75rem", opacity: 0.85 }}>Clique num bloco da linha do tempo (ou numa linha da aba Lista) para editar o tempo, a escala e a posição, o texto e as cores.</p>
      )}

      <Secao titulo="Plano e vídeo" aberta={abertas.plano} aoAlternar={() => aoAlternar("plano")}>
        {ficha}
      </Secao>
    </div>
  );
};
