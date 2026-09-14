import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("a publicação de lançamento verifica indexação, robots e sitemap", () => {
  const script = readFileSync("PUBLICAR_LANCAMENTO_WORKERS_DEV.ps1", "utf8");
  assert.match(script, /HOME_ROBOTS=noindex not present/);
  assert.match(script, /ROBOTS_DISALLOW_ROOT=false/);
  assert.match(script, /SITEMAP_HAS_AGENDA=true/);
});
