# PR: vídeo de apresentação do JR (pergunta e resposta)

Branch `video-apresentacao` → `noite-etapa6`.

Vídeo vertical 1080x1920, 30 fps, sem câmera: fotos de fundo + texto + elementos animados +
narração TTS, em abertura + 8 blocos de pergunta e resposta. A duração de cada bloco vem do
áudio real (calculateMetadata + Mediabunny), mais 20 frames de folga.

## Como abrir
`npm run dev` → pasta **Videos** → `VideoApresentacao`. O componente novo do catálogo fica em
**Catalogo** → `GradeAtivos3D`.

## O que entrou
- `src/VideoApresentacao.tsx`: a composição e o `calculateMetadata` (mede os 17 áudios).
- `src/dados/apresentacao.ts`: textos, áudios, cenas e tempos. **É o modelo** para outros vídeos
  pergunta e resposta: copiar e trocar os dados.
- `src/utils/linhaDoTempoApresentacao.ts`: monta a linha do tempo a partir das durações.
- `src/components/apresentacao/`: FundoCenas, TextoKinetic, PilulaPergunta, FioProgresso,
  Logo3D, Moeda3D, CardCheckFlip, ContadorImpacto, TextoRiscado, Particulas, RaiosDeLuz,
  BrilhoRadial, WipeBloco e `marca.ts` (cores e fontes).
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

### Bloco a bloco
| Bloco | Quebras |
|---|---|
| 00 Abertura | Logo em **3D (CSS)** girando uma volta no eixo Y; **brilho radial** atrás do logo; **partículas** de poeira dourada; caixa alta |
| 01 Quem é ele? | **Spotlight dourado (glow)** atrás do logo 3D; logo voa em curva para o canto; partículas |
| 02 O que ele faz? | **Moeda 3D** caindo; contador com **pulso e borrão de movimento**; cards com **flip 3D**; flash dourado na troca de cena |
| 03 O que é o Método JR? | **Moeda 3D** caindo rápido; cards com **flip 3D**; empurrão vertical |
| 04 O que vai mostrar? | **Raios de luz** com blur; zoom atravessando a cena |
| 05 É difícil entender? | Risca dourada com **glow**; "DIFÍCIL" sai para trás; **explosão de partículas** em "FÁCIL"; partículas no fundo |
| 06 Portfólio? | **GradeAtivos3D: 400 cubos em 3D**; máscara circular na troca |
| 07 Recomenda? | Risca dourada com **glow**; fundo com **gráfico ilustrativo** (a foto da cena 7 tem candles e barras douradas, sem número) |
| 08 Como conhecer? | Logo **3D** girando ao contrário; **brilho radial dourado**; **partículas**; fusão com brilho |

### O que continua proibido (e não foi usado)
Verde #1DD41E fora de sinal de compra (só aparece na seta do próprio logo, que é a marca), emoji,
rosto do JR por IA, promessa de rentabilidade, AvisoCVM, ArrobaInstagram, lista de espera, link
na bio, comentário fixado.

## Pendências
- **Falta `audio/apresentacao/08-resposta.mp3`.** O bloco 08 fica mudo na fala do narrador, com
  uma reserva de 90 frames (`TEMPOS.reservaAudioFaltando`). Quando o arquivo existir, a duração se
  ajusta sozinha.
- **Falta `images/software-recorte.png`.** O bloco 04 está só com texto.
- **Sons:** nenhum arquivo de whoosh, tick ou trilha. Os lugares estão marcados na timeline do
  Studio como "SOM whoosh NN", "SOM tick NN" e "SOM trilha (sem arquivo)". Para ligar, preencher
  `SONS` em `src/dados/apresentacao.ts`.
- **Fotos:** nenhuma com marca d'água ou texto; nenhuma abaixo de 1170 px depois do preparo
  (originais 1024x1536 → prontas 1296x2304). Nenhum zoom reduzido para 103%.
- **Biblioteca 3D:** nenhuma instalada. Tudo em CSS 3D.
- **Pronúncia:** não conferida (não consigo ouvir o áudio).

## O que não consegui seguir à risca
- **Cena 1, "nenhum assunto atrás do logo":** nos blocos 00 e 01 o logo fica em cima do broto.
  A imagem já está em 9:16, então descer o broto exige zoom de uns 125% (a foto fica mole).
  Decisão do Matheus: manter assim ("logo nascendo do broto") ou trocar o enquadramento.
- **Destaque de várias palavras** ("MÉTODO JR", "NA PRÁTICA") entra como uma peça só, para não
  quebrar de linha no meio. As outras palavras seguem uma por uma, com 3 frames entre elas.
- **Momento dos cards, da moeda e da legenda do 07:** calculado como fração da fala do narrador
  (ex.: card 1 do bloco 02 em 42% da fala), não pela palavra exata. Não há marcação de tempo
  por palavra nos áudios.

## O que supus sem confirmar
- Destaque do bloco 07 ("MOSTRA COMO FAZ") em **"MOSTRA"** (o pedido não dizia qual palavra).
- A legenda do bloco 07 ("A DECISÃO É DE CADA INVESTIDOR.") também em caixa alta, pela regra
  "caixa alta em tudo".
- O "+" do contador em dourado é o único destaque daquele elemento.
- A cartela segura 30 frames a mais no fim (`TEMPOS.seguraCartela`), além da folga de 20.
- No bloco 06, a grade aparece **apagada** já durante a pergunta e acende na resposta.
