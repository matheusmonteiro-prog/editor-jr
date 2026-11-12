#!/usr/bin/env node
/**
 * render-final.mjs — monta o comando `npx remotion render` final pro
 * editor-jr (vertical 1080x1920 ou horizontal 1920x1080, 30fps).
 *
 * Caminho de saída: PASTA_OUT, a mesma variável usada em
 * scripts/folha-contato.mjs. No Windows, sem a variável definida, cai no
 * padrão local (~/editor-jr/out, via os.homedir()); dentro do WSL — onde o
 * render de fato funciona hoje, ver ARQUITETURA.md "Ambiente de render
 * (WSL)" — o caminho real é ~/editor-jr/out dentro do Linux, que é outro
 * filesystem. A mesma variável de ambiente resolve os dois: define
 * PASTA_OUT no ambiente onde o script rodar.
 *
 * Uso:
 *   node scripts/render-final.mjs <composicao> <nome-saida> [--formato vertical|horizontal] [--plano <arquivo>] [--dry-run]
 *
 * --plano <arquivo>: nome de um .json de planos/ ou planos/atual/ (ex.: 0926.plano.json ou
 * atual/0926.atual.json). O nome é conferido contra a lista real dessas duas pastas (sem
 * caminho livre, sem ".."). ANTES de qualquer render roda scripts/validar-plano.mjs nele
 * (sem shell); erro = aborta com código 1. Com --dry-run só valida e mostra o que renderizaria.
 * ATENÇÃO: hoje a composição lê o plano importado em src/Root.tsx; --plano só garante que o
 * arquivo conferido está válido, ele ainda NÃO troca o plano usado pelo render (fatia futura).
 *
 * --dry-run só imprime o comando montado, nunca executa nada.
 * SEM --dry-run o script executa `npx remotion render` de verdade — nunca
 * rodar assim numa máquina onde o render está bloqueado (ver ARQUITETURA.md,
 * erro 0xC0E90002 do Controle de aplicativos do Windows).
 *
 * Flags de resolução/fps usadas abaixo (--width/--height/--fps) foram
 * confirmadas na saída real de `npx remotion render --help` — ver
 * docs/etapa8-notas.md. --codec e --video-bitrate também existem lá, e são
 * opcionais aqui (sem valor, usa o padrão do Remotion).
 */

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
// Opções que levam valor: o valor não conta como argumento posicional.
const COM_VALOR = ['--formato', '--codec', '--video-bitrate', '--plano'];
const posicionais = argv.filter((a, i) => !a.startsWith('--') && !COM_VALOR.includes(argv[i - 1]));
const [composicao, nomeSaida] = posicionais;

const opcao = (nome, padrao = null) => {
  const i = argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : argv[i + 1];
};
const temFlag = (nome) => argv.includes(`--${nome}`);

if (!composicao || !nomeSaida) {
  console.error(
    'Uso: node scripts/render-final.mjs <composicao> <nome-saida> [--formato vertical|horizontal] [--codec X] [--video-bitrate X] [--plano arquivo] [--dry-run]',
  );
  process.exit(1);
}

const formato = opcao('formato', 'vertical');
if (formato !== 'vertical' && formato !== 'horizontal') {
  console.error(`--formato inválido: "${formato}" (use "vertical" ou "horizontal")`);
  process.exit(1);
}

// Etapa 8 pede só estes dois formatos, 30fps.
const RESOLUCAO = {
  vertical: { width: 1080, height: 1920 },
  horizontal: { width: 1920, height: 1080 },
};
const { width, height } = RESOLUCAO[formato];
const fps = 30;

const pastaOut = process.env.PASTA_OUT ?? join(homedir(), 'editor-jr', 'out');
const caminhoSaida = join(pastaOut, `${nomeSaida}.mp4`);

const codec = opcao('codec');
const videoBitrate = opcao('video-bitrate');

const args = [
  'remotion',
  'render',
  'src/index.ts',
  composicao,
  caminhoSaida,
  '--width', String(width),
  '--height', String(height),
  '--fps', String(fps),
];
if (codec) args.push('--codec', codec);
if (videoBitrate) args.push('--video-bitrate', videoBitrate);

// --plano: valida o arquivo ANTES de qualquer coisa que renderize.
const planoPedido = opcao('plano');
if (temFlag('plano') && !planoPedido) {
  console.error('--plano precisa de um nome (ex.: --plano 0926.plano.json ou --plano atual/0926.atual.json)');
  process.exit(1);
}
if (planoPedido) {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
  const listar = (pasta, prefixo) => {
    try {
      return readdirSync(join(raiz, 'planos', pasta), { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith('.json'))
        .map((d) => prefixo + d.name);
    } catch {
      return [];
    }
  };
  const permitidos = [...listar('', ''), ...listar('atual', 'atual/')];
  if (!/^(atual\/)?[A-Za-z0-9._-]+\.json$/.test(planoPedido) || planoPedido.includes('..') || !permitidos.includes(planoPedido)) {
    console.error(`--plano "${planoPedido}" não é aceito. Use um destes (planos/ ou planos/atual/):`);
    console.error(permitidos.map((p) => `  ${p}`).join('\n') || '  (nenhum)');
    process.exit(1);
  }
  const arquivoPlano = join(raiz, 'planos', planoPedido);
  console.log(`Validando ${planoPedido} antes de renderizar…`);
  const v = spawnSync(process.execPath, [join(raiz, 'scripts', 'validar-plano.mjs'), arquivoPlano], { encoding: 'utf8' });
  process.stdout.write(v.stdout ?? '');
  process.stderr.write(v.stderr ?? '');
  if (v.status !== 0) {
    console.error(`\nABORTADO: o validador achou erro em ${planoPedido} (código ${v.status ?? 'sem código'}). Nada foi renderizado.`);
    process.exit(1);
  }
  console.log(`Plano válido: ${planoPedido}`);
}

const comandoLegivel = `npx ${args.join(' ')}`;

if (temFlag('dry-run')) {
  if (planoPedido) console.log(`(dry-run) renderizaria com o plano conferido: planos/${planoPedido}`);
  console.log(comandoLegivel);
  process.exit(0);
}

console.log(`Rodando: ${comandoLegivel}`);
const resultado = spawnSync('npx', args, { stdio: 'inherit', shell: true });
process.exit(resultado.status ?? 1);
