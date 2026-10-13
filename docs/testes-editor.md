# Testes de validação do editor (visão de editor profissional)

Criado em 11/10/2026. Lista de testes para conferir se o editor se comporta como um editor
profissional, **antes** de confiar nele para vídeo de verdade. Não é uma etapa nova do
`ARQUITETURA.md`: é uma lista de verificação que cruza as etapas 3, 4, 6 e 8.

**Como esta lista foi feita:** o status de cada item foi apurado lendo o código e os
documentos (`ARQUITETURA.md`, `docs/catalogo-componentes.md`, `docs/criterios-fechamento.md`,
`src/PlanoComposicao.tsx`, `src/utils/tempoCortado.ts`, `scripts/`). **Nada foi executado nem
renderizado para escrever este documento.** Onde só li o código e não rodei, está escrito.
Quando não achei nada, está escrito **"não existe"**, sem suposição.

**Legenda do status:**
- **Existe**: há código ou teste que cobre o item, com arquivo e linha.
- **Existe em parte**: há uma peça, mas falta outra; o texto diz qual.
- **Não existe**: procurei e não achei.

**Regra deste documento:** a palavra "validado" só entra aqui depois que o Matheus tiver
visto o resultado no Studio (ou no vídeo final). Hoje nenhum item abaixo está validado.

---

## BLOCO 1 — LEITURA NA TELA

### T10 — Screencast legível em vertical
- **O que é:** uma tela 16:9 colocada dentro de 1080×1920 fica com largura 1080 e só uns 607 px
  de altura; o texto da tela fica pequeno demais. A solução é dar zoom e deslocar o quadro
  acompanhando a região ativa (onde está o cursor ou onde a ação acontece).
- **Por que importa:** o conteúdo principal do JR é vídeo-aula com screencast
  (`ARQUITETURA.md:22`). Se o aluno não consegue ler a tela no celular, o vídeo perde o sentido.
- **Como validar:** renderizar (ou ver no Studio) um screencast com texto de 12 a 14 pt em
  1080×1920, no tamanho real de um celular. Olhar: dá para ler sem esforço? O quadro acompanha
  a ação sem "balançar"? O zoom entra e sai suave?
- **Status apurado: NÃO EXISTE.**
  - Não existe componente de zoom ou deslocamento sobre vídeo no `CATALOGO`
    (`src/PlanoComposicao.tsx:29-49`) nem em `docs/catalogo-componentes.md`.
  - A única "escala animada" do catálogo é efeito de entrada de outros elementos
    (ex.: `PersonagemImagem`, `docs/catalogo-componentes.md:340`), não zoom de câmera.
  - Existe só um **experimento de teste**, não um componente: `src/testes/TesteZoom.tsx`
    (zoom suave, de impacto e lento sobre um vídeo, com ponto de foco fixo). Não segue cursor
    e não está no plano.
  - **Pendência:** não achei, no projeto, de onde viria a posição do cursor. A gravação do OBS
    é só vídeo (`ARQUITETURA.md:203-211`); nenhum arquivo tem a posição do mouse. Isso precisa
    ser decidido antes de construir.

### T11 — Destaque de cursor e clique
- **O que é:** realçar o ponteiro do mouse (um anel ou halo) e marcar o instante do clique.
- **Por que importa:** em screencast, o aluno precisa saber **onde** olhar e **quando** algo foi
  clicado; sem isso ele se perde.
- **Como validar:** gravar um clique em um botão pequeno. Olhar: o anel acompanha o ponteiro
  sem atraso? A marca do clique aparece no frame do clique (não antes nem depois)? Some a
  tempo de não poluir?
- **Status apurado: NÃO EXISTE.**
  - Busca por "cursor" e "clique" na documentação e em `src/` não achou nada ligado a mouse. As
    únicas ocorrências da palavra `cursor` são variáveis internas de
    `scripts/cortar-silencio.mjs:387-392`.
  - O mais próximo: `CirculoDestaque` (`src/components/v2/CirculoDestaque.tsx`), que circula uma
    região **fixa** definida no plano. Não segue o ponteiro.
  - Depende da mesma pendência do T10: a posição do cursor não existe como dado.

### T12 — Zona segura
- **O que é:** a interface do Shorts, Reels e TikTok cobre o topo e o rodapé do vídeo (nome do
  canal, botões, legenda do app). Nada importante pode ficar nessas faixas.
