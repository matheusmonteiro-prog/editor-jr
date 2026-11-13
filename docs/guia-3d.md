# Guia do 3D (editor-jr): quando usar, como fazer, como sugerir

Criado em 13/11/2026, a partir da aula 8.1 do curso "Máquina de Edição IA"
(`referencias/curso-edicao-ia/guia-do-aluno.pdf`, p. 41 a 46), da skill oficial do Remotion
(`.claude/skills/remotion-best-practices/remotion-markup/3d.md`) e do 1º teste real do projeto
(`Teste3D-Terra-Valorizacao`, pasta "Testes-3D" no Studio). **Estado: aprovado pelo Matheus em 13/11/2026**
(viu os MP4 dos estudos; "com o tempo a gente vai lapidando"). Decisão de uso (se, qual molde, onde): skill
`cenas-3d`. Cores: `src/components/tres/estilo3D.ts` (fundo = verde do kit).

## 1. O que é "3D de verdade" aqui

- **3D de verdade** = objetos com volume (Three.js pelo pacote oficial `@remotion/three`): câmera que
  anda em volta, luz, sombra, um objeto escondendo o outro (oclusão). Exemplo: `src/components/tres/TerraValorizacao3D.tsx`.
- **3D de mentirinha** = peças planas inclinadas com CSS (`Moeda3D`, `Logo3D`, `Bandeira3D`,
  `GradeAtivos3D`). Servem para enfeite rápido; não explicam relação de espaço.
- Regra do curso: o 3D tem que **explicar uma relação** (camadas, tamanho, posição, quanto um é maior
  que o outro). Imagem plana girando não conta como 3D.

## 2. Quando o Claude deve sugerir 3D (sem o Matheus pedir)

Ao ler a transcrição e montar os temas (fluxo do roteiro: transcrição → temas → ideias → prompt final),
o Claude marca **"3D possível aqui"** quando a fala tiver um destes gatilhos:

| Gatilho na fala | Exemplo do JR | 3D que explica |
|---|---|---|
| **Comparação de tamanho** entre duas coisas | "o dividendo é pouco, mas a valorização é grande" | Barras subindo x poucas moedas na mesma maquete (feito: `TerraValorizacao3D`) |
| **Camadas** de uma ideia (algo feito de partes) | "valorização, dividendo e terra"; "o que compõe o retorno" | Maquete que abre em camadas com rótulo e depois se fecha |
| **Terra x Bolsa** (o benchmark do canal) | "a terra vai ser o benchmark nosso" | Talhão de terra de um lado, gráfico de ações do outro, câmera passando entre os dois |
| **Crescimento ao longo do tempo** | "ações de crescimento", "valoriza bem perante o real" | Lavoura crescendo em fileiras (cada fileira = um ano), câmera subindo |
| **Divisão de um todo** | "seleção de ativos", "dividir na Mega-Sena" | Fazenda dividida em talhões, cada talhão uma parte da carteira |
| **Acúmulo** (empilhar) | juros compostos, reinvestir dividendo | Pilha de sacas ou moedas crescendo em torre |
| **Mapa e lugar** | "fazenda no Mato Grosso, no Paraná" | Relevo do mapa com as fazendas marcadas (existe skill de mapas no Remotion, não testada) |

**Quando NÃO sugerir 3D:**
- Frase curta de impacto (use `ImpactoKit`); lista simples (use `Pauta`/`ListaCheck`); número único (use contador).
- Trecho com menos de ~4 s de fala sobre o assunto: o 3D precisa de tempo para a câmera mostrar a profundidade.
- Dois 3D seguidos: no máximo **1 cena 3D a cada ~2 min** de vídeo longo (o 3D é o "ponto alto", não o padrão).
- Quando o 3D mostraria **número inventado**. As alturas são ilustrativas: nunca escrever valor, percentual
  ou promessa na maquete (kit, seção 9: o método é mostrado, nunca prometido).

**Como o Claude escreve a sugestão no roteiro:** uma linha por ponto, com o tempo da gravação, a fala,
o que a maquete mostra e o tempo de render estimado. Exemplo:
> **3D possível aqui, T4 (2:40–2:45):** "o dividendo é pouco, mas a valorização é grande" → maquete de
> terra: poucas moedas pequenas + barras subindo, abre em 3 camadas. Render: ~1,5 min para 5 s.

## 3. Receita técnica (o que funcionou no 1º teste)

1. **Pacotes** (já instalados em 13/11): `@remotion/three@4.0.527` (mesma versão do Remotion), `three@0.186.1`,
   `@react-three/fiber@9.8.2`, `@types/three@0.186.0`. Oficiais (Remotion e Three.js), rodam só no PC, sem custo.
