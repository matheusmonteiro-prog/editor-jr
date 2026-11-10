> **Fotos antigas (02/10 a 16/10/2026) foram para `docs/arquivo/estado-atual-ate-16-10.md`. Vale o retrato mais novo abaixo.**

## Status das etapas em 10/11/2026 (decisões do Matheus)

Só a marca de cada etapa; vale sobre as listas "Etapas" dos retratos mais antigos abaixo, que ficam como histórico. "Decisão do Matheus" não é "validado": nenhuma prova nova de comando entrou aqui.
- **Etapa 3:** 3a fechada (13/10/2026). **3b aberta**, depende de gravação nova com o JR (tela + câmera em arquivos separados). Não é etapa de código.
- **Etapa 4:** 4a fechada (14/10/2026). **4b aguarda confirmação do Matheus**: termos financeiros e glossário em vídeo real. Não está fechada.
- **Etapa 5:** **dispensada por decisão do Matheus em 10/11/2026.** Motivo: o kit visual v3 atende; a cor do método fica `#1DD41E` por decisão dele; a proibição de "sinal de compra" foi desconsiderada por ele, porque no canal o termo é narrativo. Não é bloqueio.
- **Etapa 6:** 6a fechada (09/10/2026). **6b não iniciada**; só começa por ordem do Matheus.
- **Etapa 7:** futuro, fora do escopo atual.
- **Etapa 8:** parcial. Fechar depois do primeiro vídeo real. Pendências: resolução 2160×3872 (exige `--props` em `Root.tsx`), `render-final.mjs` sem `--props` e sem `--concurrency`, sem critério escrito em `docs/criterios-fechamento.md`.

## Atualização de 07/11/2026: transcrição mais rápida (`scripts/transcrever.mjs`)

- O script usava só 4 dos 12 núcleos do PC. Agora usa 10 (deixa 2 livres para o Windows). Medido em 180 s da voz do JR: **155 s antes, 86 s agora (1,8x mais rápido)**, com as 471 palavras, o texto e os tempos **idênticos** nos dois.
- Revisão (Opus, 07/11): a mudança ficou mínima. O script continua usando o `transcribe()` do pacote oficial e só passa `-t` (núcleos) por `additionalArgs`. Regra: núcleos do PC menos 2, nunca menos de 4 (num PC de 4 ou 6 núcleos não fica mais lento que antes). Conferido de novo pelo script de verdade: 84 s para 180 s, idêntico ao antigo. Com o PC ocupado (navegador etc.) uma rodada levou 144 s: a velocidade depende do que mais está aberto.
- Testado e **descartado**: dividir o áudio em pedaços e rodar 2 ou 3 whispers juntos. Ganhou só ~10% e **mudou 5-7% das palavras** e deslocou tempos em até 1,4 s. O código disso foi retirado.
- Não testado: faster-whisper (outro motor, precisa instalar e baixar modelo), whisper.cpp mais novo, modelo menor. Só com o ok do Matheus.
- Aguardando o Matheus: apagar `scripts/zz-bench-tmp.mjs` (não funciona mais), `videos/zz-teste-transcricao.palavras.*` e `out/zz-teste-transcricao.16k*.wav` (arquivos de teste desta rodada). Nada commitado.

## Atualização de 06/11/2026 (tarde): testes de roupa, filtro, movimento e voz

- O Matheus aprovou o v3b (salvo por ele como `out/TESTE 2.mp4`). A-002 a A-016 foram para "Feitos".
- Pedidos novos A-017 a A-020 (ver `docs/alteracoes.md`). Amostras em `out/testes-06-11/` (fora do Git), feitas sobre os primeiros 8 s.
- Scripts de teste ainda no rascunho da sessão (não estão em `scripts/`): filtro de pele, segurar cabeça, voz calma. Se aprovados, entram em `scripts/`.
- Instalado no `.vc-audio`: `opencv-python-headless` e `praat-parselmouth` (locais, código aberto).
- Roupa (A-017): travada, falta o ok do JR, o login na Higgsfield e a foto da camisa.

## Atualização de 06/11/2026: render do Video2810V3 concluído

- `out/2026-10-28-final-v3b.mp4`: 1920×1080, 30 fps, 251,6 s, H.264 + AAC, 188 MB, −14,0 LUFS, pico −1,1 dBTP. Inclui os ajustes A-001 a A-016, a voz da amostra 8 e a trilha baixa.
- Fora do Git (pasta `out/`). O `out/2026-10-28-final-v3.mp4` antigo foi mantido.
- Como renderizei: as 2 primeiras tentativas (6 processos) caíram no quadro ~1345 com código 4 e sem erro claro; a 3ª, com `--concurrency=2` e pasta pública pequena (`--public-dir`), terminou sem falha. Suspeita (não confirmada): falta de memória.
- Conferi 12 quadros (0:02 a 4:09) numa folha de contato: impactos, trajetória, janelas escuras e claras, encerramento. **O Matheus ainda não assistiu ao arquivo.** Nada pode ser dito "validado" até ele ver.

## Retrato de 04/11/2026, fim do dia (ajustes A-001 a A-013)

