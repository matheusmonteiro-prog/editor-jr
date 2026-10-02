# Modelo de prompt pra pedir um plano de edição

Este documento é pra ser **colado num chat de IA** (um Projeto do Claude, por exemplo — é lá
que o plano nasce, não dentro do editor-jr; ver `ARQUITETURA.md`, Etapa 6) junto com a
transcrição da gravação, pra pedir o plano de edição em JSON no formato que o editor-jr sabe
ler (`src/PlanoComposicao.tsx`).

A lista de componentes e props obrigatórias abaixo foi gerada lendo os schemas Zod reais de
`src/components/` e `src/components/v2/`, e o `CATALOGO` real de `src/PlanoComposicao.tsx` —
não é uma lista escrita de memória. Se o catálogo mudar, essa lista pode ficar desatualizada;
confira contra o código se algo não bater.

---

## O prompt (cole isto, preenchido, num chat de IA)

```
Você vai montar um PLANO DE EDIÇÃO em JSON pra um vídeo meu, no formato abaixo.
Eu vou te dar a transcrição (com timestamps) da gravação ORIGINAL (antes de
qualquer corte). Cada vez que eu disser "quando eu falar X" num comentário,
isso quer dizer "acontece Y" na tela, no momento exato em que a fala X ocorre
na gravação original.

REGRAS DO FORMATO (não inventar nada fora disso):

1. O JSON é um objeto com "video" (nome do arquivo, sem extensão), "orientacao"
   ("vertical" ou "horizontal") e "elementos" (lista).

2. Cada item de "elementos" tem: "id" (texto único, curto, sem espaço),
   "componente" (nome exato do catálogo — ver lista abaixo), "descricao"
   (frase curta do que esse elemento mostra), "texto" (o que aparece na tela,
   ou a fala correspondente), "inicio" (formato "m:ss", SEMPRE referente à
   gravação ORIGINAL, nunca ao vídeo já cortado), "duracao" (segundos),
   "posicao" ("topo" ou "base"), "slot" (número inteiro >= 1; 1 é o mais alto
   dentro da zona), "ilustrativo" (true/false) e "tempo_estimado" (true se
   você estimou o tempo por não ter certeza exata, false se tem certeza) e
   "props" (objeto com os dados exigidos pelo componente escolhido).

3. Um elemento pode usar mais de um componente ao mesmo tempo (ex.: uma
   imagem + uma legenda junto) — nesse caso "componente" vira uma lista de
   nomes, e "props" vira um objeto com uma chave por nome, cada uma com as
   props daquele componente. Ex.: "componente": ["PersonagemImagem",
   "LegendaDiscreta"], "props": { "PersonagemImagem": {...}, "LegendaDiscreta":
   {...} }.

4. NUNCA deixe "componente" ou "props" como "a confirmar" — isso não é mais
   aceito (o validador rejeita). Se não achar um componente que sirva pra
   algo, me avise no lugar de inventar ou deixar em aberto.

5. Uma camada por ideia falada: se a fala junta vários critérios em
   sequência, são vários elementos separados, cada um entrando no momento
   exato em que é dito — nunca juntar frases num card só com barra/vírgula.

6. Gráfico ou comparação sem dado real leva "ilustrativo": true, E o
   componente mostra a palavra "ilustrativo" na tela (ver props de
   `GraficoCrescimento`/`BarrasDuelo` abaixo) — nunca finja que é dado real.

7. O texto na tela nunca pode ser mais forte que a fala: use as palavras do
   JR ou algo mais fraco. Evite "garante", "sempre", "rende mais", e evite
   símbolos como ≠, ×, = que afirmam mais do que foi dito. Um exemplo
   pessoal do JR ("eu vou...") não vira regra geral.

8. Cores: só as da marca — verde #0F2A1D, creme #F5F0E6, dourado #EFAF20
   (mais o que já for cor própria de algum componente específico, como
   `corNegativo` com opacidade). Nunca inventar cor nova.

9. Nada de blur, glow ou sombra difusa — os componentes do catálogo já são
   chapados por padrão, não peça esse efeito.

10. O componente "AvisoCVM" (aviso de que o conteúdo não é recomendação de
   investimento) só entra no plano se eu pedir no roteiro. Nunca coloque por
   conta própria e nunca escreva o texto do aviso: deixe "props" sem "texto"
   que o componente usa o texto padrão, que é PROVISÓRIO (eu e o JR conferimos
   o texto antes de publicar qualquer vídeo).

COMPONENTES DISPONÍVEIS (nome exato — use só estes) e suas PROPS OBRIGATÓRIAS
(as que não aparecem aqui têm valor padrão e são opcionais):

[... colar aqui a lista da seção "Catálogo de componentes" abaixo ...]

Antes de me entregar o JSON, rode mentalmente contra estas checagens (o
editor-jr tem um validador de verdade, `scripts/validar-plano.mjs`, que faz
isso automaticamente — mas eu vou rodar ele também, então já adianta):
- todo "componente" existe na lista acima, sem erro de digitação
- toda prop obrigatória de cada componente está em "props", com o tipo certo
  (número onde é número, texto onde é texto, true/false onde é booleano)
- nenhum "inicio" é negativo ou cai depois do fim da gravação
- nenhum "componente"/"props" ficou "a confirmar"

CONFIRA O PLANO COM O VALIDADOR E CORRIJA ANTES DE ENTREGAR: rode
`node scripts/validar-plano.mjs caminho/do/plano.json` (dentro do projeto
editor-jr) e corrija qualquer ERRO apontado antes de me devolver o JSON final.
AVISOs você pode comentar comigo, mas ERROs têm que estar zerados.
```

