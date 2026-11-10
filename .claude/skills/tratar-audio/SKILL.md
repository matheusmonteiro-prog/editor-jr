---
name: tratar-audio
description: Use quando o assunto for a qualidade do áudio da voz do JR — voz abafada, baixa, com eco, chiado, volume desigual, "o áudio está ruim", normalizar volume, limpar a voz de um vídeo novo, ou antes de renderizar um vídeo com voz que ainda não foi tratada.
---

# Tratar o áudio da voz do JR

Tudo roda no PC, sem enviar áudio para fora. Uma voz nova começa **sempre** pelo degrau 1 e só sobe
de degrau se o Matheus ouvir e disser que ainda incomoda. Eu não consigo ouvir: medir ajuda, mas
**quem aprova é o ouvido do Matheus**. Mande sempre amostras de 30 s em `referencias/audio-teste/`
(numeradas, com o nome do que mudou) antes de aplicar no vídeo inteiro.

## Degrau 1: padrão (rápido, 25 s para 4 min)
`node scripts/tratar-voz.mjs <entrada> <saida.wav> --preset jr`
Tira ronco, dá clareza e brilho, nivela e leva a −14 LUFS e pico ≤ −1,5 dBTP. Amostra do trecho:
`--inicio 12.5 --duracao 30`. Para MP4, o script lê o áudio direto.

## Degrau 2: eco de sala (WPE, ~10 min para 4 min de voz)
1. `ffmpeg -y -i voz.mp4 -vn -ar 48000 -c:a pcm_s24le voz-bruta.wav` (o Python não lê MP4)
2. `.vc-audio/Scripts/python.exe -I scripts/dereverberar-wpe.py voz-bruta.wav voz-wpe.wav --forca maxima`
   (rodar em segundo plano; a força máxima é a única que fez diferença medida)
3. `node scripts/tratar-voz.mjs voz-wpe.wav voz-final.wav --preset jr`
Este foi o caminho aprovado pelo Matheus em 04/11 (amostra 8). Ele reduz um pouco a sala, não tira tudo.

## Degrau 3: ferramentas avançadas (só sob pedido, sempre testar em 30 s)
- **IA local Resemble Enhance** (`.vc-enhance/`, `scripts/melhorar-voz-ia.py`): recria a voz. No teste de
  04/11 o Matheus reprovou: **ficou com chiado**. Não usar na voz do JR sem pedido. Pode servir para
  áudio de outra pessoa ou ruído forte constante. ~27 min para 4 min de voz.
- **Portão** (`tratar-voz.mjs --gate` ou `--gate-forte`): troca o compressor, que realça a cauda da sala.
  Pode cortar o fim de palavras: só com amostra aprovada.
- **Serviço externo** (Adobe Podcast Enhance, Auphonic): a voz sai do PC. Só com o JR sabendo e o
  Matheus fazendo o upload. Nunca eu.

## Regras
- Sem compressor forte antes de mexer em eco: o compressor realça a cauda da sala.
- Comparar amostras sempre com o mesmo volume (−14 LUFS), senão a mais alta parece melhor.
- A medida "vale entre sílabas" só vale para filtros, não para IA que recria a voz.
- Eco de verdade se resolve na gravação: microfone perto da boca, algo macio atrás e ao redor do JR.
  Dizer isso ao Matheus quando o assunto voltar.
- Arquivos de voz (.wav) ficam em `public/videos/` (fora do Git). Nunca versionar áudio bruto.
- Depois de trocar a voz de um vídeo, atualizar o comentário e a tag `<Audio>` e registrar no
  `docs/alteracoes.md`.
