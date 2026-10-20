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

export type FraseComIcone = {
  texto: string;
  destaque: string; // UMA palavra em dourado
  icone: "check" | "engrenagem" | "lampada";
  emSegundos: number; // corte de entrada, desde o início do áudio da resposta
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
    }
  | { tipo: "cards"; cards: CardCheck[] }
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
      // Bloco 07 (rodada 2): frases inteiras com ícone, em corte seco, que
      // entram depois da risca. Tempos em SEGUNDOS desde o início do áudio da
      // resposta (medidos pelas pausas do narrador com silencedetect).
      frases?: FraseComIcone[];
      fimFrasesSegundos?: number;
    }
  | {
      // Bloco 06 (rodada 2): lista rolando no fundo + contador grande 0 → valorFinal.
      tipo: "contadorLista";
      valorFinal: number;
      prefixo: string;
      folgaFinalFrames: number; // o contador para tantos frames antes do narrador terminar
      passoPulso: number; // pulsa a cada N números
    }
  | {
      // Bloco 08 (rodada 2): chamada final em partes, cada uma no seu momento da fala.
      // Tempos em SEGUNDOS desde o início do áudio da resposta (pausas do
      // narrador medidas com silencedetect; se o áudio for regerado, conferir).
      tipo: "cta";
      chamada: string; // "Siga este canal." (kinetic, branco, grande)
      linhaDouradaEmSegundos: number; // linha dourada atravessa a tela
      miolo: string; // "\n" = quebra de linha (kinetic, dourado, mais lento)
      mioloEmSegundos: number;
      palavraExtra: string; // palavra do miolo com pulso extra (1 → 1,2 → 1)
      palavraExtraEmSegundos: number;
      logoEmSegundos: number; // o logo volta ao centro girando uma vez
      marca: string; // "Método JR." (dourado, grande, uma batida só)
      marcaEmSegundos: number;
      fecho: string; // "Em breve." (branco, menor)
      fechoEmSegundos: number;
    };

// Moedas 3D caindo no fundo (blocos 02, 03 e 06): entre 2 e 4 por bloco.
export type MoedasBloco = {
  semente: string; // fixa por bloco, para o desenho ser reproduzível
  aleatorias: number; // moedas sorteadas (posição e tempo)
  // Moeda extra "entre um card e outro" (1ª rodada), no momento da fala.
  fixa?: { emFracao: number; x: number; duracao?: number };
};

