import React, { useState } from "react";
import {
  conferirDuracao,
  conferirInicio,
  fpsDoPlano,
  situacaoDosElementos,
  type PlanoEditor,
} from "./regrasPlano";

// Tabela da fatia 2: uma linha por elemento. id e componente só leitura; início e duração
// editáveis. O texto digitado fica num rascunho; o plano (e o Player) só recebe valor VÁLIDO.

type Props = {
  plano: PlanoEditor;
  aoMudarInicio: (indice: number, inicio: string) => void;
  aoMudarDuracao: (indice: number, segundos: number) => void;
};

type Rascunho = { inicio?: string; duracao?: string };

const COR = { verde: "#0F2A1D", creme: "#F5F0E6", amarelo: "#EFAF20", erro: "#E4573D", linha: "rgba(245,240,230,0.2)" };

const celula: React.CSSProperties = { padding: "6px 8px", borderBottom: `1px solid ${COR.linha}`, verticalAlign: "top" };
const caixa = (invalida: boolean): React.CSSProperties => ({
  width: 90,
  padding: "4px 6px",
  font: "inherit",
  color: COR.verde,
  background: invalida ? "#FFE1DB" : COR.creme,
  border: `2px solid ${invalida ? COR.erro : "transparent"}`,
  borderRadius: 4,
});
const mensagemErro: React.CSSProperties = { color: COR.erro, fontSize: 12, marginTop: 4, maxWidth: 220 };

export const TabelaElementos: React.FC<Props> = ({ plano, aoMudarInicio, aoMudarDuracao }) => {
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
        {fps === null ? ' — o plano não tem "fps": a duração não pode ser editada.' : ` (${fps} quadros por segundo).`}
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
            return (
              <tr key={el.id}>
                <td style={celula}>{el.id}</td>
                <td style={celula}>{Array.isArray(el.componente) ? el.componente.join(" + ") : el.componente}</td>
                <td style={celula}>
                  <input
                    aria-label={`início de ${el.id}`}
                    value={textoInicio}
                    style={caixa(!inicio.ok)}
                    onChange={(e) => {
                      const valor = e.target.value;
                      escrever(el.id, "inicio", valor);
                      // Só o valor válido vai para o plano; inválido fica só na caixa.
                      if (conferirInicio(valor).ok) aoMudarInicio(i, valor);
                    }}
                  />
                  {!inicio.ok ? <div style={mensagemErro}>{inicio.erro} O vídeo continua com {el.inicio}.</div> : null}
                </td>
                <td style={celula}>
                  <input
                    aria-label={`duração de ${el.id}`}
                    value={textoDuracao}
                    disabled={fps === null}
                    style={caixa(duracao !== null && !duracao.ok)}
                    onChange={(e) => {
                      const valor = e.target.value;
                      escrever(el.id, "duracao", valor);
                      if (fps === null) return;
                      const d = conferirDuracao(valor, fps);
                      if (d.ok) aoMudarDuracao(i, d.segundos);
                    }}
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
