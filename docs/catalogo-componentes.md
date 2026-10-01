# Catálogo de Componentes

Gerado lido direto do código em `src/components/` e `src/components/v2/` (e dos
`defaultProps` em `src/Composition.tsx`) em 28/09/2026, atualizado em
30/09/2026. Onde o código não diz algo explicitamente, este documento diz
**"não confirmado"** em vez de supor.

**Nota sobre cores:** os valores padrão de cor de vários componentes (ex.:
`#22C55E`, `#0d0f14`, `#f0ebe0`) são de um estilo provisório antigo, usado só
pra testar os componentes isolados no Studio — **não são as cores da marca**.
Os planos de edição (JSON, Etapa 6) passam as cores da marca explicitamente
via props; esses padrões nunca deveriam aparecer no vídeo final sem serem
sobrescritos.

## ⚠️ Dois padrões de personagem, ainda não unificados

O projeto tem **dois jeitos diferentes** de mostrar a imagem de um "personagem"
(PNG de `public/images/personagens/`), coexistindo sem que a unificação tenha
sido decidida:

1. **`imagemPersonagem` (prop embutida)** — usada dentro de `BarrasDuelo`,
   `ColagemFotos`, `GraficoCrescimento` e `TextoContraste`. Cada um desses 4
   arquivos tem sua própria cópia da lógica de `<Img>` + animação de entrada,
   duplicada independentemente em cada componente.
2. **`PersonagemImagem` (componente próprio)** — um componente à parte, com
   sua própria `<Sequence>` independente na timeline. Usado ao lado do
   `ListaCheck` (que não tem mais nenhuma prop de imagem própria).

**Não decidido:** se o padrão 2 deveria substituir o padrão 1 nos outros 4
componentes, ou se os dois vão continuar existindo por motivos diferentes.

---

## Componentes originais — `src/components/`

### ImagemFade
**Arquivo:** `src/components/ImagemFade.tsx`
**O que faz:** mostra uma imagem com fade de entrada (opacidade 0 → 1).
**Status:** não confirmado (sem nota de validação no ARQUITETURA.md).

| Prop | Tipo (zod) | Opcional | Valor padrão (Composition.tsx) |
|---|---|---|---|
| `src` | `string` | não | `"images/selic.png"` |
| `corFundo` | `zColor()` | **sim** | `"#ffffff"` no Composition.tsx; padrão do componente = `"transparent"` |
| `larguraPorcentagem` | `number` (min 1, max 100) | não | `80` |
| `frameEntrada` | `number` (min 0) | não | `30` |

---

### GraficoLinha
**Arquivo:** `src/components/GraficoLinha.tsx`
**O que faz:** linha que se desenha com curva suave, gradiente, brilho e área
preenchida embaixo; número contando e ponto pulsante na ponta.
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `titulo` | `string` | não | `"Valorização"` |
| `valorFinal` | `number` | não | `32` |
| `corFundo` | `zColor()` | **sim** | `"#111318"` no Composition.tsx; padrão do componente = `"transparent"` |
| `corLinhaInicio` | `zColor()` | não | `"#00d9ff"` |
| `corLinhaFim` | `zColor()` | não | `"#00ff9d"` |
| `largura` | `number` (min 100) | não | `880` |
| `altura` | `number` (min 100) | não | `420` |
| `frameFimSaida` | `number` (min 1) | não | `140` |
| `mostrarNumero` | `boolean` | **sim** | não definido no Composition.tsx; padrão do componente = `true` |
| `rotuloEixoX` | `string` | **sim** | não definido; sem padrão no componente (fica sem rótulo se omitido) |
| `oscilar` | `boolean` | **sim** | não definido no Composition.tsx; padrão do componente = `false` |
| `textoFinal` | `string` | **sim** | não definido; sem padrão no componente (não aparece se omitido) |

---

### ColagemCenas
**Arquivo:** `src/components/ColagemCenas.tsx`
**O que faz:** várias imagens entrando escalonadas no tempo, com rotação e
spring (estilo "colagem de papel"); moldura branca opcional (`estiloPolaroid`).
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#f0ebe0"` no Composition.tsx; padrão do componente = `"transparent"` |
| `cenas` | `array` de objeto (ver abaixo) | não | 3 itens (ver código) |
| `estiloPolaroid` | `boolean` | **sim** | não definido no Composition.tsx; padrão do componente = `false` |

