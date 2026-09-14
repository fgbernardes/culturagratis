import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("metadados, robots e sitemap seguem o interruptor de lançamento", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  const robots = readFileSync("app/robots.ts", "utf8");
  const sitemap = readFileSync("app/sitemap.ts", "utf8");
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /isPrelaunchMode\(\)/);
  assert.match(robots, /isPrelaunchMode\(\)/);
  assert.match(sitemap, /isPrelaunchMode\(\)/);
  assert.match(sitemap, /absoluteUrl\("\/agenda"\)/);
});
