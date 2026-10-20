// Todos os pontos de efeito sonoro do vídeo de apresentação, num lugar só.
// Serve para (1) marcar cada som na timeline e (2) abaixar a música quando um
// efeito toca (ducking). Tudo em frames GLOBAIS do vídeo.
import { BLOCOS } from "../dados/apresentacao";
import type { LinhaDoTempo } from "./linhaDoTempoApresentacao";
import { acharBloco } from "./linhaDoTempoApresentacao";
import { planoMoedas } from "./moedasApresentacao";

export type TipoSfx = "whoosh" | "tick" | "moeda" | "impacto" | "contador" | "ok";

export type EventoSfx = {
  tipo: TipoSfx;
  nome: string; // aparece na timeline do Studio
  frame: number;
  volume: number;
};

// Duração de cada arquivo em frames a 30 fps (medida com ffprobe em 20/10/2026).
export const FRAMES_SFX: Record<TipoSfx, number> = { whoosh: 18, tick: 44, moeda: 33, impacto: 63, contador: 67, ok: 23 };

// Frames até o ícone do bloco 07 terminar de desenhar (início do traço 2 + 14 de traço).
export const FRAMES_ICONE_PRONTO = 16;
// Frames entre o início do logo subindo (bloco 08) e o pulso dele.
export const FRAMES_ATE_PULSO_LOGO = 22;
// Frames entre o início de "MÉTODO JR." e o pico da escala.
export const FRAMES_ATE_PICO_MARCA = 6;

// Frame global em que o logo final do bloco 08 começa a subir.
export const inicioVoltaLogo = (linha: LinhaDoTempo): number => {
  const b08 = acharBloco(linha, "08");
  const cta = BLOCOS.find((b) => b.id === "08")?.elemento;
  return cta && cta.tipo === "cta" ? b08.inicio + b08.respostaInicio + Math.round(cta.logoEmSegundos * 30) : b08.inicio + 4;
};

export const eventosSfx = (linha: LinhaDoTempo): EventoSfx[] => {
  const ev: EventoSfx[] = [];

  linha.blocos.forEach((t, i) => {
    // whoosh em cada troca de bloco (8 vezes), junto do wipe diagonal.
    if (i > 0) ev.push({ tipo: "whoosh", nome: `whoosh ${t.id}`, frame: t.inicio - 4, volume: 0.5 });
    // tick na entrada de cada pílula (8 perguntas + a chamada "em breve" da abertura).
    ev.push({ tipo: "tick", nome: `tick ${t.id}`, frame: t.inicio + (t.id === "00" ? 2 : 0), volume: 0.3 });
  });

  BLOCOS.forEach((bloco) => {
    const t = acharBloco(linha, bloco.id);
    const resp = t.respostaInicio + 2;
    const el = bloco.elemento;

    // moeda: só no bloco 08. Nos blocos dos contadores (02 e 06) vale o som de contagem.
    if (bloco.id === "08") {
      planoMoedas(bloco.moedas, t).forEach((m, i) =>
        ev.push({ tipo: "moeda", nome: `moeda ${bloco.id}.${i + 1}`, frame: t.inicio + m.inicio, volume: 0.4 }),
      );
    }

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
          frame: t.inicio + Math.round(resp + t.respostaFrames * card.emFracao) + 8,
          volume: 0.4,
        }),
      );
    }

    if (el.tipo === "contraste") {
      // impacto: o "DIFÍCIL" saindo (fim da risca) no bloco 05.
      if (el.depoisDoRisco === "recuar") {
        ev.push({ tipo: "impacto", nome: `impacto ${bloco.id}`, frame: t.inicio + resp + el.riscoAposFrames + el.duracaoRisco, volume: 0.5 });
      }
      // bloco 07: impacto em cada frase que entra + tick quando o ícone termina de desenhar.
      (el.frases ?? []).forEach((f, i) => {
        const corte = t.inicio + t.respostaInicio + Math.round(f.emSegundos * 30);
        ev.push({ tipo: "impacto", nome: `impacto ${bloco.id}.${i + 1}`, frame: corte, volume: 0.5 });
        ev.push({ tipo: "tick", nome: `tick ícone ${bloco.id}.${i + 1}`, frame: corte + FRAMES_ICONE_PRONTO, volume: 0.3 });
        // ok: quando o ícone de check aparece (1ª frase do bloco 07).
        if (f.icone === "check") ev.push({ tipo: "ok", nome: `ok ${bloco.id}.${i + 1}`, frame: corte + 6, volume: 0.4 });
      });
    }

    if (el.tipo === "cta") {
      const audio = t.inicio + t.respostaInicio;
      // tick em cada palavra de "SIGA ESTE CANAL".
      el.chamada.split(/\s+/).forEach((_, i) =>
        ev.push({ tipo: "tick", nome: `tick palavra ${i + 1}`, frame: t.inicio + resp + i * 3, volume: 0.4 }),
      );
      ev.push({ tipo: "whoosh", nome: "whoosh linha dourada", frame: audio + Math.round(el.linhaDouradaEmSegundos * 30), volume: 0.5 });
      ev.push({ tipo: "impacto", nome: "impacto logo", frame: inicioVoltaLogo(linha) + FRAMES_ATE_PULSO_LOGO, volume: 0.5 });
      ev.push({ tipo: "impacto", nome: "impacto MÉTODO JR", frame: audio + Math.round(el.marcaEmSegundos * 30) + FRAMES_ATE_PICO_MARCA, volume: 0.5 });
    }
  });

  return ev.sort((a, b) => a.frame - b.frame);
};

