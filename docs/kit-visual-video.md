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
| Recorte de fundo com texto e linha atrás do JR (4.19) | **Aprovado pelo Matheus em 13/11** (v2 do teste de 10 s, visto no MP4; mandou virar recurso do kit). Limite de frequência e tamanho da palavra: proposta do Claude |
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
| Verde do método | #39A96B (escuro) / #1F7A47 (claro) | Exclusivo: o preço tocou o valor calculado. Nunca decorativo, nunca em check ou barra genérica. Nunca chamar de "sinal de compra". **Decisão do Matheus (10/11/2026): o verde do método no código é #1DD41E (src/components/apresentacao/marca.ts:15). Não trocar para #39A96B.** |
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

### 4.16 Quadro explicativo de papel (estilo aprovado pelo Matheus em 12/11/2026)

"Ficou perfeito [...] será bastante usado entre nossas edições do vídeo e também para os cortes" (Matheus, 12/11, depois de ver o `Corte-2810-01b` no Studio). Vale para **cortes** e para **trechos explicativos do vídeo longo**. Linguagem adaptada de uma referência trazida pelo Matheus (tela dividida com papel), com as cores do kit. Tudo por código: sem custo, sem IA.

**A ideia:** cada frase importante vira um **desenho simples** num papel, que entra na palavra exata em que o JR fala. O valor está na escolha do desenho, não no efeito.

**Composição**
- **Corte 9:16 (pronto):** papel em cima (47% da altura) com borda rasgada; JR embaixo (cabeça, ombros e peito, 72% de cima da fonte); legenda em faixa de papel colada no rasgo; rodapé verde com o @ (7,5%), opcional com gravação limpa.
- **Vídeo longo 16:9 (montado em 12/11, `Explicativo-2810-01b-16x9`):** papel à esquerda (56% da largura) com rasgo vertical, JR à direita, legenda na base do papel. A **mesma receita** do corte serve (posições das peças são frações do papel). Ideias ainda não montadas: papel em tela cheia com o JR numa janelinha; o papel entrando por cima do JR por alguns segundos.
- **Rodapé com logo e @ (pedido do Matheus, 12/11):** logo original `images/logo-jr.png` (sem alteração) ao lado do @, sobre um **degradê verde: escuro embaixo, transparente em cima** (com desfoque leve só embaixo). Vertical: 11% da altura; 16:9: 22%, só do lado do JR. **Isso muda a regra "sem logo" (A-004, seção 5) para este estilo.**

**Visual**
- Papel `#EFE8DA` com manchas e grão por código (`QuadroPapel`); cartões e faixa em `#FBF8F1` com sombra curta.
- Fontes: **Archivo Black** (títulos, legenda, cartões) e **Space Mono** (rótulos tipo documento). Montserrat segue nas peças do kit v3.
- Cores sobre o papel: verde-escuro `#0F2A1D` (etiqueta, títulos), verde do método escuro `#1F7A47` (destaque e lado "bom"), marrom `#8E4813` (campo, terra), carvão `#1E1E1C` (texto, traço). **Vermelho `#E4573D` liberado para sinais** (decisão do Matheus em 12/11: "pode ser bastante utilizada"): negação (NÃO SOU), o lado que perde numa comparação, a opção recusada, queda, alerta, risco. **Amarelo nunca como cor de texto no papel** (some no claro).
- **Papel kraft de caderno de campo: NÃO adotado (decisão do Matheus em 12/11, depois de ver o render: "não gostei dessa cor de fundo, deixa como está antes").** O fundo é sempre o papel claro de relatório. A opção `"papel": "campo"` continua no código, desligada. O toque do agro fica no marrom (cor do campo) e nos cartões com ícone, não no fundo.
- **Aviso legal na tela (padrão do Matheus em 12/11, cortes e vídeos):** "Não é recomendação de investimento." bem pequeno (Space Mono, ~1,7% da largura, mínimo 20 px), **centralizado** embaixo do logo e do @, no rodapé. Nunca num canto. Prop `aviso` do `CorteDividido`.
- Legenda: 1 a 3 palavras, caixa alta, a palavra dita em verde (karaokê); cada grupo levemente torto, como recorte colado.
- Etiqueta de assunto no canto de cima, troca a cada assunto; título grande só na abertura e no fecho.

