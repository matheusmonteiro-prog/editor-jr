---
name: pedido-de-ajustes
description: Use quando o Matheus mandar uma lista de ajustes, correções ou comentários sobre um vídeo ou sobre o kit visual (por texto, áudio transcrito, print ou "no minuto tal"). Registra cada pedido em docs/alteracoes.md, confirma o entendimento e acompanha até ele aprovar.
---

# Receber e acompanhar pedidos de ajuste

O painel é `docs/alteracoes.md`. Ele é a fonte única do que foi pedido e do que falta.

## Ao receber pedidos
1. Quebre a mensagem em **um pedido por linha**: um assunto por pedido. "Diminuir a fonte e trocar
   a cor" são dois pedidos.
2. Para cada um, preencha: número (`A-001`, `A-002`, ... sem reaproveitar número), data, vídeo ou
   peça, tempo no vídeo (mm:ss, se tiver), o pedido **nas palavras dele**, e o que você entendeu em
   termos de arquivo e propriedade.
3. Mostre a lista de volta, curta, e marque as dúvidas. Se um pedido for ambíguo, pergunte só esse
   e siga com os outros.
4. Estado inicial: `novo`.

## Ao trabalhar
- `fazendo` quando começar; `conferir no Studio` quando terminar e o `tsc` passar.
- Só o Matheus muda para `ok`, depois de ver no Studio. Se ele reprovar, volta para `fazendo`
  com a observação dele na coluna "Notas".
- Pedido que mexe numa regra do kit (cor, fonte, posição padrão) também usa a skill
  `ajustar-kit-visual`, para a regra valer nos próximos vídeos.
- Pedido que não dá para fazer: estado `travado`, com o motivo e o que precisa dele.

## No relatório
- Liste os números dos pedidos tocados e o estado de cada um.
