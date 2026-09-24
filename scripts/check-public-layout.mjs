import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = "http://127.0.0.1:8787";
const root = resolve("dist/client");
const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
const mime = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
async function asset(request) {
  const pathname = new URL(request.url).pathname;
  const file = resolve(root, "." + pathname);
  if (!file.startsWith(root + sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const ext = file.slice(file.lastIndexOf("."));
    return new Response(data, { headers: { "content-type": mime[ext] ?? "application/octet-stream" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", origin);
    const request = new Request(url, { headers: req.headers });
    const response = url.pathname.startsWith("/assets/") || url.pathname.startsWith("/cgl-")
      ? await asset(request)
      : await worker.fetch(
          request,
          { CGL_PRELAUNCH_MODE: "false", ASSETS: { fetch: asset } },
          { waitUntil() {}, passThroughOnException() {} },
        );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Preview error");
  }
});
await new Promise((resolveReady) => server.listen(8787, "127.0.0.1", resolveReady));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  await mkdir("visual-review", { recursive: true });
  for (const width of [390, 768, 1181, 1280, 1366, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const response = await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log(`Preview ${width}px: status=${response?.status()} title=${await page.title()} coming=${await page.locator(".cgl-coming").count()} header=${await page.locator(".public-topbar").count()}`);
    if (!await page.locator(".public-topbar").count()) throw new Error(`Expected launch home: ${(await page.content()).slice(0, 700)}`);
    await page.locator(".public-topbar").waitFor({ state: "visible", timeout: 15000 });
    const layout = await page.evaluate(() => {
      const header = document.querySelector(".public-topbar");
      const action = document.querySelector(".public-support-action");
      const brand = document.querySelector(".public-brand strong");
      const nav = header?.querySelector(":scope > nav");
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        headerHeight: header?.getBoundingClientRect().height,
        supportRight: action?.getBoundingClientRect().right,
        supportVisible: action ? getComputedStyle(action).display !== "none" : false,
        brandHeight: brand?.getBoundingClientRect().height,
        navVisible: nav ? getComputedStyle(nav).display !== "none" : false,
      };
    });
    await page.screenshot({ path: `visual-review/home-${width}.png`, fullPage: true });
    assert.ok(layout.scrollWidth <= layout.viewport, `horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.headerHeight <= 100, `header wraps at ${width}: ${JSON.stringify(layout)}`);
    if (width > 720) {
      assert.ok(layout.supportVisible, `support CTA missing at ${width}`);
      assert.ok(layout.supportRight <= width - 12, `support CTA touches edge at ${width}`);
    }
    assert.equal(layout.navVisible, width > 1380, `desktop nav breakpoint at ${width}`);
    console.log(`${width}px: ${JSON.stringify(layout)}`);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
