import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { safeReturnPath } from "../app/safe-return-path.ts";
import { securityHeadersFor } from "../worker/security-headers.ts";

async function loadWorker(tag) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${tag}`);
  return (await import(workerUrl.href)).default;
}

const launchEnv = {
  CGL_PRELAUNCH_MODE: "false",
  TURNSTILE_SITE_KEY: "site-key",
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("pedidos simultâneos não partilham o modo de lançamento entre hostnames", async () => {
  const worker = await loadWorker("concurrency");
  const hosts = Array.from({ length: 24 }, (_, index) => index % 2 === 0
    ? "www.culturagratis.com"
    : "cultura-gratis-lisboa.example.workers.dev");

  const pages = await Promise.all(hosts.map(async (host) => {
    const response = await worker.fetch(new Request(`https://${host}/`, { headers: { accept: "text/html" } }), launchEnv, ctx);
    return { host, html: await response.text() };
  }));

  for (const { host, html } of pages) {
    if (host.startsWith("www.")) {
      assert.match(html, /Brevemente/, `${host} devia mostrar a landing`);
      assert.match(html, /noindex/, `${host} devia manter noindex no pré-lançamento`);
    } else {
      assert.match(html, /Explorar a agenda/, `${host} devia mostrar a home integral`);
      assert.doesNotMatch(html, /Brevemente<span>/, `${host} não devia mostrar a landing`);
    }
  }
});

test("as respostas levam cabeçalhos de segurança e o workers.dev não é indexável", async () => {
  const worker = await loadWorker("headers");
  const www = await worker.fetch(new Request("https://www.culturagratis.com/", { headers: { accept: "text/html" } }), launchEnv, ctx);
  assert.match(www.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(www.headers.get("x-frame-options"), "DENY");
  assert.equal(www.headers.get("x-content-type-options"), "nosniff");
  assert.match(www.headers.get("strict-transport-security") ?? "", /max-age=31536000/);
  assert.equal(www.headers.get("x-robots-tag"), null);

  const dev = await worker.fetch(new Request("https://cultura-gratis-lisboa.example.workers.dev/", { headers: { accept: "text/html" } }), launchEnv, ctx);
  assert.equal(dev.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(dev.headers.get("strict-transport-security"), null);

  assert.equal(securityHeadersFor("localhost")["x-robots-tag"], undefined);
});

test("as submissões públicas exigem o token Turnstile", async () => {
  const worker = await loadWorker("submissions");
  const response = await worker.fetch(new Request("https://cultura-gratis-lisboa.example.workers.dev/api/submissoes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "correction", name: "Ana", email: "ana@example.pt", privacyAccepted: true, eventReference: "Evento", details: "Mudou." }),
  }), launchEnv, ctx);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /proteção do formulário/);
});

test("o regresso após login só aceita caminhos internos", () => {
  assert.equal(safeReturnPath("/admin/studio?x=1#y"), "/admin/studio?x=1#y");
  assert.equal(safeReturnPath("/admin"), "/admin");
  for (const unsafe of ["//evil.example", "/\\evil.example", "/\\/evil.example", "https://evil.example", "/\tevil", "", undefined, null, "admin"]) {
    assert.equal(safeReturnPath(unsafe), "/admin", `devia rejeitar ${JSON.stringify(unsafe)}`);
  }
});

test("só se publica um evento já verificado e arquivar preserva a verificação", () => {
  const events = readFileSync("db/events.ts", "utf8");
  assert.match(events, /PUBLISHABLE_FROM: EventStatus\[\] = \["verified", "published"\]/);
  assert.match(events, /status === "archived" \? \{\}/);
  const route = readFileSync("app/api/gestao/eventos/[id]/route.ts", "utf8");
  assert.match(route, /EventTransitionError[\s\S]*status: 409/);
});