**Melhorias da versão C (12/11, `Corte-2810-01c`): o Matheus preferiu a B ("preferi o antigo"), ficando com o papel terroso e o vermelho; as outras ficam como opção desligada, sem uso.** O logo e o @ ficam **embaixo** ("padrãozinho") — ligadas por corte em `opcoes` da receita:
- **Título já inteiro no quadro 0** (`tituloImediato`): o primeiro quadro é o que fica parado no feed.
- **Logo e @ no canto de cima, à direita, do papel** (`marcaNoTopo`, só vertical): fora dos botões e do título do app (guias de 2026 apontam ~280 a 340 px cobertos embaixo e ~100 px à direita; números de terceiros, não oficiais). Etiqueta e título descem para ~130 px (a faixa de cima também é coberta). O degradê de baixo fica só como acabamento.
- **Marca-texto** (`marcar` na peça): faixa amarela pinta o título do cartão, linha por linha, na palavra dita. Amarelo como **fundo** atrás de texto escuro é permitido no papel; como cor de texto, continua proibido.
- **Código de cores fixo** (`COR_ASSUNTO` em `estiloCortes.ts`): **marrom = campo** (terra, soja, boi, fazenda), **verde do método = Bolsa** (ações, método, crescimento), **carvão = neutro** (conceito, pergunta, pessoa), **vermelho = alerta** (queda, risco). Igual em todos os vídeos.
- **Sons de papel** (`sonsPapel`): papel deslizando na entrada de cartão, bilhete, balança e régua; baque seco no carimbo; risco curto no marca-texto. Gerados por código (`public/sfx/papel/`, fora do Git), sem licença de terceiros.
- **Papel de campo** (`"papel": "campo"` no quadro): kraft de caderno, com pauta fraca e margem vermelha apagada, para os assuntos do agro. A Bolsa e os conceitos ficam no papel claro de relatório. O papel troca com o assunto (entra em 6 quadros).

**Movimento** (200 a 450 ms, curva suave): cartão sobe e aparece; carimbo bate (180% → 100%) com som; etiqueta revela da esquerda; balança pende com mola; régua se desenha; pessoas entram em sequência. Nada se mexe sem a fala pedir. No máximo 3 peças no papel ao mesmo tempo.

**Regras de conteúdo:** nenhum número inventado (balança e régua mostram a ideia, não um valor); texto no papel usa as palavras do JR ou algo mais fraco; posição pessoal ("eu prefiro") fica pessoal (carimbo "PREFIRO", não "MELHOR").

**Peças prontas** (`src/components/cortes/`) e **cardápio de possibilidades** (tipo de fala → desenho):

| Quando a fala... | Desenho | Estado |
|---|---|---|
| Abre um assunto | `EtiquetaAssunto` (pequena) / título grande | pronto |
| Faz uma pergunta ao público | Título grande + objeto da pergunta | pronto |
| Compara duas coisas (pouco x muito, antes x depois) | `Balanca` (pende na palavra) | pronto |
| Dá uma opinião ou conclusão do JR | `Carimbo` (PREFIRO, NÃO SOU, ATENÇÃO) | pronto |
| Cita um ativo, um setor, uma coisa | `CartaoDocumento` com ícone do kit | pronto |
| Lista itens ("três critérios", "não conseguiu...") | `CartaoDocumento` com `itens` entrando um a um | pronto |
| Fala do público ("a maioria", "todo mundo") | `Multidao` com resposta | pronto |
| Usa uma referência ("benchmark", "parâmetro") | `Regua` com a marca | pronto |
| Fala de sorte, aposta, loteria | `BilheteLoteria` (genérico, sem marca) | pronto |
| Conta uma trajetória ou datas | Linha do tempo de papel (calendário, marcos) | ideia |
| Fala de subir ou cair (preço, juros, dólar) | Gráfico de linha ou barras desenhando, **só com dado real e fonte** | ideia |
| Fala de um caminho ou escolha | Placas de direção | ideia |
| Liga causa e efeito | Setas que se desenham entre cartões | ideia |
| Mostra uma conta ("a conta não fecha") | Cartão-conta com linhas somando e carimbo | ideia |
| Fala de dividendos, renda | Moedas caindo num pote ou prato | ideia |
| Fala de empresa da Bolsa | Cartão de empresa (nome, setor, ticker), sem preço inventado | ideia |
| Fala do campo (soja, boi, terra) | Cartões com ícones do kit; ilustração maior só se precisar (Higgsfield, com custo e ok) | pronto / ideia |