- **Por que importa:** um texto, uma legenda ou o aviso da CVM coberto pela interface do app
  deixa o vídeo ilegível ou irregular.
- **Como validar:** sobrepor ao vídeo uma máscara das faixas cobertas por cada app e conferir,
  quadro a quadro, que nenhum elemento do plano invade a máscara.
- **Status apurado: NÃO EXISTE.**
  - Busca por "zona segura", "safe zone" e termos parecidos não achou nada no projeto.
  - Há fatos relacionados: `TextoDestaque` aceita posição `rodape`
    (`docs/catalogo-componentes.md`, tabela do `TextoDestaque`) e o validador exige `posicao`
    "topo" ou "base" (`scripts/validar-plano.mjs:435`). Esses são justamente os lugares que a
    interface do app cobre.
  - O projeto só tem a regra "o JR centralizado, nada cobre o rosto dele"
    (`ARQUITETURA.md:180`), que é outra coisa.
  - **Pendência:** as medidas exatas de cada app **não estão no projeto** e eu não as supus.
    Precisam ser pesquisadas na documentação de cada plataforma antes de escrever a máscara.

---

## BLOCO 2 — MONTAGEM

### T13 — Troca de foco tela/câmera
- **O que é:** quando o vídeo passa de "tela grande" para "câmera grande" (e vice-versa), é
  corte seco ou transição curta? E quem fica grande e quem fica na janelinha em cada momento?
- **Por que importa:** troca de foco abrupta ou sem lógica cansa e confunde; é um dos sinais
  mais visíveis de edição amadora.
- **Como validar:** montar uma sequência tela → câmera → tela e comparar corte seco contra
  transição de ~15 frames, no Studio. Olhar: o olho acompanha a troca? A janelinha nunca cobre
  o rosto do JR nem o texto da tela?
