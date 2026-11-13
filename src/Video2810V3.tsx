import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ArrobaCanal } from "./components/v2/ArrobaCanal";
import { ImpactoKit } from "./components/v2/ImpactoKit";
import { PainelDiagonal } from "./components/v2/PainelDiagonal";
import { LinhaTrajetoria } from "./components/v2/LinhaTrajetoria";
import { TransicaoJanela } from "./components/v2/TransicaoJanela";
import { Pauta } from "./components/v2/Pauta";
import { AberturaCapitulo } from "./components/v2/AberturaCapitulo";
import type { NomeIcone } from "./components/v2/kitV3";
import {
  CameraJR,
  FOCOS_JR_CENTRO,
  type FocoCamera,
  type RemendoCamera,
  type PlacaCamera,
  type VeuCamera,
} from "./components/v2/CameraJR";
// A-019 (11/11/2026): no começo (0 a 8,47 s) o JR balançava 2x mais que no resto do vídeo. Esse trecho
// agora é uma CENA NOVA gerada pela Higgsfield (Wan 2.7 image to video, 1080p, ~US$ 1,01, ok do
// Matheus): 1º quadro real do v1 + a voz original do projeto (0 a 8,4 s) conduzindo a boca. Medido:
// cabeça 3,24 -> 1,14 px/quadro; boca segue a voz sem atraso. Em 8,47 s o v1 já tinha um corte seco
// (sob o título "Quem é o investidor"): a volta para a gravação real cai nele.
// A estabilização sem IA (scripts/estabilizar-*.py, src/dados/estabilizar-2810.json) saiu daqui.
// Sem filtro: o visual desta cena É a referência do filtro novo da gravação (scripts/filtro-rosto-natural.py).
const CENA_CALMA = { src: "videos/cenas/jr-calmo-wan27-1080.mp4", ate: 8.47 };

// Vídeo de 28/10 reeditado com o kit visual v3 (docs/kit-visual-video.md), 04/11/2026.
//
// FONTE DA IMAGEM: o próprio render antigo, public/videos/2026-10-28-final-v1.mp4 (decisão do
// Matheus em 04/11: a gravação original não está disponível). Ele tem os elementos antigos
// gravados por cima, então cada trecho usa só a parte limpa:
//  - história (B2/B3 e B5): no v1 o JR já está na metade direita; o painel diagonal novo cobre
//    a metade esquerda antiga inteira (diagonal 56% → 50%);
//  - trechos com pílulas antigas em tela cheia: JR na janela, recortando só o rosto
//    (as pílulas antigas ficam sempre abaixo de 58% da altura);
//  - tese (B6): a janela recorta a janelinha que o v1 já tinha;
//  - palavras de impacto: a faixa escura cobre o texto antigo, no mesmo lugar e na mesma hora.
// O zoom de abertura e as batidas já vêm gravados no v1 (não aplicar de novo).
// Logo antigo do v1: coberto por remendo (LOGO_V1). Fica visível do v1, aceito: o escurecimento
// final (4:05).
//
// Tempos em SEGUNDOS DA LINHA FINAL (4:07,6), iguais aos do v1.
// Voz: public/videos/2026-10-28-voz-wpe8-calma20.wav (aprovada pelo Matheus em 06/11: WPE força máxima + tratar-voz preset jr) a partir de
// 2026-10-28-fundo.mp4 (voz limpa e cortada). Para voltar à voz antiga, troque o arquivo na tag <Audio>.
// Fora de propósito, por regra do kit: "De 50 reais a bilhões", "Valorização extremamente boa",
// "Assim como o S&P 500" e "Valoriza bem perante o real" (promessa ou desempenho sem fonte).

const FPS = 30;
const s = (seg: number) => Math.round(seg * FPS);

export const DURACAO_2810_V3 = s(251.6);

