import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { COR_CORTE, CURVA_CORTE } from "../components/cortes/estiloCortes";
import { QuadroPapel } from "../components/cortes/QuadroPapel";
import { EtiquetaAssunto } from "../components/cortes/EtiquetaAssunto";
import { LegendaFaixa } from "../components/cortes/LegendaFaixa";
import { FONTES } from "./fontes";
import { normalizar, SFX, VozTrecho } from "./CorteCurto";
import { CameraCaixa, Peca, Rodape, SaidaSuave, SONS, SOM_PADRAO, VOLUME_SOM, type Caixa, type NomeSom } from "./CorteDividido";
import { corteSchema, duracaoCorte, montarLinha, paraCorte, seg, type PecaQuadro } from "./receita";

// TESTE (12/11/2026): modelo 1 (papel explicativo, 2810-01b) 100% mantido, com CONTROLE DE CÂMERA:
// a cada quadro o JR muda de lugar e de tamanho (embaixo clássico, janela de papel rasgado à esquerda
// ou à direita, no alto com o papel embaixo, mais perto). As peças do papel ocupam o espaço que sobra.
// O CorteDividido aprovado não muda (só passou a exportar as peças que este arquivo reaproveita).

export const corteDivididoLivreSchema = z.object({
  video: z.string(),
  xPadrao: z.number().min(0).max(1).default(0.5),
  corte: corteSchema,
  volumeMusica: z.number().min(0).max(0.3).default(0.06),
  arroba: z.string().default("jroinvestidorsertanejo"),
  logo: z.string().default("images/logo-jr.png"),
  aviso: z.string().default("Este conteúdo tem caráter exclusivamente educacional."),
  avisoSegundos: z.number().min(1).max(8).default(3.6),
});
type Props = z.infer<typeof corteDivididoLivreSchema>;

const W = 1080;
const H = 1920;
const ALTURA_FONTE = 0.64; // chapéu, rosto e ombros; nunca a faixa de baixo da fonte (textos do v1)

// Enquadramentos. cam = onde fica o JR; papel = área das peças; rasgo = de que lado o papel "rasga"
// sobre a câmera; legenda = altura da faixa de legenda.
type Enquadramento = { cam: Caixa; papel: Caixa; rasgo: "cima" | "baixo" | "moldura"; legenda: number };
const ENQ: Record<string, Enquadramento> = {
  classico: { cam: { left: 0, top: 902, w: W, h: H - 902 }, papel: { left: 0, top: 0, w: W, h: 902 }, rasgo: "cima", legenda: 908 },
  perto: { cam: { left: 0, top: 760, w: W, h: H - 760 }, papel: { left: 0, top: 90, w: W, h: 680 }, rasgo: "cima", legenda: 766 },
  janelaEsq: { cam: { left: 48, top: 1000, w: 560, h: 580 }, papel: { left: 0, top: 0, w: W, h: 960 }, rasgo: "moldura", legenda: 1660 },
  janelaDir: { cam: { left: 472, top: 1000, w: 560, h: 580 }, papel: { left: 0, top: 0, w: W, h: 960 }, rasgo: "moldura", legenda: 1660 },
  alto: { cam: { left: 0, top: 0, w: W, h: 860 }, papel: { left: 0, top: 860, w: W, h: 840 }, rasgo: "baixo", legenda: 866 },
};
// Um enquadramento por quadro do 2810-01b (ordem da receita) e o do fecho.
const PLANO = ["classico", "janelaEsq", "alto", "janelaDir", "perto", "janelaEsq", "alto"];
const PLANO_FECHO = "classico";

const rnd = (s: number) => {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Borda irregular (papel rasgado) ao longo de uma linha horizontal.
const serrilha = (x0: number, x1: number, y: number, amp: number, semente: number, dir: 1 | -1) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1 + 0.1; x += 8) pts.push(`${x.toFixed(1)},${(y + dir * rnd(semente + x * 0.37) * amp).toFixed(1)}`);
  return pts;
};

