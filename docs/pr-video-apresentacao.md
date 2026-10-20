# PR: vídeo de apresentação do JR (pergunta e resposta)

Branch `video-apresentacao` → `noite-etapa6`.

Vídeo vertical 1080x1920, 30 fps, sem câmera: fotos de fundo + texto + elementos animados +
narração TTS, em abertura + 8 blocos de pergunta e resposta. A duração de cada bloco vem do
áudio real (calculateMetadata + Mediabunny), mais 20 frames de folga.

## Como abrir
`npm run dev` → pasta **Videos** → `VideoApresentacao`. O componente novo do catálogo fica em
**Catalogo** → `GradeAtivos3D`.

## O que entrou
- `src/VideoApresentacao.tsx`: a composição e o `calculateMetadata` (mede os 18 áudios e os vídeos de fundo).
- `src/dados/apresentacao.ts`: textos, áudios, cenas e tempos. **É o modelo** para outros vídeos
  pergunta e resposta: copiar e trocar os dados.
- `src/utils/linhaDoTempoApresentacao.ts`: monta a linha do tempo a partir das durações.
- `src/components/apresentacao/`: FundoCenas, TextoKinetic, PilulaPergunta, FioProgresso,
  Logo3D, Moeda3D, CardCheckFlip, ContadorImpacto, TextoRiscado, Particulas, RaiosDeLuz,
  BrilhoRadial, WipeBloco, ListaRolando, FraseIcone, TextoPulso, LinhaDourada e `marca.ts`
  (cores e fontes).
- `src/utils/moedasApresentacao.ts`: sorteio reproduzível das moedas 3D.
- `src/components/v2/GradeAtivos3D.tsx`: componente novo do catálogo (registrado no Studio e no
  `CATALOGO`).
- `package.json`: `mediabunny` 1.56.1 declarado (é a versão que o Remotion 4.0.527 já usa; a
  documentação do Remotion indica o Mediabunny para ler a duração de mídia).

## QUEBRAS DE MARCA APLICADAS (para o JR aprovar)

Exceções autorizadas pelo Matheus em 19/10/2026, **só para este vídeo**.

### Em todos os blocos
- **Voz gerada por IA (TTS).** O `ARQUITETURA.md` diz "sem voz gerada por IA"; este vídeo usa
  duas vozes TTS (mulher nas perguntas, homem na abertura e nas respostas).
- **Caixa alta em todo texto de tela**, com espaçamento extra (+0,04em Fraunces, +0,08em Inter).
- **Glow e brilho:** brilho dourado suave no destaque das palavras, no fio de progresso, nas
  riscas e nas partículas (o item 8 do `checklist-revisao.md` proíbe blur/glow/sombra difusa).
- **Sombras suaves e gradientes decorativos escuros** (só em alfa da cor da marca) na pílula, nos
  cards e no escurecimento do fundo.
- **Blur:** raios de luz (cena 4) e borrão de movimento do contador (bloco 02).
- **Motion forte:** kinetic typography palavra por palavra, spring com overshoot, wipe diagonal
  na troca de bloco.
- **Fotos de fundo** com zoom/pan e 7 transições diferentes (flash dourado, empurrão, zoom
  atravessando, deslize, máscara circular, wipe, fusão com brilho).

### Bloco a bloco (estado depois da rodada 2)
| Bloco | Quebras |
|---|---|
| 00 Abertura | Logo em **3D (CSS)** girando uma volta no eixo Y; **brilho radial** atrás do logo; **partículas** de poeira dourada; fundo em **vídeo desfocado e tingido**; caixa alta |
| 01 Quem é ele? | **Spotlight dourado (glow)** atrás do logo 3D; logo voa em curva para o canto; partículas |
| 02 O que ele faz? | **Moedas 3D** caindo (3); contador com **pulso e borrão de movimento**; cards com **flip 3D**; flash dourado na troca de cena |
| 03 O que é o Método JR? | **Moedas 3D** caindo (3); cards com **flip 3D**; empurrão vertical; fundo verde-escuro liso |
| 04 O que vai mostrar? | **Raios de luz** com blur; imagem de fundo **desfocada (8 px)**; zoom atravessando a cena |
| 05 É difícil entender? | Risca dourada com **glow**; "DIFÍCIL" sai para trás; **explosão de partículas** em "FÁCIL"; poeira dourada no fundo; fundo verde-escuro liso |
| 06 Portfólio? | **Lista rolando desfocada** no fundo; **contador grande 0 → +400** com pulso e borrão; **estouro de partículas** ao bater 400; **moedas 3D** (3); máscara circular na troca |
| 07 Recomenda? | Risca dourada com **glow**; **3 frases em corte seco** com pulso forte; **3 ícones SVG** com traço animado e **brilho**; gráfico ilustrativo de fundo (foto sem número) |
| 08 Como conhecer? | Logo **3D** voltando girando uma vez; **linha dourada com glow**; texto **inteiro em dourado** no miolo; "MÉTODO JR." com batida e **halo dourado**; **partículas subindo**; vídeo de fundo **desfocado e tingido**; fusão com brilho |

