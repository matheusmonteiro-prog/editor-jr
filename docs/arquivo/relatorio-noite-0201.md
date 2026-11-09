# Relatório — sessão noturna 01-02/10/2026 (branch `noite-etapa6`)

Não achei relatório anterior nesse formato no histórico do Git (`git log --all` não tem
nenhum `docs/relatorio*` anterior) — segui o formato pedido na tarefa.

## Objetivo

Fechar pendências de registro (catálogo + commit solto), fortalecer o validador do plano
de edição da Etapa 6, criar o componente `AvisoCVM`, montar (sem executar) o comando de
render final da Etapa 8, e verificar (sem instalar nada) o filtro `whisper` do FFmpeg e a
branch `teste-whisper` — tudo numa branch separada (`noite-etapa6`), sem o Matheus
presente, sem renderizar vídeo e sem tocar na `main`.

## Feito

1. **ARQUITETURA.md** — `CirculoDestaque` e `CallToAction` movidos de "A construir" pra
   "Componentes prontos" (já estavam validados no Studio em 01/10/2026 segundo
   `docs/catalogo-componentes.md`, só não refletido na seção 6).
2. **`scripts/folha-contato.mjs`** — commitada a mudança que já estava no working tree
   (pasta de saída configurável via `PASTA_OUT`, com o padrão `~/editor-jr/out` intacto).
3. **`docs/etapa6-lacunas.md`** — levantamento fiel do que a seção 7 (Etapa 6) decidiu, do
   que o código (`PlanoComposicao.tsx`, `tempoCortado.ts`, `validar-plano.mjs`) de fato
   faz, e do que faltava.
4. **`scripts/validar-plano.mjs`** fortalecido, sem mudar o formato do plano:
   - `"componente"` agora é conferido contra o `CATALOGO` real de `src/PlanoComposicao.tsx`
     (lido via AST), não contra a existência de um arquivo — nome não registrado lá agora é
     **ERRO** (antes passava como aviso e só quebrava no render).
   - Tipo de cada prop (number/string/boolean/enum/array/object/cor) conferido contra o
     schema Zod inferido via AST — **ERRO** se o tipo não bater. Não importei os schemas Zod
     de verdade porque isso exigiria transpilar/executar os `.tsx` (JSX + pelo menos um
     componente, `Contador.tsx`, roda `loadFont()` de rede no topo do módulo) — alternativa
     usada: extensão do parsing de AST que o script já fazia (ver nota longa no próprio
     script e em `docs/etapa6-lacunas.md`).
   - `"inicio"`/`"duracao"` fora da duração do vídeo original: antes exigia `--duracao`
     manual; agora carrega `duracaoOriginal` de `videos/<video>.cortes.json` sozinho quando
     a flag não é passada.
   - Colisão de `posicao`+`slot` virou **AVISO** (era ERRO).
   - `"a confirmar"` em `"componente"`/`"props"` virou **ERRO** (a regra que permitia era
     provisória "até existir `docs/catalogo-componentes.md`", que já existe desde 28/09).
   - Toda mensagem agora cita o `id` real do elemento (antes era um rótulo posicional tipo
     `el-3`), o campo problemático e como corrigir.
5. **`planos/testes/`** — 1 plano válido + 6 inválidos (um por checagem nova) e
   **`scripts/testar-validador.mjs`**, que roda o validador contra cada um e confirma exit
   code + trecho da mensagem esperada.
6. **`docs/prompt-roteiro.md`** — modelo de prompt pro Matheus pedir um plano de edição a um
   chat de IA, no formato "quando eu falar X → acontece Y", com a lista de componentes e
   props obrigatórias (gerada via AST, não de memória) e `planos/0926.plano.json` como
   exemplo real; termina pedindo pra conferir com o validador antes de entregar.
7. **`src/components/v2/AvisoCVM.tsx`** — componente novo: faixa de texto chapada (sem
   blur), fundo semi-transparente opcional, fade de entrada/saída via `interpolate()`,
   posição topo/rodapé (nunca centro, pra não cobrir o rosto do JR), tudo em fração via
   `useVideoConfig()` — mesma composição serve pra vertical e horizontal, sem variante
   separada. O texto nunca é fixo no código: vem só da prop `texto` (padrão `""`).
   Registrado em `src/Composition.tsx` e `docs/catalogo-componentes.md`
   ("criado em 02/10/2026, não validado visualmente — aguardando Matheus"). De propósito,
   **não** registrado ainda no `CATALOGO` de `PlanoComposicao.tsx` (só entra lá depois de
   validado no Studio).
8. **`docs/etapa8-notas.md`** — flags de resolução/codec/bitrate confirmadas na saída real
   de `npx remotion render --help` (`--width`, `--height`, `--fps`, `--codec`,
   `--video-bitrate`).
9. **`scripts/render-final.mjs`** — monta o comando de render final (vertical 1080×1920 ou
   horizontal 1920×1080, 30fps), usando a mesma variável `PASTA_OUT`. Testado **só** com
   `--dry-run` nesta sessão — nunca executei um render de verdade.
10. **`docs/perguntas-pendentes.md`** (novo) — registra as decisões que são do Matheus:
    texto oficial do `AvisoCVM` + tempo mínimo em tela, e envio pro Google Drive
    (autorização de conta + escolha de conector/API).

## Funcionando (testado de fato nesta sessão)

- `node scripts/validar-plano.mjs planos/0926.plano.json` → `0 erro(s), 0 aviso(s)`, carrega
  a duração automaticamente de `videos/0926.cortes.json` (43.141995s).
