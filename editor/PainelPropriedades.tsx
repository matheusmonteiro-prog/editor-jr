import React, { useState } from "react";
import { esquemaJsonDa } from "./esquemasPecas";
import {
  CORES_DA_MARCA,
  camposEditaveis,
  conferirValor,
  ehHexSeis,
  pecasDoElemento,
  valorAtual,
  type Campo,
} from "./regrasPropriedades";
import type { PlanoEditor } from "./regrasPlano";
import { COR, caixaTexto, mensagemErro } from "./tema";
import { rotuloDoCampo, rotuloDoComponente } from "./nomes";

// Campos de TEXTO ou de COR do elemento escolhido (a seção "Texto" ou "Cor" do painel lateral).
// Os campos vêm do schema zod de cada peça. O valor só vai para o plano se for válido; tudo
// passa pelo histórico (desfazer). Quem usa remonta o painel (key) quando o plano muda por fora,
// para limpar os rascunhos.

type Props = {
  plano: PlanoEditor;
  indice: number;
  tipo: "texto" | "cor";
  aoMudar: (indice: number, dentroDe: string | null, campo: Campo, valor: string, digitando: boolean) => void;
};

const rotuloCampo: React.CSSProperties = { display: "block", fontSize: "0.8rem", opacity: 0.85, marginBottom: "0.15rem" };

export const PainelPropriedades: React.FC<Props> = ({ plano, indice, tipo, aoMudar }) => {
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const el = plano.elementos[indice];
  if (!el) return null;
  if (el.props === "a confirmar") {
    return <p style={{ margin: 0, fontSize: "0.85rem" }}>As props de {el.id} estão "a confirmar": nada para editar aqui.</p>;
  }

  const pecas = pecasDoElemento(el);
  const umaSo = pecas.length === 1;
  const porPeca = pecas.map(({ nome, dentroDe }) => ({
    nome,
    dentroDe,
    campos: camposEditaveis(esquemaJsonDa(nome)).filter((c) => c.tipo === tipo),
  }));
  if (porPeca.every((p) => p.campos.length === 0)) {
    return <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8 }}>Esta peça não tem campo de {tipo === "texto" ? "texto" : "cor"}.</p>;
  }

  return (
    <div>
      {porPeca
        .filter((p) => p.campos.length > 0)
        .map(({ nome, dentroDe, campos }) => (
          <div key={nome} style={{ marginBottom: "0.6rem" }}>
            {!umaSo ? <div style={{ fontWeight: 700, color: COR.amarelo, marginBottom: "0.3rem" }} title={nome}>{rotuloDoComponente(nome)}</div> : null}
            {campos.map((c) => {
              const chave = `${nome}:${c.campo}`;
              const atual = valorAtual(el, dentroDe, c);
              const texto = rascunhos[chave] ?? atual;
              const conferido = conferirValor(c, texto);
              const escrever = (valor: string, digitando: boolean) => {
                setRascunhos((r) => ({ ...r, [chave]: valor }));
                if (conferirValor(c, valor).ok) aoMudar(indice, dentroDe, c, valor, digitando);
              };
              return (
                <div key={c.campo} style={{ marginBottom: "0.5rem" }}>
                  <label>
                    <span style={rotuloCampo} title={`nome técnico: ${c.campo}`}>{rotuloDoCampo(nome, c.campo)}</span>
                    {c.tipo === "cor" ? (
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "0.3rem" }}>
                        <input
                          type="color"
                          aria-label={`${rotuloDoCampo(nome, c.campo)} (seletor)`}
                          value={ehHexSeis(texto) ? texto : "#000000"}
                          onChange={(e) => escrever(e.target.value.toUpperCase(), true)}
                        />
                        {CORES_DA_MARCA.map((cor) => (
                          <button
                            key={cor}
                            type="button"
                            title={cor}
                            onClick={() => escrever(cor, false)}
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              background: cor,
                              border: `2px solid ${texto.toUpperCase() === cor ? COR.amarelo : COR.creme}`,
                              borderRadius: "0.25rem",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                    <input
                      aria-label={rotuloDoCampo(nome, c.campo)}
                      value={texto}
                      placeholder={c.tipo === "cor" ? "vazio = padrão da peça" : undefined}
                      style={caixaTexto(!conferido.ok)}
                      onChange={(e) => escrever(e.target.value, true)}
                    />
                  </label>
                  {!conferido.ok ? <div style={mensagemErro}>{conferido.erro} O vídeo continua com "{atual}".</div> : null}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
};
