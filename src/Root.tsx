import { Composition, Folder } from "remotion";
import { Naruto } from "./Naruto";
import { TesteVideoReal } from "./TesteVideoReal";
import { TesteRoteiro01 } from "./TesteRoteiro01";
import { TesteRoteiro02 } from "./TesteRoteiro02";
import "./index.css";
import { MyComposition } from "./Composition";
import { PlanoComposicao } from "./PlanoComposicao";
import plano0926 from "../planos/0926.plano.json";
import cortes0926 from "../videos/0926.cortes.json";

const FPS_0926 = 30;
const DURACAO_FRAMES_0926 = Math.round(cortes0926.duracaoFinal * FPS_0926);

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
      </Folder>
    </>
  );
};
