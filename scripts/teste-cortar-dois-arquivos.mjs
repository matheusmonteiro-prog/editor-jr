// Teste do modo de 2 arquivos do scripts/cortar-silencio.mjs (--tela + --camera).
// Rodar: node scripts/teste-cortar-dois-arquivos.mjs
//
// Tudo é criado numa pasta nova dentro do %TEMP% (nada no projeto, nada apagado)
// com o ffmpeg/ffprobe do PATH (lavfi testsrc2 e sine). Sem render do Remotion.
// Imprime OK ou lista as falhas (e sai com código 1).
//
// NÃO prova: render, sincronia com um par real de gravação, nem o JR na câmera.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(RAIZ, 'scripts', 'cortar-silencio.mjs');

const falhas = [];
let total = 0;
const conferir = (ok, msg) => {
  total++;
  if (!ok) falhas.push(msg);
};

const rodar = (bin, args) => spawnSync(bin, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});

// ---- pré-requisito: ffmpeg do PATH com lavfi, testsrc2 e sine
const probe = rodar('ffmpeg', ['-hide_banner', '-f', 'lavfi', '-i', 'testsrc2=d=0.1', '-f', 'lavfi', '-i', 'sine=d=0.1', '-f', 'null', '-']);
if (probe.error || probe.status !== 0) {
  console.error('ffmpeg do PATH ausente ou sem lavfi/testsrc2/sine. Teste não executado.');
  process.exit(2);
}

const pasta = mkdtempSync(join(tmpdir(), 'cs-dois-'));
console.log(`Pasta do teste: ${pasta}`);

// ---- vídeos sintéticos
// tela: 10 s, 30 fps, áudio 3 s de tom, 2 s mudo, 3 s de tom, 2 s mudo
const criarTela = (arquivo, fps) => {
  const r = rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', `testsrc2=s=320x240:r=${fps}:d=10`,
    '-f', 'lavfi', '-i', 'sine=f=440:d=10',
    '-af', "volume=0:enable='between(t,3,5)+between(t,8,10)'",
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', arquivo,
  ]);
  if (r.status !== 0) throw new Error(`falhou criando ${arquivo}:\n${r.stderr}`);
};
// câmera: 10 s, sem áudio
const criarCamera = (arquivo, fps) => {
  const r = rodar('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', `testsrc2=s=320x240:r=${fps}:d=10,hue=h=90`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', arquivo,
  ]);
  if (r.status !== 0) throw new Error(`falhou criando ${arquivo}:\n${r.stderr}`);
};

const tela = join(pasta, 'entrada', 'gravacao.mp4');
const camera = join(pasta, 'camera', 'gravacao.mp4'); // MESMO nome base, outra pasta
mkdirSync(dirname(tela), {recursive: true});
mkdirSync(dirname(camera), {recursive: true});
criarTela(tela, 30);
criarCamera(camera, 30);

const cortar = (args) => {
  const r = rodar(process.execPath, [SCRIPT, ...args]);
  return {codigo: r.status, saida: (r.stdout ?? '') + (r.stderr ?? '')};
};

const infoStream = (arquivo, selecao) => {
  const r = rodar('ffprobe', [
    '-v', 'error', '-select_streams', selecao, '-count_frames',
    '-show_entries', 'stream=codec_type,r_frame_rate,duration,nb_read_frames',
    '-of', 'json', arquivo,
  ]);
  const s = JSON.parse(r.stdout || '{}').streams ?? [];
  return s[0] ?? null;
};

// ---- 1. caminho feliz
const saidaDir = join(pasta, 'saida');
const ok = cortar(['--tela', tela, '--camera', camera, '--gerar', '--saida-dir', saidaDir]);
conferir(ok.codigo === 0, `caminho feliz: saiu com código ${ok.codigo}\n${ok.saida}`);
conferir(!ok.saida.includes('ATENÇÃO'), `caminho feliz: apareceu aviso inesperado\n${ok.saida}`);

const saidaTela = join(saidaDir, 'gravacao-tela-cortado-v1.mp4');
const saidaCamera = join(saidaDir, 'gravacao-camera-cortado-v1.mp4');
const jsonPath = join(saidaDir, 'gravacao.cortes.json');
conferir(existsSync(saidaTela), 'saída da tela não existe em --saida-dir');
conferir(existsSync(saidaCamera), 'saída da câmera não existe em --saida-dir');
conferir(existsSync(jsonPath), '.cortes.json não existe em --saida-dir');
conferir(!existsSync(join(dirname(tela), 'gravacao.cortes.json')), '.cortes.json foi gravado ao lado do original apesar de --saida-dir');

