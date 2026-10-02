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
  real", função que valida o campo `"componente"`) confere isso em
  runtime pro plano de edição.

## 6. "Validado"/"pronto" em docs só com data de conferência no Studio
- Todo "validado" ou "pronto" escrito em docs deve ter, ao lado, a data
  em que o Matheus conferiu no Studio. **Sem data, é achado.**
- Fonte: `CLAUDE.md`, seção "Protocolo de etapas" ("Nunca escrever
  'validado' sem o Matheus ter visto no Studio").

## 7. Todo componente de `src/components/v2/` está no `CATALOGO`
- Cada arquivo em `src/components/v2/` tem entrada no `CATALOGO` de
  `src/PlanoComposicao.tsx`.
- Sem exceções: todos os componentes de `v2/`, incluindo `AvisoCVM`,
  devem estar no `CATALOGO` em `src/PlanoComposicao.tsx`.

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

A comparação com a dívida é por **arquivo + valor**, nunca por número
de linha.

### Pergunta pro Matheus (não decidido)
- `src/components/v2/LegendaDiscreta.tsx` — `textShadow: "0 2px 10px
  rgba(0,0,0,0.6)"` (sombra com desfoque de 10px). Fica, sai, ou vira
  outra coisa? Não decidido.

### `src/components/ColagemCenas.tsx`
- Cor: `#ffffff`; `rgba(0,0,0,0.5)`
- Blur: `boxShadow: "0 16px 32px ..."`

### `src/components/ComparacaoBarras.tsx`
- Cor: `#c7cad1`; `#ffffff`; `#8a8f9c`
- Fonte: `Arial, sans-serif`

### `src/components/GraficoLinha.tsx`
- Cor: `#ffffff`; `#8a8f9c`
- Blur: `<feGaussianBlur stdDeviation="6">` (e o filtro que o usa)
- Fonte: `Arial, sans-serif`

### `src/components/TextoDestaque.tsx`
- Cor: `rgba(0,0,0,0.7)`
- Pixel: `padding: "16px 32px"`; `borderRadius: 12`
- Blur: `textShadow: "0 2px 12px ..."`
- Fonte: `Arial, sans-serif`

### `src/components/v2/AvisoCVM.tsx`
- Cor: `rgba(15, 42, 29, 0.78)` — é o `#0F2A1D` da marca com
  transparência; listado só porque o grep pegou.
- Fonte: `Arial, sans-serif`

### `src/components/v2/BarrasDuelo.tsx`
- Cor: `#c7cad1`; `#ffffff`; `#8a8f9c`
- Blur: `drop-shadow(${glow})`, com `glow` = `0 0
  ${larguraBarra * 0.25}px`
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/CallToAction.tsx`
- Fonte: `Arial, sans-serif`

### `src/components/v2/ColagemFotos.tsx`
- Cor: `#ffffff`; `rgba(0,0,0,0.55)`
- Blur: `boxShadow: "0 1.2vw 2.4vw ..."`
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/Contador.tsx`
- Pixel: `borderRadius: 28`
- Fonte: `loadFont(...)` (Inter, via `@remotion/google-fonts`) e seus
  usos — escolhida no componente, não num design system.

### `src/components/v2/GraficoCrescimento.tsx`
- Cor: `#8a8f9c`
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/LegendaDiscreta.tsx`
- Cor: `rgba(0,0,0,0.6)`
- Blur: o `textShadow` — ver "Pergunta pro Matheus" acima.
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/ListaCheck.tsx`
- Cor: `rgba(8,10,8,0.4)`; `rgba(255,255,255,0.08)`
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/components/v2/TextoContraste.tsx`
- Blur: `textShadow: \`0 0 ${fontePositivo * 0.3}px ...\``
- Fonte: `'Arial Narrow', Arial, sans-serif`

### `src/Composition.tsx` (defaultProps do catálogo, por composição)
- `ImagemFade` — cor: `#ffffff`
- `GraficoLinha` — cor: `#111318`, `#00d9ff`, `#00ff9d`; pixel:
  `largura: 880`, `altura: 420`
- `ColagemCenas` — cor: `#f0ebe0`; pixel: `x: 40, y: 100,
  largura: 380`, `x: 450, y: 80, largura: 380`, `x: 860, y: 110,
  largura: 380`
- `ComparacaoBarras` — cor: `#0d0f14`, `#3d5a80`, `#6ea8d8`,
  `#0f9e6e`, `#00ff9d`
- `TextoDestaque` — cor: `#ffffff`, `rgba(0,0,0,0.55)`; pixel:
  `tamanhoFonte: 80`
- `Checkmark` — cor: `#ffffff`, `#0f9e6e`; pixel: `x: 640`, `y: 360`,
  `tamanho: 160`
- `ListaCheck` — cor: `#0d0f14`, `#ffffff`, `#22C55E`
- `ColagemFotos` — cor: `#0d0f14`, `#22C55E`
- `TextoContraste` — cor: `#0d0f14`, `#ffffff`, `#6b7280`
- `LegendaDiscreta` — cor: `#e5e7eb`
- `BarrasDuelo` — cor: `#0d0f14`, `#6b7280`, `#22C55E`
- `GraficoCrescimento` — cor: `#0d0f14`, `#22C55E`
- `AvisoCVM` — cor: `rgba(15, 42, 29, 0.78)` (= `#0F2A1D` com
  transparência)

### Composições de teste (pasta "Testes", fora do catálogo)
- `src/TesteRoteiro01.tsx` — cor: `#22C55E`, `#6b7280`,
  `rgba(10,12,10,0.4)`, `rgba(255,255,255,0.08)`, `#ffffff`,
  `rgba(34,197,94,0.65)`, `#e5e7eb`, `#4b5563`, `#9ca3af`, `#15803d`,
  `#4ade80`
- `src/TesteRoteiro02.tsx` — cor: `#22C55E`, `#6b7280`, `#ffffff`,
  `#e5e7eb`
- `src/TesteVideoReal.tsx` — cor: `#ffffff`, `rgba(0,0,0,0.55)`
