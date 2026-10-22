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
  // Rodada 7 (bloco 02): bandeira 3D de cada lado do card, na ordem do texto (esquerda, direita).
  bandeiras?: [Bandeira, Bandeira];
  // Rodada 7 (bloco 02): ícone SVG ao lado do card ("etf" = pizza com uma fatia dourada).
  icone?: "etf";
  // Rodada 7 (bloco 03): motion próprio do selo. "esteira" = ícones de ativos passando embaixo
  // do selo; "convergencia" = linha do preço encontrando a linha do valor, embaixo do selo.
  animacao?: "esteira" | "convergencia";
};

// Imagem da bandeira (relativa a public/) e a proporção dela (largura / altura).
export type Bandeira = { arquivo: string; proporcao: number };

export type FraseComIcone = {
  texto: string;
  destaque: string; // UMA palavra em dourado
  icone: "check" | "engrenagem" | "lampada";
  estiloFaz: "dourado" | "contorno" | "pulso"; // como "faz" aparece (rodada 3)
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
      // Rodada 6: durante a pergunta, a lista de ativos de REFERÊNCIA rola nítida (logos de
      // arquivoAtivos), com realce dourado na linha do centro. Nunca preço na tela.
      tipo: "contadorLista";
      arquivoAtivos: string; // relativo a public/: lista de { ticker, nome, logo }
      rotuloLista: string; // "Exemplos de ativos que acompanhamos" (não "carteira"/"recomendados")
      valorFinal: number;
      prefixo: string;
      folgaFinalFrames: number; // o contador para tantos frames antes do narrador terminar
      passoPulso: number; // pulsa a cada N números
    }
  | {
      // Bloco 08 (rodada 5c): chamada final em partes, cada uma no seu momento da fala.
      // Tempos em SEGUNDOS desde o início do áudio da resposta (pausas do narrador medidas
      // com silencedetect; se o áudio for regerado, conferir).
      tipo: "cta";
      // Rodada 7: teaser no início do bloco (durante a pergunta), com kinetic typography forte.
      // Sai em escala/fade antes de "SIGA ESTE CANAL". "\n" = quebra de linha.
      teaser: string;
      teaserEntraFrame: number; // frame do bloco em que a 1ª palavra entra
      chamada: string; // "Siga este canal" (creme, grande, 2 linhas)
      acompanhe: string; // "Acompanhe a chegada do" (creme, menor)
      acompanheEmSegundos: number;
      marca: string; // "Método JR." (dourado, grande: o ÚNICO texto dourado do bloco)
      marcaEmSegundos: number;
      logoEmSegundos: number; // o logo sobe do fundo e pousa junto com a assinatura
      pilula: string; // pílula chapada creme, texto #0F2A1D (entra quando a fala termina)
      pilulaEmSegundos: number;
      // Rodada 6: ícones das redes, monocromáticos, abaixo do logo. A pílula discreta
      // "O que ninguém te mostrou antes" saiu (decisão do Matheus, 22/10/2026); na rodada 7 a frase
      // volta como teaser (campo `teaser`).
      redes: RedeSocial[];
      redesEmSegundos: number;
    };

export type RedeSocial = "youtube" | "tiktok" | "instagram" | "facebook" | "x";

