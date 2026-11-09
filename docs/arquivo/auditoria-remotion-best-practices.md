# Auditoria do vídeo de apresentação com a skill `remotion-best-practices`

Data: 22/10/2026. Branch `video-apresentacao`. **Só leitura.** Nenhum código foi alterado, nada foi renderizado
e nenhum commit foi feito. Cada item abaixo é uma proposta para você aprovar.

## 0. O que foi lido e o que faltou

- **Lido:** `src/VideoApresentacao.tsx`, `src/components/apresentacao/*.tsx` (todos), `src/dados/apresentacao.ts`,
  `src/utils/sfxApresentacao.ts`, `src/Root.tsx` (composição), `src/components/v2/GradeAtivos3D.tsx`, e o guia
  `remotion-markup` da skill, mais os guias de áudio, vídeo, parâmetros e sequências.
- **Não encontrado: `claude/roteiro-video-apresentacao.md`.** A pasta `claude/` não existe. O que mais se parece com
  roteiro é `docs/prompt-roteiro.md`, mas ele é o modelo de pedido de plano de edição do vídeo 0926, não o roteiro
  desta apresentação. Para cruzar texto com tela, usei `src/dados/apresentacao.ts`, que tem as falas, os textos
  de tela e os tempos. **Se o roteiro existir em outro lugar, me diga onde.**
- **Transcrições:** não há transcrição Whisper dos 17 áudios da apresentação. Só existe
  `public/videos/0926.palavras.json`, que é do vídeo 0926. Não gerei nenhuma, como combinado.
- **Achado de contexto:** o `GradeAtivos3D` (400 cubos) **não é usado** no vídeo de apresentação. Ele foi tirado na
  rodada 2 e hoje só está no catálogo do `PlanoComposicao`, que monta o vídeo 0926. Então o alerta de
  "400 cubos redesenhados a cada frame" **não se aplica** a este vídeo.

## 1. Achados MECÂNICOS / BAIXO RISCO (proposta para a próxima rodada)

Mesma natureza do MT1 e do MT2, que já foram aplicados.

| # | Onde | O que a skill recomenda | Por que importa aqui | Sugestão |
|---|---|---|---|---|
| M1 | `src/utils/sfxApresentacao.ts` linhas 40, 49, 96 e 107 | Trocar o `* 30` fixo por `fps` | Já tinha ficado de fora do MT1. Os sons do fecho do bloco 08 e do "MÉTODO JR" ficam com os tempos errados se o fps mudar. | Passar `fps` como parâmetro para `inicioVoltaLogo`, `saidaFechoRelativa`, `eventosSfx` e `inicioCrescerLogo`, e usar o `fps` que vem de `useVideoConfig()` ou de uma constante exportada. |
| M2 | `src/VideoApresentacao.tsx` linha 57 (`const FPS = 30`) e `src/Root.tsx` linha 174 (`fps={30}`) | Uma só fonte de fps | O número 30 está escrito em dois lugares. Se um mudar e o outro não, os tempos saem do lugar. | Ler o fps do `calcularApresentacao`, que já devolve `fps: FPS`, ou manter as duas constantes e comentar que devem ser iguais. |
| M3 | `src/VideoApresentacao.tsx` linhas 497 (`eventosSfx(linha)` em `Camadas`), 636 (`montarLinhaDoTempo` no componente raiz) e 169 (`planoMoedas` em `ConteudoBloco`) | Não recalcular dados fixos a cada frame | Em Remotion, o componente roda de novo **a cada frame**. Esses cálculos são sempre iguais, então estão sendo refeitos à toa. Não medi o custo; deve ser pequeno, mas é desperdício. | Usar `useMemo` com `linha` como dependência. |
| M4 | Quase todos os componentes de `src/components/apresentacao/` | Uma só definição de `clamp` | `const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" }` está copiado em dezenas de arquivos. | Exportar uma vez de `marca.ts` e importar. Não muda nada visual. |
| M5 | `src/components/apresentacao/FundoCenas.tsx` linhas 30 e 279-281 | Código morto | `TINGIMENTO = 0`, então o bloco `TINGIMENTO > 0 ? ... : null` nunca desenha. | Remover o bloco e a constante, mantendo o comentário que explica a decisão da rodada 5. |

**Pendências de exclusão (precisam da sua palavra "apagar"):**
- `src/components/apresentacao/ListaRolando.tsx` e `src/components/apresentacao/LinhaDourada.tsx` não são importados
  em lugar nenhum (lista antiga da rodada 2). Não apago sem o seu "apagar".

## 2. Achados que são DECISÃO MINHA (precisam da sua aprovação)

