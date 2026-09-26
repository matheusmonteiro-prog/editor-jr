# ARQUITETURA — editor-jr (v1)

## Status
- [x] Etapa 0 — Infraestrutura (Git, GitHub, SSH, Node, Remotion rodando em casa e no trabalho)
- [x] Etapa 1 — Organizar a casa
- [x] Etapa 2 — Cortes, gancho e limpeza de voz (completa em 23/09/2026)
  - [x] 2a — Corte de silêncios (aprovado em 23/09/2026)
  - [x] 2b — Redução de ruído e equalização da voz (aprovado em 23/09/2026, amostra A/B)
  - [x] Gancho (reordenar trechos), incluindo teaser com múltiplos trechos — testado e aprovado (23/09/2026)
- [ ] Etapa 3 — Montagem sobre vídeo real
- [ ] Etapa 4 — Legendas automáticas
- [ ] Etapa 5 — Identidade visual
- [ ] Etapa 6 — Leitor de prompt
- [ ] Etapa 7 — Interface própria
- [ ] Etapa 8 — Exportação e entrega

---

## 1. O que é o projeto
Editor de vídeo local, no navegador, para uso pessoal.
Fluxo: sobe o vídeo → escreve o prompt → o sistema corta, monta camadas (motion graphics, imagens, sons, legendas) → exporta.
Conteúdo principal: vídeos do JR (Investidor Sertanejo), a maioria vídeo-aula com screencast explicando o Método JR, e vídeos curtos (Shorts/Reels/TikTok).
Se validar bem, pode virar produto no futuro. Isso é outro projeto (ver seção 8).

## 2. Ambiente
- Repositório: `git@github.com:matheusmonteiro-prog/editor-jr.git` — branch `main`
- Pasta em casa: `C:\Users\conta\editor-jr`
- Pasta no trabalho: `C:\Users\edica\editor-jr`
- Node v24, npm 11, Remotion (template Blank, sem Tailwind)
- Sincronização: `git pull` ao começar, commit + push ao terminar
- **FFmpeg:** o Remotion traz o dele em `node_modules/@remotion/compositor-win32-x64-msvc/`.
  Serve para cortar e juntar (é o que o script de cortes usa), mas é uma build enxuta:
  vem com `silencedetect` e `loudnorm`, e **não** vem com os filtros de redução de
  ruído e equalização. Para a Etapa 2b é preciso o FFmpeg completo:
  `winget install Gyan.FFmpeg` (já instalado na máquina do trabalho, falta em casa).

### Cuidado ao conferir vídeo (custou horas na Etapa 2)
**Não use a pré-visualização do VS Code para testar áudio.** Ela roda sobre Chromium,
que não embarca o decodificador de AAC: o vídeo toca e o áudio some, sem nenhum aviso.
Conferir sempre pelo Explorador de Arquivos, ou no VLC. MP3 toca no VS Code porque é
formato livre — o que torna o sintoma ainda mais enganoso.

## 3. Decisões tomadas
- **Camadas:** todo elemento (gráfico, texto, imagem, som, legenda) é uma camada separada e editável. Nada queimado no vídeo antes da exportação final.
- **Prompt diz o quê e quando.** O onde (posição/tamanho) nasce num padrão e é ajustado visualmente depois.
- **Formato do prompt (v1):** semi-estruturado, tipo comando, lido sem IA (custo zero). Exemplo ilustrativo, a definir na etapa 6:
  `[2:30] circulo-destaque`
  `[2:30] som: dinheiro-tim`
  `[gancho] 3:10-3:25 → início`
- **Tempos no prompt sempre se referem à gravação original** (o tempo da transcrição), nunca ao vídeo já cortado. É assim que o `--gancho` já funciona hoje (seção 7, Etapa 2) — vale como regra geral para qualquer tempo citado no prompt, inclusive na Etapa 6.
- **Layout padrão:** o JR fica centralizado por padrão, e nenhum elemento sobreposto (gráfico, imagem, legenda etc.) pode cobrir o rosto dele.
- **API da Anthropic:** usada só para criar componentes novos que não existem no catálogo. Custo pago por chamada, separado da assinatura do Claude.
- **Catálogo:** todo componente aprovado é salvo e reaproveitado, trocando só os dados.
- **Componentes editáveis:** propriedades expostas para edição sem prompt.
- **Áudio:** voz original do JR, com limpeza de ruído. Sem voz gerada por IA.
- **Retoque de pele:** fora do projeto. Resolver na gravação (iluminação).
- **Vertical/horizontal:** o OBS grava em 16:9; não existe mais detecção automática 1:1 pelas
  dimensões do arquivo. O formato de cada saída (horizontal, vertical, ou as duas da mesma
  gravação) é **declarado no prompt** — gerar vertical a partir de gravação horizontal exige
  um layout próprio, não é só redimensionar (ver Etapa 3 e Etapa 6, item de várias saídas).
