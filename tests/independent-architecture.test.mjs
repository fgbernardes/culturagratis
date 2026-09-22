import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("has no ChatGPT Sites or D1 runtime dependency", () => {
  assert.equal(existsSync(".openai/hosting.json"), false);
  assert.equal(existsSync("app/chatgpt-auth.ts"), false);
  assert.equal(existsSync("build/sites-vite-plugin.ts"), false);

  const worker = readFileSync("worker/index.ts", "utf8");
  const vite = readFileSync("vite.config.ts", "utf8");
  const builtWorker = readFileSync("dist/server/index.js", "utf8");
  for (const source of [worker, vite, builtWorker]) {
    assert.doesNotMatch(source, /site-creator-d1|D1Database|signin-with-chatgpt|oai-authenticated-user/i);
  }
});

test("targets the approved independent architecture and canonical public domain", () => {
  const wrangler = readFileSync("wrangler.jsonc", "utf8");
  const generatedWrangler = JSON.parse(readFileSync("dist/server/wrangler.json", "utf8"));
  const buildScript = readFileSync("scripts/build-verified.mjs", "utf8");
  const publishScript = readFileSync("PUBLICAR_WORKERS_DEV.ps1", "utf8");
  const migration = readFileSync("supabase/migrations/202609020001_cgl_core.sql", "utf8");

  assert.match(wrangler, /vcxhhbrwwltzvytcszpx\.supabase\.co/);
  assert.match(wrangler, /dist\/server\/index\.js/);
  assert.match(wrangler, /"workers_dev"\s*:\s*true/);
  assert.match(wrangler, /"pattern"\s*:\s*"www\.culturagratis\.com"/);
  assert.match(wrangler, /"custom_domain"\s*:\s*true/);
  assert.equal(generatedWrangler.workers_dev, true);
  assert.deepEqual(generatedWrangler.routes, [
    { pattern: "www.culturagratis.com", custom_domain: true },
  ]);
  assert.equal("route" in generatedWrangler, false);
  assert.match(buildScript, /node_modules["'],\s*["']vinext["'],\s*["']dist["'],\s*["']cli\.js/);
  assert.match(buildScript, /run\(process\.execPath/);
  assert.doesNotMatch(buildScript, /shell:\s*process\.platform/);
  assert.doesNotMatch(publishScript, /wrangler["']?\s+login/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.submissions from anon, authenticated/i);
  assert.equal(existsSync("app/admin/page.tsx"), true);
  assert.equal(existsSync("app/admin/login/page.tsx"), true);
});
