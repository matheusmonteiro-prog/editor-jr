# Catálogo da API Higgsfield (gerado)

> Gerado por `scripts/higgsfield-catalogo.mjs` em 2026-11-11. **Não edite à mão**: rode o script.
> Fonte: docs.higgsfield.ai. Preço: rota `/estimate` da API (não cobra). Guia de uso: `docs/higgsfield/guia.md`.

84 endereços (67 de vídeo, 17 de imagem).

## Vídeo

### Genjutsu — Motion transfer API

Motion transfer with Genjutsu: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield/genjutsu/motion-transfer/v1.0`
- Página: https://docs.higgsfield.ai/docs/models/genjutsu/motion-transfer.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1540; 720p: $0.3446; 1080p: $0.8346. Billed duration is the source video duration rounded up to a whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use higgsfield/genjutsu/motion-transfer/v1.0 for new integrations. The legacy endpoint higgsfiled/genjutsu/motion-transfer/v1.0 remains callable for existing clients but is hidden from model discovery.
  - The source video must be at least 4 seconds. Videos longer than 30 seconds are trimmed to 30 seconds; output duration follows the prepared source video.
  - Provide 1–8 image references. The prompt is optional and defaults to an empty string.
- Campos (\* = obrigatório):
  - `prompt` string — até 10000 caracteres; padrão ""
  - `video_url`\* string — até 2083 caracteres
  - `image_urls`\* array — 1 a 8 itens
  - `resolution` string — "720p" | "480p" | "1080p"; padrão "720p"

### Genjutsu — Object swap API

Object swap with Genjutsu: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield/genjutsu/object-swap/v1.0`
- Página: https://docs.higgsfield.ai/docs/models/genjutsu/object-swap.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1540; 720p: $0.3446; 1080p: $0.8346. Billed duration is the source video duration rounded up to a whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use higgsfield/genjutsu/object-swap/v1.0 for new integrations. The legacy endpoint higgsfiled/genjutsu/object-swap/v1.0 remains callable for existing clients but is hidden from model discovery.
  - The source video must be at least 4 seconds. Videos longer than 30 seconds are trimmed to 30 seconds; output duration follows the prepared source video.
  - Provide 1–8 image references. The prompt is optional and defaults to an empty string.
  - The source video must contain at least 409,600 pixels per frame (width × height).
- Campos (\* = obrigatório):
  - `prompt` string — até 10000 caracteres; padrão ""
  - `video_url`\* string — até 2083 caracteres
  - `image_urls`\* array — 1 a 8 itens
  - `resolution` string — "720p" | "480p" | "1080p"; padrão "720p"

### Genjutsu — Restyle API

Restyle with Genjutsu: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield/genjutsu/restyle/v1.0`
- Página: https://docs.higgsfield.ai/docs/models/genjutsu/restyle.md
- Preço (API): Roughly costs $0.318 per second at 480p, $0.681 per second at 720p, or $1.632 per second at 1080p.
- Notas de uso:
  - Restyle changes the visual style of a source video while retaining its motion, shot composition, and source audio. Each request produces one video.
  - Select a current style from GET /models/higgsfield/genjutsu/restyle/v1.0/presets and send its UUID as preset_id. The example UUID below is illustrative of a published preset; fetch the current catalog before submitting.
  - The source must be at least 4 seconds and no larger than 200 MiB. Videos longer than 30 seconds are trimmed to their first 30 seconds, including audio.
  - Character references are optional: omit image_urls or send \[] to restyle the existing source subjects. Supply up to 5 character images to guide their appearance.
  - Defaults apply to omitted optional fields. Use \[] or an empty string where appropriate; null is not accepted.
  - Output framing is derived from the source and animation cadence can depend on the selected style. Exact output duration and FPS may differ from the source.
- Campos (\* = obrigatório):
  - `prompt` string — até 10000 caracteres; padrão ""
  - `preset_id`\* string
  - `video_url`\* string
  - `image_urls` array — 0 a 5 itens; padrão []
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"

### Seedance 2.0 — Text to video API

Text to video with Seedance 2.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.0/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0804; 720p: $0.1735; 1080p: $0.4293; 4K: $0.8907. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - Provide a nonblank prompt. This endpoint does not use media inputs; use the image-to-video or reference-to-video endpoint instead.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 4..15; padrão 5
  - `resolution` string — "480p" | "720p" | "1080p" | "4k"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9"; padrão "16:9"
  - `generate_audio` boolean — padrão true

### Seedance 2.0 — Image to video API

Image to video with Seedance 2.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.0/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0804; 720p: $0.1735; 1080p: $0.4293; 4K: $0.8907. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - The prompt is optional. Output framing follows image_url; end_image_url is the optional last frame.
- Campos (\* = obrigatório):
  - `prompt` string
  - `duration` integer — 4..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "480p" | "720p" | "1080p" | "4k"; padrão "720p"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true

### Seedance 2.0 — Reference to video API

Reference to video with Seedance 2.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.0/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per second of generated video. - Without video input: 480p: $0.0804; 720p: $0.1735; 1080p: $0.4293; 4K: $0.8907. - With video input: 480p: $0.0991; 720p: $0.2128; 1080p: $0.5183; 4K: $1.0669. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration. Image or audio references alone use the rate without video input.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - Provide a nonempty image_urls or video_urls array. Audio alone does not satisfy the reference requirement. Do not mix reference arrays with image_url, end_image_url or video_url.
  - Reference videos may be resized, transcoded and trimmed to 15 seconds each. Reference audio is normalized to 2–15 seconds per file and at most 15 seconds total.
- Campos (\* = obrigatório):
  - `prompt` string
  - `duration` integer — 4..15; padrão 5
  - `audio_urls` array — 1 a 3 itens
  - `image_urls` array — 1 a 9 itens
  - `resolution` string — "480p" | "720p" | "1080p" | "4k"; padrão "720p"
  - `video_urls` array — 1 a 3 itens
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9"; padrão "16:9"
  - `generate_audio` boolean — padrão true

### Seedance 2.5 — Text to video API

Text to video with Seedance 2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2-5/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1177; 720p: $0.2647; 1080p: $0.6518. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - Provide a nonblank prompt. This endpoint does not use media inputs; use the image-to-video or reference-to-video endpoint instead.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 4..30; padrão 5
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9"; padrão "16:9"
  - `bitrate_mode` string — "standard" | "high"; padrão "high"
  - `output_format` string — "mp4" | "mov"; padrão "mp4"
  - `generate_audio` boolean — padrão true

### Seedance 2.5 — Image to video API

Image to video with Seedance 2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2-5/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1177; 720p: $0.2647; 1080p: $0.6518. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - The prompt is optional. Output framing follows image_url; end_image_url is the optional last frame.
- Campos (\* = obrigatório):
  - `prompt` string
  - `duration` integer — 4..30; padrão 5
  - `image_url`\* string
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `bitrate_mode` string — "standard" | "high"; padrão "high"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true

### Seedance 2.5 — Reference to video API

Reference to video with Seedance 2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2-5/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per second of generated video. - Without video input: 480p: $0.1177; 720p: $0.2647; 1080p: $0.6518. - With video input: 480p: $0.1387; 720p: $0.3264; 1080p: $0.7858. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration. Image or audio references alone use the rate without video input.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - Provide at least one nonempty reference array: image_urls, video_urls or audio_urls. Audio-only references are supported by this schema and preprocessing path.
  - Reference media are limited to 30 images, 10 videos and 10 audio files, with at most 50 items total. Video duration and audio duration are normalized separately to at most 30 seconds total per media type.
- Campos (\* = obrigatório):
  - `prompt` string
  - `duration` integer — 4..30; padrão 5
  - `audio_urls` array — 1 a 10 itens
  - `image_urls` array — 1 a 30 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `video_urls` array — 1 a 10 itens
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9"; padrão "16:9"
  - `bitrate_mode` string — "standard" | "high"; padrão "high"
  - `generate_audio` boolean — padrão true

### Seedance 2.5 — Video edit API

Video edit with Seedance 2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/video-edit`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2-5/video-edit.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1387; 720p: $0.3264; 1080p: $0.7858. The edited video duration is determined from the primary input video and rounded up to a whole second. Total price = selected rate × that duration in seconds; input duration is not added again.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - The source video_url counts toward the 10-video limit, so include at most 9 additional video_urls. At most 50 media items are accepted across the source video and all reference arrays.
  - Videos and audio may be trimmed or padded during preprocessing to fit their respective 30-second total budgets. Output framing follows the source video.
  - Do not send duration: this endpoint derives output duration from the processed source video. The main video is normalized to at least 4 seconds.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `video_url`\* string
  - `audio_urls` array — 1 a 10 itens
  - `image_urls` array — 1 a 30 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `video_urls` array — 1 a 10 itens
  - `bitrate_mode` string — "standard" | "high"; padrão "high"
  - `generate_audio` boolean — padrão true

### Seedance 2.5 — Video extend API

