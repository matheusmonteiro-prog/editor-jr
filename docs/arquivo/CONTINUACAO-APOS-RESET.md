# Continuação após o reset do PC do trabalho

Escrito em 15/10/2026, no PC do **trabalho** (usuário `edica`, máquina `Pro_video`), antes de
formatar. Só está aqui o que foi conferido nesta data com arquivo ou comando. O resto está
marcado **NÃO CONFIRMADO**.

> Este arquivo **não foi commitado**. Uma cópia está em `BACKUP-RESET\LEIA-PRIMEIRO.md`.

---

## g) Ao abrir o Claude Code, rode primeiro

```
git branch --show-current
git status
git log --oneline -10
```

Depois leia o `CLAUDE.md`, o `ARQUITETURA.md` (seção "Status") e este arquivo.

---

## a) Etapas: status e prova

Fonte: `ARQUITETURA.md`, seção "Status" (linhas 3 a 15), conferido em 15/10/2026.

| Etapa | Status no ARQUITETURA.md | Prova conferida hoje |
|---|---|---|
| 0 Infraestrutura | `[x]` | Node v24.21.0, npm 11.19.0, Git 2.55.0, remoto `git@github.com:matheusmonteiro-prog/editor-jr.git` (comandos rodados). Render só no WSL do trabalho. |
| 1 Organizar a casa | `[x]` | Só o registro no ARQUITETURA.md. Prova própria **NÃO CONFIRMADA** hoje. |
| 2 Cortes, gancho, limpeza de voz | `[x]` (23/09/2026) | Só o registro. Prova própria **NÃO CONFIRMADA** hoje. |
| 3 Montagem sobre vídeo real | `[x]` em **3a (código)**, 13/10/2026; **3b aberta** | `docs/criterios-fechamento.md` §Etapa 3. Render `out/camera-completo.mp4` (23.263.469 bytes) existe no WSL e no backup, com hash conferido. |
| 4 Legendas automáticas | `[x]` em **4a**, 14/10/2026; **4b aberta** | Commits `ad2ab13` e `73fc8c0` ("etapa 4 (4a) fechada"), ambos no GitHub. Quadros `out/legenda-teste-0926-f060/f150/f210.png` no WSL e no backup. |
| 5 Identidade visual | `[ ]` | — |
| 6 Leitor de prompt | `[x]` em **6a**, 09/10/2026 | `docs/criterios-fechamento.md` 6.1 a 6.6. Render `out/0926-real-v1.mp4` (22.858.826 bytes) no WSL e no backup. |
| 7 Interface própria | `[ ]` | — |
| 8 Exportação e entrega | `[ ]` | `scripts/render-final.mjs` existe, mas a etapa não começou. |

### Contradições encontradas entre os documentos (não corrigidas)

1. **Etapa 4: `docs/estado-atual.md` está atrasado.** Ele diz "Etapas 4, 5, 7, 8 estão `[ ]`"
   (linha 11), mas o `ARQUITETURA.md` marca a Etapa 4 como `[x]` (4a fechada em 14/10/2026).
2. **Etapa 4: `docs/criterios-fechamento.md` se contradiz.**
   - O título da seção diz "RASCUNHO, a aprovar pelo Matheus" e "Nada abaixo foi aprovado
     ainda" (linhas 118 a 125), e a linha 8 diz "Etapa 4 com critério em rascunho".
   - Mas na mesma tabela os itens 4.1 e 4.5 dizem "aprovado pelo Matheus em 14/10/2026".
   - Os itens 4.2 e 4.3 dizem "Falta plano real e ver no Studio", mesmo com a 4a fechada.
3. **A numeração da Etapa 4 pula o 4.4.** A tabela vai de 4.3 para 4.5. Se o 4.4 existiu e foi
   tirado: **NÃO CONFIRMADO**.
4. **`CLAUDE.md`, seção "Protocolo de etapas"**, cita só a Etapa 6 (6a) e a Etapa 3 (3a). Não
   menciona a Etapa 4 (4a) fechada em 14/10/2026.
