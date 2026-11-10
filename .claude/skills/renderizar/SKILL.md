---
name: renderizar
description: Use quando for gerar o arquivo final .mp4 (ou um still/prévia) de uma composição do editor-jr — "renderiza", "exporta", "gera o vídeo", "manda o mp4". Só depois do Matheus ter visto no Studio e dito que pode.
---

# Renderizar (gerar o .mp4)

## 0. Pode renderizar?
- Só com o "pode renderizar" do Matheus **depois** de ele ver no Studio. Regra dele:
  "sempre quero ver o vídeo antes de renderizar". Na dúvida, pergunte.
- Prévia curta para conferir um ponto (`npx remotion still` de um quadro, ou poucos segundos com
  `--frames`) pode ser feita sem pedir. Ela não é o render final.

## 1. Comando
- No PC-EDICAO (Windows), o render local funcionou em 02/11 e 04/11/2026:
  `npx remotion render src/index.ts <Composicao> out/<nome>.mp4 --public-dir=<pasta>`
- `--public-dir` aponta para uma pasta pequena com **só os arquivos que a composição usa**, nos
  mesmos caminhos de `public/`. Sem isso, o Remotion copia o `public/` inteiro (centenas de MB) a
  cada render.
- Rodar em segundo plano: um vídeo de 4 min leva bem mais que 2 minutos.
- WSL: ver `ARQUITETURA.md`, "Ambiente de render (WSL)". O `rsync` de lá exclui `public/videos`.
- `scripts/render-final.mjs --dry-run` mostra o comando padrão sem executar.

## 2. Conferir o arquivo
- `ffprobe`: duração, resolução e fps batem com a composição.
- Tirar 4 a 6 quadros (abertura, trocas de cena, fim) e olhar.
- Áudio: `ffmpeg -i out/x.mp4 -af ebur128 -f null -` → alvo de −14 LUFS e pico ≤ −1 dBTP (seção 13
  do kit, proposta).
- Nome do arquivo sem espaço (`2026-10-28-final-v3.mp4`). Vídeo **nunca** vai para o Git.

## 3. Entregar
- Diga o caminho do arquivo e o tamanho.
- O conector do Google Drive não sobe vídeo grande. Para mandar para o Drive, o Matheus usa o
  Google Drive para computador ou sobe à mão.
