> **As seções abaixo desta são fotos antigas; vale o retrato de 03/11/2026.**

## Retrato de 03/11/2026

Lido no repositório e no git em 03/11/2026, no PC do trabalho (decisão do Matheus: `PC-EDICAO`, `C:\Users\zerob\editor-jr`). Sem abrir o Studio. O que não tem prova de comando está como [NÃO VERIFICADO].

### Branch e HEAD
- Branch `video-apresentacao`, HEAD `168aaad`, igual a `origin/video-apresentacao` (`git status -sb`).
- 42 commits depois de `noite-etapa6` e 152 depois de `origin/main`. A `main` segue em `9432337`.
- `noite-etapa6` local está em `7a28e6c` (`origin/noite-etapa6` está em `98867ec`, 4 atrás); esses 4 commits já estão em `origin/video-apresentacao`.
- Branches que a seção "Branches" abaixo não lista: `video-apresentacao`, `kit-visual-video` (só no remoto), `teste-visao` (só local), `etapa4-legendas` e `backup-stash-0/1` (só no remoto).

### Etapas
Marcas como no `ARQUITETURA.md`. As aprovações são registros de que o Matheus viu; nenhum comando prova isso: [NÃO VERIFICADO] hoje.
- [x] Etapa 0: infraestrutura. Render no WSL deste PC provado em 2 renders curtos (ver "Render WSL").
- [x] Etapa 1: organizar a casa.
- [x] Etapa 2: cortes, gancho e limpeza de voz.
- [x] Etapa 3: 3a fechada (13/10/2026); **3b aberta** (par real, sincronia, vídeo de 10 a 20 min, vídeos de referência).
- [x] Etapa 4: 4a fechada (14/10/2026); **4b aberta** (glossário e gravações reais).
- [ ] Etapa 5: sem marca no `ARQUITETURA.md`; o `CLAUDE.md` diz "em alinhamento". Existe só o kit visual (sem `LogoAnimada` em `src/`; `public/brand` não existe).
- [x] Etapa 6: 6a cumprida (09/10/2026); **6b não começou**. `PlanoComposicao0926` segue 2160×3872 (`remotion compositions`).
- [ ] Etapa 7: interface própria.
- [ ] Etapa 8: `scripts/render-final.mjs` existe; ter o script não marca a etapa como iniciada.

### O que mudou desde 16/10
**Vídeo de apresentação**
- Rodadas 1 a 8 registradas em `docs/pr-video-apresentacao.md`. **O código vai até a rodada 9** (47 menções em `src/`), e nenhum doc a registra.
- Duração: 2588 quadros (86,27 s), **medida no WSL** (`remotion compositions`).
- Bloco 08 com 3 áudios: `08-resposta-1`, `-2` e `-3-embreve` (`src/dados/apresentacao.ts:397-402`).
- Clipes `a1` a `a4` existem em `public/videos/cenas/`. Bandeiras seguem provisórias em SVG (`apresentacao.ts:285-286`). `VARIACAO_CTA` está em `"a"` (`apresentacao.ts:644`).
- Auditoria de boas práticas: M1 e M5 aplicados (0 ocorrências de `* 30` no sfx e de `TINGIMENTO`); M4 em parte (30 arquivos importam `utils/clamp`; restam cópias em `JurosCompostosLab`, `CamadaVideo`, `GradeAtivos3D`, `LegendaAnimada` e `PlanoComposicao`). Em qual commit e com qual aprovação: [NÃO VERIFICADO].
- 95 stills em `out/stills/apresentacao/`, o mais recente de 26/10.
- Áudios, imagens e vídeos seguem fora do Git (decisão do Matheus), sem cópia no GitHub.

**Higgsfield**
- `scripts/gerar-video.mjs` (desde `a9510f4`; modo imagem, retomar pedido e catálogo em `f5cd6fa`) e `docs/higgsfield.md`.
- `public/images/catalogo-gerados.json` tem 5 entradas. `docs/higgsfield.md:3` diz que nada foi testado contra a API: leitura do código, não o estado de uso.

**Kit visual: duas versões diferentes, nenhuma na branch atual**
- Local, sem commit (`docs/kit-visual-video.md`, alterado em 03/11/2026 às 16:46): título "v3, rascunho de 03/11/2026", verde do método `#39A96B`/`#1F7A47`, com seções novas (6.1, 4.8 a 4.11, 13 e 14).
- Remoto (`origin/kit-visual-video`, `d639758`): título "v2", rodapé "v3: verde do método decidido", verde `#1DD41E`/`#1F7A47` como decisão do Matheus de 02/11/2026, com o zoom de abertura.
- `docs/auditoria-contradicoes.md` ("v3 no remoto, v2 local"; verde `#1DD41E`) foi escrito antes dessa alteração local. Qual vale: decisão do Matheus.
- Merge de teste calculado em 03/11/2026 (`merge-tree`, antes dos commits `d4c6390`, `1a4b28e` e `168aaad`): conflitos em `docs/catalogo-componentes.md` e `src/PlanoComposicao.tsx`.

