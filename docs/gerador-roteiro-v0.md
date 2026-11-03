# Gerador de prompt-roteiro v0.1 (instruções para o Claude Code)

Arquivo editável. O Matheus ajusta as regras aqui e o Claude Code passa a seguir a nova versão. Ao mudar algo importante, salvar como v1, v2... sem apagar a versão aprovada.

Objetivo: a partir de uma transcrição e dos vídeos brutos, montar um roteiro de edição em Markdown, cena por cena, que o Matheus edita e aprova. O JSON do plano só nasce depois da aprovação. Este arquivo NÃO gera JSON.

---

## 1. Entradas (ler antes de escrever qualquer cena)

1. **Transcrição** com tempo por palavra (videos/<nome>.palavras.json). Se não existir, parar e avisar. Não transcrever sem ordem do Matheus.
2. **Vídeos brutos** em videos/. Um deles é o legítimo (a imagem do JR); no outro será usado só o áudio. Confirme qual é qual olhando os quadros. Se tiver dúvida, pare e pergunte antes de gerar o roteiro. Ver o que aparece de verdade, usando os scripts existentes (extrair-quadros e folha-contato), com um quadro a cada uns 10 segundos. Dizer: qual arquivo tem a voz, qual está mudo, duração, resolução e proporção. Se a proporção não for 16:9 (horizontal) nem 9:16 (vertical), sinalizar como pendência.
3. **docs/kit-visual-video.md**: cores, fontes, tipos de cena, movimentos, checklist.
4. **docs/catalogo-componentes.md**: componentes que existem. Usar só estes. O que faltar vira COMPONENTE NOVO, marcado para aprovação.
5. **Gramática de edição** (claude/gramatica-edicao.md, v0.1, se existir na branch). Se não existir, avisar e seguir sem ela.
6. **public/sfx e public/music**: listar os nomes reais dos arquivos. Nunca inventar nome de SFX ou música.
7. **Pedidos do Matheus**, se houver (seção "PEDIDOS DO MATHEUS" do roteiro ou texto no prompt).

## 2. Regras

**Prioridade:** pedido do Matheus > sugestão sua > padrão da gramática. Tudo o que o Matheus não pediu é "sugerido".

**Conteúdo**
- Todo número, ativo, data ou fato na tela vem da fala ou de fonte indicada pelo Matheus. Sem dado: `[DADO FALTANDO: ...]`. Gráfico ou comparação sem dado real leva "ilustrativo" na tela.
- Fala que soa como promessa de resultado ou afirma algo duvidoso: listar nas pendências com o tempo, sem cortar sozinho e sem escrever na tela.
- Nunca simular movimento de mercado nem recomendar compra ou venda.
- Rosto do JR sempre real.
- O CTA final leva ao Método JR.

**Marca:** seguir o kit. Cores só da tabela de pareamento. Sem `corFundo` nas props. Verde do método só no evento do método. Vermelho só em queda, erro ou alerta, sempre seguido do jeito certo.

**Não excesso:** JR sem nenhum elemento na tela é uma cena válida e comum. No máximo um elemento visual por ideia. Palavra de impacto: no máximo 2 por minuto.

**Decisões em aberto (não decidir sozinho)**
- Aviso legal/CVM: [A DECIDIR com o JR]. Não inserir sem pedido. Listar nas pendências.
- @ do Instagram: só se o Matheus pedir.
- Fontes novas (impacto e capítulo) e vermelho-terra: a aprovar com o JR. Usar como "sugerido" e dizer que dependem da aprovação.
- Zoom: pode sugerir, mas marcar "zoom ainda não validado em render".

**Corte de silêncio (automático):** o projeto já corta pausas e silêncios no meio da fala. Não sugerir esse corte. Mas ele encolhe o vídeo e desloca os tempos, então: (a) descubra no repositório (CLAUDE.md, docs/estado-atual.md, scripts de corte) se os tempos do plano ficam no vídeo original ou no cortado, e diga no roteiro qual convenção você usou; (b) escreva os tempos da transcrição (vídeo original) e diga que são do original; (c) se uma cena depende de uma pausa que o corte removeria (pausa dramática antes de palavra de impacto, por exemplo), sinalize nas pendências com o tempo.

**Cortes de fala:** erros, repetições e trechos que o JR refaz podem ser sugeridos como corte, com o tempo exato e o motivo, como "sugerido". Nunca cortar sozinho.

