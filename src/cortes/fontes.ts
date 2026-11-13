// De onde vêm a câmera, a voz e a transcrição de cada vídeo longo que vira cortes (12/11/2026).
// São as MESMAS fontes do vídeo longo aprovado, para o corte ficar igual a ele (filtro, voz tratada).
import palavras2810 from "../../videos/2026-10-28-voz-tratada.palavras.json";

export type PalavraFonte = { text: string; startMs: number; endMs: number };

export type FonteVideo = {
  cameraSrc: string; // em public/
  vozSrc: string; // em public/
  musicaSrc?: string; // em public/
  palavras: PalavraFonte[];
};

export const FONTES: Record<string, FonteVideo> = {
  // Video2810V3 (src/Root.tsx): câmera com filtro "rosto saudável" v2 e voz aprovada em 06/11.
  // A transcrição é da voz tratada de 04/11: mesma duração e mesmos tempos da voz calma20.
  "2026-10-28": {
    cameraSrc: "videos/2026-10-28-final-v1-filtro-natural-v2.mp4",
    vozSrc: "videos/2026-10-28-voz-wpe8-calma20.wav",
    musicaSrc: "music/sertao-caboclo-quincas-moreira.mp3",
    palavras: palavras2810 as PalavraFonte[],
  },
};
