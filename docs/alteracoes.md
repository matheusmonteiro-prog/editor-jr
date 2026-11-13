# Painel de alterações

Um pedido por linha. O Claude preenche (skill `pedido-de-ajustes`). **Só o Matheus marca `ok`**,
depois de ver no Studio.

Estados: `novo` → `fazendo` → `conferir no Studio` → `ok`. Se travar: `travado` (com o motivo).
Tempo = mm:ss do vídeo como aparece no Studio (linha final).

## Pedidos abertos

| Nº | Data | Vídeo / peça | Tempo | Pedido (palavras do Matheus) | O que muda (arquivo) | Estado | Notas |
|---|---|---|---|---|---|---|---|
| A-001 | 04/11/2026 | `Video2810V3` (voz) | todo | "o áudio tá muito ruim"; depois "tá tendo eco" | Tom: voz tratada por `scripts/tratar-voz.mjs` (preset jr) e usada no `Video2810V3`. Eco: ver `docs/guia-edicao.md`, seção "Eco" | conferir no Studio (voz da amostra 8 aplicada); eco de sala `travado` (só resolve na gravação ou com serviço externo) | Matheus ouviu: gostou da 8, eco ainda ficou. Leitura: é sala, código local chegou no limite. WPE máx. + tom aplicado na voz inteira em `public/videos/2026-10-28-voz-wpe8-completa.wav` (fora do Git), amostras 11 e 12. IA local (Resemble Enhance): reprovada (chiado). Aprovada a amostra 8; `Video2810V3` agora usa `2026-10-28-voz-wpe8-completa.wav`. Eco de sala segue como limite; ver guia 5d |
| A-017 | 06/11/2026 | Câmera (roupa) | 0:00–0:05 | "trocar a roupa dele pelo Higgsfield, que ninguém perceba que foi IA" | Teste no site da Higgsfield (Genjutsu Lite / Object Swap) com trecho limpo de 5,4 s | descartado no vídeo inteiro (caro): ~US$ 338 em 1080p para 4 min; Matheus, 06/11. Caminho: gravar já com a camisa | Teste feito 06/11 (Seedance 2.5, 480p, 4 s, ~US$ 1, scripts/editar-video-ia.mjs): camisa natural, rosto e boca mantidos; a IA devolve 24 qps e 3,7 s, esticado para 4 s/30 qps bate com a fala. Preço tabela Seedance: 720p ~US$ 0,28/s e 1080p ~US$ 0,68/s, cobrando entrada + saída |
| A-018 | 06/11/2026 | Câmera (filtro) | 0:00–0:08 | "tirar o roxo, as imperfeições do rosto, olheira mais leve, mais vivo, sem exagero" | Filtro local (OpenCV): roxo do ambiente, olheiras, textura leve, pele mais viva; 3 intensidades | conferir no Studio | Forte (1.4) escolhido pelo Matheus; aplicado no v1 inteiro (public/videos/2026-10-28-final-v1-filtro.mp4) e na placa limpa |
| A-019 | 06/11/2026 | Câmera (movimento) | 0:00–0:11 | "no início ele está agitado; deixar mais leve sem parecer editado, mantendo a fala" | Enquadramento que segue o rosto e segura o balanço (zoom 6%) | conferir (amostra) | Medido: início tem 3 a 6x mais movimento que o resto. 11/11: teste na Higgsfield (Kling omni video-edit, 720p, 10 s, ~US$ 0,95, `public/videos/cenas/movimento-teste1-kling720.mp4`) **reprovado por mim**: a IA trocou o JR por outra pessoa (rosto, corpo, chapéu). Higgsfield descartado para movimento. **11/11: estabilização sem IA aplicada no `Video2810V3`** (0 a 8,5 s, força 0,6, zoom até 4,9%, volta a zero sob o título até 10 s; dados em `src/dados/estabilizar-2810.json`). Rosto: velocidade média caiu de ~3,2 para ~2,0 px/quadro; pico de 2-3 s de 6,6 para 3,1. Falta o Matheus ver no Studio. 11/11, 2º teste Higgsfield (pedido do Matheus): Kling pro 720p, 0 a 8,4 s, 3 fotos do JR de referência, ~US$ 0,76 (`public/videos/cenas/movimento-teste2-kling-pro-refs.mp4`). Rosto do JR mantido (muito parecido, pele com mais manchas e dentes um pouco diferentes), mas **o movimento não acalmou**: 3,24 → 3,10 px/quadro (-4%), mesma amplitude. A IA copiou o movimento do original. 11/11, 3º teste (cena NOVA, pedido do Matheus): Wan 2.7 image to video, 1º quadro real + voz original 0-8,4 s, 720p, ~US$ 0,68 (`public/videos/cenas/jr-calmo-wan27-720.mp4`): **movimento -57%** (3,24 → 1,39 px/quadro), rosto fiel, boca acompanha a voz (correlação 0,33 sem atraso). Matheus autorizou o 1080p (~US$ 1,01): `public/videos/cenas/jr-calmo-wan27-1080.mp4` (cabeça 1,14 px/quadro, boca sem atraso). **Aplicado no `Video2810V3` de 0 a 8,47 s** (no lugar da estabilização sem IA, que saiu). Render dos 11 s: `out/testes-11-11/jr-calmo-render-11s.mp4`. **Aprovado pelo Matheus em 11/11.** Para ir ao ar, o JR precisa saber e concordar |
| A-020 | 06/11/2026 | Voz | 0:00–0:20 | "voz ansiosa, o grave subindo para o alto e descendo" | Achatar parte do sobe-e-desce do tom (Praat/PSOLA), mesmas palavras e tempo; 3 intensidades | conferir no Studio | B (20%) escolhida pelo Matheus; aplicada na voz inteira (public/videos/2026-10-28-voz-wpe8-calma20.wav, -14,2 LUFS) |
| A-021 | 13/11/2026 | Câmera (filtro), todo vídeo novo | todo | "o filtro deve ser uma ordem para todo o vídeo que fosse editado. A IA deve analisar o rosto, ver onde tem as manchas [...] dia mal dormido, ou de uma mancha que veio [...] sem eu precisar pedir, ela já cobre tudo, mantendo aquela naturalidade" | Regra na skill `editar-video` (tratamento padrão). Falta: o `filtro-rosto-natural.py` medir o rosto de cada vídeo (vermelho, amarelo, olheira, manchas) e ajustar as doses para chegar no visual aprovado em 11/11, em vez de usar doses fixas. **Feito 13/11:** `scripts/medir-rosto.py` (novo) + `--doses` no filtro + o filtro lê o tamanho real do vídeo | conferir | Prova 13/11: mesmo dia (2ª metade do 28/10) = doses aprovadas iguais; rosto avermelhado de propósito: dose fixa deixou +8% vermelho/+16% amarelo, dose medida +1%/+5% (`out/testes-13-11/filtro-adaptativo-comparacao.jpg`); vídeo de outro dia (0926, vertical) deu doses próprias. Falta: `rastrear-rosto.py` para vertical; o Matheus ver num vídeo novo |

