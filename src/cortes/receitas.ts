// Receitas de cortes e trechos explicativos, uma por vídeo (12/11/2026).
// Vídeo novo: criar cortes/<video>.cortes.json, importar aqui e somar na lista (e a fonte em fontes.ts).
import receitaCortes2810 from "../../cortes/2026-10-28.cortes.json";
import { receitaSchema, type Receita } from "./receita";

export const RECEITAS: Receita[] = [receitaSchema.parse(receitaCortes2810)];

export const acharReceita = (video: string): Receita => {
  const r = RECEITAS.find((x) => x.video === video);
  if (!r) throw new Error(`Receita de cortes não encontrada para o vídeo "${video}". Cadastre em src/cortes/receitas.ts.`);
  return r;
};
