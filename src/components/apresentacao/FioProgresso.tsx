import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COR, comAlfa } from "./marca";

// Fio dourado de 2 px (em 1920 de altura) no topo da zona segura, enchendo
// do início ao fim do vídeo.
export const FioProgresso: React.FC<{ top?: number; margem?: number }> = ({
  top = 0.08,
  margem = 0.06,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const progresso = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const espessura = Math.max(1, height * (2 / 1920));
  const largura = width * (1 - margem * 2);

  return (
    <div
      style={{
        position: "absolute",
        top: height * top,
        left: width * margem,
        width: largura,
        height: espessura,
        backgroundColor: comAlfa(COR.creme, 0.15),
      }}
    >
      <div
        style={{
          width: largura * progresso,
          height: "100%",
          backgroundColor: COR.dourado,
          boxShadow: `0 0 ${espessura * 4}px ${comAlfa(COR.dourado, 0.6)}`,
        }}
      />
    </div>
  );
};