- `node scripts/validar-plano.mjs planos/teste-4-componentes.plano.json` → `0 erro(s), 0
  aviso(s)`.
- `node scripts/validar-plano.mjs planos/teste-0926-opus.plano.json` → `11 erro(s)` (esperado:
  é um plano num formato antigo/diferente do decidido, não um bug do validador).
- `node scripts/testar-validador.mjs` → `7/7 casos OK` (saída real, não resumida):
  ```
  OK   plano válido passa limpo
  OK   componente que não existe no CATALOGO real
  OK   prop obrigatória faltando
  OK   prop com tipo errado
  OK   inicio fora da duração do vídeo original
  OK   colisão de posicao/slot vira AVISO, não ERRO
  OK   "a confirmar" restando em componente/props

  7/7 casos OK
  ```
- `npx tsc --noEmit` → sem saída, exit 0 (projeto inteiro, incluindo o `AvisoCVM` novo e o
  `Composition.tsx` editado).
- `node scripts/render-final.mjs PlanoComposicao0926 0926-final --formato vertical --dry-run`
  → imprime `npx remotion render src/index.ts PlanoComposicao0926 <PASTA_OUT>\0926-final.mp4
  --width 1080 --height 1920 --fps 30` (e o equivalente horizontal com `--codec`) — só
  imprime, não executa.
- `npx remotion render --help` → saída real capturada em `docs/etapa8-notas.md`.
- `ffmpeg -filters` (FFmpeg completo do Gyan, já instalado em `PATH` nesta máquina — a nota
  antiga do ARQUITETURA.md dizia "falta em casa", parece ter sido instalado depois) tem o
  filtro `whisper` (`.. whisper A->A Transcribe audio using whisper.cpp.`).
  `ffmpeg -h filter=whisper` confirma que ele **exige arquivo de modelo separado**: a opção
  `model` é "Path to the whisper.cpp model file" (e `vad_model`, "Path to the VAD model
  file") — nada embutido. **Não baixei nenhum modelo, não instalei nada.**
  O FFmpeg embutido do Remotion (`node_modules/@remotion/compositor-win32-x64-msvc/`) **não
  respondeu** a `-filters`/`-version` nesta máquina (saída vazia) — consistente com o
  bloqueio 0xC0E90002 já conhecido, não investiguei mais.
- `git branch -a` → branch `teste-whisper` existe **local e remota**
  (`remotes/origin/teste-whisper`). Também existe uma `wip-trabalho-0930` (local e remota),
  não mencionada na tarefa original — não toquei nela, só reporto que existe.

## Não testado / aguardando validação visual

- **`AvisoCVM`**: criado em 02/10/2026, **não validado visualmente** — não abri o Remotion
  Studio nesta sessão (proibido pelas regras gerais). Só confirmei que compila (`tsc`) e que
  o padrão de código bate com os outros componentes v2.
- **`Seta`** (sessão anterior): continua pendente de validação visual — não alterei nada
  nela, e não marquei como validada em nenhum lugar.
- **`scripts/render-final.mjs`**: a string do comando foi só impressa, nunca executada de
  verdade (nem com `--dry-run`, que por definição não executa, nem sem a flag).
- **Checagens novas do validador contra um plano real com `AvisoCVM`**: não existe ainda
  nenhum plano real usando `AvisoCVM` (ele nem está no `CATALOGO` de `PlanoComposicao.tsx`
  ainda), então essa combinação específica só foi testada via fixture sintética
  (`Checkmark`), não com o componente novo.

## Pendências

- `naPalavra`/`ocorrencia`: não implementado, de propósito — depende da Etapa 4 (Whisper),
  cujo formato de saída ainda não foi decidido.
- Campo extra `"fps"` em `planos/0926.plano.json`, fora do schema documentado na seção 7 —
  não é um bug, só não confirmado se deveria ser formalizado ou removido (decisão do
  Matheus, não técnica).
- `planos/teste-0926-opus.plano.json` está num formato antigo/diferente do decidido — não
  corrigi nem apaguei, só registrei a diferença em `docs/etapa6-lacunas.md`.
- Envio automático pro Google Drive (Etapa 8): não implementado, depende de autorização e
  escolha de conector do Matheus (ver `docs/perguntas-pendentes.md`).
- `AvisoCVM` ainda não está no `CATALOGO` de `PlanoComposicao.tsx` — entra lá só depois de
  validado no Studio.

## Perguntas pra mim (de `docs/perguntas-pendentes.md`)

1. Qual é o **texto oficial** do aviso CVM pra usar na prop `texto` do `AvisoCVM`?
2. Existe **exigência de tempo mínimo em tela** pra esse aviso? (hoje o padrão é 150 frames
   / 5s, arbitrário)
3. Pra envio automático ao Google Drive (Etapa 8): autoriza o acesso à conta Google, e qual
   conector/API usar?

## Próxima ação

- Abrir o Remotion Studio (fora desta sessão) pra validar visualmente o `AvisoCVM` com um
  texto de teste, e então decidir se ele entra no `CATALOGO` de `PlanoComposicao.tsx`.
- Responder as 3 perguntas acima pra desbloquear o texto final do `AvisoCVM` e o início da
  Etapa 8 de verdade (envio pro Drive).
- Se algum plano real precisar comparar posição/tempo de elementos, considerar rodar
  `scripts/validar-plano.mjs` com os novos avisos de colisão antes de aprovar no Studio.
