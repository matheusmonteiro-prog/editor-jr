// Tamanho da composição a partir da `orientacao` do plano (Etapa 3, critério 3.3).
// O plano manda: "vertical" ou "horizontal", em minúsculas, como o validador
// exige. Qualquer outro valor devolve null (quem chama decide o que fazer).
//
// Os pares são o formato de entrega padrão do scripts/preparar-video.mjs
// (lado maior 1920, lado menor = lado maior × 9/16).

const LADO_MAIOR = 1920;
const LADO_MENOR = 1080;

export type TamanhoDoPlano = { width: number; height: number };

export function tamanhoDoPlano(orientacao: unknown): TamanhoDoPlano | null {
  if (orientacao === "vertical") return { width: LADO_MENOR, height: LADO_MAIOR };
  if (orientacao === "horizontal") return { width: LADO_MAIOR, height: LADO_MENOR };
  return null;
}
