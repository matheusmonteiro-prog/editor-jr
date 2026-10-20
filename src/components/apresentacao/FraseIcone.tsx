import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, ESPACO_TITULO, FONTE_TITULO, PESO_TITULO, comAlfa } from "./marca";

// Frase inteira com um ícone ao lado. Aparece de uma vez (corte seco) no frame `inicio`,
// na posição de baixo, e FICA até o fim do bloco. Quando a próxima frase entra
// (`empurroes`), esta sobe um degrau (`passo`) em 15 frames. Assim, lido de cima para
// baixo, o resultado final segue a ordem da fala. Entrada com pulso de escala forte
// (1 → 1,1 → 1 em 6 frames).
// O ícone é SVG inline, traço fino dourado (mesma espessura nos três), que se
// desenha (stroke-dashoffset), dá um pulso curto e solta um brilho rápido.

export type NomeIcone = "check" | "engrenagem" | "lampada";
// Como a palavra em destaque ("FAZ") aparece: dourado chapado, creme com contorno
// dourado, ou dourado com pulso maior (1 → 1,25 → 1).
export type EstiloFaz = "dourado" | "contorno" | "pulso";

type Props = {
  texto: string;
  destaque: string; // UMA palavra em dourado
  icone: NomeIcone;
  inicio: number; // frame (relativo à Sequence) do corte de entrada
  empurroes?: number[]; // frames em que as frases seguintes entram (esta sobe um degrau cada vez)
  passo?: number; // fração da altura de cada degrau
  estiloFaz?: EstiloFaz;
  top: number; // fração da altura (centro da linha, na posição de baixo)
  tamanho?: number; // fração da largura
  larguraMax?: number; // fração da largura
  duracaoTraco?: number; // frames para desenhar o ícone
};

const ESPESSURA = 4.5; // em unidades do viewBox (100): igual nos três ícones

// Engrenagem de 8 dentes: contorno único (dentes retos + arcos entre eles).
const caminhoEngrenagem = (): string => {
  const dentes = 8;
  const rBase = 31;
  const rPonta = 43;
  const ponto = (r: number, graus: number) => {
    const a = ((graus - 90) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
  };
  let d = "";
  for (let i = 0; i < dentes; i++) {
    const c = i * (360 / dentes);
    const p = [ponto(rBase, c - 11), ponto(rPonta, c - 7), ponto(rPonta, c + 7), ponto(rBase, c + 11)];
    d += `${i === 0 ? "M" : `A ${rBase} ${rBase} 0 0 1`} ${p[0]} L ${p[1]} L ${p[2]} L ${p[3]} `;
  }
  return `${d}A ${rBase} ${rBase} 0 0 1 ${ponto(rBase, -11)} Z`;
};
const ENGRENAGEM = caminhoEngrenagem();

// Cada traço tem pathLength=100: o mesmo cálculo de dashoffset serve para todos.
const Tracos: React.FC<{ icone: NomeIcone; progresso: number }> = ({ icone, progresso }) => {
  const props = {
    fill: "none",
    stroke: COR.dourado,
    strokeWidth: ESPESSURA,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 100,
    strokeDasharray: 100,
    strokeDashoffset: 100 * (1 - progresso),
  };
  if (icone === "check") {
    return (
      <>
        <circle cx={50} cy={50} r={44} {...props} />
        <path d="M 27 52 L 44 69 L 74 33" {...props} />
      </>
    );
  }
  if (icone === "engrenagem") {
    return (
      <>
        <path d={ENGRENAGEM} {...props} />
        <circle cx={50} cy={50} r={13} {...props} />
      </>
    );
  }
  // lâmpada: bulbo, base, rosca e filamento
  return (
    <>
      <path d="M 36 68 C 36 58 24 53 24 38 A 26 26 0 0 1 76 38 C 76 53 64 58 64 68 Z" {...props} />
      <path d="M 38 79 L 62 79" {...props} />
      <path d="M 43 89 L 57 89" {...props} />
      <path d="M 42 52 L 50 42 L 58 52" {...props} />
    </>
  );
};

export const FraseIcone: React.FC<Props> = ({
  texto,
  destaque,
  icone,
  inicio,
  empurroes = [],
  passo = 0.08,
  estiloFaz = "dourado",
  top,
  tamanho = 0.074,
  larguraMax = 0.9,
  duracaoTraco = 14,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < inicio) return null;

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const local = frame - inicio;
  const alto = texto.toLocaleUpperCase("pt-BR");
  const alvo = destaque.toLocaleUpperCase("pt-BR");
  const pos = alto.lastIndexOf(alvo);
  const antes = pos >= 0 ? alto.slice(0, pos) : alto;
  const meio = pos >= 0 ? alvo : "";
  const depois = pos >= 0 ? alto.slice(pos + alvo.length) : "";

  // O tamanho cabe na largura: ícone 1,5em + espaço 0,4em + ~0,74em por letra.
  const fontSize = Math.min(width * tamanho, (width * larguraMax) / (1.9 + alto.length * 0.74));
  const lado = fontSize * 1.5;

  const escala = interpolate(local, [0, 3, 6], [1, 1.1, 1], clamp);
  // Sobe um degrau a cada frase que entra depois (movimento suave de 15 frames).
  const subida = empurroes.reduce(
    (soma, e) => soma + interpolate(frame - e, [0, 15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }),
    0,
  );
  const pulsoFaz = estiloFaz === "pulso" ? interpolate(local, [6, 12, 20], [1, 1.25, 1], clamp) : 1;
  const inicioTraco = 2;
  const progresso = interpolate(local, [inicioTraco, inicioTraco + duracaoTraco], [0, 1], clamp);
  const fimTraco = inicioTraco + duracaoTraco;
  const pulsoIcone = interpolate(local, [fimTraco, fimTraco + 3, fimTraco + 6], [1, 1.15, 1], clamp);
  const brilho = interpolate(local, [fimTraco, fimTraco + 3, fimTraco + 12], [0, 0.9, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * (top - passo * subida),
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) scale(${escala})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.4 }}>
        <div style={{ position: "relative", width: lado, height: lado, flexShrink: 0 }}>
          {/* Brilho rápido atrás do ícone, depois de desenhar. */}
          <div
            style={{
              position: "absolute",
              inset: -lado * 0.35,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${comAlfa(COR.dourado, 0.55)} 0%, ${comAlfa(COR.dourado, 0)} 70%)`,
              opacity: brilho,
            }}
          />
          <svg
            width={lado}
            height={lado}
            viewBox="0 0 100 100"
            style={{ position: "relative", transform: `scale(${pulsoIcone})` }}
          >
            <Tracos icone={icone} progresso={progresso} />
          </svg>
        </div>
        <span
          style={{
            fontFamily: FONTE_TITULO,
            fontWeight: PESO_TITULO,
            letterSpacing: ESPACO_TITULO,
            fontSize,
            color: COR.creme,
            whiteSpace: "nowrap",
          }}
        >
          {antes}
          <span
            style={{
              display: "inline-block",
              transform: `scale(${pulsoFaz})`,
              color: estiloFaz === "contorno" ? COR.creme : COR.dourado,
              WebkitTextStroke: estiloFaz === "contorno" ? `${width * 0.0019}px ${COR.dourado}` : undefined,
              paintOrder: "stroke fill",
            }}
          >
            {meio}
          </span>
          {depois}
        </span>
      </div>
    </div>
  );
};