- **Status apurado: EXISTE EM PARTE.**
  - **Decisão escrita:** a troca de foco é controlar a visibilidade/duração da camada da
    câmera, não corte de clipe, e vem sempre do prompt (`ARQUITETURA.md:253-260`). Composições
    possíveis em `ARQUITETURA.md:262-272`.
  - **Peça de código:** `src/components/v2/CamadaVideo.tsx` (vídeo numa caixa, em fração, com
    `opacidade` e `repetirFrames`), commit `b52f316`. Composições de teste
    `TesteTelaCamera` e `TesteControleCamadas` em `src/Root.tsx:29` e `:63`, com transição
    suave de 15 frames entre 7 cenas (tela dividida, câmera inteira, tela inteira, janelinha em
    4 posições).
  - **O que falta:** `CamadaVideo` **não está no `CATALOGO`** do `PlanoComposicao`
    (`src/PlanoComposicao.tsx:29-49`), então o plano em JSON não consegue usá-lo.
    `PlanoComposicao` só renderiza **um** vídeo (`src/PlanoComposicao.tsx:114`).
    Não existe teste lado a lado de corte seco contra transição. O teste de sincronia dos
    arquivos do OBS com palma não foi feito. **A palma foi dispensada pelo Matheus em
    11/10/2026** (não é mais pré-requisito do Formato A, `ARQUITETURA.md:243-245`).
    **Decisão de método pendente:** alinhar tela e câmera sem palma (a definir).
  - Os testes usam a "tela" provisória (`teste2-tela.mp4`, com erros de leitura).
  - **Lacuna para ligar ao plano (apurada em 11/10/2026, só leitura):**
    - `PlanoComposicao` renderiza um vídeo só (`videoSrc`, `src/PlanoComposicao.tsx:114`) e o
      tipo `Plano` não tem campo de câmera (`:60-64`: `video`, `orientacao`, `elementos`).
    - **Inferência, não testada:** um vídeo de câmera dentro de uma `<Sequence>` do plano
      começaria no frame 0 do arquivo dele; falta um deslocamento de sincronia.
    - Zoom e tela/câmera meio a meio só existem como teste: `src/testes/TesteZoom.tsx` e
      `src/testes/TesteLayouts.tsx` (soltos, sem commit) e a cena 1 do `TesteControleCamadas`
      (`src/Root.tsx`, commit `b52f316`).
    - **Esforço, estimado e não medido:** cerca de 5 arquivos, pelo modelo do commit `5c605ab`
      (AvisoCVM: `.claude/agents/revisor.md`, `checklist-revisao.md`,
      `docs/catalogo-componentes.md`, `docs/estado-atual.md`, `src/PlanoComposicao.tsx`). Para o
      plano controlar tela + câmera de verdade falta ainda **um segundo vídeo no plano** e o
      **deslocamento de sincronia**.
  - **Câmera no plano, Fase 1 (commit `e570119`, 11/10/2026):** o plano ganhou a lista
    `"camera"` (campos: `id`, `inicio`, `duracao`, `x`, `y`, `largura`, `altura`, `ajuste`,
    `framesEntrada`, `framesSaida`) e `deslocamentoCamera` no topo. O caminho do arquivo vem do
    `Root.tsx` (`cameraSrc`), não do plano. Composição de teste `PlanoCameraTeste` (1080×1920,
    30 fps) com `0926-cortado-v1.mp4` como tela e `teste2-camera.mp4` (sala vazia) como câmera,
    4 trechos (`planos/teste-camera.plano.json`). `tsc --noEmit`: exit 0, 0 erros.
  - **Câmera no plano, Fase 2 (11/10/2026, sem commit ainda):** o validador confere a lista
    (`scripts/validar-plano.mjs`, checagem 10); `scripts/testar-validador.mjs`: **25 de 25**
    casos OK; 0 erros em `planos/teste-camera.plano.json` e em `planos/0926.plano.json`. O
    validador **não prova o visual** (câmera cobrir o rosto, sincronia): é conferência no Studio.
  - **PlanoCameraTeste: a câmera vista e aprovada pelo Matheus em 11/10/2026, no Studio.**
  - **Continua SEM prova:** sincronia tela/câmera;
    render; o JR na câmera (a câmera de teste é a sala vazia); a câmera **não recomeçar a cada
    trecho** (desenho com uma instância fixa, não medido); `deslocamentoCamera` (agora com efeito,
    commit `1cc8211`; provado só na conta de frames, não no Studio).
  - **Limites:** o `cortar-silencio.mjs` tem modo de 2 arquivos (commit `6b83f36`, só teste
    sintético, sem par real); a checagem "passa do fim do vídeo" depende de `--duracao` ou
    `videos/<video>.cortes.json`; `framesEntrada` e `framesSaida` não têm máximo; no trabalho,
    após `npm install`, os 29 erros do `CasaExplicativa.tsx` podem voltar no `tsc` (pacotes 3D só
    no `package.json` da `testes-ideias`; **inferência, não testada lá**).
  - **Modo de 2 arquivos no `cortar-silencio.mjs` (commit `6b83f36`):** `--tela` + `--camera`, o
    áudio da tela decide os cortes, a tela sai com áudio e a câmera sem, mesma lista de trechos;
    `tipoSessao: "two_files"`, `parametros.deslocamentoCamera = 0` (sem deslocamento no script);
    `--saida-dir`; `.cortes.json` diferente já existente para o script sem gravar. Teste:
    `scripts/teste-cortar-dois-arquivos.mjs`, `OK (26 verificações)`, vídeos sintéticos. **Não
    provado:** render; sincronia com par real; o JR na câmera; o aviso de duração nunca disparou;
    deriva de frame com os 7 trechos reais e fps 60 contra 30; `--limpar` no modo novo;
    repetição com o ffmpeg do Remotion. Sem prova visual do `deslocamentoCamera` no Studio.
  - **Modo de 2 arquivos com arquivos reais (12/10/2026, PC de casa):** tela = `videos/0926.mp4`
    (2160×3872, 30 fps, 43,14 s, com voz e 6 pausas); câmera = `teste2-camera.mp4` **em loop**
    (sala vazia, 1280×720, 30 fps, 43,17 s, sem áudio, construída fora do projeto). Exit 0 em
    154 s, 7 trechos, nenhum aviso. Saídas: tela 37,924 s e 1137 quadros, com áudio; câmera
    37,933 s e 1138 quadros, sem áudio. Soma dos trechos = `duracaoFinal`; os 7 trechos são
    idênticos aos de `videos/0926.cortes.json`; a tela cortada é byte a byte idêntica ao
    `public/videos/0926-cortado-v1.mp4`. A câmera saiu com 1 quadro a mais (0,009 s), abaixo do
    limite do aviso (provável arredondamento de `-t`; causa não investigada). O script não avisa
    quando as resoluções diferem. **Não provado:** sincronia (sala vazia em loop, sem par real); o
    JR na câmera; render; deriva com fps 60 contra 30; o aviso de duração nunca disparou; a
    diferença de 1 quadro pode acumular com mais cortes reais; qual ffmpeg o script usou (Remotion
    ou PATH). "Voz" = nível de áudio e pausas, não escuta.
  - **`TesteControleCamadas` (11/10/2026):** o Matheus abriu no Studio, em casa, e disse que
    funcionou. A tela era provisória (`teste2-tela.mp4`, com erros de leitura), sem sincronia
    medida e sem render.
  - **Commit `d7c0ce9` (mensagem "origem a confirmar"):** só mudou `src/Root.tsx`: o
    `<AbsoluteFill>` do `TesteControleCamadas` ganhou
    `style={{ scale: 1.004, translate: "3.8px 2.1px" }}`. **Arrasto no Studio confirmado pelo
    Matheus em 11/10; revertido em `b42ae1f`.** `scale` e `translate` são propriedades que o
    Studio grava ao arrastar (`ARQUITETURA.md:379-383`), os valores são quebrados, e o
    `ARQUITETURA.md` manda não arrastar (`:258`, `:753-754`). Também contrariava a regra de
    nada de tamanho fixo em pixel (ex.: `docs/catalogo-componentes.md:134`, Seta).

