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

## Envio automático pro Google Drive — Etapa 8 (02/10/2026)

`ARQUITETURA.md` já lista "Envio automático do vídeo pronto para o Google
Drive" como parte da Etapa 8, com pré-requisito "autorizar acesso à conta
Google" — não implementado nesta sessão, de propósito (depende de decisão e
autorização do Matheus, não é algo técnico que eu decida sozinho). Duas
coisas em aberto:

1. **Autorização da conta Google** — precisa ser feita pelo Matheus (OAuth),
   não dá pra fazer por mim nesta sessão sem interação.
2. **Qual conector/API usar** — ex.: Google Drive API direta (upload via
   `files.create`), ou algum conector já disponível no ambiente (o Claude
   Code tem um conector de Google Drive, mas ele é pra eu ler/gerenciar
   arquivos nesta conversa, não necessariamente o que o `editor-jr` deveria
   usar em produção, rodando sem mim no meio). Não decidi nenhum dos dois —
   fica pro Matheus escolher quando chegar na Etapa 8 de verdade.