**Configuração**
- `bbe14d7`: `dotenv` 17.3.1 como dependência direta; `.gitignore` libera `videos/0926.cortes.json` e ignora `public/videos/` e `backup-videos/`.
- `79e521c`: versiona `videos/0926.cortes.json`, importado pelo `Root.tsx`. Causa do erro em clone novo removida; **clone novo não testado**.
- `d4c6390`: `docs/higgsfield.md` e `docs/auditoria-contradicoes.md`. `1a4b28e`: caminhos dos PCs. `168aaad`: `.gitattributes` com `*.sh text eol=lf`.

**Render WSL**
- `~/render.sh` carrega o nvm e usa `npx --no-install`; cópia em `scripts/render-wsl.sh`; backup em `~/render.sh.bak-03-11-2026`.
- 2 renders de 30 quadros de `CirculoDestaque`, por `bash -ic` e por `bash -lc`: exit 0, h264, 1080×1920, 30 quadros. **Composição completa e `VideoApresentacao` não renderizados.**
- O `rsync` do script exclui `public/videos`, e a cópia do WSL não tem `public/videos/cenas/`: 7 vídeos de cena deram 404 em `remotion compositions`.
- O script fixa `--width 1080 --height 1920`, que ganha do plano.
- Node v24.22.0 (nvm), ffmpeg 8.0.1.

**Validador**
- `scripts/testar-validador.mjs`: 72/72 casos OK. `planos/0926.plano.json`: 0 erro, 0 aviso. `planos/teste-audio.plano.json`: 1 erro, porque `music/musica-teste.mp3` não está neste PC.

### Divergências provadas com as seções abaixo
Linhas de `estado-atual.md` conforme o commit `168aaad`, antes deste retrato.

| Diz | Repositório prova | Prova |
|---|---|---|
| `:5`, `:318`: branch atual `noite-etapa6` | `video-apresentacao`, `168aaad` | `git status -sb` |
| `:328-335`: 4 commits parados sem push | `b42ae1f` está em `origin/noite-etapa6` | `git merge-base --is-ancestor` |
| `:321`: 3 commits de Matheus Monteiro | JR EDICOES 165, Matheus Monteiro 46 | `git log --format=%an` |
| `:39`: última rodada é a 8 | Código vai até a 9 | `grep -i "rodada 9" src docs` |
| `:40-41`: 2465 quadros | 2588, medida no WSL | `remotion compositions` |
| `:39`: falta `08-resposta.mp3` | Código usa 3 áudios, que existem | `apresentacao.ts:397-402` |
| `:41`: faltam clipes A1 a A4 | Existem | `ls public/videos/cenas` |
| `:46`: 4 efeitos mudos | 6 arquivos em `public/audio/apresentacao/sfx`; que tocam: [NÃO VERIFICADO] | `ls`, commit `60be05f` |
| `:44`: 9 stills da rodada 3 | 95, até 26/10 | `ls out/stills/apresentacao` |
| `:38`: M1, M4 e M5 aguardando | M1 e M5 aplicados; M4 em parte | `grep` |
| `:84`, `:141`: sem commit | `8485cf8`; `a048f7e` no remoto | `git log` |
| `:296`: validador 52/52 | 72/72 | `testar-validador.mjs` |
| `:273`: clone novo não compila | `79e521c` versiona o arquivo; clone não testado | `git show --stat` |
| `:298`, `:365`: código 1 por `explorer.exe` no script | Sem `explorer` no script e no backup; 2 renders com exit 0 | `grep -c`, renders |
| `:295`: `musica-teste.mp3` | Não está neste PC | validador |
| `:114`: `C:\Users\edica\Videos` | Este PC não tem usuário `edica` (só `inves` e `zerob`) | `ls /c/Users` |
| `ARQUITETURA.md:48`: Git só no Windows | `~/editor-jr/.git` existe no WSL, em `noite-etapa6`/`98867ec`, com arquivos modificados | `git log` no WSL |
| `ARQUITETURA.md:118`: `explorer.exe` no fim do script | Idem acima | `grep -c` |
| `ARQUITETURA.md:369`: `GraficoSubindo` descartado | Existe em `src/components/apresentacao/` | `ls` |
| `docs/criterios-fechamento.md:100`: `public/brand` vazia | Não existe | `ls` |

