import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Esteira de "filtragem" do bloco 03 (rodada 7): ícones GENÉRICOS de ativos (não os logos do
// bloco 06) passam da direita para a esquerda em velocidade constante, em loop. Em `selecoes`
// a esteira freia por ~0,3 s e o ícone que está no centro ganha borda e brilho dourados
// ("este foi selecionado"); depois volta ao fluxo.
// Traço fino, monocromático creme/dourado, sem preenchimento pesado. Candles: dourado (alta)
// e creme (baixa); nunca o verde #1DD41E.

type Props = {
  y: number; // centro da faixa, fração da altura
  inicio: number; // frame (relativo à Sequence)
  saida?: number;
  selecoes: number[]; // frames (relativos à Sequence) em que a esteira freia e seleciona
};

// Desenhos em viewBox 48x48, só traço.
const ICONES: { nome: string; cor: string; desenho: React.ReactNode }[] = [
  {
    nome: "candle-alta",
    cor: COR.dourado,
    desenho: (
      <>
        <line x1={24} y1={6} x2={24} y2={14} />
        <rect x={17} y={14} width={14} height={20} rx={1.5} />
        <line x1={24} y1={34} x2={24} y2={42} />
      </>
    ),
  },
  {
    nome: "linha-subindo",
    cor: COR.creme,
    desenho: (
      <>
        <polyline points="6,36 17,26 25,30 40,12" />
        <polyline points="32,12 40,12 40,20" />
        <line x1={6} y1={42} x2={42} y2={42} />
      </>
    ),
  },
  {
    nome: "barras",
    cor: COR.creme,
    desenho: (
      <>
        <rect x={8} y={26} width={7} height={14} rx={1} />
        <rect x={20.5} y={18} width={7} height={22} rx={1} />
        <rect x={33} y={9} width={7} height={31} rx={1} />
      </>
    ),
  },
  {
    nome: "porcentagem",
    cor: COR.creme,
    desenho: (
      <>
        <circle cx={15} cy={15} r={5} />
        <circle cx={33} cy={33} r={5} />
        <line x1={36} y1={10} x2={12} y2={38} />
      </>
    ),
  },
  {
    nome: "candle-baixa",
    cor: COR.creme,
    desenho: (
      <>
        <line x1={24} y1={6} x2={24} y2={12} />
        <rect x={17} y={12} width={14} height={24} rx={1.5} />
        <line x1={24} y1={36} x2={24} y2={42} />
      </>
    ),
  },
  {
    nome: "cifrao",
    cor: COR.dourado,
    desenho: (
      <>
        <path d="M 32 15 C 30 11, 18 10, 17 17 C 16 24, 32 22, 31 30 C 30 37, 18 37, 15 32" />
        <line x1={24} y1={6} x2={24} y2={42} />
      </>
    ),
  },
  {
    nome: "acao",
    cor: COR.creme,
    desenho: (
      <>
        <rect x={7} y={7} width={34} height={34} rx={5} />
        <polyline points="15,31 31,15" />
        <polyline points="21,15 31,15 31,25" />
      </>
    ),
  },
  {
    nome: "pizza",
    cor: COR.creme,
    desenho: (
      <>
        <circle cx={24} cy={24} r={17} />
        <polyline points="24,7 24,24 39,32" />
      </>
    ),
  },
];

const FREIO = 9; // ~0,3 s freado
const RAMPA = 5; // frames para frear e para voltar

export const EsteiraAtivos: React.FC<Props> = ({ y, inicio, saida, selecoes }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const tamanho = width * 0.075; // ícone
  const passo = width * 0.16; // distância entre ícones
  const voltaCompleta = passo * ICONES.length;
  const velocidade = width * 0.006; // px por frame

  // Velocidade em cada frame (1 = normal, 0,15 = freado) e deslocamento acumulado.
  const fatorVelocidade = (f: number) =>
    selecoes.reduce((menor, s) => {
      const freio = interpolate(f, [s - RAMPA, s, s + FREIO, s + FREIO + RAMPA], [1, 0.15, 0.15, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.quad),
      });
      return Math.min(menor, freio);
    }, 1);
  const deslocamentoAte = (fim: number) => {
    let d = 0;
    for (let f = inicio; f < fim; f++) d += velocidade * fatorVelocidade(f);
    return d;
  };
  const deslocamento = deslocamentoAte(frame);

  // Posição x (centro) do ícone i, dado um deslocamento. Os 8 ícones ocupam uma volta maior que a
  // tela: quem sai pela esquerda (fora da tela) reaparece pela direita (fora da tela).
  const xIcone = (i: number, d: number) => {
    const bruto = width + passo * 0.5 + i * passo - d;
    return ((((bruto + passo) % voltaCompleta) + voltaCompleta) % voltaCompleta) - passo;
  };

  // Em cada seleção, o ícone mais perto do centro é o escolhido.
  const escolhido = selecoes.map((s) => {
    const d = deslocamentoAte(s);
    let melhor = 0;
    ICONES.forEach((_, i) => {
      if (Math.abs(xIcone(i, d) - width / 2) < Math.abs(xIcone(melhor, d) - width / 2)) melhor = i;
    });
    return { s, i: melhor };
  });

  const op = interpolate(frame - inicio, [0, 8], [0, 1], clamp);
  const q = saida === undefined ? 0 : interpolate(frame - saida, [0, 10], [0, 1], clamp);
  const altura = tamanho * 1.7;
  const mascara = "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * y - altura / 2,
        height: altura,
        opacity: op * (1 - q),
        // Faixa escura suave atrás dos ícones, para lerem sobre a tabela nítida do fundo.
        background: `linear-gradient(180deg, ${comAlfa(COR.fundo, 0)} 0%, ${comAlfa(COR.fundo, 0.72)} 30%, ${comAlfa(
          COR.fundo,
          0.72,
        )} 70%, ${comAlfa(COR.fundo, 0)} 100%)`,
        WebkitMaskImage: mascara,
        maskImage: mascara,
      }}
    >
      {ICONES.map((icone, i) => {
        const cx = xIcone(i, deslocamento);
        // Destaque: sobe ao frear e some ~0,4 s depois de voltar ao fluxo.
        const destaque = escolhido
          .filter((e) => e.i === i)
          .reduce(
            (maior, e) =>
              Math.max(
                maior,
                interpolate(frame, [e.s - RAMPA, e.s, e.s + FREIO + RAMPA, e.s + FREIO + RAMPA + 12], [0, 1, 1, 0], clamp),
              ),
            0,
          );
        const cor = destaque > 0.5 ? COR.dourado : icone.cor;
        return (
          <div
            key={icone.nome}
            style={{
              position: "absolute",
              left: cx - tamanho / 2,
              top: altura / 2 - tamanho / 2,
              width: tamanho,
              height: tamanho,
              borderRadius: tamanho * 0.22,
              border: `${Math.max(1.5, width * 0.0014)}px solid ${comAlfa(COR.dourado, destaque)}`,
              boxShadow: destaque > 0 ? `0 0 ${tamanho * 0.35 * destaque}px ${comAlfa(COR.dourado, 0.55 * destaque)}` : undefined,
              transform: `scale(${1 + 0.12 * destaque})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 48 48"
              width={tamanho * 0.72}
              height={tamanho * 0.72}
              fill="none"
              stroke={cor}
              strokeWidth={1.5 * (48 / (tamanho * 0.72))} // 1,5 px na tela
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.55 + 0.45 * Math.max(destaque, icone.cor === COR.dourado ? 0.6 : 0.4) }}
            >
              {icone.desenho}
            </svg>
          </div>
        );
      })}
    </div>
  );
};
