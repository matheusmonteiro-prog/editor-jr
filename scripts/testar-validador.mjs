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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALIDADOR = path.join(RAIZ, 'scripts', 'validar-plano.mjs');
const PASTA_FIXTURES = path.join(RAIZ, 'planos', 'testes');

const fixture = (nome) => path.join(PASTA_FIXTURES, nome);

// As fixtures de áudio apontam pra uma pasta public/ FALSA, criada aqui (arquivos
// vazios) e apagada no fim: public/music e public/sfx não vão pro Git, então o teste
// não pode depender do que existe ou não numa máquina. O validador recebe essa pasta
// por --public.
const PUBLIC_TESTE = mkdtempSync(path.join(os.tmpdir(), 'validador-audio-'));
for (const arq of ['music/musica.mp3', 'music/outra.mp3', 'music/faixa.flac', 'sfx/efeito.wav']) {
  mkdirSync(path.dirname(path.join(PUBLIC_TESTE, arq)), { recursive: true });
  writeFileSync(path.join(PUBLIC_TESTE, arq), '');
}
const ARGS_AUDIO = ['--public', PUBLIC_TESTE];

// Planos derivados do valido.plano.json, gravados na pasta temporária acima (sem
// fixture nova em disco): só o 1º elemento muda.
const baseValida = JSON.parse(readFileSync(fixture('valido.plano.json'), 'utf8'));
const planoTemporario = (nome, alterar) => {
  const plano = structuredClone(baseValida);
  alterar(plano.elementos[0]);
  const caminho = path.join(PUBLIC_TESTE, nome);
  writeFileSync(caminho, JSON.stringify(plano, null, 2));
  return caminho;
};

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
  {
    nome: 'prop desconhecida vira AVISO, não ERRO',
    arquivo: fixture('aviso-prop-desconhecida.plano.json'),
    args: [],
    esperaFalha: false, // é aviso, plano continua válido
    trechoEsperado: '"posicao" não faz parte do schema de "CirculoDestaque" — você quis dizer "posicaoX"?',
  },
  // Lista "camera" (opcional). Sem ela, nada muda: os casos acima continuam valendo.
  {
    nome: 'camera válida passa limpo (sem texto/posicao/slot)',
    arquivo: fixture('valido-camera.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'camera que não é lista',
    arquivo: fixture('camera-nao-lista.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: deve ser uma lista (array)',
  },
  {
    nome: 'trecho de câmera sem id/inicio/duracao',
    arquivo: fixture('camera-sem-campo-obrigatorio.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: id ausente; duracao ausente',
  },
  {
    nome: 'id de trecho de câmera repetido',
    arquivo: fixture('camera-id-repetido.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: id repetido "cam"',
  },
  {
    nome: 'inicio de câmera fora do m:ss',
    arquivo: fixture('camera-inicio-invalido.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: inicio deve estar no formato m:ss',
  },
  {
    nome: 'duracao de câmera <= 0',
    arquivo: fixture('camera-duracao-zero.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: duracao deve ser número > 0',
  },
  {
    nome: 'x de câmera fora de 0 a 1',
    arquivo: fixture('camera-x-fora-da-faixa.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: x deve estar entre 0 e 1',
  },
  {
    nome: 'y de câmera fora de 0 a 1',
    arquivo: fixture('camera-y-fora-da-faixa.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: y deve estar entre 0 e 1',
  },
  {
    nome: 'largura de câmera fora de 0.05 a 1',
    arquivo: fixture('camera-largura-fora-da-faixa.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: largura deve estar entre 0.05 e 1',
  },
  {
    nome: 'altura de câmera fora de 0.05 a 1',
    arquivo: fixture('camera-altura-fora-da-faixa.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: altura deve estar entre 0.05 e 1',
  },
  {
    nome: 'ajuste de câmera inválido',
    arquivo: fixture('camera-ajuste-invalido.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: ajuste deve ser "cobrir" ou "conter"',
  },
  {
    nome: 'framesEntrada de câmera negativo',
    arquivo: fixture('camera-frames-negativos.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: framesEntrada deve ser inteiro >= 0',
  },
  {
    nome: 'framesSaida de câmera não inteiro',
    arquivo: fixture('camera-frames-nao-inteiros.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: framesSaida deve ser inteiro >= 0',
  },
  {
    nome: 'trechos de câmera que se sobrepõem',
    arquivo: fixture('camera-sobreposta.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'camera: trechos se sobrepõem',
  },
  {
    nome: 'trecho de câmera que passa do fim do vídeo (com --duracao)',
    arquivo: fixture('camera-passa-do-fim.plano.json'),
    args: ['--duracao', '10'],
    esperaFalha: true,
    trechoEsperado: 'camera: termina em 0:13, mas o vídeo original só tem 0:10',
  },
  {
    nome: 'deslocamentoCamera 0.5 (positivo, |valor| <= 5) passa limpo',
    arquivo: fixture('aviso-camera-deslocamento.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'deslocamentoCamera -0.5 (negativo, |valor| <= 5) passa limpo',
    arquivo: fixture('valido-camera-deslocamento.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'deslocamentoCamera com |valor| > 5 vira AVISO',
    arquivo: fixture('aviso-camera-deslocamento-grande.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'valor grande, confira',
  },
  {
    nome: 'chave desconhecida em trecho de câmera vira AVISO',
    arquivo: fixture('aviso-camera-chave-desconhecida.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'campo "zoom" não existe em um trecho de câmera',
  },
  // Lista "audio" (opcional). Sem ela, nada muda: os casos acima continuam valendo.
  // Os arquivos citados nas fixtures existem só na pasta public/ falsa de ARGS_AUDIO.
  {
    nome: 'audio válido passa limpo (música, efeito por elemento e por inicio)',
    arquivo: fixture('valido-audio.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'audio que não é lista',
    arquivo: fixture('audio-nao-lista.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: deve ser uma lista (array)',
  },
  {
    nome: 'item de audio sem id/tipo/arquivo',
    arquivo: fixture('audio-item-sem-campo.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: id ausente; tipo ausente; arquivo ausente',
  },
  {
    nome: 'id de audio repetido',
    arquivo: fixture('audio-id-repetido.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: id repetido "m"',
  },
  {
    nome: 'tipo de audio que não é musica nem efeito',
    arquivo: fixture('audio-tipo-invalido.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: tipo deve ser "musica" ou "efeito"',
  },
  {
    nome: 'arquivo de audio que não existe em public/',
    arquivo: fixture('audio-arquivo-inexistente.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'não existe em public/',
  },
  {
    nome: 'arquivo de audio com espaço',
    arquivo: fixture('audio-arquivo-com-espaco.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'sem espaço nem acento',
  },
  {
    nome: 'arquivo de audio com acento',
    arquivo: fixture('audio-arquivo-com-acento.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'sem espaço nem acento',
  },
  {
    nome: 'arquivo de audio que tenta sair de public/ (..)',
    arquivo: fixture('audio-arquivo-sai-de-public.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: arquivo não pode sair de public/',
  },
  {
    nome: 'arquivo de audio com caminho absoluto',
    arquivo: fixture('audio-arquivo-absoluto.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: arquivo deve ser relativo a public/',
  },
  {
    nome: 'volume de audio fora de 0 a 1',
    arquivo: fixture('audio-volume-fora-da-faixa.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: volume deve ser número entre 0 e 1',
  },
  {
    nome: 'volume de audio que não é número',
    arquivo: fixture('audio-volume-nao-numero.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: volume deve ser número entre 0 e 1',
  },
  {
    nome: 'framesEntrada de música negativo',
    arquivo: fixture('audio-frames-negativos.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: framesEntrada deve ser inteiro >= 0',
  },
  {
    nome: 'framesSaida de música não inteiro',
    arquivo: fixture('audio-frames-nao-inteiros.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: framesSaida deve ser inteiro >= 0',
  },
  {
    nome: 'loop de música que não é booleano',
    arquivo: fixture('audio-loop-nao-booleano.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: loop deve ser true ou false',
  },
  {
    nome: 'efeito com inicio E elemento',
    arquivo: fixture('audio-efeito-inicio-e-elemento.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: efeito com "inicio" e "elemento" ao mesmo tempo',
  },
  {
    nome: 'efeito sem inicio nem elemento',
    arquivo: fixture('audio-efeito-sem-inicio-nem-elemento.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: efeito precisa de "inicio" ou "elemento"',
  },
  {
    nome: 'inicio de efeito fora do m:ss',
    arquivo: fixture('audio-inicio-invalido.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: inicio deve estar no formato m:ss',
  },
  {
    nome: 'inicio de efeito além do fim do vídeo (com --duracao)',
    arquivo: fixture('audio-inicio-passa-do-fim.plano.json'),
    args: [...ARGS_AUDIO, '--duracao', '10'],
    esperaFalha: true,
    trechoEsperado: 'audio: inicio em 0:13 passa do fim do vídeo original (0:10)',
  },
  {
    nome: 'elemento de efeito que não existe na lista elementos',
    arquivo: fixture('audio-elemento-inexistente.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: true,
    trechoEsperado: 'audio: elemento "nao-existe" não existe na lista "elementos"',
  },
  {
    nome: 'chave desconhecida em item de audio vira AVISO',
    arquivo: fixture('aviso-audio-chave-desconhecida.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'campo "fade" não existe em um item de áudio',
  },
  {
    nome: 'campo de música dentro de efeito vira AVISO',
    arquivo: fixture('aviso-audio-campo-de-outro-tipo.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'campo "loop" não existe em um item de áudio do tipo "efeito"',
  },
  {
    nome: 'extensão de audio fora da lista vira AVISO',
    arquivo: fixture('aviso-audio-extensao.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'extensão ".flac"',
  },
  {
    nome: 'mais de uma música vira AVISO',
    arquivo: fixture('aviso-audio-duas-musicas.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'tocam todas ao mesmo tempo',
  },
  {
    nome: 'volume de música > 0.5 vira AVISO',
    arquivo: fixture('aviso-audio-musica-alta.plano.json'),
    args: ARGS_AUDIO,
    esperaFalha: false,
    trechoEsperado: 'música alta, confira',
  },
  // ---- tempo com décimo ("m:ss.d") e naPalavra
  {
    nome: 'inicio "0:05.4" (um décimo) passa limpo',
    arquivo: fixture('valido-decimal.plano.json'),
    args: [],
    esperaFalha: false,
    trechoEsperado: 'Resumo: 0 erro(s), 0 aviso(s)',
  },
  {
    nome: 'inicio "0:05.45" (dois dígitos decimais) é ERRO',
    arquivo: fixture('invalido-decimal-dois-digitos.plano.json'),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'só UM dígito depois do ponto',
  },
  {
    nome: 'inicio com vírgula ("0:05,4") é ERRO',
    arquivo: planoTemporario('inicio-virgula.plano.json', (el) => {
      el.inicio = '0:05,4';
    }),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'vírgula não vale',
  },
  {
    nome: 'inicio negativo ("-0:05") é ERRO',
    arquivo: planoTemporario('inicio-negativo.plano.json', (el) => {
      el.inicio = '-0:05';
    }),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'tempo negativo não vale',
  },
  {
    nome: 'naPalavra sem inicio é ERRO (ainda não resolvido)',
    arquivo: planoTemporario('na-palavra-sem-inicio.plano.json', (el) => {
      delete el.inicio;
      el.naPalavra = 'taxa';
      el.ocorrencia = 1;
    }),
    args: [],
    esperaFalha: true,
    trechoEsperado: 'naPalavra ainda não resolvido: rode scripts/resolver-plano.mjs antes',
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
rmSync(PUBLIC_TESTE, { recursive: true, force: true }); // só a pasta temporária criada acima
process.exit(falhas > 0 ? 1 : 0);