### Pendências abertas
**Matheus**
- Qual versão do kit visual vale, e o verde do método (`#39A96B` local x `#1DD41E` no remoto).
- "Sinal de compra" no código e nos docs.
- Merge de `kit-visual-video` (2 conflitos).
- Testar clone novo (compila e abre o Studio).
- Backup de `public/audio/`, `public/images/` e dos vídeos, que estão fora do Git.
- Ver o `VideoApresentacao` no Studio e aprovar. Variação do CTA, PNGs das bandeiras e rodada 9.
- Etapas 3b e 4b (gravações reais). Licença da música.
- `skills-lock.json`, modificado e fora dos commits.
- Levar os vídeos de cena ao WSL, se for renderizar `VideoApresentacao` lá.
- Regras do validador para o kit (proposta da rodada de 03/11/2026).

**Claude Code (quando o Matheus pedir)**
- Registrar a rodada 9 em `docs/pr-video-apresentacao.md`.
- `ARQUITETURA.md:48` e `:118`; `criterios-fechamento.md:100`; "34 componentes" em `docs/auditoria-contradicoes.md` (são 33 `.tsx` + `marca.ts`).
- Terminar o M4.
- Renomear `aviso-camera-deslocamento` e arquivos com espaço ou extensão dupla (`EM BREVE.mp3`, `musica-fundo.mp3.mp3`, `logo-chapeu.png.png`, `teste-real-camera.mp4.mp4`), se ele aprovar.

### Decisões do Matheus nesta rodada (03/11/2026)
- Este PC é o do trabalho. O caminho do PC de casa fica a confirmar.
- `dotenv` como dependência direta; `videos/0926.cortes.json` versionado; `public/videos/` e `backup-videos/` ignorados.
- `~/render.sh` com nvm e `--no-install`, com cópia versionada e `.gitattributes`.
- `CLAUDE.md` não muda nesta rodada.
- Kit visual, vídeos e merge de `kit-visual-video` não foram mexidos.

---

# Estado atual — editor-jr (02/10 a 16/10/2026)

Gerado a partir do `ARQUITETURA.md`, do `git log`/`git branch -a` e de testes
rodados nesta sessão (sem renderizar, sem abrir o Studio). Reflete a branch
`noite-etapa6`.

## Etapa atual

`ARQUITETURA.md` (seção "Status") marca a **Etapa 3** como concluída em **3a (código)** (13/10/2026; **3b (material real)** fica para validar na prática nas primeiras gravações reais) e a **Etapa 6** como `[x]` (6a cumprida em 09/10/2026).

Etapas 0–2 estão `[x]` (concluídas). Etapa 4: **4a fechada em 14/10/2026, 4b aberta**
(depende de gravações reais). Etapas 5, 7, 8 estão `[ ]`, sem marca de "em andamento".

**Etapa 8:** `scripts/render-final.mjs` já existe (monta o comando de render final),
mas a etapa segue **sem marca de andamento** no `ARQUITETURA.md`. Ter o script não
significa que a etapa começou.

A que chat voltar: chat do projeto (claude.ai) da Etapa 6. **6.4 cumprido e 6.5 visto e aprovado
pelo Matheus em 09/10/2026** (PC do trabalho, WSL): render do `PlanoComposicao0926` com 1137
quadros, 1080×1920, 37,9 s, 2 min 28 s, `--concurrency=2`, saída `0926-real-v1.mp4` e folha de
contato. A entrada foi a **cópia reduzida 1080×1920** (`0926-diag-1080.mp4`, sha256
`e307828a…cb581c`), passada por `--props`. O original 2160×3872 (sha256 `6b57cefa…8b8bc4`) falha no
Remotion deste ambiente (still e render); causa exata **não confirmada**. O checklist de 7 pontos
do 6.5 foi confirmado pelo Matheus em 16/10/2026 (sem prova item a item). 6.3 cumprido em 09/10/2026 (conteúdo do `cortes.json`
confirmado pelo render e pelo Matheus). **6a cumprida em 09/10/2026 (critérios 6.1 a 6.6)**;
pendências no `ARQUITETURA.md`, seção 7, Etapa 6.

## Vídeo de apresentação (fora das etapas; branch `video-apresentacao`, rodadas de 19 e 20/10/2026)

Projeto à parte, pedido pelo Matheus em 19/10/2026. Branch `video-apresentacao`, criada a partir
da `noite-etapa6`; o PR/merge volta para a `noite-etapa6`, **não** para a `main`.
- **Feito (rodada 1 e 2, commitado só como código):** composição `VideoApresentacao` (pasta Videos
  do Studio), dados em `src/dados/apresentacao.ts` (modelo para outros vídeos pergunta e resposta),
  componentes em `src/components/apresentacao/`, `GradeAtivos3D` no catálogo, `mediabunny` 1.56.1
  declarado. Rodada 2: cenas com vídeo/imagem/fundo sólido, bloco 06 com contador até +400, bloco 07
  com 3 frases e ícones, bloco 08 com o CTA novo, moedas aleatórias, música de fundo e pontos de som.
  Duração pelos áudios: **2518 frames (83,9 s)**.
