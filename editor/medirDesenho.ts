import { classeDoElemento, paraFracao, uniao, type Retangulo, type RetanguloPx } from "./regrasDesenho";

// Mede no DOM do Player o retângulo do DESENHO de um elemento (não a camada de tela cheia).
// Como acha a camada: src/PlanoComposicao.tsx põe className "plano-elemento plano-elemento-<id
// seguro>" no <Sequence> do elemento; o Sequence repassa className ao <div> da camada
// (node_modules/remotion/dist/cjs/Sequence.js:390). Fora do tempo do elemento o Sequence não
// desenha nada (Sequence.js:348-350): a classe some = "fora".
// Régua: o <div class="__remotion-player"> do Player é a composição já escalada
// (node_modules/@remotion/player/dist/esm/index.mjs:2986-2988).
//
// O que conta como desenho (união de):
// - folhas visíveis: elementos sem filhos, e <img>, <svg>, <video>, <canvas> (sem entrar neles);
// - texto solto dentro de um elemento (retângulo do próprio texto, via Range);
// - qualquer elemento com fundo, imagem de fundo, borda ou sombra (ex.: uma placa).
// Não conta: display:none, visibility:hidden, tamanho zero. Opacidade NÃO é olhada (parte
// transparente de uma animação conta como desenho).

export type ResultadoMedida = { estado: "sem-player" } | { estado: "fora" } | { estado: "vazio" } | { estado: "medido"; desenho: Retangulo };

const FOLHAS = new Set(["IMG", "SVG", "VIDEO", "CANVAS", "PICTURE"]);

const temVisualProprio = (s: CSSStyleDeclaration): boolean => {
  const fundo = s.backgroundColor;
  const fundoVisivel = fundo !== "" && fundo !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(fundo);
  const borda = ["Top", "Right", "Bottom", "Left"].some((l) => parseFloat(s.getPropertyValue(`border-${l.toLowerCase()}-width`)) > 0 && s.getPropertyValue(`border-${l.toLowerCase()}-style`) !== "none");
  return fundoVisivel || (s.backgroundImage !== "" && s.backgroundImage !== "none") || borda || (s.boxShadow !== "" && s.boxShadow !== "none");
};

const px = (r: DOMRect): RetanguloPx => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });

const coletar = (no: Element, tela: RetanguloPx, saida: (Retangulo | null)[], ehCamada: boolean) => {
  const s = getComputedStyle(no);
  if (s.display === "none") return;
  const visivel = s.visibility !== "hidden";
  const filhos = Array.from(no.children);
  const ehFolha = FOLHAS.has(no.tagName.toUpperCase()) || filhos.length === 0;
  if (visivel && !ehCamada && (ehFolha || temVisualProprio(s))) saida.push(paraFracao(px(no.getBoundingClientRect()), tela));
  if (FOLHAS.has(no.tagName.toUpperCase())) return;
  if (visivel && filhos.length > 0) {
    for (const t of Array.from(no.childNodes)) {
      if (t.nodeType !== Node.TEXT_NODE || !t.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(t);
      saida.push(paraFracao(px(range.getBoundingClientRect()), tela));
    }
  }
  for (const f of filhos) coletar(f, tela, saida, false);
};

export const medirDesenho = (container: HTMLElement | null, id: string): ResultadoMedida => {
  if (!container) return { estado: "sem-player" };
  const composicao = container.querySelector(".__remotion-player");
  if (!composicao) return { estado: "sem-player" };
  const camada = composicao.querySelector(`.${classeDoElemento(id)}`);
  if (!camada) return { estado: "fora" };
  const tela = px(composicao.getBoundingClientRect());
  const partes: (Retangulo | null)[] = [];
  coletar(camada, tela, partes, true);
  const desenho = uniao(partes);
  return desenho ? { estado: "medido", desenho } : { estado: "vazio" };
};
