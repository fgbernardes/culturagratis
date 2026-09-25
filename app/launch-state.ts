import { getRuntimeEnv } from "./runtime-env";

export function isPrelaunchMode() {
  return getRuntimeEnv().CGL_PRELAUNCH_MODE !== "false";
}
