import { Composition, Folder } from "remotion";
import { ImagemFade, imagemFadeSchema } from "./components/ImagemFade";
import { GraficoLinha, graficoLinhaSchema } from "./components/GraficoLinha";
import { ColagemCenas, colagemCenasSchema } from "./components/ColagemCenas";
import {
  ComparacaoBarras,
  comparacaoBarrasSchema,
} from "./components/ComparacaoBarras";
import { TextoDestaque, textoDestaqueSchema } from "./components/TextoDestaque";
import { Seta, setaSchema } from "./components/Seta";

// Os defaultProps ficam como objeto literal aqui (não importados de outro
// arquivo) porque é assim que o Remotion Studio consegue salvar de volta no
// código quando você edita os campos pelo painel. Ver .agents/skills/remotion-markup/compositions.md.
export const MyComposition = () => {
  return (
    <Folder name="Catalogo">
      <Composition
        id="ImagemFade"
        component={ImagemFade}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={imagemFadeSchema}
        defaultProps={{
          src: "images/selic.png",
          corFundo: "#ffffff",
          larguraPorcentagem: 80,
          frameEntrada: 30,
        }}
      />
      <Composition
        id="GraficoLinha"
        component={GraficoLinha}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={graficoLinhaSchema}
        defaultProps={{
          titulo: "Valorização",
          valorFinal: 32,
          corFundo: "#111318",
          corLinhaInicio: "#00d9ff",
          corLinhaFim: "#00ff9d",
          largura: 880,
          altura: 420,
          frameFimSaida: 140,
        }}
      />
      <Composition
        id="ColagemCenas"
        component={ColagemCenas}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        schema={colagemCenasSchema}
        defaultProps={{
          corFundo: "#f0ebe0",
          cenas: [
            {
              src: "images/cena1.png",
              x: 40,
              y: 100,
              largura: 380,
              rotacaoFinal: -6,
              frameEntrada: 0,
            },
            {
              src: "images/cena2.png",
              x: 450,
              y: 80,
              largura: 380,
              rotacaoFinal: 4,
              frameEntrada: 25,
            },
            {
              src: "images/cena3.png",
              x: 860,
              y: 110,
              largura: 380,
              rotacaoFinal: -3,
              frameEntrada: 50,
            },
          ],
        }}
      />
      <Composition
        id="ComparacaoBarras"
        component={ComparacaoBarras}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
        schema={comparacaoBarrasSchema}
        defaultProps={{
          corFundo: "#0d0f14",
          valorMaximoEscala: 30,
          larguraBarra: 220,
          alturaMaximaBarra: 380,
          barras: [
            {
              label: "Renda Fixa",
              valorFinal: 12,
              cor: "#3d5a80",
              corTopo: "#6ea8d8",
              frameEntrada: 0,
              destaque: false,
            },
            {
              label: "Ações (JR)",
              valorFinal: 27,
              cor: "#0f9e6e",
              corTopo: "#00ff9d",
              frameEntrada: 20,
              destaque: true,
            },
          ],
        }}
      />
      <Composition
        id="TextoDestaque"
        component={TextoDestaque}
        durationInFrames={90}
        fps={30}
        width={1280}
        height={720}
        schema={textoDestaqueSchema}
        defaultProps={{
          texto: "RENDA FIXA",
          posicao: "centro",
          duracaoFrames: 90,
          corTexto: "#ffffff",
          corFundo: "rgba(0,0,0,0.55)",
          mostrarFundo: true,
          tamanhoFonte: 80,
        }}
      />
      <Composition
        id="Seta"
        component={Seta}
        durationInFrames={120}
        fps={30}
        width={1280}
        height={720}
        schema={setaSchema}
        defaultProps={{
          xInicial: 300,
          yInicial: 520,
          xFinal: 720,
          yFinal: 240,
          cor: "#ff3b30",
          espessura: 8,
          curvatura: "curva",
          duracaoFrames: 40,
        }}
      />
    </Folder>
  );
};