Cada item de `cenas`: `{ src: string, x: number, y: number, largura: number (min 10), rotacaoFinal: number, frameEntrada: number (min 0) }` — todos obrigatórios.

---

### ComparacaoBarras
**Arquivo:** `src/components/ComparacaoBarras.tsx`
**O que faz:** barras verticais crescendo com spring, número contando em cima
(opcional) e destaque visual numa das barras.
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `valorMaximoEscala` | `number` (min 1) | não | `30` |
| `larguraBarra` | `number` (min 10) | não | `220` |
| `alturaMaximaBarra` | `number` (min 10) | não | `380` |
| `barras` | `array` de objeto (ver abaixo) | não | 2 itens (ver código) |
| `mostrarValores` | `boolean` | **sim** | não definido no Composition.tsx; padrão do componente = `true` |
| `legenda` | `string` | **sim** | não definido; sem padrão (não aparece se omitido) |

Cada item de `barras`: `{ label: string, valorFinal: number, cor: zColor(), corTopo: zColor(), frameEntrada: number (min 0), destaque: boolean }` — todos obrigatórios.

---

### TextoDestaque
**Arquivo:** `src/components/TextoDestaque.tsx`
**O que faz:** overlay de texto (palavra/frase em destaque), posição
topo/centro/rodapé, fundo semi-transparente opcional ou sombra.
**Status:** **Pronto e testado no Studio (25/09/2026)** — nota do ARQUITETURA.md.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `texto` | `string` | não | `"RENDA FIXA"` |
| `posicao` | `enum("topo","centro","rodape")` | não | `"centro"` |
| `duracaoFrames` | `number` (min 10) | não | `90` |
| `corTexto` | `zColor()` | não | `"#ffffff"` |
| `corFundo` | `zColor()` | não | `"rgba(0,0,0,0.55)"` |
| `mostrarFundo` | `boolean` | não | `true` |
| `tamanhoFonte` | `number` (min 10) | não | `80` |

---

### Seta
**Arquivo:** `src/components/Seta.tsx`
**O que faz:** traço "desenhado à mão" (reto ou curvo, nunca geometricamente
perfeito — pontos fixos com pequeno desvio perpendicular, ligados por curva
suave, mesma técnica do `CirculoDestaque`) que se desenha da base até a
ponta na entrada (~0,5s por padrão) e some com fade completo na saída.
Traço chapado, sem blur. Nenhum tamanho fixo em pixel — tudo em fração de
`width`/`height` do `useVideoConfig()`.
**Status:** **redesenhada (01/10/2026), ainda não validada visualmente pelo
Matheus no Studio.**

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `xInicial` (fração da largura) | `number` (min 0, max 1) | **sim** | `0.25` |
| `yInicial` (fração da altura) | `number` (min 0, max 1) | **sim** | `0.7` |
| `xFinal` (fração da largura) | `number` (min 0, max 1) | **sim** | `0.6` |
| `yFinal` (fração da altura) | `number` (min 0, max 1) | **sim** | `0.35` |
| `cor` | `zColor()` | **sim** | `"#EFAF20"` |
| `espessura` (fração da largura) | `number` (min 0.001, max 0.05) | **sim** | `0.008` |
| `curvatura` | `enum("reta","curva")` | **sim** | `"curva"` |
| `duracaoFrames` | `number` (min 10) | **sim** | `60` |
| `framesEntrada` | `number` (min 1) | **sim** | `15` |
| `framesSaida` | `number` (min 1) | **sim** | `15` |

**Mudança de unidade (01/10/2026):** antes `xInicial`/`yInicial`/`xFinal`/
`yFinal`/`espessura` eram pixel absoluto (ex.: `300`, `8`), calibrados pra
tela de 1280×720. Agora são fração (0 a 1) de `width`/`height`, como todo o
resto do catálogo novo — nada usava esses valores antigos em nenhum plano,
então não quebrou nada real. `framesEntrada`/`framesSaida` são novas: antes
não existia conceito de saída/fade, só entrada.

---

