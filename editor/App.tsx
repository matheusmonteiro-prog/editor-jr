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
const PLANO_INICIAL: PlanoEditor = planoKitV3;

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
      <button type="button" style={botao} onClick={() => baixarCopia(plano)}>
        Baixar cópia
      </button>
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        A cópia vai para a pasta Downloads. Mova para planos/copias/ e rode o validador no terminal.
      </p>
    </div>
  );
};
