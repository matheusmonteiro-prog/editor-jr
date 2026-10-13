# Critérios de fechamento — Etapas 3 e 6

**Estado: aprovado pelo Matheus em 07/10/2026; Etapa 6 (6a) cumprida em 09/10/2026.** As decisões
(a) a (e) abaixo foram passadas por ele em 07/10/2026 e estão incorporadas; o AvisoCVM (e) foi
visto por ele em 07/10/2026. A Etapa 3 está fechada em **3a (código)** desde 13/10/2026; **3b (material real)** fica para validar na prática nas primeiras gravações reais (decisão do Matheus em 13/10/2026).

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
viu no Studio. (Hoje ele já viu **Seta (05/10/2026)**, **TextoDestaque** e **AvisoCVM** (07/10/2026).)

**(b) Escopo da Etapa 6.** A Etapa 6 fecha **só com a 6a** (ler o formato e gerar a timeline, sem
IA). A **6b** (gerar componente novo via API) só começa se ele mandar.

**(c) Várias saídas da mesma gravação.** Só **prever**. O padrão é **1 saída**; um plano antigo
continua válido. **Pendente (antes de mexer em código):** contar quantos arquivos seriam
afetados e **avisar o Matheus se forem mais de 2**.

**(d) Ajuste manual do Studio.** Fica para a **Etapa 7**. Até lá vale a regra: **não clicar nem
arrastar na tela do vídeo** no Studio.

**(e) AvisoCVM.** Visto pelo Matheus em 07/10/2026 (gostou; ajustes previstos depois).
**Não bloqueia o item 6.2.** Texto oficial da CVM: não é necessário (decisão do Matheus em 13/10/2026; ver 3.5).

---

## Etapa 6 — Leitor de prompt

A etapa fecha quando **todos** os itens abaixo estiverem cumpridos (escopo: só a 6a, decisão b).

| # | Critério | Tipo | Situação hoje (segundo os docs) |
|---|---|---|---|
| 6.1 | **Revisor calibrado**: o agente `revisor` pega erros plantados de propósito e não acusa a dívida conhecida como erro. (Item pedido pelo Matheus; vem do `CLAUDE.md`/`checklist-revisao.md`, não do `ARQUITETURA.md`.) | [M] aprovar | A calibração 2 foi feita em 02/10: o revisor apontou os 4 erros plantados. O Matheus aprovou a calibração em 07/10/2026. |
| 6.2 | **Seta vista no Studio e AvisoCVM visto pelo Matheus.** | [M] | **CUMPRIDO.** Seta: aprovada pelo Matheus em 05/10/2026. AvisoCVM: visto pelo Matheus em 07/10/2026 (gostou; ajustes previstos depois); texto padrão só de reserva; texto oficial da CVM não é necessário (decisão de 13/10/2026). |
| 6.3 | **`cortes.json` real com o validador passando**: o `videos/0926.cortes.json` de 1.167 bytes (no WSL e no Windows é o real, 1.167 bytes, sha256 `424456a2…e5491c04`, conferido em 09/10/2026; o provisório de 194 bytes, de 01/10/2026, é o **antigo**) e `node scripts/validar-plano.mjs` sem ERRO no plano `0926`. | [M] trazer o arquivo de casa; depois [C] rodar o validador | **CUMPRIDO em 09/10/2026.** No WSL e no Windows o `0926.cortes.json` é o real, 1.167 bytes, sha256 `424456a2…e5491c04`, conferido em 09/10/2026 (o provisório de 194 bytes, de 01/10/2026, é o **antigo**). `validar-plano.mjs` no `planos/0926.plano.json`: 8 OK, 0 erro, 0 aviso; duração original 43,141995 s. **Conteúdo do `cortes.json` confirmado pelo render e pelo Matheus em 09/10/2026.** |
| 6.4 | **Render e folha de contato**: renderizar o plano `0926` no WSL e gerar a folha com `scripts/folha-contato.mjs`. | [M] rodar no WSL do trabalho; depende de 6.3 | **CUMPRIDO em 09/10/2026, no PC do trabalho (WSL).** Render de `PlanoComposicao0926`: 1137 quadros, 1080×1920, 37,9 s, 2 min 28 s, `--concurrency=2`, saída `0926-real-v1.mp4` (22.858.826 bytes), folha de contato gerada (`0926-real-v1-folha-contato.png`). **Entrada: cópia reduzida 1080×1920** (`0926-diag-1080.mp4`, sha256 `e307828a…cb581c`), passada por `--props` (o `Root.tsx` não foi alterado). O **original 2160×3872** (sha256 `6b57cefa…8b8bc4`) **falha no Remotion deste ambiente** (still e render); causa exata **não confirmada**. Histórico anterior: o script foi testado só com vídeo de teste e `cortes.json` provisório; o `ARQUITETURA.md` diz "não validado como processo final". **Nota:** em 07/10/2026, o 0926-cortado-v1.mp4 do WSL é cópia do teste-jr-cortado-v7.mp4 (mesmo sha256) e o 0926.cortes.json é o provisório. Os arquivos reais vão na pasta do Windows: `videos/0926.cortes.json` e `public/videos/0926-cortado-v1.mp4`. A nota de 07/10 acima é **antiga**: em 09/10/2026 o `0926.cortes.json` do WSL já é o real (ver 6.3). |
| 6.5 | **Vídeo de ponta a ponta**: da gravação + prompt até um vídeo montado com as camadas do plano, sem corrigir nada à mão. **Inclui conferir o AvisoCVM no vídeo final** (decisão e). | [M] ver e aprovar; depende de 6.3 e 6.4 | **Visto e aprovado pelo Matheus em 09/10/2026** (`0926-real-v1.mp4`, feito a partir da cópia reduzida 1080×1920). O checklist de 7 pontos logo abaixo da tabela **não foi conferido item a item**. A exportação final com melhor configuração por plataforma é Etapa 8. |
| 6.6 | **Várias saídas: só prever** (decisão c). O formato do plano prevê mais de uma saída, com **1 saída por padrão**, e um plano antigo continua válido sem mudança. | [C]; [M] ser avisado se afetar mais de 2 arquivos | **CUMPRIDO, "só previsto" (07/10/2026).** Campo `"saidas"` (lista opcional de objetos com `"orientacao"`) documentado no `ARQUITETURA.md` §7 e no `docs/prompt-roteiro.md`, com fixture `planos/testes/saidas-previsto.plano.json`. Os arquivos de código (`validar-plano.mjs`, `testar-validador.mjs`, `PlanoComposicao.tsx`) **não foram alterados**: nenhum código lê o campo ainda. Sem o campo, vale 1 saída. |

