import type { Plano } from "../src/PlanoComposicao";

// Regras do editor (fatia 2). Sem React: dá para testar pelo Node.
// Nada aqui grava arquivo: tudo devolve um plano NOVO (o original não muda).

// O JSON do plano tem "fps", mas o tipo Plano do PlanoComposicao não declara esse campo.
export type PlanoEditor = Plano & { fps?: number };
export type ElementoEditor = PlanoEditor["elementos"][number];

// CÓPIA da regra do paraSegundos de src/PlanoComposicao.tsx (decisão do Matheus, 11/11/2026:
// não tocar em src/). Se a regra mudar lá, mudar aqui também.
const REGRA_TEMPO = /^(\d+):(\d{1,2})(?:\.(\d))?$/;

export type ResultadoInicio = { ok: true; segundos: number } | { ok: false; erro: string };

export const conferirInicio = (texto: string): ResultadoInicio => {
  const m = REGRA_TEMPO.exec(texto);
  if (!m) {
    return {
      ok: false,
      erro: 'Use "m:ss" ou "m:ss.d" (ex.: 0:05 ou 0:05.4). Um dígito depois do ponto, sem vírgula.',
    };
  }
  if (Number(m[2]) >= 60) return { ok: false, erro: "Os segundos precisam ser menores que 60." };
  return { ok: true, segundos: Number(m[1]) * 60 + Number(m[2]) + (m[3] === undefined ? 0 : Number(m[3]) / 10) };
};

// fps lido do plano (nunca fixo). null = o plano não tem fps válido.
export const fpsDoPlano = (plano: PlanoEditor): number | null =>
  typeof plano.fps === "number" && Number.isFinite(plano.fps) && plano.fps > 0 ? plano.fps : null;

export type ResultadoDuracao = { ok: true; segundos: number; frames: number } | { ok: false; erro: string };

export const conferirDuracao = (texto: string, fps: number): ResultadoDuracao => {
  const segundos = Number(texto.replace(",", "."));
  if (texto.trim() === "" || !Number.isFinite(segundos) || segundos <= 0) {
    return { ok: false, erro: "Use um número de segundos maior que 0 (ex.: 3 ou 2.5)." };
  }
  const frames = Math.round(segundos * fps);
  if (frames < 1) return { ok: false, erro: "Curto demais: dá menos de 1 quadro." };
  return { ok: true, segundos, frames };
};

const ehObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Lista de lugares das props onde mora um duracaoFrames (só onde a chave JÁ existe: pôr a chave
// numa peça que não tem essa prop faria o validador acusar "não faz parte do schema").
const propsComDuracao = (el: ElementoEditor): Record<string, unknown>[] => {
  if (!ehObjeto(el.props)) return [];
  if (Array.isArray(el.componente)) {
    const props = el.props;
    return el.componente
      .map((nome) => props[nome])
      .filter((p): p is Record<string, unknown> => ehObjeto(p) && "duracaoFrames" in p);
  }
  return "duracaoFrames" in el.props ? [el.props] : [];
};

// Copia o elemento com props novas (cópia profunda só do que pode mudar).
const copiarElemento = (el: ElementoEditor): ElementoEditor => ({
  ...el,
  props: ehObjeto(el.props) ? JSON.parse(JSON.stringify(el.props)) : el.props,
});

export const aplicarInicio = (plano: PlanoEditor, indice: number, inicio: string): PlanoEditor => {
  if (!conferirInicio(inicio).ok) return plano; // nunca devolve plano com início inválido
  return {
    ...plano,
    elementos: plano.elementos.map((el, i) => (i === indice ? { ...el, inicio } : el)),
  };
};

// Duração nas 3 vias: duracao (s), duracaoFrames do elemento e duracaoFrames das props
// (inclusive props[nome] quando "componente" é lista).
export const aplicarDuracao = (plano: PlanoEditor, indice: number, segundos: number): PlanoEditor => {
  const fps = fpsDoPlano(plano);
  if (fps === null || !Number.isFinite(segundos) || segundos <= 0) return plano;
  const frames = Math.round(segundos * fps);
  if (frames < 1) return plano;
  return {
    ...plano,
    elementos: plano.elementos.map((el, i) => {
      if (i !== indice) return el;
      const novo = copiarElemento(el);
      novo.duracao = segundos;
      novo.duracaoFrames = frames;
      for (const p of propsComDuracao(novo)) p.duracaoFrames = frames;
      return novo;
    }),
  };
};

// Avisos por elemento (não bloqueiam nada; a checagem oficial é do validador).
export const situacaoDosElementos = (plano: PlanoEditor): string[][] => {
  const fps = fpsDoPlano(plano);
  const tempos = plano.elementos.map((el) => {
    const inicio = conferirInicio(el.inicio);
    if (!inicio.ok || fps === null) return null;
    const frames = el.duracaoFrames ?? Math.round(el.duracao * fps); // mesma prioridade do PlanoComposicao
    return { de: inicio.segundos, ate: inicio.segundos + frames / fps };
  });

  return plano.elementos.map((el, i) => {
    const avisos: string[] = [];
    if (fps === null) return ['sem "fps" no plano'];

    const esperado = Math.round(el.duracao * fps);
    const viasProps = propsComDuracao(el).map((p) => p.duracaoFrames);
    const vias = [esperado, ...(el.duracaoFrames === undefined ? [] : [el.duracaoFrames]), ...viasProps];
    if (vias.some((v) => v !== vias[0])) {
      avisos.push(`desalinhado (duracao ${el.duracao} s = ${esperado} quadros; quadros nas outras vias: ${vias.slice(1).join(", ") || "nenhuma"})`);
    }

    const meu = tempos[i];
    if (meu) {
      // Próximo elemento no TEMPO (não na ordem da lista) que começa antes de este acabar.
      const cruza = plano.elementos.some((outro, j) => {
        const t = tempos[j];
        return j !== i && t !== null && t.de >= meu.de && t.de < meu.ate && !(t.de === meu.de && j < i);
      });
      if (cruza) avisos.push("encosta no próximo");
    }
    return avisos;
  });
};

// <plano>.editado-AAAA-MM-DD-HHMM.json  (ex.: teste-kit-v3.editado-2026-11-11-0915.json)
export const nomeDaCopia = (nomeOriginal: string, agora: Date): string => {
  const base = nomeOriginal.replace(/\.json$/i, "");
  const d2 = (n: number) => String(n).padStart(2, "0");
  const data = `${agora.getFullYear()}-${d2(agora.getMonth() + 1)}-${d2(agora.getDate())}`;
  const hora = `${d2(agora.getHours())}${d2(agora.getMinutes())}`;
  return `${base}.editado-${data}-${hora}.json`;
};

export const planoParaTexto = (plano: PlanoEditor): string => `${JSON.stringify(plano, null, 2)}\n`;
