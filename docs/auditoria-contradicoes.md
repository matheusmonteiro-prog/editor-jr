# Auditoria de contradições — editor-jr (somente leitura)

Gerado em 03/11/2026, no PC do trabalho (edica), branch `video-apresentacao`.
Auditoria **só de leitura**: mapeia e aponta, não corrige nada. Cada item tem prova
(arquivo:linha ou saída de comando). O que não deu para provar está em "Preciso do Matheus",
no fim.

Gravidade: **TRAVA** (impede compilar/rodar) · **ATRAPALHA** (confunde ou induz a erro) ·
**COSMÉTICO** (pequeno, não bloqueia).

---

## A) Doc vs doc (status de etapas e estado)

| Contradição | Prova | Gravidade |
|---|---|---|
| `docs/estado-atual.md` diz que reflete a branch `noite-etapa6` e cobre "02/10 a 16/10/2026", mas a branch atual é `video-apresentacao` e hoje é 03/11/2026. Não menciona a integração Higgsfield nem o kit visual (02/11). | `docs/estado-atual.md:1` ("02/10 a 16/10/2026") e `:5` ("Reflete a branch `noite-etapa6`"); `git branch --show-current` = `video-apresentacao`. O `CLAUDE.md` manda atualizar o `estado-atual.md` ao fim de cada sessão. | ATRAPALHA |
| `docs/testes-editor.md` trata `src/testes/TesteZoom.tsx`, `TesteLayouts.tsx` e `CasaExplicativa.tsx` como arquivos existentes ("sem erro fora de `src/testes/CasaExplicativa.tsx`"), mas `docs/estado-atual.md` diz que esse arquivo **não existe neste clone**. | `docs/testes-editor.md:39`, `:113-114`, `:243`; contra `docs/estado-atual.md:165` ("o arquivo não existe neste clone"). Disco confirma: `src/testes/` não existe. | ATRAPALHA |
| Status da Etapa 5: `CLAUDE.md` diz "Etapa 5 em alinhamento"; `ARQUITETURA.md` e `estado-atual.md` marcam Etapa 5 como `[ ]` **sem** "em andamento"; e já existe trabalho de Etapa 5 (identidade visual) em `docs/kit-visual-video.md` (02/11). | `CLAUDE.md` (Protocolo de etapas, "Etapa 5 em alinhamento, sem código"); `ARQUITETURA.md:12`; `docs/estado-atual.md:12`; `docs/kit-visual-video.md:1-3`. | COSMÉTICO |
| `CLAUDE.md` (Protocolo) diz "Hoje: Etapa 6", mas a Etapa 6 está `[x]` concluída e o trabalho corrente é o vídeo de apresentação / kit visual (Etapa 5). | `CLAUDE.md` (Protocolo de etapas); `ARQUITETURA.md:13` (Etapa 6 `[x]`). | COSMÉTICO |

## B) Doc vs código (arquivo citado que não existe; arquivo no disco que a doc não cita)

| Contradição | Prova | Gravidade |
|---|---|---|
| `src/testes/TesteZoom.tsx` e `src/testes/TesteLayouts.tsx` são citados como arquivos "soltos, sem commit", mas a pasta `src/testes/` não existe. | `docs/testes-editor.md:39`, `:113-114`. `ls src/testes/` = vazio; `find src -iname "*TesteZoom*"` / `*TesteLayouts*` = nada. | ATRAPALHA |
| `ARQUITETURA.md` diz que o "GraficoSubindo foi descartado na etapa 1", mas existe um arquivo vivo `src/components/apresentacao/GraficoSubindo.tsx`, usado no vídeo de apresentação. | `ARQUITETURA.md:369` vs `src/components/apresentacao/GraficoSubindo.tsx` (existe); uso em `docs/pr-video-apresentacao.md:414` e `docs/auditoria-remotion-best-practices.md:43,62`. | ATRAPALHA |
| `docs/catalogo-componentes.md` não documenta os ~34 componentes de `src/components/apresentacao/` (só o `GradeAtivos3D`), nem `src/components/laboratorio/JurosCompostosLab.tsx`. Eles existem no disco. | `docs/catalogo-componentes.md` cobre só `src/components/` e `src/components/v2/`; disco: `src/components/apresentacao/` (34 .tsx + `marca.ts`) e `src/components/laboratorio/JurosCompostosLab.tsx`. | ATRAPALHA |
| `README.md` é o modelo padrão do Remotion ("Welcome to your Remotion project!"), não descreve o editor-jr. | `README.md:12`. | COSMÉTICO |
| `CLAUDE.md` pede "um componente por arquivo em `src/components/`", mas há arquivo de dados não-componente dentro da árvore de componentes: `src/components/apresentacao/marca.ts`. | `CLAUDE.md` (Padrão dos componentes); disco: `src/components/apresentacao/marca.ts`. | COSMÉTICO |

