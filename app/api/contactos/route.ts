export const dynamic = "force-dynamic";

const CONSENT_VERSION = "v1.3";
type RuntimeEnv = { BREVO_API_KEY?: string; BREVO_DOI_TEMPLATE_ID?: string; BREVO_CONTACT_LIST_ID?: string; BREVO_DOI_REDIRECT_URL?: string; TURNSTILE_SECRET_KEY?: string; };

function runtimeEnv(): RuntimeEnv {
  const runtime = globalThis as typeof globalThis & { __CGL_ENV?: RuntimeEnv };
  return runtime.__CGL_ENV ?? {};
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Pedido não autorizado." }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > 4_000) return Response.json({ error: "Pedido inválido." }, { status: 413 });
    const payload = await request.json() as Record<string, unknown>;
    const firstName = typeof payload.firstName === "string" ? payload.firstName.normalize("NFKC").replace(/\s+/g, " ").trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLocaleLowerCase("pt-PT") : "";
    const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
    if (!isName(firstName)) return Response.json({ error: "Diz-nos o teu primeiro nome para podermos falar contigo como deve ser." }, { status: 400 });
    if (!isEmail(email)) return Response.json({ error: "Este endereço não parece estar correto. Verifica e tenta outra vez." }, { status: 400 });
    if (payload.consent !== true || payload.consentVersion !== CONSENT_VERSION) return Response.json({ error: "Precisamos da tua autorização para te podermos escrever." }, { status: 400 });
    if (!token) return Response.json({ error: "Confirma a proteção do formulário antes de continuares." }, { status: 400 });

    const env = runtimeEnv();
    const listId = Number(env.BREVO_CONTACT_LIST_ID);
    const templateId = Number(env.BREVO_DOI_TEMPLATE_ID);
    if (!env.TURNSTILE_SECRET_KEY || !env.BREVO_API_KEY || !Number.isInteger(listId) || !Number.isInteger(templateId) || !env.BREVO_DOI_REDIRECT_URL) throw new Error("A subscrição ainda não está configurada.");
    if (!await verifyTurnstile(token, request, env)) return Response.json({ error: "Não foi possível validar a proteção do formulário. Atualiza a página e tenta novamente." }, { status: 400 });

    const response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": env.BREVO_API_KEY },
      body: JSON.stringify({ email, includeListIds: [listId], templateId, redirectionUrl: env.BREVO_DOI_REDIRECT_URL, attributes: { NOME: firstName, CONSENT_VERSION: CONSENT_VERSION, CONSENT_AT: new Date().toISOString() } }),
    });
    if (!response.ok) throw new Error(`Brevo respondeu com ${response.status}`);
    return Response.json({ received: true }, { status: 201 });
  } catch (error) {
    console.error("newsletter_signup_failed", error);
    return Response.json({ error: "Não conseguimos registar o teu email agora. Tenta daqui a pouco." }, { status: 500 });
  }
}

async function verifyTurnstile(token: string, request: Request, env: RuntimeEnv) {
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY!); form.set("response", token);
  const forwarded = request.headers.get("cf-connecting-ip");
  if (forwarded) form.set("remoteip", forwarded);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json() as { success?: boolean; hostname?: string; "error-codes"?: string[] };
  const expectedHostname = new URL(request.url).hostname;
  if (result.success !== true || result.hostname !== expectedHostname) {
    console.warn("newsletter_turnstile_rejected", { expectedHostname, receivedHostname: result.hostname, errorCodes: result["error-codes"] });
    return false;
  }
  return true;
}

function isEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }
function isName(value: string) { return value.length > 0 && value.length <= 60 && /\p{L}/u.test(value) && !/[\u0000-\u001F\u007F]/u.test(value); }
