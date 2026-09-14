import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("a importação em lote aceita até 100 candidatos e força-os para verificação", () => {
  const route = readFileSync("app/api/gestao/eventos/route.ts", "utf8");
  assert.match(route, /const batch = Array\.isArray\(payload\.events\)/);
  assert.match(route, /if \(batch\.length > 100\)/);
  assert.match(route, /status: isBatch \? "review"/);
});

test("o backoffice permite colar um lote JSON antes de o guardar", () => {
  const client = readFileSync("app/admin/admin-client.tsx", "utf8");
  assert.match(client, /Importar lote/);
  assert.match(client, /JSON\.parse\(batchText\)/);
  assert.match(client, /events: parsed/);
});