### T14 — Sincronia depois do corte de silêncio
- **O que é:** os elementos do plano (gráfico, texto, seta...) precisam cair no frame certo
  dentro do vídeo **já cortado** (conferir `src/utils/tempoCortado.ts`). Além disso, entre uma
  fala e outra deve sobrar um respiro mínimo, sem cortar a sílaba.
- **Por que importa:** um elemento que aparece 1 segundo antes ou depois da palavra que ele
  ilustra parece erro. Um corte que come o começo da palavra é irritante de ouvir.
- **Como validar:**
  1. Escolher 5 elementos do `planos/0926.plano.json` espalhados pelo vídeo.
  2. No Studio, parar no frame em que cada um entra e conferir se a palavra correspondente
     acabou de ser dita (ouvir pelo Explorador ou VLC, nunca pela pré-visualização do VS Code:
     ela não toca AAC, `ARQUITETURA.md:166-170`).
  3. Ouvir cada junção de corte (7 trechos no 0926): a primeira sílaba de cada trecho está
     inteira? Sobra um respiro natural, sem "engasgo"?
- **Status apurado: EXISTE EM PARTE.**
  - **Mapa de tempo:** `src/utils/tempoCortado.ts:9-40` converte o tempo do vídeo original para
    o frame do vídeo cortado, e `src/PlanoComposicao.tsx:107-116` aplica isso no `from` de cada
    elemento. A regra de que o prompt usa sempre o tempo original está em
    `ARQUITETURA.md:179`.
  - **Respiro:** o corte deixa uma margem em volta da fala (`--margem`, padrão 0,15 s) e ignora
    trechos menores que `--minimo` (padrão 0,3 s) (`ARQUITETURA.md:441-443`). O `0926.cortes.json`
    real usa margem 0,15 e tem 7 trechos (conferido lendo o arquivo).
  - **Validador:** `scripts/validar-plano.mjs:602-632` avisa quando a folga entre dois blocos
    de **elementos** é maior que 0 e menor que 0,5 s (isso é entre elementos do plano, **não**
    entre falas), e `:634` pega `inicio` fora da duração.
  - **O que não existe:**
    - nenhum teste automático do `tempoCortado.ts` (a busca só achou os dois usos:
      `src/PlanoComposicao.tsx` e `scripts/folha-contato.mjs:23,85`);
    - nenhuma checagem de que o corte não pega a sílaba (só o limiar de silêncio de
      `--limiar -30 dB`);
    - a **duração** do elemento não é convertida: `src/PlanoComposicao.tsx:117` usa
      `duracao` direto, em tempo já cortado. Se um elemento atravessa um corte, a duração
      pode ficar diferente da fala. Não confirmei se isso importa nos elementos do 0926.
  - Conferência exata por palavra depende do Whisper (Etapa 4).

### T15 — Gancho (mover trecho para o início)
- **O que é:** um trecho do meio do vídeo é levado para o começo (teaser), sem bagunçar o
  tempo dos elementos e sem repetir o conteúdo.
- **Por que importa:** o gancho é o que segura o espectador nos primeiros segundos; se ele
  quebra a sincronia dos elementos, o resto do vídeo todo sai fora.