// Uma linha do ativos.json do bloco 06 (logo: nome do arquivo na mesma pasta do JSON).
export type Ativo = { ticker: string; nome: string; logo: string };

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
  // De onde o conteúdo do bloco entra (movimento da troca de bloco, rodada 4).
  entrada?: "direita" | "esquerda" | "baixo" | "cima";
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
  | "deslizeHorizontal" // a nova entra pela direita
  | "deslizeEsquerda" // a nova entra pela esquerda
  | "empurraoDescendo" // a nova desce de cima e empurra a antiga para baixo
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
  // Rodada 6: vários vídeos, um depois do outro na mesma cena, com cross-fade e whoosh entre eles.
  // Cada um ocupa a mesma fatia da cena. Arquivo que faltar = fatia só com o verde-escuro.
  | { tipo: "sequencia"; arquivos: string[] }
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
  // Rodada 7: escurecimento em PRETO neutro (0 a 1), sem puxar para o verde. Cena 3.
  escurecimentoNeutro?: number;
  posicaoY: number; // objectPosition vertical, 0 a 100 (%)
  desfoque?: number; // px; foto/vídeo de fundo desfocado
  // Dessatura (grayscale) a arte. Rodada 5: só as cenas 1 e 8; as cenas 3, 5 e 7 ficam com a
  // cor natural. O tingimento verde por cima é a constante TINGIMENTO em FundoCenas.tsx.
  dessaturar?: boolean;
  // Rodada 6: puxa a cor para o quente (sépia, 0 a 1), depois do dessaturar. Cena 7: tira o azul.
  aquecer?: number;
  // Rodada 6: vídeo mais curto que a cena toca mais devagar (até metade da velocidade) em vez de
  // repetir. Cena 1: o clipe de ~6 s cobre os ~10,6 s dos blocos 00 e 01 em câmera lenta.
  esticar?: boolean;
  // Reenquadra o fundo: escala e deslocamento (fração do quadro; +y = desce).
  enquadramento?: { escala: number; x: number; y: number };
  particulas?: boolean;
  raiosDeLuz?: boolean;
  // Rodada 7: só a cena 4. A linha e as barras do gráfico da foto crescem animadas por cima
  // (GraficoSubindo.tsx, coordenadas da imagem cena-4-dourado.png).
  graficoAnimado?: boolean;
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
  contador?: string; // contagem dos números (blocos 02 e 06)
  ok?: string; // check aparecendo (blocos 03 e 07)
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
    entrada: "direita",
    pergunta: { texto: "Quem é ele?", audio: `${A}01-pergunta.mp3` },
    resposta: { audio: `${A}01-resposta.mp3` },
    contador: "1/8",
    texto: "Criador do Método JR",
    destaque: "Método JR",
    elemento: { tipo: "logoSpotlight" },
  },
  {
    id: "02",
    entrada: "baixo",
    pergunta: { texto: "O que ele faz?", audio: `${A}02-pergunta.mp3` },
    resposta: { audio: `${A}02-resposta.mp3` },
    contador: "2/8",
    elemento: {
      tipo: "contadorCards",
      valorFinal: 15,
      prefixo: "+",
      rotulo: "Anos investindo",
      cards: [
        { texto: "Ações e ETFs", destaque: "ETFs", emFracao: 0.42, icone: "etf" },
        {
          texto: "Brasil e EUA",
          destaque: "EUA",
          emFracao: 0.68,
          // Rodada 7: Brasil à esquerda (lado do "BRASIL"), EUA à direita (lado do "EUA").
          // PROVISÓRIAS: SVGs simples feitos para conferir a posição. Quando o Matheus mandar os
          // PNGs, trocar o arquivo (ex.: images/bandeiras/brasil.png) e a proporção, se mudar.
          bandeiras: [
            { arquivo: "images/bandeiras/brasil-provisoria.svg", proporcao: 10 / 7 },
            { arquivo: "images/bandeiras/eua-provisoria.svg", proporcao: 19 / 10 },
          ],
        },
      ],
    },
    moedas: { semente: "bloco-02", aleatorias: 1, fixa: { emFracao: 0.55, x: 0.78 } },
  },
  {
    id: "03",
    entrada: "esquerda",
    pergunta: { texto: "O que é o Método JR?", audio: `${A}03-pergunta.mp3` },
    resposta: { audio: `${A}03-resposta.mp3` },
    contador: "3/8",
    elemento: {
      tipo: "cards",
      cards: [
        // Rodada 6: em duas linhas ("\n"), maiores e empilhados no centro.
        { texto: "Seleção\nde ativos", destaque: "Seleção", emFracao: 0.12, animacao: "esteira" },
        { texto: "Valor\nintrínseco", destaque: "intrínseco", emFracao: 0.62, animacao: "convergencia" },
      ],
    },
  },
  {
    id: "04",
    entrada: "cima",
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
    entrada: "direita",
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
    entrada: "baixo",
    pergunta: {
      texto: "Teria um portfólio de ativos para acompanhar?",
      audio: `${A}06-pergunta.mp3`,
    },
    resposta: { audio: `${A}06-resposta.mp3` },
    contador: "6/8",
    texto: "+400 ativos filtrados e calculados",
    destaque: "+400",
    elemento: {
      tipo: "contadorLista",
      valorFinal: 400,
      prefixo: "+",
      folgaFinalFrames: 15,
      passoPulso: 50,
      arquivoAtivos: "images/ativos-jr/ativos/ativos.json",
      rotuloLista: "Exemplos de ativos que acompanhamos",
    },
    moedas: { semente: "bloco-06", aleatorias: 2 },
  },
  {
    id: "07",
    entrada: "esquerda",
    pergunta: {
      // Rodada 6 (22/10/2026): texto novo. O 07-pergunta.mp3 precisa ser regerado com ele.
      texto: "Ele indica o que comprar e vender?",
      audio: `${A}07-pergunta.mp3`,
    },
    resposta: { audio: `${A}07-resposta.mp3` },
    contador: "7/8",
    elemento: {
      tipo: "contraste",
      riscado: "Diz o que comprar", // "\n" = quebra de linha
      riscoAposFrames: 14,
      duracaoRisco: 8,
      depoisDoRisco: "apagar",
      particulas: false,
      frases: [
        // Rodada 6: entra no "mostra" da fala (2,84 s, pela transcrição do Whisper).
        { texto: "Mostra o que faz", destaque: "Mostra", icone: "check", estiloFaz: "dourado", emSegundos: 2.84 },
        { texto: "Como faz", destaque: "faz", icone: "engrenagem", estiloFaz: "contorno", emSegundos: 4.32 },
        { texto: "E por que faz", destaque: "faz", icone: "lampada", estiloFaz: "pulso", emSegundos: 5.43 },
      ],
      fimFrasesSegundos: 7.15,
      legenda: "A decisão é de cada investidor",
      legendaEmFracao: 0.6,
    },
  },
  {
    id: "08",
    entrada: "baixo",
    pergunta: { texto: "Como conhecer o Método JR?", audio: `${A}08-pergunta.mp3` },
    resposta: { audio: `${A}08-resposta.mp3` },
    contador: "8/8",
    moedas: { semente: "bloco-08", aleatorias: 2 }, // caem atrás do logo
    elemento: {
      tipo: "cta",
      teaser: "O que ninguém\nte mostrou antes",
      teaserEntraFrame: 6,
      chamada: "Siga este canal",
      acompanhe: "Acompanhe a chegada do",
      acompanheEmSegundos: 5.05,
      marca: "Método JR.",
      marcaEmSegundos: 5.29,
      // O logo sobe ~1 s antes para POUSAR (fim da mola) junto com "MÉTODO JR." (5,29 s).
      logoEmSegundos: 4.55,
      pilula: "Em breve neste canal",
      pilulaEmSegundos: 7.7,
      redes: ["youtube", "tiktok", "instagram", "facebook", "x"],
      redesEmSegundos: 6.0, // logo depois do logo pousar com "MÉTODO JR." (5,29 s)
    },
  },
];

