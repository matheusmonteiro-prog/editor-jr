#!/usr/bin/env node
/**
 * transcrever.mjs — transcreve o áudio de um vídeo ORIGINAL com o Whisper local e grava as
 * palavras com tempo (Caption[]) em videos/<nome>.palavras.json. Critério 4.1 da Etapa 4.
 *
 * O que faz:
 *   1. extrai o áudio para WAV 16 kHz, 16 bits, mono, em out/ (a pasta está no .gitignore);
 *   2. roda o whisper.cpp (pacote oficial @remotion/install-whisper-cpp) com tempo por palavra;
 *   3. converte com toCaptions() e grava SÓ a lista de palavras em videos/<nome>.palavras.json
 *      (a pasta videos/ está no .gitignore).
 *
 * Os tempos são os do vídeo ORIGINAL (a gravação, antes de cortar), em milissegundos. A conversão
 * para o tempo do vídeo cortado é outro passo (critério 4.2).
 *
 * Não instala nada e não baixa nada: o whisper.cpp e o modelo já têm que existir. Os caminhos
 * vêm de config.local.json (fora do Git; modelo em config.exemplo.json). Nenhum caminho fixo aqui.
 *
 * Usa o ffmpeg e o ffprobe COMPLETOS do PATH do sistema. Nunca os do Remotion.
 * (Linux/WSL: sudo apt install ffmpeg · Windows: winget install Gyan.FFmpeg)
 *
 * Uso:
 *   node scripts/transcrever.mjs --video videos/teste-jr.mp4
 *   node scripts/transcrever.mjs --video videos/teste-jr.mp4 --modelo base --idioma pt
 *   node scripts/transcrever.mjs --video videos/teste-jr.mp4 --refazer
 *   node scripts/transcrever.mjs --video videos/teste-jr.mp4 --so-texto
 *
 * Além do .palavras.json, grava videos/<nome>.palavras.txt: uma linha por trecho, "m:ss texto",
 * com m:ss = startMs da primeira palavra do trecho (tempo do vídeo ORIGINAL). Serve para ler a
 * transcrição de forma compacta. O trecho quebra com 12 palavras, ou na pontuação final (. ? !)
 * com 5 palavras ou mais, ou numa pausa de 700 ms ou mais entre duas palavras.
 *
 * Glossário (correção do texto): se existir, o .palavras.txt sai com as palavras corrigidas por
 * ele. O .palavras.json fica BRUTO (como o Whisper escreveu) e nenhum tempo muda. O arquivo é
 * glossario.json na raiz do projeto, ou o caminho da chave opcional "glossario" do
 * config.local.json. Formato: {"_comentario": "...", "pares": {"errado": "certo"}}. Se o arquivo
 * não existir, o script avisa e segue sem glossário.
 *
 * Opções:
 *   --video CAMINHO  vídeo original (obrigatório)
 *   --modelo NOME    modelo do Whisper (padrão small; precisa existir em modelFolder)
 *   --idioma COD     idioma falado (padrão pt)
 *   --refazer        regrava o .palavras.json e o .palavras.txt mesmo que já existam
 *                    (sem isso, o script para em vez de sobrescrever)
 *   --so-texto       NÃO roda o Whisper: lê o .palavras.json que já existe e gera só o
 *                    .palavras.txt, já com o glossário aplicado (precisa de --refazer se o
 *                    .txt já existir)
 *
 * Aviso conhecido e inofensivo do pacote: "input file not found 'true'" (ele passa
 * ['--split-on-word', true]). Aqui a saída do whisper.cpp fica silenciosa, então ele não aparece;
 * se aparecer em outro uso, não é erro.
 *
 * Saída: 0 = ok · 1 = erro.
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {toCaptions, transcribe} from '@remotion/install-whisper-cpp';
import {aplicarGlossario, ErroPalavras} from './palavras.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- constantes (ajustáveis)

const MODELO_PADRAO = 'small';
const IDIOMA_PADRAO = 'pt';
// Versão do whisper.cpp testada no Windows (08/10/2026). Pode ser trocada em config.local.json
// (chave whisperCppVersion). No Windows o pacote só tem binário até a 1.6.0.
const VERSAO_WHISPER_PADRAO = '1.6.0';
const MODELOS_ACEITOS = [
  'tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en',
  'medium', 'medium.en', 'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo',
];
// Regras de quebra de linha do .palavras.txt
const MAX_PALAVRAS_POR_LINHA = 12;
const MIN_PALAVRAS_PARA_QUEBRAR_NA_PONTUACAO = 5;
const PAUSA_QUEBRA_MS = 700;
const PASTA_AUDIO = join(RAIZ, 'out');
const PASTA_SAIDA = join(RAIZ, 'videos');
const ARQUIVO_CONFIG = join(RAIZ, 'config.local.json');
const GLOSSARIO_PADRAO = join(RAIZ, 'glossario.json');

// ---------------------------------------------------------------- utilidades

class ErroUso extends Error {}

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
};

const paraRelativo = (caminho) => {
  const rel = relative(RAIZ, caminho);
  return rel.startsWith('..') || isAbsolute(rel) ? caminho : rel.split('\\').join('/');
};

// "1.6.0" >= "1.7.4"? Só números; o suficiente para escolher o nome do executável.
const versaoMaiorOuIgual = (a, b) => {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  }
  return true;
};

// ---------------------------------------------------------------- argumentos

const FLAGS_COM_VALOR = ['--video', '--modelo', '--idioma'];
const FLAGS_BOOLEANAS = ['--refazer', '--so-texto'];

const lerArgumentos = (argv) => {
  const opcoes = {video: null, modelo: MODELO_PADRAO, idioma: IDIOMA_PADRAO, refazer: false, soTexto: false};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (FLAGS_BOOLEANAS.includes(a)) {
      if (a === '--refazer') opcoes.refazer = true;
      else opcoes.soTexto = true;
    } else if (FLAGS_COM_VALOR.includes(a)) {
      const valor = argv[++i];
      if (valor === undefined || valor.startsWith('--')) throw new ErroUso(`A opção ${a} precisa de um valor.`);
      if (a === '--video') opcoes.video = resolve(process.cwd(), valor);
      else if (a === '--modelo') opcoes.modelo = valor;
      else opcoes.idioma = valor;
    } else {
      throw new ErroUso(`Argumento desconhecido: ${a}. Veja o topo do script.`);
    }
  }
  if (!opcoes.video) throw new ErroUso('Passe o vídeo original: --video caminho/do/video.mp4');
  if (!existsSync(opcoes.video)) throw new ErroUso(`Vídeo não encontrado: ${opcoes.video}`);
  if (!MODELOS_ACEITOS.includes(opcoes.modelo)) {
    throw new ErroUso(`--modelo "${opcoes.modelo}" não é aceito. Use um destes: ${MODELOS_ACEITOS.join(', ')}.`);
  }
  return opcoes;
};

// ---------------------------------------------------------------- configuração

const lerConfig = () => {
  if (!existsSync(ARQUIVO_CONFIG)) {
    throw new ErroUso(
      'Falta o arquivo config.local.json na raiz do projeto.\n' +
        '  1. Copie config.exemplo.json para config.local.json.\n' +
        '  2. Preencha "whisperPath" (pasta onde está o whisper.cpp, com o main.exe) e\n' +
        '     "modelFolder" (pasta onde está o arquivo ggml-<modelo>.bin, ex.: ggml-small.bin).\n' +
        '  3. "whisperCppVersion" é opcional (padrão ' + VERSAO_WHISPER_PADRAO + ').\n' +
        'O config.local.json fica fora do Git (cada PC tem o seu).',
    );
  }
  let bruto;
  try {
    bruto = JSON.parse(readFileSync(ARQUIVO_CONFIG, 'utf8'));
  } catch (e) {
    throw new ErroUso(`config.local.json não é um JSON válido: ${e.message}`);
  }
  for (const chave of ['whisperPath', 'modelFolder']) {
    if (typeof bruto[chave] !== 'string' || bruto[chave].trim() === '') {
      throw new ErroUso(`Em config.local.json a chave "${chave}" está vazia. Preencha com o caminho da pasta.`);
    }
  }
  const whisperPath = resolve(RAIZ, bruto.whisperPath);
  const modelFolder = resolve(RAIZ, bruto.modelFolder);
  const versao = typeof bruto.whisperCppVersion === 'string' && bruto.whisperCppVersion.trim() !== ''
    ? bruto.whisperCppVersion.trim()
    : VERSAO_WHISPER_PADRAO;
  return {whisperPath, modelFolder, versao};
};

const conferirWhisper = ({whisperPath, modelFolder, versao}, modelo) => {
  if (!existsSync(whisperPath)) throw new ErroUso(`whisperPath não existe: ${whisperPath}`);
  // Mesmo nome de executável que o pacote usa: main(.exe) até a 1.7.3; whisper-cli depois.
  const novo = versaoMaiorOuIgual(versao, '1.7.4');
  const exe = novo
    ? join(whisperPath, 'build', 'bin', process.platform === 'win32' ? 'whisper-cli.exe' : 'whisper-cli')
    : join(whisperPath, process.platform === 'win32' ? 'main.exe' : 'main');
  if (!existsSync(exe)) {
    throw new ErroUso(`Não achei o executável do whisper.cpp ${versao} em ${exe}. Este script não instala nada.`);
  }
  const arquivoModelo = join(modelFolder, `ggml-${modelo}.bin`);
  if (!existsSync(arquivoModelo)) {
    throw new ErroUso(`Não achei o modelo "${modelo}" em ${arquivoModelo}. Este script não baixa modelo.`);
  }
};

// ---------------------------------------------------------------- áudio

// Nunca sobrescreve: se já existe um WAV do mesmo vídeo, reaproveita quando é mais novo que o
// vídeo; se o vídeo mudou depois, grava ao lado com versão (-v2, -v3...).
const caminhoWav = (nome, versao) => join(PASTA_AUDIO, `${nome}.16k${versao === 1 ? '' : `-v${versao}`}.wav`);

const prepararAudio = (video, nome) => {
  mkdirSync(PASTA_AUDIO, {recursive: true});
  const mtimeVideo = statSync(video).mtimeMs;
  let versao = 1;
  for (; existsSync(caminhoWav(nome, versao)); versao++) {
    if (statSync(caminhoWav(nome, versao)).mtimeMs >= mtimeVideo) {
      return {wav: caminhoWav(nome, versao), reaproveitado: true};
    }
  }
  const wav = caminhoWav(nome, versao);
  const r = rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-n',
    '-i', video,
    '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le',
    wav,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg falhou ao extrair o áudio (código ${r.status}):\n${r.stderr}`);
  return {wav, reaproveitado: false};
};

const duracaoDoAudioMs = (wav) => {
  const r = rodar('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', wav]);
  const s = Number(String(r.stdout).trim());
  if (r.status !== 0 || !Number.isFinite(s)) throw new Error(`ffprobe não leu a duração de ${wav}.`);
  return s * 1000;
};

// ---------------------------------------------------------------- texto compacto (.palavras.txt)

// "m:ss" do tempo em ms (tempo do vídeo ORIGINAL). Minutos não têm limite (65 min -> "65:00").
const formatarTempo = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Junta as palavras em trechos. Usa só text, startMs e endMs.
// Quebra o trecho quando: chega a MAX_PALAVRAS_POR_LINHA palavras; ou a palavra termina em
// . ? ! e o trecho já tem MIN_PALAVRAS_PARA_QUEBRAR_NA_PONTUACAO ou mais; ou a pausa até a
// próxima palavra (startMs da próxima - endMs desta) é de PAUSA_QUEBRA_MS ou mais.
export const montarTrechos = (captions) => {
  const palavras = captions.filter((c) => typeof c.text === 'string' && c.text.trim() !== '');
  const trechos = [];
  let atual = [];
  const fechar = () => {
    if (atual.length === 0) return;
    const texto = atual.map((p) => p.text).join('').replace(/\s+/g, ' ').trim();
    trechos.push({startMs: atual[0].startMs, texto});
    atual = [];
  };
  palavras.forEach((p, i) => {
    atual.push(p);
    const proxima = palavras[i + 1];
    const termina = /[.?!]$/.test(p.text.trim());
    const pausa = proxima ? proxima.startMs - p.endMs : 0;
    if (
      atual.length >= MAX_PALAVRAS_POR_LINHA ||
      (termina && atual.length >= MIN_PALAVRAS_PARA_QUEBRAR_NA_PONTUACAO) ||
      (proxima && pausa >= PAUSA_QUEBRA_MS)
    ) {
      fechar();
    }
  });
  fechar();
  return trechos;
};

// O conteúdo do .palavras.txt: uma linha "m:ss texto" por trecho. Recebe as palavras que vão
// para o texto (já corrigidas pelo glossário, se houver).
export const textoCompacto = (captions) => {
  const trechos = montarTrechos(captions);
  return {linhas: trechos.length, texto: trechos.map((t) => `${formatarTempo(t.startMs)} ${t.texto}`).join('\n') + '\n'};
};

const gravarTexto = (captions, caminho) => {
  const {linhas, texto} = textoCompacto(captions);
  mkdirSync(dirname(caminho), {recursive: true});
  writeFileSync(caminho, texto);
  return linhas;
};

// ---------------------------------------------------------------- glossário

// Onde está o glossário: chave opcional "glossario" do config.local.json (relativa à raiz do
// projeto, ou absoluta) ou, sem ela, glossario.json na raiz. Não exige config.local.json.
const caminhoDoGlossario = () => {
  if (!existsSync(ARQUIVO_CONFIG)) return GLOSSARIO_PADRAO;
  let bruto;
  try {
    bruto = JSON.parse(readFileSync(ARQUIVO_CONFIG, 'utf8'));
  } catch (e) {
    throw new ErroUso(`config.local.json não é um JSON válido: ${e.message}`);
  }
  const valor = bruto.glossario;
  if (valor === undefined || valor === null || valor === '') return GLOSSARIO_PADRAO;
  if (typeof valor !== 'string') {
    throw new ErroUso('Em config.local.json a chave "glossario" deve ser o caminho do arquivo (texto).');
  }
  return resolve(RAIZ, valor.trim());
};

// Lê os pares {"errado": "certo"} de um glossario.json. Devolve null se o arquivo não existe
// (quem chama avisa e segue sem glossário). Arquivo que existe mas está errado PARA o script,
// em vez de ser ignorado em silêncio.
export const lerGlossario = (caminho) => {
  if (!existsSync(caminho)) return null;
  let bruto;
  try {
    bruto = JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (e) {
    throw new ErroUso(`O glossário ${paraRelativo(caminho)} não é um JSON válido: ${e.message}`);
  }
  const pares = bruto?.pares;
  if (pares === null || typeof pares !== 'object' || Array.isArray(pares)) {
    throw new ErroUso(
      `O glossário ${paraRelativo(caminho)} precisa ter { "pares": { "errado": "certo" } } ` +
        '(o campo "_comentario" é opcional).',
    );
  }
  return pares;
};

// Aplica os pares sem alterar a lista bruta. Devolve a lista corrigida e quantas palavras
// tiveram o texto trocado. Tempos e confiança nunca mudam (garantido por aplicarGlossario).
export const corrigirPalavras = (captions, pares) => {
  let corrigidas;
  try {
    corrigidas = aplicarGlossario(captions, pares);
  } catch (e) {
    if (e instanceof ErroPalavras) throw new ErroUso(`Glossário inválido: ${e.message}`);
    throw e;
  }
  const trocadas = corrigidas.filter((p, i) => p.text !== captions[i].text).length;
  return {palavras: corrigidas, trocadas};
};

// Passo do script: acha o glossário, avisa se não existir e devolve as palavras para o .txt.
const palavrasParaTexto = (captions) => {
  const caminho = caminhoDoGlossario();
  const pares = lerGlossario(caminho);
  if (pares === null) {
    console.log(`AVISO: glossário não encontrado em ${paraRelativo(caminho)}; o .txt sai sem correção.`);
    return captions;
  }
  const {palavras, trocadas} = corrigirPalavras(captions, pares);
  console.log(
    `Glossário: ${Object.keys(pares).length} par(es) em ${paraRelativo(caminho)}; ` +
      `${trocadas} palavra(s) corrigida(s) no .txt (o .json fica bruto).`,
  );
  return palavras;
};

// ---------------------------------------------------------------- principal

const main = async () => {
  const opcoes = lerArgumentos(process.argv.slice(2));
  const nome = basename(opcoes.video, extname(opcoes.video));
  const saida = join(PASTA_SAIDA, `${nome}.palavras.json`);
  const saidaTexto = join(PASTA_SAIDA, `${nome}.palavras.txt`);

  // Modo --so-texto: não roda o Whisper, não precisa de config nem de ffmpeg.
  if (opcoes.soTexto) {
    if (!existsSync(saida)) {
      throw new ErroUso(`Não existe ${paraRelativo(saida)}. Rode sem --so-texto para transcrever primeiro.`);
    }
    if (existsSync(saidaTexto) && !opcoes.refazer) {
      throw new ErroUso(`Já existe ${paraRelativo(saidaTexto)}. Para regravar só o texto, use --so-texto --refazer.`);
    }
    const captions = JSON.parse(readFileSync(saida, 'utf8'));
    const linhas = gravarTexto(palavrasParaTexto(captions), saidaTexto);
    console.log(`Texto gravado: ${linhas} linhas -> ${paraRelativo(saidaTexto)} (a partir de ${paraRelativo(saida)}; Whisper não rodou)`);
    return;
  }

  const config = lerConfig();
  conferirWhisper(config, opcoes.modelo);
  exigirBinario('ffmpeg');
  exigirBinario('ffprobe');

  const existentes = [saida, saidaTexto].filter((c) => existsSync(c));
  if (existentes.length > 0 && !opcoes.refazer) {
    throw new ErroUso(
      `Já existe ${existentes.map(paraRelativo).join(' e ')}. Transcreve-se uma vez por vídeo; ` +
        'para refazer de propósito, rode de novo com --refazer.',
    );
  }
  if (opcoes.modelo.endsWith('.en') && opcoes.idioma !== 'en') {
    console.log(`AVISO: o modelo "${opcoes.modelo}" é só em inglês, mas o idioma é "${opcoes.idioma}".`);
  }

  console.log('== Transcrevendo ==');
  console.log(`vídeo:  ${paraRelativo(opcoes.video)}`);
  console.log(`modelo: ${opcoes.modelo} · idioma: ${opcoes.idioma} · whisper.cpp ${config.versao}`);

  const {wav, reaproveitado} = prepararAudio(opcoes.video, nome);
  const duracaoMs = duracaoDoAudioMs(wav);
  console.log(
    `áudio:  ${paraRelativo(wav)} (${reaproveitado ? 'já existia, reaproveitado' : 'extraído agora'}; ` +
      `${(duracaoMs / 1000).toFixed(1)} s)`,
  );
  console.log('Rodando o Whisper (leva em torno de 1x a duração do áudio na CPU)...');

  // O pacote grava um tmp.json na pasta de trabalho; com ela em out/, ele não cai na raiz.
  mkdirSync(PASTA_AUDIO, {recursive: true});
  process.chdir(PASTA_AUDIO);

  const inicio = Date.now();
  const resultado = await transcribe({
    inputPath: wav,
    whisperPath: config.whisperPath,
    whisperCppVersion: config.versao,
    model: opcoes.modelo,
    modelFolder: config.modelFolder,
    language: opcoes.idioma,
    tokenLevelTimestamps: true,
    splitOnWord: true,
    printOutput: false,
  });
  const segundos = (Date.now() - inicio) / 1000;

  const {captions} = toCaptions({whisperCppOutput: resultado});
  mkdirSync(PASTA_SAIDA, {recursive: true});
  writeFileSync(saida, JSON.stringify(captions, null, 2) + '\n'); // bruto: o glossário não entra aqui
  const linhas = gravarTexto(palavrasParaTexto(captions), saidaTexto);

  const ultima = captions[captions.length - 1];
  console.log(`\nFeito em ${segundos.toFixed(1)} s (${(segundos / (duracaoMs / 1000)).toFixed(2)}x a duração do áudio).`);
  console.log(`Palavras: ${captions.length} -> ${paraRelativo(saida)}`);
  console.log(`Texto:    ${linhas} linhas -> ${paraRelativo(saidaTexto)}`);
  if (ultima) {
    const passou = ultima.endMs > duracaoMs;
    console.log(
      `Última: "${ultima.text.trim()}" endMs=${ultima.endMs} · áudio=${Math.round(duracaoMs)} ms · ` +
        (passou ? `AVISO: passa do áudio em ${Math.round(ultima.endMs - duracaoMs)} ms` : 'não passa do áudio'),
    );
  }
};

// Só roda quando o arquivo é executado direto (node scripts/transcrever.mjs ...). Quando é
// importado (pelo scripts/teste-glossario.mjs), só entrega as funções exportadas.
const executadoDireto = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (executadoDireto) {
  main().catch((e) => {
    console.error(`\nERRO: ${e.message}`);
    process.exit(1);
  });
}