- **Como validar:** gerar o corte com `--gancho` e ver no Studio: (a) o elemento que ilustra a
  fala do gancho entra no frame certo **dentro do gancho**; (b) o elemento que ilustra a fala
  no lugar original entra no frame certo; (c) a fala do gancho não aparece duas vezes (a menos
  que seja `--copiar`, de propósito).
- **Status apurado: ERRO PROVADO; corrigido em `a055886` segundo o commit; o Matheus ainda
  não conferiu o resultado.** Falta ver com um vídeo real com gancho no Studio.
  - **O corte com gancho existe e foi aprovado no `teste-jr.mp4`** (`ARQUITETURA.md:484-490`),
    inclusive com vários trechos, opção `--copiar` (`scripts/cortar-silencio.mjs:236`) e
    proteção contra ganchos que se sobrepõem (`:250-256`).
  - **Fato que causa o erro:** o `cortes.json` guarda os trechos **na ordem final do vídeo**
    (`scripts/cortar-silencio.mjs:524`, `trechos: ordem`; o recorte segue a mesma `ordem`,
    `:553-587`). Com gancho, os pedaços do gancho vêm primeiro e levam o campo `gancho`
    (`:450`); com `--copiar`, o trecho também continua no lugar original, sem esse campo
    (`:458`).
  - **Prova (teste sintético, executado):** com A `[0–10]`, C `[14–26]` e o gancho G `[40–48]`
    movido para o início, a função antiga **errou 9 de 12 casos**: todo tempo antes de 40 s
    caía no frame 0, e um tempo depois de tudo saía em 1770, além do fim do vídeo (900). O
    mesmo teste sem gancho acertou 11 de 11.
  - **Causa:** a versão antiga percorria os trechos assumindo que o tempo original sempre
    cresce ao longo do array (`if (segundoOriginal < t.inicio)`), e extrapolava o fim a partir
    do último trecho do **array**, não do último no tempo original.
  - **Correção aplicada em `src/utils/tempoCortado.ts` (commit `a055886`, 11/10/2026):**
    - procura o trecho que **contém** o tempo, sem depender da ordem do array;
    - com `--copiar`, os trechos originais são consultados antes das cópias (campo `gancho`),
      então vale o **lugar original**;
    - num silêncio, usa o trecho de **maior fim ≤ tempo no tempo original** e devolve o fim dele
      no vídeo cortado (no empate, o original ganha);
    - antes do primeiro trecho: frame 0. Depois do último: **fim do vídeo cortado** (o resultado
      nunca passa da duração total).
  - **Prova da correção (executada, script temporário já apagado):** 12 de 12 casos no gancho
    movido, 7 de 7 no `--copiar`, e **regressão** com o `0926.cortes.json` real: 1296 tempos
    (de 0 até a duração original, a cada 1/30 s), **0 diferenças** entre a função antiga e a
    nova. `npx tsc --noEmit` sem erro fora de `src/testes/CasaExplicativa.tsx`.
  - **Teste no repositório (pelo diff do commit `a055886`):** o commit adicionou
    `scripts/teste-tempo-cortado.mjs` (arquivo novo, 56 linhas) com 20 casos: gancho movido
    (12), `--copiar` (7) e tempo depois do último trecho (1). Esse arquivo **não foi rodado**
    ao escrever este registro.
  - **Ainda não testado:** um vídeo real cortado com `--gancho` passando pelo `PlanoComposicao`
    e visto no Studio (o `0926.cortes.json` real tem `gancho: []`).
  - **Resultado dos testes (11/10/2026, PC de casa):**
    - `node scripts/teste-tempo-cortado.mjs` (do commit `a055886`) rodou: `OK (20 casos)`, saída 0.
      Os 20 casos são escritos à mão (gancho movido 12, `--copiar` 7, depois do último trecho 1),
      com tempos inventados. **Nenhum usa o `videos/0926.cortes.json` real.**
    - O Node mostrou o aviso `MODULE_TYPELESS_PACKAGE_JSON` ao importar
      `src/utils/tempoCortado.ts`. Não é erro. A correção possível seria `"type": "module"` no
      `package.json`, **não feita**.
    - Conferência com o 0926 real, por script temporário fora do projeto (já apagado, então não
      dá para repetir): 45 tempos do original (início, meio e fim de cada trecho e de cada
      silêncio, mais 0, 5, 12,5, 30, 60 e 500 s) deram o mesmo frame que a conta direta.
      **45 de 45 iguais**; último frame 1137 = `duracaoFinal` × 30.
    - **O que isso não prova:** o 0926 não tem gancho (`parametros.gancho` vazio,
      `modoGancho` null), então o gancho e o `--copiar` em vídeo real continuam sem prova. Também
      não prova que o frame cai no momento certo da fala (isso só se vê no Studio).
    - **Sincronia tela/câmera não medida:** o Matheus não gravou o par novo, e ele dispensou a
      palma em 11/10. O método de alinhamento sem palma segue pendente.

