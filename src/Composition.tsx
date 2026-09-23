import { Composition } from "remotion";
import {
  ImagemFade,
  imagemFadeSchema,
  imagemFadeDefaultProps,
} from "./components/ImagemFade";
import {
  GraficoLinha,
  graficoLinhaSchema,
  graficoLinhaDefaultProps,
} from "./components/GraficoLinha";
import {
  ColagemCenas,
  colagemCenasSchema,
  colagemCenasDefaultProps,
} from "./components/ColagemCenas";
import {
  ComparacaoBarras,
  comparacaoBarrasSchema,
  comparacaoBarrasDefaultProps,
} from "./components/ComparacaoBarras";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="ImagemFade"
        component={ImagemFade}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={imagemFadeSchema}
        defaultProps={imagemFadeDefaultProps}
      />
      <Composition
        id="GraficoLinha"
        component={GraficoLinha}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={graficoLinhaSchema}
        defaultProps={graficoLinhaDefaultProps}
      />
      <Composition
        id="ColagemCenas"
        component={ColagemCenas}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        schema={colagemCenasSchema}
        defaultProps={colagemCenasDefaultProps}
      />
      <Composition
        id="ComparacaoBarras"
        component={ComparacaoBarras}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={comparacaoBarrasSchema}
        defaultProps={comparacaoBarrasDefaultProps}
      />
    </>
  );
};
