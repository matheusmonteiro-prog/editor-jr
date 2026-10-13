# Etapa 4 — Notas (legendas e transcrição)

Testes de 08/10/2026; atualizado em 13/10/2026. Os testes rodaram numa pasta fora do projeto (`C:\whisper-teste`), no PC do trabalho, com o `teste-jr.mp4` original (2:42, 1080p). Nada disso entrou no `src/` nem no `scripts/`.

## a) Confirmado

Cada item tem a fonte. "Pacote instalado" = `@remotion/install-whisper-cpp@4.0.527` e `@remotion/captions@4.0.527`, lidos em `node_modules` (não alterado).

- **Tipo `Caption`** tem `text`, `startMs`, `endMs`, `timestampMs`, `confidence` e `pageBreakAfter?`.
  Fonte: `node_modules/@remotion/captions/dist/caption.d.ts` (4.0.527). A página online `remotion.dev/docs/captions/caption` deu 404.
- **Função que converte a saída do Whisper em `Caption[]`: `toCaptions({ whisperCppOutput })`**, que devolve `{ captions }`. A `convertToCaptions` existe, mas está marcada como obsoleta desde a v4.0.216.
  Fonte: pacote instalado, `dist/index.d.ts` e `dist/to-captions.d.ts`.
- **No Windows o pacote baixa um binário pronto** (não compila). Só aceita versão numerada, e a doc diz que não há binário acima de 1.6.0. O `transcribe()` pede whisper.cpp 1.5.5 ou mais. Faixa usada: **1.5.5 a 1.6.0**. Testado com a 1.6.0 (zip de 2.249.966 bytes).
  Fonte: doc `remotion.dev/docs/install-whisper-cpp/install-whisper-cpp` e `transcribe`; código em `dist/install-whisper-cpp.js`.
- **Áudio de entrada: WAV 16 kHz, 16 bits, mono** ("The file has to be a 16-bit, 16KHz, WAVE file").
  Fonte: doc `remotion.dev/docs/install-whisper-cpp/transcribe`. Gerado com o ffmpeg completo do PATH (`-ac 1 -ar 16000 -c:a pcm_s16le`).
- **Modelos `base` e `small` são multilíngues** (o JSON do `small` registra `multilingual: true`). **O padrão do `transcribe()` é `base.en` (só inglês)**, então é preciso passar `model` e `language: "pt"`.
  Fonte: doc `transcribe` (padrão `base.en`); `saida-bruta-small.json` (`multilingual: true`, `lang: pt`).
- **`--prompt` funciona via `additionalArgs`** (`['--prompt', '...']`): foi aceito sem erro novo, e o resultado do texto mudou. O efeito sobre termos financeiros **não está confirmado** (ver seção d).
  Fonte: `dist/transcribe.d.ts` e `dist/transcribe.js` (`additionalArgs` é repassado ao `main.exe`); `main.exe --help` lista `--prompt`; logs dos testes.
- **O pacote gera o aviso inofensivo `error: input file not found 'true'`**, porque passa `['--split-on-word', true]` e o `true` sobra como argumento. A transcrição sai normal.
  Fonte: `dist/transcribe.js` (linha do `splitOnWord`); apareceu em todos os testes, com `rc=0`.
- **Requisitos de compilação (fora do Windows):** a doc diz que `cmake` é exigido do whisper.cpp 1.7.3 em diante. O WSL deste PC tem só `git`; **não tem** `gcc`, `g++`, `make` nem `cmake`. O Node do WSL existe em `~/.local/node` e só aparece em shell interativo (PATH no `~/.bashrc`).
  Fonte: doc `install-whisper-cpp`; comandos rodados no WSL em 08/10/2026.
- **Hardware deste PC:** Intel Iris Xe e i7-1355U (12 threads lógicas); sem placa NVIDIA.
  Fonte: `Get-CimInstance Win32_VideoController` e `Win32_Processor`.

## b) Resultados dos testes

Todos com `language "pt"`, `tokenLevelTimestamps true`, `splitOnWord true`, na CPU.

| Teste | Tempo | Razão tempo/áudio |
|---|---|---|
| `base`, trecho de 30 s | 8,99 s | 0,30x |
| `small`, trecho de 30 s | 33,2 s | 1,1x |
| `small`, trecho de 30 s, com prompt | 27,45 s | 0,9x |
| `small`, áudio inteiro (2:42), sem prompt | 138,1 s | 0,85x |
| `small`, áudio inteiro (2:42), com prompt | 121,6 s | 0,75x |

