# Guia de edição: do roteiro ao vídeo publicado (editor-jr)

Escrito em 04/11/2026. Junta o fluxo de um canal profissional de YouTube com o que já foi
construído e decidido aqui. Onde é **prática comum do mercado** e não regra do projeto, está
escrito "recomendação". Os detalhes visuais ficam no `docs/kit-visual-video.md`; este guia diz
**em que ordem** as coisas acontecem e **quem faz o quê**.

---

## Visão geral

```
1 Roteiro → 2 Gravação → 3 Cortes → 4 Montagem (kit v3) → 5 Legenda e áudio
→ 6 Revisão no Studio → 7 Ajustes → 8 Render → 9 Entrega e publicação
```

| Fase | Quem decide | O que sai | Onde fica |
|---|---|---|---|
| 1 Roteiro | Matheus e JR | Gancho, pauta, pontos de impacto | Prompt-roteiro (`docs/prompt-roteiro.md`) |
| 2 Gravação | JR | Vídeo **limpo**, sem nada gravado por cima | `videos/` (fora do Git) |
| 3 Cortes | Claude, Matheus confere | Silêncios e erros fora, `*.cortes.json` | `videos/`, `scripts/cortar-silencio.mjs` |
| 4 Montagem | Claude | Composição do vídeo com as peças do kit v3 | `src/VideoXXXX.tsx` + `src/Root.tsx` |
| 5 Legenda e áudio | Claude | Legenda, trilha e voz em −14 LUFS | `LegendaAnimada`, seção 13 do kit |
| 6 Revisão | **Matheus, no Studio** | Lista de ajustes | `docs/alteracoes.md` |
| 7 Ajustes | Claude | Pedidos em "conferir no Studio" | `docs/alteracoes.md` |
| 8 Render | Claude, **só depois do "pode renderizar"** | `.mp4` final | `out/` (fora do Git) |
| 9 Entrega | Matheus | Título, thumb, capítulos, cortes verticais | Fora do projeto |

**Em paralelo, desde a fase 2 (padrão de 12/11/2026):** assim que a voz está tratada e transcrita, os
5 a 6 cortes curtos são montados a partir da gravação tratada, sem esperar o longo. Fluxo completo em
`docs/cortes/fluxo-padrao.md`; receita na skill `cortes-curtos`.

---

## 1. Roteiro (antes de gravar)

Recomendação de mercado que o kit já adota:
- **Gancho nos primeiros segundos:** a promessa do vídeo, sem prometer ganho (kit 4.8). O espectador
  decide cedo se fica.
- **Pauta logo depois do gancho:** "hoje são DUAS PARTES..." (kit 4.14). Ajuda quem chega a saber
  o caminho.
- **Capítulos:** cada parte da pauta vira uma abertura de capítulo (kit 4.5) e um capítulo na
  descrição do YouTube.
- **Marcar no roteiro onde a fala "bate":** essas viram palavras de impacto (no máximo 2 por minuto).
- **Fecho:** CTA e aviso legal (kit 4.9, texto ainda a decidir com o JR).

## 2. Gravação

O que mais facilita a edição:
- **Guardar a gravação limpa.** O vídeo de 28/10 só pôde ser reeditado com remendos (janelinha
  com recorte, faixa escura) porque a fonte já tinha textos antigos gravados por cima.
- Câmera parada, rosto no terço de cima, espaço livre de um lado (o painel diagonal entra lá).
- Recomendação: microfone de lapela, ambiente sem eco, 10 s de silêncio no começo (ajuda a
  limpar o ruído).
- Roupa: escolher na gravação. Trocar a roupa por IA depois não fica fiel neste PC (teste de 04/11).
- Formatos de sessão (só câmera, ou tela + câmera): `ARQUITETURA.md`, seção 3a.

## 3. Cortes

- Corte de silêncio e limpeza de voz: `ARQUITETURA.md`, Etapa 2.
- **Tempos dos pedidos:** quando o Matheus disser "no 1:30", é o tempo do vídeo que ele está vendo
  no Studio (linha final). Tempos de prompt-roteiro são da gravação original (regra da seção 3).
- Recomendação: ritmo de vídeo-aula com uma mudança visual a cada 5 a 10 s (zoom, painel,
  destaque). Mudança demais cansa: respeitar os limites do kit (seção 6.1).

## 4. Montagem com o kit v3

- Peças: só as do "Mapa rápido" em `docs/catalogo-componentes.md`.
- Dois modos do JR (kit, seção 1): **normal** (explica: painel diagonal ou janelinha com o fundo
  explicativo) e **explosão** (palavra de impacto, zoom seco).