2. **Tudo anda pelo quadro**: `useCurrentFrame()`, `spring()`, `interpolate()`. **Proibido** `useFrame()` do
   R3F e animação por CSS (pisca no render). `<Sequence>` dentro do `ThreeCanvas` precisa de `layout="none"`.
3. **`ThreeCanvas` ocupando a tela inteira** + `<color attach="background">` e `<fog>` na cor do kit. Com o
   canvas só num pedaço da tela, aparece uma emenda de cor (erro do 1º quadro).
4. **Maquete fora do centro**: usar `camera.setViewOffset(...)` (lente deslocada) em vez de mudar a cena.
5. **Câmera**: girar no máximo ~25° no trecho, aproximar um pouco quando a maquete abre. Nada de volta
   completa (desorienta).
6. **Rótulos em HTML** por cima do 3D, posicionados projetando o ponto 3D com uma câmera igual à da cena
   (função `naTela`). Rótulo à esquerda da camada, linha curta até a borda. Assim o texto fica nítido e na fonte do kit.
7. **Sombra**: luz direcional com `castShadow`, chão com `receiveShadow`. Objetos pequenos que ficam
   **acima** de outros (moedas) sem `castShadow`: senão viram mancha nas barras.
8. **Objeto que ainda não nasceu**: `visible={false}` (uma caixa com altura 0,001 ainda mostra o tampo).
9. **JR na moldura**: moldura chanfrada com contorno duplo, sem remover o fundo. Se a fonte for o render v1
   do 28/10, reaproveitar o recorte da janelinha do v1 (`JANELA_V1` e a curva de saída do `Video2810V3`).
10. **Render**: `--gl=angle` (o WebGL precisa disso no Windows). Medido em 13/11: 150 quadros em 78 s com
    `--concurrency=2` (~16 s de render por segundo de 3D). Conferir o **MP4**, não só o Studio (regra do curso).

## 4. Checklist antes de chamar o Matheus (curso, aula 8.1)

- [ ] O teste foi renderizado em MP4 e o movimento aparece no arquivo.
- [ ] Geometria com volume, luz, sombra e profundidade (não é imagem plana).
- [ ] Os mesmos objetos ficam no mesmo lugar quando a maquete abre e fecha.
- [ ] Rótulos presos às camadas e legíveis com a câmera andando.
- [ ] Nenhum número, medida ou promessa inventada na maquete.
- [ ] Rosto do JR inteiro na moldura; legenda e títulos sem bater nos rótulos.

## 5. Limites conhecidos (13/11)

- Só testado em 16:9. No vertical (cortes) a maquete precisa de outra câmera (mais alta, mais perto).
- A voz do render sai ~42,6 ms atrasada (problema geral do projeto, ver `docs/estado-atual.md`, 11/11);
  no teste de 5 s **não** foi corrigida.
- Não testado: modelos 3D prontos (.glb), texto 3D, mapas 3D (skill `remotion-maps`).

## 6. Direção de arte "JR 3D Editorial Worlds" (13/11/2026, Estudo C, a validar)

Origem: prompt de direção de arte trazido pelo Matheus (feito no ChatGPT) + pesquisa. Composição de
referência: `Estudo3D-C-Hibrido` (`src/components/tres/TerraEditorial3D.tsx`), MP4 em
`out/testes-13-11/estudo3d-C-hibrido-5s.mp4`. **Falta o Matheus ver e escolher.**

**Regra que manda em tudo: cenário em 3D, dado em 2D de frente.** A pesquisa é unânime: número em
perspectiva mente (o que está longe parece menor). Por isso:
- o **mundo** (fazenda, relevo, solo, silos) é 3D e dá o impacto;
- o **gráfico** fica num cartão de frente, com eixo do tempo e **a mesma escala** para as coisas comparadas
  (patrimônio e renda no mesmo gráfico: a renda "mal sai do chão", e isso já é a explicação);
- uma **ligação** entre os dois (pulsos de renda saindo do silo e caindo na barra do ano) costura 3D e 2D;
- gráfico sem dado real leva o selo **"ILUSTRAÇÃO CONCEITUAL · SEM DADOS REAIS"**.

**Escolha do gráfico pela natureza da informação** (nunca candle só porque "parece Bolsa"):
ação = candle/preço/volume; valorização de patrimônio = linha no tempo; renda/dividendo = barras
periódicas (fluxo); comparação = mesmo gráfico, mesma escala; crescimento acumulado = área.

**Receita do diorama** (tudo procedural, sem modelo comprado, sem pacote novo):
- Terreno em anéis polares com contorno de superelipse irregular (bordas orgânicas); relevo por ruído (fbm)
  determinístico; cores por zona (lavoura com sulcos, pasto com manchas secas, estrada de terra rebaixada).