// Papel rasgado por cima da câmera: faixa em cima, faixa embaixo ou moldura com fita adesiva.
const Rasgo: React.FC<{ e: Enquadramento; opacidade: number; semente: number }> = ({ e, opacidade, semente }) => {
  const { cam } = e;
  const cor = COR_CORTE.papel;
  const sombra = "drop-shadow(0 5px 8px rgba(0,0,0,0.35))";
  if (e.rasgo === "cima" || e.rasgo === "baixo") {
    const cima = e.rasgo === "cima";
    const yBorda = cima ? cam.top + 6 : cam.top + cam.h - 6;
    const dir = cima ? 1 : -1;
    const fibra = serrilha(0, W, yBorda + dir * 10, 24, semente + 50, dir as 1 | -1);
    const papel = serrilha(0, W, yBorda, 24, semente, dir as 1 | -1);
    const base = cima ? cam.top - 40 : cam.top + cam.h + 40;
    return (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: opacidade, filter: sombra }}>
        <polygon points={[`0,${base}`, ...fibra, `${W},${base}`].join(" ")} fill="#F7F2E8" />
        <polygon points={[`0,${base}`, ...papel, `${W},${base}`].join(" ")} fill={cor} />
      </svg>
    );
  }
  // moldura: papel claro com borda de fora rasgada, buraco na câmera, e duas fitas
  const m = 22;
  const x0 = cam.left - m;
  const x1 = cam.left + cam.w + m;
  const y0 = cam.top - m;
  const y1 = cam.top + cam.h + m;
  const fora: string[] = [];
  for (let x = x0; x <= x1; x += 8) fora.push(`${x},${y0 - rnd(semente + x) * 8}`);
  for (let y = y0; y <= y1; y += 8) fora.push(`${x1 + rnd(semente + y * 1.3) * 8},${y}`);
  for (let x = x1; x >= x0; x -= 8) fora.push(`${x},${y1 + rnd(semente + x * 1.7) * 8}`);
  for (let y = y1; y >= y0; y -= 8) fora.push(`${x0 - rnd(semente + y * 2.1) * 8},${y}`);
  const dentro = `M${cam.left},${cam.top} L${cam.left},${cam.top + cam.h} L${cam.left + cam.w},${cam.top + cam.h} L${cam.left + cam.w},${cam.top} Z`;
  const fita = (cx: number, cy: number, rot: number) => (
    <rect x={cx - 60} y={cy - 18} width={120} height={36} fill="rgba(214,191,152,0.82)" transform={`rotate(${rot} ${cx} ${cy})`} />
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: opacidade }}>
      <path d={`M${fora.join(" L")} Z ${dentro}`} fill={COR_CORTE.papelClaro} fillRule="evenodd" style={{ filter: sombra }} />
      {fita(cam.left + 30, cam.top - 6, -32)}
      {fita(cam.left + cam.w - 30, cam.top - 6, 32)}
    </svg>
  );
};