**Este é o Modelo 1.** Quando usar este ou o Modelo 2 (4.17): ver "Dois modelos" logo abaixo.

### 4.17 Cartografia viva (Modelo 2, aprovado pelo Matheus em 12/11/2026)

Detalhes e histórico: `docs/identidade/territorio-proposta.md`, seções 7 e 8. Código:
`src/identidade/CorteCartografia.tsx` e `src/identidade/graficosMercado.tsx`. Composições de exemplo:
`Cartografia-2810-01b-verde` e `Cartografia-2810-01b-branco` (pasta "Identidade-Teste").

**Visual**
- Dois ambientes, **um por vídeo, sem misturar**: `verde` (mapa verde-floresta) ou `branco` (papel de
  carta topográfica). Curvas de nível ao fundo, grão de papel, fio dourado nas trocas de cena.
- Fontes: Archivo Black (títulos e legenda) e Space Mono (rótulos de documento).
- Chapéu do JR **sempre inteiro** no enquadramento.
- Legenda em **maiúsculas**, com a palavra-chave colorida (verde = alta/crescimento, terracota = baixa/
  negação, marrom = terra/campo, dourado = destaque).
- Rodapé com logo + @; no branco, a faixa verde de baixo fica junto do logo e translúcida.
- Aviso "Este conteúdo tem caráter exclusivamente educacional." maior, em duas linhas, no início e no
  fim dos cortes (igual ao Modelo 1).

**Peças** (todas conceituais): candles com pavio, volume e média móvel; lavoura vista de cima que vira
candles; corte do solo (renda fina em cima, valorização grossa embaixo); marco de divisa que vira
marcador; régua da terra como linha de benchmark; talhões a nanquim; grade de pontos ("a maioria");
frase grande do JR com barra dourada.

**Regras de conteúdo**
- Gráfico **sempre** com o selo "DEMONSTRAÇÃO VISUAL · SEM DADOS REAIS". Valores gerados por código,
  nunca cotação. Gráfico com dado real só em peça nova, com fonte, e com ordem do Matheus.
- Grade de pontos sempre com "ilustração · sem número de pesquisa".
- Sem indicadores técnicos extras (RSI, MACD) se o JR não falar deles.
- No máximo 3 peças por cena.

**Formatos:** 9:16 e 16:9 prontos no código (12/11/2026, a validar no Studio). 16:9: mapa nos 1080 px da
esquerda, JR à direita (variações `close`/`janela` do 16:9 ainda não). **Cenas na receita** (`cenas`, posições em
frações do painel livre): peças `candles`, `lavouraCandles`, `estratos`, `marco`, `regua`, `talhoes`, `pontos`,
`frase`, `texto`, `carimbo`; gráfico só com `tendencia` (sobe, lateral, cai), selo automático. Máximo 3 peças por cena.
**Cores (decisão do Matheus: "a sua escolha"):** verde-floresta no `verde`, papel no `branco`; verde = alta/Bolsa,
terracota = baixa/negação, marrom = terra/campo, dourado = destaque; o ambiente padrão de vídeo novo é `verde`
(contraste melhor com a legenda e com o chapéu claro do JR).

### Dois modelos: qual usar (padrão aprovado em 12/11/2026)

Fluxo completo: `docs/cortes/fluxo-padrao.md`.

| Assunto | Modelo |
|---|---|
| Conceito, campo, "como funciona" | **1. Papel** (4.16); com controle de câmera quando o assunto troca muito |
| Bolsa, ações, crescimento, comparação de investimentos | **2. Cartografia viva** (4.17) |

