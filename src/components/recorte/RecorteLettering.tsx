// Teste do recorte de fundo + lettering atrás do JR (aula 8.2 do curso), 13/11/2026.
// Fala do JR (28/10, 166–176 s): "todo ativo que paga grandes dividendos, o patrimônio vai se manter ali
// estabilizado, desvalorizando aos poucos ou desvalorizado de uma vez."
// Camadas (de trás para a frente): fundo da identidade -> palavras e linha ATRÁS do JR -> JR recortado (alfa)
// -> quarto original (só nos 3,3 s iniciais, onde o recorte falha na aba do chapéu) -> textos da frente e legenda.
// O recorte vem de public/videos/recorte/ (IA modnet + limpeza scripts/recorte-fundo/limpar-alfa.py).
// Tudo pelo quadro do Remotion (interpolate/spring); nada de animação por CSS.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FONTE_KIT, KIT, progresso } from "../v2/kitV3";

export const recorteLetteringSchema = z.object({
  recorte: z.string().default("videos/recorte/2810-166s-jr-alfa-limpo.webm"),
  original: z.string().default("videos/2026-10-28-final-v1-filtro-natural-v2.mp4"),
  voz: z.string().default("videos/2026-10-28-voz-wpe8-calma20.wav"),
  inicioSegundos: z.number().default(166),
  // Onde o recorte entra na tela (o recorte foi feito num pedaço 1440x1080 do vídeo, a partir de x=200).
  recorteX: z.number().default(200),
});
type Props = z.infer<typeof recorteLetteringSchema>;

// Quadros (30 qps) presos à fala medida pelo Whisper (segundos da gravação - 166):
// "paga" f41 · "grandes" f54 · "dividendos" f78 · "o patrimônio" f121 · "manter" f179 · "estabilizado" f214
// "desvalorizando" f241 · "aos poucos" f264 · "desvalorizado de uma vez" f283
const T = { paga: 41, grandes: 54, dividendos: 78, quartoSome: 100, patrimonio: 121, manter: 179, estabilizado: 214, desvaloriza: 241, deUmaVez: 283 };

// A camisa do JR termina na linha 1012 da gravação; abaixo disso é o notebook (medido em 13/11).
const CORTE_BAIXO = 1012;
const ESCALA = 1080 / CORTE_BAIXO;

const LEGENDAS: { de: number; ate: number; texto: string }[] = [
  { de: 4, ate: 92, texto: "todo ativo que paga grandes dividendos," },
  { de: 120, ate: 236, texto: "o patrimônio vai se manter ali estabilizado," },
  { de: 238, ate: 300, texto: "desvalorizando aos poucos ou desvalorizado de uma vez." },
];

// Linha do patrimônio, passando por trás do JR na altura do peito.
const Linha: React.FC<{ frame: number }> = ({ frame }) => {
  const desenha = interpolate(frame, [T.manter - 6, T.estabilizado], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) });
  if (desenha <= 0) return null;
  const caiPouco = progresso(frame, T.desvaloriza, 32);
  const caiDeVez = progresso(frame, T.deUmaVez, 14);
  const Y = 610, X0 = 70, X1 = 1850, QUEBRA = 1050;
  const pts: string[] = [];
  const xFim = X0 + (X1 - X0) * desenha;
  for (let x = X0; x <= xFim; x += 12) {
    const t = Math.max(0, (x - QUEBRA) / (X1 - QUEBRA));
    const y = Y + t * 150 * caiPouco + Math.pow(t, 3) * 330 * caiDeVez;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  const queda = Math.max(caiPouco, caiDeVez);
  const cor = queda > 0 ? KIT.vermelho : "#1DD41E";
  const ult = pts[pts.length - 1]?.split(",").map(Number) ?? [X0, Y];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
      <circle cx={ult[0]} cy={ult[1]} r={14} fill={cor} />
    </svg>
  );
};

