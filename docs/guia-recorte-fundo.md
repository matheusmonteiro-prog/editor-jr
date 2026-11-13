# Recorte de fundo do JR (aula 8.2 do curso): o que funciona e o que não

Teste de 13/11/2026, a pedido do Matheus ("pode instalar e testar"). **Estado: técnica viável para trechos
curtos no enquadramento padrão do JR. Teste de 10 s (v2, sem chiado) APROVADO pelo Matheus em 13/11/2026 (viu o
MP4). Ainda NÃO está no kit nem em nenhum vídeo.**
Resultados e quadros: `out/testes-13-11/recorte/` (fora do Git).

## 1. O que foi instalado (oficial, local, sem custo)
- `@remotion/video-matting@4.0.527` (MIT, mesma versão do Remotion) e `@huggingface/transformers@4.2.0`.
- Modelo `modnet` (pessoas, 25,9 MB, Apache-2.0), baixado uma vez e guardado no cache do navegador.
- **Só roda no NAVEGADOR (WebGPU).** O caminho de servidor (Node) **não funciona neste PC**: o Windows bloqueou o
  arquivo nativo do `@mediabunny/server` (política de Controle de Aplicativo). Não foi contornado e esse pacote
  **não** foi instalado no projeto.
- A 4.0.527 não tem `downloadVideoMattingModel` (a documentação online descreve versão mais nova); usar
  `loadVideoMattingModel`.
- Placa: Intel Iris Xe (Gen-12), WebGPU e shader-f16 disponíveis. `canUseVideoMatting({model:"modnet"})` = `supported: true`.

## 2. Como repetir o teste
1. Cortar o trecho (5 s) em MP4 (`ffmpeg`), sem áudio, e pôr numa pasta de rascunho como `entradaA.mp4`.
2. `esbuild` empacota `scripts/recorte-fundo/app.mjs` em `app.js` (com `NODE_PATH=<projeto>/node_modules`,
   `--bundle --format=esm --platform=browser`).
3. `PASTA_RECORTE=<pasta> node scripts/recorte-fundo/servidor.mjs` e abrir `http://127.0.0.1:3901/?v=A` no navegador do app.
4. Saem `A-base.webm` (fundo, opaco) e `A-foreground.webm` (JR com transparência, VP9 alfa).
5. Conferir: o ffmpeg só lê o alfa com `-c:v libvpx-vp9` **antes** do `-i`; compor sobre fundo claro, escuro e verde.
6. Desligar o servidor no fim.

## 3. Resultados medidos
| Teste | Entrada | Tempo | Resultado |
|---|---|---|---|
| A0: gravação bruta do 26/09, JR pequeno (câmera baixa, quarto) | 1080×1920, 150 quadros | 129 s | **Reprovado**: contorno do JR bom, mas leva junto porta escura, moldura laranja, mouse e mesa |
| A: o mesmo trecho, JR aproximado (recorte) | 1080×1080 | 93 s | **Melhorou o JR, ainda reprovado**: a porta e o mouse seguem junto; fundo escuro encostado no corpo confunde o modelo |
| **B: JR em tela cheia (28/10, 171,5 s), chapéu branco, filtro do rosto** | 1920×1080 | **158 s** | **Bom**: chapéu de aba larga, cabelo, rosto, camisa e mãos limpos em fundo claro, escuro e verde |

Defeitos do B (todos tratáveis): o **microfone** fica flutuando (sem o braço); sobras pequenas onde havia o logo
da fonte v1 e na borda de baixo (notebook); mão cortada na borda inferior em 1 quadro. Em gravação bruta (sem
logo) o logo some; microfone e borda se resolvem com **máscara fixa** (a câmera é parada) ou enquadrando fora.

## 4. Regras que saíram do teste
- **Custo de tempo:** ~0,6 a 1,05 s por quadro neste PC. Um vídeo de 15 min (27.000 quadros) levaria **horas**:
  usar **só em trechos curtos** (5 a 15 s = 3 a 16 min de espera), nunca no vídeo inteiro.
- **Saída tem altura arredondada** para múltiplo de 16 (1080×1936 em vez de 1080×1920): ao compor, escalar ou cortar.
- **Saída é WebM VP9 com alfa**; o MP4 final com fundo composto sai normal. Guardar o alfa como asset
  separado, nunca como MP4 H.264.
- **Quando o recorte reprova** (objeto escuro grande encostado no JR, JR muito pequeno na tela): não esconder com
  efeito; usar a moldura com fundo (como no 3D) ou regravar com fundo limpo.
- **Gravação ideal para recorte:** câmera parada, JR grande no quadro, fundo claro e sem objeto escuro grande
  encostado (o `A` mostrou que a porta escura atrás do braço entra no recorte).
- Reutilizar o alfa aprovado: mexer em texto, posição e tempo **não** pede refazer o recorte.
- O pacote baixa os arquivos do runtime do ONNX pela internet na primeira vez (comportamento padrão da biblioteca).

## 5. Falta (próximo passo do curso)
Testar **o lettering atrás da silhueta** dentro de uma composição do Remotion (`base` → texto → `foreground`)
e conferir que a pré-visualização e o render saem iguais. Ainda não feito.

