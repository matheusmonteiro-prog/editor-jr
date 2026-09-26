import React from "react";
import {
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Checkmark } from "./components/Checkmark";
import { ColagemCenas } from "./components/ColagemCenas";
import { ComparacaoBarras } from "./components/ComparacaoBarras";
import { GraficoLinha } from "./components/GraficoLinha";
import { TextoDestaque } from "./components/TextoDestaque";

// Roteiro de teste sobre o vídeo real cortado (0926-cortado-v1.mp4). Não é
// componente de catálogo — fica na pasta Testes. Os tempos de cada cena vêm
// do videos/0926.cortes.json (tempos do vídeo ORIGINAL convertidos pro
// vídeo já cortado — ver conversa). Cada cena reserva 15 frames (0,5s) de
// respiro no final, sem nenhum elemento, antes da próxima começar.

const VERDE = "#22C55E";
const CINZA = "#6b7280";
const FONTE = "'Arial Narrow', Arial, sans-serif";

// Fronteira proibida: nada pode aparecer no terço do meio (rosto do JR).
// Zonas um pouco menores que 1/3 exato, de margem de segurança.
const ZONA_TOPO = 0.32; // 0 até 32% da altura
const ZONA_BASE = 0.68; // 68% até 100% da altura

export const TesteRoteiro01: React.FC = () => {
  return (
    <>
      <OffthreadVideo src={staticFile("videos/0926-cortado-v1.mp4")} />

      {/* Cena 1 — 0:00–0:07 original (frame 0–187 cortado) — gancho */}
      <Sequence durationInFrames={172} from={-16}>
        <Cena1Gancho />
      </Sequence>

      {/* Cena 2 — 0:07–0:13 original (frame 187–341 cortado) */}
      <Sequence
        from={188}
        durationInFrames={139}
        style={{
          translate: "-89.2px 0px"
        }}
      >
        <Cena2AtivosReais />
      </Sequence>

      {/* Cena 3 — 0:13–0:19 original (frame 341–483 cortado) */}
      <Sequence from={341} durationInFrames={127}>
        <Cena3InvestirEspecular />
      </Sequence>

      {/* Cena 4 — 0:19–0:24 original (frame 483–633 cortado) — respiro/legenda */}
      <Sequence from={483} durationInFrames={135}>
        <Cena4Legenda />
      </Sequence>

      {/* Cena 5 — 0:24–0:30 original (frame 633–785 cortado) */}
      <Sequence from={633} durationInFrames={137}>
        <Cena5Comparacao />
      </Sequence>

      {/* Cena 6 — 0:30–0:38 original (frame 785–1006 cortado) */}
      <Sequence from={785} durationInFrames={206}>
        <Cena6Grafico />
      </Sequence>
    </>
  );
};

// ---------------------------------------------------------------------
// Ajudantes só desta composição de teste (não são componentes do catálogo)
// ---------------------------------------------------------------------

const LinhaComCheck: React.FC<{
  texto: string;
  palavraChave: string;
  frameEntrada: number;
  top: number;
  opacidadeGrupo: number;
  deslocamentoGrupo: number;
}> = ({
  texto,
  palavraChave,
  frameEntrada,
  top,
  opacidadeGrupo,
  deslocamentoGrupo,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const local = frame - frameEntrada;

  const entrada = spring({
    frame: local,
    fps: 30,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });
  const entradaClamp = Math.max(0, Math.min(1, entrada));
  const translateX = interpolate(entradaClamp, [0, 1], [-160, 0]);
  const opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const partes = texto.split(palavraChave);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: width * 0.07,
          top,
          opacity: opacity * opacidadeGrupo,
          transform: `translate(${translateX + deslocamentoGrupo}px, 0)`,
          backgroundColor: "rgba(10,12,10,0.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: width * 0.012,
          padding: `${width * 0.014}px ${width * 0.028}px`,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: width * 0.034,
            fontWeight: 800,
            fontFamily: FONTE,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {partes[0]}
          <span style={{ color: VERDE }}>{palavraChave}</span>
          {partes[1]}
        </span>
      </div>
      <Checkmark
        x={width * 0.85}
        y={top + width * 0.032}
        tamanho={width * 0.05}
        cor="#ffffff"
        corFundo={VERDE}
        mostrarFundo
        duracaoFrames={172}
      />
    </>
  );
};

const Cena1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  // As 3 linhas saem juntas, subindo com fade, nos últimos frames da cena.
  const saida = interpolate(frame, [145, 172], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deslocamentoSaida = interpolate(saida, [0, 1], [-50, 0]);

  const linhaAltura = height * 0.075;
  const topoInicial = height * 0.08;

  const linhas = [
    { texto: "EMPRESAS BOAS", chave: "BOAS", frameEntrada: 0 },
    { texto: "PREÇO CERTO", chave: "CERTO", frameEntrada: 26 },
    { texto: "LONGO PRAZO", chave: "LONGO", frameEntrada: 52 },
  ];

  return (
    <>
      {linhas.map((linha, i) => (
        <LinhaComCheck
          key={linha.texto}
          texto={linha.texto}
          palavraChave={linha.chave}
          frameEntrada={linha.frameEntrada}
          top={topoInicial + i * linhaAltura}
          opacidadeGrupo={saida}
          deslocamentoGrupo={deslocamentoSaida}
        />
      ))}
    </>
  );
};

