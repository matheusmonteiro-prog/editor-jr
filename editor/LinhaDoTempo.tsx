import React from "react";
import { marcasDaRegua, type Bloco } from "./regrasLinhaDoTempo";
import { COR, VEU } from "./tema";

// Linha do tempo compacta: só visualização. Uma faixa por camada, um bloco por elemento.
// Clicar num bloco seleciona o elemento e o Player pula para o início dele. Não arrasta (ainda).

type Props = {
  blocos: Bloco[];
  faixas: number;
  regua: number; // segundos (tempo ORIGINAL)
  agulhaSeg: number; // posição atual do Player, convertida para tempo original
  selecionado: number | null; // índice do elemento
  aoClicar: (indice: number) => void;
};

const ALTURA_FAIXA = "1.7rem";
const ALTURA_REGUA = "1.3rem";

export const LinhaDoTempo: React.FC<Props> = ({ blocos, faixas, regua, agulhaSeg, selecionado, aoClicar }) => {
  const marcas = marcasDaRegua(regua);
  const agulhaPct = Math.min(100, Math.max(0, (agulhaSeg / regua) * 100));
  const nFaixas = Math.max(1, faixas);
  return (
    <div>
      <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" }}>
        Régua em tempo ORIGINAL (antes dos cortes). Com cortes, ela não bate com a barra do Player.
      </div>
      <div style={{ position: "relative", background: VEU.leve, borderRadius: "0.25rem", paddingBottom: "0.2rem" }}>
        {/* Régua */}
        <div style={{ position: "relative", height: ALTURA_REGUA, borderBottom: `1px solid ${VEU.linha}` }}>
          {marcas.map((m) => (
            <div
              key={m.seg}
              style={{ position: "absolute", left: `${m.pct}%`, bottom: 0, height: m.rotulo ? "0.55rem" : "0.3rem", borderLeft: `1px solid ${VEU.linha}` }}
            >
              {m.rotulo ? <span style={{ position: "absolute", bottom: "0.55rem", left: "0.15rem", fontSize: "0.7rem", whiteSpace: "nowrap" }}>{m.rotulo}</span> : null}
            </div>
          ))}
        </div>
        {/* Faixas */}
        <div style={{ position: "relative", height: `calc(${nFaixas} * ${ALTURA_FAIXA} + 0.25rem)` }}>
          {Array.from({ length: nFaixas }, (_, f) => (
            <div
              key={f}
              style={{ position: "absolute", left: 0, right: 0, top: `calc(${f} * ${ALTURA_FAIXA} + 0.1rem)`, height: `calc(${ALTURA_FAIXA} - 0.2rem)`, background: VEU.leve }}
            />
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
                  width: `max(${b.larguraPct}%, 0.3rem)`,
                  top: `calc(${b.faixa} * ${ALTURA_FAIXA} + 0.2rem)`,
                  height: `calc(${ALTURA_FAIXA} - 0.4rem)`,
                  padding: "0 0.4rem",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "left",
                  font: "inherit",
                  fontSize: "0.75rem",
                  color: COR.verde,
                  background: ativo ? COR.amarelo : COR.creme,
                  border: ativo ? `2px solid ${COR.creme}` : `1px solid ${VEU.linha}`,
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                }}
              >
                {b.id}
              </button>
            );
          })}
          {/* Agulha */}
          <div style={{ position: "absolute", top: `calc(-1 * ${ALTURA_REGUA})`, bottom: 0, left: `${agulhaPct}%`, width: 2, background: COR.vermelho, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};
