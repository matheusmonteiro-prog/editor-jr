# Gerador de roteiro v1 (por etapas)

Instruções para o Claude Code. Arquivo editável: o Matheus ajusta aqui e a nova versão passa a valer.

## Regra principal

Trabalhar em ETAPAS. Cada etapa termina com um arquivo salvo e PARADA. Nunca começar a etapa seguinte sem o Matheus escrever o nome dela (por exemplo "etapa 2"). Nunca gerar JSON, renderizar, fazer commit ou push fora da etapa que manda isso.

Tipo de vídeo: apresentação, fala direta do JR. Pouca firula. Por padrão, o JR sozinho na tela é uma cena válida. No máximo 1 elemento visual por ideia.

## Camada 0: regras fixas (valem em todas as etapas)

1. Prioridade: pedido do Matheus > sugestão sua. O que o Matheus não pediu fica marcado "sugerido".
2. Número, ativo, data ou fato na tela só vem da fala. Sem dado: `[DADO FALTANDO: ...]`. Nada inventado.
3. Fala que soa como promessa de resultado: listar nas pendências com o tempo. Não cortar, não escrever na tela.
4. Nunca simular mercado nem recomendar compra ou venda. Nunca chamar de "sinal de compra": o termo é "evento do método".
5. Marca: cores e fontes do docs/kit-visual-video.md. Todo plano passa as cores explicitamente. Nunca incluir corFundo. Só usar componentes do docs/catalogo-componentes.md. Faltou componente: marcar COMPONENTE NOVO e não criar.
6. Tempos sempre do vídeo ORIGINAL (antes do corte de silêncio automático). Dizer isso no topo de cada arquivo.
7. Aviso CVM, @ do Instagram, logo e fontes novas: não inserir. Só se o Matheus pedir.

## Constantes da gravação (confirmar uma vez, depois reaproveitar)

- Imagem do JR: vídeo legítimo (sem som). Áudio e transcrição: vídeo-fonte do áudio.
- Atraso da imagem em relação ao áudio: ~330 ms [CONFIRMAR no Studio]. Se o setup de gravação mudar, medir de novo. Não corrigir sozinho; propor.
- Limiar de silêncio: -40 dB.
- Grafia do nome / CTA (frase, destino, duração): [PREENCHER]

## Etapa 1: Transcrição em blocos por tema

Entrada: videos/<nome>.palavras.json (se não existir, parar e avisar; não transcrever sem ordem).

Fazer:
1. Ler a transcrição inteira.
2. Separar em BLOCOS por mudança de assunto (não por frase, não por tempo fixo). Pausa longa ajuda a achar a fronteira, mas o critério é o tema. Meta: 5 a 10 blocos para uns 10 minutos.
3. Escrever o arquivo `roteiros/<nome>.etapa1.md`.

Formato do arquivo (um bloco por vez, nesta ordem):

```
# <nome> – Etapa 1 (transcrição em blocos)
Tempos do vídeo original. Duração total: mm:ss. Palavras: N.

## Palavras duvidosas (resumo)
- "como saiu" → proposta (tempo) – motivo

## B1 – <tema em poucas palavras>
Tempo: 00:00.0 – 00:00.0 (duração)
Função na apresentação: gancho | explicação | exemplo | prova | CTA
Resumo: 1 linha
Texto:
<fala corrigida em parágrafos curtos. Palavra duvidosa fica como [palavra?]. Não corrigir em silêncio.>
Notas do Matheus:
(vazio, ele escreve aqui)
```

Regras da etapa:
- Não sugerir nada visual. Só texto, tempos e dúvidas.
- Não cortar nada. Repetição e erro do JR: marcar `[REPETIÇÃO]` ou `[ERRO]` com o tempo, sem apagar.
- Promessas de resultado: marcar `[PROMESSA?]` no texto e listar no fim do arquivo.
- Terminar escrevendo: "Etapa 1 pronta. Corrija o texto e as fronteiras dos blocos. Depois me diga 'etapa 2'."
- PARAR.

## Etapa 2: Elementos por bloco

Entrada: o `etapa1.md` EDITADO pelo Matheus. Manter todas as alterações dele (texto, fronteiras, notas). Se ele mudou algo que você discorda, avisar nas pendências, mas manter a versão dele.

Fazer: criar `roteiros/<nome>.etapa2.md`. Para cada bloco, copiar o texto da etapa 1 e acrescentar:

```
## B1 – <tema>   (tempo)
Pedidos do Matheus (preenche ele):
(vazio)
Elementos (um por ideia, no máximo):
- E1 | tempo início–fim | componente do catálogo | texto exato na tela | motivo em 1 linha | [PEDIDO] ou [SUGERIDO]
Legenda: sim | não (e por quê, se não)
Dados necessários: ok | [DADO FALTANDO: ...]
```

Regras da etapa:
- Primeiro os elementos que o Matheus escreveu em "Pedidos". Eles ficam exatamente como pediu. Só completar o que faltar (tempo, componente).
- Depois, no máximo 1 elemento sugerido por bloco, e só se ajudar a retenção. Bloco sem elemento é normal. Não preencher por preencher.
- Nomes de SFX e música: só os que existem em public/sfx e public/music.
- No fim do arquivo: pendências (dados faltando, promessas, componentes novos, decisões em aberto) e a "janela de amostra" sugerida: 8 a 15 s com fala, legenda e um elemento.
- Terminar escrevendo: "Etapa 2 pronta. Edite os pedidos e os elementos. Depois me diga 'etapa 3'."
- PARAR.

## Etapa 3: Roteiro final (consolidar)

Entrada: o `etapa2.md` EDITADO. Manter tudo que o Matheus escreveu ou mudou.

Fazer: criar `roteiros/<nome>.roteiro-final.md` com a lista corrigida de elementos por bloco, os tempos conferidos (nenhum elemento fora do vídeo, nenhum choque entre elementos) e as props de cores já definidas (card #0F2A1D ou #F5F0E6 chapado; texto #F5F0E6 sobre escuro / #0F2A1D sobre creme; destaque #EFAF20 sobre escuro / #8E4813 sobre creme; verde #1DD41E só no evento do método). Não gerar JSON.

Terminar: "Etapa 3 pronta. Diga 'amostra BX' para eu montar o trecho."
PARAR.

## Etapa 4: Amostra (8 a 15 s)

Só quando o Matheus disser "amostra" e o bloco/janela:
1. Gerar o plano JSON só desse trecho.
2. Rodar `scripts/validar-plano.mjs`. Se falhar, corrigir e rodar de novo; se não resolver, parar e mostrar o erro.
3. Renderizar o trecho.
4. Criar `roteiros/<nome>.amostra-feedback.md` com os campos vazios: "O que ficou bom", "O que ficou ruim (layout, tempo, cor, legenda, outro)", "Ajustes pedidos".
PARAR. Não expandir para o vídeo inteiro.

## Etapa 5: Ajuste e expansão

Só depois do feedback preenchido: aplicar os ajustes à amostra, mostrar de novo. Quando o Matheus aprovar a amostra, aí sim montar o plano completo por blocos, um bloco por vez, validando cada um.

## Não fazer (em nenhuma etapa)

Não chamar API paga (Higgsfield), não instalar nada, não alterar scripts nem catálogo, não apagar versões anteriores (salvar como v2, v3), não publicar. A aprovação do JR é o último passo antes de publicar.
