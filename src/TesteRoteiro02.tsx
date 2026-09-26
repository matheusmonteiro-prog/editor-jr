import React from "react";
import { OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { ListaCheck } from "./components/v2/ListaCheck";
import { ColagemFotos } from "./components/v2/ColagemFotos";
import { TextoContraste } from "./components/v2/TextoContraste";
import { LegendaDiscreta } from "./components/v2/LegendaDiscreta";
import { BarrasDuelo } from "./components/v2/BarrasDuelo";
import { GraficoCrescimento } from "./components/v2/GraficoCrescimento";

// Mesmo vídeo de fundo e mesmos tempos da TesteRoteiro01 (conversão a partir
// de videos/0926.cortes.json), mas usando os componentes novos de
// src/components/v2/ em vez do catálogo antigo. As duas ficam lado a lado
// pra comparar. Não é componente de catálogo — fica na pasta Testes.

const VERDE = "#22C55E";
const CINZA = "#6b7280";

const ZONA_TOPO = 0.32;
const ZONA_BASE = 0.68;

export const TesteRoteiro02: React.FC = () => {
  return (
    <>
      <OffthreadVideo src={staticFile("videos/0926-cortado-v1.mp4")} />

      {/* Cena 1 — 0:00–0:07 original (frame 0–187 cortado) — gancho */}
      <Sequence durationInFrames={172}>
        <ZonaTopo>
          <ListaCheck
            corFundo="transparent"
            itens={[
              { texto: "EMPRESAS BOAS", destaque: "BOAS" },
              { texto: "PREÇO CERTO", destaque: "CERTO" },
              { texto: "LONGO PRAZO", destaque: "LONGO" },
            ]}
            intervaloFrames={26}
            corTexto="#ffffff"
            corDestaque={VERDE}
            corCheck={VERDE}
            tamanhoFonte={0.034}
            duracaoFrames={172}
          />
        </ZonaTopo>
      </Sequence>

      {/* Cena 2 — 0:07–0:13 original (frame 187–341 cortado) */}
      <Sequence from={187} durationInFrames={139}>
        <ZonaBase>
          <ColagemFotos
            corFundo="transparent"
            fotos={[
              { src: "images/cena1.png", rotacao: -6, frameEntrada: 8 },
              { src: "images/cena2.png", rotacao: 5, frameEntrada: 45 },
            ]}
            etiqueta="Ativos Reais"
            mostrarEtiqueta
            corEtiqueta={VERDE}
            larguraFoto={0.4}
          />
        </ZonaBase>
      </Sequence>

      {/* Cena 3 — 0:13–0:19 original (frame 341–483 cortado) */}
      <Sequence from={341} durationInFrames={127}>
        <ZonaTopo>
          <TextoContraste
            corFundo="transparent"
            textoPositivo="INVESTIR"
            textoNegativo="ESPECULAR"
            corPositivo="#ffffff"
            corNegativo={CINZA}
            frameRisco={55}
            duracaoFramesRisco={18}
            tamanhoFontePositivo={0.06}
            tamanhoFonteNegativo={0.042}
          />
        </ZonaTopo>
      </Sequence>

      {/* Cena 4 — 0:19–0:24 original (frame 483–633 cortado) — respiro/legenda */}
      <Sequence from={483} durationInFrames={135}>
        <ZonaBase>
          <LegendaDiscreta
            texto="Guardar um pouco todo mês"
            corTexto="#e5e7eb"
            tamanhoFonte={0.024}
            posicao="rodape"
            duracaoFrames={135}
          />
        </ZonaBase>
      </Sequence>

      {/* Cena 5 — 0:24–0:30 original (frame 633–785 cortado) */}
      <Sequence from={633} durationInFrames={137}>
        <ZonaTopo>
          <BarrasDuelo
            corFundo="transparent"
            barras={[
              {
                label: "Poupança",
                alturaRelativa: 0.2,
                cor: CINZA,
                destaque: false,
                frameEntrada: 0,
              },
              {
                label: "Empresa boa",
                alturaRelativa: 0.9,
                cor: VERDE,
                destaque: true,
                frameEntrada: 40,
              },
            ]}
            legenda="ilustrativo"
            mostrarLegenda
            larguraBarra={0.16}
            alturaMaxima={0.45}
          />
        </ZonaTopo>
      </Sequence>

      {/* Cena 6 — 0:30–0:38 original (frame 785–1006 cortado) */}
      <Sequence from={785} durationInFrames={206}>
        <ZonaTopo>
          <GraficoCrescimento
            corFundo="transparent"
            corLinha={VERDE}
            rotuloEixoX="ANOS"
            mostrarRotuloEixoX
            textoIlustrativo="ilustrativo"
            mostrarTextoIlustrativo
            textoFinal="VALORIZOU"
            mostrarTextoFinal
            largura={0.85}
            altura={0.7}
            duracaoFramesDesenho={130}
          />
        </ZonaTopo>
      </Sequence>
    </>
  );
};

// Confina o conteúdo ao terço de cima ou de baixo — nunca ao centro, onde
// fica o rosto do JR.
const ZonaTopo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: height * ZONA_TOPO,
      }}
    >
      {children}
    </div>
  );
};

const ZonaBase: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { height } = useVideoConfig();
  const zonaAltura = height * (1 - ZONA_BASE);
  return (
    <div
      style={{
        position: "absolute",
        top: height * ZONA_BASE,
        left: 0,
        width: "100%",
        height: zonaAltura,
      }}
    >
      {children}
    </div>
  );
};
