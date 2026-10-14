// Teste do critério 4.6 da Etapa 4: sem pedido de legenda no plano, nada transcreve e nada de
// legenda aparece. Rodar: node scripts/teste-sem-legenda.mjs
// Imprime "OK (N casos)" ou lista as falhas (e sai com código 1).
//
// Os planos estão escritos AQUI DENTRO. Qualquer arquivo vai para uma pasta temporária do
// sistema, apagada no fim; nada é gravado em planos/ nem em videos/. Não roda o Whisper.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolverPlano} from './resolver-plano.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALIDADOR = path.join(RAIZ, 'scripts', 'validar-plano.mjs');
const RESOLVEDOR = path.join(RAIZ, 'scripts', 'resolver-plano.mjs');

const falhas = [];
let total = 0;
const igual = (nome, obtido, esperado) => {
  total++;
  const a = JSON.stringify(obtido);
  const b = JSON.stringify(esperado);
  if (a !== b) falhas.push(`${nome}: obtido ${a}, esperado ${b}`);
};

const elemento = (id, extra = {}) => ({
  id,
  componente: 'Checkmark',
  descricao: `teste ${id}`,
  texto: `texto ${id}`,
  inicio: '0:02',
  duracao: 2,
  posicao: 'topo',
  slot: 1,
  ilustrativo: false,
  tempo_estimado: false,
  props: {x: 300, y: 300, tamanho: 120, cor: '#F5F0E6', corFundo: '#0F2A1D', mostrarFundo: true, duracaoFrames: 60},
  ...extra,
});

// Plano SEM legenda: 2 elementos comuns, um deles com 2 componentes numa lista, sem naPalavra.
const planoSemLegenda = () => ({
  video: 'sem-legenda-teste',
  orientacao: 'vertical',
  elementos: [
    elemento('check-1'),
    elemento('check-2', {inicio: '0:06', slot: 2, props: {x: 300, y: 450, tamanho: 120, cor: '#F5F0E6', corFundo: '#0F2A1D', mostrarFundo: true, duracaoFrames: 60}}),
  ],
});

// Palavras de uma "transcrição" qualquer, só para provar que não são tocadas.
const palavras = () => [
  {text: ' juro', startMs: 1000, endMs: 1500, timestampMs: 1010, confidence: 0.9},
  {text: ' cai.', startMs: 1500, endMs: 2200, timestampMs: 1510, confidence: 0.9},
];