- Molde: `src/Video2810V3.tsx` (tempos em segundos, listas de trechos, câmera de base).
- Conteúdo: o método é mostrado, nunca prometido. Sem número de ganho e sem "sinal de compra".
- **Trechos explicativos (12/11/2026):** onde o JR explica algo que fica melhor desenhado (15 a 60 s),
  entra um dos dois modelos aprovados: **papel** (conceito, campo, "como funciona"; kit 4.16) ou
  **Cartografia viva** (Bolsa, ações, crescimento, comparação; kit 4.17). Os dois podem estar no mesmo
  vídeo; a Cartografia usa um ambiente só por vídeo. Recomendação: não mais que um a cada 2 ou 3 min.
  Peça `TrechoExplicativo` (a fazer; até lá, o papel 16:9 existe como `Explicativo-<id>-16x9`).
  Como funciona: `docs/cortes/fluxo-padrao.md`, Parte B.

## 5. Legenda e áudio

- Legenda: `LegendaAnimada` (Etapa 4). Fora da área do rosto e das mãos.
- Áudio: voz em −14 LUFS e pico ≤ −1 dBTP. Trilha bem abaixo da voz, só com licença para o
  YouTube (kit, seção 13).

## 5b. Tratamento da voz e eco (04/11/2026)

**Tom e volume (resolvido por código):** `node scripts/tratar-voz.mjs <entrada> <saida.wav>`.
Tira ronco, nivela o volume, dá clareza e brilho e leva a −14 LUFS (preset `jr`, padrão). Dois
presets: `colada` (a receita sugerida em 04/11) e `jr` (a mesma com correções medidas no áudio de
28/10). Escolhido em 04/11 pelo Matheus: amostra "mais brilho", base do `jr`.

**Eco (não resolvido só com FFmpeg):** o FFmpeg não tem filtro de dereverberação. Redução de ruído
(`afftdn`) tira chiado, não eco. No áudio de 28/10 medi:
- nenhum eco discreto (repetição entre 60 e 400 ms): só correlação fraca, até 0,03;
- o fim das frases cai para −46 dB em 50 ms e −65 dB em 100 ms: a limpeza anterior **corta a cauda
  da sala de forma seca**. A sala some nas pausas e continua dentro da fala. Isso pode soar como
  "eco" ou "caixote";
- o espectro tem um recorte entre 300 e 420 Hz e energia forte em 80 a 300 Hz, típico de sala
  pequena ou microfone perto de mesa ou parede.
Não consigo ouvir: a conclusão final é do ouvido do Matheus.

Caminhos para eco de verdade (do mais barato ao mais pesado):
1. **Na gravação:** microfone mais perto da boca, longe de parede lisa e mesa; manta, cortina ou
   sofá atrás do microfone. É o que mais resolve e custa pouco.
2. **WPE local** (testado em 04/11, Python em `.vc-audio/`, fora do Git): numa amostra de 30 s,
   as forças moderada e forte tiraram quase nada (diferença 28 a 32 dB abaixo da voz). A máxima tirou mais
   (12 dB abaixo), mas a profundidade entre sílabas não mudou (26,7 dB contra 26,4 sem WPE). Amostras 6 a 8
   em `referencias/audio-teste/`. Provável motivo: a voz já veio limpa e comprimida, e o que sobra é reflexo
   curto da sala, que o WPE não tira. Só vale se o ouvido do Matheus aprovar.
3. **Serviço externo** (Adobe Podcast Enhance, Auphonic e semelhantes): costuma ser o mais forte
   contra sala, mas **envia a voz do JR para um servidor de terceiros**. Só com o JR sabendo, e
   sem eu fazer o upload sozinho.
4. **DeepFilterNet:** roda em CPU em tempo real, mas a remoção de eco dele é limitada; é feito
   para ruído. Não vale como solução principal para eco.

## 5c. Achado de 04/11: o compressor realçava o eco

Ao comparar a mesma amostra com e sem compressor, medi que o **compressor estava reduzindo a
diferença entre a fala e o que sobra na pausa** (vale entre sílabas: 26,7 dB com compressor,
29,3 dB sem nenhum dos dois). Ou seja, parte do "eco" que você ainda ouviu na amostra 8 pode ter
sido o meu próprio tratamento, não só a sala.

Troquei o compressor por um **portão** (`agate`, abaixa o volume só nas pausas, sem mexer na
fala). Com WPE força máxima + portão forte, o vale entre sílabas subiu para **34,4 dB** — bem
acima do original (26,4 dB).

