// ADR-062, Filipe 2026-09-10: keep editorial routes closed until launch.
// Removing this gate is an explicit, validated release; never a clock trigger.
const publicPaths = new Set([
  '/', '/privacidade', '/inscricao-confirmada', '/api/contactos',
  '/api/partilha-cgl-20260902.jpg', '/robots.txt', '/sitemap.xml',
  '/_vinext/image', '/acesso52-microemblem.png', '/cgl-emblem.png',
  '/cgl-logo.png', '/cgl-verifica-tram.png', '/favicon.png', '/favicon.svg',
  '/file.svg', '/globe.svg', '/googleb0fed2b5b993faa4.html', '/og.png', '/window.svg',
]);
const protectedPrefixes = ['/admin', '/gestao', '/api/gestao'];

export function prelaunchResponse(request) {
  const url = new URL(request.url);
  // Reject ambiguous separators and double encodings before allowlist checks.
  if (/%(?:2f|5c|25)/i.test(url.pathname)) {
    return new Response(null, {status: 400, headers: {'Cache-Control': 'no-store'}});
  }
  let path;
  try {
    path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
  } catch {
    return new Response(null, {status: 400, headers: {'Cache-Control': 'no-store'}});
  }
  // Authentication and authorisation remain enforced by the existing handlers.
  if (publicPaths.has(path) || path.startsWith('/assets/') ||
      protectedPrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'))) return null;

  const headers = {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, follow'};
  if (path === '/api' || path.startsWith('/api/')) {
    return Response.json({error: 'Disponível após o lançamento.'}, {status: 503, headers});
  }
  return new Response(null, {status: 307, headers: {...headers, Location: '/'}});
}
