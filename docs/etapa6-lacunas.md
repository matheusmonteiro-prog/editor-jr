# Etapa 6 — lacunas entre o decidido e o que existe (01/10/2026)

Levantamento feito lendo `ARQUITETURA.md` (seção 7, Etapa 6), `src/PlanoComposicao.tsx`,
`src/utils/tempoCortado.ts`, `scripts/validar-plano.mjs` e `planos/0926.plano.json`. Onde
não deu pra confirmar lendo o código, está marcado como "não confirmado" — nada aqui foi
suposto.

## 1. O que a seção 7 (Etapa 6) decidiu

Resumo fiel do que está escrito em `ARQUITETURA.md`, sem reinterpretar:

- **6a** — ler o formato de comando e gerar a timeline, sem IA. **6b** — gerar componente
  novo via API do Claude quando não existe no catálogo; aprovado, entra no catálogo.
  **Atualização de 07/10/2026 (decisão do Matheus):** a Etapa 6 fecha só com a 6a; a 6b só
  começa se ele mandar.
- O prompt pode pedir **várias saídas** da mesma gravação (ex.: vídeo principal + 2 cortes
  curtos). É o Matheus quem indica os trechos e as transições, não a IA sozinha. O formato
  do prompt precisa prever isso, incluindo o formato de tela de cada saída.
  **Atualização de 07/10/2026 (decisão do Matheus):** por enquanto só **prever**: 1 saída
  por padrão, e um plano antigo continua válido.
- O **formato oficial do roteiro/prompt (schema) só é definido nesta etapa** — não criar
  schema antes dela (já foi criado; ver abaixo).
- **Formato do plano de edição (JSON) — "DECIDIDO, EM IMPLEMENTAÇÃO"**: objeto com `video`,
  `orientacao`, `elementos` (array). Cada elemento: `id`, `componente`, `descricao`, `texto`,
  `inicio` ("m:ss"), `duracao` (segundos), `posicao` ("topo"|"base"), `slot` (inteiro),
  `ilustrativo` (bool), `tempo_estimado` (bool), `props` (objeto).
- **`"inicio"` sempre se refere ao vídeo ORIGINAL** (antes do corte de silêncio), nunca ao
  vídeo já cortado — mesma regra do `--gancho` da Etapa 2. A conversão pro tempo cortado é
  feita a partir do `.cortes.json`.
- **`"componente"` e `"props"` podiam ficar `"a confirmar"`** — descrito como **PROVISÓRIO**,
  "até existir `docs/catalogo-componentes.md`".
- **Cada elemento do array é uma camada** (mesma regra da seção 3, "Decisões tomadas").
- **Onde o plano é gerado:** no chat de um Projeto do Claude, a partir da transcrição —
  **não** dentro do editor-jr.
- A seção já registra que **a composição que lê esse JSON existe** (`src/PlanoComposicao.tsx`,
  conversão de tempo em `src/utils/tempoCortado.ts`, validação em `scripts/validar-plano.mjs`)
  e cita um plano real aprovado no Studio (`planos/0926.plano.json`, composição
  `PlanoComposicao0926`) — "6a em andamento"; "6b ainda não começou".
- **Nota de 01/10/2026, sem alterar o formato:** `"naPalavra"`+`"ocorrencia"` é um atalho
  futuro pra `"inicio"`, convertido **antes** da validação — depende da Etapa 4 (Whisper)
  existir primeiro. **Ainda não implementado** — e esta sessão não implementa, por decisão
  explícita (fora do escopo da tarefa, já que o formato de saída do Whisper não foi decidido).
- **Regras de conteúdo** registradas na seção, pra valer quando o schema fosse criado: uma
  camada por ideia falada (nunca juntar frases num card só); `"slot"` é posição vertical
  dentro da zona (1 = mais alto); gráfico sem dado real leva `"ilustrativo": true` **e** a
  palavra "ilustrativo" aparece na tela; texto na tela nunca mais forte que a fala do JR
  (evitar "garante", "sempre", "rende mais", símbolos `≠ × =`) — "cautela editorial, não
  validada juridicamente"; regra provisória do `"a confirmar"` citada acima.
