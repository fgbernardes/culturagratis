import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const mobile = css.split("@media (max-width: 767px) {").at(-1).split("@media (min-width: 768px)")[0];

function declaration(selector, property, value) {
  assert.match(mobile, new RegExp(`\\${selector}\\s*\\{[^}]*${property}:\\s*${value}`, "i"));
}

test("newsletter precedes manifesto on mobile", () => {
  declaration(".cgl-coming-signup", "order", "1\\b");
  declaration(".cgl-coming-manifesto", "order", "2\\b");
});

test("mobile newsletter grid and social links fit the available width", () => {
  declaration(".cgl-coming-stage", "grid-template-columns", "minmax\\(0,\\s*1fr\\)");
  declaration(".cgl-coming-signup", "min-width", "0\\b");
  declaration(".cgl-signup-actions", "grid-template-columns", "minmax\\(0,\\s*1fr\\)");
  declaration(".cgl-consent", "grid-template-columns", "20px\\s+minmax\\(0,\\s*1fr\\)");
  declaration(".cgl-coming-socials", "flex-wrap", "wrap");
});