export type Bloco = {
  id: string;
  pergunta?: { texto: string; audio: string };
  resposta: { audio: string };
  // Texto principal da tela (resposta em kinetic typography) e a ÚNICA
  // palavra/expressão em dourado.
  texto?: string;
  destaque?: string;
  moedas?: MoedasBloco;
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

// De onde vem o fundo da cena. "solido" = só o verde-escuro da marca (#0F2A1D).
export type FonteCena =
  | { tipo: "imagem"; arquivo: string } // relativo a public/
  | { tipo: "video"; arquivo: string } // relativo a public/; sempre mudo, em loop
  | { tipo: "solido" };

export type Cena = {
  nome: string; // aparece na timeline do Studio
  fonte: FonteCena;
  blocoInicial: string;
  blocoFinal: string;
  movimento: Movimento;
  transicao: TipoTransicao;
  framesTransicao: number; // 12 a 20
  escurecimento: number; // opacidade da camada #0F2A1D (0 a 1)
  posicaoY: number; // objectPosition vertical, 0 a 100 (%)
  desfoque?: number; // px; foto/vídeo de fundo desfocado
  // Dessatura (grayscale) e tinge em duas cores da marca: sombras em
  // verde-escuro, claros em dourado. Para vídeo com cor fora da paleta.
  tingir?: boolean;
  // Reenquadra o fundo: escala e deslocamento (fração do quadro; +y = desce).
  enquadramento?: { escala: number; x: number; y: number };
  particulas?: boolean;
  raiosDeLuz?: boolean;
  brilhoLogo?: boolean;
  brilhoY?: number; // fração da altura (padrão 0,33)
};

// Sons opcionais. Só arquivos informados pelo Matheus; vazio = lugar marcado e mudo.
export type Sons = {
  trilha?: string;
  whoosh?: string; // troca de bloco (8 vezes)
  tick?: string; // pílula da pergunta aparecendo
  moeda?: string; // cada moeda que cai
  impacto?: string; // risca do bloco 05 e os 3 cortes secos do bloco 07
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
    },
    moedas: { semente: "bloco-02", aleatorias: 2, fixa: { emFracao: 0.55, x: 0.78 } },
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
    },
    moedas: { semente: "bloco-03", aleatorias: 2, fixa: { emFracao: 0.4, x: 0.24, duracao: 20 } },
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
    elemento: { tipo: "contadorLista", valorFinal: 400, prefixo: "+", folgaFinalFrames: 15, passoPulso: 20 },
    moedas: { semente: "bloco-06", aleatorias: 3 },
  },
  {
    id: "07",
    pergunta: {
      texto: "Ele recomenda ou indica comprar ou vender?",
      audio: `${A}07-pergunta.mp3`,
    },
    resposta: { audio: `${A}07-resposta.mp3` },
    contador: "7/8",
    elemento: {
      tipo: "contraste",
      riscado: "Recomenda compra\nou venda", // "\n" = quebra de linha
      riscoAposFrames: 14,
      duracaoRisco: 8,
      depoisDoRisco: "apagar",
      particulas: false,
      frases: [
        { texto: "O que faz", destaque: "faz", icone: "check", emSegundos: 3.25 },
        { texto: "Como faz", destaque: "faz", icone: "engrenagem", emSegundos: 4.32 },
        { texto: "E por que faz", destaque: "faz", icone: "lampada", emSegundos: 5.43 },
      ],
      fimFrasesSegundos: 7.15,
      legenda: "A decisão é de cada investidor.",
      legendaEmFracao: 0.6,
    },
  },
  {
    id: "08",
    pergunta: { texto: "Como conhecer o Método JR?", audio: `${A}08-pergunta.mp3` },
    resposta: { audio: `${A}08-resposta.mp3` },
    contador: "8/8",
    elemento: {
      tipo: "cta",
      chamada: "Siga este canal.",
      linhaDouradaEmSegundos: 1.0,
      miolo: "Aqui você vai ver\nO que ninguém\nTe mostrou antes.",
      mioloEmSegundos: 1.45,
      palavraExtra: "ninguém",
      palavraExtraEmSegundos: 3.45,
      logoEmSegundos: 2.3,
      marca: "Método JR.",
      marcaEmSegundos: 5.29,
      fecho: "Em breve.",
      fechoEmSegundos: 7.02,
    },
  },
];

const C = "images/cenas/prontas/";
const V = "videos/cenas/";

// Escurecimento: camada #0F2A1D por cima do fundo. Rodada 2 (20/10/2026): de 55%
// para 40% em todas as cenas; a cena 6 (mosaico) segue em 70%.
const ESCURECIMENTO = 0.4;