### O que continua proibido (e não foi usado)
Verde #1DD41E fora de sinal de compra (só aparece na seta do próprio logo, que é a marca), emoji,
rosto do JR por IA, promessa de rentabilidade, AvisoCVM, ArrobaInstagram, lista de espera, link
na bio, comentário fixado.

## Ajustes da rodada 2 (20/10/2026)

Commits por etapa na branch `video-apresentacao` (só código; nenhuma mídia foi para o Git).

1. **Arquivos novos.** Renomeados sem espaço e sem extensão dupla. Vídeos em
   `public/videos/cenas/`, imagem da cena 4 em `public/images/cena-4-dourado.png`,
   `08-resposta.mp3` e `musica-fundo.mp3` em `public/audio/apresentacao/`. As cópias da música
   em `public/music/` e na Downloads ficaram como estavam.
2. **Cenas novas** (o `FundoCenas` agora aceita imagem, vídeo em loop e fundo sólido):
   - **Cena 1** (blocos 00 e 01): vídeo `cena-1-not.mp4`, mudo, em loop, desfocado (8 px),
     **dessaturado e tingido** em duas cores da marca (sombras verde-escuras, claros dourados).
     Reenquadrado (escala 155% e deslocado para baixo) para o notebook não ficar atrás do logo.
   - **Cena 3** (bloco 03): fundo verde-escuro #0F2A1D. O vídeo "grafico 1" tem **"Link in Bio"
     escrito** e cores neon: não usado.
   - **Cena 4** (bloco 04): imagem `cena-4-dourado.png`, desfocada (8 px). Tem 940 px de largura
     (< 1170): zoom de **103%** e pan reduzido (±1,4% em vez de ±3%).
   - **Cena 5** (bloco 05): fundo verde-escuro. O vídeo do trator tem a **marca d'água
     "@EDI.RISSI"** (outro criador): não usado.
   - **Cena 8** (bloco 08): vídeo `cena-8-linhas.mp4`, mesmo tratamento da cena 1.
   - Escurecimento de 55% para **40%** em todas as cenas (cena 6 segue em 70%).
3. **Bloco 06.** Sai a `GradeAtivos3D` (continua no catálogo). Entra a lista rolando no fundo
   (só barra, estrelas e check desenhados em SVG: nenhum nome, ticker ou número) e o contador
   grande 0 → +400, que **para meio segundo (15 frames) antes do narrador terminar**. Partículas
   douradas estouram ao bater 400.
4. **Bloco 07.** A risca continua. Depois entram "O QUE FAZ", "COMO FAZ" e "E POR QUE FAZ",
   inteiras, em corte seco, com pulso 1 → 1,1 → 1 em 6 frames, "FAZ" em dourado nas três, cada
   uma com um ícone SVG (check, engrenagem, lâmpada). Cada frase fica de 32 a 51 frames na tela;
   o ícone leva 14 frames para desenhar, então **todos desenham completos antes do próximo corte**.
5. **Bloco 08.** CTA novo, parte por parte, no tempo da fala (ver "O que supus").
6. **Moedas.** De 2 a 4 moedas 3D por bloco (02, 03 e 06) em posições e tempos sorteados com
   `random()` e semente fixa. Passam por cima do fundo e por trás do texto. Corrigido um defeito da
   moeda: ao virar, a borda marrom cobria o dourado.
7. **Música.** `musica-fundo.mp3` do frame 0, sem loop, fade-in de 30 frames, volume 0,20 nos
   blocos 00 a 07 e 0,35 no 08, fade-out de 60 frames no fim.
