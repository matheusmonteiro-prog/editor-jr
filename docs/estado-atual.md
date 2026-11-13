> **Fotos antigas (02/10 a 16/10/2026) foram para `docs/arquivo/estado-atual-ate-16-10.md`. Vale o retrato mais novo abaixo.**

## Status das etapas em 10/11/2026 (decisões do Matheus)

Só a marca de cada etapa; vale sobre as listas "Etapas" dos retratos mais antigos abaixo, que ficam como histórico. "Decisão do Matheus" não é "validado": nenhuma prova nova de comando entrou aqui.
- **Etapa 3:** 3a fechada (13/10/2026). 3b aprovada pelo Matheus em 10/11/2026 (teste dele; arquivos não estão neste PC). O que falta será validado por ele na prática, não é pendência. Não é etapa de código.
- **Etapa 4:** aprovada pelo Matheus em 10/11/2026; 4a fechada (14/10/2026). 4b (termos financeiros e glossário em vídeo real) será validada por ele na prática, não é pendência.
- **Etapa 5:** **dispensada por decisão do Matheus em 10/11/2026.** Motivo: o kit visual v3 atende; a cor do método fica `#1DD41E` por decisão dele; a proibição de "sinal de compra" foi desconsiderada por ele, porque no canal o termo é narrativo. Não é bloqueio.
- **Etapa 6:** aprovada pelo Matheus em 10/11/2026; 6a fechada (09/10/2026). AvisoCVM e resolvedor de legenda serão validados por ele na prática. **6b não iniciada**; só começa por ordem do Matheus.
- **Etapa 7:** **em andamento pelo Matheus (confirmado por ele em 13/11/2026)**: o editor visual no branch `editor-visual` (arrastar, soltar, biblioteca, animação) é ideia e trabalho dele; será validado mais à frente. Não fechada.
- **Etapa 8:** por último, por decisão do Matheus (10/11/2026). Pendências técnicas: resolução 2160×3872 (exige `--props` em `Root.tsx`), `render-final.mjs` sem `--props` e sem `--concurrency`, sem critério escrito em `docs/criterios-fechamento.md`.

## Atualização de 13/11/2026: guia do curso, filtro que mede o rosto e 1º teste 3D

