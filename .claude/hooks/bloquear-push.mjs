let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  const dados = JSON.parse(entrada);
  const comando = dados.tool_input?.command ?? "";
  // "git" seguido de "push" no mesmo comando, mesmo com flags no meio (git -C . push)
  if (
    /(?:^|[;&|(\n])\s*(?:\w+=\S+\s+)*git(?:\.exe)?(?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--?[\w-]+(?:=\S+)?))*\s+["']?push["']?(?=\s|$|[;&|)])/i.test(comando) ||
    /(?:^|[;&|(\n])\s*(?:\w+=\S+\s+)*(?:(?:ba|z|da)?sh\s+-\w*c|sudo|xargs|cmd(?:\.exe)?\s+\/[ck]|(?:pwsh|powershell)(?:\.exe)?\s+(?:-\w+\s+)*-(?:Command|c))\b[^;&|\n]*?\bgit(?:\.exe)?(?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--?[\w-]+(?:=\S+)?))*\s+["']?push["']?(?=[\s"')]|$)/i.test(comando) ||
    // command/env na frente, e git com caminho completo (ex.: /usr/bin/git push)
    /(?:^|[;&|(\n])\s*(?:\w+=\S+\s+)*(?:(?:command|env)(?:\s+(?:-\S+|\w+=\S+))*\s+)?(?:[^\s;&|()"']*[\/\\])?git(?:\.exe)?(?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--?[\w-]+(?:=\S+)?))*\s+["']?push["']?(?=\s|$|[;&|)])/i.test(comando) ||
    // alias de push criado na hora: git -c alias.<nome>=push <nome>
    /(?:^|[;&|(\n])\s*(?:\w+=\S+\s+)*(?:(?:command|env)(?:\s+(?:-\S+|\w+=\S+))*\s+)?(?:[^\s;&|()"']*[\/\\])?git(?:\.exe)?\s+(?:[^;&|\n]*?\s)?-c\s+["']?alias\.[\w.-]+=["']?push\b/i.test(comando)
  ) {
    console.error("Bloqueado por hook: git push só com o Matheus autorizando.");
    process.exit(2);
  }
  process.exit(0);
});
