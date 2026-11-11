import type { TrechoCortado } from "../src/utils/tempoCortado";
import { conferirInicio, fpsDoPlano, type PlanoEditor } from "./regrasPlano";
import { rotuloDoComponente } from "./nomes";

// Linha do tempo (fatia 4). Sem React: dá para testar pelo Node.
//
// RÉGUA EM TEMPO ORIGINAL (antes dos cortes), igual ao "inicio" do plano. O Player trabalha em
// quadros do vídeo JÁ CORTADO; para ir de um para o outro:
//   original → cortado: criarParaFrameCortado (src/utils/tempoCortado.ts, só importado)
//   cortado → original: paraSegundoOriginal (abaixo, inversa feita aqui no editor)

export type Bloco = {
  indice: number; // posição do elemento em plano.elementos
  id: string;
  rotulo: string; // nome amigável da peça (nomes.ts); peça dupla: "Imagem + Legenda"
  inicioSeg: number; // tempo original
  duracaoSeg: number; // a duração que o vídeo usa de verdade (duracaoFrames tem prioridade)
  fimSeg: number;
  faixa: number; // 0 = atrás; maior = mais à frente (ver calcularBlocos)
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

// Dois intervalos se cruzam? Encostar (fim == início do outro) não é cruzar.
export const seCruzam = (a: { inicioSeg: number; fimSeg: number }, b: { inicioSeg: number; fimSeg: number }): boolean =>
  a.inicioSeg < b.fimSeg - 1e-9 && b.inicioSeg < a.fimSeg - 1e-9;

// Intervalo de cada elemento (na ordem do array), ou null se o início for inválido ou o plano
// não tiver fps. É o mesmo cálculo que desenha os blocos e que decide a ordem das camadas.
export const intervalosDosElementos = (plano: PlanoEditor): ({ inicioSeg: number; fimSeg: number } | null)[] => {
  const fps = fpsDoPlano(plano);
  return plano.elementos.map((el) => {
    const i = conferirInicio(el.inicio);
    if (!i.ok || fps === null) return null;
    return { inicioSeg: i.segundos, fimSeg: i.segundos + duracaoReal(el, fps) };
  });
};

// Blocos e faixas. A ORDEM DO ARRAY define quem fica na frente (o PlanoComposicao desenha os
// elementos nessa ordem, um por cima do outro). Por isso a faixa acompanha as camadas: um
// elemento que se cruza no tempo com outros mais antigos da lista vai para uma faixa acima da
// mais alta deles; quem não se cruza com nenhum anterior fica na faixa 0. Faixa maior = mais à
// frente (a tela mostra a faixa mais alta no topo).
export const calcularBlocos = (plano: PlanoEditor, trechos: TrechoCortado[]): { blocos: Bloco[]; faixas: number; regua: number } => {
  const fps = fpsDoPlano(plano);
  const regua = tamanhoDaRegua(plano, trechos);
  if (fps === null) return { blocos: [], faixas: 0, regua };

  const intervalos = intervalosDosElementos(plano);
  const faixaDe: number[] = [];
  let faixas = 0;
  plano.elementos.forEach((_, i) => {
    const meu = intervalos[i];
    if (!meu) return;
    let acima = -1;
    for (let j = 0; j < i; j++) {
      const outro = intervalos[j];
      if (outro && seCruzam(meu, outro)) acima = Math.max(acima, faixaDe[j]);
    }
    faixaDe[i] = acima + 1;
    faixas = Math.max(faixas, faixaDe[i] + 1);
  });

  const blocos: Bloco[] = [];
  plano.elementos.forEach((el, indice) => {
    const iv = intervalos[indice];
    if (!iv) return; // início inválido não vira bloco (nem vai ao Player)
    const duracaoSeg = iv.fimSeg - iv.inicioSeg;
    blocos.push({
      indice,
      id: el.id,
      rotulo: rotuloDoComponente(el.componente),
      inicioSeg: iv.inicioSeg,
      duracaoSeg,
      fimSeg: iv.fimSeg,
      faixa: faixaDe[indice],
      esquerdaPct: (iv.inicioSeg / regua) * 100,
      larguraPct: (duracaoSeg / regua) * 100,
    });
  });
  return { blocos, faixas, regua };
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
