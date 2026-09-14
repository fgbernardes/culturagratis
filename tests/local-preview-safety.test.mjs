import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("a prévia local protege os segredos e só escuta no computador local", () => {
  const gitignore = readFileSync(".gitignore", "utf8");
  const script = readFileSync("PREVISUALIZAR_LANCAMENTO_LOCAL.ps1", "utf8");
  assert.match(gitignore, /^\.dev\.vars$/m);
  assert.match(script, /SUPABASE_SECRET_KEY/);
  assert.match(script, /--local/);
  assert.match(script, /--ip", "127\.0\.0\.1"/);
});
