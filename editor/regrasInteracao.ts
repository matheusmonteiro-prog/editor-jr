import { conferirDuracao, conferirInicio, formatarInicio, type PlanoEditor } from "./regrasPlano";

// Regras de interação com a linha do tempo e com o teclado (pacote A). Sem React: dá para
// testar pelo Node. Reaproveitam as regras de regrasPlano.ts (início com 1 casa, duração
// conferida); quem aplica no plano continua sendo aplicarInicio / aplicarDuracao (as 3 vias).

// Encaixe em décimos de segundo (a mesma precisão do "inicio" m:ss.d).
export const emDecimos = (segundos: number): number => Math.round(segundos * 10) / 10;

// Ponto do mouse → segundo da régua (tempo ORIGINAL), preso entre 0 e o fim da régua.
// esquerda/largura: o retângulo do conteúdo da linha do tempo (com zoom, a largura cresce).
export const segundoDoPonto = (xCliente: number, esquerda: number, largura: number, regua: number): number => {
  if (!(largura > 0) || !(regua > 0)) return 0;
  const fracao = Math.min(1, Math.max(0, (xCliente - esquerda) / largura));
  return fracao * regua;
};

// Arrastar o bloco: início novo = início do começo do arraste + deslocamento, em décimos,
// nunca negativo. Devolve o texto "m:ss.d" (já conferido) ou null.
export const inicioArrastado = (inicioSegAntes: number, deltaSeg: number): string | null => {
  if (!Number.isFinite(inicioSegAntes) || !Number.isFinite(deltaSeg)) return null;
  const novo = Math.max(0, emDecimos(inicioSegAntes + deltaSeg));
  const texto = formatarInicio(novo);
  return conferirInicio(texto).ok ? texto : null;
};

// Puxar a ponta direita: duração nova em décimos, no mínimo 0,1 s (e pelo menos 1 quadro).
export const duracaoArrastada = (duracaoSegAntes: number, deltaSeg: number, fps: number): number | null => {
  if (!Number.isFinite(duracaoSegAntes) || !Number.isFinite(deltaSeg) || !(fps > 0)) return null;
  const nova = Math.max(0.1, emDecimos(duracaoSegAntes + deltaSeg));
  return conferirDuracao(String(nova), fps).ok ? nova : null;
};

// Pixels → segundos, com o tamanho atual do conteúdo (zoom incluído).
export const segundosDoDeslocamento = (deltaPx: number, largura: number, regua: number): number =>
  largura > 0 && regua > 0 ? (deltaPx / largura) * regua : 0;

// Zoom da linha do tempo: 1× (tudo na tela) até 32×, em passos de 1,5×.
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 32;
export const proximoZoom = (atual: number, direcao: 1 | -1): number => {
  const novo = direcao > 0 ? atual * 1.5 : atual / 1.5;
  const preso = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, novo));
  return Math.abs(preso - 1) < 0.01 ? 1 : Math.round(preso * 100) / 100;
};

// De quanto em quanto segundo a régua mostra número, para não amontoar.
export const passoDoRotulo = (pixelsPorSegundo: number): number => {
  if (pixelsPorSegundo >= 60) return 1;
  if (pixelsPorSegundo >= 25) return 2;
  if (pixelsPorSegundo >= 10) return 5;
  if (pixelsPorSegundo >= 4) return 10;
  return 30;
};

// Setas: quadro atual + passo, preso entre o primeiro e o último quadro.
export const quadroComPasso = (atual: number, passo: number, totalQuadros: number): number =>
  Math.min(Math.max(0, totalQuadros - 1), Math.max(0, Math.round(atual + passo)));

// Delete: efeitos de áudio que começam junto de um elemento (audio[].elemento = id). Apagar o
// elemento deixaria o efeito sem ponto de partida, então o editor recusa e avisa.
export const audiosQueUsam = (plano: PlanoEditor, id: string): string[] =>
  (plano.audio ?? []).filter((a) => a.elemento === id).map((a) => a.id);

// Remove o elemento (plano NOVO). Índice inválido ou elemento usado por áudio: devolve o MESMO
// plano (quem chama mostra o motivo com audiosQueUsam).
export const removerElemento = (plano: PlanoEditor, indice: number): PlanoEditor => {
  const el = plano.elementos[indice];
  if (!el || audiosQueUsam(plano, el.id).length > 0) return plano;
  return { ...plano, elementos: plano.elementos.filter((_, i) => i !== indice) };
};