### Checkmark
**Arquivo:** `src/components/Checkmark.tsx`
**O que faz:** check com pop de escala (spring), círculo de fundo opcional.
**Status:** **Pronto e validado no Studio (26/09/2026)** — nota do ARQUITETURA.md.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `x` | `number` | não | `640` |
| `y` | `number` | não | `360` |
| `tamanho` | `number` (min 10) | não | `160` |
| `cor` | `zColor()` | não | `"#ffffff"` |
| `corFundo` | `zColor()` | não | `"#0f9e6e"` |
| `mostrarFundo` | `boolean` | não | `true` |
| `duracaoFrames` | `number` (min 10) | não | `60` |

---

## Componentes novos — `src/components/v2/`

Nenhum destes é mencionado no ARQUITETURA.md até agora — status "não
confirmado" em todos, mesmo que tenham sido usados/observados em conversas
anteriores (o `ListaCheck`, em especial, foi refatorado por completo depois
de qualquer teste anterior).

### ListaCheck (v2)
**Arquivo:** `src/components/v2/ListaCheck.tsx`
**O que faz:** **um item só** — uma frase com uma palavra em destaque, mais um
check que se desenha ao lado. Não tem mais array/lista interna: cada frase é
uma chamada separada do componente, cada uma dentro da sua própria
`<Sequence>` na composição. Sem prop de imagem (ver nota do topo).
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `texto` | `string` | não | `"EMPRESAS BOAS"` |
| `destaque` | `string` | não | `"BOAS"` |
| `top` | `number` (min 0, max 1) | não | `0.15` |
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `corCard` | `zColor()` | **sim** | não definido no Composition.tsx; padrão do componente = `"rgba(8,10,8,0.4)"` — cor do card chapado (sem blur), separada do `corFundo` (tela toda) |
| `corTexto` | `zColor()` | não | `"#ffffff"` |
| `corDestaque` | `zColor()` | não | `"#22C55E"` |
| `corCheck` | `zColor()` | não | `"#22C55E"` |
| `tamanhoFonte` | `number` (min 0.005, max 0.5) | não | `0.034` |
| `frameEntradaCheck` | `number` (min 0) | não | `18` |
| `duracaoFrames` | `number` (min 10) | não | `150` |
| `framesSaida` | `number` (min 1) | não | `25` |

---

### ColagemFotos (v2)
**Arquivo:** `src/components/v2/ColagemFotos.tsx`
**O que faz:** fotos "impressas jogadas na mesa" (borda branca, sombra,
rotação leve), entrando uma por vez; etiqueta de texto opcional em cima.
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `fotos` | `array` de objeto (ver abaixo) | não | 3 itens (ver código) |
| `etiqueta` | `string` | não | `"Ativos Reais"` |
| `mostrarEtiqueta` | `boolean` | não | `true` |
| `corEtiqueta` | `zColor()` | não | `"#22C55E"` |
| `larguraFoto` | `number` (min 0.05, max 0.9) | não | `0.42` |
| `imagemPersonagem` | `string` | **sim** | não definido no Composition.tsx; sem padrão (sem imagem se omitido) |
| `tamanhoImagemPersonagem` | `number` (min 0.05, max 0.6) | **sim** | não definido no Composition.tsx; padrão do componente = `0.3` |
| `frameEntradaPersonagem` | `number` (min 0) | **sim** | não definido no Composition.tsx; sem padrão fixo — o componente calcula `frameEntrada` da última foto `+ 20` se omitido |

Cada item de `fotos`: `{ src: string, rotacao: number, frameEntrada: number (min 0) }` — todos obrigatórios.

---

### TextoContraste (v2)
**Arquivo:** `src/components/v2/TextoContraste.tsx`
**O que faz:** duas palavras em contraste — uma positiva (com check
desenhado e glow) e uma negativa (com risco horizontal que se desenha num
frame configurável).
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `textoPositivo` | `string` | não | `"INVESTIR"` |
| `textoNegativo` | `string` | não | `"ESPECULAR"` |
| `corPositivo` | `zColor()` | não | `"#ffffff"` |
| `corNegativo` | `zColor()` | não | `"#6b7280"` |
| `frameRisco` | `number` (min 0) | não | `55` |
| `duracaoFramesRisco` | `number` (min 1) | não | `18` |
| `tamanhoFontePositivo` | `number` (min 0.005, max 0.5) | não | `0.06` |
| `tamanhoFonteNegativo` | `number` (min 0.005, max 0.5) | não | `0.042` |
| `imagemPersonagem` | `string` | **sim** | não definido no Composition.tsx; sem padrão (sem imagem se omitido) |
| `tamanhoImagemPersonagem` | `number` (min 0.05, max 0.6) | **sim** | não definido no Composition.tsx; padrão do componente = `0.22` |