Video extend with Seedance 2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/bytedance/seedance-2.5/video-extend`
- Página: https://docs.higgsfield.ai/docs/models/seedance-2-5/video-extend.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1387; 720p: $0.3264; 1080p: $0.7858. Total price = selected rate × requested extension duration in seconds. The duration of the existing input video is not added to the billed duration.
- Notas de uso:
  - Use publicly accessible media URLs; asset:// references are rejected for these endpoints.
  - The source video_url counts toward the 10-video limit, so include at most 9 additional video_urls. At most 50 media items are accepted across the source video and all reference arrays.
  - Videos and audio may be trimmed or padded during preprocessing to fit their respective 30-second total budgets. Output framing follows the source video.
  - duration is an integer from 4 to 30 seconds, with default 5.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 4..30; padrão 5
  - `video_url`\* string
  - `audio_urls` array — 1 a 10 itens
  - `image_urls` array — 1 a 30 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `video_urls` array — 1 a 10 itens
  - `bitrate_mode` string — "standard" | "high"; padrão "high"
  - `generate_audio` boolean — padrão true

### Kling 2.5 Turbo — Pro text to video API

Pro text to video with Kling 2.5 Turbo: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v2.5-turbo/pro/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-5-turbo/pro-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0525. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts 5 or 10 seconds; 5 is the default.
  - This endpoint does not expose a sound or aspect_ratio field.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `cfg_scale` number — 0..1; padrão 0.5
  - `negative_prompt` string — padrão ""

### Kling 2.5 Turbo — Pro image to video API

Pro image to video with Kling 2.5 Turbo: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v2.5-turbo/pro/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-5-turbo/pro-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0525. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts 5 or 10 seconds; 5 is the default.
  - This endpoint does not expose a sound or aspect_ratio field.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `negative_prompt` string — padrão ""

### Kling 2.5 Turbo — Standard image to video API

Standard image to video with Kling 2.5 Turbo: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v2.5-turbo/standard/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-5-turbo/standard-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0315. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts 5 or 10 seconds; 5 is the default.
  - This endpoint does not expose a sound or aspect_ratio field.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `negative_prompt` string — padrão ""

### Kling 2.6 — Pro text to video API

Pro text to video with Kling 2.6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v2.6/pro/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-6/pro-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0666. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts 5 or 10 seconds; 5 is the default.
  - Native audio uses sound: on or off and defaults to on.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `cfg_scale` number — 0..1; padrão 0.5
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"

### Kling 2.6 — Pro image to video API

Pro image to video with Kling 2.6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v2.6/pro/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-6/pro-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0666. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts 5 or 10 seconds; 5 is the default.
  - Native audio uses sound: on or off and defaults to on.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"

### Kling 2.6 Motion Control — Pro API

Pro with Kling 2.6 Motion Control: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/motion-control/pro`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-6-motion-control/pro.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0779. Billed duration is the motion-reference video duration rounded to the nearest whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use a motion-reference video from 3 to 30 seconds long. The output duration follows the source video; do not send a separate duration field.
  - Use a character image up to 10 MB with each dimension between 300 and 65,536 pixels. Images outside the 0.4–2.5 width-to-height range are adjusted before generation.
  - Videos larger than 100 MB are compressed before generation.
  - Set character_orientation to image or video. keep_original_sound uses the strings yes and no, with yes as the default.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt` string — padrão ""
  - `image_url`\* string
  - `video_url`\* string
  - `keep_original_sound` string — "yes" | "no"; padrão "yes"
  - `character_orientation` string — "image" | "video"; padrão "video"

### Kling 2.6 Motion Control — Standard API

Standard with Kling 2.6 Motion Control: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/motion-control/std`
- Página: https://docs.higgsfield.ai/docs/models/kling-2-6-motion-control/std.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0523. Billed duration is the motion-reference video duration rounded to the nearest whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use a motion-reference video from 3 to 30 seconds long. The output duration follows the source video; do not send a separate duration field.
  - Use a character image up to 10 MB with each dimension between 300 and 65,536 pixels. Images outside the 0.4–2.5 width-to-height range are adjusted before generation.
  - Videos larger than 100 MB are compressed before generation.
  - Set character_orientation to image or video. keep_original_sound uses the strings yes and no, with yes as the default.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt` string — padrão ""
  - `image_url`\* string
  - `video_url`\* string
  - `keep_original_sound` string — "yes" | "no"; padrão "yes"
  - `character_orientation` string — "image" | "video"; padrão "video"

### Kling 3.0 — 4K · Text to video API

4K · Text to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/4k/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/4k-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 4K: $0.3151. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `multi_shots` boolean — padrão false
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"
  - `multi_prompt` array — 0 a 6 itens

### Kling 3.0 — Pro · Text to video API

Pro · Text to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/pro/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/pro-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0962. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `multi_shots` boolean — padrão false
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"
  - `multi_prompt` array — 0 a 6 itens

### Kling 3.0 — Standard · Text to video API

Standard · Text to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/std/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/standard-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0714. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `multi_shots` boolean — padrão false
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"
  - `multi_prompt` array — 1 a 6 itens

### Kling 3.0 — Turbo · Text to video API

Turbo · Text to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0-turbo/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/turbo-text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0839; 1080p: $0.1049. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts integers from 3 to 15 seconds. resolution accepts 720p or 1080p and defaults to 720p.
  - This endpoint has no sound, multi_shots, elements, or last-frame field.
  - aspect_ratio accepts 16:9, 9:16, or 1:1 and defaults to 16:9.
  - Keep prompt within 3,072 characters; longer prompts are truncated.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 3..15; padrão 5
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"

### Kling 3.0 — 4K · Image to video API

4K · Image to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/4k/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/4k-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 4K: $0.3151. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - image_url is the first frame; last_image_url optionally sets the final frame.
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `multi_shots` boolean — padrão false
  - `multi_prompt` array — 0 a 6 itens
  - `last_image_url` string

### Kling 3.0 — Pro · Image to video API

Pro · Image to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/pro/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/pro-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.0962. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - image_url is the first frame; last_image_url optionally sets the final frame.
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `multi_shots` boolean — padrão false
  - `multi_prompt` array — 0 a 6 itens
  - `last_image_url` string

### Kling 3.0 — Standard · Image to video API

Standard · Image to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0/std/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/standard-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0714. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - image_url is the first frame; last_image_url optionally sets the final frame.
  - Always include a non-empty top-level prompt, including when using multi_prompt. Keep it within 2,500 characters; longer prompts are truncated.
  - For custom shots, set multi_shots to true and provide 1–6 multi_prompt objects. Each object needs prompt (at most 512 characters) and duration (a positive integer from 1 to 15 seconds).
  - Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum. With multi_shots enabled and no custom shots, the top-level duration is retained.
  - Native audio uses sound: on or off and defaults to on.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `sound` string — "on" | "off"; padrão "on"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `cfg_scale` number — 0..1; padrão 0.5
  - `image_url`\* string
  - `multi_shots` boolean — padrão false
  - `multi_prompt` array — 1 a 6 itens
  - `last_image_url` string

### Kling 3.0 — Turbo · Image to video API

Turbo · Image to video with Kling 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3.0-turbo/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/kling-3/turbo-image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0839; 1080p: $0.1049. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - duration accepts integers from 3 to 15 seconds. resolution accepts 720p or 1080p and defaults to 720p.
  - This endpoint has no sound, multi_shots, elements, or last-frame field.
  - Keep prompt within 2,500 characters; longer prompts are truncated.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 3..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p"; padrão "720p"

### Kling 3.0 Motion Control — Pro API

Pro with Kling 3.0 Motion Control: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3/motion-control/pro`
- Página: https://docs.higgsfield.ai/docs/models/kling-3-motion-control/pro.md
- Preço (API): Standard self-serve rates in USD per video second: 1080p: $0.1189. Billed duration is the motion-reference video duration rounded to the nearest whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use a motion-reference video from 3 to 30 seconds long. The output duration follows the source video; do not send a separate duration field.
  - Use a character image up to 10 MB with each dimension between 300 and 65,536 pixels. Images outside the 0.4–2.5 width-to-height range are adjusted before generation.
  - Videos larger than 100 MB are compressed before generation.
  - Set character_orientation to image or video. keep_original_sound uses the strings yes and no, with yes as the default.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt` string — padrão ""
  - `image_url`\* string
  - `video_url`\* string
  - `keep_original_sound` string — "yes" | "no"; padrão "yes"
  - `character_orientation` string — "image" | "video"; padrão "video"

### Kling 3.0 Motion Control — Standard API

Standard with Kling 3.0 Motion Control: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/v3/motion-control/std`
- Página: https://docs.higgsfield.ai/docs/models/kling-3-motion-control/std.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0920. Billed duration is the motion-reference video duration rounded to the nearest whole second. Total price = selected rate × billed duration in seconds.
- Notas de uso:
  - Use a motion-reference video from 3 to 30 seconds long. The output duration follows the source video; do not send a separate duration field.
  - Use a character image up to 10 MB with each dimension between 300 and 65,536 pixels. Images outside the 0.4–2.5 width-to-height range are adjusted before generation.
  - Videos larger than 100 MB are compressed before generation.
  - Set character_orientation to image or video. keep_original_sound uses the strings yes and no, with yes as the default.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `prompt` string — padrão ""
  - `image_url`\* string
  - `video_url`\* string
  - `keep_original_sound` string — "yes" | "no"; padrão "yes"
  - `character_orientation` string — "image" | "video"; padrão "video"