- **Auditoria `remotion-best-practices` (22/10/2026, só análise, nada aplicado):** relatório completo em `docs/auditoria-remotion-best-practices.md`. **Mecânicos aguardando aprovação:** M1 (`* 30` em 4 linhas de `src/utils/sfxApresentacao.ts`), M2 (fps 30 em `VideoApresentacao.tsx` e `Root.tsx`), M3 (cálculos fixos refeitos a cada frame; custo não medido), M4 (`clamp` copiado em vários arquivos), M5 (`TINGIMENTO = 0` deixa código morto). **Decisões do Matheus:** D1 (`@remotion/media`, risco médio), D2 (`CanvasImage`, risco alto no `Logo3D`/`Bandeira3D`; não trocar sem teste), D3 (blur/sombra por frame; medir antes de assar), D4 (`transform` em texto; não fazer agora), D5 (schema zod: decidir o que expor). **Fora do escopo (marca):** cores fora de `COR`; Fraunces no bloco 08. **Observações:** sem transcrição Whisper dos 17 áudios da apresentação; o `GradeAtivos3D` não está no vídeo desde a rodada 2; o roteiro `claude/roteiro-video-apresentacao.md` está no Project, não no repositório (por isso a auditoria usou `src/dados/apresentacao.ts`).
- **Rodada 8 (22/10/2026):** bloco 06 com 15 ativos (pasta nova `images/ativos/`; 5 brasileiros acrescentados no JSON); bloco 08 com o CTA novo ("SIGA NAS REDES SOCIAIS / E ATIVE AS NOTIFICAÇÕES / EM BREVE, O MÉTODO JR"), sem teaser, sem ponto em "MÉTODO JR", pílula final no padrão verde/dourado e ícones ~1,8x maiores. Bloco 04 aprovado como está. Stills `*-r8.png`. **Falta:** o `08-resposta.mp3` novo (os tempos do CTA estão estimados), decidir se a pílula "EM BREVE NESTE CANAL" sai, Fraunces x Inter na chamada, variação "a"/"b", PNGs das bandeiras. Detalhes em `docs/pr-video-apresentacao.md`.
- **Rodada 7 (22/10/2026):** abertura sem a camada verde (era 58%); bloco 03 com a tabela nítida (sem verde e sem desfoque, só 12% de preto neutro); bloco 02 com bandeiras 3D **provisórias** (faltam os PNGs do Matheus) e ícone de ETF; bloco 03 com esteira de ícones ("seleção") e convergência preço/valor; bloco 04 com o gráfico da foto acendendo no editor (**decisão aberta:** fica assim ou precisa de imagem/clipe sem o gráfico); bloco 08 com o teaser "O QUE NINGUÉM TE MOSTROU ANTES" na pergunta e 2 variações do CTA (`VARIACAO_CTA` em `src/dados/apresentacao.ts`). Skill: `30` → `fps` e PNG escurecido do Logo3D. Duração igual (2465 frames). Stills `*-r7.png`. **Falta:** o Matheus escolher a variação "a" ou "b", conferir no Studio e mandar os PNGs das bandeiras. Detalhes em `docs/pr-video-apresentacao.md`.
- **Rodada 6 (22/10/2026):** fundo novo nos blocos 00/01 (clipe A1) e 05 (A2→A3→A4, com cross-fade); bloco 03 com os selos no centro e o fundo sem número legível; bloco 06 com a lista de ativos de referência (sem preço); bloco 07 com texto novo e fundo sem azul; bloco 08 sem "o que ninguém te mostrou antes" e com ícones das redes. 2465 frames. Stills `*-r6.png`. `07-pergunta.mp3` novo já entrou (conferido). Bloco 08 fica como está. **Falta:** clipes A1–A4 e o Matheus aprovar no Studio. Detalhes em `docs/pr-video-apresentacao.md`.
- **Rodada 4 (20/10/2026):** Inter em tudo, verde leve, moedas só nos blocos 02, 06 e 08, transições dinâmicas, sons de contagem e ok ligados, ordem do bloco 07 corrigida. Detalhes em `docs/pr-video-apresentacao.md`.
- **Rodada 3 (20/10/2026):** cenas 3, 5 e 7 em vídeo, escurecimento 15%, bloco 07 empilhando, bloco 08 redesenhado (Space Grotesk), sons reais com ducking. Detalhes em `docs/pr-video-apresentacao.md`.
- **Stills:** 9 em `out/stills/apresentacao/` (frame do meio de cada bloco), de 20/10/2026 (rodada 3).
- **Falta:** o Matheus ver no Studio e aprovar; só depois o render em `out/video-apresentacao.mp4`.
  Os 4 efeitos sonoros não baixaram do Pixabay (403): pontos marcados e mudos. `software-recorte.png`
  não existe (bloco 04 só com texto). Vídeos das cenas 3 e 5 não usados (ver o rascunho do PR).
- **Sem commit:** áudios, imagens (originais e prontas), vídeos e logo (decisão do Matheus).
- Rascunho do README do PR, com a lista de quebras de marca: `docs/pr-video-apresentacao.md`.

