# Kit Visual de Vídeo — JR O Investidor Sertanejo (v2)

Referência obrigatória para o editor-jr (Remotion). Todo plano de edição (JSON) e todo prompt-roteiro conferem contra este documento. Base: Design System exportado do Claude Design, mais as decisões do Matheus de 02/11/2026.

Peças de referência visuais: artifact "Quadros de Vídeo JR" (https://claude.ai/artifact/PJJe8xRt2S4fDBTmbmeHS2). Os quadros de lá são a referência de posição, tamanho e movimento.

## Status das decisões

| Item | Status |
|---|---|
| Vermelho-terra (#E4573D / #A8321C) | Proposto, tom exato a aprovar. Uso (queda, erro, alerta) aprovado pelo Matheus |
| Cédulas 2D caindo ao fundo | Pedido pelo Matheus, regras abaixo são proposta |
| Fonte de impacto (condensada inclinada) | Provisório: Anton inclinada. Alternativa: Barlow Condensed itálica. Matheus ainda não escolheu |
| Fonte de capítulo (larga) | Provisório: Montserrat Black. Alternativa: Archivo Black. Matheus ainda não escolheu |
| Duas fontes novas contra a regra "só Fraunces e Inter" do Design System | A decidir com o JR (mudança de marca) |
| Amarelo da legenda #FFB800 vs dourado #EFAF20 | Em aberto: parecidos demais quando aparecem juntos. Sugestão: só o dourado |
| Verde do método | Decidido em 02/11/2026: #1DD41E sobre escuro, #1F7A47 sobre creme. O Design System diz #39A96B; a escolha do Matheus prevalece para este kit. Contraste de #1DD41E sobre creme é insuficiente, por isso não entra no claro |
| Frequência máxima da "batida" | Chute: 2 por minuto |

---

## 1. Tom

O JR não é "professor calmo". É a pessoa mais rústica do sertão do sul, e pode explodir na fala. O visual acompanha dois modos:

- Modo normal: explica. Fraunces em caixa de frase, entradas curtas, cards chapados.
- Modo explosão: quando a fala sobe. Palavra de impacto (seção 4), zoom seco, vermelho se for alerta.

A regra do Design System continua valendo para o conteúdo: o método é mostrado, não prometido.

---

## 2. Paleta

| Token | Hex | Uso |
|---|---|---|
| Verde-escuro | #0F2A1D | Fundo principal, cards escuros, texto sobre creme |
| Creme | #F5F0E6 | Fundo claro, texto sobre escuro |
| Dourado | #EFAF20 | Destaque só sobre escuro |
| Marrom | #8E4813 | Destaque só sobre claro |
| Verde do método | #1DD41E (escuro) / #1F7A47 (claro) | Exclusivo: o preço tocou o valor calculado. Nunca decorativo, nunca em check ou barra genérica. Nunca chamar de "sinal de compra" |
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

### Cédulas 2D caindo (fundo)

- Só quando o assunto é dinheiro.
- Só atrás do painel de informação, nunca sobre o rosto do JR.
- Opacidade de 7% a 13%, cores creme e dourado, queda lenta, sem número e sem símbolo de moeda.
- Nunca no fundo creme. Nunca em cena de gráfico ou tabela com dado real.

### Cores nos componentes Remotion

Os padrões do catálogo (#22C55E, #0d0f14, rgba(8,10,8,0.4), #e5e7eb, #FFB800) são de teste e nunca vão ao vídeo final. Todo plano passa as cores explícitas nas props. Nunca incluir corFundo.

Exceção aprovada: LegendaAnimada com corTexto #FFFDF7 e corDestaque #FFB800 (decisão de 14/10/2026), pendente do item do amarelo.

---

## 3. Tipografia: quatro vozes, cada uma com um trabalho

| Voz | Família | Quando |
|---|---|---|
| Título | Fraunces Bold, caixa de frase, line-height 1.08 | Título normal, até 7 palavras, um destaque de cor |
| Texto e números | Inter Regular 400 / SemiBold 600, tabular, R$ 1.250,00 | Corpo, rótulos, números, tabelas |
| Legenda | Inter 800, caixa alta, contorno verde-escuro | Só LegendaAnimada, até 4 palavras por vez, uma em destaque |
| Impacto (nova) | Anton inclinada (-8°), caixa alta | Palavra que bate: até 3 palavras, terço inferior, sobre o JR |
| Capítulo (nova) | Montserrat Black, caixa alta | Só abertura de parte do vídeo longo |

- Caixa alta de impacto e capítulo só quando a fala pede força. Em título comum continua caixa de frase.
- Sem brilho (glow) em volta do texto. Contorno verde-escuro de 0,35% da largura segura a leitura sobre vídeo.
- Fontes via @remotion/google-fonts. As fontes dos prints de referência parecem pagas; as de cima são equivalentes gratuitas (identificação das originais: chute).
- Erros que o validador deve barrar: título comum todo em maiúsculas, dois destaques no mesmo título, dourado sobre creme, número com $ ou sem formato brasileiro.

---

## 4. Tipos de cena (posições em fração da tela)

Valores de referência vindos dos quadros do artifact; confirmar no render real.

### 4.1 Tela dividida (16:9)
- JR na metade esquerda (corte da câmera, não redução). Informação na direita, fundo #0F2A1D chapado.
- Painel abre da direita em 0,7 s. Depois: pílula, título, número, em cascata de 0,15 s.
- Cédulas ao fundo do painel, se o assunto for dinheiro.

### 4.2 Tela pequena (16:9, explicação)
- JR vai para janela no canto inferior esquerdo, largura ~18% da tela, raio 28px, sem borda e sem sombra. (Nas referências do Matheus a janela fica à direita; o canto é decisão aberta, a gravação de tela já traz o JR no canto inferior esquerdo.)
- Cards creme entram um por vez, presos ao tempo da palavra na transcrição.

### 4.3 Corte vertical (9:16)
- JR em tela cheia. Card verde-escuro no terço superior. Legenda no terço inferior, acima da área coberta pelos botões do app (medida exata pendente, chute).
- Escurecimento leve na base para legibilidade (único degradê permitido).

### 4.4 Palavra de impacto
- Terço inferior sobre o JR, até 3 palavras, entra com escala 170% a 100% em 0,4 s.
- Zoom seco de 115% no vídeo com tremida de 3 quadros. Máximo 2 por minuto (chute).
- Dourado = padrão (ênfase, data, número dito alto). Vermelho-terra = alerta/erro.

### 4.5 Abertura de capítulo (16:9)
- Tela cheia, 2 a 3 s, verde-escuro com grade leve a ~9% e cédulas 2D.
- Rótulo "Parte N" em dourado com tracking aberto, título em fonte de capítulo, subtítulo em Inter.

### 4.6 Cards de empresas
- Linha de 3 a 4 cards creme com logo, nome e variação. Variação negativa em vermelho-terra.
- Logo, nome e número vêm de fonte indicada pelo Matheus. Sem fonte: [DADO FALTANDO: ...]. Nunca empresa real com número inventado.
- Rodapé: fonte e data. "Ilustrativo" na tela quando não for dado real.

### 4.7 Tabela (fundo creme)
- Cabeçalho em Inter 600 caixa alta tracking aberto, linha grossa embaixo do cabeçalho, fios de 1px entre linhas.
- Colunas padrão do Método JR: ativo, preço hoje, valor calculado, situação. A tabela compara preço com valor calculado; não mostra "ganho".
- Verde do método só na linha em que o preço tocou o valor.
- Janela do JR à direita, raio 28px.

---

## 5. Formatos e áreas seguras

| Formato | Resolução | Margem |
|---|---|---|
| Vertical 9:16 | 1080 × 1920 | 88px |
| Horizontal 16:9 | 1920 × 1080 | 96px |

Logo no canto superior direito, PNG transparente, mínimo 72px. Aviso legal no rodapé, dentro da margem.

---

## 6. Cards e overlays

Cor chapada (#0F2A1D ou #F5F0E6), raio 28px (marcadores 8, blocos 16, pílula 999), sem sombra, sem borda (só fio de 1px em alfa), sem transparência, sem blur. Nada de borda colorida só de um lado. Um bloco de informação por tela.

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
12. Logo no canto superior direito, aviso legal no rodapé, tudo dentro da margem segura?

---

## 11. Diferenças entre Design System (artes) e vídeo

| Aspecto | Artes | Vídeo |
|---|---|---|
| Fundo | fundo-mercado-campo.png a 55% | O vídeo real; cédulas e grade só em cenas de informação |
| Margem | 24/72/96px | 88px (9:16) e 96px (16:9) |
| Animação | Fade e slide curtos, sem bounce | Biblioteca da seção 7 |
| Tipografia | Fraunces + Inter | Fraunces + Inter + impacto + capítulo (a aprovar com o JR) |
| Cores | 5 da marca | 5 da marca + vermelho-terra (a aprovar) |

---

## 12. Pendências de decisão

1. Matheus: A ou B nas duas fontes novas.
2. JR: aprovar as duas fontes novas e o vermelho-terra (mudança de marca).
3. Matheus: manter ou tirar o amarelo da legenda.
4. Medir a área coberta pelos botões no vertical (Reels/TikTok) com um post real.
5. Definir o canto da janela do JR (esquerda ou direita).
6. Instruções do projeto no claude.ai: trocar "sinal de compra" por "evento do método". O verde #1DD41E já está correto (decisão do Matheus).
7. Adicionar essas cores e regras ao validar-plano.mjs do editor-jr.

Atualizado em 02/11/2026 (v3: verde do método decidido). Fonte: Design System JR, catálogo de componentes e referências enviadas pelo Matheus.