const Cena2AtivosReais: React.FC = () => {
  const { width, height } = useVideoConfig();
  const zonaAltura = height * (1 - ZONA_BASE);
  const zonaTop = height * ZONA_BASE;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: zonaTop,
          left: 0,
          width: "100%",
          height: zonaAltura,
        }}
      >
        <ColagemCenas
          corFundo="transparent"
          estiloPolaroid
          cenas={[
            {
              src: "images/cena1.png",
              x: width * 0.08,
              y: zonaAltura * 0.08,
              largura: width * 0.42,
              rotacaoFinal: -6,
              frameEntrada: 8,
            },
            {
              src: "images/cena2.png",
              x: width * 0.48,
              y: zonaAltura * 0.28,
              largura: width * 0.42,
              rotacaoFinal: 5,
              frameEntrada: 45,
            },
          ]}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: zonaTop,
          left: 0,
          width: "100%",
          height: zonaAltura,
        }}
      >
        <TextoDestaque
          texto="ATIVOS REAIS"
          posicao="rodape"
          duracaoFrames={139}
          corTexto={VERDE}
          corFundo="transparent"
          mostrarFundo={false}
          tamanhoFonte={width * 0.028}
        />
      </div>
    </>
  );
};

const Cena3InvestirEspecular: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const entradaInvestir = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 170, mass: 0.6 },
  });
  const opacityInvestir = Math.min(1, entradaInvestir);

  // "Não vou especular" acontece perto do meio da cena — ainda sem
  // transcrição com tempo por palavra, é uma estimativa.
  const frameRisco = 55;
  const progressoRisco = interpolate(
    frame,
    [frameRisco, frameRisco + 18],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacityEspecular = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const topInvestir = height * 0.1;
  const topEspecular = height * 0.19;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: width * 0.07,
          top: topInvestir,
          opacity: opacityInvestir,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: width * 0.06,
            fontWeight: 800,
            fontFamily: FONTE,
            letterSpacing: 1,
            textShadow: `0 0 ${width * 0.02}px rgba(34,197,94,0.65)`,
          }}
        >
          INVESTIR
        </span>
      </div>
      <Checkmark
        x={width * 0.8}
        y={topInvestir + width * 0.045}
        tamanho={width * 0.065}
        cor="#ffffff"
        corFundo={VERDE}
        mostrarFundo
        duracaoFrames={127}
      />

      <div
        style={{
          position: "absolute",
          left: width * 0.07,
          top: topEspecular,
          opacity: opacityEspecular,
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <span
            style={{
              color: CINZA,
              fontSize: width * 0.042,
              fontWeight: 800,
              fontFamily: FONTE,
              letterSpacing: 1,
            }}
          >
            ESPECULAR
          </span>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              height: width * 0.006,
              width: `${progressoRisco * 100}%`,
              backgroundColor: CINZA,
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>
    </>
  );
};

const Cena4Legenda: React.FC = () => {
  const { width, height } = useVideoConfig();
  const zonaAltura = height * (1 - ZONA_BASE);
  const zonaTop = height * ZONA_BASE;

  return (
    <div
      style={{
        position: "absolute",
        top: zonaTop,
        left: 0,
        width: "100%",
        height: zonaAltura,
      }}
    >
      <TextoDestaque
        texto="GUARDAR UM POUCO TODO MÊS"
        posicao="rodape"
        duracaoFrames={135}
        corTexto="#e5e7eb"
        corFundo="transparent"
        mostrarFundo={false}
        tamanhoFonte={width * 0.024}
      />
    </div>
  );
};

const Cena5Comparacao: React.FC = () => {
  const { width, height } = useVideoConfig();
  const zonaAltura = height * ZONA_TOPO;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: zonaAltura,
      }}
    >
      <ComparacaoBarras
        corFundo="transparent"
        valorMaximoEscala={30}
        larguraBarra={width * 0.16}
        alturaMaximaBarra={zonaAltura * 0.45}
        mostrarValores={false}
        legenda="ilustrativo"
        barras={[
          {
            label: "Poupança",
            valorFinal: 6,
            cor: "#4b5563",
            corTopo: "#9ca3af",
            frameEntrada: 0,
            destaque: false,
          },
          {
            label: "Empresa boa",
            valorFinal: 28,
            cor: "#15803d",
            corTopo: VERDE,
            frameEntrada: 40,
            destaque: true,
          },
        ]}
      />
    </div>
  );
};

const Cena6Grafico: React.FC = () => {
  const { width, height } = useVideoConfig();
  const zonaAltura = height * ZONA_TOPO;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: zonaAltura,
      }}
    >
      <GraficoLinha
        titulo="ilustrativo"
        // Valor sem uso visual (mostrarNumero=false esconde o "+XX%"); a
        // forma da linha vem de pontosBaseOscilante, não deste número.
        valorFinal={1}
        corFundo="transparent"
        corLinhaInicio="#4ade80"
        corLinhaFim={VERDE}
        largura={width * 0.85}
        altura={zonaAltura * 0.7}
        frameFimSaida={206}
        mostrarNumero={false}
        rotuloEixoX="ANOS"
        oscilar
        textoFinal="VALORIZOU"
      />
    </div>
  );
};