---

## Catálogo de componentes e props obrigatórias

Gerado em 01/10/2026 lendo o AST dos schemas Zod reais (mesma técnica usada por
`scripts/validar-plano.mjs`) e o `CATALOGO` real de `src/PlanoComposicao.tsx` — são os únicos
19 nomes válidos em `"componente"` hoje (o `AvisoCVM` foi acrescentado em 02/10/2026, lendo o `CATALOGO` real). Prop **não** citada aqui tem `.default()`/`.optional()`
no schema (ver `docs/catalogo-componentes.md` pra ver o valor padrão de cada uma).

| Componente | Props obrigatórias |
|---|---|
| `ImagemFade` | `src`, `larguraPorcentagem`, `frameEntrada` |
| `GraficoLinha` | `titulo`, `valorFinal`, `corLinhaInicio`, `corLinhaFim`, `largura`, `altura`, `frameFimSaida` |
| `ColagemCenas` | `cenas` (array; cada item: `src`, `x`, `y`, `largura`, `rotacaoFinal`, `frameEntrada`) |
| `ComparacaoBarras` | `valorMaximoEscala`, `larguraBarra`, `alturaMaximaBarra`, `barras` (array; cada item: `label`, `valorFinal`, `cor`, `corTopo`, `frameEntrada`, `destaque`) |
| `TextoDestaque` | `texto`, `posicao`, `duracaoFrames`, `corTexto`, `corFundo`, `mostrarFundo`, `tamanhoFonte` |
| `Seta` | nenhuma (todas têm padrão) |
| `Checkmark` | `x`, `y`, `tamanho`, `cor`, `corFundo`, `mostrarFundo`, `duracaoFrames` |
| `ListaCheck` | `texto`, `destaque`, `top`, `corTexto`, `corDestaque`, `corCheck`, `tamanhoFonte`, `frameEntradaCheck`, `duracaoFrames`, `framesSaida` |
| `ColagemFotos` | `fotos` (array; cada item: `src`, `rotacao`, `frameEntrada`), `etiqueta`, `mostrarEtiqueta`, `corEtiqueta`, `larguraFoto` |
| `TextoContraste` | `textoPositivo`, `textoNegativo`, `corPositivo`, `corNegativo`, `frameRisco`, `duracaoFramesRisco`, `tamanhoFontePositivo`, `tamanhoFonteNegativo` |
| `LegendaDiscreta` | `texto`, `corTexto`, `tamanhoFonte`, `posicao`, `duracaoFrames` |
| `BarrasDuelo` | `barras` (array; cada item: `label`, `alturaRelativa`, `cor`, `destaque`, `frameEntrada`), `legenda`, `mostrarLegenda`, `larguraBarra`, `alturaMaxima` |
| `GraficoCrescimento` | `corLinha`, `rotuloEixoX`, `mostrarRotuloEixoX`, `textoIlustrativo`, `mostrarTextoIlustrativo`, `textoFinal`, `mostrarTextoFinal`, `largura`, `altura`, `duracaoFramesDesenho` |
| `PersonagemImagem` | `imagem`, `top`, `left`, `tamanho`, `duracaoFrames`, `framesSaida` |
| `CallToAction` | nenhuma (todas têm padrão) |
| `CirculoDestaque` | nenhuma (todas têm padrão) |
| `Spotlight` | nenhuma (todas têm padrão) |
| `Contador` | `valorInicial`, `valorFinal` |
| `AvisoCVM` | nenhuma (todas têm padrão) |