- **Curso "Máquina de Edição IA"** (guia do aluno, 79 p.): comparado com o projeto. Já fazíamos quase tudo; faltavam 3D (aula 8.1), recorte de fundo (8.2), variações A/B/C e as skills bônus. Material útil em `referencias/curso-edicao-ia/` (**não vai para o Git**). Skills bônus instaladas: `meia-briefing-de-edicao`, `meia-legendas-e-enquadramento`, `meia-revisao-economia` (as nossas regras valem quando discordarem). Arquivos sem uso foram para a Lixeira do Windows (ordem do Matheus: "o que não tem relevância pode apagar"), incluindo `scripts/zz-bench-tmp.mjs` e os `zz-teste-transcricao.*`.
- **Etapa 7:** confirmada pelo Matheus como trabalho dele em andamento (editor visual).
- **Filtro do rosto (A-021):** regra nova, todo vídeo passa pelo filtro sem o Matheus pedir, com doses medidas no rosto daquele vídeo. `scripts/medir-rosto.py` (novo) + `scripts/rosto-referencia.json` (dia de referência = 28/10) + `--doses` no `filtro-rosto-natural.py`, que agora lê o tamanho real do vídeo (antes amassava vertical). Provas no A-021. **Falta o Matheus ver.**
- **3D de verdade (aula 8.1):** instalados `@remotion/three@4.0.527`, `three@0.186.1`, `@react-three/fiber@9.8.2`, `@types/three@0.186.0`. Composição `Teste3D-Terra-Valorizacao` (pasta "Testes-3D", 5 s, 16:9): fala do JR 159,8–164,8 s, maquete de terra com barras de valorização e poucas moedas de dividendo, abre em 3 camadas e se fecha, JR em moldura chanfrada. MP4: `out/testes-13-11/teste-3d-terra-5s.mp4` (78 s de render, `--gl=angle --concurrency=2`); folha de quadros do próprio MP4: `out/testes-13-11/teste-3d-folha.jpg`. Base de conhecimento: `docs/guia-3d.md` (quando sugerir, receita técnica, checklist). **Falta o Matheus ver e ouvir.** Voz deste MP4 sem a correção dos 42,6 ms.
- Ainda não testados do curso: recorte de fundo (8.2) e variações A/B/C.
- **3D premium, Estudo C (híbrido 2D/3D)**, a partir do prompt "JR 3D Editorial Worlds" do Matheus + pesquisa: composição `Estudo3D-C-Hibrido` (pasta "Testes-3D", 5 s, sem avatar). Diorama procedural (relevo, lavoura instanciada, pasto, estrada, árvores, silos, corte do solo com terra roxa, base grafite, sombra macia) + gráfico 2D de frente com a mesma escala (linha do patrimônio x barras de renda) + pulsos de renda saindo do silo. MP4: `out/testes-13-11/estudo3d-C-hibrido-5s.mp4` (43 s de render); folha: `out/testes-13-11/estudo3d-C-folha.jpg`; antes x depois: `out/testes-13-11/3d-antes-x-depois.jpg`. Regras em `docs/guia-3d.md`, seção 6. Nenhum pacote novo. **Falta o Matheus ver.** Estudos A (CGI cinematográfico, pede Blender) e B (editorial limpo) e a versão clara ainda não feitos.
- **Gráfico de ações no mesmo estilo** (pedido "faz um gráfico para ver como ficaria"): `Estudo3D-Grafico-Acoes`, fala 177,4–182,4 s ("prefiro ações de crescimento do que dividendos"). Candles 3D da ação de crescimento x linha dourada da pagadora de dividendo + dividendos pagos, mesma escala (base 100); câmera chega de lado e para de frente. MP4: `out/testes-13-11/estudo3d-grafico-acoes-5s.mp4`. Regras: `docs/guia-3d.md`, seção 7. **Falta o Matheus ver.**
- **Ideia inicial refeita com os elementos novos** (pedido "gere outro seguindo a ideia inicial porém com os novos elementos"; o vídeo de referência era o 1º teste): `Estudo3D-Terra-Camadas`, fala 159,8–164,8 s. Diorama abre em 3 camadas (solo desce como fatia de terra; quadro de dados sobe e sempre olha para a câmera), pulsos de renda do silo, JR na moldura chanfrada. MP4: `out/testes-13-11/estudo3d-terra-camadas-5s.mp4`. Diorama movido para `src/components/tres/dioramaFazenda.tsx` (Estudo C conferido igual). Regras: `docs/guia-3d.md`, seção 8. **Falta o Matheus ver.**
- **3D APROVADO pelo Matheus (13/11/2026)**, os três moldes (camadas, diorama + cartão, gráfico de ações): "a parte 3D, aprovado praticamente, com o tempo a gente vai lapidando"; entra em vários momentos da edição e nos cortes, quando necessário; fundo segue a identidade. Feito: cores 3D num arquivo só derivado do kit (`src/components/tres/estilo3D.ts`, fundo = `KIT.verde`), conferido em still das 3 cenas (`out/testes-13-11/3d-padrao-kit.jpg`); skill nova `cenas-3d` (o cérebro: se cabe, qual molde, onde, como; princípios do Mayer, ritmo, cortes); kit 4.18; `cortes-curtos`, `editar-video`, catálogo e guia ligados. Pendente: versão vertical dos moldes (cortes) e luz do tema claro.
- **Recorte de fundo (aula 8.2), teste de 13/11/2026 (ordem do Matheus: "pode instalar e testar"):** instalados `@remotion/video-matting@4.0.527` e `@huggingface/transformers@4.2.0` (oficiais, locais, sem custo). Roda só no **navegador** (WebGPU); o caminho de servidor foi **bloqueado pelo Windows** (não contornado). `canUseVideoMatting` = suportado na Intel Iris Xe. Resultado: **JR em tela cheia (28/10, chapéu branco) ficou bom** em fundo claro, escuro e verde (microfone e sobras da borda pedem máscara fixa); **gravação bruta do 26/09 reprovada** (porta escura e mouse entram no recorte). Custo: ~0,6 a 1,05 s por quadro, então só em trechos curtos. Detalhes, regras e como repetir: `docs/guia-recorte-fundo.md`; arquivos em `out/testes-13-11/recorte/` (fora do Git); ferramenta de teste em `scripts/recorte-fundo/`. **Falta o Matheus ver** e o teste do lettering atrás da silhueta no Remotion.
- **Recorte, teste de 10 s com texto atrás do JR (13/11/2026, pedido do Matheus: microfone fora e borda "lisa como fundo verde"):** composição `Recorte-Lettering-10s` (pasta "Testes-Recorte"); MP4 `out/testes-13-11/recorte/recorte-lettering-10s.mp4`. Microfone resolvido recortando a imagem em volta do JR antes da IA; borda lisa com o script novo `scripts/recorte-fundo/limpar-alfa.py` (placa de fundo + borda apertada; meio-transparente 2,45% → 0,97%, tremulação 0,46% → 0,31%). Limite da gravação: aba branca contra parede clara e chapéu branco da estante falham de 0 a 3,3 s (esses segundos ficaram com o quarto original). Recomendação: fundo verde ou parede escura lisa se o recurso for frequente. Detalhes: `docs/guia-recorte-fundo.md`, seção 6. **Falta o Matheus ver.**
- **Recorte, 2ª rodada (13/11/2026):** o Matheus achou que "ficou bacana", mas viu chiado e respingos no chapéu. Causa: furo na aba esquerda que mudava de forma a cada quadro, fiapos na beira da aba e borda "fervendo". `limpar-alfa.py` ganhou tapar furos, estabilizar no tempo (mediana de 3 quadros onde a imagem não se mexe) e alisar o contorno. Medido de 3,3 a 10 s: quadros com furo 181 → 0 de 200; fiapos 48 → 22 px por quadro; tremulação 0,88% → 0,57% da área. Nova versão: `out/testes-13-11/recorte/recorte-lettering-10s-v2.mp4` (a anterior virou `-v1`); comparação em `chapeu-antes-depois.jpg`. **v2 aprovada pelo Matheus em 13/11 (viu o MP4: "Aprovado").** Ainda não entrou em vídeo.
- **Recorte virou recurso do kit (13/11/2026, ordem do Matheus: "pode fazer"):** kit 4.19 (regra visual, status "Aprovado"), skill nova `.claude/skills/recorte-fundo/` (decide SE cabe, QUAL molde, ONDE e COMO; o Claude sugere sozinho no roteiro), linha no `guia-edicao.md` ("Quem chama o quê"), pedido A-022 em `docs/alteracoes.md`. Recorte e 3D dividem o mesmo limite de "ponto alto" (1 a cada ~2 min no longo, 1 por corte; anotado também na `cenas-3d`). Falta: versão vertical para os cortes, JR na frente de cenário 3D (ideia) e o 1º uso num vídeo real.

## Atualização de 12/11/2026 (noite, 7): fluxo padrão dos dois modelos (Etapa 9)

- **Aprovado pelo Matheus ("Aprovo, segue"):** `docs/cortes/fluxo-padrao.md`. (A) 5 a 6 cortes por vídeo de ~15 min, montados em paralelo com o longo a partir da **gravação tratada** (`"tempos": "gravacao"`), com nota de 0 a 10 por trecho (entra com 7+), sem parar no cardápio; modelo por assunto (papel = conceito/campo; Cartografia = Bolsa/comparação; ambiente verde ou branco um por vídeo, no topo da receita); cenas da Cartografia descritas na receita. (B) Os dois modelos entram no longo 16:9 como trechos explicativos, pela peça `TrechoExplicativo`, sem aviso, logo e @ próprios.
- As 3 perguntas do fim do documento (montar sem parar, nota 7, trecho sem aviso) não tiveram resposta separada; ficou valendo a proposta, que foi o que o Matheus aprovou.
- Docs atualizados: skill `cortes-curtos` (reescrita), `docs/guia-edicao.md` (paralelo, trechos explicativos, entrega), `docs/kit-visual-video.md` (4.17 Cartografia viva e quadro "Dois modelos").
- **Código feito no mesmo dia (Matheus: "faça o necessário para finalizar a etapa cortes", cores à escolha do Claude), tudo a VALIDAR por ele no Studio:**
  - `src/cortes/receita.ts`: `tempos`, `ambienteCartografia`, `explicativos`, `cenas` (modelo 2), `enfases`, `legenda.chaves`, `modelo: "papel-camera"`, `enquadramento` por quadro; conferência de cenas.
  - `src/cortes/receitas.ts` (cadastro), `conferirFonte.ts` (vídeo sem fonte ou tempo além da transcrição), `TrechoExplicativo.tsx` (peça do longo).
  - `CorteCartografia.tsx`: cenas lidas da receita (10 peças: candles, lavouraCandles, estratos, marco, regua, talhoes, pontos, frase, texto, carimbo), 16:9 (`formato`), `modoLongo`; sem `cenas` o corte antigo do código continua igual. `CorteDividido.tsx`: `modoLongo`. `CorteDivididoLivre.tsx`: lê `enquadramento`.
  - Receita do 28/10: corte `2810-01d` (Mega-Sena em Cartografia, cenas na receita) e explicativos `2810-balanca` (papel) e `2810-crescimento` (Cartografia). Studio: `Corte-2810-01d`, `Cartografia-2810-01d-16x9`, `Trecho-2810-balanca`, `Trecho-2810-crescimento`.
  - Cor: ambiente padrão de vídeo novo = `verde` (escolha do Claude).
