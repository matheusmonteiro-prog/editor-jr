import { z } from "zod";

// Receita dos cortes curtos (9:16) de um vídeo já editado (12/11/2026).
// Um arquivo por vídeo em cortes/<video>.cortes.json, com a lista dos cortes daquele vídeo.
// TODOS os tempos são em SEGUNDOS DA LINHA FINAL DO VÍDEO LONGO (os mesmos da transcrição e do
// Studio do vídeo longo). A conversão para o tempo do corte é feita aqui (paraCorte).

export const FPS_CORTE = 30;
export const seg = (s: number) => Math.round(s * FPS_CORTE);

const trechoSchema = z.object({
  de: z.number().min(0),
  ate: z.number().min(0),
  papel: z.enum(["gancho", "meio", "fecho"]).default("meio"),
  // Centro horizontal do JR na fonte 16:9 (0 a 1). A tela vertical corta em volta dele.
  x: z.number().min(0).max(1).optional(),
  // Zoom da câmera neste trecho. Sem valor: alterna 1 / 1,06 a cada trecho (corte seco "intencional").
  zoom: z.number().min(1).max(1.6).optional(),
});

const corSchema = z.enum(["creme", "amarelo", "vermelho"]);

const impactoSchema = z.object({
  de: z.number().min(0),
  ate: z.number().min(0),
  linhas: z.array(z.object({ texto: z.string(), cor: corSchema.default("creme"), em: z.number().optional() })).min(1),
  apoio: z.string().optional(),
  som: z.enum(["impacto", "whoosh", "moeda", "nenhum"]).default("impacto"),
});

const textoDestaqueSchema = z.object({
  texto: z.string(),
  destaques: z.array(z.string()).default([]),
});

// ---------- Cenas da Cartografia viva (modelo 2) ----------
// Posições x, y, largura, altura são FRAÇÕES (0 a 1) do painel livre (a área onde o JR não está).
// Valem no 9:16 e no 16:9. Gráficos: só "tendencia", nunca número (selo de demonstração é automático).
export const NOMES_PECA_CARTO = ["candles", "lavouraCandles", "estratos", "marco", "regua", "talhoes", "pontos", "frase", "texto", "carimbo"] as const;
export const ENQUADRAMENTOS_CARTO = ["abertura", "loteBaixo", "janela", "janelaDir", "close", "alto", "fecho"] as const;
export const COR_CARTO = ["texto", "apagado", "ouro", "destaque", "alta", "baixa", "terra", "campo"] as const;

