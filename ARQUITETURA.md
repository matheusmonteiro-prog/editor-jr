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
- **API da Anthropic:** usada só para criar componentes novos que não existem no catálogo. Custo pago por chamada, separado da assinatura do Claude.
- **Catálogo:** todo componente aprovado é salvo e reaproveitado, trocando só os dados.
- **Componentes editáveis:** propriedades expostas para edição sem prompt.
- **Áudio:** voz original do JR, com limpeza de ruído. Sem voz gerada por IA.
- **Retoque de pele:** fora do projeto. Resolver na gravação (iluminação).
- **Vertical/horizontal:** detectado automaticamente pelas dimensões do vídeo enviado.
- **Posicionamento automático por visão (IA olhando o frame):** fora da v1.

## 3a. Formatos de entrada de vídeo (sessões de gravação)
Cada sessão de gravação chega em um de dois formatos. O plano de edição (JSON,
ver Etapa 2) precisa registrar qual dos dois é, num campo de tipo de sessão:
`single_file` ou `multi_layer`.

**FORMATO A — multi-camada (3 arquivos).** Vive numa subpasta própria, ex.:
`videos/sessao-2026-09-24/`. Os três arquivos têm a mesma duração e o mesmo
início (sincronizados por timestamp):
- `tela_<data>.mkv` — vídeo da tela, sem áudio
- `camera_<data>.mkv` — vídeo da câmera do JR, sem áudio
- `audio_<data>.wav` — narração, é a trilha mestre

Tela e câmera viram duas camadas no Remotion: tela sempre visível por baixo,
câmera por cima só nos trechos que o prompt definir (ex.: "0:00-3:00 tela,
3:00-3:45 câmera"). Troca de foco é controlar a visibilidade/duração da camada
da câmera — **não é corte de clipe**. Isso nunca é automático, sempre vem do
prompt. Ajuste fino é manual, arrastando a borda da camada no Remotion Studio.

**FORMATO B — arquivo único** (vídeo + áudio juntos). Tratado como já funciona
hoje, sem lógica de camada. É o formato do `teste-jr.mp4` usado até aqui.

**Pendência conhecida no corte de silêncio (`scripts/cortar-silencio.mjs`):**
hoje o script só sabe lidar com o Formato B. Para o Formato A ele vai precisar
de um modo novo — detectar as pausas **só** no `audio_<data>.wav` e aplicar os
**mesmos** cortes nos três arquivos juntos. Cortar cada arquivo separado, cada
um por sua conta, quebraria a sincronia entre tela, câmera e voz. Ainda não
implementado — registrado aqui para não esquecer o detalhe.

## 4. Regras de organização
- Vídeo **nunca** vai para o GitHub (limite de 100 MB por arquivo; vídeos passam disso). Só código.
- Nomes de arquivo sem espaço.
- Exportações versionadas: `video-selic-v1.mp4`, `video-selic-v2.mp4`. Nunca sobrescrever.
- Backup dos vídeos brutos (Drive ou HD externo).
- Música e efeitos apenas de bancos livres de direitos: YouTube Audio Library, Pixabay Music, Uppbeat, Pixabay Sound Effects, Freesound (conferir licença de cada som).
- Todo vídeo leva o aviso: **"Não é recomendação de investimento."**

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
    └── sessao-<data>/  ← Formato A (multi-camada): tela_<data>.mkv, camera_<data>.mkv, audio_<data>.wav
```

## 6. Catálogo de componentes
**Componentes prontos, em `src/components/`, com propriedades editáveis (schema zod) no Studio:**
- `ImagemFade` — imagem com fade in
- `GraficoLinha` — linha com curva suave, gradiente, brilho, área preenchida, número contando, entrada/saída com spring
- `ColagemCenas` — imagens PNG entrando escalonadas com rotação e spring (estilo colagem de papel)
- `ComparacaoBarras` — barras crescendo com número contando e destaque
- (o gráfico simples "GraficoSubindo" foi descartado na etapa 1, era só teste inicial)

**A construir:**
- `CirculoDestaque` (com pulso) · `Seta` · `TextoDestaque` · `Checkmark` · `Spotlight` · `Contador`
- `ArrobaInstagram` (fixo no canto) · `AvisoCVM` (fixo) · `LogoAnimada` (intro/outro)

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

**Modo multi-camada (Formato A): PENDENTE, não implementado.** Ver seção 3a —
detectar pausas só no `audio_<data>.wav` e aplicar os mesmos cortes nos 3
arquivos da sessão.

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
- **Pré-requisitos:** @ do Instagram, uma música e um efeito sonoro de teste baixados.

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
- **Pré-requisitos:** chave da API da Anthropic (só na 6b).

### Etapa 7 — Interface própria
- Tela local no navegador: subir vídeo, escrever prompt, ver prévia
- Adicionar imagem depois, em qualquer momento do vídeo
- Ajustar camadas arrastando e redimensionando
- Organizar imagens, músicas e efeitos pela interface
- Controle visual (tipo slider) para ajustar a limpeza de voz da Etapa 2b sem
  mexer em código — hoje os parâmetros (`afftdn`, `acompressor`, `loudnorm`)
  só são ajustáveis editando as constantes no `scripts/cortar-silencio.mjs`
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
