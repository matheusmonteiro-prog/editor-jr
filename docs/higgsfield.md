# Integração Higgsfield (scripts/gerar-video.mjs)

Documentação do que o script faz hoje. Fonte: leitura do código em 30/10/2026 (commit f5cd6fa). Nada aqui foi testado contra a API.

## Endpoints
- Texto para vídeo: `https://api.higgsfield.ai/kling-video/v3.0/std/text-to-video` (linha 27)
- Imagem para vídeo: `https://api.higgsfield.ai/kling-video/v3.0/std/image-to-video` (linha 28)
- Status: `https://api.higgsfield.ai/requests/<id>/status` (linha 123) ou a `status_url` devolvida pela API (linha 179)
- O vídeo pronto vem em `video.url` do resultado (linha 221)

## Modelo
Kling 3.0 Standard, fixo no endereço dos endpoints. Não é parâmetro: para trocar, edite as linhas 27-28.

## Parâmetros padrão
| Item | Valor | Linha |
|---|---|---|
| Duração | 3 s (inteiro de 3 a 15) | 70, 83 |
| Proporção | 9:16, só no modo texto (`aspect_ratio`); sem validação | 71, 152 |
| Som | `off` | 151-152 |
| Resolução | não definida no código (padrão da API, não confirmado) | — |
| Formato | nome `.mp4` obrigatório; bytes gravados como vêm | 79, 234 |

Proporções citadas no comentário do script: 16:9, 9:16, 1:1.

## Variáveis de ambiente
Lidas do `.env` na raiz via `dotenv` (linhas 24-25):
- `HF_API_KEY_ID`
- `HF_API_KEY_SECRET`

Nunca colocar os valores em documentação nem no Git.

## Onde salva
- Vídeo: `public/videos/cenas/<saida>` (ignorado pelo Git, regra `videos/` do `.gitignore`)
- Pedido: `public/videos/cenas/<saida>.pedido.json` (`request_id`, `status_url`, `prompt`, `imagem`)
- Catálogo: `public/images/catalogo-gerados.json` (rastreado pelo Git; campos `prompt`, `arquivo`, `referencia` opcional)

## Como usar
```
# Texto — ENVIA NA HORA e gasta crédito
node scripts/gerar-video.mjs --prompt "texto aqui" --saida a2-boi.mp4 [--duracao 3] [--proporcao 9:16]

# Imagem — sem --confirmar só mostra a requisição (não gasta)
node scripts/gerar-video.mjs --imagem https://... --prompt "texto" --saida a2-boi.mp4
# com --confirmar envia de verdade (gasta crédito); não aceita --proporcao

# Retomar pedido já enviado (não gasta)
node scripts/gerar-video.mjs --saida a2-boi.mp4 --retomar
node scripts/gerar-video.mjs --saida a2-boi.mp4 --retomar --pedido REQUEST_ID
```
`--sobrescrever` substitui um arquivo que já existe.

## Catálogo e reuso
Sim, existe (linhas 136-148). Antes de enviar, o script:
1. procura no catálogo o mesmo prompt (sem diferenciar maiúsculas, sem espaços nas pontas; no modo imagem, também a mesma imagem de referência);
2. recusa se o arquivo de destino já existe;
3. recusa se já existe um `.pedido.json` para a mesma saída (use `--retomar`).

## Pontos de atenção (não corrigidos)
- Linha 139: no modo texto, um prompt igual de uma entrada gerada com imagem conta como "já existe".
- Linha 213: a mensagem diz 15 min, mas o limite real é 30 min (linha 30).
- `dotenv` 17.3.1 agora é dependência direta no `package.json` (03/11/2026).
- Linha 193: no modo imagem, a mensagem mostra uma proporção que não é enviada.
