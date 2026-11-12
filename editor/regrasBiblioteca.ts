import { emDecimos, proximoSlotLivre } from "./regrasInteracao";
import { conferirInicio, fpsDoPlano, formatarInicio, type ElementoEditor, type PlanoEditor } from "./regrasPlano";

// Biblioteca de arquivos (pacote B). Sem React e sem disco: dá para testar pelo Node.
// A lista vem de GET /api/biblioteca (editor/servidor.mjs): caminhos relativos a public/.

export type TipoMidia = "imagem" | "audio" | "video";
export type ItemBiblioteca = { caminho: string; pasta: string; nome: string; tipo: TipoMidia; tamanho: number | null };

export const filtrarBiblioteca = (itens: ItemBiblioteca[], texto: string, tipo: TipoMidia | "todos"): ItemBiblioteca[] => {
  const t = texto.trim().toLowerCase();
  return itens.filter((i) => (tipo === "todos" || i.tipo === tipo) && (t === "" || i.caminho.toLowerCase().includes(t)));
};

export const tamanhoLegivel = (bytes: number | null): string => {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Seletor de um campo de arquivo: só IMAGENS que ficam dentro da pasta-base do campo; o valor
// gravado é o caminho SEM a pasta-base (regrasPropriedades.ts, BASE_DOS_ARQUIVOS).
export const opcoesDoCampo = (itens: ItemBiblioteca[], base: string): { valor: string; caminho: string }[] =>
  itens.filter((i) => i.tipo === "imagem" && i.caminho.startsWith(base)).map((i) => ({ valor: i.caminho.slice(base.length), caminho: i.caminho }));

// Nome do arquivo → pedaço de id ("Casa Terreno.png" → "casa-terreno").
export const pedacoDeId = (caminho: string): string => {
  const nome = caminho.split("/").pop() ?? "arquivo";
  const sem = nome.replace(/\.[^.]+$/, "");
  const limpo = sem
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpo || "arquivo";
};

const idLivre = (usados: Set<string>, base: string): string => {
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

export const DURACAO_IMAGEM = 3;
export const PERSONAGENS = "images/personagens/";

// Imagem na agulha: novo elemento NO TOPO da lista (o mais à frente), início = agulha em tempo
// ORIGINAL com 1 casa, 3 s, id único, posicao "topo" e o primeiro slot livre (proximoSlotLivre).
// Peça: a imagem de public/images/personagens/ usa PersonagemImagem (props obrigatórias do schema:
// imagem, top, left, tamanho, duracaoFrames, framesSaida; valores do 0926 "terra-terreno-casa");
// qualquer outra imagem usa ImagemFade (src relativo a public/, larguraPorcentagem, frameEntrada).
// Os campos de fora das props são os que o validador exige (checagem 1). null = sem fps.
export const adicionarImagem = (plano: PlanoEditor, item: ItemBiblioteca, segundoOriginal: number): { plano: PlanoEditor; indice: number } | null => {
  const fps = fpsDoPlano(plano);
  if (fps === null || item.tipo !== "imagem" || !Number.isFinite(segundoOriginal)) return null;
  const inicio = formatarInicio(Math.max(0, emDecimos(segundoOriginal)));
  if (!conferirInicio(inicio).ok) return null;
  const frames = Math.round(DURACAO_IMAGEM * fps);
  const pedaco = pedacoDeId(item.caminho);
  const ehPersonagem = item.caminho.startsWith(PERSONAGENS) && !item.caminho.slice(PERSONAGENS.length).includes("/");
  const novo = {
    id: idLivre(new Set(plano.elementos.map((e) => e.id)), `imagem-${pedaco}`),
    componente: ehPersonagem ? "PersonagemImagem" : "ImagemFade",
    descricao: `imagem adicionada pelo editor — ${item.caminho}`,
    texto: `Imagem ${pedaco.replace(/-/g, " ")}`,
    inicio,
    duracao: DURACAO_IMAGEM,
    duracaoFrames: frames,
    posicao: "topo",
    slot: 1,
    ilustrativo: false,
    tempo_estimado: true,
    props: ehPersonagem
      ? { imagem: item.caminho.slice(PERSONAGENS.length), top: 0.3, left: 0.35, tamanho: 0.3, duracaoFrames: frames, framesSaida: 20 }
      : { src: item.caminho, larguraPorcentagem: 40, frameEntrada: 10 },
  } as unknown as ElementoEditor;
  const slot = proximoSlotLivre(plano, novo);
  if (slot !== null) (novo as unknown as { slot: number }).slot = slot;
  return { plano: { ...plano, elementos: [...plano.elementos, novo] }, indice: plano.elementos.length };
};

// Som na agulha (efeito) ou música: item novo em plano.audio, só com os campos que o validador
// aceita (checagem 11): efeito = id, tipo, arquivo, inicio; música = id, tipo, arquivo. Sem
// "volume": vale o padrão do motor (src/PlanoComposicao.tsx: efeito 1, música 0,2).
export type ItemAudio = NonNullable<PlanoEditor["audio"]>[number];

export const adicionarAudio = (plano: PlanoEditor, item: ItemBiblioteca, tipo: "efeito" | "musica", segundoOriginal: number): { plano: PlanoEditor; indice: number } | null => {
  if (item.tipo !== "audio") return null;
  const lista = plano.audio ?? [];
  const id = idLivre(new Set(lista.map((a) => a.id)), `${tipo}-${pedacoDeId(item.caminho)}`);
  let novo: ItemAudio;
  if (tipo === "efeito") {
    if (!Number.isFinite(segundoOriginal)) return null;
    const inicio = formatarInicio(Math.max(0, emDecimos(segundoOriginal)));
    if (!conferirInicio(inicio).ok) return null;
    novo = { id, tipo, arquivo: item.caminho, inicio };
  } else {
    novo = { id, tipo, arquivo: item.caminho };
  }
  return { plano: { ...plano, audio: [...lista, novo] }, indice: lista.length };
};

// Apagar um item de áudio (Delete com ele selecionado). Sem lista vazia sobrando: se era o último,
// a chave "audio" sai (o plano fica como os que nunca tiveram áudio). Índice inválido = MESMO plano.
export const removerAudio = (plano: PlanoEditor, indice: number): PlanoEditor => {
  const lista = plano.audio ?? [];
  if (indice < 0 || indice >= lista.length) return plano;
  const resto = lista.filter((_, i) => i !== indice);
  if (resto.length > 0) return { ...plano, audio: resto };
  const { audio: _fora, ...sem } = plano;
  return sem as PlanoEditor;
};

// Faixa de áudio da linha do tempo (só ver/selecionar). Música = a régua toda. Efeito = um
// marcador de MARCA_EFEITO s no "inicio" (ou no início do elemento a que está preso).
export const MARCA_EFEITO = 0.6;
export type BlocoAudio = { indice: number; id: string; tipo: string; arquivo: string; inicioSeg: number; esquerdaPct: number; larguraPct: number };

export const blocosDeAudio = (plano: PlanoEditor, regua: number): BlocoAudio[] => {
  if (!(regua > 0)) return [];
  const pct = (s: number) => Math.max(0, Math.min(100, (s / regua) * 100));
  const blocos: BlocoAudio[] = [];
  (plano.audio ?? []).forEach((a, indice) => {
    if (a.tipo === "musica") {
      blocos.push({ indice, id: a.id, tipo: a.tipo, arquivo: a.arquivo, inicioSeg: 0, esquerdaPct: 0, larguraPct: 100 });
      return;
    }
    const texto = a.elemento !== undefined ? plano.elementos.find((e) => e.id === a.elemento)?.inicio : a.inicio;
    const i = texto === undefined ? null : conferirInicio(texto);
    if (!i || !i.ok) return;
    const esq = pct(i.segundos);
    blocos.push({ indice, id: a.id, tipo: a.tipo, arquivo: a.arquivo, inicioSeg: i.segundos, esquerdaPct: esq, larguraPct: Math.max(0.4, pct(i.segundos + MARCA_EFEITO) - esq) });
  });
  return blocos;
};
