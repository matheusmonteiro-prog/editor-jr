// Atalhos de teclado. Sem React: dá para testar pelo Node. Todos só valem com o foco FORA de
// caixa de texto (dentro dela, as teclas são do próprio navegador: Ctrl+Z desfaz letra por letra).
//   Ctrl+Z = desfazer; Ctrl+Y ou Ctrl+Shift+Z = refazer (Cmd no Mac)
//   Espaço = tocar/pausar
//   ← / → = 1 quadro para trás/frente; Shift+← / Shift+→ = 1 segundo
//   Delete = apagar o elemento selecionado (dá para desfazer)
//   Ctrl+] = trazer o elemento para a frente; Ctrl+[ = enviar para trás (camadas)
//   Ctrl+D = duplicar o elemento selecionado (o navegador usaria para "favoritar")

export type AcaoAtalho =
  | "desfazer"
  | "refazer"
  | "tocar"
  | "quadroAntes"
  | "quadroDepois"
  | "segundoAntes"
  | "segundoDepois"
  | "remover"
  | "paraFrente"
  | "paraTras"
  | "duplicar";

export type Tecla = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  alvoEditavel: boolean; // foco em input, textarea, select ou campo editável
};

export const acaoDoAtalho = (t: Tecla): AcaoAtalho | null => {
  if (t.alvoEditavel || t.altKey) return null;
  if (t.ctrlKey || t.metaKey) {
    const k = t.key.toLowerCase();
    if (k === "z") return t.shiftKey ? "refazer" : "desfazer";
    if (k === "y" && !t.shiftKey) return "refazer";
    if (k === "]" && !t.shiftKey) return "paraFrente";
    if (k === "[" && !t.shiftKey) return "paraTras";
    if (k === "d" && !t.shiftKey) return "duplicar";
    return null; // Ctrl + outra tecla fica com o navegador
  }
  if (t.key === " " || t.key === "Spacebar") return t.shiftKey ? null : "tocar";
  if (t.key === "ArrowLeft") return t.shiftKey ? "segundoAntes" : "quadroAntes";
  if (t.key === "ArrowRight") return t.shiftKey ? "segundoDepois" : "quadroDepois";
  if (t.key === "Delete" && !t.shiftKey) return "remover";
  return null;
};

// O alvo do evento é uma caixa de texto? (usado no navegador)
export const ehEditavel = (alvo: EventTarget | null): boolean => {
  if (!alvo || typeof (alvo as HTMLElement).tagName !== "string") return false;
  const el = alvo as HTMLElement;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
};
