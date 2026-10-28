// Monta a linha do tempo do vídeo pergunta e resposta a partir da duração
// REAL de cada áudio (medida no calculateMetadata). Função pura: recebe as
// durações e devolve, para cada bloco, onde começa, onde entra a pergunta,
// onde entra a resposta e quanto dura.
import type { Bloco } from "../dados/apresentacao";
import { TEMPOS } from "../dados/apresentacao";

// Um áudio da resposta já posicionado: onde começa (frame relativo ao bloco), quantos frames toca e de
// que segundo do arquivo ele começa (corteDe > 0 = o silêncio do começo é cortado por código).
export type ParteNoTempo = { audio: string; inicio: number; frames: number; corteDe: number; existe: boolean };

export type BlocoNoTempo = {
  id: string;
  inicio: number; // frame global
  duracao: number; // frames
  perguntaInicio: number | null; // frame relativo ao bloco
  perguntaFrames: number;
  perguntaExiste: boolean;
  respostaInicio: number; // frame relativo ao bloco
  // Frames da FALA INTEIRA da resposta (com vários áudios: do começo do 1º ao fim do último). O fim dela
  // é respostaInicio + respostaFrames.
  respostaFrames: number;
  respostaExiste: boolean;
  // Os áudios da resposta, na ordem (1 = o do campo audio; 2, 3... = seguintes).
  partes: ParteNoTempo[];
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

    // Posiciona os áudios da resposta. Com falaDe/falaAte, corta o silêncio do começo e do fim e encosta o
    // próximo áudio para a pausa entre a última palavra de um e a primeira do seguinte ser pausaFrames.
    const partes: ParteNoTempo[] = [];
    const lista = [
      { audio: bloco.resposta.audio, falaDe: bloco.resposta.falaDe, falaAte: bloco.resposta.falaAte, pausaFrames: 0 },
      ...(bloco.resposta.seguintes ?? []),
    ];
    let fimDaFalaAnterior = 0; // frame (relativo ao bloco) da última palavra do áudio anterior
    lista.forEach((parte, k) => {
      const d = duracoes[parte.audio];
      const existe = d != null;
      const corte = parte.falaDe !== undefined && parte.falaAte !== undefined && d != null;
      const corteDe = corte ? Math.max(0, parte.falaDe! - TEMPOS.margemCorteInicio) : 0;
      const corteAte = corte ? Math.min(d, parte.falaAte! + TEMPOS.margemCorteFim) : d;
      const frames = existe ? Math.max(1, paraFrames(corteAte! - corteDe)) : TEMPOS.reservaAudioFaltando;
      // O 1º áudio começa em respostaInicio; os seguintes, para a pausa pedida entre as palavras.
      const inicioParte =
        k === 0
          ? respostaInicio
          : Math.round(fimDaFalaAnterior + parte.pausaFrames - (corte ? (parte.falaDe! - corteDe) * fps : 0));
      partes.push({ audio: parte.audio, inicio: inicioParte, frames, corteDe, existe });
      fimDaFalaAnterior = inicioParte + (corte ? (parte.falaAte! - corteDe) * fps : frames);
    });
    const ultimaParte = partes[partes.length - 1];
    const respostaExiste = partes[0].existe;
    const respostaFrames = ultimaParte.inicio + ultimaParte.frames - respostaInicio;

    const ultimo = i === blocos.length - 1;
    // Com cartelaFrames (bloco 08), o bloco termina depois da cartela final e do fecho.
    const depoisDaFala =
      bloco.cartelaFrames !== undefined ? bloco.cartelaFrames : TEMPOS.folgaFimBloco + (ultimo ? TEMPOS.seguraCartela : 0);
    const duracao = respostaInicio + respostaFrames + depoisDaFala;

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
      partes,
    });
    cursor += duracao;
  });

  return { blocos: saida, total: cursor };
};

// Momento da fala (áudio 1, 2 ou 3 da resposta, em segundos desde o início do ARQUIVO, como o Whisper
// mede) → frame relativo ao bloco, já descontando o silêncio cortado do começo do áudio.
export const frameDaMarca = (t: BlocoNoTempo, marca: { audio: number; segundos: number }, fps: number): number => {
  const parte = t.partes[marca.audio - 1] ?? t.partes[0];
  return parte.inicio + Math.round((marca.segundos - parte.corteDe) * fps);
};

export const acharBloco = (linha: LinhaDoTempo, id: string): BlocoNoTempo => {
  const b = linha.blocos.find((x) => x.id === id);
  if (!b) throw new Error(`Bloco "${id}" não está na linha do tempo`);
  return b;
};