- **Prova:** `tsc` sem erro; `remotion compositions` lista as 4 novas; 8 stills do 9:16, 2 do 16:9 e 3 dos trechos conferidos (cenas, selo, legenda, sem rodapé nos trechos). Receita errada pegou erro de verdade na 1ª tentativa. **Falta o Matheus ver e ouvir.** Nenhum render, nenhum commit; `Video2810V3` intocado.
- **Limites vistos:** (1) a fonte do 28/10 tem legendas gravadas por cima (aparecem na caixa do JR); em vídeo novo, com gravação limpa, some. (2) 16:9 da Cartografia sem as variações `close`/`janela`. (3) cena `alto` ficou com o título abaixo do JR (o antigo ficava acima). (4) `pontos` e `frase` usam só uma cor por peça. (5) A Etapa 9 **não está fechada**: faltam o lote de 5 cortes do 28/10 e o render (ver ARQUITETURA, Etapa 9).

## Atualização de 12/11/2026 (noite, 6): dois modelos e teste de câmera no papel

- Decisão do Matheus: ficam **dois modelos**. Modelo 1 = papel (2810-01b). Modelo 2 = **Cartografia viva** (`src/identidade/CorteCartografia.tsx`), em **verde** ou **branco**, um ambiente por vídeo. Detalhes: `docs/identidade/territorio-proposta.md`, seções 7 e 8.
- Teste novo: modelo 1 com controle de câmera, `Papel-camera-2810-01b`. **A validar pelo Matheus no Studio.**
- Render feito do Território v2: `out/cortes/2026-10-28-corte-01-territorio-v1.mp4` (antes da fusão).

## Atualização de 12/11/2026 (noite, 5): aviso animado e protótipo de identidade própria

- Aviso trocado para "Este conteúdo tem caráter exclusivamente educacional." (maiúsculas), numa barra que sobe nos primeiros ~4 s e no final; no meio sobem logo + @ junto com o sombreado verde. Som suave `public/sfx/papel/aviso-sobe.wav`. Aplicado no `Corte-2810-01b` e no 16:9.
- Pedido do Matheus: buscar identidade própria (texto do ChatGPT analisado). Protótipo **"Território"** em `src/identidade/`, composição `Territorio-2810-01b` (pasta "Identidade-Teste"), mesmo conteúdo do 2810-01b. **Em teste, não aprovado.** Proposta e análise: `docs/identidade/territorio-proposta.md`. O 2810-01b continua o padrão.

## Atualização de 12/11/2026 (noite, 4): corte 01 aprovado, fundo kraft descartado

- Matheus viu o render: **aprovado**, só não gostou do fundo kraft: "deixa como está antes". Receita: `2810-01b` voltou ao papel claro em todos os quadros e está **aprovado**. Os arquivos em `out/cortes/*-v1.mp4` foram renderizados COM o kraft; **não foram renderizados de novo** (ordem dele: "não precisa renderizar"). Para ter o corte final, falta um render novo.
- Mantido: vermelho em sinais, logo e @ embaixo, aviso CVM pequeno e centralizado. Os 2810-02 e 03 continuam em rascunho.

## Atualização de 12/11/2026 (noite, 3): decisões sobre a C, aviso CVM e render

- Matheus: preferiu a **B**; da C fica só o **papel terroso** (kraft) nos quadros do campo. **Vermelho liberado para sinais** (negação, lado que perde, opção recusada, queda). Logo e @ **embaixo** (como na B). **Aviso "Não é recomendação de investimento." bem pequeno, centralizado embaixo do logo e do @**, padrão de todos os cortes e vídeos (nunca num canto).
- Aplicado no `Corte-2810-01b` e no `Explicativo-2810-01b-16x9`: papel de campo nos quadros 2, 4 e 7; vermelho em "NÃO SOU", "dividendo: pouco" e no cartão "dividendos"; aviso no rodapé (prop `aviso`). Estado na receita voltou a "montado" até o Matheus ver o render.
- **Render feito (12/11, ordem do Matheus):** `out/cortes/2026-10-28-corte-01-vertical-v1.mp4` (1080x1920) e `out/cortes/2026-10-28-corte-01-16x9-v1.mp4` (1920x1080); 30 fps, 26,97 s, H.264 + AAC, ~20 MB cada, -14,8 LUFS, pico -3,4 dBFS. Voz puxada 42,6 ms para trás (vídeo copiado sem recodificar), como no vídeo longo; o atraso **não foi medido de novo** nestes arquivos. Quadros conferidos (abertura, meio, fecho). **Falta o Matheus ver e ouvir.**
- Sobras em `out/` (fora do Git; só apagar com ordem do Matheus): `out/cortes/2810-01b-vertical-bruto.mp4`, `out/cortes/2810-01b-16x9-bruto.mp4` (renders antes da correção da voz) e `out/render-public-cortes/` (links dos arquivos usados, sem cópia).
- **Não aplicado (precisa de ordem):** o aviso na tela no `Video2810V3` (vídeo longo já aprovado) e na versão A dos cortes (`CorteCurto`).

## Atualização de 12/11/2026 (noite, 2): versão C com as 5 melhorias e o papel de campo

