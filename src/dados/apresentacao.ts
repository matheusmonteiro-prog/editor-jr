// Dados do vídeo de apresentação do JR (pergunta e resposta).
// MODELO: para outro vídeo pergunta e resposta, copie este arquivo e troque
// os textos, os áudios e as cenas. O código (VideoApresentacao) não muda.
//
// Textos de tela em escrita normal: o componente põe em CAIXA ALTA.
// Áudios: caminho relativo a public/. Arquivo que não existir = bloco mudo.

export type CardCheck = {
  texto: string;
  destaque: string;
  // Em que ponto da fala do narrador o card entra (0 = início, 1 = fim).
  emFracao: number;
};

export type Elemento =
  | { tipo: "abertura" } // logo girando + título
  | { tipo: "logoSpotlight" } // logo no centro com brilho; no fim voa para o canto
  | {
      tipo: "contadorCards";
      valorFinal: number;
      prefixo: string;
      rotulo: string;
      cards: CardCheck[];
      moedaEmFracao: number;
    }
  | { tipo: "cards"; cards: CardCheck[]; moedaEmFracao: number }
  | { tipo: "texto"; imagem?: string } // imagem opcional com paralaxe
  | {
      tipo: "contraste";
      riscado: string;
      // Quantos frames depois do início da resposta a risca passa.
      riscoAposFrames: number;
      duracaoRisco: number;
      // "recuar": a palavra riscada sai para trás; "apagar": fica fraca em cima.
      depoisDoRisco: "recuar" | "apagar";
      particulas: boolean;
      legenda?: string;
      legendaEmFracao?: number;
    }
  | { tipo: "grade" }
  | { tipo: "cartela"; linhaMenor: string; linhaMenorAposFrames: number };

export type Bloco = {
  id: string;
  pergunta?: { texto: string; audio: string };
  resposta: { audio: string };
  // Texto principal da tela (resposta em kinetic typography) e a ÚNICA
  // palavra/expressão em dourado.
  texto?: string;
  destaque?: string;
  // Etiqueta "1/8" ao lado da pergunta.
  contador?: string;
  // Pílula de abertura (bloco sem pergunta).
  pilula?: string;
  elemento: Elemento;
};

export type TipoTransicao =
  | "nenhuma"
  | "flashWipe" // flash dourado + wipe diagonal
  | "empurraoVertical" // a nova sobe e empurra a antiga
  | "zoomAtravessa" // a antiga cresce e some, a nova assenta
  | "deslizeHorizontal"
  | "mascaraCircular" // círculo abrindo do centro
  | "wipeDiagonal" // wipe com faixa verde-escura
  | "fusaoBrilho"; // fusão lenta com brilho dourado

export type Movimento =
  | { tipo: "zoom"; de: number; para: number }
  | { tipo: "panVertical"; zoom: number; deY: number; paraY: number } // Y em fração da altura
  | { tipo: "panDiagonal"; zoom: number; deX: number; paraX: number; deY: number; paraY: number };

export type Cena = {
  arquivo: string; // relativo a public/
  blocoInicial: string;
  blocoFinal: string;
  movimento: Movimento;
  transicao: TipoTransicao;
  framesTransicao: number; // 12 a 20
  escurecimento: number; // opacidade da camada #0F2A1D (0 a 1)
  posicaoY: number; // objectPosition vertical, 0 a 100 (%)
  particulas?: boolean;
  raiosDeLuz?: boolean;
  brilhoLogo?: boolean;
};

// Sons opcionais. Só arquivos informados pelo Matheus; vazio = lugar marcado e mudo.
export type Sons = {
  trilha?: string;
  whoosh?: string;
  tick?: string;
};

const A = "audio/apresentacao/";

