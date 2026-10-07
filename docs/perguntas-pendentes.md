# Perguntas pendentes (decisões do Matheus)

Perguntas que não são técnicas — são decisão de conteúdo jurídico, escolha de
ferramenta/biblioteca ou formato de dados — registradas aqui em vez de
respondidas por conta própria.

## AvisoCVM — texto oficial e tempo mínimo em tela (02/10/2026)

Criei o componente `AvisoCVM` (`src/components/v2/AvisoCVM.tsx`) com o texto
vindo só da prop `texto` (nunca fixo no código — ver `ARQUITETURA.md` seção
4, que já diz que o aviso completo vai na descrição do vídeo, não dentro
dele). Duas perguntas em aberto:

### 1. Qual é o texto oficial do aviso CVM?

**O que é:** o texto que aparece **dentro do vídeo** (resumido ou discreto) quando o roteiro
pede "aviso CVM". Segundo o `ARQUITETURA.md` (seção 4), a versão completa vai na descrição do
vídeo — é observação de mercado, **NÃO CONFIRMADO juridicamente**.

**Exemplo (inventado só para ilustrar, não é texto oficial):** dentro do vídeo aparece uma
frase curta, e o texto completo fica na descrição do vídeo.

**Resposta possível:**
- **"Conteúdo informativo"** — só uma frase curta fica visível 5 segundos.
- **Sem aviso no vídeo** — deixa só na descrição, e o AvisoCVM nunca entra no roteiro.
- **Outro texto** — define qual.

**Como funciona em código:** hoje o componente nasce com "Conteúdo informativo. Não constitui
recomendação ou indicação de investimento." como padrão provisório. Quando você escolher o
texto oficial, ele entra na prop `texto` do plano de edição, e a IA não escreve esse texto.

### 2. Existe exigência de tempo mínimo em tela?

**O que é:** quanto tempo o aviso fica visível no vídeo. Pode ser uma regra de plataforma,
prática do seu canal, ou decisão sua. **NÃO CONFIRMADO** se alguma plataforma exige um tempo
mínimo: não achei fonte (a versão anterior deste texto citava uma regra do YouTube; foi
removida porque eu não a conferi).

**Exemplo (inventado só para ilustrar):** você escolhe "3 segundos", e o aviso fica 3 segundos
na tela sempre que o roteiro pedir.

**Resposta possível:**
- **5 segundos** — aceita o padrão atual (`duracaoFrames: 150` a 30fps).
- **Outro tempo** — define quantos segundos/minutos.
- **Nenhum** — remove a regra, ajusta cada vídeo à mão.

**Como funciona em código:** a durabilidade vem de `duracaoFrames` no componente (padrão 150
frames = 5s a 30fps). Se você disser "precisa de 3 segundos", coloco `duracaoFrames: 90`.
O plano de edição pode definir `duracaoFrames` nas `props` do elemento (campo existe no schema
de `src/components/v2/AvisoCVM.tsx`).

## Envio automático pro Google Drive — Etapa 8 (02/10/2026)

`ARQUITETURA.md` já lista "Envio automático do vídeo pronto para o Google
Drive" como parte da Etapa 8, com pré-requisito "autorizar acesso à conta
Google" — não implementado nesta sessão, de propósito (depende de decisão e
autorização do Matheus, não é algo técnico que eu decida sozinho).

### 1. Qual conector/API usar?

**O que é:** a ferramenta que o `editor-jr` usa pra enviar os vídeos prontos automaticamente
pra sua conta do Google Drive. Existem várias opções, cada uma com prós e contras.

**Exemplo (hipotético, nada disso existe hoje):** depois de renderizar, o vídeo pronto
seria enviado sozinho para uma pasta do seu Drive. Hoje o `scripts/render-final.mjs` só monta e
roda o comando de render (sem `--dry-run` ele executa o render de verdade, linha 90); ele
**não envia nada** ao Drive.

**Respostas possíveis (as duas primeiras vêm de `docs/estado-atual.md`; detalhes NÃO CONFIRMADOS):**
- **Google Drive API direta** — o upload é feito pelo próprio projeto. Que tipo de credencial
  a API pede para uma conta pessoal é **NÃO CONFIRMADO** (precisa ser conferido na
  documentação oficial do Google Drive API antes de decidir).
- **Conector do Claude Code** — este ambiente tem ferramentas de Google Drive (aparecem na
  lista de ferramentas da sessão), mas servem para eu mexer em arquivos durante a conversa.
  **NÃO CONFIRMADO** se serviriam para o `editor-jr` rodar sozinho, sem mim.
- **Outra ferramenta** — nenhuma foi avaliada.

**Como funciona em código:** NÃO CONFIRMADO. Seja qual for a escolha, o `render-final.mjs`
(ou um script novo) precisaria de um trecho que envia o arquivo depois do render.

