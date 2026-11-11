import { z } from "zod";
// Schemas zod das peças do CATALOGO de src/PlanoComposicao.tsx. Só IMPORTADOS de src/ (nada lá
// muda). Se uma peça nova entrar no CATALOGO, ela precisa entrar aqui também para o painel.
import { imagemFadeSchema } from "../src/components/ImagemFade";
import { graficoLinhaSchema } from "../src/components/GraficoLinha";
import { colagemCenasSchema } from "../src/components/ColagemCenas";
import { comparacaoBarrasSchema } from "../src/components/ComparacaoBarras";
import { textoDestaqueSchema } from "../src/components/TextoDestaque";
import { setaSchema } from "../src/components/Seta";
import { checkmarkSchema } from "../src/components/Checkmark";
import { listaCheckSchema } from "../src/components/v2/ListaCheck";
import { colagemFotosSchema } from "../src/components/v2/ColagemFotos";
import { textoContrasteSchema } from "../src/components/v2/TextoContraste";
import { legendaDiscretaSchema } from "../src/components/v2/LegendaDiscreta";
import { barrasDueloSchema } from "../src/components/v2/BarrasDuelo";
import { graficoCrescimentoSchema } from "../src/components/v2/GraficoCrescimento";
import { personagemImagemSchema } from "../src/components/v2/PersonagemImagem";
import { callToActionSchema } from "../src/components/v2/CallToAction";
import { circuloDestaqueSchema } from "../src/components/v2/CirculoDestaque";
import { spotlightSchema } from "../src/components/v2/Spotlight";
import { contadorSchema } from "../src/components/v2/Contador";
import { avisoCVMSchema } from "../src/components/v2/AvisoCVM";
import { arrobaInstagramSchema } from "../src/components/v2/ArrobaInstagram";
import { legendaAnimadaSchema } from "../src/components/v2/LegendaAnimada";
import { gradeAtivos3DSchema } from "../src/components/v2/GradeAtivos3D";
import { impactoKitSchema } from "../src/components/v2/ImpactoKit";
import { arrobaCanalSchema } from "../src/components/v2/ArrobaCanal";
import { destaqueSoltoSchema } from "../src/components/v2/DestaqueSolto";
import { linhaTrajetoriaSchema } from "../src/components/v2/LinhaTrajetoria";
import { fundoExplicativoSchema } from "../src/components/v2/FundoExplicativo";
import { aberturaCapituloSchema } from "../src/components/v2/AberturaCapitulo";
import { comparacaoNumerosSchema } from "../src/components/v2/ComparacaoNumeros";
import { pautaSchema } from "../src/components/v2/Pauta";

const SCHEMAS: Record<string, z.ZodType> = {
  ImagemFade: imagemFadeSchema,
  GraficoLinha: graficoLinhaSchema,
  ColagemCenas: colagemCenasSchema,
  ComparacaoBarras: comparacaoBarrasSchema,
  TextoDestaque: textoDestaqueSchema,
  Seta: setaSchema,
  Checkmark: checkmarkSchema,
  ListaCheck: listaCheckSchema,
  ColagemFotos: colagemFotosSchema,
  TextoContraste: textoContrasteSchema,
  LegendaDiscreta: legendaDiscretaSchema,
  BarrasDuelo: barrasDueloSchema,
  GraficoCrescimento: graficoCrescimentoSchema,
  PersonagemImagem: personagemImagemSchema,
  CallToAction: callToActionSchema,
  CirculoDestaque: circuloDestaqueSchema,
  Spotlight: spotlightSchema,
  Contador: contadorSchema,
  AvisoCVM: avisoCVMSchema,
  ArrobaInstagram: arrobaInstagramSchema,
  LegendaAnimada: legendaAnimadaSchema,
  GradeAtivos3D: gradeAtivos3DSchema,
  ImpactoKit: impactoKitSchema,
  ArrobaCanal: arrobaCanalSchema,
  DestaqueSolto: destaqueSoltoSchema,
  LinhaTrajetoria: linhaTrajetoriaSchema,
  FundoExplicativo: fundoExplicativoSchema,
  AberturaCapitulo: aberturaCapituloSchema,
  ComparacaoNumeros: comparacaoNumerosSchema,
  Pauta: pautaSchema,
};

export const NOMES_COM_SCHEMA = Object.keys(SCHEMAS);

const cache = new Map<string, Record<string, unknown> | null>();

// JSON Schema da peça (entrada: com os .default()), ou null se a peça não tem schema aqui ou a
// conversão falhou. https://zod.dev/json-schema: io "input" e unrepresentable "any".
export const esquemaJsonDa = (nome: string): Record<string, unknown> | null => {
  if (cache.has(nome)) return cache.get(nome) ?? null;
  const s = SCHEMAS[nome];
  let resultado: Record<string, unknown> | null = null;
  if (s) {
    try {
      resultado = z.toJSONSchema(s, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
    } catch {
      resultado = null;
    }
  }
  cache.set(nome, resultado);
  return resultado;
};
