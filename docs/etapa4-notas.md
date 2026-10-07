# Etapa 4 — Notas de pesquisa (legendas)

## Certo (li na documentacao)

- A pesquisa respeitou a regra: só pesquisou, não editou, não instalou. Usou WebFetch, o que bate com "só leitura".
- A recomendação é coerente: `@remotion/install-whisper-cpp` com modelo `base` ou `small`, grátis, local, oficial da Remotion.
- Separou certeza de suposição, como pedido.
- Boa sugestão: manter a pasta do modelo fora do Git.

## Nao confirmado

- **Resumo por ferramenta automática.** As páginas foram resumidas por um modelo pequeno. Detalhes como "no Windows só aceita versão numerada, recomendada 1.5.5" e "pacote WebGPU existe da 4.0.518" podem sair errados. Conferir na página `install-whisper-cpp` antes de instalar.
- **Versão do Remotion do projeto.** Não foi checada. `@remotion/install-whisper-cpp` precisa casar com a versão dos outros pacotes `@remotion/*` do `package.json`. É onde instalação costuma quebrar.
- **"Provavelmente roda só na CPU".** É palpite. Significa que a RTX 3060 pode não ser usada. Só dá para saber testando um vídeo curto.
- **Windows nativo vs WSL.** O render usa o `~/render.sh` do WSL. A pesquisa diz que o whisper.cpp tem binário para Windows, mas não diz onde ele deve rodar no fluxo (Windows ou WSL). Decidir antes de instalar, senão instala num lado e o render roda no outro.
- **Pasta fora do Git.** Confirmar que o modelo (centenas de MB) não vai parar no repositório, nem por `.gitignore` esquecido.
- **Falha na abordagem.** A pesquisa respondeu "qual ferramenta", mas não "como isso entra no plano de edição JSON". Falta decidir se a transcrição roda antes do plano (para o Claude já ver o texto) ou depois. Isso muda a arquitetura da Etapa 4 mais do que a escolha do pacote.
- **Próximo passo seguro (teste, sem tocar no projeto):** numa pasta separada fora do `editor-jr`, instalar o pacote, baixar o modelo `base` e transcrever um áudio de 30 segundos. Só depois pensar em integrar.

## Perguntas em aberto

1. Qual a versão do Remotion no `package.json`?
2. O render roda no WSL e o resto no Windows, ou tudo no WSL?
3. Escrever o próximo prompt para o Claude Code (o teste isolado), ou discutir primeiro onde a transcrição entra no fluxo?