- Vale para **cortes** e para **trechos explicativos do vídeo longo** (os dois modelos podem estar no
  mesmo vídeo longo).
- Corte com os dois assuntos: vale o assunto do fecho.
- No vídeo longo, o trecho explicativo não traz aviso, logo nem @ próprios (ficam no início e no fim
  do vídeo inteiro) e troca a legenda do longo pela do modelo enquanto dura.

### 4.18 Cenas 3D, "JR 3D Editorial Worlds" (aprovado pelo Matheus em 13/11/2026)

Matheus, 13/11: "a parte 3D, aprovado praticamente, com o tempo a gente vai lapidando [...] dá para entrar em
vários momentos de edição do vídeo [...] também nos nossos cortes [...] o fundo vai seguir a identidade
visual padrão". Aprovou os três moldes (fazenda em camadas, diorama + cartão, gráfico de ações).

- **Regra principal:** o mundo é 3D, o dado é 2D de frente (ou num quadro que olha para a câmera), na mesma
  escala. Gráfico conceitual leva o selo "ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS".
- **Quando usar, qual molde e onde:** skill `cenas-3d` (o Claude sugere sozinho no roteiro). Máximo de 1 cena
  a cada ~2 min no longo e 1 por corte. Não entra dentro do papel (4.16) nem da Cartografia (4.17): é trecho próprio.
- **Cores:** `src/components/tres/estilo3D.ts`, derivado do `KIT` (fundo = verde do kit; tema claro previsto).
  Valorização = verde do método; renda/dividendo = dourado envelhecido `#D9B25A`; queda = vermelho do kit.
- **Peças:** `src/components/tres/` (`dioramaFazenda`, `TerraCamadas3D`, `TerraEditorial3D`, `GraficoAcoes3D`).
  Receita técnica: `docs/guia-3d.md`.
- **Falta:** versão vertical dos moldes (cortes) e luz própria do tema claro.

### 4.19 Recorte de fundo: texto e linha ATRÁS do JR (aprovado pelo Matheus em 13/11/2026)

Matheus, 13/11, sobre o teste de 10 s: "achei que ficou bacana"; depois da 2ª rodada (chiado do chapéu
corrigido): "Aprovado". Mandou virar recurso do kit com regra de quando usar.

- **O que é:** a IA separa o JR do quarto e a cena ganha camadas: fundo da identidade → **palavra ou linha
  atrás do JR** → o JR → textos da frente e legenda. O efeito é a palavra "na parede" atrás dele e a linha do
  gráfico passando por trás do corpo.
- **Quando usar, qual molde e onde:** skill `recorte-fundo` (o Claude sugere sozinho no roteiro). É um "ponto
  alto", como o 3D, e **divide o mesmo limite**: no máximo 1 recorte **ou** 1 cena 3D a cada ~2 min no longo,
  e 1 por corte. Trecho de 5 a 15 s; nunca o vídeo inteiro (custo: ~1 s de espera por quadro).
- **Visual:** fundo = verde do kit com luz radial suave atrás do JR e grade discreta (como no teste); a
  palavra de trás em Montserrat 900, creme a 92%, grande (≥ 200 px), e pode ter **no máximo ~2 letras
  escondidas** pela cabeça; a linha segue as cores do 3D (verde = estável/sobe, vermelho = queda). Conceitual
  leva o selo "ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS".
- **Entrada:** o quarto original some em ~0,6 s quando o recorte já está bom (mesmos quadros, sem pulo). Onde
  o recorte falha (aba branca contra parede clara), **fica o quarto original**: nunca esconder defeito com efeito.
- **Acabamento (obrigatório):** sem furo, sem fiapo, sem borda "fervendo", sem microfone. O
  `scripts/recorte-fundo/limpar-alfa.py` faz isso; conferir em zoom no chapéu e nas mãos antes de mostrar.
- **Peças:** `src/components/recorte/RecorteLettering.tsx` (molde) e `scripts/recorte-fundo/`. Receita técnica e
  limites da gravação: `docs/guia-recorte-fundo.md`.
- **Falta:** versão vertical (cortes 9:16), o JR na frente de um cenário 3D (ideia) e testar numa gravação bruta nova.

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
