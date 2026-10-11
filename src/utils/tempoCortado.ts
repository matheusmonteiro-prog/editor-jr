// Converte um tempo do vídeo ORIGINAL pro frame do vídeo já cortado (sem os
// silêncios), a partir dos "trechos" de um videos/*.cortes.json.
//
// A ordem do array é a ordem do vídeo cortado. Com gancho, os pedaços do
// gancho vêm primeiro (marcados com `gancho`), então os tempos originais NÃO
// crescem ao longo do array — por isso a busca não depende da ordem.
//
// Regras:
// - tempo dentro de um trecho: a posição dele no vídeo cortado. Com --copiar,
//   o mesmo tempo existe na cópia do gancho e no lugar original: vale o
//   lugar original.
// - tempo num silêncio cortado: fim do trecho anterior NO TEMPO ORIGINAL (o
//   de maior fim ≤ tempo) — foi exatamente esse instante que o corte engoliu.
// - antes do primeiro trecho: frame 0. Depois do último: fim do vídeo cortado.

export type TrechoCortado = { inicio: number; fim: number; gancho?: number };

export function criarParaFrameCortado(
  trechos: TrechoCortado[],
  fps: number,
) {
  // inicioCortado[i] = posição (em segundos, na timeline JÁ cortada) onde o
  // trecho i começa.
  const inicioCortado: number[] = [];
  let acumulado = 0;
  for (const t of trechos) {
    inicioCortado.push(acumulado);
    acumulado += t.fim - t.inicio;
  }
  const ultimoFrame = Math.round(acumulado * fps);
  const fimOriginal = Math.max(...trechos.map((t) => t.fim));

  // Trechos originais antes das cópias de gancho (o sort é estável: dentro de
  // cada grupo, mantém a ordem do array).
  const indices = trechos
    .map((_, i) => i)
    .sort((a, b) => Number(trechos[a].gancho !== undefined) - Number(trechos[b].gancho !== undefined));

  return (segundoOriginal: number): number => {
    for (const i of indices) {
      const t = trechos[i];
      if (segundoOriginal >= t.inicio && segundoOriginal <= t.fim) {
        return Math.round((inicioCortado[i] + (segundoOriginal - t.inicio)) * fps);
      }
    }
    if (segundoOriginal > fimOriginal) return ultimoFrame;

    // Silêncio: o trecho de maior fim ≤ tempo (no empate, o original ganha).
    let anterior = -1;
    for (const i of indices) {
      if (trechos[i].fim <= segundoOriginal && (anterior < 0 || trechos[i].fim > trechos[anterior].fim)) {
        anterior = i;
      }
    }
    if (anterior < 0) return 0;
    const t = trechos[anterior];
    return Math.round((inicioCortado[anterior] + (t.fim - t.inicio)) * fps);
  };
}
