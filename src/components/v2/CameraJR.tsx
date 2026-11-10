import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { tipoMidiaSchema } from "./kitV3";

// Kit v3, seção 4.15 (pedido do Matheus em 04/11, A-007): a câmera do JR com o FUNDO DESFOCADO,
// para o foco ficar nele. Duas camadas do mesmo vídeo: a de baixo desfocada e um pouco mais
// escura; a de cima nítida, só dentro dos "focos" (elipses suaves em volta da cabeça e do corpo).
// A câmera é parada, então focos fixos funcionam; se o JR sair muito do lugar, a borda dele
// pode desfocar (ajustar os focos).
// Também faz "remendos": cobre um retângulo (ex.: logo antigo gravado na fonte) esticando uma
// coluna limpa vizinha da própria imagem. Só serve sobre parede lisa.
// Coordenadas sempre em fração do quadro da FONTE (0 a 1), mesmo com recorte.

const focoSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  raioX: z.number().min(0.01).max(1),
  raioY: z.number().min(0.01).max(1),
});
const remendoSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  largura: z.number().min(0.01).max(1),
  altura: z.number().min(0.01).max(1),
  colunaX: z.number().min(0).max(1),
});
const veuSchema = z.object({
  // Pode passar da borda da tela (x < 0 ou x + largura > 1), para o degradê ficar fora do quadro.
  x: z.number().min(-0.5).max(1),
  y: z.number().min(0).max(1),
  largura: z.number().min(0.01).max(2),
  altura: z.number().min(0.01).max(1),
  // "elipse" = bordas bem suaves em todos os lados (some embaixo de uma sombra, sem virar faixa).
  forma: z.enum(["retangulo", "elipse"]).default("retangulo"),
  // Retângulo: quanto das bordas (fração do véu) fica em degradê. Horizontal e vertical.
  suaveX: z.number().min(0).max(0.5).default(0.04),
  suaveY: z.number().min(0).max(0.5).default(0.22),
});
export type FocoCamera = z.infer<typeof focoSchema>;
export type VeuCamera = z.infer<typeof veuSchema>;
// Placa: cobre um retângulo com o MESMO retângulo de uma imagem limpa da mesma câmera (quadro
// inteiro, tirado num momento sem a arte antiga). Só serve com câmera parada. Bordas suaves.
// 04/11 (A-015): substitui o véu de desfoque na janelinha, que virava um borrão.
const placaSchema = z.object({
  src: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  largura: z.number().min(0.01).max(1),
  altura: z.number().min(0.01).max(1),
});
export type PlacaCamera = z.infer<typeof placaSchema>;
export type RemendoCamera = z.infer<typeof remendoSchema>;

// Focos padrão para o JR no centro do quadro (gravação de 28/10): cabeça com chapéu e tronco.
// 04/11 (A-009): focos maiores, para a roupa inteira ficar nítida (antes o desfoque pegava nela).
export const FOCOS_JR_CENTRO: FocoCamera[] = [
  { x: 0.5, y: 0.27, raioX: 0.3, raioY: 0.42 },
  { x: 0.5, y: 0.86, raioX: 0.56, raioY: 0.56 },
];
// Só a cabeça (janelinha: o resto desfoca, inclusive textos antigos gravados no peito).
export const FOCOS_JR_CABECA: FocoCamera[] = [{ x: 0.5, y: 0.28, raioX: 0.26, raioY: 0.36 }];

export const cameraJRSchema = z.object({
  src: z.string().default("images/kit-v3/jr-quadro-teste.jpg"),
  tipo: tipoMidiaSchema.default("imagem"),
  mudo: z.boolean().default(true),
  inicio: z.number().min(0).default(0),
  // Desfoque do fundo em fração da largura (0 = sem desfoque). Padrão LEVE desde 04/11 (A-009,
  // "uns 20%"): 0.0015 ≈ 3 px em 1920 (antes 0.006 ≈ 11 px).
  desfoque: z.number().min(0).max(0.03).default(0.0015),
  // Quanto o fundo escurece (0 a 0.6). Leve: 0.04.
  escurecerFundo: z.number().min(0).max(0.6).default(0.04),
  focos: z.array(focoSchema).default(FOCOS_JR_CENTRO),
  remendos: z.array(remendoSchema).default([]),
  // Véus: retângulos com desfoque FORTE (ex.: texto antigo gravado no peito do JR), por cima de tudo.
  veus: z.array(veuSchema).default([]),
  placas: z.array(placaSchema).default([]),
});

type Props = z.input<typeof cameraJRSchema> & {
  // Recorte da fonte (igual ao MidiaJR). Sem recorte = imagem inteira.
  recorte?: { x: number; y: number; largura: number };
  // Largura em px da caixa onde a câmera aparece (para o desfoque acompanhar o tamanho).
  larguraCaixa?: number;
};

const mascara = (focos: FocoCamera[]) =>
  focos
    .map(
      (f) =>
        `radial-gradient(ellipse ${f.raioX * 100}% ${f.raioY * 100}% at ${f.x * 100}% ${f.y * 100}%, #000 0%, #000 72%, transparent 100%)`,
    )
    .join(", ");

