# Mapa de entregas: o que o editor-jr entrega e qual "cérebro" cuida de cada coisa

Criado em 14/11/2026, a pedido do Matheus ("se tem cérebro para todas [...] isso precisa ser deixado claro?").
**Cérebro = skill** em `.claude/skills/<nome>/`. Ela entra sozinha pelo assunto (o Claude lê a descrição de
cada uma); esta página é o **mapa inteiro num lugar só**, para o Matheus saber o que pode pedir e o Claude não
esquecer nenhum recurso.

## 1. O que podemos entregar

| Entrega | Cérebro (skill) | Estado | O que falta |
|---|---|---|---|
| **Vídeo longo 16:9** (câmera + tela explicativa, painéis, impactos, capítulos) | `editar-video` (+ `docs/kit-visual-video.md`, `docs/catalogo-componentes.md`) | Fluxo pronto; `Video2810V3` em teste | O Matheus ver no Studio e aprovar um vídeo final |
| **Cortes curtos 9:16** (papel explicativo, Cartografia viva) | `cortes-curtos` (+ kit 4.16 e 4.17) | Dois modelos aprovados em 12/11 | Lote de 5 cortes do 28/10 e render (Etapa 9) |
| **Voz tratada** | `tratar-audio` | Pronto; preset aprovado | Eco de sala só se resolve na gravação |
| **Rosto natural** (filtro que mede o rosto do dia) | regra dentro de `editar-video` + `scripts/medir-rosto.py` e `filtro-rosto-natural.py` | Pronto no 16:9 (A-021) | `rastrear-rosto.py` para vertical |
| **Cena 3D** (fazenda em camadas, diorama, gráfico de ações) | `cenas-3d` (+ kit 4.18, `docs/guia-3d.md`) | Aprovado em 13/11 | Versão vertical; luz do tema claro |
| **Recorte de fundo** (texto e linha atrás do JR) | `recorte-fundo` (+ kit 4.19, `docs/guia-recorte-fundo.md`) | Teste de 10 s aprovado em 13/11 | Versão vertical; uso num vídeo real |
| **Mídia com IA** (cenário, b-roll, cena calma; Higgsfield) | `gerar-midia-ia` (+ `docs/higgsfield/guia.md`) | Pronto; **rosto do JR nunca por IA** | — |
| **Nota de impacto e reação do público** | `engajamento` (+ `docs/engajamento/`) | Criado em 14/11; pesquisa semanal ligada | Números reais do canal para aprender |
| **Lista de ajustes** ("no 1:30 muda...") | `pedido-de-ajustes` (+ `docs/alteracoes.md`) | Pronto | — |
| **Mudar regra visual para todos** (cor, fonte, posição) | `ajustar-kit-visual` | Pronto | — |
| **Peça nova do catálogo** | `editor-jr` | Pronto | — |
| **Render final do MP4** | `renderizar` | Pronto | Só com o "pode renderizar" do Matheus |
| **Custo por vídeo aprovado** | `docs/controle-de-custos.md` (sem skill; o Claude consulta e atualiza) | Criado em 14/11 | Matheus informar assinatura e horas; 1º vídeo aprovado |
| Pedido de edição confuso; legenda e enquadramento; erro repetido | `meia-briefing-de-edicao`, `meia-legendas-e-enquadramento`, `meia-revisao-economia` (bônus do curso) | Instaladas; **as regras do projeto vencem** | — |

## 2. A ordem em que os cérebros entram (um vídeo, do começo ao fim)

1. **Roteiro e temas:** olhar a transcrição e sugerir, **sem o Matheus pedir**, onde cabe 3D (`cenas-3d`), recorte
   (`recorte-fundo`), cena de IA (`gerar-midia-ia`) e qual abertura tem o melhor gancho (`engajamento`).
2. **Montar:** `editar-video` (voz e rosto tratados sempre; kit v3; só peças do catálogo).
3. **Conferir** quadros e Studio; `pedido-de-ajustes` registra o que mudou.
4. **Nota de impacto** (`engajamento`) antes de mostrar: uma linha com a nota e a mudança mais barata.
5. **Matheus aprova no Studio** → `renderizar` → anotar custo e vídeo aprovado em `docs/controle-de-custos.md`.
6. **7 dias depois de postar:** o Matheus traz os números do Studio e o `engajamento` aprende.

## 3. Regras que valem entre os cérebros
- **Ponto alto compartilhado:** 3D e recorte dividem o limite (no máximo 1 dos dois a cada ~2 min no longo e 1
  por corte). Nunca dentro do papel nem da Cartografia: é trecho próprio.
- **Dinheiro:** gastar crédito de IA = pedir antes e anotar depois (`controle-de-custos.md`).
- **Rosto do JR nunca é gerado por IA.** Recorte e filtro são locais.
- **Confiança vence engajamento:** sem promessa de ganho, sem número sem fonte, `AvisoCVM` onde já é exigido.
- **Nunca "validado" sem o Matheus ter visto no Studio.**

## 4. Buracos encontrados na análise de 14/11/2026

| # | Buraco | O que fazer |
|---|---|---|
| 1 | `editar-video` só citava o 3D; **não citava recorte, engajamento, mídia com IA nem cortes** | **Corrigido hoje** (seção "Outros cérebros" na skill) |
| 2 | `cortes-curtos` citava o 3D mas **não o recorte nem o engajamento** | **Corrigido hoje** |
| 3 | **Roteiro e temas não têm cérebro.** O plano de 04/11 (transcrição → temas → ideias → prompt final) só existe na memória e nunca virou skill; `docs/prompt-roteiro.md` ainda descreve o caminho antigo (JSON). É justo o passo onde os outros cérebros deveriam ser chamados | **Proposto:** criar a skill `roteiro-temas`, a primeira de todas na ordem do fluxo |
| 4 | **Título, capa e descrição não têm cérebro**, e o `engajamento` considera a capa decisiva (CTR) | **Proposto:** skill `titulo-capa`, com a mesma régua e o gancho |
| 5 | **Nada vertical** para 3D, recorte e rastreio do rosto: os cortes 9:16 não podem usar os recursos mais fortes | Fazer antes do 1º corte com 3D ou recorte |
| 6 | Os cérebros **ainda não foram usados num vídeo de verdade**; as regras são de teste | Usar no próximo vídeo e ajustar |
| 7 | A skill **`cortes-curtos` não está no Git**: o `.gitignore` ignora a pasta (ela não está na lista de exceções, ao contrário das outras skills próprias). Se o computador falhar, ela se perde, e a edição de hoje nela não entra em commit | Uma linha no `.gitignore` resolve; **aguarda o ok do Matheus** |