### Kling O3 — First last frame API

First last frame with Kling O3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/o3/first-last-frame`
- Página: https://docs.higgsfield.ai/docs/models/kling-o3/first-last-frame.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0683; 1080p: $0.0860. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - first_frame_url supplies the starting frame; last_frame_url is optional. These names differ from the image_url and last_image_url fields on Kling 3.0 image-to-video.
  - For a single shot, set multi_shots to false and provide prompt. For multiple shots, set multi_shots to true and provide 1–6 multi_prompt objects, each containing prompt and a positive integer duration.
  - Always include a non-empty top-level prompt, including when using multi_prompt.
  - Each shot prompt is limited to 512 characters. Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum.
  - Native audio uses sound: on or off and defaults to off.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro" | "4k"; padrão "pro"
  - `sound` string — "on" | "off"; padrão "off"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `multi_shots` boolean — padrão false
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"
  - `multi_prompt` array — 1 a 6 itens
  - `last_frame_url` string
  - `first_frame_url` string

### Kling O3 — Image reference API

Image reference with Kling O3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/o3/image-reference`
- Página: https://docs.higgsfield.ai/docs/models/kling-o3/image-reference.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0683; 1080p: $0.0860. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Supply image_urls for visual references. Reference images are optional in the schema.
  - For a single shot, set multi_shots to false and provide prompt. For multiple shots, set multi_shots to true and provide 1–6 multi_prompt objects, each containing prompt and a positive integer duration.
  - Always include a non-empty top-level prompt, including when using multi_prompt.
  - Each shot prompt is limited to 512 characters. Custom-shot durations are summed for generation and billing; the top-level duration does not override that sum.
  - Native audio uses sound: on or off and defaults to off.
  - A multi_prompt shot must last at least 1 second; zero-second shots are rejected even though the schema permits zero.
  - When multi_shots is true, multi_prompt is required even with shot_type set to intelligent.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro" | "4k"; padrão "std"
  - `sound` string — "on" | "off"; padrão "off"
  - `prompt` string
  - `duration` integer — 3..15; padrão 5
  - `elements` array
  - `shot_type` string — "customize" | "intelligent"; padrão "customize"
  - `image_urls` array
  - `multi_shots` boolean — padrão false
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"
  - `multi_prompt` array — 1 a 6 itens
  - `last_frame_url` string
  - `first_frame_url` string

### Kling O3 — Video edit API

Video edit with Kling O3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/o3/video-edit`
- Página: https://docs.higgsfield.ai/docs/models/kling-o3/video-edit.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0945; 1080p: $0.1263. Billed duration is the source video duration rounded to the nearest whole second, capped at 15 seconds. Multi-shot requests use the sum of the specified shot durations. Total price = selected rate × billed duration in seconds; input duration is not added again.
- Notas de uso:
  - Supply exactly one source video from 3 to 15.5 seconds long and no larger than 200 MB. Duration is derived from the video; do not send a separate duration field.
  - You may also supply up to four image_urls and up to four elements.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro" | "4k"; padrão "pro"
  - `prompt`\* string
  - `elements` array — 0 a 4 itens
  - `image_urls` array — 0 a 4 itens
  - `video_urls`\* array — 1 a 1 itens

### Kling O3 — Video reference API

Video reference with Kling O3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/o3/video-reference`
- Página: https://docs.higgsfield.ai/docs/models/kling-o3/video-reference.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0945; 1080p: $0.1263. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Supply exactly one video reference. duration controls the generated clip and accepts integer values from 3 to 10 seconds.
  - You may also supply up to four image_urls and up to four elements.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro"; padrão "pro"
  - `prompt`\* string
  - `duration` integer — 3..10; padrão 5
  - `elements` array — 0 a 4 itens
  - `image_urls` array — 0 a 4 itens
  - `video_urls`\* array — 1 a 1 itens
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"

### Kling Omni — First last frame API

First last frame with Kling Omni: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/omni/first-last-frame`
- Página: https://docs.higgsfield.ai/docs/models/kling-omni/first-last-frame.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0632; 1080p: $0.0837. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - first_frame_url supplies the starting frame; last_frame_url is optional. These names differ from the image_url and last_image_url fields on Kling 3.0 image-to-video.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro"; padrão "pro"
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"
  - `last_frame_url` string
  - `first_frame_url`\* string

### Kling Omni — Image reference API

Image reference with Kling Omni: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/omni/image-reference`
- Página: https://docs.higgsfield.ai/docs/models/kling-omni/image-reference.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0632; 1080p: $0.0837. Total price = selected rate × output duration in seconds. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Supply image_urls for visual references. Reference images are optional in the schema.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro"; padrão "pro"
  - `prompt`\* string
  - `duration` integer — 3..10; padrão 5
  - `elements` array
  - `image_urls` array
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"

### Kling Omni — Video edit API

Video edit with Kling Omni: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/omni/video-edit`
- Página: https://docs.higgsfield.ai/docs/models/kling-omni/video-edit.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0945; 1080p: $0.1252. Billed duration is the source video duration rounded to the nearest whole second, capped at 10 seconds. Multi-shot requests use the sum of the specified shot durations. Total price = selected rate × billed duration in seconds; input duration is not added again.
- Notas de uso:
  - Supply exactly one source video from 3 to 10 seconds long and no larger than 200 MB. Duration is derived from the video; do not send a separate duration field.
  - You may also supply up to four image_urls and up to four elements.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro"; padrão "pro"
  - `prompt`\* string
  - `elements` array — 0 a 4 itens
  - `image_urls` array — 0 a 4 itens
  - `video_urls`\* array — 1 a 1 itens

### Kling Omni — Video reference API

Video reference with Kling Omni: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/kling-video/omni/video-reference`
- Página: https://docs.higgsfield.ai/docs/models/kling-omni/video-reference.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0945; 1080p: $0.1252. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration. For explicit multi-shot requests, output duration is the sum of the shot durations.
- Notas de uso:
  - Supply exactly one video reference. duration controls the generated clip and accepts integer values from 3 to 10 seconds.
  - You may also supply up to four image_urls and up to four elements.
  - Keep the top-level prompt within 2,500 characters; longer prompts are truncated.
  - elements contains Kling element IDs as decimal strings. Each ID must belong to the account making the request; arbitrary provider IDs are rejected.
  - The example.com media URLs are placeholders. Replace them with public HTTPS URLs to your own media before submitting.
- Campos (\* = obrigatório):
  - `mode` string — "std" | "pro"; padrão "pro"
  - `prompt`\* string
  - `duration` integer — 3..10; padrão 5
  - `elements` array — 0 a 4 itens
  - `image_urls` array — 0 a 4 itens
  - `video_urls`\* array — 1 a 1 itens
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1"; padrão "16:9"

### Happy Horse 1.0 — Text to video API

Text to video with Happy Horse 1.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1/text-to-video.md
- Preço do exemplo da página (API): US$ 0.700
- Notas de uso:
  - The prompt must contain text; an empty string is rejected during submission.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 3..15; padrão 5
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1" | "4:3" | "3:4"; padrão "16:9"

### Happy Horse 1.0 — Image to video API

Image to video with Happy Horse 1.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1/image-to-video.md
- Preço do exemplo da página (API): US$ 0.700
- Notas de uso:
  - The prompt is optional. This endpoint accepts one first-frame image; it does not support a last-frame image.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt` string
  - `duration` integer — 2..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p"; padrão "720p"

### Happy Horse 1.0 — Reference to video API

Reference to video with Happy Horse 1.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1/reference-to-video.md
- Preço do exemplo da página (API): US$ 0.700
- Notas de uso:
  - Provide 1–9 reference images. This limit is enforced at submission even though the stored JSON Schema does not set minItems or maxItems. Reference videos are unsupported.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 2..15; padrão 5
  - `image_urls`\* array
  - `resolution` string — "720p" | "1080p"; padrão "720p"

### HappyHorse 1.1 — Text to video API

Text to video with HappyHorse 1.1: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/v1.1/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1-1/text-to-video.md
- Preço do exemplo da página (API): US$ 0.900
- Notas de uso:
  - The prompt must contain text; an empty string is rejected during submission.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 3..15; padrão 5
  - `resolution` string — "720p" | "1080p"; padrão "1080p"
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1" | "4:3" | "3:4"; padrão "16:9"

### HappyHorse 1.1 — Image to video API

Image to video with HappyHorse 1.1: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/v1.1/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1-1/image-to-video.md
- Preço do exemplo da página (API): US$ 0.900
- Notas de uso:
  - The prompt is optional. This endpoint accepts one first-frame image; it does not support a last-frame image.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt` string
  - `duration` integer — 2..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p"; padrão "1080p"

