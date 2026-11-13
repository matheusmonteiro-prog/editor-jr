# Fluxo padrão dos dois modelos: cortes curtos e trechos explicativos do longo

Proposta de 12/11/2026, **aprovada pelo Matheus em 12/11/2026 ("Aprovo, segue")**. As 3 perguntas do
fim ficaram com a resposta proposta. O código dos passos (a) a (e) foi feito no mesmo dia, a validar pelo Matheus (ver `docs/estado-atual.md`, retrato "noite, 7"). Diferença do que está escrito abaixo: o 16:9 da Cartografia não tem as variações `close`/`janela`, e a peça `marco` não tem o "presoEm" (a posição é dada em x, y).
Base: `ARQUITETURA.md` (Etapa 9), `docs/identidade/territorio-proposta.md` (seções 7 e 8), kit 4.16,
skill `cortes-curtos`, `src/cortes/receita.ts`, `src/cortes/fontes.ts`, `src/identidade/CorteCartografia.tsx`.

## Resumo em 5 linhas

1. Os cortes passam a usar os **tempos da gravação tratada** (voz tratada + filtro de rosto), e não os do
   vídeo longo pronto. Assim dá para cortar **no mesmo dia** em que a gravação chega, sem esperar a edição do longo.
2. Cada vídeo de ~15 min rende **5 a 6 cortes**, escolhidos por uma **nota de 0 a 10** (5 critérios).
3. Cada corte usa **um dos dois modelos**: papel (conceito, campo, "como funciona") ou Cartografia
   (Bolsa, ações, crescimento, comparação). A Cartografia usa **um ambiente por vídeo** (verde ou branco).
4. A Cartografia deixa de ter as cenas fixas no código: elas passam a ser escritas **na receita**, como já
   acontece com o papel.
5. No vídeo longo (16:9), qualquer trecho pode virar **trecho explicativo** de um dos dois modelos, chamado
   por uma peça só (`TrechoExplicativo`).

Exemplo do dia a dia: hoje é como fazer as marmitas só depois do almoço da família pronto. A proposta é
separar os ingredientes (gravação tratada) e montar as marmitas (cortes) em paralelo com o almoço (o longo).

---

## Parte A: cortes curtos automáticos

### A1. As etapas, na ordem

| # | Etapa | Quem | O que sai | Onde |
|---|---|---|---|---|
| 1 | Gravação tratada: voz tratada + filtro de rosto | Claude (skill `tratar-audio` e filtro) | câmera filtrada e voz tratada, **inteiras, sem cortar silêncio** | `public/videos/` (fora do Git) |
| 2 | Transcrição palavra por palavra da voz tratada | Claude (`scripts/transcrever.mjs`) | `videos/<video>-voz-tratada.palavras.json` | `videos/` |
| 3 | Mapa de temas | Claude | lista dos assuntos com início e fim (ex.: "terra x Bolsa, 3:10 a 4:05") | `docs/cortes/<video>.md` |
| 4 | Nota de cada trecho candidato | Claude | tabela com a nota de 0 a 10 (A2) | `docs/cortes/<video>.md` |
| 5 | Cardápio de 5 a 6 cortes, com justificativa | Claude | os 5 ou 6 de nota mais alta, sem dois com a mesma ideia | `docs/cortes/<video>.md` |
| 6 | Modelo de cada corte | Claude, pela regra A3 | "papel", "papel com câmera" ou "cartografia" | na receita |
| 7 | Receita JSON | Claude | um item por corte, estado "montado" | `cortes/<video>.cortes.json` |
| 8 | Montagem automática + conferência | Claude | `tsc`, lista de composições, stills de cada quadro | Studio, pasta "Cortes" |
| 9 | Revisão | **Matheus, no Studio** | ajustes em `docs/alteracoes.md` | |
| 10 | Render | Claude, **só com "pode renderizar"** | mp4 9:16, com a correção dos 42,6 ms da voz | `out/cortes/` |

O que muda em relação a hoje: as etapas 3 a 8 rodam **sem parar para perguntar**. O Matheus vê o
cardápio e os cortes montados juntos e corta ou troca o que quiser. Hoje a skill para no cardápio e
espera a escolha. (Ver pergunta 1 no fim.)

### A2. A nota de cada trecho (0 a 10)

Cada critério vale 0, 1 ou 2. Entra no cardápio só trecho com **7 ou mais**.

