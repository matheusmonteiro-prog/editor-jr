# Estado atual — editor-jr (02/10 a 07/10/2026)

Gerado a partir do `ARQUITETURA.md`, do `git log`/`git branch -a` e de testes
rodados nesta sessão (sem renderizar, sem abrir o Studio). Reflete a branch
`noite-etapa6`.

## Etapa atual

`ARQUITETURA.md` (seção "Status") marca duas etapas **em andamento** ao
mesmo tempo:
- **Etapa 3 — Montagem sobre vídeo real**
- **Etapa 6 — Leitor de prompt**

Etapas 0–2 estão `[x]` (concluídas). Etapas 4, 5, 7, 8 estão `[ ]`, sem
marca de "em andamento".

**Etapa 8:** `scripts/render-final.mjs` já existe (monta o comando de render final),
mas a etapa segue **sem marca de andamento** no `ARQUITETURA.md`. Ter o script não
significa que a etapa começou.

A que chat voltar: chat do projeto (claude.ai) da Etapa 6. **6.4 cumprido e 6.5 visto e aprovado
pelo Matheus em 09/10/2026** (PC do trabalho, WSL): render do `PlanoComposicao0926` com 1137
quadros, 1080×1920, 37,9 s, 2 min 28 s, `--concurrency=2`, saída `0926-real-v1.mp4` e folha de
contato. A entrada foi a **cópia reduzida 1080×1920** (`0926-diag-1080.mp4`, sha256
`e307828a…cb581c`), passada por `--props`. O original 2160×3872 (sha256 `6b57cefa…8b8bc4`) falha no
Remotion deste ambiente (still e render); causa exata **não confirmada**. O checklist de 7 pontos
do 6.5 **não foi conferido item a item**. 6.3 cumprido em 09/10/2026 (conteúdo do `cortes.json`
confirmado pelo render e pelo Matheus). **6a cumprida em 09/10/2026 (critérios 6.1 a 6.6)**;
pendências no `ARQUITETURA.md`, seção 7, Etapa 6.

## Feito (conforme histórico de commits e `docs/relatorio-noite-0201.md`)

- Catálogo (Etapa 3): `CirculoDestaque` e `CallToAction` movidos pra
  "Componentes prontos" no `ARQUITETURA.md` seção 6; componente novo
  `AvisoCVM` (`src/components/v2/AvisoCVM.tsx`) criado, registrado em
  `src/Composition.tsx`, no `CATALOGO` de `src/PlanoComposicao.tsx` e em
  `docs/catalogo-componentes.md`. AvisoCVM: com texto provisório, prop
  `corCard` separada, canto inferior esquerdo (visto pelo Matheus em 07/10/2026:
  gostou; ajustes previstos depois; commits `40cf3ba` e `34bccc8`).
- `Seta` redesenhada (05/10/2026): curva única, espessura variável, ponta em V;
  aprovada pelo Matheus no Studio em 05/10/2026 e mesclada na `noite-etapa6`.
- `scripts/folha-contato.mjs`: pasta de saída configurável via `PASTA_OUT`.
- `scripts/validar-plano.mjs` fortalecido: `"componente"` conferido contra o
  `CATALOGO` real (AST), tipo de cada prop conferido contra o schema Zod
  (AST), `"inicio"`/`"duracao"` fora da duração carregando
  `duracaoOriginal` automaticamente do `.cortes.json`, colisão de
  `posicao`+`slot` virou aviso (era erro), `"a confirmar"` virou erro.
- `scripts/testar-validador.mjs` + `planos/testes/` (fixtures): confirma as
  checagens do validador.
- `docs/prompt-roteiro.md`: modelo de prompt pra pedir plano de edição a um
  chat de IA.
- `docs/etapa6-lacunas.md`: lacunas entre o decidido na seção 7 e o código
  real.
- `docs/etapa8-notas.md` + `scripts/render-final.mjs`: monta (sem executar)
  o comando de render final, flags confirmadas em `npx remotion render
  --help`.
- `docs/perguntas-pendentes.md`: registra decisões que são do Matheus.
- Item 6.6 (várias saídas), **só previsto** (07/10/2026): campo opcional `"saidas"` (lista de
  objetos com `"orientacao"`) documentado em `ARQUITETURA.md` §7 e `docs/prompt-roteiro.md`, com
  a fixture `planos/testes/saidas-previsto.plano.json`. Nenhum código lê o campo; sem ele vale 1
  saída.

