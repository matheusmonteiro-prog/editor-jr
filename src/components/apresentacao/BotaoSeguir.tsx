import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../utils/clamp";
import { COR, ESPACO_ROTULO, FONTE_ROTULO } from "./marca";

// Botão genérico de seguir (rodada 9, grupo "Siga" do bloco 08), sem imitar a interface de nenhuma
// rede: pílula dourada "SEGUIR" com um ícone de mais. No `toque` leva um toque (escala 1 → 0,92 → 1)
// e vira "SEGUINDO": pílula creme com um ícone de check. Inter SemiBold, caixa alta com espaçamento. Cores da marca: dourado #EFAF20 e creme
// #F5F0E6, texto #0F2A1D. Vai dentro do GrupoCaindo, que cuida da entrada e da saída.

const FRAMES_TOQUE = 5; // 2 para apertar, 3 para soltar
const FRAME_TROCA = 2; // a pílula troca de estado quando está mais apertada

type Props = {
  y: number; // centro, fração da altura
  toque: number; // frame (relativo à Sequence) em que o toque começa
  tamanho?: number; // fração da largura (corpo da letra)
};

export const BotaoSeguir: React.FC<Props> = ({ y, toque, tamanho = 0.042 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fontSize = width * tamanho;
  const seguindo = frame - toque >= FRAME_TROCA;
  const escala = interpolate(frame - toque, [0, 2, FRAMES_TOQUE], [1, 0.92, 1], clamp);
  const icone = fontSize * 1.05;
  const traco = Math.max(2, fontSize * 0.11);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: height * y,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) scale(${escala})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: fontSize * 0.45,
          padding: `${fontSize * 0.55}px ${fontSize * 1.1}px`,
          borderRadius: fontSize * 2,
          backgroundColor: seguindo ? COR.creme : COR.dourado,
          color: COR.fundo,
          fontFamily: FONTE_ROTULO,
          fontWeight: 600,
          letterSpacing: ESPACO_ROTULO,
          fontSize,
          lineHeight: 1,
        }}
      >
        <svg width={icone} height={icone} viewBox="0 0 24 24" fill="none" stroke={COR.fundo} strokeWidth={traco * (24 / icone)} strokeLinecap="round" strokeLinejoin="round">
          {seguindo ? <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" /> : <path d="M12 4.5 V19.5 M4.5 12 H19.5" />}
        </svg>
        <span>{seguindo ? "SEGUINDO" : "SEGUIR"}</span>
      </div>
    </div>
  );
};
