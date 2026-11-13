import { FONTES } from "./fontes";
import type { Corte, Receita } from "./receita";

// Conferência da receita contra a fonte (câmera, voz e transcrição do vídeo). Devolve a lista de
// problemas (vazia = ok). Pega o erro mais comum: vídeo sem fonte cadastrada, ou tempo além do fim da
// transcrição (sinal de que a receita usa a linha errada: "final" em vez de "gravacao", ou o contrário).
export const conferirContraFonte = (receita: Receita, corte: Corte): string[] => {
  const fonte = FONTES[receita.video];
  if (!fonte) return [`${corte.id}: vídeo "${receita.video}" não tem fonte em src/cortes/fontes.ts`];
  const fim = Math.max(...fonte.palavras.map((p) => p.endMs)) / 1000;
  const erros: string[] = [];
  corte.trechos.forEach((t, i) => {
    if (t.ate > fim + 2) {
      erros.push(`${corte.id}: trecho ${i + 1} termina em ${t.ate}s, mas a transcrição acaba em ${fim.toFixed(1)}s (receita com tempos "${receita.tempos}": confira se a linha é a certa)`);
    }
  });
  if (corte.layout === "cartografia" && corte.cenas.some((c) => c.pecas.length > 3)) erros.push(`${corte.id}: cena com mais de 3 peças`);
  return erros;
};
