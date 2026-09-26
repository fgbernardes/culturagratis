import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { isCanonicalPrelaunchHost } from "../worker/prelaunch.ts";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function readJsonc(path) {
  return JSON.parse(read(path).replace(/^\s*\/\/.*$/gm, ""));
}

test("publica o site integral no workers.dev e mantém a landing no www", () => {
  const config = readJsonc("wrangler.jsonc");

  assert.equal(config.vars.CGL_PRELAUNCH_MODE, "false");
  assert.deepEqual(config.routes, [
    { pattern: "www.culturagratis.com", custom_domain: true },
  ]);
});

test("separa o modo público por hostname", () => {
  assert.equal(isCanonicalPrelaunchHost("www.culturagratis.com"), true);
  assert.equal(isCanonicalPrelaunchHost("culturagratis.com"), true);
  assert.equal(isCanonicalPrelaunchHost("cultura-gratis-lisboa.fgbernardes.workers.dev"), false);
  assert.equal(isCanonicalPrelaunchHost("outro.example"), false);
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


test("a home integral só aparece fora do hostname de pré-lançamento", () => {
  const page = read("app/page.tsx");
  assert.match(page, /isPrelaunchMode/);
  assert.match(page, /ComingSoonForm/);
  assert.match(page, /CglHome/);
  const home = read("app/components/cgl-home.tsx");
  assert.match(home, /cgl-home-header/);
  assert.match(home, /cgl-home-footer/);
  assert.match(home, /href="\/apoia"/);
  assert.match(home, /href="\/noticias"/);
  assert.match(home, /href="\/coletividades"/);
  assert.match(page, /await isPrelaunchMode\(\)\)\s*\?/);
  assert.match(home, /href=\"\/agenda\"/);
});
