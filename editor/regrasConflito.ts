// Regras do "plano atual" no editor (salvar com conferência de hash e mudança no disco).
// Sem React e sem rede: dá para testar pelo Node. Quem chama faz o fetch e passa a resposta.

export const INTERVALO_CONSULTA_MS = 5000; // a cada 5 s o editor pergunta o hash do arquivo

// Só plano de planos/atual/ tem "Salvar no plano atual" e consulta de hash.
export const ehPlanoAtual = (pasta: unknown, hash: unknown): hash is string => pasta === "atual" && typeof hash === "string" && /^[0-9a-f]{64}$/.test(hash);

// Comparação da consulta de 5 s. "igual" = nada a fazer; "mudou" = mostrar a faixa.
// Hash que não veio (erro de rede) não acusa mudança: só avisa que não deu para conferir.
export const estadoDoDisco = (hashBase: string, hashNoDisco: string | null): "igual" | "mudou" | "sem-resposta" =>
  hashNoDisco === null ? "sem-resposta" : hashNoDisco === hashBase ? "igual" : "mudou";

export type FimDoSalvarAtual =
  | { tipo: "ok"; hash: string; texto: string }
  | { tipo: "conflito"; texto: string }
  | { tipo: "invalido"; texto: string }
  | { tipo: "erro"; texto: string };

// Traduz a resposta do POST /api/salvar-atual. 409 = conflito (NUNCA tenta de novo sozinho).
export const lerFimDoSalvarAtual = (status: number, dados: Record<string, unknown>, arquivo: string): FimDoSalvarAtual => {
  const saida = typeof dados.saida === "string" ? dados.saida : "";
  if (status === 200 && typeof dados.hash === "string") {
    return {
      tipo: "ok",
      hash: dados.hash,
      texto: `Plano atual salvo: planos/${arquivo}\nVersão anterior guardada em planos/copias/${String(dados.anterior)}\nValidador (código 0, sem erro):\n\n${saida}`,
    };
  }
  if (status === 409) return { tipo: "conflito", texto: String(dados.erro ?? "O arquivo mudou no disco. Nada foi gravado.") };
  if (status === 422) return { tipo: "invalido", texto: `${String(dados.erro ?? "O validador achou erro.")}\n\n${saida}` };
  return { tipo: "erro", texto: String(dados.erro ?? `Erro ${status} ao salvar no plano atual.`) };
};
