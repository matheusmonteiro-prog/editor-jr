import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Sem argumento, testa o hook do projeto. Com argumento, testa o caminho dado.
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = process.argv[2] ?? join(RAIZ, ".claude", "hooks", "bloquear-push.mjs");

// [comando, deveBloquear]
const casos = [
  ["git add .claude/hooks/bloquear-push.mjs", false],
  ['git commit -m "hook pega git push, nao arquivo"', false],
  ['git commit -m "hook bloqueia git push do Claude Code"', false],
  ["git log --grep push", false],
  ["git status", false],
  ["git push --dry-run origin noite-etapa6", true],
  ["git -C . push --dry-run origin noite-etapa6", true],
  ['git -C "minha pasta" push', true],
  ["git -c push.default=current push", true],
  ["git --no-pager push origin main", true],
  ["git push", true],
  ["git 'push' origin main", true],
  ["git add x && git push origin main", true],
  ['git commit -m "x"; git push', true],
  ["GIT_TRACE=1 git push", true],
  ["git.exe push", true],
  ["GIT push", true],
  // novos
  ["sudo git push", true],
  ['bash -c "git push"', true],
  ["xargs git push", true],
  ["cmd /c git push", true],
  // extras de segurança (falso positivo nos wrappers)
  ['echo "sudo git status"', false],
  ['bash -c "git status"', false],
  ['powershell -Command "git push origin main"', true],
  // variantes que antes passavam (command, env, caminho completo, alias via -c)
  ["command git push", true],
  ["env git push", true],
  ["/usr/bin/git push", true],
  ["git -c alias.p=push p", true],
  // e comandos comuns que devem continuar passando
  ["git log --oneline", false],
  ["env FOO=1 node -v", false],
  ["git config alias.p status", false],
];

let acertos = 0;
console.log("caso".padEnd(56), "esperado".padEnd(9), "resultado");
for (const [cmd, esperado] of casos) {
  const r = spawnSync("node", [hook], {
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command: cmd } }),
    encoding: "utf8",
  });
  const bloqueou = r.status === 2;
  const ok = bloqueou === esperado;
  if (ok) acertos++;
  console.log(
    cmd.padEnd(56),
    (esperado ? "bloquear" : "passar").padEnd(9),
    (bloqueou ? "bloqueou" : "passou").padEnd(9),
    ok ? "ok" : "ERRO",
  );
}
console.log(`\nAcertos: ${acertos} de ${casos.length}`);
process.exit(acertos === casos.length ? 0 : 1);