- **Posicionamento automático por visão (IA olhando o frame):** fora da v1.

## 3a. Formatos de entrada de vídeo (sessões de gravação)
Cada sessão de gravação chega em um de dois formatos. O plano de edição (JSON,
ver Etapa 2) precisa registrar qual dos dois é, num campo de tipo de sessão:
`single_file` ou `multi_layer`.

**FORMATO A — multi-camada (3 arquivos).** Gravado no OBS (câmera + tela +
mic), possivelmente via um plugin de terceiro (Source Record) para separar
as saídas em arquivos distintos — não instalar/configurar sem aprovação do
Matheus. **Cada arquivo vem de uma pasta fixa diferente** (não uma subpasta
única por sessão como antes se imaginava):
- **Tela** — vídeo da tela, sem áudio
- **Câmera** — vídeo da câmera do JR, sem áudio
- **Câmera+Mic** — vídeo da câmera **com o áudio do microfone embutido**;
  é o único dos 3 com trilha de áudio, e é ele quem manda no corte de silêncio

(Correção: a ideia antiga de um `audio_<data>.wav` **separado** como trilha
mestre estava errada — não existe arquivo de áudio puro. O áudio mora dentro
do arquivo de câmera+mic.)

**Premissa parcialmente testada:** que os três arquivos começam juntos e têm
a mesma duração. O `cortar-silencio.mjs` já **verifica isso sozinho** (avisa
se a duração de tela/câmera destoar da do câmera+mic em mais de 1s) e foi
testado de ponta a ponta com arquivos sintéticos — mas **ainda não com uma
gravação real do OBS**. Isso continua sendo pré-requisito da Etapa 3 (a parte
de composição/Remotion): gravar um teste curto (1-2 min) no OBS antes de
construir a lógica de camadas visuais em cima disso.

**Variação de entrada (1b), ainda PENDENTE:** algumas sessões podem vir com só
**2 arquivos** em vez de 3 (ex.: só câmera+mic e tela, sem o arquivo de câmera
separado). O sistema precisaria reconhecer esse caso e usar o que estiver
disponível. Diferente do caso de 3 arquivos (esse já implementado, ver abaixo),
esta variação ainda não foi pedida nem testada — confirmar se/quando acontecer.

