import { Composition, Folder } from "remotion";
import { Naruto } from "./Naruto";
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
      </Folder>
    </>
  );
};