---

## BLOCO 3 — ÁUDIO

### T16 — Música de fundo
- **O que é:** a música entra e sai com fade e **abaixa durante a fala** (ducking).
- **Por que importa:** música no mesmo volume da voz torna a fala difícil de entender; entrada
  e saída bruscas parecem erro de edição.
- **Como validar:** ouvir (fora do VS Code) um trecho com fala e um sem. Olhar: no começo e no
  fim a música sobe e desce sem estalo? Durante a fala a música cai o suficiente para a voz
  ficar clara? Ela volta quando o JR para?
- **Status apurado (13/10/2026): Fase 1 EXISTE, SEM ducking.**
  - Existe: lista `audio` no topo do plano (`src/PlanoComposicao.tsx`, tipo `ItemAudio`), tocada com `Html5Audio` de `remotion`; música em **volume fixo baixo** (0,2 no plano de teste), com fade de entrada e saída.
  - **Não existe:** ducking dinâmico. A música não cai durante a fala; o volume é o mesmo o tempo todo.
  - O validador (`scripts/validar-plano.mjs`) **ainda não confere** a lista `audio` (Fase 2 pendente).
  - O critério T16 espera ducking. **Precisa de decisão do Matheus:** aceitar volume fixo baixo ou pedir ducking.
  - Música real: não baixada. `public/music/` só tem o tom de teste, sintético e ignorado pelo Git.

### T17 — Volume final
- **O que é:** o volume do vídeo final fica num nível consistente entre vídeos e sem pico que
  estoure (distorção).
- **Por que importa:** dois vídeos do mesmo canal com volumes muito diferentes obrigam o
  espectador a mexer no volume; pico estourado soa mal em qualquer fone.
- **Como validar:** medir o nível final com o FFmpeg completo (loudness integrado e pico) em
  3 vídeos diferentes e comparar entre si e com o alvo decidido.
- **Status apurado: EXISTE EM PARTE. DECISÃO PENDENTE: o alvo do projeto precisa ser escolhido
  pelo Matheus; não assumi nenhum.**
  - **O que existe hoje:** só a **voz** é normalizada, com `loudnorm=I=-16:TP=-1.5:LRA=11`
    (`ARQUITETURA.md:474`, `scripts/cortar-silencio.mjs:105-107`), e só quando se usa
    `--limpar` (`scripts/cortar-silencio.mjs:604`). O comentário do script chama esse valor de
    "padrão próximo do que YouTube/Instagram usam" (`:105`) — **não verifiquei** essa afirmação
    contra a documentação de cada plataforma.
  - **O que não existe:** nenhum alvo de volume para o **vídeo final já com música e efeitos**;
    nenhuma medição do render; nenhum critério escrito.
  - **A decidir pelo Matheus:** (1) qual alvo de volume integrado e de pico para o vídeo
    final; (2) se o mesmo alvo vale para vertical e horizontal; (3) se a música é mixada antes
    ou depois da normalização da voz.
  - Medição do final depende do render funcionando.

### T18 — Efeito sonoro no frame certo
- **O que é:** o som bate junto com a animação que ele acompanha, sem atraso.
- **Por que importa:** um "clique" ou "pop" meio segundo depois do visual parece desleixo.
- **Como validar:** renderizar um elemento com efeito sonoro e olhar a onda do áudio junto
  com o frame: o pico do som cai no frame em que a animação "bate"? A diferença tem que ser
  menor que 1 frame (33 ms a 30 fps).