Tela e câmera viram duas camadas no Remotion: tela sempre visível por baixo,
câmera por cima só nos trechos que o prompt definir (ex.: "0:00-3:00 tela,
3:00-3:45 câmera"). Troca de foco é controlar a visibilidade/duração da camada
da câmera — **não é corte de clipe**. Isso nunca é automático, sempre vem do
prompt. Ajuste fino é manual, arrastando a borda da camada no Remotion Studio.
Regra de layout vale aqui também: o JR centralizado, nada cobre o rosto dele
(ver seção 3, Decisões tomadas).

**Composições possíveis (câmera + tela), tudo via prompt — não é um tipo de
cena novo, é uso da composição em camadas:**
- Câmera em tela cheia
- Tela em foco, câmera pequena num canto (picture-in-picture)
- Câmera encolhendo pro centro-inferior enquanto abre atrás um fundo (ex.:
  textura de papel) onde imagens da pasta entram uma a uma, estilo `ColagemCenas`
- O inverso: câmera em cima, imagens/colagem embaixo

Tamanho, posição e transição nascem com um padrão e continuam ajustáveis (mesma
regra da seção 3: prompt diz o quê e quando, o onde nasce padrão e se ajusta
depois).

**FORMATO B — arquivo único** (vídeo + áudio juntos). Tratado como já funciona
hoje, sem lógica de camada. É o formato do `teste-jr.mp4` usado até aqui.

**Referência adicional para a Etapa 3:** o Matheus vai trazer alguns vídeos já
gravados em formato vertical (Shorts/Reels), além do teste de sincronia do OBS,
como material de exemplo.

**Corte de silêncio no Formato A: PRONTO** (ver Etapa 2, seção 7, "Modo
multi-camada").

## 4. Regras de organização
- Vídeo **nunca** vai para o GitHub (limite de 100 MB por arquivo; vídeos passam disso). Só código.
- Nomes de arquivo sem espaço.
- Exportações versionadas: `video-selic-v1.mp4`, `video-selic-v2.mp4`. Nunca sobrescrever.
- Backup dos vídeos brutos (Drive ou HD externo).
- Música e efeitos apenas de bancos livres de direitos: YouTube Audio Library, Pixabay Music, Uppbeat, Pixabay Sound Effects, Freesound (conferir licença de cada som).
- Todo vídeo leva o aviso: **"Não é recomendação de investimento."** O aviso
  **completo** vai só na **descrição do vídeo** (padrão observado em outros
  canais da área) — não precisa aparecer dentro do vídeo em si. **Ressalva:
  isso é observação de mercado, não foi confirmado juridicamente.** Ver
  `AvisoCVM` na seção 6.

## 5. Estrutura de pastas (alvo)
```
editor-jr/
├── CLAUDE.md
├── ARQUITETURA.md
├── scripts/            ← ferramentas de linha de comando (corte de silêncio)
├── src/
│   ├── components/     ← catálogo de motion graphics
│   ├── Composition.tsx
│   ├── Root.tsx
│   └── index.ts
├── public/
│   ├── images/         ← prints e imagens
│   ├── music/          ← músicas de fundo
│   ├── sfx/            ← efeitos sonoros
│   └── brand/          ← logo e identidade visual
└── videos/             ← brutos e exportados (ignorada pelo Git)
```

**Formato A (multi-camada) não segue essa árvore.** Os 3 arquivos (tela,
câmera, câmera+mic) vêm de **pastas fixas e diferentes** do OBS, geralmente
fora do projeto — não uma subpasta única por sessão. Os cortes desse formato
saem ao lado do arquivo de câmera+mic (ver Etapa 2, "Modo multi-camada").

## 6. Catálogo de componentes
**Componentes prontos, em `src/components/`, com propriedades editáveis (schema zod) no Studio:**
- `ImagemFade` — imagem com fade in
- `GraficoLinha` — linha com curva suave, gradiente, brilho, área preenchida, número contando, entrada/saída com spring
- `ColagemCenas` — imagens PNG entrando escalonadas com rotação e spring (estilo colagem de papel)
- `ComparacaoBarras` — barras crescendo com número contando e destaque
- `TextoDestaque` — overlay de texto (ex.: "SOJA", "12% ao ano") para destacar uma palavra/frase
  curta que o JR está falando. Posição topo/centro/rodapé, cor do texto, fundo semi-transparente
  opcional (ou sombra, se o fundo estiver desligado), duração em frames, entrada/saída com spring.
  Pronto e testado no Studio (25/09/2026).
- `Seta` — seta que "desenha" na tela (traço crescendo até a ponta), reta ou curva, pra apontar
  algo no vídeo. Posição inicial/final, cor, espessura, curvatura, duração em frames. A ponta só
  aparece nos últimos 25% do traço, sempre proporcional a `duracaoFrames` (testado com 10, 40 e
  100 frames). **Pronta no código (26/09/2026), ainda não validada visualmente pelo Matheus no
  Studio** — só testada mentalmente/por leitura do código até aqui.
- (o gráfico simples "GraficoSubindo" foi descartado na etapa 1, era só teste inicial)

**A construir:**
- `CirculoDestaque` (com pulso) · `Checkmark` · `Spotlight` · `Contador`
- `ArrobaInstagram` (fixo no canto) · `LogoAnimada` (intro/outro)
- `AvisoCVM` — o texto **completo** vai na descrição do vídeo, não dentro dele
  (ver seção 4; decisão por observação de mercado, não confirmada juridicamente).
  Substitui o plano anterior de "versão completa no fim". Ainda **em aberto**:
  se sobra algum indicador discreto dentro do vídeo (ex. rodapé), e se sim, com
  que formato e posição — pra não colidir com outros elementos, como o gancho.
- `LegendaAnimada` — legenda automática com estilo padrão e destaque para
  frases-chave (Etapa 4)
- `CallToAction` — elemento fixo reutilizável (ex.: "inscreva-se", sino, like),
  chamado via prompt quando necessário. Segue o padrão de imagem + som
  sincronizado decidido para a Etapa 3 ("Música de fundo e efeito sonoro
  sincronizado a um elemento visual").

**Padrão de organização no Studio (desde 25/09/2026):**
- Cada composição do catálogo fica dentro de `<Folder name="Catalogo">`, em `Composition.tsx`.
  Composições de rascunho/teste (ex.: `naruto`) vão em `<Folder name="Testes">`, em `Root.tsx`.
- Cada componente envolve o próprio conteúdo num `<Sequence name="NomeDoComponente">`, para
  aparecer como camada nomeada na timeline — importante quando vários componentes forem
  empilhados juntos na Etapa 3.
- **`defaultProps` tem que ser objeto literal direto dentro do `<Composition>`**, não uma
  variável importada. É a única forma do Studio conseguir salvar de volta no código quando
  você edita um campo pelo painel — com uma variável importada, o Studio mostra "não é possível
  salvar os adereços padrão" e a edição se perde. Por isso os componentes não exportam mais o
  próprio `defaultProps`; ele mora só no `Composition.tsx`.
- **Cuidado ao testar/arrastar elementos no canvas do Studio:** já aconteceu mais de uma vez do
  editor visual escrever de volta no código coisas inesperadas — `from`/`durationInFrames`/`style`
  soltos num `<Sequence>` (cortando a composição sem querer) e até o conteúdo inteiro de um
  componente sumindo (`return null`). Depois de mexer bastante no Studio, vale rodar
  `npx tsc --noEmit` pra conferir se o código continua íntegro.
- **Skill `remotion-markup`** (oficial, `remotion-dev/skills`, ver `skills-lock.json`) documenta
  esses padrões oficialmente — inclusive foi ela que confirmou a exigência do `defaultProps`
  como objeto literal. `.claude/skills/` fica fora do Git (é só um link simbólico local pro
  conteúdo real em `.agents/skills/`, que esse sim é versionado).

## 7. Etapas

### Etapa 1 — Organizar a casa
- Criar a estrutura de pastas da seção 5
- Configurar `.gitignore` para ignorar `videos/` e extensões de vídeo
- Separar os protótipos validados em componentes próprios em `src/components/`, com propriedades editáveis no Studio
- Manter uma composição de demonstração para cada componente
- Confirmar que `npm run dev` continua funcionando
- **Pré-requisitos:** nenhum.

### Etapa 2 — Cortes, gancho e limpeza de voz

**2a — Corte de silêncios: PRONTO.** Script `scripts/cortar-silencio.mjs`, sem
dependência nova (usa o FFmpeg do Remotion).

```
node scripts/cortar-silencio.mjs videos/VIDEO.mp4                    # só analisa
node scripts/cortar-silencio.mjs videos/VIDEO.mp4 --gerar            # gera o mp4
node scripts/cortar-silencio.mjs videos/VIDEO.mp4 --gerar --margem 0.25
```

Opções: `--limiar` (dB, padrão -30) · `--pausa` (s, padrão 0.8) · `--margem`
(s, padrão 0.15) · `--minimo` (s, padrão 0.3) · `--gancho 1:10-1:25` · `--copiar`.

Sem `--gerar` ele só analisa e mostra o relatório — use sempre isso primeiro para
calibrar, porque gerar o vídeo é lento. A saída é versionada (`-cortado-v1`, `-v2`…),
nunca sobrescreve.

**A lista de trechos vira dado, não fica queimada no vídeo:** o script grava
`videos/VIDEO.cortes.json` com os silêncios, os trechos mantidos e os parâmetros
usados. É esse arquivo que as Etapas 3 e 6 devem consumir para montar a timeline.
O mp4 cortado serve para conferir o resultado a olho.

Resultado no vídeo de teste (`teste-jr.mp4`, 2:42): 21 pausas, 14,7% cortado, saída 2:18.

Notas de implementação, para não repetir os erros:
- O FFmpeg do Remotion não tem o encoder `wrapped_avframe`, então o `-f null -` normal
  falha. A análise precisa de `-vn` e `-c:a pcm_s16le`.
- Os pedaços intermediários usam áudio PCM e o AAC é gerado uma única vez, na junção.
  Assim o áudio não é comprimido duas vezes.
- Cortar é sempre mais caro do que parece: 21 trechos de 1080p levam alguns minutos.

**2b — Limpeza de voz: PRONTO, testado e aprovado (23/09/2026).** Opção `--limpar`:

```
node scripts/cortar-silencio.mjs videos/VIDEO.mp4 --gerar --limpar
```

Cadeia de filtros (valores de partida, ajustáveis — ver constantes
`FILTRO_REDUCAO_RUIDO` e `FILTRO_NORMALIZACAO` no topo do script):
- `highpass=f=80` — corta ruído grave abaixo da voz (zumbido, vento, ar-condicionado)
- `afftdn=nf=-25` — redução de ruído de fundo constante, por FFT
- `acompressor` — nivela a dinâmica (sussurro sobe, fala forte desce um pouco)
- `loudnorm=I=-16:TP=-1.5:LRA=11` — normaliza o volume final (padrão de streaming),
  aplicado uma vez só sobre a trilha inteira já montada, não em cada pedaço

Nenhum desses filtros existe no FFmpeg enxuto do Remotion — exige o FFmpeg completo
(ver seção 2). O script detecta sozinho onde ele está (PATH, ou o local padrão do
winget) e recusa com mensagem clara se não achar.

Aprovado por amostra A/B (20s, com e sem `--limpar`, mesmo trecho) — ainda não
rodado no vídeo inteiro nem testado com o gancho junto, mas o mecanismo é o mesmo.

**Gancho: PRONTO, testado e aprovado no `teste-jr.mp4` (23/09/2026).**
`--gancho 0:46-0:56` recorta o trecho e o **move** para o início (padrão). Com
`--copiar`, o trecho aparece no início e também continua no lugar original
(formato "prévia"). Uma fala que atravessa a borda do gancho é dividida: a
parte de fora fica no lugar dela, nada se perde.

**Teaser com vários trechos:** o `--gancho` aceita uma lista separada por
vírgula, montando os trechos em sequência no início **na ordem digitada**
(não na ordem cronológica do vídeo):

```
node scripts/cortar-silencio.mjs videos/VIDEO.mp4 --gerar --gancho 0:46-0:56,0:14-0:22,1:20-1:25
```

Cada trecho do teaser passa pelo corte de silêncio normalmente (uma pausa no
meio da fala escolhida é removida, igual ao resto do vídeo). Dois ganchos que
se sobrepõem dão erro, em vez de duplicar áudio sem avisar. Validado por
correlação de áudio (comparação de forma de onda entre o gerado e o original),
não só por audição.

**Modo multi-camada (Formato A): PRONTO** (25/09/2026). Três flags em vez do
vídeo posicional — sem elas o script continua funcionando exatamente como
antes (modo arquivo único):

```
node scripts/cortar-silencio.mjs --gerar --tela "caminho\tela.mkv" --camera "caminho\camera.mkv" --camera-mic "caminho\camera-mic.mkv"
```

O áudio do câmera+mic decide os cortes (tela e câmera não têm áudio). Os
mesmos intervalos de tempo são aplicados aos 3 — inclusive `--gancho` e
`--limpar` funcionam normalmente (`--limpar` só afeta o áudio do câmera+mic;
tela e câmera são só vídeo, sem filtro de áudio). Gera 3 saídas, com o mesmo
número de versão, na pasta do `--camera-mic`:
```
<nome-do-camera-mic>-tela-cortado-v1.mp4
<nome-do-camera-mic>-camera-cortado-v1.mp4
<nome-do-camera-mic>-camera-mic-cortado-v1.mp4
```

O `.cortes.json` ganha `tipoSessao` (`"single_file"` ou `"multi_layer"`) e,
no modo multi, `arquivos: {tela, camera, cameraMic}` com os 3 caminhos.

Se tela ou câmera tiverem duração diferente da do câmera+mic (mais de 1s de
diferença), o script avisa — mas não impede de continuar, o Matheus decide.

Testado de ponta a ponta com arquivos sintéticos (3 arquivos em pastas
diferentes, com espaço no nome, verificado quadro a quadro e o áudio
decodificado pra confirmar que não estava mudo). **Ainda não testado com uma
gravação real do OBS** — ver seção 3a.

- **Pré-requisitos:** um vídeo bruto curto de teste com o JR falando (atendido);
  FFmpeg completo instalado, só para a 2b.

### Etapa 3 — Montagem sobre vídeo real
- Formato A (multi-camada): tela sempre visível por baixo, câmera por cima só
  nos trechos que o prompt definir — ver seção 3a
- Vídeo base + camadas por cima (componentes com fundo transparente)
- Detecção automática de vertical/horizontal
- `ArrobaInstagram` e `AvisoCVM` fixos
- Música de fundo e efeito sonoro sincronizado a um elemento visual
- **Teste de tempo de renderização** com vídeo longo (10–20 min) no computador do Matheus
- **Pré-requisitos:** @ do Instagram, uma música e um efeito sonoro de teste baixados;
  gravar um teste curto (1-2 min) no OBS e conferir a sincronia dos 3 arquivos (Formato A,
  ver seção 3a); alguns vídeos já gravados em vertical (Shorts/Reels) como referência.

### Etapa 4 — Legendas automáticas
- Transcrição local e gratuita (verificar a ferramenta oficial do Remotion para legendas / Whisper)
- Estilo padrão + destaque para frases-chave
- **Pré-requisitos:** uma fonte (provisória até a etapa 5).

### Etapa 5 — Identidade visual
- Aplicar paleta e fontes do Emparelhamento como padrão fixo do projeto
- Gerar variações da `LogoAnimada` até escolher a padrão
- **Pré-requisitos:** logo em PNG (fundo transparente) e Emparelhamento finalizado no Claude Design.

### Etapa 6 — Leitor de prompt
- 6a: ler o formato de comando e gerar a timeline (sem IA)
- 6b: gerar componente novo via API quando não existir no catálogo; aprovado → entra no catálogo
- O prompt pode pedir **várias saídas da mesma gravação** (ex.: vídeo principal +
  2 cortes curtos de 30-90s). É o Matheus quem indica os trechos e as transições
  de cada saída — não é a IA escolhendo sozinha. O formato do prompt (a definir
  nesta etapa) precisa prever isso, incluindo o formato de tela de cada saída
  (horizontal/vertical, ver seção 3 e Etapa 3). Transições mais chamativas em
  vídeo curto, mais discretas no longo.
- O formato oficial do roteiro/prompt (schema) só é definido aqui — não criar
  schema antes desta etapa.
- **Pré-requisitos:** chave da API da Anthropic (só na 6b).

### Etapa 7 — Interface própria
- Tela local no navegador: subir vídeo, escrever prompt, ver prévia
- Adicionar imagem depois, em qualquer momento do vídeo
- Ajustar camadas arrastando e redimensionando
- Organizar imagens, músicas e efeitos pela interface
- Controle visual (tipo slider) para ajustar a limpeza de voz da Etapa 2b sem
  mexer em código — hoje os parâmetros (`afftdn`, `acompressor`, `loudnorm`)
  só são ajustáveis editando as constantes no `scripts/cortar-silencio.mjs`
- **Ideia (25/09/2026):** chat por camada — botão direito numa camada, "editar com IA",
  abre um chat que muda só aquela camada (texto, cor, posição etc.) por instrução em
  linguagem natural, sem precisar editar campo por campo. Ainda não detalhado.
- **Pré-requisitos:** nenhum novo.

### Etapa 8 — Exportação e entrega
- Melhor configuração automática por formato/plataforma (resolução, taxa de bits)
- Download fácil do arquivo final
- Envio automático do vídeo pronto para o Google Drive
- **Pré-requisitos:** autorizar acesso à conta Google.

## 8. Fora da v1 (futuro)
- Prompt em linguagem totalmente livre
- IA analisando o frame para sugerir posição dos elementos
- Transformar em produto (servidor, outros usuários). Atenção: a licença do Remotion depende do tamanho da empresa que usa; conferir em remotion.dev/license antes de escalar.

## 9. Pendências do Matheus (fora do código)
- [ ] Finalizar Emparelhamento (fontes e cores) no Claude Design
- [ ] Logo em PNG com fundo transparente
- [ ] Baixar músicas e efeitos iniciais
- [ ] Vídeo bruto de teste
- [ ] Chave da API da Anthropic (etapa 6b)
