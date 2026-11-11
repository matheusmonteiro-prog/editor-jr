import React, { useState } from "react";
import {
  conferirDuracao,
  conferirInicio,
  fpsDoPlano,
  situacaoDosElementos,
  type PlanoEditor,
} from "./regrasPlano";

// Tabela (fatias 2 e 4): uma linha por elemento. id e componente só leitura; início e duração
// editáveis, digitando ou com − e + de 0,5 s. O texto digitado fica num rascunho; o plano
// (e o Player) só recebe valor VÁLIDO. Clicar na linha pula o Player para o início do elemento.
// O App remonta a tabela (key) quando o plano muda por fora (−/+, desfazer, refazer): isso
// limpa os rascunhos, para a caixa mostrar o valor novo.

export const PASSO_SEG = 0.5;

type Props = {
  plano: PlanoEditor;
  selecionado: number | null;
  aoMudarInicio: (indice: number, inicio: string) => void; // digitando (só valor válido)
  aoMudarDuracao: (indice: number, segundos: number) => void; // digitando (só valor válido)
  aoPassoInicio: (indice: number, passo: number) => void; // botões − e +
  aoPassoDuracao: (indice: number, passo: number) => void;
  aoSelecionar: (indice: number) => void;
};

type Rascunho = { inicio?: string; duracao?: string };

const COR = { verde: "#0F2A1D", creme: "#F5F0E6", amarelo: "#EFAF20", erro: "#E4573D", linha: "rgba(245,240,230,0.2)" };

const celula: React.CSSProperties = { padding: "6px 8px", borderBottom: `1px solid ${COR.linha}`, verticalAlign: "top" };
const caixa = (invalida: boolean): React.CSSProperties => ({
  width: 80,
  padding: "4px 6px",
  font: "inherit",
  color: COR.verde,
  background: invalida ? "#FFE1DB" : COR.creme,
  border: `2px solid ${invalida ? COR.erro : "transparent"}`,
  borderRadius: 4,
});
const botaoPasso: React.CSSProperties = {
  width: 28,
  padding: "4px 0",
  font: "inherit",
  fontWeight: 700,
  color: COR.verde,
  background: COR.amarelo,
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
const mensagemErro: React.CSSProperties = { color: COR.erro, fontSize: 12, marginTop: 4, maxWidth: 220 };

const CampoComPassos: React.FC<{
  rotulo: string;
  valor: string;
  invalido: boolean;
  desligado?: boolean;
  aoEscrever: (valor: string) => void;
  aoPasso: (passo: number) => void;
}> = ({ rotulo, valor, invalido, desligado = false, aoEscrever, aoPasso }) => (
  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    <button type="button" style={botaoPasso} disabled={desligado} title={`${rotulo} − 0,5 s`} onClick={() => aoPasso(-PASSO_SEG)}>
      −
    </button>
    <input aria-label={rotulo} value={valor} disabled={desligado} style={caixa(invalido)} onChange={(e) => aoEscrever(e.target.value)} />
    <button type="button" style={botaoPasso} disabled={desligado} title={`${rotulo} + 0,5 s`} onClick={() => aoPasso(PASSO_SEG)}>
      +
    </button>
  </div>
);

export const TabelaElementos: React.FC<Props> = ({
  plano,
  selecionado,
  aoMudarInicio,
  aoMudarDuracao,
  aoPassoInicio,
  aoPassoDuracao,
  aoSelecionar,
}) => {
  // Rascunho por id: o que está escrito na caixa, mesmo que ainda esteja errado.
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({});
  const fps = fpsDoPlano(plano);
  const situacoes = situacaoDosElementos(plano);

  const escrever = (id: string, campo: keyof Rascunho, valor: string) =>
    setRascunhos((r) => ({ ...r, [id]: { ...r[id], [campo]: valor } }));

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ background: COR.amarelo, color: COR.verde, padding: "6px 10px", borderRadius: 4, fontWeight: 700 }}>
        Tempos no vídeo ORIGINAL (antes dos cortes). Duração em segundos
        {fps === null ? ' — o plano não tem "fps": a duração não pode ser editada.' : ` (${fps} quadros por segundo).`}{" "}
        Clique na linha para o vídeo pular até o elemento.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
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
            const r = rascunhos[el.id] ?? {};
            const textoInicio = r.inicio ?? el.inicio;
            const textoDuracao = r.duracao ?? String(el.duracao);
            const inicio = conferirInicio(textoInicio);
            const duracao = fps === null ? null : conferirDuracao(textoDuracao, fps);
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
                <td style={celula}>{Array.isArray(el.componente) ? el.componente.join(" + ") : el.componente}</td>
                <td style={celula}>
                  <CampoComPassos
                    rotulo={`início de ${el.id}`}
                    valor={textoInicio}
                    invalido={!inicio.ok}
                    aoEscrever={(valor) => {
                      escrever(el.id, "inicio", valor);
                      // Só o valor válido vai para o plano; inválido fica só na caixa.
                      if (conferirInicio(valor).ok) aoMudarInicio(i, valor);
                    }}
                    aoPasso={(passo) => aoPassoInicio(i, passo)}
                  />
                  {!inicio.ok ? <div style={mensagemErro}>{inicio.erro} O vídeo continua com {el.inicio}.</div> : null}
                </td>
                <td style={celula}>
                  <CampoComPassos
                    rotulo={`duração de ${el.id}`}
                    valor={textoDuracao}
                    invalido={duracao !== null && !duracao.ok}
                    desligado={fps === null}
                    aoEscrever={(valor) => {
                      escrever(el.id, "duracao", valor);
                      if (fps === null) return;
                      const d = conferirDuracao(valor, fps);
                      if (d.ok) aoMudarDuracao(i, d.segundos);
                    }}
                    aoPasso={(passo) => aoPassoDuracao(i, passo)}
                  />
                  {duracao !== null && !duracao.ok ? (
                    <div style={mensagemErro}>{duracao.erro} O vídeo continua com {el.duracao} s.</div>
                  ) : null}
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
