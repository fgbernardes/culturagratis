import { getSupabaseUser, requireSupabaseUser } from "./supabase-auth";
import { getRuntimeEnv } from "./runtime-env";

const DEFAULT_ADMIN_EMAIL = "culturagratislisboa@gmail.com";

export async function requireAdminPageUser(returnTo: string) {
  const user = await requireSupabaseUser(returnTo);
  return { user, allowed: isAdminEmail(user.email) };
}

export async function getAdminApiUser() {
  const user = await getSupabaseUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

function isAdminEmail(email: string) {
  const configured = getRuntimeEnv().CGL_ADMIN_EMAILS ?? DEFAULT_ADMIN_EMAIL;
  const allowed = configured.split(",").map((item) => item.trim().toLocaleLowerCase("pt-PT")).filter(Boolean);
  return allowed.includes(email.trim().toLocaleLowerCase("pt-PT"));
}
