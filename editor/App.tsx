import React, { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { PlanoComposicao, type PlanoComposicaoProps } from "../src/PlanoComposicao";
import planoKitV3 from "../planos/teste-kit-v3.json";
import { TabelaElementos } from "./TabelaElementos";
import { aplicarDuracao, aplicarInicio, nomeDaCopia, planoParaTexto, type PlanoEditor } from "./regrasPlano";

// Editor (fatia 2): o Player tocando o plano + tabela de início e duração.
// O Vite roda na raiz do projeto, então public/ é servida em "/" e o
// staticFile("videos/...") do PlanoComposicao vira "/videos/...".
// O plano editado fica SÓ na memória da página. "Baixar cópia" gera um arquivo novo no
// navegador (pasta Downloads); o planos/teste-kit-v3.json original nunca é gravado.

const NOME_PLANO = "teste-kit-v3.json";
const NOME_BASE = "teste-kit-v3"; // o que o servidor recebe: só o nome, nunca caminho
const PLANO_INICIAL: PlanoEditor = planoKitV3;

type Resultado = { tipo: "ok" | "erro"; texto: string };

// Lê a resposta do servidor; se não vier JSON, provavelmente a página foi aberta pelo
// "npm run editor:vite" (sem servidor).
const lerResposta = async (r: Response): Promise<Record<string, unknown>> => {
  try {
    return (await r.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`O servidor do editor não respondeu (código ${r.status}). Abra com "npm run editor".`);
  }
};

const postar = (rota: string, corpo: unknown) =>
  fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

// Salvar: 1) grava a cópia em planos/copias/ (nome gerado pelo servidor) 2) roda o validador nela.
const salvarEValidar = async (plano: PlanoEditor): Promise<Resultado> => {
  const r1 = await postar("/api/copias", { plano: NOME_BASE, conteudo: plano });
  const d1 = await lerResposta(r1);
  if (!r1.ok) throw new Error(String(d1.erro ?? `Erro ${r1.status} ao salvar.`));
  const arquivo = String(d1.arquivo);

  const r2 = await postar("/api/validar", { arquivo });
  const d2 = await lerResposta(r2);
  if (!r2.ok) throw new Error(`Cópia salva em planos/copias/${arquivo}, mas o validador falhou: ${String(d2.erro ?? d2.saida ?? r2.status)}`);
  const codigo = d2.codigo;
  return {
    tipo: codigo === 0 ? "ok" : "erro",
    texto: `Cópia salva: planos/copias/${arquivo}\nValidador (código ${String(codigo)}${codigo === 0 ? ", sem erro" : ", COM ERRO"}):\n\n${String(d2.saida ?? "")}`,
  };
};

const baixarCopia = (plano: PlanoEditor) => {
  const blob = new Blob([planoParaTexto(plano)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeDaCopia(NOME_PLANO, new Date());
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const botao: React.CSSProperties = {
  marginTop: 16,
  padding: "8px 16px",
  font: "inherit",
  fontWeight: 700,
  color: "#0F2A1D",
  background: "#EFAF20",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export const App: React.FC = () => {
  const [plano, setPlano] = useState<PlanoEditor>(PLANO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const salvar = async () => {
    setSalvando(true);
    setResultado(null);
    try {
      setResultado(await salvarEValidar(plano));
    } catch (erro) {
      setResultado({ tipo: "erro", texto: erro instanceof Error ? erro.message : String(erro) });
    } finally {
      setSalvando(false);
    }
  };

  const props: PlanoComposicaoProps = useMemo(
    () => ({
      videoSrc: "videos/0926-cortado-v1.mp4",
      plano,
      // Um único trecho (0 a 37,8 s): tempos do plano iguais aos do vídeo.
      cortes: { trechos: [{ inicio: 0, fim: 37.8 }] },
    }),
    [plano],
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20 }}>Editor JR: {NOME_PLANO}</h1>
      <Player
        component={PlanoComposicao}
        inputProps={props}
        durationInFrames={1134}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        controls
        acknowledgeRemotionLicense
        style={{ width: "100%" }}
      />
      <TabelaElementos
        plano={plano}
        aoMudarInicio={(i, inicio) => setPlano((p) => aplicarInicio(p, i, inicio))}
        aoMudarDuracao={(i, segundos) => setPlano((p) => aplicarDuracao(p, i, segundos))}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" style={botao} disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          style={{ ...botao, background: "transparent", color: "#F5F0E6", border: "1px solid #F5F0E6" }}
          onClick={() => baixarCopia(plano)}
        >
          Baixar cópia (reserva)
        </button>
      </div>
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        "Salvar" grava uma cópia nova em planos/copias/ e roda o validador nela. O plano original nunca é
        gravado. "Baixar cópia" manda o arquivo para a pasta Downloads (reserva, se o servidor não estiver ligado).
      </p>
      {resultado ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: 12,
            borderRadius: 4,
            background: resultado.tipo === "ok" ? "rgba(239,175,32,0.12)" : "rgba(228,87,61,0.18)",
            border: `1px solid ${resultado.tipo === "ok" ? "#EFAF20" : "#E4573D"}`,
          }}
        >
          {resultado.texto}
        </pre>
      ) : null}
    </div>
  );
};
