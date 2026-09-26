import { Composition, Folder } from "remotion";
import { Naruto } from "./Naruto";
import { TesteVideoReal } from "./TesteVideoReal";
import { TesteRoteiro01 } from "./TesteRoteiro01";
import { TesteRoteiro02 } from "./TesteRoteiro02";
import "./index.css";
import { MyComposition } from "./Composition";

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
      </Folder>
    </>
  );
};