8. **Efeitos sonoros.** Os pontos de whoosh, tick, moeda e impacto estão marcados na timeline
   (volume 0,4). Os 4 arquivos **não baixaram** do Pixabay (403, desafio do Cloudflare); sem
   arquivo, os pontos ficam mudos.

### Quebras de marca novas da rodada 2 (para aprovar)
- **Blur de 8 px** em vídeo/imagem de fundo (cenas 1, 4 e 8) e **desfoque** na lista rolando do bloco 06.
- **Fundo tingido** (duotone verde-escuro e dourado) nas cenas 1 e 8, por causa das cores neon e
  candles vermelhos/verdes dos vídeos originais.
- **Bloco 08:** "AQUI VOCÊ VAI VER / O QUE NINGUÉM / TE MOSTROU ANTES." e "MÉTODO JR." inteiros em
  dourado (a regra "um destaque de cor por frase" foi quebrada a pedido).
- **Música de fundo** (arquivo `music impact.mp3` da Downloads): **a licença/origem não foi
  verificada por mim.** Confirmar antes de publicar.

## Ajustes da rodada 3 (20/10/2026)

1. **Arquivos.** Extensões duplas corrigidas. Os 3 vídeos novos eram 4K (o do trigo, 342 MB): gerei
   cópias 1080x1920 sem áudio com FFmpeg (trigo só com 14 s, a partir de 8 s; bolsa e celular
   inteiros) em `public/videos/cenas/`. Os originais ficaram **intocados** em
   `videos/originais-cenas/` (pasta ignorada pelo Git, fora do `public/`).
2. **Cenas 3, 5 e 7** viraram vídeo (mudo, em loop, cinza + tingimento verde-escuro/dourado).
   Desfoque de **12 px** nas cenas 3 (bolsa: números legíveis) e 7 (celular: aparece "BTC-USD");
   8 px na 5 (trigo). Nenhum arroba, marca d'água ou logo nas amostras que olhei.
3. **Escurecimento de 15%** em todas as cenas, menos a 6 (70%) e a **5 (25%)**: o céu dourado do
   trigo competia com o "FÁCIL" dourado.
4. **Bloco 07.** As 3 frases agora **ficam até o fim do bloco**, empilhadas de baixo para cima: "O QUE
   FAZ" embaixo, "COMO FAZ" no meio, "E POR QUE FAZ" em cima, cada uma com seu ícone. "FAZ": dourado
   chapado / creme com contorno dourado / dourado com pulso 1 → 1,25 → 1. A legenda "A DECISÃO É DE
   CADA INVESTIDOR" (sem ponto) fica fixa embaixo o bloco todo.
5. **Bloco 08.** Textos sem ponto (só "MÉTODO JR." mantém). **Space Grotesk Bold** em tudo, menos
   "MÉTODO JR." (Fraunces Bold, entra em escala 0,7 → 1 com overshoot). "SIGA ESTE CANAL" palavra por
   palavra (mola 10, sobe 20 px). "NINGUÉM" pulsa 1 → 1,2 → 1 em 8 frames. O **logo inteiro** sobe do
   fundo com spring e pulsa uma vez (1 → 1,1 → 1 em 10 frames). 3 moedas caem atrás do logo.
6. **Sons ligados** (`src/utils/sfxApresentacao.ts`): whoosh 0,5 (trocas de bloco e linha do CTA),
   tick 0,3 (pílulas e ícones do 07; 0,4 nas palavras do CTA), moeda 0,4, impacto 0,5 (fim da risca do
   05, as 3 frases do 07, pulso do logo e "MÉTODO JR."). **Ducking:** a música baixa de 0,20 para
   0,15 enquanto um efeito toca (volume dinâmico do Remotion).

### Não feito, por decisão do Matheus
Chapéu separado, `ChapeuVoando` e transições com elemento voando (00→01 e 03→04): o logo fica
sempre inteiro. Essas transições só têm o whoosh de troca de bloco.

### O que trocou de abordagem / contradições do pedido
- **Ordem do bloco 07:** o pedido descrevia dois resultados opostos (a 1ª frase sobe, mas também
  "O QUE FAZ" é a de baixo). Segui a **lista da ordem final** (de cima para baixo: E POR QUE FAZ,
  COMO FAZ, O QUE FAZ): as frases se empilham de baixo para cima, cada uma entrando subindo até o seu
  degrau, sem as anteriores se moverem.