5. **`docs/estado-atual.md`, seção de branches, está atrasado:**
   - Diz que `teste-trabalho` "existe só local" (linha 317). Hoje ela está no GitHub, no mesmo
     hash `7c27eff`.
   - Diz "4 commits à frente do GitHub, sem push" (linha 305). Hoje a `noite-etapa6` local e a
     do GitHub são iguais (`0e1b0c5`).
6. **`docs/criterios-fechamento.md`, linhas 106 a 109**, dizem "neste PC de casa", mas o texto
   foi lido no PC do trabalho. É uma frase que não diz de qual sessão veio.

---

## b) Onde paramos

- **Branch atual:** `noite-etapa6`.
- **Último commit:** `0e1b0c5`, 14/10/2026 18:08, "lab: componente JurosCompostosLab (ainda não
  ligado ao Root)". Adiciona só `src/components/laboratorio/JurosCompostosLab.tsx` (331 linhas).
  Está no GitHub.
- **Em andamento:**
  - O componente de laboratório `JurosCompostosLab` existe, mas **não está ligado ao `Root.tsx`**.
  - A ligação ao `Root.tsx` parece estar no `stash@{0}` ("laboratorio-juros", só muda
    `src/Root.tsx`), salvo na branch `backup-stash-0`.
  - O arquivo não rastreado `rccomponentslaboratorio` (2 KB) é um diff do `src/Root.tsx`.
    Provavelmente é a mesma ligação, salva com nome errado. **NÃO CONFIRMADO.**
  - O `stash@{1}` ("edicoes-studio-nao-commitadas") guarda arrastos feitos no Studio em
    `AvisoCVM.tsx` e `GraficoCrescimento.tsx`. Pela regra "não clicar nem arrastar", **não é
    para aplicar** sem decisão do Matheus.
- **Não rastreados no repositório:** `planos/teste-roteiro-legenda.plano.json`,
  `planos/teste-roteiro-legenda.resolvido.json` e `rccomponentslaboratorio`. Os três estão no
  backup, em `projeto-fora-do-git`.
- O que o Matheus pretendia fazer em seguida: **NÃO CONFIRMADO**.

---

## c) Pendências abertas

**3b, material real** (`docs/criterios-fechamento.md`):
- 3.1: par real tela + câmera com o JR, sincronia, alinhamento sem palma.
- 3.7: tempo de render com vídeo de 10 a 20 min.
- 3.9: vídeos verticais de referência (o Matheus vai trazer).
- Também da Etapa 3:
  - Licença da música `musica-teste.mp3` **não registrada** (nome, link e licença).
  - Volume 0,3 dos efeitos é provisório.

**4b, material real:**
- 4b.1: vídeo de 10 a 20 min transcrito, com o tempo medido.
- 4b.2: termos financeiros reais conferidos no texto.
- 4b.3: `--prompt` com áudio que cite esses termos.
- 4b.4: se roda em casa (o `main.exe` pode ser bloqueado pelo Controle inteligente de aplicativos).
- 4b.5: uso de GPU.
- 4b.6: glossário em vídeo real.
- Também da Etapa 4:
  - Cor do texto da `LegendaAnimada`: branco ou creme `#F5F0E6`, **a definir**.

**Decisões do Matheus em aberto** (`docs/perguntas-pendentes.md`):
1. Tempo mínimo em tela do `AvisoCVM` (padrão atual 150 quadros = 5 s).
2. Envio automático ao Google Drive (Etapa 8): qual conector/API e a autorização da conta.
3. Campo `"fps"` do plano: formalizar ou remover (hoje nada lê esse campo).

**Outras:**
- O checklist de 7 pontos do 6.5 não foi conferido item a item.
- O original 2160×3872 não renderiza no WSL (ECANCELED). A causa não foi confirmada.

---

## d) Regras do projeto (resumo do `CLAUDE.md`)

- Explicar em português do Brasil, simples, com exemplo prático. O Matheus é iniciante.
- **Antes de qualquer tarefa, ler o `ARQUITETURA.md`.** Trabalhar só na etapa atual e não
  avançar sem aprovação.
