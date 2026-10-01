import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("o bloqueio de pré-lançamento é ativado pela variável", () => {
  const worker = readFileSync("worker/index.ts", "utf8");
  const gate = readFileSync("worker/prelaunch.ts", "utf8");
  assert.match(worker, /isPrelaunchMode\(effectiveEnv\)/);
  assert.match(worker, /const effectiveEnv: Env = env/);
  assert.match(gate, /CGL_PRELAUNCH_MODE/);
  assert.match(gate, /www\.culturagratis\.com/);
});

test("a publicação de lançamento exige uma ação distinta e continua limitada a workers.dev", () => {
  const script = readFileSync("PUBLICAR_LANCAMENTO_WORKERS_DEV.ps1", "utf8");
  assert.match(script, /CGL_PRELAUNCH_MODE:false/);
  assert.match(script, /AGENDA_HTTP=/);
  assert.match(script, /CUSTOM_ROUTES=none/);
});
