let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  const dados = JSON.parse(entrada);
  const comando = dados.tool_input?.command ?? "";
  // "git" seguido de "push" no mesmo comando, mesmo com flags no meio (git -C . push)
  if (/\bgit\b[^;&|\n]*\bpush\b/i.test(comando)) {
    console.error("Bloqueado por hook: git push só com o Matheus autorizando.");
    process.exit(2);
  }
  process.exit(0);
});