- **Código:** testes e ajustes pequenos seguem sem pedir validação. O Matheus valida os marcos.
- **Documentação:** pode editar direto e mostrar o resumo antes do commit.
- **Só com o nome da ação escrito pelo Matheus:** push, merge, apagar (qualquer arquivo),
  publicar, `git stash pop`, `git restore`, `git reset`.
- Commit só de arquivos nomeados. **Nunca** usar `git add .` nem `git add -A`.
- **Proibido:**
  - vídeo no Git;
  - recriar o projeto Remotion ou rodar `create-video`;
  - apagar a pasta `.git`;
  - `npm audit fix --force`;
  - tratar warning como erro sem analisar.
- Pedido marcado "só leitura" = não editar nada. Não fazer nada além do pedido: o que achar,
  listar no relatório.
- Nunca escrever "validado" sem o Matheus ter visto no Studio.
- Componentes: um por arquivo em `src/components/`, schema zod, `spring()`/`interpolate()`,
  fundo transparente.
- Nomes de arquivo sem espaço.
- **Relatório:**
  1. O que mudou
  2. Prova
  3. O que supus sem confirmar
  4. Estado do Git
  5. Linha "Modelo recomendado para o próximo passo".
- Ao fim de cada sessão, atualizar o `docs/estado-atual.md`.

---

## e) Reinstalação, em ordem (versões conferidas em 15/10/2026)

1. Git **2.55.0** (`winget install Git.Git`)
2. Node.js **24.21.0** (npm 11.19.0)
3. VS Code **1.142.0** + extensões `anthropic.claude-code` e `ms-ceintl.vscode-language-pack-pt-br`
4. FFmpeg **9.0.2** (`winget install Gyan.FFmpeg`)
5. Fontes **Anton** e **Ubuntu Sans Mono** (instalar a partir de `BACKUP-RESET\fontes`)
6. OBS Studio **32.2.2** + plugin Source Record 0.4.8 para **Windows** (instalador em
   `BACKUP-RESET\marca-e-roteiros\Downloads-extras`). Depois, restaurar `%APPDATA%\obs-studio`.
7. WSL 2 + Ubuntu. Dentro do Linux:
   - Node **24.21.0** em `~/.local/node`
   - ffmpeg (apt, era **8.0.1**)
   - rsync
   - `~/render.sh`
   - a linha `export PATH="$HOME/.local/node/bin:$PATH"` no `~/.bashrc`
8. Chave SSH **nova** (`ssh-keygen -t ed25519`) cadastrada no GitHub. A antiga não foi copiada.
9. `git clone git@github.com:matheusmonteiro-prog/editor-jr.git` em `C:\Users\edica\editor-jr`
   + `npm install`.
10. Whisper.cpp **1.6.0** em `C:\whisper-teste\whisper.cpp` (copiar de `BACKUP-RESET\whisper`).
11. CapCut, RODE Central, OneDrive (login).
12. Claude Code (login).

---

## f) Como restaurar (onde ficou cada coisa no `BACKUP-RESET`)

