---
name: gerar-midia-ia
description: Use quando o pedido envolver gerar ou editar imagem ou vídeo com IA (Higgsfield, Kling, cena de fundo, b-roll, fundo explicativo, ilustração) para os vídeos do JR, ou quando perguntarem custo e possibilidade de IA no vídeo.
---

# Gerar imagem ou vídeo com IA

Documentação do script: `docs/higgsfield.md`. Chaves em `.env` (`HF_API_KEY_ID`, `HF_API_KEY_SECRET`):
**nunca imprimir, copiar ou commitar os valores.**

## Regras fixas
- **Gasta crédito = pede antes.** Diga o que vai gerar, quantos pedidos e o custo estimado, e espere
  o "ok" escrito do Matheus. Preço que não foi conferido no painel da Higgsfield é dito como estimativa.
- **O rosto do JR nunca é gerado por IA.** IA faz cenário, b-roll e fundo. Mandar imagem ou vídeo
  do JR para serviço externo só com o JR sabendo e concordando.
- Imagem gerada para o kit: sem texto, sem logo e sem número na imagem (o texto entra no Remotion).

## Como rodar
- Vídeo (Kling 3.0 Standard): `node scripts/gerar-video.mjs --prompt "..." --saida nome.mp4 [--duracao 3] [--proporcao 16:9]`.
  Sai em `public/videos/cenas/`. A fila pode passar de 15 minutos. Se cair, use `--retomar`
  (não gasta crédito de novo).
- Com imagem de referência: `--imagem https://...`. Sem `--confirmar`, só mostra o pedido.
- Geração de imagem (`gerar-asset`) existe só na branch `teste-visao`, ainda não está nesta.
- Toda mídia gerada entra em `public/images/catalogo-gerados.json` (o script já faz isso para vídeo).

## Limites conhecidos (04/11/2026)
- Sem placa de vídeo NVIDIA neste PC: IA local pesada (trocar roupa, redesenhar cena) não roda.
  Recolorir com segmentação rodou em CPU (troca de cor, não de modelo de roupa).
- Edição de vídeo com IA tem limite de ~10 s por pedido e pode alterar o rosto. Teste curto antes
  de gastar no vídeo todo.
