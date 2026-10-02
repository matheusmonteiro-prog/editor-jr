---
name: editor-jr
description: Receita para criar um componente novo do catálogo de motion graphics do editor-jr, do arquivo até aparecer validado no Remotion Studio.
---

# Criar um componente novo no catálogo

Regras gerais do projeto (quem é o usuário, quando pedir aprovação, o que é
proibido, convenção de commit) já estão em `CLAUDE.md` — esta receita não
repete, só referencia. Decisões de arquitetura (padrão de `Sequence`, risco
de o Studio reescrever código, regra do `.default()`) estão em
`ARQUITETURA.md`, seção 6 — idem, só referenciadas aqui.

## 1. Onde o arquivo entra

- Componentes novos vão em `src/components/v2/NomeDoComponente.tsx` (um
  componente por arquivo — ver CLAUDE.md, "Padrão dos componentes").
- `src/components/` (sem `v2/`) tem os componentes mais antigos; não é lá
  que os novos entram.

## 2. Schema Zod + props em fração

- Exportar `nomeDoComponenteSchema = z.object({ ... })`.
- Nenhum tamanho ou posição em pixel fixo — tudo em fração (0 a 1) de
  `width`/`height`, lidos de `useVideoConfig()` dentro do componente.
- **Toda prop opcional precisa de `.default(...)` no schema Zod E do mesmo
  valor repetido na desestruturação em JS do componente.** O `.default()`
  do Zod só é aplicado dentro de um `schema.parse()`/`.safeParse()` — uma
  composição que lê o plano de edição direto (sem rodar isso) recebe
  `undefined` em vez do padrão (risco confirmado no `CallToAction`, ver
  ARQUITETURA.md seção 6).
- Cores só do design system da marca: **`#0F2A1D`** (verde-escuro),
  **`#F5F0E6`** (creme), **`#EFAF20`** (dourado). Não inventar cor nova sem
  perguntar.
- Quando o componente tiver `corFundo`, ele é `zColor().optional()` no
  schema e `corFundo = "transparent"` na desestruturação — para não tampar
  o vídeo por engano quando usado como camada sobre ele.

## 3. Estrutura do componente

- Envolver todo o conteúdo num `<Sequence name="NomeDoComponente">` — para
  aparecer como camada nomeada na timeline.
- Animação de entrada e de saída sempre via `interpolate()`/`spring()` a
  partir de `useCurrentFrame()` — nunca CSS `transition`/`animation`.
- Formas chapadas: sem `blur`, sem `box-shadow` difusa, sem gradiente de
  cor (gradiente só é aceitável em alfa/`mask-image`, como no `Spotlight`,
  nunca pra "suavizar" uma cor sólida).

## 4. Registrar no catálogo

- Importar o componente e o schema em `src/Composition.tsx`.
- Adicionar um `<Composition>` dentro do `<Folder name="Catalogo">`, com
  `id`, `component`, `schema` e `defaultProps`.
- `defaultProps` precisa ser **objeto literal direto ali dentro do
  `<Composition>`**, nunca uma variável importada — é a única forma do
  Studio conseguir salvar de volta no código quando alguém edita um campo
  pelo painel.
- Só criar variante horizontal (ou outra variação de tamanho/formato) se
  for pedido explicitamente — nunca por padrão.
- Não editar `src/Root.tsx` para isso — ele é só para composições de
  teste/rascunho (pasta "Testes"), não para o catálogo.

## 5. Testar no Studio

- `npm run dev` abre o Remotion Studio; a composição aparece na pasta
  "Catalogo", com o `id` escolhido.
- Depois de qualquer sessão no Studio (arrastar elementos, editar props
  pelo painel), rodar `git diff --stat` e `npx tsc --noEmit` antes de
  commitar — o Studio pode reescrever código sozinho, e o `tsc` por si só
  não pega esse tipo de alteração.

## 6. Documentar

- Adicionar a entrada em `docs/catalogo-componentes.md`: arquivo, o que
  faz, status, e a tabela de props lida direto do código real (não supor).
- Atualizar `ARQUITETURA.md`, seção 6 ("Catálogo de componentes"), movendo
  o componente de "A construir" para "Componentes prontos" quando
  validado visualmente no Studio.
