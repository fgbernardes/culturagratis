import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("aceita o 404 administrativo durante o pré-lançamento", () => {
  const script = readFileSync("PUBLICAR_WORKERS_DEV.ps1", "utf8");
  assert.match(script, /\[int\]\$ExpectedStatus = 200/);
  assert.match(script, /\$statusCode -eq \$ExpectedStatus/);
  assert.match(script, /Get-VerifiedHttpStatus -Uri \$adminLoginUrl -ExpectedStatus 404/);
});
