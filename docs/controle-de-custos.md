# Controle de custos do editor-jr (aula 3 do curso, criado em 14/11/2026)

Para saber **quanto custa cada vídeo aprovado**. Só entra aqui número **confirmado**; o que não sabemos fica
como "preencher", e o Claude **não completa com estimativa** (regra do curso). Valores em dólar ficam em dólar:
a conversão para real só com a cotação que o Matheus confirmar.

## 1. Regras (do curso, adaptadas)
- **Uso da conta e dinheiro são coisas diferentes.** Porcentagem do limite do Claude não vira preço de vídeo.
  Dinheiro = assinatura, créditos de IA e serviços pagos.
- **Custo por vídeo só existe depois de vídeo aprovado.** Hoje não há vídeo final aprovado (o `Video2810V3` e
  os cortes ainda estão em teste), então **não calculamos custo médio**. A conta fica pronta, esperando.
- **Tempo conta.** O curso soma as horas ativas do Matheus a um valor por hora (ele escolhe o valor).
- **Quando gastar crédito de IA:** pedir antes (regra da skill `gerar-midia-ia`) e **anotar a linha aqui logo
  depois**, com o que foi feito, o valor e se o resultado serviu.

## 2. Gastos em dinheiro já feitos (Higgsfield, em US$)

Fonte: `docs/higgsfield/guia.md` e `docs/alteracoes.md` (A-017 e A-019). Valores de tabela da Higgsfield, não do
extrato da conta: o Matheus pode conferir no painel.

| Data | Pedido | O que foi | Valor (US$) | Serviu? |
|---|---|---|---|---|
| 06/11 | A-017 trocar a camisa | Seedance 2.5 video edit, 480p, 4 s | ~1,00 | Funcionou, mas **descartado**: no vídeo inteiro custaria ~US$ 338 |
| 11/11 | A-019 acalmar movimento (só texto) | Kling Omni video edit, 720p, 10 s | ~0,95 | **Não**: trocou o JR por outra pessoa |
| 11/11 | A-019 com 3 fotos do JR | Kling Omni (pro), 720p, 8 s | ~0,76 | **Não**: rosto fiel, mas o movimento não acalmou |
| 11/11 | A-019 cena nova, 1º quadro real | Wan 2.7 image to video, 720p, 9 s | ~0,68 | Teste que acertou o caminho |
| 11/11 | A-019 a mesma cena em 1080p | Wan 2.7, 1080p, ~8,5 s | ~1,01 | **Sim**: aprovada pelo Matheus em 11/11 e usada no `Video2810V3` |
| | | **Total** | **~4,40** | **só ~1,01 ficou no vídeo; ~3,39 foram teste ou descarte** |

Lição de custo: **testar barato antes de gerar caro** (a escolha de 480p e 720p antes do 1080p é o que evitou
gastar mais; o caminho certo só apareceu no 3º teste).

## 3. O que já foi feito sem dinheiro (local)
Tudo abaixo roda no computador do Matheus, sem crédito: **3D** (3 moldes), **recorte de fundo**, **filtro do
rosto**, **voz tratada**, **estilo de papel**, **Cartografia viva**, **cérebros (skills)** e **pesquisa semanal
de engajamento**. O custo real deles é **tempo de render e de espera**:

| Recurso | Tempo de máquina medido |
|---|---|
| Cena 3D de 5 s | ~45 a 60 s de render |
| Recorte de fundo de 10 s | ~3 min de IA + ~4 min de limpeza + ~2 min de render |
| Transcrição (Whisper) | lenta na CPU (sem placa NVIDIA); ver `docs/guia-edicao.md` |

Isso consome o **limite de uso da conta Claude** (não é dinheiro extra), por isso entra na seção 4 como
"uso", e não como preço.

## 4. Planilha por período (preencher; a fórmula já está pronta)

Uma linha por período (mês ou etapa). **Preencher com os valores confirmados**; o Claude só calcula o que tiver
número.

| Período | Assinatura atribuída à edição (R$) | Extras: IA e serviços (US$) | Horas ativas do Matheus | Valor da hora (R$) | Vídeos aprovados | Custo ferramentas por vídeo | Custo total por vídeo |
|---|---|---|---|---|---|---|---|
| 01 a 14/11/2026 | **preencher** | **4,40** | **preencher** | **preencher** | **0** | sem cálculo (0 vídeos) | sem cálculo (0 vídeos) |

**Fórmulas** (as do curso):
- Custo de ferramentas por vídeo = (assinatura + extras convertidos em R$) ÷ vídeos aprovados
- Custo total por vídeo = (assinatura + extras + horas × valor da hora) ÷ vídeos aprovados

**Registro de uso da conta** (separado do dinheiro; o Matheus informa quando quiser): uso no início do período,
uso no fim, modelo e esforço usados, outras tarefas na conta. Prompt do curso: "atualize meu registro usando
somente estes dados confirmados [...] não converta porcentagem do limite em preço por vídeo e não complete dados
ausentes com estimativas".

## 5. Como atualizar
1. **Ao gastar crédito de IA:** nova linha na seção 2 (data, pedido, modelo, valor, serviu ou não).
2. **Ao aprovar um vídeo final:** somar 1 em "Vídeos aprovados" do período e recalcular.
3. **Fim de cada etapa:** o Claude pergunta as horas ativas e o uso da conta; o Matheus responde só o que souber.
4. **Preço de IA que mudou:** conferir no painel antes; `docs/higgsfield/novidades.md` avisa mudanças.
