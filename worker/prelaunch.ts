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
const ADMIN_PAGE_PREFIXES = ["/admin", "/gestao"];
const ADMIN_API_PREFIXES = ["/api/gestao"];
const CANONICAL_PRELAUNCH_HOSTS = new Set(["www.culturagratis.com", "culturagratis.com"]);

export function isPublicPreviewHost(hostname: string) {
  return hostname.toLowerCase().endsWith(".workers.dev");
}

export function isPrelaunchMode(env: { CGL_PRELAUNCH_MODE?: string }) {
  return env.CGL_PRELAUNCH_MODE !== "false";
}

export function isCanonicalPrelaunchHost(hostname: string) {
  return CANONICAL_PRELAUNCH_HOSTS.has(hostname.toLocaleLowerCase("pt-PT"));
}

export function isPrelaunchRequestAllowed(method: string, pathname: string) {
  if (isPathWithin(pathname, ADMIN_API_PREFIXES)) return true;

  if (method === "GET" || method === "HEAD") {
    return isPathWithin(pathname, ADMIN_PAGE_PREFIXES)
      || PUBLIC_PAGES.has(pathname)
      || STATIC_ASSETS.has(pathname)
      || STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  return method === "POST" && pathname === "/api/contactos";
}

function isPathWithin(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