- **Volume do tick:** o pedido diz 0,4 (palavras do CTA) e 0,3 (mapa de sons). Usei 0,4 nas palavras do
  CTA e 0,3 no resto.
- **Whoosh em 00→01 e 03→04:** já existe o whoosh de troca de bloco nesses pontos; não dobrei.
- **Vídeos 3 e 5 antigos** (`cena-3-grafico.mp4`, trator) não são mais usados.

## Ajustes da rodada 4 (20/10/2026)

Vieram da revisão dos stills no Studio. Nenhuma fala, texto de tela ou duração de bloco mudou
(continua **2518 frames / 83,9 s**).

1. **Bloco 07, ordem das frases corrigida.** Lido de cima para baixo: **O QUE FAZ, COMO FAZ, E POR
   QUE FAZ**, na ordem da fala. Cada frase entra embaixo e a anterior sobe um degrau em 15 frames.
   As 3 ficam até o fim do bloco, com a legenda fixa embaixo.
2. **Inter em tudo.** Saíram a Fraunces e a Space Grotesk. Títulos e respostas em Inter 800; rótulos,
   pílulas e números em Inter 600 (números tabulares, formato BR). "MÉTODO JR." no bloco 08 usa o
   mesmo estilo dos outros títulos: o tratamento da assinatura fica como decisão de marca para
   depois (não inventei um estilo).
3. **Verde bem leve, com o bloco 02 como régua.**
   - Tingimento: de duotone verde/dourado pesado para uma camada de verde da marca com intensidade
     de **30%** em modo "color" (só o tom; a luz da arte fica). A arte continua dessaturada.
   - Escurecimento: de 15% para **8%** em todas as cenas; cena 5 (trigo) em 12% e cena 6 (mosaico)
     em 45% (era 70%).
   - **Para conferir no Studio, bloco 01 (CRIADOR):** com menos verde o fundo ficou mais claro atrás
     do logo. O texto "CRIADOR DO MÉTODO JR" fica sobre a parte escura do teclado e leu bem no
     still, mas não adicionei nenhum escurecimento localizado. Se perder contraste no Studio, o
     caminho é uma faixa escura só atrás do texto, sem escurecer a tela toda.
4. **Moedas reduzidas e só onde há dinheiro:** blocos **02** (2 moedas), **06** (2) e **08** (2).
   Saíram do bloco 03. O som de moeda toca só no bloco 08; nos blocos dos contadores (02 e 06) vale o
   som de contagem.
5. **Transições dinâmicas de volta** (nada de chapéu voando). As cenas trocam deslizando: 01→02 de
   lado (da direita), 02→03 de baixo para cima, 03→04 de cima para baixo, 04→05 de lado (da
   esquerda), 05→06 de baixo para cima, 06→07 de lado (da direita), 07→08 de cima para baixo.
   Além disso, **o conteúdo de cada bloco entra deslizando** (do lado, de baixo ou de cima), o que dá
   movimento também às trocas **00→01** e **03→04**. Cada troca continua marcada na timeline para o
   whoosh.
6. **Sons novos: os dois arquivos existiam e estão ligados.**
   - `sfx-contador.mp3` (2,23 s = 67 frames) toca junto da contagem dos blocos **02** (0→15) e **06**
     (0→400). Como o arquivo tem 2,23 s, a **duração da contagem passou a 67 frames** nos dois
     contadores (linear, estilo odômetro). No bloco 06 isso **substitui** a regra antiga de parar meio
     segundo antes do narrador terminar: o +400 agora chega cerca de 2,2 s depois do início da
     resposta e o estouro de partículas acompanha.
   - `sfx-ok.mp3` (0,74 s) toca quando aparece um check: nos 2 cards do bloco **03** e no check do
     bloco **07**. O arquivo veio como `sfx-ok.mp3.mp3` e foi renomeado para `sfx-ok.mp3`.
   - Os 4 sons anteriores (whoosh, tick, moeda, impacto) continuam como estavam.

### Quebras e dúvidas da rodada 4
- Os cards com check do **bloco 02** (AÇÕES E ETFS, BRASIL E EUA) **não** têm o som de ok, porque você
  listou só os blocos 03 e 07. É um ajuste de uma linha se quiser.
