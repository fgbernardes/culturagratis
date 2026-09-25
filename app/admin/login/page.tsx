import { getRuntimeEnv } from "../../runtime-env";
import LoginClient from "./login-client";
import { safeReturnPath } from "../../safe-return-path";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const env = getRuntimeEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("A autenticação administrativa ainda não está configurada.");
  }
  const returnTo = safeReturnPath((await searchParams).return_to);
  return (
    <main className="admin-shell">
      <section className="admin-hero"><p>ÁREA RESERVADA</p><h1>Gestão editorial.</h1><span>Acesso protegido pela conta Supabase do CGL.</span></section>
      <section className="admin-panel">
        <LoginClient supabaseUrl={env.SUPABASE_URL} publishableKey={env.SUPABASE_PUBLISHABLE_KEY} returnTo={returnTo} />
      </section>
    </main>
  );
}