Nada commitado. Pedidos e estado de cada um em `docs/alteracoes.md`; regras novas já no kit.
- **Áudio:** voz da amostra 8 (WPE + tom, −14 LUFS) e trilha "Sertão Caboclo" ~23 dB abaixo. Eco de sala segue como limite (guia 5d). Ferramentas de IA de áudio guardadas (skill `tratar-audio`).
- **Kit:** sem logo; janela com câmera inteira e borda fina; fundo explicativo em movimento; tema claro (bege); faixa do impacto leve + véu sobre texto antigo; fundo da câmera com desfoque leve (`CameraJR`); ponto nas descrições; trajetória da história (`LinhaTrajetoria`); regras de acabamento das transições (4.12).
- **Video2810V3:** todos os ajustes aplicados; conferido por mim em quadros renderizados (`remotion still`). **O Matheus ainda não viu no Studio.** Nenhum render final novo.
- Fora do Git: `public/music/sertao-caboclo-quincas-moreira.mp3`, `public/videos/2026-10-28-voz-wpe8-completa.wav`, `.vc-audio/` (210 MB) e `.vc-enhance/` (~2 GB).

## Retrato de 04/11/2026 (organização da casa)

Branch `video-apresentacao`, HEAD `dfef830`. **Nada commitado nesta sessão**: o Matheus pediu o Git por último.

**Etapas:** sem mudança de marca (Etapa 5 segue em alinhamento). O kit visual v3 foi aprovado no geral ("ficou muito bom"), com ajustes ainda por vir.

**Feito nesta sessão (sem commit):**
- Kit visual v3: `docs/kit-visual-video.md` reescrito; 9 peças novas em `src/components/v2/` (`kitV3.tsx`, `PainelDiagonal`, `TransicaoJanela`, `ImpactoKit`, `AberturaCapitulo`, `ComparacaoNumeros`, `Pauta`, `DestaqueSolto`, `ArrobaCanal`, `FundoExplicativo`), catálogo no Studio e demo `KitV3Demo`.
- `src/Video2810V3.tsx`: vídeo de 28/10 reeditado a partir do render `2026-10-28-final-v1.mp4`. Render em `out/2026-10-28-final-v3.mp4` (251,6 s). **O Matheus ainda não conferiu no Studio**; achados C-001 e C-002 em `docs/alteracoes.md`.
- Teste da troca de camisa (recolorir por segmentação em CPU): funcionou só na cor, ficou de lado. Arquivos em `_para-apagar/`.
- Organização: relatórios antigos em `docs/arquivo/` (com `README.md`); fotos antigas deste arquivo em `docs/arquivo/estado-atual-ate-16-10.md`; mapa rápido no topo do catálogo; `docs/guia-edicao.md` (fluxo completo); `docs/alteracoes.md` (painel de pedidos); 5 skills novas em `.claude/skills/` (`editar-video`, `pedido-de-ajustes`, `ajustar-kit-visual`, `renderizar`, `gerar-midia-ia`); cores da skill `editor-jr` apontando para o `kitV3.tsx`; "Mapa da casa" no `CLAUDE.md`.
- `_para-apagar/` (~1,6 GB, fora do Git): itens inúteis movidos, **não apagados**. Lista em `_para-apagar/LEIA.md`.

**Prova (04/11):** `npx tsc --noEmit` sem erro; `scripts/testar-validador.mjs` 72/72; `npx remotion compositions` lista as 49 composições, incluindo `Video2810V3` (7548 quadros) e `KitV3Demo`.

**Próximo passo:** o Matheus confere o `Video2810V3` no Studio e manda ajustes (vão para `docs/alteracoes.md`). Depois, commit só de arquivos nomeados.

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
- Rodadas 1 a 8 registradas em `docs/arquivo/pr-video-apresentacao.md`. **O código vai até a rodada 9** (47 menções em `src/`), e nenhum doc a registra.
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
- `docs/arquivo/auditoria-contradicoes.md` ("v3 no remoto, v2 local"; verde `#1DD41E`) foi escrito antes dessa alteração local. Qual vale: decisão do Matheus.
- Merge de teste calculado em 03/11/2026 (`merge-tree`, antes dos commits `d4c6390`, `1a4b28e` e `168aaad`): conflitos em `docs/catalogo-componentes.md` e `src/PlanoComposicao.tsx`.

**Configuração**
- `bbe14d7`: `dotenv` 17.3.1 como dependência direta; `.gitignore` libera `videos/0926.cortes.json` e ignora `public/videos/` e `backup-videos/`.
- `79e521c`: versiona `videos/0926.cortes.json`, importado pelo `Root.tsx`. Causa do erro em clone novo removida; **clone novo não testado**.
- `d4c6390`: `docs/higgsfield.md` e `docs/arquivo/auditoria-contradicoes.md`. `1a4b28e`: caminhos dos PCs. `168aaad`: `.gitattributes` com `*.sh text eol=lf`.

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
- Registrar a rodada 9 em `docs/arquivo/pr-video-apresentacao.md`.
- `ARQUITETURA.md:48` e `:118`; `criterios-fechamento.md:100`; "34 componentes" em `docs/arquivo/auditoria-contradicoes.md` (são 33 `.tsx` + `marca.ts`).
- Terminar o M4.
- Renomear `aviso-camera-deslocamento` e arquivos com espaço ou extensão dupla (`EM BREVE.mp3`, `musica-fundo.mp3.mp3`, `logo-chapeu.png.png`, `teste-real-camera.mp4.mp4`), se ele aprovar.

### Decisões do Matheus nesta rodada (03/11/2026)
- Este PC é o do trabalho. O caminho do PC de casa fica a confirmar.
- `dotenv` como dependência direta; `videos/0926.cortes.json` versionado; `public/videos/` e `backup-videos/` ignorados.
- `~/render.sh` com nvm e `--no-install`, com cópia versionada e `.gitattributes`.
- `CLAUDE.md` não muda nesta rodada.
- Kit visual, vídeos e merge de `kit-visual-video` não foram mexidos.

---