### HappyHorse 1.1 — Reference to video API

Reference to video with HappyHorse 1.1: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/happy-horse/v1.1/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/happy-horse-1-1/reference-to-video.md
- Preço do exemplo da página (API): US$ 0.900
- Notas de uso:
  - Provide 1–9 reference images. This limit is enforced at submission even though the stored JSON Schema does not set minItems or maxItems. Reference videos are unsupported.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 2..15; padrão 5
  - `image_urls`\* array
  - `resolution` string — "720p" | "1080p"; padrão "1080p"

### Wan 3.0 — Text to video API

Text to video with Wan 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0375; 720p: $0.0750; 1080p: $0.1500. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - This endpoint generates from text; use the separate image or reference endpoint for media inputs.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Wan 3.0 — Image to video API

Image to video with Wan 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0375; 720p: $0.0750; 1080p: $0.1500. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use image_url for the first frame and optional end_image_url for the last frame. Reference arrays belong to the reference-to-video endpoint.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `image_url`\* string
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Wan 3.0 — Reference to video API

Reference to video with Wan 3.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per second of generated video. - Without video input: 480p: $0.0375; 720p: $0.0750; 1080p: $0.1500. - With video input: 480p: $0.0747; 720p: $0.1493; 1080p: $0.3011. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration.
- Notas de uso:
  - Reference media are optional in the stored schema: only prompt is required. The example includes an image to demonstrate reference mode.
  - Send either file_url or link_url. A document or web-page reference automatically enables thinking; when both are sent, file_url takes precedence.
  - Reference video clips must be 1–30 seconds each and total at most 30 seconds. Reference audio must be WAV or MP3 and total at most 30 seconds, as specified in the production schema.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `file_url` string
  - `link_url` string
  - `audio_urls` array — 0 a 5 itens
  - `image_urls` array — 0 a 10 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `video_urls` array — 0 a 5 itens
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Wan 3.0 Prime — Text to video API

Text to video with Wan 3.0 Prime: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0-prime/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3-prime/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0510; 720p: $0.1050; 1080p: $0.2100. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - This endpoint generates from text; use the separate image or reference endpoint for media inputs.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Wan 3.0 Prime — Image to video API

Image to video with Wan 3.0 Prime: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0-prime/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3-prime/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.0510; 720p: $0.1050; 1080p: $0.2100. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Use image_url for the first frame and optional end_image_url for the last frame. Reference arrays belong to the reference-to-video endpoint.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `image_url`\* string
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Wan 3.0 Prime — Reference to video API

Reference to video with Wan 3.0 Prime: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/wan-3.0-prime/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-3-prime/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per second of generated video. - Without video input: 480p: $0.0510; 720p: $0.1050; 1080p: $0.2100. - With video input: 480p: $0.1013; 720p: $0.2084; 1080p: $0.4341. Total price = selected rate × output duration in seconds. Input video duration is not added to the billed duration.
- Notas de uso:
  - Reference media are optional in the stored schema: only prompt is required. The example includes an image to demonstrate reference mode.
  - Send either file_url or link_url. A document or web-page reference automatically enables thinking; when both are sent, file_url takes precedence.
  - Reference video clips must be 1–30 seconds each and total at most 30 seconds. Reference audio must be WAV or MP3 and total at most 30 seconds, as specified in the production schema.
  - The schema accepts seed=0, but the current implementation only forwards a nonzero seed.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `duration` integer — 2..30; padrão 5
  - `file_url` string
  - `link_url` string
  - `audio_urls` array — 0 a 5 itens
  - `image_urls` array — 0 a 10 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "1080p"
  - `video_urls` array — 0 a 5 itens
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "adaptive"; padrão "adaptive"
  - `generate_audio` boolean — padrão true
  - `enable_thinking` boolean — padrão false

### Cinema Studio 4.0 — Generate API

Generate with Cinema Studio 4.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield/cinema-studio/4.0`
- Página: https://docs.higgsfield.ai/docs/models/cinema-studio-4/generate.md
- Preço (API): Token-metered pricing. Billable video tokens = ceil((input video seconds + generated video seconds) × output width × output height × 24 fps / 1024). Image and audio references do not count as video input. At 480p or 720p, each 1,000 video tokens cost $0.0214 without video input or $0.01284 with video input (0.6× the standard rate). With video references, both input and generated video durations are billable. Rates shown are before any applicable customer discount.
- Notas de uso:
  - This is the public Cinema Studio 4.0 workflow. It uses text-to-video when references are absent and reference-to-video when any media array is nonempty.
  - Omit creative-control fields to let the director choose them automatically; the literal value "auto" is not accepted for these enum fields.
  - Optional prompt references use one-based tokens such as \<\<\<image_1>>>, \<\<\<video_1>>> and \<\<\<audio_1>>>. Each token must refer to an attached item of the same media type.
  - This endpoint produces a new video. Editing and extension use the separate Seedance 2.5 endpoints.
  - Reference media are limited to 30 images, 10 videos and 10 audio files, with at most 50 items total. Video and audio may be normalized to separate 30-second total budgets.
- Campos (\* = obrigatório):
  - `era` string — "1960s" | "1980s" | "1990s" | "2000s" | "2020s"
  - `genre` string — "epic" | "drama" | "noir" | "comedy" | "horror" | "action"
  - `light` string — "silhouette" | "practicals" | "window" | "overhead-fall" | "contre-jour" | "soft-cross"
  - `pacing` string — "chaotic" | "dynamic" | "calm" | "single-shot"
  - `prompt`\* string
  - `duration` integer — 4..30; padrão 5
  - `audio_urls` array — 0 a 10 itens
  - `image_urls` array — 0 a 30 itens
  - `resolution` string — "480p" | "720p"; padrão "720p"
  - `video_urls` array — 0 a 10 itens
  - `camera_lens` string — "clean-sharp" | "anamorphic" | "vintage-anamorphic" | "warm-vintage" | "halation-vintage"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9"; padrão "16:9"
  - `camera_model` string — "modern" | "35mm-film" | "8mm-film" | "dv-camcorder"
  - `color_palette` string — "static-noon" | "twilight-fable" | "back-row-kissing-seats" | "on-the-other-side-of-the-porthole" | "the-emerald-ambush" | "highway-standoff" | "the-faded-fresco" | "oil-ochre" | "the-mountain-convent" | "ghost-in-the-code" | "pink-velvet" | "two-days-to-the-horizon" | "industrial-fog" | "stairs-go-up" | "field-post" | "home-is-the-next-gas-station" | "glossy-flesh" | "the-crimson-ballet" | "neon-rain-at-midnight" | "the-morning-after-rain" | "the-iron-borough" | "the-ground" | "the-investigation" | "turquoise-mirage" | "a-dream-in-color" | "breakfast-on-schedule" | "favela-gold" | "a-hotel-for-one" | "after-dark" | "crimson-vigi" | "the-neighbors-saw-everything" | "the-grey-channel" | "mirage-at-noon" | "bubblegum-boulevard" | "yellow-room" | "the-earth-keeps-things-reluctantly" | "tropic-fever-dream" | "bioluminescent-night" | "dont-turn-it-off-im-watching" | "the-silk-curtain-falls" | "the-butterfly" | "playtime" | "wallpaper-romance" | "overtime" | "the-way-home-is-longer" | "everyone-speaks-in-whispers" | "runaway-summer" | "amber-wasteland" | "the-circus" | "gasoline-sunset"
  - `generate_audio` boolean — padrão true
  - `camera_aperture` string — "f14-wide-open" | "f4-moderate" | "f11-deep-focus"
  - `camera_movement` string — "snorricam" | "robot-arm" | "tilt-up" | "rack-focus" | "tilt-down" | "pov" | "pan-left" | "crane-up" | "pan-right" | "crane-down" | "side-tracking" | "pedestal-up" | "pedestal-down" | "handheld" | "tracking" | "drone-orbit" | "dolly-zoom" | "aerial-pullback" | "static-shot" | "bullet-time" | "whip-pan" | "slow-zoom-in" | "arc-left" | "slow-zoom-out" | "arc-right" | "truck-right" | "dolly-in" | "truck-left" | "dolly-out" | "slider-right" | "crush-zoom" | "slider-left" | "helicopter-shot"

### LTX-2.5 — Text to video fast API

Text to video fast with LTX-2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/lightricks/ltx-2.5/text-to-video/fast`
- Página: https://docs.higgsfield.ai/docs/models/ltx-2-5/text-to-video-fast.md
- Preço do exemplo da página (API): US$ 0.540
- Notas de uso:
  - duration is marked required in the schema and has default 6; the API applies this top-level default before validation. The example includes it explicitly.
  - Fast supports 720p, 1080p, 2k or 4k and 24, 25, 48 or 50 fps.
