import React from "react";
import { AbsoluteFill, Img, Sequence, Series, staticFile } from "remotion";
import { ArrobaCanal } from "./components/v2/ArrobaCanal";
import { DestaqueSolto } from "./components/v2/DestaqueSolto";
import { TransicaoJanela } from "./components/v2/TransicaoJanela";
import { ComparacaoNumeros } from "./components/v2/ComparacaoNumeros";
import { PainelDiagonal } from "./components/v2/PainelDiagonal";
import { Pauta } from "./components/v2/Pauta";
import { AberturaCapitulo } from "./components/v2/AberturaCapitulo";

// Teste (pasta "Testes"): encadeia os componentes do kit v3 como num vídeo, para o Matheus
// ver o conjunto no Studio. O JR é um quadro parado do v1 de 28/10 (não há vídeo da câmera
// neste PC). Números da comparação são ilustrativos.

const JR = "images/kit-v3/jr-quadro-teste.jpg";

export const KIT_V3_DEMO_FRAMES = 60 + 150 + 120 + 90 + 120 + 75;

export const KitV3Demo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F2A1D" }}>
      <Series>
        {/* 1. JR em tela cheia: @ no canto e um destaque solto */}
        <Series.Sequence durationInFrames={60} name="Tela cheia">
          <AbsoluteFill>
            <Img src={staticFile(JR)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <ArrobaCanal duracaoFrames={60} framesEntrada={0} framesSaida={1} />
          <Sequence from={12}>
            <DestaqueSolto icone="predio" texto="Fundo imobiliário" destaque="imobiliário" duracaoFrames={48} />
          </Sequence>
        </Series.Sequence>

        {/* 2. Transição para a explicação + comparação de números */}
        <Series.Sequence durationInFrames={150} name="Transição + comparação">
          <TransicaoJanela jrSrc={JR} frameTransicao={15} duracaoTransicao={15} frameVolta={138} duracaoVolta={12} duracaoFrames={150}>
            <Sequence from={30}>
              <ComparacaoNumeros duracaoFrames={108} framesSaida={1} />
            </Sequence>
          </TransicaoJanela>
        </Series.Sequence>

        {/* 3. Lista no painel diagonal */}
        <Series.Sequence durationInFrames={120} name="Painel lista">
          <PainelDiagonal
            jrSrc={JR}
            modo="lista"
            rotulo="Onde atuo hoje"
            itens={[
              { icone: "soja", texto: "Soja" },
              { icone: "boi", texto: "Boi" },
              { icone: "grafico", texto: "Bolsa de valores" },
            ]}
            duracaoFrames={120}
          />
        </Series.Sequence>

        {/* 4. Título no painel diagonal */}
        <Series.Sequence durationInFrames={90} name="Painel título">
          <PainelDiagonal jrSrc={JR} modo="titulo" icone="predio" titulo="Vida de cidade" destaque="cidade" duracaoFrames={90} />
        </Series.Sequence>

        {/* 5. Pauta */}
        <Series.Sequence durationInFrames={120} name="Pauta">
          <Pauta duracaoFrames={120} />
        </Series.Sequence>

        {/* 6. Abertura de capítulo */}
        <Series.Sequence durationInFrames={75} name="Capítulo">
          <AberturaCapitulo duracaoFrames={75} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
