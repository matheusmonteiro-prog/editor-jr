import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { COR_CORTE, CURVA_CORTE, FONTE_TITULO } from "./estiloCortes";

// Legenda em faixa de papel (versão B): 1 a 3 palavras por vez, em caixa alta, colada na divisão
// entre o quadro e o JR. A palavra que está sendo dita fica na cor de destaque (tipo karaokê).
// Cada grupo entra levemente torto (alterna o ângulo), como recorte colado.

const palavraSchema = z.object({
  texto: z.string(),
  inicioFrames: z.number().min(0),
  fimFrames: z.number().min(0),
});

export const legendaFaixaSchema = z.object({
  palavras: z.array(palavraSchema).default([]),
  // Texto fixo (sem karaokê), por exemplo no fecho. Ganha das palavras.
  textoFixo: z.string().optional(),
  corDestaque: z.string().default(COR_CORTE.verdeMetodo),
  tamanhoFonte: z.number().min(0.02).max(0.12).default(0.068), // fração da largura
  maxPalavras: z.number().min(1).max(5).default(3),
  pausaQuebraFrames: z.number().min(1).default(15),
  // Centro vertical da faixa, em px a partir do topo da tela.
  centroY: z.number().default(900),
  // Centro horizontal, em px. Sem valor: meio da tela.
  centroX: z.number().optional(),
  // Largura máxima da faixa, em px. Sem valor: 90% da tela.
  larguraMaxima: z.number().optional(),
});
type Props = z.input<typeof legendaFaixaSchema>;
type Palavra = z.infer<typeof palavraSchema>;

const agrupar = (palavras: Palavra[], max: number, pausa: number) => {
  const grupos: Palavra[][] = [];
  for (const p of [...palavras].sort((a, b) => a.inicioFrames - b.inicioFrames)) {
    const atual = grupos[grupos.length - 1];
    const ultima = atual?.[atual.length - 1];
    const quebra =
      !atual || atual.length >= max || p.inicioFrames - ultima.fimFrames >= pausa || /[.?!,]$/.test(ultima.texto.trim());
    if (quebra) grupos.push([p]);
    else atual.push(p);
  }
  return grupos;
};

const limpar = (t: string) => t.trim().replace(/[.,!]+$/, "").toUpperCase();

export const LegendaFaixa: React.FC<Props> = ({
  palavras = [],
  textoFixo,
  corDestaque = COR_CORTE.verdeMetodo,
  tamanhoFonte = 0.068,
  maxPalavras = 3,
  pausaQuebraFrames = 15,
  centroY = 900,
  centroX,
  larguraMaxima,
}) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const grupos = useMemo(() => agrupar(palavras, maxPalavras, pausaQuebraFrames), [palavras, maxPalavras, pausaQuebraFrames]);

  let indice = -1;
  let conteudo: React.ReactNode = null;
  let inicioGrupo = 0;
  if (textoFixo) {
    conteudo = textoFixo.toUpperCase();
  } else {
    indice = grupos.findIndex((g, i) => {
      const fim = i + 1 < grupos.length ? Math.min(grupos[i + 1][0].inicioFrames, g[g.length - 1].fimFrames + 12) : g[g.length - 1].fimFrames + 12;
      return frame >= g[0].inicioFrames && frame < fim;
    });
    if (indice < 0) return null;
    const g = grupos[indice];
    inicioGrupo = g[0].inicioFrames;
    conteudo = g.map((p, i) => {
      const proxima = g[i + 1]?.inicioFrames ?? Infinity;
      const falando = frame >= p.inicioFrames && frame < Math.max(p.fimFrames, Math.min(proxima, p.fimFrames + 8));
      return (
        <span key={i} style={{ color: falando ? corDestaque : COR_CORTE.carvao }}>
          {i > 0 ? " " : ""}
          {limpar(p.texto)}
        </span>
      );
    });
  }

  const pop = interpolate(frame - inicioGrupo, [0, 4], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA_CORTE });
  const angulo = indice % 2 === 0 ? -1.2 : 0.9;
  const fonte = W * tamanhoFonte;
  const maxL = larguraMaxima ?? W * 0.9;
  return (
    <div style={{ position: "absolute", left: (centroX ?? W / 2) - maxL / 2, top: centroY, width: maxL, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `translateY(-50%) rotate(${textoFixo ? -1 : angulo}deg) scale(${textoFixo ? 1 : pop})`,
          backgroundColor: COR_CORTE.papelClaro,
          color: COR_CORTE.carvao,
          fontFamily: FONTE_TITULO,
          fontSize: fonte,
          lineHeight: 1.12,
          padding: `${fonte * 0.16}px ${fonte * 0.32}px ${fonte * 0.12}px`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          maxWidth: maxL,
          textAlign: "center",
        }}
      >
        {conteudo}
      </div>
    </div>
  );
};
