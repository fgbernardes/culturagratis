import assert from "node:assert/strict";
import test from "node:test";

const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
const env = {
  CGL_PRELAUNCH_MODE: "false",
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("launched public pages render without prelaunch copy", async () => {
  for (const path of ["/", "/agenda", "/categorias", "/freguesias", "/apoia", "/verificacao", "/acesso-52", "/acessibilidade", "/termos", "/privacidade", "/noticias", "/coletividades"]) {
    const response = await worker.fetch(new Request(`https://www.culturagratis.com${path}`, { headers: { accept: "text/html" } }), env, ctx);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.doesNotMatch(html, /antes do lançamento|versão em construção|versão de pré-lançamento|CGL VERIFICA|O que significa o selo|EM BREVE · Stripe/i, path);
  }
});

test("launched home has newsletter anchor and support has only the active payment link", async () => {
  const home = await worker.fetch(new Request("https://www.culturagratis.com/"), env, ctx);
  assert.match(await home.text(), /id="newsletter"/);
  const support = await worker.fetch(new Request("https://www.culturagratis.com/apoia"), env, ctx);
  const html = await support.text();
  assert.match(html, /buymeacoffee\.com\/culturagratislisboa/);
  assert.doesNotMatch(html, /Stripe|MB WAY/);
});