### Checklist de aprovação do 6.5 (rascunho)
Para o Matheus conferir no vídeo final do 0926. As linhas citadas valem para 07/10/2026 e podem
mudar se o arquivo de origem for editado.

1. **Montado sem corrigir nada à mão.** Origem: item 6.5 da tabela acima ("sem corrigir nada à mão").
2. **Elementos entram no momento da fala, no vídeo cortado.** Origem: `ARQUITETURA.md:508–509`
   (`"inicio"` vale para o vídeo original, convertido pelo `.cortes.json`). Depende do
   `cortes.json` real (6.3).
3. **"Ilustrativo" onde não há dado real:** o campo `"ilustrativo": true` **e** a palavra
   "ilustrativo" na tela. Origem: `ARQUITETURA.md:540–541`.
4. **AvisoCVM aparecendo.** Origem: item 6.5 da tabela acima ("Inclui conferir o AvisoCVM no
   vídeo final"); entra só quando o roteiro pedir, `ARQUITETURA.md:434`. Conteúdo vem do pedido; texto oficial não é necessário (item 3.5, decisão de 13/10/2026).
5. **Extras escritos nos documentos:** nada cobre o rosto do JR (`ARQUITETURA.md:69` e `:148`);
   texto na tela nunca mais forte que a fala (`ARQUITETURA.md:543`); uma camada por ideia
   falada (`ARQUITETURA.md:534`).
6. **Cortes sem pulo visível.** Critério do Matheus, 07/10/2026.
7. **Componentes só com as cores da marca (#0F2A1D, #F5F0E6, #EFAF20).** Critério do Matheus,
   07/10/2026.

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
| 3.1 | **Formato A (multi-camada)**: tela por baixo, câmera por cima só nos trechos que o prompt definir. Pré-requisito: o teste de sincronia dos 3 arquivos do OBS. A palma foi dispensada pelo Matheus em 11/10/2026; alinhamento sem palma pendente. | [M] gravar o teste; depois [C] montar | **3a (código, construído):** lista `camera` no plano; validador (checagens 10 e 11); `deslocamentoCamera` com efeito; modo de 2 arquivos no `cortar-silencio.mjs` (`--tela` + `--camera`). **Visto:** a câmera do `PlanoCameraTeste` vista e aprovada pelo Matheus no Studio em 11/10/2026 (câmera de teste = sala vazia). **Render completo do `PlanoCameraTeste` (37 s, 1137 quadros):** renderizado (informado; arquivo não conferido nesta sessão). **Não foi o vídeo que o Matheus assistiu:** ele assistiu ao vídeo curto de 2 s, relatou que não entendeu e disse que está ok (relato de quem pediu o registro, 13/10/2026). **3b: validar na prática nas primeiras gravações reais** (par real com o JR na câmera, sincronia tela/câmera, alinhamento sem palma). **NÃO PROVADO:** sincronia; o JR na câmera; render com câmera real. |
| 3.2 | **Vídeo base + camadas por cima** (componentes de fundo transparente) sobre vídeo real. | [C]; [M] ver no Studio | **Provado.** Já existem composições de teste. O render do `PlanoComposicao0926` com o 0926 real foi **visto e aprovado pelo Matheus em 09/10/2026** (`0926-real-v1.mp4`, a partir da cópia reduzida 1080×1920; ver 6.4 e 6.5). |
| 3.3 | **Formato vertical/horizontal automático, com opção de forçar pelo prompt** (decisão de 05/10/2026). | [C] | **3a: código pronto; decidido em 05/10/2026.** Fase 1 (commit `ccfd5ed`): o campo `orientacao` do plano manda o tamanho das composições novas `PlanoAutomatico` e `PlanoAutomaticoHorizontal` (`vertical` 1080×1920, `horizontal` 1920×1080; outro valor dá aviso e vale o literal); `--width/--height` da linha de comando ganha do plano. As 5 composições antigas não mudaram. **Provado em render curto (13/10/2026):** 3 renders de 30 quadros, conferidos com ffprobe: horizontal sem flags saiu 1920×1080; com `--width 1080 --height 1920` saiu 1080×1920; `PlanoAutomatico` com a cópia leve saiu 1080×1920. O Matheus não confirmou ter aberto esses arquivos. A detecção de orientação continua só em `scripts/preparar-video.mjs` (grava na ficha, que **não é lida**); o valor `"automatico"` **não existe**. **NÃO PROVADO:** render completo; vídeo real com o JR (3b); proporção diferente do plano; recálculo ao editar props. Multi-camada (qual arquivo define a orientação) segue indefinido. |
| 3.4 | **`ArrobaInstagram`, só quando o roteiro pedir (não fixo).** | [M] ver no Studio | **3a: código pronto** (commit `36fff8d`): `src/components/v2/ArrobaInstagram.tsx`, registrado no `CATALOGO` e em `src/Composition.tsx`. Decisão do Matheus em 12/10/2026: o @ aparece só quando ele pedir no prompt, como o AvisoCVM; não é fixo nem fica o vídeo todo; o `usuario` vem do pedido a cada vez e nunca fica no código. Sem logo nem ícone do Instagram. Canto padrão superior esquerdo (provisório; a zona segura das plataformas não foi medida). Commit autorizado pelo Matheus em 12/10/2026; não visto nem ouvido na hora; não renderizado. |
| 3.5 | **`AvisoCVM` entra só quando o roteiro pedir**, com o conteúdo que o Matheus pedir. | [M] conferência no vídeo final, se ele pedir | **FECHADO POR DECISÃO (13/10/2026), não provado.** O Matheus decidiu que o AvisoCVM não precisa de texto oficial: o conteúdo é uma transcrição curta e/ou um emoji que passa de um canto para o outro, vem do prompt, só quando ele pedir; ajustes no componente só quando ele pedir. Código pronto (texto padrão só de reserva); visto pelo Matheus em 07/10/2026 (gostou; ajustes previstos depois). Tempo mínimo em tela: não foi tratado nessa decisão (ver `docs/perguntas-pendentes.md`). Ninguém viu o emoji nem a transcrição. |
| 3.6 | **Música de fundo e efeito sonoro sincronizado a um elemento visual.** | [M] baixar música e efeito; depois [C] | **3a: Fase 1 e Fase 2 construídas; render curto feito** (commit `36fff8d`; volume dos efeitos em 0,3, provisório, no commit `ccfb44a`): lista `audio` no topo do plano, opcional e fora de `elementos`; música e efeito com `Html5Audio` de `remotion`; música com volume provisório (0,03 com a faixa real, em 13/10); efeito no mesmo frame do elemento ou no `inicio`, pelo `tempoCortado.ts`; composição `PlanoAudioTeste`; `planos/teste-audio.plano.json`; áudio fora do Git (`.gitignore`). Commit autorizado pelo Matheus em 12/10/2026; não visto nem ouvido na hora. **Em 13/10/2026 o Matheus ouviu o teste** (som sintético, feito com ffmpeg): volume 1 estava alto; testou 3 durações do som (0,35, 0,5 e 0,7 s; o arquivo atual é de 0,5 s) e disse que deu certo; volume 0,3 é **provisório**. **Música real (13/10/2026):** `public/music/musica-teste.mp3` (mp3, estéreo, 48 kHz, 178,8 s, média -13,0 dB, -11,2 LUFS), em volume 0,03 (calculado para ficar ~12 a 13 dB abaixo da voz); efeitos em 0,3. Aprovado pelo Matheus em 13/10/2026, sem registro de que ele ouviu cada arquivo. Dois renders de 4 s saíram em 1080×1920, 120 quadros, sem ECANCELED nem aviso de áudio ausente. **LICENÇA NÃO REGISTRADA:** nome da faixa, link e licença ainda não informados; a faixa veio do Pixabay (informado pelo Matheus), o que não substitui o registro. **NÃO PROVADO:** volume em vídeo inteiro; inteligibilidade da voz com música em vídeo completo; música com outro espectro (0,03 vale só para esta faixa); render completo; sincronia por frame; o efeito por `inicio` 0:20 (fora das janelas renderizadas). **O validador confere a lista `audio` (checagem 11, commit `4c11e1f`): arquivo inexistente é erro; não prova som nem volume.** Arquivo ausente com `loop` pode travar o render (leitura de código, não testado). |
| 3.7 | **Teste de tempo de renderização** com vídeo longo (10 a 20 min) no computador do Matheus. | [M] | **3b: validar na prática nas primeiras gravações reais.** Não feito. Em casa o render está bloqueado. |
| 3.8 | **Loop de verificação pós-render** (`scripts/folha-contato.mjs`) rodando com o `cortes.json` real. | [M] (mesma dependência de 6.3 e 6.4) | **Provado** (registro de 13/10/2026): folha de contato do render 0926 real, visto pelo Matheus em 09/10/2026; ver 6.4 e 6.5. |
| 3.9 | **Vídeos verticais de referência** (Shorts/Reels), pré-requisito da etapa. | [M] | **3b: validar na prática nas primeiras gravações reais.** O Matheus ainda vai trazer os vídeos de referência. |

**Contagem da Etapa 3 (decisão do Matheus, 13/10/2026):** **3a (código, fechada):** 3.2 e 3.8 provados; 3.3, 3.4 e 3.6 com código pronto e autorizados, provados em render curto onde houve render (3.4 não teve render); 3.5 fechado por decisão. **3b (material real, a validar na prática nas primeiras gravações reais):** 3.1, 3.7 e 3.9. 3b não é feito nem validado.

`LogoAnimada` não existe em `src/`. `ArrobaInstagram` e a lista `audio` existem desde o commit
`36fff8d`. `public/music` tem a faixa `musica-teste.mp3` e o tom de teste; `public/sfx` tem só o som sintético de teste; tudo fora do Git (13/10/2026). `public/brand` segue vazia (12/10/2026).

---

## Se algum item de uma etapa ficar parado por causa de outra

O `CLAUDE.md` pede registrar no `docs/estado-atual.md` a que chat/etapa voltar. Os itens 6.3,
6.4 e 3.8 dependem de uma coisa só: o `0926.cortes.json` real (1.167 bytes), que já está no WSL e
no Windows do trabalho (6.3, conferido em 09/10/2026) e neste PC de casa (tamanho conferido em
12/10/2026).

## Quando todos os critérios de uma etapa forem cumpridos

Avisar o Matheus na hora e deixar pronto um resumo de continuação para o chat da próxima
etapa (regra do `CLAUDE.md`).