- Campos (\* = obrigatório):
  - `fps` integer — 24 | 25 | 48 | 50; padrão 25
  - `prompt`\* string — até 5000 caracteres
  - `duration`\* integer — 6 | 8 | 10; padrão 6
  - `resolution` string — "720p" | "1080p" | "2k" | "4k"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16"; padrão "16:9"
  - `generate_audio` boolean — padrão true
  - `camera_movement` string — "dolly_in" | "dolly_out" | "dolly_left" | "dolly_right" | "jib_up" | "jib_down" | "static" | "focus_shift"

### LTX-2.5 — Text to video pro API

Text to video pro with LTX-2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/lightricks/ltx-2.5/text-to-video/pro`
- Página: https://docs.higgsfield.ai/docs/models/ltx-2-5/text-to-video-pro.md
- Preço do exemplo da página (API): US$ 0.720
- Notas de uso:
  - duration is marked required in the schema and has default 6; the API applies this top-level default before validation. The example includes it explicitly.
  - Pro supports 720p or 1080p and 24, 25 or 50 fps. Use the Fast endpoint for 2k, 4k or 48 fps.
- Campos (\* = obrigatório):
  - `fps` integer — 24 | 25 | 50; padrão 25
  - `prompt`\* string — até 5000 caracteres
  - `duration`\* integer — 6 | 8 | 10; padrão 6
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16"; padrão "16:9"
  - `generate_audio` boolean — padrão true
  - `camera_movement` string — "dolly_in" | "dolly_out" | "dolly_left" | "dolly_right" | "jib_up" | "jib_down" | "static" | "focus_shift"

### LTX-2.5 — Image to video fast API

Image to video fast with LTX-2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/lightricks/ltx-2.5/image-to-video/fast`
- Página: https://docs.higgsfield.ai/docs/models/ltx-2-5/image-to-video-fast.md
- Preço do exemplo da página (API): US$ 0.540
- Notas de uso:
  - duration is marked required in the schema and has default 6; the API applies this top-level default before validation. The example includes it explicitly.
  - Fast supports 720p, 1080p, 2k or 4k and 24, 25, 48 or 50 fps.
  - image_url is the required first frame; end_image_url is an optional last frame. aspect_ratio explicitly controls output dimensions.
- Campos (\* = obrigatório):
  - `fps` integer — 24 | 25 | 48 | 50; padrão 25
  - `prompt`\* string — até 5000 caracteres
  - `duration`\* integer — 6 | 8 | 10; padrão 6
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p" | "2k" | "4k"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16"; padrão "16:9"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true
  - `camera_movement` string — "dolly_in" | "dolly_out" | "dolly_left" | "dolly_right" | "jib_up" | "jib_down" | "static" | "focus_shift"

### LTX-2.5 — Image to video pro API

Image to video pro with LTX-2.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/lightricks/ltx-2.5/image-to-video/pro`
- Página: https://docs.higgsfield.ai/docs/models/ltx-2-5/image-to-video-pro.md
- Preço do exemplo da página (API): US$ 0.720
- Notas de uso:
  - duration is marked required in the schema and has default 6; the API applies this top-level default before validation. The example includes it explicitly.
  - Pro supports 720p or 1080p and 24, 25 or 50 fps. Use the Fast endpoint for 2k, 4k or 48 fps.
  - image_url is the required first frame; end_image_url is an optional last frame. aspect_ratio explicitly controls output dimensions.
- Campos (\* = obrigatório):
  - `fps` integer — 24 | 25 | 50; padrão 25
  - `prompt`\* string — até 5000 caracteres
  - `duration`\* integer — 6 | 8 | 10; padrão 6
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16"; padrão "16:9"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true
  - `camera_movement` string — "dolly_in" | "dolly_out" | "dolly_left" | "dolly_right" | "jib_up" | "jib_down" | "static" | "focus_shift"

### MiniMax H3 — Text to video API

Text to video with MiniMax H3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/minimax/h3/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/minimax-h3/text-to-video.md
- Preço do exemplo da página (API): US$ 0.650
- Notas de uso:
  - Resolution is fixed to the case-sensitive schema value "2K". The prompt must contain non-whitespace text; the current provider serializer uses only its first 7,000 characters.
  - For text-only requests, aspect_ratio="auto" or "adaptive" resolves to 16:9.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5..15; padrão 5
  - `resolution` string — "2K"; padrão "2K"
  - `aspect_ratio` string — "auto" | "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16"; padrão "auto"
  - `aigc_watermark` boolean — padrão false

### MiniMax H3 — Image to video API

Image to video with MiniMax H3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/minimax/h3/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/minimax-h3/image-to-video.md
- Preço do exemplo da página (API): US$ 0.650
- Notas de uso:
  - Resolution is fixed to the case-sensitive schema value "2K". The prompt must contain non-whitespace text; the current provider serializer uses only its first 7,000 characters.
  - The output aspect ratio follows the input keyframe even when aspect_ratio is supplied. end_image_url is an optional last frame.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "2K"; padrão "2K"
  - `aspect_ratio` string — "auto" | "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16"; padrão "auto"
  - `end_image_url` string
  - `aigc_watermark` boolean — padrão false

### MiniMax H3 — Reference to video API

Reference to video with MiniMax H3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/minimax/h3/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/minimax-h3/reference-to-video.md
- Preço (API): 2K output costs $0.13 per generated second. The first five reference images are included; each additional reference image costs $0.08. Rates shown are before any applicable customer discount.
- Notas de uso:
  - Resolution is fixed to the case-sensitive schema value "2K". The prompt must contain non-whitespace text; the current provider serializer uses only its first 7,000 characters.
  - Provide at least one image or video reference. Audio references require an image or video reference and cannot be used alone.
  - Reference media may be cropped, resized, transcoded and trimmed. Video duration and audio duration are each normalized to fit within the provider's 15-second total budget.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5..15; padrão 5
  - `audio_urls` array — 0 a 3 itens
  - `image_urls` array — 1 a 9 itens
  - `resolution` string — "2K"; padrão "2K"
  - `video_urls` array — 1 a 3 itens
  - `aspect_ratio` string — "auto" | "adaptive" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16"; padrão "auto"
  - `aigc_watermark` boolean — padrão false

### Hailuo 2.3 — Standard text to video API

Standard text to video with Hailuo 2.3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/minimax/hailuo-2.3/standard/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/hailuo-2-3/standard-text-to-video.md
- Preço do exemplo da página (API): US$ 0.280
- Notas de uso:
  - This Standard endpoint uses a fixed 768P output resolution; resolution is not a configurable field in the production schema.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 6 | 10; padrão 6
  - `prompt_optimizer` boolean — padrão true

### Hailuo 2.3 — Standard image to video API

Standard image to video with Hailuo 2.3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/minimax/hailuo-2.3/standard/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/hailuo-2-3/standard-image-to-video.md
- Preço do exemplo da página (API): US$ 0.280
- Notas de uso:
  - This Standard endpoint uses a fixed 768P output resolution; resolution is not a configurable field in the production schema.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 6 | 10; padrão 6
  - `image_url`\* string
  - `prompt_optimizer` boolean — padrão true

### PixVerse V6 — Text to video API

Text to video with PixVerse V6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/pixverse/v6/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/pixverse-v6/text-to-video.md
- Preço do exemplo da página (API): US$ 0.255
- Notas de uso:
  - duration is a number from 1 to 15, so the schema allows fractional values. If negative_prompt is supplied, it must contain 1–2,048 characters.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string — até 5000 caracteres
  - `duration` number — 1..15; padrão 5
  - `resolution` string — "360p" | "540p" | "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "4:3" | "1:1" | "3:4" | "9:16"; padrão "16:9"
  - `generate_audio` boolean — padrão true
  - `negative_prompt` string — até 2048 caracteres

### PixVerse V6 — Image to video API

Image to video with PixVerse V6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/pixverse/v6/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/pixverse-v6/image-to-video.md
- Preço do exemplo da página (API): US$ 0.255
- Notas de uso:
  - duration is a number from 1 to 15, so the schema allows fractional values. If negative_prompt is supplied, it must contain 1–2,048 characters.
  - Use image_url for the first frame and optional end_image_url for the last frame. This endpoint has no aspect_ratio parameter; framing comes from the input image.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string — até 5000 caracteres
  - `duration` number — 1..15; padrão 5
  - `image_url`\* string
  - `resolution` string — "360p" | "540p" | "720p" | "1080p"; padrão "720p"
  - `end_image_url` string
  - `generate_audio` boolean — padrão true
  - `negative_prompt` string — até 2048 caracteres

### Wan 2.6 — Text to video API

Text to video with Wan 2.6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.6/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-6/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0752; 1080p: $0.1129. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Setting multi_shots=true also enables prompt_extend, even if prompt_extend was false.
- Campos (\* = obrigatório):
  - `seed` integer — -1..10000000
  - `prompt`\* string
  - `duration` integer — 5 | 10 | 15; padrão 5
  - `audio_url` string
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `multi_shots` boolean — padrão false
  - `prompt_extend` boolean — padrão false

### Wan 2.6 — Image to video API

Image to video with Wan 2.6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.6/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-6/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 480p: $0.1000; 720p: $0.0752; 1080p: $0.1129. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Setting multi_shots=true also enables prompt_extend, even if prompt_extend was false.
  - Input images may be resized to fit a 1,440-pixel maximum dimension before generation. A last-frame input is unsupported.
- Campos (\* = obrigatório):
  - `seed` integer — -1..10000000
  - `prompt`\* string
  - `duration` integer — 5 | 10 | 15; padrão 5
  - `audio_url` string
  - `image_url`\* string
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "720p"
  - `multi_shots` boolean — padrão false
  - `prompt_extend` boolean — padrão false
  - `negative_prompt` string — padrão ""

### Wan 2.6 — Reference to video API

Reference to video with Wan 2.6: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.6/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-6/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0752; 1080p: $0.1129. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Supply 1–3 reference videos. This endpoint supports only 5 or 10 seconds, unlike the text and image endpoints that also support 15 seconds.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 5 | 10; padrão 5
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `video_urls`\* array — 1 a 3 itens
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1" | "4:3" | "3:4"; padrão "16:9"

### Wan 2.7 — Text to video API

Text to video with Wan 2.7: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.7/text-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-7/text-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0750; 1080p: $0.1125. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - The prompt must contain text. audio_url can supply driving audio.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 2..15; padrão 5
  - `audio_url` string
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `aspect_ratio` string — "16:9" | "9:16" | "1:1" | "4:3" | "3:4"; padrão "16:9"
  - `prompt_extend` boolean — padrão false
  - `negative_prompt` string — padrão ""

### Wan 2.7 — Image to video API

Image to video with Wan 2.7: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.7/image-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-7/image-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0750; 1080p: $0.1125. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - The prompt is optional. end_image_url supplies a last frame, and audio_url can supply driving audio.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt` string
  - `duration` integer — 2..15; padrão 5
  - `audio_url` string
  - `image_url`\* string
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `end_image_url` string
  - `prompt_extend` boolean — padrão false
  - `negative_prompt` string — padrão ""