export const BLOCOS: Bloco[] = [
  {
    id: "00",
    resposta: { audio: `${A}00-abertura.mp3` },
    pilula: "Em breve, neste canal",
    texto: "JR – o Investidor Sertanejo",
    destaque: "Sertanejo",
    elemento: { tipo: "abertura" },
  },
  {
    id: "01",
    pergunta: { texto: "Quem é ele?", audio: `${A}01-pergunta.mp3` },
    resposta: { audio: `${A}01-resposta.mp3` },
    contador: "1/8",
    texto: "Criador do Método JR",
    destaque: "Método JR",
    elemento: { tipo: "logoSpotlight" },
  },
  {
    id: "02",
    pergunta: { texto: "O que ele faz?", audio: `${A}02-pergunta.mp3` },
    resposta: { audio: `${A}02-resposta.mp3` },
    contador: "2/8",
    elemento: {
      tipo: "contadorCards",
      valorFinal: 15,
      prefixo: "+",
      rotulo: "Anos investindo",
      cards: [
        { texto: "Ações e ETFs", destaque: "ETFs", emFracao: 0.42 },
        { texto: "Brasil e EUA", destaque: "EUA", emFracao: 0.68 },
      ],
      moedaEmFracao: 0.55,
    },
  },
  {
    id: "03",
    pergunta: { texto: "O que é o Método JR?", audio: `${A}03-pergunta.mp3` },
    resposta: { audio: `${A}03-resposta.mp3` },
    contador: "3/8",
    elemento: {
      tipo: "cards",
      cards: [
        { texto: "Seleção de ativos", destaque: "Seleção", emFracao: 0.12 },
        { texto: "Valor intrínseco", destaque: "intrínseco", emFracao: 0.62 },
      ],
      moedaEmFracao: 0.4,
    },
  },
  {
    id: "04",
    pergunta: { texto: "O que vai mostrar?", audio: `${A}04-pergunta.mp3` },
    resposta: { audio: `${A}04-resposta.mp3` },
    contador: "4/8",
    texto: "O operacional completo, na prática",
    destaque: "na prática",
    // images/software-recorte.png não existe (19/10/2026): bloco só com texto.
    elemento: { tipo: "texto" },
  },
  {
    id: "05",
    pergunta: { texto: "É difícil entender?", audio: `${A}05-pergunta.mp3` },
    resposta: { audio: `${A}05-resposta.mp3` },
    contador: "5/8",
    texto: "Fácil e prático",
    destaque: "Fácil",
    elemento: {
      tipo: "contraste",
      riscado: "Difícil",
      riscoAposFrames: 4,
      duracaoRisco: 6,
      depoisDoRisco: "recuar",
      particulas: true,
    },
  },
  {
    id: "06",
    pergunta: {
      texto: "Teria um portfólio de ativos para acompanhar?",
      audio: `${A}06-pergunta.mp3`,
    },
    resposta: { audio: `${A}06-resposta.mp3` },
    contador: "6/8",
    texto: "+400 ativos filtrados e calculados",
    destaque: "+400",
    elemento: { tipo: "grade" },
  },
  {
    id: "07",
    pergunta: {
      texto: "Ele recomenda ou indica comprar ou vender?",
      audio: `${A}07-pergunta.mp3`,
    },
    resposta: { audio: `${A}07-resposta.mp3` },
    contador: "7/8",
    texto: "Mostra como faz",
    destaque: "Mostra",
    elemento: {
      tipo: "contraste",
      riscado: "Recomenda compra\nou venda", // "\n" = quebra de linha
      riscoAposFrames: 14,
      duracaoRisco: 8,
      depoisDoRisco: "apagar",
      particulas: false,
      legenda: "A decisão é de cada investidor.",
      legendaEmFracao: 0.62,
    },
  },
  {
    id: "08",
    pergunta: { texto: "Como conhecer o Método JR?", audio: `${A}08-pergunta.mp3` },
    // 08-resposta.mp3 ainda não existe (19/10/2026): fica mudo com a reserva.
    resposta: { audio: `${A}08-resposta.mp3` },
    contador: "8/8",
    texto: "Siga o canal",
    destaque: "Siga",
    elemento: {
      tipo: "cartela",
      linhaMenor: "Acompanhe a chegada\ndo Método JR", // "\n" = quebra de linha
      linhaMenorAposFrames: 24,
    },
  },
];

