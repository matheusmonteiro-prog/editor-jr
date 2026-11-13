import React from "react";
import { z } from "zod";
import { aleatorio, COR_CORTE } from "./estiloCortes";

// Quadro explicativo de papel (versão B dos cortes): textura de papel feita por código (sem imagem)
// e borda de baixo rasgada, com uma segunda camada mais clara por baixo (a "fibra" do rasgo).

export const quadroPapelSchema = z.object({
  largura: z.number().default(1080),
  altura: z.number().default(900),
  // Altura do recorte irregular, em px.
  alturaRasgo: z.number().min(0).max(80).default(26),
  semente: z.number().default(7),
  // De que lado fica o rasgo: "baixo" (corte 9:16, papel em cima) ou "direita" (16:9, papel à esquerda).
  lado: z.enum(["baixo", "direita"]).default("baixo"),
  // "relatorio": papel claro (Bolsa, conceitos). "campo": papel kraft de caderno de campo, com pauta
  // fraca (assuntos do agro: terra, soja, boi). Mesmo rasgo nos dois (mesma semente).
  tema: z.enum(["relatorio", "campo"]).default("relatorio"),
});
type Props = z.input<typeof quadroPapelSchema>;

// Polígono do papel com a borda irregular embaixo; no lado "direita", o mesmo desenho girado
// (x e y trocados), com a borda irregular à direita.
const bordaRasgada = (comprimento: number, profundidade: number, amplitude: number, semente: number, passo: number, direita: boolean) => {
  const p = (a: number, b: number) => (direita ? `${b.toFixed(1)},${a.toFixed(1)}` : `${a.toFixed(1)},${b.toFixed(1)}`);
  const pts: string[] = [p(0, 0), p(comprimento, 0)];
  for (let a = comprimento; a >= 0; a -= passo) {
    const b = profundidade - amplitude + aleatorio(semente + a * 0.37) * amplitude;
    pts.push(p(a, b));
  }
  return pts.join(" ");
};

export const QuadroPapel: React.FC<Props> = ({ largura = 1080, altura = 900, alturaRasgo = 26, semente = 7, lado = "baixo", tema = "relatorio" }) => {
  const campo = tema === "campo";
  const id = `${tema}-${lado}`;
  const direita = lado === "direita";
  const comprimento = direita ? altura : largura;
  const profundidade = direita ? largura : altura;
  const fibra = bordaRasgada(comprimento, profundidade + alturaRasgo * 0.45, alturaRasgo, semente + 101, 9, direita);
  const papel = bordaRasgada(comprimento, profundidade, alturaRasgo, semente, 7, direita);
  const wSvg = direita ? largura + alturaRasgo : largura;
  const hSvg = direita ? altura : altura + alturaRasgo;
  return (
    <svg
      width={wSvg}
      height={hSvg}
      style={{ position: "absolute", left: 0, top: 0, filter: direita ? "drop-shadow(6px 0 10px rgba(0,0,0,0.35))" : "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <filter id={`manchas-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={4} seed={semente} />
          <feColorMatrix
            type="matrix"
            values={campo ? "0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0 0.12  0.9 0 0 0 -0.34" : "0 0 0 0 0.42  0 0 0 0 0.40  0 0 0 0 0.36  0.9 0 0 0 -0.38"}
          />
        </filter>
        <filter id={`grao-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={campo ? "0.55 0.9" : "0.85"} numOctaves={2} seed={semente + 3} />
          <feColorMatrix
            type="matrix"
            values={campo ? "0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0.75 0 0 0 -0.22" : "0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.25  0.5 0 0 0 -0.18"}
          />
        </filter>
        <pattern id={`pauta-${id}`} width={8} height={56} patternUnits="userSpaceOnUse">
          <line x1={0} y1={55} x2={8} y2={55} stroke="#8A6A3E" strokeWidth={1.5} opacity={0.28} />
        </pattern>
        <clipPath id={`recorte-${id}`}>
          <polygon points={papel} />
        </clipPath>
      </defs>
      <polygon points={fibra} fill={campo ? "#E9DCC2" : "#F8F5EE"} />
      <g clipPath={`url(#recorte-${id})`}>
        <rect width={wSvg} height={hSvg} fill={campo ? COR_CORTE.kraft : COR_CORTE.papel} />
        <rect width={wSvg} height={hSvg} filter={`url(#manchas-${id})`} />
        <rect width={wSvg} height={hSvg} filter={`url(#grao-${id})`} />
        {campo ? <rect width={wSvg} height={hSvg} fill={`url(#pauta-${id})`} /> : null}
        {campo ? <line x1={direita ? 0 : 92} y1={0} x2={direita ? 0 : 92} y2={hSvg} stroke="#B5523B" strokeWidth={2} opacity={0.35} /> : null}
      </g>
    </svg>
  );
};