| # | Onde | O que a skill recomenda | Por que importa aqui | Risco | Sugestão |
|---|---|---|---|---|---|
| D1 | `VideoApresentacao.tsx` linhas 2, 111, 589, 594 e 613 (`Html5Audio`); `FundoCenas.tsx` linhas 8 e 155 (`OffthreadVideo`) | Usar `<Audio>` e `<Video>` de `@remotion/media` | Muda a forma como voz, SFX, música e os clipes de fundo são decodificados. A voz e a música são o que mais precisa de sincronia. Os clipes da cena 1 e da cena 5 usam velocidade reduzida e loop, e isso pode mudar. | **Médio** | A versão 4.0.527 já está em `node_modules` (vem do Studio), mas **não está declarada no `package.json`**. Seria `npx remotion add @remotion/media`. Só depois de você aprovar, e conferindo cena por cena no Studio. |
| D2 | `Img` em `Logo3D.tsx` (linhas 130, 144, 158), `FundoCenas.tsx` (199), `ListaAtivos.tsx` (117) e `Bandeira3D.tsx` (82) | Usar `<CanvasImage>` | `Logo3D` e `Bandeira3D` dependem de CSS 3D (`preserve-3d`, `backfaceVisibility`). **Não sei se `CanvasImage` funciona dentro disso.** Não vou afirmar sem confirmar na documentação oficial. | **Alto** no 3D | **Não trocar** o `Img` do `Logo3D` e da `Bandeira3D` sem teste. Nos outros, avaliar depois. |
| D3 | Filtros caros recalculados a cada frame: `RaiosDeLuz.tsx` linha 38 (`blur` de ~13 px em 4 barras grandes); `FundoCenas.tsx` linha 186 (`blur` por cena, em 8 cenas); `Logo3D.tsx` linha 166 (`drop-shadow` com `brightness` variando); `IconeEtf.tsx` linha 70; `ListaAtivos.tsx` linha 162 (`blur` animado); `mixBlendMode: screen` em `FundoCenas` (71, 106), `BrilhoRadial` (29), `RaiosDeLuz` (19), `GraficoSubindo` (70) e `MarcaCta` (78) | Evitar filtros pesados em tela cheia | Para o desfoque **fixo** das cenas (`DESFOQUE_PADRAO` e `DESFOQUE_TEXTO_LEGIVEL`), dá para gerar uma vez a imagem já desfocada e tirar o filtro do código. O visual fica igual, com menos trabalho por frame. O `blur` da lista (`ListaAtivos`) é animado, então não dá para assar. | **Médio**, com ganho que **não medi** | Medir antes (render de um trecho com e sem filtro). Se ganhar, assar o desfoque fixo das cenas primeiro. |
| D4 | ~70 `transform` escritos como texto (ex.: `FundoCenas.tsx` 37-45, `TextoKinetic.tsx` 176, `MarcaCta.tsx` 84, `Bandeira3D.tsx` 59 e 67) | Usar `scale`, `translate` e `rotate` como propriedades separadas | A skill quer isso para ajustar no Studio. Aqui os valores vêm de cálculo, não de ajuste à mão, então o ganho é pequeno. A **ordem** das transformações muda o resultado. | **Médio a alto** (muito arquivo) | Não fazer agora. Fazer só onde você quiser ajustar valores no Studio. O `Logo3D` já usa `translate:` em um ponto, então o padrão existe. |
| D5 | `src/Root.tsx` linhas 170-179 (composição `VideoApresentacao`, sem `schema`) | Schema zod para editar propriedades no Studio | O `CLAUDE.md` pede propriedades editáveis no Studio. Hoje a edição é pelo arquivo de dados. Isso é uma **lacuna em relação à regra**, não só uma sugestão. | Baixo técnico; decisão de produto | Você escolhe o que expor: a variação do CTA (`VARIACAO_CTA`)? Os textos? Os tempos? Depois eu monto o schema. |

## 3. Conferido e sem achado relevante

- **`staticFile()`:** todo caminho de `public/` passa por `staticFile` (imagens, áudios, SFX, `ativos.json` e logos
  da lista). Nenhum caminho fixo ignora o `staticFile`.
- **`useCurrentFrame()`:** cada componente lê o próprio frame. A `ListaAtivos` renderiza só 11 linhas por vez
  (±5 em torno do centro), não as 15 nem as 400.
- **`interpolate()` sem `clamp`:** aparece só onde a entrada é uma **mola** (`spring`), e o overshoot foi liberado
  na marca (`marca.ts`). Exemplos: `Logo3D` (69), `CardCheckFlip` (58), `TextoRiscado` (47), `Bandeira3D` (39),
  `IconesRedes` (95), `PilulaCta` (42). É intencional. Os demais têm `clamp`.
- **`fps`:** só os pontos de M1 e M2 usam 30 fixo. O resto usa `useVideoConfig()` ou constantes de tempo.
- **Easing:** as animações usam `spring()` e `interpolate()`, dentro do que a skill recomenda.
- **`Sequence` com `name`:** presente, o que ajuda a navegar no Studio.

## 4. Fora do escopo desta auditoria (marca, para tratar à parte)

- Cores fora de `COR` em código: `#FFF1C2`, `#FFF6D8` e `#FFE9A8` (`GraficoSubindo.tsx`), `#1a1a14`
  (`Bandeira3D.tsx`) e `#000` (escurecimento neutro de `FundoCenas.tsx`). São tons neutros ou claros da marca,
  mas não estão no token `COR`.
- **Fraunces** voltou só na chamada do bloco 08. A rodada 4 tinha decidido Inter em tudo.
- Números legíveis no bloco 03 e cores das bandeiras fora da paleta: **já registrados** para o JR aprovar.

## 5. Próximo passo sugerido

1. Você aprova **M1 a M5** (todos mecânicos). Eu aplico e rodo `tsc` e `eslint`.
2. Você decide **D1 a D5**. Para D1 e D3, preciso de sua aprovação antes de medir ou trocar qualquer componente.
3. Você diz onde está o roteiro (`claude/roteiro-video-apresentacao.md` não existe).
