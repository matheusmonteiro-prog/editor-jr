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
import {
  CirculoDestaque,
  circuloDestaqueSchema,
} from "./components/v2/CirculoDestaque";
import { AvisoCVM, avisoCVMSchema } from "./components/v2/AvisoCVM";
import {
  ArrobaInstagram,
  arrobaInstagramSchema,
} from "./components/v2/ArrobaInstagram";
import {
  LegendaAnimada,
  legendaAnimadaSchema,
} from "./components/v2/LegendaAnimada";
import {
  GradeAtivos3D,
  gradeAtivos3DSchema,
} from "./components/v2/GradeAtivos3D";
// Kit visual v3 (docs/kit-visual-video.md, 03/11/2026)
import {
  FundoExplicativo,
  fundoExplicativoSchema,
} from "./components/v2/FundoExplicativo";
import { CameraJR, cameraJRSchema } from "./components/v2/CameraJR";
import { LinhaTrajetoria, linhaTrajetoriaSchema } from "./components/v2/LinhaTrajetoria";
import {
  PainelDiagonal,
  painelDiagonalSchema,
} from "./components/v2/PainelDiagonal";
import {
  TransicaoJanela,
  transicaoJanelaSchema,
} from "./components/v2/TransicaoJanela";
import {
  ComparacaoNumeros,
  comparacaoNumerosSchema,
} from "./components/v2/ComparacaoNumeros";
import { Pauta, pautaSchema } from "./components/v2/Pauta";
import {
  AberturaCapitulo,
  aberturaCapituloSchema,
} from "./components/v2/AberturaCapitulo";
import { ArrobaCanal, arrobaCanalSchema } from "./components/v2/ArrobaCanal";
import {
  DestaqueSolto,
  destaqueSoltoSchema,
} from "./components/v2/DestaqueSolto";

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
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
        schema={setaSchema}
        defaultProps={{
          xInicial: 0.25,
          yInicial: 0.7,
          xFinal: 0.6,
          yFinal: 0.35,
          cor: "#EFAF20",
          espessura: 0.008,
          curvatura: "curva",
          duracaoFrames: 60,
          framesEntrada: 15,
          framesSaida: 15,
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
      <Composition
        id="CirculoDestaque"
        component={CirculoDestaque}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        schema={circuloDestaqueSchema}
        defaultProps={{
          posicaoX: 0.5,
          posicaoY: 0.5,
          largura: 0.3,
          altura: 0.15,
          cor: "#EFAF20",
          espessura: 0.006,
          duracaoFrames: 60,
          framesEntrada: 20,
          framesSaida: 15,
        }}
      />
      <Composition
        id="AvisoCVM"
        component={AvisoCVM}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={avisoCVMSchema}
        defaultProps={{
          texto:
            "Conteúdo informativo. Não constitui recomendação ou indicação de investimento.",
          tamanhoFonte: 0.024,
          margemVertical: 0.05,
          margemHorizontal: 0.04,
          corTexto: "#F5F0E6",
          corCard: "rgba(15, 42, 29, 0.78)",
          mostrarFundo: true,
          duracaoFrames: 150,
          framesEntrada: 15,
          framesSaida: 15,
        }}
      />
      {/* PROVISÓRIO: @ de teste, não é o @ real; nenhum plano usa este valor. */}
      <Composition
        id="ArrobaInstagram"
        component={ArrobaInstagram}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={arrobaInstagramSchema}
        defaultProps={{
          usuario: "arroba_provisorio",
          posicao: "superior-esquerdo",
          tamanhoFonte: 0.03,
          margem: 0.04,
          corTexto: "#F5F0E6",
          corCard: "#0F2A1D",
          corDestaque: "#EFAF20",
          duracaoFrames: 150,
          framesEntrada: 15,
          framesSaida: 15,
        }}
      />
      <Composition
        id="LegendaAnimada"
        component={LegendaAnimada}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={legendaAnimadaSchema}
        defaultProps={{
          palavras: [
            { texto: "Comprar", inicioFrames: 0, fimFrames: 14, destaque: false },
            { texto: "empresas", inicioFrames: 14, fimFrames: 30, destaque: false },
            { texto: "boas", inicioFrames: 30, fimFrames: 48, destaque: true },
            { texto: "pelo", inicioFrames: 48, fimFrames: 60, destaque: false },
            { texto: "preço", inicioFrames: 60, fimFrames: 76, destaque: false },
            { texto: "certo.", inicioFrames: 76, fimFrames: 100, destaque: true },
          ],
          corTexto: "#FFFDF7",
          corDestaque: "#FFB800",
          corContorno: "#0F2A1D",
          tamanhoFonte: 0.07,
          posicaoX: 0.5,
          posicaoY: 0.78,
          larguraMaxima: 0.9,
          maiusculas: true,
          maxPalavrasPorFrase: 4,
          pausaQuebraMs: 700,
        }}
      />
      <Composition
        id="GradeAtivos3D"
        component={GradeAtivos3D}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={gradeAtivos3DSchema}
        defaultProps={{
          colunas: 20,
          linhas: 20,
          inclinacao: 58,
          giro: -18,
          frameInicio: 22,
          framesAntesDaOnda: 12,
          duracaoOnda: 40,
          corApagado: "#0F2A1D",
          corAceso: "#F5F0E6",
          corBorda: "#F5F0E6",
          largura: 0.95,
          centroY: 0.4,
          alturaCubo: 0.28,
          duracaoFrames: 150,
          framesSaida: 12,
          corFundo: "#0F2A1D",
        }}
      />
      {/* ---------- Kit visual v3 ---------- */}
      <Composition
        id="FundoExplicativo"
        component={FundoExplicativo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={fundoExplicativoSchema}
        defaultProps={{
          imagem: "images/kit-v3/fundo-explicativo-provisorio.jpg",
          zoomFinal: 1.08,
          escurecer: 0.62,
          mostrarLinha: true,
          opacidadeLinha: 0.15,
          corLinha: "#FFC629",
          framesLinha: 50,
          movimento: 1,
          cicloSegundos: 16,
          duracaoFrames: 150,
        }}
      />
      {/* Kit v3, 4.10 (04/11): trajetória do JR, linha que se desenha etapa por etapa */}
      <Composition
        id="LinhaTrajetoria"
        component={LinhaTrajetoria}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={linhaTrajetoriaSchema}
        defaultProps={{
          capitulos: [
            {
              titulo: "Do sítio à cidade",
              marcos: [
                { icone: "terra" as const, texto: "Criado no sítio", em: 15 },
                { icone: "predio" as const, texto: "Vida de cidade", em: 45 },
              ],
            },
            {
              titulo: "Por conta própria",
              marcos: [
                { icone: "maleta" as const, texto: "Por conta própria", em: 85 },
                { icone: "caminhao" as const, texto: "Transportadora", em: 115 },
              ],
            },
          ],
          x: 0.05,
          y: 0.1,
          largura: 0.42,
          altura: 0.8,
          tamanhoTexto: 0.024,
          framesLinha: 14,
          tema: "escuro" as const,
          corLinha: "#FFC629",
          duracaoFrames: 180,
          framesEntrada: 10,
          framesSaida: 12,
        }}
      />
      {/* Kit v3, 4.15 (04/11): câmera com fundo desfocado e JR nítido */}
      <Composition
        id="CameraJR"
        component={CameraJR}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        schema={cameraJRSchema}
        defaultProps={{
          src: "images/kit-v3/jr-quadro-teste.jpg",
          tipo: "imagem" as const,
          mudo: true,
          inicio: 0,
          desfoque: 0.0015,
          escurecerFundo: 0.04,
          focos: [
            { x: 0.5, y: 0.27, raioX: 0.3, raioY: 0.42 },
            { x: 0.5, y: 0.86, raioX: 0.56, raioY: 0.56 },
          ],
          remendos: [],
          veus: [],
        }}
      />
      <Composition
        id="PainelDiagonal"
        component={PainelDiagonal}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={painelDiagonalSchema}
        defaultProps={{
          jrSrc: "images/kit-v3/jr-quadro-teste.jpg",
          jrTipo: "imagem" as const,
          jrMudo: true,
          logo: "",
          modo: "titulo" as const,
          icone: "predio" as const,
          titulo: "Vida de cidade",
          destaque: "cidade",
          rotulo: "",
          itens: [],
          framesEntreItens: 14,
          topoDiagonal: 0.52,
          baseDiagonal: 0.46,
          corDestaque: "#FFC629",
          duracaoFrames: 120,
          framesEntrada: 15,
          framesSaida: 12,
        }}
      />
      <Composition
        id="PainelDiagonalLista"
        component={PainelDiagonal}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={painelDiagonalSchema}
        defaultProps={{
          jrSrc: "images/kit-v3/jr-quadro-teste.jpg",
          jrTipo: "imagem" as const,
          jrMudo: true,
          logo: "",
          modo: "lista" as const,
          icone: "nenhum" as const,
          titulo: "",
          destaque: "",
          rotulo: "Onde atuo hoje",
          itens: [
            { icone: "soja" as const, texto: "Soja" },
            { icone: "boi" as const, texto: "Boi" },
            { icone: "grafico" as const, texto: "Bolsa de valores" },
          ],
          framesEntreItens: 14,
          topoDiagonal: 0.52,
          baseDiagonal: 0.46,
          corDestaque: "#FFC629",
          duracaoFrames: 150,
          framesEntrada: 15,
          framesSaida: 12,
        }}
      />
      <Composition
        id="TransicaoJanela"
        component={TransicaoJanela}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={transicaoJanelaSchema}
        defaultProps={{
          jrSrc: "images/kit-v3/jr-quadro-teste.jpg",
          jrTipo: "imagem" as const,
          jrMudo: true,
          logo: "",
          arroba: "jroinvestidorsertanejo",
          frameTransicao: 30,
          duracaoTransicao: 15,
          frameVolta: 95,
          duracaoVolta: 12,
          larguraJanela: 0.22,
          topoJanela: 0.04,
          corDestaque: "#FFC629",
          duracaoFrames: 120,
        }}
      />
      <Composition
        id="ComparacaoNumeros"
        component={ComparacaoNumeros}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={comparacaoNumerosSchema}
        defaultProps={{
          rotulo: "Ação exemplo · ilustrativo",
          titulo: "Preço x valor calculado",
          rotuloAntes: "Preço hoje",
          valorAntes: 32.4,
          rotuloDepois: "Valor calculado",
          valorDepois: 38.1,
          prefixo: "R$ ",
          casasDecimais: 2,
          corDepois: "amarelo" as const,
          fonte: "Fonte: [fonte] · [data]",
          ilustrativo: true,
          comFundo: true,
          topo: 0.33,
          framesContador: 45,
          corDestaque: "#FFC629",
          duracaoFrames: 120,
          framesSaida: 12,
        }}
      />
      <Composition
        id="Pauta"
        component={Pauta}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={pautaSchema}
        defaultProps={{
          titulo: "Duas partes:",
          itens: [
            { texto: "Quem é o JR", complemento: "(do sítio à Bolsa de Valores)" },
            { texto: "A terra como régua", complemento: "(valorização x dividendo)" },
          ],
          comFundo: true,
          logo: "",
          corDestaque: "#FFC629",
          framesEntreItens: 12,
          duracaoFrames: 120,
          framesSaida: 12,
        }}
      />
      <Composition
        id="AberturaCapitulo"
        component={AberturaCapitulo}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        schema={aberturaCapituloSchema}
        defaultProps={{
          rotulo: "Parte 1",
          titulo: "Terra x Bolsa",
          subtitulo: "valorização, dividendo e a régua do canal",
          comFundo: true,
          logo: "",
          corDestaque: "#FFC629",
          duracaoFrames: 90,
          framesSaida: 12,
        }}
      />
      <Composition
        id="ArrobaCanal"
        component={ArrobaCanal}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={arrobaCanalSchema}
        defaultProps={{
          usuario: "jroinvestidorsertanejo",
          tamanhoFonte: 0.0208,
          margemTopo: 0.04,
          margemDireita: 0.05,
          corTexto: "#F5F0E6",
          duracaoFrames: 120,
          framesEntrada: 10,
          framesSaida: 10,
        }}
      />
      <Composition
        id="DestaqueSolto"
        component={DestaqueSolto}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={destaqueSoltoSchema}
        defaultProps={{
          icone: "predio" as const,
          texto: "Fundo imobiliário",
          destaque: "imobiliário",
          tamanhoFonte: 0.025,
          margemEsquerda: 0.05,
          margemBase: 0.16,
          escurecerCanto: 0.78,
          corDestaque: "#FFC629",
          duracaoFrames: 120,
          framesEntrada: 14,
          framesSaida: 12,
        }}
      />
    </Folder>
  );
};
