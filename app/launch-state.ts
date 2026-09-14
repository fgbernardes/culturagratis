type RuntimeEnv = { CGL_PRELAUNCH_MODE?: string };

export function isPrelaunchMode() {
  const runtime = globalThis as typeof globalThis & { __CGL_ENV?: RuntimeEnv };
  return runtime.__CGL_ENV?.CGL_PRELAUNCH_MODE !== "false";
}
