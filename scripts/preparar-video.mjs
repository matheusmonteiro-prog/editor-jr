#!/usr/bin/env node
/**
 * preparar-video.mjs — cria uma cópia LEVE do vídeo antes do render.
 *
 * Por quê: o Remotion deste ambiente (WSL) cai com "write ECANCELED" ao decodificar
 * o original 2160x3872. A cópia reduzida (1080x1920, pixel quadrado) renderiza normal.
 * Regra do projeto: NUNCA renderizar o original 2160x3872 no WSL — passe sempre pela cópia.
 *
 * O que faz, para cada arquivo de vídeo:
 *   1. lê tamanho, SAR (formato do pixel) e rotação com o ffprobe;
 *   2. calcula a proporção real e detecta vertical/horizontal;
 *   3. reduz para o tamanho padrão (lado maior = --altura-max), com pixel quadrado (SAR 1:1):
 *        - até MARGEM_PROPORCAO de diferença para 9:16 (ou 16:9) -> reduz e CORTA as bordas;
 *        - acima disso -> reduz sem cortar e põe BARRAS pretas, e avisa;
 *   4. copia o áudio sem recomprimir;
 *   5. grava a cópia ao lado do original, versionada (-leve-v1, -v2...), nunca sobrescreve;
 *   6. grava a ficha videos/<nome>.preparo.json (descreve só a última cópia; a pasta videos/
 *      está no .gitignore) e imprime o comando de render para colar.
 *
 * Usa o ffmpeg e o ffprobe COMPLETOS do PATH do sistema. Nunca os do Remotion.
 * (Linux/WSL: sudo apt install ffmpeg · Windows: winget install Gyan.FFmpeg)
 *
 * Uso:
 *   node scripts/preparar-video.mjs public/videos/0926-cortado-v1.mp4
 *   node scripts/preparar-video.mjs public/videos/0926-cortado-v1.mp4 --dry-run
 *   node scripts/preparar-video.mjs public/videos/0926-cortado-v1.mp4 --altura-max 1280 --crf 20
 *   node scripts/preparar-video.mjs ARQUIVO --forcar horizontal
 *
 *   Modo multi-camada (Formato A, 3 arquivos do OBS; cada um é preparado com a mesma regra):
 *   node scripts/preparar-video.mjs --tela T.mp4 --camera C.mp4 --camera-mic CM.mp4
 *
 * Opções:
 *   --altura-max N   lado maior da cópia, em pixels (padrão 1920; nunca aumenta o vídeo)
 *   --forcar F       "vertical" ou "horizontal": ignora a detecção (vale para todos os arquivos)
 *   --crf N          qualidade do x264, menor = melhor (padrão 18)
 *   --saida-dir P    pasta das cópias leves (padrão: ao lado de cada original). A ficha
 *                    continua em videos/<nome>.preparo.json. No modo de camadas o papel entra no
 *                    nome: <nome>-tela-leve-v1.mp4, <nome>-camera-leve-v1.mp4, <nome>-camera-mic-leve-v1.mp4
 *   --dry-run        só mostra o que faria; não gera vídeo e não grava a ficha
 *
 * Saída: 0 = ok · 1 = erro · 2 = proporção ambígua (quase quadrada) sem --forcar.
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- constantes (ajustáveis)

// Diferença máxima (fração) entre a proporção real e a do formato padrão (9:16 ou 16:9)
// para ainda CORTAR as bordas. 0.03 = 3%. Acima disso entram barras pretas.
const MARGEM_PROPORCAO = 0.03;
// Proporção = altura ÷ largura (com o SAR aplicado). A faixa entre os dois limites é "ambígua".
const LIMITE_VERTICAL = 1.15; // razão >= isto -> vertical
const LIMITE_HORIZONTAL = 0.87; // razão <= isto -> horizontal

const ALTURA_MAX_PADRAO = 1920;
const CRF_PADRAO = 18;
const PRESET_X264 = 'veryfast';
// Lado maior da cópia é arredondado para múltiplo disto, para o lado menor (x9/16) sair inteiro e par.
const MULTIPLO_LADO = 32;

// ---------------------------------------------------------------- utilidades

class ErroUso extends Error {}
class ErroAmbiguo extends Error {}

const rodar = (bin, args, opcoes = {}) => {
  const r = spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opcoes});
  if (r.error) throw new Error(`Não consegui rodar "${bin}": ${r.error.message}`);
  return r;
};

// Só o ffmpeg/ffprobe do PATH. Se não estiverem lá, para — não cai pro do Remotion.
const exigirBinario = (nome) => {
  const r = spawnSync(nome, ['-version'], {encoding: 'utf8', timeout: 10000});
  if (r.error || r.status !== 0) {
    throw new ErroUso(
      `Não achei "${nome}" no PATH do sistema.\n` +
        'Este script usa o FFmpeg completo (nunca o do Remotion).\n' +
        'Linux/WSL: sudo apt install ffmpeg · Windows: winget install Gyan.FFmpeg',
    );
  }
  return (r.stdout.split('\n')[0] ?? '').trim();
};

const paraRelativo = (caminho) => {
  const rel = relative(RAIZ, caminho);
  return rel.startsWith('..') || isAbsolute(rel) ? caminho : rel.split('\\').join('/');
};

// ---------------------------------------------------------------- argumentos

const FLAGS_COM_VALOR = ['--altura-max', '--forcar', '--crf', '--saida-dir', '--tela', '--camera', '--camera-mic'];
const FLAGS_BOOLEANAS = ['--dry-run'];

const lerArgumentos = (argv) => {
  const opcoes = {alturaMax: ALTURA_MAX_PADRAO, crf: CRF_PADRAO, forcar: null, saidaDir: null, dryRun: false};
  const camadas = {};
  const posicionais = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (FLAGS_BOOLEANAS.includes(a)) {
      opcoes.dryRun = true;
    } else if (FLAGS_COM_VALOR.includes(a)) {
      const valor = argv[++i];
      if (valor === undefined || valor.startsWith('--')) throw new ErroUso(`A opção ${a} precisa de um valor.`);
      if (a === '--altura-max') opcoes.alturaMax = Number(valor);
      else if (a === '--crf') opcoes.crf = Number(valor);
      else if (a === '--forcar') opcoes.forcar = valor;
      else if (a === '--saida-dir') opcoes.saidaDir = resolve(process.cwd(), valor);
      else camadas[a === '--tela' ? 'tela' : a === '--camera' ? 'camera' : 'cameraMic'] = valor;
    } else if (a.startsWith('--')) {
      throw new ErroUso(`Opção desconhecida: ${a}`);
    } else {
      posicionais.push(a);
    }
  }
  if (!Number.isFinite(opcoes.alturaMax) || opcoes.alturaMax < MULTIPLO_LADO) {
    throw new ErroUso(`--altura-max inválido (mínimo ${MULTIPLO_LADO}).`);
  }
  if (!Number.isFinite(opcoes.crf) || opcoes.crf < 0 || opcoes.crf > 51) {
    throw new ErroUso('--crf inválido (0 a 51).');
  }
  if (opcoes.forcar !== null && opcoes.forcar !== 'vertical' && opcoes.forcar !== 'horizontal') {
    throw new ErroUso('--forcar aceita só "vertical" ou "horizontal".');
  }
  const usouCamadas = Object.keys(camadas).length > 0;
  if (usouCamadas && posicionais.length > 0) {
    throw new ErroUso('Use OU um arquivo sozinho, OU --tela/--camera/--camera-mic. Não os dois.');
  }
  if (!usouCamadas && posicionais.length !== 1) {
    throw new ErroUso('Passe um arquivo de vídeo (ou --tela/--camera/--camera-mic). Veja o topo do script.');
  }
  const arquivos = usouCamadas ? camadas : {unico: posicionais[0]};
  for (const [papel, caminho] of Object.entries(arquivos)) {
    arquivos[papel] = resolve(process.cwd(), caminho);
    if (!existsSync(arquivos[papel])) throw new ErroUso(`Arquivo não encontrado (${papel}): ${arquivos[papel]}`);
  }
  return {opcoes, arquivos, multi: usouCamadas};
};

// ---------------------------------------------------------------- ffprobe

const lerSar = (texto) => {
  const m = /^(\d+):(\d+)$/.exec(texto ?? '');
  if (!m || Number(m[1]) === 0 || Number(m[2]) === 0) return {texto: '1:1', valor: 1};
  return {texto: `${m[1]}:${m[2]}`, valor: Number(m[1]) / Number(m[2])};
};

const sondar = (arquivo) => {
  const r = rodar('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_streams', '-of', 'json', arquivo]);
  if (r.status !== 0) throw new Error(`ffprobe falhou em ${arquivo}:\n${r.stderr}`);
  const s = JSON.parse(r.stdout).streams?.[0];
  if (!s) throw new ErroUso(`O arquivo não tem trilha de vídeo: ${arquivo}`);
  const sar = lerSar(s.sample_aspect_ratio);
  let rotacao = 0;
  const matriz = (s.side_data_list ?? []).find((d) => d.rotation !== undefined);
  if (matriz) rotacao = Number(matriz.rotation);
  else if (s.tags?.rotate) rotacao = Number(s.tags.rotate);
  // O ffmpeg gira sozinho pela matriz de rotação; então "exibido" já considera isso.
  const girado = Math.abs(rotacao) % 180 === 90;
  let largExib = s.width * sar.valor;
  let altExib = s.height;
  if (girado) [largExib, altExib] = [altExib, largExib];
  return {
    largura: s.width,
    altura: s.height,
    sar: sar.texto,
    sarValor: sar.valor,
    rotacao,
    largExib,
    altExib,
    razao: altExib / largExib,
  };
};

// ---------------------------------------------------------------- decisão

const decidir = (info, {forcar, alturaMax}) => {
  const avisos = [];
  const real =
    info.razao >= LIMITE_VERTICAL ? 'vertical' : info.razao <= LIMITE_HORIZONTAL ? 'horizontal' : null;

  let orientacao;
  let fonte;
  if (forcar) {
    orientacao = forcar;
    fonte = 'forcada';
    if (real && real !== forcar) {
      avisos.push(
        `O vídeo é ${real}, mas foi forçado ${forcar}: a cópia leva barras pretas. ` +
          'Gerar um formato a partir do outro pede layout próprio (ver ARQUITETURA.md, seção 3).',
      );
    }
  } else if (real) {
    orientacao = real;
    fonte = 'detectada';
  } else {
    throw new ErroAmbiguo(
      `Proporção ambígua (altura÷largura = ${info.razao.toFixed(3)}, entre ${LIMITE_HORIZONTAL} e ` +
        `${LIMITE_VERTICAL}). Rode de novo com --forcar vertical ou --forcar horizontal.`,
    );
  }

  const maior = Math.max(info.largExib, info.altExib);
  const ladoMaior = Math.floor(Math.min(alturaMax, maior) / MULTIPLO_LADO) * MULTIPLO_LADO;
  if (ladoMaior < MULTIPLO_LADO) throw new ErroUso('O vídeo é pequeno demais para preparar.');
  const ladoMenor = (ladoMaior * 9) / 16;
  const largura = orientacao === 'vertical' ? ladoMenor : ladoMaior;
  const altura = orientacao === 'vertical' ? ladoMaior : ladoMenor;

  const razaoAlvo = altura / largura;
  const diferenca = Math.abs(info.razao / razaoAlvo - 1);
  const modo = diferenca <= MARGEM_PROPORCAO ? 'corte' : 'barras';
  if (modo === 'barras' && !avisos.length) {
    avisos.push(
      `A proporção difere ${(diferenca * 100).toFixed(1)}% do formato ${orientacao} padrão ` +
        `(margem de corte: ${MARGEM_PROPORCAO * 100}%): a cópia leva barras pretas.`,
    );
  }

  // Se o SAR não for 1:1, primeiro "assa" o SAR na largura, para a conta de proporção valer.
  const prefixo = Math.abs(info.sarValor - 1) > 1e-6 ? 'scale=trunc(iw*sar/2)*2:ih,setsar=1,' : '';
  const filtro =
    modo === 'corte'
      ? `${prefixo}scale=${largura}:${altura}:force_original_aspect_ratio=increase,crop=${largura}:${altura},setsar=1`
      : `${prefixo}scale=${largura}:${altura}:force_original_aspect_ratio=decrease,` +
        `pad=${largura}:${altura}:(ow-iw)/2:(oh-ih)/2:black,setsar=1`;

  return {orientacao, fonte, modo, diferenca, largura, altura, filtro, avisos};
};

// ---------------------------------------------------------------- saída versionada

// No modo de camadas o papel entra no nome (<nome>-tela-leve-v1.mp4), para dois arquivos com o
// mesmo nome base não colidirem. Arquivo único não leva papel no nome.
const SUFIXO_PAPEL = {tela: '-tela', camera: '-camera', cameraMic: '-camera-mic', unico: ''};

const saidaDe = ({original, papel}, versao, saidaDir) => {
  const ext = extname(original);
  const nome = `${basename(original, ext)}${SUFIXO_PAPEL[papel] ?? ''}-leve-v${versao}.mp4`;
  return join(saidaDir ?? dirname(original), nome);
};

const proximaVersao = (itens, saidaDir) => {
  for (let n = 1; ; n++) {
    if (itens.every((i) => !existsSync(saidaDe(i, n, saidaDir)))) return n;
  }
};

// ---------------------------------------------------------------- principal

const main = () => {
  const {opcoes, arquivos, multi} = lerArgumentos(process.argv.slice(2));
  const versaoFfmpeg = exigirBinario('ffmpeg');
  exigirBinario('ffprobe');

  const papeis = Object.keys(arquivos);
  const itens = papeis.map((papel) => {
    const info = sondar(arquivos[papel]);
    return {papel, original: arquivos[papel], info, plano: decidir(info, opcoes)};
  });

  const versao = proximaVersao(itens, opcoes.saidaDir);
  for (const item of itens) item.saida = saidaDe(item, versao, opcoes.saidaDir);

  // Resumo
  console.log(opcoes.dryRun ? '== DRY-RUN: nada será gerado nem gravado ==' : '== Preparando vídeo ==');
  for (const {papel, original, info, plano, saida} of itens) {
    console.log(`\n[${multi ? papel : 'arquivo'}] ${paraRelativo(original)}`);
    console.log(
      `  original: ${info.largura}x${info.altura}, SAR ${info.sar}, rotação ${info.rotacao}°, ` +
        `altura÷largura ${info.razao.toFixed(3)}`,
    );
    console.log(`  orientação: ${plano.orientacao} (${plano.fonte})`);
    console.log(
      `  decisão: ${plano.modo === 'corte' ? 'reduzir e cortar bordas' : 'reduzir com barras pretas'} ` +
        `(diferença para ${plano.orientacao === 'vertical' ? '9:16' : '16:9'}: ${(plano.diferenca * 100).toFixed(2)}%)`,
    );
    console.log(`  cópia: ${plano.largura}x${plano.altura}, SAR 1:1 -> ${paraRelativo(saida)}`);
    for (const aviso of plano.avisos) console.log(`  AVISO: ${aviso}`);
    if (opcoes.dryRun) console.log(`  filtro: ${plano.filtro}`);
  }

  if (opcoes.dryRun) {
    console.log('\n(dry-run: nenhum vídeo gerado, ficha não gravada)');
    return;
  }

  // Gera as cópias. -n: o próprio ffmpeg recusa sobrescrever.
  if (opcoes.saidaDir) mkdirSync(opcoes.saidaDir, {recursive: true});
  for (const item of itens) {
    console.log(`\nGerando ${paraRelativo(item.saida)} ...`);
    const r = rodar(
      'ffmpeg',
      [
        '-hide_banner', '-loglevel', 'error', '-stats', '-n',
        '-i', item.original,
        '-map', '0:v:0', '-map', '0:a?',
        '-vf', item.plano.filtro,
        '-c:v', 'libx264', '-crf', String(opcoes.crf), '-preset', PRESET_X264, '-pix_fmt', 'yuv420p',
        '-c:a', 'copy',
        '-movflags', '+faststart',
        item.saida,
      ],
      {stdio: 'inherit'},
    );
    if (r.status !== 0) throw new Error(`ffmpeg falhou ao gerar ${item.saida} (código ${r.status}).`);

    // Prova: confere a saída antes de seguir.
    const saidaInfo = sondar(item.saida);
    item.saidaInfo = saidaInfo;
    const ok =
      saidaInfo.largura === item.plano.largura && saidaInfo.altura === item.plano.altura && saidaInfo.sar === '1:1';
    console.log(
      `  conferido: ${saidaInfo.largura}x${saidaInfo.altura}, SAR ${saidaInfo.sar} ${ok ? '(ok)' : '(DIFERENTE DO ESPERADO)'}`,
    );
    if (!ok) throw new Error(`A cópia ${item.saida} não saiu com ${item.plano.largura}x${item.plano.altura} e SAR 1:1.`);
  }

  // Ficha: videos/<nome>.preparo.json (a pasta videos/ está no .gitignore).
  const base = basename(itens.find((i) => i.papel === 'cameraMic' || i.papel === 'unico')?.original ?? itens[0].original);
  const nome = base.replace(extname(base), '').replace(/(-camera-mic)?(-cortado-v\d+)?$/, '');
  const caminhoFicha = join(RAIZ, 'videos', `${nome}.preparo.json`);

  // A ficha descreve só a ÚLTIMA cópia gerada (decisão do Matheus, 09/10/2026).
  const ficha = {
    geradoEm: new Date().toISOString(),
    copiaLeve: `leve-v${versao}`,
    tipoSessao: multi ? 'multi_layer' : 'single_file',
    ffmpeg: versaoFfmpeg,
    parametros: {
      alturaMax: opcoes.alturaMax,
      crf: opcoes.crf,
      preset: PRESET_X264,
      margemProporcao: MARGEM_PROPORCAO,
      limiteVertical: LIMITE_VERTICAL,
      limiteHorizontal: LIMITE_HORIZONTAL,
      forcar: opcoes.forcar,
      saidaDir: opcoes.saidaDir ? paraRelativo(opcoes.saidaDir) : null,
    },
    arquivos: Object.fromEntries(
      itens.map(({papel, original, info, plano, saida, saidaInfo}) => [
        papel,
        {
          original: paraRelativo(original),
          larguraOriginal: info.largura,
          alturaOriginal: info.altura,
          sarOriginal: info.sar,
          rotacaoOriginal: info.rotacao,
          razaoAlturaLargura: Number(info.razao.toFixed(4)),
          orientacao: plano.orientacao,
          orientacaoFonte: plano.fonte,
          modo: plano.modo,
          diferencaParaPadrao: Number(plano.diferenca.toFixed(4)),
          copia: paraRelativo(saida),
          larguraCopia: saidaInfo.largura,
          alturaCopia: saidaInfo.altura,
          sarCopia: saidaInfo.sar,
          avisos: plano.avisos,
        },
      ]),
    ),
  };

  mkdirSync(dirname(caminhoFicha), {recursive: true});
  writeFileSync(caminhoFicha, JSON.stringify(ficha, null, 2) + '\n');
  console.log(`\nFicha gravada: ${paraRelativo(caminhoFicha)} (cópia ${ficha.copiaLeve})`);

  // Comando de render para colar (o videoSrc é relativo a public/). O id da composição
  // não é adivinhado: confira no src/Root.tsx.
  console.log('\nPara renderizar com a cópia (confira o id no Root.tsx):');
  const publico = join(RAIZ, 'public');
  for (const item of itens) {
    const rel = relative(publico, item.saida);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      console.log(`  AVISO: ${paraRelativo(item.saida)} está fora de public/; copie para public/videos/ antes de renderizar.`);
      continue;
    }
    const videoSrc = rel.split('\\').join('/');
    console.log(
      `  ~/render.sh <ID-DA-COMPOSICAO> <NOME-DA-SAIDA> --width ${item.plano.largura} ` +
        `--height ${item.plano.altura} --fps 30 --props='{"videoSrc":"${videoSrc}"}'` +
        (multi ? `   # ${item.papel}` : ''),
    );
  }
};

try {
  main();
} catch (e) {
  console.error(`\nERRO: ${e.message}`);
  process.exit(e instanceof ErroAmbiguo ? 2 : 1);
}
