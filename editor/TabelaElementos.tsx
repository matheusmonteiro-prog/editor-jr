import React from "react";
import { fpsDoPlano, situacaoDosElementos, type PlanoEditor } from "./regrasPlano";
import { CampoDuracao, CampoInicio } from "./CamposTempo";
import { COR, VEU } from "./tema";
import { rotuloDoComponente } from "./nomes";

// Aba "Lista": uma linha por elemento (id e componente só leitura; início e duração editáveis,
// com os mesmos campos do painel lateral). Clicar na linha seleciona o elemento e o Player pula
// para o início dele. O App remonta a tabela (key) quando o plano muda por fora.

type Props = {
  plano: PlanoEditor;
  selecionado: number | null;
  aoMudarInicio: (indice: number, inicio: string) => void; // digitando (só valor válido)
  aoMudarDuracao: (indice: number, segundos: number) => void; // digitando (só valor válido)
  aoPassoInicio: (indice: number, passo: number) => void; // botões − e +
  aoPassoDuracao: (indice: number, passo: number) => void;
  aoSelecionar: (indice: number) => void;
};

const celula: React.CSSProperties = { padding: "0.3rem 0.5rem", borderBottom: `1px solid ${VEU.linha}`, verticalAlign: "top" };

export const TabelaElementos: React.FC<Props> = ({
  plano,
  selecionado,
  aoMudarInicio,
  aoMudarDuracao,
  aoPassoInicio,
  aoPassoDuracao,
  aoSelecionar,
}) => {
  const fps = fpsDoPlano(plano);
  const situacoes = situacaoDosElementos(plano);

  return (
    <div>
      <p style={{ margin: "0 0 0.4rem", fontSize: "0.8rem", opacity: 0.85 }}>
        Tempos no vídeo ORIGINAL (antes dos cortes). Duração em segundos
        {fps === null ? ' — o plano não tem "fps": a duração não pode ser editada.' : ` (${fps} quadros por segundo).`}{" "}
        Clique na linha para o vídeo pular até o elemento.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={celula}>id</th>
            <th style={celula}>componente</th>
            <th style={celula}>início (m:ss.d)</th>
            <th style={celula}>duração (s)</th>
            <th style={celula}>situação</th>
          </tr>
        </thead>
        <tbody>
          {plano.elementos.map((el, i) => {
            const avisos = situacoes[i];
            const ativo = i === selecionado;
            return (
              <tr
                key={el.id}
                style={{ background: ativo ? "rgba(239,175,32,0.15)" : undefined, cursor: "pointer" }}
                onClick={(e) => {
                  // Clicar numa caixa ou num botão não pula o vídeo (você está editando).
                  if ((e.target as HTMLElement).closest("input, button")) return;
                  aoSelecionar(i);
                }}
              >
                <td style={{ ...celula, fontWeight: ativo ? 700 : 400 }}>{el.id}</td>
                <td style={celula} title={Array.isArray(el.componente) ? el.componente.join(" + ") : el.componente}>
                  {rotuloDoComponente(el.componente)}
                </td>
                <td style={{ ...celula, minWidth: "9rem" }}>
                  <CampoInicio el={el} aoMudar={(inicio) => aoMudarInicio(i, inicio)} aoPasso={(passo) => aoPassoInicio(i, passo)} />
                </td>
                <td style={{ ...celula, minWidth: "9rem" }}>
                  <CampoDuracao el={el} fps={fps} aoMudar={(s) => aoMudarDuracao(i, s)} aoPasso={(passo) => aoPassoDuracao(i, passo)} />
                </td>
                <td style={{ ...celula, color: avisos.length > 0 ? COR.amarelo : COR.creme }}>
                  {avisos.length > 0 ? avisos.map((a) => <div key={a}>⚠️ {a}</div>) : "✅"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
