---
name: editar-video
description: Use sempre que o Matheus pedir para editar, montar, reeditar ou "fazer a v-alguma-coisa" de um vídeo do JR no editor-jr (Remotion) — do vídeo bruto ou de um render antigo até ele conferir no Studio. Também quando ele falar de cortes, gancho, ritmo, painel, janelinha, palavra de impacto ou capítulo num vídeo específico.
---

# Editar um vídeo do JR

Regras gerais (aprovação, Git, formato do relatório) estão no `CLAUDE.md`. Aqui é só o caminho.

## 1. Antes de mexer
- Leia `docs/guia-edicao.md` (o fluxo inteiro) e `docs/kit-visual-video.md` (as regras visuais).
- Leia o "Mapa rápido" do `docs/catalogo-componentes.md`: vídeo novo usa **só as peças do kit v3**.
- Abra `docs/alteracoes.md`. Se houver pedidos abertos para este vídeo, comece por eles.
- Confirme a **fonte da imagem**: gravação limpa (o ideal) ou render antigo com elementos gravados
  por cima (aí só dá para usar a parte limpa: janelinha com recorte, faixa escura, painel cobrindo).

## 2. Montar
- Um arquivo por vídeo em `src/`, no molde do `src/Video2810V3.tsx`: tempos em **segundos da
  linha final**, listas de trechos (`PAINEIS`, `JANELAS`, `IMPACTOS`, ...) e a câmera de base.
- Câmera do JR sempre pela `CameraJR` (fundo desfocado, kit 4.15). Sem logo em nenhuma tela (kit 5).
- Transições: seguir as "regras de acabamento" do kit 4.12 e conferir quadro a quadro cada troca
  (impacto, janela, painel) antes de chamar o Matheus. Fonte com arte antiga gravada: medir quando
  a arte antiga entra e sai e cobrir tudo, sem fade.
- Registrar a composição no `src/Root.tsx`, pasta `Videos`, com `defaultProps` literais.
- Se a composição for mais longa que o vídeo de base, envolver a câmera numa `Sequence` com a
  duração do vídeo (erro real de 04/11: render falhou com exit 2).
- Conteúdo: o método é **mostrado, nunca prometido**. Frase de promessa ou desempenho sem fonte
  fica fora (seção 9 do kit). Avise o Matheus do que ficou fora.
- Densidade (seção 6.1 do kit, frequências ainda são chute): impacto no máx. 2 por minuto, card de
  conceito no máx. 1 a cada ~20 s, destaque solto no máx. 1 a cada ~12 s. Painel nunca vazio > 0,5 s.

## 3. Conferir antes de entregar
- `npx tsc --noEmit` sem erro.
- Tirar quadros dos pontos de troca com `npx remotion still` ou FFmpeg e **olhar** (fantasma de
  texto antigo, quadro vazio, texto encostando na borda).
- Passar o vídeo pela skill `pedido-de-ajustes`: marcar o que fez como "conferir no Studio".

## 4. Parar aqui
- **Não renderizar.** O Matheus sempre quer ver no Studio antes (`npm run dev` → pasta `Videos`).
- Render só depois do "pode renderizar" dele, seguindo a skill `renderizar`.
- Nunca escrever "validado" sem ele ter visto no Studio.
