// Nomes amigáveis (só para mostrar na tela). Sem importar nada: dá para testar pelo Node.
// O plano e o código continuam usando os nomes técnicos; aqui só se troca o que o Matheus lê.
// Fallback: se faltar tradução, aparece o nome técnico (nada some, nada quebra).
//
// Para uma peça nova do CATALOGO: acrescentar em COMPONENTES e, se ela tiver campo de texto ou
// cor novo, em CAMPOS (ou em CAMPOS_POR_PECA quando o mesmo nome muda de sentido).

export const COMPONENTES: Record<string, string> = {
  // originais (src/components)
  ImagemFade: "Imagem com fade",
  GraficoLinha: "Gráfico de linha",
  ColagemCenas: "Colagem de cenas",
  ComparacaoBarras: "Comparação de barras",
  TextoDestaque: "Texto em destaque",
  Seta: "Seta",
  Checkmark: "Visto (check)",
  // v2
  CamadaVideo: "Camada de vídeo",
  ListaCheck: "Lista com visto",
  ColagemFotos: "Colagem de fotos",
  TextoContraste: "Texto de contraste",
  LegendaDiscreta: "Legenda",
  BarrasDuelo: "Barras em duelo",
  GraficoCrescimento: "Gráfico de crescimento",
  PersonagemImagem: "Imagem",
  CallToAction: "Chamada para ação",
  CirculoDestaque: "Círculo de destaque",
  Spotlight: "Foco de luz (spotlight)",
  Contador: "Contador",
  AvisoCVM: "Aviso CVM",
  ArrobaInstagram: "@ do Instagram",
  LegendaAnimada: "Legenda animada",
  GradeAtivos3D: "Grade de ativos 3D",
  // kit v3
  ImpactoKit: "Palavra de impacto",
  ArrobaCanal: "@ do canal",
  DestaqueSolto: "Destaque solto",
  LinhaTrajetoria: "Linha de trajetória",
  FundoExplicativo: "Fundo explicativo",
  AberturaCapitulo: "Abertura de capítulo",
  ComparacaoNumeros: "Comparação de números",
  Pauta: "Pauta",
};

// Campos com o mesmo sentido em qualquer peça.
export const CAMPOS: Record<string, string> = {
  // cores
  cor: "Cor",
  corTexto: "Cor do texto",
  corDestaque: "Cor de destaque",
  corFundo: "Cor do fundo",
  corFundoClaro: "Cor do fundo claro",
  corCard: "Cor do cartão",
  corBotao: "Cor do botão",
  corCheck: "Cor do visto",
  corLinha: "Cor da linha",
  corLinhaInicio: "Cor da linha (início)",
  corLinhaFim: "Cor da linha (fim)",
  corEtiqueta: "Cor da etiqueta",
  corPositivo: "Cor do positivo",
  corNegativo: "Cor do negativo",
  corEscurecimento: "Cor do escurecimento",
  corBorda: "Cor da borda",
  corNumero: "Cor do número",
  corRotulo: "Cor do rótulo",
  corContorno: "Cor do contorno",
  corApagado: "Cor apagada",
  corAceso: "Cor acesa",
  // textos
  texto: "Texto",
  titulo: "Título",
  subtitulo: "Subtítulo",
  destaque: "Palavra em destaque",
  legenda: "Legenda",
  etiqueta: "Etiqueta",
  rotulo: "Rótulo",
  rotuloAntes: "Rótulo do valor de antes",
  rotuloDepois: "Rótulo do valor de depois",
  rotuloEixoX: "Rótulo do eixo X",
  textoFinal: "Texto final",
  textoIlustrativo: "Texto ilustrativo",
  textoPositivo: "Texto positivo",
  textoNegativo: "Texto negativo",
  prefixo: "Prefixo",
  marcador: "Marcador da lista",
  fonte: "Fonte (de onde vem o dado)",
  usuario: "Usuário (@)",
  linha1: "Linha 1 (pequena)",
  linha2: "Linha 2 (grande)",
  // caminhos de arquivo: escondidos do painel hoje, traduzidos para quando voltarem
  imagem: "Imagem",
  src: "Imagem",
  logo: "Logo",
  imagemPersonagem: "Imagem do personagem",
};

// Quando o mesmo nome de campo muda de sentido de uma peça para outra.
export const CAMPOS_POR_PECA: Record<string, Record<string, string>> = {
  LegendaDiscreta: { texto: "Texto da legenda" },
  CallToAction: { texto: "Texto do botão" },
  AvisoCVM: { texto: "Texto do aviso" },
  GraficoLinha: { titulo: "Título do gráfico" },
  Pauta: { titulo: "Título da lista" },
  Contador: { rotulo: "Rótulo do número" },
  AberturaCapitulo: { rotulo: "Linha pequena acima do título" },
  ComparacaoNumeros: { rotulo: "Linha pequena acima do título" },
  ArrobaInstagram: { usuario: "Usuário (sem o @)" },
  ArrobaCanal: { usuario: "Usuário (sem o @)" },
};

// Peça (ou lista de peças) → nome amigável. Peça dupla: "Imagem + Legenda".
export const rotuloDoComponente = (componente: string | string[]): string => {
  const um = (n: string) => COMPONENTES[n] ?? n;
  return Array.isArray(componente) ? componente.map(um).join(" + ") : um(componente);
};

export const temTraducaoDoComponente = (nome: string): boolean => nome in COMPONENTES;

// Campo → nome amigável, na peça em que ele aparece. Sem tradução: o nome técnico.
export const rotuloDoCampo = (peca: string, campo: string): string => CAMPOS_POR_PECA[peca]?.[campo] ?? CAMPOS[campo] ?? campo;

export const temTraducaoDoCampo = (peca: string, campo: string): boolean => campo in (CAMPOS_POR_PECA[peca] ?? {}) || campo in CAMPOS;
