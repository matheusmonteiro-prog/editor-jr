import React from "react";
import { Player } from "@remotion/player";
import { PlanoComposicao, type PlanoComposicaoProps } from "../src/PlanoComposicao";
import planoKitV3 from "../planos/teste-kit-v3.json";

// Fatia 1 do editor: o Player tocando o mesmo plano da composição TesteKitV3 do Studio.
// Sem tabela, sem salvar. O Vite roda na raiz do projeto, então public/ é servida em "/"
// e o staticFile("videos/...") do PlanoComposicao vira "/videos/...".
const PROPS: PlanoComposicaoProps = {
  videoSrc: "videos/0926-cortado-v1.mp4",
  plano: planoKitV3,
  // Um único trecho (0 a 37,8 s): tempos do plano iguais aos do vídeo.
  cortes: { trechos: [{ inicio: 0, fim: 37.8 }] },
};

export const App: React.FC = () => (
  <div style={{ maxWidth: 1280, margin: "0 auto", padding: 16 }}>
    <h1 style={{ fontSize: 20 }}>Editor JR: teste do Player (teste-kit-v3)</h1>
    <Player
      component={PlanoComposicao}
      inputProps={PROPS}
      durationInFrames={1134}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      controls
      acknowledgeRemotionLicense
      style={{ width: "100%" }}
    />
  </div>
);