## C) Doc vs git (não-rastreados / soltos sem commit)

| Contradição | Prova | Gravidade |
|---|---|---|
| `backup-videos/EM BREVE-original.mp3` está fora do `.gitignore` (só `public/music/` e `public/sfx/` são ignorados; `*.mp4` cobre os vídeos, mas não o mp3) **e tem espaço no nome**, contra a regra "nomes sem espaço" do `CLAUDE.md`. | `git status` lista `backup-videos/` como não-rastreado; `ls backup-videos/` mostra `EM BREVE-original.mp3`; `.gitignore` não cobre `backup-videos/` nem `.mp3`. `CLAUDE.md` (Nomes de arquivo). | ATRAPALHA |
| `docs/higgsfield.md` e `docs/kit-visual-video.md` (kit visual é "referência obrigatória") estão **não-rastreados**, sem commit. | `git status`: `?? docs/higgsfield.md`, `?? docs/kit-visual-video.md`. | COSMÉTICO |
| `skills-lock.json` modificado e `.agents/skills/remotion-best-practices/` não-rastreado; origem não commitada. | `git status`: `M skills-lock.json`, `?? .agents/skills/remotion-best-practices/`. | COSMÉTICO |

## D) Regras que se contradizem (design system vs código/validador)

| Contradição | Prova | Gravidade |
|---|---|---|
| `docs/kit-visual-video.md` diz "**Nunca incluir corFundo**" (checklist #2), mas quase todos os componentes expõem a prop `corFundo` e o `src/Composition.tsx` passa valores não-transparentes (ex.: `#111318`, `#0d0f14`). | `docs/kit-visual-video.md:68`, `:185`; `docs/catalogo-componentes.md` (coluna "Valor padrão (Composition.tsx)" com `corFundo` em GraficoLinha, ComparacaoBarras, ColagemCenas, ListaCheck etc.). | ATRAPALHA |
| `docs/kit-visual-video.md` manda "**sem blur**" (seções 6 e 7), mas vários componentes do vídeo de apresentação usam `blur`/`drop-shadow`. (O vídeo de apresentação é projeto à parte, mas o kit se diz "referência obrigatória para o editor-jr".) | `docs/kit-visual-video.md:143`, `:161`; `docs/auditoria-remotion-best-practices.md:43` (blur em `RaiosDeLuz`, `FundoCenas`, `Logo3D`, `IconeEtf`, `ListaAtivos`). | ATRAPALHA |
| O kit visual afirma que "todo plano confere contra este documento" e lista erros que "o validador deve barrar" (corFundo, dourado sobre creme, etc.), mas o `validar-plano.mjs` **não** checa cores da marca, corFundo, blur nem pareamento — só "caixa alta". O próprio kit admite isso na pendência #7. | `scripts/validar-plano.mjs` — busca por `corFundo|blur|marca|#0F2A1D|#F5F0E6|#EFAF20|paleta|pareamento` só acha a linha 738 ("caixa alta"); `docs/kit-visual-video.md:87`, `:184-195`, `:219` (pendência 7: "Adicionar essas cores e regras ao validar-plano.mjs"). | ATRAPALHA |

## E) Catálogo de componentes vs regras do CLAUDE.md

| Contradição | Prova | Gravidade |
|---|---|---|
| `Checkmark.tsx` **não tem valor padrão em JS** na desestruturação **nem** `.default()` no schema Zod — contra a regra do `CLAUDE.md`/`checklist-revisao.md` de que todo componente precisa dos dois. Um plano JSON que não passe uma prop manda `undefined`. | `src/components/Checkmark.tsx:12-20` (schema sem `.default()`), `:27-35` (desestruturação sem `= valor`); `ARQUITETURA.md:421-423` (a regra). | ATRAPALHA |
| `Checkmark.tsx` usa **pixel fixo** (`left: x`, `top: y`, `width={tamanho}`) e os padrões no `Composition.tsx` são `x=640, y=360, tamanho=160` (calibrados p/ 1280×720), contra a regra "tudo em fração de `width`/`height`, nenhum pixel fixo". O mesmo vale para `GraficoLinha` (largura 880, altura 420) e `ComparacaoBarras` (larguraBarra 220). | `src/components/Checkmark.tsx:60-67`; `docs/catalogo-componentes.md:176-182` (Checkmark px), `:63-64` (GraficoLinha 880/420), `:99` (ComparacaoBarras 220). Regra: `docs/catalogo-componentes.md:160-165` e `CLAUDE.md` (Padrão dos componentes). | ATRAPALHA |

## F) Design System vs editor (px vs fração; cores da legenda vs marca)

| Contradição | Prova | Gravidade |
|---|---|---|
| `LegendaAnimada` tem padrões `corTexto=#FFFDF7` e `corDestaque=#FFB800`, que **não são** as cores da marca, contra o critério 6.5 #7 ("componentes só com as cores da marca #0F2A1D, #F5F0E6, #EFAF20"). É "exceção aprovada", mas o amarelo `#FFB800` ainda está "em aberto" no próprio kit. | `docs/catalogo-componentes.md:540-553`; `src`/schema em `src/components/v2/LegendaAnimada.tsx`; contra `docs/criterios-fechamento.md:68` (6.5 #7). Kit em aberto: `docs/kit-visual-video.md:16`, `:70`, `:215`. | ATRAPALHA |
| Convivência px vs fração: catálogo novo (`Seta`, `v2/*`) é todo em fração, mas `Checkmark`/`GraficoLinha`/`ComparacaoBarras` seguem em pixel (ver categoria E). | Mesmas provas da categoria E. | ATRAPALHA |
| O `validar-plano.mjs` (checagem 8) avisa qualquer texto todo em maiúsculas como "a marca pede caixa de frase", mas o kit visual prevê **caixa alta** para palavra de impacto, legenda e abertura de capítulo. | `scripts/validar-plano.mjs:729-741`; `docs/kit-visual-video.md:80-84`, `:108-116`. | COSMÉTICO |

## G) Higgsfield — script real vs documentação

| Contradição | Prova | Gravidade |
|---|---|---|
| `scripts/gerar-video.mjs` importa `dotenv`, mas `dotenv` **não está** no `package.json`. Um `npm install` pode removê-lo e quebrar o script. | `scripts/gerar-video.mjs:22` (`import dotenv from "dotenv"`); `package.json:8-20` não lista `dotenv`. Já apontado em `docs/higgsfield.md:61`. | TRAVA (só o script Higgsfield) |
| Mensagem de timeout no código diz "15 min", mas o limite real é 30 min. | `scripts/gerar-video.mjs:213` ("passou de 15 min") vs `:30` (`LIMITE_MS = 30 * 60000`). Já apontado em `docs/higgsfield.md:60`. | COSMÉTICO |
| Pendência auto-declarada do kit: cor `#1DD41E` precisa ser corrigida nas instruções/prompts (valor certo `#39A96B`/`#1F7A47`). Não verifiquei onde `#1DD41E` ainda aparece. | `docs/kit-visual-video.md:218` (pendência 6). | COSMÉTICO |

> Observação: o resto de `docs/higgsfield.md` (endpoints, modelo Kling 3.0 Standard,
> `aspect_ratio` só no modo texto, som `off`, variáveis `HF_API_KEY_ID`/`HF_API_KEY_SECRET`,
> catálogo `public/images/catalogo-gerados.json`) **confere** com o código lido em
> `scripts/gerar-video.mjs`. A chave da API não foi exibida.

---

## H) Risco geral (fora das 7 categorias, mas com prova)

| Item | Prova | Gravidade |
|---|---|---|
| `src/Root.tsx` importa `../videos/0926.cortes.json`, mas `videos/` está no `.gitignore`. Um clone novo **não compila / o Studio não abre** sem esse arquivo. | `src/Root.tsx:28` (`import cortes0926 from "../videos/0926.cortes.json"`); `.gitignore` (`videos/`). Já registrado como "risco que já existia" em `ARQUITETURA.md` e `estado-atual.md:273-274`. | TRAVA |

---

## Preciso do Matheus (não deu para provar / é decisão sua)

1. **Escopo do kit visual:** o `docs/kit-visual-video.md` vale para os componentes do vídeo de
   apresentação (que usam blur, 3D, cores de teste) ou só para o fluxo principal das etapas? Isso
   muda se as contradições de blur/corFundo contam como erro.
2. **`backup-videos/`:** essa pasta deve entrar no `.gitignore`? E o `EM BREVE-original.mp3` deve
   ser renomeado (sem espaço) ou ficar fora do Git?
3. **Amarelo da legenda:** manter `#FFB800` ou trocar pelo dourado `#EFAF20` (pendência do próprio
   kit)?
4. **`estado-atual.md`:** quer que seja atualizado para a branch `video-apresentacao` / 03/11, ou
   ele é "foto" encerrada da `noite-etapa6`?
5. **`#1DD41E`:** onde ele ainda aparece (instruções do Project, prompts antigos) — não tenho
   acesso ao Project para conferir.

---

## Atualização de 03/11/2026

**RESOLVIDO**
- `dotenv` (item G): agora é dependência direta no `package.json` e no `package-lock.json` (commit `bbe14d7`).
- Travamento do `Root.tsx` em clone novo (item H): causa removida (commit `79e521c`, que versiona `videos/0926.cortes.json`); clone novo NÃO foi testado.

**CORRIGIDO**
- D1 não vale como contradição para os componentes do catálogo que têm `corFundo` com padrão `transparent`; exceções: `Checkmark.tsx:17` e `TextoDestaque.tsx:17` (prop obrigatória, sem padrão). `Composition.tsx` passa cores sólidas só nas demonstrações do Studio. Blur/`feGaussianBlur` encontrado em `GraficoLinha.tsx:162`, `ContadorImpacto.tsx:83`, `FundoCenas.tsx:191`, `ListaAtivos.tsx:162`, `ListaRolando.tsx:103` e `RaiosDeLuz.tsx:38`; os cinco últimos são do vídeo de apresentação, e a decisão sobre o kit valer ou não para eles é do Matheus.
- A Etapa 6 está correta no repo (marcada `[x]`, 6a cumprida; as pendências aparecem na seção 7 da própria etapa).
- A Etapa 4 (4a fechada, 4b aberta) é consistente entre `ARQUITETURA.md` e `estado-atual.md`.
- O verde do método é `#1DD41E` sobre escuro e `#1F7A47` sobre creme (kit v3, decisão do Matheus de 02/11/2026), não `#39A96B`.

**EM ABERTO (decisão do Matheus)**
- Qual PC é este (hostname `PC-EDICAO`, pasta `C:\Users\zerob`, WSL com Ubuntu; `ARQUITETURA.md:27-28` e `:46` se contradizem).
- Versão do kit visual (v3 em `origin/kit-visual-video`, v2 local sem commit).
- A expressão "sinal de compra" em `src/components/apresentacao/marca.ts:15` e `docs/pr-video-apresentacao.md`.
- Catálogo sem os 34 componentes de `apresentacao/`.
- Validador sem checagem de cor/blur.
- `estado-atual.md` parado em 16/10.
- Testar clone novo (compila e abre o Studio).

**NÃO MEXIDO**
- Kit visual, vídeos, merge de `kit-visual-video`, caminhos do `ARQUITETURA.md`.

---

## Correção de 03/11/2026 (2)

1. São 33 `.tsx` + `marca.ts` em `src/components/apresentacao/`, não 34 (o "34" do item B e da seção "Atualização de 03/11/2026" está errado).
2. O verde do método **NÃO está resolvido**. O kit v3 em `origin/kit-visual-video` diz `#1DD41E` (decisão do Matheus de 02/11/2026, segundo o próprio texto). O kit local (`docs/kit-visual-video.md`, alterado em 03/11/2026 às 16:46; autoria não identificada, não foi o Claude Code nesta sessão) diz `#39A96B`. Decisão do Matheus pendente. O que a seção "Atualização de 03/11/2026" afirma sobre `#1DD41E` fica sem efeito até lá.
3. O Matheus confirmou em 03/11/2026 que este PC (`PC-EDICAO`, pasta `C:\Users\zerob`) é o do trabalho.