export const RecorteLettering: React.FC<Props> = ({ recorte, original, voz, inicioSegundos, recorteX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inicio = Math.round(inicioSegundos * fps);
  const quarto = 1 - progresso(frame, T.quartoSome, 18);
  // PATRIMÔNIO gigante atrás do JR: sobe e as letras se juntam; afunda um pouco quando o valor cai.
  const pPat = spring({ frame: frame - T.patrimonio + 4, fps, config: { damping: 20, stiffness: 90 } });
  const afunda = progresso(frame, T.desvaloriza, 60) * 40;
  const corPat = interpolate(progresso(frame, T.desvaloriza, 40), [0, 1], [0, 1]);
  const rotulo = (o: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", fontFamily: FONTE_KIT, fontWeight: 900, opacity: o, ...extra });
  const legenda = LEGENDAS.find((l) => frame >= l.de && frame < l.ate);
  return (
    <AbsoluteFill style={{ backgroundColor: KIT.verde }}>
      <Audio src={staticFile(voz)} trimBefore={inicio} />
      {/* 1. Fundo da identidade: verde do kit com luz suave atrás do JR e grade discreta */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #1F4D36 0%, ${KIT.verde} 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(245,240,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,230,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* 2. ATRÁS do JR: a palavra e a linha */}
      <div style={rotulo(Math.min(1, pPat * 1.4), {
        left: 0, right: 0, top: 30 + (1 - pPat) * 120 + afunda, textAlign: "center", fontSize: 250, lineHeight: 1,
        letterSpacing: interpolate(pPat, [0, 1], [60, 4]), color: interpolate(corPat, [0, 1], [0, 1]) > 0.5 ? "rgba(228,87,61,0.92)" : "rgba(245,240,230,0.92)",
      })}>
        PATRIMÔNIO
      </div>
      <Linha frame={frame} />

      {/* 3 e 4. As duas camadas de vídeo ampliadas juntas (ESCALA, a partir do topo): o friso do notebook
          que fica na frente do JR na gravação (linhas 1015 a 1040) é cortado e o corte cai na borda de baixo
          da tela, como numa gravação normal. Mesma escala nas duas: a troca quarto -> recorte não pula. */}
      <AbsoluteFill style={{ transform: `scale(${ESCALA})`, transformOrigin: "50% 0%" }}>
        {/* 3. O JR recortado (mesmos quadros e mesma posição do original) */}
        <div style={{ position: "absolute", left: recorteX, top: 0, width: 1440, height: 1080, clipPath: `inset(0 0 ${1080 - CORTE_BAIXO}px 0)` }}>
          <OffthreadVideo src={staticFile(recorte)} transparent muted style={{ width: "100%", height: "100%" }} />
        </div>
        {/* 4. O quarto original, só no começo (onde o recorte falha na aba do chapéu); some em ~0,6 s */}
        {quarto > 0 && (
          <AbsoluteFill style={{ opacity: quarto }}>
            <OffthreadVideo src={staticFile(original)} trimBefore={inicio} muted style={{ width: "100%", height: "100%" }} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* 5. FRENTE: título do começo, rótulos da linha, selo e legenda */}
      <div style={rotulo(progresso(frame, T.paga, 10) * quarto, { left: 90, top: 330, fontSize: 64, color: KIT.creme, textShadow: "0 4px 18px rgba(0,0,0,0.55)" })}>
        PAGA GRANDES
      </div>
      <div style={rotulo(progresso(frame, T.dividendos - 4, 10) * quarto, { left: 86, top: 400, fontSize: 112, color: KIT.amarelo, textShadow: "0 4px 18px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - progresso(frame, T.dividendos - 4, 10)) * 24}px)` })}>
        DIVIDENDOS
      </div>
      <div style={rotulo(progresso(frame, T.estabilizado - 6, 10) * (1 - progresso(frame, T.desvaloriza, 10)), { left: 90, top: 640, fontSize: 34, color: "#1DD41E" })}>
        ESTABILIZADO
      </div>
      <div style={rotulo(progresso(frame, T.desvaloriza + 4, 10), { right: 70, top: 540, fontSize: 34, color: KIT.vermelho, textAlign: "right" })}>
        DESVALORIZANDO
      </div>
      <div style={rotulo(progresso(frame, T.manter, 12) * 0.8, { left: 92, top: 40, fontSize: 17, fontWeight: 600, letterSpacing: 1.2, color: KIT.creme })}>
        ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS
      </div>
      {legenda && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: FONTE_KIT, fontWeight: 700, fontSize: 40, color: KIT.creme, background: "rgba(10,25,18,0.78)", padding: "10px 26px",
            borderRadius: 14, maxWidth: 1300, textAlign: "center", opacity: Math.min(progresso(frame, legenda.de, 5), 1 - progresso(frame, legenda.ate - 5, 5)) }}>
            {legenda.texto}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