- **Pré-requisito da etapa:** chave da API da Anthropic, só pra 6b (que só começa se o
  Matheus mandar, decisão de 07/10/2026).

## 2. O que já existe de fato no código (confirmado lendo os arquivos)

- **`src/PlanoComposicao.tsx`** — define `CATALOGO`, um `Record<string, ComponentType>` com
  18 componentes registrados hoje (`ImagemFade`, `GraficoLinha`, `ColagemCenas`,
  `ComparacaoBarras`, `TextoDestaque`, `Seta`, `Checkmark`, `ListaCheck`, `ColagemFotos`,
  `TextoContraste`, `LegendaDiscreta`, `BarrasDuelo`, `GraficoCrescimento`,
  `PersonagemImagem`, `CallToAction`, `CirculoDestaque`, `Spotlight`, `Contador`). Lê
  `plano.elementos`, converte `"inicio"` ("m:ss") pra segundos, usa `criarParaFrameCortado`
  pra achar o frame na timeline cortada, e monta uma `<Sequence>` por elemento (`name=id`,
  `from=<frame convertido>`, `durationInFrames = el.duracaoFrames ?? duracao*fps`).
  `"componente"` pode ser uma string única ou um array de strings (vários componentes no
  mesmo elemento, cada um pegando sua fatia de `props` pelo próprio nome — é o que
  `0926.plano.json` usa em `["PersonagemImagem", "LegendaDiscreta"]`). Se `"componente"` ou
  `"props"` é `"a confirmar"`, o elemento renderiza `null` (nada aparece, não quebra nada).
  **Se o nome do componente não existir em `CATALOGO`, a composição lança
  `throw new Error("Componente desconhecido no catálogo: ...")` em runtime** — isso quebra o
  render; não havia nenhuma checagem prévia pra isso antes desta sessão (ver seção 3).
- **`src/utils/tempoCortado.ts`** — exporta `criarParaFrameCortado(trechos, fps)`: devolve uma
  função que converte um segundo do vídeo ORIGINAL pro frame do vídeo JÁ CORTADO, somando a
  duração dos trechos mantidos antes dele. Um tempo que caiu dentro de um silêncio cortado é
  jogado pro fim do trecho anterior.