- Pedido do Matheus: ver as 5 melhorias rápidas e algo do agro. Montada a **versão C** (`Corte-2810-01c` e `Explicativo-2810-01c-16x9`), cópia da 01b com: título no quadro 0, logo e @ no alto do papel, marca-texto, código de cores fixo, sons de papel e papel kraft de "caderno de campo" nos quadros de terra, soja, boi, balança e régua. A 01b aprovada não mudou (tudo ligado por `opcoes` e `papel` na receita).
- Sons novos em `public/sfx/papel/` (fora do Git), gerados com ffmpeg: `papel-desliza.wav`, `carimbo-baque.wav`, `marca-texto.wav`. **Não ouvidos por mim**; volumes 0,4 a 0,55.
- Ajustes no caminho: a 1ª posição do logo (pílula no alto da caixa do JR) cobria o chapéu e a testa, então foi para o papel; o marca-texto passou a pintar linha por linha; o título desce quando há logo no papel.
- Prova: `tsc` sem erro; `remotion compositions` lista as 5 composições de corte (809 quadros cada); stills conferidos nos dois formatos. **Falta o Matheus ver e ouvir.**

## Atualização de 12/11/2026 (noite): versão 16:9, logo e rodapé em degradê

- Pedido do Matheus: o estilo de papel também no vídeo longo; logo perto do @; rodapé verde com menos opacidade, mais escuro embaixo e transparente em cima.
- `src/cortes/CorteDividido.tsx` agora tem `formato` "vertical" ou "horizontal" (a mesma receita serve aos dois). Composição nova `Explicativo-2810-01b-16x9` (1920x1080, 809 quadros), pasta "Explicativos-16x9" no Studio. `QuadroPapel` ganhou rasgo do lado direito; `LegendaFaixa` ganhou `centroX` e `larguraMaxima`.
- Rodapé novo nos dois formatos: degradê verde (0,94 embaixo → 0 em cima) + desfoque leve embaixo + logo original `images/logo-jr.png` + @. Kit 4.16 atualizado (muda a regra "sem logo" para este estilo).
- No 16:9 com a fonte do v1: enquadramento 0,72 (com 0,82 a pílula antiga aparecia no peito). Com gravação limpa, dá para abrir mais.
- Prova: `tsc` sem erro; `remotion compositions` lista as 3 composições de corte; stills conferidos nos dois formatos. **Falta o Matheus ver.**

## Atualização de 12/11/2026 (fim da tarde): estilo explicativo aprovado e padronizado

- Matheus viu o `Corte-2810-01b` no Studio: "Ficou perfeito [...] será bastante usado entre nossas edições do vídeo e também para os cortes". Estado na receita: `aprovado`.
- Padronizado: `docs/kit-visual-video.md` 4.16 (regras e cardápio "fala → desenho", com o que está pronto e o que é ideia); linha nova no "Mapa rápido" do `docs/catalogo-componentes.md`; skill nova `.claude/skills/cortes-curtos/`.
- Próximos possíveis (só com ordem do Matheus): montar 2810-02 e 2810-03 no estilo B; composição 16:9 do papel para o vídeo longo; peças "ideia" (linha do tempo, gráfico com dado real, setas, placas).
- A versão A (`Corte-2810-01`) fica como alternativa; não foi comentada.

## Atualização de 12/11/2026 (tarde): versão B do piloto, estilo explicativo

- O Matheus trouxe um vídeo de referência (tela dividida: quadro de papel com desenhos em cima, apresentador embaixo, legenda em faixa) e um texto do ChatGPT. Análise: a referência é animação por programa, não IA geradora (texto perfeito, peças idênticas entre cenas, sincronia exata); dá para fazer no Remotion sem custo. Do texto do ChatGPT: "Muto" não existe no projeto; pasta paralela `KIT_VISUAL_CORTES_JR/`, nomes em inglês, Rive e Runway descartados; paleta do kit mantida.
- **Montado `Corte-2810-01b`** (mesma fala e duração do 2810-01, 27,0 s): `src/cortes/CorteDividido.tsx` + 10 peças novas em `src/components/cortes/` (`QuadroPapel` com textura e rasgo por código, `EtiquetaAssunto`, `LegendaFaixa` tipo karaokê, `CartaoDocumento`, `Carimbo`, `Balanca`, `Multidao`, `Regua`, `BilheteLoteria`, `estiloCortes.ts`). Fontes gratuitas: Archivo Black (parece a da referência, não confirmado) e Space Mono. Destaque da legenda em verde do método escuro `#1F7A47`.
- Receita: `layout: "dividido"`, `quadros` (o que o papel mostra em cada momento, tempos do vídeo longo) e `quadroFecho`.
- JR embaixo mostra 72% de cima da fonte; rodapé verde com o @ (7,5% da altura) cobre as pílulas antigas do v1 e a área dos botões do app.
- Prova: `tsc` sem erro; `remotion compositions` lista `Corte-2810-01b` (809 quadros); 4 rodadas de stills conferidas (textos cabem, nada cobre o rosto). **Falta o Matheus comparar A e B no Studio.** Nenhum render, nenhum custo.

## Atualização de 12/11/2026: Etapa 9, cortes curtos (piloto)

- Etapa nova aberta por pedido do Matheus (Opus): cortes 9:16 a partir do vídeo validado. Arquitetura em `ARQUITETURA.md`, Etapa 9.
- Vídeo usado: o de 28/10 (`Video2810V3`; o "TESTE 2" aprovado é o render v3b dele). Cardápio de 3 cortes em `docs/cortes/2026-10-28.md`; receita em `cortes/2026-10-28.cortes.json`.
- **Piloto montado:** `Corte-2810-01` "Mega-Sena: compraria terra?" (27,0 s, 1080x1920), na pasta "Cortes" do Studio. 2810-02 e 2810-03 em rascunho (só trechos), esperando o piloto ser aprovado.
- Prova: `npx tsc --noEmit` sem erro; `remotion compositions` lista `Corte-2810-01` (809 quadros); quadros conferidos por `remotion still` (título, legenda, impactos e fecho fora do rosto); Studio abre a composição sem erro no console. **Falta o Matheus ver no Studio.** Nenhum render.
- Achado no caminho: `OffthreadVideo` com `position: absolute` direto no estilo não apareceu no still; dentro de uma div posicionada, apareceu.

## Atualização de 11/11/2026 (noite, 2): vídeo completo e atraso do render

