const PUBLIC_PAGES = new Set([
  "/",
  "/privacidade",
  "/inscricao-confirmada",
  "/robots.txt",
  "/sitemap.xml",
  "/api/partilha-cgl-20260902.jpg",
]);
const STATIC_ASSET_PREFIXES = ["/assets/", "/_next/"];
const STATIC_ASSETS = new Set(["/cgl-logo.png", "/favicon.png"]);

export function isPrelaunchMode(env: { CGL_PRELAUNCH_MODE?: string }) {
  return env.CGL_PRELAUNCH_MODE !== "false";
}

export function isPrelaunchRequestAllowed(method: string, pathname: string) {
  if (method === "GET" || method === "HEAD") return PUBLIC_PAGES.has(pathname) || STATIC_ASSETS.has(pathname) || STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return method === "POST" && pathname === "/api/contactos";
}
