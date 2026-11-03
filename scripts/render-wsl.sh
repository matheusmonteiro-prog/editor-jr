#!/usr/bin/env bash
# Uso: ~/render.sh Composicao nome-do-arquivo [flags extras]
# Copia do Windows (fonte) para ~/editor-jr e renderiza.
set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Uso: ~/render.sh Composicao nome-do-arquivo [flags]"
  exit 1
fi
COMP="$1"; NOME="$2"; shift 2
rsync -a \
  --exclude node_modules --exclude .git --exclude out \
  --exclude config.local.json \
  --exclude videos --exclude public/videos --exclude public/music --exclude public/sfx \
  /mnt/c/Users/zerob/editor-jr/ ~/editor-jr/
cd ~/editor-jr
mkdir -p out
npx --no-install remotion render src/index.ts "$COMP" "out/$NOME.mp4" \
  --width 1080 --height 1920 --fps 30 --concurrency=2 \
  --props='{"videoSrc":"videos/0926-cortado-v1-leve-v1.mp4"}' "$@"