- **Causa achada da voz atrasada:** o render do Remotion sai com a voz **42,6 ms atrasada** em relação à imagem, constante do começo ao fim (medido em 5 pontos; na fonte é ~0). Estava também no exemplo de 40 s. Corrigido no arquivo final puxando o áudio 42,6 ms para trás (ffmpeg, vídeo copiado sem recodificar): medido de novo, **-0,1 ms** nos 5 pontos. **Todo render novo precisa do mesmo passo** até achar a causa dentro do Remotion.
- Filtro "rosto saudável" refeito no vídeo inteiro com rastreio (`rastrear-rosto.py` achou o rosto em 7427/7427 quadros, 978 com zoom; filtro em 6 pedaços paralelos, 33 min). Arquivo novo `public/videos/2026-10-28-final-v1-filtro-natural-v2.mp4` (0 quadros de desvio do original em 9 pontos, incluindo as 5 emendas); `src/Root.tsx` aponta para ele. O arquivo antigo `...-filtro-natural.mp4` ficou sem uso (apagar só com ordem do Matheus).
- Matheus deixou a decisão do teste cego comigo ("decida você"): **nenhum deslocamento extra** além da correção dos 42,6 ms (a fonte está alinhada por medição). A cena da IA (0 a 8,47 s) ficou como está.
- Vídeo completo: `out/video-2810-v3-completo-sinc.mp4` (251,6 s, 7548 quadros, 1920x1080). `out/video-2810-v3-completo.mp4` é o render antes da correção (pode ser apagado com ordem do Matheus). **Falta o Matheus ver.**

## Atualização de 11/11/2026 (noite): sincronia boca x voz

- Matheus (11/11): "o alinhamento da voz com a boca dá impressão de não alinhada, dá para perceber nos cortes".
- **Medido e descartado como causa:** (a) a voz do projeto (`2026-10-28-voz-wpe8-calma20.wav`) está alinhada com o áudio da câmera do v1 nos 247 s (diferença constante de 20 ms, 0 janelas fora); (b) o vídeo filtrado está no mesmo quadro do original nas 5 emendas e em 6 outros pontos (0 quadros); (c) o render, depois da emenda de 8,47 s, mostra os mesmos quadros do filtrado (0 quadros); (d) o código liga a câmera ao tempo do mesmo jeito em todos os componentes.
- **Não medido com segurança:** se o vídeo da câmera do v1 anda atrasado em relação ao próprio áudio, e se a boca da cena gerada pela IA acompanha a voz. Medidores caseiros (abertura da boca, energia do lábio, início da fala depois de pausa) falharam na calibração no vídeo real (resultados de -700 a +500 ms): **não usar**. A frase de 11/11 "boca acompanha a voz sem atraso (0,33)" para a cena da IA **não tem base**.
- **Teste cego** para o Matheus decidir no ouvido e no olho: `out/teste-sincronia/real-1..7.mp4` (JR em tela cheia, 171,5-179,5 s) e `ia-1..7.mp4` (cena gerada), cada um com a voz deslocada de -300 a +300 ms, embaralhados. Gabarito guardado fora do projeto. Falta o Matheus dizer qual número está certo.

## Atualização de 11/11/2026 (tarde): filtro "rosto saudável" e exemplo de 40 s

- **Filtro novo** `scripts/filtro-rosto-natural.py` (local, sem custo), calibrado por medição no visual da cena calma aprovada: menos vermelho e amarelo, tom mais uniforme, pele nítida, olheira natural. O filtro antigo "A" (`scripts/filtro-rosto.py`) amarelava e apagava a olheira: fora de uso.
- `public/videos/2026-10-28-final-v1-filtro-natural.mp4` (vídeo inteiro filtrado) é a câmera padrão do `Video2810V3` (`src/Root.tsx`). **De 2:00 a 3:00 ainda há quadros sem filtro** (JR pequeno na janelinha; o detector falhava).
- **Conserto pronto, ainda não aplicado ao vídeo todo:** `scripts/rastrear-rosto.py` (2 passadas, zoom no rosto pequeno, interpolação sem atravessar corte, entrada/saída suave) + `filtro-rosto-natural.py --trilha`. No trecho 2:00-3:00 achou o rosto em 1800/1800 quadros (antes 0 em boa parte). Rodar só quando o Matheus pedir esse trecho.
- Exemplo para o JR: `out/exemplo-40s-jr-calmo-filtro.mp4` (40 s, 1920x1080, -14,4 LUFS), cortado de `out/exemplo-1min-filtro-natural.mp4`. **Falta o Matheus ver.**

## Atualização de 11/11/2026: teste de movimento na Higgsfield (A-019)

- Com o ok do Matheus, gerei 10 s pelo Kling omni video-edit (720p, ~US$ 0,95). Resultado: **a IA trocou o JR por outra pessoa** (rosto, corpo, chapéu, gola). Inutilizável e contra a regra "o rosto do JR nunca é gerado por IA". Não foi usado em nada.
- Descoberta: `public/videos/2026-10-28-final-v1.mp4` **não é a gravação bruta**; é o render v1, com títulos, logo e painéis. O trecho de teste saiu com esses gráficos.
- Arquivos (fora do Git): `out/testes-11-11/` e `public/videos/cenas/movimento-teste1-kling720.mp4` (+ `.pedido.json`). Só apagar com ordem do Matheus.
- **Substituído no mesmo dia:** os primeiros 8,47 s do `Video2810V3` agora são uma cena nova gerada pela Higgsfield (Wan 2.7, 1º quadro real + voz original, 1080p, ~US$ 1,01 com ok do Matheus): `public/videos/cenas/jr-calmo-wan27-1080.mp4`. Cabeça 3,24 → 1,14 px/quadro; boca segue a voz sem atraso; volta para a gravação no corte seco de 8,47 s. A estabilização abaixo saiu do código (scripts e dados ficaram, sem uso). Base de conhecimento da Higgsfield em `docs/higgsfield/` (catálogo de 84 modelos, guia, novidades), atualizada toda segunda por tarefa agendada. **Aprovado pelo Matheus em 11/11.** Gasto total em teste hoje: ~US$ 3,40.
- (Histórico) **Estabilização sem IA aplicada** (pedido do Matheus, 11/11): `src/Video2810V3.tsx` move a camada da câmera (vídeo + remendo do logo + desfoque) quadro a quadro de 0 a 8,5 s, com zoom até 4,9%, e volta a zero sob o título "Quem é o investidor" (8,5 a 10 s). Os cortes secos do v1 (0,83 s e 5,27 s) continuam cortes. Scripts: `scripts/estabilizar-medir.py` e `scripts/estabilizar-calcular.py` (rodam com `.vc-audio/Scripts/python.exe`). Prova: render dos 11 s em `out/testes-11-11/estab-inicio-11s.mp4` e lado a lado `estab-antes-x-depois.mp4`; sem borda aparecendo de 0 a 8,47 s; `tsc` sem erro. **Falta o Matheus ver no Studio.** Render do vídeo inteiro: não feito.
- Achado: `public/videos/2026-10-28-final-v1.mp4` não é a gravação bruta, é o render v1 (já com cortes secos e gráficos). A estabilização foi feita sobre ele, que é a câmera usada no `Video2810V3`.

