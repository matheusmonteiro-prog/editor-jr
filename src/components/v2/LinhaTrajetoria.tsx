import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { coresTema, FONTE_KIT, IconeKit, KIT, nomeIconeSchema, progresso, temaSchema } from "./kitV3";

// Kit v3, seção 4.10 (pedido A-013 do Matheus, 04/11): a história de vida do JR como TRAJETÓRIA.
// Mistura de linha do tempo com árvore: um tronco dourado desce e se desenha conforme o JR fala;
// cada capítulo ("01 Do sítio à cidade") é um nó no tronco e cada etapa sai do tronco num galho
// curto, com ícone e texto. A "câmera" acompanha: quando a lista passa da área, ela sobe devagar
// para a etapa nova ficar sempre à vista. A etapa atual fica acesa; as anteriores, mais apagadas.
// Etapas com `em` <= 0 já começam desenhadas (para continuar a trajetória em outro trecho).
// Cronologia: os galhos saem um depois do outro, nunca juntos (são etapas sucessivas).

const marcoSchema = z.object({
  icone: nomeIconeSchema.default("nenhum"),
  texto: z.string(),
  // Quadro (relativo ao início da peça) em que a etapa aparece, preso à fala.
  em: z.number(),
});
const capituloSchema = z.object({
  titulo: z.string(),
  // Quadro em que o capítulo aparece. Padrão: 10 quadros antes da primeira etapa.
  em: z.number().optional(),
  marcos: z.array(marcoSchema),
});

export const linhaTrajetoriaSchema = z.object({
  capitulos: z.array(capituloSchema).default([
    {
      titulo: "Do sítio à cidade",
      marcos: [
        { icone: "terra", texto: "Criado no sítio", em: 15 },
        { icone: "predio", texto: "Vida de cidade", em: 45 },
      ],
    },
    {
      titulo: "Por conta própria",
      marcos: [
        { icone: "maleta", texto: "Por conta própria", em: 85 },
        { icone: "caminhao", texto: "Transportadora", em: 115 },
      ],
    },
  ]),
  // Área em fração da tela: onde a trajetória fica (padrão: o painel esquerdo da tela dividida).
  x: z.number().min(0).max(1).default(0.05),
  y: z.number().min(0).max(1).default(0.1),
  largura: z.number().min(0.1).max(1).default(0.42),
  altura: z.number().min(0.1).max(1).default(0.8),
  tamanhoTexto: z.number().min(0.01).max(0.06).default(0.024),
  framesLinha: z.number().min(1).default(14),
  tema: temaSchema.default("escuro"),
  corLinha: zColor().default("#FFC629"),
  duracaoFrames: z.number().min(10).default(180),
  framesEntrada: z.number().min(0).default(10),
  framesSaida: z.number().min(1).default(12),
});

type Props = z.input<typeof linhaTrajetoriaSchema>;

type Elemento =
  | { tipo: "capitulo"; numero: number; titulo: string; em: number; y: number }
  | { tipo: "marco"; icone: z.infer<typeof nomeIconeSchema>; texto: string; em: number; y: number };

