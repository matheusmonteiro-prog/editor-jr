#!/usr/bin/env node
/**
 * testar-validador.mjs — roda scripts/validar-plano.mjs contra as fixtures de
 * planos/testes/ e confirma que cada uma se comporta como esperado: o plano
 * válido passa limpo, e cada plano inválido falha com a mensagem certa.
 *
 * Não é um framework de teste — é um script Node puro, sem dependência nova,
 * do mesmo jeito que o resto do projeto.
 *
 * Uso: node scripts/testar-validador.mjs
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALIDADOR = path.join(RAIZ, 'scripts', 'validar-plano.mjs');
const PASTA_FIXTURES = path.join(RAIZ, 'planos', 'testes');

const fixture = (nome) => path.join(PASTA_FIXTURES, nome);

// Cada caso: arquivo da fixture, args extras pro validador, se espera que o
// validador termine com erro (exit code 1) ou não, e um trecho que tem que
// aparecer na saída (prova de que foi o motivo certo, não qualquer erro).
const casos = [
  {
    nome: 'plano válido passa limpo',
    arquivo: fixture('valido.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'componente que não existe no CATALOGO real',
    arquivo: fixture('invalido-componente-inexistente.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'não está registrado no CATALOGO de src/PlanoComposicao.tsx',
  },
  {
    nome: 'prop obrigatória faltando',
    arquivo: fixture('invalido-prop-obrigatoria-faltando.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'faltam props obrigatórias de "Checkmark": cor',
  },
  {
    nome: 'prop com tipo errado',
    arquivo: fixture('invalido-prop-tipo-errado.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: '"x" de "Checkmark" deveria ser number',
  },
  {
    nome: 'inicio fora da duração do vídeo original',
    arquivo: fixture('invalido-fora-da-duracao.plano.json'),
    // Fixture usa "video": "fixture", que não tem videos/fixture.cortes.json
    // de verdade (videos/ nem vai pro Git) — por isso passamos --duracao
    // explícito aqui, pra o teste não depender de arquivo nenhum na máquina.
    args: ['--duracao', '10'],
    esperaFalha: true,
    trechoEsperado: 'mas o vídeo original só tem 0:10',
  },
  {
    nome: 'colisão de posicao/slot vira AVISO, não ERRO',
    arquivo: fixture('invalido-colisao-posicao-slot.plano.json'),
    args: [],
    esperaFalha: false, // é aviso, não impede a validação de passar
    trechoEsperado: 'AVISO colisao: mesma posicao/slot',
  },
  {
    nome: '"a confirmar" restando em componente/props',
    arquivo: fixture('invalido-a-confirmar.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'ainda está "a confirmar"',
  },
];

let falhas = 0;

for (const caso of casos) {
  let saida = '';
  let codigo = 0;
  try {
    saida = execFileSync(process.execPath, [VALIDADOR, caso.arquivo, ...caso.args], {
      cwd: RAIZ,
      encoding: 'utf8',
    });
  } catch (e) {
    // execFileSync lança quando o processo sai com código != 0 — é o
    // caminho esperado pros casos inválidos.
    saida = (e.stdout ?? '') + (e.stderr ?? '');
    codigo = e.status ?? 1;
  }

  const falhouComoEsperado = caso.esperaFalha ? codigo !== 0 : codigo === 0;
  const trechoPresente = saida.includes(caso.trechoEsperado);

  if (falhouComoEsperado && trechoPresente) {
    console.log(`OK   ${caso.nome}`);
  } else {
    falhas++;
    console.log(`FAIL ${caso.nome}`);
    if (!falhouComoEsperado) {
      console.log(`     esperava exit ${caso.esperaFalha ? '!= 0' : '== 0'}, veio ${codigo}`);
    }
    if (!trechoPresente) {
      console.log(`     não achei o trecho esperado: ${JSON.stringify(caso.trechoEsperado)}`);
    }
    console.log('     --- saída completa ---');
    console.log(saida.split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

console.log(`\n${casos.length - falhas}/${casos.length} casos OK`);
process.exit(falhas > 0 ? 1 : 0);
