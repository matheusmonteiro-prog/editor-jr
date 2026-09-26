import React from "react";
import {
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const imagemFadeSchema = z.object({
  src: z.string(),
  corFundo: zColor(),
  larguraPorcentagem: z.number().min(1).max(100),
  frameEntrada: z.number().min(0),
});

type Props = z.infer<typeof imagemFadeSchema>;

export const ImagemFade: React.FC<Props> = ({
  src,
  corFundo,
  larguraPorcentagem,
  frameEntrada,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, frameEntrada], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <Sequence name="ImagemFade">
      <div
        style={{
          flex: 1,
          backgroundColor: corFundo,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ opacity, width: `${larguraPorcentagem}%` }}
        />
      </div>
    </Sequence>
  );
};
