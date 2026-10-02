# Perguntas pendentes (decisões do Matheus)

Perguntas que não são técnicas — são decisão de conteúdo jurídico, escolha de
ferramenta/biblioteca ou formato de dados — registradas aqui em vez de
respondidas por conta própria.

## AvisoCVM — texto oficial e tempo mínimo em tela (02/10/2026)

Criei o componente `AvisoCVM` (`src/components/v2/AvisoCVM.tsx`) com o texto
vindo só da prop `texto` (nunca fixo no código — ver `ARQUITETURA.md` seção
4, que já diz que o aviso completo vai na descrição do vídeo, não dentro
dele). Duas perguntas em aberto:

1. **Qual é o texto oficial** que o JR usa pra esse aviso, quando aparece
   dentro do vídeo (mesmo que resumido/discreto — a versão completa continua
   só na descrição)?
2. **Existe alguma exigência de tempo mínimo em tela** pra esse aviso (ex.:
   regra de alguma plataforma, ou prática do canal)? O componente hoje usa
   `duracaoFrames: 150` (5s a 30fps) como padrão arbitrário, sem base em
   nenhuma exigência confirmada.
