import {
  AbsoluteFill,
  Composition,
  Easing,
  Folder,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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
import planoTesteCamera from "../planos/teste-camera.plano.json";
import cortes0926 from "../videos/0926.cortes.json";
import type { CalculateMetadataFunction } from "remotion";
import type { PlanoComposicaoProps } from "./PlanoComposicao";
import { tamanhoDoPlano } from "./utils/tamanhoDoPlano";

const FPS_0926 = 30;
const DURACAO_FRAMES_0926 = Math.round(cortes0926.duracaoFinal * FPS_0926);

// PlanoCameraTeste (Etapa 3, fase 1): tela = 0926 cortado, câmera = teste2-camera
// (sala vazia, Loop de 211). Trechos de planos/teste-camera.plano.json, original → cortado:
//   cam-cheia            0 s–4 s   → 0,000 s–4,000 s   = frames 0–120
//   cam-janelinha        20 s–28 s → 17,106 s–25,106 s = frames 513–753
//   cam-em-cima          31 s–33 s → 27,133 s–29,133 s = frames 814–874
//   cam-atravessa-corte  38 s–42 s → 33,517 s–36,756 s = frames 1006–1103 (corte real de 39,753 a 40,513 s; silêncio de 39,603 a 40,663 s menos 0,15 s de margem de cada lado)

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

// Teste de controle das camadas (Etapa 3): UMA instância fixa por vídeo, só a
// caixa (x, y, largura, altura, opacidade) é animada. Sem Sequence por cena.
const ARQUIVO_CAMERA = "videos/teste2-camera.mp4";
const ARQUIVO_TELA = "videos/teste2-tela.mp4"; // PROVISÓRIO: arquivo com erros de leitura, trocar por teste-camada-tela.mp4
const DURACAO_CAMERA_FRAMES = 211; // 7,03 s a 30 fps (ffprobe); só a câmera repete (Loop)
const FRAMES_TRANSICAO = 15;
const MARGEM = 0.03; // fração da largura
const INICIO_CENAS = [0, 150, 300, 450, 600, 750, 900]; // 7 cenas de 5 s

type Caixa = { x: number; y: number; largura: number; altura: number; opacidade: number };

const mistura = (a: Caixa, b: Caixa, p: number): Caixa => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  largura: a.largura + (b.largura - a.largura) * p,
  altura: a.altura + (b.altura - a.altura) * p,
  opacidade: a.opacidade + (b.opacidade - a.opacidade) * p,
});

const TesteControleCamadas: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const inteira: Caixa = { x: 0.5, y: 0.5, largura: 1, altura: 1, opacidade: 1 };
  // Metade da tela, 16:9 mantido: sobram faixas em cima e embaixo (25% cada).
  const esquerda: Caixa = { x: 0.25, y: 0.5, largura: 0.5, altura: 0.5, opacidade: 1 };
  const direita: Caixa = { ...esquerda, x: 0.75 };
  const lado = 0.25;
  const margemY = (MARGEM * width) / height; // mesma margem em pixels nos dois eixos
  const canto: Caixa = { x: MARGEM + lado / 2, y: 1 - margemY - lado / 2, largura: lado, altura: lado, opacidade: 1 };
  const topo: Caixa = { ...canto, x: 0.5, y: margemY + lado / 2 };
  const baixo: Caixa = { ...canto, x: 0.5 };
  const oculta = (c: Caixa): Caixa => ({ ...c, opacidade: 0 });

  // Cena por cena: câmera e tela. A tela vai sempre por cima (vem depois no JSX).
  const cenas: { camera: Caixa; tela: Caixa }[] = [
    { camera: esquerda, tela: direita },
    { camera: inteira, tela: oculta(direita) },
    { camera: oculta(inteira), tela: inteira },
    { camera: inteira, tela: canto },
    { camera: inteira, tela: topo },
    { camera: inteira, tela: baixo },
    { camera: inteira, tela: canto },
  ];

  const i = INICIO_CENAS.filter((inicio) => inicio <= frame).length - 1;
  const p = interpolate(frame - INICIO_CENAS[i], [0, FRAMES_TRANSICAO], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const de = cenas[Math.max(0, i - 1)];
  const para = cenas[i];

  return (
    <AbsoluteFill>
      <CamadaVideo
        src={ARQUIVO_CAMERA}
        mudo
        repetirFrames={DURACAO_CAMERA_FRAMES}
        {...mistura(de.camera, para.camera, p)}
      />
      {/* tela: sem Loop (o arquivo é mais longo que a composição) e sem som */}
      <CamadaVideo src={ARQUIVO_TELA} volume={0} mudo {...mistura(de.tela, para.tela, p)} />
    </AbsoluteFill>
  );
};

// Tamanho vindo do plano (Etapa 3, 3.3, fase 1): "vertical" -> 1080x1920,
// "horizontal" -> 1920x1080. Valor desconhecido ou erro: {} (vale o width/height
// literal da Composition) e aviso no console. A ficha .preparo.json não é lida.
const calcularTamanhoDoPlano: CalculateMetadataFunction<PlanoComposicaoProps> = ({ props }) => {
  try {
    const orientacao = props.plano?.orientacao;
    const tamanho = tamanhoDoPlano(orientacao);
    if (tamanho) return tamanho;
    console.warn(
      `calculateMetadata: orientacao ${JSON.stringify(orientacao)} do plano não é "vertical" nem "horizontal"; vale o tamanho literal da composição.`,
    );
  } catch (erro) {
    console.warn("calculateMetadata: não consegui ler a orientacao do plano; vale o tamanho literal da composição.", erro);
  }
  return {};
};

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
        <Composition
          id="TesteControleCamadas"
          component={TesteControleCamadas}
          durationInFrames={1050}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="PlanoCameraTeste"
          component={PlanoComposicao}
          durationInFrames={DURACAO_FRAMES_0926}
          fps={FPS_0926}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "videos/0926-cortado-v1.mp4",
            plano: planoTesteCamera,
            cortes: cortes0926,
            cameraSrc: "videos/teste2-camera.mp4",
            cameraRepetirFrames: 211,
          }}
        />
        {/* Tamanho vindo do plano (vertical): igual ao PlanoCameraTeste, abre em 1080x1920. */}
        <Composition
          id="PlanoAutomatico"
          component={PlanoComposicao}
          durationInFrames={DURACAO_FRAMES_0926}
          fps={FPS_0926}
          width={1080}
          height={1920}
          calculateMetadata={calcularTamanhoDoPlano}
          defaultProps={{
            videoSrc: "videos/0926-cortado-v1.mp4",
            plano: planoTesteCamera,
            cortes: cortes0926,
            cameraSrc: "videos/teste2-camera.mp4",
            cameraRepetirFrames: 211,
          }}
        />
        {/* Tamanho literal 1080x1920 de propósito: o plano horizontal faz o calculateMetadata
            mudar para 1920x1080. Câmera de teste (sala vazia) como vídeo, sem elementos. */}
        <Composition
          id="PlanoAutomaticoHorizontal"
          component={PlanoComposicao}
          durationInFrames={211}
          fps={FPS_0926}
          width={1080}
          height={1920}
          calculateMetadata={calcularTamanhoDoPlano}
          defaultProps={{
            videoSrc: "videos/teste2-camera.mp4",
            plano: { video: "teste2-camera", orientacao: "horizontal", elementos: [] },
            cortes: { trechos: [{ inicio: 0, fim: 7.03 }] },
          }}
        />
      </Folder>
    </>
  );
};
