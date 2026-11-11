import type { TrechoCortado } from "../src/utils/tempoCortado";
import { tamanhoDoPlano } from "../src/utils/tamanhoDoPlano";
import { fpsDoPlano, type PlanoEditor } from "./regrasPlano";

// Montar o Player a partir do plano aberto (fatia 5). Sem React: dá para testar pelo Node.
// Tamanho: orientação do plano (tamanhoDoPlano de src/utils, só importado): vertical 1080×1920,
// horizontal 1920×1080. fps: o do plano. Duração e cortes:
//   - com videos/<video>.cortes.json: os trechos dele; duração = round(duracaoFinal × fps)
//     (o mesmo critério do src/Root.tsx para o 0926);
//   - sem cortes: um trecho só, de 0 até a duração do vídeo lida pelo navegador.

export type Fundo = {
  video: string | null;
  procurado: string | null;
  videoSrc: string | null; // relativo a public/
  versao: number | null;
  cortesArquivo: string | null;
  cortes: { trechos: TrechoCortado[]; duracaoFinal: number | null } | null;
};

export type Composicao =
  | {
      pronta: true;
      width: number;
      height: number;
      fps: number;
      durationInFrames: number;
      videoSrc: string;
      trechos: TrechoCortado[];
      origemDuracao: string; // o que aparece na tela: de onde veio a duração
    }
  | { pronta: false; motivo: string; precisaDuracaoDoVideo: boolean };

// duracaoVideoSeg: lida pelo navegador (<video> loadedmetadata); null enquanto não chegou.
export const montarComposicao = (plano: PlanoEditor, fundo: Fundo, duracaoVideoSeg: number | null): Composicao => {
  const fps = fpsDoPlano(plano);
  if (fps === null) return { pronta: false, motivo: 'O plano não tem "fps".', precisaDuracaoDoVideo: false };
  const tamanho = tamanhoDoPlano(plano.orientacao);
  if (tamanho === null) return { pronta: false, motivo: 'O plano não tem "orientacao" vertical ou horizontal.', precisaDuracaoDoVideo: false };
  if (fundo.videoSrc === null) {
    return {
      pronta: false,
      motivo: `Não achei vídeo de fundo: procurei ${fundo.procurado ?? 'public/videos/<video>-cortado-v*.mp4 (o plano não tem um "video" que sirva de nome)'}.`,
      precisaDuracaoDoVideo: false,
    };
  }

  if (fundo.cortes !== null) {
    const { trechos, duracaoFinal } = fundo.cortes;
    const segundos = duracaoFinal ?? trechos.reduce((soma, t) => soma + (t.fim - t.inicio), 0);
    const quadros = Math.round(segundos * fps);
    if (quadros < 1) return { pronta: false, motivo: "Os cortes dão duração zero.", precisaDuracaoDoVideo: false };
    return {
      pronta: true,
      ...tamanho,
      fps,
      durationInFrames: quadros,
      videoSrc: fundo.videoSrc,
      trechos,
      origemDuracao: `${fundo.cortesArquivo} (${duracaoFinal === null ? "soma dos trechos" : "duracaoFinal"} ${segundos.toFixed(2)} s × ${fps} = ${quadros} quadros)`,
    };
  }

  if (duracaoVideoSeg === null || !Number.isFinite(duracaoVideoSeg) || duracaoVideoSeg <= 0) {
    return { pronta: false, motivo: "Lendo a duração do vídeo de fundo…", precisaDuracaoDoVideo: true };
  }
  // floor: nunca passar do fim do vídeo.
  const quadros = Math.floor(duracaoVideoSeg * fps);
  return {
    pronta: true,
    ...tamanho,
    fps,
    durationInFrames: Math.max(1, quadros),
    videoSrc: fundo.videoSrc,
    trechos: [{ inicio: 0, fim: duracaoVideoSeg }],
    origemDuracao: `sem arquivo de cortes: um trecho só, 0 a ${duracaoVideoSeg.toFixed(2)} s (duração do vídeo lida pelo navegador) × ${fps} = ${Math.max(1, quadros)} quadros`,
  };
};