## Achados do Claude para conferir (não são pedidos)

| Nº | Data | Vídeo | Tempo | O que vi | Estado |
|---|---|---|---|---|---|
| C-001 | 04/11/2026 | `Video2810V3` | ~0:10 | Possível fantasma do texto antigo "QUEM É O INVESTIDOR SERTANEJO" por baixo do impacto novo | confirmado e corrigido junto com o A-005 |
| C-002 | 04/11/2026 | `Video2810V3` | ~3:20 | Um quadro só com o fundo, sem a janelinha do JR e sem texto | não se repetiu (quadro de 3:20 tem a janela); a pausa de 0,3 s entre blocos é normal |

## Feitos (histórico)

Pedidos com `ok` descem para cá, com a data do ok.

| Nº | Data do ok | Vídeo / peça | Pedido | O que mudou |
|---|---|---|---|---|
| A-002 | 06/11/2026 | `TransicaoJanela` (kit 4.2) | "o quadrado da câmera não deixe apenas a cabeça do JR, tem que estar a câmera toda no quadrado, e em volta uma borda dourada fina seguindo a cor da identidade" | Janela mostra o quadro inteiro, sem recorte; borda fina na cor do kit |
| A-003 | 06/11/2026 | `FundoExplicativo` (kit 2.1) | "na tela explicativa o fundo deve estar em movimento leve" | Movimento contínuo e perceptível, mas discreto |
| A-004 | 06/11/2026 | Logo (kit 5) | "o ícone do JR no canto superior esquerdo, retire, o próprio YouTube já adiciona padrão" | Sem logo no vídeo; padrão das peças sem logo |
| A-005 | 06/11/2026 | `ImpactoKit` (faixa) | "bem ao fundo não foi retirada a descrição com a fonte antiga, dá pra ver" | Cobrir de vez o texto antigo do v1 |
| A-006 | 06/11/2026 | Transições do `Video2810V3` | "quero um reajuste das transições, algumas ficaram bugadas" | Achar os quadros com defeito e corrigir |
| A-007 | 06/11/2026 | Câmera (kit, novo) | "o fundo do vídeo tem que estar desfocado para o foco ser o JR" | Desfoque atrás do JR |
| A-008 | 06/11/2026 | `ImpactoKit` (faixa) | "esse verde está muito denso, deixa ele leve, quase transparente, como um sombreado leve" | Faixa leve; o texto antigo do v1 passa a ser escondido por véu de desfoque na câmera (substituído pelo A-014) |
| A-009 | 06/11/2026 | `CameraJR` (desfoque) | "o desfocado do fundo ficou ruim, pegou na roupa, ficou lugar sem; um desfocado leve, uns 20%" | Desfoque ~20% do anterior e focos maiores (roupa inteira nítida) |
| A-010 | 06/11/2026 | Áudio (kit 13) | "uma música muito de leve no fundo, a pessoa só vai ouvir se prestar atenção, nunca passar por cima do JR" | Trilha "Sertão Caboclo" (Quincas Moreira) bem abaixo da voz |
| A-011 | 06/11/2026 | Tela explicativa clara (kit, novo) | "tela explicativa no fundo claro, usar nossa cor clara bege; o bege pode variar de vídeo para vídeo" | Tema claro (bege) como opção das telas explicativas |
| A-012 | 06/11/2026 | `Pauta` | "as descrições abaixo vir com um ponto para ficar mais didático" | Marcador "•" antes de cada descrição |
| A-013 | 06/11/2026 | História do JR (kit 4.10) | "transformar a história de vida do JR em animação de trajetória (linha do tempo + árvore)" | Linha dourada que se desenha etapa por etapa, com capítulos |
| A-014 | 06/11/2026 | `ImpactoKit` (sombra) | "não gostei; pegue o exemplo do anexo 2, verde sutil, leve" | Sombra verde suave só atrás do texto, sem borrão (substituído pelo A-016) |
| A-015 | 06/11/2026 | `TransicaoJanela` (janela) | "olha o borrão no meio da tela pequena, não pode acontecer" | Tirar o véu da janela; cobrir a pílula antiga com placa limpa da própria câmera |
| A-016 | 06/11/2026 | `ImpactoKit` (camada verde) | "o verde pode subir de baixo para cima, um pouquinho mais escuro embaixo, como no exemplo; não é fumaça, é uma camada de cor translúcida" | Camada verde translúcida de baixo para cima (70% embaixo), véu do texto antigo de lado a lado |
