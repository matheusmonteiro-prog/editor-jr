import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  estiloSubida,
  FONTE_KIT,
  IconeKit,
  KIT,
  type NomeIcone,
  nomeIconeSchema,
  progresso,
  TextoComDestaque,
  tipoMidiaSchema,
} from "./kitV3";
import { FundoExplicativo } from "./FundoExplicativo";
import { CameraJR } from "./CameraJR";

// Kit v3, seções 4.1 e 6.2 (anexo 3, aprovado pelo Matheus em 03/11).
// Tela dividida em diagonal: painel de informação à esquerda, sobre o fundo explicativo,
// e o JR à direita. Uma linha Amarelo JR corre em cima da divisa.
// Entrada: o JR começa em tela cheia e desliza para a direita enquanto o painel entra
// pela esquerda, com a linha na frente. Saída: o caminho inverso.
// Dois modos:
//  - "titulo": ícone grande + título com uma palavra em amarelo ("Vida de cidade").
//  - "lista": rótulo opcional + itens numa grade (ícone em coluna fixa, texto alinhado),
//    entrando um por vez e ficando na tela. Sem caixa atrás de nenhum item.

const itemSchema = z.object({
  icone: nomeIconeSchema.default("nenhum"),
  texto: z.string(),
});

export const painelDiagonalSchema = z.object({
  jrSrc: z.string().default("images/kit-v3/jr-quadro-teste.jpg"),
  jrTipo: tipoMidiaSchema.default("imagem"),
  // Mudo por padrão: a voz vem da camada principal da câmera no plano de edição.
  jrMudo: z.boolean().default(true),
  // Quadro do vídeo do JR em que este trecho começa (0 = do início do arquivo).
  jrInicio: z.number().min(0).default(0),
  // false: não desenha o JR (ele já está na camada da câmera, na metade direita).
  jrVisivel: z.boolean().default(true),
  // Vazio = sem logo (padrão desde 04/11, pedido A-004: o YouTube já mostra a marca do canal).
  logo: z.string().default(""),
  modo: z.enum(["titulo", "lista"]).default("titulo"),
  icone: nomeIconeSchema.default("predio"),
  titulo: z.string().default("Vida de cidade"),
  destaque: z.string().default("cidade"),
  rotulo: z.string().default(""),
  itens: z.array(itemSchema).max(4).default([]),
  framesEntreItens: z.number().min(1).default(14),
  // Opcional: quadro de entrada de cada item, preso ao tempo da fala. Vazio = cascata fixa.
  inicioItens: z.array(z.number().min(0)).default([]),
  // Opcional: várias listas seguidas no mesmo painel (quadros relativos ao início do painel).
  listas: z
    .array(
      z.object({
        inicio: z.number().min(0),
        fim: z.number().min(1),
        rotulo: z.string().default(""),
        itens: z.array(itemSchema).max(4),
        inicioItens: z.array(z.number().min(0)).default([]),
      }),
    )
    .default([]),
  topoDiagonal: z.number().min(0.3).max(0.7).default(0.52),
  baseDiagonal: z.number().min(0.3).max(0.7).default(0.46),
  corDestaque: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(30).default(150),
  framesEntrada: z.number().min(1).default(15),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof painelDiagonalSchema>;

export const PainelDiagonal: React.FC<Props> = ({
  jrSrc = "images/kit-v3/jr-quadro-teste.jpg",
  jrTipo = "imagem",
  jrMudo = true,
  jrInicio = 0,
  jrVisivel = true,
  logo = "",
  modo = "titulo",
  icone = "predio",
  titulo = "Vida de cidade",
  destaque = "cidade",
  rotulo = "",
  itens = [],
  framesEntreItens = 14,
  inicioItens = [],
  listas = [],
  topoDiagonal = 0.52,
  baseDiagonal = 0.46,
  corDestaque = KIT.amarelo,
  duracaoFrames = 150,
  framesEntrada = 15,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const entrou = progresso(frame, 0, framesEntrada);
  const saiu = progresso(frame, duracaoFrames - framesSaida, framesSaida);
  const aberto = entrou * (1 - saiu); // 0 = JR em tela cheia, 1 = painel inteiro na tela

  // O JR ocupa da diagonal (um pouco antes da base) até a borda direita.
  const jrEsquerda = aberto * (baseDiagonal - 0.02) * W;
  // O painel (e a linha) vem de fora da tela pela esquerda.
  const deslocPainel = -(1 - aberto) * (topoDiagonal + 0.04) * W;

  const larguraConteudo = baseDiagonal * W;
  const sub = W * 0.012; // distância da subida curta
  const conteudoVisivel = 1 - saiu;

  // Lista (kit 6.2): o bloco começa na mesma margem do logo (alinhamento pedido pelo Matheus em
  // 03/11) e os itens alinham à esquerda entre si, sem passar da diagonal. Sem caixa atrás.
  const renderLista = (
    rot: string,
    its: { icone?: NomeIcone; texto: string }[],
    inicios: number[],
    inicioRotulo: number,
    visivel: number,
  ) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginLeft: W * 0.05,
        maxWidth: larguraConteudo - W * 0.08,
      }}
    >
      {rot ? (
        <div
          style={{
            ...estiloSubida(progresso(frame, inicioRotulo, 14) * visivel, sub),
            fontWeight: 600,
            fontSize: W * 0.0135,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: corDestaque,
            marginBottom: W * 0.022,
          }}
        >
          {rot}
        </div>
      ) : null}
      {its.map((item, i) => (
        <div
          key={`${item.texto}-${i}`}
          style={{
            ...estiloSubida(progresso(frame, inicios[i], 14) * visivel, sub),
            display: "grid",
            gridTemplateColumns: `${W * 0.038}px auto`,
            columnGap: W * 0.014,
            alignItems: "center",
            marginBottom: i < its.length - 1 ? W * 0.019 : 0,
          }}
        >
          <IconeKit nome={item.icone ?? "nenhum"} cor={corDestaque} tamanho={W * 0.032} />
          <span style={{ fontWeight: 800, fontSize: W * 0.03, lineHeight: 1.1, color: KIT.creme, whiteSpace: "nowrap" }}>
            {item.texto}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Sequence name="PainelDiagonal">
      <AbsoluteFill
        style={{ backgroundColor: jrVisivel ? KIT.verde : "transparent", overflow: "hidden", fontFamily: FONTE_KIT }}
      >
        {/* JR. Com jrVisivel = false o painel fica só por cima da camada da câmera (o JR já
            está na metade direita dela, como no v1 de 28/10). */}
        {jrVisivel ? (
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, left: jrEsquerda }}>
            <CameraJR src={jrSrc} tipo={jrTipo} mudo={jrMudo} inicio={jrInicio} />
          </div>
        ) : null}

        <AbsoluteFill style={{ transform: `translateX(${deslocPainel}px)` }}>
          {/* Painel com o fundo explicativo, cortado na diagonal */}
          <AbsoluteFill
            style={{
              clipPath: `polygon(0 0, ${topoDiagonal * 100}% 0, ${baseDiagonal * 100}% 100%, 0 100%)`,
            }}
          >
            <FundoExplicativo duracaoFrames={duracaoFrames} corLinha={corDestaque} />
          </AbsoluteFill>

          {/* Linha Amarelo JR na divisa (6 px em 1920) */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <line
              x1={topoDiagonal * W}
              y1={-10}
              x2={baseDiagonal * W}
              y2={H + 10}
              stroke={corDestaque}
              strokeWidth={(6 * W) / 1920}
            />
          </svg>

          {/* Logo no topo esquerdo do painel: só se for passado (padrão sem logo desde 04/11) */}
          {logo ? (
            <Img
              src={staticFile(logo)}
              style={{
                position: "absolute",
                left: W * 0.05,
                top: W * 0.035,
                width: W * 0.11,
                ...estiloSubida(progresso(frame, framesEntrada - 3, 12) * conteudoVisivel, sub),
              }}
            />
          ) : null}

          {/* Conteúdo, centralizado no painel */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: larguraConteudo,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {modo === "titulo" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.016 }}>
                <div style={estiloSubida(progresso(frame, framesEntrada - 2, 14) * conteudoVisivel, sub)}>
                  <IconeKit nome={icone} cor={corDestaque} tamanho={W * 0.105} />
                </div>
                <div
                  style={{
                    ...estiloSubida(progresso(frame, framesEntrada + 3, 14) * conteudoVisivel, sub),
                    fontWeight: 800,
                    fontSize: W * 0.036,
                    lineHeight: 1.08,
                    color: KIT.creme,
                    textAlign: "center",
                    maxWidth: larguraConteudo * 0.84,
                  }}
                >
                  <TextoComDestaque texto={titulo} destaque={destaque} cor={corDestaque} />
                </div>
              </div>
            ) : listas.length > 0 ? null : (
              renderLista(
                rotulo,
                itens,
                itens.map(
                  (_, i) => inicioItens[i] ?? framesEntrada + (rotulo ? framesEntreItens : 0) + i * framesEntreItens,
                ),
                framesEntrada - 2,
                conteudoVisivel,
              )
            )}
          </div>

          {/* Várias listas seguidas no mesmo painel: o JR fica no lugar e só a lista troca. */}
          {listas.map((l, n) =>
            frame >= l.inicio && frame < l.fim ? (
              <div
                key={`lista-${n}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: larguraConteudo,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {renderLista(
                  l.rotulo ?? "",
                  l.itens,
                  l.itens.map((_, i) => (l.inicioItens ?? [])[i] ?? l.inicio + 12 + i * framesEntreItens),
                  l.inicio,
                  conteudoVisivel * (1 - progresso(frame, l.fim - 10, 10)),
                )}
              </div>
            ) : null,
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};
