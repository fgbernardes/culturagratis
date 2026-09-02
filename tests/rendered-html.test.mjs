import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("bundles the approved fonts and uses the width-only mobile layout", async () => {
  const assetsDirectory = new URL("../dist/client/assets/", import.meta.url);
  const assetsDirectoryPath = fileURLToPath(assetsDirectory);
  const assetNames = await readdir(assetsDirectory);
  const cssNames = assetNames.filter((name) => name.endsWith(".css"));
  const css = (
    await Promise.all(cssNames.map((name) => readFile(join(assetsDirectoryPath, name), "utf8")))
  ).join("\n");

  assert.match(css, /Inter Variable/);
  assert.match(css, /Bricolage Grotesque Variable/);
  assert.doesNotMatch(css, /\/workspace\/sites\//);
  assert.ok(assetNames.some((name) => /inter-latin[^/]*\.woff2$/i.test(name)));
  assert.ok(assetNames.some((name) => /bricolage-grotesque-latin[^/]*\.woff2$/i.test(name)));
  assert.match(css, /@media\s*\(width\s*<=\s*767px\)/i);
  assert.doesNotMatch(css, /\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)/i);
  assert.match(css, /\.cgl-coming-stage\s*\{\s*grid-template-columns:\s*1fr/i);
  assert.match(css, /\.cgl-coming\s*\{[^}]*min-height:\s*0/i);
  assert.match(css, /\.cgl-coming\s*\{[^}]*background:\s*#1a1a1a/i);
  assert.match(css, /\.cgl-coming-footer\s*\{[^}]*flex:\s*1\s+0\s+46px/i);
});

test("renders the public site metadata without a development marker", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>[^<]*Cultura Grátis Lisboa[^<]*<\/title>/i);
  assert.match(html, /<meta[^>]+name=["']viewport["'][^>]+width=device-width/i);
  assert.doesNotMatch(html, /name=["']codex-preview["']/i);
  assert.doesNotMatch(html, /<title>[^<]*Brevemente/i);
  assert.match(html, /property=["']og:image["'][^>]+cgl-logo\.png/i);
  assert.match(html, /A cultura de Lisboa vive em toda a cidade\. Cultura gratuita com mais bairro, mais acesso e mais critério\./i);
  assert.match(html, /name=["']firstName["']/i);
  assert.match(html, /A cultura de Lisboa vive em toda a cidade/i);
  assert.match(html, /Com menos ruído<span class=["']cgl-orange-ellipsis["']>\.\.\.<\/span>/i);
  assert.match(html, /class=["']cgl-coming-status["']/i);
  assert.match(html, /Brevemente<span>\.\.\.<\/span>/i);
  assert.match(html, /class=["'][^"']*cgl-signup-fields/i);
  assert.match(html, /class=["'][^"']*cgl-signup-actions/i);
});

test("renders the privacy policy in a human voice without em dashes", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-privacy`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/privacidade", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Aqui explicamos, de forma clara/i);
  assert.doesNotMatch(html, /—/u);
});

test("rejects a newsletter subscription without a first name", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-name`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/contactos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "teste@example.com", consent: true, consentVersion: "v1.3", turnstileToken: "test" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /primeiro nome/i);
});

test("sends the subscriber first name to Brevo", async () => {
  const originalFetch = globalThis.fetch;
  let brevoPayload;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("challenges.cloudflare.com/turnstile")) {
      return Response.json({ success: true, hostname: "localhost" });
    }
    if (url.includes("api.brevo.com/v3/contacts/doubleOptinConfirmation")) {
      brevoPayload = JSON.parse(init.body);
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-brevo`);
    const { default: worker } = await import(workerUrl.href);
    const response = await worker.fetch(
      new Request("http://localhost/api/contactos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: "  Filipe  ", email: "teste@example.com", consent: true, consentVersion: "v1.3", turnstileToken: "test" }),
      }),
      {
        ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
        BREVO_API_KEY: "test",
        BREVO_CONTACT_LIST_ID: "7",
        BREVO_DOI_TEMPLATE_ID: "3",
        BREVO_DOI_REDIRECT_URL: "http://localhost/inscricao-confirmada",
        TURNSTILE_SECRET_KEY: "test",
        TURNSTILE_EXPECTED_HOSTNAME: "localhost",
      },
      { waitUntil() {}, passThroughOnException() {} },
    );

    assert.equal(response.status, 201);
    assert.equal(brevoPayload.attributes.FIRSTNAME, "Filipe");
    assert.equal(brevoPayload.attributes.CONSENT_VERSION, "v1.3");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
