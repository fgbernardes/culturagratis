export type CglRuntimeEnv = {
  CGL_ADMIN_EMAILS?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  BREVO_API_KEY?: string;
  BREVO_DOI_TEMPLATE_ID?: string;
  BREVO_CONTACT_LIST_ID?: string;
  BREVO_DOI_REDIRECT_URL?: string;
};

export function getRuntimeEnv(): CglRuntimeEnv {
  const runtime = globalThis as typeof globalThis & { __CGL_ENV?: CglRuntimeEnv };
  return runtime.__CGL_ENV ?? {};
}

export function requireRuntimeValue(name: keyof CglRuntimeEnv): string {
  const value = getRuntimeEnv()[name];
  if (!value) throw new Error(`A variável ${name} não está configurada.`);
  return value;
}