### Wan 2.7 — Reference to video API

Reference to video with Wan 2.7: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/wan/v2.7/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/wan-2-7/reference-to-video.md
- Preço (API): Standard self-serve rates in USD per video second: 720p: $0.0750; 1080p: $0.1125. Total price = selected rate × output duration in seconds.
- Notas de uso:
  - Provide a nonempty image_urls or video_urls array. The combined number of image and video references must not exceed 5; this submission limit is not expressed in the stored JSON Schema.
  - Reference generation is limited to 2–10 seconds and aspect ratios 16:9 or 9:16.
- Campos (\* = obrigatório):
  - `seed` integer — 1..2147483646
  - `prompt`\* string
  - `duration` integer — 2..10; padrão 5
  - `image_urls` array
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `video_urls` array
  - `aspect_ratio` string — "16:9" | "9:16"; padrão "16:9"
  - `prompt_extend` boolean — padrão false
  - `negative_prompt` string — padrão ""

### Grok Imagine Video 1.5 — Reference to video API

Reference to video with Grok Imagine Video 1.5: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/xai/grok-imagine-video/v1.5/reference-to-video`
- Página: https://docs.higgsfield.ai/docs/models/grok-video-1-5/reference-to-video.md
- Preço do exemplo da página (API): US$ 0.410
- Notas de uso:
  - This endpoint also accepts text-only requests or one first-frame image. Choose either image_url or reference media (image_urls/audio_url); do not combine these modes.
  - When image_urls or audio_url is provided, resolution must be 480p or 720p. The shared schema also lists 1080p, which is rejected in reference mode.
  - Input images must decode as JPEG, PNG, WebP or GIF; SVG and XML are unsupported.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `duration` integer — 1..15; padrão 5
  - `audio_url` string
  - `image_url` string
  - `image_urls` array — 0 a 7 itens
  - `resolution` string — "480p" | "720p" | "1080p"; padrão "480p"
  - `aspect_ratio` string — "auto" | "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3"; padrão "auto"

## Imagem

### SOUL — Text to image API

Text to image with SOUL: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield-ai/soul/standard`
- Página: https://docs.higgsfield.ai/docs/models/soul-standard/generate.md
- Preço do exemplo da página (API): US$ 0.094
- Notas de uso:
  - batch_size is 1 or 4 only. A custom_reference_id must belong to the calling account and have completed training.
  - aspect_ratio defaults to 4:3; enhance_prompt defaults to false; style_id defaults to 464ea177-8d40-4940-8d9d-b438bab269c7.
  - Optional image_reference_url guides prompt enhancement; it is distinct from custom_reference_id for a trained character.
  - seed may be omitted or null; generation selects a random seed when it is absent.
  - Short prompts using the general style can be enhanced automatically even when enhance_prompt=false.
  - custom_reference_strength=0 uses the selected style's default character strength; it does not disable the character reference.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `aspect_ratio` string — "9:16" | "16:9" | "4:3" | "3:4" | "1:1" | "2:3" | "3:2"; padrão "4:3"
  - `enhance_prompt` boolean — padrão false
  - `style_id` string — padrão "464ea177-8d40-4940-8d9d-b438bab269c7"
  - `style_strength` number — 0..1; padrão 1
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `seed` vários — padrão null
  - `custom_reference_id` vários — padrão null
  - `custom_reference_strength` number — 0..1; padrão 1
  - `image_reference_url` vários — padrão null
  - `batch_size` integer — 1 | 4; padrão 1

### SOUL V2 — Text to image API

Text to image with SOUL V2: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield-ai/soul/v2/standard`
- Página: https://docs.higgsfield.ai/docs/models/soul-2/generate.md
- Preço do exemplo da página (API): US$ 0.004
- Notas de uso:
  - batch_size is 1 or 4 only. A custom_reference_id must belong to the calling account and have completed training.
  - aspect_ratio defaults to 1:1 and enhance_prompt defaults to false. seed defaults to a random integer from 1 to 1000000; explicit null is invalid.
  - style_id defaults to 3db34ab5-3439-4317-9e03-08dc30852e69. style_strength is accepted by the request schema but currently has no effect on generation.
  - Short prompts using the general style can be enhanced automatically even when enhance_prompt=false.
  - When using custom_reference_id, set custom_reference_strength to a value greater than 0 and no greater than 1. The schema accepts 0, but the current runtime fails to process it for a character reference.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `aspect_ratio` string — "9:16" | "16:9" | "4:3" | "3:4" | "1:1" | "2:3" | "3:2"; padrão "1:1"
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `enhance_prompt` boolean — padrão false
  - `custom_reference_id` vários — padrão null
  - `custom_reference_strength` number — 0..1; padrão 1
  - `style_id` string — padrão "3db34ab5-3439-4317-9e03-08dc30852e69"
  - `style_strength` number — 0..1; padrão 1
  - `seed` integer — 1..1000000
  - `batch_size` integer — 1 | 4; padrão 1

### SOUL Cinema — Text to image API

Text to image with SOUL Cinema: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield-ai/soul/cinema`
- Página: https://docs.higgsfield.ai/docs/models/soul-cinema/generate.md
- Preço do exemplo da página (API): US$ 0.004
- Notas de uso:
  - batch_size is 1 or 4 only. A custom_reference_id must belong to the calling account and have completed training.
  - aspect_ratio defaults to 1:1 and enhance_prompt defaults to false. seed defaults to a random integer from 1 to 1000000; explicit null is invalid.
  - Providing a custom_reference_id enables prompt enhancement for the character reference, even if enhance_prompt is false.
  - Cinema uses a fixed style; client-supplied style_id is ignored.
  - This model may be absent from model discovery; authorized requests can use the endpoint ID directly.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `aspect_ratio` string — "9:16" | "16:9" | "4:3" | "3:4" | "1:1" | "2:3" | "3:2"; padrão "1:1"
  - `enhance_prompt` boolean — padrão false
  - `resolution` string — "720p" | "1080p"; padrão "720p"
  - `custom_reference_id` vários — padrão null
  - `custom_reference_strength` number — 0..1; padrão 1
  - `seed` integer — 1..1000000
  - `batch_size` integer — 1 | 4; padrão 1

### Soul ID — Create character API

