---
name: cenas-3d
description: Use ao montar roteiro, temas ou prompt final de um vídeo do JR, ao editar vídeo longo ou corte, e sempre que a fala comparar tamanhos, mostrar camadas, falar de terra x Bolsa, crescimento, preço de ação, dividendo, divisão de carteira ou acúmulo; também quando o Matheus pedir 3D. Decide SE cabe uma cena 3D, QUAL molde usar, ONDE entra e COMO montar, sem esperar o Matheus pedir.
---

# Cenas 3D do JR ("JR 3D Editorial Worlds")

Aprovado pelo Matheus em 13/11/2026 ("a parte 3D, aprovado [...] dá para entrar em vários momentos [...]
também nos nossos cortes"). Vai ser lapidado com o uso. Referência técnica completa: `docs/guia-3d.md`.

## 1. A regra que manda em tudo

**O mundo é 3D, o dado é 2D de frente.** O 3D dá o impacto (fazenda, solo, silos, placa com volume); o número
fica num plano que olha para a câmera, com a mesma escala para o que se compara. Perspectiva distorce valor
(o que está longe parece menor). Nunca inclinar um gráfico enquanto o espectador precisa ler o valor.

## 2. Cabe 3D aqui? (perguntar nesta ordem)

1. **A fala tem uma relação para mostrar?** Comparação de tamanho, camadas, parte e todo, antes e depois,
   crescimento no tempo, fluxo (de onde vem e para onde vai). Frase solta de impacto ou lista **não** pede 3D.
2. **Tem tempo?** Pelo menos ~4 s de fala sobre a ideia. Menos que isso, use peça 2D do kit.
3. **Já teve 3D perto?** No vídeo longo, no máximo 1 cena 3D a cada ~2 min (é o "ponto alto"). No corte,
   no máximo 1 por corte.
4. **O dado é real ou conceitual?** Real: mostrar com fonte. Conceitual: selo "ILUSTRAÇÃO CONCEITUAL · SEM
   DADOS REAIS" e nenhum número, percentual ou promessa na tela.
5. **O 3D explica melhor que o 2D?** Se o mesmo entendimento sai com um `ComparacaoNumeros` ou `Pauta`,
   use o 2D (mais barato e mais rápido de ler). 3D só quando a profundidade ou o "mundo" ajudam a entender.

Se passou nas 5: marque no roteiro (seção 6).

## 3. Mapa fala → molde

| Gatilho na fala | Molde | Arquivo / composição |
|---|---|---|
| "X é pouco, Y é grande"; patrimônio x renda; terra valoriza mas paga pouco | **Fazenda em camadas** (solo desce, quadro de dados sobe, pulsos de renda do silo, JR na moldura) | `TerraCamadas3D` / `Estudo3D-Terra-Camadas` |
| Explicar um conceito com o mundo do JR + um gráfico ao lado, sem o JR na tela | **Diorama + cartão 2D** | `TerraEditorial3D` / `Estudo3D-C-Hibrido` |
| Preço de ação, crescimento x dividendo, comparar duas ações | **Gráfico de ações 3D** (candles com volume, câmera termina de frente) | `GraficoAcoes3D` / `Estudo3D-Grafico-Acoes` |
| Terra x Bolsa lado a lado | Diorama + gráfico de ações na mesma cena (ideia, **não montado**) | combinar `dioramaFazenda` + candles |
| Dividir carteira, "seleção de ativos", dividir prêmio | Fazenda dividida em talhões, cada talhão uma parte (ideia) | `dioramaFazenda` + recorte por talhão |
| Juros compostos, reinvestir, acumular | Pilha de sacas crescendo em torre por ano (ideia) | a criar |
| Fazendas em estados diferentes (MT, PR) | Relevo de mapa com as fazendas marcadas (ideia; existe skill de mapas do Remotion) | a criar |

**Escolha do gráfico pela natureza da informação:** ação = candle; patrimônio no tempo = linha; renda e
dividendo = barras periódicas; comparação = mesmo gráfico e mesma escala; acumulado = área. Nunca candle
"só porque parece Bolsa".

## 4. Encaixe por estilo de edição

- **Vídeo longo 16:9 (kit v3):** a cena 3D entra como trecho explicativo de 4 a 8 s. Com o JR na moldura
  (molde de camadas) quando a fala dele é o centro; sem o JR (diorama + cartão, gráfico de ações) quando a
  explicação é o centro e a voz continua por baixo. Entrada e saída pelas regras de acabamento do kit (4.12).
- **Estilo de papel (kit 4.16) e Cartografia viva (kit 4.17):** **não misturar** 3D dentro do papel ou do mapa.
  O 3D entra como trecho próprio, antes ou depois, e a troca é uma transição limpa.
- **Cortes 9:16:** cabe 1 cena por corte, no momento da explicação principal. **Ainda não existe versão
  vertical dos moldes** (câmera mais alta e mais perto, gráfico em cima e diorama embaixo, respeitando área
  segura: nada importante no topo, no rodapé nem na coluna da direita dos botões). Fazer antes do 1º corte com 3D.
- **Fundo:** sempre o da identidade (`src/components/tres/estilo3D.ts`, que lê o `KIT`). Tema claro previsto,
  ainda sem teste de luz.

## 5. Ritmo e aprendizagem (pesquisa, 13/11/2026)

- **Princípios do Mayer** (aprendizagem com vídeo), aplicados ao 3D:
  - *Coerência*: nada sobrando na cena. Cada objeto explica algo (silo = de onde sai a renda; solo = a terra).
  - *Sinalização*: destacar só o que está sendo falado (rótulo que entra junto da palavra, o resto discreto).
  - *Contiguidade temporal*: a animação acontece **na palavra** (Whisper dá o tempo de cada palavra).
  - *Segmentação*: abrir e fechar camadas divide a ideia em pedaços; uma camada por vez.
  - *Redundância*: não escrever a frase inteira que o JR está falando; título curto e rótulos.
- **Ritmo:** guias de retenção falam em alguma troca visual a cada ~5 a 20 s no vídeo longo e uma "virada"
  maior por volta de 25 a 35 s. São números de blog, não regra: conferir no gráfico de retenção do canal.
- **Público mais velho** (perfil do JR) tende a reter **menos** quando toda frase tem efeito: no canal do JR,
  menos é mais. O 3D é para o momento que merece.
- **Metáfora visual** ajuda conceito financeiro abstrato, desde que seja óbvia; se precisar explicar a
  metáfora, ela falhou (a pesquisa achou metáforas que os revisores não entenderam).

## 6. Como escrever a sugestão no roteiro (sem o Matheus pedir)

Uma linha por ponto, com tempo da gravação, fala, molde, o que a cena mostra e custo de render:

> **3D aqui, T4 (2:40–2:45):** "o dividendo é pouco, mas a valorização é grande" → molde *Fazenda em
> camadas*: renda em pulsos pequenos, linha do patrimônio subindo, abre TERRA/VALORIZAÇÃO/DIVIDENDO.
> Conceitual (selo). Render ~1 min para 5 s.

Se o roteiro tiver mais candidatos que o limite (seção 2, item 3), escolher os mais fortes e listar os
outros como "reserva".

## 7. Como montar (resumo; detalhes em `docs/guia-3d.md`)

1. Pegar os tempos das palavras na transcrição (`videos/*.palavras.json`) e prender cada animação a uma palavra.
2. Reaproveitar `dioramaFazenda.tsx` e `estilo3D.ts`; copiar o molde mais próximo e trocar só fala, rótulos e dados.
3. Tudo por `useCurrentFrame()`; proibido `useFrame()` e animação por CSS.
4. Conferir 2 ou 3 quadros com `npx remotion still ... --gl=angle` antes do render.
5. Render do trecho com `--gl=angle --concurrency=2` (~45 a 60 s para 5 s) e conferir quadros **do MP4**.
6. Mostrar ao Matheus antes de encaixar no vídeo final.

## 8. Checklist

- [ ] Passou nas 5 perguntas da seção 2.
- [ ] Gráfico escolhido pela natureza da informação; mesma escala; selo se for conceitual.
- [ ] Valor nunca lido em perspectiva (câmera de frente ou quadro que olha para a câmera).
- [ ] Cada animação presa a uma palavra da fala.
- [ ] Nada sobrando na cena; rótulos curtos, sem repetir a fala.
- [ ] Fundo e cores do `estilo3D.ts`.
- [ ] Rosto do JR inteiro na moldura (se houver); textos sem colidir.
- [ ] Movimento conferido no MP4, não só no Studio.