- O verde ficou tão leve nos blocos 01 e 08 que as cenas parecem quase cinza com um toque de verde.
  Se quiser um pouco mais, é o valor `TINGIMENTO` em `FundoCenas.tsx`.

## Ajustes da rodada 5 (20/10/2026, consolidada)

Nenhuma fala, texto de tela ou duração mudou (continua 2518 frames). Nada foi renderizado e nenhum
áudio de voz foi gerado. O posicionamento segue para o Matheus ajustar no Studio.

### 1. Ticks (sfx-tick)
- **Removidos:**
  - **Bloco 00:** o tick da pílula **"EM BREVE, NESTE CANAL"**. É o único tick dessa região do vídeo
    e toca no frame 2 (o som dura 1,44 s, por isso pode parecer que vem perto de 1 s).
  - **Bloco 07:** os 3 ticks dos ícones das frases O QUE FAZ / COMO FAZ / E POR QUE FAZ.
  - **Bloco 08:** os 3 ticks das palavras de "SIGA ESTE CANAL".
- **Mantidos:** o tick da pílula de pergunta dos blocos **01 a 08** (inclusive o do bloco 08).

### 2. Fundo mais natural (`FundoCenas.tsx` e `src/dados/apresentacao.ts`)
| Item | Antes (rodada 4) | Depois (rodada 5) |
|---|---|---|
| Tingimento verde (`TINGIMENTO`, em `FundoCenas.tsx`) | 0,3 | **0** (camada nem é desenhada) |
| Cinza/dessaturação | cenas 1, 3, 5, 7 e 8 | só as cenas **1 e 8** (`dessaturar: true`); **3, 5 e 7 ficam com a cor natural** |
| Desfoque cenas 1, 4, 5 e 8 | 4 px | **2 px** (`DESFOQUE_PADRAO`) |
| Desfoque cenas 2 e 6 | sem desfoque | **2 px** (`DESFOQUE_PADRAO`) |
| Desfoque cenas 3 e 7 | 7 px | **7 px** (`DESFOQUE_TEXTO_LEGIVEL`); conferido: nenhum número ou "BTC-USD" legível |
| Escurecimento | 8% (cena 5: 12%; cena 6: 45%) | **sem mudança** |

- **Constantes fáceis de achar:** `TINGIMENTO` (`src/components/apresentacao/FundoCenas.tsx`),
  `DESFOQUE_PADRAO` e `DESFOQUE_TEXTO_LEGIVEL` (`src/dados/apresentacao.ts`, antes de `CENAS`).
- **Bloco 01 (CRIADOR):** conferi o contraste de "CRIADOR DO MÉTODO JR" com o fundo mais nítido e
  ele continua lendo bem; **não coloquei faixa escura**. Vale conferir no Studio, porque o notebook
  ficou mais definido atrás do texto.

