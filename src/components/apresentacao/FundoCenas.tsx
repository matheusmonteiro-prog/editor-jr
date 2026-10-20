import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Cena, Movimento, TipoTransicao } from "../../dados/apresentacao";
import type { LinhaDoTempo } from "../../utils/linhaDoTempoApresentacao";
import { acharBloco } from "../../utils/linhaDoTempoApresentacao";
import { BrilhoRadial } from "./BrilhoRadial";
import { COR, comAlfa } from "./marca";
import { Particulas } from "./Particulas";
import { RaiosDeLuz } from "./RaiosDeLuz";

// Fundo do vídeo: uma foto por cena, com movimento lento (zoom ou pan),
// escurecimento #0F2A1D e a transição de entrada de cada cena.
// A cena nova entra POR CIMA e a antiga continua se movendo por baixo até
// sumir: nunca aparece tela preta. A cena antiga também recebe o "empurrão"
// da transição seguinte (empurrão vertical, deslize, zoom atravessando).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.65, 0, 0.35, 1);

const transformMovimento = (m: Movimento, t: number): string => {
  if (m.tipo === "zoom") {
    return `scale(${interpolate(t, [0, 1], [m.de, m.para])})`;
  }
  if (m.tipo === "panVertical") {
    const y = interpolate(t, [0, 1], [m.deY, m.paraY]) * 100;
    return `scale(${m.zoom}) translateY(${y}%)`;
  }
  const x = interpolate(t, [0, 1], [m.deX, m.paraX]) * 100;
  const y = interpolate(t, [0, 1], [m.deY, m.paraY]) * 100;
  return `scale(${m.zoom}) translate(${x}%, ${y}%)`;
};

// Recorte diagonal: progresso 0 = nada visível, 1 = tela toda.
const recorteDiagonal = (p: number) => {
  const x1 = p * 160;
  const x2 = x1 - 60;
  return `polygon(0% 0%, ${x1}% 0%, ${x2}% 100%, 0% 100%)`;
};

type EfeitoEntrada = { estilo: React.CSSProperties; camadaFrente?: React.ReactNode; faixa?: React.CSSProperties };

const efeitoEntrada = (tipo: TipoTransicao, p: number): EfeitoEntrada => {
  const e = suave(p);
  switch (tipo) {
    case "flashWipe":
      return {
        estilo: { clipPath: recorteDiagonal(e) },
        camadaFrente: (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 30% 30%, ${comAlfa(COR.dourado, 0.85)} 0%, ${comAlfa(
                COR.dourado,
                0.3,
              )} 45%, ${comAlfa(COR.dourado, 0)} 80%)`,
              opacity: interpolate(p, [0, 0.35, 1], [0, 0.75, 0], clamp),
              mixBlendMode: "screen",
            }}
          />
        ),
      };
    case "empurraoVertical":
      return { estilo: { transform: `translateY(${(1 - e) * 100}%)` } };
    case "zoomAtravessa":
      return { estilo: { opacity: e, transform: `scale(${1.25 - 0.25 * e})` } };
    case "deslizeHorizontal":
      return { estilo: { transform: `translateX(${(1 - e) * 100}%)` } };
    case "mascaraCircular":
      // 90% cobre até os cantos de baixo (o centro está a 45% da altura).
      return { estilo: p >= 1 ? {} : { clipPath: `circle(${e * 90}% at 50% 45%)` } };
    case "wipeDiagonal":
      // A faixa verde-escura vai na frente da foto nova.
      return {
        estilo: { clipPath: recorteDiagonal(Math.max(0, e * 1.2 - 0.2)) },
        faixa: { clipPath: recorteDiagonal(Math.min(1, e * 1.2)), backgroundColor: COR.fundo },
      };
    case "fusaoBrilho":
      return {
        estilo: { opacity: e },
        camadaFrente: (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 45%, ${comAlfa(COR.dourado, 0.6)} 0%, ${comAlfa(
                COR.dourado,
                0,
              )} 65%)`,
              opacity: interpolate(p, [0, 0.5, 1], [0, 0.7, 0], clamp),
              mixBlendMode: "screen",
            }}
          />
        ),
      };
    default:
      return { estilo: {} };
  }
};

