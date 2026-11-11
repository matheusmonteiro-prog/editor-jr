import React, { useLayoutEffect, useRef, useState } from "react";
import { caberNaCaixa } from "./regrasLayout";
import { COR, VEU } from "./tema";

// Casca da tela: ocupa a janela inteira e NÃO rola. Barra fina no topo, palco do vídeo à
// esquerda, painel de ferramentas à direita (rola sozinho) e rodapé compacto embaixo.
// Medidas em rem, vh e clamp: acompanham a tela do notebook.

export const ALTURA_RODAPE = "clamp(9rem, 27vh, 17rem)";

type CascaProps = {
  barra: React.ReactNode;
  palco: React.ReactNode;
  lateral: React.ReactNode;
  rodape?: React.ReactNode;
  flutuante?: React.ReactNode;
};

export const Casca: React.FC<CascaProps> = ({ barra, palco, lateral, rodape, flutuante }) => (
  <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: COR.verde, color: COR.creme, overflow: "hidden" }}>
    <header style={{ flex: "none", position: "relative", zIndex: 5, display: "flex", alignItems: "center", gap: "0.4rem 0.6rem", flexWrap: "wrap", padding: "0.4rem 0.75rem", borderBottom: `1px solid ${VEU.linha}`, minHeight: "2.6rem" }}>
      {barra}
    </header>
    <main style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr) clamp(17rem, 27vw, 24rem)", gridTemplateRows: "minmax(0, 1fr)" }}>
      <div style={{ position: "relative", minWidth: 0, minHeight: 0 }}>{palco}</div>
      <aside style={{ minWidth: 0, minHeight: 0, overflowY: "auto", borderLeft: `1px solid ${VEU.linha}`, background: VEU.leve }}>{lateral}</aside>
    </main>
    {rodape ? (
      <footer style={{ flex: "none", height: ALTURA_RODAPE, display: "flex", flexDirection: "column", borderTop: `1px solid ${VEU.linha}` }}>{rodape}</footer>
    ) : null}
    {flutuante}
  </div>
);

// Ajusta o Player ao espaço do palco, mantendo a proporção do vídeo: nunca passa da altura nem
// da largura disponíveis (o vertical 9:16 fica mais estreito, não mais alto que a tela).
export const Palco: React.FC<{ proporcao: number; children: (largura: number, altura: number) => React.ReactNode }> = ({ proporcao, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [caixa, setCaixa] = useState({ largura: 0, altura: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setCaixa({ largura: el.clientWidth, altura: el.clientHeight });
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const { largura, altura } = caberNaCaixa(caixa.largura, caixa.altura, proporcao);
  return (
    <div ref={ref} style={{ position: "absolute", inset: "0.6rem", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      {largura > 0 ? children(largura, altura) : null}
    </div>
  );
};

// Mensagem no lugar do vídeo (nenhum plano aberto, sem vídeo de fundo, lendo a duração…).
export const AvisoNoPalco: React.FC<{ children: React.ReactNode; destaque?: boolean }> = ({ children, destaque = false }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center", color: destaque ? COR.amarelo : COR.creme }}>
    <div style={{ maxWidth: "32rem" }}>{children}</div>
  </div>
);
