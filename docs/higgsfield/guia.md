# Guia da Higgsfield para o canal do JR

> Escrito à mão em 11/11/2026 a partir de `docs/higgsfield/catalogo.md` (gerado da doc oficial e da rota
> de preço da API) e dos testes deste projeto. **Antes de propor qualquer uso da Higgsfield, leia este
> guia e o topo de `docs/higgsfield/novidades.md`.** Preço vem da API (`/estimate`, não cobra); valor
> de painel não foi conferido.

## Onde está cada coisa

| Arquivo | O que é | Quem mexe |
|---|---|---|
| `docs/higgsfield/guia.md` | Este guia: o que dá para fazer, o que já testamos, regras | À mão (Claude), quando houver novidade |
| `docs/higgsfield/catalogo.md` | Todos os 84 endereços da API com campos, limites e preço | Só o script |
| `docs/higgsfield/catalogo.json` | A mesma coisa em dados, para comparar semana a semana | Só o script |
| `docs/higgsfield/novidades.md` | O que mudou na doc ou no preço, por data (mais novo em cima) | Só o script |
| `scripts/higgsfield-catalogo.mjs` | Lê a doc, consulta preços e escreve os 3 arquivos acima. Não gasta crédito | — |

Atualizar à mão: `node scripts/higgsfield-catalogo.mjs --precos`. Toda semana roda sozinho (ver o fim).

## O que a Higgsfield faz, por necessidade do canal

Preços por segundo de vídeo gerado, 720p, salvo indicação. "Exemplo" = preço do pedido de exemplo da doc.

### 1. Criar cena do zero a partir de texto (b-roll, cenário, fundo explicativo)
- Mais baratos: **Kling 2.5 Turbo Standard** US$ 0,0315/s (imagem → vídeo) · **Wan 3.0** US$ 0,075/s (480p US$ 0,0375; 1080p US$ 0,15) · **Kling 3.0 Standard** US$ 0,0714/s (é o do `scripts/gerar-video.mjs`).
- Qualidade alta: **Seedance 2.5** US$ 0,2647/s · **Kling 3.0 Pro** 1080p US$ 0,0962/s · **Kling 3.0 4K** US$ 0,3151/s.
- **Kling 3.0** aceita até 6 tomadas num pedido (`multi_shots`), cada uma com seu texto e duração.
- Quase todos geram som próprio (`generate_audio` / `sound`). **Para o JR, sempre desligar**: o som entra no Remotion.

### 2. Animar uma imagem que já existe (foto → vídeo)
- Todos os modelos "image to video". Para emendar com uma cena real, os que aceitam **primeiro e último quadro**:
  **Kling O3 / Kling Omni "first last frame"** (US$ 0,0683 / 0,0632 por segundo) e **Wan 2.7** (`end_image_url`).

### 3. Pessoa falando a partir de foto + voz (avatar, "driving audio")
- **Wan 2.7 image to video** (US$ 0,075/s; 1080p US$ 0,1125/s, 2 a 15 s): a doc diz que `audio_url` é
  **áudio que conduz** o vídeo ("driving audio"), com `image_url` = primeiro quadro e `end_image_url` = último.
  **Testado em 11/11** (aprovado pelo Matheus no visual): o JR calmo, falando a fala original.
  **Lição (11/11):** a boca segue a voz bem só nos **primeiros ~3 s** de cada pedido; depois perde a
  sincronia (medido janela a janela). Para fala, gerar em **pedaços de até ~3 s cortados nas pausas da voz**,
  cada pedaço começando no último quadro do anterior. Medir a sincronia **por janela**, nunca por um número só.
- Aceitam áudio como referência, **sem prometer boca sincronizada**: Seedance 2.5 e 2.0 "reference to video",
  Wan 3.0 / 3.0 Prime "reference to video", Cinema Studio 4.0 (marca `<<<audio_1>>>` no texto), MiniMax H3
  (2K, US$ 0,13/s), Grok Imagine Video 1.5.
- Regra do projeto: **o rosto do JR nunca é gerado por IA**. Só teste pedido pelo Matheus; para ir ao ar,
  o JR precisa saber e concordar.

### 4. Editar um vídeo que já existe (trocar roupa, objeto, estilo)
- **Kling Omni video edit** (3 a 10 s, US$ 0,0945/s, cobra a duração da entrada) · **Kling O3 video edit** (3 a 15,5 s) ·
  **Seedance 2.5 video edit** (até 30 s, US$ 0,3264/s, exige imagem de referência) · **Genjutsu object swap** e
  **restyle** (estilo do vídeo inteiro, mantém o som).
