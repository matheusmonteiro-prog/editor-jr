# ARQUITETURA — editor-jr (v1)

## Status
- [x] Etapa 0 — Infraestrutura (Git, GitHub, SSH, Node, Remotion rodando em casa e no trabalho)
- [x] Etapa 1 — Organizar a casa
- [ ] **Etapa 2 — Cortes, gancho e limpeza de voz** ← ATUAL
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
- Detectar e cortar silêncios (limiar configurável, ex.: pausas acima de 1 s)
- Reordenar trechos: gancho para o início (ex.: 3:10–3:25 vai para o começo), conforme o prompt
- Redução de ruído e equalização da voz
- Ferramenta: FFmpeg (verificar se usa o que vem com o Remotion ou instalação separada)
- **Pré-requisitos:** um vídeo bruto curto de teste com o JR falando.

### Etapa 3 — Montagem sobre vídeo real
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