- **Status apurado (13/10/2026): Fase 1 EXISTE; sincronia por frame NÃO medida.**
  - Existe: o efeito começa no frame do elemento (`elemento`) ou no `inicio` (pelo `tempoCortado.ts`). Fica na lista `audio` do topo do plano, não dentro de `elementos`.
  - Medido só o **nível** (render curto de 4 s, `PlanoAudioTeste`): a subida do teste de 0,5 s com volume 0,3 ficou 2,0 dB acima da voz na média, no trecho em que aparece. Isso é nível, não sincronia.
  - **Não provado:** que o pico do som cai no frame da animação (com diferença menor que 1 frame). Exige comparar a onda com o frame do render.
  - O efeito de teste é sintético (feito com ffmpeg); o som real ainda não foi baixado.

---

## BLOCO 4 — ENTREGA

### T19 — Mesmo plano nos dois formatos
- **O que é:** o mesmo `plano.json` gera um vídeo vertical (1080×1920) e um horizontal
  (1920×1080), com nenhum elemento fora do quadro ou cortado.
- **Por que importa:** o objetivo é aproveitar um único plano em Shorts/Reels e em vídeo longo;
  se cada formato precisar de conserto manual, o ganho some.
- **Como validar:** renderizar (ou ver no Studio) o mesmo plano nos dois formatos e conferir,
  elemento por elemento, que cada um cabe inteiro e fica legível e com proporção razoável.
- **Status apurado: EXISTE EM PARTE.**
  - Os componentes usam `useVideoConfig()` e medidas em fração, e há composições vertical e
    horizontal do mesmo componente (ex.: `CallToAction` e `CallToActionHorizontal`,
    `ARQUITETURA.md:347-351`).
  - A decisão de detectar o formato automaticamente, com opção de forçar, está escrita
    (`ARQUITETURA.md:189-195`) e o critério 3.3 diz "Decidido, não implementado"
    (`docs/criterios-fechamento.md:90`).
  - O campo `orientacao` existe no tipo do plano (`src/PlanoComposicao.tsx:62`), mas **nada o
    usa**. A detecção existe só no script `scripts/preparar-video.mjs:188-234` (orientação do
    vídeo de entrada). `scripts/render-final.mjs` aceita `--formato vertical|horizontal`.
  - **Não existe** checagem de "elemento fora do quadro" no validador (busca sem resultado em
    `scripts/validar-plano.mjs`).

### T20 — Render longo
- **O que é:** um vídeo de 15 minutos renderiza até o fim, e registramos quanto tempo e quanta
  memória isso leva.
- **Por que importa:** os testes feitos até hoje têm menos de 1 minuto; um vídeo longo pode
  estourar memória, disco ou tempo e só se descobre no meio.
- **Como validar:** renderizar um vídeo de 15 minutos no PC do trabalho (WSL), anotando:
  tempo total, pico de memória (o `/dev/shm` do WSL é pequeno), se terminou, e abrir o arquivo
  até o último segundo para ver se o final não ficou corrompido.
- **Status apurado: NÃO EXISTE.**
  - Está nos critérios como "Não feito" (`docs/criterios-fechamento.md:94`,
    `ARQUITETURA.md:548`).
  - **Único dado de tempo real:** 37,9 s de vídeo (1137 quadros, 1080×1920) renderizaram em
    2 min 28 s com `--concurrency=2` (`docs/estado-atual.md:21-24`). **Isso não permite prever
    15 minutos**: o 0926 tem elementos só em parte do vídeo e nada de música.
  - Memória nunca foi medida nem registrada.
  - Em casa o render continua bloqueado (`ARQUITETURA.md:46`).

### T21 — Determinismo
- **O que é:** renderizar o mesmo plano duas vezes dá exatamente o mesmo resultado.
- **Por que importa:** se o resultado muda a cada render, não dá para confiar na revisão: o
  que o Matheus aprovou não é o que sai. Também impede comparar versões.
- **Como validar:** renderizar o mesmo plano duas vezes e comparar **quadro a quadro** (por
  exemplo, hash de cada quadro com o FFmpeg completo), não o arquivo inteiro: o contêiner pode
  trazer metadados diferentes mesmo com imagem igual (isso é uma hipótese minha, não testada).
- **Status apurado: NÃO EXISTE o teste. Há só indícios a favor.**
  - Nenhum `Math.random` em `src/` fora de `src/testes/` (busca sem resultado).
  - A `Seta` usa desvio fixo, não aleatório (`docs/catalogo-componentes.md:131`).
  - Nada compara dois renders e nenhum script faz isso.

### T22 — Qualidade da imagem (banding)
- **O que é:** o verde escuro da marca (`#0F2A1D`) é uma cor lisa e escura, e tende a mostrar
  "faixas" (banding) depois de comprimido. Precisamos saber se isso acontece e qual ajuste de
  compressão o projeto vai usar.
