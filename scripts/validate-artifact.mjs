import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const generatedConfigPath = path.join(projectRoot, "dist", "server", "wrangler.json");

await access(workerPath, constants.R_OK).catch(() => {
  throw new Error("Missing Cloudflare Worker entry: dist/server/index.js");
});

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("worker-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);

if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error("dist/server/index.js must export default.fetch(request, env, ctx)");
}

const generatedConfig = JSON.parse(await readFile(generatedConfigPath, "utf8"));
const forbiddenKeys = findKeys(generatedConfig, new Set(["route", "routes", "custom_domain"]));

if (forbiddenKeys.length > 0) {
  throw new Error(`Generated Wrangler config contains forbidden domain configuration: ${forbiddenKeys.join(", ")}`);
}

if (generatedConfig.workers_dev !== true) {
  throw new Error("Generated Wrangler config must explicitly set workers_dev to true");
}

if (generatedConfig.main !== "index.js") {
  throw new Error("Generated Wrangler config must deploy dist/server/index.js");
}

if (Object.keys(generatedConfig.triggers ?? {}).length > 0) {
  throw new Error("Generated Wrangler config must not contain triggers");
}

console.log("Validated independent Cloudflare Worker artifact and workers.dev-only generated config.");

function findKeys(value, forbidden, location = "$") {
  if (!value || typeof value !== "object") return [];
  const matches = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedLocation = `${location}.${key}`;
    if (forbidden.has(key)) matches.push(nestedLocation);
    matches.push(...findKeys(nestedValue, forbidden, nestedLocation));
  }
  return matches;
}