const C = "images/cenas/prontas/";

export const CENAS: Cena[] = [
  {
    arquivo: `${C}cena-1-semente.jpg`,
    blocoInicial: "00",
    blocoFinal: "01",
    movimento: { tipo: "zoom", de: 1, para: 1.1 },
    transicao: "nenhuma",
    framesTransicao: 0,
    escurecimento: 0.55,
    posicaoY: 50,
    particulas: true,
  },
  {
    arquivo: `${C}cena-2-moedas.jpg`,
    blocoInicial: "02",
    blocoFinal: "02",
    movimento: { tipo: "zoom", de: 1.1, para: 1 },
    transicao: "flashWipe",
    framesTransicao: 16,
    escurecimento: 0.55,
    posicaoY: 50,
  },
  {
    arquivo: `${C}cena-3-milho.jpg`,
    blocoInicial: "03",
    blocoFinal: "03",
    movimento: { tipo: "zoom", de: 1, para: 1.08 },
    transicao: "empurraoVertical",
    framesTransicao: 16,
    escurecimento: 0.55,
    posicaoY: 50,
  },
  {
    arquivo: `${C}cena-4-lavoura.jpg`,
    blocoInicial: "04",
    blocoFinal: "04",
    movimento: { tipo: "panVertical", zoom: 1.08, deY: 0.03, paraY: -0.03 },
    transicao: "zoomAtravessa",
    framesTransicao: 18,
    escurecimento: 0.55,
    posicaoY: 50,
    raiosDeLuz: true,
  },
  {
    arquivo: `${C}cena-5-caminho.jpg`,
    blocoInicial: "05",
    blocoFinal: "05",
    movimento: { tipo: "zoom", de: 1, para: 1.08 },
    transicao: "deslizeHorizontal",
    framesTransicao: 14,
    escurecimento: 0.55,
    posicaoY: 50,
    particulas: true,
  },
  {
    arquivo: `${C}cena-6-mosaico.jpg`,
    blocoInicial: "06",
    blocoFinal: "06",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "mascaraCircular",
    framesTransicao: 18,
    escurecimento: 0.7,
    posicaoY: 50,
  },
  {
    arquivo: `${C}cena-7-grafico.jpg`,
    blocoInicial: "07",
    blocoFinal: "07",
    movimento: { tipo: "panDiagonal", zoom: 1.08, deX: 0.02, paraX: -0.02, deY: 0.02, paraY: -0.02 },
    transicao: "wipeDiagonal",
    framesTransicao: 14,
    escurecimento: 0.55,
    posicaoY: 50,
  },
  {
    arquivo: `${C}cena-8-amanhecer.jpg`,
    blocoInicial: "08",
    blocoFinal: "08",
    movimento: { tipo: "zoom", de: 1.08, para: 1 },
    transicao: "fusaoBrilho",
    framesTransicao: 20,
    escurecimento: 0.55,
    posicaoY: 50,
    particulas: true,
    brilhoLogo: true,
  },
];

export const SONS: Sons = {
  // Nenhum arquivo informado ainda (19/10/2026). Os pontos ficam marcados na
  // timeline do Studio como "SOM whoosh" e "SOM tick".
};

export const LOGO = "images/logo-jr.png";

// Tempos (em frames, a 30 fps).
export const TEMPOS = {
  folgaFimBloco: 20, // folga depois do áudio do narrador
  inicioPergunta: 4, // a voz da pergunta entra junto com a pílula
  respiroPerguntaResposta: 6, // pausa entre a pergunta e a resposta
  inicioAbertura: 10, // o narrador da abertura entra depois do logo começar a girar
  reservaAudioFaltando: 90, // áudio que não existe: bloco mudo com esta duração
  seguraCartela: 30, // a cartela final fica parada mais um pouco no fim
};
