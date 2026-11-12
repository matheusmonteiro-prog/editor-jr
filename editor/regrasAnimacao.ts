import { fpsDoPlano, type ElementoEditor, type PlanoEditor } from "./regrasPlano";

// Regras da seção "Animação" (entrada e saída do elemento). Sem React: dá para testar pelo Node.
// São campos do ELEMENTO (fora das props), lidos por src/PlanoComposicao.tsx (ElementoAnimado)
// e conferidos por scripts/validar-plano.mjs (checagem 13). Sem animação = a chave SAI do
// elemento: o plano fica igual a um plano antigo.

export type LadoAnimacao = "entrada" | "saida";
export type TipoAnimacao = "fade" | "deslizar" | "zoom";
export type DirecaoAnimacao = "esquerda" | "direita" | "cima" | "baixo";
export type Animacao = { tipo: TipoAnimacao; frames: number; direcao?: DirecaoAnimacao };

// MESMAS listas do validador (TIPOS_ANIMACAO, DIRECOES_ANIMACAO). Se mudar lá, mudar aqui.
export const TIPOS_ANIMACAO: TipoAnimacao[] = ["fade", "deslizar", "zoom"];
export const DIRECOES_ANIMACAO: DirecaoAnimacao[] = ["esquerda", "direita", "cima", "baixo"];
export const LADOS_ANIMACAO: LadoAnimacao[] = ["entrada", "saida"];
export const FRAMES_PADRAO_ANIMACAO = 15; // meio segundo a 30 fps

// Duração do elemento em quadros, com a MESMA prioridade do motor (duracaoFrames, senão duracao·fps).
export const duracaoEmQuadros = (plano: PlanoEditor, el: ElementoEditor): number | null => {
  if (Number.isInteger(el.duracaoFrames) && (el.duracaoFrames as number) > 0) return el.duracaoFrames as number;
  const fps = fpsDoPlano(plano);
  if (fps === null || !(el.duracao > 0)) return null;
  return Math.round(el.duracao * fps);
};

export const animacaoDe = (el: ElementoEditor, lado: LadoAnimacao): Animacao | null => {
  const a = el[lado] as Animacao | undefined;
  return a && typeof a === "object" && TIPOS_ANIMACAO.includes(a.tipo) ? a : null;
};

// Quadros que este lado pode usar: a duração menos o que o OUTRO lado já usa.
export const maximoDeQuadros = (plano: PlanoEditor, el: ElementoEditor, lado: LadoAnimacao): number | null => {
  const total = duracaoEmQuadros(plano, el);
  if (total === null) return null;
  const outro = animacaoDe(el, lado === "entrada" ? "saida" : "entrada");
  return total - (outro?.frames ?? 0);
};

export type ResultadoFrames = { ok: true; valor: number } | { ok: false; erro: string };

export const conferirFrames = (texto: string, maximo: number | null): ResultadoFrames => {
  const valor = Number(texto.trim());
  if (texto.trim() === "" || !Number.isInteger(valor)) return { ok: false, erro: "Use um número inteiro de quadros (ex.: 15)." };
  if (valor < 1) return { ok: false, erro: "Precisa ser pelo menos 1 quadro." };
  if (maximo !== null && valor > maximo) return { ok: false, erro: `Entrada + saída não podem passar da duração: aqui cabem até ${maximo} quadros.` };
  return { ok: true, valor };
};

const trocar = (plano: PlanoEditor, indice: number, novo: ElementoEditor): PlanoEditor => {
  const elementos = [...plano.elementos];
  elementos[indice] = novo;
  return { ...plano, elementos };
};

const iguais = (a: Animacao | null, b: Animacao | null) => JSON.stringify(a) === JSON.stringify(b);

// Muda um lado. Tipo novo sem frames = FRAMES_PADRAO (cortado no máximo); "direcao" só fica em
// "deslizar" (padrão "esquerda"). Valor fora do limite ou igual ao atual = o MESMO plano.
export const aplicarAnimacao = (
  plano: PlanoEditor,
  indice: number,
  lado: LadoAnimacao,
  mudanca: Partial<Animacao>,
): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el) return plano;
  const atual = animacaoDe(el, lado);
  const maximo = maximoDeQuadros(plano, el, lado);
  const tipo = mudanca.tipo ?? atual?.tipo;
  if (!tipo || !TIPOS_ANIMACAO.includes(tipo)) return plano;
  if (maximo !== null && maximo < 1) return plano; // o outro lado já ocupa o elemento todo
  const frames = mudanca.frames ?? atual?.frames ?? Math.min(FRAMES_PADRAO_ANIMACAO, maximo ?? FRAMES_PADRAO_ANIMACAO);
  if (!Number.isInteger(frames) || frames < 1 || (maximo !== null && frames > maximo)) return plano;
  const novo: Animacao = { tipo, frames };
  if (tipo === "deslizar") {
    const direcao = mudanca.direcao ?? atual?.direcao ?? "esquerda";
    if (!DIRECOES_ANIMACAO.includes(direcao)) return plano;
    novo.direcao = direcao;
  }
  if (iguais(novo, atual)) return plano;
  return trocar(plano, indice, { ...el, [lado]: novo });
};

// Reset do campo: tira a chave daquele lado (sem chave = como plano antigo).
export const removerAnimacao = (plano: PlanoEditor, indice: number, lado: LadoAnimacao): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el || el[lado] === undefined) return plano;
  const novo: ElementoEditor = { ...el };
  delete novo[lado];
  return trocar(plano, indice, novo);
};
