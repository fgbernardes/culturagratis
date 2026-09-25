const CANONICAL_HOSTS = new Set(["www.culturagratis.com", "culturagratis.com"]);

// Política deliberadamente limitada: não restringe scripts (o React Server
// Components injeta scripts inline), mas impede que o site seja embutido
// noutras páginas (clickjacking) e fecha vetores que o site não usa.
const CONTENT_SECURITY_POLICY = "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'";

export function securityHeadersFor(hostname: string): Record<string, string> {
  const host = hostname.toLocaleLowerCase("pt-PT");
  const headers: Record<string, string> = {
    "content-security-policy": CONTENT_SECURITY_POLICY,
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  };
  if (CANONICAL_HOSTS.has(host)) {
    headers["strict-transport-security"] = "max-age=31536000; includeSubDomains";
  }
  // O workers.dev serve o site integral para validação. Os canónicos apontam
  // para o www, por isso estas cópias técnicas nunca devem ser indexadas.
  if (host.endsWith(".workers.dev")) {
    headers["x-robots-tag"] = "noindex, nofollow";
  }
  return headers;
}

export function applySecurityHeaders(response: Response, url: URL): Response {
  if (response.status === 101) return response;
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeadersFor(url.hostname))) {
    if (!secured.headers.has(name)) secured.headers.set(name, value);
  }
  return secured;
}