const C = "images/cenas/prontas/";
const V = "videos/cenas/";

// Escurecimento: camada #0F2A1D por cima do fundo. Rodada 4 (20/10/2026): bem leve
// em todas as cenas (8%); cena 5 em 12% (céu dourado) e cena 6 (mosaico) em 45%.
// Desfoque do fundo (px). Rodada 5: 2 px nas cenas comuns; 7 px nas cenas com número/texto legível
// no original (3 bolsa e 7 celular).
const DESFOQUE_PADRAO = 2;
const DESFOQUE_TEXTO_LEGIVEL = 7;
const ESCURECIMENTO = 0.08; // rodada 4: o mínimo para o texto ler (régua: bloco 02)

export const CENAS: Cena[] = [
  {
    // Rodada 6: clipe Higgsfield A1 (estúdio escuro, vulto de chapéu de costas no notebook, sem
    // rosto; suspense "em breve"). Esticado em câmera lenta para cobrir os blocos 00 e 01. Sem o
    // arquivo, a cena fica no verde-escuro liso.
    // Rodada 7: camada verde removida (era 58%). Testado 18% e 0%: com 0% o título e a pílula
    // continuam legíveis (o tom esverdeado que sobra é do próprio clipe).
    nome: "Cena 1: a1-estudio.mp4",
    fonte: { tipo: "video", arquivo: `${V}a1-estudio.mp4` },
    blocoInicial: "00",
    blocoFinal: "01",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "nenhuma",
    framesTransicao: 0,
    escurecimento: 0,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
    esticar: true,
    particulas: true,
  },
  {
    nome: "Cena 2: cena-2-moedas.jpg",
    fonte: { tipo: "imagem", arquivo: `${C}cena-2-moedas.jpg` },
    blocoInicial: "02",
    blocoFinal: "02",
    movimento: { tipo: "zoom", de: 1.1, para: 1 },
    transicao: "deslizeHorizontal",
    framesTransicao: 16,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
  },
  {
    // Rodada 3: vídeo da bolsa (tabela de números). Rodada 6: com 7 px ainda dava para ler os
    // números (inventados). Rodada 7: a tabela vira ambiente/referência e aparece NÍTIDA, sem a
    // camada verde (era 62%) e sem desfoque (era 24 px). Só um preto neutro leve para os selos.
    nome: "Cena 3: cena-3-bolsa.mp4",
    fonte: { tipo: "video", arquivo: `${V}cena-3-bolsa.mp4` },
    blocoInicial: "03",
    blocoFinal: "03",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "empurraoVertical",
    framesTransicao: 16,
    escurecimento: 0,
    escurecimentoNeutro: 0.12,
    posicaoY: 50,
  },
  {
    // Imagem de 940 px de largura (< 1170): zoom de 103% e pan menor.
    nome: "Cena 4: cena-4-dourado.png",
    fonte: { tipo: "imagem", arquivo: "images/cena-4-dourado.png" },
    blocoInicial: "04",
    blocoFinal: "04",
    movimento: { tipo: "panVertical", zoom: 1.03, deY: 0.014, paraY: -0.014 },
    transicao: "empurraoDescendo",
    framesTransicao: 18,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
    raiosDeLuz: true,
    graficoAnimado: true,
  },
  {
    // Rodada 6: no lugar do trigo, três clipes Higgsfield do sertanejo em sequência, com
    // cross-fade e whoosh entre eles: boi (A2) → caminhonete (A3) → soja (A4).
    nome: "Cena 5: boi, caminhonete e soja",
    fonte: { tipo: "sequencia", arquivos: [`${V}a2-boi.mp4`, `${V}a3-picape.mp4`, `${V}a4-soja.mp4`] },
    blocoInicial: "05",
    blocoFinal: "05",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "deslizeEsquerda",
    framesTransicao: 14,
    // 45%: luz de fim de tarde dourada compete com o "FÁCIL" dourado.
    escurecimento: 0.45,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
    particulas: true,
  },
  {
    nome: "Cena 6: cena-6-mosaico.jpg",
    fonte: { tipo: "imagem", arquivo: `${C}cena-6-mosaico.jpg` },
    blocoInicial: "06",
    blocoFinal: "06",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "empurraoVertical",
    framesTransicao: 18,
    // Rodada 6: 70% (era 45%) para os tiles dos ativos ficarem sobre o verde-escuro.
    escurecimento: 0.7,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
  },
  {
    // Rodada 3: vídeo do celular/tablet com gráficos (aparece texto legível,
    // como "BTC-USD"): desfoque de 7 px (rodada 5).
    // Rodada 6: as velas eram azul/ciano (fora da paleta). Dessaturado, puxado para o quente
    // (sépia) e escurecido 50%.
    nome: "Cena 7: cena-7-celular.mp4",
    fonte: { tipo: "video", arquivo: `${V}cena-7-celular.mp4` },
    blocoInicial: "07",
    blocoFinal: "07",
    movimento: { tipo: "zoom", de: 1, para: 1.06 },
    transicao: "deslizeHorizontal",
    framesTransicao: 14,
    escurecimento: 0.5,
    posicaoY: 50,
    desfoque: DESFOQUE_TEXTO_LEGIVEL,
    dessaturar: true,
    aquecer: 0.45,
  },
  {
    nome: "Cena 8: cena-8-linhas.mp4",
    fonte: { tipo: "video", arquivo: `${V}cena-8-linhas.mp4` },
    blocoInicial: "08",
    blocoFinal: "08",
    movimento: { tipo: "zoom", de: 1.08, para: 1 },
    transicao: "empurraoDescendo",
    framesTransicao: 20,
    escurecimento: ESCURECIMENTO,
    posicaoY: 50,
    desfoque: DESFOQUE_PADRAO,
    dessaturar: true,
    particulas: true,
    brilhoLogo: true,
    brilhoY: 0.565,
  },
];

