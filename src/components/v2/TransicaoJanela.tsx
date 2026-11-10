import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { coresTema, KIT, progresso, temaSchema, tipoMidiaSchema } from "./kitV3";
import { CameraJR, FOCOS_JR_CABECA, type FocoCamera, type PlacaCamera, type RemendoCamera, type VeuCamera } from "./CameraJR";
import { FundoExplicativo } from "./FundoExplicativo";
import { ArrobaCanal } from "./ArrobaCanal";

// Kit v3, seções 4.2 e 4.12 (anexos 7 e 8 do Matheus).
// O JR começa em tela cheia (com o @ no canto). Em `frameTransicao` ele encolhe para uma
// janela no centro superior, enquanto o fundo explicativo entra numa varredura diagonal
// com a linha amarela na frente. Depois entra o logo e o conteúdo (passado como `children`,
// por exemplo ComparacaoNumeros ou Pauta). Se `frameVolta` > 0, faz o caminho inverso.
// 04/11 (pedidos A-002 e A-004 do Matheus): a janela mostra a CÂMERA INTEIRA (sem recortar só a
// cabeça), com borda fina na cor do kit por cima do vídeo, e sem logo (o YouTube já põe a marca
// do canal). O fundo da câmera desfoca (CameraJR), para o foco ficar no JR.

export const transicaoJanelaSchema = z.object({
  jrSrc: z.string().default("images/kit-v3/jr-quadro-teste.jpg"),
  jrTipo: tipoMidiaSchema.default("imagem"),
  jrMudo: z.boolean().default(true),
  jrInicio: z.number().min(0).default(0),
  // Vazio = sem logo (padrão desde 04/11: o YouTube já mostra a marca do canal).
  logo: z.string().default(""),
  arroba: z.string().default("jroinvestidorsertanejo"),
  // Negativo = já começa com o JR na janela.
  frameTransicao: z.number().min(-1000).default(30),
  duracaoTransicao: z.number().min(1).default(15),
  // 0 = não volta para a tela cheia dentro deste trecho.
  frameVolta: z.number().min(0).default(0),
  duracaoVolta: z.number().min(1).default(12),
  larguraJanela: z.number().min(0.1).max(0.5).default(0.22),
  topoJanela: z.number().min(0).max(0.3).default(0.04),
  // Recorte da fonte mostrado na janela (fração da imagem): por exemplo só o rosto do JR,
  // quando a fonte tem elementos antigos gravados por cima. {0,0,1} = imagem inteira.
  recorteJanela: z
    .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), largura: z.number().min(0.1).max(1) })
    .default({ x: 0, y: 0, largura: 1 }),
  corDestaque: zColor().default("#FFC629"),
  // Espessura da borda da janela em px de um vídeo 1920 (fina = 2).
  bordaJanela: z.number().min(0).max(8).default(2),
  // 04/11 (A-011): tela explicativa clara (bege). Borda e linha viram marrom (amarelo só no escuro).
  tema: temaSchema.default("escuro"),
  corFundoClaro: zColor().default("#F5F0E6"),
  // Desfoque do fundo da câmera (fração da largura do quadro; 0 = sem desfoque).
  desfoqueFundo: z.number().min(0).max(0.03).default(0.0015),
  duracaoFrames: z.number().min(30).default(150),
});

