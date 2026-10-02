# Checklist de revisão — editor-jr

Regras do projeto que são **verificáveis em código/arquivo** (não
opinião), com a fonte de cada uma. Pensado pra conferir componentes e
scripts antes de considerar um trecho pronto.

## 1. Cores só da marca
- Só `#0F2A1D` (verde-escuro), `#F5F0E6` (creme), `#EFAF20` (dourado).
  Nenhuma cor nova sem perguntar.
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seção 2.

## 2. Nenhum tamanho/posição em pixel fixo
- Tudo em fração (0 a 1) de `width`/`height`, lida de `useVideoConfig()`
  dentro do componente.
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seção 2; `CLAUDE.md`,
  "Padrão dos componentes".

## 3. Prop opcional precisa de padrão em dois lugares
- `.default(...)` no schema Zod **e** o mesmo valor repetido na
  desestruturação em JS do componente — o `.default()` do Zod só vale
  dentro de um `.parse()`/`.safeParse()`, uma composição que lê o plano
  direto recebe `undefined` sem isso.
- **Exceção:** `corFundo` (item 4) — segue a regra do item 4, não esta.
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seção 2 (cita o risco
  confirmado no `CallToAction`, ver `ARQUITETURA.md` seção 6).

## 4. `corFundo`, quando existir (exceção do item 3)
- `zColor().optional()` no schema, **sem** `.default()`, e
  `corFundo = "transparent"` na desestruturação — pra não tampar o vídeo
  por engano quando usado como camada sobre ele.
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seção 2.

