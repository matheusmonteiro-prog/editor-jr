# Estado atual — editor-jr (02/10/2026)

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

## Feito (conforme histórico de commits e `docs/relatorio-noite-0201.md`)

- Catálogo (Etapa 3): `CirculoDestaque` e `CallToAction` movidos pra
  "Componentes prontos" no `ARQUITETURA.md` seção 6; componente novo
  `AvisoCVM` (`src/components/v2/AvisoCVM.tsx`) criado, registrado em
  `src/Composition.tsx` e em `docs/catalogo-componentes.md`.
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

## Falta

- `AvisoCVM`: validação visual no Studio (feito nesta sessão sem abrir o
  Studio, por regra). Só depois disso entra no `CATALOGO` de
  `PlanoComposicao.tsx`.
- `Seta` (redesenhada em 01/10/2026): validação visual no Studio — ainda
  pendente de sessão anterior.
- `ArrobaInstagram`, `LogoAnimada`: não construídos (lista "A construir" do
  ARQUITETURA.md seção 6).
- `scripts/render-final.mjs`: comando montado e impresso, nunca executado
  de verdade (só `--dry-run`).
- `videos/0926.cortes.json` real (1.167 bytes, 26/09): ainda não está no
  projeto — o arquivo atual tem 194 bytes (01/10/2026), é provisório.
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
- **`noite-etapa6`** (atual) — 9 commits acima de `origin/main`: move
  `CirculoDestaque`/`CallToAction` pra "prontos", `PASTA_OUT` no
  folha-contato, `docs/etapa6-lacunas.md`, validador fortalecido +
  `testar-validador.mjs`, `docs/prompt-roteiro.md`, componente `AvisoCVM`,
  `render-final.mjs` (Etapa 8 mínima), `docs/relatorio-noite-0201.md`.
- **`teste-whisper`** — existe local e remota, **0 commits** além de
  `origin/main` (branch criada, sem trabalho próprio ainda).
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

## Itens "não confirmado"

- `videos/0926.cortes.json` atual é provisório (194 bytes) — os tempos
  calculados por `scripts/folha-contato.mjs` ou `validar-plano.mjs` contra
  ele não refletem o corte real até o arquivo de 1.167 bytes (26/09)
  substituir o provisório.
- Campo `"fps"` em `planos/0926.plano.json` está fora do schema documentado
  na seção 7 do `ARQUITETURA.md` — não confirmado se deve ser formalizado
  ou removido.
- `planos/teste-0926-opus.plano.json` está num formato antigo/diferente do
  decidido na seção 7 — não corrigido nem apagado, só registrado.
- Filtro `whisper` do FFmpeg (Gyan, instalado no PATH desta máquina) exige
  um arquivo de modelo `whisper.cpp` separado, não baixado — não confirma
  se esse é o caminho que a Etapa 4 vai usar.
- FFmpeg embutido do Remotion (`@remotion/compositor-win32-x64-msvc`) não
  respondeu a `-filters`/`-version` nesta máquina — consistente com um
  bloqueio já conhecido (0xC0E90002), não investigado nesta sessão.