### Quebra de marca desta rodada
**Fundo sem tingimento verde.** Com a cor natural, as cenas de vídeo mostram cores fora da paleta:
a cena 7 (celular) aparece com azul, ciano e vermelho nos gráficos; a cena 5 (trigo) fica dourada e
azul-acinzentada. O verde da marca (#0F2A1D) agora só aparece no escurecimento e nos elementos.

### 3. Bloco 08, "O QUE NINGUÉM TE MOSTROU ANTES" (feito na rodada 5, commit anterior)
Inter, sem fonte nova; palavras entrando em sequência por mola (amortecimento 12, 4 frames entre
palavras); "NINGUÉM" pulsa 1 → 1,15 → 1 e é a **única palavra dourada** (#EFAF20).

### 4. Som de moeda (feito na rodada 5, commit anterior)
Religado em **cada queda** dos blocos **02** (2 moedas), **06** (2) e **08** (2), um som por queda, volume
**0,25** (abaixo do sfx-contador, 0,5). Antes só o bloco 08 tinha som de moeda. Os blocos 03 e 07 não
têm moeda caindo, então não há queda sem som.

### Para conferir
- A cena 1 e a cena 8 continuam em cinza (você só pediu para tirar o cinza das cenas 3, 5 e 7).
- Cenas 3 e 7: se algum número ainda ficar legível em movimento, subir `DESFOQUE_TEXTO_LEGIVEL`.

## Rodada 5b (20/10/2026): só o bloco 08 e a música no CTA

**Esta rodada substitui o item 3 da rodada 5** (motion de "NINGUÉM"): a frase "AQUI VOCÊ VAI VER O QUE
NINGUÉM TE MOSTROU ANTES" saiu do vídeo.

### Texto do bloco 08, antes e depois
| | Antes (rodada 5) | Depois (rodada 5b) |
|---|---|---|
| Chamada | SIGA ESTE CANAL (creme) | SIGA ESTE CANAL (creme, maior, 2 linhas) |
| Frase do meio | AQUI VOCÊ VAI VER / O QUE NINGUÉM / TE MOSTROU ANTES (dourado/creme) | **removida** |
| Marca | MÉTODO JR. (dourado) | "ACOMPANHE A CHEGADA DO" (creme, menor) + **MÉTODO JR.** (dourado, grande, escala 0,7 → 1). **Único texto dourado do bloco.** |
| Logo | 36% da largura | **55% da largura** (inteiro, com chapéu) |
| Convite | — | **AQUI VOCÊ VAI VER COMO FUNCIONA NA PRÁTICA** (creme, menor) |
| Fecho | EM BREVE (texto) | pílula **chapada** creme #F5F0E6, texto #0F2A1D, raio 28 px, sem sombra, sem borda, sem transparência: **EM BREVE NESTE CANAL** |

Tudo em Inter (títulos 800, rótulos 600), caixa alta, sem emoji, sem verde #1DD41E. Ticks: só o da pílula da
pergunta, como na rodada 5. A pílula termina em cerca de 82% da altura (zona segura das plataformas não foi
medida). Sem link, lista de espera, "link na bio" ou comentário fixado.

**Sincronia pelo áudio `08-resposta`** (tempos medidos com `silencedetect`, em segundos desde o início da fala):
"SIGA ESTE CANAL" com o início da fala; linha dourada em 1,0 s; "ACOMPANHE A CHEGADA DO" em 5,05 s;
"MÉTODO JR." em 5,29 s (quando o narrador diz "Método JR"); a pílula em **7,7 s**, quando a fala termina
(áudio de 7,81 s). O "AQUI VOCÊ VAI VER COMO FUNCIONA NA PRÁTICA" entra em 3,2 s, junto com o logo, que sobe em 2,3 s.

### Música no bloco 08, antes e depois
| | Antes | Depois |
|---|---|---|
| Subida de 0,20 para 0,35 no bloco 08 | sim (`musicaFinal`) | **removida** |
| Durante a fala do narrador | 0,35 | **0,12** (`VOLUMES.musicaCtaDuranteFala`) |
| Depois que a fala termina | 0,35 | sobe devagar até **0,28** (`VOLUMES.musicaCtaAposFala`), em **60 frames** (`VOLUMES.subidaMusicaCtaFrames`) |
| Fade-out de 60 frames no fim | sim | sim (sem mudança) |

As constantes estão em `src/dados/apresentacao.ts`, no objeto `VOLUMES`.

### PENDÊNCIA para o JR aprovar
**A troca de "O QUE NINGUÉM TE MOSTROU ANTES" por "COMO FUNCIONA NA PRÁTICA"** é uma mudança de texto de tela.
Ela também **não bate com o que o narrador diz** no áudio `08-resposta` ("Aqui você vai ver o que ninguém te
mostrou antes"), porque o áudio não foi regerado. Confirmar com o JR antes de publicar.

### Para conferir no Studio
- O frame do meio do bloco 08 (`bloco-08.png`) ainda não mostra "MÉTODO JR." nem a pílula (entram depois); o
  quadro completo está em `out/stills/apresentacao/bloco-08-final.png`.
- O fim da fala do bloco 08 e a pílula entram juntos perto de 7,7 s: se ficar apertado, ajustar
  `pilulaEmSegundos` em `src/dados/apresentacao.ts`.

## Rodada 5c (20/10/2026): só o bloco 08. SUBSTITUI a rodada 5b

### O que saiu
- A frase **"AQUI VOCÊ VAI VER COMO FUNCIONA NA PRÁTICA"** (entrou na 5b por engano).
- A **linha dourada** que atravessava a tela entre "SIGA ESTE CANAL" e "ACOMPANHE A CHEGADA DO" (e o whoosh dela).
- A frase antiga **"AQUI VOCÊ VAI VER O QUE NINGUÉM TE MOSTROU ANTES"** (já tinha saído na 5b).
- Com isso, a pendência da 5b ("COMO FUNCIONA NA PRÁTICA" para o JR aprovar) **deixa de existir**.

### Layout novo (de cima para baixo)
Pílula da pergunta → **SIGA ESTE CANAL** (creme, grande, 2 linhas) → **ACOMPANHE A CHEGADA DO** (creme,
menor) → **MÉTODO JR.** (dourado, grande; único texto dourado) → **logo** inteiro (55% da largura) →
pílula chapada creme **EM BREVE NESTE CANAL** (texto #0F2A1D, raio 28 px, sem sombra, borda ou
transparência). Termina em cerca de **79% da altura**; a parte de baixo fica vazia de propósito.

### Sincronia (áudio `08-resposta`)
- **ATENÇÃO:** o áudio `08-resposta.mp3` é o mesmo de antes (7,81 s, de 20/10 10:24). Ele diz "Siga este
  canal. Aqui você vai ver o que ninguém te mostrou antes. Método JR. Em breve." e **não tem** "e acompanhe
  a chegada do". Por isso:
  - "SIGA ESTE CANAL" entra com "Siga este canal" (0 s);
  - "ACOMPANHE A CHEGADA DO" entra em 5,05 s, logo antes de "Método JR" (não há trecho falado igual);
  - "MÉTODO JR." entra em 5,29 s, com "Método JR", escala 0,7 → 1;
  - o logo sobe a partir de 4,55 s e pousa junto com a assinatura, depois pulsa uma vez;
  - a pílula entra em 7,7 s, quando a fala termina.
- **Pendência:** se o narrador passar a dizer "Siga este canal e acompanhe a chegada do Método JR.", o áudio
  precisa ser regerado (eu não gero voz) e os tempos em `src/dados/apresentacao.ts` conferidos. Entre
  1,1 s e 5 s da fala atual, a tela mostra só "SIGA ESTE CANAL".
- Ticks do bloco 08: só o da pílula da pergunta.

### Música no CTA
Igual à 5b (já estava aplicada): sem a subida de 0,20 para 0,35; **0,12** durante a fala
(`VOLUMES.musicaCtaDuranteFala`); depois sobe devagar até **0,28** (`VOLUMES.musicaCtaAposFala`) em 60
frames (`VOLUMES.subidaMusicaCtaFrames`); fade-out de 60 frames no fim mantido.

## Rodada 5d (20/10/2026, versão final; substitui a 5d anterior)

### 0. Conferência da rodada 5 (tudo estava aplicado; nada foi refeito)
| Item | Estado |
|---|---|
| a) Ticks removidos: bloco 00 (pílula "EM BREVE"), bloco 07 e palavras do CTA; bloco 08 só com o tick da pílula da pergunta | **Aplicado** (resta o tick das pílulas de pergunta dos blocos 01 a 08) |
| b) Sem tingimento verde (`TINGIMENTO = 0`); cenas 3, 5 e 7 sem filtro cinza; blur 2 px nas cenas 1, 2, 4, 5, 6 e 8 e 7 px nas 3 e 7 | **Aplicado** |
| c) sfx-moeda em cada moeda dos blocos 02, 06 e 08 (volume 0,25) | **Aplicado** |
| d) Música no bloco 08 em 0,12 na fala, sobe até 0,28, fade-out de 60 frames | **Aplicado** |