| Critério | 2 pontos | 1 ponto | 0 |
|---|---|---|---|
| **Gancho nos 3 primeiros segundos** | frase forte ou pergunta logo de cara (pode vir do meio do vídeo, como no 2810-01) | o gancho existe, mas demora | começa morno |
| **Faz sentido sozinho** | quem nunca viu o canal entende | precisa de uma etiqueta para situar | depende do que veio antes |
| **Opinião firme ou contraintuitiva** | o JR toma posição ("não sou investidor em dividendos") | opinião morna | só informação |
| **Exemplo ou número dito pelo JR** | o JR fala o exemplo ou o número, com a ressalva junto | exemplo vago | nenhum. **Número inventado por nós = corte fora** |
| **Fecho** | termina numa conclusão ou numa pergunta ao público | termina no meio da ideia, mas dá para segurar a imagem | corta no meio da frase |

Regras que continuam valendo (skill `cortes-curtos`): não tirar a ressalva da fala; nada de promessa
ou desempenho sem fonte; começar e terminar nos limites das palavras; 20 a 45 s.

### A3. Qual modelo em cada corte

| O assunto do corte é... | Modelo | Componente |
|---|---|---|
| Conceito, campo, "como funciona" (o que é benchmark, como a terra paga, por que o JR pensa assim) | **1. Papel** | `CorteDividido` |
| O mesmo, mas com muita troca de assunto e vale mexer no JR (janela, alto, perto) | **1. Papel com câmera** | `CorteDivididoLivre` |
| Bolsa, ações, crescimento, comparação de investimentos | **2. Cartografia** | `CorteCartografia` |

- **Ambiente da Cartografia: um só por vídeo.** Fica escrito **uma vez no topo da receita**
  (`"ambienteCartografia": "verde"` ou `"branco"`), e não em cada corte. Assim é impossível misturar:
  todos os cortes Cartografia daquele vídeo saem no mesmo ambiente.
- Quando o corte tem os dois assuntos (campo **e** Bolsa, como o da Mega-Sena), vale o assunto do
  **fecho**: é o que fica na cabeça.
- O cardápio diz o modelo de cada corte e o porquê, numa linha.

### A4. Tempos: da gravação tratada, não do vídeo final

**O problema.** Hoje a receita usa segundos da **linha final do vídeo longo**. No 28/10 isso funcionou
porque o longo foi refeito em cima do render v1, que já estava cortado: a linha final e a da câmera
eram a mesma. Num vídeo novo, o longo corta silêncios e erros da gravação, então os tempos só existem
depois da edição do longo. Os cortes ficariam esperando.

**A proposta.**
1. Na receita, um campo novo no topo: `"tempos": "gravacao"` (novo padrão) ou `"final"` (o que existe
   hoje; o 28/10 continua assim, sem mudar nada no que já foi aprovado).
2. Com `"gravacao"`, todos os tempos da receita (trechos, quadros, peças, cenas) são **segundos da
   gravação tratada inteira**: a mesma linha da transcrição da voz tratada.
3. Em `src/cortes/fontes.ts`, a entrada do vídeo novo aponta para a **gravação tratada inteira**:
   câmera filtrada, voz tratada, transcrição dessa voz. Nada do longo.
4. O tratamento não muda a duração (medido no 28/10: filtro com 0 quadros de desvio em 9 pontos;
   voz com a mesma duração). Por isso os tempos da transcrição valem para a câmera e para a voz.
5. **Quando o longo ficar pronto**, se for preciso saber "em que minuto do longo está este corte",
   usa a conversão que **já existe no projeto**: `src/utils/tempoCortado.ts` (tempo da gravação →
   tempo do vídeo cortado, a partir de `videos/<video>.cortes.json` do corte de silêncio).

**Ordem prática para não travar:** o filtro de rosto é a parte lenta (no 28/10, 247 s de vídeo
levaram 33 min; num vídeo de 15 min, **estimo cerca de 2 horas**, não medido). Enquanto ele roda, os
cortes podem ser montados com a câmera **sem filtro**; quando o filtro termina, troca-se só o caminho
da câmera em `fontes.ts`. Os tempos não mudam.

**Cuidados.**
- A gravação tem erros e falas repetidas que o longo vai tirar. O cardápio só usa a versão boa de cada
  frase (a última tentativa, em geral), e avisa quando houver dúvida.
- Texto gravado por cima da câmera (como no v1 do 28/10) não existe na gravação limpa: melhor ainda.

### A5. Receita do modelo 2 (Cartografia) sem cenas fixas no código

**Hoje:** as 7 cenas do corte da Mega-Sena estão escritas à mão em `CENAS` (`CorteCartografia.tsx`),
com textos, posições e tempos fixos. Para outro corte, seria preciso escrever código novo.

**Proposta:** o corte Cartografia ganha `"layout": "cartografia"` e uma lista `cenas`, do mesmo
jeito que o papel tem `quadros`. As peças desenhadas viram peças reaproveitáveis.

