// Monta a linha do tempo do vídeo pergunta e resposta a partir da duração
// REAL de cada áudio (medida no calculateMetadata). Função pura: recebe as
// durações e devolve, para cada bloco, onde começa, onde entra a pergunta,
// onde entra a resposta e quanto dura.
import type { Bloco } from "../dados/apresentacao";
import { TEMPOS } from "../dados/apresentacao";

export type BlocoNoTempo = {
  id: string;
  inicio: number; // frame global
  duracao: number; // frames
  perguntaInicio: number | null; // frame relativo ao bloco
  perguntaFrames: number;
  perguntaExiste: boolean;
  respostaInicio: number; // frame relativo ao bloco
  respostaFrames: number;
  respostaExiste: boolean;
};

export type LinhaDoTempo = {
  blocos: BlocoNoTempo[];
  total: number;
};

// duracoes: caminho do áudio → segundos (null = arquivo não existe/ilegível).
export const montarLinhaDoTempo = (
  blocos: Bloco[],
  duracoes: Record<string, number | null>,
  fps: number,
): LinhaDoTempo => {
  const paraFrames = (s: number) => Math.ceil(s * fps);
  let cursor = 0;
  const saida: BlocoNoTempo[] = [];

  blocos.forEach((bloco, i) => {
    let perguntaInicio: number | null = null;
    let perguntaFrames = 0;
    let perguntaExiste = false;
    let respostaInicio = TEMPOS.inicioAbertura;

    if (bloco.pergunta) {
      const d = duracoes[bloco.pergunta.audio];
      perguntaExiste = d != null;
      perguntaFrames = d != null ? paraFrames(d) : TEMPOS.reservaAudioFaltando;
      perguntaInicio = TEMPOS.inicioPergunta;
      respostaInicio = perguntaInicio + perguntaFrames + TEMPOS.respiroPerguntaResposta;
    }

    const dr = duracoes[bloco.resposta.audio];
    const respostaExiste = dr != null;
    const respostaFrames = dr != null ? paraFrames(dr) : TEMPOS.reservaAudioFaltando;

    const ultimo = i === blocos.length - 1;
    const duracao =
      respostaInicio + respostaFrames + TEMPOS.folgaFimBloco + (ultimo ? TEMPOS.seguraCartela : 0);

    saida.push({
      id: bloco.id,
      inicio: cursor,
      duracao,
      perguntaInicio,
      perguntaFrames,
      perguntaExiste,
      respostaInicio,
      respostaFrames,
      respostaExiste,
    });
    cursor += duracao;
  });

  return { blocos: saida, total: cursor };
};

export const acharBloco = (linha: LinhaDoTempo, id: string): BlocoNoTempo => {
  const b = linha.blocos.find((x) => x.id === id);
  if (!b) throw new Error(`Bloco "${id}" não está na linha do tempo`);
  return b;
};
