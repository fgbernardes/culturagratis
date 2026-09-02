import { signOutSupabaseUser } from "../../supabase-auth";

export async function GET(request: Request) {
  await signOutSupabaseUser();
  return Response.redirect(new URL("/", request.url), 303);
}