Exemplo (a cena "lavoura vira candle" do corte de hoje, escrita na receita):

```json
{
  "de": 179.72,
  "enquadramento": "alto",
  "rotulo": "DA LAVOURA À BOLSA",
  "titulo": [["Ações de"], ["crescimento:alta"]],
  "pecas": [
    { "peca": "lavouraCandles", "em": 181.02, "x": 0.08, "y": 0.53, "largura": 0.84, "altura": 0.15,
      "props": { "tendencia": "sobe", "volume": true, "media": true } },
    { "peca": "marco", "em": 182.1, "props": { "rotulo": "CRESCIMENTO", "presoEm": "fimDoGrafico" } },
    { "peca": "texto", "em": 182.19, "x": 0.06, "y": 0.75, "props": { "texto": "DIVIDENDOS: NÃO É O FOCO DO JR", "cor": "baixa" } }
  ]
}
```

| Campo | O que é | Valores |
|---|---|---|
| `de` | quando a cena entra (segundos, na linha da receita) | |
| `enquadramento` | onde fica o JR | `abertura`, `loteBaixo`, `janela`, `janelaDir`, `close`, `alto`, `fecho` (os 7 de hoje) |
| `rotulo` | linha pequena de documento no alto | texto curto em maiúsculas |
| `titulo` | linhas do título; `:cor` pinta a palavra, `:caixa` põe o fundo dourado | `alta`, `baixa`, `terra`, `destaque`, `caixa` |
| `pecas` | o que se desenha, em que palavra | tabela abaixo |

| Peça | O que desenha | Hoje no código como |
|---|---|---|
| `candles` | candles com pavio, volume e média móvel | `GraficoCandles` |
| `lavouraCandles` | lavoura vista de cima que vira candles na palavra | `GraficoCandles` com `deCampo` |
| `estratos` | corte do solo: renda fina em cima, valor grosso embaixo | `Estratos` |
| `marco` | marco de divisa que vira marcador do gráfico | `Marco` |
| `regua` | linha tracejada de benchmark sobre os candles | dentro de `CenaRegua` |
| `talhoes` | talhões a nanquim com nome (terra, soja, boi) | `Talhao` |
| `pontos` | grade de pessoas/pontos que se enchem ("a maioria") | dentro de `CenaMaioria` |
| `frase` | citação grande do JR com barra dourada | `CenaFrase` |
| `texto` / `carimbo` | texto solto ou palavra com borda (SOZINHO, SIM) | `Aparece` |

Mais três campos no corte: `enfases` (tempos do "soquinho" de zoom na câmera; hoje fixo em
`ENFASE`) e `legenda.chaves` (palavra → cor na legenda; hoje fixo em `CHAVE`).

**Travas automáticas (para não depender de lembrar):**
- Toda cena com `candles` ou `lavouraCandles` ganha o selo **"DEMONSTRAÇÃO VISUAL · SEM DADOS REAIS"**
  sozinha, sem opção de desligar.
- A receita **não aceita números** para os gráficos: só `"tendencia": "sobe" | "lateral" | "cai"`.
  Os candles continuam gerados por código. Cotação real só numa peça nova, com fonte, e com ordem.
- `pontos` sempre com "ilustração · sem número de pesquisa".
- No máximo 3 peças por cena (igual ao papel). Tempo fora dos trechos = erro com mensagem no Studio,
  como já acontece com o papel.
- Posições em frações (0 a 1) e não em pixels: é o que permite a mesma cena servir ao 16:9 (Parte B).

**Prova de que ficou igual:** depois de pronto, o corte da Mega-Sena é reescrito na receita e comparado
quadro a quadro (stills) com o `Cartografia-2810-01b-verde` e `-branco` de hoje, que ficam guardados
para comparar. O `CorteDividido` aprovado não muda.

### A6. Papel com câmera também na receita

Hoje o `CorteDivididoLivre` tem a ordem dos enquadramentos fixa no código (`PLANO`), feita para o
2810-01b. Proposta: cada quadro do papel ganha um campo opcional `"enquadramento"`
(`classico`, `perto`, `janelaEsq`, `janelaDir`, `alto`). Sem o campo, vale o clássico.

---

## Parte B: trechos explicativos dentro do vídeo longo (16:9)

### B1. Como fica cada modelo no 16:9

- **Modelo 1 (papel): já existe.** `CorteDividido` com `formato: "horizontal"`: papel à esquerda
  (56%), JR à direita, legenda na base do papel. É o `Explicativo-2810-01b-16x9`.
