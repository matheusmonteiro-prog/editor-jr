#!/usr/bin/env node
/**
 * higgsfield-catalogo.mjs — mantém a base de conhecimento da Higgsfield em docs/higgsfield/ (11/11/2026).
 *
 * O que faz (não gera nada e NÃO gasta crédito):
 *   1. lê a documentação oficial (docs.higgsfield.ai): lista de modelos de vídeo e imagem, a página de
 *      cada família e a página de cada "workflow" (cada endereço da API);
 *   2. tira de cada página: endereço, notas de uso e o esquema completo dos campos (JSON schema);
 *   3. com --precos, pergunta o preço de cada endereço em POST /estimate/<endereço> (rota da doc,
 *      "Billing and retention"; estimar não cria pedido nem cobra). Usa o exemplo da própria página;
 *   4. compara com a foto anterior (docs/higgsfield/catalogo.json) e, se algo mudou, escreve o que
 *      mudou no topo de docs/higgsfield/novidades.md;
 *   5. regrava docs/higgsfield/catalogo.json (foto para comparar) e docs/higgsfield/catalogo.md (leitura).
 *
 * Uso:
 *   node scripts/higgsfield-catalogo.mjs              # doc só (sem chave, sem custo)
 *   node scripts/higgsfield-catalogo.mjs --precos     # doc + preços (precisa do .env; não cobra)
 *
 * Chaves: HF_API_KEY_ID / HF_API_KEY_SECRET do .env. Nunca são impressas nem gravadas.
 * Saída: 0 = ok (com ou sem novidades) · 1 = erro.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(RAIZ, ".env"), quiet: true });
const DOCS = "https://docs.higgsfield.ai/docs";
const API = "https://api.higgsfield.ai";
const PASTA = path.join(RAIZ, "docs", "higgsfield");
const FOTO = path.join(PASTA, "catalogo.json");
const LEITURA = path.join(PASTA, "catalogo.md");
const NOVIDADES = path.join(PASTA, "novidades.md");
const AGENTE = "editor-jr-catalogo (leitura da doc)";
const COM_PRECOS = process.argv.includes("--precos");

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const hoje = () => new Date().toISOString().slice(0, 10);

async function baixar(url, tentativas = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": AGENTE } });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
      throw new Error(`HTTP ${r.status}`);
    } catch (e) {
      if (i >= tentativas) throw new Error(`${url}: ${e.message}`);
      await dormir(1500 * i);
    }
  }
}

const links = (texto, padrao) => [...new Set([...texto.matchAll(padrao)].map((m) => m[0]))];

// Tira as informações de uma página de workflow.
function lerWorkflow(texto, url) {
  const titulo = (texto.match(/^# (.+)$/m) ?? [])[1]?.trim() ?? url;
  const endereco = (texto.match(/\*\*Endpoint:\*\* `(?:POST|GET) ([^`]+)`/) ?? [])[1] ?? null;
  const id = (texto.match(/\*\*Endpoint ID:\*\* `([^`]+)`/) ?? [])[1] ?? null;
  const resumo = (texto.match(/^> (?!\[|## |Fetch|Use this)(.+)$/m) ?? [])[1]?.trim() ?? "";
  const notas = [];
  const blocoNotas = texto.split(/^## Usage notes\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  for (const m of blocoNotas.matchAll(/^\* (.+)$/gm)) notas.push(m[1].replace(/\\_/g, "_").trim());
  // Esquema completo: bloco ```json dentro do acordeão "Complete JSON schema", linhas com "> ".
  let esquema = null;
  const ac = texto.split(/\[accordion\] Complete JSON schema/)[1];
  if (ac) {
    const linhas = ac.split("\n").filter((l) => l.startsWith(">")).map((l) => l.replace(/^> ?/, ""));
    const ini = linhas.findIndex((l) => l.startsWith("```json"));
    const fim = linhas.findIndex((l, i) => i > ini && l.startsWith("```"));
    if (ini >= 0 && fim > ini) {
      try { esquema = JSON.parse(linhas.slice(ini + 1, fim).join("\n")); } catch { esquema = null; }
    }
  }
  // Exemplo do "Quick start" (corpo do cURL), usado só para pedir o preço.
  let exemplo = null;
  const dados = texto.match(/--data '(\{[\s\S]*?\})'/);
  if (dados) { try { exemplo = JSON.parse(dados[1]); } catch { exemplo = null; } }
  return { titulo, url, endereco, id, resumo, notas, esquema, exemplo };
}

// Campos em forma curta: nome: tipo (padrão; valores; mín-máx).
function campos(esquema) {
  if (!esquema?.properties) return [];
  const obrig = new Set(esquema.required ?? []);
  return Object.entries(esquema.properties).map(([nome, p]) => {
    const tipo = p.type ?? (p.enum ? "enum" : p.anyOf ? "vários" : "?");
    const partes = [];
    if (p.enum) partes.push(p.enum.map((v) => JSON.stringify(v)).join(" | "));
    if (p.minimum !== undefined || p.maximum !== undefined) partes.push(`${p.minimum ?? ""}..${p.maximum ?? ""}`);
    if (p.minItems !== undefined || p.maxItems !== undefined) partes.push(`${p.minItems ?? 0} a ${p.maxItems ?? "∞"} itens`);
    if (p.maxLength !== undefined) partes.push(`até ${p.maxLength} caracteres`);
    if (p.default !== undefined) partes.push(`padrão ${JSON.stringify(p.default)}`);
    return { nome, tipo, obrigatorio: obrig.has(nome), detalhe: partes.join("; ") };
  });
}

async function preco(id, exemplo) {
  const chave = process.env.HF_API_KEY_ID, segredo = process.env.HF_API_KEY_SECRET;
  if (!chave || !segredo) return null;
  try {
    const r = await fetch(`${API}/estimate/${id}`, {
      method: "POST",
      headers: { Authorization: `Key ${chave}:${segredo}`, "Content-Type": "application/json" },
      body: JSON.stringify(exemplo ?? {}),
    });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = { bruto: t.slice(0, 300) }; }
    if (!r.ok) return { erro: `${r.status}: ${JSON.stringify(j).slice(0, 200)}` };
    if (j.usd !== undefined && typeof j.usd !== "object") return { usd_exemplo: String(j.usd) };
    const descricao = j.pricing_description ?? j.usd?.pricing_description;
    if (descricao) return { tabela: descricao };
    return { bruto: JSON.stringify(j).slice(0, 600) };
  } catch (e) {
    return { erro: e.message };
  }
}

// Compara duas fotos e devolve as linhas de novidade.
function comparar(antes, agora) {
  if (!antes) return ["Primeira foto do catálogo (sem comparação)."];
  const a = new Map(antes.workflows.map((w) => [w.id ?? w.url, w]));
  const b = new Map(agora.workflows.map((w) => [w.id ?? w.url, w]));
  const linhas = [];
  for (const [k, w] of b) if (!a.has(k)) linhas.push(`**NOVO:** ${w.titulo} — \`${w.id}\`. ${w.resumo}`);
  for (const [k, w] of a) if (!b.has(k)) linhas.push(`**SAIU da doc:** ${w.titulo} — \`${w.id}\`.`);
  for (const [k, w] of b) {
    const v = a.get(k);
    if (!v) continue;
    const ca = new Map(v.campos.map((c) => [c.nome, c])), cb = new Map(w.campos.map((c) => [c.nome, c]));
    for (const [n, c] of cb) {
      if (!ca.has(n)) linhas.push(`${w.titulo}: campo novo \`${n}\` (${c.tipo}${c.detalhe ? `; ${c.detalhe}` : ""}).`);
      else if (ca.get(n).detalhe !== c.detalhe) linhas.push(`${w.titulo}: \`${n}\` mudou de "${ca.get(n).detalhe}" para "${c.detalhe}".`);
    }
    for (const n of ca.keys()) if (!cb.has(n)) linhas.push(`${w.titulo}: campo \`${n}\` saiu.`);
    if (JSON.stringify(v.notas) !== JSON.stringify(w.notas)) linhas.push(`${w.titulo}: as notas de uso mudaram.`);
    const pa = JSON.stringify(v.preco ?? null), pb = JSON.stringify(w.preco ?? null);
    if (w.preco && !w.preco.erro && v.preco && !v.preco.erro && pa !== pb) linhas.push(`${w.titulo}: **preço mudou**.`);
  }
  return linhas;
}

function montarLeitura(foto) {
  const l = [];
  l.push("# Catálogo da API Higgsfield (gerado)");
  l.push("");
  l.push(`> Gerado por \`scripts/higgsfield-catalogo.mjs\` em ${foto.em}. **Não edite à mão**: rode o script.`);
  l.push("> Fonte: docs.higgsfield.ai. Preço: rota `/estimate` da API (não cobra). Guia de uso: `docs/higgsfield/guia.md`.");
  l.push("");
  l.push(`${foto.workflows.length} endereços (${foto.workflows.filter((w) => w.tipo === "vídeo").length} de vídeo, ${foto.workflows.filter((w) => w.tipo === "imagem").length} de imagem).`);
  l.push("");
  for (const tipo of ["vídeo", "imagem"]) {
    l.push(`## ${tipo === "vídeo" ? "Vídeo" : "Imagem"}`);
    l.push("");
    for (const w of foto.workflows.filter((x) => x.tipo === tipo)) {
      l.push(`### ${w.titulo}`);
      l.push("");
      if (w.resumo) l.push(w.resumo);
      l.push(`- Endereço: \`POST ${w.endereco ?? "?"}\``);
      l.push(`- Página: ${w.url}`);
      if (w.preco?.tabela) l.push(`- Preço (API): ${w.preco.tabela.replace(/\s*\n+\s*/g, " ")}`);
      else if (w.preco?.usd_exemplo) l.push(`- Preço do exemplo da página (API): US$ ${w.preco.usd_exemplo}`);
      else if (w.preco?.erro) l.push(`- Preço: não consegui consultar (${w.preco.erro})`);
      else if (w.preco?.bruto) l.push(`- Preço (resposta da API): ${w.preco.bruto}`);
      if (w.notas.length) {
        l.push("- Notas de uso:");
        for (const n of w.notas) l.push(`  - ${n}`);
      }
      if (w.campos.length) {
        l.push("- Campos (\\* = obrigatório):");
        for (const c of w.campos) l.push(`  - \`${c.nome}\`${c.obrigatorio ? "\\*" : ""} ${c.tipo}${c.detalhe ? ` — ${c.detalhe}` : ""}`);
      }
      l.push("");
    }
  }
  return l.join("\n");
}

