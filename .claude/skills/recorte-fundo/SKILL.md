---
name: recorte-fundo
description: Use ao montar roteiro, temas ou prompt final de um vídeo do JR, ao editar vídeo longo ou corte, e sempre que a fala tiver UMA palavra-chave forte (patrimônio, dividendo, liberdade, inflação) ou uma tendência simples (sobe, fica parado, cai) que fique melhor "atrás do JR"; também quando o Matheus pedir recorte, tirar o fundo, texto atrás dele ou trocar o quarto. Decide SE cabe o recorte de fundo, QUAL molde, ONDE entra e COMO montar, sem esperar o Matheus pedir.
---

# Recorte de fundo do JR (texto e linha atrás dele)

Aprovado pelo Matheus em 13/11/2026 (teste `Recorte-Lettering-10s`, v2 sem chiado: "Aprovado"; mandou virar
recurso do kit). Regra visual: kit 4.19. Receita técnica e limites: `docs/guia-recorte-fundo.md`.

## 1. A regra que manda em tudo

**O JR continua sendo o centro; o recorte só põe a ideia dele "na parede".** Uma palavra ou uma linha atrás
dele, nunca uma tela cheia de coisas. Se o recorte falhar em algum pedaço (aba do chapéu sumindo, mão
cortada), **aquele pedaço fica com o quarto original**: nunca esconder defeito com efeito.

## 2. Cabe recorte aqui? (perguntar nesta ordem)

1. **A fala tem UMA ideia que cabe numa palavra ou numa tendência?** "o patrimônio", "a inflação come",
   "fica parado", "cai de uma vez". Lista, comparação de vários números ou explicação com partes → **não**
   (use 2D do kit ou 3D).
2. **O JR é o centro do trecho?** Rosto e fala dele importam (opinião, alerta, frase forte). Se a explicação é
   o centro e ele pode sair da tela, prefira o 3D ou a tela explicativa.
3. **Tem tempo?** De 5 a 15 s de fala. Menos que 5 s não paga a espera; mais que 15 s fica caro (~1 s de
   espera por quadro) e cansa.
4. **Já teve ponto alto perto?** Recorte e 3D dividem o mesmo limite: **no máximo 1 dos dois a cada ~2 min**
   no longo e 1 por corte.
5. **A gravação deixa?** (seção 3). Se reprovar, não force: escolha outro trecho ou use outra peça.

Se passou nas 5: marque no roteiro (seção 6).

## 3. A gravação deixa? (checar no trecho antes de prometer)

- **Câmera parada** no trecho (sem zoom, sem estabilização por IA aplicada antes).
- **JR grande no quadro** (tela cheia, enquadramento padrão). JR pequeno no meio do quarto: reprovado (teste A0).
- **Nada escuro e grande encostado no corpo** (porta, moldura, cadeira): a IA leva junto (teste A).
- **Microfone e braço fora** do recorte em volta do JR (recortar a imagem antes da IA resolve).
- **Sem texto ou pílula gravada** no vídeo de origem (render antigo com legenda queimada).
- **Aba branca contra parede clara** e chapéu branco na estante: nesses segundos a aba some. Ou o trecho
  começa depois, ou esses segundos ficam com o quarto original.
- O notebook na frente: cortar acima dele e ampliar a camada (`CORTE_BAIXO` e `ESCALA` no molde).

**Para gravar pensando em recorte:** fundo verde ou parede lisa escura (o recorte vira instantâneo e
perfeito); sem isso, tirar o chapéu branco da estante de trás e o notebook da frente.

## 4. Mapa fala → molde

