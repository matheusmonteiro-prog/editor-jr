import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { TextoDestaque } from "./components/TextoDestaque";

// Teste rápido e sujo: vídeo real (o corte de silêncio do 0926.mp4) como
// fundo, com o TextoDestaque sobreposto no meio. Só pra validar visualmente
// que um motion graphic funciona por cima de filmagem de verdade — não é um
// componente do catálogo, fica na pasta Testes.
export const TesteVideoReal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile("videos/0926-cortado-v1.mp4")} />
      <Sequence from={520} durationInFrames={90}>
        <TextoDestaque
          texto="TESTE"
          posicao="centro"
          duracaoFrames={90}
          corTexto="#ffffff"
          corFundo="rgba(0,0,0,0.55)"
          mostrarFundo
          tamanhoFonte={100}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
