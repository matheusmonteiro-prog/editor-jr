// Cores das cenas 3D (JR 3D Editorial Worlds), derivadas do kit v3 (src/components/v2/kitV3.tsx).
// Padronizado em 13/11/2026 (Matheus aprovou o 3D: "o fundo vai seguir a identidade visual padrão").
// Para trocar uma cor em TODAS as cenas 3D, mude aqui (ou no KIT, se for cor da marca).
import { KIT } from "../v2/kitV3";

export type Tema3D = "escuro" | "claro";

// Escuro ("Cinematic Territory"): fundo = verde do kit. É o padrão.
// Claro ("Editorial Territory"): fundo = creme do kit. Previsto, ainda NÃO testado em render (falta luz própria).
export const cores3D = (tema: Tema3D = "escuro") => {
  const escuro = tema === "escuro";
  return {
    fundo: escuro ? KIT.verde : KIT.creme,
    texto: escuro ? KIT.creme : KIT.verde,
    textoSuave: escuro ? KIT.cremeSuave : "rgba(15,42,29,0.68)",
    // Valorização / método (decisão do Matheus, Etapa 5): o mesmo verde em toda peça.
    verde: "#1DD41E",
    // Candle de alta: verde um pouco menos saturado que o do método (não "neon" em corpo grande).
    sobe: "#2DBF4E",
    // Candle de queda e sinais negativos: vermelho-terra do kit.
    desce: KIT.vermelho,
    // Renda / dividendo: dourado envelhecido (distinto do amarelo da marca, que é para destaque de texto).
    ouro: "#D9B25A",
    // Superfícies "editoriais" (base do diorama, placa do gráfico, cartão 2D).
    base: escuro ? "#1A2420" : "#D9D0BE",
    placa: escuro ? "#0F1F18" : "#EFE8DA",
    card: escuro ? "rgba(9,22,16,0.92)" : "rgba(245,240,230,0.94)",
  };
};
