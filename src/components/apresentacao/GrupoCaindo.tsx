import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR, TIPOGRAFIA_CTA } from "./marca";

// Grupo do CTA do bloco 08 (rodada 9): um texto em CAIXA ALTA (com UMA expressão em dourado) mais o que
// vem junto (ícone, botão), tudo num bloco só. Tipografia pendente de aprovação do JR (marca.ts).
// - Entrada: cai de cima (-140 px → 0) com mola curta e um pequeno quique.
// - Saída: cai para baixo (0 → +180 px, ease-in) e some nos últimos frames.
// Os filhos (ícones) são desenhados em coordenadas da tela inteira e acompanham o movimento do grupo.

export const FRAMES_SAIDA_GRUPO = 8;
const QUEDA_ENTRADA = 140;
const QUEDA_SAIDA = 180;

type Props = {
  texto: string;
  destaque?: string; // expressão que fica dourada (exatamente como aparece em `texto`, sem maiúsculas)
  inicio: number; // frame (relativo à Sequence) em que começa a cair
  saida: number; // frame em que começa a sair (dura FRAMES_SAIDA_GRUPO)
  top: number; // fração da altura (topo do texto)
  tamanho: number; // fração da largura (corpo da letra)
  larguraMax?: number; // fração da largura
  espaco?: string; // letter-spacing (padrão: o da fonte)
  framesSaida?: number; // duração da saída (padrão FRAMES_SAIDA_GRUPO)
  saidaPara?: "baixo" | "cima"; // "cima" = sobe e some (usado no fecho, para não cair no logo)
  children?: React.ReactNode;
};

export const GrupoCaindo: React.FC<Props> = ({
  texto,
  destaque,
  inicio,
  saida,
  top,
  tamanho,
  larguraMax = 0.9,
  espaco,
  framesSaida = FRAMES_SAIDA_GRUPO,
  saidaPara = "baixo",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (frame < inicio || frame > saida + framesSaida) return null;
  const fonte = TIPOGRAFIA_CTA.texto;

  // Entrada: mola curta com quique leve (damping 10).
  const p = spring({ frame: frame - inicio, fps, config: { damping: 10, stiffness: 160, mass: 0.8 }, durationInFrames: 12 });
  const yEntrada = (1 - p) * -QUEDA_ENTRADA;
  const opEntrada = interpolate(frame - inicio, [0, 4], [0, 1], clamp);

  // Saída: ease-in até +180 px; o fade acontece só nos últimos 3 frames.
  const s = interpolate(frame - saida, [0, framesSaida], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const opSaida = interpolate(frame - saida, [framesSaida - 3, framesSaida], [1, 0], clamp);
  const ySaida = saidaPara === "baixo" ? s * QUEDA_SAIDA : -s * 70;

  // O tamanho se ajusta para a MAIOR linha caber na largura (Anton é estreita, mas "NENHUMA NOVIDADE" é longa).
  const alto = texto.toLocaleUpperCase("pt-BR");
  const alvo = destaque ? destaque.toLocaleUpperCase("pt-BR") : "";
  const maiorLinha = Math.max(...alto.split("\n").map((l) => l.length));
  const fontSize = Math.min(width * tamanho, (width * larguraMax) / (maiorLinha * fonte.larguraEm));
  const partes = alvo && alto.includes(alvo) ? alto.split(alvo) : [alto];

  return (
    <AbsoluteFill style={{ opacity: opEntrada * opSaida, transform: `translateY(${yEntrada + ySaida}px)` }}>
      <div
        style={{
          position: "absolute",
          top: height * top,
          left: (width * (1 - larguraMax)) / 2,
          width: width * larguraMax,
          textAlign: "center",
          fontFamily: fonte.familia,
          fontWeight: fonte.peso,
          letterSpacing: espaco ?? fonte.espaco,
          fontSize,
          lineHeight: 1.08,
          color: COR.creme,
        }}
      >
        {partes.length === 2 ? (
          <>
            {partes[0]}
            <span style={{ color: COR.dourado }}>{alvo}</span>
            {partes[1]}
          </>
        ) : (
          alto
        )}
      </div>
      {children}
    </AbsoluteFill>
  );
};
