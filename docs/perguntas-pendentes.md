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
pede "aviso CVM". A versão completa e oficial sempre vai na descrição.

**Exemplo:** você escolhe "Aviso: conteúdo informativo" (6 palavras dentro do vídeo) e
"Não constitui recomendação de investimento" (completo na descrição do YouTube).

**Resposta possível:**
- **"Conteúdo informativo"** — só uma frase curta fica visível 5 segundos.
- **Sem aviso no vídeo** — deixa só na descrição, e o AvisoCVM nunca entra no roteiro.
- **Outro texto** — define qual.

**Como funciona em código:** hoje o componente nasce com "Conteúdo informativo. Não constitui
recomendação ou indicação de investimento." como padrão provisório. Quando você escolher o
texto oficial, ele entra na prop `texto` do plano de edição, e a IA não escreve esse texto.

### 2. Existe exigência de tempo mínimo em tela?

**O que é:** quanto tempo o aviso fica visível no vídeo. Pode ser uma regra de plataforma
(ex.: "YouTube exige mínimo de 5 segundos"), prática do seu canal, ou decisão sua.

**Exemplo:** você escolhe "3 segundos", e todo vídeo mostra o aviso por 3 segundos no fim.

**Resposta possível:**
- **5 segundos** — aceita o padrão atual (`duracaoFrames: 150` a 30fps).
- **Outro tempo** — define quantos segundos/minutos.
- **Nenhum** — remove a regra, ajusta cada vídeo à mão.

**Como funciona em código:** a durabilidade vem de `duracaoFrames` no componente (padrão 150
frames = 5s a 30fps). Se você disser "precisa de 3 segundos", coloco `duracaoFrames: 90`.
Na Etapa 8, o roteiro / plano de edição pode sobrescrever esse padrão por vídeo.

## Envio automático pro Google Drive — Etapa 8 (02/10/2026)

`ARQUITETURA.md` já lista "Envio automático do vídeo pronto para o Google
Drive" como parte da Etapa 8, com pré-requisito "autorizar acesso à conta
Google" — não implementado nesta sessão, de propósito (depende de decisão e
autorização do Matheus, não é algo técnico que eu decida sozinho).

### 1. Qual conector/API usar?

**O que é:** a ferramenta que o `editor-jr` usa pra enviar os vídeos prontos automaticamente
pra sua conta do Google Drive. Existem várias opções, cada uma com prós e contras.

**Exemplo:** você roda `node scripts/render-final.mjs` (que renderiza um vídeo), e ele
automaticamente faz upload do arquivo `0926.mp4` pra uma pasta `editor-jr-videos/` do seu Drive.

**Respostas possíveis:**
- **Google Drive API direta** — envio robusto, sem intermediários. Precisa de uma chave da
  conta (`serviceAccountKey.json`). Pro: confiável, rápido, controle total. Contra:
  configuração mais complexa.
- **Conector Claude Drive (se disponível)** — integração rápida dentro do Claude Code.
  Contra: foi pensado pra eu ler/escrever na sua conversa, não pra rodar sozinho em produção.
- **Serviço de terceiro** — ex.: Zapier (não recomendado, fica caro).

**Como funciona em código:** seja qual for a escolha, o script `render-final.mjs` ganha um
trecho novo que, após renderizar, faz o upload. Se for a API direta, preciso de uma
credencial (chave).

### 2. Autorizar acesso à conta Google

**O que é:** você precisa permitir que o `editor-jr` acesse a sua conta, assim como você
permite que um app tenha acesso à sua câmera.

**Exemplo:** você clica num link OAuth, confirma "deixar o editor-jr enviar arquivos pro
Drive", e a autorização fica salva.

**Resposta possível:**
- Você autoriza a conta e traz o arquivo `serviceAccountKey.json` (ou a chave de acesso).
- Sem autorização, o upload não funciona.

**Como funciona em código:** a chave fica salva em `.env` (arquivo de configuração local,
não entra no GitHub), e o script a usa pra fazer o upload.

---

## Campo `"fps"` no plano (decisão técnica)

**O que é:** a taxa de quadros (frames por segundo) do vídeo renderizado. Hoje pode estar em
`planos/0926.plano.json`, mas não está no schema oficial da seção 7 do `ARQUITETURA.md`.

**Exemplo:** `"fps": 30` significa "renderizar 30 quadros por segundo". Sem essa informação,
o `PlanoComposicao.tsx` usa 30 fps como padrão.

**Respostas possíveis:**
- **Remover o campo** — o padrão é sempre 30 fps, e a entrada não entra.
- **Formalizar no schema** — o plano passa a pedir `"fps"` oficialmente, e cada
  composição pode renderizar em 24, 30, 60 fps conforme pedido.

**Como funciona:** se formalizar, a composição lê `"fps"` do plano e passa pro Remotion.
Se remover, o campo é só ignorado e o plano continua funcionando (30 fps sempre).

---

## Detecção automática de vertical/horizontal

**O que é:** o sistema decidir sozinho se a gravação é vertical ou horizontal (portrait/landscape)
lendo as dimensões do vídeo, em vez de você declarar no roteiro.

**Exemplo:** você sobe um vídeo de 1080×1920 (vertical), e o sistema deveria adivinhar
"é vertical" sem você escrever `"orientacao": "vertical"` no plano.

**Problema:** a seção 3 do `ARQUITETURA.md` diz que o formato é **declarado no prompt**,
não detectado. Significa que o item "detecção automática" na Etapa 3 contradiz essa decisão.

**Respostas possíveis:**
- **Remover da Etapa 3** — só declaração manual, sem detecção.
- **Implementar mesmo assim** — a detecção é um extra, não contradiz a regra (você continua
  dizendo `"orientacao"`, e a detecção é só backup).

**Como funciona:** se implementar, a composição testa "se hauteur > largeur, vertical",
e avisos se a declaração não bate com as dimensões do arquivo.

---

## Como ajuste manual no Studio volta pra JSON?

**O que é:** quando você arrasta um elemento no Remotion Studio (ex.: uma seta se move 50px
pra esquerda), onde fica esse ajuste? No código TypeScript ou no plano JSON?

**Exemplo:** você cria um `AvisoCVM` com `margemHorizontal: 0.04` no plano, abre no Studio,
arrasta o aviso pra esquerda, e fecha. A edição (novo `margemHorizontal`) fica onde?

**Problema:** o Remotion Studio grava edições no código `.tsx`, não no plano `.json`. Isso
significa que o ajuste fica só numa composição específica (ex.: `PlanoComposicao0926`),
e quando você renderizar com outro plano, a edição se perde.

**Respostas possíveis:**
- **Aceitar como está** — Studio edita só código. Edições finas do Matheus no Studio são
  ajustes daquela composição específica (0926, 0927, etc.), não do plano genérico.
- **Exportar ajuste pro JSON** — criar um script que leia as edições do Studio no código
  e escreva de volta no plano `.json`. Complexo, mas permite reutilizar ajustes em outros
  planos.
- **Tirar a liberdade de arrastar** — desabilitar edição visual de posição no Studio, forçar
  ajuste só via JSON no roteiro. Bem rígido, mas previsível.

**Como funciona hoje:** Studio edita o `.tsx` (ex.: `style.translate` novo). O plano `.json`
não sabe disso. A próxima vez que você renderizar com o mesmo plano, o ajuste ainda está lá
(na composição específica), mas se você criar um plano novo, começa do zero.

**Como funcionaria com exportação:** após fechar o Studio, você roda `node scripts/export-studio-ajustes.mjs planos/0926.plano.json`, e ele lê o `.tsx` e atualiza o JSON com os novos valores.