---

### LegendaDiscreta (v2)
**Arquivo:** `src/components/v2/LegendaDiscreta.tsx`
**O que faz:** texto pequeno, sem card/fundo, fade simples de entrada e
saída. Sem prop de imagem.
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `texto` | `string` | não | `"Guardar um pouco todo mês"` |
| `corTexto` | `zColor()` | não | `"#e5e7eb"` |
| `tamanhoFonte` | `number` (min 0.005, max 0.5) | não | `0.024` |
| `posicao` | `enum("topo","centro","rodape")` | não | `"rodape"` |
| `duracaoFrames` | `number` (min 10) | não | `120` |
| `sombra` | `boolean` | **sim** | sem padrão no Composition.tsx; padrão do componente = `false` (desligada) |

**Quando ligar `sombra` (01/10/2026):** o componente já tem um `textShadow`
escuro com blur, fixo, pensado pra contraste sobre vídeo. Isso não basta
quando a legenda cai sobre um **fundo claro**, ou sobre uma cor **parecida
com `corTexto`** — nesses casos o texto quase some. `sombra: true` acrescenta
um contorno fino chapado (sem blur, `-webkit-text-stroke`) na cor da marca
(`#0F2A1D`), escalado pelo tamanho da fonte (que já escala pela largura do
vídeo) — nunca pixel fixo. Desligado por padrão, porque a maioria dos usos é
sobre vídeo, onde o `textShadow` já resolve.

---

### BarrasDuelo (v2)
**Arquivo:** `src/components/v2/BarrasDuelo.tsx`
**O que faz:** duas (ou mais) barras verticais crescendo, sem nenhum número
exibido em lugar nenhum — `alturaRelativa` é só proporção visual (0 a 1),
nunca um dado mostrado na tela.
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `barras` | `array` de objeto (ver abaixo) | não | 2 itens (ver código) |
| `legenda` | `string` | não | `"ilustrativo"` |
| `mostrarLegenda` | `boolean` | não | `true` |
| `larguraBarra` | `number` (min 0.02, max 0.5) | não | `0.16` |
| `alturaMaxima` | `number` (min 0.05, max 0.9) | não | `0.45` |
| `imagemPersonagem` | `string` | **sim** | não definido no Composition.tsx; sem padrão (sem imagem se omitido) |
| `tamanhoImagemPersonagem` | `number` (min 0.05, max 0.6) | **sim** | não definido no Composition.tsx; padrão do componente = `0.24` |

Cada item de `barras`: `{ label: string, alturaRelativa: number (min 0, max 1), cor: zColor(), destaque: boolean, frameEntrada: number (min 0) }` — todos obrigatórios.

---

### GraficoCrescimento (v2)
**Arquivo:** `src/components/v2/GraficoCrescimento.tsx`
**O que faz:** linha "realista" (com pequenos recuos, não uma reta perfeita)
que se desenha da esquerda pra direita, área preenchida translúcida, ponto
acompanhando a ponta. Sem nenhum número exibido em lugar nenhum
(nem como opção).
**Status:** não confirmado.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `corFundo` | `zColor()` | **sim** | `"#0d0f14"` no Composition.tsx; padrão do componente = `"transparent"` |
| `corLinha` | `zColor()` | não | `"#22C55E"` |
| `rotuloEixoX` | `string` | não | `"ANOS"` |
| `mostrarRotuloEixoX` | `boolean` | não | `true` |
| `textoIlustrativo` | `string` | não | `"ilustrativo"` |
| `mostrarTextoIlustrativo` | `boolean` | não | `true` |
| `textoFinal` | `string` | não | `"VALORIZOU"` |
| `mostrarTextoFinal` | `boolean` | não | `true` |
| `largura` | `number` (min 0.1, max 0.95) | não | `0.85` |
| `altura` | `number` (min 0.1, max 0.95) | não | `0.4` |
| `duracaoFramesDesenho` | `number` (min 10) | não | `130` |
| `imagemPersonagem` | `string` | **sim** | não definido no Composition.tsx; sem padrão (sem imagem se omitido) |
| `tamanhoImagemPersonagem` | `number` (min 0.05, max 0.6) | **sim** | não definido no Composition.tsx; padrão do componente = `0.26` |