export const SONS: Sons = {
  trilha: "audio/apresentacao/musica-fundo.mp3",
  // Efeitos (rodada 3, 20/10/2026): arquivos em public/audio/apresentacao/sfx/.
  // Volume e momento de cada um: src/utils/sfxApresentacao.ts.
  whoosh: "audio/apresentacao/sfx/sfx-whoosh.mp3",
  tick: "audio/apresentacao/sfx/sfx-tick.mp3",
  moeda: "audio/apresentacao/sfx/sfx-moeda.mp3",
  impacto: "audio/apresentacao/sfx/sfx-impacto.mp3",
  // Rodada 4: ligados porque os arquivos existem (20/10/2026).
  contador: "audio/apresentacao/sfx/sfx-contador.mp3",
  ok: "audio/apresentacao/sfx/sfx-ok.mp3",
};

// Fecho do bloco 08 (rodada 5d): o logo vem em direção ao espectador até ocupar ~95% da largura.
// O logo final do bloco 08 tem 55% da largura, então a escala é 0,95 / 0,55. Para testar um logo maior
// no Studio, aumente este valor (ex.: 2).
export const ESCALA_FINAL_LOGO = 0.95 / 0.55;

// Rodada 7: variação do CTA do bloco 08 (o Matheus escolhe no Studio trocando esta letra).
// "a" = "SIGA ESTE CANAL" grande como antes e "MÉTODO JR." maior, entrando com escala e flash.
// "b" = "SIGA ESTE CANAL" menor (preparação) e "MÉTODO JR." revelado por máscara com traço de luz,
//       flash largo, reflexo nas letras e estouro de partículas.
export const VARIACAO_CTA: "a" | "b" = "a";

