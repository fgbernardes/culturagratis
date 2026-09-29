import assert from "node:assert/strict";
import test from "node:test";
import { dateRangeInLisbon, nextSevenDaysInLisbon } from "../app/data/lisbon-calendar.ts";

test("Hoje e Amanhã seguem Lisboa quando o dispositivo ainda está no dia anterior", () => {
  const now = new Date("2026-09-29T23:30:00Z");
  assert.deepEqual(dateRangeInLisbon("hoje", now), ["2026-09-30", "2026-09-30"]);
  assert.deepEqual(dateRangeInLisbon("amanha", now), ["2026-10-01", "2026-10-01"]);
  assert.deepEqual(dateRangeInLisbon("7-dias", now), ["2026-09-30", "2026-10-06"]);
});

test("a faixa semanal acompanha a mudança de mês em Lisboa", () => {
  const days = nextSevenDaysInLisbon(new Date("2026-09-29T23:30:00Z"));
  assert.deepEqual(days.map(({ date }) => date), ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06"]);
  assert.equal(days[0].label, "HOJE");
  assert.equal(days[1].label, "AMANHÃ");
});

test("o filtro de fim de semana conserva o domingo em curso", () => {
  assert.deepEqual(dateRangeInLisbon("fim-de-semana", new Date("2026-10-04T12:00:00Z")), ["2026-10-04", "2026-10-04"]);
});