**Higgsfield:** só indicar as cenas em que um motion criativo faria sentido, como COMPONENTE NOVO ou "Higgsfield", dizendo que o custo não foi medido e que precisa da aprovação do Matheus. Não chamar a API.

**Não fazer:** gerar JSON, renderizar, chamar API paga, instalar nada, alterar scripts ou catálogo, fazer commit.

**Confiança:** nas afirmações estratégicas marcar [Certo] (evidência sólida), [Provável] (inferência forte) ou [Chute]. Se a maior parte for chute, dizer logo no começo.

## 3. Verificação de sincronia entre imagem e áudio

A transcrição vem do áudio do vídeo-fonte do áudio. A imagem vem do vídeo legítimo. Se os dois não estiverem alinhados, toda legenda e todo elemento entra fora de hora e a boca do JR não bate com a voz. Antes das cenas:

1. Compare com ffprobe a duração e o início (start_time) das trilhas dos dois vídeos. Diferença de duração acima de cerca de 0,1 s, ou que cresce ao longo do vídeo, indica deriva.
2. Escolha 5 palavras da transcrição em pontos diferentes (começo, meio, fim), de preferência com a boca abrindo (p, b, m, a). Para cada uma, extraia quadros do vídeo legítimo em t−0,3 s, t e t+0,3 s e veja quando a boca abre.
3. Se o vídeo legítimo tiver trilha de áudio própria, mesmo ruim, compare com o áudio principal para medir o desvio com mais precisão.
4. Relate o desvio estimado em ms por palavra e a conclusão: sincronizado, atrasado X ms, adiantado X ms ou com deriva. A 30 fps cada quadro dura cerca de 33 ms, então é uma checagem visual, não uma prova: diga o grau de certeza.
5. Não corrija sozinho. Se houver desvio, proponha o ajuste em ms como pendência para o Matheus.

## 4. Passos

1. Resumir em até 10 linhas o que viu: vídeos, duração, proporção, qual é o legítimo e qual fornece o áudio, o resultado da verificação de sincronia (seção 3), e os trechos duvidosos da transcrição (palavra incerta, nome, sigla, número).
2. **Análise estratégica** (até 8 linhas): objetivo do vídeo, público, gancho dos primeiros 15 segundos, pontos de retenção, onde o CTA ao Método JR entra.
3. **Roteiro por cena** (formato da seção 5). Uma cena por ideia da fala, não por frase.
4. **Amostra sugerida:** o trecho de 8 a 15 segundos mais representativo para renderizar primeiro (com fala, legenda e um elemento).
5. **Pendências** (decisões do Matheus, dados faltando, promessas na fala, componentes novos, proporção).
6. **Checklist** de 12 itens da seção 10 do kit, cada um marcado com o motivo.
7. Salvar tudo em roteiros/<nome-do-video>.roteiro-v1.md. Parar. Não mexer em mais nada.

Se o Matheus editar o roteiro e pedir uma nova rodada, ler o arquivo editado, manter tudo o que ele marcou ou escreveu, e salvar como roteiro-v2 sem apagar o v1.

## 5. Formato do arquivo de saída

```
# Roteiro — <nome do vídeo> (v1)

Origem: transcrição <arquivo>, vídeos <arquivos>. Duração: <mm:ss>. Proporção: <...>.
Vídeo legítimo: <arquivo>. Áudio: <arquivo>. Sincronia: <resultado e grau de certeza>. Tempos: <do original ou do cortado>.

## PEDIDOS DO MATHEUS
(o Matheus escreve aqui o que quer. O Claude Code deixa em branco.)

## Resumo do que vi
...

## Análise estratégica
...

## Cenas

### C01 · 00:00–00:12 · [ ] aprovar  [ ] ajustar  [ ] cortar
- **Fala (literal):** "..."
- **Origem:** pedido | sugerido
- **Tipo de cena (kit 4.x):** ...
- **Na tela:** componente do catálogo + texto exato + cores das props (do kit)
- **Movimento (kit seção 7):** ...
- **Áudio:** música/SFX (nomes reais das pastas)
- **Por quê:** uma linha de estratégia
- **Dados:** real | ilustrativo | [DADO FALTANDO: ...]
- **Notas do Matheus:**

(repetir para cada cena)

## Cortes sugeridos
- mm:ss–mm:ss: motivo

## Amostra sugerida (8–15 s)
...

## Componentes novos propostos
...

## Pendências
1. ...

## Checklist do kit (seção 10)
1. ☐/☑ ... motivo
```