- Prompt usado: `Selic, Tesouro Direto, renda fixa, CDB, IPCA, CDI, dividendos, investimento`.
- No áudio inteiro, sem prompt: **38 de 378 palavras (10,1%) com `confidence` menor que 0,5**.
- **Nenhum termo financeiro do prompt apareceu** no texto, nem sem prompt nem com prompt. Termos que apareceram nas duas versões: investir, poupança, ação, Apple.
- Com o prompt, o texto ficou com 362 palavras contra 378 sem prompt: **o prompt omitiu hesitações** ("né", traços) e **trocou algumas palavras** (33 trechos diferentes entre as duas versões; por exemplo "pra" por "para", "comprar uma medalha" por "compra um pedaço").
- Nenhuma caption passou da duração do áudio inteiro (maior `endMs` = 162.440 ms, contra 162.515,7 ms de áudio). No trecho de 30 s, a última caption terminou em 30.360 ms, acima dos 30.000 ms do áudio.
- Entre `base` e `small` (trecho de 30 s, 46 de 61 palavras iguais), o `small` escreveu "Apple", "início de compra" e "de uma ação" onde o `base` escreveu "eipô", "gínio se compro" e "do maçã".

## c) Decisões do Matheus

Só o que o Matheus decidiu. Propostas do revisor ficam em c2.

- A legenda **só entra quando o plano pedir**.
- A **maioria dos vídeos longos não terá legenda**; o uso é em **cortes curtos (~30 s)**.
- Texto **branco por padrão**; creme da marca `#F5F0E6` como alternativa, **a decidir**.
- **Contorno chapado escuro** no texto, **sem blur**.
- **Palavras em destaque** vêm de uma **lista no plano**; a **cor de ênfase** é uma das cores da marca (`#0F2A1D`, `#F5F0E6`, `#EFAF20`), **escolhida por vídeo**.
- Fonte **Inter**.
- Testar em **vertical e horizontal**, com o **rosto do JR sempre livre**.
- O **Whisper local é prioridade**, porque hoje não há programa que gere transcrição com tempo.
- Os **erros do Whisper são corrigidos automaticamente**, com **correção personalizável por ele** (alcance a definir).

## c2) Propostas do revisor, NÃO confirmadas

Ainda não são decisão do Matheus.

- Modelo **`small` sem prompt** como padrão.
- **Uma transcrição por vídeo**, com o JSON guardado.
- **Nunca limpar a fala do JR.** Atenção: isso pode entrar em conflito com a decisão acima de corrigir erros do Whisper automaticamente; o alcance da correção está por definir.

## d) Em aberto (não confirmado)

Inclui avaliações e dúvidas. Nada daqui é fato.

1. Qual versão do texto está certa em cada diferença entre sem prompt e com prompt (falta ouvir os trechos).
2. Se o vídeo de teste realmente fala Selic, CDB, Tesouro etc., já que nenhuma versão os transcreveu.
3. Se o `--prompt` ajuda com termos financeiros (não foi testado num trecho que os cite).
4. Qual tempo é mais confiável: `startMs` ou `timestampMs`. A comparação feita nas 6 pausas do trecho de 30 s é **inconclusiva (método fraco)**.
5. A precisão dos tempos no vídeo inteiro (só se viu que nada passa do fim).
6. Se as 38 palavras de baixa confiança estão de fato erradas.
7. A velocidade em vídeo longo (10 a 20 min); a medição foi só em 2:42.
8. GPU: este PC só tem vídeo Intel, e não há prova de uso de GPU.
9. Funcionamento e compilação do whisper.cpp no WSL (faltam `gcc`, `g++`, `make`, `cmake`).
10. Respondido em 13/10/2026: hoje não existe programa que gere transcrição com tempo (por isso o Whisper local é prioridade).
11. Como o `naPalavra` vai ler o JSON de captions (nenhum código do projeto o lê ainda).
12. Modelos `medium` e `large`: não testados.
13. Se o pacote exige a mesma versão do Remotion (4.0.527); foi instalado nessa versão e funcionou, mas a doc não afirma a exigência.
14. Sobre a versão do binário: não vi o número da versão escrito no executável; usei `1.6.0` no `whisperCppVersion`.