| Pasta | O que tem | Para onde volta |
|---|---|---|
| `git\editor-jr-todas-branches.bundle` | Todas as branches, inclusive `backup-stash-0/1` (verificado: "is okay") | Plano B se o GitHub falhar: `git clone editor-jr-todas-branches.bundle editor-jr` |
| `git\stash-0.patch`, `stash-1.patch` | Os 2 stashes em texto | Também estão nas branches `backup-stash-0` (laboratorio-juros) e `backup-stash-1` (edicoes-studio) no GitHub |
| `patches-soltos\` | `grafico-disco.patch`, `calltoaction-solto.patch`, `editor-jr-edicoes-studio.patch` | Só aplicar com ordem do Matheus (`git apply --check` antes) |
| `codigo-completo\editor-jr` | Repositório inteiro, com `.git`, sem `node_modules` | Referência; o normal é clonar do GitHub |
| `projeto-fora-do-git\` | `config.local.json`, `rccomponentslaboratorio`, `planos\teste-roteiro-legenda.*`, `videos\`, `public\videos\`, `public\music\`, `public\sfx\`, `out\` | Mesmas pastas dentro de `C:\Users\edica\editor-jr\` |
| `wsl\` | `render.sh`, `diag-verbose.log`, `editor-jr\out`, `public\videos`, `videos` (inclui `0926.preparo.json` e `2026-09-25 13-42-46.preparo.json`, que só existiam no Linux) | `~/` e `~/editor-jr/` no WSL |
| `wsl-home\` | Scripts `render-*.sh`, `diag*.sh`, logs, quadros, `.bashrc`, `.profile` | `~/` no WSL |
| `claude\` | `projects\c--Users-edica-editor-jr` (histórico + memória), `skills\synced`, `settings.json`, `editor-jr-.claude\settings.local.json` | `C:\Users\edica\.claude\…` e `editor-jr\.claude\` |
| `whisper\` | `main.exe`, DLLs e `ggml-small.bin` (sem o `ggml-base.bin`) | `C:\whisper-teste\whisper.cpp\` |
| `obs\obs-studio\` | Pasta inteira (cenas "Sem nome", perfil "Sem nome", plugin_config) | `%APPDATA%\obs-studio\` |
| `gravacoes\` | `SOM TELA`, `CAMERA GRAV`, `PASTA_Gravacoes`, `0926-final.mp4` | `C:\Users\edica\Videos\` |
| `marca-e-roteiros\` | Design System, logos, banners, mapas, roteiros `.docx`, vídeos de Downloads | Onde preferir |
| `fontes\`, `capcut\`, `configs\` | Fontes, projetos CapCut, settings do Windows Terminal e do VS Code | Instalar / `%LOCALAPPDATA%\CapCut\User Data\Projects\` |

**Aviso: nomes que diferem só por maiúscula/minúscula.** O Windows não diferencia `diag-A.log`
de `diag-a.log`. No `wsl-home\` os originais estão como:
- `diag-A.maiuscula.log` e `diag-a.minuscula.log`
- `diag-B.maiuscula.log` e `diag-b.minuscula.log`

Os arquivos `diag-A.log` e `diag-B.log` dessa pasta têm o conteúdo de `diag-a` e `diag-b`:
ignorar. Ao devolver ao Linux, renomear para os nomes originais.

**Não estão no backup, de propósito:**
- `.claude\.credentials.json` (refazer login)
- `.ssh\id_ed25519` (gerar chave nova)
- `node_modules` (`npm install`)

**`patches-soltos\` (copiados em 15/10/2026, hash conferido):**
- `grafico-disco.patch` e `calltoaction-solto.patch`: estavam soltos em `C:\Users\edica\`, fora
  do Git. O conteúdo de cada um **NÃO CONFIRMADO** (não abri).
- `editor-jr-edicoes-studio.patch`: idêntico ao `stash@{1}` (= branch `backup-stash-1`).

**Histórico do Claude** (`claude\projects\c--Users-edica-editor-jr`): recopiado em 15/10/2026,
57 arquivos, 57 iguais byte a byte. A sessão em andamento continua gravando no `.jsonl` dela
depois dessa cópia, então o fim desta conversa pode não estar no backup.

---

## Estado do Git conferido em 15/10/2026

- `git log --branches --not --remotes`: vazio (nada local fora do GitHub).
- Todas as branches locais têm o mesmo hash do GitHub:
  - `backup-stash-0` 7e265db
  - `backup-stash-1` 1f1488c
  - `etapa4-legendas` 1f2553a
  - `noite-etapa6` 0e1b0c5
  - `seta-nova` e71b51c
  - `teste-trabalho` 7c27eff
  - `wip-trabalho-0930` bb77b90
- Exceção: `main` local `907de81` está **atrás** do GitHub `9432337`. É ancestral, então não há
  perda. Atualizar com `git pull` na `main` quando o Matheus mandar.
- No GitHub também existem `teste-whisper` e `testes-ideias`.