---

### PersonagemImagem (v2)
**Arquivo:** `src/components/v2/PersonagemImagem.tsx`
**O que faz:** mostra **um** personagem (PNG de `public/images/personagens/`)
com zoom de entrada e fade de saída — camada própria e independente, criada
pra não esconder a imagem dentro de outro componente (ver nota do topo).
**Status:** não confirmado (componente novo).

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `imagem` | `string` | não | `"investidor.png"` |
| `top` | `number` (min 0, max 1) | não | `0.3` |
| `left` | `number` (min 0, max 1) | não | `0.36` |
| `tamanho` | `number` (min 0.05, max 0.8) | não | `0.28` |
| `duracaoFrames` | `number` (min 10) | não | `100` |
| `framesSaida` | `number` (min 1) | não | `20` |

---

### Contador (v2)
**Arquivo:** `src/components/v2/Contador.tsx`
**O que faz:** número contando de `valorInicial` até `valorFinal`, formato
brasileiro (`Intl.NumberFormat('pt-BR', ...)`, ex. `R$ 1.250,00`, tabular-nums),
dentro de um card sólido; rótulo opcional acima do número; fonte Inter
SemiBold via `@remotion/google-fonts`.
**Status:** **Pronto e validado no Studio (30/09/2026)** — nota do ARQUITETURA.md.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `valorInicial` | `number` | não | sem padrão — vem do plano |
| `valorFinal` | `number` | não | sem padrão — vem do plano |
| `prefixo` | `string` | não | `"R$ "` |
| `casasDecimais` | `number` (min 0, max 4) | não | `2` |
| `rotulo` | `string` | **sim** | sem padrão (não aparece se omitido) |
| `corCard` | `zColor()` | não | `"#0F2A1D"` |
| `corNumero` | `zColor()` | não | `"#F5F0E6"` |
| `corRotulo` | `zColor()` | não | `"#F5F0E6"` |
| `duracaoFramesContagem` | `number` (min 1) | não | `45` |
| `framesSaida` | `number` (min 1) | não | `15` |
| `duracaoFrames` | `number` (min 10) | não | `90` |
| `tamanhoFonte` | `number` (min 0.01, max 0.5) | não | `0.09` |
| `top` | `number` (min 0, max 1) | não | `0.38` |

**Regra:** todas as props do `Contador` têm valor padrão, exceto `valorInicial`
e `valorFinal` — só esses dois precisam vir do plano de edição (JSON, ver
ARQUITETURA.md Etapa 6); todo o resto (formato, cores, tamanho, tempos) já
funciona sem nenhum dado extra.

---

### Spotlight (v2)
**Arquivo:** `src/components/v2/Spotlight.tsx`
**O que faz:** escurece o resto da tela (cor chapada + opacidade) e deixa um
círculo "aceso" no meio, via `mask-image`/`WebkitMaskImage` com
`radial-gradient` — a área dentro do raio fica sem nenhuma camada por cima,
então o vídeo aparece normalmente ali. O raio cresce de 0 até o valor final
com `spring()` durante `framesEntrada`; a borda dourada acompanha o mesmo
raio animado. Sem `box-shadow`, sem `blur`, sem glow. Nota no código: na
futura `PlanoComposicao` (Etapa 6), o Spotlight deve ficar **abaixo** dos
cards na ordem das camadas.
**Status:** Visto no Studio (30/09/2026): círculo aceso em volta, resto escurecido.

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `x` (fração da largura) | `number` (min 0, max 1) | não | `0.5` |
| `y` (fração da altura) | `number` (min 0, max 1) | não | `0.4` |
| `raio` (fração da largura) | `number` (min 0.02, max 0.6) | não | `0.18` |
| `corEscurecimento` | `zColor()` | não | `"#0F2A1D"` |
| `opacidadeEscurecimento` | `number` (min 0, max 1) | não | `0.65` |
| `corBorda` | `zColor()` | não | `"#EFAF20"` |
| `espessuraBorda` (px, `0` = desligada) | `number` (min 0) | não | `2` |
| `framesEntrada` | `number` (min 1) | não | `18` |
| `framesSaida` | `number` (min 1) | não | `15` |
| `duracaoFrames` | `number` (min 10) | não | `90` |
| `suavizacao` (fração da largura, `0` = borda seca) | `number` (min 0, max 0.3) | não | `0` |

