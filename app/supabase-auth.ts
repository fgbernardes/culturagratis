import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireRuntimeValue } from "./runtime-env";

export type SupabaseUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

async function createRequestClient() {
  const cookieStore = await cookies();
  return createServerClient(
    requireRuntimeValue("SUPABASE_URL"),
    requireRuntimeValue("SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            void headers;
          } catch {
            // Server Components cannot write cookies. Route handlers perform refresh/sign-out.
          }
        },
      },
    },
  );
}

export async function getSupabaseUser(): Promise<SupabaseUser | null> {
  const client = await createRequestClient();
  const { data, error } = await client.auth.getClaims();
  if (error || !data?.claims) return null;

  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  if (!email) return null;
  const fullName = typeof data.claims.user_metadata === "object" && data.claims.user_metadata
    ? String((data.claims.user_metadata as Record<string, unknown>).full_name ?? "") || null
    : null;
  return { email, fullName, displayName: fullName ?? email };
}

export async function requireSupabaseUser(returnTo: string): Promise<SupabaseUser> {
  const user = await getSupabaseUser();
  if (user) return user;
  redirect(`/admin/login?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`);
}

export async function signOutSupabaseUser() {
  const client = await createRequestClient();
  await client.auth.signOut();
}

function safeReturnPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}
