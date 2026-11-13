import { Easing, interpolate } from "remotion";
import { loadFont as carregarArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as carregarMono } from "@remotion/google-fonts/SpaceMono";
import { KIT } from "../v2/kitV3";

// Estilo dos cortes "explicativos" (versão B, 12/11/2026): quadro de papel em cima, JR embaixo.
// Linguagem adaptada da referência que o Matheus trouxe (papel, rasgo, etiqueta, legenda em faixa,
// desenhos chapados), com as cores do kit v3. Fontes gratuitas (Google Fonts, licença OFL).
// Archivo Black: a fonte da legenda da referência PARECE esta (não confirmado); Montserrat segue no kit.

export const FONTE_TITULO = carregarArchivo("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const FONTE_MONO = carregarMono("normal", { weights: ["400", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const COR_CORTE = {
  papel: "#EFE8DA", // o creme do kit, um pouco mais fundo, para a textura aparecer
  kraft: "#D6BF98", // papel do caderno de campo (assuntos do agro)
  papelClaro: "#FBF8F1", // cartões e faixa da legenda
  carvao: "#1E1E1C", // texto e traço
  cinza: "#B9B2A4", // linhas de "texto" dos cartões
  verde: KIT.verde, // etiqueta e títulos
  verdeMetodo: "#1F7A47", // destaque sobre o claro (o #1DD41E some no papel)
  marrom: KIT.marrom, // destaque alternativo sobre o claro (kit: pareamento)
  vermelho: KIT.vermelho, // só queda, erro ou alerta
  amarelo: KIT.amarelo, // só sobre escuro
} as const;

// Código de cores fixo do JR sobre o papel (12/11/2026): a cor diz o assunto, em todos os vídeos.
//   campo (terra, soja, boi, fazenda)  -> marrom
//   bolsa (ações, método, crescimento) -> verdeMetodo
//   neutro (conceito, pergunta, pessoa) -> carvao
//   alerta (queda, erro, risco)         -> vermelho
export const COR_ASSUNTO = { campo: "marrom", bolsa: "verdeMetodo", neutro: "carvao", alerta: "vermelho" } as const;

export const NOMES_COR = ["verde", "verdeMetodo", "marrom", "vermelho", "carvao"] as const;
export type NomeCor = (typeof NOMES_COR)[number];

// Movimento padrão: curto (200 a 450 ms) e suave.
export const CURVA_CORTE = Easing.bezier(0.2, 0.7, 0.2, 1);
export const entrada = (frame: number, inicio = 0, duracao = 9) =>
  interpolate(frame - inicio, [0, duracao], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CURVA_CORTE,
  });

// Número pseudoaleatório fixo (mesmo resultado em todo quadro e em todo render).
export const aleatorio = (semente: number) => {
  const x = Math.sin(semente * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Aviso legal em duas linhas equilibradas (12/11/2026: o Matheus pediu o aviso maior e bem evidente).
export const avisoEmDuasLinhas = (aviso: string): [string, string] => {
  const palavras = aviso.split(" ");
  let melhor: [string, string] = [aviso, ""];
  let dif = Infinity;
  for (let i = 1; i < palavras.length; i++) {
    const a = palavras.slice(0, i).join(" ");
    const b = palavras.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < dif) {
      dif = d;
      melhor = [a, b];
    }
  }
  return melhor;
};
