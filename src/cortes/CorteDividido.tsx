import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { avisoEmDuasLinhas, COR_CORTE, CURVA_CORTE, FONTE_MONO, FONTE_TITULO } from "../components/cortes/estiloCortes";
import { QuadroPapel } from "../components/cortes/QuadroPapel";
import { EtiquetaAssunto, etiquetaAssuntoSchema } from "../components/cortes/EtiquetaAssunto";
import { LegendaFaixa } from "../components/cortes/LegendaFaixa";
import { CartaoDocumento, cartaoDocumentoSchema } from "../components/cortes/CartaoDocumento";
import { Carimbo, carimboSchema } from "../components/cortes/Carimbo";
import { Balanca, balancaSchema } from "../components/cortes/Balanca";
import { Multidao, multidaoSchema } from "../components/cortes/Multidao";
import { Regua, reguaSchema } from "../components/cortes/Regua";
import { BilheteLoteria, bilheteLoteriaSchema } from "../components/cortes/BilheteLoteria";
import { FONTES } from "./fontes";
import { normalizar, SFX, VozTrecho } from "./CorteCurto";
import { corteSchema, duracaoCorte, montarLinha, paraCorte, seg, type PecaQuadro, type TrechoNoCorte } from "./receita";

// Estilo explicativo de papel (aprovado pelo Matheus em 12/11/2026, kit 4.16): quadro de papel com
// o desenho que explica a fala, e o JR ao lado. A mesma receita serve aos dois formatos:
//  - "vertical" (corte 9:16): papel em cima, JR embaixo, legenda colada no rasgo;
//  - "horizontal" (vídeo longo 16:9): papel à esquerda, JR à direita, legenda cruzando o rasgo.
// As posições das peças (x, y, largura) são frações DO QUADRO, então valem nos dois formatos.

export const corteDivididoSchema = z.object({
  video: z.string().default("2026-10-28"),
  xPadrao: z.number().min(0).max(1).default(0.48),
  corte: corteSchema,
  volumeMusica: z.number().min(0).max(0.3).default(0.06),
  formato: z.enum(["vertical", "horizontal"]).default("vertical"),
  // Vertical: altura do papel (fração da altura). Horizontal: largura do papel (fração da largura).
  tamanhoQuadro: z.number().min(0.3).max(0.7).default(0.47),
  // Parte da fonte (de cima para baixo) que aparece na caixa do JR: 0.72 = cabeça, ombros e peito.
  alturaFonte: z.number().min(0.3).max(1).default(0.72),
  // Rodapé com logo e @ (fração da altura), em degradê: mais escuro embaixo, transparente em cima.
  // Também esconde as pílulas antigas do v1 de 28/10. 0 = sem rodapé.
  alturaRodape: z.number().min(0).max(0.25).default(0.11),
  arroba: z.string().default("jroinvestidorsertanejo"),
  logo: z.string().default("images/logo-jr.png"), // arquivo original da marca, sem alteração
  // Aviso legal (padrão do Matheus, 12/11/2026: todos os cortes e vídeos). Sobe numa barra no rodapé
  // nos primeiros segundos e de novo no final, no lugar do logo e do @. Vazio = sem aviso.
  // avisoSegundos = quanto tempo a barra fica na tela em cada passagem.
  avisoSegundos: z.number().min(1).max(8).default(3.6),
  aviso: z.string().default("Este conteúdo tem caráter exclusivamente educacional."),
  // Trecho explicativo dentro do vídeo LONGO: sem voz, sem música, sem rodapé (aviso, logo e @ ficam no
  // início e no fim do longo inteiro). A câmera continua, no mesmo tempo.
  modoLongo: z.boolean().default(false),
});
type Props = z.infer<typeof corteDivididoSchema>;

export type Caixa = { left: number; top: number; w: number; h: number };