### 2. Autorizar acesso à conta Google

**O que é:** você precisa permitir que o `editor-jr` acesse a sua conta, assim como você
permite que um app tenha acesso à sua câmera.

**Exemplo:** você clica num link OAuth, confirma "deixar o editor-jr enviar arquivos pro
Drive", e a autorização fica salva.

**Resposta possível:**
- Você autoriza a conta (o formato exato da autorização é **NÃO CONFIRMADO**).
- Sem autorização, o upload não funciona (isso o `ARQUITETURA.md` já diz: pré-requisito da
  Etapa 8).

**Como funciona em código:** proposta, NÃO IMPLEMENTADA: a credencial ficaria num arquivo local
fora do GitHub. O `.env` já está no `.gitignore` (linha 4), então um arquivo com esse nome não
seria enviado ao GitHub.

---

## Campo `"fps"` no plano (decisão técnica)

**O que é:** a taxa de quadros (frames por segundo) do vídeo renderizado. Hoje pode estar em
`planos/0926.plano.json`, mas não está no schema oficial da seção 7 do `ARQUITETURA.md`.

**Fato conferido (07/10/2026):** `planos/0926.plano.json` tem `"fps": 30` (linha 4). O
`src/PlanoComposicao.tsx` **não lê** esse campo: ele usa o `fps` que vem de `useVideoConfig()`,
ou seja, o da composição registrada, e `src/Root.tsx` fixa `FPS_0926 = 30`. Ou seja, hoje o
campo do plano não muda nada no render.

**Respostas possíveis:**
- **Remover o campo** do plano — nada muda no render, porque ele já não é lido.
- **Formalizar no schema** — o plano passa a pedir `"fps"` oficialmente e o código passa a
  usá-lo. Que outras taxas (24, 60) funcionam bem é **NÃO CONFIRMADO**.

**Como funciona:** se formalizar, falta código para ler o campo do plano. Se remover, nada
quebra (conferido: nada lê o campo).

---

## Como ajuste manual no Studio volta pra JSON?

**O que é:** quando você arrasta um elemento no Remotion Studio (ex.: uma seta se move 50px
pra esquerda), onde fica esse ajuste? No código TypeScript ou no plano JSON?

**Exemplo real desta sessão:** alguém arrastou o `AvisoCVM` no Studio e o Studio gravou
`translate: "0px -32.3px"` (pixel fixo) dentro de `src/components/v2/AvisoCVM.tsx`, o arquivo do
**componente**. Também gravou `translate` e um `AvisoCVM` embutido em
`src/components/v2/GraficoCrescimento.tsx` (guardado no stash e em `../*.patch`). Nenhum plano
`.json` mudou.

**Problema (fatos conferidos):** o Studio grava no código `.tsx`, não no plano `.json`
(`ARQUITETURA.md`, seção 6, "Padrão de organização no Studio"). Ali também está o risco de
`<Sequence>` criadas por `.map()`: editar uma instância pode afetar as outras.
**NÃO CONFIRMADO:** se um ajuste gravado no arquivo de um componente vale para todos os
planos que usam esse componente (parece que sim, pelo exemplo acima, mas não testei).

**Respostas possíveis:**
- **Aceitar como está** — o ajuste fica no código e você revisa o `git diff` depois de
  qualquer sessão no Studio (regra que já está no `ARQUITETURA.md`).
- **Levar o ajuste pro JSON** — um script leria o que o Studio gravou e escreveria no plano.
  **Esse script NÃO EXISTE**; seria código novo, ainda sem desenho.
- **Evitar arrastar** — usar o "Outline Toggle" (`ARQUITETURA.md`, seção 6) pra esconder os
  contornos editáveis e ajustar posição só pelo plano.

**Como funciona hoje:** o plano `.json` não sabe do que o Studio gravou no `.tsx`.

---

# Decididas

## Detecção automática de vertical/horizontal — decidida em 05/10/2026

**Decisão do Matheus:** o formato é **detectado automaticamente** a partir do vídeo, e o prompt
pode **forçar manualmente** outro formato ("se ajusta sozinho, mas com opções, como no
CapCut"). Já registrada na seção 3 e na Etapa 3 do `ARQUITETURA.md`.

**Exemplo:** você sobe um vídeo de 1080×1920. O sistema entende "vertical" sozinho. Se quiser a
versão horizontal do mesmo vídeo, pede no prompt e ele obedece.

**O que ainda não existe (é código, não decisão):** como o plano de edição diferencia
"automático" de "forçado". O campo `"orientacao"` da seção 7 já existe, e a regra não cria
campo novo; falta implementar a detecção (como será feita é decisão de código ainda em aberto)
e definir como o plano expressa o "forçar".
