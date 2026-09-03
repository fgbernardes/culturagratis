"use client";

import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { disposeTurnstileWidget } from "./turnstile-lifecycle.mjs";

declare global { interface Window { turnstile?: { render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void; }) => string; reset: (widgetId?: string) => void; remove: (widgetId: string) => void; }; } }
type Status = "idle" | "sending" | "success" | "error";

export function ComingSoonForm({ siteKey }: { siteKey: string }) {
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    if (!siteKey || !challengeRef.current) return;
    const render = () => {
      if (!challengeRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(challengeRef.current, { sitekey: siteKey, callback: setTurnstileToken, "expired-callback": () => setTurnstileToken(""), "error-callback": () => setError("Não foi possível validar a proteção do formulário. Atualiza a página e tenta novamente.") });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]');
    if (existing) {
      existing.addEventListener("load", render);
      render();
      return () => {
        existing.removeEventListener("load", render);
        disposeTurnstileWidget(window.turnstile, widgetIdRef.current);
        widgetIdRef.current = undefined;
      };
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true; script.defer = true; script.addEventListener("load", render); document.head.appendChild(script);
    return () => {
      script.removeEventListener("load", render);
      disposeTurnstileWidget(window.turnstile, widgetIdRef.current);
      widgetIdRef.current = undefined;
    };
  }, [siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!firstName.trim()) { setError("Diz-nos o teu primeiro nome para podermos falar contigo como deve ser."); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError("Este endereço não parece estar correto. Verifica e tenta outra vez."); return; }
    if (!consent) { setError("Precisamos da tua autorização para te podermos escrever."); return; }
    if (!turnstileToken) { setError("Confirma a proteção do formulário antes de continuares."); return; }
    setStatus("sending");
    try {
      const response = await fetch("/api/contactos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ firstName, email, consent: true, consentVersion: "v1.3", turnstileToken }) });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não conseguimos registar o teu email agora. Tenta daqui a pouco.");
      setStatus("success");
    } catch (caught) {
      setStatus("error"); setError(caught instanceof Error ? caught.message : "Não conseguimos registar o teu email agora. Tenta daqui a pouco."); window.turnstile?.reset(widgetIdRef.current); setTurnstileToken("");
    }
  }
  if (status === "success") return <div className="cgl-signup-success" role="status"><strong>Falta um passo.</strong><p>Enviámos-te um email para confirmares o endereço. Sem essa confirmação não te podemos escrever.</p></div>;
  return <form className="cgl-signup-form" onSubmit={submit} noValidate>
    <div className="cgl-signup-fields">
      <label htmlFor="newsletter-name"><span>O teu primeiro nome</span><input id="newsletter-name" name="firstName" type="text" autoComplete="given-name" maxLength={60} required value={firstName} onChange={(event) => setFirstName(event.target.value)} aria-describedby={error ? "newsletter-error" : undefined} /></label>
      <label htmlFor="newsletter-email"><span>O teu email</span><input id="newsletter-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby={error ? "newsletter-error" : undefined} /></label>
    </div>
    <label className="cgl-consent"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Aceito receber comunicações do Cultura Grátis Lisboa e li a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</span></label>
    <div className="cgl-signup-actions">
      <div ref={challengeRef} className="cgl-turnstile" aria-label="Proteção contra envios automáticos" />
      <button type="submit" disabled={status === "sending"}>{status === "sending" ? "A registar…" : "Quero receber a newsletter"}</button>
    </div>
    <p className="cgl-signup-note">Sem spam. Só cultura gratuita em Lisboa. Cancela quando quiseres.</p>
    {error ? <p className="cgl-signup-error" id="newsletter-error" role="alert">{error}</p> : null}
    {!siteKey ? <p className="cgl-signup-error" role="alert">O formulário está temporariamente indisponível.</p> : null}
  </form>;
}
