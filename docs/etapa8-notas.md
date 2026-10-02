# Etapa 8 (mínima) — flags reais do `remotion render` (02/10/2026)

Fonte: saída real de `npx remotion render --help` (Remotion 4.0.527, rodado nesta
máquina). Nenhuma flag abaixo foi suposta — só as que apareceram nessa saída. Lista
completa das ~60 flags não está aqui; só as relevantes pra resolução, codec e bitrate (o
que a Etapa 8 pede).

**Resolução:**
- `--width <value>` — Override Width
- `--height <value>` — Override Height

**Codec:**
- `--codec <value>` — Codec

**Taxa de bits:**
- `--video-bitrate <value>` — Video Bitrate
- `--audio-bitrate <value>` — Audio Bitrate (não pedido pela Etapa 8, mas existe)

**Outras flags confirmadas, não usadas em `scripts/render-final.mjs` por não serem
necessárias pro mínimo pedido (resolução/codec/bitrate), mas existem de verdade:**
`--fps`, `--duration`, `--crf`, `--gop`, `--x264-preset`, `--scale`, `--output`,
`--overwrite`, `--concurrency`, `--binaries-directory`, `--pixel-format`,
`--prores-profile`.

**Não confirmado:** quais valores válidos cada flag aceita (ex.: nomes de codec
aceitos por `--codec`) — o `--help` não lista os valores, só o nome da flag e uma
descrição de uma linha. Pra isso seria preciso a documentação oficial
(remotion.dev/docs/cli/render, citada no rodapé do próprio `--help`) ou o código-fonte
do pacote `@remotion/cli` — não verificado nesta sessão, por não ser necessário pro
`--dry-run` do `scripts/render-final.mjs` (que só monta a string do comando, nunca
valida nem executa).
