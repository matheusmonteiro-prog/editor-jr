import React from "react";
import { COR, VEU } from "./tema";

// Seção que abre e fecha. O estado (aberta ou não) fica com quem usa, para sobreviver quando
// a seleção muda.

type Props = {
  titulo: string;
  aberta: boolean;
  aoAlternar: () => void;
  children: React.ReactNode;
};

export const Secao: React.FC<Props> = ({ titulo, aberta, aoAlternar, children }) => (
  <section style={{ borderBottom: `1px solid ${VEU.linha}` }}>
    <button
      type="button"
      aria-expanded={aberta}
      onClick={aoAlternar}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0.75rem",
        font: "inherit",
        fontWeight: 700,
        color: COR.amarelo,
        background: aberta ? VEU.leve : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span>{titulo}</span>
      <span aria-hidden>{aberta ? "▾" : "▸"}</span>
    </button>
    {aberta ? <div style={{ padding: "0.5rem 0.75rem 0.85rem" }}>{children}</div> : null}
  </section>
);