// Sons: os do kit + os de papel (gerados por código em 12/11, public/sfx/papel/, sem licença de terceiros).
export const SONS = {
  ...SFX,
  papel: "sfx/papel/papel-desliza.wav",
  carimbo: "sfx/papel/carimbo-baque.wav",
  marca: "sfx/papel/marca-texto.wav",
} as const;
export type NomeSom = keyof typeof SONS;
// Som padrão de cada peça quando o corte liga opcoes.sonsPapel.
export const SOM_PADRAO: Record<PecaQuadro["peca"], NomeSom | "nenhum"> = {
  cartao: "papel",
  bilhete: "papel",
  balanca: "papel",
  regua: "papel",
  carimbo: "carimbo",
  multidao: "nenhum",
  etiqueta: "nenhum",
};
export const VOLUME_SOM: Partial<Record<NomeSom, number>> = { papel: 0.5, carimbo: 0.55, marca: 0.4 };

// Peças que o quadro sabe desenhar. "largura" e "passos" são preenchidos aqui.
const PECAS = {
  cartao: { C: CartaoDocumento, schema: cartaoDocumentoSchema },
  carimbo: { C: Carimbo, schema: carimboSchema },
  balanca: { C: Balanca, schema: balancaSchema },
  multidao: { C: Multidao, schema: multidaoSchema },
  regua: { C: Regua, schema: reguaSchema },
  bilhete: { C: BilheteLoteria, schema: bilheteLoteriaSchema },
  etiqueta: { C: EtiquetaAssunto, schema: etiquetaAssuntoSchema },
} as const;

// ---------- JR na caixa da câmera ----------
// A fonte 16:9 é ampliada para que a faixa de cima dela (alturaFonte) preencha a altura da caixa,
// centrada no JR (x).
export const CameraCaixa: React.FC<{
  src: string;
  trecho: TrechoNoCorte;
  x: number;
  alturaFonte: number;
  caixa: Caixa;
  parado?: boolean;
}> = ({ src, trecho, x, alturaFonte, caixa, parado }) => {
  const frame = useCurrentFrame();
  const zoom =
    (trecho.zoom ?? (trecho.indice % 2 === 1 ? 1.08 : 1)) *
    (parado ? 1 : interpolate(frame, [0, trecho.frames], [1, 1.03], { extrapolateRight: "clamp" })) *
    (trecho.indice === 0 || parado ? 1 : interpolate(frame, [0, 6], [1.05, 1], { extrapolateRight: "clamp", easing: CURVA_CORTE }));
  const k = caixa.h / (1080 * alturaFonte); // px da tela por px da fonte
  const larguraFonte = 1920 * k;
  const esquerda = Math.min(0, Math.max(caixa.w - larguraFonte, caixa.w / 2 - x * larguraFonte));
  return (
    <div style={{ position: "absolute", left: caixa.left, top: caixa.top, width: caixa.w, height: caixa.h, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}>
        <div style={{ position: "absolute", top: 0, left: esquerda, width: larguraFonte, height: 1080 * k }}>
          <OffthreadVideo
            src={staticFile(src)}
            muted
            trimBefore={parado ? seg(trecho.ate) - 1 : seg(trecho.de)}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </AbsoluteFill>
    </div>
  );
};

// ---------- Rodapé: logo + @, em degradê (escuro embaixo, transparente em cima) ----------
const Marca: React.FC<{ largura: number; arroba: string; logo: string }> = ({ largura, arroba, logo }) => {
  const tamLogo = largura * 0.085;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tamLogo * 0.22 }}>
      <Img src={staticFile(logo)} style={{ height: tamLogo, width: tamLogo, objectFit: "contain" }} />
      <div style={{ fontFamily: FONTE_TITULO, fontSize: largura * 0.03, color: COR_CORTE.papelClaro, letterSpacing: 1, textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>
        @{arroba.toUpperCase()}
      </div>
    </div>
  );
};

