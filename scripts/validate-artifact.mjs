import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const generatedConfigPath = path.join(projectRoot, "dist", "server", "wrangler.json");
const CANONICAL_CUSTOM_DOMAIN = "www.culturagratis.com";

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
const routes = generatedConfig.routes ?? [];

if ("route" in generatedConfig) {
  throw new Error("Generated Wrangler config must not contain the legacy route key.");
}

if (
  !Array.isArray(routes)
  || routes.length !== 1
  || routes[0]?.pattern !== CANONICAL_CUSTOM_DOMAIN
  || routes[0]?.custom_domain !== true
  || Object.keys(routes[0]).some((key) => !["pattern", "custom_domain"].includes(key))
) {
  throw new Error(`Generated Wrangler config must contain only the canonical custom domain: ${CANONICAL_CUSTOM_DOMAIN}`);
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

console.log("Validated CGL Worker artifact, canonical custom domain and workers.dev preview configuration.");
