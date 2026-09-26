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
    console.log(`Preview ${width}px: status=${response?.status()} title=${await page.title()} coming=${await page.locator(".cgl-coming").count()} header=${await page.locator(".cgl-home-header").count()}`);
    if (!await page.locator(".cgl-home-header").count()) throw new Error(`Expected launch home: ${(await page.content()).slice(0, 700)}`);
    await page.locator(".cgl-home-header").waitFor({ state: "visible", timeout: 15000 });
    const logoResult = await page.locator(".cgl-home-footer img").evaluate(async (img) => {
      const response = await fetch(img.currentSrc);
      return { src: img.currentSrc, status: response.status, type: response.headers.get("content-type"), bytes: (await response.arrayBuffer()).byteLength };
    });
    console.log("Footer logo:", logoResult);
    await page.locator(".cgl-home-footer img").evaluate((img) => img.decode());
    const layout = await page.evaluate(() => {
      const header = document.querySelector(".cgl-home-header");
      const action = document.querySelector(".cgl-home-support-link");
      const brand = document.querySelector(".cgl-home-brand strong");
      const nav = header?.querySelector(":scope > nav");
      const brandLink = header?.querySelector(".cgl-home-brand");
      const actions = header?.querySelector(".cgl-home-actions");
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        headerHeight: header?.getBoundingClientRect().height,
        supportRight: action?.getBoundingClientRect().right,
        supportVisible: action ? getComputedStyle(action).display !== "none" : false,
        brandHeight: brand?.getBoundingClientRect().height,
        navVisible: nav ? getComputedStyle(nav).display !== "none" : false,
        navTop: nav?.getBoundingClientRect().top,
        brandTop: brandLink?.getBoundingClientRect().top,
        actionsTop: actions?.getBoundingClientRect().top,
        navBottom: nav?.getBoundingClientRect().bottom,
        headerBottom: header?.getBoundingClientRect().bottom,
        orbitCenters: [...document.querySelectorAll(".cgl-home-mark > span")].map((ring) => {
          const box = ring.getBoundingClientRect();
          const mark = ring.parentElement.getBoundingClientRect();
          return Math.hypot(box.left + box.width / 2 - (mark.left + mark.width / 2), box.top + box.height / 2 - (mark.top + mark.height / 2));
        }),
      };
    });
    await page.screenshot({ path: `visual-review/home-${width}.png`, fullPage: true });
    assert.ok(layout.scrollWidth <= layout.viewport, `horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.headerHeight <= 200, `header overflows at ${width}: ${JSON.stringify(layout)}`);
    if (width > 780) {
      assert.ok(layout.supportVisible, `support CTA missing at ${width}`);
      assert.ok(Math.abs(layout.navTop - layout.brandTop) < 80, `navigation is below the brand at ${width}: ${JSON.stringify(layout)}`);
      assert.ok(Math.abs(layout.actionsTop - layout.brandTop) < 80, `actions are below the brand at ${width}: ${JSON.stringify(layout)}`);
      assert.ok(layout.supportRight <= width - 12, `support CTA touches edge at ${width}`);
    }
    if (width <= 780) {
      const mobileMenu = page.locator(".cgl-home-mobile-menu");
      assert.ok(await mobileMenu.locator("summary").isVisible(), `mobile menu trigger missing at ${width}`);
      await mobileMenu.locator("summary").click();
      assert.ok(await mobileMenu.locator("nav").isVisible(), `mobile navigation missing at ${width}`);
      assert.equal(await mobileMenu.locator("nav a").count(), 9, `wrong mobile link count at ${width}`);
      assert.equal(await mobileMenu.locator('a[href="/merchandising"]').count(), 0);
    } else {
      assert.ok(layout.navVisible, `desktop navigation missing at ${width}`);
      assert.ok(layout.navBottom <= layout.headerBottom + 1, `navigation escapes header at ${width}: ${JSON.stringify(layout)}`);
    }
    assert.ok(layout.orbitCenters.length === 2 && layout.orbitCenters.every((offset) => offset < 2), `emblem orbits are off-centre at ${width}: ${JSON.stringify(layout)}`);
    console.log(`${width}px: ${JSON.stringify(layout)}`);
    await page.close();
  }

  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const response = await page.goto(origin + "/acesso-52", { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(response?.status(), 200, `Acesso 52 unavailable at ${width}px`);
    const layout = await page.evaluate(() => {
      const heading = document.querySelector(".access52-steps h2")?.getBoundingClientRect();
      const intro = document.querySelector(".access52-steps .access52-section-heading > p:last-child")?.getBoundingClientRect();
      const list = document.querySelector(".access52-places--closed ul")?.getBoundingClientRect();
      const items = [...document.querySelectorAll(".access52-places--closed li")].map((item) => item.getBoundingClientRect());
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        headingBottom: heading?.bottom,
        introTop: intro?.top,
        listLeft: list?.left,
        items: items.map((item) => ({ left: item.left, width: item.width, top: item.top, bottom: item.bottom })),
      };
    });
    await page.screenshot({ path: `visual-review/acesso-52-${width}.png`, fullPage: true });
    assert.ok(layout.scrollWidth <= layout.viewport, `Acesso 52 horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.headingBottom <= layout.introTop + 1, `Acesso 52 step heading overlaps intro at ${width}: ${JSON.stringify(layout)}`);
    assert.equal(layout.items.length, 5, `missing closed museums at ${width}`);
    assert.ok(layout.items.every((item) => Math.abs(item.left - layout.listLeft) <= 1 && item.width > 200), `closed museums misaligned at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.items.every((item, index) => index === 0 || item.top >= layout.items[index - 1].bottom - 1), `closed museums overlap at ${width}: ${JSON.stringify(layout)}`);
    console.log(`Access 52 ${width}px: ${JSON.stringify(layout)}`);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
