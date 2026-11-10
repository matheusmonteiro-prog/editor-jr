// Base comum dos componentes do kit visual v3 (docs/kit-visual-video.md, 03/11/2026).
// Cores, fonte, curva de movimento, ícones e o texto com uma palavra em destaque,
// num lugar só, para os componentes do kit não repetirem valores.
import React from "react";
import { Easing, Img, interpolate, OffthreadVideo, staticFile } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/Montserrat";

// Montserrat: decisão do Matheus em 03/11 (kit, seção 3). Anton sai do vídeo.
const montserrat = loadFont("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});
export const FONTE_KIT = montserrat.fontFamily;

export const KIT = {
  verde: "#0F2A1D",
  creme: "#F5F0E6",
  cremeSuave: "rgba(245,240,230,0.72)",
  // AMARELO JR PROVISÓRIO: opção A do kit (seção 2). O Matheus ainda vai escolher entre
  // A #FFC629, B #FFD43B e C #FFB800. Para trocar o padrão, mude só esta linha
  // (e os .default() dos schemas que repetem o valor, regra do .default() do projeto).
  amarelo: "#FFC629",
  // Vermelho-terra: só queda, erro ou alerta (kit, seção 2). Tom ainda a aprovar.
  vermelho: "#E4573D",
  // Destaque sobre fundo claro (kit, regra de pareamento): marrom. Amarelo só sobre escuro.
  marrom: "#8E4813",
} as const;

// Tema das telas explicativas (04/11, pedido A-011): "escuro" (verde, padrão) ou "claro" (bege,
// papel). O bege pode variar de vídeo para vídeo: passe `corFundoClaro`.
export const temaSchema = z.enum(["escuro", "claro"]);
export type Tema = z.infer<typeof temaSchema>;
export const coresTema = (tema: Tema, corFundoClaro: string = KIT.creme) =>
  tema === "claro"
    ? { fundo: corFundoClaro, texto: KIT.verde, textoSuave: "rgba(15,42,29,0.72)", destaque: KIT.marrom }
    : { fundo: KIT.verde, texto: KIT.creme, textoSuave: KIT.cremeSuave, destaque: KIT.amarelo as string };

// Curva do kit (seção 7): cubic-bezier(.2,.7,.2,1).
export const CURVA = Easing.bezier(0.2, 0.7, 0.2, 1);

// Progresso de 0 a 1 entre `inicio` e `inicio + duracao`, com a curva do kit.
export const progresso = (frame: number, inicio: number, duracao: number) =>
  interpolate(frame, [inicio, inicio + Math.max(1, duracao)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CURVA,
  });

// Saída: 1 até `fim - duracao`, cai a 0 em `fim`.
export const saida = (frame: number, fim: number, duracao: number) =>
  1 - progresso(frame, fim - duracao, duracao);

// Subida curta (kit, seção 7): entra subindo e ganhando opacidade.
export const estiloSubida = (p: number, distancia: number): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distancia}px)`,
});

// ---------- Camada do JR ----------
// O JR pode vir como vídeo (gravação real) ou imagem (teste). Sempre "cobrir" a caixa,
// cortando os lados: como a câmera é 16:9, numa caixa mais estreita o JR só desliza.
export const tipoMidiaSchema = z.enum(["video", "imagem"]);

export const MidiaJR: React.FC<{
  src: string;
  tipo: z.infer<typeof tipoMidiaSchema>;
  mudo: boolean;
  posicao?: string;
  inicio?: number; // quadro do vídeo em que começa (para continuar de onde a câmera está)
  // Recorte 16:9 da fonte, em fração: canto (x, y) e largura. Só para caixa 16:9 (janela do JR).
  recorte?: { x: number; y: number; largura: number };
}> = ({ src, tipo, mudo, posicao = "50% 35%", inicio = 0, recorte }) => {
  const estilo: React.CSSProperties = recorte
    ? {
        position: "absolute",
        width: `${100 / recorte.largura}%`,
        height: `${100 / recorte.largura}%`,
        left: `${(-recorte.x / recorte.largura) * 100}%`,
        top: `${(-recorte.y / recorte.largura) * 100}%`,
        objectFit: "cover",
        display: "block",
        maxWidth: "none",
      }
    : { width: "100%", height: "100%", objectFit: "cover", objectPosition: posicao, display: "block" };
  const midia =
    tipo === "video" ? (
      <OffthreadVideo src={staticFile(src)} muted={mudo} trimBefore={inicio > 0 ? inicio : undefined} style={estilo} />
    ) : (
      <Img src={staticFile(src)} style={estilo} />
    );
  return recorte ? <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{midia}</div> : midia;
};

// ---------- Texto com uma palavra em destaque ----------
// Pinta a primeira ocorrência de `destaque` dentro de `texto` (sem diferenciar maiúscula).
export const TextoComDestaque: React.FC<{
  texto: string;
  destaque?: string;
  cor: string;
}> = ({ texto, destaque, cor }) => {
  const alvo = (destaque ?? "").trim();
  const i = alvo ? texto.toLowerCase().indexOf(alvo.toLowerCase()) : -1;
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span style={{ color: cor }}>{texto.slice(i, i + alvo.length)}</span>
      {texto.slice(i + alvo.length)}
    </>
  );
};

// ---------- Ícones ----------
// Linha fina, ponta arredondada, sem preenchimento, grade 24×24 (kit, seção 8).
// Desenhados no estilo Lucide; soja e boi são desenho próprio.
export const NOMES_ICONE = [
  "nenhum",
  "soja",
  "boi",
  "grafico",
  "predio",
  "moedas",
  "terra",
  "caminhao",
  "pino",
  "maleta",
  "banco",
  "camisa",
  "carro",
  "martelo",
  "fabrica",
] as const;
export const nomeIconeSchema = z.enum(NOMES_ICONE);
export type NomeIcone = z.infer<typeof nomeIconeSchema>;

const CAMINHOS: Record<Exclude<NomeIcone, "nenhum">, string[]> = {
  soja: [
    "M12 22V8",
    "M12 12c-3 0-4.5-1.8-4.5-4.5C10.2 7.5 12 9 12 12Z",
    "M12 12c3 0 4.5-1.8 4.5-4.5C13.8 7.5 12 9 12 12Z",
    "M12 17c-3 0-4.5-1.8-4.5-4.5C10.2 12.5 12 14 12 17Z",
    "M12 17c3 0 4.5-1.8 4.5-4.5C13.8 12.5 12 14 12 17Z",
    "M12 8c-1.6-1-1.6-3.6 0-5c1.6 1.4 1.6 4 0 5Z",
  ],
  boi: [
    "M3 5c0 3 2 4.5 4.5 4.5",
    "M21 5c0 3-2 4.5-4.5 4.5",
    "M7.5 9h9l-1 9a3.5 3.5 0 0 1-7 0Z",
    "M10.5 16.5h.01M13.5 16.5h.01",
  ],
  grafico: ["M22 7l-8.5 8.5-5-5L2 17", "M16 7h6v6"],
  predio: [
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
    "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
    "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    "M10 6h4M10 10h4M10 14h4M10 18h4",
  ],
  moedas: [
    "M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
    "M18.1 10.4A6 6 0 1 1 10.3 18",
    "M7 6h1v4",
    "M16.7 13.9l.7.7-2.8 2.8",
  ],
  terra: ["M2 20h20", "M4 20c1.5-4 4-7 8-7s6.5 3 8 7", "M12 13V6", "M12 9c-2 0-3-1.5-3-3 2 0 3 1.5 3 3Z", "M12 9c2 0 3-1.5 3-3-2 0-3 1.5-3 3Z"],
  caminhao: [
    "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
    "M15 18H9",
    "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 8.38A1 1 0 0 0 17.52 8H14",
    "M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  ],
  pino: ["M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  banco: ["M3 22h18", "M6 18v-7", "M10 18v-7", "M14 18v-7", "M18 18v-7", "M12 2l8 5H4Z"],
  camisa: ["M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"],
  carro: ["M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", "M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M9 17h6", "M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  martelo: ["m14 13-7.5 7.5a2.12 2.12 0 0 1-3-3L11 10", "m16 16 6-6", "m8 8 6-6", "m9 7 8 8", "m21 11-8-8"],
  fabrica: ["M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z", "M17 18h1", "M12 18h1", "M7 18h1"],
  maleta: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"],
};

export const IconeKit: React.FC<{ nome: NomeIcone; cor: string; tamanho: number }> = ({
  nome,
  cor,
  tamanho,
}) => {
  if (nome === "nenhum") return null;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {CAMINHOS[nome].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={cor}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};
