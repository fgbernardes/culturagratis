import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function readJsonc(path) {
  return JSON.parse(read(path).replace(/^\s*\/\/.*$/gm, ""));
}

test("publica a Home integral no domínio canónico e mantém o Worker atual associado ao www", () => {
  const config = readJsonc("wrangler.jsonc");

  assert.equal(config.vars.CGL_PRELAUNCH_MODE, "false");
  assert.deepEqual(config.routes, [
    { pattern: "www.culturagratis.com", custom_domain: true },
  ]);
});

test("a landing não corta conteúdo em ecrãs desktop com pouca altura", () => {
  const css = read("app/globals.css");
  const compactDesktop = css.match(
    /@media \(min-width: 1121px\) and \(max-height: 900px\) \{[\s\S]*?\n\}/,
  )?.[0];

  assert.ok(compactDesktop, "falta a variante desktop de menor altura");
  assert.match(compactDesktop, /height:\s*auto/);
  assert.match(compactDesktop, /overflow:\s*visible/);
});
