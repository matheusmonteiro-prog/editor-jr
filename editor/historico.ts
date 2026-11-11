// Desfazer e refazer (fatia 4). Só memória: nada é gravado em arquivo.
//
// "chave" junta várias mudanças seguidas num passo só: enquanto você digita no mesmo campo
// (ex.: "kit-impacto:inicio"), cada tecla substitui o passo atual em vez de criar outro.
// Botões − e + passam chave null: cada clique é um passo.

export type Historico<T> = {
  passado: T[];
  presente: T;
  futuro: T[];
  ultimaChave: string | null;
};

export const LIMITE_HISTORICO = 100;

export const criarHistorico = <T>(inicial: T): Historico<T> => ({
  passado: [],
  presente: inicial,
  futuro: [],
  ultimaChave: null,
});

export const registrar = <T>(h: Historico<T>, novo: T, chave: string | null = null): Historico<T> => {
  if (novo === h.presente) return h; // nada mudou (as regras devolvem o MESMO objeto quando recusam)
  if (chave !== null && chave === h.ultimaChave && h.passado.length > 0) {
    return { ...h, presente: novo, futuro: [] };
  }
  const passado = [...h.passado, h.presente].slice(-LIMITE_HISTORICO);
  return { passado, presente: novo, futuro: [], ultimaChave: chave };
};

export const podeDesfazer = <T>(h: Historico<T>): boolean => h.passado.length > 0;
export const podeRefazer = <T>(h: Historico<T>): boolean => h.futuro.length > 0;

export const desfazer = <T>(h: Historico<T>): Historico<T> => {
  if (!podeDesfazer(h)) return h;
  const anterior = h.passado[h.passado.length - 1];
  return { passado: h.passado.slice(0, -1), presente: anterior, futuro: [h.presente, ...h.futuro], ultimaChave: null };
};

export const refazer = <T>(h: Historico<T>): Historico<T> => {
  if (!podeRefazer(h)) return h;
  const [proximo, ...resto] = h.futuro;
  return { passado: [...h.passado, h.presente], presente: proximo, futuro: resto, ultimaChave: null };
};
