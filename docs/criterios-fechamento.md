# Critérios de fechamento — Etapas 3 e 6

**RASCUNHO, AGUARDANDO APROVAÇÃO DO MATHEUS.** Nada aqui vale como regra até ele aprovar. É um
ponto de partida para ele cortar, trocar ou acrescentar.

Por que existe: o `CLAUDE.md` exige um critério de fechamento escrito por etapa. Hoje as
Etapas 3 e 6 estão "em andamento" no `ARQUITETURA.md` sem esse critério.

Como ler: cada item vem de uma tarefa que já está no `ARQUITETURA.md` (seção 7, Etapas 3 e 6),
exceto onde está escrito o contrário. Marcas:
- **[M]** depende do Matheus (arquivo, gravação, decisão ou olhar no Studio);
- **[E]** depende de outra etapa;
- **[C]** só código.

Regra de escrita: nada é marcado como "validado" sem o Matheus ter visto no Studio. Neste
rascunho, a única coisa que ele já viu e aprovou é a **Seta (05/10/2026)**.

---

## Etapa 6 — Leitor de prompt

A etapa fecha quando **todos** os itens abaixo estiverem cumpridos.

| # | Critério | Tipo | Situação hoje (segundo os docs) |
|---|---|---|---|
| 6.1 | **Revisor calibrado**: o agente `revisor` pega erros plantados de propósito e não acusa a dívida conhecida como erro. (Item pedido pelo Matheus; vem do `CLAUDE.md`/`checklist-revisao.md`, não do `ARQUITETURA.md`.) | [M] aprovar | A calibração 2 foi feita em 02/10: o revisor apontou os 4 erros plantados. O Matheus ainda não disse se isso basta. |
| 6.2 | **Seta e AvisoCVM vistos no Studio.** | [M] | Seta: aprovada pelo Matheus em 05/10/2026. AvisoCVM: conferência visual **pendente**. |
| 6.3 | **`cortes.json` real com o validador passando**: o `videos/0926.cortes.json` de 1.167 bytes (hoje o do projeto é o provisório de 194 bytes) e `node scripts/validar-plano.mjs` sem ERRO no plano `0926`. | [M] trazer o arquivo de casa; depois [C] rodar o validador | Arquivo real ainda não está no projeto do trabalho. |
| 6.4 | **Render e folha de contato**: renderizar o plano `0926` no WSL e gerar a folha com `scripts/folha-contato.mjs`. | [M] rodar no WSL do trabalho; depende de 6.3 | O script foi testado só com vídeo de teste e `cortes.json` provisório; o `ARQUITETURA.md` diz "não validado como processo final". |
| 6.5 | **Vídeo de ponta a ponta**: da gravação + prompt até um vídeo montado com as camadas do plano, sem corrigir nada à mão. | [M] ver e aprovar; depende de 6.3 e 6.4 | Não feito. A exportação final com melhor configuração por plataforma é Etapa 8. |

### Decisões que podem bloquear o fechamento (o Matheus escolhe)
- **Escopo:** a Etapa 6 fecha só com a 6a (ler o formato e gerar a timeline, sem IA) ou também
  com a 6b (gerar componente novo via API)? A 6b só começa depois do catálogo manual fechado
  e precisa da chave da API da Anthropic. **[M]**
- **Várias saídas da mesma gravação** (ex.: vídeo principal + cortes curtos): entra neste
  fechamento? O `ARQUITETURA.md` diz que o formato do prompt precisa prever isso. **[M]**
- **Ajuste manual no Studio voltar pro JSON:** mecanismo "ainda em aberto" no
  `ARQUITETURA.md`. Entra agora ou depois? **[M] decidir; depois [C]**
- **`naPalavra`/`ocorrencia`:** depende de existir a transcrição por palavra da Etapa 4, então
  ficaria **fora** deste fechamento. **[E]**

---

## Etapa 3 — Montagem sobre vídeo real

A etapa fecha quando **todos** os itens abaixo estiverem cumpridos.

| # | Critério | Tipo | Situação hoje (segundo os docs) |
|---|---|---|---|
| 3.1 | **Formato A (multi-camada)**: tela por baixo, câmera por cima só nos trechos que o prompt definir. Pré-requisito: o teste de sincronia dos 3 arquivos do OBS com palma (alternativa 3, já escolhida). | [M] gravar o teste; depois [C] montar | Teste de sincronia ainda não gravado. |
| 3.2 | **Vídeo base + camadas por cima** (componentes de fundo transparente) sobre vídeo real. | [C]; [M] ver no Studio | Já existem composições de teste; nada confirmado pelo Matheus sobre vídeo real. |
| 3.3 | **Formato vertical/horizontal automático, com opção de forçar pelo prompt** (decisão de 05/10/2026). | [C] | Decidido, não implementado. |
| 3.4 | **`ArrobaInstagram` fixo.** | [M] mandar o @; depois [C] | Não construído. |
| 3.5 | **`AvisoCVM` entra só quando o roteiro pedir**, com texto oficial. | [M] texto oficial, tempo em tela e conferência no Studio | Código pronto com texto provisório; conferência pendente (é o mesmo item 6.2). |
| 3.6 | **Música de fundo e efeito sonoro sincronizado a um elemento visual.** | [M] baixar música e efeito; depois [C] | Arquivos ainda não baixados. |
| 3.7 | **Teste de tempo de renderização** com vídeo longo (10 a 20 min) no computador do Matheus. | [M] | Não feito. Em casa o render está bloqueado. |
| 3.8 | **Loop de verificação pós-render** (`scripts/folha-contato.mjs`) rodando com o `cortes.json` real. | [M] (mesma dependência de 6.3 e 6.4) | Ver 6.4. |
| 3.9 | **Vídeos verticais de referência** (Shorts/Reels), pré-requisito da etapa. | [M] | Matheus ainda vai trazer. |

---

## Se algum item de uma etapa ficar parado por causa de outra

O `CLAUDE.md` pede registrar no `docs/estado-atual.md` a que chat/etapa voltar. Os itens 6.3,
6.4 e 3.8 dependem de uma coisa só: o `0926.cortes.json` real, que está no computador de casa.

## Quando todos os critérios de uma etapa forem cumpridos

Avisar o Matheus na hora e deixar pronto um resumo de continuação para o chat da próxima
etapa (regra do `CLAUDE.md`).
