import React from "react";
import { interpolate, interpolateColors, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Grade de cubos baixinhos em CSS 3D (sem biblioteca), num plano inclinado
// visto de câmera baixa. Os cubos começam apagados e acendem numa ONDA
// diagonal de canto a canto, cada um pulsando para a cor acesa.
// Sem número dentro dos cubos.
//
// Criado para o vídeo de apresentação (bloco 06: "+400 ativos"), que tem
// exceção visual de 3D autorizada em 19/10/2026.

export const gradeAtivos3DSchema = z.object({
  colunas: z.number().int().min(1).max(40).default(20),
  linhas: z.number().int().min(1).max(40).default(20),
  inclinacao: z.number().min(0).max(80).default(58), // graus no eixo X
  giro: z.number().min(-45).max(45).default(-18), // graus no eixo Z
  frameInicio: z.number().min(0).default(0), // começa a onda
  // Quantos frames ANTES da onda a grade aparece (apagada). 12 = aparece e já acende.
  framesAntesDaOnda: z.number().min(0).default(12),
  duracaoOnda: z.number().min(1).default(40), // frames do 1º ao último cubo
  corApagado: zColor().default("#0F2A1D"),
  corAceso: zColor().default("#F5F0E6"),
  corBorda: zColor().default("#F5F0E6"),
  largura: z.number().min(0.1).max(1.5).default(0.95), // fração da largura do vídeo
  centroY: z.number().min(0).max(1).default(0.4), // fração da altura
  alturaCubo: z.number().min(0.05).max(1).default(0.28), // fração do lado da célula
  duracaoFrames: z.number().min(10).default(150),
  framesSaida: z.number().min(1).default(12),
  // Opcional: padrão transparente, para não tampar o fundo quando é camada.
  corFundo: zColor().optional(),
});

// z.input: os campos com .default() ficam opcionais para quem usa o
// componente direto (os padrões estão repetidos na desestruturação abaixo).
type Props = z.input<typeof gradeAtivos3DSchema>;

const DURACAO_PULSO = 10;

export const GradeAtivos3D: React.FC<Props> = ({
  colunas = 20,
  linhas = 20,
  inclinacao = 58,
  giro = -18,
  frameInicio = 0,
  framesAntesDaOnda = 12,
  duracaoOnda = 40,
  corApagado = "#0F2A1D",
  corAceso = "#F5F0E6",
  corBorda = "#F5F0E6",
  largura = 0.95,
  centroY = 0.4,
  alturaCubo = 0.28,
  duracaoFrames = 150,
  framesSaida = 12,
  corFundo = "transparent",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const lado = width * largura;
  const celula = lado / colunas;
  const cubo = celula * 0.8;
  const alturaBase = cubo * alturaCubo;
  const altoGrade = celula * linhas;
  const maxDiagonal = Math.max(1, colunas - 1 + linhas - 1);

  const aparece = frameInicio - framesAntesDaOnda;
  const entrada = interpolate(frame - aparece, [0, 12], [0, 1], clamp);
  const saida = interpolate(frame, [duracaoFrames - framesSaida, duracaoFrames], [1, 0], clamp);
  const borda = Math.max(1, width * 0.0011);

  const cubos: React.ReactNode[] = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      // Onda diagonal: canto (0,0) primeiro, canto oposto por último.
      const atraso = ((c + l) / maxDiagonal) * duracaoOnda;
      const t = frame - frameInicio - atraso;
      const aceso = interpolate(t, [0, DURACAO_PULSO * 0.5], [0, 1], clamp);
      const pulso = interpolate(t, [0, DURACAO_PULSO * 0.4, DURACAO_PULSO], [1, 2.4, 1], clamp);
      const h = alturaBase * pulso;
      const corTopo = interpolateColors(aceso, [0, 1], [corApagado, corAceso]);
      const alfaBorda = interpolate(aceso, [0, 1], [0.28, 0.6]);

      cubos.push(
        <div
          key={`${l}-${c}`}
          style={{
            position: "absolute",
            left: c * celula + (celula - cubo) / 2,
            top: l * celula + (celula - cubo) / 2,
            width: cubo,
            height: cubo,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Frente (lado virado para a câmera): mais escura, luz baixa. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: cubo,
              height: h,
              transformOrigin: "50% 100%",
              transform: "rotateX(-90deg)",
              backgroundColor: corTopo,
              filter: "brightness(0.55)",
              outline: `${borda}px solid ${corBorda}`,
              outlineOffset: -borda,
              opacity: 0.95,
            }}
          />
          {/* Lateral direita: meio-tom. */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: h,
              height: cubo,
              transformOrigin: "100% 50%",
              transform: "rotateY(90deg)",
              backgroundColor: corTopo,
              filter: "brightness(0.75)",
            }}
          />
          {/* Topo. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(${h}px)`,
              backgroundColor: corTopo,
              border: `${borda}px solid rgba(245, 240, 230, ${alfaBorda})`,
              boxSizing: "border-box",
            }}
          />
        </div>,
      );
    }
  }

  return (
    <Sequence name="GradeAtivos3D">
      <div style={{ position: "absolute", inset: 0, backgroundColor: corFundo, opacity: entrada * saida }}>
        <div
          style={{
            position: "absolute",
            left: (width - lado) / 2,
            top: height * centroY - altoGrade / 2,
            width: lado,
            height: altoGrade,
            perspective: width * 2.2,
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `rotateX(${inclinacao}deg) rotateZ(${giro}deg)`,
            }}
          >
            {cubos}
          </div>
        </div>
      </div>
    </Sequence>
  );
};