Create character with Soul ID: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/v1/custom-references`
- Página: https://docs.higgsfield.ai/docs/models/soul-id/create-character.md
- Notas de uso:
  - Soul ID trains a reusable character reference. This is not an image-generation endpoint; do not POST to /soul-id.
  - Use POST /v1/custom-references with application/json. name has a maximum length of 100; input_images must contain 1–100 \{"type":"image_url","image_url":"..."} objects.
  - model_version accepts v1, v2, cinema; its default is v1. Choose the matching generation family.
  - The creation response returns id and status. Poll GET /v1/custom-references/\{id}; statuses are not_ready, queued, in_progress, completed, and failed.
  - After completion, pass the returned id as custom_reference_id to the matching Soul generation endpoint. References are scoped to the account that created them.
  - When the account already has the maximum number of references in training, creation returns 429 Too Many Requests with a Retry-After header. Retry after that delay; nothing is charged for the rejected request.
- Campos (\* = obrigatório):
  - `name`\* string — até 100 caracteres
  - `model_version` ? — padrão "v1"
  - `input_images`\* array — 1 a 100 itens

### Marketing Studio Image — 2.0 Alpha API

2.0 Alpha with Marketing Studio Image: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/marketing-studio/image`
- Página: https://docs.higgsfield.ai/docs/models/marketing-studio-image/generate-and-edit.md
- Preço do exemplo da página (API): US$ 0.439
- Notas de uso:
  - Omit image_urls for text-to-image; provide up to 16 URLs for editing when enhance_prompt=false.
  - enhance_prompt=true requires an existing preset_id and 1–2 image URLs: product first, optional person/model reference second. Discover presets with GET /marketing-studio/image/presets.
  - Reference images must be valid JPEG, PNG, or WebP. Oversized supported images are normalized before rendering.
  - With enhancement enabled, aspect_ratio=auto uses the preset ratio. With enhancement disabled, current production mappings use square output for auto.
  - The 1k/2k/4k values are resolution tiers; exact pixel dimensions depend on the aspect ratio.
  - With enhance_prompt=true, quality must be high. This endpoint accepts low, medium, or high for unenhanced requests.
- Campos (\* = obrigatório):
  - `prompt`\* string — até 5000 caracteres
  - `quality` string — "low" | "medium" | "high"; padrão "high"
  - `preset_id` string
  - `image_urls` array — 0 a 16 itens
  - `moderation` string — "auto" | "low"; padrão "auto"
  - `resolution` string — "1k" | "2k" | "4k"; padrão "2k"
  - `aspect_ratio` string — "auto" | "1:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9"; padrão "auto"
  - `enhance_prompt` boolean — padrão false

### Marketing Studio Image — 2.5 Flare API

2.5 Flare with Marketing Studio Image: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/marketing-studio/image/flare`
- Página: https://docs.higgsfield.ai/docs/models/marketing-studio-image/flare.md
- Preço (API): Per 1M tokens: text input $5, cached text input $1.25, text output $10; image input $8, cached image input $2, image output $30. Quality defaults to high. Final cost uses actual token usage and standard credit rounding. The initial charge is an estimate reconciled on completion.
- Notas de uso:
  - Omit image_urls for text-to-image; provide up to 16 URLs for editing when enhance_prompt=false.
  - enhance_prompt=true requires an existing preset_id and 1–2 image URLs: product first, optional person/model reference second. Discover presets with GET /marketing-studio/image/presets.
  - Reference images must be valid JPEG, PNG, or WebP. Oversized supported images are normalized before rendering.
  - With enhancement enabled, aspect_ratio=auto uses the preset ratio. With enhancement disabled, current production mappings use square output for auto.
  - The 1k/2k/4k values are resolution tiers; exact pixel dimensions depend on the aspect ratio.
  - quality accepts low, medium, high, xhigh, max and remains selectable with enhancement enabled.
- Campos (\* = obrigatório):
  - `prompt`\* string — até 5000 caracteres
  - `quality` string — "low" | "medium" | "high" | "xhigh" | "max"; padrão "high"
  - `preset_id` string
  - `image_urls` array — 0 a 16 itens
  - `moderation` string — "auto" | "low"; padrão "auto"
  - `resolution` string — "1k" | "2k" | "4k"; padrão "2k"
  - `aspect_ratio` string — "auto" | "1:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9"; padrão "auto"
  - `enhance_prompt` boolean — padrão false

### Marketing Studio Image — 2.5 Sunburst API

2.5 Sunburst with Marketing Studio Image: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/marketing-studio/image/sunburst`
- Página: https://docs.higgsfield.ai/docs/models/marketing-studio-image/sunburst.md
- Preço (API): Per 1M tokens: text input $5, cached text input $1.25, text output $10; image input $8, cached image input $2, image output $30. Quality defaults to high. Final cost uses actual token usage and standard credit rounding. The initial charge is an estimate reconciled on completion.
- Notas de uso:
  - Omit image_urls for text-to-image; provide up to 16 URLs for editing when enhance_prompt=false.
  - enhance_prompt=true requires an existing preset_id and 1–2 image URLs: product first, optional person/model reference second. Discover presets with GET /marketing-studio/image/presets.
  - Reference images must be valid JPEG, PNG, or WebP. Oversized supported images are normalized before rendering.
  - With enhancement enabled, aspect_ratio=auto uses the preset ratio. With enhancement disabled, current production mappings use square output for auto.
  - The 1k/2k/4k values are resolution tiers; exact pixel dimensions depend on the aspect ratio.
  - quality accepts low, medium, high, xhigh, max and remains selectable with enhancement enabled.
- Campos (\* = obrigatório):
  - `prompt`\* string — até 5000 caracteres
  - `quality` string — "low" | "medium" | "high" | "xhigh" | "max"; padrão "high"
  - `preset_id` string
  - `image_urls` array — 0 a 16 itens
  - `moderation` string — "auto" | "low"; padrão "auto"
  - `resolution` string — "1k" | "2k" | "4k"; padrão "2k"
  - `aspect_ratio` string — "auto" | "1:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9"; padrão "auto"
  - `enhance_prompt` boolean — padrão false

### Ads Studio — Generate ads API

Generate ads with Ads Studio: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/higgsfield/ads-studio/v1.0`
- Página: https://docs.higgsfield.ai/docs/models/ads-studio/generate.md
- Preço (API): Per 1M tokens: text input $5, cached text input $1.25, text output $10; image input $8, cached image input $2, image output $30. Quality defaults to high. Final cost uses actual token usage and standard credit rounding. The initial charge is an estimate reconciled on completion.
- Notas de uso:
  - Submit one request with your brief. Ad concepts are prepared automatically, then rendered as images; no separate preparation or generate call is required.
  - batch_size selects 1–8 ad concepts. Each concept produces one image, so a fully successful batch returns batch_size images.
  - Rendering uses GPT Image 2.5 Flare with fixed 2k resolution and high quality. Exact dimensions depend on aspect_ratio. quality, resolution, renderer and fallback model are not public inputs.
  - All outputs in a batch use the requested aspect_ratio. Omitting it selects 1:1. The value auto is not supported.
  - Set HF_API_KEY_ID and HF_API_KEY_SECRET to your API credentials. Set a unique IDEMPOTENCY_KEY for each intended generation; reuse it only when retrying that same request.
- Campos (\* = obrigatório):
  - `niche` string — até 1000 caracteres; padrão ""
  - `prompt`\* string — até 8000 caracteres
  - `language` string — até 80 caracteres; padrão ""
  - `batch_size` integer — 1..8; padrão 1
  - `image_urls` array — 0 a 10 itens; padrão []
  - `aspect_ratio` string — "1:1" | "4:5" | "5:4" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "3:2" | "2:3" | "2:1" | "1:2" | "3:1" | "1:3"; padrão "1:1"
  - `target_audience` string — até 2000 caracteres; padrão ""

### Grok Image 2.0 — Generate and edit API

Generate and edit with Grok Image 2.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/xai/grok-imagine-image-2.0`
- Página: https://docs.higgsfield.ai/docs/models/grok-image-2/generate-and-edit.md
- Preço do exemplo da página (API): US$ 0.060
- Notas de uso:
  - Supports both text-to-image and editing: omit image_urls for generation, or supply up to 10 references for editing.
  - quality accepts low or medium only; resolution accepts 1k or 2k. aspect_ratio defaults to auto.
  - Reference images may be resized during preprocessing before submission. The request produces one image; no batch count is declared.
- Campos (\* = obrigatório):
  - `prompt`\* string
  - `quality` string — "low" | "medium"; padrão "medium"
  - `image_urls` array — 0 a 10 itens
  - `resolution` string — "1k" | "2k"; padrão "1k"
  - `aspect_ratio` string — "auto" | "1:1" | "1:2" | "2:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16"; padrão "auto"

### Recraft V4.1 — Text to image API

