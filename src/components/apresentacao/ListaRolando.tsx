import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Lista de ativos rolando no fundo, bem desfocada. Só formas genéricas:
// uma barra no lugar do nome, estrelas e um check. Nenhum nome de ativo,
// nenhum ticker e nenhum número: é textura de movimento, não informação.
// Rolagem contínua na vertical; duas cópias empilhadas para emendar sem pulo.

type Props = {
  opacidade?: number;
  desfoque?: number; // px
  velocidade?: number; // fração da altura de uma linha por frame
  linhas?: number; // linhas por ciclo
  semente?: string;
};

const ESTRELAS = 5;

const Estrela: React.FC<{ lado: number; acesa: boolean }> = ({ lado, acesa }) => (
  <svg width={lado} height={lado} viewBox="0 0 24 24">
    <polygon
      points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"
      fill={acesa ? COR.dourado : "none"}
      stroke={COR.dourado}
      strokeWidth={1.4}
      strokeOpacity={acesa ? 1 : 0.5}
    />
  </svg>
);

const Check: React.FC<{ lado: number }> = ({ lado }) => (
  <svg width={lado} height={lado} viewBox="0 0 24 24">
    <path
      d="M 4 12.5 L 9.5 18 L 20 6"
      fill="none"
      stroke={COR.creme}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ListaRolando: React.FC<Props> = ({
  opacidade = 0.42,
  desfoque = 7,
  velocidade = 0.055,
  linhas = 16,
  semente = "lista",
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const alturaLinha = width * 0.13;
  const ciclo = alturaLinha * linhas;
  const deslocamento = (frame * velocidade * alturaLinha) % ciclo;

  const uma = (chave: string) => (
    <div key={chave} style={{ height: ciclo }}>
      {new Array(linhas).fill(0).map((_, i) => {
        const larguraNome = 0.26 + random(`${semente}-n-${i}`) * 0.3; // fração da largura
        const acesas = 3 + Math.floor(random(`${semente}-e-${i}`) * 3); // 3 a 5 estrelas acesas
        return (
          <div
            key={i}
            style={{
              height: alturaLinha,
              display: "flex",
              alignItems: "center",
              gap: width * 0.03,
              padding: `0 ${width * 0.07}px`,
              borderBottom: `${Math.max(1, width * 0.0014)}px solid ${comAlfa(COR.creme, 0.18)}`,
            }}
          >
            <div
              style={{
                width: width * larguraNome,
                height: alturaLinha * 0.26,
                borderRadius: alturaLinha,
                backgroundColor: comAlfa(COR.creme, 0.75),
              }}
            />
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: width * 0.008 }}>
              {new Array(ESTRELAS).fill(0).map((__, k) => (
                <Estrela key={k} lado={width * 0.04} acesa={k < acesas} />
              ))}
            </div>
            <Check lado={width * 0.05} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: opacidade,
        filter: `blur(${desfoque}px)`,
        // Some nas pontas de cima e de baixo (máscara só em alfa).
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: -deslocamento, height: ciclo * 2 }}>
        {uma("a")}
        {uma("b")}
      </div>
    </div>
  );
};
