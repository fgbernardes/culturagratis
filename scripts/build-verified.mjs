import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { copyFile, mkdir } from "node:fs/promises";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");
const timeoutMs = Number(process.env.CGL_BUILD_TIMEOUT_MS ?? 180000);

console.log("Running bounded vinext build...");

await run(process.execPath, [vinextCli, "build"], timeoutMs);
const negativeLogo = path.join(projectRoot, "dist", "client", "cgl-logos", "com-lettering-negativo.png");
await mkdir(path.dirname(negativeLogo), { recursive: true });
await copyFile(path.join(projectRoot, "public", "cgl-logos", "com-lettering-negativo.png"), negativeLogo);
await run(process.execPath, [path.join(scriptDirectory, "validate-artifact.mjs")], 30000);

function run(command, args, limitMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
    });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Command timed out after ${limitMs} ms: ${command}`));
    }, limitMs);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`Command failed (${code ?? signal}): ${command}`));
    });
  });
}