## Feito (conforme histórico de commits e `docs/relatorio-noite-0201.md`)

- Catálogo (Etapa 3): `CirculoDestaque` e `CallToAction` movidos pra
  "Componentes prontos" no `ARQUITETURA.md` seção 6; componente novo
  `AvisoCVM` (`src/components/v2/AvisoCVM.tsx`) criado, registrado em
  `src/Composition.tsx`, no `CATALOGO` de `src/PlanoComposicao.tsx` e em
  `docs/catalogo-componentes.md`. AvisoCVM: conteúdo vem do pedido (texto padrão só de reserva), prop
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
  `src/testes/CasaExplicativa.tsx` podem voltar (**o arquivo não existe neste clone**: a pasta `src/testes/` não existe e a busca por `CasaExplicativa*` não achou nada, conferido em 19/10/2026): os pacotes 3D (`three`, `@react-three/fiber`,
  `@remotion/three`, `@types/three`) estão só no `package.json` da `testes-ideias`; aqui estão em
  `node_modules` por terem sido instalados lá em 11/10. **Inferência, não testada no trabalho.**
- **Etapa 4, critério 4.5 (`LegendaAnimada`), commits de 13 e 14/10/2026 na `noite-etapa6`** (só
  locais até o push). Etapa 4: **4a fechada em 14/10/2026, 4b aberta** (depende de gravações reais):
  código pronto, visual aprovado no Studio em 14/10 (4.5, `PlanoLegendaTeste0926`); falta ver
  com gravações reais e com o rosto do JR livre.
  - `3670cc3` (etapa A): componente `LegendaAnimada` e tela de teste `TesteLegendaAnimada` no
    `src/Root.tsx`; visual aprovado pelo Matheus em casa só com palavras de teste.
  - `d19f181` (B1): `criarEstaDentroDeTrecho` em `src/utils/tempoCortado.ts` diz se um tempo do
    original caiu num trecho mantido ou num silêncio cortado.
  - `eb9613f` (B2): `src/utils/legenda.ts` converte palavras em ms do original para frames do vídeo
    cortado; a `LegendaAnimada` aceita `palavrasMs`, o `PlanoComposicao` faz a conversão e a
    composição `LegendaAnimada` foi registrada no Studio.
  - `114954d` (B3): o `resolver-plano.mjs` grava `props.palavrasMs` a partir de `legendaPalavras`
    e `destaques` do elemento.
  - `41c13b0` (B3b): o resolvedor preenche `inicio` e `duracao` que faltarem e avisa destaque sem
    acerto e `inicio` depois do `de`.
  - `1ae285e` (B4): o `validar-plano.mjs` confere a `LegendaAnimada` (legenda não resolvida, sem
    palavras, `palavrasMs` mal formada e aviso de duração).
  - `bc97c6e` (B3c): a `duracao` preenchida pelo resolvedor vai até o fim da última palavra,
    arredondada para cima ao décimo.

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
  provar com um par real de gravação (tela + câmera). Zoom e tela/câmera meio a meio só existem como teste (arquivos `Teste*.tsx` e `Naruto.tsx` direto em `src/`, e a cena 1
  do `TesteControleCamadas`). Cerca de 5 arquivos pelo modelo do commit `5c605ab` (AvisoCVM),
  mais um segundo vídeo no plano e o deslocamento de sincronia (estimativa, não medida).
- Etapa 3 — `TesteControleCamadas`: aberto no Studio pelo Matheus, em casa, em 11/10/2026; ele
  disse que funcionou. Tela provisória (`teste2-tela.mp4`, com erros de leitura), sem sincronia
  medida e sem render.
- Etapa 3 — **commit `d7c0ce9`** (`src/Root.tsx`: `scale: 1.004` e `translate: "3.8px 2.1px"` no
  `TesteControleCamadas`, mensagem "origem a confirmar"): **arrasto no Studio confirmado pelo
  Matheus em 11/10; revertido em `b42ae1f`** (o `d7c0ce9` continua no histórico;
  `ARQUITETURA.md:262` e `:402` mandam não arrastar). Foge da regra de nada de tamanho fixo
  em pixel.
- Etapa 3 — **palma dispensada pelo Matheus em 11/10/2026** (deixou de ser pré-requisito do
  Formato A, `ARQUITETURA.md:247-249`). **Decisão de método pendente:** alinhar tela e câmera
  sem palma (a definir). `docs/criterios-fechamento.md:87` ainda a lista: não editado nesta rodada.