- **Por que importa:** as faixas aparecem sobretudo em fundos lisos, véus e gradientes (o
  `Spotlight` escurece a tela com cor chapada, por exemplo) e ficam feias no celular.
- **Como validar:** renderizar um trecho com fundo `#0F2A1D` liso e um com véu semitransparente
  sobre vídeo, com 2 ou 3 configurações de qualidade, e olhar no celular (não só no PC).
- **Status apurado: NÃO EXISTE (nenhum teste nem decisão).**
  - `remotion.config.ts:12` define `Config.setVideoImageFormat("jpeg")`, ou seja, os quadros
    passam por JPEG antes de virar vídeo. **Não verifiquei** se isso piora o banding.
  - `--crf` (padrão 18) existe só em `scripts/preparar-video.mjs:35`, que prepara o vídeo de
    **entrada**, não o render final. As flags `--crf`, `--pixel-format` e `--x264-preset`
    existem no `remotion render` (`docs/etapa8-notas.md:21-22`), mas `scripts/render-final.mjs`
    só monta largura, altura, fps e, opcionalmente, codec e bitrate.
  - **A decidir pelo Matheus:** qual qualidade/compressão o projeto adota, depois de ver o
    resultado.

---

## Ordem sugerida

1. **T14 — sincronia depois do corte.** Tudo o que vem depois (gancho, elementos, música)
   depende de os elementos caírem no frame certo. E já dá para testar em casa, no Studio, com o
   `0926.cortes.json` real.
2. **T15 — gancho.** O erro do mapa de tempo foi provado e corrigido em `a055886` (11/10/2026,
   segundo o commit); falta ver
   um vídeo real com gancho no Studio, em cima do T14.
3. **T19 — mesmo plano nos dois formatos.** Barato (só Studio) e pega elemento fora do quadro
   antes de construir mais componentes.
4. **T12 — zona segura.** Barato, e define onde os elementos podem ficar antes de existirem
   muitos deles. Precisa só da pesquisa das medidas de cada app.
5. **T10 — screencast legível em vertical.** É o conteúdo principal do canal, mas exige
   decisão de projeto (de onde vem o cursor) antes de qualquer código.
6. **T13 — troca de foco tela/câmera.** Já tem a peça (`CamadaVideo`), falta ligar ao plano e
   fazer o teste de sincronia (palma dispensada em 11/10/2026; método sem palma a definir).
7. **T17 — decidir o alvo de volume**, antes de T16 e T18: sem alvo não há como medir a mistura.
8. **T16 e T18 — música e efeito sonoro.** Dependem de baixar os arquivos e de o render
   funcionar.
9. **T21 — determinismo**, **T22 — banding** e **T20 — render longo.** Ficam para o fim porque
   precisam do render completo; o T20 é o mais pesado (15 minutos).
10. **T11 — destaque de cursor e clique**, depois do T10: usa a mesma fonte de posição do
    cursor.

## Depende de outra etapa

**Só testável depois do Whisper (Etapa 4):**
- **T14 (conferência por palavra):** saber se o corte caiu no meio de uma palavra exige o texto
  com tempo por palavra. Sem isso, só dá para ouvir à mão.
- **T15 (sem repetir conteúdo):** confirmar que a fala do gancho não aparece de novo por acaso
  fica muito mais fácil com a transcrição.
- **T18 (se o som for ligado a uma palavra):** o frame exato da palavra vem do tempo por
  palavra.

**Só testável com o render funcionando** (no PC do trabalho, via WSL; em casa o render está
bloqueado, `ARQUITETURA.md:46`):
- **T16, T17 e T18:** o áudio final (mistura, nível, sincronia do efeito) só existe no render.
- **T19 (conferência final), T20, T21 e T22.**

**Dependem de outra coisa que ainda não existe (não é Whisper nem render):**
- **T10 e T11:** de onde vem a posição do cursor (não existe dado).
- **T12:** pesquisa das medidas da interface de cada plataforma.
- **T13:** teste de sincronia dos arquivos do OBS, sem palma (dispensada em 11/10/2026; método a definir) e ligar
  `CamadaVideo` ao `CATALOGO`.
- **T16 e T18:** baixar a música e o efeito (`docs/criterios-fechamento.md:93`).
- **T17:** decisão do Matheus sobre o alvo de volume.