export const LinhaTrajetoria: React.FC<Props> = ({
  capitulos = [],
  x = 0.05,
  y = 0.1,
  largura = 0.42,
  altura = 0.8,
  tamanhoTexto = 0.024,
  framesLinha = 14,
  tema = "escuro",
  corLinha = KIT.amarelo,
  duracaoFrames = 180,
  framesEntrada = 10,
  framesSaida = 12,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cores = coresTema(tema);
  const cor = tema === "claro" && corLinha === KIT.amarelo ? KIT.marrom : corLinha;

  // Medidas (px)
  const fonte = W * tamanhoTexto;
  const alturaCapitulo = fonte * 2.6;
  const alturaMarco = fonte * 2.2;
  const troncoX = W * 0.012; // relativo à área
  const galho = W * 0.03; // distância do tronco até o nó da etapa
  const raio = W * 0.0065;

  // Monta a lista na ordem, com a posição vertical de cada elemento.
  const elementos: Elemento[] = [];
  let cursor = fonte * 0.6;
  capitulos.forEach((c, ci) => {
    const primeiro = c.marcos.length > 0 ? Math.min(...c.marcos.map((m) => m.em)) : 0;
    const emCap = c.em ?? (primeiro <= 0 ? primeiro : primeiro - 10);
    elementos.push({ tipo: "capitulo", numero: ci + 1, titulo: c.titulo, em: emCap, y: cursor });
    cursor += alturaCapitulo;
    c.marcos.forEach((m) => {
      elementos.push({ tipo: "marco", icone: m.icone ?? "nenhum", texto: m.texto, em: m.em, y: cursor });
      cursor += alturaMarco;
    });
    cursor += fonte * 0.5;
  });

  const areaH = altura * H;
  const aparece = (e: Elemento) => (e.em <= 0 ? 1 : progresso(frame, e.em, framesLinha));

  // "Câmera": a etapa mais nova fica a ~62% da altura da área. Sobe suave entre um alvo e outro.
  let rolagem = 0;
  elementos.forEach((e) => {
    const destino = Math.max(0, e.y - areaH * 0.62);
    if (destino > rolagem) rolagem += (destino - rolagem) * (e.em <= 0 ? 1 : progresso(frame, e.em - 4, 22));
  });

  // Elemento atual = o último que já começou a aparecer.
  const atual = elementos.reduce((acc, e, i) => (e.em <= frame ? i : acc), -1);

  // Tronco: desenhado até o elemento mais novo (cresce enquanto ele aparece).
  let fimTronco = elementos[0]?.y ?? 0;
  elementos.forEach((e) => {
    const p = aparece(e);
    if (p > 0) fimTronco = fimTronco + (e.y + (e.tipo === "marco" ? alturaMarco * 0.5 : 0) - fimTronco) * p;
  });

  const entrada = framesEntrada > 0 ? progresso(frame, 0, framesEntrada) : 1;
  const fica = entrada * (1 - progresso(frame, duracaoFrames - framesSaida, framesSaida));

  return (
    <Sequence name="LinhaTrajetoria">
      <AbsoluteFill style={{ opacity: fica, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: x * W,
            top: y * H,
            width: largura * W,
            height: areaH,
            overflow: "hidden",
            // O que sobe some suave no topo.
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 100%)",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: -rolagem, width: "100%" }}>
            {/* Tronco e galhos */}
            <svg
              width={largura * W}
              height={cursor + H}
              style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
              <line
                x1={troncoX}
                y1={elementos[0]?.y ?? 0}
                x2={troncoX}
                y2={fimTronco}
                stroke={cor}
                strokeWidth={W * 0.0022}
                strokeLinecap="round"
              />
              {elementos.map((e, i) => {
                if (e.tipo !== "marco") return null;
                const p = aparece(e);
                if (p <= 0) return null;
                const yb = e.y + alturaMarco * 0.5;
                const comprimento = galho * 1.4;
                return (
                  <path
                    key={`g-${i}`}
                    d={`M ${troncoX} ${yb - alturaMarco * 0.45} Q ${troncoX} ${yb} ${troncoX + galho} ${yb}`}
                    fill="none"
                    stroke={cor}
                    strokeWidth={W * 0.0016}
                    strokeDasharray={comprimento}
                    strokeDashoffset={comprimento * (1 - p)}
                    opacity={i === atual ? 1 : 0.6}
                  />
                );
              })}
            </svg>

            {elementos.map((e, i) => {
              const p = aparece(e);
              if (p <= 0) return null;
              const aceso = i === atual;
              if (e.tipo === "capitulo") {
                return (
                  <div
                    key={`c-${i}`}
                    style={{
                      position: "absolute",
                      top: e.y,
                      left: 0,
                      height: alturaCapitulo,
                      display: "flex",
                      alignItems: "center",
                      opacity: p,
                      fontFamily: FONTE_KIT,
                    }}
                  >
                    {/* Nó do capítulo: losango no tronco */}
                    <div
                      style={{
                        position: "absolute",
                        left: troncoX - raio * 1.3,
                        width: raio * 2.6,
                        height: raio * 2.6,
                        transform: `rotate(45deg) scale(${0.4 + 0.6 * p})`,
                        backgroundColor: cor,
                      }}
                    />
                    <span
                      style={{
                        marginLeft: troncoX + galho * 0.9,
                        fontWeight: 900,
                        fontSize: fonte * 1.05,
                        color: cor,
                        marginRight: fonte * 0.5,
                      }}
                    >
                      {String(e.numero).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: fonte * 0.62,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: cor,
                      }}
                    >
                      {e.titulo}
                    </span>
                  </div>
                );
              }
              const brilho = aceso ? 0.5 + 0.5 * Math.sin(frame / 6) : 0;
              return (
                <div
                  key={`m-${i}`}
                  style={{
                    position: "absolute",
                    top: e.y,
                    left: 0,
                    height: alturaMarco,
                    display: "flex",
                    alignItems: "center",
                    fontFamily: FONTE_KIT,
                    opacity: (aceso ? 1 : 0.55) * p,
                    transform: `translateX(${(1 - p) * W * 0.012}px)`,
                  }}
                >
                  {/* Nó da etapa, na ponta do galho */}
                  <div
                    style={{
                      position: "absolute",
                      left: troncoX + galho - raio,
                      width: raio * 2,
                      height: raio * 2,
                      borderRadius: "50%",
                      boxSizing: "border-box",
                      backgroundColor: aceso ? cor : cores.fundo,
                      border: `${W * 0.0016}px solid ${cor}`,
                      boxShadow: aceso ? `0 0 ${W * 0.008 * (0.6 + brilho)}px ${cor}` : "none",
                    }}
                  />
                  <div style={{ marginLeft: troncoX + galho + raio * 2.4, display: "flex", alignItems: "center" }}>
                    <IconeKit nome={e.icone} cor={cor} tamanho={fonte * 1.15} />
                    <span
                      style={{
                        marginLeft: e.icone === "nenhum" ? 0 : fonte * 0.55,
                        fontWeight: aceso ? 800 : 600,
                        fontSize: fonte,
                        color: cores.texto,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {e.texto}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