- Etapa 3 — **propostas de 10/10, ainda NÃO decididas** (cortes com tela + câmera):
  - **Opção A:** o `cortar-silencio.mjs` ganha um modo de 2 arquivos, e a tela com áudio decide
    os cortes. **Feita no código** (Fase A, commit `6b83f36`; detalhe no bullet abaixo).
  - **Opção B:** cortar dentro do Remotion.
  - **Fatos relacionados:** o `--limpar` mexe no áudio (`highpass`, `afftdn`, `acompressor`,
    `loudnorm`; `ARQUITETURA.md:477-480`); a cópia leve guarda o áudio original (`ARQUITETURA.md:89`).
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
- **Etapa 3 (critério 3.3), orientação automática, Fase 1 (commit `ccfd5ed`):**
  - **Feito:** o campo `orientacao` do plano manda o tamanho via `calculateMetadata`
    (`src/utils/tamanhoDoPlano.ts`, `src/Root.tsx`): `"vertical"` 1080×1920, `"horizontal"`
    1920×1080; outro valor dá aviso no console e vale o literal da composição. O
    `--width`/`--height` da linha de comando ganha do plano (lido no código do Remotion 4.0.527,
    não executado). Composições novas na pasta Testes: `PlanoAutomatico` (vertical, 0926 +
    câmera) e `PlanoAutomaticoHorizontal` (plano inline, `teste2-camera.mp4`, literal 1080×1920 de
    propósito). As 5 composições antigas **não mudaram** (só adições no `Root.tsx`).
  - **Prova:** teste de 6 casos (`scripts/teste-tamanho-do-plano.mjs`), `tsc` 0 erros, validador
    27/27, `planos/0926.plano.json` e `planos/teste-camera.plano.json` com 0 erros.
  - **Não é lido:** a ficha `.preparo.json`. **Não existe:** o valor `"automatico"`.
  - **O que o Matheus viu:** ainda nada; a conferência no Studio está pendente.
  - **NÃO provado:** render; vídeo real com o JR; o que a tela faz com proporção diferente do
    plano (esticar ou barras, sem `objectFit`); se o Studio recalcula ao editar props;
    multi-camada (qual arquivo define a orientação) segue indefinido.
  - **Risco que já existia:** `videos/` é ignorada pelo Git e o `Root.tsx` importa
    `videos/0926.cortes.json`, então um clone novo não compila.

- `AvisoCVM`: código completo, registrado; visto pelo Matheus em 07/10/2026
  (gostou; ajustes previstos depois). Texto oficial não é necessário: decisão do Matheus em 13/10/2026 (fechado por decisão, não provado). Tempo mínimo em tela segue em aberto. O item 6.2 de `docs/criterios-fechamento.md` está cumprido.
- `LogoAnimada`: não construído (lista "A construir" do ARQUITETURA.md seção 6).
- **Etapa 3, 12/10/2026, commit `36fff8d`:**
  - **`ArrobaInstagram` (3.4):** existe em `src/components/v2/ArrobaInstagram.tsx`, registrado no
    `CATALOGO` e em `src/Composition.tsx`. Só aparece quando o roteiro pedir, com o @ vindo do pedido
    (decisão do Matheus); canto padrão superior esquerdo, provisório (zona segura não medida).
    Commit autorizado pelo Matheus em 12/10/2026; não visto nem ouvido na hora; não renderizado.
  - **Áudio, Fase 1 (3.6):** lista `audio` no topo do plano (opcional, fora de `elementos`); música
    e efeito com `Html5Audio` de `remotion`; música com volume provisório (0,03 com a faixa real, em 13/10); efeito no frame do
    elemento ou do `inicio`, pelo `tempoCortado.ts`; composição `PlanoAudioTeste`; áudio fora do Git
    (`public/music/` e `public/sfx/` no `.gitignore`). Commit autorizado pelo Matheus em 12/10/2026; não visto nem ouvido na hora.
    **NÃO PROVADO:** som real; encaixe com a voz do JR; render completo; licença de música alguma (não registrada). **O validador confere a lista `audio` (checagem 11, commit `4c11e1f`).** Ele não prova som, volume nem licença. Arquivo ausente com `loop` pode travar o render (leitura de código, não testado).
  - **`deslocamentoCamera`:** tem efeito desde o commit `1cc8211`; provado só na conta de frames,
    **sem prova visual**.
