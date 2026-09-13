const PUBLIC_PAGES = new Set([
  "/",
  "/privacidade",
  "/inscricao-confirmada",
  "/robots.txt",
  "/sitemap.xml",
  "/api/partilha-cgl-20260902.jpg",
]);
const STATIC_ASSET = /\/[\w.-]+\.(?:css|js|map|png|jpe?g|webp|avif|svg|ico|woff2?)$/i;

export function isPrelaunchRequestAllowed(method: string, pathname: string) {
  if (method === "GET" || method === "HEAD") return PUBLIC_PAGES.has(pathname) || STATIC_ASSET.test(pathname);
  return method === "POST" && pathname === "/api/contactos";
}