// Vertical com opcoes.marcaNoTopo: logo e @ no canto de cima, à direita, do papel (fora dos botões e
// do título do app, e longe do rosto do JR). Texto verde-escuro sobre o papel.
const MarcaNoTopo: React.FC<{ Q: Caixa; topo: number; arroba: string; logo: string }> = ({ Q, topo, arroba, logo }) => {
  const tamLogo = Q.w * 0.075;
  return (
    <div style={{ position: "absolute", right: Q.w * 0.05, top: topo, display: "flex", alignItems: "center", gap: tamLogo * 0.2 }}>
      <Img src={staticFile(logo)} style={{ height: tamLogo, width: tamLogo, objectFit: "contain" }} />
      <div style={{ fontFamily: FONTE_TITULO, fontSize: Q.w * 0.026, color: COR_CORTE.verde, letterSpacing: 0.5 }}>@{arroba.toUpperCase()}</div>
    </div>
  );
};

// Barra do aviso: verde-escuro da marca, filete amarelo em cima, selo "AVISO" e frase em Space Mono.
const BarraAviso: React.FC<{ largura: number; aviso: string }> = ({ largura, aviso }) => {
  // v2 (12/11): maior e em duas linhas, para ficar bem evidente.
  const fonte = Math.min(largura * 0.036, 40);
  const [l1, l2] = avisoEmDuasLinhas(aviso);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fonte * 0.7,
        padding: `${fonte * 0.45}px ${fonte * 0.8}px`,
        backgroundColor: "rgba(15,42,29,0.97)",
        borderTop: `${Math.max(fonte * 0.14, 3)}px solid ${COR_CORTE.amarelo}`,
        borderRadius: fonte * 0.3,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ fontFamily: FONTE_TITULO, fontSize: fonte * 0.9, color: "#0F2A1D", backgroundColor: COR_CORTE.amarelo, padding: `${fonte * 0.18}px ${fonte * 0.5}px`, borderRadius: fonte * 0.2, letterSpacing: 1 }}>
        AVISO
      </div>
      <div style={{ fontFamily: FONTE_MONO, fontWeight: 700, fontSize: fonte, lineHeight: 1.15, color: COR_CORTE.papelClaro, whiteSpace: "nowrap", textTransform: "uppercase" }}>
        <div>{l1}</div>
        {l2 ? <div>{l2}</div> : null}
      </div>
    </div>
  );
};