Pra detalhe completo de cada prop (tipo, opcional ou não, valor padrão), ver
`docs/catalogo-componentes.md`.

### Como pedir o `AvisoCVM` no roteiro

O aviso **só entra quando o roteiro pedir** (ex.: "aviso CVM aos 0:05"). A IA não deve
colocar por conta própria. Ele aparece no canto inferior esquerdo, em faixa, e como todas as
props têm valor padrão, o `"props"` pode ir vazio:

```json
{
  "id": "aviso-cvm",
  "componente": "AvisoCVM",
  "descricao": "aviso de que o conteúdo não é recomendação de investimento",
  "texto": "Aviso CVM",
  "inicio": "0:05", "duracao": 5,
  "posicao": "base", "slot": 1,
  "ilustrativo": false, "tempo_estimado": true,
  "props": {}
}
```

- O **texto padrão é PROVISÓRIO** ("Conteúdo informativo. Não constitui recomendação ou
  indicação de investimento."). O Matheus/JR confere o texto antes de publicar qualquer vídeo.
  Se o texto oficial mudar, ele entra na prop `"texto"` dentro de `"props"`, só por decisão
  deles — a IA não escreve o texto do aviso.
- `"duracao"` (segundos) e `"duracaoFrames"` (em `"props"`, padrão 150 = 5 s a 30 fps) devem
  contar a mesma história; se mudar um, mude o outro.
- Se outro elemento de `"posicao": "base"` aparecer ao mesmo tempo com o mesmo `"slot"`, o
  validador dá AVISO (não erro).

---

## Exemplo real (plano aprovado no Studio)

`planos/0926.plano.json` é um plano real, já validado e aprovado no Remotion Studio
(composição `PlanoComposicao0926`). Sirva de referência de formato — note o elemento
`terra-terreno-casa`, que usa dois componentes juntos (`PersonagemImagem` +
`LegendaDiscreta`):

```json
{
  "video": "0926",
  "orientacao": "vertical",
  "elementos": [
    {
      "id": "criterio-empresas-boas",
      "componente": "ListaCheck",
      "descricao": "card de frase-chave; 1º de 3 critérios que se acumulam no topo e saem juntos",
      "texto": "Empresas boas",
      "inicio": "0:04", "duracao": 5,
      "posicao": "topo", "slot": 1,
      "ilustrativo": false, "tempo_estimado": true,
      "props": {
        "texto": "Empresas boas", "destaque": "boas", "top": 0.15,
        "corCard": "#0F2A1D", "corTexto": "#F5F0E6",
        "corDestaque": "#EFAF20", "corCheck": "#EFAF20",
        "tamanhoFonte": 0.034, "frameEntradaCheck": 18, "framesSaida": 25,
        "duracaoFrames": 150
      }
    },
    {
      "id": "terra-terreno-casa",
      "componente": ["PersonagemImagem", "LegendaDiscreta"],
      "descricao": "ilustração com legenda — casa-terreno.png",
      "texto": "Terra, terreno, casa",
      "inicio": "0:10", "duracao": 3,
      "posicao": "base", "slot": 1,
      "ilustrativo": false, "tempo_estimado": true,
      "props": {
        "PersonagemImagem": { "imagem": "casa-terreno.png", "top": 0.62, "left": 0.05, "tamanho": 0.28, "duracaoFrames": 90, "framesSaida": 20 },
        "LegendaDiscreta": { "texto": "Terra, terreno, casa", "corTexto": "#F5F0E6", "posicao": "rodape", "duracaoFrames": 90, "tamanhoFonte": 0.024, "sombra": true }
      }
    }
  ]
}
```

(Plano completo, com os 8 elementos, em `planos/0926.plano.json`.)

---

## Depois que a IA devolver o plano

1. Salve o JSON em `planos/<nome>.plano.json`.
2. Rode `node scripts/validar-plano.mjs planos/<nome>.plano.json`.
3. Se houver ERRO, volte pro chat com a mensagem exata do validador (ela já cita o `id`, o
   campo e como corrigir) e peça o ajuste.
4. AVISO não bloqueia, mas vale olhar — pode ser intencional (ex.: colisão de posição
   proposital) ou pode ser um deslize.