- **Modelo 2 (Cartografia): a fazer.** Mesma lógica do papel 16:9:
  - **Mapa à esquerda (~58%), JR à direita**, com a moldura de lote e os marcos de canto: é o padrão.
  - `close`: JR grande à direita, frase do JR à esquerda.
  - `janela`: mapa na tela toda, JR numa janela pequena embaixo à direita (para os gráficos maiores).
  - Ambiente: o mesmo do vídeo (verde ou branco), escrito uma vez.
  - Como as cenas passam a ter posições em frações (A5), a **mesma cena** serve ao 9:16 e ao 16:9.
    Ajuste fino por formato só quando o still mostrar que não coube.

### B2. Como o editor chama um trecho explicativo

Uma peça nova do catálogo: **`TrechoExplicativo`** (um arquivo, schema zod, aparece editável no Studio).

```
TrechoExplicativo
  video: "2026-11-20"        qual receita
  id: "explica-benchmark"    qual trecho da receita
  modelo: "papel" | "cartografia"
```

- **Onde o trecho é descrito:** na mesma receita do vídeo (`cortes/<video>.cortes.json`), numa lista
  nova `explicativos`, com o mesmo formato de `quadros` (papel) ou `cenas` (Cartografia). Um assunto
  explicado no longo pode virar corte depois com quase nenhum trabalho, e vice-versa.
- **Onde ele entra no longo:** como um elemento a mais do vídeo (no `src/VideoXXXX.tsx` ou no plano
  `planos/atual/<video>.atual.json`), com o começo e o fim. Pode haver os dois modelos no mesmo vídeo.
- **Diferenças do trecho no longo para o corte:**
  - Um trecho só, **contínuo** (sem gancho trazido do meio, sem imagem parada no fim).
  - **Sem voz e sem música próprias:** a voz e a trilha são as do longo, que continuam tocando.
  - **Câmera do longo:** o JR da caixa é a mesma câmera, no mesmo tempo do longo.
  - **Sem aviso educacional, logo e @ próprios:** o aviso vai no início e no fim do vídeo longo
    inteiro, não em cada trecho.
  - **A legenda do longo sai durante o trecho** e entra a legenda do modelo (faixa de papel ou
    caixa alta com palavra colorida), para não aparecerem duas.
  - Entrada e saída suaves do trecho (o papel desliza / a cortina do mapa abre e fecha).
- **Tempos:** os da gravação tratada (igual aos cortes). O `TrechoExplicativo` converte para o tempo
  do longo com `src/utils/tempoCortado.ts`. Se a edição do longo cortar uma palavra que o trecho usa,
  o Studio mostra erro com a mensagem.
- **Revisão:** cada trecho também aparece sozinho no Studio, pasta "Explicativos-16x9", para o
  Matheus ver antes de ver dentro do longo.

### B3. Quando usar no longo (recomendação, não regra)

- Trecho de **15 a 60 s**, onde o JR explica algo que fica melhor desenhado.
- Recomendação: não mais que um a cada 2 ou 3 minutos, para o vídeo não virar só desenho; o JR
  falando para a câmera é o que segura a confiança.
- A regra do modelo (A3) vale igual: campo e conceito no papel; Bolsa e comparação na Cartografia.

---

## O que vem depois do ok (nesta ordem)

1. **Documentação** (sem código): skill `cortes-curtos`, `docs/guia-edicao.md`,
   `docs/kit-visual-video.md` (4.16 e um item novo da Cartografia), `docs/estado-atual.md`.
2. **Código, um passo por vez**, cada um com `tsc` e stills:
   a. receita aceita `tempos: "gravacao"` e `ambienteCartografia`; `fontes.ts` aceita a gravação tratada;
   b. Cartografia lida da receita (A5) + prova quadro a quadro contra o corte de hoje;
   c. enquadramento do papel com câmera na receita (A6);
   d. Cartografia 16:9;
   e. `TrechoExplicativo` no longo.
3. Teste de verdade: o primeiro vídeo novo de ~15 min com 5 a 6 cortes montados sozinhos.

Nada disso mexe no `Video2810V3`, não renderiza, não commita e não apaga nada sem a ordem escrita do Matheus.

## Perguntas para o Matheus

1. **Montar sem parar no cardápio?** Proposta: eu monto os 5 a 6 direto e você vê tudo pronto no
   Studio (mais rápido). Alternativa: paro no cardápio e espero você escolher (como hoje).
2. **Nota mínima 7 de 10** está bom, ou prefere mais exigente?
3. **Trecho explicativo no longo sem o aviso, o logo e o @ próprios** (só no início e fim do vídeo
   inteiro): concorda?