## Atualização de 07/11/2026: transcrição mais rápida (`scripts/transcrever.mjs`)

- O script usava só 4 dos 12 núcleos do PC. Agora usa 10 (deixa 2 livres para o Windows). Medido em 180 s da voz do JR: **155 s antes, 86 s agora (1,8x mais rápido)**, com as 471 palavras, o texto e os tempos **idênticos** nos dois.
- Revisão (Opus, 07/11): a mudança ficou mínima. O script continua usando o `transcribe()` do pacote oficial e só passa `-t` (núcleos) por `additionalArgs`. Regra: núcleos do PC menos 2, nunca menos de 4 (num PC de 4 ou 6 núcleos não fica mais lento que antes). Conferido de novo pelo script de verdade: 84 s para 180 s, idêntico ao antigo. Com o PC ocupado (navegador etc.) uma rodada levou 144 s: a velocidade depende do que mais está aberto.
- Testado e **descartado**: dividir o áudio em pedaços e rodar 2 ou 3 whispers juntos. Ganhou só ~10% e **mudou 5-7% das palavras** e deslocou tempos em até 1,4 s. O código disso foi retirado.
- Não testado: faster-whisper (outro motor, precisa instalar e baixar modelo), whisper.cpp mais novo, modelo menor. Só com o ok do Matheus.
- Aguardando o Matheus: apagar `scripts/zz-bench-tmp.mjs` (não funciona mais), `videos/zz-teste-transcricao.palavras.*` e `out/zz-teste-transcricao.16k*.wav` (arquivos de teste desta rodada). Nada commitado.

## Atualização de 06/11/2026 (tarde): testes de roupa, filtro, movimento e voz

- O Matheus aprovou o v3b (salvo por ele como `out/TESTE 2.mp4`). A-002 a A-016 foram para "Feitos".
- Pedidos novos A-017 a A-020 (ver `docs/alteracoes.md`). Amostras em `out/testes-06-11/` (fora do Git), feitas sobre os primeiros 8 s.
- Scripts de teste ainda no rascunho da sessão (não estão em `scripts/`): filtro de pele, segurar cabeça, voz calma. Se aprovados, entram em `scripts/`.
- Instalado no `.vc-audio`: `opencv-python-headless` e `praat-parselmouth` (locais, código aberto).
- Roupa (A-017): travada, falta o ok do JR, o login na Higgsfield e a foto da camisa.

## Atualização de 06/11/2026: render do Video2810V3 concluído

- `out/2026-10-28-final-v3b.mp4`: 1920×1080, 30 fps, 251,6 s, H.264 + AAC, 188 MB, −14,0 LUFS, pico −1,1 dBTP. Inclui os ajustes A-001 a A-016, a voz da amostra 8 e a trilha baixa.
- Fora do Git (pasta `out/`). O `out/2026-10-28-final-v3.mp4` antigo foi mantido.
- Como renderizei: as 2 primeiras tentativas (6 processos) caíram no quadro ~1345 com código 4 e sem erro claro; a 3ª, com `--concurrency=2` e pasta pública pequena (`--public-dir`), terminou sem falha. Suspeita (não confirmada): falta de memória.
- Conferi 12 quadros (0:02 a 4:09) numa folha de contato: impactos, trajetória, janelas escuras e claras, encerramento. **O Matheus aprovou o v3b em 06/11** (arquivo salvo por ele como `out/TESTE 2.mp4`; ver a seção de 06/11, tarde).
## Retrato de 04/11/2026, fim do dia (ajustes A-001 a A-013)

Nada commitado. Pedidos e estado de cada um em `docs/alteracoes.md`; regras novas já no kit.
- **Áudio:** voz da amostra 8 (WPE + tom, −14 LUFS) e trilha "Sertão Caboclo" ~23 dB abaixo. Eco de sala segue como limite (guia 5d). Ferramentas de IA de áudio guardadas (skill `tratar-audio`).
- **Kit:** sem logo; janela com câmera inteira e borda fina; fundo explicativo em movimento; tema claro (bege); faixa do impacto leve + véu sobre texto antigo; fundo da câmera com desfoque leve (`CameraJR`); ponto nas descrições; trajetória da história (`LinhaTrajetoria`); regras de acabamento das transições (4.12).
- **Video2810V3:** todos os ajustes aplicados; conferido por mim em quadros renderizados (`remotion still`). **O Matheus aprovou o v3b em 06/11** (ver a seção de 06/11, tarde). Nenhum render final novo.
- Fora do Git: `public/music/sertao-caboclo-quincas-moreira.mp3`, `public/videos/2026-10-28-voz-wpe8-completa.wav`, `.vc-audio/` (210 MB) e `.vc-enhance/` (~2 GB).

## Retrato de 04/11/2026 (organização da casa)

Branch `video-apresentacao`, HEAD `dfef830`. **Nada commitado nesta sessão**: o Matheus pediu o Git por último.

**Etapas:** sem mudança de marca (Etapa 5 segue em alinhamento). O kit visual v3 foi aprovado no geral ("ficou muito bom"), com ajustes ainda por vir.

**Feito nesta sessão (sem commit):**
- Kit visual v3: `docs/kit-visual-video.md` reescrito; 9 peças novas em `src/components/v2/` (`kitV3.tsx`, `PainelDiagonal`, `TransicaoJanela`, `ImpactoKit`, `AberturaCapitulo`, `ComparacaoNumeros`, `Pauta`, `DestaqueSolto`, `ArrobaCanal`, `FundoExplicativo`), catálogo no Studio e demo `KitV3Demo`.
- `src/Video2810V3.tsx`: vídeo de 28/10 reeditado a partir do render `2026-10-28-final-v1.mp4`. Render em `out/2026-10-28-final-v3.mp4` (251,6 s). **O Matheus ainda não conferiu no Studio**; achados C-001 e C-002 em `docs/alteracoes.md`.
- Teste da troca de camisa (recolorir por segmentação em CPU): funcionou só na cor, ficou de lado. Arquivos em `_para-apagar/`.
- Organização: relatórios antigos em `docs/arquivo/` (com `README.md`); fotos antigas deste arquivo em `docs/arquivo/estado-atual-ate-16-10.md`; mapa rápido no topo do catálogo; `docs/guia-edicao.md` (fluxo completo); `docs/alteracoes.md` (painel de pedidos); 5 skills novas em `.claude/skills/` (`editar-video`, `pedido-de-ajustes`, `ajustar-kit-visual`, `renderizar`, `gerar-midia-ia`); cores da skill `editor-jr` apontando para o `kitV3.tsx`; "Mapa da casa" no `CLAUDE.md`.
- `_para-apagar/` (~1,6 GB, fora do Git): itens inúteis movidos, **não apagados**. Lista em `_para-apagar/LEIA.md`.

