#!/usr/bin/env node
/**
 * cortar-silencio.mjs — Etapa 2a do editor-jr
 *
 * Detecta as pausas de um vídeo, calcula os trechos com fala e grava
 * essa lista num JSON. Opcionalmente gera o mp4 já cortado.
 *
 * Usa o ffmpeg que vem junto com o Remotion. Não precisa instalar nada.
 *
 * Uso:
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --limiar -35 --pausa 1.0
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar --gancho 1:10-1:25
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar --gancho 1:10-1:25 --copiar
 *
 *   Teaser com vários trechos (separados por vírgula, na ordem que você digitar,
 *   não na ordem cronológica do vídeo):
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar --gancho 0:46-0:56,0:14-0:22,1:20-1:25
 *
 *   Limpeza de voz (redução de ruído + equalização + nivelamento). Exige o
 *   FFmpeg completo instalado (winget install Gyan.FFmpeg) — o do Remotion
 *   não tem os filtros necessários:
 *   node scripts/cortar-silencio.mjs videos/teste-jr.mp4 --gerar --limpar
 *
 *   Modo multi-camada (Formato A: OBS gravando tela, câmera e câmera+mic em
 *   arquivos separados, cada um em sua pasta). O áudio do câmera+mic decide
 *   os cortes, e os MESMOS cortes são aplicados nos 3 arquivos — senão perde
 *   a sincronia. As saídas e o .cortes.json vão para a pasta do --camera-mic:
 *   node scripts/cortar-silencio.mjs --gerar --tela "D:\OBS\tela\tela.mkv" --camera "D:\OBS\CAMERA_GRAV\camera.mkv" --camera-mic "D:\OBS\camera-mic.mkv"
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- ffmpeg

const PACOTES_COMPOSITOR = {
  win32: '@remotion/compositor-win32-x64-msvc',
  darwin: '@remotion/compositor-darwin-x64',
  linux: '@remotion/compositor-linux-x64-gnu',
};

const acharBinario = (nome) => {
  const pacote = PACOTES_COMPOSITOR[process.platform];
  if (pacote) {
    const sufixo = process.platform === 'win32' ? '.exe' : '';
    const caminho = join(RAIZ, 'node_modules', ...pacote.split('/'), nome + sufixo);
    if (existsSync(caminho)) return caminho;
  }
  // Sem o binário do Remotion, tenta o que estiver instalado no sistema.
  return nome;
};

const FFMPEG = acharBinario('ffmpeg');
const FFPROBE = acharBinario('ffprobe');

// O ffmpeg do Remotion é uma build enxuta: não tem afftdn, acompressor nem
// highpass. Para --limpar precisamos do FFmpeg completo (winget install
// Gyan.FFmpeg). Procura primeiro no PATH do sistema, depois no local padrão
// que o winget usa nessa instalação.
const acharFfmpegCompleto = () => {
  const noPath = spawnSync('ffmpeg', ['-version'], {encoding: 'utf8'});
  if (!noPath.error && noPath.status === 0) return 'ffmpeg';

  if (process.platform === 'win32') {
    const base = join(
      process.env.LOCALAPPDATA ?? '',
      'Microsoft',
      'WinGet',
      'Packages',
    );
    if (existsSync(base)) {
      const pacoteFFmpeg = readdirSync(base).find((n) => n.startsWith('Gyan.FFmpeg'));
      if (pacoteFFmpeg) {
        const dirPacote = join(base, pacoteFFmpeg);
        const buildDir = readdirSync(dirPacote).find((n) => /^ffmpeg-.*-full_build$/.test(n));
        if (buildDir) {
          const caminho = join(dirPacote, buildDir, 'bin', 'ffmpeg.exe');
          if (existsSync(caminho)) return caminho;
        }
      }
    }
  }
  return null;
};

// Cadeia de filtros de limpeza de voz, usada por --limpar.
// - highpass: corta ruído grave (zumbido, vento, ar-condicionado) abaixo da voz
// - afftdn: redução de ruído de fundo constante, por FFT
// - acompressor: nivela a dinâmica (sussurro sobe, fala forte desce um pouco)
// Valores moderados de partida — ajustar ouvindo o resultado.
const FILTRO_REDUCAO_RUIDO = 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=20:release=250';
// Normalização de volume final (padrão próximo do que YouTube/Instagram usam).
// Aplicada uma vez só, sobre a trilha inteira já montada — não em cada pedaço.
const FILTRO_NORMALIZACAO = 'loudnorm=I=-16:TP=-1.5:LRA=11';

const rodar = (bin, args) => {
  const r = spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  if (r.error) {
    throw new Error(`Não consegui rodar "${bin}": ${r.error.message}`);
  }
  return r;
};

// ---------------------------------------------------------------- tempo

const segParaTempo = (s) => {
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(2).padStart(5, '0');
  return `${m}:${r}`;
};

const tempoParaSeg = (txt) => {
  const partes = String(txt).split(':').map(Number);
  if (partes.some(Number.isNaN)) throw new Error(`Tempo inválido: ${txt}`);
  return partes.reduce((acc, n) => acc * 60 + n, 0);
};

// ---------------------------------------------------------------- argumentos

const argv = process.argv.slice(2);

// Acha o argumento posicional (o caminho do vídeo), pulando os flags que
// têm valor — senão o valor de "--tela caminho/com espaço" seria confundido
// com um posicional, por não começar com "--" (bug real, achado testando o
// modo multi-camada: sem isso, o modo multi nunca tem posicional nenhum, e
// o primeiro valor de flag virava "entrada" por engano).
const FLAGS_COM_VALOR = new Set([
  'limiar',
  'pausa',
  'margem',
  'minimo',
  'gancho',
  'tela',
  'camera',
  'camera-mic',
]);
let entrada = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    if (FLAGS_COM_VALOR.has(a.slice(2))) i++; // pula o valor desse flag
    continue;
  }
  entrada = a;
  break;
}

const opcao = (nome, padrao) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : argv[i + 1];
};

// Modo multi-camada (Formato A): tela, câmera e câmera+mic em arquivos
// separados, cada um podendo estar numa pasta diferente. O câmera+mic é o
// único com áudio — é ele que decide onde cortar; tela e câmera recebem os
// mesmos cortes, só que aplicados nos seus próprios frames de vídeo.
const TELA = opcao('tela', null);
const CAMERA = opcao('camera', null);
const CAMERA_MIC = opcao('camera-mic', null);
const MULTI = Boolean(TELA || CAMERA || CAMERA_MIC);

if (MULTI) {
  const faltando = [];
  if (!TELA) faltando.push('--tela');
  if (!CAMERA) faltando.push('--camera');
  if (!CAMERA_MIC) faltando.push('--camera-mic');
  if (faltando.length > 0) {
    console.error(`Modo multi-camada precisa dos 3 arquivos. Faltou: ${faltando.join(', ')}`);
    process.exit(1);
  }
  if (entrada) {
    console.error(
      `Não misture o modo de arquivo único ("${entrada}") com --tela/--camera/--camera-mic. Use um ou outro.`,
    );
    process.exit(1);
  }
  for (const [nome, caminho] of [['--tela', TELA], ['--camera', CAMERA], ['--camera-mic', CAMERA_MIC]]) {
    if (!existsSync(caminho)) {
      console.error(`Não achei o arquivo de ${nome}: ${caminho}`);
      process.exit(1);
    }
  }
} else {
  if (!entrada) {
    console.error('Faltou o vídeo. Ex.: node scripts/cortar-silencio.mjs videos/teste-jr.mp4');
    process.exit(1);
  }
  if (!existsSync(entrada)) {
    console.error(`Não achei o arquivo: ${entrada}`);
    process.exit(1);
  }
}

// A partir daqui, ARQUIVO_BASE é quem manda no cálculo dos cortes: o vídeo
// único, ou o câmera+mic no modo multi-camada (o único com áudio).
const ARQUIVO_BASE = MULTI ? CAMERA_MIC : entrada;

const LIMIAR = Number(opcao('limiar', -30)); // dB: abaixo disso é considerado silêncio
const PAUSA = Number(opcao('pausa', 0.8)); // s: só pausas maiores que isso contam
const MARGEM = Number(opcao('margem', 0.15)); // s: folga antes/depois de cada fala
const MINIMO = Number(opcao('minimo', 0.3)); // s: descarta lascas de fala menores que isso
const GERAR = argv.includes('--gerar');
const LIMPAR = argv.includes('--limpar');

// Falha cedo, antes de gastar tempo com a detecção de silêncio, se --limpar
// foi pedido mas não há um ffmpeg completo disponível.
const FFMPEG_COMPLETO = LIMPAR ? acharFfmpegCompleto() : null;
if (LIMPAR && !FFMPEG_COMPLETO) {
  console.error(
    'Não achei o FFmpeg completo (precisa dele para --limpar).\n' +
      'Instale com: winget install Gyan.FFmpeg\n' +
      '(o FFmpeg que vem com o Remotion não tem os filtros de redução de ruído)',
  );
  process.exit(1);
}
// Para gerar com --limpar, usa o ffmpeg completo em tudo (ele faz tudo que
// o do Remotion faz, e mais). Sem --limpar, continua no do Remotion.
const FFMPEG_GERACAO = LIMPAR ? FFMPEG_COMPLETO : FFMPEG;
// Um trecho ("1:10-1:25") ou vários, separados por vírgula, formando um teaser
// no início na ordem em que forem digitados (não na ordem do vídeo original):
// "0:46-0:56,0:14-0:22,1:20-1:25"
const GANCHO_TXT = opcao('gancho', null);
const COPIAR = argv.includes('--copiar'); // gancho repete no lugar original em vez de sair de lá

const GANCHOS = GANCHO_TXT
  ? GANCHO_TXT.split(',').map((trecho) => {
      const partes = trecho.split('-');
      if (partes.length !== 2) {
        throw new Error(`Gancho inválido: "${trecho}". Use o formato 1:10-1:25.`);
      }
      const [a, b] = partes.map(tempoParaSeg);
      if (!(b > a)) throw new Error(`Gancho inválido: "${trecho}" (o fim precisa vir depois do início).`);
      return {inicio: a, fim: b, texto: trecho};
    })
  : [];

// Dois ganchos não podem se sobrepor, senão o mesmo trecho de fala entraria
// duas vezes no teaser sem querer.
for (let i = 0; i < GANCHOS.length; i++) {
  for (let j = i + 1; j < GANCHOS.length; j++) {
    const x = GANCHOS[i], y = GANCHOS[j];
    if (x.inicio < y.fim && y.inicio < x.fim) {
      throw new Error(`Os ganchos "${x.texto}" e "${y.texto}" se sobrepõem.`);
    }
  }
}

// ---------------------------------------------------------------- 1. duração

const duracaoDe = (arquivo) => {
  const r = rodar(FFPROBE, [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    arquivo,
  ]);
  return Number(r.stdout.trim());
};

const DURACAO = duracaoDe(ARQUIVO_BASE);
if (!DURACAO) {
  console.error('Não consegui ler a duração do vídeo.');
  process.exit(1);
}

// Premissa do Formato A ainda não confirmada na prática: que os 3 arquivos
// começam juntos e duram o mesmo tempo. Não bloqueia (o Matheus pode querer
// ver o resultado mesmo assim), mas avisa alto se a duração não bater.
if (MULTI) {
  for (const [nome, arquivo] of [['tela', TELA], ['câmera', CAMERA]]) {
    const dur = duracaoDe(arquivo);
    const diferenca = Math.abs(dur - DURACAO);
    if (diferenca > 1) {
      console.warn(
        `\n⚠ ATENÇÃO: duração de ${nome} (${segParaTempo(dur)}) difere da do câmera+mic ` +
          `(${segParaTempo(DURACAO)}) em ${diferenca.toFixed(2)}s. Os cortes podem sair ` +
          `dessincronizados. Confira se os 3 arquivos são da mesma gravação.\n`,
      );
    }
  }
}

// ---------------------------------------------------------------- 2. detectar

console.log(`\nAnalisando ${ARQUIVO_BASE} (${segParaTempo(DURACAO)})...`);
console.log(`Limiar: ${LIMIAR}dB · pausa mínima: ${PAUSA}s · margem: ${MARGEM}s\n`);

// O ffmpeg do Remotion não traz o encoder "wrapped_avframe", então mandar o
// vídeo para o destino nulo dá erro. Como só interessa o áudio, descartamos o
// vídeo (-vn) e usamos um encoder de áudio que existe nessa build.
const deteccao = rodar(FFMPEG, [
  '-hide_banner',
  '-i',
  ARQUIVO_BASE,
  '-vn',
  '-af',
  `silencedetect=noise=${LIMIAR}dB:d=${PAUSA}`,
  '-c:a',
  'pcm_s16le',
  '-f',
  'null',
  '-',
]);

if (deteccao.status !== 0) {
  console.error('O ffmpeg falhou ao analisar o áudio:\n');
  console.error(deteccao.stderr);
  process.exit(1);
}

const log = deteccao.stderr ?? '';
const silencios = [];
for (const linha of log.split('\n')) {
  const ini = linha.match(/silence_start:\s*(-?[\d.]+)/);
  if (ini) silencios.push({inicio: Math.max(0, Number(ini[1])), fim: null});
  const fim = linha.match(/silence_end:\s*([\d.]+)/);
  if (fim && silencios.length) silencios[silencios.length - 1].fim = Number(fim[1]);
}
// Se o vídeo termina em silêncio, o último não tem fim.
if (silencios.length && silencios[silencios.length - 1].fim === null) {
  silencios[silencios.length - 1].fim = DURACAO;
}

// ---------------------------------------------------------------- 3. inverter

// Os trechos de fala são o oposto dos silêncios.
const falas = [];
let cursor = 0;
for (const s of silencios) {
  if (s.inicio > cursor) falas.push({inicio: cursor, fim: s.inicio});
  cursor = Math.max(cursor, s.fim);
}
if (cursor < DURACAO) falas.push({inicio: cursor, fim: DURACAO});

// Margem de folga, senão o corte come o começo das palavras.
const comFolga = falas.map((f) => ({
  inicio: Math.max(0, f.inicio - MARGEM),
  fim: Math.min(DURACAO, f.fim + MARGEM),
}));

// Junta os que a margem fez encostar um no outro.
const trechos = [];
for (const f of comFolga) {
  const ultimo = trechos[trechos.length - 1];
  if (ultimo && f.inicio <= ultimo.fim) {
    ultimo.fim = Math.max(ultimo.fim, f.fim);
  } else {
    trechos.push({...f});
  }
}

const finais = trechos.filter((t) => t.fim - t.inicio >= MINIMO);

// ---------------------------------------------------------------- 4. gancho

// Tira de um trecho as partes cobertas por uma lista de intervalos (os
// ganchos). Sobra zero ou mais pedaços — o que restou do trecho original
// depois de retirar tudo que virou gancho.
const subtrairIntervalos = (trecho, intervalos) => {
  let partes = [{inicio: trecho.inicio, fim: trecho.fim}];
  for (const r of intervalos) {
    const novas = [];
    for (const p of partes) {
      if (r.fim <= p.inicio || r.inicio >= p.fim) {
        novas.push(p); // não se tocam
        continue;
      }
      if (r.inicio > p.inicio) novas.push({inicio: p.inicio, fim: r.inicio});
      if (r.fim < p.fim) novas.push({inicio: r.fim, fim: p.fim});
    }
    partes = novas;
  }
  return partes;
};

let ordem = finais;
if (GANCHOS.length > 0) {
  const pedacosGancho = [];
  GANCHOS.forEach((g, idx) => {
    const dentro = finais.filter((t) => t.fim > g.inicio && t.inicio < g.fim);
    if (dentro.length === 0) {
      console.warn(
        `Atenção: não há fala entre ${segParaTempo(g.inicio)} e ${segParaTempo(g.fim)} (gancho "${g.texto}"). Ignorado.\n`,
      );
      return;
    }
    for (const t of dentro) {
      pedacosGancho.push({
        inicio: Math.max(t.inicio, g.inicio),
        fim: Math.min(t.fim, g.fim),
        gancho: idx + 1, // qual gancho, na ordem digitada — útil no relatório
      });
    }
  });

  if (pedacosGancho.length === 0) {
    // Nenhum gancho tinha fala dentro; segue sem reordenar nada.
  } else if (COPIAR) {
    ordem = [...pedacosGancho, ...finais];
  } else {
    // Cada trecho original perde as partes que caíram em algum gancho; o
    // que sobra (fora de todos os ganchos) continua no lugar dele.
    const resto = [];
    for (const t of finais) {
      resto.push(...subtrairIntervalos(t, GANCHOS));
    }
    ordem = [...pedacosGancho, ...resto];
  }
}

// ---------------------------------------------------------------- relatório

const somar = (lista) => lista.reduce((acc, t) => acc + (t.fim - t.inicio), 0);
const mantido = somar(finais);
const removido = DURACAO - mantido;

console.log('Pausas encontradas:');
if (silencios.length === 0) {
  console.log('  (nenhuma — tente um limiar menos rigoroso, ex.: --limiar -25)');
}
for (const s of silencios) {
  console.log(
    `  ${segParaTempo(s.inicio)} → ${segParaTempo(s.fim)}   (${(s.fim - s.inicio).toFixed(2)}s)`,
  );
}

console.log(`\nTrechos na ordem final: ${ordem.length}`);
for (const [i, t] of ordem.entries()) {
  console.log(
    `  ${String(i + 1).padStart(3)}. ${segParaTempo(t.inicio)} → ${segParaTempo(t.fim)}   (${(t.fim - t.inicio).toFixed(2)}s)${t.gancho ? `   ← gancho ${t.gancho}` : ''}`,
  );
}

console.log(`\n--- Resumo ---`);
console.log(`Original:  ${segParaTempo(DURACAO)}`);
console.log(`Sobra:     ${segParaTempo(mantido)}`);
console.log(`Cortado:   ${segParaTempo(removido)}  (${((removido / DURACAO) * 100).toFixed(1)}%)`);
console.log(`Cortes:    ${silencios.length}`);
if (ordem !== finais) {
  const listaGanchos = GANCHOS.map((g) => g.texto).join(', ');
  console.log(`Gancho:    ${listaGanchos} (${COPIAR ? 'copiados' : 'movidos'} para o início)`);
  console.log(`Final:     ${segParaTempo(somar(ordem))}`);
}

// ---------------------------------------------------------------- JSON

const jsonPath = ARQUIVO_BASE.replace(/\.[^.]+$/, '') + '.cortes.json';
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      tipoSessao: MULTI ? 'multi_layer' : 'single_file',
      ...(MULTI ? {arquivos: {tela: TELA, camera: CAMERA, cameraMic: CAMERA_MIC}} : {arquivo: entrada}),
      duracaoOriginal: DURACAO,
      duracaoFinal: somar(ordem),
      parametros: {
        limiar: LIMIAR,
        pausa: PAUSA,
        margem: MARGEM,
        minimo: MINIMO,
        gancho: GANCHOS.map((g) => g.texto),
        modoGancho: GANCHOS.length > 0 ? (COPIAR ? 'copiar' : 'mover') : null,
      },
      silencios,
      trechos: ordem,
    },
    null,
    2,
  ),
);
console.log(`\nLista salva em: ${jsonPath}`);

if (!GERAR) {
  console.log('(Nenhum vídeo foi gerado. Rode de novo com --gerar quando estiver satisfeito.)\n');
  process.exit(0);
}

// ---------------------------------------------------------------- 5. gerar mp4

// Recorta e junta UM arquivo de vídeo seguindo a lista `ordem`, opcionalmente
// limpando o áudio (só faz sentido em quem tem áudio). Chamada 1x no modo
// arquivo único, 3x no modo multi-camada (tela, câmera, câmera+mic) — sempre
// com a mesma `ordem`, calculada uma vez só a partir do áudio do câmera+mic.
//
// Os pedaços saem com áudio PCM (sem compressão) dentro de .mov. AAC tem
// amostras de aquecimento no início de cada fluxo; grudar vários fluxos AAC
// gera um áudio remendado que o parser de mp4 do Windows não lê. Com PCM não
// há aquecimento, e o AAC é gerado uma única vez, na junção final.
const gerarSaidaCortada = ({arquivoEntrada, comAudio, caminhoSaida, rotulo}) => {
  const tmp = join(dirname(caminhoSaida), '.tmp-cortes');
  rmSync(tmp, {recursive: true, force: true});
  mkdirSync(tmp, {recursive: true});

  console.log(`\nRecortando ${ordem.length} trechos (${rotulo})...`);
  const pedacos = [];
  for (const [i, t] of ordem.entries()) {
    const saida = join(tmp, `p${String(i).padStart(4, '0')}.mov`);
    const args = [
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      String(t.inicio),
      '-i',
      arquivoEntrada,
      '-t',
      String(t.fim - t.inicio),
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '18',
    ];
    if (comAudio) {
      args.push('-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '2');
      if (LIMPAR) args.push('-af', FILTRO_REDUCAO_RUIDO);
    } else {
      args.push('-an'); // sem áudio nesse arquivo (tela/câmera), nem tenta codificar
    }
    args.push('-avoid_negative_ts', 'make_zero', '-y', saida);
    const r = rodar(FFMPEG_GERACAO, args);
    if (r.status !== 0) {
      console.error(`Falhou no trecho ${i + 1} (${rotulo}):\n${r.stderr}`);
      process.exit(1);
    }
    pedacos.push(saida);
    process.stdout.write(`\r  ${i + 1}/${ordem.length}`);
  }
  console.log('');

  const lista = join(tmp, 'lista.txt');
  writeFileSync(
    lista,
    pedacos.map((p) => `file '${resolve(p).replace(/\\/g, '/')}'`).join('\n'),
  );

  // O vídeo é copiado (já foi codificado nos pedaços, não perde qualidade de
  // novo). O áudio (quando existe) é comprimido aqui, uma vez só, virando um
  // fluxo contínuo. +faststart põe o índice no começo do arquivo.
  console.log(`Juntando (${rotulo})...`);
  const argsJunta = ['-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c:v', 'copy'];
  if (comAudio) {
    argsJunta.push('-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2');
    if (LIMPAR) argsJunta.push('-af', FILTRO_NORMALIZACAO);
  } else {
    argsJunta.push('-an');
  }
  argsJunta.push('-movflags', '+faststart', '-y', caminhoSaida);
  const junta = rodar(FFMPEG_GERACAO, argsJunta);
  if (junta.status !== 0) {
    console.error(`Falhou ao juntar (${rotulo}):\n${junta.stderr}`);
    process.exit(1);
  }

  rmSync(tmp, {recursive: true, force: true});
  console.log(`Pronto: ${caminhoSaida}`);
};

// Versiona a saída: nunca sobrescreve um vídeo já exportado.
const baseSemExtensao = ARQUIVO_BASE.replace(/\.[^.]+$/, '');
const pasta = dirname(ARQUIVO_BASE);
const contarMaxVersao = (regex) => {
  const usados = readdirSync(pasta)
    .map((f) => f.match(regex))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  return usados.length ? Math.max(...usados) : 0;
};

if (MULTI) {
  // Os 3 arquivos da mesma rodada compartilham o número de versão, pra ficar
  // claro que pertencem juntos.
  const versao =
    Math.max(
      contarMaxVersao(/-tela-cortado-v(\d+)\.mp4$/),
      contarMaxVersao(/-camera-cortado-v(\d+)\.mp4$/),
      contarMaxVersao(/-camera-mic-cortado-v(\d+)\.mp4$/),
    ) + 1;

  const saidaTela = `${baseSemExtensao}-tela-cortado-v${versao}.mp4`;
  const saidaCamera = `${baseSemExtensao}-camera-cortado-v${versao}.mp4`;
  const saidaCameraMic = `${baseSemExtensao}-camera-mic-cortado-v${versao}.mp4`;

  gerarSaidaCortada({arquivoEntrada: TELA, comAudio: false, caminhoSaida: saidaTela, rotulo: 'tela'});
  gerarSaidaCortada({arquivoEntrada: CAMERA, comAudio: false, caminhoSaida: saidaCamera, rotulo: 'câmera'});
  gerarSaidaCortada({
    arquivoEntrada: CAMERA_MIC,
    comAudio: true,
    caminhoSaida: saidaCameraMic,
    rotulo: 'câmera+mic',
  });

  console.log(`\nPronto, 3 arquivos sincronizados:\n  ${saidaTela}\n  ${saidaCamera}\n  ${saidaCameraMic}\n`);
} else {
  // O regex simples "-cortado-v(N).mp4" também bateria com as saídas do modo
  // multi-camada (ex.: "-camera-mic-cortado-v3.mp4" termina do mesmo jeito),
  // se algum dia dividirem a mesma pasta. Exclui essas antes de contar.
  const usados = readdirSync(pasta)
    .filter((f) => !/-(tela|camera|camera-mic)-cortado-v\d+\.mp4$/.test(f))
    .map((f) => f.match(/-cortado-v(\d+)\.mp4$/))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const versao = (usados.length ? Math.max(...usados) : 0) + 1;
  const final = `${baseSemExtensao}-cortado-v${versao}.mp4`;
  gerarSaidaCortada({arquivoEntrada: entrada, comAudio: true, caminhoSaida: final, rotulo: 'vídeo'});
  console.log('');
}