- **Lição (11/11):** esses modelos **copiam o movimento do vídeo de entrada**. Servem para aparência (roupa,
  cor, estilo), **não** para acalmar movimento.

### 5. Passar o movimento de um vídeo para outra imagem
- **Genjutsu motion transfer** (US$ 0,3446/s) · **Kling 2.6 / 3.0 Motion Control** (US$ 0,0523 a 0,1189/s; vídeo de
  3 a 30 s; `keep_original_sound`). A boca segue o vídeo de movimento, não um áudio novo.

### 6. Esticar um vídeo
- **Seedance 2.5 video extend** (US$ 0,3264/s, cobra só a parte nova).

### 7. Personagem sempre igual
- **Kling elements** (IDs de elemento da própria conta, em Kling 3.0 / O3 / Omni) e **Soul ID** (treina um
  personagem a partir de fotos, para as imagens SOUL). Não testados.

### 8. Imagens
- Baratos: **Z-Image Turbo** (exemplo US$ 0,015) · **SOUL V2 / SOUL Cinema** (exemplo US$ 0,004) · **Recraft V4.1** (US$ 0,035) ·
  **Qwen Image 3** (gera e edita, US$ 0,04). Outros: Ideogram 4.0, Grok Image 2.0 (até 10 referências), Recraft Pro,
  Marketing Studio e Ads Studio (cobram por token).
- Regra do kit: imagem gerada **sem texto, logo ou número** (o texto entra no Remotion).

## O que já testamos neste projeto

| Data | Pedido | Modelo | Custo | Resultado |
|---|---|---|---|---|
| 06/11 | A-017 trocar a camiseta | Seedance 2.5 video edit, 480p, 4 s | ~US$ 1 | Camisa natural, rosto e boca mantidos; volta em 24 qps (esticar para 30) |
| 11/11 | A-019 acalmar movimento, só texto | Kling Omni video edit, 720p, 10 s | ~US$ 0,95 | **Reprovado:** trocou o JR por outra pessoa |
| 11/11 | A-019 com 3 fotos do JR | Kling Omni video edit (pro), 720p, 8 s | ~US$ 0,76 | Rosto fiel; **movimento igual** ao original (-4%) |
| 11/11 | A-019 cena nova: 1º quadro real + voz original | **Wan 2.7 image to video**, 720p, 9 s | ~US$ 0,68 | **Movimento -57%** (3,24 → 1,39 px/quadro, igual ao resto do vídeo); rosto fiel; sincronia da boca **não medida com segurança** (o número 0,33 de antes foi retirado: o medidor falhou no vídeo real). Pele um pouco mais marcada; logo do chapéu borra às vezes. Sai em 720p, 30 qps, 9 s |

## Regras fixas (valem sempre)
- **Gastar crédito = pedir antes**, com o que vai gerar, quantos pedidos e o valor; esperar o "ok" escrito do Matheus.
- Estimar preço (`/estimate`) e subir arquivo não cobram. Pedido que termina em `failed` ou `nsfw` não é cobrado.
- O resultado fica 7 dias na Higgsfield: baixar logo. O saldo comprado vence em 1 ano.
- Chaves no `.env` (`HF_API_KEY_ID`, `HF_API_KEY_SECRET`): nunca imprimir, copiar ou commitar.
- Mídia gerada fica em `public/videos/cenas/` (fora do Git).

## Scripts que já falam com a API
- `scripts/gerar-video.mjs`: texto ou imagem → vídeo (Kling 3.0 Standard).
- `scripts/editar-video-ia.mjs`: editar vídeo (Kling Omni, Seedance 2.5) e, com `--cena`, cena nova de fotos + áudio (Seedance 2.5 reference to video).
- Modelo novo: copiar o endereço e os campos de `catalogo.md` para o script; estimar antes de gerar.

## Atualização semanal
- Toda segunda-feira, às 9h, uma tarefa agendada do Claude roda `node scripts/higgsfield-catalogo.mjs --precos`.
  Se houver novidade, ela atualiza este guia e avisa o Matheus. Não gera nada e não gasta crédito.
- Só roda com o app do Claude aberto; se estiver fechado no horário, roda quando abrir.