---

### CallToAction (v2)
**Arquivo:** `src/components/v2/CallToAction.tsx`
**O que faz:** pill sólido com texto (ex.: "Inscreva-se") num dos 4 cantos da
tela, com entrada (spring + slide a partir do canto) e saída (fade) —
durante o tempo em que fica visível, um anel chapado (sem blur) pulsa ao
redor pra chamar atenção. Não reproduz ícone/logo de nenhuma plataforma.
Todo o dimensionamento vem de `useVideoConfig()` (largura/altura), sem
pixel fixo — funciona igual em vertical e horizontal. Registrado em duas
composições: `CallToAction` (1080×1920) e `CallToActionHorizontal`
(1920×1080).
**Status:** Pronto e validado no Studio (01/10/2026).

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `texto` | `string` | não | `"Inscreva-se"` |
| `posicao` | `enum("superior-esquerdo","superior-direito","inferior-esquerdo","inferior-direito")` | não | `"inferior-direito"` |
| `corBotao` | `zColor()` | não | `"#EFAF20"` |
| `corTexto` | `zColor()` | não | `"#0F2A1D"` |
| `corFundo` | `zColor()` | **sim** | sem padrão no Composition.tsx; padrão do componente = `"transparent"` |
| `tamanhoFonte` (fração da largura) | `number` (min 0.01, max 0.5) | não | `0.032` (vertical) / `0.022` (horizontal) |
| `margem` (fração da largura/altura) | `number` (min 0, max 0.3) | não | `0.05` (vertical) / `0.04` (horizontal) |
| `duracaoFrames` | `number` (min 10) | não | `90` |
| `framesEntrada` | `number` (min 1) | não | `15` |
| `framesSaida` | `number` (min 1) | não | `15` |

---

### CirculoDestaque (v2)
**Arquivo:** `src/components/v2/CirculoDestaque.tsx`
**O que faz:** círculo "desenhado à mão" que se traça em volta de uma região
da tela (uma palavra, um número, um ponto do vídeo) pra destacar, fica
visível e some. A forma sketchy (não uma elipse geométrica perfeita) vem de
pequenos desvios de raio fixos por ponto ao redor da elipse, ligados por
curvas suaves — mesma técnica da linha "realista" do `GraficoCrescimento`.
Nenhuma biblioteca de terceiro. Traço chapado, sem blur, cores da marca.
Todo o dimensionamento vem de `useVideoConfig()` — sem pixel fixo.
**Status:** Pronto e validado no Studio (01/10/2026).

| Prop | Tipo (zod) | Opcional | Valor padrão |
|---|---|---|---|
| `posicaoX` (fração da largura) | `number` (min 0, max 1) | **sim** | `0.5` |
| `posicaoY` (fração da altura) | `number` (min 0, max 1) | **sim** | `0.5` |
| `largura` (fração da largura, diâmetro da região) | `number` (min 0.02, max 1) | **sim** | `0.3` |
| `altura` (fração da altura, diâmetro da região) | `number` (min 0.02, max 1) | **sim** | `0.15` |
| `cor` | `zColor()` | **sim** | `"#EFAF20"` |
| `espessura` (fração da largura) | `number` (min 0.001, max 0.05) | **sim** | `0.006` |
| `duracaoFrames` | `number` (min 10) | **sim** | `60` |
| `framesEntrada` | `number` (min 1) | **sim** | `20` |
| `framesSaida` | `number` (min 1) | **sim** | `15` |
| `corFundo` | `zColor()` | **sim** | sem padrão no Composition.tsx; padrão do componente = `"transparent"` |
