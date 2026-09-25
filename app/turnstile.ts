import type { CglRuntimeEnv } from "./runtime-env";

export async function verifyTurnstile(token: string, request: Request, env: CglRuntimeEnv) {
  if (!env.TURNSTILE_SECRET_KEY) throw new Error("A proteção Turnstile não está configurada.");
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY); form.set("response", token);
  const forwarded = request.headers.get("cf-connecting-ip");
  if (forwarded) form.set("remoteip", forwarded);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json() as { success?: boolean; hostname?: string };
  return result.success === true && (!env.TURNSTILE_EXPECTED_HOSTNAME || result.hostname === env.TURNSTILE_EXPECTED_HOSTNAME);
}
