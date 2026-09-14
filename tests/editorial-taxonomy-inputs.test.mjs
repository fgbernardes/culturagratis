import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("a API valida a taxonomia antes de criar eventos", () => {
  const route = readFileSync("app/api/gestao/eventos/route.ts", "utf8");
  assert.match(route, /isAllowedCategory\(category\)/);
  assert.match(route, /isAllowedAccessType\(accessType\)/);
  assert.match(route, /sanitizeEventTags/);
});

test("a migração restringe etiquetas ao vocabulário aprovado", () => {
  const migration = readFileSync("supabase/migrations/202609140001_editorial_taxonomy.sql", "utf8");
  assert.match(migration, /editorial_tags text\[\]/);
  assert.match(migration, /events_editorial_tags_check/);
});