## 6. Teste de 10 s com lettering atrás do JR (13/11/2026, v2 aprovada pelo Matheus)

Composição `Recorte-Lettering-10s` (pasta "Testes-Recorte", `src/components/recorte/RecorteLettering.tsx`), MP4
`out/testes-13-11/recorte/recorte-lettering-10s.mp4`. Fala 166–176 s do 28/10 ("todo ativo que paga grandes
dividendos, o patrimônio vai se manter ali estabilizado, desvalorizando aos poucos ou desvalorizado de uma vez").
- 0–3,3 s: JR com o quarto original e "PAGA GRANDES DIVIDENDOS" na frente.
- ~3,5 s: **o quarto some** e o JR fica no fundo da identidade (sem pulo: o recorte é dos mesmos quadros).
- 4 s: **"PATRIMÔNIO" gigante atrás do JR** (o chapéu esconde parte das letras).
- 6–10 s: **linha do patrimônio passando por trás do corpo**, reta e verde ("estabilizado"), depois caindo em
  vermelho ("desvalorizando"). Legenda simples embaixo; selo "ilustração conceitual".

### O microfone
Na gravação ele fica no canto de cima à direita. No recorte cru ele aparecia **flutuando**, sem o braço: não pode
ficar. Três formas de tirar, em ordem: (1) recortar a imagem em volta do JR **antes** da IA (foi o que resolveu
neste teste, o microfone ficou fora); (2) a placa de fundo do `limpar-alfa.py` (objeto parado = fundo); (3) na
gravação, manter microfone e braço fora da área em volta do JR (ou microfone de lapela).

### Borda "lisa como fundo verde"
A IA entrega borda macia (~7 px de meio-transparente) e um fio da cor da parede. O `scripts/recorte-fundo/limpar-alfa.py`
deixa liso: placa de fundo (tira estante, estatueta, microfone), devolve só partes sólidas de branco "de palha"
perto do chapéu, corta sobras e pontes finas, compara com a placa já suavizada (sem pontinhos de ruído) e aperta
a borda (curta, encolhe 1 px, suaviza 0,7 px). Medido de 3,3 a 10 s: borda semi-transparente **2,45% → 0,97%**
dos pixels; tremulação **0,46% → 0,31%** por quadro. Conferido em zoom sobre claro, escuro e verde.

### O que NÃO tem conserto no pós (é da gravação)
- **Aba branca contra parede clara + chapéu de cowboy branco na estante atrás:** de 0 a 3,3 s a aba some ou
  fica mordida (branco sobre branco). Nem a IA nem a placa separam. No teste, esses segundos ficaram com o quarto
  original (sem recorte), como o guia manda.
- **Notebook na frente do JR:** o recorte termina a camisa na linha 1012 e o friso do notebook fica. Solução
  usada: cortar na linha 1012 e ampliar 6,7% as camadas de vídeo para o corte cair na borda de baixo.
- Se o recorte for virar recurso frequente: **fundo verde (ou parede lisa escura, que contrasta com o chapéu
  branco) atrás do JR resolve tudo** e o recorte vira instantâneo e perfeito (chroma key), sem IA e sem espera.
  Sem isso: tirar o chapéu branco da estante de trás e o notebook da frente ajuda muito.

### 2ª rodada: o "chiado" no chapéu (13/11/2026)
O Matheus viu respingos e chiado no chapéu. Em zoom, quadro a quadro, eram 3 coisas que **mudavam a cada quadro**
(por isso parecia chiado, e não um defeito parado):
1. **Furo na aba esquerda**: ali a aba tem a cor da parede de trás, então a placa apagava um pedaço, e o tamanho
   mudava a cada quadro. Conserto: **tapar furo** (pedaço de fundo pequeno que não encosta nos lados nem no topo
   vira JR; encostar embaixo pode, porque o JR sai pela base). O mesmo conserto pegou a camisa que sumia entre o
   polegar e os dedos.
2. **Fiapos de 1 a 3 px** na beira de baixo da aba: conserto **alisando o contorno** (borrar 2 px e cortar no meio).
3. **Borda "fervendo"**: a IA decide cada quadro sozinha. Conserto: **mediana de 3 quadros** (anterior, atual,
   seguinte) só onde a imagem não se mexeu (89% da área); onde há movimento fica o quadro atual, sem rastro.

Medido de 3,3 a 10 s: quadros com furo **181 → 0** (de 200); fiapos **48 → 22 px** por quadro; tremulação
**0,88% → 0,57%** da área. Versão: `recorte-lettering-10s-v2.mp4`; comparação: `chapeu-antes-depois.jpg`.
A limpeza agora roda em 2 passadas (~3 min 40 s para 10 s) e guarda o alfa na memória (~0,5 GB para 10 s).

### Custo medido
Recorte de 10 s (1440x1080): 181 s no navegador (0,6 s por quadro, modelo já em cache). Limpeza: ~2 min.
Render da cena de 10 s com o vídeo transparente: ~1 min 50 s.