- **Etapa 3, preparar vídeo (09/10/2026, PC do trabalho, WSL):** foi criado o
  `scripts/preparar-video.mjs` (ainda sem commit), que gera a cópia leve antes do render. Ver
  `ARQUITETURA.md` seção 2, "Preparar vídeo", e a regra "nunca renderizar o original 2160×3872
  no WSL".
  - **Provado no 0926:** a saída `public/videos/0926-cortado-v1-leve-v1.mp4` tem 1080×1920,
    SAR 1:1, 37,93 s e áudio AAC.
  - **Corte:** 8 px em cima e 8 px embaixo, sem tirar rosto nem o "T" dourado (frame 0
    comparado).
  - **Ficha:** `videos/0926.preparo.json`, gravada **só no Linux**. A cópia leve também
    existe só no Linux.
  - **Também provado:** a detecção em vídeos sintéticos (1:1, 16:10, 16:9) e o modo dos 3
    arquivos sintéticos.
  - **Diagnóstico do original:** ele falha no compositor do Remotion (`write ECANCELED`) mesmo
    com a composição em 1080×1920. Causa exata **não confirmada**.

- **Etapa 3, par real de teste (09/10/2026):** a sessão de 25/09/2026 (`2026-09-25 13-42-46`):
  - **Tela com som** (`Videos\SOM TELA\`): 8,07 s, voz presente (−28,1 dB). O quadro do segundo 3
    mostra a janela do próprio OBS gravando, sem o JR.
  - **Câmera muda** (`Videos\CAMERA GRAV\`): 7,03 s, faixa de áudio em silêncio puro (−91,0 dB).
    O quadro do segundo 3 mostra uma sala vazia, sem o JR.
  - Os dois são **horizontais 1280×720**.
  - **A diferença de cerca de 1,03 s entre os dois não foi medida como sincronia e não foi
    corrigida.** Só se leu a duração de cada arquivo.
  - **O `preparar-video.mjs` ganhou a opção `--saida-dir`** (as cópias vão para a pasta indicada)
    e, no modo de camadas, o papel entra no nome da cópia (`...-tela-leve-v1.mp4`,
    `...-camera-leve-v1.mp4`).
  - **Execução real feita no WSL**, só com `--tela` + `--camera` (sem `--camera-mic`) e
    `--saida-dir ~/editor-jr/public/videos`: saíram `2026-09-25 13-42-46-tela-leve-v1.mp4`
    (1280×720, SAR 1:1, 8,033 s, voz presente) e `2026-09-25 13-42-46-camera-leve-v1.mp4`
    (1280×720, SAR 1:1, 7,033 s, áudio continua mudo, −91,0 dB), **só no Linux**.
  - **Ficha:** `videos/2026-09-25 13-42-46.preparo.json`, também só no Linux.
  - **Nada novo em `C:\Users\edica\Videos`** (listagens antes e depois idênticas).
  - A cópia da tela ficou 1 quadro mais curta que o original (8,033 s contra 8,067 s); causa não
    investigada.
- **Render curto com a cópia leve do 0926 (quadros 0 a 29):** passou, 1080×1920, SAR 1:1, 30
  quadros, sem `ECANCELED` (sem elementos do plano nesse trecho).

- **Etapa 3, mapa de tempo com gancho (11/10/2026):** o commit `a055886` ("fix: tempoCortado
  acerta com gancho e --copiar (T15), com teste") mudou 3 arquivos: `src/utils/tempoCortado.ts`
  (40 inserções, 21 remoções), `scripts/teste-tempo-cortado.mjs` (novo, 56 linhas, um teste com
  20 casos) e `docs/testes-editor.md` (novo, 355 linhas). **Corrigido em `a055886` segundo o
  commit; o Matheus ainda não conferiu o resultado.** O teste do script não foi rodado ao
  escrever este registro.
- **Gancho, resultado dos testes (11/10/2026, PC de casa, só documentação):**
  `node scripts/teste-tempo-cortado.mjs` deu `OK (20 casos)`, saída 0, com casos escritos à mão
  (não usam o `0926.cortes.json` real). Conferência com o 0926 real: 45 de 45 tempos iguais à
  conta direta (script temporário, já apagado). **Não prova gancho nem `--copiar` em vídeo real**
  (o 0926 não tem gancho) e não prova o frame certo da fala (falta ver no Studio). Aviso
  `MODULE_TYPELESS_PACKAGE_JSON` do Node: não é erro; `"type": "module"` no `package.json` não
  foi feito. Detalhes em `docs/testes-editor.md`, T15.

- **Etapa 3, câmera no plano, Fase 1 (11/10/2026, commit `e570119`):** 4 arquivos:
  `src/PlanoComposicao.tsx` (lista `"camera"` no plano, `cameraSrc`, uma instância fixa de câmera
  pela composição inteira, início e fim de cada trecho pelo `tempoCortado.ts`),
  `src/components/v2/CamadaVideo.tsx` (prop `ajuste`, sem padrão em JS de propósito),
  `src/Root.tsx` (composição `PlanoCameraTeste`, 1080×1920, 30 fps, 1137 quadros, na pasta
  Testes) e `planos/teste-camera.plano.json` (4 trechos de câmera). `npx tsc --noEmit` rodado
  antes do commit: exit 0, 0 erros.
- **Etapa 3, câmera no plano, Fase 2 (11/10/2026, SEM commit ainda):** `scripts/validar-plano.mjs`
  ganhou a checagem 10 (lista `"camera"` e `deslocamentoCamera`); `scripts/testar-validador.mjs`
  passou de 8 para **25 de 25 casos OK** (17 fixtures novas em `planos/testes/`, `camera-*`,
  `aviso-camera-*` e `valido-camera`). `planos/teste-camera.plano.json` e `planos/0926.plano.json`:
  0 erro, 0 aviso.
- **PlanoCameraTeste: a câmera vista e aprovada pelo Matheus em 11/10/2026, no Studio.**
- **Etapa 3, câmera no plano, SEM prova (registrado em 11/10/2026):**
  - **Sincronia** tela/câmera, **render**, o **JR na câmera** (a câmera de teste é a sala vazia)
    e a câmera **não recomeçar a cada trecho** (o desenho usa uma instância fixa; não foi medido).
  - **`deslocamentoCamera`:** tem efeito no `PlanoComposicao` (commit `1cc8211`): positivo = a
    câmera avança (`trimBefore`); negativo = a câmera espera (`Sequence from`); padrão 0 = igual ao
    anterior. Validador: 27/27 casos; AVISO se `|valor|` > 5 s. Prova só a conta de frames e o
    `tsc`; **não visto no Studio** e sem par real.
  - Fixture `planos/testes/aviso-camera-deslocamento.plano.json`: **nome enganoso** (agora passa
    limpo, sem aviso); renomear é um passo à parte.
  - A tela passou a ficar dentro de um `AbsoluteFill` com 100% de largura e altura em todas as
    composições do `PlanoComposicao`; o resultado visual do `PlanoComposicao0926` **não foi
    conferido** no Studio depois dessa mudança (dedução pelo CSS).
- **Etapa 3, câmera no plano, limites conhecidos:** o `cortar-silencio.mjs` agora tem o modo de 2
  arquivos (`--tela` + `--camera`, commit `6b83f36`; ver "modo de 2 arquivos" abaixo), sem prova
  com par real de gravação; a checagem
  "trecho passa do fim do vídeo" só funciona se o validador conhece a duração (`--duracao` ou
  `videos/<video>.cortes.json`); `framesEntrada` e `framesSaida` não têm limite de máximo.
- **Atenção no PC do trabalho:** depois do `npm install`, os 29 erros do `tsc` em
  `src/testes/CasaExplicativa.tsx` podem voltar: os pacotes 3D (`three`, `@react-three/fiber`,
  `@remotion/three`, `@types/three`) estão só no `package.json` da `testes-ideias`; aqui estão em
  `node_modules` por terem sido instalados lá em 11/10. **Inferência, não testada no trabalho.**

## Falta

- Etapa 3: **não testados** — render do Remotion com as cópias leves do par de 25/09 e com a
  cópia do 0926 nos quadros que têm elementos (o de 0 a 29 não tem); `--camera-mic` junto com
  `--saida-dir` e os 3 arquivos reais do OBS na mesma sessão; arquivo único em execução real com
  `--saida-dir`; vídeo com rotação; entrada com SAR ≠ 1:1; rodar o script no Windows.
- Etapa 3: a cópia dos arquivos para o PC de casa (a ficha e a pasta `videos/` não vão pro Git).
- Etapa 3: **sincronia tela/câmera** (a alternativa 3 de `ARQUITETURA.md`, seção 3a) segue sem
  resultado registrado.
- Etapa 3 — **lacuna: ligar tela + câmera ao plano** (apurado em 11/10/2026, só leitura; detalhe
  em `docs/testes-editor.md`, T13). **Fases 1 e 2 feitas (ver acima):** o plano tem a lista
  `"camera"` e o validador a confere. **Continua em aberto:** `CamadaVideo` fora do `CATALOGO`
  (a câmera usa lista própria); o `deslocamentoCamera` agora tem efeito (commit `1cc8211`); falta só
  provar com um par real de gravação (tela + câmera). Zoom e tela/câmera meio a meio só existem como teste (`src/testes/`, e a cena 1
  do `TesteControleCamadas`). Cerca de 5 arquivos pelo modelo do commit `5c605ab` (AvisoCVM),
  mais um segundo vídeo no plano e o deslocamento de sincronia (estimativa, não medida).
- Etapa 3 — `TesteControleCamadas`: aberto no Studio pelo Matheus, em casa, em 11/10/2026; ele
  disse que funcionou. Tela provisória (`teste2-tela.mp4`, com erros de leitura), sem sincronia
  medida e sem render.
- Etapa 3 — **commit `d7c0ce9`** (`src/Root.tsx`: `scale: 1.004` e `translate: "3.8px 2.1px"` no
  `TesteControleCamadas`, mensagem "origem a confirmar"): **arrasto no Studio confirmado pelo
  Matheus em 11/10; revertido em `b42ae1f`** (o `d7c0ce9` continua no histórico;
  `ARQUITETURA.md:258` e `:753-754` mandam não arrastar). Foge da regra de nada de tamanho fixo
  em pixel.
- Etapa 3 — **palma dispensada pelo Matheus em 11/10/2026** (deixou de ser pré-requisito do
  Formato A, `ARQUITETURA.md:243-245`). **Decisão de método pendente:** alinhar tela e câmera
  sem palma (a definir). `docs/criterios-fechamento.md:88` ainda a lista: não editado nesta rodada.
- Etapa 3 — **propostas de 10/10, ainda NÃO decididas** (cortes com tela + câmera):
  - **Opção A:** o `cortar-silencio.mjs` ganha um modo de 2 arquivos, e a tela com áudio decide
    os cortes. **Feita no código** (Fase A, commit `6b83f36`; detalhe no bullet abaixo).
  - **Opção B:** cortar dentro do Remotion.
  - **Fatos relacionados:** o `--limpar` mexe no áudio (`highpass`, `afftdn`, `acompressor`,
    `loudnorm`; `ARQUITETURA.md:471-474`); a cópia leve guarda o áudio original (`ARQUITETURA.md:89`).
- **Etapa 3, modo de 2 arquivos no `cortar-silencio.mjs` (Fase A, commit `6b83f36`):**
  - **O que faz:** `--tela` + `--camera` (sem `--camera-mic`); o **áudio da tela decide os
    cortes**; a tela sai **com** áudio e a câmera sem; as duas recebem a mesma lista de trechos.
    `.cortes.json` com `tipoSessao: "two_files"`, `arquivos: {tela, camera}` e
    `parametros.deslocamentoCamera = 0` (**sem deslocamento no script**). Saídas
    `<base>-tela-cortado-vN.mp4` e `<base>-camera-cortado-vN.mp4`.
  - **`--saida-dir`:** pasta das saídas, do `.cortes.json` e do `.tmp-cortes` (padrão: ao lado do
    original). Com `--saida-dir` ou no modo de 2 arquivos, um `.cortes.json` **diferente** já
    existente faz o script avisar e parar sem gravar; um igual é regravado.
  - **Extras:** erro se a tela não tem áudio; aviso (não erro) de fps diferente entre tela e
    câmera e de duração das saídas diferindo mais de 1 frame.
  - **Modos de 1 e de 3 arquivos:** saída idêntica à do `HEAD`, comparada com o mesmo ffmpeg.
  - **Teste:** `scripts/teste-cortar-dois-arquivos.mjs`, `OK (26 verificações)`, com vídeos
    sintéticos em `%TEMP%`.
  - **NÃO provado:** render; sincronia com par real de gravação; o JR na câmera; o aviso de
    duração **nunca disparou** (só lido no código); deriva de frame com os 7 trechos reais e fps
    diferentes (60 contra 30); `--limpar` não rodado no modo novo; o teste usou o ffmpeg do PATH e o
    script também usa o do Remotion (não repetido com ele); a comparação do JSON é pelo texto
    inteiro (`/` contra `\` conta como diferente); `preparar-video.mjs` ainda pode exigir 3
    arquivos (a conferir, só leitura parcial). **Sem prova visual do `deslocamentoCamera`** (o
    Matheus não abriu no Studio).
- **Etapa 3, modo de 2 arquivos com arquivos reais (12/10/2026, PC de casa):**
  - **Rodou:** `--tela` + `--camera` `--gerar` `--saida-dir` (em `%TEMP%`, fora do projeto). Tela =
    `videos/0926.mp4` (2160×3872, 30 fps, 43,14 s, com voz e 6 pausas). Câmera = `teste2-camera.mp4`
    **em loop** (sala vazia, 1280×720, 30 fps, 43,17 s, sem áudio, **construída fora do projeto**).
    Exit 0 em 154 s, 7 trechos, **nenhum aviso**.
  - **Saídas:** tela 37,924 s e 1137 quadros, com áudio; câmera 37,933 s e 1138 quadros, sem áudio.
    A soma dos trechos bate com `duracaoFinal`. Os 7 trechos são **idênticos** aos de
    `videos/0926.cortes.json`. A tela cortada é **byte a byte idêntica** ao
    `public/videos/0926-cortado-v1.mp4` (`cmp`).
  - **Observações:** a câmera saiu com 1 quadro a mais (0,009 s), abaixo do limite do aviso (1
    frame); provavelmente arredondamento de `-t` em segundos por pedaço, **causa não investigada**.
    O script **não avisa** quando as resoluções de tela e câmera diferem; só as mostra.
  - **NÃO provado:** sincronia (a câmera é a sala vazia em loop, sem par real); o JR na câmera;
    render; deriva com fps diferentes (60 contra 30); o aviso de duração nunca disparou; a diferença
    de 1 quadro pode acumular com mais cortes reais; qual binário do ffmpeg o script usou (Remotion
    ou PATH) não foi confirmado. "Voz" vem do nível de áudio e das pausas, não de alguém ter ouvido.

- `AvisoCVM`: código completo, registrado; visto pelo Matheus em 07/10/2026
  (gostou; ajustes previstos depois). Texto continua provisório e o texto oficial
  da CVM segue pendente. O item 6.2 de `docs/criterios-fechamento.md` está cumprido.
- `ArrobaInstagram`, `LogoAnimada`: não construídos (lista "A construir" do
  ARQUITETURA.md seção 6).
- `scripts/render-final.mjs`: monta o comando de render. Com `--dry-run` só imprime; sem
  `--dry-run` ele executa o render de verdade (`scripts/render-final.mjs`, linha 90). Se já
  foi executado de verdade alguma vez: **NÃO CONFIRMADO**.
- `videos/0926.cortes.json` — **resolvido (6.3 cumprido em 09/10/2026):** no WSL e no Windows é o
  real, 1.167 bytes, sha256 `424456a2…e5491c04`, conferido em 09/10/2026. O provisório de 194
  bytes (01/10/2026) é o **antigo**. `validar-plano.mjs` no `planos/0926.plano.json`: 8 OK, 0 erro,
  0 aviso; duração original 43,141995 s. Conteúdo do json confirmado pelo render e pelo Matheus
  em 09/10/2026.
- Etapa 8 (envio automático pro Google Drive): não implementada, depende de
  autorização de conta e escolha de conector pelo Matheus.
- `naPalavra`/`ocorrencia` (Etapa 6): não implementado, depende da Etapa 4
  (Whisper) decidir o formato de saída primeiro.

## Branches

- **`main`** — branch principal. `origin/main` está em `9432337` ("marca
  Etapas 3 e 6 como em andamento"); a cópia local do `main` neste
  repositório está parada em `907de81`, 4 commits atrás de `origin/main`
  (`32cef76`, `02e24d6`, `4b69d4e`, `9432337`) — precisa de `git pull` na
  branch `main` pra atualizar.
- **`noite-etapa6`** (atual) — para ver o estado, rode `git log --oneline
  origin/noite-etapa6..HEAD` (commits que ainda não foram pro GitHub). O reflog da ref remota
  (`git reflog show origin/noite-etapa6`) registra "update by push" em 02/10 e 05/10
  (11:25 e 18:25), ou seja, houve `git push` neste computador; o autor de todos os commits é o
  mesmo usuário do Git ("JR EDICOES"), então **NÃO CONFIRMADO quem rodou cada push**. **Seta aprovada pelo Matheus no
  Studio em 05/10/2026 e mesclada** (a branch `seta-nova` continua existindo). Inclui: move
  `CirculoDestaque`/`CallToAction` pra "prontos", `PASTA_OUT` no
  folha-contato, `docs/etapa6-lacunas.md`, validador fortalecido +
  `testar-validador.mjs`, `docs/prompt-roteiro.md`, componente `AvisoCVM`,
  `render-final.mjs` (Etapa 8 mínima), `docs/relatorio-noite-0201.md`.
  - **Em 11/10/2026, 4 commits à frente do GitHub, sem push** (`git log
    origin/noite-etapa6..noite-etapa6`): `b52f316` ("Etapa 3 (em andamento):
    TesteControleCamadas, CamadaVideo com opacidade e loop; tela provisória, sem sincronia nem
    render"), `a055886` ("fix: tempoCortado acerta com gancho e --copiar (T15), com teste"),
    `d7c0ce9` ("Etapa 3: scale/translate do TesteControleCamadas (origem a confirmar)") e
    `b42ae1f` ("Reverte d7c0ce9: ajuste de scale/translate veio de arrasto no Studio (confirmado
    pelo Matheus)"). **O push segue parado até o Matheus escrever "push"** (o hook
    `bloquear-push.mjs` bloqueia o Claude Code).
- **`teste-whisper`** — existe só no GitHub (remota), **0 commits** exclusivos
  além de `origin/main` (conferido em 07/10/2026 com `git rev-list --count
  origin/main..origin/teste-whisper` = 0). Último commit: `e5c0670`, "CirculoDestaque:
  componente novo", em 01/10/2026 01:16 (`git log -1 --format=%cd origin/teste-whisper`).
- **`teste-trabalho`** — existe só local, **0 commits** além de `origin/main` (conferido em
  07/10/2026 com `git rev-list --count origin/main..teste-trabalho` = 0). O último commit
  dela, `7c27eff` ("checagem de props obrigatórias ... no validar-plano.mjs"), já está dentro
  do `origin/main`.
- **`wip-trabalho-0930`** — existe local e remota, 3 commits além de
  `origin/main` (`bb77b90` CallToAction valores padrão em JS, `56796e7`
  restaura PersonagemImagem, `20193cb` WIP 30/09). O `CallToAction` dessa
  branch já foi trazido pro `main` por outro commit (`f3af6b9`, "Traz
  CallToAction completo de wip-trabalho-0930") — os 3 commits continuam
  listados como exclusivos porque não houve `git merge` entre as branches.

## Perguntas pendentes

Ver `docs/perguntas-pendentes.md` — decisões do Matheus, não técnicas:
1. Texto oficial do aviso CVM (prop `texto` do `AvisoCVM`) e se há exigência
   de tempo mínimo em tela.
2. Envio automático pro Google Drive (Etapa 8): autorização de conta e
   escolha de conector/API.
3. Campo `"fps"` do plano: formalizar ou remover.

(Já decididas e na seção "Decididas" do mesmo arquivo: a detecção automática de
vertical/horizontal, em 05/10/2026, e o ajuste manual do Studio, em 07/10/2026, que fica
para a Etapa 7 com a regra "não clicar nem arrastar na tela do vídeo".)

## Itens "não confirmado"

- `videos/0926.cortes.json`: **antigo** (até 08/10/2026) era o provisório de 194 bytes
  (01/10/2026). Em 09/10/2026, no WSL e no Windows, é o real (1.167 bytes, sha256
  `424456a2…e5491c04`), então este item deixou de valer.
- Campo `"fps"` em `planos/0926.plano.json` está fora do schema documentado
  na seção 7 do `ARQUITETURA.md` — não confirmado se deve ser formalizado
  ou removido.
- `planos/0926.plano.json`: registrado em doc (composição `PlanoComposicao0926`),
  formato da seção 7. Não confirmado pelo Matheus nesta sessão.
- `planos/teste-0926-opus.plano.json` está num formato antigo/diferente do
  decidido na seção 7 — não corrigido nem apagado, só registrado.
- Filtro `whisper` do FFmpeg (Gyan, instalado no PATH desta máquina) exige
  um arquivo de modelo `whisper.cpp` separado, não baixado — não confirma
  se esse é o caminho que a Etapa 4 vai usar.
- FFmpeg embutido do Remotion (`@remotion/compositor-win32-x64-msvc`) não
  respondeu a `-filters`/`-version` nesta máquina — consistente com um
  bloqueio já conhecido (0xC0E90002), não investigado nesta sessão.