### 1. Pílula "O QUE NINGUÉM TE MOSTROU ANTES"
Logo abaixo da pílula da pergunta. Inter 600, caixa alta, texto creme #F5F0E6 sobre #0F2A1D, raio 28 px, sem
borda, sem sombra, sem transparência, sem dourado. Entra no **início exato da fala** do `08-resposta` e fica até
a saída do fecho.

### 2. Fecho: o logo chegando e tudo saindo (sem estender o vídeo: 2518 frames)
- A pílula "EM BREVE NESTE CANAL" aparece no frame 2464 e fica **20 frames** (`FRAMES_LEITURA_PILULA`).
- Aos 2484 os elementos saem em **stagger de 3 frames**, de cima para baixo na ordem: pílula da pergunta, pílula
  nova, SIGA ESTE CANAL, ACOMPANHE A CHEGADA DO, MÉTODO JR. (os de cima sobem, com translateY e opacidade) e, por
  último, EM BREVE NESTE CANAL (desce).
- Ao mesmo tempo o logo (inteiro, imagem única) vem em direção ao espectador por **22 frames**
  (`FRAMES_CRESCER_LOGO`), com ease-in, indo para o centro da tela. Depois, pulso 1 → 1,05 → 1 e fica estático
  até o fim. Sem glow novo, sem texto novo.
