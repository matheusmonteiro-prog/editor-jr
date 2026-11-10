# Kit Visual de Vídeo — JR O Investidor Sertanejo (v3, rascunho de 03/11/2026)

Referência obrigatória para o editor-jr (Remotion). Todo plano de edição (JSON) e todo prompt-roteiro conferem contra este documento. Base: Design System exportado do Claude Design, mais as decisões do Matheus de 02/11/2026.

Peças de referência visuais: artifact "Quadros de Vídeo JR" (https://claude.ai/artifact/PJJe8xRt2S4fDBTmbmeHS2). Os quadros de lá são a referência de posição, tamanho e movimento.

Antes e depois da v3 (03/11/2026): artifact "Kit Visual JR v3" (https://claude.ai/artifact/W4FjtXCZ2WLdm6i12v3Zq9). Nos itens novos (@, Montserrat, Amarelo JR, tela diagonal, transição, comparação, capítulo e pauta), vale este, e não o anterior.

## Status das decisões

| Item | Status |
|---|---|
| Vermelho-terra (#E4573D / #A8321C) | Proposto, tom exato a aprovar. Uso (queda, erro, alerta) aprovado pelo Matheus |
| Cédulas 2D caindo ao fundo | Substituídas pelo fundo explicativo (2.1). Ficam só como opção |
| Fonte do vídeo | **Decidido pelo Matheus em 03/11:** Anton inclinada sai ("feia, nada moderna"). Montserrat vira a fonte do vídeo: impacto, capítulo, cartaz explicativo, números e rótulos (seção 3) |
| Fraunces e Inter no vídeo | A decidir: a proposta é Montserrat em tudo que aparece no vídeo e Fraunces só nas artes. Mudança de marca: confirmar com o JR |
| Amarelo | **Decidido pelo Matheus em 03/11:** um amarelo mais moderno no lugar de #EFAF20 e #FFB800. Tom a escolher entre A, B e C (2) |
| Tela explicativa com divisão diagonal e linha amarela (anexo 3) | **Aprovado pelo Matheus em 03/11** (4.1) |
| @ no canto superior direito na tela cheia (anexo 1) | **Pedido pelo Matheus em 03/11** (5). Grafia exata do @ a confirmar |
| Transição JR → tela explicativa com JR em janela no centro superior (anexo 8) | Pedido pelo Matheus em 03/11. Tempos são proposta (4.12) |
| Comparação de números com seta (anexo 8) e pauta (anexo 2) | Pedido pelo Matheus em 03/11. Medidas são proposta (4.13 e 4.14) |
| Frequência máxima da "batida" | Chute: 2 por minuto |
| Hierarquia de overlays em 3 níveis e limite de densidade (6.1) | Proposto em 03/11, a partir do vídeo de 28/10 (v1). Matheus aprova |
| Tamanhos mínimos de texto em 1080p (seção 3) | Chute: validar no celular com um render de teste |
| Abertura com gancho e fecho com CTA (4.8 e 4.9) | Proposto. Falta o JR decidir CTA e aviso legal |
| Linha do tempo acumulativa (4.10) | Proposto. O componente `LinhaDoTempo` ainda não existe |
| Foto ou vídeo real como camada (4.11) | Proposto. Depende de material do JR |
| Áudio: −14 LUFS, trilha e efeitos (seção 13) | Proposto. Trilha a escolher, licença a conferir |
| Sem logo no vídeo (5) | **Pedido pelo Matheus em 04/11** (A-004): o YouTube já mostra a marca do canal. Logo fora de todas as telas |
| Janela do JR com a câmera inteira e borda fina (4.2) | **Pedido pelo Matheus em 04/11** (A-002): nada de recortar só a cabeça. Borda de 2 px |
| Fundo explicativo em movimento leve (2.1) | **Pedido pelo Matheus em 04/11** (A-003): movimento contínuo em ciclos, não só o zoom |
| Fundo da câmera desfocado (4.15) | **Pedido pelo Matheus em 04/11** (A-007): foco no JR. Intensidade a validar no Studio |
| Faixa do impacto leve (4.4) | **Pedido pelo Matheus em 04/11** (A-008): sombreado leve (50%). Texto antigo da fonte some por véu de desfoque |
| Desfoque leve do fundo (4.15) | **Pedido pelo Matheus em 04/11** (A-009): "uns 20%" do anterior, roupa inteira nítida |
| Trilha de fundo (13) | **Pedido pelo Matheus em 04/11** (A-010): "Sertão Caboclo" (Quincas Moreira), ~23 dB abaixo da voz. Licença a conferir |
| Tela explicativa clara, bege (2.2) | **Pedido pelo Matheus em 04/11** (A-011): opção ao lado da escura; o bege pode variar por vídeo |
| Ponto antes das descrições (4.14) | **Pedido pelo Matheus em 04/11** (A-012) |
| Trajetória da história do JR (4.10) | **Pedido pelo Matheus em 04/11** (A-013): linha + árvore, componente `LinhaTrajetoria` |
| Voz tratada por padrão (13) | **Aprovado pelo Matheus em 04/11**: `tratar-voz` preset jr; com eco de sala, WPE antes (skill `tratar-audio`) |

---

## 1. Tom

O JR não é "professor calmo". É a pessoa mais rústica do sertão do sul, e pode explodir na fala. O visual acompanha dois modos:

- Modo normal: explica. Tela explicativa (4.1 e 4.2) com fundo escuro animado, Montserrat, entradas curtas.
- Modo explosão: quando a fala sobe. Palavra de impacto (seção 4), zoom seco, vermelho se for alerta.

A regra do Design System continua valendo para o conteúdo: o método é mostrado, não prometido.

---

## 2. Paleta

| Token | Hex | Uso |
|---|---|---|
| Verde-escuro | #0F2A1D | Fundo principal, cards escuros, texto sobre creme |
| Creme | #F5F0E6 | Fundo claro, texto sobre escuro |
| Amarelo JR (novo, vídeo) | A escolher: **A #FFC629** (recomendado), B #FFD43B, C #FFB800 | Único amarelo do vídeo: palavra em destaque, números, rótulos, linha diagonal, borda da janela do JR, ícones. Só sobre escuro |
| Dourado | #EFAF20 | Fica nas artes. No vídeo é substituído pelo Amarelo JR |
| Marrom | #8E4813 | Destaque só sobre claro |
| Verde do método | #39A96B (escuro) / #1F7A47 (claro) | Exclusivo: o preço tocou o valor calculado. Nunca decorativo, nunca em check ou barra genérica. Nunca chamar de "sinal de compra" |
| Vermelho-terra (novo) | #E4573D (escuro) / #A8321C (claro) | Queda, erro, alerta, palavra errada riscada |

Transparências permitidas (só alfa das mesmas cores): texto secundário 72%, bordas 16–20%, grade 8–10%.

### Regra de pareamento

| Fundo do card | Texto | Destaque | Check/barra genérica |
|---|---|---|---|
| #0F2A1D | #F5F0E6 | #EFAF20 | #EFAF20 |
| #F5F0E6 | #0F2A1D | #8E4813 | #8E4813 |

### Vermelho: onde entra e onde não entra

- Entra: linha de queda, risco sobre a palavra errada, ícone de alerta, palavra de impacto de alerta, etiqueta de variação negativa nos cards de empresas.
- Não entra: fundo de card, título inteiro, legenda, botão de CTA, nunca no lugar do verde do método.
- Par obrigatório: quando o vermelho aparece, o jeito certo vem logo depois, para o vídeo não virar medo.
- Vermelho nunca em número de ganho. Ganho em tela vira promessa de resultado.

### 2.1 Fundo explicativo (anexo 3, novo)

Substitui o verde chapado nas telas de explicação. No v1, o painel era só verde, sem nenhum elemento animado.

- Imagem: lavoura (trigo ou soja) com gráfico de velas por cima, **bem escura**. A informação no centro é o foco e o fundo só dá clima.
- Tratamento: escurecida até ~25–35% de brilho, puxada para o verde-escuro, com vinheta nas bordas.
- Movimento (revisto em 04/11, pedido A-003: "o fundo deve estar em movimento leve"): além do zoom lento de 100% a 108%, a imagem **flutua devagar em ciclos** (deriva de até ~1,6% da tela e respiração de ±2% no zoom, ciclo de 16 s), um **brilho suave** (alfa do Amarelo JR, ~7%) atravessa a cena a cada ~19 s e a linha amarela fina (10–15% de opacidade) **se redesenha a cada ~32 s**. Por ser em ciclo, funciona em cena curta ou longa. Nada pisca e nada chama mais atenção que o texto. Componente: `FundoExplicativo` (props `movimento` e `cicloSegundos`).
- Velas e linha do fundo em amarelo ou creme apagados, **nunca** no verde do método nem no vermelho-terra, para não parecerem sinal. Sem número, sem eixo e sem preço.
- Em cena com gráfico de dado real, o fundo perde as velas e fica só a lavoura escura.
- Base provisória: composição de `cena-8-amanhecer.png` com `cena-7-grafico.png`, feita em 03/11 (fora do Git). Definitiva: gerar uma imagem limpa, sem texto nem logo (prompt na seção 12).

### 2.2 Tela explicativa clara (bege), pedido A-011 de 04/11
- Opção ao lado da escura, nas mesmas peças (`tema: "claro"`): fundo creme/bege como papel, com grão fino e manchas largas que flutuam devagar; bordas levemente mais escuras.
- Pareamento do fundo claro: texto verde-escuro #0F2A1D, destaque marrom #8E4813 (título, ponto, borda da janela, linha). Amarelo nunca sobre o claro.
- O bege pode variar de vídeo para vídeo: prop `corFundoClaro` (padrão #F5F0E6).
- Referência do Matheus: telas de papel claro com o JR numa janela (exemplos de 04/11). O vídeo pode misturar os dois temas (no v3: janelas de 2:56 e 3:44 em claro).

### Cédulas 2D caindo (fundo, opcional)

- Substituídas pelo fundo explicativo (2.1). Só se o Matheus pedir.
- Só quando o assunto é dinheiro.
- Só atrás do painel de informação, nunca sobre o rosto do JR.
- Opacidade de 7% a 13%, cores creme e dourado, queda lenta, sem número e sem símbolo de moeda.
- Nunca no fundo creme. Nunca em cena de gráfico ou tabela com dado real.

### Cores nos componentes Remotion

Os padrões do catálogo (#22C55E, #0d0f14, rgba(8,10,8,0.4), #e5e7eb, #FFB800) são de teste e nunca vão ao vídeo final. Todo plano passa as cores explícitas nas props. Nunca incluir corFundo.

Exceção aprovada: LegendaAnimada com corTexto #FFFDF7 e corDestaque #FFB800 (decisão de 14/10/2026), pendente do item do amarelo.

---

## 3. Tipografia: Montserrat, uma família com pesos para cada trabalho

Decisão do Matheus em 03/11: o estilo do anexo 2 (geométrico, pesado e limpo) vira o padrão dos cartazes explicativos, e o Montserrat Black do anexo 5 está aprovado. Anton sai.

| Voz | Peso | Caixa | Quando |
|---|---|---|---|
| Impacto | Montserrat Black 900, **reto** (sem inclinação) | Alta | Palavra que bate: até 3 palavras, uma em amarelo |
| Capítulo | Montserrat Black 900 | Alta | Abertura de parte (4.5) |
| Título de cartaz | Montserrat Black 900 | Alta, até 3 palavras ("DUAS PARTES:") | Cabeça de pauta e de cartaz explicativo |
| Item de cartaz / título de card | Montserrat ExtraBold 800 | Frase | Itens, título do painel ("Vida de cidade") |
| Complemento | Montserrat Medium 500, creme a 72% | Frase | Parênteses, subtítulos ("bolsa, dólar e juros futuros") |
| Rótulo | Montserrat SemiBold 600, tracking 0,18 em | Alta | "PARTE 1", "PREÇO HOJE", contexto acima do título |
| Número grande | Montserrat ExtraBold 800, algarismos tabulares | — | Comparação (4.13), contador. R$ 1.250,00 |
| @ do canal | Montserrat Bold 700 | Baixa | Canto superior direito na tela cheia (5) |
| Legenda | Inter 800, contorno verde-escuro (a decidir se passa a Montserrat 800) | Alta | Só LegendaAnimada, até 4 palavras por vez |

- Fraunces fica nas artes estáticas. No vídeo, só se o Matheus e o JR decidirem manter.
- Algarismos tabulares: conferir no render se o Montserrat do `@remotion/google-fonts` aceita `tabular-nums` (sem confirmação ainda). Sem isso, o contador "tremeria" de largura.

### Tamanhos mínimos (1080p; no vertical, escalar pela largura)

Chute a validar no celular. No v1 de 28/10 as pílulas ficaram em ~24 a 28 px (estimado pelos quadros): pequenas para quem assiste no celular.

| Peça | Mínimo |
|---|---|
| Palavra de impacto | 120 px |
| Título do card de conceito | 56 px |
| Texto da pílula de apoio | 40 px |
| Ícone do card de conceito | 96 px |

- Caixa alta de impacto e capítulo só quando a fala pede força. Em título comum continua caixa de frase.
- Sem brilho (glow) em volta do texto. Contorno verde-escuro de 0,35% da largura segura a leitura sobre vídeo.
- Fontes via @remotion/google-fonts. As fontes dos prints de referência parecem pagas; as de cima são equivalentes gratuitas (identificação das originais: chute).
- Erros que o validador deve barrar: frase ou item todo em maiúsculas (caixa alta só em impacto, capítulo, título de cartaz de até 3 palavras e rótulo), dois destaques no mesmo título, amarelo sobre creme, número com $ ou sem formato brasileiro, texto inclinado.

---

## 4. Tipos de cena (posições em fração da tela)

Valores de referência vindos dos quadros do artifact; confirmar no render real.

### 4.1 Tela dividida em diagonal (16:9, anexo 3, aprovada)
- Painel de informação à **esquerda**, JR à **direita** (corte da câmera, não redução).
- A divisa é diagonal: começa em ~52% da largura no topo e termina em ~46% na base. Em cima dela corre uma linha Amarelo JR de 6 px, sem brilho.
- O fundo do painel é o fundo explicativo (2.1), não o verde chapado.
- Sem logo (04/11, seção 5). Ícone (~200 px de altura) e título Montserrat ExtraBold centralizados no painel, com uma palavra em amarelo.
- Entrada: o painel desliza da esquerda em 0,5 s com a linha amarela na frente, enquanto o JR desliza para a direita. Depois: ícone e título em cascata de 0,15 s.

### 4.2 Tela explicativa cheia com o JR em janela (16:9, anexo 8)
- O fundo explicativo (2.1) ocupa a tela inteira. O JR fica numa janela no **centro superior**, com ~22% da largura, topo a ~4% da altura, raio 16 px e **borda fina de 2 px na cor da identidade** (Amarelo JR, o "dourado" do vídeo; exceção pedida à regra "sem borda"). A borda fica **por cima** do vídeo (antes ficava por baixo e não aparecia).
- **A janela mostra a câmera inteira**, nunca só a cabeça (pedido A-002, 04/11). Se a fonte tiver texto antigo gravado, ele fica desfocado: na janela, só a cabeça do JR é nítida (4.15).
- O conteúdo ocupa a área abaixo da janela (rótulo, título, números ou lista).
- Substitui a janela do canto inferior esquerdo, que fica só para gravação de tela.
- Cards creme entram um por vez, presos ao tempo da palavra na transcrição.
- Nunca deixar mais de ~30% da tela vazia. No v1 (bloco B6) a janela do JR ficou no topo e cerca de metade da tela ficou verde e vazia, com cards minúsculos embaixo. Ou o conteúdo preenche, ou o JR volta para a tela dividida (4.1) ou cheia.

### 4.3 Corte vertical (9:16)
- JR em tela cheia. Card verde-escuro no terço superior. Legenda no terço inferior, acima da área coberta pelos botões do app (medida exata pendente, chute).
- Escurecimento leve na base para legibilidade (único degradê permitido).

### 4.4 Palavra de impacto

- **Camada verde translúcida subindo de baixo para cima (04/11, A-016):** verde do kit (#0F2A1D) a ~70% embaixo, ~56% no meio do texto, sumindo a ~60% da altura, em corte seco. É uma **camada de cor**, não uma elipse nem "fumaça" (a elipse do A-014 foi reprovada) e não é escura demais (a primeira versão, 97%, foi reprovada). A câmera continua aparecendo por baixo. Prop `forcaFaixa`.
- Texto antigo gravado na fonte: um **véu** na câmera (desfoque forte, cor apagada, `CameraJR` `veus`) **de lado a lado da tela**, com degradê só em cima e embaixo (nunca bordas verticais, que viram mancha), por baixo da camada verde.
- Montserrat Black reto, caixa alta, creme com uma palavra em Amarelo JR e contorno verde-escuro fino. No v1 era Anton inclinada com o amarelo antigo, e o Matheus reprovou (anexo 4).
- Terço inferior sobre o JR, até 3 palavras, entra com escala 170% a 100% em 0,4 s.
- Zoom seco de 115% no vídeo com tremida de 3 quadros. Máximo 2 por minuto (chute).
- Dourado = padrão (ênfase, data, número dito alto). Vermelho-terra = alerta/erro.
- Frase com mais de 3 palavras não é impacto: vira card de conceito (6.1). No v1, os 5 impactos tinham de 5 a 8 palavras ("O dividendo é pouco e a valorização é bastante"). Para o impacto, só a palavra-chave ("Dividendo pouco").

### 4.5 Abertura de capítulo (16:9, anexo 6)
- Tela cheia, 2 a 3 s, sobre o fundo explicativo (2.1). Tudo centralizado, e o fundo bem escuro deixa o foco no texto.
- "PARTE N" em Amarelo JR (Montserrat 600, tracking 0,3 em), título em Montserrat Black creme (~170 px, até 3 palavras) e subtítulo em Montserrat 500 creme a 72%, dizendo o que vai ser falado.
- Entrada: rótulo, título e subtítulo em cascata de 0,15 s, com subida curta.

### 4.6 Cards de empresas
- Linha de 3 a 4 cards creme com logo, nome e variação. Variação negativa em vermelho-terra.
- Logo, nome e número vêm de fonte indicada pelo Matheus. Sem fonte: [DADO FALTANDO: ...]. Nunca empresa real com número inventado.
- Rodapé: fonte e data. "Ilustrativo" na tela quando não for dado real.

### 4.7 Tabela (fundo creme)
- Cabeçalho em Inter 600 caixa alta tracking aberto, linha grossa embaixo do cabeçalho, fios de 1px entre linhas.
- Colunas padrão do Método JR: ativo, preço hoje, valor calculado, situação. A tabela compara preço com valor calculado; não mostra "ganho".
- Verde do método só na linha em que o preço tocou o valor.
- Janela do JR à direita, raio 28px.

### 4.8 Abertura com gancho (16:9 e 9:16)
- Nos primeiros 3 a 5 s entra a frase mais forte do vídeo (teaser, recurso de gancho da Etapa 2) ou a tese em uma linha. O cumprimento vem depois. No v1, os primeiros 14 s foram "boa tarde, bom dia, boa noite" e o título só apareceu aos 14 s.
- Faixa com nome e cargo ("JR · O Investidor Sertanejo"), card chapado, nos primeiros segundos.
- O zoom de abertura aprovado (1,25 para 1) continua.
- A frase de gancho nunca é promessa de ganho (seção 9).

### 4.9 Fecho com CTA
- Últimos 5 a 8 s: corta o silêncio e o olhar para baixo do fim da gravação. Entra card final com CTA do Método JR (verbo claro, sem pressão), logo e aviso legal; se houver, o próximo vídeo.
- Nunca terminar com o JR calado e sem nada na tela. No v1 o vídeo acabou assim.

### 4.10 Trajetória (linha do tempo + árvore), pedido A-013 de 04/11
- Para relato de vida com várias etapas (sítio, cidade, banco, boi, fazenda, bolsa). A história vira um **caminho**: um tronco Amarelo JR desce e se desenha conforme o JR fala.
- Cada **capítulo** ("01 Do sítio à cidade") é um losango no tronco; cada **etapa** sai do tronco num galho curto, com ícone e texto. Os galhos saem um depois do outro (cronologia real, nunca juntos).
- A etapa atual fica acesa (nó cheio com brilho suave); as anteriores ficam a ~55%. Quando passa da área, a "câmera" sobe devagar para a etapa nova ficar a ~62% da altura; o que sobe some suave no topo.
- Um trecho seguinte pode **continuar** a mesma trajetória: capítulos anteriores entram já desenhados e a câmera segue para o capítulo novo (v3: "04 Minhas fazendas" continua a história).
- Lugar padrão: o painel esquerdo da tela dividida (4.1), com o JR à direita. Também cabe em tela cheia (mudar a área).
- Sem cor nova: tronco e destaque em Amarelo JR (marrom no tema claro); nunca o verde do método nos pontos.
- Componente `LinhaTrajetoria` (props: `capitulos[]` com `marcos[]` e `em` em quadros, área `x/y/largura/altura`, `tema`).

### 4.11 Foto ou vídeo real
- Quando o assunto é fazenda, soja, boi ou escritório, foto ou vídeo do próprio JR entra no painel no lugar do ícone (raio 28px, sem borda).
- Imagem genérica (ex.: gráfico dourado) não representa dado: só como textura e com "ilustrativo".
- Rosto do JR gerado por IA continua proibido (seção 9).

### 4.12 Transição JR → tela explicativa (anexo 8)
- O JR está em tela cheia. Em **0,5 s** ele encolhe para a janela do centro superior (4.2), enquanto o fundo explicativo entra numa varredura diagonal da esquerda para a direita, com a linha amarela na frente (o mesmo desenho da 4.1).
- Depois da janela no lugar, o conteúdo entra em cascata de 0,15 s.
- Volta para a tela cheia: o mesmo caminho ao contrário, em 0,4 s.
- Para a tela dividida (4.1), vale a mesma ideia: o painel entra pela esquerda e o JR desliza para a direita.
- Nessas trocas não se usa corte seco nem o zoom de 115% (que é só da batida, 4.4).
- Regras de acabamento (04/11, pedido A-006 "algumas transições ficaram bugadas"; defeitos achados quadro a quadro no v3):
  - A volta para a tela cheia **termina 1 quadro antes** do fim do trecho. Se cortar no meio, aparece o JR menor com borda e faixa verde.
  - Trecho que já começa com o JR na janela usa `frameTransicao = -1000` (com -1 a janela animava sozinha por 0,5 s).
  - Da janela para a tela dividida: primeiro a volta para a tela cheia, depois o painel. Nunca cortar direto da janelinha para o painel.
  - Quando a fonte tem trocas de layout gravadas (como o v1), o painel e a faixa só saem **depois** que a troca da fonte termina (medir no vídeo), senão aparece um quadro da arte antiga.

### 4.13 Comparação de números ("transcrição gráfica", anexo 8)
- Quando o JR cita dois números (antes e depois, preço e valor calculado), a fala vira esta cena, sobre a tela 4.2.
- Ordem de cima para baixo: rótulo de contexto (Amarelo JR, Montserrat 600 caixa alta), título curto (Montserrat Black, Amarelo JR) e dois blocos lado a lado, cada um com rótulo pequeno em cima e número grande (~150 px) embaixo, com uma seta Amarelo JR se desenhando entre eles em 0,4 s.
- Primeiro número em creme. O segundo entra com contador (1,5 s), em creme ou Amarelo JR. Vermelho-terra só se for queda ou piora, e o verde do método só no evento do método.
- Rodapé com fonte e data, obrigatório. Sem dado real, mostrar "ilustrativo".

### 4.14 Pauta do vídeo (anexo 2)
- Logo depois do gancho: título de cartaz em caixa alta Amarelo JR ("DUAS PARTES:") e até 3 itens numerados.
- Número do item em Amarelo JR, item em Montserrat ExtraBold creme e complemento entre parênteses em Montserrat 500.
- Alinhado à esquerda, sobre o fundo explicativo, com o JR na janela do centro superior ou fora de cena.
- Sem numeração, cada descrição vem com um **ponto (•)** na cor de destaque (04/11, A-012: "fica mais didático"). Prop `marcador`.

---

### 4.15 Câmera do JR com fundo desfocado (04/11, pedidos A-007 e A-009)

- "O fundo do vídeo tem que estar desfocado para o foco ser o JR." Vale para tela cheia, tela dividida e janela.
- Componente `CameraJR`: duas camadas do mesmo vídeo. Embaixo, desfocada **leve** (0,15% da largura, ≈ 3 px em 1920; ajuste de 04/11, A-009: "uns 20%") e 4% mais escura; em cima, nítida dentro de elipses grandes na cabeça e no tronco: **a roupa inteira fica nítida**.
- Focos prontos: `FOCOS_JR_CENTRO` (JR no meio do quadro) e `FOCOS_JR_CABECA` (janela: só a cabeça nítida). A câmera é parada; se o JR sair do lugar, ajustar os focos.
- **Limite:** é uma máscara fixa, não recorte do contorno. Perto do chapéu e dos ombros pode haver uma faixa de transição. O ideal continua sendo gravar com fundo já afastado e luz no JR.
- Remendos: cobrem um retângulo (ex.: logo antigo gravado) esticando uma coluna de parede limpa ao lado. Só funciona sobre parede lisa.
- **Placas** (04/11, A-015): cobrem um retângulo com o mesmo pedaço de um **quadro limpo** da mesma câmera (câmera parada). Usadas na janelinha sobre as pílulas antigas do peito. **Véu de desfoque na janelinha não**: vira um borrão no meio da tela pequena ("não pode acontecer").

## 5. Formatos e áreas seguras

| Formato | Resolução | Margem |
|---|---|---|
| Vertical 9:16 | 1080 × 1920 | 88px |
| Horizontal 16:9 | 1920 × 1080 | 96px |

Marca na tela (pedido do Matheus em 03/11, anexo 1):

- **JR em tela cheia:** só o @ do canal (`@jroinvestidorsertanejo`, grafia a confirmar) no **canto superior direito**, dentro da margem. Montserrat Bold ~40 px, creme, com sombra escura suave para leitura (é sombra e não brilho; exceção pedida). Sem logo.
- **Telas explicativas (4.1, 4.2, 4.5, 4.13, 4.14):** **sem logo** (decisão do Matheus em 04/11, A-004: o YouTube já mostra a marca do canal) e sem @. Todas as peças têm `logo` vazio por padrão; só passar um logo se for pedido.
- No v1 o logo ficou gravado no canto superior esquerdo o vídeo inteiro. No v3 ele é coberto por um "remendo" (4.15).

Aviso legal no rodapé, dentro da margem.

---

## 6. Cards e overlays

Cor chapada (#0F2A1D ou #F5F0E6), raio 28px (marcadores 8, blocos 16, pílula 999), sem sombra, sem borda (só fio de 1px em alfa), sem transparência, sem blur. Nada de borda colorida só de um lado. Um bloco de informação por tela.

### 6.1 Hierarquia de overlays e densidade

No v1 foram 42 pílulas em 4:07 (uma a cada ~6 s), todas com a mesma entrada, e na segunda metade só 3 ícones (gráfico, terra, moedas) se repetiram umas 25 vezes. Tudo com o mesmo peso, nada se destaca. Proposta de 3 níveis (frequências são chute):

| Nível | Peça | Quando | Frequência |
|---|---|---|---|
| 1 | Palavra de impacto (4.4) | A fala bate | Máx. 2 por minuto |
| 2 | Card de conceito (painel: título + ícone ou foto) | Ideia nova que o espectador precisa guardar | Máx. 1 a cada ~20 s |
| 3 | Destaque solto sobre o vídeo (6.2), sem caixa | Complemento curto | Máx. 1 a cada ~12 s |

Regras:
- Não repetir a frase inteira da fala. Só a palavra-chave, até 4 palavras. Eco da fala não acrescenta nada.
- Pílula fora do rosto e das mãos do JR (no v1 ficaram sobre o peito, onde ele gesticula) e fora da faixa da legenda.
- Painel nunca vazio por mais de 0,5 s: o próximo card entra enquanto o anterior sai. No v1 houve ~2 s só com logo e verde.
- Nunca o mesmo ícone em dois cards seguidos, nem o mesmo ícone para dois significados diferentes (v1: maleta em "Por conta própria" e "Diversas profissões"; pino em "De volta ao Paraná" e "Fazenda aqui no Paraná").
- Câmera com zoom ou deslocamento cobre a tela inteira, sem faixa do fundo nas bordas (v1: faixa de ~10 px na borda esquerda perto de 1:20).

### 6.2 Listas e destaques: sem caixa, alinhados numa grade (pedido do Matheus em 03/11)

No v1, "Soja / Boi / Bolsa de valores" entraram como pílulas verdes de larguras diferentes, soltas sobre o JR: a caixa verde não tinha função e nada se alinhava. A partir de agora:

- **Sem caixa atrás do texto.** A pílula verde (`ElementoHistoria` em modo pílula) sai do vídeo.
- **Lista (2 ou mais itens) nunca vai solta sobre o JR.** Entra no painel da tela explicativa (4.1 ou 4.2), numa coluna:
  - ícone numa coluna de largura fixa (~80 px) e texto sempre começando na mesma linha vertical;
  - ícone e texto centralizados na mesma altura de linha, com espaço igual entre os itens (~36 px);
  - rótulo opcional em cima (Montserrat 600, caixa alta, Amarelo JR);
  - item em Montserrat ExtraBold creme (~64 px), com ícone Amarelo JR;
  - os itens entram de cima para baixo em cascata de 0,15 s e os anteriores **ficam** (a lista se monta na frente do espectador);
  - o bloco inteiro fica centralizado no painel, mas os itens alinhados à esquerda entre si.
- **Destaque solto (1 item) sobre o vídeo:** sem caixa. Ícone Amarelo JR e texto Montserrat ExtraBold ~48 px, creme com uma palavra em amarelo.
  - Sempre no **mesmo ponto** do vídeo inteiro: margem esquerda de 96 px, terço inferior, longe do rosto e das mãos.
  - Para a leitura, um escurecimento em degradê só naquele canto (verde-escuro a ~75% indo para transparente), mais sombra escura suave no texto.
  - No máximo um destaque solto por vez. Se vier o segundo, vira lista e vai para o painel.

---

## 7. Biblioteca de movimento (provisória; o Design System não define)

Curva cubic-bezier(.2,.7,.2,1). No Remotion: spring() para entrada, interpolate() para fade.

| Movimento | Quando | Tempo |
|---|---|---|
| Subida curta | Título e card | 0,5 s, desloca 18% |
| Deslize lateral | Lista de cards, vem do lado oposto ao JR | 0,55 s |
| Linha se desenhando | Gráfico, esquerda para direita; ponto verde só no toque | 1,2–1,6 s |
| Contador | Número sobe até o valor e para | 1,5 s |
| Risco vermelho | Palavra errada riscada, a certa entra logo abaixo | 0,5 s + entrada |
| Batida | Explosão do JR (seção 4.4) | 0,4 s |
| Pop | Card de empresa entrando | 0,45 s, cascata de 0,2 s |
| Varredura diagonal | Entrada do fundo e do painel explicativo, com a linha amarela na frente | 0,5 s |
| JR para a janela | Tela cheia → janela no centro superior (4.12) | 0,5 s (volta em 0,4 s) |
| Seta se desenhando | Comparação de números (4.13) | 0,4 s |
| Zoom lento do fundo | Fundo explicativo (2.1) | A cena inteira, de 100% a 108% |

Sem bounce longo, sem partículas além das cédulas, sem 3D, sem brilho.

---

## 8. Ícones

Linha fina 1,5px, ponta arredondada, sem preenchimento, grade 24×24. Dourado no escuro, marrom no claro. Verde do método só no toque na linha. Vermelho só em queda e alerta. Base Lucide (como no Design System). Propostas novas: saca, trator.

---

## 9. Conteúdo

- Caixa de frase nos títulos, um destaque de cor por título, sem emoji, números em formato brasileiro.
- Vocabulário: "evento do método", "o preço chegou ao valor calculado". Nunca "sinal de compra".
- Aviso legal: "Conteúdo educacional. Não é recomendação de compra ou venda." Se aparece sempre ou só sob pedido: [A DECIDIR com o JR].
- CTA final sempre leva ao Método JR, verbo claro, sem pressão.
- Afirmação de desempenho dita na fala não vira texto na tela sem fonte e data. No v1 foram para a tela "De 50 reais a bilhões", "Valorização extremamente boa", "Assim como o S&P 500" e "Valoriza bem perante o real". Sem dado, o card mostra só o tema ("Valorização de capital"), não o julgamento.
- Comparação com índice (S&P 500 etc.) só com fonte e data na tela.
- Frase da fala marcada como pendência de promessa no roteiro não entra em card, pílula nem impacto até o Matheus decidir.
- Alerta geral, não parecer jurídico: conteúdo de investimento tem regra da CVM. Vale rever com quem entende antes de publicar.

Nunca, mesmo se pedirem: dado, número ou gráfico inventado · promessa de rentabilidade · simular movimento de mercado · recomendação específica · rosto do JR gerado por IA.

---

## 10. Checklist de validação de um plano

1. Cores de card/texto/destaque da tabela de pareamento?
2. Sem corFundo nas props?
3. Verde do método só em evento do método?
4. Dourado só sobre escuro, marrom só sobre claro?
5. Vermelho só em queda, erro ou alerta, sempre seguido do jeito certo?
6. Cédulas só atrás de informação, fora do rosto e com opacidade ≤ 13%?
7. Nenhum dado inventado; sem dado real, "ilustrativo" na tela ou [DADO FALTANDO]?
8. Nenhuma promessa de rentabilidade nem número de ganho?
9. Cada fonte no seu papel (impacto só em palavra de impacto, capítulo só em abertura)?
10. No máximo 2 batidas por minuto?
11. Títulos em caixa de frase, um destaque por título?
12. Sem logo no vídeo, aviso legal no rodapé, tudo dentro da margem segura?
13. Nenhuma frase de desempenho ou promessa na tela, mesmo que o JR a tenha dito (seção 9)?
14. Texto nos tamanhos mínimos (seção 3)?
15. Hierarquia respeitada: densidade, sem eco da fala, sem ícone repetido em seguida (6.1)?
16. Painel nunca vazio e tela com no máximo ~30% vazia (4.2 e 6.1)?
17. Gancho nos primeiros 5 s e fecho com CTA (4.8 e 4.9)?
18. Impacto com no máximo 3 palavras (4.4)?
19. Câmera com zoom cobre a tela inteira, sem faixa nas bordas?
20. Áudio no alvo da seção 13?
21. Um amarelo só (Amarelo JR) no vídeo, sem #EFAF20 nem #FFB800 misturados?
22. Montserrat em todo texto do vídeo (exceto a legenda, enquanto não decidida), sem texto inclinado?
23. Tela cheia com @ no canto superior direito; nenhuma tela com logo; tela explicativa sem @? Janela com a câmera inteira e borda fina? Fundo da câmera desfocado?
24. Tela explicativa com o fundo 2.1 (nunca o verde chapado) e entrada pela transição 4.12?
25. Comparação de números com fonte e data no rodapé?
26. Nenhuma caixa verde atrás de texto; lista só no painel, alinhada em grade; destaque solto sempre no mesmo ponto (6.2)?

---

## 11. Diferenças entre Design System (artes) e vídeo

| Aspecto | Artes | Vídeo |
|---|---|---|
| Fundo | fundo-mercado-campo.png a 55% | O vídeo real; cédulas e grade só em cenas de informação |
| Margem | 24/72/96px | 88px (9:16) e 96px (16:9) |
| Animação | Fade e slide curtos, sem bounce | Biblioteca da seção 7 |
| Tipografia | Fraunces + Inter | Montserrat (Inter na legenda, por enquanto). A confirmar com o JR |
| Cores | 5 da marca | Marca, com o Amarelo JR no lugar do dourado, mais o vermelho-terra (a aprovar) |
| Fundo | fundo-mercado-campo.png | Fundo explicativo escuro e animado (2.1) |

---

## 12. Pendências de decisão

1. Matheus: A ou B nas duas fontes novas.
2. JR: aprovar as duas fontes novas e o vermelho-terra (mudança de marca).
3. Matheus: manter ou tirar o amarelo da legenda.
4. Medir a área coberta pelos botões no vertical (Reels/TikTok) com um post real.
5. Definir o canto da janela do JR (esquerda ou direita).
6. Corrigir #1DD41E nas instruções do projeto e nos prompts antigos (valor correto: #39A96B / #1F7A47).
7. Adicionar essas cores e regras ao validar-plano.mjs do editor-jr.
8. Matheus: aprovar a hierarquia em 3 níveis e as frequências (6.1).
9. Matheus: validar os tamanhos mínimos num render de teste visto no celular.
10. JR: CTA do fecho e aviso legal (sempre na tela ou só sob pedido).
11. Matheus: criar o componente `LinhaDoTempo` (4.10) e decidir se substitui as pílulas do relato.
12. Matheus: escolher a trilha e confirmar a licença (seção 13).
13. Decidir se o vídeo longo leva legenda e como ela convive com as pílulas (v1 saiu sem nenhuma).
14. Validador (`validar-plano.mjs`): checar tamanho mínimo, palavras no impacto, ícone repetido seguido e frase de desempenho.
15. Matheus: escolher o Amarelo JR (A #FFC629, B #FFD43B ou C #FFB800).
16. Matheus: confirmar a grafia exata do @ (com ou sem ponto ou sublinhado).
17. Matheus e JR: Fraunces sai do vídeo? Legenda passa a Montserrat?
18. Matheus: aprovar o fundo explicativo definitivo. Prompt sugerido para gerar uma imagem limpa (Higgsfield ou outro, a escolher): "campo de trigo ao entardecer, quase noite, tons verde-escuro e dourado apagado, gráfico de velas translúcido e desfocado subindo no céu, sem texto, sem números, sem logotipo, sem pessoas, 16:9, 1920×1080, muito escuro, espaço vazio no centro".
19. Remotion: criar os componentes novos (`FundoExplicativo`, `PainelDiagonal`, `TransicaoJanela`, `ComparacaoNumeros`, `Pauta`, `ArrobaCanal`) e passar `TextoImpacto` para Montserrat, só depois da aprovação dos exemplos.

---

## 13. Áudio (proposta)

Medido no v1 de 28/10: −16,5 LUFS integrado, pico −1,5 dBFS, variação 5,9 LU. Limpo, mas sem trilha e sem efeitos.

- Voz: alvo de −14 LUFS integrado, pico máximo de −1 dBTP. Alvo de plataforma é referência, conferir na hora de publicar.
- Trilha: instrumental, sem letra, **bem abaixo da voz: só se ouve prestando atenção, nunca por cima do JR** (pedido A-010, 04/11). No v3: "Sertão Caboclo" (Quincas Moreira), ~−37 LUFS (≈ 23 dB abaixo da voz), entrada e saída suaves, troca suave na volta da música. Só com licença que cubra YouTube (conferir na YouTube Audio Library).
- Efeitos: um som curto e discreto na entrada do card de conceito e na batida. Nenhum na pílula de apoio.
- Pasta `public/audio/` existe e ainda não foi versionada nem conferida.

---

## 14. De onde vieram as regras novas

Todas nascem da análise do vídeo `2026-10-28-final-v1` (4:07, 1920×1080), feita por quadros e medidas, sem ver em movimento nem ouvir. Fatos usados: 5 impactos com 5 a 8 palavras; 42 pílulas em 4:07; 3 ícones repetidos ~25 vezes; painel vazio ~2 s; janela do JR no topo com ~metade da tela vazia; faixa de ~10 px na borda esquerda perto de 1:20; frases de desempenho na tela; sem abertura com gancho, sem fecho, sem trilha, sem legenda, sem foto real.

Atualizado em 04/11/2026 (pedidos A-002 a A-007 do Matheus). Fonte: Design System JR, catálogo de componentes, referências enviadas pelo Matheus e análise do v1 de 28/10.
