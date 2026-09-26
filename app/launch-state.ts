import { headers } from "next/headers";

// The Worker overwrites this header for each request before passing it to vinext.
// A missing header keeps local development in prelaunch mode.
export async function isPrelaunchMode() {
  return (await headers()).get("x-cgl-prelaunch-mode") !== "false";
}
