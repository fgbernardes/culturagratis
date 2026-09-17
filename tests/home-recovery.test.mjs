import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("a raiz preserva o Brevemente público e mostra a Home integral fora do pré-lançamento", () => {
  const home = readFileSync("app/page.tsx", "utf8");

  assert.match(home, /isPrelaunchMode\(\)/);
  assert.match(home, /CglHome/);
  assert.equal(existsSync("app/components/cgl-home.tsx"), true);
});

test("a Home recuperada liga a pesquisa e as escolhas ao produto atual", () => {
  const home = readFileSync("app/components/cgl-home.tsx", "utf8");

  assert.match(home, /fetch\("\/api\/eventos"\)/);
  assert.match(home, /href="\/agenda"/);
  assert.match(home, /href="\/categorias"/);
  assert.match(home, /href="\/freguesias"/);
  assert.match(home, /href="\/acesso-52"/);
});

test("a Home mantém a navegação no topo e os destaques dentro da paleta CGL", () => {
  const css = readFileSync("app/globals.css", "utf8");

  assert.match(css, /\.cgl-home-header\s*\{[^}]*position:\s*sticky[^}]*top:\s*0[^}]*z-index:/s);
  assert.match(css, /\.cgl-home-event-art\.photo\s*\{\s*background:\s*var\(--tejo\)/s);
  assert.match(css, /\.cgl-home-event-art\.stage\s*\{\s*background:\s*var\(--charcoal\)/s);
  assert.match(css, /\.cgl-home-event-art\.jazz\s*\{\s*background:\s*var\(--sun\)/s);
});
