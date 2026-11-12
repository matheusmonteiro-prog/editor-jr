import type { PlanoEditor } from "./regrasPlano";
import { REGRAS_TRANSFORMAR, aplicarTransformar } from "./regrasTransformar";
import { comTransformacao, type Retangulo } from "./regrasDesenho";

// Contas do minimapa (seção "Transformar"). Sem React: dá para testar pelo Node.
// Imita src/PlanoComposicao.tsx (estiloDaTransformacao): cada peça é uma camada de TELA CHEIA com
// transform "translate(x*100%, y*100%) scale(escala)" e origem no centro (50% 50%). Então a caixa
// da peça = a tela inteira × escala, com o centro em (meio da tela + x·largura, meio + y·altura).
// A tela fica dentro de uma moldura com MARGEM de cada lado, para os cantos aparecerem mesmo
// com a caixa maior que a tela. Limites e gravação: regrasTransformar.ts (nada duplicado aqui).

export const MARGEM = 0.25; // fração da tela de folga em cada lado da moldura
export const ENCAIXE_DESLOCAMENTO = 0.01;
export const ENCAIXE_ESCALA = 0.01;

export const tamanhoDaTela = (plano: PlanoEditor): { largura: number; altura: number } =>
  plano.orientacao === "vertical" ? { largura: 1080, altura: 1920 } : { largura: 1920, altura: 1080 };

// Moldura de L px de largura: tamanho da tela desenhada e onde ela começa.
export type Geometria = { telaL: number; telaA: number; origemX: number; origemY: number; molduraL: number; molduraA: number };

export const geometria = (plano: PlanoEditor, molduraL: number): Geometria => {
  const { largura, altura } = tamanhoDaTela(plano);
  const telaL = molduraL / (1 + 2 * MARGEM);
  const telaA = (telaL * altura) / largura;
  return { telaL, telaA, origemX: telaL * MARGEM, origemY: telaA * MARGEM, molduraL, molduraA: telaA * (1 + 2 * MARGEM) };
};

export type Caixa = { esquerda: number; topo: number; largura: number; altura: number; centroX: number; centroY: number };

// Caixa da peça em px da moldura.
export const caixaDaPeca = (g: Geometria, escala: number, x: number, y: number): Caixa => {
  const centroX = g.origemX + g.telaL / 2 + x * g.telaL;
  const centroY = g.origemY + g.telaA / 2 + y * g.telaA;
  const largura = g.telaL * escala;
  const altura = g.telaA * escala;
  return { esquerda: centroX - largura / 2, topo: centroY - altura / 2, largura, altura, centroX, centroY };
};

const encaixar = (v: number, passo: number) => Math.round(Math.round(v / passo) * passo * 1000) / 1000;
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Arrastar a caixa: px andados → fração da tela, com encaixe 0,01 e limite −1 a 1.
export const deslocamentoArrastado = (g: Geometria, x0: number, y0: number, dxPx: number, dyPx: number): { x: number; y: number } => {
  const rx = REGRAS_TRANSFORMAR.x;
  const ry = REGRAS_TRANSFORMAR.y;
  return {
    x: limitar(encaixar(x0 + dxPx / g.telaL, ENCAIXE_DESLOCAMENTO), rx.minimo, rx.maximo),
    y: limitar(encaixar(y0 + dyPx / g.telaA, ENCAIXE_DESLOCAMENTO), ry.minimo, ry.maximo),
  };
};

// Puxar um canto: a escala acompanha a distância do ponteiro ao centro da caixa (o centro fica
// parado, como no vídeo). Encaixe 0,01, limite 0,1 a 5.
export const escalaDoCanto = (
  escala0: number,
  centro: { x: number; y: number },
  inicio: { x: number; y: number },
  agora: { x: number; y: number },
): number => {
  const d0 = Math.hypot(inicio.x - centro.x, inicio.y - centro.y);
  const d1 = Math.hypot(agora.x - centro.x, agora.y - centro.y);
  const r = REGRAS_TRANSFORMAR.escala;
  if (d0 < 1e-6) return escala0;
  return limitar(encaixar((escala0 * d1) / d0, ENCAIXE_ESCALA), r.minimo, r.maximo);
};

// Grava x e y juntos usando a regra única (aplicarTransformar). Igual = o MESMO plano.
export const aplicarDeslocamento = (plano: PlanoEditor, indice: number, x: number, y: number): PlanoEditor =>
  aplicarTransformar(aplicarTransformar(plano, indice, "x", x), indice, "y", y);

// Caixa do DESENHO REAL (medido no Player, sem transformação = "base") com a escala e a posição
// de agora: mesma conta do vídeo (regrasDesenho.ts, comTransformacao), em px da moldura.
export const caixaDoDesenho = (g: Geometria, base: Retangulo, escala: number, x: number, y: number): Caixa => {
  const r = comTransformacao(base, escala, x, y);
  const esquerda = g.origemX + r.x0 * g.telaL;
  const topo = g.origemY + r.y0 * g.telaA;
  const largura = (r.x1 - r.x0) * g.telaL;
  const altura = (r.y1 - r.y0) * g.telaA;
  return { esquerda, topo, largura, altura, centroX: esquerda + largura / 2, centroY: topo + altura / 2 };
};

// Ponto que fica parado quando a escala muda: o centro da tela + o deslocamento (a origem do
// transform no vídeo). Os cantos escalam a partir DELE, não do centro da caixa.
export const origemDaEscala = (g: Geometria, x: number, y: number): { x: number; y: number } => {
  const c = caixaDaPeca(g, 1, x, y);
  return { x: c.centroX, y: c.centroY };
};
