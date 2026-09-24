# CLAUDE.md — editor-jr

## Contexto
Editor de vídeo local, baseado em Remotion, controlado por prompt de texto.
Uso pessoal (Matheus), rodando no navegador (localhost). Não é produto ainda.

**Antes de qualquer tarefa, leia `ARQUITETURA.md`.** Ele tem as decisões, as etapas e o status atual.

## Quem é o usuário
Matheus é iniciante em programação, Git e Remotion. Explique em português do Brasil, simples e direto, com exemplo prático. Um passo por vez quando houver risco de erro.

## Regras de trabalho
1. Trabalhe **somente na etapa atual** (ver "Status" no ARQUITETURA.md). Não avance para a próxima sem aprovação.
2. Antes de uma mudança grande, explique o que vai fazer e espere o "ok". Para **documentação** (ARQUITETURA.md, README, etc.): pode editar direto, sem pedir aprovação por trecho — só mostra o resumo final antes do commit. Para **código** (.tsx, .mjs, scripts): continua pedindo aprovação antes de cada mudança.
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

## Padrão dos componentes
- Um componente por arquivo em `src/components/`.
- Propriedades editáveis expostas (texto, posição X/Y, tamanho, cor, tempo de entrada/saída), com valores padrão que já funcionam bem.
- Usar o recurso oficial do Remotion de schema (zod) para as propriedades aparecerem editáveis no Remotion Studio. Confirmar na documentação a forma correta para a versão instalada.
- Animações com `spring()` / `interpolate()`, entrada e saída suaves.
- Fundo transparente quando o componente for camada sobre vídeo.

## Nomes de arquivo
Sem espaço. Ex.: `selic-setembro.png`, `dinheiro-tim.mp3`.
