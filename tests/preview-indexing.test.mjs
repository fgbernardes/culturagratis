import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { isPublicPreviewHost } from "../worker/prelaunch.ts";

const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
const context = { waitUntil() {}, passThroughOnException() {} };
const env = {
  CGL_PRELAUNCH_MODE: "false",
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

function get(host, path) {
  return worker.fetch(new Request(`https://${host}${path}`, { headers: { accept: "text/html" } }), env, context);
}

test("only workers.dev is marked as a public preview", () => {
  assert.equal(isPublicPreviewHost("cultura-gratis-lisboa.fgbernardes.workers.dev"), true);
  assert.equal(isPublicPreviewHost("www.culturagratis.com"), false);
  assert.equal(isPublicPreviewHost("culturagratis.com"), false);
});

test("preview pages and robots forbid indexing and sitemap is unavailable", async () => {
  const host = "cultura-gratis-lisboa.fgbernardes.workers.dev";
  const home = await get(host, "/");
  assert.equal(home.status, 200);
  assert.match(home.headers.get("x-robots-tag") ?? "", /noindex, nofollow/);
  assert.match(await home.text(), /noindex/);
  const privacy = await get(host, "/privacidade");
  assert.equal(privacy.status, 200);
  assert.match(privacy.headers.get("x-robots-tag") ?? "", /noindex, nofollow/);
  const robots = await get(host, "/robots.txt");
  assert.equal(robots.status, 200);
  assert.ok((await robots.text()).includes("Disallow: /"));
  const sitemap = await get(host, "/sitemap.xml");
  assert.equal(sitemap.status, 404);
});

test("canonical prelaunch stays gated and request mode never comes from app global", async () => {
  const canonical = await get("www.culturagratis.com", "/");
  assert.equal(canonical.status, 200);
  assert.match(await canonical.text(), /Brevemente/);
  assert.equal((await get("www.culturagratis.com", "/agenda")).status, 404);
  const launchState = fs.readFileSync(new URL("../app/launch-state.ts", import.meta.url), "utf8");
  assert.doesNotMatch(launchState, /__CGL_ENV|globalThis|CGL_PRELAUNCH_MODE/);
});