export const CENAS: Cena[] = [
  {
    // Vídeo do notebook com gráfico (cena 1). Reenquadrado: a escala e o
    // deslocamento para baixo tiram o notebook de trás do logo (centro, em cima).
    nome: "Cena 1: cena-1-not.mp4",
    fonte: { tipo: "video", arquivo: `${V}cena-1-not.mp4` },
    blocoInicial: "00",
    blocoFinal: "01",
    movimento: { tipo: "zoom", de: 1, para: 1.1 },
    transicao: "nenhuma",
    framesTransicao: 0,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: 8,
    tingir: true,
    enquadramento: { escala: 1.55, x: 0, y: 0.27 },
    particulas: true,
  },
  {
    nome: "Cena 2: cena-2-moedas.jpg",
    fonte: { tipo: "imagem", arquivo: `${C}cena-2-moedas.jpg` },
    blocoInicial: "02",
    blocoFinal: "02",
    movimento: { tipo: "zoom", de: 1.1, para: 1 },
    transicao: "flashWipe",
    framesTransicao: 16,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
  },
  {
    // O vídeo "grafico 1" tem "Link in Bio" escrito e cor neon: não usado
    // (decisão do Matheus, 20/10/2026). Fica o verde-escuro da marca.
    nome: "Cena 3: fundo verde-escuro",
    fonte: { tipo: "solido" },
    blocoInicial: "03",
    blocoFinal: "03",
    movimento: { tipo: "zoom", de: 1, para: 1 },
    transicao: "empurraoVertical",
    framesTransicao: 16,
    escurecimento: 0,
    posicaoY: 50,
  },
  {
    // Imagem de 940 px de largura (< 1170): zoom de 103% e pan menor.
    nome: "Cena 4: cena-4-dourado.png",
    fonte: { tipo: "imagem", arquivo: "images/cena-4-dourado.png" },
    blocoInicial: "04",
    blocoFinal: "04",
    movimento: { tipo: "panVertical", zoom: 1.03, deY: 0.014, paraY: -0.014 },
    transicao: "zoomAtravessa",
    framesTransicao: 18,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: 8,
    raiosDeLuz: true,
  },
  {
    // O vídeo do trator tem a marca d'água "@EDI.RISSI" e é de outro criador:
    // não usado (decisão do Matheus, 20/10/2026). Fica o verde-escuro da marca.
    nome: "Cena 5: fundo verde-escuro",
    fonte: { tipo: "solido" },
    blocoInicial: "05",
    blocoFinal: "05",
    movimento: { tipo: "zoom", de: 1, para: 1 },
    transicao: "deslizeHorizontal",
    framesTransicao: 14,
    escurecimento: 0,
    posicaoY: 50,
    particulas: true,
  },
  {
    nome: "Cena 6: cena-6-mosaico.jpg",
    fonte: { tipo: "imagem", arquivo: `${C}cena-6-mosaico.jpg` },
    blocoInicial: "06",
    blocoFinal: "06",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "mascaraCircular",
    framesTransicao: 18,
    escurecimento: 0.7,
    posicaoY: 50,
  },
  {
    nome: "Cena 7: cena-7-grafico.jpg",
    fonte: { tipo: "imagem", arquivo: `${C}cena-7-grafico.jpg` },
    blocoInicial: "07",
    blocoFinal: "07",
    movimento: { tipo: "panDiagonal", zoom: 1.08, deX: 0.02, paraX: -0.02, deY: 0.02, paraY: -0.02 },
    transicao: "wipeDiagonal",
    framesTransicao: 14,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
  },
  {
    nome: "Cena 8: cena-8-linhas.mp4",
    fonte: { tipo: "video", arquivo: `${V}cena-8-linhas.mp4` },
    blocoInicial: "08",
    blocoFinal: "08",
    movimento: { tipo: "zoom", de: 1.08, para: 1 },
    transicao: "fusaoBrilho",
    framesTransicao: 20,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: 8,
    tingir: true,
    particulas: true,
    brilhoLogo: true,
    brilhoY: 0.565,
  },
];

export const SONS: Sons = {
  trilha: "audio/apresentacao/musica-fundo.mp3",
  // Efeitos: os arquivos NÃO existem ainda (o Pixabay bloqueou o download em
  // 20/10/2026). Os pontos já estão marcados na timeline do Studio como
  // "SOM whoosh/tick/moeda/impacto (sem arquivo)". Para ligar, coloque o arquivo
  // em public/audio/apresentacao/sfx/ e descomente a linha:
  // whoosh: "audio/apresentacao/sfx/sfx-whoosh.mp3",
  // tick: "audio/apresentacao/sfx/sfx-tick.mp3",
  // moeda: "audio/apresentacao/sfx/sfx-moeda.mp3",
  // impacto: "audio/apresentacao/sfx/sfx-impacto.mp3",
};

// Volumes (0 a 1). A narração toca em 1,0.
export const VOLUMES = {
  musica: 0.2, // blocos 00 a 07
  musicaFinal: 0.35, // bloco 08
  efeitos: 0.4,
  fadeInMusicaFrames: 30,
  fadeOutMusicaFrames: 60, // nos últimos 2 segundos
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
