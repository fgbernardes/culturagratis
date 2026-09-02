import { createClient } from "@supabase/supabase-js";
import { requireRuntimeValue } from "../app/runtime-env";

export function createSupabaseAdminClient() {
  return createClient(
    requireRuntimeValue("SUPABASE_URL"),
    requireRuntimeValue("SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

export function unwrapSupabase<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("A base de dados não devolveu o registo esperado.");
  return result.data;
}