- **Constante de escala: `ESCALA_FINAL_LOGO`**, em `src/dados/apresentacao.ts` (valor 0,95 / 0,55 ≈ 1,73:
  o logo final do bloco tem 55% da largura, então a escala leva a ~95%). Para testar maior no Studio, é só aumentar.
- **Resolução do PNG do logo:** `public/images/logo-jr.png` tem **1254 × 1254 px**. Na escala final o logo ocupa
  ~1026 px de largura na tela de 1080, então fica **abaixo do tamanho original e não pixeliza**. Se
  `ESCALA_FINAL_LOGO` passar de uns 2,1 (≈ 1254 px), ele passa a ser ampliado e perde nitidez. Não ampliei com filtro.
- O trecho visível do desenho (sem a margem transparente do PNG) ocupa cerca de 87% da largura, e não 95%, porque o
  PNG tem uma margem em volta. Se quiser mais, aumente a constante.
- Coube nos frames restantes sem encurtar nada: a leitura da pílula ficou nos 20 frames.

### 3. Sons do fecho
`sfx-whoosh` no início da saída ("SOM whoosh saída do fecho", frame 2484) e `sfx-impacto` no pulso do logo
("SOM impacto logo final", frame 2506). Sem arquivo novo.

### PENDÊNCIA para o JR aprovar
A pílula **"O QUE NINGUÉM TE MOSTROU ANTES"**: é uma afirmação **não verificável** e **fora do áudio** (o
narrador do `08-resposta` ainda diz outra frase, que a gente tirou da tela).

## Pendências
- **Efeitos sonoros:** ligados na rodada 3 (ver acima). A **licença** da música e dos efeitos não foi verificada por mim.
- **`software-recorte.png`** não existe: o bloco 04 está só com texto.
- **Vídeos não usados**, ainda em `public/videos/cenas/`: `cena-3-grafico.mp4` ("Link in Bio") e
  `cena-5-trator.mp4` (marca d'água). Podem ser apagados.
- **Fotos:** nenhuma das imagens tem marca d'água ou texto. Só a cena 4 está abaixo de 1170 px.
- **Biblioteca 3D:** nenhuma instalada. Tudo em CSS 3D.
- **Pronúncia:** não conferida (não consigo ouvir o áudio).

## O que não consegui seguir à risca
- **"Partículas subindo só no bloco 08":** as cenas 1, 5 e 8 já tinham poeira dourada subindo
  ("partículas atuais ficam iguais"). Mantive. O bloco 08 ganhou partículas próprias, mais visíveis.
- **Bloco 05, "DIFÍCIL estilhaçado":** a animação é risca + sai para trás (não estilhaça). O ponto de
  impacto marca o fim da risca.
- **Bloco 07:** entre 0,5 s e 3,2 s o centro fica sem frase (as frases entram nas pausas da fala);
  só a frase riscada fica no alto.
- **Cena 1, "nenhum assunto atrás do logo":** o notebook saiu de trás do logo, mas o texto da
  resposta passa por cima da parte de baixo do vídeo (desfocado e escurecido).

## O que supus sem confirmar
- Os tempos dos blocos 07 e 08 (cada frase entra no momento da fala) vêm das **pausas do narrador**
  medidas com `silencedetect` do FFmpeg, não de uma transcrição palavra por palavra. Se o áudio for
  regerado, conferir os tempos em `src/dados/apresentacao.ts`.
- **Tick** em 9 pontos (as 8 perguntas e a pílula da abertura), em vez de 8.
- O logo volta ao centro no bloco 08 aos 2,3 s, num tamanho menor (36% da largura) e mais abaixo
  (55% da altura), para caber todo o texto.
- Cards, moeda fixa e legenda do 07 entram numa fração da fala, não na palavra exata.
- No bloco 06, a lista aparece desde o início, e o contador só começa com a resposta.
- A cartela segura 30 frames a mais no fim, além da folga de 20.
