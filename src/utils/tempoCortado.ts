// Converte um tempo do vídeo ORIGINAL pro frame do vídeo já cortado (sem os
// silêncios), a partir dos "trechos" (intervalos mantidos) de um
// videos/*.cortes.json. Um tempo que caiu dentro de um silêncio cortado é
// jogado pro fim do trecho anterior — foi exatamente esse instante que o
// corte engoliu.

export type TrechoCortado = { inicio: number; fim: number };

export function criarParaFrameCortado(
  trechos: TrechoCortado[],
  fps: number,
) {
  // inicioCortadoPorTrecho[i] = posição (em segundos, na timeline JÁ
  // cortada) onde o trecho i começa.
  const inicioCortadoPorTrecho: number[] = [];
  let acumulado = 0;
  for (const t of trechos) {
    inicioCortadoPorTrecho.push(acumulado);
    acumulado += t.fim - t.inicio;
  }

  return (segundoOriginal: number): number => {
    for (let i = 0; i < trechos.length; i++) {
      const t = trechos[i];
      if (segundoOriginal < t.inicio) {
        const fimCortadoAnterior =
          i === 0 ? 0 : inicioCortadoPorTrecho[i - 1] + (trechos[i - 1].fim - trechos[i - 1].inicio);
        return Math.round(fimCortadoAnterior * fps);
      }
      if (segundoOriginal <= t.fim) {
        return Math.round((inicioCortadoPorTrecho[i] + (segundoOriginal - t.inicio)) * fps);
      }
    }
    // depois do último trecho: extrapola a partir do fim cortado
    const ultimo = trechos[trechos.length - 1];
    const fimCortado =
      inicioCortadoPorTrecho[inicioCortadoPorTrecho.length - 1] + (ultimo.fim - ultimo.inicio);
    return Math.round((fimCortado + (segundoOriginal - ultimo.fim)) * fps);
  };
}