// Trilha de fundo (pedido A-010, 04/11): "Sertão Caboclo", Quincas Moreira. Arquivo fora do Git.
// Licença: conferir na YouTube Audio Library antes de publicar.
const MUSICA = "music/sertao-caboclo-quincas-moreira.mp3";
// A música está a -10 LUFS e a voz a -14. 0.045 deixa a trilha perto de -37 LUFS (~23 dB abaixo).
const VOLUME_MUSICA = 0.045;

export type Props2810 = {
  cameraSrc: string;
  cameraTipo: "video" | "imagem";
  // false quando a fonte é o v1 (zoom de abertura e batidas já gravados nele).
  aplicarZoom: boolean;
};

// ---------- Câmera de base (tela cheia) ----------
const BATIDAS = [8.47, 89.3, 116.3, 213.4, 222.0];
const FIM_BATIDAS = [11.17, 92.27, 119.4, 216.8, 224.23];

const zoomCamera = (frame: number) => {
  if (frame < 45) {
    return interpolate(frame, [0, 45], [1.25, 1], { easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  }
  for (let i = 0; i < BATIDAS.length; i++) {
    const a = s(BATIDAS[i]);
    const b = s(FIM_BATIDAS[i]);
    if (frame >= a && frame < b) return interpolate(frame, [a, a + 3], [1, 1.15], { extrapolateRight: "clamp" });
    if (frame >= b && frame < b + 17) {
      return interpolate(frame, [b, b + 17], [1.15, 1], { easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
    }
  }
  return 1;
};

// Logo antigo gravado no v1 (canto superior esquerdo, o vídeo inteiro): coberto esticando a
// coluna de parede limpa logo à direita dele (pedido A-004, 04/11). Medido em quadro 1920×1080.
const LOGO_V1: RemendoCamera = { x: 0.035, y: 0.035, largura: 0.17, altura: 0.2, colunaX: 0.205 };

// No v1, nos trechos da história, o JR está na metade direita (o painel antigo fica à esquerda,
// coberto pelo nosso). Trocas medidas no v1: 79,6–80,0 s, 100,3–100,4 s e 114,6–115,0 s.
const V1_JR_A_DIREITA: [number, number][] = [
  [11.3, 79.9], // a troca do v1 vai de 11,17 a 11,4 s
  [100.33, 114.8],
];
const FOCOS_JR_DIREITA: FocoCamera[] = [
  { x: 0.73, y: 0.27, raioX: 0.26, raioY: 0.42 },
  { x: 0.75, y: 0.86, raioX: 0.42, raioY: 0.56 },
];

// Texto antigo das palavras de impacto do v1 (74% a 86% da altura): véu de desfoque em ELIPSE só
// em volta dele, por baixo da sombra verde do ImpactoKit (A-014). Sem faixa de lado a lado.
// 04/11 (A-016): o véu agora vai de lado a lado da tela (sem bordas verticais, que apareciam
// como mancha), com degradê só em cima e embaixo, e fica sob a camada verde do ImpactoKit.
const veuImpacto = (): VeuCamera => ({
  x: -0.05,
  y: 0.6,
  largura: 1.1,
  altura: 0.4,
  forma: "retangulo",
  suaveX: 0,
  suaveY: 0.3,
});

const CameraBase: React.FC<Props2810> = ({ cameraSrc, cameraTipo, aplicarZoom }) => {
  const frame = useCurrentFrame();
  const aDireita = V1_JR_A_DIREITA.some(([de, ate]) => frame >= s(de) && frame < s(ate));
  const impacto = IMPACTOS.find((i) => i.faixa && frame >= s(i.de) && frame < s(i.ate));
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F2A1D",
        overflow: "hidden",
        transform: aplicarZoom ? `scale(${zoomCamera(frame)})` : undefined,
        transformOrigin: "50% 40%",
      }}
    >
      {/* Fundo desfocado, JR nítido (pedido A-007) e logo antigo coberto (A-004). De 0 a 8,47 s, a
          cena calma gerada (A-019); depois, a gravação real a partir do mesmo ponto. */}
      <Sequence durationInFrames={s(CENA_CALMA.ate)} name="JR calmo (IA)">
        <CameraJR
          src={CENA_CALMA.src}
          tipo="video"
          mudo
          focos={FOCOS_JR_CENTRO}
          remendos={[LOGO_V1]}
        />
      </Sequence>
      <Sequence from={s(CENA_CALMA.ate)} name="JR gravação">
        <CameraJR
          src={cameraSrc}
          tipo={cameraTipo}
          inicio={cameraTipo === "video" ? s(CENA_CALMA.ate) : 0}
          mudo
          focos={aDireita ? FOCOS_JR_DIREITA : FOCOS_JR_CENTRO}
          remendos={[LOGO_V1]}
          veus={impacto ? [veuImpacto()] : []}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const Trecho: React.FC<{ de: number; ate: number; nome: string; children: React.ReactNode }> = ({
  de,
  ate,
  nome,
  children,
}) => (
  <Sequence from={s(de)} durationInFrames={s(ate) - s(de)} name={nome}>
    {children}
  </Sequence>
);

// ---------- Painéis da história (kit 4.1 e 6.2) ----------
type ItemLista = { icone: NomeIcone; texto: string; em: number };
type Lista = { de: number; ate: number; rotulo: string; itens: ItemLista[] };

const PAINEIS: { de: number; ate: number; listas: Lista[] }[] = [
  {
    de: 11.17,
    ate: 80.45, // 04/11: sai depois que o v1 termina a troca dele (79,6–80,0 s)
    listas: [
      {
        de: 11.17,
        ate: 35.9,
        rotulo: "Do sítio à cidade",
        itens: [
          { icone: "terra", texto: "Criado no sítio", em: 12.33 },
          { icone: "predio", texto: "Vida de cidade", em: 17.53 },
          { icone: "soja", texto: "Casa agrícola", em: 25.03 },
          { icone: "banco", texto: "Trabalhei em banco", em: 31.6 },
        ],
      },
      {
        de: 36.0,
        ate: 64.2,
        rotulo: "Por conta própria",
        itens: [
          { icone: "maleta", texto: "Por conta própria", em: 36.77 },
          { icone: "camisa", texto: "Roupa para vender", em: 48.0 },
          { icone: "caminhao", texto: "Transportadora", em: 56.87 },
          { icone: "carro", texto: "Revenda de carros", em: 61.43 },
        ],
      },
      {
        de: 64.3,
        ate: 80.0,
        rotulo: "Gado e Maringá",
        itens: [
          { icone: "martelo", texto: "Leilões de gado", em: 64.7 },
          { icone: "pino", texto: "De volta ao Paraná", em: 68.63 },
          { icone: "boi", texto: "Boi gordo", em: 71.77 },
          { icone: "fabrica", texto: "Empresa em Maringá", em: 75.73 },
        ],
      },
    ],
  },
  {
    de: 100.3,
    ate: 115.45, // 04/11: sai depois da troca do v1 (114,6–115,0 s)
    listas: [
      {
        de: 100.3,
        ate: 114.9,
        rotulo: "Minhas fazendas",
        itens: [
          { icone: "pino", texto: "Fazenda no Paraná", em: 102.0 },
          { icone: "soja", texto: "Soja", em: 104.6 },
          { icone: "boi", texto: "Pecuária", em: 106.8 },
          { icone: "grafico", texto: "Uma fazenda na Bolsa", em: 110.2 },
        ],
      },
    ],
  },
];

// ---------- Janelas (kit 4.2 e 4.12): JR recortado no centro superior ----------
type Bloco = { de: number; ate: number; titulo: string; itens: { texto: string; em: number }[] };
type Janela = {
  de: number;
  ate: number;
  animarEntrada: boolean; // false = já começa com o JR na janela (corte seco)
  animarSaida: boolean; // false = termina em corte seco
  recorte: { x: number; y: number; largura: number };
  focos: FocoCamera[];
  remendos: RemendoCamera[];
  veus: VeuCamera[];
  placas?: PlacaCamera[];
  manterRecorteNaVolta?: boolean;
  // 04/11 (A-011): tela explicativa clara (bege) ou escura (verde). O vídeo mistura os dois.
  tema?: "escuro" | "claro";
  blocos: Bloco[];
};

// 04/11 (pedido A-002): a janela mostra a CÂMERA INTEIRA, não só a cabeça. Os textos antigos
// gravados no peito do JR (abaixo de 58% da altura) ficam desfocados: só a cabeça é nítida.
const INTEIRA = { x: 0, y: 0, largura: 1 };
// 04/11 (A-009): na janela também a roupa inteira fica nítida; o texto antigo do peito fica
// escondido pelo véu (PILULAS_V1).
const FOCO_CABECA: FocoCamera[] = FOCOS_JR_CENTRO;
// Pílulas antigas gravadas no v1 (canto inferior esquerdo, sobre o peito): véu de desfoque forte.
// 04/11 (A-015): o véu virava borrão na janelinha. Agora a área das pílulas é coberta pelo mesmo
// pedaço de um quadro limpo do v1 (120 s, sem pílula). Câmera parada; o JR mexe pouco ali.
const PLACA_PILULAS: PlacaCamera = {
  // A placa precisa ter o MESMO filtro da câmera (senão vira mancha de cor). Com filtro forte:
  // images/kit-v3/placa-limpa-v1-120s-filtro.jpg (reprovado em 06/11).
  src: "images/kit-v3/placa-limpa-v1-120s.jpg",
  x: 0,
  y: 0.52,
  largura: 0.64,
  altura: 0.32,
};
// Janelinha que o v1 já tinha no bloco da tese (B6).
const JANELA_V1 = { x: 0.235, y: 0.045, largura: 0.53 };
// Foco dentro da janelinha do v1 (coordenadas do quadro inteiro do v1).
const FOCO_JANELA_V1: FocoCamera[] = [{ x: 0.5, y: 0.19, raioX: 0.15, raioY: 0.2 }];

const JANELAS: Janela[] = [
  {
    de: 81.7,
    ate: 100.3,
    animarEntrada: true,
    animarSaida: true, // 04/11: volta para tela cheia antes do painel (antes era corte seco)
    recorte: INTEIRA,
    focos: FOCO_CABECA,
    remendos: [LOGO_V1],
    veus: [],
    placas: [PLACA_PILULAS],
    blocos: [
      {
        de: 82.0,
        ate: 89.2,
        titulo: "Comecei com:",
        itens: [
          { texto: "Compra e venda de ações", em: 82.27 },
          { texto: "Fundo imobiliário", em: 85.83 },
        ],
      },
      { de: 92.6, ate: 96.6, titulo: "Tema futuro:", itens: [{ texto: "Dividendos", em: 93.13 }] },
      { de: 96.7, ate: 100.3, titulo: "E também:", itens: [{ texto: "Comprei fazenda", em: 97.0 }] },
    ],
  },
  {
    de: 130.5,
    ate: 163.17,
    animarEntrada: false,
    animarSaida: true,
    recorte: JANELA_V1,
    focos: FOCO_JANELA_V1,
    remendos: [],
    veus: [],
    // O v1 sai da janelinha dele em 163,17 s: a nossa janela volta antes, mantendo o recorte, e
    // a SAIDA_JANELA_V1 acompanha a animação do v1 até a tela cheia.
    manterRecorteNaVolta: true,
    blocos: [
      {
        de: 131.0,
        ate: 150.9,
        titulo: "Tem que saber:",
        itens: [
          { texto: "A ação que compra", em: 138.9 },
          { texto: "Fazer boa seleção de ativos", em: 143.5 },
        ],
      },
      {
        de: 151.2,
        ate: 162.9,
        titulo: "Fazendeiro:",
        itens: [
          { texto: "Valorização de capital", em: 151.7 },
          { texto: "Dividendo pequeno", em: 155.1 },
        ],
      },
    ],
  },
  {
    de: 176.3,
    ate: 210.4,
    tema: "claro",
    animarEntrada: true,
    animarSaida: true,
    recorte: INTEIRA,
    focos: FOCO_CABECA,
    remendos: [LOGO_V1],
    veus: [],
    placas: [PLACA_PILULAS],
    blocos: [
      {
        de: 176.6,
        ate: 185.9,
        titulo: "Meu perfil:",
        itens: [
          { texto: "Não sou investidor em dividendos", em: 176.87 },
          { texto: "Prefiro ações de crescimento", em: 179.83 },
        ],
      },
      {
        de: 186.2,
        ate: 194.6,
        titulo: "Onde atuo hoje:",
        itens: [
          { texto: "Soja", em: 187.2 },
          { texto: "Boi", em: 188.0 },
          { texto: "Bolsa de valores", em: 188.9 },
        ],
      },
      { de: 194.8, ate: 199.9, titulo: "A régua:", itens: [{ texto: "Comparativo com a terra", em: 195.37 }] },
      {
        de: 200.2,
        ate: 209.9,
        titulo: "Pergunta:",
        itens: [
          { texto: "Ganhou sozinho na Mega-Sena?", em: 200.77 },
          { texto: "Compraria terra de soja, de boi?", em: 204.63 },
        ],
      },
    ],
  },
  {
    de: 224.3,
    ate: 243.4,
    tema: "claro",
    animarEntrada: true,
    animarSaida: true,
    recorte: INTEIRA,
    focos: FOCO_CABECA,
    remendos: [LOGO_V1],
    veus: [],
    placas: [PLACA_PILULAS],
    blocos: [
      {
        de: 224.6,
        ate: 236.0,
        titulo: "A terra:",
        itens: [
          { texto: "É um imóvel", em: 224.83 },
          { texto: "Dividendo pequeno", em: 231.53 },
        ],
      },
      {
        de: 236.2,
        ate: 243.0,
        titulo: "Comparação:",
        itens: [{ texto: "Dividendo parecido com o da terra", em: 240.33 }],
      },
    ],
  },
];

// ---------- Palavras de impacto (kit 4.4) ----------
// faixa = cobre o texto antigo do v1 (só nos trechos em tela cheia).
const IMPACTOS: {
  de: number;
  ate: number;
  l1: string;
  l2: string;
  t2?: number;
  faixa: boolean;
}[] = [
  { de: 8.47, ate: 11.17, l1: "Quem é o investidor", l2: "Sertanejo?", faixa: true },
  { de: 89.3, ate: 92.2, l1: "Isso vai dar", l2: "Conversa", faixa: false },
  { de: 116.3, ate: 119.4, l1: "A minha paixão é", l2: "Números", faixa: true },
  { de: 213.4, ate: 216.8, l1: "Dividendo pouco,", l2: "Valorização grande", t2: 0.056, faixa: true },
  { de: 222.0, ate: 224.23, l1: "A terra vai ser", l2: "O benchmark", t2: 0.066, faixa: true },
];

// @ do canal só com o JR em tela cheia (kit 5).
const ARROBA: [number, number][] = [
  [1.0, 11.17],
  [80.2, 81.7],
  [115.45, 127.03],
  [164.0, 176.3],
  [210.5, 224.3],
  [243.5, 246.6],
];

const CAPITULO = { de: 127.03, ate: 130.5 };

// 163,17–163,9 s: o v1 anima a janelinha dele de volta para a tela cheia. Aqui o recorte segue
// essa animação (curva medida pelo brilho do canto do v1), para o JR ficar parado em tela cheia.
const SAIDA_JANELA_V1 = { de: 163.17, ate: 163.9 };
const CURVA_V1_T = [163.17, 163.23, 163.3, 163.37, 163.43, 163.5, 163.6, 163.7, 163.83, 163.9];
const CURVA_V1_P = [0, 0.2, 0.44, 0.6, 0.73, 0.83, 0.9, 0.95, 0.98, 1];
const SaidaJanelaV1: React.FC<{ src: string; tipo: "video" | "imagem" }> = ({ src, tipo }) => {
  const frame = useCurrentFrame();
  const t = SAIDA_JANELA_V1.de + frame / FPS;
  const p = interpolate(t, CURVA_V1_T, CURVA_V1_P, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F2A1D" }}>
      <CameraJR
        src={src}
        tipo={tipo}
        mudo
        inicio={s(SAIDA_JANELA_V1.de)}
        recorte={{ x: lerp(JANELA_V1.x, 0), y: lerp(JANELA_V1.y, 0), largura: lerp(JANELA_V1.largura, 1) }}
        // Sem desfoque nestes 0,7 s: o JR está em movimento na fonte e um foco fixo erra o rosto.
        desfoque={0}
        remendos={[LOGO_V1]}
      />
    </AbsoluteFill>
  );
};
const FIM = { de: 246.6, ate: 251.6 };

export const Video2810V3: React.FC<Props2810> = ({ cameraSrc, cameraTipo, aplicarZoom }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F2A1D" }}>
      {/* 06/11 (A-020): voz aprovada + 20% menos sobe-e-desce de tom (amostra B). Anterior:
          videos/2026-10-28-voz-wpe8-completa.wav */}
      <Audio src={staticFile("videos/2026-10-28-voz-wpe8-calma20.wav")} />
      {/* Trilha (A-010): bem baixa, só se ouve prestando atenção (~23 dB abaixo da voz). A música
          tem 156 s; a segunda passada entra em 150 s, pulando a introdução, com troca suave. */}
      <Sequence durationInFrames={s(156)} name="Trilha 1">
        <Audio
          src={staticFile(MUSICA)}
          volume={(f) =>
            VOLUME_MUSICA *
            interpolate(f, [0, s(2), s(150), s(156)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
      </Sequence>
      <Sequence from={s(150)} durationInFrames={DURACAO_2810_V3 - s(150)} name="Trilha 2">
        <Audio
          src={staticFile(MUSICA)}
          trimBefore={s(8)}
          volume={(f) =>
            VOLUME_MUSICA *
            interpolate(
              f,
              [0, s(6), DURACAO_2810_V3 - s(150) - s(4), DURACAO_2810_V3 - s(150)],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      </Sequence>
      {/* A fonte tem 247,6 s; o fecho passa disso, então a câmera para antes do fim. */}
      <Sequence durationInFrames={s(247.5)} name="Câmera">
        <CameraBase cameraSrc={cameraSrc} cameraTipo={cameraTipo} aplicarZoom={aplicarZoom} />
      </Sequence>

      {ARROBA.map(([de, ate]) => (
        <Trecho key={`arroba-${de}`} de={de} ate={ate} nome="@ do canal">
          <ArrobaCanal duracaoFrames={s(ate) - s(de)} framesEntrada={8} framesSaida={6} />
        </Trecho>
      ))}

      {PAINEIS.map((p) => (
        <Trecho key={`painel-${p.de}`} de={p.de} ate={p.ate} nome={`Painel ${p.listas[0].rotulo}`}>
          <PainelDiagonal
            jrVisivel={false}
            modo="lista"
            topoDiagonal={0.56}
            baseDiagonal={0.5}
            framesEntrada={p.de === 100.3 ? 1 : 15}
            duracaoFrames={s(p.ate) - s(p.de)}
            listas={[]}
            itens={[]}
          />
          {/* 04/11 (A-013): a história vira TRAJETÓRIA, uma linha dourada que se desenha etapa por
              etapa. O segundo painel continua a mesma trajetória: os capítulos anteriores já
              aparecem desenhados (em = -1) e a "câmera" segue para o capítulo novo. */}
          <LinhaTrajetoria
            capitulos={[
              ...PAINEIS.filter((q) => q.de < p.de).flatMap((q) =>
                q.listas.map((l) => ({
                  titulo: l.rotulo,
                  em: -1,
                  marcos: l.itens.map(({ icone, texto }) => ({ icone, texto, em: -1 })),
                })),
              ),
              ...p.listas.map((l) => ({
                titulo: l.rotulo,
                em: s(l.de) - s(p.de) + 4,
                marcos: l.itens.map(({ icone, texto, em }) => ({
                  icone,
                  texto,
                  em: Math.max(s(l.de) - s(p.de) + 14, s(em) - s(p.de)),
                })),
              })),
            ]}
            x={0.05}
            y={0.09}
            largura={0.44}
            altura={0.83}
            framesEntrada={p.de === 100.3 ? 0 : 12}
            duracaoFrames={s(p.ate) - s(p.de)}
          />
        </Trecho>
      ))}

      <Trecho de={CAPITULO.de} ate={CAPITULO.ate} nome="Capítulo: Terra x Bolsa">
        <AberturaCapitulo
          rotulo="O que vem pela frente"
          titulo="Terra x Bolsa"
          subtitulo="valorização, dividendo e a régua do canal"
          duracaoFrames={s(CAPITULO.ate) - s(CAPITULO.de)}
          framesSaida={1}
        />
      </Trecho>

      {JANELAS.map((j) => {
        const dur = s(j.ate) - s(j.de);
        return (
          <Trecho key={`janela-${j.de}`} de={j.de} ate={j.ate} nome={`Janela ${j.blocos[0].titulo}`}>
            <TransicaoJanela
              jrSrc={cameraSrc}
              jrTipo={cameraTipo}
              jrInicio={s(j.de)}
              arroba={j.animarEntrada ? "jroinvestidorsertanejo" : ""}
              // -1000 = já começa na janela (com -1 ela animava 15 quadros: defeito de 130,5 s).
              frameTransicao={j.animarEntrada ? 0 : -1000}
              duracaoTransicao={15}
              // Termina a volta 1 quadro antes do fim (antes cortava no meio da animação).
              frameVolta={j.animarSaida ? dur - 13 : 0}
              duracaoVolta={12}
              recorteJanela={j.recorte}
              focos={j.focos}
              remendos={j.remendos}
              veus={j.veus}
              placas={j.placas ?? []}
              manterRecorteNaVolta={j.manterRecorteNaVolta ?? false}
              tema={j.tema ?? "escuro"}
              duracaoFrames={dur}
            >
              {j.blocos.map((b) => (
                <Sequence key={`bloco-${b.de}`} from={s(b.de) - s(j.de)} durationInFrames={s(b.ate) - s(b.de)}>
                  <Pauta
                    titulo={b.titulo}
                    itens={b.itens.map(({ texto }) => ({ texto }))}
                    inicioItens={b.itens.map((it) => Math.max(8, s(it.em) - s(b.de)))}
                    numerado={false}
                    comFundo={false}
                    tema={j.tema ?? "escuro"}
                    logo=""
                    topo={0.36}
                    duracaoFrames={s(b.ate) - s(b.de)}
                    framesSaida={8}
                  />
                </Sequence>
              ))}
            </TransicaoJanela>
          </Trecho>
        );
      })}

      <Trecho de={SAIDA_JANELA_V1.de} ate={SAIDA_JANELA_V1.ate} nome="Saída da janela do v1">
        <SaidaJanelaV1 src={cameraSrc} tipo={cameraTipo} />
      </Trecho>

      {IMPACTOS.map((i) => (
        <Trecho key={`imp-${i.de}`} de={i.de} ate={i.ate} nome={`Impacto: ${i.l2}`}>
          <ImpactoKit
            linha1={i.l1}
            linha2={i.l2}
            tamanho2={i.t2 ?? 0.073}
            faixa={i.faixa}
            duracaoFrames={s(i.ate) - s(i.de)}
          />
        </Trecho>
      ))}

      {/* Fecho (kit 4.9). CTA e aviso legal ainda dependem de decisão do JR: texto provisório. */}
      <Trecho de={FIM.de} ate={FIM.ate} nome="Fecho">
        <AberturaCapitulo
          rotulo="Até o próximo vídeo"
          titulo="Método JR"
          subtitulo="Conteúdo educacional. Não é recomendação de compra ou venda."
          duracaoFrames={s(FIM.ate) - s(FIM.de)}
          framesSaida={1}
        />
      </Trecho>
    </AbsoluteFill>
  );
};
