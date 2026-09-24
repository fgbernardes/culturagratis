import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = "http://127.0.0.1:8787";
const server = spawn("node", [
  "node_modules/wrangler/bin/wrangler.js", "dev", "--local",
  "--ip", "127.0.0.1", "--port", "8787",
  "--var", "CGL_PRELAUNCH_MODE:false",
], { stdio: ["ignore", "pipe", "pipe"] });
let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => { serverOutput = (serverOutput + chunk).slice(-6000); });
}
async function ready() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview exited: ${serverOutput}`);
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(2000) });
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Preview did not start: ${serverOutput}`);
}

let browser;
try {
  await ready();
  browser = await chromium.launch({ headless: true });
  await mkdir("visual-review", { recursive: true });
  for (const width of [390, 768, 1181, 1280, 1366, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 30000 });
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
    assert.ok(layout.scrollWidth <= layout.viewport, `horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.headerHeight <= 100, `header wraps at ${width}: ${JSON.stringify(layout)}`);
    if (width > 720) {
      assert.ok(layout.supportVisible, `support CTA missing at ${width}`);
      assert.ok(layout.supportRight <= width - 12, `support CTA touches edge at ${width}`);
    }
    assert.equal(layout.navVisible, width > 1380, `desktop nav breakpoint at ${width}`);
    await page.screenshot({ path: `visual-review/home-${width}.png`, fullPage: true });
    console.log(`${width}px: ${JSON.stringify(layout)}`);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