**Prova (04/11):** `npx tsc --noEmit` sem erro; `scripts/testar-validador.mjs` 72/72; `npx remotion compositions` lista as 49 composições, incluindo `Video2810V3` (7548 quadros) e `KitV3Demo`.

**Próximo passo:** o Matheus confere o `Video2810V3` no Studio e manda ajustes (vão para `docs/alteracoes.md`). Depois, commit só de arquivos nomeados.

## Retrato de 03/11/2026

Lido no repositório e no git em 03/11/2026, no PC do trabalho (decisão do Matheus: `PC-EDICAO`, `C:\Users\zerob\editor-jr`). Sem abrir o Studio. O que não tem prova de comando está como [NÃO VERIFICADO].

### Branch e HEAD
- Branch `video-apresentacao`, HEAD `168aaad`, igual a `origin/video-apresentacao` (`git status -sb`).
- 42 commits depois de `noite-etapa6` e 152 depois de `origin/main`. A `main` segue em `9432337`.
- `noite-etapa6` local está em `7a28e6c` (`origin/noite-etapa6` está em `98867ec`, 4 atrás); esses 4 commits já estão em `origin/video-apresentacao`.
- Branches que a seção "Branches" abaixo não lista: `video-apresentacao`, `kit-visual-video` (só no remoto), `teste-visao` (só local), `etapa4-legendas` e `backup-stash-0/1` (só no remoto).

### Etapas
Marcas como no `ARQUITETURA.md`. As aprovações são registros de que o Matheus viu; nenhum comando prova isso: [NÃO VERIFICADO] hoje.
- [x] Etapa 0: infraestrutura. Render no WSL deste PC provado em 2 renders curtos (ver "Render WSL").
- [x] Etapa 1: organizar a casa.
- [x] Etapa 2: cortes, gancho e limpeza de voz.
- [x] Etapa 3: 3a fechada (13/10/2026); **3b aberta em 03/11** (par real, sincronia, vídeo de 10 a 20 min, vídeos de referência). Em 10/11: 3b aprovada pelo Matheus; validação na prática, não é pendência.
- [x] Etapa 4: 4a fechada (14/10/2026); **4b aberta em 03/11** (glossário e gravações reais). Em 10/11: aprovada pelo Matheus; 4b será validada por ele na prática, não é pendência.
- [ ] Etapa 5: sem marca no `ARQUITETURA.md`; o `CLAUDE.md` diz "em alinhamento". Existe só o kit visual (sem `LogoAnimada` em `src/`; `public/brand` não existe).
- [x] Etapa 6: 6a cumprida (09/10/2026); **6b não começou** (em 03/11). Em 10/11: aprovada pelo Matheus; AvisoCVM e resolvedor de legenda serão validados por ele na prática; 6b só por ordem dele. `PlanoComposicao0926` segue 2160×3872 (`remotion compositions`).
- [ ] Etapa 7: interface própria.
- [ ] Etapa 8: `scripts/render-final.mjs` existe; ter o script não marca a etapa como iniciada.

### O que mudou desde 16/10
**Vídeo de apresentação**
- Rodadas 1 a 8 registradas em `docs/arquivo/pr-video-apresentacao.md`. **O código vai até a rodada 9** (47 menções em `src/`), e nenhum doc a registra.
- Duração: 2588 quadros (86,27 s), **medida no WSL** (`remotion compositions`).
- Bloco 08 com 3 áudios: `08-resposta-1`, `-2` e `-3-embreve` (`src/dados/apresentacao.ts:397-402`).
- Clipes `a1` a `a4` existem em `public/videos/cenas/`. Bandeiras seguem provisórias em SVG (`apresentacao.ts:285-286`). `VARIACAO_CTA` está em `"a"` (`apresentacao.ts:644`).
- Auditoria de boas práticas: M1 e M5 aplicados (0 ocorrências de `* 30` no sfx e de `TINGIMENTO`); M4 em parte (30 arquivos importam `utils/clamp`; restam cópias em `JurosCompostosLab`, `CamadaVideo`, `GradeAtivos3D`, `LegendaAnimada` e `PlanoComposicao`). Em qual commit e com qual aprovação: [NÃO VERIFICADO].
- 95 stills em `out/stills/apresentacao/`, o mais recente de 26/10.
- Áudios, imagens e vídeos seguem fora do Git (decisão do Matheus), sem cópia no GitHub.

**Higgsfield**
- `scripts/gerar-video.mjs` (desde `a9510f4`; modo imagem, retomar pedido e catálogo em `f5cd6fa`) e `docs/higgsfield.md`.
- `public/images/catalogo-gerados.json` tem 5 entradas. `docs/higgsfield.md:3` diz que nada foi testado contra a API: leitura do código, não o estado de uso.

**Kit visual: duas versões diferentes, nenhuma na branch atual**
- Local, sem commit (`docs/kit-visual-video.md`, alterado em 03/11/2026 às 16:46): título "v3, rascunho de 03/11/2026", verde do método `#39A96B`/`#1F7A47`, com seções novas (6.1, 4.8 a 4.11, 13 e 14).
- Remoto (`origin/kit-visual-video`, `d639758`): título "v2", rodapé "v3: verde do método decidido", verde `#1DD41E`/`#1F7A47` como decisão do Matheus de 02/11/2026, com o zoom de abertura.
- `docs/arquivo/auditoria-contradicoes.md` ("v3 no remoto, v2 local"; verde `#1DD41E`) foi escrito antes dessa alteração local. Qual vale: decisão do Matheus.
- Merge de teste calculado em 03/11/2026 (`merge-tree`, antes dos commits `d4c6390`, `1a4b28e` e `168aaad`): conflitos em `docs/catalogo-componentes.md` e `src/PlanoComposicao.tsx`.

