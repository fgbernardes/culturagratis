"use client";

import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useState } from "react";

export default function LoginClient({
  supabaseUrl,
  publishableKey,
  returnTo,
}: {
  supabaseUrl: string;
  publishableKey: string;
  returnTo: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const client = createBrowserClient(supabaseUrl, publishableKey);
    const { error } = await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage("Não foi possível iniciar sessão. Confirma o e-mail e a palavra-passe.");
      return;
    }
    window.location.assign(returnTo);
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
      <label>Palavra-passe<input name="password" type="password" autoComplete="current-password" required /></label>
      <div className="admin-form-actions">
        <button type="submit" disabled={busy}>{busy ? "A entrar…" : "Entrar"}</button>
        <span role="status">{message}</span>
      </div>
    </form>
  );
}