- **`scripts/validar-plano.mjs`** — valida o JSON sem executar nada (nunca importa os .tsx
  como módulo, só faz parsing de AST via `typescript`). Antes desta sessão já checava: campos
  obrigatórios de cada elemento (incluindo formato de `"inicio"` e `"a confirmar"` como válido
  pra componente/props); ids duplicados; colisão de `posicao`+`slot` com tempos se cruzando
  (ERRO); "respiro" entre blocos de tempo < 0.5s (AVISO); elemento terminando depois do fim do
  vídeo, só se `--duracao` fosse passado manualmente (ERRO); cautela editorial por regex
  (AVISO); `ilustrativo=true` com dígito no texto (ERRO); texto todo em caixa alta (AVISO); e
  — pelo commit `7c27eff` ("Adiciona checagem de props obrigatorias por componente ao
  validar-plano.mjs, lendo os schemas via AST do typescript") — props obrigatórias faltando
  por componente, construindo um catálogo próprio a partir dos arquivos em `src/components` e
  `src/components/v2` (nome do arquivo = nome do componente), com componente "não encontrado"
  tratado como **AVISO**, não erro. Esse catálogo próprio nunca lia o `CATALOGO` real de
  `src/PlanoComposicao.tsx` — ou seja, um nome que existisse como arquivo mas não estivesse
  registrado no `CATALOGO` (ex.: esquecido na importação) passava pelo validador e só quebrava
  no render.
- **`planos/0926.plano.json`** — plano real no formato decidido, vídeo `"0926"`, orientação
  vertical, 8 elementos. Tem um campo extra `"fps": 30` que não faz parte do formato descrito
  na seção 7 — nem o validador nem `PlanoComposicao.tsx` usam ou rejeitam esse campo (`fps`
  real vem de `useVideoConfig()` da composição Remotion).
- **`videos/0926.cortes.json`** — tem `duracaoOriginal: 43.141995` e `duracaoFinal`, além dos
  `trechos` mantidos. É o arquivo que `criarParaFrameCortado` consome, e que agora o validador
  também lê (ver seção 3) pra saber a duração do vídeo original sem precisar de `--duracao`.
- **`planos/teste-4-componentes.plano.json`** — plano de teste no formato atual, com
  `CallToAction`, `CirculoDestaque`, `Spotlight` e `Contador`; passa limpo no validador.
- **`planos/teste-0926-opus.plano.json`** — plano **num formato diferente** do decidido na
  seção 7 (usa `"fim"` em vez de `"duracao"`, `"formato"` em vez de `"orientacao"`, não tem
  `descricao`/`posicao`/`slot`/`ilustrativo`/`tempo_estimado`). Não é um bug do validador —
  é um arquivo de um formato anterior/alternativo, incompatível com o schema atual.

## 3. O que faltava (e o que esta sessão cobriu)

Lacunas confirmadas por leitura de código, cobertas nesta sessão em `scripts/validar-plano.mjs`
(ver `git log` do arquivo pra detalhe por commit):

- **Componente inexistente no `CATALOGO` real** não quebrava o validador antes — só o render.
  Agora o validador lê o AST de `src/PlanoComposicao.tsx` e confere contra a lista real de
  chaves do `CATALOGO`, como ERRO (não mais via lista separada, nem via existência de arquivo).
- **Tipo errado de prop** (não só presença) não era checado. Agora a checagem de props também
  compara o tipo do valor recebido contra o tipo inferido do schema Zod (via AST — número,
  string, boolean, enum com valores, array, objeto, cor-como-string), sem executar o `.tsx`.
  Ver nota extensa no próprio script sobre por que não dá pra importar o Zod de verdade sem
  rodar JSX/efeitos colaterais (ex.: `Contador.tsx` roda `loadFont()` de rede no topo do
  módulo).
- **`"inicio"` fora da duração do vídeo original** exigia passar `--duracao` manualmente.
  Agora, na ausência da flag, o validador tenta carregar `duracaoOriginal` de
  `videos/<video>.cortes.json` sozinho. (`"inicio"` negativo já era rejeitado antes, por tabela
  — o formato `m:ss` da checagem 1 não aceita sinal de menos; isso ficou mais explícito na
  mensagem de erro agora.)
- **Colisão de `posicao`/`slot`** era ERRO; virou **AVISO**, por pedido explícito desta sessão
  (pode ser proposital).
- **`"a confirmar"` em `"componente"`/`"props"`** era aceito como válido (regra PROVISÓRIA da
  seção 7, "até existir `docs/catalogo-componentes.md`"). Esse arquivo já existe desde
  28/09/2026 — então virou **ERRO**.
- **Mensagens de erro/aviso não citavam o `id` real do elemento**, só um rótulo posicional
  (`el-1`, `el-2`...). Agora toda mensagem usa o `id` do elemento quando ele é válido.

## 4. O que continua faltando / fora do escopo

- **`naPalavra`/`ocorrencia`**: não implementado nesta sessão, por decisão explícita (depende
  da Etapa 4/Whisper, cujo formato de saída não foi decidido).
- **Campo extra `"fps"` em `0926.plano.json`**: não documentado no schema da seção 7; não
  confirmado se deveria ser formalizado ou removido — não é uma decisão técnica, é do Matheus.
- **Importar os schemas Zod de verdade** (em vez de inferir tipo via AST) continua **não
  viável** sem transpilar e executar os `.tsx`, pelo motivo documentado no script. Se um dia
  isso for necessário (ex.: checar `min`/`max` de números, não só o tipo), a alternativa mais
  segura seria isolar os `z.object({...})` num arquivo `.ts` próprio por componente, sem JSX
  nem efeitos de topo de módulo — mudança de padrão que não foi feita aqui por não ter sido
  pedida.