const pecaCartoSchema = z.object({
  peca: z.enum(NOMES_PECA_CARTO),
  em: z.number().optional(),
  passos: z.array(z.number()).default([]),
  x: z.number().min(0).max(1).default(0.08),
  // y pode passar de 1 (abaixo do painel) quando o espaço livre continua ao lado do JR (ex.: a palavra SIM).
  y: z.number().min(-0.5).max(2).default(0.4),
  largura: z.number().min(0.05).max(1).default(0.84),
  altura: z.number().min(0.03).max(1).default(0.3),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const cenaCartoSchema = z.object({
  de: z.number().min(0).default(0),
  // fecho: true = a cena entra quando acaba a fala (durante a imagem parada); "de" é ignorado.
  fecho: z.boolean().default(false),
  enquadramento: z.enum(ENQUADRAMENTOS_CARTO).default("loteBaixo"),
  rotulo: z.string().optional(),
  // Linhas de título; cada item é uma palavra ou grupo. Sufixo ":alta", ":baixa", ":terra", ":destaque", ":ouro" pinta; ":caixa" põe fundo dourado.
  titulo: z.array(z.array(z.string())).default([]),
  tamanhoTitulo: z.number().min(30).max(140).default(72),
  pecas: z.array(pecaCartoSchema).max(3).default([]),
});
export type CenaCarto = z.infer<typeof cenaCartoSchema>;
export type PecaCarto = z.infer<typeof pecaCartoSchema>;

export const corteSchema = z.object({
  id: z.string(),
  estado: z.enum(["rascunho", "montado", "aprovado"]),
  nome: z.string(),
  gatilho: z.string().optional(),
  titulo: textoDestaqueSchema,
  trechos: z.array(trechoSchema).min(1),
  // Segundos com a imagem parada no fim, só com o fecho na tela (sem voz).
  segurarFim: z.number().min(0).max(5).default(2),
  impactos: z.array(impactoSchema).default([]),
  fecho: textoDestaqueSchema.extend({ apoio: z.string().optional(), arroba: z.string().optional() }).optional(),
  legenda: z
    .object({
      correcoes: z.record(z.string(), z.string()).default({}),
      destaques: z.array(z.string()).default([]),
      // Cartografia: palavra (sem acento, minúscula) -> cor da legenda (alta, baixa, terra, destaque...).
      chaves: z.record(z.string(), z.enum(COR_CARTO)).default({}),
    })
    .default({ correcoes: {}, destaques: [], chaves: {} }),
  // "tela-cheia" (versão A: JR na tela toda) ou "dividido" (versão B: quadro de papel em cima, JR embaixo).
  // "cartografia" = modelo 2 (Cartografia viva), descrito em "cenas".
  layout: z.enum(["tela-cheia", "dividido", "cartografia"]).default("tela-cheia"),
  // Só no "dividido": "papel" (CorteDividido) ou "papel-camera" (CorteDivididoLivre, o JR muda de lugar por quadro).
  modelo: z.enum(["papel", "papel-camera"]).default("papel"),
  // Só na "cartografia": o que o mapa mostra em cada momento.
  cenas: z.array(cenaCartoSchema).default([]),
  // Só na "cartografia": instantes do "soquinho" de zoom na câmera.
  enfases: z.array(z.number()).default([]),
  // Só no "dividido": o que o quadro de papel mostra em cada momento.
  quadros: z.array(z.lazy(() => quadroSchema)).default([]),
  // Só no "dividido": peças do quadro durante a imagem parada do fim.
  quadroFecho: z.lazy(() => quadroFechoSchema).optional(),
  // Melhorias de 12/11 (versão C), ligadas por corte para não mudar os já aprovados.
  opcoes: z
    .object({
      sonsPapel: z.boolean().default(false), // papel deslizando, baque do carimbo, marca-texto
      marcaNoTopo: z.boolean().default(false), // vertical: logo e @ no alto da caixa do JR (fora dos botões do app)
      tituloImediato: z.boolean().default(false), // título do 1º quadro já inteiro no quadro 0
    })
    .default({ sonsPapel: false, marcaNoTopo: false, tituloImediato: false }),
});

// ---------- Quadro de papel (layout "dividido") ----------
export const NOMES_PECA = ["cartao", "carimbo", "balanca", "multidao", "regua", "bilhete", "etiqueta"] as const;

const pecaSchema = z.object({
  peca: z.enum(NOMES_PECA),
  // Quando entra (segundos do vídeo longo). Sem valor: junto com o quadro.
  em: z.number().optional(),
  // Momentos internos da peça (segundos do vídeo longo): a balança pende, as respostas aparecem...
  passos: z.array(z.number()).default([]),
  // Centro da peça no quadro (0 a 1) e largura (fração da largura da tela).
  x: z.number().min(0).max(1).default(0.5),
  y: z.number().min(0).max(1).default(0.5),
  largura: z.number().min(0.05).max(1).default(0.5),
  // "auto": o som padrão da peça quando o corte tem opcoes.sonsPapel; senão, nenhum.
  som: z.enum(["auto", "impacto", "whoosh", "moeda", "pop", "papel", "carimbo", "marca", "nenhum"]).default("auto"),
  // Marca-texto no título do cartão (segundos do vídeo longo).
  marcar: z.number().optional(),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const ENQUADRAMENTOS_PAPEL = ["classico", "perto", "janelaEsq", "janelaDir", "alto"] as const;

const quadroSchema = z.object({
  // Só no papel com câmera: onde o JR fica neste quadro. Sem valor: segue a ordem fixa do teste 2810-01b.
  enquadramento: z.enum(ENQUADRAMENTOS_PAPEL).optional(),
  de: z.number().min(0),
  ate: z.number().min(0),
  etiqueta: z.string().optional(),
  // Papel do quadro: "relatorio" (Bolsa, conceitos) ou "campo" (kraft de caderno, assuntos do agro).
  papel: z.enum(["relatorio", "campo"]).default("relatorio"),
  // Título grande no topo do quadro (abertura), no lugar da etiqueta.
  titulo: z.string().optional(),
  pecas: z.array(pecaSchema).default([]),
});

const quadroFechoSchema = z.object({
  titulo: z.string().optional(),
  faixa: z.string().optional(), // texto fixo na faixa da legenda
  pecas: z.array(pecaSchema).default([]),
});

export type PecaQuadro = z.infer<typeof pecaSchema>;
export type QuadroCorte = z.infer<typeof quadroSchema>;

export const receitaSchema = z.object({
  video: z.string(),
  // "gravacao" (padrão novo, 12/11): todos os tempos são segundos da GRAVAÇÃO TRATADA inteira, a mesma
  // linha da transcrição; o corte não espera a edição do longo. "final": segundos da linha do vídeo longo
  // pronto (só o vídeo de 28/10, onde as duas linhas coincidem).
  tempos: z.enum(["gravacao", "final"]).default("final"),
  // Cartografia: UM ambiente por vídeo (nunca misturar). Vale para todos os cortes e explicativos dele.
  ambienteCartografia: z.enum(["verde", "branco"]).default("verde"),
  xPadrao: z.number().min(0).max(1).default(0.5),
  cortes: z.array(corteSchema),
  // Trechos explicativos do vídeo LONGO (16:9): mesmo formato de um corte, com um trecho contínuo
  // e segurarFim 0. Chamados no longo pela peça TrechoExplicativo.
  explicativos: z.array(corteSchema).default([]),
});

export type Corte = z.infer<typeof corteSchema>;
export type Receita = z.infer<typeof receitaSchema>;

export type TrechoNoCorte = Corte["trechos"][number] & { inicio: number; frames: number; indice: number };

// Onde cada trecho cai na linha do corte (em quadros).
export const montarLinha = (corte: Corte): TrechoNoCorte[] => {
  let inicio = 0;
  return corte.trechos.map((t, indice) => {
    const frames = seg(t.ate) - seg(t.de);
    const r = { ...t, inicio, frames, indice };
    inicio += frames;
    return r;
  });
};

export const duracaoCorte = (corte: Corte) => {
  const linha = montarLinha(corte);
  const ultimo = linha[linha.length - 1];
  return ultimo.inicio + ultimo.frames + seg(corte.segurarFim);
};

// Tempo do vídeo longo (segundos) -> quadro do corte. null se o tempo não está em nenhum trecho.
export const paraCorte = (linha: TrechoNoCorte[], t: number): number | null => {
  for (const tr of linha) {
    if (t >= tr.de && t < tr.ate) return tr.inicio + seg(t) - seg(tr.de);
  }
  return null;
};

// Confere a receita além do formato: trecho com fim antes do começo, impacto fora dos trechos.
// Devolve a lista de problemas (vazia = ok). Usada no Root, que mostra o erro no Studio.
export const conferirCorte = (corte: Corte): string[] => {
  const erros: string[] = [];
  const linha = montarLinha(corte);
  corte.trechos.forEach((t, i) => {
    if (t.ate - t.de < 0.5) erros.push(`${corte.id}: trecho ${i + 1} tem menos de 0,5 s (de ${t.de} até ${t.ate})`);
  });
  corte.quadros.forEach((q, i) => {
    if (paraCorte(linha, q.de) === null) erros.push(`${corte.id}: quadro ${i + 1} começa (${q.de}) fora dos trechos`);
    q.pecas.forEach((p, k) => {
      for (const t of [p.em, p.marcar, ...p.passos]) {
        if (t !== undefined && paraCorte(linha, t) === null) {
          erros.push(`${corte.id}: quadro ${i + 1}, peça ${k + 1} (${p.peca}) tem um tempo (${t}) fora dos trechos`);
        }
      }
    });
  });
  corte.cenas.forEach((c, i) => {
    if (!c.fecho && paraCorte(linha, c.de) === null) erros.push(`${corte.id}: cena ${i + 1} começa (${c.de}) fora dos trechos`);
    c.pecas.forEach((p, k) => {
      for (const t of [p.em, ...p.passos]) {
        if (t !== undefined && paraCorte(linha, t) === null) erros.push(`${corte.id}: cena ${i + 1}, peça ${k + 1} (${p.peca}) tem um tempo (${t}) fora dos trechos`);
      }
    });
  });
  if (corte.layout === "cartografia" && corte.cenas.length === 0) erros.push(`${corte.id}: layout "cartografia" precisa de "cenas"`);
  corte.impactos.forEach((im, i) => {
    if (paraCorte(linha, im.de) === null) erros.push(`${corte.id}: impacto ${i + 1} começa (${im.de}) fora dos trechos`);
    for (const l of im.linhas) {
      if (l.em !== undefined && paraCorte(linha, l.em) === null) {
        erros.push(`${corte.id}: impacto ${i + 1}, linha "${l.texto}" entra (${l.em}) fora dos trechos`);
      }
    }
  });
  return erros;
};
