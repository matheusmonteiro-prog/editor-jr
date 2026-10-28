import React from "react";
import { clamp } from "../../utils/clamp";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Ativo } from "../../dados/apresentacao";
import { COR, ESPACO_ROTULO, FONTE_ROTULO, comAlfa } from "./marca";

// Bloco 06 (rodada 6): lista de ativos de REFERÊNCIA rolando de baixo para cima, nítida.
// Cada linha para um instante no centro, ganha um leve zoom e uma varredura dourada passa por
// ela. Depois da última linha, a lista vira textura (fraca e desfocada) atrás do contador.
// Só logo, ticker e nome: NUNCA preço ou "valor de compra" na tela.

type Props = {
  ativos: Ativo[];
  pasta: string; // pasta dos logos, relativa a public/
  primeiroNoCentro: number; // frame em que a 1ª linha chega ao centro
  ultimoNoCentro: number; // frame em que a última linha chega ao centro (depois: textura)
  focoY?: number; // fração da altura da linha em foco
};

// Rodada 8 (15 ativos no mesmo tempo): parada um pouco menor (era 0,55), linhas mais próximas
// (passo 0,13 da largura; era 0,155) e mais linhas visíveis ao mesmo tempo (±5; eram ±4).
const PARADA = 0.45; // fração do tempo de cada linha em que ela fica parada no centro
const LINHAS_VISIVEIS = 5; // para cima e para baixo da linha do centro

export const ListaAtivos: React.FC<Props> = ({ ativos, pasta, primeiroNoCentro, ultimoNoCentro, focoY = 0.56 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const n = ativos.length;
  if (n === 0) return null;

  const passo = width * 0.13; // distância entre linhas
  const framesPorLinha = n > 1 ? (ultimoNoCentro - primeiroNoCentro) / (n - 1) : 20;

  // Posição da rolagem em "linhas": k = n significa a linha n no centro.
  const k = (frame - primeiroNoCentro) / framesPorLinha;
  let pos: number;
  if (frame <= ultimoNoCentro) {
    const base = Math.floor(k);
    const anda = interpolate(k - base, [PARADA, 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    pos = base + anda;
  } else {
    // Textura: segue rolando devagar, em loop.
    pos = n - 1 + (frame - ultimoNoCentro) / (framesPorLinha * 2);
  }

  const textura = interpolate(frame, [ultimoNoCentro + 4, ultimoNoCentro + 22], [0, 1], clamp);
  const entrada = interpolate(frame, [0, 8], [0, 1], clamp);
  const tile = passo * 0.66;
  const alturaLinha = passo * 0.82;
  const larguraLinha = width * 0.8;
  const borda = Math.max(2, width * 0.0024);

  const linhas: React.ReactNode[] = [];
  for (let r = Math.max(0, Math.floor(pos) - LINHAS_VISIVEIS); r <= Math.floor(pos) + LINHAS_VISIVEIS; r++) {
    // Na fase nítida a lista acaba no último ativo; na textura, repete.
    if (textura === 0 && r >= n) continue;
    const ativo = ativos[r % n];
    const dist = Math.abs(r - pos);
    const foco = Math.max(0, 1 - dist) * (1 - textura);
    const chegada = primeiroNoCentro + r * framesPorLinha;
    const varredura = interpolate(frame - chegada, [-2, 9], [-0.4, 1.1], clamp);
    const y = height * focoY + (r - pos) * passo;
    linhas.push(
      <div
        key={r}
        style={{
          position: "absolute",
          left: (width - larguraLinha) / 2,
          top: y - alturaLinha / 2,
          width: larguraLinha,
          height: alturaLinha,
          display: "flex",
          alignItems: "center",
          gap: width * 0.04,
          padding: `0 ${width * 0.035}px`,
          boxSizing: "border-box",
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: comAlfa(COR.fundo, 0.9),
          border: `${borda}px solid ${comAlfa(foco > 0 ? COR.dourado : COR.creme, foco > 0 ? 0.25 + 0.75 * foco : 0.14)}`,
          opacity: interpolate(dist, [0, 1, LINHAS_VISIVEIS - 1, LINHAS_VISIVEIS], [1, 0.7, 0.3, 0], clamp),
          transform: `scale(${1 + 0.08 * foco})`,
        }}
      >
        {/* Varredura dourada: uma faixa passa da esquerda para a direita quando a linha chega ao centro. */}
        {foco > 0 ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${varredura * 100 - 35}%`,
              width: "35%",
              background: `linear-gradient(90deg, ${comAlfa(COR.dourado, 0)} 0%, ${comAlfa(COR.dourado, 0.3)} 60%, ${comAlfa(
                COR.dourado,
                0,
              )} 100%)`,
              opacity: foco,
            }}
          />
        ) : null}
        {/* Tile do logo: creme, raio de 28 px. Os PNGs têm margem branca de tamanho variável; com
            "multiply" o branco vira o creme do tile e a margem some (isolation: só dentro do tile). */}
        <div
          style={{
            width: tile,
            height: tile,
            borderRadius: 28,
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: COR.creme,
            isolation: "isolate",
            padding: tile * 0.06,
            boxSizing: "border-box",
          }}
        >
          <Img
            src={staticFile(`${pasta}/${ativo.logo}`)}
            style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: width * 0.004, position: "relative" }}>
          <span
            style={{
              fontFamily: FONTE_ROTULO,
              fontWeight: 600,
              letterSpacing: ESPACO_ROTULO,
              fontSize: width * 0.058,
              lineHeight: 1,
              color: COR.creme,
            }}
          >
            {ativo.ticker.toLocaleUpperCase("pt-BR")}
          </span>
          <span
            style={{
              fontFamily: FONTE_ROTULO,
              fontWeight: 600,
              letterSpacing: ESPACO_ROTULO,
              fontSize: width * 0.03,
              lineHeight: 1.1,
              color: comAlfa(COR.creme, 0.7),
              whiteSpace: "nowrap",
            }}
          >
            {ativo.nome.toLocaleUpperCase("pt-BR")}
          </span>
        </div>
      </div>,
    );
  }

  // Rodada 8: área visível um pouco maior (era 37% a 82%).
  const mascara = "linear-gradient(180deg, transparent 0%, transparent 29%, #000 35%, #000 86%, transparent 97%)";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: entrada * interpolate(textura, [0, 1], [1, 0.22]),
        filter: textura > 0 ? `blur(${textura * 6}px)` : undefined,
        WebkitMaskImage: mascara,
        maskImage: mascara,
      }}
    >
      {linhas}
    </div>
  );
};
