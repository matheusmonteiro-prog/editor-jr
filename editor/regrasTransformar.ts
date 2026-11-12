import type { ElementoEditor, PlanoEditor } from "./regrasPlano";

// Regras da seção "Transformar" (escala, opacidade, deslocamento x/y). Sem React: dá para testar
// pelo Node. São campos do ELEMENTO (fora das props), lidos por src/PlanoComposicao.tsx
// (estiloDaTransformacao) e conferidos por scripts/validar-plano.mjs (checagem 12).
// Valor igual ao padrão = a chave SAI do elemento: o plano fica igual a um plano antigo.

export type CampoTransformar = "escala" | "opacidade" | "x" | "y";

type Regra = { minimo: number; maximo: number; padrao: number; passo: number };

// MESMOS limites do validador (LIMITES_TRANSFORMAR). Se mudar lá, mudar aqui.
export const REGRAS_TRANSFORMAR: Record<CampoTransformar, Regra> = {
  escala: { minimo: 0.1, maximo: 5, padrao: 1, passo: 0.1 },
  opacidade: { minimo: 0, maximo: 1, padrao: 1, passo: 0.1 },
  x: { minimo: -1, maximo: 1, padrao: 0, passo: 0.05 },
  y: { minimo: -1, maximo: 1, padrao: 0, passo: 0.05 },
};

export const CAMPOS_TRANSFORMAR: CampoTransformar[] = ["escala", "opacidade", "x", "y"];

// Três casas bastam (passos de 0,05) e somar 0,1 várias vezes não vira 0.30000000000000004.
const arredondar = (v: number) => Math.round(v * 1000) / 1000;

const ehNumero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const valorTransformar = (el: ElementoEditor, campo: CampoTransformar): number => {
  const bruto = campo === "x" || campo === "y" ? el.deslocamento?.[campo] : el[campo];
  return ehNumero(bruto) ? bruto : REGRAS_TRANSFORMAR[campo].padrao;
};

// Tem alguma das três chaves (é o que o botão "voltar ao normal" tira).
export const temTransformacao = (el: ElementoEditor): boolean =>
  el.escala !== undefined || el.opacidade !== undefined || el.deslocamento !== undefined;

export type ResultadoTransformar = { ok: true; valor: number } | { ok: false; erro: string };

export const conferirTransformar = (campo: CampoTransformar, texto: string): ResultadoTransformar => {
  const { minimo, maximo } = REGRAS_TRANSFORMAR[campo];
  const valor = Number(texto.trim().replace(",", "."));
  if (texto.trim() === "" || !Number.isFinite(valor)) return { ok: false, erro: `Use um número (ex.: ${REGRAS_TRANSFORMAR[campo].padrao}).` };
  if (valor < minimo || valor > maximo) return { ok: false, erro: `Precisa estar entre ${minimo} e ${maximo}.` };
  return { ok: true, valor };
};

// Plano novo com o campo trocado. Valor fora do limite ou igual ao atual = o MESMO plano
// (o histórico não cria passo).
export const aplicarTransformar = (plano: PlanoEditor, indice: number, campo: CampoTransformar, valor: number): PlanoEditor => {
  const el = plano.elementos[indice];
  const regra = REGRAS_TRANSFORMAR[campo];
  if (!el || !ehNumero(valor) || valor < regra.minimo || valor > regra.maximo) return plano;
  const v = arredondar(valor);
  if (v === valorTransformar(el, campo) && (v !== regra.padrao || !temChave(el, campo))) return plano;

  const novo: ElementoEditor = { ...el };
  if (campo === "escala" || campo === "opacidade") {
    if (v === regra.padrao) delete novo[campo];
    else novo[campo] = v;
  } else {
    const desl = { x: valorTransformar(el, "x"), y: valorTransformar(el, "y"), [campo]: v };
    if (desl.x === 0 && desl.y === 0) delete novo.deslocamento;
    else novo.deslocamento = desl;
  }
  const elementos = [...plano.elementos];
  elementos[indice] = novo;
  return { ...plano, elementos };
};

const temChave = (el: ElementoEditor, campo: CampoTransformar): boolean =>
  campo === "x" || campo === "y" ? el.deslocamento !== undefined : el[campo] !== undefined;

// Botões − e +: um passo, parando no limite. No limite = o MESMO plano.
export const passoTransformar = (plano: PlanoEditor, indice: number, campo: CampoTransformar, sinal: 1 | -1): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el) return plano;
  const { minimo, maximo, passo } = REGRAS_TRANSFORMAR[campo];
  const alvo = Math.min(maximo, Math.max(minimo, arredondar(valorTransformar(el, campo) + sinal * passo)));
  return aplicarTransformar(plano, indice, campo, alvo);
};

// "Voltar ao normal": tira as três chaves. Sem nenhuma = o MESMO plano.
export const resetarTransformar = (plano: PlanoEditor, indice: number): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el || !temTransformacao(el)) return plano;
  const novo: ElementoEditor = { ...el };
  delete novo.escala;
  delete novo.opacidade;
  delete novo.deslocamento;
  const elementos = [...plano.elementos];
  elementos[indice] = novo;
  return { ...plano, elementos };
};
