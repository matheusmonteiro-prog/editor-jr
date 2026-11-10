# CLAUDE.md — editor-jr

## Contexto
Editor de vídeo local, baseado em Remotion, controlado por prompt de texto.
Uso pessoal (Matheus), rodando no navegador (localhost). Não é produto ainda.

**Antes de qualquer tarefa, leia `ARQUITETURA.md`.** Ele tem as decisões, as etapas e o status atual.

## Quem é o usuário
Matheus é iniciante em programação, Git e Remotion. Explique em português do Brasil, simples e direto, com exemplo prático. Um passo por vez quando houver risco de erro.

## Regras de trabalho
1. Trabalhe **somente na etapa atual** (ver "Status" no ARQUITETURA.md). Não avance para a próxima sem aprovação.
2. Antes de uma mudança grande, explique o que vai fazer e espere o "ok". Para **documentação** (ARQUITETURA.md, README, etc.): pode editar direto, sem pedir aprovação por trecho — só mostra o resumo final antes do commit. Para **código** (.tsx, .mjs, scripts): testes e ajustes pequenos seguem sem pedir validação; o Matheus valida só os marcos (vídeo final e projeto pronto). Push, merge, apagar e publicar continuam só com o nome da ação escrito por ele.
3. Antes de iniciar uma etapa, confira os **pré-requisitos** dela e avise o que está faltando.
4. Ao terminar uma etapa: resuma o que foi feito, diga como testar, atualize o "Status" no ARQUITETURA.md e **ofereça fazer commit + push** (pedindo confirmação).
5. Se não tiver certeza de como uma API ou biblioteca funciona, verifique a documentação oficial ou diga que não sabe. Não invente.
6. Ao sugerir pacote ou ferramenta de terceiros: diga se é oficial, o que acessa e se há risco.

## Proibido
- Adicionar vídeos ao Git (.mp4, .mov, .mkv, .webm etc.). A pasta `videos/` é ignorada.
- Recriar o projeto Remotion ou rodar `create-video`.
- Apagar a pasta `.git` ou criar outro repositório.
- Rodar `npm audit fix --force`.
- Tratar warning como erro sem analisar. Analise antes de reinstalar qualquer coisa.

## Regras fixas de toda sessão
- Commit só de arquivos nomeados, nunca `git add .` nem `git add -A`.
- Além de push, merge e apagar (já na regra 2 de "Regras de trabalho"), também exigem o nome da
  ação escrito pelo Matheus: `git stash pop`, `git restore` e `git reset`. Isso vale para apagar
  qualquer arquivo, não só a pasta `.git`.
- Pedido marcado "só leitura" = não editar nenhum arquivo.
- Não fazer nada além do que foi pedido. Se achar algo para arrumar, listar no relatório em vez
  de mexer.
- Relatório sempre neste formato (linguagem simples e exemplo do dia a dia, como em "Quem é o
  usuário"):
  1. **O que mudou** — arquivo e o que mudou, em frases curtas.
  2. **Prova** — tsc, teste, `git diff` ou Studio: o que rodou e o resultado.
  3. **O que supus sem confirmar.**
  4. **Estado do Git** — `git status --short` e `git log --oneline -3`.
- **Modelo recomendado por passo:** todo relatório termina com uma linha "Modelo recomendado para
  o próximo passo: Haiku, Sonnet ou Opus, porque <motivo>". Guia: **Haiku** para leitura de
  arquivos e comandos mecânicos; **Sonnet** para editar documentação, rodar validador, render;
  **Opus** para erro que não entendo ou análise crítica.

## Padrão dos componentes
- Um componente por arquivo em `src/components/`.
- Propriedades editáveis expostas (texto, posição X/Y, tamanho, cor, tempo de entrada/saída), com valores padrão que já funcionam bem.
- Usar o recurso oficial do Remotion de schema (zod) para as propriedades aparecerem editáveis no Remotion Studio. Confirmar na documentação a forma correta para a versão instalada.
- Animações com `spring()` / `interpolate()`, entrada e saída suaves.
- Fundo transparente quando o componente for camada sobre vídeo.

## Nomes de arquivo
Sem espaço. Ex.: `selic-setembro.png`, `dinheiro-tim.mp3`.

## Protocolo de etapas
- Etapas: 0 a 8, conforme o `ARQUITETURA.md`. Hoje (decisões do Matheus em 10/11/2026): Etapa 3: 3a fechada; 3b aprovada pelo Matheus (o que falta será validado por ele na prática, não é pendência). Etapa 4: aprovada pelo Matheus; 4a fechada em 14/10/2026; 4b (termos financeiros e glossário em vídeo real) será validada por ele na prática, não é pendência. Etapa 5: dispensada por decisão do Matheus. Etapa 6: aprovada pelo Matheus; 6a cumprida em 09/10/2026; AvisoCVM e resolvedor de legenda serão validados por ele na prática; 6b só por ordem dele. Etapa 7: em discussão (controle manual das edições, arrastar e soltar imagem). Etapa 8: por último, por decisão do Matheus. Detalhes em ARQUITETURA.md (Status) e docs/estado-atual.md.
- Cada etapa precisa de critério de fechamento escrito. Se faltar,
  proponha antes de dar a etapa como fechada.
- Quando todos os critérios de uma etapa forem cumpridos, avise o Matheus
  na hora e deixe um resumo de continuação pronto para o chat da próxima
  etapa.
- Se uma etapa ficar aberta por depender de outra, avise e registre no
  `docs/estado-atual.md` a que chat/etapa voltar.
- Nunca escrever "validado" sem o Matheus ter visto no Studio.
- Ao fim de cada sessão, atualizar o `docs/estado-atual.md` por etapa.

## Mapa da casa (04/11/2026): o que ler em cada tarefa
- **Sempre:** este arquivo e o retrato mais novo de `docs/estado-atual.md`.
- **Editar vídeo / ajustes / kit / render / IA:** as skills do projeto em `.claude/skills/`
  entram sozinhas pelo assunto (tabela "Quem chama o quê" em `docs/guia-edicao.md`).
- **Fluxo de edição:** `docs/guia-edicao.md`. **Regras visuais:** `docs/kit-visual-video.md`.
  **Peças:** "Mapa rápido" de `docs/catalogo-componentes.md`. **Áudio:** skill `tratar-audio`. **Pedidos do Matheus:** `docs/alteracoes.md`.
- **Etapas e decisões de arquitetura:** `ARQUITETURA.md` (leitura obrigatória, regra do topo deste arquivo).
- **Não ler sem motivo:** `docs/arquivo/` (histórico), `_para-apagar/` (aguardando o Matheus
  mandar apagar), `out/`, `videos/`, `backup-videos/`, `node_modules/`, `planos/testes/` (casos do validador).
