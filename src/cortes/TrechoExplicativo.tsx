import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CorteDividido } from "./CorteDividido";
import { CorteCartografia } from "../identidade/CorteCartografia";
import { acharReceita } from "./receitas";
import { duracaoCorte } from "./receita";

// Trecho explicativo dentro do vídeo LONGO (16:9), dos dois modelos aprovados (12/11/2026):
//  - layout "dividido"    -> modelo 1, papel (CorteDividido, formato horizontal);
//  - layout "cartografia" -> modelo 2, Cartografia viva (ambiente da receita: verde OU branco).
// Os trechos ficam em `explicativos` da receita do vídeo (cortes/<video>.cortes.json).
// No longo: sem voz e sem música próprias (valem as do longo), sem aviso/logo/@ próprios (ficam no
// início e no fim do longo inteiro). A legenda do longo deve sair enquanto este trecho está na tela.
//
// Como chamar no longo (vídeo montado em src/VideoXXXX.tsx):
//   const { from, durationInFrames } = posicaoExplicativo("2026-10-28", "2810-balanca", paraFrameDoLongo);
//   <Sequence from={from} durationInFrames={durationInFrames}><TrechoExplicativo video="2026-10-28" id="2810-balanca" /></Sequence>
// `paraFrameDoLongo` é o criarParaFrameCortado(...) de src/utils/tempoCortado.ts (tempo da gravação -> quadro do longo).

export const trechoExplicativoSchema = z.object({
  video: z.string().default("2026-10-28"),
  id: z.string().default("2810-balanca"),
});
type Props = z.infer<typeof trechoExplicativoSchema>;

const achar = (video: string, id: string) => {
  const r = acharReceita(video);
  const c = r.explicativos.find((e) => e.id === id);
  if (!c) throw new Error(`Trecho explicativo "${id}" não existe na receita de ${video}. Existem: ${r.explicativos.map((e) => e.id).join(", ") || "(nenhum)"}`);
  return { r, c };
};

export const duracaoExplicativo = (video: string, id: string) => duracaoCorte(achar(video, id).c);

// Onde o trecho entra no longo: quadro do início da fala (da gravação) e duração.
export const posicaoExplicativo = (video: string, id: string, paraFrameDoLongo: (segundoDaGravacao: number) => number) => {
  const { c } = achar(video, id);
  return { from: paraFrameDoLongo(c.trechos[0].de), durationInFrames: duracaoCorte(c) };
};

export const TrechoExplicativo: React.FC<Props> = ({ video, id }) => {
  const { r, c } = achar(video, id);
  const frame = useCurrentFrame();
  const total = duracaoCorte(c);
  // entrada e saída suaves (o trecho aparece e some sem corte seco)
  const o = interpolate(frame, [0, 10, total - 10, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dx = interpolate(frame, [0, 10], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateX(${dx}px)` }}>
      {c.layout === "cartografia" ? (
        <CorteCartografia
          video={video}
          corte={c}
          volumeMusica={0}
          arroba="jroinvestidorsertanejo"
          logo="images/logo-jr.png"
          aviso=""
          ambiente={r.ambienteCartografia}
          formato="horizontal"
          xPadrao={r.xPadrao}
          modoLongo
        />
      ) : (
        <CorteDividido
          video={video}
          xPadrao={r.xPadrao}
          corte={c}
          volumeMusica={0}
          formato="horizontal"
          tamanhoQuadro={0.56}
          alturaFonte={0.72}
          alturaRodape={0}
          arroba="jroinvestidorsertanejo"
          logo="images/logo-jr.png"
          aviso=""
          avisoSegundos={3.6}
          modoLongo
        />
      )}
    </AbsoluteFill>
  );
};