type Props = z.input<typeof transicaoJanelaSchema> & {
  children?: React.ReactNode;
  // Focos nítidos da câmera e remendos (ver CameraJR). Padrão: só a cabeça nítida.
  focos?: FocoCamera[];
  remendos?: RemendoCamera[];
  veus?: VeuCamera[];
  placas?: PlacaCamera[];
  // true = na volta para a tela cheia, mantém o recorte da janela (a tela cheia mostra só ele).
  manterRecorteNaVolta?: boolean;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const TransicaoJanela: React.FC<Props> = ({
  jrSrc = "images/kit-v3/jr-quadro-teste.jpg",
  jrTipo = "imagem",
  jrMudo = true,
  jrInicio = 0,
  logo = "",
  arroba = "jroinvestidorsertanejo",
  frameTransicao = 30,
  duracaoTransicao = 15,
  frameVolta = 0,
  duracaoVolta = 12,
  larguraJanela = 0.22,
  topoJanela = 0.04,
  recorteJanela = { x: 0, y: 0, largura: 1 },
  corDestaque = KIT.amarelo,
  bordaJanela = 2,
  tema = "escuro",
  corFundoClaro = KIT.creme,
  desfoqueFundo = 0.0015,
  duracaoFrames = 150,
  children,
  focos = FOCOS_JR_CABECA,
  remendos = [],
  veus = [],
  placas = [],
  manterRecorteNaVolta = false,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cores = coresTema(tema, corFundoClaro);
  const cor = tema === "claro" && corDestaque === KIT.amarelo ? cores.destaque : corDestaque;

  const ida = progresso(frame, frameTransicao, duracaoTransicao);
  const volta = frameVolta > 0 ? progresso(frame, frameVolta, duracaoVolta) : 0;
  const a = ida * (1 - volta); // 0 = JR em tela cheia, 1 = JR na janela

  // Janela do JR: interpola posição e tamanho da tela cheia até o centro superior.
  const jw = lerp(W, larguraJanela * W, a);
  const jh = lerp(H, (larguraJanela * W * 9) / 16, a);
  const jx = lerp(0, (W - larguraJanela * W) / 2, a);
  const jy = lerp(0, topoJanela * H, a);
  const borda = (bordaJanela * W) / 1920;
  const raio = ((16 * W) / 1920) * a;

  // Varredura diagonal: a frente vai de 0 a 112% da largura (a base fica 12% atrás).
  const frente = a * 1.12;
  const opacidadeVarredura = interpolate(a, [0, 0.04, 0.85, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacidadeArroba = interpolate(a, [0, 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacidadeLogo =
    progresso(frame, frameTransicao + duracaoTransicao - 3, 10) * (1 - volta);

  return (
    <Sequence name="TransicaoJanela">
      <AbsoluteFill style={{ backgroundColor: cores.fundo, overflow: "hidden" }}>
        {/* Fundo explicativo, revelado pela varredura */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(0 0, ${frente * 100}% 0, ${(frente - 0.12) * 100}% 100%, 0 100%)`,
          }}
        >
          <FundoExplicativo duracaoFrames={duracaoFrames} corLinha={cor} tema={tema} corFundoClaro={corFundoClaro} />
        </AbsoluteFill>

        {/* Conteúdo da explicação */}
        <AbsoluteFill style={{ opacity: 1 - volta }}>{children}</AbsoluteFill>

        {logo ? (
          <Img
            src={staticFile(logo)}
            style={{ position: "absolute", left: W * 0.045, top: W * 0.032, width: W * 0.09, opacity: opacidadeLogo }}
          />
        ) : null}

        {/* JR: tela cheia → janela no centro superior */}
        <div
          style={{
            position: "absolute",
            left: jx,
            top: jy,
            width: jw,
            height: jh,
            overflow: "hidden",
            borderRadius: raio,
            backgroundColor: "#000",
          }}
        >
          <CameraJR
            src={jrSrc}
            tipo={jrTipo}
            mudo={jrMudo}
            inicio={jrInicio}
            desfoque={desfoqueFundo}
            focos={focos}
            remendos={remendos}
            veus={veus}
            placas={placas}
            larguraCaixa={jw}
            recorte={
              manterRecorteNaVolta && volta > 0
                ? recorteJanela
                : {
                    x: lerp(0, recorteJanela.x, a),
                    y: lerp(0, recorteJanela.y, a),
                    largura: lerp(1, recorteJanela.largura, a),
                  }
            }
          />
          {/* Borda POR CIMA do vídeo (antes ficava por baixo e não aparecia). */}
          {a > 0.001 && borda > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: raio,
                border: `${borda}px solid ${cor}`,
                boxSizing: "border-box",
                opacity: Math.min(1, a * 3),
              }}
            />
          ) : null}
        </div>

        {/* Linha amarela na frente da varredura */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: opacidadeVarredura }}
        >
          <line
            x1={frente * W}
            y1={-10}
            x2={(frente - 0.12) * W}
            y2={H + 10}
            stroke={cor}
            strokeWidth={(6 * W) / 1920}
          />
        </svg>

        {/* @ só enquanto o JR está em tela cheia */}
        {arroba ? (
          <AbsoluteFill style={{ opacity: opacidadeArroba }}>
            <ArrobaCanal usuario={arroba} duracaoFrames={duracaoFrames + 100} framesEntrada={0} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </Sequence>
  );
};
