// Moedas 3D caindo no fundo dos blocos 02, 03 e 06. As posições e os tempos
// saem de random(semente) do Remotion: o mesmo bloco dá sempre o mesmo
// desenho (reproduzível). Mesma função serve para desenhar as moedas e para
// marcar o ponto do som de moeda na timeline.
import { random } from "remotion";
import type { MoedasBloco } from "../dados/apresentacao";
import type { BlocoNoTempo } from "./linhaDoTempoApresentacao";

export type MoedaPlano = {
  inicio: number; // frame relativo ao bloco
  x: number; // fração da largura
  tamanho: number; // fração da largura
  duracao: number; // frames da queda
};

export const planoMoedas = (cfg: MoedasBloco | undefined, t: BlocoNoTempo): MoedaPlano[] => {
  if (!cfg) return [];
  const resp = t.respostaInicio + 2;
  const lista: MoedaPlano[] = [];

  // A moeda "entre um card e outro" (pedida na 1ª rodada) continua, no momento da fala.
  if (cfg.fixa) {
    lista.push({
      inicio: Math.round(resp + t.respostaFrames * cfg.fixa.emFracao),
      x: cfg.fixa.x,
      tamanho: 0.17,
      duracao: cfg.fixa.duracao ?? 28,
    });
  }

  // As aleatórias: uma por faixa de tempo, para não caírem todas juntas.
  const de = 12;
  const ate = Math.max(de + 40, t.duracao - 50);
  const faixa = (ate - de) / cfg.aleatorias;
  for (let i = 0; i < cfg.aleatorias; i++) {
    const r = (k: string) => random(`${cfg.semente}-${k}-${i}`);
    let x = 0.12 + 0.76 * r("x");
    // Longe da moeda fixa, para as duas não se sobreporem.
    if (cfg.fixa && Math.abs(x - cfg.fixa.x) < 0.2) {
      x = cfg.fixa.x > 0.5 ? 0.14 + 0.28 * r("x2") : 0.58 + 0.28 * r("x2");
    }
    lista.push({
      inicio: Math.round(de + faixa * i + r("t") * faixa * 0.7),
      x,
      tamanho: 0.11 + 0.08 * r("s"),
      duracao: Math.round(22 + 12 * r("d")),
    });
  }
  return lista;
};
