import { AsyncLocalStorage } from "node:async_hooks";

export type CglRuntimeEnv = {
  CGL_ADMIN_EMAILS?: string;
  CGL_PRELAUNCH_MODE?: string;
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

// O Worker atende vários pedidos em simultâneo no mesmo isolate. O ambiente de
// cada pedido (por exemplo, o modo de pré-lançamento decidido pelo hostname) tem
// de viver num contexto assíncrono próprio, e não numa variável global partilhada.
// A instância fica em globalThis para ser a mesma nos ambientes RSC e SSR.
type RuntimeGlobal = typeof globalThis & {
  __CGL_ENV_STORAGE?: AsyncLocalStorage<CglRuntimeEnv>;
  __CGL_ENV?: CglRuntimeEnv;
};

function envStorage() {
  const runtime = globalThis as RuntimeGlobal;
  runtime.__CGL_ENV_STORAGE ??= new AsyncLocalStorage<CglRuntimeEnv>();
  return runtime.__CGL_ENV_STORAGE;
}

export function runWithRuntimeEnv<T>(env: CglRuntimeEnv, callback: () => T): T {
  return envStorage().run(env, callback);
}

export function getRuntimeEnv(): CglRuntimeEnv {
  return envStorage().getStore() ?? (globalThis as RuntimeGlobal).__CGL_ENV ?? {};
}

export function requireRuntimeValue(name: keyof CglRuntimeEnv): string {
  const value = getRuntimeEnv()[name];
  if (!value) throw new Error(`A variável ${name} não está configurada.`);
  return value;
}