export const Rodape: React.FC<{ caixa: Caixa; altura: number; arroba: string; logo: string; aviso: string; avisoSegundos: number; semMarca?: boolean }> = ({
  caixa,
  altura,
  arroba,
  logo,
  aviso,
  avisoSegundos,
  semMarca,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: D } = useVideoConfig();
  const mascara = "linear-gradient(to top, #000 0%, #000 35%, transparent 100%)";
  const suave = Easing.bezier(0.16, 1, 0.3, 1);
  const T = Math.round(avisoSegundos * fps);
  const E = Math.round(0.5 * fps); // duração de cada subida/descida
  const ini = Math.round(0.15 * fps);
  const comAviso = Boolean(aviso) && D > (ini + T + E) * 2;
  // Passagem 1: aviso [ini, ini+T]; logo sobe depois. Passagem 2: logo desce, aviso sobe e fica até o fim.
  const fimAviso1 = ini + T;
  const iniAviso2 = D - T - E;
  const sobe = (a: number) => interpolate(frame, [a, a + E], [1, 0], { easing: suave, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const desce = (a: number) => interpolate(frame, [a, a + E], [0, 1], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // deslocamento 0 = no lugar, 1 = escondido embaixo
  const avisoY = !comAviso ? 1 : frame < fimAviso1 ? sobe(ini) : frame < iniAviso2 ? desce(fimAviso1) : sobe(iniAviso2);
  const marcaY = !comAviso ? 0 : frame < fimAviso1 ? 1 : frame < iniAviso2 ? sobe(fimAviso1 + Math.round(E * 0.35)) : desce(iniAviso2 - Math.round(E * 0.3));
  const bottom = altura * 0.07;
  const empurrar = altura * 0.9;
  const camada: React.CSSProperties = { position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center" };
  return (
    <div style={{ position: "absolute", left: caixa.left, width: caixa.w, top: caixa.top + caixa.h - altura, height: altura }}>
      {/* sombreado verde + desfoque: sobem e descem junto com o logo e o @ (não ficam parados) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${marcaY * empurrar}px)`, opacity: 1 - marcaY }}>
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", maskImage: mascara, WebkitMaskImage: mascara }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15,42,29,0.94) 0%, rgba(15,42,29,0.82) 32%, rgba(15,42,29,0.45) 62%, rgba(15,42,29,0) 100%)",
            }}
          />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {semMarca ? null : (
          <div style={{ ...camada, transform: `translateY(${marcaY * empurrar}px)`, opacity: 1 - marcaY * 0.6 }}>
            <Marca largura={caixa.w} arroba={arroba} logo={logo} />
          </div>
        )}
        {comAviso ? (
          <div style={{ ...camada, transform: `translateY(${avisoY * empurrar}px)`, opacity: 1 - avisoY * 0.6 }}>
            <BarraAviso largura={caixa.w} aviso={aviso} />
          </div>
        ) : null}
      </div>
      {comAviso ? (
        <>
          <Sequence from={ini}>
            <Audio src={staticFile("sfx/papel/aviso-sobe.wav")} volume={0.28} />
          </Sequence>
          <Sequence from={iniAviso2}>
            <Audio src={staticFile("sfx/papel/aviso-sobe.wav")} volume={0.28} />
          </Sequence>
        </>
      ) : null}
    </div>
  );
};

// ---------- Uma peça no quadro ----------
export const Peca: React.FC<{ peca: PecaQuadro; passos: number[]; quadro: Caixa; marcarEm?: number }> = ({ peca, passos, quadro, marcarEm }) => {
  const def = PECAS[peca.peca];
  const largura = peca.peca === "etiqueta" ? quadro.w : peca.largura * quadro.w;
  const extra = marcarEm !== undefined && peca.peca === "cartao" ? { marcarEm } : {};
  const props = def.schema.parse({ ...peca.props, largura, passos, ...extra });
  const C = def.C as React.FC<Record<string, unknown>>;
  return (
    <div style={{ position: "absolute", left: peca.x * quadro.w, top: peca.y * quadro.h, transform: "translate(-50%, -50%)" }}>
      <C {...(props as Record<string, unknown>)} />
    </div>
  );
};

// Papel de campo (kraft) por cima do papel base, só durante o quadro; entra em 6 quadros.
const PapelDoQuadro: React.FC<{ Q: Caixa; vertical: boolean }> = ({ Q, vertical }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }) }}>
      <QuadroPapel largura={Q.w} altura={Q.h} lado={vertical ? "baixo" : "direita"} tema="campo" />
    </AbsoluteFill>
  );
};

export const SaidaSuave: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [frames - 5, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const CorteDividido: React.FC<Props> = ({
  video,
  xPadrao,
  corte,
  volumeMusica,
  formato,
  tamanhoQuadro,
  alturaFonte,
  alturaRodape,
  arroba,
  logo,
  aviso,
  avisoSegundos,
  modoLongo,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const fonte = FONTES[video];
  const linha = useMemo(() => montarLinha(corte), [corte]);
  const total = duracaoCorte(corte);
  const ultimo = linha[linha.length - 1];
  const fimFala = ultimo.inicio + ultimo.frames;
  const quadro = (t: number) => paraCorte(linha, t);

  // Geometria dos dois formatos.
  const vertical = formato === "vertical";
  const Q: Caixa = vertical ? { left: 0, top: 0, w: W, h: Math.round(H * tamanhoQuadro) } : { left: 0, top: 0, w: Math.round(W * tamanhoQuadro), h: H };
  const sobra = 30; // a câmera passa um pouco por baixo do rasgo
  const CAM: Caixa = vertical ? { left: 0, top: Q.h, w: W, h: H - Q.h } : { left: Q.w - sobra, top: 0, w: W - Q.w + sobra, h: H };
  const legenda = vertical
    ? { cx: W / 2, cy: Q.h + 6, tamanho: 0.068, max: W * 0.9 }
    : { cx: Q.w / 2, cy: H * 0.9, tamanho: 0.032, max: Q.w * 0.92 };

  const palavras = useMemo(() => {
    const correcoes = Object.fromEntries(Object.entries(corte.legenda.correcoes).map(([k, v]) => [normalizar(k), v]));
    const lista: { texto: string; inicioFrames: number; fimFrames: number }[] = [];
    for (const tr of linha) {
      for (const p of fonte.palavras) {
        const ini = p.startMs / 1000;
        if (ini < tr.de || ini >= tr.ate) continue;
        const bruto = p.text.trim();
        const pont = bruto.match(/[.,?!]+$/)?.[0] ?? "";
        const corr = correcoes[normalizar(bruto)];
        const f0 = tr.inicio + seg(ini) - seg(tr.de);
        const f1 = tr.inicio + seg(Math.min(p.endMs / 1000, tr.ate)) - seg(tr.de);
        lista.push({ texto: corr !== undefined ? corr + pont : bruto, inicioFrames: f0, fimFrames: Math.max(f0 + 1, f1) });
      }
    }
    return lista;
  }, [corte.legenda, linha, fonte.palavras]);

  // Quadros no tempo do corte.
  const quadros = corte.quadros.flatMap((q) => {
    const ini = quadro(q.de);
    if (ini === null) return [];
    const fimFonte = quadro(q.ate - 1 / 30);
    const fim = Math.min(fimFonte === null ? ini + seg(q.ate - q.de) : fimFonte + 1, fimFala);
    return [{ ...q, ini, frames: Math.max(6, fim - ini) }];
  });

  const pecaNoTempo = (p: PecaQuadro, iniQuadro: number) => {
    const ini = p.em === undefined ? iniQuadro : (quadro(p.em) ?? iniQuadro);
    const passos = p.passos.map((t) => (quadro(t) ?? ini) - ini);
    const marcar = p.marcar === undefined ? undefined : (quadro(p.marcar) ?? ini) - ini;
    return { de: ini - iniQuadro, passos, marcar };
  };

  const somDe = (p: PecaQuadro): NomeSom | "nenhum" => (p.som === "auto" ? (corte.opcoes.sonsPapel ? SOM_PADRAO[p.peca] : "nenhum") : p.som);

  // No vertical com as melhorias, o cabeçalho desce para fora da faixa de cima que o app cobre (~130 px).
  const topoCabecalho = vertical && corte.opcoes.marcaNoTopo ? 130 : null;
  const cabecalho = (titulo?: string, etiqueta?: string, imediata = false) =>
    titulo ? (
      <div style={{ position: "absolute", top: topoCabecalho !== null ? topoCabecalho + 70 : Q.h * 0.07, left: 0, width: Q.w, display: "flex", justifyContent: "center" }}>
        <EtiquetaAssunto texto={titulo} tamanho="grande" largura={Q.w} imediata={imediata} />
      </div>
    ) : etiqueta ? (
      <div style={{ position: "absolute", top: topoCabecalho ?? Q.h * 0.055, left: Q.w * 0.045 }}>
        <EtiquetaAssunto texto={etiqueta} largura={Q.w} />
      </div>
    ) : null;

  const areaQuadro: React.CSSProperties = { position: "absolute", left: Q.left, top: Q.top, width: Q.w, height: Q.h, overflow: "hidden" };

  return (
    <AbsoluteFill style={{ backgroundColor: "#1E1E1C" }}>
      {/* JR, trecho a trecho */}
      {linha.map((t) => (
        <Sequence key={`c${t.indice}`} from={t.inicio} durationInFrames={t.frames} name={`Trecho ${t.indice + 1}: ${t.de}-${t.ate}s`}>
          <CameraCaixa src={fonte.cameraSrc} trecho={t} x={t.x ?? xPadrao} alturaFonte={alturaFonte} caixa={CAM} />
          {modoLongo ? null : <VozTrecho src={fonte.vozSrc} t={t} />}
        </Sequence>
      ))}
      {corte.segurarFim > 0 ? (
        <Sequence from={fimFala} name="Imagem parada (fecho)">
          <Freeze frame={0}>
            <CameraCaixa src={fonte.cameraSrc} trecho={ultimo} x={ultimo.x ?? xPadrao} alturaFonte={alturaFonte} caixa={CAM} parado />
          </Freeze>
        </Sequence>
      ) : null}

      {alturaRodape > 0 && !modoLongo ? <Rodape caixa={CAM} altura={H * alturaRodape} arroba={arroba} logo={logo} aviso={aviso} avisoSegundos={avisoSegundos} semMarca={vertical && corte.opcoes.marcaNoTopo} /> : null}


      {/* Papel (textura e rasgo) */}
      <QuadroPapel largura={Q.w} altura={Q.h} lado={vertical ? "baixo" : "direita"} />

      {/* O que o papel mostra, momento a momento */}
      {quadros.map((q, i) => (
        <Sequence key={`q${i}`} from={q.ini} durationInFrames={q.frames} name={`Quadro: ${q.titulo ?? q.etiqueta ?? i + 1}`}>
          <SaidaSuave frames={q.frames}>
            {q.papel === "campo" ? <PapelDoQuadro Q={Q} vertical={vertical} /> : null}
            <div style={areaQuadro}>
              {cabecalho(q.titulo, q.etiqueta, corte.opcoes.tituloImediato && q.ini === 0)}
              {q.pecas.map((p, k) => {
                const t = pecaNoTempo(p, q.ini);
                const som = somDe(p);
                return (
                  <Sequence key={k} from={t.de} name={`${p.peca}`}>
                    <Peca peca={p} passos={t.passos} quadro={Q} marcarEm={t.marcar} />
                    {som !== "nenhum" ? <Audio src={staticFile(SONS[som])} volume={VOLUME_SOM[som] ?? 0.3} /> : null}
                    {t.marcar !== undefined && corte.opcoes.sonsPapel ? (
                      <Sequence from={t.marcar} name="som marca-texto">
                        <Audio src={staticFile(SONS.marca)} volume={VOLUME_SOM.marca} />
                      </Sequence>
                    ) : null}
                  </Sequence>
                );
              })}
            </div>
          </SaidaSuave>
        </Sequence>
      ))}

      {corte.quadroFecho ? (
        <Sequence from={fimFala} name="Quadro do fecho">
          <div style={areaQuadro}>
            {cabecalho(corte.quadroFecho.titulo)}
            {corte.quadroFecho.pecas.map((p, k) => (
              <Sequence key={k} from={k * 4} name={p.peca}>
                <Peca peca={p} passos={[]} quadro={Q} />
              </Sequence>
            ))}
          </div>
          <Audio src={staticFile(SFX.pop)} volume={0.35} />
        </Sequence>
      ) : null}

      {vertical && corte.opcoes.marcaNoTopo ? <MarcaNoTopo Q={Q} topo={136} arroba={arroba} logo={logo} /> : null}

      {/* Legenda em faixa de papel */}
      <Sequence durationInFrames={fimFala} name="Legenda">
        <LegendaFaixa palavras={palavras} centroX={legenda.cx} centroY={legenda.cy} tamanhoFonte={legenda.tamanho} larguraMaxima={legenda.max} />
      </Sequence>
      {corte.quadroFecho?.faixa ? (
        <Sequence from={fimFala} name="Faixa do fecho">
          <LegendaFaixa textoFixo={corte.quadroFecho.faixa} centroX={legenda.cx} centroY={legenda.cy} tamanhoFonte={legenda.tamanho} larguraMaxima={legenda.max} />
        </Sequence>
      ) : null}

      {fonte.musicaSrc && !modoLongo ? (
        <Audio
          src={staticFile(fonte.musicaSrc)}
          trimBefore={seg(8)}
          volume={(f) => volumeMusica * interpolate(f, [0, 15, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
    </AbsoluteFill>
  );
};
