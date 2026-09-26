import { Composition, Folder } from "remotion";
import { Naruto } from "./Naruto";
import { TesteVideoReal } from "./TesteVideoReal";
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
      </Folder>
    </>
  );
};
