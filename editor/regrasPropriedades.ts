import type { PlanoEditor } from "./regrasPlano";

// Painel de texto e cor (fatia 5). Sem React e sem zod: recebe o JSON Schema que o
// z.toJSONSchema gera a partir do schema da peça (https://zod.dev/json-schema) e devolve os
// campos editáveis. Dá para testar pelo Node.
//
// Regra do Matheus: campo string = texto; campo cujo nome começa com "cor" = cor.
// Ficam de fora: listas (ex.: itens da Pauta), números, sim/não e strings com lista fixa de
// opções (enum, ex.: ícone), porque um texto livre ali quebraria a peça.

export const CORES_DA_MARCA = ["#0F2A1D", "#F5F0E6", "#EFAF20"] as const;

export type Campo = {
  campo: string;
  tipo: "texto" | "cor";
  padrao: string | undefined; // o .default() do schema
  minimo: number | undefined; // minLength (ex.: ArrobaCanal.usuario precisa de 1 letra)
  maximo: number | undefined;
};

type EsquemaJson = { type?: unknown; properties?: Record<string, Record<string, unknown>> };

// Caminhos de arquivo: escondidos do painel (decisão do Matheus, 11/11/2026). Um nome errado ali
// quebra a imagem e o validador não confere. Voltam quando houver a biblioteca de arquivos.
export const CAMPOS_DE_ARQUIVO = new Set(["imagem", "src", "logo", "imagemPersonagem"]);

export const camposEditaveis = (esquema: EsquemaJson | null): Campo[] => {
  if (!esquema || typeof esquema.properties !== "object" || esquema.properties === null) return [];
  const campos: Campo[] = [];
  for (const [campo, def] of Object.entries(esquema.properties)) {
    if (def.type !== "string" || Array.isArray(def.enum) || CAMPOS_DE_ARQUIVO.has(campo)) continue;
    // Cor: nome começa com "cor" (regra do Matheus) ou o schema usa zColor() do Remotion, que o
    // z.toJSONSchema marca com description "__remotion-color" (visto no zod 4.5.4 instalado).
    const ehCor = /^cor/i.test(campo) || def.description === "__remotion-color";
    campos.push({
      campo,
      tipo: ehCor ? "cor" : "texto",
      padrao: typeof def.default === "string" ? def.default : undefined,
      minimo: typeof def.minLength === "number" ? def.minLength : undefined,
      maximo: typeof def.maxLength === "number" ? def.maxLength : undefined,
    });
  }
  return campos;
};

// Confere um valor contra os limites do campo. Cor: aceita #rgb, #rrggbb ou #rrggbbaa (o
// seletor do navegador só entende #rrggbb; outras formas, ex. rgba(), ficam no campo de texto).
// Cor VAZIA não é erro: quer dizer "usar o padrão da peça" (há peças cujo padrão de cor é "").
export const conferirValor = (c: Campo, valor: string): { ok: true } | { ok: false; erro: string } => {
  if (c.tipo === "cor" && valor === "") return { ok: true };
  if (c.minimo !== undefined && valor.length < c.minimo) return { ok: false, erro: `Precisa de pelo menos ${c.minimo} caractere(s).` };
  if (c.maximo !== undefined && valor.length > c.maximo) return { ok: false, erro: `No máximo ${c.maximo} caracteres.` };
  if (c.tipo === "cor" && !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(valor) && !/^rgba?\(/i.test(valor)) {
    return { ok: false, erro: "Cor no formato #RRGGBB (ex.: #EFAF20)." };
  }
  return { ok: true };
};

export const ehHexSeis = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

// Quais peças o elemento tem: um nome só, ou a lista (props separadas por peça).
export const pecasDoElemento = (el: PlanoEditor["elementos"][number]): { nome: string; dentroDe: string | null }[] => {
  if (Array.isArray(el.componente)) return el.componente.map((nome) => ({ nome, dentroDe: nome }));
  if (typeof el.componente === "string" && el.componente !== "a confirmar") return [{ nome: el.componente, dentroDe: null }];
  return [];
};

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// Valor atual: o que está nas props do plano; se não estiver, o padrão do schema.
export const valorAtual = (el: PlanoEditor["elementos"][number], dentroDe: string | null, c: Campo): string => {
  const props = ehObjeto(el.props) ? (dentroDe === null ? el.props : el.props[dentroDe]) : undefined;
  const v = ehObjeto(props) ? props[c.campo] : undefined;
  return typeof v === "string" ? v : (c.padrao ?? "");
};

// Grava o valor em props (ou props[peça], quando "componente" é lista). Devolve um plano NOVO;
// se o valor for inválido, ou as props estiverem "a confirmar", devolve o MESMO plano.
export const aplicarPropriedade = (
  plano: PlanoEditor,
  indice: number,
  dentroDe: string | null,
  c: Campo,
  valor: string,
): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el || !ehObjeto(el.props) || !conferirValor(c, valor).ok) return plano;
  const props = JSON.parse(JSON.stringify(el.props)) as Record<string, unknown>;
  // Cor vazia = tirar a chave das props: a peça volta a usar o próprio padrão.
  const tirar = c.tipo === "cor" && valor === "";
  if (dentroDe === null) {
    if (tirar ? !(c.campo in props) : props[c.campo] === valor) return plano;
    if (tirar) delete props[c.campo];
    else props[c.campo] = valor;
  } else {
    const sub = ehObjeto(props[dentroDe]) ? { ...(props[dentroDe] as Record<string, unknown>) } : {};
    if (tirar ? !(c.campo in sub) : sub[c.campo] === valor) return plano;
    if (tirar) delete sub[c.campo];
    else sub[c.campo] = valor;
    props[dentroDe] = sub;
  }
  return { ...plano, elementos: plano.elementos.map((e, i) => (i === indice ? { ...e, props } : e)) };
};