async function main() {
  await mkdir(PASTA, { recursive: true });
  const workflows = [];
  for (const [tipo, pagina] of [["vídeo", "models/video-generation"], ["imagem", "models/image-generation"]]) {
    const lista = await baixar(`${DOCS}/${pagina}.md`);
    if (!lista) throw new Error(`Página do catálogo sumiu: ${pagina}`);
    const familias = links(lista, /https:\/\/docs\.higgsfield\.ai\/docs\/models\/[a-z0-9-]+\.md/g);
    for (const f of familias) {
      const tf = await baixar(f);
      if (!tf) continue;
      const nomeFam = f.split("/").pop().replace(".md", "");
      const wfs = links(tf, new RegExp(`https://docs\\.higgsfield\\.ai/docs/models/${nomeFam}/[a-z0-9-]+\\.md`, "g"));
      for (const u of wfs) {
        const tw = await baixar(u);
        if (!tw) continue;
        const w = lerWorkflow(tw, u);
        workflows.push({ tipo, familia: nomeFam, ...w, campos: campos(w.esquema) });
      }
    }
    console.log(`${tipo}: ${workflows.filter((w) => w.tipo === tipo).length} endereços lidos`);
  }
  if (COM_PRECOS) {
    let n = 0;
    for (const w of workflows) {
      if (!w.id) continue;
      w.preco = await preco(w.id, w.exemplo);
      n++;
      await dormir(250);
    }
    console.log(`preços consultados: ${n} (estimar não cobra)`);
  }
  const antes = existsSync(FOTO) ? JSON.parse(await readFile(FOTO, "utf8")) : null;
  if (!COM_PRECOS && antes) {
    // Sem --precos, mantém os preços da foto anterior para não "apagar" o que já se sabia.
    const velhos = new Map(antes.workflows.map((w) => [w.id ?? w.url, w.preco]));
    for (const w of workflows) if (velhos.get(w.id ?? w.url)) w.preco = velhos.get(w.id ?? w.url);
  }
  const foto = {
    em: hoje(),
    workflows: workflows.map(({ esquema, exemplo, ...resto }) => ({ ...resto, esquema })),
  };
  const novidades = comparar(antes, foto);
  await writeFile(FOTO, JSON.stringify(foto, null, 2) + "\n");
  await writeFile(LEITURA, montarLeitura(foto) + "\n");
  if (novidades.length && !(novidades.length === 1 && antes === null && existsSync(NOVIDADES))) {
    const velho = existsSync(NOVIDADES) ? await readFile(NOVIDADES, "utf8") : "# Novidades da Higgsfield\n\nCada rodada do `scripts/higgsfield-catalogo.mjs` que achou mudança na doc ou no preço entra no topo.\n";
    const [cab, ...resto] = velho.split(/\n(?=## )/);
    const bloco = `## ${hoje()}\n\n${novidades.map((x) => `- ${x}`).join("\n")}\n`;
    await writeFile(NOVIDADES, [cab.trimEnd(), "", bloco, ...resto].join("\n"));
  }
  console.log(novidades.length ? `novidades: ${novidades.length} (ver docs/higgsfield/novidades.md)` : "sem novidades desde a última foto");
}

main().catch((e) => { console.error("erro:", e.message); process.exit(1); });
