// Atalhos de teclado (fatia 5). Sem React: dá para testar pelo Node.
// Ctrl+Z = desfazer; Ctrl+Y ou Ctrl+Shift+Z = refazer (Cmd no Mac). Só valem com o foco FORA de
// caixa de texto: dentro dela, o Ctrl+Z é o desfazer do próprio navegador (letra por letra).

export type Tecla = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  alvoEditavel: boolean; // foco em input, textarea, select ou campo editável
};

export const acaoDoAtalho = (t: Tecla): "desfazer" | "refazer" | null => {
  if (t.alvoEditavel || t.altKey) return null;
  if (!(t.ctrlKey || t.metaKey)) return null;
  const k = t.key.toLowerCase();
  if (k === "z") return t.shiftKey ? "refazer" : "desfazer";
  if (k === "y" && !t.shiftKey) return "refazer";
  return null;
};

// O alvo do evento é uma caixa de texto? (usado no navegador)
export const ehEditavel = (alvo: EventTarget | null): boolean => {
  if (!alvo || typeof (alvo as HTMLElement).tagName !== "string") return false;
  const el = alvo as HTMLElement;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
};
