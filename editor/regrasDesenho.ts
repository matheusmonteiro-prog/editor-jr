// Contas da "caixa do desenho real" do minimapa. Sem DOM: dá para testar pelo Node.
// O DOM fica em medirDesenho.ts. Tudo em FRAÇÃO DA TELA (0 = borda esquerda/topo, 1 = direita/base).

// MESMA conta da linha do <Sequence> do elemento em src/PlanoComposicao.tsx (className
// "plano-elemento plano-elemento-<id seguro>"): fica só A-Z a-z 0-9 e "-"; qualquer outro
// caractere (espaço, acento, "_", ":" …) vira "_<código hex>_". Nunca dá espaço (a classe
// não se parte) e dois ids diferentes nunca dão a mesma classe. Se mudar lá, mudar aqui.
export const idSeguro = (id: string): string => id.replace(/[^A-Za-z0-9-]/g, (c) => `_${c.charCodeAt(0).toString(16)}_`);
export const classeDoElemento = (id: string): string => `plano-elemento-${idSeguro(id)}`;

export type Retangulo = { x0: number; y0: number; x1: number; y1: number };
export type RetanguloPx = { left: number; top: number; right: number; bottom: number };

// Pixel da página → fração da tela, a partir do retângulo da composição no Player.
export const paraFracao = (r: RetanguloPx, tela: RetanguloPx): Retangulo | null => {
  const L = tela.right - tela.left;
  const A = tela.bottom - tela.top;
  if (!(L > 0 && A > 0)) return null;
  return { x0: (r.left - tela.left) / L, y0: (r.top - tela.top) / A, x1: (r.right - tela.left) / L, y1: (r.bottom - tela.top) / A };
};

const temArea = (r: Retangulo) => r.x1 - r.x0 > 1e-6 && r.y1 - r.y0 > 1e-6;

// União (o menor retângulo que cobre todos). Sem nenhum com área = null.
export const uniao = (lista: (Retangulo | null)[]): Retangulo | null => {
  const ok = lista.filter((r): r is Retangulo => r !== null && temArea(r));
  if (ok.length === 0) return null;
  return {
    x0: Math.min(...ok.map((r) => r.x0)),
    y0: Math.min(...ok.map((r) => r.y0)),
    x1: Math.max(...ok.map((r) => r.x1)),
    y1: Math.max(...ok.map((r) => r.y1)),
  };
};

// A transformação do vídeo (src/PlanoComposicao.tsx, estiloDaTransformacao): camada de tela
// cheia, origem no centro (0,5; 0,5), translate(x, y) e depois scale(s):
// ponto p → 0,5 + desloc + s·(p − 0,5).
export const comTransformacao = (r: Retangulo, s: number, x: number, y: number): Retangulo => ({
  x0: 0.5 + x + s * (r.x0 - 0.5),
  y0: 0.5 + y + s * (r.y0 - 0.5),
  x1: 0.5 + x + s * (r.x1 - 0.5),
  y1: 0.5 + y + s * (r.y1 - 0.5),
});

// O contrário: tira a transformação que estava aplicada quando mediu. Assim a medida vira o
// desenho "de base" da peça, e a caixa acompanha qualquer escala/posição nova sem remedir.
export const semTransformacao = (r: Retangulo, s: number, x: number, y: number): Retangulo => ({
  x0: (r.x0 - 0.5 - x) / s + 0.5,
  y0: (r.y0 - 0.5 - y) / s + 0.5,
  x1: (r.x1 - 0.5 - x) / s + 0.5,
  y1: (r.y1 - 0.5 - y) / s + 0.5,
});

// Critério de estabilidade: duas medidas em quadros DIFERENTES que não mudam mais que
// TOLERANCIA (0,5% da tela) em nenhuma borda = a animação de entrada parou.
export const TOLERANCIA = 0.005;
export const mesmaMedida = (a: Retangulo, b: Retangulo, tol = TOLERANCIA): boolean =>
  Math.abs(a.x0 - b.x0) <= tol && Math.abs(a.y0 - b.y0) <= tol && Math.abs(a.x1 - b.x1) <= tol && Math.abs(a.y1 - b.y1) <= tol;

export type Medida = { quadro: number; base: Retangulo };
export type EstadoMedida = { anterior: Medida | null; estavel: Retangulo | null };

// Junta uma medida nova ao estado. Mesmo quadro de novo (ex.: remedir depois de mudar a escala)
// troca a anterior sem contar como "parou". Base fica estável quando dois quadros diferentes
// seguidos batem; a estável só é trocada por outra estável.
export const juntarMedida = (estado: EstadoMedida, nova: Medida): EstadoMedida => {
  const { anterior } = estado;
  if (anterior && anterior.quadro !== nova.quadro && mesmaMedida(anterior.base, nova.base)) {
    return { anterior: nova, estavel: nova.base };
  }
  return { anterior: nova, estavel: estado.estavel };
};

// O que o minimapa recebe. base = desenho SEM a transformação (escala/posição) do elemento.
export type Desenho = { estado: "sem-player" | "fora" | "vazio" | "animando" | "estavel"; base: Retangulo | null };

// A medida guardada vale enquanto o CONTEÚDO da peça não muda (texto, cor, componente, tempo).
// Escala, opacidade e posição ficam de fora: a base já é sem transformação.
export const chaveDoDesenho = (el: Record<string, unknown>): string => {
  const { escala: _e, opacidade: _o, deslocamento: _d, ...resto } = el;
  return JSON.stringify(resto);
};
