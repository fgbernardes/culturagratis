import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("bundles the approved fonts and uses the width-only mobile layout", async () => {
  const assetsDirectory = new URL("../dist/client/assets/", import.meta.url);
  const assetNames = await readdir(assetsDirectory);
  const cssNames = assetNames.filter((name) => name.endsWith(".css"));
  const css = (
    await Promise.all(cssNames.map((name) => readFile(new URL(name, assetsDirectory), "utf8")))
  ).join("\n");

  assert.match(css, /Inter Variable/);
  assert.match(css, /Bricolage Grotesque Variable/);
  assert.doesNotMatch(css, /\/workspace\/sites\//);
  assert.ok(assetNames.some((name) => /inter-latin[^/]*\.woff2$/i.test(name)));
  assert.ok(assetNames.some((name) => /bricolage-grotesque-latin[^/]*\.woff2$/i.test(name)));
  assert.match(css, /@media\s*\(width\s*<=\s*767px\)/i);
  assert.doesNotMatch(css, /\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)/i);
  assert.match(css, /\.cgl-coming-stage\s*\{\s*grid-template-columns:\s*1fr/i);
  assert.match(css, /\.cgl-coming-header\s*\{[^}]*min-height:\s*clamp\(144px,11\.5vw,172px\)/i);
  assert.match(css, /\.cgl-coming\s*\{[^}]*grid-template-rows:\s*clamp\(144px,11\.5vw,172px\)\s+minmax\(0,1fr\)\s+64px\s+32px/i);
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
  assert.match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.culturagratis\.com\/["']/i);
  assert.match(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']https:\/\/www\.culturagratis\.com\/["']/i);
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
  assert.match(html, /<h1[^>]*>A cultura de Lisboa vive em toda a cidade<\/h1>/i);
  assert.match(html, /<h2[^>]*>Recebe a newsletter de lançamento<\/h2>/i);
  assert.doesNotMatch(html, /<span class=["']cgl-coming-city["']>Lisboa<\/span>/i);
  assert.match(html, /class=["']cgl-coming-status["'][^>]*><p>Brevemente<span>\.\.\.<\/span><\/p>/i);
  assert.match(html, /class=["'][^"']*cgl-signup-fields/i);
  assert.match(html, /class=["'][^"']*cgl-signup-actions/i);
});

test("renders verified social links on the newsletter landing page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-social`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  const html = await response.text();
  assert.match(html, /class=["'][^"']*cgl-coming-socials/i);
  assert.match(html, /href=["']https:\/\/www\.facebook\.com\/CulturaGratisLisboa["']/i);
  assert.match(html, /href=["']https:\/\/www\.instagram\.com\/culturagratislisboa["']/i);
  assert.match(html, /href=["']https:\/\/www\.threads\.com\/@culturagratislisboa["']/i);
  assert.match(html, /href=["']https:\/\/www\.tiktok\.com\/@cglisboa["']/i);
  assert.match(html, /href=["']https:\/\/www\.youtube\.com\/@culturagratisemlisboa["']/i);
  assert.match(html, /href=["']https:\/\/whatsapp\.com\/channel\/0029VbDrpMDL7UVSxvfzMm2C["']/i);
  assert.match(html, /aria-label=["']Segue o Cultura Grátis Lisboa no Instagram["']/i);
  assert.match(html, /href=["']mailto:ola@culturagratis\.com["']/i);
  assert.match(html, />ola@culturagratis\.com</i);
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
  assert.doesNotMatch(html, /class=["']public-topbar["']/i);
  assert.doesNotMatch(html, /class=["']public-footer["']/i);
  assert.doesNotMatch(html, />Agenda<|>Categorias<|>Freguesias<|>Sugerir evento</i);
  assert.match(html, /href=["']\/["'][^>]*aria-label=["']Cultura Grátis Lisboa, início["']/i);
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
    assert.equal(brevoPayload.attributes.NOME, "Filipe");
    assert.equal("FIRSTNAME" in brevoPayload.attributes, false);
    assert.equal(brevoPayload.attributes.CONSENT_VERSION, "v1.3");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("renders the confirmed subscription message with the Cultura Grátis logo", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-confirmed`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/inscricao-confirmada", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<img[^>]+src=["']\/cgl-logo\.png["'][^>]+alt=["']Cultura Grátis Lisboa["']/i);
  assert.match(html, /Ficaste na lista!/i);
  assert.match(html, /Obrigado por nos acompanhares\./i);
  assert.match(html, /promessa de não te entupir a caixa de e-mail de spam\./i);
  assert.match(html, /anúncio do lançamento do site/i);
  assert.match(html, /Eventos, claro, grátis! ;\)/i);
  assert.doesNotMatch(html, /&#x20;/i);
});
