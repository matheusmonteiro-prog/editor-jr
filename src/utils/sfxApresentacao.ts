// Todos os pontos de efeito sonoro do vídeo de apresentação, num lugar só.
// Serve para (1) marcar cada som na timeline e (2) abaixar a música quando um
// efeito toca (ducking). Tudo em frames GLOBAIS do vídeo.
import { BLOCOS, CENAS } from "../dados/apresentacao";
import { FRAMES_CRUZAMENTO, fatiasSequencia } from "../components/apresentacao/FundoCenas";
import type { LinhaDoTempo } from "./linhaDoTempoApresentacao";
import { acharBloco, frameDaMarca } from "./linhaDoTempoApresentacao";
import { planoMoedas } from "./moedasApresentacao";

export type TipoSfx = "whoosh" | "tick" | "moeda" | "impacto" | "contador" | "ok" | "siga" | "sino" | "pop";

export type EventoSfx = {
  tipo: TipoSfx;
  nome: string; // aparece na timeline do Studio
  frame: number;
  volume: number;
  velocidade?: number; // playbackRate do som (padrão 1)
};

// Duração de cada arquivo em frames a 30 fps (medida com ffprobe em 20/10/2026).
// Rodada 9: "siga" usa o sfx-impacto, "sino" usa o sfx-tick e "pop" usa o sfx-ok cortado em 12 frames.
export const FRAMES_SFX: Record<TipoSfx, number> = {
  whoosh: 18,
  tick: 44,
  moeda: 33,
  impacto: 63,
  contador: 67,
  ok: 23,
  siga: 63,
  sino: 44,
  pop: 12,
};

// Frames até o ícone do bloco 07 terminar de desenhar (início do traço 2 + 14 de traço).
export const FRAMES_ICONE_PRONTO = 16;
// Frames entre o início do logo subindo (bloco 08) e o pulso dele.
export const FRAMES_ATE_PULSO_LOGO = 22;
// Frames entre o início de "MÉTODO JR." e o pico da escala.
export const FRAMES_ATE_PICO_MARCA = 6;

// Fecho do bloco 08 (rodada 5d, ancorado na cartela final desde a rodada 9): a cartela "EM BREVE" /
// "MÉTODO JR" fica parada e então os elementos saem em stagger e o logo vem em direção ao espectador.
export const FRAMES_CRESCER_LOGO = 22; // o logo cresce neste tempo; depois pulsa e fica estático
export const FRAMES_STAGGER_SAIDA = 3;

// Frame do bloco 08, RELATIVO ao bloco, em que a saída dos elementos (e o crescimento do logo) começa:
// depois do fim da fala (respostaInicio + respostaFrames) mais o hold da cartela.
export const saidaFechoRelativa = (linha: LinhaDoTempo): number => {
  const b08 = acharBloco(linha, "08");
  const cta = BLOCOS.find((b) => b.id === "08")?.elemento;
  return cta && cta.tipo === "cta" ? b08.respostaInicio + b08.respostaFrames + cta.cartela.fechoDepoisFrames : b08.duracao - 60;
};
export const inicioCrescerLogo = (linha: LinhaDoTempo): number => acharBloco(linha, "08").inicio + saidaFechoRelativa(linha);

// Frame global em que o logo final do bloco 08 começa a subir (para pousar junto com "MÉTODO JR").
export const inicioVoltaLogo = (linha: LinhaDoTempo, fps: number): number => {
  const b08 = acharBloco(linha, "08");
  const cta = BLOCOS.find((b) => b.id === "08")?.elemento;
  return cta && cta.tipo === "cta"
    ? b08.inicio + frameDaMarca(b08, cta.cartela.marcaEm, fps) - cta.cartela.logoSobeAntesFrames
    : b08.inicio + 4;
};