export const CorteDivididoLivre: React.FC<Props> = ({ video, xPadrao, corte, volumeMusica, arroba, logo, aviso, avisoSegundos }) => {
  const frame = useCurrentFrame();
  const { width: largura } = useVideoConfig();
  const fonte = FONTES[video];
  const linha = useMemo(() => montarLinha(corte), [corte]);
  const total = duracaoCorte(corte);
  const ultimo = linha[linha.length - 1];
  const fimFala = ultimo.inicio + ultimo.frames;
  const quadro = (t: number) => paraCorte(linha, t);

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

  const quadros = corte.quadros.flatMap((q, idx) => {
    const ini = quadro(q.de);
    if (ini === null) return [];
    const fimFonte = quadro(q.ate - 1 / 30);
    const fim = Math.min(fimFonte === null ? ini + seg(q.ate - q.de) : fimFonte + 1, fimFala);
    return [{ ...q, ini, frames: Math.max(6, fim - ini), enq: ENQ[q.enquadramento ?? PLANO[idx] ?? "classico"] }];
  });
  // linha do tempo dos enquadramentos (inclui o fecho)
  const marcos = [...quadros.map((q) => ({ ini: q.ini, enq: q.enq })), { ini: fimFala, enq: ENQ[PLANO_FECHO] }];
  let k = 0;
  marcos.forEach((m, i) => {
    if (frame >= m.ini) k = i;
  });
  const atual = marcos[k].enq;
  const antes = marcos[Math.max(0, k - 1)].enq;
  const p = k === 0 ? 1 : interpolate(frame - marcos[k].ini, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA_CORTE });
  const mix = (a: number, b: number) => a + (b - a) * p;
  const CAM: Caixa = { left: mix(antes.cam.left, atual.cam.left), top: mix(antes.cam.top, atual.cam.top), w: mix(antes.cam.w, atual.cam.w), h: mix(antes.cam.h, atual.cam.h) };
  const legendaY = mix(antes.legenda, atual.legenda);

  const pecaNoTempo = (pc: PecaQuadro, iniQuadro: number) => {
    const ini = pc.em === undefined ? iniQuadro : (quadro(pc.em) ?? iniQuadro);
    const passos = pc.passos.map((t) => (quadro(t) ?? ini) - ini);
    const marcar = pc.marcar === undefined ? undefined : (quadro(pc.marcar) ?? ini) - ini;
    return { de: ini - iniQuadro, passos, marcar };
  };
  const somDe = (pc: PecaQuadro): NomeSom | "nenhum" => (pc.som === "auto" ? (corte.opcoes.sonsPapel ? SOM_PADRAO[pc.peca] : "nenhum") : pc.som);

  const cabecalho = (Q: Caixa, titulo?: string, etiqueta?: string) =>
    titulo ? (
      <div style={{ position: "absolute", top: Q.top === 0 ? Q.h * 0.07 : 40, left: 0, width: Q.w, display: "flex", justifyContent: "center" }}>
        <EtiquetaAssunto texto={titulo} tamanho="grande" largura={Q.w} />
      </div>
    ) : etiqueta ? (
      <div style={{ position: "absolute", top: Q.top === 0 ? Math.max(130, Q.h * 0.055) : 50, left: Q.w * 0.045 }}>
        <EtiquetaAssunto texto={etiqueta} largura={Q.w} />
      </div>
    ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: COR_CORTE.papel }}>
      {/* papel inteiro ao fundo (textura do modelo 1) */}
      <QuadroPapel largura={W} altura={H} alturaRasgo={0} />

      {/* JR, trecho a trecho, na caixa do enquadramento atual */}
      {linha.map((t) => (
        <Sequence key={`c${t.indice}`} from={t.inicio} durationInFrames={t.frames} name={`Trecho ${t.indice + 1}`}>
          <CameraCaixa src={fonte.cameraSrc} trecho={t} x={t.x ?? xPadrao} alturaFonte={ALTURA_FONTE} caixa={CAM} />
          <VozTrecho src={fonte.vozSrc} t={t} />
        </Sequence>
      ))}
      {corte.segurarFim > 0 ? (
        <Sequence from={fimFala} name="Imagem parada (fecho)">
          <Freeze frame={0}>
            <CameraCaixa src={fonte.cameraSrc} trecho={ultimo} x={ultimo.x ?? xPadrao} alturaFonte={ALTURA_FONTE} caixa={CAM} parado />
          </Freeze>
        </Sequence>
      ) : null}

      {/* papel rasgado sobre a câmera: o de antes sai, o novo entra */}
      {k > 0 && p < 1 ? <Rasgo e={antes} opacidade={1 - p} semente={k * 13} /> : null}
      <Rasgo e={atual} opacidade={p} semente={(k + 1) * 13} />

      {/* rodapé do modelo 1 (aviso no começo e no fim, logo + @ no meio), sobre a largura toda */}
      <Rodape caixa={{ left: 0, top: 0, w: W, h: H }} altura={H * 0.11} arroba={arroba} logo={logo} aviso={aviso} avisoSegundos={avisoSegundos} />

      {/* o que o papel mostra, no espaço que sobra */}
      {quadros.map((q, i) => {
        const Q = q.enq.papel;
        return (
          <Sequence key={`q${i}`} from={q.ini} durationInFrames={q.frames} name={`Quadro: ${q.titulo ?? q.etiqueta ?? i + 1} (${PLANO[i]})`}>
            <SaidaSuave frames={q.frames}>
              <div style={{ position: "absolute", left: Q.left, top: Q.top, width: Q.w, height: Q.h, overflow: "hidden" }}>
                {cabecalho(Q, q.titulo, q.etiqueta)}
                {q.pecas.map((pc, j) => {
                  const t = pecaNoTempo(pc, q.ini);
                  const som = somDe(pc);
                  return (
                    <Sequence key={j} from={t.de} name={pc.peca}>
                      <Peca peca={pc} passos={t.passos} quadro={Q} marcarEm={t.marcar} />
                      {som !== "nenhum" ? <Audio src={staticFile(SONS[som])} volume={VOLUME_SOM[som] ?? 0.3} /> : null}
                    </Sequence>
                  );
                })}
              </div>
            </SaidaSuave>
            {i > 0 ? <Audio src={staticFile(SONS.papel)} volume={0.3} /> : null}
          </Sequence>
        );
      })}

      {corte.quadroFecho ? (
        <Sequence from={fimFala} name="Quadro do fecho">
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: ENQ[PLANO_FECHO].papel.h, overflow: "hidden" }}>
            {cabecalho(ENQ[PLANO_FECHO].papel, corte.quadroFecho.titulo)}
            {corte.quadroFecho.pecas.map((pc, j) => (
              <Sequence key={j} from={j * 4} name={pc.peca}>
                <Peca peca={pc} passos={[]} quadro={ENQ[PLANO_FECHO].papel} />
              </Sequence>
            ))}
          </div>
          <Audio src={staticFile(SFX.pop)} volume={0.35} />
        </Sequence>
      ) : null}

      {/* legenda em faixa de papel, na divisa do enquadramento */}
      <Sequence durationInFrames={fimFala} name="Legenda">
        <LegendaFaixa palavras={palavras} centroX={largura / 2} centroY={legendaY} tamanhoFonte={0.068} larguraMaxima={largura * 0.9} />
      </Sequence>
      {corte.quadroFecho?.faixa ? (
        <Sequence from={fimFala} name="Faixa do fecho">
          <LegendaFaixa textoFixo={corte.quadroFecho.faixa} centroX={largura / 2} centroY={ENQ[PLANO_FECHO].legenda} tamanhoFonte={0.068} larguraMaxima={largura * 0.9} />
        </Sequence>
      ) : null}

      {fonte.musicaSrc ? (
        <Audio
          src={staticFile(fonte.musicaSrc)}
          trimBefore={seg(8)}
          volume={(f) => volumeMusica * interpolate(f, [0, 15, total - 20, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
    </AbsoluteFill>
  );
};
