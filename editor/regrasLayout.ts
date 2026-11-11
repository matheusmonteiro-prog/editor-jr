// Regra pura do layout (sem React): o maior retângulo com a proporção do vídeo que cabe na
// caixa. Serve para o Player vertical (9:16) nunca estourar a altura da tela.

export type Medida = { largura: number; altura: number };

export const caberNaCaixa = (larguraCaixa: number, alturaCaixa: number, proporcao: number): Medida => {
  const ok = (n: number) => Number.isFinite(n) && n > 0;
  if (!ok(larguraCaixa) || !ok(alturaCaixa) || !ok(proporcao)) return { largura: 0, altura: 0 };
  const largura = Math.floor(Math.min(larguraCaixa, alturaCaixa * proporcao));
  return { largura, altura: Math.floor(largura / proporcao) };
};
