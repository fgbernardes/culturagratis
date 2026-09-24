import assert from "node:assert/strict";
import test from "node:test";

const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
const context = { waitUntil() {}, passThroughOnException() {} };
const env = {
  CGL_PRELAUNCH_MODE: "false",
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

async function render(host, path) {
  return worker.fetch(
    new Request(`https://${host}${path}`, { headers: { accept: "text/html" } }),
    env,
    context,
  );
}

test("public editorial sections have working routes and matching navigation", async () => {
  const home = await render("cultura-gratis-lisboa.fgbernardes.workers.dev", "/");
  assert.equal(home.status, 200);
  const html = await home.text();
  for (const [path, heading] of [
    ["/apoia", "Dá-nos uma mãozinha"],
    ["/noticias", "Notícias"],
    ["/coletividades", "A cultura também nasce no bairro"],
  ]) {
    assert.match(html, new RegExp(`href=["']${path}["']`));
    const response = await render("cultura-gratis-lisboa.fgbernardes.workers.dev", path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(heading, "i"), path);
  }
});

test("canonical prelaunch host keeps new public sections behind the gate", async () => {
  for (const path of ["/apoia", "/noticias", "/coletividades"]) {
    const response = await render("www.culturagratis.com", path);
    assert.equal(response.status, 404, path);
  }
  const home = await render("www.culturagratis.com", "/");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Brevemente/);
});
