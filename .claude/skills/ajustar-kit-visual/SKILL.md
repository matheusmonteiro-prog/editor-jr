---
name: ajustar-kit-visual
description: Use quando o pedido mexer numa regra visual do JR que vale para todos os vídeos — cor, amarelo, fonte, tamanho de texto, posição padrão, borda da janelinha, @ do canal, logo, ícones, fundo explicativo, movimento — ou quando o Matheus aprovar ou reprovar uma decisão do kit visual.
---

# Ajustar o kit visual (regra que vale para todos os vídeos)

Uma regra do kit mora em **três lugares**. Mudar só um deixa o projeto desalinhado.

| Onde | O que guarda |
|---|---|
| `docs/kit-visual-video.md` | A regra escrita e o status (decidido, proposto ou chute) |
| `src/components/v2/kitV3.tsx` | Os valores comuns: `KIT` (cores), `FONTE_KIT`, `CURVA`, ícones |
| Peças do kit v3 em `src/components/v2/` | Valores padrão (`.default()` do schema **e** da desestruturação JS) |

## Passos
1. Atualize a tabela "Status das decisões" do kit: quem decidiu e a data. Proposta sua é
   "Proposto", nunca "Decidido".
2. Mude o valor **uma vez** no `kitV3.tsx`. Se a peça repete o valor no `.default()` do zod
   (o Studio exige um valor literal), troque também nas peças: `grep -rn "<valor antigo>" src/components/v2`.
3. As entradas do catálogo no `src/Composition.tsx` têm `defaultProps` literais: troque lá também.
4. `npx tsc --noEmit`, depois abra a demo `KitV3Demo` (pasta `Testes`) para o Matheus ver.
5. Se a mudança afetar um vídeo já montado (ex.: `Video2810V3`), avise. Não renderize de novo
   sem o "ok" dele.
6. Registre no `docs/alteracoes.md` (skill `pedido-de-ajustes`).

## Cuidados
- Cor nova só da paleta do kit (seção 2). Verde do método e vermelho-terra têm uso exclusivo.
- Fonte do vídeo: Montserrat. Fraunces e Inter só nas artes (decisão aberta, ver kit).
- Nunca escrever "validado" sem o Matheus ter visto no Studio.