export const eventosSfx = (linha: LinhaDoTempo, fps: number): EventoSfx[] => {
  const ev: EventoSfx[] = [];

  linha.blocos.forEach((t, i) => {
    // whoosh em cada troca de bloco (8 vezes), junto do wipe diagonal.
    if (i > 0) ev.push({ tipo: "whoosh", nome: `whoosh ${t.id}`, frame: t.inicio - 4, volume: 0.5 });
    // tick na entrada de cada pílula de pergunta (8 vezes). Rodada 5: sem tick na abertura (00),
    // que era o da pílula "EM BREVE, NESTE CANAL".
    if (t.id !== "00") ev.push({ tipo: "tick", nome: `tick ${t.id}`, frame: t.inicio, volume: 0.3 });
  });

  BLOCOS.forEach((bloco) => {
    const t = acharBloco(linha, bloco.id);
    const resp = t.respostaInicio + 2;
    const el = bloco.elemento;

    // moeda: uma por queda, em todos os blocos com moeda (02, 06 e 08). Volume abaixo do contador (0,5).
    planoMoedas(bloco.moedas, t).forEach((m, i) =>
      ev.push({ tipo: "moeda", nome: `moeda ${bloco.id}.${i + 1}`, frame: t.inicio + m.inicio, volume: 0.25 }),
    );

    // contador: toca junto da contagem (do início ao fim dela, 67 frames).
    if (el.tipo === "contadorCards" || el.tipo === "contadorLista") {
      ev.push({ tipo: "contador", nome: `contador ${bloco.id}`, frame: t.inicio + resp, volume: 0.5 });
    }
    // ok: quando o check de cada card aparece (bloco 03).
    if (el.tipo === "cards") {
      el.cards.forEach((card, i) =>
        ev.push({
          tipo: "ok",
          nome: `ok ${bloco.id}.${i + 1}`,
          frame: t.inicio + Math.round(resp + t.respostaFrames * (card.emFracao ?? 0)) + 8,
          volume: 0.4,
        }),
      );
    }

    if (el.tipo === "contraste") {
      // impacto: o "DIFÍCIL" saindo (fim da risca) no bloco 05.
      if (el.depoisDoRisco === "recuar") {
        ev.push({ tipo: "impacto", nome: `impacto ${bloco.id}`, frame: t.inicio + resp + el.riscoAposFrames + el.duracaoRisco, volume: 0.5 });
      }
      // bloco 07: impacto em cada frase que entra (sem ticks nos ícones, rodada 5).
      (el.frases ?? []).forEach((f, i) => {
        const corte = t.inicio + t.respostaInicio + Math.round(f.emSegundos * fps);
        ev.push({ tipo: "impacto", nome: `impacto ${bloco.id}.${i + 1}`, frame: corte, volume: 0.5 });
        // ok: quando o ícone de check aparece (1ª frase do bloco 07).
        if (f.icone === "check") ev.push({ tipo: "ok", nome: `ok ${bloco.id}.${i + 1}`, frame: corte + 6, volume: 0.4 });
      });
    }

    if (el.tipo === "cta") {
      // Momento da fala (áudio 1, 2 ou 3, em segundos desde o início do arquivo) → frame GLOBAL.
      const noMarca = (m: { audio: 1 | 2 | 3; segundos: number }) => t.inicio + frameDaMarca(t, m, fps);
      // Rodada 9: sons dos grupos que caem. Volumes baixos: a voz manda. Sem arquivo, o evento fica mudo.
      ev.push({ tipo: "siga", nome: "impacto Siga", frame: noMarca(el.siga.entra), volume: 0.35 });
      ev.push({ tipo: "whoosh", nome: "whoosh seta", frame: noMarca(el.compartilhe.seta), volume: 0.2 });
      el.compartilhe.pessoas.forEach((m, i) =>
        ev.push({ tipo: "pop", nome: `pop pessoa ${i + 1}`, frame: noMarca(m), volume: 0.15, velocidade: 1 + i * 0.1 }),
      );
      ev.push({ tipo: "sino", nome: "sino notificações", frame: noMarca(el.notificacoes.balanco), volume: 0.3 });
      // Cartela final: impacto no INÍCIO da palavra "Método JR" (o logo pousa junto; um impacto só, sem dobrar).
      ev.push({ tipo: "impacto", nome: "impacto MÉTODO JR", frame: noMarca(el.cartela.marcaEm), volume: 0.5 });
    }
  });

  // Rodada 6: whoosh mais baixo em cada troca de vídeo de uma cena "sequencia" (bloco 05).
  CENAS.forEach((cena) => {
    if (cena.fonte.tipo !== "sequencia") return;
    const de = acharBloco(linha, cena.blocoInicial).inicio;
    const ultimo = acharBloco(linha, cena.blocoFinal);
    const inicios = fatiasSequencia(cena.fonte.arquivos.length, ultimo.inicio + ultimo.duracao - de);
    inicios.slice(1).forEach((inicio, i) =>
      ev.push({ tipo: "whoosh", nome: `whoosh clipe ${cena.blocoInicial}.${i + 2}`, frame: de + inicio - FRAMES_CRUZAMENTO, volume: 0.35 }),
    );
  });

  // Fecho do bloco 08: whoosh no início da saída dos elementos; impacto no pulso final do logo.
  ev.push({ tipo: "whoosh", nome: "whoosh saída do fecho", frame: inicioCrescerLogo(linha), volume: 0.5 });
  ev.push({ tipo: "impacto", nome: "impacto logo final", frame: inicioCrescerLogo(linha) + FRAMES_CRESCER_LOGO, volume: 0.5 });

  return ev.sort((a, b) => a.frame - b.frame);
};