// O que acontece com a cena ANTIGA enquanto a seguinte entra.
const efeitoSaida = (tipoSeguinte: TipoTransicao | undefined, p: number): React.CSSProperties => {
  const e = suave(p);
  switch (tipoSeguinte) {
    case "empurraoVertical":
      return { transform: `translateY(${-e * 35}%)` };
    case "deslizeHorizontal":
      return { transform: `translateX(${-e * 35}%)` };
    case "zoomAtravessa":
      return { transform: `scale(${1 + e * 0.6})` };
    default:
      return {};
  }
};

const CenaUnica: React.FC<{
  cena: Cena;
  duracaoPropria: number; // frames em que a cena é a principal
  framesSaida: number; // transição da cena seguinte (a antiga fica por baixo)
  transicaoSeguinte?: TipoTransicao;
}> = ({ cena, duracaoPropria, framesSaida, transicaoSeguinte }) => {
  const frame = useCurrentFrame();
  const total = duracaoPropria + framesSaida;
  const t = interpolate(frame, [0, total], [0, 1], clamp);
  const pEntrada = cena.framesTransicao > 0 ? interpolate(frame, [0, cena.framesTransicao], [0, 1], clamp) : 1;
  const pSaida = framesSaida > 0 ? interpolate(frame, [duracaoPropria, total], [0, 1], clamp) : 0;
  const entrada = efeitoEntrada(cena.transicao, pEntrada);
  const saida = efeitoSaida(transicaoSeguinte, pSaida);
  const brilhoLogo = cena.brilhoLogo ? interpolate(frame, [10, 50], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill>
      {entrada.faixa ? <AbsoluteFill style={entrada.faixa} /> : null}
      <AbsoluteFill style={{ ...entrada.estilo, overflow: "hidden" }}>
        <AbsoluteFill style={{ ...saida }}>
          <Img
            src={staticFile(cena.arquivo)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `50% ${cena.posicaoY}%`,
              filter: "saturate(0.85) contrast(1.05)",
              transform: transformMovimento(cena.movimento, t),
            }}
          />
          {/* Escurecimento chapado + reforço em alfa atrás da pílula e do texto. */}
          <AbsoluteFill style={{ backgroundColor: COR.fundo, opacity: cena.escurecimento }} />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${comAlfa(COR.fundo, 0.35)} 0%, ${comAlfa(
                COR.fundo,
                0,
              )} 22%, ${comAlfa(COR.fundo, 0.12)} 35%, ${comAlfa(COR.fundo, 0.12)} 65%, ${comAlfa(
                COR.fundo,
                0.3,
              )} 100%)`,
            }}
          />
          {cena.raiosDeLuz ? <RaiosDeLuz /> : null}
          {cena.particulas ? <Particulas semente={cena.arquivo} opacidade={0.8} /> : null}
          {cena.brilhoLogo ? <BrilhoRadial x={0.5} y={0.33} raio={0.6} intensidade={brilhoLogo} /> : null}
        </AbsoluteFill>
      </AbsoluteFill>
      {entrada.camadaFrente ?? null}
    </AbsoluteFill>
  );
};

export const FundoCenas: React.FC<{ cenas: Cena[]; linha: LinhaDoTempo }> = ({ cenas, linha }) => {
  return (
    <>
      {cenas.map((cena, i) => {
        const de = acharBloco(linha, cena.blocoInicial).inicio;
        const ultimo = acharBloco(linha, cena.blocoFinal);
        const ate = ultimo.inicio + ultimo.duracao;
        const seguinte = cenas[i + 1];
        const framesSaida = seguinte ? seguinte.framesTransicao : 0;
        return (
          <Sequence
            key={cena.arquivo}
            name={`Cena ${i + 1}: ${cena.arquivo.split("/").pop()}`}
            from={de}
            durationInFrames={ate - de + framesSaida}
          >
            <CenaUnica
              cena={cena}
              duracaoPropria={ate - de}
              framesSaida={framesSaida}
              transicaoSeguinte={seguinte?.transicao}
            />
          </Sequence>
        );
      })}
    </>
  );
};
