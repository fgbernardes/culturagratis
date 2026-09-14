import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("o bloqueio de pré-lançamento é ativado por variável explícita", () => {
  const worker = readFileSync("worker/index.ts", "utf8");
  const gate = readFileSync("worker/prelaunch.ts", "utf8");
  assert.match(worker, /isPrelaunchMode\(env\)/);
  assert.match(gate, /CGL_PRELAUNCH_MODE/);
});

test("a publicação de lançamento exige uma ação distinta e continua limitada a workers.dev", () => {
  const script = readFileSync("PUBLICAR_LANCAMENTO_WORKERS_DEV.ps1", "utf8");
  assert.match(script, /CGL_PRELAUNCH_MODE:false/);
  assert.match(script, /AGENDA_HTTP=/);
  assert.match(script, /CUSTOM_ROUTES=none/);
});