**Como gerar (já no script):**
```
.vc-audio/Scripts/python.exe -I scripts/dereverberar-wpe.py entrada.wav saida-wpe.wav --forca maxima
node scripts/tratar-voz.mjs saida-wpe.wav saida-final.wav --preset jr --gate-forte
```

**Risco real, não testado por ouvido:** um portão forte pode cortar o final de alguma palavra
(cortar a respiração natural da fala). Amostras 9 (portão normal) e 10 (portão forte) em
`referencias/audio-teste/`, para comparar com a 5 (sem WPE) e a 8 (WPE sem portão). Só aplicar no
vídeo inteiro depois do Matheus confirmar que nenhuma tirou o som natural da fala.

## 5d. Conclusão de 04/11: eco de sala é limite do código local

O Matheus ouviu as amostras e confirmou: a 8 (WPE força máxima + tom, sem portão) foi a melhor,
mas o eco não sumiu. Isso bate com a medição: o WPE mexeu pouco (a cauda caiu só uns 12 dB abaixo
da voz). **Conclusão: para esse eco de sala específico, o tratamento por código já chegou perto do
limite.** Os caminhos que sobram não são de código:

1. **Gravação (o que mais resolve, e de graça):** microfone perto da boca, algo macio no ambiente
   (cortina, manta, estante, sofá) atrás e ao redor do JR.
2. **Serviço de IA externo** (Adobe Podcast Enhance, Auphonic): pode remover mais eco de sala do
   que o WPE local, mas a voz do JR sai para um servidor de outra empresa — só com o JR sabendo e
   topando, upload feito pelo Matheus.

A voz inteira (247,5 s) tratada com a receita da amostra 8 está em
`public/videos/2026-10-28-voz-wpe8-completa.wav` (fora do Git, −14 LUFS). Trechos para conferir:
amostra 11 (mesmo trecho da 8, para comparar igual) e amostra 12 (trecho novo, 2:30). Ainda não
trocado no `Video2810V3` — depende da confirmação do Matheus.

## 5e. IA local de voz (Resemble Enhance), teste de 04/11

Modelo aberto (licença MIT, da Resemble AI), rodando no PC, sem enviar áudio para fora. Instalado em
`.vc-enhance/` (1,3 GB mais 713 MB do modelo, fora do Git). Não é cópia de Adobe nem de Auphonic.
Script: `.vc-enhance/Scripts/python.exe -I scripts/melhorar-voz-ia.py entrada.wav saida.wav --modo enhance`.
Depois, `node scripts/tratar-voz.mjs saida.wav final.wav --preset jr`.

- **Resultado (Matheus, 04/11): ficou com chiado. Reprovado para a voz do JR.** Fica guardado como ferramenta
  de tratamento avançado (skill `tratar-audio`, degrau 3), só sob pedido.
- Velocidade neste PC (sem placa de vídeo): cerca de 6,5 vezes mais lento que o tempo real. Voz de 247 s: ~27 min.
- Amostras 13 (padrão) e 14 (mais limpa, lambd 0,9 e tau 0,3), mesmos 30 s das anteriores.
- **A medida "vale entre sílabas" não serve para este modelo:** ele recria a voz, então preenche os vales
  (22,9 dB contra 26,7 da amostra 8). Isso não prova mais nem menos eco. Só o ouvido decide.
- Riscos de modelo que recria a voz: timbre mudado, sílaba "engolida" ou palavra trocada. Ouvir com atenção
  e conferir a transcrição se for usar.
- Dois ajustes locais no venv (originais guardados como .original): caminhos do hparams.yaml e um `[0]` em
  cfm.py por versão nova do scipy. O "deepspeed" é um stub só para os imports não falharem.

## 6. Revisão no Studio (o Matheus sempre vê antes do render)

```bash
npm run dev
```

O navegador abre o Remotion Studio. A pasta `Videos` tem os vídeos montados e a `Testes` tem a
demo do kit (`KitV3Demo`). Para pedir ajustes, anote o **tempo** (mm:ss) e o que mudar.

Checklist de revisão (recomendação, olhar em tela cheia **e** no celular):
1. Os 5 primeiros segundos prendem?
2. Algum texto cobre o rosto ou as mãos do JR?
3. Algum texto antigo aparece por baixo do novo (fantasma)?
4. Algum quadro fica vazio ou só com o fundo?
5. Dá para ler cada texto no tempo em que ele fica na tela?
6. A voz está clara e a trilha não briga com ela?
7. Alguma frase parece promessa de ganho?

## 7. Ajustes

