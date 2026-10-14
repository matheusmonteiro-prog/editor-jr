// Converte as palavras da transcrição (tempos em ms do vídeo ORIGINAL) para o formato que a
// LegendaAnimada recebe (frames do vídeo CORTADO, relativos ao início do Sequence).
// Função pura: não altera a entrada.

export type PalavraMs = {
  texto: string;
  inicioMs: number;
  fimMs: number;
  destaque?: boolean;
};

export type PalavraFrames = {
  texto: string;
  inicioFrames: number;
  fimFrames: number;
  destaque: boolean;
};

export type OpcoesConversao = {
  fromFrames: number; // `from` do Sequence, em frames do vídeo cortado
  paraFrameCortado: (segundoOriginal: number) => number;
};

export function converterPalavrasMs(
  palavrasMs: readonly PalavraMs[],
  { fromFrames, paraFrameCortado }: OpcoesConversao,
): PalavraFrames[] {
  const saida: PalavraFrames[] = [];
  let inicioAnterior = 0;
  for (const p of palavrasMs) {
    const texto = p.texto.trim();
    if (texto === "") continue;

    // Nunca antes da palavra anterior (lista fora de ordem, ou palavra de silêncio cortado).
    const inicioFrames = Math.max(
      inicioAnterior,
      Math.max(0, paraFrameCortado(p.inicioMs / 1000) - fromFrames),
    );
    const fimMs = Math.max(p.fimMs, p.inicioMs);
    const fimFrames = Math.max(inicioFrames + 1, paraFrameCortado(fimMs / 1000) - fromFrames);

    saida.push({ texto, inicioFrames, fimFrames, destaque: p.destaque === true });
    inicioAnterior = inicioFrames;
  }
  return saida;
}