// Volumes (0 a 1). A narração toca em 1,0.
export const VOLUMES = {
  musica: 0.2, // blocos 00 a 07
  // Música no bloco 08 (rodada 5b): baixa durante a fala e sobe devagar depois que ela termina.
  musicaCtaDuranteFala: 0.12,
  musicaCtaAposFala: 0.28, // máximo, atingido ao fim da subida lenta
  subidaMusicaCtaFrames: 60,
  musicaComEfeito: 0.15, // ducking: a música baixa para este valor (base 0,20) enquanto um efeito toca
  fadeInMusicaFrames: 30,
  fadeOutMusicaFrames: 60, // nos últimos 2 segundos
};

export const LOGO = "images/logo-jr.png";
// Rodada 7: cópia escurecida do logo para a espessura do Logo3D (sem filtro CSS a cada frame).
export const LOGO_ESCURO = "images/logo-jr-escuro.png";

// Tempos (em frames, a 30 fps).
export const TEMPOS = {
  folgaFimBloco: 20, // folga depois do áudio do narrador
  inicioPergunta: 4, // a voz da pergunta entra junto com a pílula
  respiroPerguntaResposta: 6, // pausa entre a pergunta e a resposta
  inicioAbertura: 10, // o narrador da abertura entra depois do logo começar a girar
  reservaAudioFaltando: 90, // áudio que não existe: bloco mudo com esta duração
  seguraCartela: 30, // a cartela final fica parada mais um pouco no fim
};