const pasta = mkdtempSync(path.join(os.tmpdir(), 'sem-legenda-'));
try {
  // ---- (a) validador: plano sem legenda dá 0 erro, 0 aviso, e não lê arquivo de palavras
  {
    const arquivo = path.join(pasta, 'sem-legenda.plano.json');
    writeFileSync(arquivo, JSON.stringify(planoSemLegenda(), null, 2));
    const antes = readdirSync(pasta).sort();
    const r = spawnSync(process.execPath, [VALIDADOR, arquivo], {cwd: RAIZ, encoding: 'utf8'});
    const saida = (r.stdout ?? '') + (r.stderr ?? '');
    igual('(a) validador: exit 0', r.status, 0);
    igual('(a) validador: 0 erro(s), 0 aviso(s)', saida.includes('Resumo: 0 erro(s), 0 aviso(s)'), true);
    igual('(a) validador: nenhum arquivo novo na pasta (nenhum JSON de transcrição criado)', readdirSync(pasta).sort(), antes);
    igual('(a) não existe videos/sem-legenda-teste.palavras.json (nada foi pedido nem criado)', existsSync(path.join(RAIZ, 'videos', 'sem-legenda-teste.palavras.json')), false);
    const textoValidador = readFileSync(VALIDADOR, 'utf8');
    igual('(a) o texto do validador não cita .palavras.json nem .palavras.txt (não lê arquivo de palavras)', /\.palavras\.(json|txt)/.test(textoValidador), false);
  }

  // ---- (b) resolverPlano: plano sem naPalavra e sem legendaPalavras volta igual; entrada intacta
  {
    const plano = planoSemLegenda();
    const pal = palavras();
    const planoAntes = JSON.stringify(plano);
    const palAntes = JSON.stringify(pal);
    const r = resolverPlano(plano, pal, {});
    igual('(b) resolverPlano: plano devolvido é igual ao de entrada', JSON.stringify(r), planoAntes);
    igual('(b) resolverPlano: é uma cópia (outro objeto)', r === plano, false);
    igual('(b) resolverPlano: plano de entrada não foi alterado', JSON.stringify(plano), planoAntes);
    igual('(b) resolverPlano: palavras de entrada não foram alteradas', JSON.stringify(pal), palAntes);
    igual('(b) resolverPlano: nenhum campo palavrasMs/inicio novo', r.elementos.some((e) => 'palavrasMs' in (e.props ?? {})), false);

    // mesma coisa com a lista de palavras vazia e com glossário
    const vazio = resolverPlano(planoSemLegenda(), [], {eipô: 'Apple'});
    igual('(b) resolverPlano: com palavras vazias também volta igual', JSON.stringify(vazio), planoAntes);
  }

  // ---- (c) o resultado não tem nenhum elemento LegendaAnimada
  {
    const r = resolverPlano(planoSemLegenda(), palavras(), {});
    const usaLegenda = (e) =>
      e.componente === 'LegendaAnimada' || (Array.isArray(e.componente) && e.componente.includes('LegendaAnimada'));
    igual('(c) nenhum elemento LegendaAnimada no resultado', r.elementos.some(usaLegenda), false);
    igual('(c) nenhuma chave legendaPalavras/destaques no resultado', r.elementos.some((e) => 'legendaPalavras' in e || 'destaques' in e), false);
  }

  // ---- (c2) pela CLI: o resolvedor com plano sem legenda grava o mesmo plano (pasta temporária)
  {
    const planoArq = path.join(pasta, 'cli-sem.plano.json');
    const palArq = path.join(pasta, 'palavras.json');
    const glosArq = path.join(pasta, 'glossario.json');
    const saidaDir = path.join(pasta, 'saida');
    writeFileSync(planoArq, JSON.stringify(planoSemLegenda()));
    writeFileSync(palArq, JSON.stringify(palavras()));
    writeFileSync(glosArq, JSON.stringify({pares: {}}));
    mkdirSync(saidaDir);
    const r = spawnSync(
      process.execPath,
      [RESOLVEDOR, '--plano', planoArq, '--palavras', palArq, '--glossario', glosArq, '--saida', saidaDir],
      {cwd: RAIZ, encoding: 'utf8'},
    );
    igual('(c2) CLI: exit 0', r.status, 0);
    const gravado = path.join(saidaDir, 'cli-sem.resolvido.json');
    igual('(c2) CLI: plano gravado é igual ao de entrada', existsSync(gravado) ? JSON.parse(readFileSync(gravado, 'utf8')) : null, planoSemLegenda());
    igual('(c2) CLI: a saída diz 0 legenda(s)', (r.stdout ?? '').includes('0 elemento(s) resolvido(s)') && !(r.stdout ?? '').includes('palavrasMs gravada'), true);
  }

  // ---- (d) por leitura do texto: nada importa nem executa transcrever.mjs / Whisper
  {
    const PADRAO = /transcrever(\.mjs)?|install-whisper-cpp|whisper\.cpp|\btranscribe\b/i;
    for (const nome of ['validar-plano.mjs', 'resolver-plano.mjs', 'palavras.mjs']) {
      const texto = readFileSync(path.join(RAIZ, 'scripts', nome), 'utf8');
      const achou = texto.split('\n').filter((l) => PADRAO.test(l));
      igual(`(d) scripts/${nome}: não menciona transcrever.mjs nem o Whisper/install-whisper-cpp`, achou, []);
    }
    // nem o código do Remotion (src/) nem os "scripts" do package.json chamam a transcrição
    const pacote = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));
    igual('(d) package.json: nenhum script chama transcrever.mjs', Object.values(pacote.scripts ?? {}).some((v) => /transcrever/.test(v)), false);
    const varrer = (dir) =>
      readdirSync(dir, {withFileTypes: true}).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? varrer(p) : /\.(tsx?|mjs|js)$/.test(d.name) ? [p] : [];
      });
    const citam = varrer(path.join(RAIZ, 'src')).filter((p) => PADRAO.test(readFileSync(p, 'utf8')));
    igual('(d) src/: nenhum arquivo cita transcrever.mjs nem o Whisper', citam.map((p) => path.relative(RAIZ, p)), []);
  }
} finally {
  rmSync(pasta, {recursive: true, force: true});
}

if (falhas.length) {
  console.log(`${falhas.length} de ${total} casos falharam:`);
  for (const f of falhas) console.log('  ' + f);
  process.exit(1);
}
console.log(`OK (${total} casos)`);
