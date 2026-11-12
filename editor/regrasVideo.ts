import { REGRAS_TRANSFORMAR } from "./regrasTransformar";
import { comTransformacao, type Retangulo } from "./regrasDesenho";

// Regras do arrastar NO VÍDEO (overlay por cima do Player) e das guias. Sem DOM: dá para testar
// pelo Node. Tudo em FRAÇÃO DA TELA. O DOM fica em CamadaDeEdicao.tsx e medirDesenho.ts.

export type CaixaAtiva = { indice: number; desenho: Retangulo }; // desenho como está na tela agora

// Clique: qual elemento está sob o ponteiro? Vários = o mais à FRENTE, que é o mais tarde na
// lista (src/PlanoComposicao.tsx desenha plano.elementos na ordem; o último fica por cima).
export const elementoSobOPonto = (caixas: CaixaAtiva[], px: number, py: number): number | null => {
  let achado: number | null = null;
  for (const c of caixas) {
    const d = c.desenho;
    if (px >= d.x0 && px <= d.x1 && py >= d.y0 && py <= d.y1 && (achado === null || c.indice > achado)) achado = c.indice;
  }
  return achado;
};

// Guias magnéticas: bordas e centro da caixa encostam nas bordas e no centro da tela quando
// passam a menos de "limiar" (fração da tela; quem chama converte ~8 px). Alt = sem encaixe.
export type Guia = { eixo: "x" | "y"; valor: number }; // linha vertical (eixo x) ou horizontal (y)
export const ALVOS = [0, 0.5, 1];

const encaixarEixo = (a: number, b: number, limiar: number): { ajuste: number; guia: number | null } => {
  let melhor: { ajuste: number; guia: number | null } = { ajuste: 0, guia: null };
  let menor = limiar;
  for (const lado of [a, (a + b) / 2, b]) {
    for (const alvo of ALVOS) {
      const d = alvo - lado;
      if (Math.abs(d) <= menor) {
        menor = Math.abs(d);
        melhor = { ajuste: d, guia: alvo };
      }
    }
  }
  return melhor;
};

const arredondar = (v: number) => Math.round(v * 1000) / 1000;
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// base = desenho sem transformação; (x, y) = deslocamento já calculado pelo arraste.
// Devolve o deslocamento encaixado (dentro de −1 a 1) e as guias que acenderam.
export const encaixeMagnetico = (
  base: Retangulo,
  escala: number,
  x: number,
  y: number,
  limiarX: number,
  limiarY: number,
  ligado: boolean,
): { x: number; y: number; guias: Guia[] } => {
  if (!ligado) return { x, y, guias: [] };
  const r = comTransformacao(base, escala, x, y);
  const ex = encaixarEixo(r.x0, r.x1, limiarX);
  const ey = encaixarEixo(r.y0, r.y1, limiarY);
  const guias: Guia[] = [];
  if (ex.guia !== null) guias.push({ eixo: "x", valor: ex.guia });
  if (ey.guia !== null) guias.push({ eixo: "y", valor: ey.guia });
  return {
    x: limitar(arredondar(x + ex.ajuste), REGRAS_TRANSFORMAR.x.minimo, REGRAS_TRANSFORMAR.x.maximo),
    y: limitar(arredondar(y + ey.ajuste), REGRAS_TRANSFORMAR.y.minimo, REGRAS_TRANSFORMAR.y.maximo),
    guias,
  };
};

export const LIMIAR_PX = 8; // "perto" = 8 px na tela do editor