| Gatilho na fala | Molde | Estado |
|---|---|---|
| Conceito-chave numa palavra ("o patrimônio", "liberdade", "inflação") | **Palavra gigante atrás do JR** (sobe e as letras se juntam na palavra falada) | pronto (`RecorteLettering`) |
| Tendência: "estável", "sobe", "desvaloriza aos poucos", "cai de uma vez" | **Linha passando atrás do corpo** (verde reta, depois cai em vermelho) | pronto (`RecorteLettering`) |
| Virada no discurso ("agora presta atenção", começo de capítulo) | **O quarto some** e o JR fica no fundo da identidade | pronto (`RecorteLettering`) |
| JR falando da fazenda, da terra | JR na frente de um cenário 3D do kit (`dioramaFazenda`) | ideia, **não testado** |
| Antes e depois, dois cenários | Troca de fundo atrás do JR (quarto → fundo explicativo 2.1) | ideia, **não testado** |

A palavra de trás: até ~10 letras, e que continue legível com ~2 letras escondidas pela cabeça; a legenda
embaixo confirma. Nunca número, percentual ou promessa atrás do JR sem fonte.

## 5. Encaixe por estilo de edição

- **Vídeo longo 16:9:** trecho próprio de 5 a 15 s; entra e sai pelo quarto original (o quarto some e volta),
  sem corte seco.
- **Papel (4.16) e Cartografia (4.17):** não misturar; o recorte é trecho próprio, antes ou depois.
- **Cortes 9:16:** cabe 1 por corte, no momento mais forte. **Ainda não existe versão vertical** (palavra de
  trás em duas linhas, área segura do vertical). Fazer e mostrar ao Matheus antes do 1º corte com recorte.
- **3D:** recorte e 3D não ficam colados; dividem o limite (seção 2, item 4).

## 6. Como escrever a sugestão no roteiro (sem o Matheus pedir)

> **Recorte aqui, T3 (2:46–2:56):** "o patrimônio vai se manter ali estabilizado, desvalorizando aos poucos"
> → *palavra atrás* PATRIMÔNIO + *linha atrás do corpo* (estável → cai). Gravação ok (câmera parada, JR em
> tela cheia); aba some até 2:49 → começa no quarto. Conceitual (selo). Espera ~7 min para 10 s.

Mais candidatos que o limite: escolher o mais forte e listar o resto como "reserva".

## 7. Como montar (resumo; detalhes em `docs/guia-recorte-fundo.md`)

1. Tempos das palavras na transcrição (`videos/*.palavras.json`); cada animação presa a uma palavra.
2. Cortar o trecho em MP4 sem áudio, já recortado **em volta do JR** (tirar microfone e cantos).
3. Recorte pela IA **no navegador** (`scripts/recorte-fundo/`, servidor em 127.0.0.1:3901, ~0,6 s por quadro).
   O caminho pelo Node é bloqueado pelo Windows: não contornar.
4. Limpar: `.vc-audio/Scripts/python.exe scripts/recorte-fundo/limpar-alfa.py entrada.mp4 ia-foreground.webm saida.webm`
   (placa de fundo, tapa furos, mediana no tempo, contorno liso; ~4 min para 10 s). Saída em
   `public/videos/recorte/` (fora do Git; nunca commitar vídeo).
5. Copiar `RecorteLettering.tsx`, trocar fala, palavra, linha, tempos e o trecho em que o quarto some.
6. Conferir em zoom (chapéu, mãos, beira de baixo) sobre fundo claro e escuro **no MP4**, quadros seguidos:
   defeito que muda a cada quadro vira "chiado" (lição de 13/11).
7. Mostrar ao Matheus antes de encaixar no vídeo final. Reaproveitar o alfa aprovado: mexer em texto,
   posição e tempo não pede refazer o recorte.

## 8. Checklist

- [ ] Passou nas 5 perguntas da seção 2 e na gravação (seção 3).
- [ ] Uma ideia só atrás do JR; palavra legível com a cabeça na frente.
- [ ] Sem microfone, sem furo, sem fiapo, sem borda "fervendo" (zoom em quadros seguidos).
- [ ] Onde o recorte falha, quarto original; troca sem pulo.
- [ ] Cada animação presa a uma palavra; legenda embaixo.
- [ ] Selo se for conceitual; cores do kit.
- [ ] Limite de ponto alto respeitado (recorte + 3D).
