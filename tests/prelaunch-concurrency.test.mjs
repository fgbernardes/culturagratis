import assert from "node:assert/strict";
import test from "node:test";
import worker from "../dist/server/index.js";

const env = {
  CGL_PRELAUNCH_MODE: "false",
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };
const official = "https://www.culturagratis.com";
const preview = "https://cultura-gratis-lisboa.fgbernardes.workers.dev";

test("concurrent hosts serve the launched Home and only preview discourages indexing", async () => {
  const requests = Array.from({ length: 200 }, (_, index) => {
    const canonical = index % 2 === 0;
    const origin = canonical ? official : preview;
    const path = index % 4 < 2 ? "/" : "/robots.txt";
    return { canonical, path, request: new Request(origin + path) };
  });

  const results = await Promise.all(requests.map(async ({ canonical, path, request }) => {
    const response = await worker.fetch(request, env, ctx);
    return { canonical, path, status: response.status, robotsTag: response.headers.get("x-robots-tag"), body: await response.text() };
  }));

  for (const { canonical, path, status, robotsTag, body } of results) {
    assert.equal(status, 200);
    if (path === "/") {
      assert.equal(/class="cgl-coming"/.test(body), false, "unexpected prelaunch Home");
      assert.equal(/class="cgl-home"/.test(body), true, "missing launched Home");
      if (canonical) assert.doesNotMatch(body, /<meta name="robots" content="noindex/);
      else assert.match(body, /noindex/);
      if (!canonical) assert.match(robotsTag ?? "", /noindex, nofollow/, "preview must send X-Robots-Tag");
    } else {
      assert.match(body, /Allow:\s*\//i, "launched hosts permit crawling");
    }
  }
});