## 5. Checar o catálogo antes de criar componente novo
- Conferir `docs/catalogo-componentes.md` (e o `CATALOGO` real em
  `src/PlanoComposicao.tsx`) pra não duplicar um componente que já existe
  ou já está "a construir".
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seções 1 e 4;
  `scripts/validar-plano.mjs` (comentário "componente existe no CATALOGO
  real", linha ~694) confere isso em runtime pro plano de edição.

## 6. "Validado"/"pronto" em docs só com data de conferência no Studio
- Todo "validado" ou "pronto" escrito em docs deve ter, ao lado, a data
  em que o Matheus conferiu no Studio. **Sem data, é achado.**
- Fonte: `CLAUDE.md`, seção "Protocolo de etapas" ("Nunca escrever
  'validado' sem o Matheus ter visto no Studio").

## 7. Todo componente de `src/components/v2/` está no `CATALOGO`
- Cada arquivo em `src/components/v2/` tem entrada no `CATALOGO` de
  `src/PlanoComposicao.tsx`.
- **Exceção: `AvisoCVM`** — pendente de validação no Studio; entra no
  `CATALOGO` depois que o Matheus validar. Não contar como achado enquanto
  essa exceção valer. Fonte: `docs/relatorio-noite-0201.md` (criado
  02/10/2026).
- Situação em 02/10/2026: os outros 11 componentes de `v2/` estão no
  `CATALOGO`; `AvisoCVM` está em `src/components/v2/AvisoCVM.tsx` mas não
  no `CATALOGO` (`src/PlanoComposicao.tsx:28-47`).

## 8. Sem blur
- Sem `blur`, sem `box-shadow`/`text-shadow`/`drop-shadow` difusa (com
  raio de desfoque), sem gradiente de cor pra "suavizar" cor sólida
  (gradiente só em alfa/`mask-image`).
- Fonte: `.claude/skills/editor-jr/SKILL.md`, seção 3.

## 9. Fonte vem do design system
- `fontFamily` deve vir do design system do projeto, não escolhida
  direto no componente.
- Observação: o design system de fontes **ainda não está definido** no
  repositório — `ARQUITETURA.md` Etapa 5 ("Aplicar paleta e fontes do
  Emparelhamento") não começou, e a Etapa 4 cita "uma fonte (provisória
  até a etapa 5)". Até lá, toda `fontFamily` atual é dívida (abaixo).

---

## Dívida conhecida (não contar como erro)

Encontrado por grep em `src/` em 02/10/2026 — só o que o grep achou.
Fonte do contexto das cores: `docs/catalogo-componentes.md`, "Nota sobre
cores" (estilo provisório antigo, usado só pra testar no Studio).

Greps usados (limites: só hex/`rgba()`, não pega nome de cor tipo
`"white"`; pixel só nos nomes de prop listados):
- cores: `#[0-9a-f]{3,8}` e `rgba?(...)`, excluindo as 3 da marca
- pixel: `x|y|largura|altura|tamanho*|fontSize|width|height|top|left|
  right|bottom|padding|margin|borderRadius|gap` com número ≥ 2 dígitos,
  ou `NNpx`
- blur: `blur`, `Shadow`, `drop-shadow`
- fonte: `fontFamily`

### Pergunta pro Matheus (não decidido)
- `src/components/v2/LegendaDiscreta.tsx:72` — `textShadow: "0 2px 10px
  rgba(0,0,0,0.6)"` (sombra com desfoque de 10px). Fica, sai, ou vira
  outra coisa? Não decidido.

### `src/components/ColagemCenas.tsx`
- Cor: `:78` `#ffffff`; `:81` `rgba(0,0,0,0.5)`
- Blur: `:81` `boxShadow: "0 16px 32px ..."`

### `src/components/ComparacaoBarras.tsx`
- Cor: `:144` `#c7cad1`; `:211` `#ffffff`; `:232` `#8a8f9c`
- Fonte: `:104`, `:146`, `:234` `Arial, sans-serif`

### `src/components/GraficoLinha.tsx`
- Cor: `:176` `#ffffff`; `:223` `#8a8f9c`; `:235` `#8a8f9c`
- Blur: `:162` `<feGaussianBlur stdDeviation="6">` (usado em `:164`)
- Fonte: `:214`, `:225`, `:237`, `:251` `Arial, sans-serif`

### `src/components/TextoDestaque.tsx`
- Cor: `:79` `rgba(0,0,0,0.7)`
- Pixel: `:77` `padding: "16px 32px"`; `:78` `borderRadius: 12`
- Blur: `:79` `textShadow: "0 2px 12px ..."`
- Fonte: `:87` `Arial, sans-serif`

### `src/components/v2/AvisoCVM.tsx`
- Cor: `:24`, `:38` `rgba(15, 42, 29, 0.78)` — é o `#0F2A1D` da marca
  com transparência; listado só porque o grep pegou.
- Fonte: `:73` `Arial, sans-serif`

### `src/components/v2/BarrasDuelo.tsx`
- Cor: `:104` `#c7cad1`; `:170` `#ffffff`; `:188` `#8a8f9c`
- Blur: `:98` `drop-shadow(${glow})`, com `glow` = `0 0
  ${larguraBarra * 0.25}px` (`:79-80`)
- Fonte: `:106`, `:190` `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/CallToAction.tsx`
- Fonte: `:130` `Arial, sans-serif`

### `src/components/v2/ColagemFotos.tsx`
- Cor: `:92` `#ffffff`; `:95` `rgba(0,0,0,0.55)`
- Blur: `:95` `boxShadow: "0 1.2vw 2.4vw ..."`
- Fonte: `:163` `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/Contador.tsx`
- Pixel: `:96` `borderRadius: 28`
- Fonte: `:13` `loadFont(...)` (Inter, via `@remotion/google-fonts`),
  usada em `:108`, `:120` — escolhida no componente, não num design
  system.

### `src/components/v2/GraficoCrescimento.tsx`
- Cor: `:186`, `:199` `#8a8f9c`
- Fonte: `:188`, `:201`, `:215` `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/LegendaDiscreta.tsx`
- Cor: `:72` `rgba(0,0,0,0.6)`
- Blur: `:72` — ver "Pergunta pro Matheus" acima.
- Fonte: `:68` `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/ListaCheck.tsx`
- Cor: `:89` `rgba(8,10,8,0.4)`; `:150` `rgba(255,255,255,0.08)`
- Fonte: `:160` `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/TextoContraste.tsx`
- Blur: `:120` `textShadow: \`0 0 ${fontePositivo * 0.3}px ...\``
- Fonte: `:117`, `:174` `'Arial Narrow', Arial, sans-serif`

### `src/Composition.tsx` (defaultProps do catálogo, por composição)
- `ImagemFade` — cor: `:56` `#ffffff`
- `GraficoLinha` — cor: `:72` `#111318`, `:73` `#00d9ff`, `:74`
  `#00ff9d`; pixel: `:75` `largura: 880`, `:76` `altura: 420`
- `ColagemCenas` — cor: `:89` `#f0ebe0`; pixel: `:93-95` `x: 40, y: 100,
  largura: 380`, `:101-103` `x: 450, y: 80, largura: 380`, `:109-111`
  `x: 860, y: 110, largura: 380`
- `ComparacaoBarras` — cor: `:127` `#0d0f14`, `:135` `#3d5a80`, `:136`
  `#6ea8d8`, `:143` `#0f9e6e`, `:144` `#00ff9d`
- `TextoDestaque` — cor: `:163` `#ffffff`, `:164` `rgba(0,0,0,0.55)`;
  pixel: `:166` `tamanhoFonte: 80`
- `Checkmark` — cor: `:202` `#ffffff`, `:203` `#0f9e6e`; pixel: `:199`
  `x: 640`, `:200` `y: 360`, `:201` `tamanho: 160`
- `ListaCheck` — cor: `:220` `#0d0f14`, `:221` `#ffffff`, `:222`, `:223`
  `#22C55E`
- `ColagemFotos` — cor: `:239` `#0d0f14`, `:247` `#22C55E`
- `TextoContraste` — cor: `:260` `#0d0f14`, `:263` `#ffffff`, `:264`
  `#6b7280`
- `LegendaDiscreta` — cor: `:281` `#e5e7eb`
- `BarrasDuelo` — cor: `:296` `#0d0f14`, `:301` `#6b7280`, `:308`
  `#22C55E`
- `GraficoCrescimento` — cor: `:328` `#0d0f14`, `:329` `#22C55E`
- `AvisoCVM` — cor: `:477` `rgba(15, 42, 29, 0.78)` (= `#0F2A1D` com
  transparência)

### Composições de teste (pasta "Testes", fora do catálogo)
- `src/TesteRoteiro01.tsx` — cor: `:23` `#22C55E`, `:24` `#6b7280`,
  `:122` `rgba(10,12,10,0.4)`, `:125` `rgba(255,255,255,0.08)`, `:132`,
  `:149`, `:300`, `:315` `#ffffff`, `:305` `rgba(34,197,94,0.65)`,
  `:377` `#e5e7eb`, `:411` `#4b5563`, `:412` `#9ca3af`, `:419`
  `#15803d`, `:450` `#4ade80`
- `src/TesteRoteiro02.tsx` — cor: `:16` `#22C55E`, `:17` `#6b7280`,
  `:40`, `:55`, `:70`, `:115` `#ffffff`, `:130` `#e5e7eb`
- `src/TesteVideoReal.tsx` — cor: `:18` `#ffffff`, `:19`
  `rgba(0,0,0,0.55)`