if (existsSync(saidaTela) && existsSync(saidaCamera) && existsSync(jsonPath)) {
  const vt = infoStream(saidaTela, 'v:0');
  const vc = infoStream(saidaCamera, 'v:0');
  const umFrame = 1 / 30;
  conferir(vt && vc, 'ffprobe não leu o vídeo de uma das saídas');
  if (vt && vc) {
    conferir(Math.abs(Number(vt.duration) - Number(vc.duration)) <= umFrame + 1e-6, `duração diferente: tela ${vt.duration}s, câmera ${vc.duration}s`);
    conferir(vt.nb_read_frames === vc.nb_read_frames, `nº de frames diferente: tela ${vt.nb_read_frames}, câmera ${vc.nb_read_frames}`);
  }
  conferir(infoStream(saidaTela, 'a:0')?.codec_type === 'audio', 'a tela cortada deveria ter áudio');
  conferir(infoStream(saidaCamera, 'a:0') === null, 'a câmera cortada não deveria ter áudio');

  const j = JSON.parse(readFileSync(jsonPath, 'utf8'));
  conferir(j.tipoSessao === 'two_files', `tipoSessao = ${j.tipoSessao}`);
  conferir(j.arquivos?.tela === tela && j.arquivos?.camera === camera, 'arquivos.tela/camera errados no .cortes.json');
  conferir(!('cameraMic' in (j.arquivos ?? {})), 'arquivos não deveria ter cameraMic');
  conferir(j.parametros?.deslocamentoCamera === 0, 'parametros.deslocamentoCamera deveria ser 0');
  const soma = j.trechos.reduce((a, t) => a + (t.fim - t.inicio), 0);
  conferir(Math.abs(soma - j.duracaoFinal) < 1e-6, `soma dos trechos ${soma} != duracaoFinal ${j.duracaoFinal}`);
  conferir(j.trechos.length === 2, `esperava 2 trechos, veio ${j.trechos.length}`);
  conferir(vt && Math.abs(Number(vt.duration) - j.duracaoFinal) < 0.15, `duração da saída ${vt?.duration}s longe de duracaoFinal ${j.duracaoFinal}s`);
}

// ---- 2. .cortes.json: igual é regravado; diferente não é sobrescrito
const igual = cortar(['--tela', tela, '--camera', camera, '--saida-dir', saidaDir]);
conferir(igual.codigo === 0, `rodar de novo a análise igual deveria passar (código ${igual.codigo})\n${igual.saida}`);
const antes = readFileSync(jsonPath, 'utf8');
const diferente = cortar(['--tela', tela, '--camera', camera, '--saida-dir', saidaDir, '--limiar', '-45']);
conferir(diferente.codigo !== 0 && diferente.saida.includes('DIFERENTE'), `.cortes.json diferente deveria parar (código ${diferente.codigo})\n${diferente.saida}`);
conferir(readFileSync(jsonPath, 'utf8') === antes, '.cortes.json diferente foi sobrescrito');

// ---- 3. erros
const soTela = cortar(['--tela', tela]);
conferir(soTela.codigo !== 0 && soTela.saida.includes('Faltou: --camera'), `só --tela deveria dar erro claro\n${soTela.saida}`);
const posicional = cortar(['--tela', tela, '--camera', camera, tela]);
conferir(posicional.codigo !== 0 && posicional.saida.includes('Não misture'), `posicional + camadas deveria dar erro\n${posicional.saida}`);
const inexistente = cortar(['--tela', tela, '--camera', join(pasta, 'nao-existe.mp4')]);
conferir(inexistente.codigo !== 0 && inexistente.saida.includes('Não achei o arquivo de --camera'), `arquivo inexistente deveria dar erro\n${inexistente.saida}`);

// ---- 4. fps diferente: só aviso, não erro
const camera25 = join(pasta, 'camera25', 'gravacao25.mp4');
mkdirSync(dirname(camera25), {recursive: true});
criarCamera(camera25, 25);
const fps = cortar(['--tela', tela, '--camera', camera25, '--gerar', '--saida-dir', join(pasta, 'saida-fps')]);
conferir(fps.codigo === 0, `fps diferente não deveria ser erro (código ${fps.codigo})\n${fps.saida}`);
conferir(/ATENÇÃO: a tela está a .* fps e a câmera a .* fps/.test(fps.saida), `fps diferente deveria avisar\n${fps.saida}`);

if (falhas.length === 0) {
  console.log(`OK (${total} verificações)`);
} else {
  console.error(`FALHOU (${falhas.length} de ${total}):`);
  for (const f of falhas) console.error(`  - ${f}`);
  process.exit(1);
}
