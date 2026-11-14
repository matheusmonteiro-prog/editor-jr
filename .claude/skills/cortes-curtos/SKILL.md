---
name: cortes-curtos
description: Use quando o Matheus pedir cortes curtos (Shorts, Reels, TikTok, "cortes de 30/40 segundos") de um vídeo do JR, quiser ver o cardápio de cortes, aprovar ou ajustar um corte, ou pedir um dos dois modelos visuais aprovados (papel explicativo ou Cartografia viva) num corte ou num trecho explicativo do vídeo longo.
---

# Cortes curtos e trechos explicativos do JR (Etapa 9)

Regras gerais (aprovação, Git, formato do relatório) estão no `CLAUDE.md`. Arquitetura: `ARQUITETURA.md`,
Etapa 9. **Fluxo padrão aprovado pelo Matheus em 12/11/2026: `docs/cortes/fluxo-padrao.md`** (leia antes).
Modelo 1 (papel): kit 4.16. Modelo 2 (Cartografia viva): kit 4.17 e `docs/identidade/territorio-proposta.md`
(seções 7 e 8). Exemplos aprovados: `Corte-2810-01b` (papel) e `Cartografia-2810-01b-verde`/`-branco`.

> **Pronto no código (12/11/2026, a validar pelo Matheus no Studio):** `"tempos"` e `ambienteCartografia` no
> topo da receita, `layout: "cartografia"` com `cenas`, `modelo: "papel-camera"` e `enquadramento` por quadro,
> Cartografia 16:9 (`formato: "horizontal"`), lista `explicativos` e a peça `TrechoExplicativo`.
> Cadastro de vídeo novo: `src/cortes/fontes.ts` (câmera, voz, transcrição) e `src/cortes/receitas.ts`.
> Exemplo completo de receita Cartografia: corte `2810-01d`; explicativos: `2810-balanca` (papel) e
> `2810-crescimento` (Cartografia), em `cortes/2026-10-28.cortes.json`. O schema é `src/cortes/receita.ts`:
> campo que ele não aceita dá erro com mensagem no Studio.

## 1. Fontes: gravação tratada, sem esperar o longo
- Os cortes **não esperam** a edição do vídeo longo. Rodam em paralelo, a partir da **gravação tratada
  inteira** (voz tratada + filtro de rosto, sem corte de silêncio). Nunca recortar o mp4 pronto.
- Precisa: voz tratada (skill `tratar-audio`), transcrição palavra por palavra dessa voz
  (`scripts/transcrever.mjs` → `videos/<video>-voz-tratada.palavras.json`) e a câmera.
- O filtro de rosto é lento (247 s levaram 33 min no 28/10). Enquanto roda, monte com a câmera sem
  filtro; quando terminar, troque só o `cameraSrc` em `src/cortes/fontes.ts`. Os tempos não mudam.
- `src/cortes/fontes.ts`: uma entrada por vídeo (câmera, voz, música, transcrição).
- Receita com `"tempos": "gravacao"` = segundos da gravação tratada. O 28/10 fica em `"final"` (linha do
  longo, que ali é a mesma da câmera). Tempo do longo, quando preciso: `src/utils/tempoCortado.ts` com
  `videos/<video>.cortes.json`.
- Olhe a fonte em folha de quadros (ffmpeg, 1 a cada 5 s): onde o JR está (`x`), trechos com JR
  pequeno, falas repetidas (a gravação tem erros que o longo vai tirar: usar a tentativa boa).

## 2. Mapa de temas, nota e cardápio (sem parar)
1. **Mapa de temas:** assuntos com início e fim.
2. **Nota de cada trecho candidato** (0, 1 ou 2 em cada; entra com **7 ou mais de 10**): gancho nos 3
   primeiros segundos; faz sentido sozinho; opinião firme ou contraintuitiva; exemplo ou número **dito
   pelo JR** (número inventado = fora); fecho com conclusão ou pergunta.
3. **Cardápio de 5 a 6 cortes** (vídeo de ~15 min) em `docs/cortes/<video>.md`: nome, nota, gancho,
   trechos, duração (20 a 45 s), gatilho, modelo e o porquê em uma linha, alertas.
4. **Não parar para perguntar:** monta todos e mostra cardápio + cortes juntos no Studio.
- **Fora:** promessa ou desempenho sem fonte; frase que muda de sentido fora do contexto (não tirar a
  ressalva); dois cortes com a mesma ideia. Começar e terminar nos limites das palavras.

## 3. Modelo de cada corte
| Assunto | Modelo | Componente / `layout` |
|---|---|---|
| Conceito, campo, "como funciona" | 1. Papel | `CorteDividido` / `"dividido"` |
| O mesmo, com troca de assunto que pede mexer no JR | 1. Papel com câmera | `CorteDivididoLivre` |
| Bolsa, ações, crescimento, comparação de investimentos | 2. Cartografia | `CorteCartografia` / `"cartografia"` |
- Corte com os dois assuntos: vale o do **fecho**.
- Cartografia: **um ambiente por vídeo** (`"ambienteCartografia": "verde"` ou `"branco"`, no topo da
  receita). Nunca misturar dentro do mesmo vídeo.