- **Etapa 3, 13/10/2026 (renders curtos no PC do trabalho; commit `ccfb44a` e um de docs):**
  - **Câmera no plano (3.1), visto:** `PlanoCameraTeste`, quadros 640-699 (60 quadros), 1080×1920, SAR 1:1, `--props` só com o `videoSrc` da cópia leve. A janelinha da câmera e o `BarrasDuelo` apareceram por cima da tela, sem esticar; ECANCELED = 0; o `--props` **mesclou** com os `defaultProps`. O Matheus assistiu ao mp4; relatou que não entendeu e também disse que está ok (relato de quem pediu o registro, 13/10/2026). **NÃO PROVADO:** sincronia, o JR na câmera, o render completo.
  - **Orientação automática (3.3), 3 renders de 30 quadros:** (A) `PlanoAutomaticoHorizontal` sem `--width`/`--height` saiu 1920×1080; (B) o mesmo com `--width 1080 --height 1920` saiu 1080×1920 (a linha de comando ganha do plano); (C) `PlanoAutomatico` com a cópia leve saiu 1080×1920. Conferido com ffprobe; quadros olhados pelo Claude Code. **O Matheus não confirmou ter aberto esses arquivos.** **NÃO PROVADO:** render completo, JR, ficha `.preparo.json` (não é lida). **Risco:** `scripts/preparar-video.mjs` imprime `--width` e `--height` nos comandos; se contradisserem o plano, o comando vence em silêncio.
  - **Áudio (3.6), `PlanoAudioTeste` (quadros 600-719):** com o efeito em volume 1, a subida ficou 13,0 dB acima da voz na média; em 0,3, ficou 4,3 dB (pico +1,5 dB). O Matheus ouviu: volume 1 estava alto; testou 3 durações do som (0,35, 0,5 e 0,7 s; o arquivo atual é de 0,5 s) e disse que deu certo. O som é **sintético** (ffmpeg). **A música de fundo** (tom de 110 Hz, volume 0,2; substituída no mesmo dia pela faixa real, ver abaixo) **não foi confirmada**: a medição não prova que ela toca, e o Matheus não disse se ouviu. Volume 0,3 é **provisório** até o som real. **NÃO PROVADO:** som real; inteligibilidade da voz com música real; render completo; licença de música alguma. Os arquivos de teste estão em `public/music/` e `public/sfx/`, **fora do Git**.
  - **Música real (3.6), 13/10/2026:** `public/music/musica-teste.mp3` (mp3, estéreo, 48 kHz, 178,8 s, média -13,0 dB, -11,2 LUFS), em volume 0,03 (calculado para ficar ~12 a 13 dB abaixo da voz). Dois renders de 4 s (quadros 0-119 e 600-719) saíram em 1080×1920, 120 quadros, sem ECANCELED nem aviso de áudio ausente. Aprovado pelo Matheus em 13/10/2026, sem registro de que ele ouviu cada arquivo. **LICENÇA NÃO REGISTRADA:** nome da faixa, link e licença ainda não informados; a faixa veio do Pixabay (informado pelo Matheus), o que não substitui o registro. Fora do Git: em casa ou num clone novo, o `PlanoAudioTeste` não acha a música (no Studio vira aviso; com `loop` o render pode travar até o timeout, leitura de código, não testado). **NÃO PROVADO:** volume em vídeo inteiro; inteligibilidade com música em vídeo completo; música com outro espectro; sincronia por frame; o efeito por `inicio` 0:20. O validador confere a lista `audio` desde o commit `4c11e1f` (checagem 11).
  - **Áudio, Fase 2 (validador, checagem 11), 13/10/2026, commit `4c11e1f`:** o `validar-plano.mjs` confere a lista `audio`: `id`, `tipo` (música ou efeito), `arquivo` (existe em `public/`, sem espaço nem acento, sem sair de `public/`), `volume` de 0 a 1, `framesEntrada`/`framesSaida` inteiros >= 0, e efeito com `inicio` **ou** `elemento` (que existe em `elementos`). Avisos: extensão fora de .mp3/.wav/.m4a/.ogg/.aac, mais de uma música, volume de música maior que 0,5. Opção `--public <pasta>` (usada pelos testes). `testar-validador.mjs`: 52/52 casos OK. **Não prova** som, volume de ouvido nem licença. Em outro PC, `planos/teste-audio.plano.json` dá ERRO enquanto `music/musica-teste.mp3` e `sfx/teste-bipe.wav` não estiverem em `public/` (arquivos fora do Git): é o comportamento esperado.
  - **Render completo do `PlanoCameraTeste` (37 s, 1137 quadros), 13/10/2026, WSL do trabalho:** sem `--frames`, `--concurrency=2`, `--props` só com `videoSrc` da cópia leve: 140 s, 23.263.469 bytes, 1080x1920, SAR 1:1, 1137 quadros (contagem real 1137), 30 fps, 37,9 s, áudio aac; 0 ocorrências de ECANCELED, Error e Could not no log; código de saída 1 com arquivo gerado (causa provável `explorer.exe`, não isolada). Quadros olhados pelo Claude Code em 1 s, 20 s, 28 s, 35 s, último, mais 6 s e 22 s. O Matheus respondeu: 'legal, aprovado; tudo o que foi mencionado foi aplicado'. A câmera é a sala vazia em loop.
  - **Código de saída 1:** todos os renders curtos de hoje saíram com código 1 mesmo com o arquivo gerado e o log limpo. Causa provável: o `explorer.exe` no fim do `~/render.sh`; **não isolada**. Conferir sempre o arquivo, não só o código.
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
- `naPalavra`/`ocorrencia` (Etapa 6): resolvedor implementado (`scripts/resolver-plano.mjs`); roda
  antes do validador e depende da transcrição por palavra (`videos/<nome>.palavras.json`) da Etapa 4.

