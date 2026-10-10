import { AbsoluteFill, Composition, Folder } from "remotion";
import { Naruto } from "./Naruto";
import { TesteVideoReal } from "./TesteVideoReal";
import { TesteRoteiro01 } from "./TesteRoteiro01";
import { TesteRoteiro02 } from "./TesteRoteiro02";
import "./index.css";
import { MyComposition } from "./Composition";
import { PlanoComposicao } from "./PlanoComposicao";
import { CamadaVideo } from "./components/v2/CamadaVideo";
import plano0926 from "../planos/0926.plano.json";
import planoTeste4Componentes from "../planos/teste-4-componentes.plano.json";
import cortes0926 from "../videos/0926.cortes.json";

const FPS_0926 = 30;
const DURACAO_FRAMES_0926 = Math.round(cortes0926.duracaoFinal * FPS_0926);

// Fase 1 (Etapa 3): tela cheia com som + câmera muda no canto, par de 25/09.
// A câmera é 16:9 como a composição, então largura = altura em fração.
const TesteTelaCamera: React.FC = () => (
  <AbsoluteFill>
    <CamadaVideo src="videos/teste-camada-tela.mp4" />
    <CamadaVideo
      src="videos/teste-camada-camera.mp4"
      x={0.85}
      y={0.85}
      largura={0.25}
      altura={0.25}
      mudo
      duracaoFrames={211}
    />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Folder name="Testes">
        <Composition
          id="naruto"
          component={Naruto}
          durationInFrames={150}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="TesteVideoReal"
          component={TesteVideoReal}
          durationInFrames={1138}
          fps={30}
          width={2160}
          height={3872}
        />
        <Composition
          id="TesteRoteiro01"
          component={TesteRoteiro01}
          durationInFrames={1138}
          fps={30}
          width={2160}
          height={3872}
        />
        <Composition
          id="TesteRoteiro02"
          component={TesteRoteiro02}
          durationInFrames={1138}
          fps={30}
          width={2160}
          height={3872}
        />
        <Composition
          id="PlanoComposicao0926"
          component={PlanoComposicao}
          durationInFrames={DURACAO_FRAMES_0926}
          fps={FPS_0926}
          width={2160}
          height={3872}
          defaultProps={{
            videoSrc: "videos/0926-cortado-v1.mp4",
            plano: plano0926,
            cortes: cortes0926,
          }}
        />
        <Composition
          id="TesteComponentesNovos"
          component={PlanoComposicao}
          durationInFrames={431}
          fps={FPS_0926}
          width={2160}
          height={3872}
          defaultProps={{
            videoSrc: "videos/0926-cortado-v1.mp4",
            plano: planoTeste4Componentes,
            cortes: cortes0926,
          }}
        />
        <Composition
          id="TesteTelaCamera"
          component={TesteTelaCamera}
          durationInFrames={241}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