- Versão A (`"tela-cheia"`, `CorteCurto`) fica só como alternativa; não é padrão.
- **Cena 3D (kit 4.18, aprovado 13/11):** até 1 por corte, no momento da explicação principal, como trecho
  próprio (não dentro do papel nem da Cartografia). Decidir e escolher o molde pela skill `cenas-3d`.
  Os moldes ainda são 16:9: a versão vertical precisa ser feita antes do 1º corte com 3D.
- **Recorte de fundo (kit 4.19, aprovado 13/11):** divide com o 3D o limite de 1 ponto alto por corte; skill
  `recorte-fundo`. **Ainda não existe versão vertical.**
- **Nota de impacto:** dar a nota de cada corte do cardápio (skill `engajamento`) e ordenar pelo potencial;
  no Short, o primeiro segundo decide ("assistiu x passou o dedo").

## 4. Receita
Em `cortes/<video>.cortes.json`, um item por corte (`estado`: rascunho → montado → aprovado):
- `trechos` (podem vir fora de ordem: gancho primeiro), `segurarFim`, `legenda.correcoes`.
- **Papel:** `quadros` (um por ideia falada: `de`, `ate`, `etiqueta` ou `titulo`, `pecas`, e
  `enquadramento` no papel com câmera) e `quadroFecho`. Peça: `peca`, `em` (a palavra exata), `passos`,
  `x`, `y`, `largura`, `som`, `props`. Desenho pelo cardápio do kit 4.16; no máximo 3 peças.
- **Cartografia:** `cenas` (`de`, `enquadramento`, `rotulo`, `titulo`, `pecas`), `enfases` e
  `legenda.chaves`. Peças: `candles`, `lavouraCandles`, `estratos`, `marco`, `regua`, `talhoes`,
  `pontos`, `frase`, `texto`/`carimbo`. Gráfico só com `tendencia` (`sobe`, `lateral`, `cai`), nunca
  número; o selo "DEMONSTRAÇÃO VISUAL · SEM DADOS REAIS" é automático. No máximo 3 peças por cena.
- Posições sempre em frações (0 a 1): a mesma cena serve ao 9:16 e ao 16:9.
- O `Root.tsx` registra sozinho cada corte não rascunho na pasta "Cortes"; tempo fora dos trechos
  aparece no Studio com a mensagem.

## 5. Trecho explicativo no vídeo longo (16:9)
- Os dois modelos entram no longo, até os dois no mesmo vídeo (decisão do Matheus, 12/11).
- Descrito na lista `explicativos` da mesma receita; chamado no longo pela peça `TrechoExplicativo`
  (`video`, `id`, `modelo`). Revisão sozinho na pasta "Explicativos-16x9".
- No longo: trecho contínuo, sem gancho e sem imagem parada; voz, trilha e câmera do longo; sem aviso,
  logo e @ próprios (o aviso fica no início e no fim do vídeo inteiro); a legenda do longo sai e entra
  a do modelo; entrada e saída suaves.
- Recomendação: 15 a 60 s, não mais que um a cada 2 ou 3 minutos.
- Papel 16:9: `CorteDividido` `formato: "horizontal"`. Cartografia 16:9: mapa nos 1080 px da esquerda, JR à
  direita (840 px); a legenda e o rodapé ficam na coluna do mapa. Variações `close`/`janela` do 16:9: ainda não
  (o `enquadramento` da cena só muda o painel no 9:16).
- Revisão: pasta "Explicativos-16x9" do Studio (`Trecho-<id>`, `Cartografia-<id>-16x9`). No longo, a posição vem de
  `posicaoExplicativo(video, id, paraFrameDoLongo)` (comentário no topo de `TrechoExplicativo.tsx`).
- **Nunca** mexer no `Video2810V3` sem a ordem escrita do Matheus.

## 6. Conferir antes de mostrar
- `npx tsc --noEmit` e `npx remotion compositions src/index.ts` (duração certa).
- `npx remotion still ... --frame=N --scale=0.4` em 6 a 8 momentos (um por quadro ou cena) numa folha:
  texto cabe? nada cobre o rosto ou corta o chapéu? sobra vazio demais? selo nos gráficos?
- Abrir no Studio (`preview_start` "studio") e olhar o console. Só então chamar o Matheus.

## 7. Depois
- Ajustes do Matheus: skill `pedido-de-ajustes`. Render: skill `renderizar`, só com "pode renderizar",
  e com a correção dos 42,6 ms da voz (ver `docs/estado-atual.md`).
- Peça nova do papel ("ideia" no kit 4.16): um arquivo em `src/components/cortes/`, schema zod, props
  com padrão que funciona; registrar em `PECAS` do `CorteDividido.tsx` e em `NOMES_PECA` do `receita.ts`;
  atualizar o kit 4.16 e o "Mapa rápido" do catálogo. Peça nova da Cartografia: `graficosMercado.tsx`
  e kit 4.17.
- Higgsfield só para ilustração que código não faz, com custo e ok do Matheus (skill `gerar-midia-ia`).
