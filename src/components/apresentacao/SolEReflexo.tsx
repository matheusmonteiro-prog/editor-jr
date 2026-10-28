import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR, comAlfa } from "./marca";
import { BrilhoRadial } from "./BrilhoRadial";

// Vida no fundo da cena 2 (moedas e solo), rodada 9. PENDENTE DE APROVAÇÃO DO JR: o brilho do sol e o
// reflexo nas moedas são exceções pedidas pelo Matheus ao padrão de marca.
// - Brilho do sol "respirando" devagar: a opacidade vai e volta entre 0,15 e 0,35 (ciclo de ~5 s).
// - Reflexo: uma faixa estreita e inclinada de luz passa pela região das moedas a cada ~2,5 s.
// Só gradientes lisos e transform: nenhum blur nem sombra por frame.

const SOL = { x: 0.8, y: 0.365 }; // onde o sol está na foto cena-2-moedas.jpg
const CICLO_BRILHO_SEGUNDOS = 5;
const PERIODO_REFLEXO_SEGUNDOS = 2.5;
const REGIAO_MOEDAS = { topo: 0.4, altura: 0.32 }; // frações da altura

export const SolEReflexo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Brilho: 0,25 ± 0,10 → entre 0,15 e 0,35.
  const respira = 0.25 + 0.1 * Math.sin((frame / (CICLO_BRILHO_SEGUNDOS * fps)) * Math.PI * 2);

  // Reflexo: percorre a largura em ~1 s e espera o resto do período.
  const periodo = PERIODO_REFLEXO_SEGUNDOS * fps;
  const faseReflexo = (frame % periodo) / fps; // segundos desde o início do ciclo
  const progresso = interpolate(faseReflexo, [0, 1], [0, 1], clamp);
  const larguraFaixa = width * 0.09;
  const deslocamento = interpolate(progresso, [0, 1], [-larguraFaixa * 2, width + larguraFaixa]);
  const intensidade = interpolate(progresso, [0, 0.2, 0.8, 1], [0, 1, 1, 0], clamp);

  return (
    <>
      <BrilhoRadial x={SOL.x} y={SOL.y} raio={0.55} intensidade={respira} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: height * REGIAO_MOEDAS.topo,
          width: "100%",
          height: height * REGIAO_MOEDAS.altura,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -height * 0.05,
            height: height * (REGIAO_MOEDAS.altura + 0.1),
            width: larguraFaixa,
            left: deslocamento,
            transform: "skewX(-20deg)",
            background: `linear-gradient(90deg, ${comAlfa(COR.creme, 0)} 0%, ${comAlfa(COR.creme, 0.55)} 50%, ${comAlfa(COR.creme, 0)} 100%)`,
            opacity: intensidade,
            mixBlendMode: "screen",
          }}
        />
      </div>
    </>
  );
};
