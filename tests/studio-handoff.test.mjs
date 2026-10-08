import assert from "node:assert/strict";
import test from "node:test";
import { buildStudioEventPayload } from "../app/admin/studio-event-payload.ts";
import { parseEventText } from "../app/admin/studio/editor/utils/eventParser.ts";

const event = {
  id: "123", status: "verified", title: "Concerto no bairro", startDate: "2026-10-10",
  endDate: null, timeLabel: "18h", venue: "Centro Cultural", area: "Alcântara",
  category: "Música", accessType: "Reserva gratuita", access: "Reserva gratuita no site da organização",
  condition: "Reserva gratuita", sourceName: "Organização", sourceUrl: "https://example.org",
};

test("o handoff conserva a condição verificada e não pede o selo Entrada livre", () => {
  const result = buildStudioEventPayload(event);
  assert.deepEqual(result.errors, []);
  assert.equal(result.payload.access, "Reserva gratuita no site da organização");
  assert.equal(result.payload.accessType, "Reserva gratuita");
  assert.equal(result.payload.freguesia, "Alcântara");
  assert.equal(result.payload.source, "Organização");
  assert.equal(result.payload.date, "10 de outubro de 2026 · 18h");
  assert.equal("isFree" in result.payload, false);
});

test("o handoff bloqueia campos não verificados e eventos não aprovados", () => {
  const result = buildStudioEventPayload({ ...event, status: "review", title: " ", timeLabel: "Horário a confirmar", accessType: "Por confirmar" });
  assert.ok(result.errors.includes("Evento ainda não verificado ou publicado."));
  assert.ok(result.errors.includes("Título em falta."));
  assert.ok(result.errors.includes("Data e hora confirmadas em falta."));
  assert.ok(result.errors.includes("Condição de acesso verificada em falta."));
});

test("o Studio lê acesso e fonte sem converter reserva gratuita em Entrada livre", () => {
  const parsed = parseEventText(JSON.stringify({ ...buildStudioEventPayload(event).payload, isFree: true }));
  assert.equal(parsed.access, event.access);
  assert.equal(parsed.freguesia, event.area);
  assert.equal(parsed.source, event.sourceName);
  assert.equal(parsed.isFree, false);
});

test("a importação antiga com isFree continua disponível", () => {
  assert.equal(parseEventText('{"title":"Concerto","isFree":true}').isFree, true);
});
