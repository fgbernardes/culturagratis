import assert from "node:assert/strict";
import test from "node:test";
import { isCurrentEvent, todayInLisbon } from "../app/data/event-visibility.ts";

test("usa o dia civil de Lisboa nas transições de fuso", () => {
  assert.equal(todayInLisbon(new Date("2026-09-29T22:30:00Z")), "2026-09-29");
  assert.equal(todayInLisbon(new Date("2026-09-29T23:30:00Z")), "2026-09-30");
});

test("mostra eventos em curso e futuros, exclui os terminados", () => {
  const today = "2026-09-29";
  assert.equal(isCurrentEvent({ startDate: "2026-09-01", endDate: "2026-09-29" }, today), true);
  assert.equal(isCurrentEvent({ startDate: "2026-09-30", endDate: null }, today), true);
  assert.equal(isCurrentEvent({ startDate: "2026-09-28", endDate: null }, today), false);
  assert.equal(isCurrentEvent({ startDate: "2026-09-01", endDate: "2026-09-28" }, today), false);
});