## Branches

- **`main`** — branch principal. `main` local e `origin/main` estão ambas em `9432337` ("marca
  Etapas 3 e 6 como em andamento"), com 0 commits de diferença (conferido em 19/10/2026 com
  `git rev-list --count main..origin/main` e `origin/main..main`, ambos 0). Antes, a `main` local
  estava em `907de81`, 4 commits atrás de `origin/main` (`32cef76`, `02e24d6`, `4b69d4e`, `9432337`).
- **`noite-etapa6`** (atual) — para ver o estado, rode `git log --oneline
  origin/noite-etapa6..HEAD` (commits que ainda não foram pro GitHub). O reflog da ref remota
  (`git reflog show origin/noite-etapa6`) registra "update by push" em 02/10 e 05/10
  (11:25 e 18:25), ou seja, houve `git push` neste computador; os commits do histórico são de "JR EDICOES" (165)
  e de "Matheus Monteiro" (3, os mais recentes; conferido em 19/10/2026 com `git log --format=%an`), então **NÃO CONFIRMADO quem rodou cada push**. **Seta aprovada pelo Matheus no
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
- **`teste-trabalho`** — hoje existe só como `origin/teste-trabalho` (não há branch local, conferido em
  19/10/2026). Em 07/10/2026 tinha **0 commits** além de `origin/main` (conferido com
  `git rev-list --count origin/main..teste-trabalho` = 0). O último commit
  dela, `7c27eff` ("checagem de props obrigatórias ... no validar-plano.mjs"), já está dentro
  do `origin/main`.
- **`wip-trabalho-0930`** — hoje existe só como `origin/wip-trabalho-0930` (não há branch local,
  conferido em 19/10/2026); quando foi escrito, existia local e remota, com 3 commits além de
  `origin/main` (`bb77b90` CallToAction valores padrão em JS, `56796e7`
  restaura PersonagemImagem, `20193cb` WIP 30/09). O `CallToAction` dessa
  branch já foi trazido pro `main` por outro commit (`f3af6b9`, "Traz
  CallToAction completo de wip-trabalho-0930") — os 3 commits continuam
  listados como exclusivos porque não houve `git merge` entre as branches.

## Protocolo da primeira gravação real

Proposta, escrita a partir do uso real dos scripts (`scripts/preparar-video.mjs`, `scripts/cortar-silencio.mjs` e `scripts/validar-plano.mjs`). **Revisar na primeira gravação.** Não testada com gravação real.

1. Gravar no OBS a **tela limpa** (sem o JR na janelinha) e a **câmera em arquivo separado**, os dois a **30 fps**.
2. Preparar as cópias leves com `node scripts/preparar-video.mjs --tela <tela> --camera <camera>` (acrescentar `--camera-mic <arquivo>` só se houver o terceiro arquivo). Flags reais: `--altura-max` (padrão 1920), `--crf`, `--saida-dir`, `--dry-run`.
3. Cortar no modo de 2 arquivos: `node scripts/cortar-silencio.mjs --gerar --tela <tela> --camera <camera>`. O áudio da tela decide os cortes e a câmera recebe os mesmos. **Não sei ainda** se a entrada deve ser o original ou a cópia leve: decidir na primeira gravação.
4. Começar com `"deslocamentoCamera": 0` no plano. Se a câmera estiver atrasada ou adiantada, ajustar de olho em passos pequenos: positivo = câmera atrasada (o arquivo toca de mais à frente); negativo = câmera adiantada (espera).
5. Conferir o fps: no modo de 2 arquivos o `cortar-silencio.mjs` avisa com "⚠ ATENÇÃO" se tela e câmera tiverem fps diferente, ou se as durações diferirem em mais de 1 quadro. Se avisar, regravar com o mesmo fps antes de seguir.
6. Renderizar com `--props` apontando para a cópia leve (ex.: `--props='{"videoSrc":"videos/<nome>-leve-v1.mp4"}'`) e **conferir o arquivo gerado** (tamanho, quadros, áudio), não só o código de saída.
7. Problemas já conhecidos:
   - mais de ~2 junções de corte podem acumular 1 quadro de diferença entre tela e câmera (risco apontado no planejamento; não medido);
   - o render pode sair com código 1 por causa do `explorer.exe` no fim do `~/render.sh` (causa provável, não isolada); conferir o arquivo;
   - o vídeo original 2160×3872 não renderiza no WSL (ECANCELED): usar a cópia leve.

## Perguntas pendentes

Ver `docs/perguntas-pendentes.md` — decisões do Matheus, não técnicas:
1. Se há exigência de tempo mínimo em tela para o `AvisoCVM` (o texto oficial não é mais pendência: decisão de 13/10/2026).
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
