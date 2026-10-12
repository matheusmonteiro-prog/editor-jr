// Teste do src/utils/tamanhoDoPlano.ts (Etapa 3, critério 3.3, fase 1): orientação
// do plano -> tamanho da composição. Rodar: node scripts/teste-tamanho-do-plano.mjs
// Imprime "OK" ou lista as falhas (e sai com código 1).
import { tamanhoDoPlano } from '../src/utils/tamanhoDoPlano.ts';

const falhas = [];
let total = 0;

function conferir(nome, entrada, esperado) {
  total++;
  const obtido = tamanhoDoPlano(entrada);
  if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
    falhas.push(`${nome}: ${JSON.stringify(entrada)} → ${JSON.stringify(obtido)}, esperado ${JSON.stringify(esperado)}`);
  }
}

conferir('vertical', 'vertical', { width: 1080, height: 1920 });
conferir('horizontal', 'horizontal', { width: 1920, height: 1080 });
conferir('valor desconhecido', 'quadrado', null);
conferir('undefined', undefined, null);
conferir('maiúscula', 'Vertical', null);
conferir('string vazia', '', null);

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