**Configuração**
- `bbe14d7`: `dotenv` 17.3.1 como dependência direta; `.gitignore` libera `videos/0926.cortes.json` e ignora `public/videos/` e `backup-videos/`.
- `79e521c`: versiona `videos/0926.cortes.json`, importado pelo `Root.tsx`. Causa do erro em clone novo removida; **clone novo não testado**.
- `d4c6390`: `docs/higgsfield.md` e `docs/arquivo/auditoria-contradicoes.md`. `1a4b28e`: caminhos dos PCs. `168aaad`: `.gitattributes` com `*.sh text eol=lf`.

**Render WSL**
- `~/render.sh` carrega o nvm e usa `npx --no-install`; cópia em `scripts/render-wsl.sh`; backup em `~/render.sh.bak-03-11-2026`.
- 2 renders de 30 quadros de `CirculoDestaque`, por `bash -ic` e por `bash -lc`: exit 0, h264, 1080×1920, 30 quadros. **Composição completa e `VideoApresentacao` não renderizados.**
- O `rsync` do script exclui `public/videos`, e a cópia do WSL não tem `public/videos/cenas/`: 7 vídeos de cena deram 404 em `remotion compositions`.
- O script fixa `--width 1080 --height 1920`, que ganha do plano.
- Node v24.22.0 (nvm), ffmpeg 8.0.1.

**Validador**
- `scripts/testar-validador.mjs`: 72/72 casos OK. `planos/0926.plano.json`: 0 erro, 0 aviso. `planos/teste-audio.plano.json`: 1 erro, porque `music/musica-teste.mp3` não está neste PC.

### Divergências provadas com as seções abaixo
Linhas de `estado-atual.md` conforme o commit `168aaad`, antes deste retrato.

| Diz | Repositório prova | Prova |
|---|---|---|
| `:5`, `:318`: branch atual `noite-etapa6` | `video-apresentacao`, `168aaad` | `git status -sb` |
| `:328-335`: 4 commits parados sem push | `b42ae1f` está em `origin/noite-etapa6` | `git merge-base --is-ancestor` |
| `:321`: 3 commits de Matheus Monteiro | JR EDICOES 165, Matheus Monteiro 46 | `git log --format=%an` |
| `:39`: última rodada é a 8 | Código vai até a 9 | `grep -i "rodada 9" src docs` |
| `:40-41`: 2465 quadros | 2588, medida no WSL | `remotion compositions` |
| `:39`: falta `08-resposta.mp3` | Código usa 3 áudios, que existem | `apresentacao.ts:397-402` |
| `:41`: faltam clipes A1 a A4 | Existem | `ls public/videos/cenas` |
| `:46`: 4 efeitos mudos | 6 arquivos em `public/audio/apresentacao/sfx`; que tocam: [NÃO VERIFICADO] | `ls`, commit `60be05f` |
| `:44`: 9 stills da rodada 3 | 95, até 26/10 | `ls out/stills/apresentacao` |
| `:38`: M1, M4 e M5 aguardando | M1 e M5 aplicados; M4 em parte | `grep` |
| `:84`, `:141`: sem commit | `8485cf8`; `a048f7e` no remoto | `git log` |
| `:296`: validador 52/52 | 72/72 | `testar-validador.mjs` |
| `:273`: clone novo não compila | `79e521c` versiona o arquivo; clone não testado | `git show --stat` |
| `:298`, `:365`: código 1 por `explorer.exe` no script | Sem `explorer` no script e no backup; 2 renders com exit 0 | `grep -c`, renders |
| `:295`: `musica-teste.mp3` | Não está neste PC | validador |
| `:114`: `C:\Users\edica\Videos` | Este PC não tem usuário `edica` (só `inves` e `zerob`) | `ls /c/Users` |
| `ARQUITETURA.md:48`: Git só no Windows | `~/editor-jr/.git` existe no WSL, em `noite-etapa6`/`98867ec`, com arquivos modificados | `git log` no WSL |
| `ARQUITETURA.md:118`: `explorer.exe` no fim do script | Idem acima | `grep -c` |
| `ARQUITETURA.md:369`: `GraficoSubindo` descartado | Existe em `src/components/apresentacao/` | `ls` |
| `docs/criterios-fechamento.md:100`: `public/brand` vazia | Não existe | `ls` |

### Pendências abertas
**Matheus**
- Qual versão do kit visual vale, e o verde do método (`#39A96B` local x `#1DD41E` no remoto).
- "Sinal de compra" no código e nos docs.
- Merge de `kit-visual-video` (2 conflitos).
- Testar clone novo (compila e abre o Studio).
- Backup de `public/audio/`, `public/images/` e dos vídeos, que estão fora do Git.
- Ver o `VideoApresentacao` no Studio e aprovar. Variação do CTA, PNGs das bandeiras e rodada 9.
- Etapas 3b e 4b (gravações reais). Licença da música.
- `skills-lock.json`, modificado e fora dos commits.
- Levar os vídeos de cena ao WSL, se for renderizar `VideoApresentacao` lá.
- Regras do validador para o kit (proposta da rodada de 03/11/2026).

**Claude Code (quando o Matheus pedir)**
- Registrar a rodada 9 em `docs/arquivo/pr-video-apresentacao.md`.
- `ARQUITETURA.md:48` e `:118`; `criterios-fechamento.md:100`; "34 componentes" em `docs/arquivo/auditoria-contradicoes.md` (são 33 `.tsx` + `marca.ts`).
- Terminar o M4.
- Renomear `aviso-camera-deslocamento` e arquivos com espaço ou extensão dupla (`EM BREVE.mp3`, `musica-fundo.mp3.mp3`, `logo-chapeu.png.png`, `teste-real-camera.mp4.mp4`), se ele aprovar.

### Decisões do Matheus nesta rodada (03/11/2026)
- Este PC é o do trabalho. O caminho do PC de casa fica a confirmar.
- `dotenv` como dependência direta; `videos/0926.cortes.json` versionado; `public/videos/` e `backup-videos/` ignorados.
- `~/render.sh` com nvm e `--no-install`, com cópia versionada e `.gitattributes`.
- `CLAUDE.md` não muda nesta rodada.
- Kit visual, vídeos e merge de `kit-visual-video` não foram mexidos.

---

