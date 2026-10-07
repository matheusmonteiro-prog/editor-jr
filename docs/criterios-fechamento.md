# Critérios de fechamento — Etapas 3 e 6

**RASCUNHO, AGUARDANDO APROVAÇÃO DO MATHEUS.** As decisões (a) a (e) abaixo já foram passadas por
ele em 07/10/2026 e estão incorporadas; a decisão (e) ainda aguarda a confirmação dele. O resto do
documento continua rascunho: ele pode cortar, trocar ou acrescentar.

Por que existe: o `CLAUDE.md` exige um critério de fechamento escrito por etapa. Hoje as
Etapas 3 e 6 estão "em andamento" no `ARQUITETURA.md`.

Como ler: cada item vem de uma tarefa que já está no `ARQUITETURA.md` (seção 7, Etapas 3 e 6),
exceto onde está escrito o contrário. Marcas:
- **[M]** depende do Matheus (arquivo, gravação, decisão ou olhar no Studio);
- **[E]** depende de outra etapa;
- **[C]** só código.

---

## Decisões do Matheus (07/10/2026)

**(a) Regra de validação.** O Matheus valida **só os marcos**. Testes e ajustes pequenos seguem
sem pedir a validação dele. O catálogo continua honesto: "validado" só com a data de quando ele
viu no Studio. (Hoje a única coisa que ele já viu e aprovou é a **Seta, em 05/10/2026**.)

**(b) Escopo da Etapa 6.** A Etapa 6 fecha **só com a 6a** (ler o formato e gerar a timeline, sem
IA). A **6b** (gerar componente novo via API) só começa se ele mandar.

**(c) Várias saídas da mesma gravação.** Só **prever**. O padrão é **1 saída**; um plano antigo
continua válido. **Pendente (antes de mexer em código):** contar quantos arquivos seriam
afetados e **avisar o Matheus se forem mais de 2**.

**(d) Ajuste manual do Studio.** Fica para a **Etapa 7**. Até lá vale a regra: **não clicar nem
arrastar na tela do vídeo** no Studio.

**(e) AvisoCVM.** Será conferido **no vídeo final** e **não bloqueia o item 6.2**.
*Aguardando o Matheus confirmar.*

---

## Etapa 6 — Leitor de prompt

A etapa fecha quando **todos** os itens abaixo estiverem cumpridos (escopo: só a 6a, decisão b).

| # | Critério | Tipo | Situação hoje (segundo os docs) |
|---|---|---|---|
| 6.1 | **Revisor calibrado**: o agente `revisor` pega erros plantados de propósito e não acusa a dívida conhecida como erro. (Item pedido pelo Matheus; vem do `CLAUDE.md`/`checklist-revisao.md`, não do `ARQUITETURA.md`.) | [M] aprovar | A calibração 2 foi feita em 02/10: o revisor apontou os 4 erros plantados. O Matheus ainda não disse se isso basta. |
| 6.2 | **Seta vista no Studio.** O AvisoCVM **não bloqueia** este item (decisão e): ele é conferido no vídeo final, item 6.5. | [M] | Seta: aprovada pelo Matheus em 05/10/2026. AvisoCVM: conferência visual pendente, movida para o 6.5 (aguardando o Matheus confirmar). |
| 6.3 | **`cortes.json` real com o validador passando**: o `videos/0926.cortes.json` de 1.167 bytes (hoje o do projeto é o provisório de 194 bytes) e `node scripts/validar-plano.mjs` sem ERRO no plano `0926`. | [M] trazer o arquivo de casa; depois [C] rodar o validador | Arquivo real ainda não está no projeto do trabalho. |
| 6.4 | **Render e folha de contato**: renderizar o plano `0926` no WSL e gerar a folha com `scripts/folha-contato.mjs`. | [M] rodar no WSL do trabalho; depende de 6.3 | O script foi testado só com vídeo de teste e `cortes.json` provisório; o `ARQUITETURA.md` diz "não validado como processo final". |
| 6.5 | **Vídeo de ponta a ponta**: da gravação + prompt até um vídeo montado com as camadas do plano, sem corrigir nada à mão. **Inclui conferir o AvisoCVM no vídeo final** (decisão e). | [M] ver e aprovar; depende de 6.3 e 6.4 | Não feito. A exportação final com melhor configuração por plataforma é Etapa 8. |
| 6.6 | **Várias saídas: só prever** (decisão c). O formato do plano prevê mais de uma saída, com **1 saída por padrão**, e um plano antigo continua válido sem mudança. | [C]; [M] ser avisado se afetar mais de 2 arquivos | Pendente: contar os arquivos afetados e avisar o Matheus se forem mais de 2, **antes** de mexer em código. Nada implementado. |

### Decisões tomadas e itens fora deste fechamento
- **6b (componente novo via API):** fora deste fechamento. Só se o Matheus mandar (decisão b).
  Precisaria da chave da API da Anthropic e do catálogo manual fechado.
- **Ajuste manual do Studio voltar pro JSON:** fica para a **Etapa 7** (decisão d). Até lá, não
  clicar nem arrastar na tela do vídeo.
- **`naPalavra`/`ocorrencia`:** depende de existir a transcrição por palavra da Etapa 4, então
  fica **fora** deste fechamento. **[E]**

---

## Etapa 3 — Montagem sobre vídeo real

A etapa fecha quando **todos** os itens abaixo estiverem cumpridos.

| # | Critério | Tipo | Situação hoje (segundo os docs) |
|---|---|---|---|
| 3.1 | **Formato A (multi-camada)**: tela por baixo, câmera por cima só nos trechos que o prompt definir. Pré-requisito: o teste de sincronia dos 3 arquivos do OBS com palma (alternativa 3, já escolhida). | [M] gravar o teste; depois [C] montar | Teste de sincronia ainda não gravado. |
| 3.2 | **Vídeo base + camadas por cima** (componentes de fundo transparente) sobre vídeo real. | [C]; [M] ver no Studio | Já existem composições de teste; nada confirmado pelo Matheus sobre vídeo real. |
| 3.3 | **Formato vertical/horizontal automático, com opção de forçar pelo prompt** (decisão de 05/10/2026). | [C] | Decidido, não implementado. |
| 3.4 | **`ArrobaInstagram` fixo.** | [M] mandar o @; depois [C] | Não construído. |
| 3.5 | **`AvisoCVM` entra só quando o roteiro pedir**, com texto oficial. | [M] texto oficial e tempo em tela; conferência no vídeo final | Código pronto com texto provisório. Conferência no vídeo final (item 6.5), aguardando o Matheus confirmar; **não bloqueia o 6.2**. |
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
