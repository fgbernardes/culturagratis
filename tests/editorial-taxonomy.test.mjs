import assert from "node:assert/strict";
import test from "node:test";
import { accessTypes, eventTags, isAllowedAccessType, isAllowedCategory, sanitizeEventTags } from "../app/editorial-taxonomy.ts";

test("mantém as dez categorias editoriais aprovadas", () => {
  assert.equal(isAllowedCategory("Música"), true);
  assert.equal(isAllowedCategory("Cultura comunitária e festivais"), true);
  assert.equal(isAllowedCategory("Concertos"), false);
});

test("fecha tipos de acesso e etiquetas ao vocabulário aprovado", () => {
  assert.equal(accessTypes.length, 5);
  assert.equal(isAllowedAccessType("Reserva gratuita"), true);
  assert.equal(isAllowedAccessType("Grátis"), false);
  assert.deepEqual(sanitizeEventTags(["Ao ar livre", "Cultura de bairro", "Ao ar livre", "Concerto"]), ["Ao ar livre", "Cultura de bairro"]);
  assert.equal(eventTags.includes("Língua Gestual Portuguesa"), true);
});
