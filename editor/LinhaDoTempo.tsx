import React from "react";
import { marcasDaRegua, type Bloco } from "./regrasLinhaDoTempo";

// Linha do tempo (fatia 4): só visualização. Uma faixa por camada, um bloco por elemento.
// Clicar num bloco pula o Player para o início dele. Não arrasta (ainda).

type Props = {
  blocos: Bloco[];
  faixas: number;
  regua: number; // segundos (tempo ORIGINAL)
  agulhaSeg: number; // posição atual do Player, convertida para tempo original
  selecionado: number | null; // índice do elemento
  aoClicar: (indice: number) => void;
};

const COR = { verde: "#0F2A1D", creme: "#F5F0E6", amarelo: "#EFAF20", vermelho: "#E4573D" };
const ALTURA_FAIXA = 30;

export const LinhaDoTempo: React.FC<Props> = ({ blocos, faixas, regua, agulhaSeg, selecionado, aoClicar }) => {
  const marcas = marcasDaRegua(regua);
  const agulhaPct = Math.min(100, Math.max(0, (agulhaSeg / regua) * 100));
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ background: COR.amarelo, color: COR.verde, padding: "6px 10px", borderRadius: 4, fontWeight: 700, margin: "0 0 8px" }}>
        Linha do tempo em tempo ORIGINAL (antes dos cortes). Neste teste o corte é de um trecho só, então original = vídeo.
      </p>
      <div style={{ position: "relative", background: "rgba(245,240,230,0.06)", borderRadius: 4, padding: "0 0 4px" }}>
        {/* Régua */}
        <div style={{ position: "relative", height: 22, borderBottom: "1px solid rgba(245,240,230,0.3)" }}>
          {marcas.map((m) => (
            <div key={m.seg} style={{ position: "absolute", left: `${m.pct}%`, bottom: 0, height: m.rotulo ? 10 : 5, borderLeft: "1px solid rgba(245,240,230,0.5)" }}>
              {m.rotulo ? <span style={{ position: "absolute", bottom: 10, left: 2, fontSize: 11, whiteSpace: "nowrap" }}>{m.rotulo}</span> : null}
            </div>
          ))}
        </div>
        {/* Faixas */}
        <div style={{ position: "relative", height: Math.max(1, faixas) * ALTURA_FAIXA + 4 }}>
          {Array.from({ length: faixas }, (_, f) => (
            <div key={f} style={{ position: "absolute", left: 0, right: 0, top: f * ALTURA_FAIXA + 2, height: ALTURA_FAIXA - 4, background: "rgba(245,240,230,0.04)" }} />
          ))}
          {blocos.map((b) => {
            const ativo = b.indice === selecionado;
            return (
              <button
                key={b.id}
                type="button"
                title={`${b.id} · ${b.rotulo} · início ${b.inicioSeg.toFixed(1)} s · ${b.duracaoSeg.toFixed(2)} s`}
                onClick={() => aoClicar(b.indice)}
                style={{
                  position: "absolute",
                  left: `${b.esquerdaPct}%`,
                  width: `max(${b.larguraPct}%, 4px)`,
                  top: b.faixa * ALTURA_FAIXA + 4,
                  height: ALTURA_FAIXA - 8,
                  padding: "0 6px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "left",
                  font: "inherit",
                  fontSize: 12,
                  color: COR.verde,
                  background: ativo ? COR.amarelo : COR.creme,
                  border: ativo ? `2px solid ${COR.creme}` : "1px solid rgba(15,42,29,0.4)",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {b.id}
              </button>
            );
          })}
          {/* Agulha */}
          <div style={{ position: "absolute", top: -22, bottom: 0, left: `${agulhaPct}%`, width: 2, background: COR.vermelho, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};