- **Corte do solo** na parede: humus escuro, **terra roxa** (aceno ao Paraná), argila clara, rocha; base grafite.
- Lavoura em **uma malha instanciada** (~2.000 plantas, rápido), fileiras com sulco visível (espaço 0,19).
- Árvores só na borda; silos e galpão dão escala. Nada flutuando sem motivo.
- Luz: hemisfério (céu/chão) + sol de fim de tarde com sombra macia (`shadows="soft"`, mapa 4096) + recorte
  frio por trás; névoa e fundo na cor do fundo; vinheta leve. Metal sem mapa de ambiente fica escuro:
  usar `metalness` ~0,35.
- Câmera: revelação (desce e se aproxima em 2,5 s) e deriva lenta até parar. Lente deslocada
  (`setViewOffset`) para o diorama ficar à esquerda e o cartão à direita.
- **Erro que já aconteceu:** superfície construída à mão com os triângulos na ordem errada fica preta
  (normal para baixo). Se o topo sair escuro, inverter a ordem dos índices.
- Render medido: 150 quadros em 43 s (`--gl=angle --concurrency=2`).

**O que NÃO dá para fazer só no navegador (precisaria Blender ou outro motor; não instalado):** iluminação
global de verdade (GI/path tracing), displacement e normal maps de alta qualidade, texturas fotográficas.
O Estudo A ("Cinematic CGI") do prompt depende disso. Instalar Blender = pipeline novo: só com a decisão do Matheus.

**Fontes da pesquisa (13/11):** perspectiva distorce comparação e 2D vence 3D para dado
(Highcharts, UBC "rules of thumb", GoodData, Domo); híbrido 2D/3D no mesmo quadro como tendência
(b2w.tv, Studio Liddell, Videobolt 2026); `--gl=angle` e presets do drei baixando HDRI da internet
(docs do Remotion e do drei).

## 7. Gráfico de ações no estilo (13/11/2026, a validar)

Composição `Estudo3D-Grafico-Acoes` (`src/components/tres/GraficoAcoes3D.tsx`), MP4
`out/testes-13-11/estudo3d-grafico-acoes-5s.mp4`. Fala do JR 177,4–182,4 s ("prefiro ações de crescimento
do que dividendos").
- **Candles 3D de verdade** (corpo em volume, pavio, sombra na placa) para a ação de crescimento; **linha
  dourada** (tubo metálico) para a pagadora de dividendo; **dividendos pagos** em barras no painel de baixo.
  As duas ações na **mesma escala, base 100**, com linha de base marcada.
- **Câmera que mostra o volume e depois para de frente:** começa de lado e longe (a placa aparece como objeto
  no espaço, com moldura de metal e base) e termina frontal com lente fechada (FOV 18°) antes de os valores
  importarem. É o jeito de ter 3D sem perspectiva distorcendo o dado.
- Candle realista tem queda no caminho: 6 de 24 vermelhos (sem isso parece desenho, não ação).
- Rótulos em HTML presos ao fim de cada série (projeção da câmera); selo "ILUSTRAÇÃO CONCEITUAL · SEM DADOS
  REAIS · PREÇO EM BASE 100".
- Render medido: 150 quadros em ~45 s.

## 8. A ideia inicial com os elementos novos (13/11/2026, a validar)

Composição `Estudo3D-Terra-Camadas` (`src/components/tres/TerraCamadas3D.tsx`), MP4
`out/testes-13-11/estudo3d-terra-camadas-5s.mp4`. Mesma fala e mesma história do 1º teste (terra → dividendo
pouco → valorização grande → abre em 3 camadas → reúne, JR na moldura), com o acabamento do Estudo C:
- **TERRA** = o bloco de solo (corte com terra roxa + base). Ao abrir, desce e mostra uma **tampa de terra**
  (fatia), não um bloco oco. A fazenda (relevo, lavoura, árvores, silos) fica no meio.
- **VALORIZAÇÃO e DIVIDENDO** = um **quadro que sempre olha para a câmera** (copia o giro da câmera a cada
  quadro), flutuando acima da fazenda: linha do patrimônio e barrinhas de dividendo na mesma escala. Os
  pulsos dourados saem do silo e caem em cada barra. Assim o dado nunca fica inclinado, mesmo com a câmera andando.
- O diorama agora mora em `src/components/tres/dioramaFazenda.tsx` (compartilhado; `criarTerreno("topo" |
  "solo" | "tudo")` permite separar a superfície do solo). O Estudo C continua idêntico depois da mudança
  (conferido quadro a quadro).
- Render medido: 150 quadros em 57 s.
