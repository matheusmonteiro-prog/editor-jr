import type { TrechoCortado } from "../src/utils/tempoCortado";
import { conferirInicio, fpsDoPlano, type PlanoEditor } from "./regrasPlano";

// Linha do tempo (fatia 4). Sem React: dá para testar pelo Node.
//
// RÉGUA EM TEMPO ORIGINAL (antes dos cortes), igual ao "inicio" do plano. O Player trabalha em
// quadros do vídeo JÁ CORTADO; para ir de um para o outro:
//   original → cortado: criarParaFrameCortado (src/utils/tempoCortado.ts, só importado)
//   cortado → original: paraSegundoOriginal (abaixo, inversa feita aqui no editor)

export type Bloco = {
  indice: number; // posição do elemento em plano.elementos
  id: string;
  rotulo: string;
  inicioSeg: number; // tempo original
  duracaoSeg: number; // a duração que o vídeo usa de verdade (duracaoFrames tem prioridade)
  fimSeg: number;
  faixa: number; // 0 = primeira faixa
  esquerdaPct: number; // posição na régua, 0 a 100
  larguraPct: number;
};

// Duração real, mesma prioridade do PlanoComposicao: duracaoFrames ?? round(duracao * fps).
const duracaoReal = (el: PlanoEditor["elementos"][number], fps: number) =>
  (el.duracaoFrames ?? Math.round(el.duracao * fps)) / fps;

// Tamanho da régua: o fim do último trecho original, ou o fim do último elemento (o maior).
export const tamanhoDaRegua = (plano: PlanoEditor, trechos: TrechoCortado[]): number => {
  const fps = fpsDoPlano(plano);
  const fimTrechos = trechos.length > 0 ? Math.max(...trechos.map((t) => t.fim)) : 0;
  let fimElementos = 0;
  if (fps !== null) {
    for (const el of plano.elementos) {
      const i = conferirInicio(el.inicio);
      if (i.ok) fimElementos = Math.max(fimElementos, i.segundos + duracaoReal(el, fps));
    }
  }
  return Math.max(fimTrechos, fimElementos, 1);
};

// Blocos e faixas. Elementos que se cruzam no tempo vão para faixas diferentes; cada elemento
// entra na primeira faixa livre (ordem: quem começa antes; empate, a ordem da lista).
export const calcularBlocos = (plano: PlanoEditor, trechos: TrechoCortado[]): { blocos: Bloco[]; faixas: number; regua: number } => {
  const fps = fpsDoPlano(plano);
  const regua = tamanhoDaRegua(plano, trechos);
  if (fps === null) return { blocos: [], faixas: 0, regua };

  const base = plano.elementos.flatMap((el, indice) => {
    const i = conferirInicio(el.inicio);
    if (!i.ok) return []; // início inválido não vira bloco (nem vai ao Player)
    const duracaoSeg = duracaoReal(el, fps);
    const rotulo = Array.isArray(el.componente) ? el.componente.join(" + ") : String(el.componente);
    return [{ indice, id: el.id, rotulo, inicioSeg: i.segundos, duracaoSeg, fimSeg: i.segundos + duracaoSeg }];
  });

  const ordem = [...base].sort((a, b) => a.inicioSeg - b.inicioSeg || a.indice - b.indice);
  const fimDaFaixa: number[] = [];
  const faixaDe = new Map<number, number>();
  for (const b of ordem) {
    // Encostar (fim == início do próximo) não é cruzar: pode ficar na mesma faixa.
    let faixa = fimDaFaixa.findIndex((fim) => fim <= b.inicioSeg + 1e-9);
    if (faixa === -1) {
      faixa = fimDaFaixa.length;
      fimDaFaixa.push(b.fimSeg);
    } else {
      fimDaFaixa[faixa] = b.fimSeg;
    }
    faixaDe.set(b.indice, faixa);
  }

  const blocos = base.map((b) => ({
    ...b,
    faixa: faixaDe.get(b.indice) ?? 0,
    esquerdaPct: (b.inicioSeg / regua) * 100,
    larguraPct: (b.duracaoSeg / regua) * 100,
  }));
  return { blocos, faixas: fimDaFaixa.length, regua };
};

// Quadro do Player (vídeo cortado) → segundo do vídeo original. Inversa do criarParaFrameCortado:
// os trechos, na ordem do array, formam o vídeo cortado. Com gancho (o mesmo tempo original em
// dois lugares), cada quadro cai num trecho só, então a ida e volta continua certa aqui.
// O trecho é escolhido pelo MEIO do quadro: o criarParaFrameCortado arredonda o início de um
// trecho para o quadro mais próximo, que pode começar milésimos antes da emenda (medido no 0926:
// quadro 477 = 15,9000 s, trecho começa em 15,9081 s). Pelo começo do quadro, ele cairia no fim do
// trecho anterior, do outro lado do silêncio cortado (erro de mais de 1 s).
export const paraSegundoOriginal = (trechos: TrechoCortado[], frame: number, fps: number): number => {
  const t = frame / fps;
  const meio = (frame + 0.5) / fps;
  let acumulado = 0;
  for (const trecho of trechos) {
    const tamanho = trecho.fim - trecho.inicio;
    if (meio < acumulado + tamanho) return trecho.inicio + Math.min(tamanho, Math.max(0, t - acumulado));
    acumulado += tamanho;
  }
  const ultimo = trechos[trechos.length - 1];
  return ultimo ? ultimo.fim : t; // depois do fim: fica no fim do último trecho
};

// Marcas da régua: um tique por segundo, número a cada "passoRotulo" segundos.
export const marcasDaRegua = (regua: number, passoRotulo = 5): { seg: number; pct: number; rotulo: string | null }[] => {
  const marcas = [];
  for (let s = 0; s <= Math.floor(regua); s++) {
    marcas.push({ seg: s, pct: (s / regua) * 100, rotulo: s % passoRotulo === 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : null });
  }
  return marcas;
};