Mande do jeito que for mais fácil: lista, áudio transcrito, print com o tempo. Cada pedido vira uma
linha no `docs/alteracoes.md` com número, estado e o que mudou. Só você marca "ok".

## 8. Render

Só depois do "pode renderizar". O Claude confere duração, quadros e volume no arquivo final.

## 9. Entrega e publicação (fora do editor, recomendação)

- **Thumbnail:** rosto do JR com expressão forte, no máximo 3 palavras, cores do kit. Faz parte
  do vídeo tanto quanto a edição.
- **Título:** promete o assunto, não o ganho.
- **Descrição:** capítulos com os tempos da pauta, aviso legal, links.
- **Cortes verticais (Shorts/Reels/TikTok):** feitos no próprio editor-jr (Etapa 9, skill
  `cortes-curtos`), 5 a 6 por vídeo de ~15 min, montados em paralelo com o longo, cada um num dos
  dois modelos aprovados em 12/11/2026 (papel, kit 4.16; Cartografia viva, kit 4.17). Fluxo:
  `docs/cortes/fluxo-padrao.md`. Render só com "pode renderizar".
- Depois de publicar: olhar a retenção no YouTube Studio. O ponto onde a curva cai vira ajuste
  de roteiro ou edição no próximo vídeo.

---

## Quem chama o quê (automático)

O Claude puxa a receita certa sozinho, conforme o pedido. Você não precisa pedir pelo nome.

| Quando você pede... | Receita (skill) que entra |
|---|---|
| "edita", "monta", "faz a v4", "reedita o vídeo de..." | `editar-video` |
| Uma lista de ajustes, "no 1:30 muda...", print com comentário | `pedido-de-ajustes` |
| Mudar cor, fonte, posição padrão, @, logo, borda: algo que vale para todos os vídeos | `ajustar-kit-visual` |
| Uma peça nova que ainda não existe | `editor-jr` (criar componente) |
| Áudio ruim, eco, chiado, volume, voz nova para tratar | `tratar-audio` |
| Cortes curtos (Shorts/Reels), cardápio de cortes, trecho explicativo (papel ou Cartografia) | `cortes-curtos` |
| "renderiza", "exporta", "gera o mp4" | `renderizar` |
| Cena, fundo ou b-roll com IA (Higgsfield), custo de IA | `gerar-midia-ia` |
| Dúvida de como o Remotion funciona | `remotion-best-practices` (oficial do Remotion) |
| Conferir um código contra as regras | agente `revisor` (só leitura) |
| Uma fala que compara tamanhos, camadas, terra x Bolsa, crescimento, preço de ação (o Claude sugere sozinho) | `cenas-3d` (aprovado 13/11; técnica em `docs/guia-3d.md`) |
| Uma palavra-chave forte ou uma tendência (sobe, fica parado, cai) que fica melhor "atrás do JR"; "tira o fundo", "texto atrás dele" (o Claude sugere sozinho) | `recorte-fundo` (aprovado 13/11; kit 4.19; técnica em `docs/guia-recorte-fundo.md`) |
| "Como o público vai reagir?", "vai chamar atenção?", "tem gatilho?", nota de impacto de vídeo, corte, abertura ou título (o Claude também entra sozinho no roteiro e nos cortes) | `engajamento` (14/11; pesquisa em `docs/engajamento/pesquisa.md`, previsões x resultado em `docs/engajamento/aprendizados-canal.md`) |
| Pedido de edição confuso ou incompleto (falta arquivo, formato, mensagem) | `meia-briefing-de-edicao` (bônus do curso, 13/11/2026) |
| Legenda e enquadramento em formato novo (vertical ↔ horizontal) | `meia-legendas-e-enquadramento` (bônus do curso) |
| O mesmo erro voltou depois de corrigir, ou muitas tentativas sem resolver | `meia-revisao-economia` (bônus do curso) |

As 3 skills bônus são do curso "Máquina de Edição IA" (`.claude/skills/meia-*`). Quando uma delas
discordar de uma regra nossa (kit, skills `editar-video`, `pedido-de-ajustes`), **vale a nossa**.
Material de consulta do curso (guia em PDF, comandos, modelos, CSVs): `referencias/curso-edicao-ia/`.
Esse material é do curso: **não vai para o Git**.

Ferramentas de fora que já estão ligadas (conectores da sua conta, não do projeto):
- **Navegador (painel do app):** abrir o Studio, o painel da Higgsfield, referências no YouTube.
- **Google Drive:** ler e criar documentos. Não sobe vídeo grande; para isso, use o Google Drive
  para computador.
- **Gmail e Agenda:** só se você pedir. Mandar e-mail sempre pede o seu "ok" antes.