Text to image with Recraft V4.1: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/recraft/v4.1/text-to-image`
- Página: https://docs.higgsfield.ai/docs/models/recraft-v4-1/text-to-image.md
- Preço do exemplo da página (API): US$ 0.035
- Notas de uso:
  - This variant accepts only resolution=1k; use the separate standard/Pro endpoint for the other resolution tier.
  - colors is an array of objects shaped as \{"rgb": \[R, G, B]}; background_color is one such object. Every RGB value is an integer 0–255, with exactly three entries.
  - output_format is jpg, png, or webp; default is jpg. No reference-image input is declared.
  - prompt must contain 1–10000 characters. Fourteen aspect-ratio values are listed in the schema, including 6:10, 14:10, and 10:14.
- Campos (\* = obrigatório):
  - `colors` array
  - `prompt`\* string — até 10000 caracteres
  - `resolution` string — "1k"; padrão "1k"
  - `aspect_ratio` string — "1:1" | "2:1" | "1:2" | "3:2" | "2:3" | "4:3" | "3:4" | "5:4" | "4:5" | "6:10" | "14:10" | "10:14" | "16:9" | "9:16"; padrão "1:1"
  - `output_format` string — "jpg" | "png" | "webp"; padrão "jpg"
  - `background_color` object

### Recraft V4.1 Pro — Text to image API

Text to image with Recraft V4.1 Pro: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/recraft/v4.1/pro/text-to-image`
- Página: https://docs.higgsfield.ai/docs/models/recraft-v4-1-pro/generate.md
- Preço do exemplo da página (API): US$ 0.210
- Notas de uso:
  - This variant accepts only resolution=2k; use the separate standard/Pro endpoint for the other resolution tier.
  - colors is an array of objects shaped as \{"rgb": \[R, G, B]}; background_color is one such object. Every RGB value is an integer 0–255, with exactly three entries.
  - output_format is jpg, png, or webp; default is jpg. No reference-image input is declared.
  - prompt must contain 1–10000 characters. Fourteen aspect-ratio values are listed in the schema, including 6:10, 14:10, and 10:14.
- Campos (\* = obrigatório):
  - `colors` array
  - `prompt`\* string — até 10000 caracteres
  - `resolution` string — "2k"; padrão "2k"
  - `aspect_ratio` string — "1:1" | "2:1" | "1:2" | "3:2" | "2:3" | "4:3" | "3:4" | "5:4" | "4:5" | "6:10" | "14:10" | "10:14" | "16:9" | "9:16"; padrão "1:1"
  - `output_format` string — "jpg" | "png" | "webp"; padrão "jpg"
  - `background_color` object

### Recraft V4.1 Utility — Text to image API

Text to image with Recraft V4.1 Utility: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/recraft/v4.1/utility/text-to-image`
- Página: https://docs.higgsfield.ai/docs/models/recraft-v4-1-utility/text-to-image.md
- Preço do exemplo da página (API): US$ 0.035
- Notas de uso:
  - This variant accepts only resolution=1k; use the separate standard/Pro endpoint for the other resolution tier.
  - colors is an array of objects shaped as \{"rgb": \[R, G, B]}; background_color is one such object. Every RGB value is an integer 0–255, with exactly three entries.
  - output_format is jpg, png, or webp; default is jpg. No reference-image input is declared.
  - prompt must contain 1–10000 characters. Fourteen aspect-ratio values are listed in the schema, including 6:10, 14:10, and 10:14.
- Campos (\* = obrigatório):
  - `colors` array
  - `prompt`\* string — até 10000 caracteres
  - `resolution` string — "1k"; padrão "1k"
  - `aspect_ratio` string — "1:1" | "2:1" | "1:2" | "3:2" | "2:3" | "4:3" | "3:4" | "5:4" | "4:5" | "6:10" | "14:10" | "10:14" | "16:9" | "9:16"; padrão "1:1"
  - `output_format` string — "jpg" | "png" | "webp"; padrão "jpg"
  - `background_color` object

### Recraft V4.1 Utility Pro — Text to image API

Text to image with Recraft V4.1 Utility Pro: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/recraft/v4.1/utility/pro/text-to-image`
- Página: https://docs.higgsfield.ai/docs/models/recraft-v4-1-utility-pro/text-to-image.md
- Preço do exemplo da página (API): US$ 0.210
- Notas de uso:
  - This variant accepts only resolution=2k; use the separate standard/Pro endpoint for the other resolution tier.
  - colors is an array of objects shaped as \{"rgb": \[R, G, B]}; background_color is one such object. Every RGB value is an integer 0–255, with exactly three entries.
  - output_format is jpg, png, or webp; default is jpg. No reference-image input is declared.
  - prompt must contain 1–10000 characters. Fourteen aspect-ratio values are listed in the schema, including 6:10, 14:10, and 10:14.
- Campos (\* = obrigatório):
  - `colors` array
  - `prompt`\* string — até 10000 caracteres
  - `resolution` string — "2k"; padrão "2k"
  - `aspect_ratio` string — "1:1" | "2:1" | "1:2" | "3:2" | "2:3" | "4:3" | "3:4" | "5:4" | "4:5" | "6:10" | "14:10" | "10:14" | "16:9" | "9:16"; padrão "1:1"
  - `output_format` string — "jpg" | "png" | "webp"; padrão "jpg"
  - `background_color` object

### Qwen Image 3 — Text to image API

Text to image with Qwen Image 3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/qwen-image-3/text-to-image`
- Página: https://docs.higgsfield.ai/docs/models/qwen-image-3/text-to-image.md
- Preço do exemplo da página (API): US$ 0.040
- Notas de uso:
  - prompt must contain non-whitespace text. The schema imposes no character maximum; its 4,500-token guidance is advisory.
  - enable_thinking defaults to true and requires prompt_extend=true. Set both to false to disable enhancement.
  - prompt_extend_mode supports direct or agent. No reference images are accepted by this endpoint.
  - resolution is a tier; 2k square maps to 1536 by 1536 pixels, not 2048 by 2048.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `resolution` string — "1k" | "2k"; padrão "1k"
  - `aspect_ratio` string — "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "7:9" | "9:7" | "9:16" | "16:9" | "21:9"; padrão "1:1"
  - `prompt_extend` boolean — padrão true
  - `enable_thinking` boolean — padrão true
  - `negative_prompt` string
  - `prompt_extend_mode` string — "direct" | "agent"; padrão "direct"

### Qwen Image 3 — Edit images API

Edit images with Qwen Image 3: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/alibaba/qwen-image-3/edit`
- Página: https://docs.higgsfield.ai/docs/models/qwen-image-3/edit.md
- Preço do exemplo da página (API): US$ 0.040
- Notas de uso:
  - Provide 1–3 ordered reference image URLs. The list is required and cannot be empty.
  - enable_thinking defaults to true and requires prompt_extend=true. Set both to false to disable enhancement.
  - prompt_extend_mode accepts only direct; agent enhancement is unavailable on editing requests.
  - prompt must contain non-whitespace text. The 2k square output tier maps to 1536 by 1536 pixels.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string
  - `image_urls`\* array — 1 a 3 itens
  - `resolution` string — "1k" | "2k"; padrão "1k"
  - `aspect_ratio` string — "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "7:9" | "9:7" | "9:16" | "16:9" | "21:9"; padrão "1:1"
  - `prompt_extend` boolean — padrão true
  - `enable_thinking` boolean — padrão true
  - `negative_prompt` string
  - `prompt_extend_mode` string — "direct"; padrão "direct"

### Ideogram 4.0 — Generate API

Generate with Ideogram 4.0: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/ideogram/v4.0`
- Página: https://docs.higgsfield.ai/docs/models/ideogram-4/generate.md
- Preço do exemplo da página (API): US$ 0.060
- Notas de uso:
  - Omit image_url for text-to-image; provide image_url for remix/editing.
  - image_weight controls preservation of the input image and applies to editing requests only; values are integers from 1 to 100.
  - The square 1:1 aspect ratio is applied by default, including when an input image is supplied.
  - rendering_speed values are case-sensitive: TURBO, DEFAULT, QUALITY. prompt must contain 2–2048 characters.
- Campos (\* = obrigatório):
  - `prompt`\* string — até 2048 caracteres
  - `image_url` string
  - `aspect_ratio` string — "1:1" | "1:2" | "2:1" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "16:9" | "5:8" | "8:5" | "3:4" | "4:3" | "9:22" | "22:9" | "9:23" | "23:9" | "3:8" | "8:3" | "5:12" | "12:5" | "1:3" | "3:1"; padrão "1:1"
  - `image_weight` integer — 1..100
  - `rendering_speed` string — "TURBO" | "DEFAULT" | "QUALITY"; padrão "DEFAULT"

### Z-Image Turbo — Generate API

Generate with Z-Image Turbo: request parameters, examples and response handling.
- Endereço: `POST https://api.higgsfield.ai/z-image/turbo`
- Página: https://docs.higgsfield.ai/docs/models/z-image-turbo/generate.md
- Preço do exemplo da página (API): US$ 0.015
- Notas de uso:
  - Text-to-image only. prompt must contain non-whitespace text and at most 800 characters.
  - prompt_extend defaults to false; enabling it uses the enhanced pricing tier.
  - The schema accepts 1k and 2k tiers, ten aspect ratios, and an optional integer seed from 0 to 2147483647.
- Campos (\* = obrigatório):
  - `seed` integer — 0..2147483647
  - `prompt`\* string — até 800 caracteres
  - `resolution` string — "1k" | "2k"; padrão "1k"
  - `aspect_ratio` string — "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "7:9" | "9:7" | "9:16" | "16:9" | "21:9"; padrão "1:1"
  - `prompt_extend` boolean — padrão false

