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
import { Checkmark, checkmarkSchema } from "./components/Checkmark";
import { ListaCheck, listaCheckSchema } from "./components/v2/ListaCheck";
import { ColagemFotos, colagemFotosSchema } from "./components/v2/ColagemFotos";
import {
  TextoContraste,
  textoContrasteSchema,
} from "./components/v2/TextoContraste";
import {
  LegendaDiscreta,
  legendaDiscretaSchema,
} from "./components/v2/LegendaDiscreta";
import { BarrasDuelo, barrasDueloSchema } from "./components/v2/BarrasDuelo";
import {
  GraficoCrescimento,
  graficoCrescimentoSchema,
} from "./components/v2/GraficoCrescimento";
import {
  PersonagemImagem,
  personagemImagemSchema,
} from "./components/v2/PersonagemImagem";
import { Contador, contadorSchema } from "./components/v2/Contador";
import { Spotlight, spotlightSchema } from "./components/v2/Spotlight";
import { CallToAction, callToActionSchema } from "./components/v2/CallToAction";

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
      <Composition
        id="Checkmark"
        component={Checkmark}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
        schema={checkmarkSchema}
        defaultProps={{
          x: 640,
          y: 360,
          tamanho: 160,
          cor: "#ffffff",
          corFundo: "#0f9e6e",
          mostrarFundo: true,
          duracaoFrames: 60,
        }}
      />
      <Composition
        id="ListaCheck"
        component={ListaCheck}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={listaCheckSchema}
        defaultProps={{
          texto: "EMPRESAS BOAS",
          destaque: "BOAS",
          top: 0.15,
          corFundo: "#0d0f14",
          corTexto: "#ffffff",
          corDestaque: "#22C55E",
          corCheck: "#22C55E",
          tamanhoFonte: 0.034,
          frameEntradaCheck: 18,
          duracaoFrames: 150,
          framesSaida: 25,
        }}
      />
      <Composition
        id="ColagemFotos"
        component={ColagemFotos}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={colagemFotosSchema}
        defaultProps={{
          corFundo: "#0d0f14",
          fotos: [
            { src: "images/cena1.png", rotacao: -6, frameEntrada: 8 },
            { src: "images/cena2.png", rotacao: 5, frameEntrada: 40 },
            { src: "images/cena3.png", rotacao: -3, frameEntrada: 72 },
          ],
          etiqueta: "Ativos Reais",
          mostrarEtiqueta: true,
          corEtiqueta: "#22C55E",
          larguraFoto: 0.42,
        }}
      />
      <Composition
        id="TextoContraste"
        component={TextoContraste}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={textoContrasteSchema}
        defaultProps={{
          corFundo: "#0d0f14",
          textoPositivo: "INVESTIR",
          textoNegativo: "ESPECULAR",
          corPositivo: "#ffffff",
          corNegativo: "#6b7280",
          frameRisco: 55,
          duracaoFramesRisco: 18,
          tamanhoFontePositivo: 0.06,
          tamanhoFonteNegativo: 0.042,
        }}
      />
      <Composition
        id="LegendaDiscreta"
        component={LegendaDiscreta}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        schema={legendaDiscretaSchema}
        defaultProps={{
          texto: "Guardar um pouco todo mês",
          corTexto: "#e5e7eb",
          tamanhoFonte: 0.024,
          posicao: "rodape",
          duracaoFrames: 120,
        }}
      />
      <Composition
        id="BarrasDuelo"
        component={BarrasDuelo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={barrasDueloSchema}
        defaultProps={{
          corFundo: "#0d0f14",
          barras: [
            {
              label: "Poupança",
              alturaRelativa: 0.2,
              cor: "#6b7280",
              destaque: false,
              frameEntrada: 0,
            },
            {
              label: "Empresa boa",
              alturaRelativa: 0.9,
              cor: "#22C55E",
              destaque: true,
              frameEntrada: 40,
            },
          ],
          legenda: "ilustrativo",
          mostrarLegenda: true,
          larguraBarra: 0.16,
          alturaMaxima: 0.45,
        }}
      />
      <Composition
        id="GraficoCrescimento"
        component={GraficoCrescimento}
        durationInFrames={200}
        fps={30}
        width={1080}
        height={1920}
        schema={graficoCrescimentoSchema}
        defaultProps={{
          corFundo: "#0d0f14",
          corLinha: "#22C55E",
          rotuloEixoX: "ANOS",
          mostrarRotuloEixoX: true,
          textoIlustrativo: "ilustrativo",
          mostrarTextoIlustrativo: true,
          textoFinal: "VALORIZOU",
          mostrarTextoFinal: true,
          largura: 0.85,
          altura: 0.4,
          duracaoFramesDesenho: 130,
        }}
      />
      <Composition
        id="PersonagemImagem"
        component={PersonagemImagem}
        durationInFrames={100}
        fps={30}
        width={1080}
        height={1920}
        schema={personagemImagemSchema}
        defaultProps={{
          imagem: "investidor.png",
          top: 0.3,
          left: 0.36,
          tamanho: 0.28,
          duracaoFrames: 100,
          framesSaida: 20,
        }}
      />
      <Composition
        id="Contador"
        component={Contador}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        schema={contadorSchema}
        defaultProps={{
          valorInicial: 0,
          valorFinal: 100,
          prefixo: "R$ ",
          casasDecimais: 2,
          rotulo: "Patrimônio",
          corCard: "#0F2A1D",
          corNumero: "#F5F0E6",
          corRotulo: "#F5F0E6",
          duracaoFramesContagem: 45,
          framesSaida: 15,
          duracaoFrames: 90,
          tamanhoFonte: 0.09,
          top: 0.38,
        }}
      />
      <Composition
        id="Spotlight"
        component={Spotlight}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        schema={spotlightSchema}
        defaultProps={{
          x: 0.5,
          y: 0.4,
          raio: 0.18,
          corEscurecimento: "#0F2A1D",
          opacidadeEscurecimento: 0.65,
          corBorda: "#EFAF20",
          espessuraBorda: 2,
          framesEntrada: 18,
          framesSaida: 15,
          duracaoFrames: 90,
          suavizacao: 0,
        }}
      />
      <Composition
        id="CallToAction"
        component={CallToAction}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        schema={callToActionSchema}
        defaultProps={{
          texto: "Inscreva-se",
          posicao: "inferior-direito",
          corBotao: "#EFAF20",
          corTexto: "#0F2A1D",
          tamanhoFonte: 0.032,
          margem: 0.05,
          duracaoFrames: 90,
          framesEntrada: 15,
          framesSaida: 15,
        }}
      />
      <Composition
        id="CallToActionHorizontal"
        component={CallToAction}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        schema={callToActionSchema}
        defaultProps={{
          texto: "Inscreva-se",
          posicao: "inferior-direito",
          corBotao: "#EFAF20",
          corTexto: "#0F2A1D",
          tamanhoFonte: 0.022,
          margem: 0.04,
          duracaoFrames: 90,
          framesEntrada: 15,
          framesSaida: 15,
        }}
      />
    </Folder>
  );
};