export const CameraJR: React.FC<Props> = ({
  src = "images/kit-v3/jr-quadro-teste.jpg",
  tipo = "imagem",
  mudo = true,
  inicio = 0,
  desfoque = 0.0015,
  escurecerFundo = 0.04,
  focos = FOCOS_JR_CENTRO,
  remendos = [],
  veus = [],
  placas = [],
  recorte,
  larguraCaixa,
}) => {
  const { width: W } = useVideoConfig();
  const caixaPx = larguraCaixa ?? W;
  const r = recorte ?? { x: 0, y: 0, largura: 1 };
  // Tamanho do quadro inteiro da fonte, na tela: o desfoque é proporcional a ele.
  const quadroPx = caixaPx / r.largura;
  const blurPx = desfoque * quadroPx;

  const midia = (estilo: React.CSSProperties, mute: boolean) =>
    tipo === "video" ? (
      <OffthreadVideo
        src={staticFile(src)}
        muted={mute}
        trimBefore={inicio > 0 ? inicio : undefined}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...estilo }}
      />
    ) : (
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...estilo }} />
    );

  // Quadro inteiro da fonte, posicionado para que o recorte preencha a caixa.
  const quadro: React.CSSProperties = {
    position: "absolute",
    width: `${100 / r.largura}%`,
    height: `${100 / r.largura}%`,
    left: `${(-r.x / r.largura) * 100}%`,
    top: `${(-r.y / r.largura) * 100}%`,
  };

  const remendosEl = remendos.map((p, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        width: `${p.largura * 100}%`,
        height: `${p.altura * 100}%`,
        overflow: "hidden",
        filter: `blur(${Math.max(1, quadroPx * 0.002)}px)`,
      }}
    >
      {/* O quadro inteiro, esticado na horizontal em volta da coluna limpa. */}
      <div
        style={{
          position: "absolute",
          width: `${100 / p.largura}%`,
          height: `${100 / p.altura}%`,
          left: `${(-p.x / p.largura) * 100}%`,
          top: `${(-p.y / p.altura) * 100}%`,
          transform: "scaleX(300)",
          transformOrigin: `${p.colunaX * 100}% 50%`,
        }}
      >
        {midia({}, true)}
      </div>
    </div>
  ));

  return (
    <Sequence name="CameraJR">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div style={quadro}>
          {/* Camada de baixo: fundo (desfocado, se houver desfoque) + remendos */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: blurPx > 0.3 ? `blur(${blurPx}px) brightness(${1 - escurecerFundo})` : undefined,
              // Leve ampliação só na camada desfocada: esconde a borda clara que o desfoque cria
              // nas beiradas do quadro. A origem fica no JR, onde as duas camadas se encontram.
              transform: blurPx > 0.3 ? "scale(1.012)" : undefined,
              transformOrigin: focos.length > 0 ? `${focos[0].x * 100}% ${focos[0].y * 100}%` : "50% 50%",
            }}
          >
            {midia({}, mudo)}
            {remendosEl}
          </div>
          {/* Camada de cima: o JR nítido, só dentro dos focos */}
          {blurPx > 0.3 && focos.length > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                WebkitMaskImage: mascara(focos),
                maskImage: mascara(focos),
              }}
            >
              {midia({}, true)}
            </div>
          ) : null}
          {placas.map((p, i) => (
            <div
              key={`placa-${i}`}
              style={{
                position: "absolute",
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                width: `${p.largura * 100}%`,
                height: `${p.altura * 100}%`,
                overflow: "hidden",
                maskImage:
                  "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              <Img
                src={staticFile(p.src)}
                style={{
                  position: "absolute",
                  width: `${100 / p.largura}%`,
                  height: `${100 / p.altura}%`,
                  left: `${(-p.x / p.largura) * 100}%`,
                  top: `${(-p.y / p.altura) * 100}%`,
                  maxWidth: "none",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
          {veus.map((v, i) => (
            <div
              key={`veu-${i}`}
              style={{
                position: "absolute",
                left: `${v.x * 100}%`,
                top: `${v.y * 100}%`,
                width: `${v.largura * 100}%`,
                height: `${v.altura * 100}%`,
                // Desfoque forte + cor apagada: texto antigo vira só uma sombra (04/11, A-008).
                backdropFilter: `blur(${quadroPx * 0.03}px) saturate(0.35) brightness(0.72)`,
                WebkitBackdropFilter: `blur(${quadroPx * 0.03}px) saturate(0.35) brightness(0.72)`,
                // Bordas suaves nos 4 lados (as duas máscaras se cruzam), sem cortar o meio.
                maskImage:
                  v.forma === "elipse"
                    ? "radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)"
                    : `linear-gradient(to right, transparent 0%, #000 ${(v.suaveX ?? 0.04) * 100}%, #000 ${100 - (v.suaveX ?? 0.04) * 100}%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 ${(v.suaveY ?? 0.22) * 100}%, #000 ${100 - (v.suaveY ?? 0.22) * 100}%, transparent 100%)`,
                WebkitMaskImage:
                  v.forma === "elipse"
                    ? "radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)"
                    : `linear-gradient(to right, transparent 0%, #000 ${(v.suaveX ?? 0.04) * 100}%, #000 ${100 - (v.suaveX ?? 0.04) * 100}%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 ${(v.suaveY ?? 0.22) * 100}%, #000 ${100 - (v.suaveY ?? 0.22) * 100}%, transparent 100%)`,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
