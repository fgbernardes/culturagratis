const FALLBACK_PATH = "/admin";
const PROBE_ORIGIN = "https://cgl.invalid";

/**
 * Aceita apenas caminhos internos. Rejeita `//site`, `/\site` e variantes que
 * o browser normaliza para outro domínio, bem como caracteres de controlo.
 */
export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || /[\\\u0000-\u001F\u007F]/.test(value)) return FALLBACK_PATH;
  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return FALLBACK_PATH;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return FALLBACK_PATH;
  }
}
