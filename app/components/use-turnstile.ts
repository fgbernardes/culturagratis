"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { disposeTurnstileWidget } from "./turnstile-lifecycle.mjs";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

function turnstileApi() {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

/**
 * Mostra o desafio Turnstile no elemento que recebe `attachContainer`.
 * O token só serve uma vez: depois de cada envio, chamar `reset()`.
 */
export function useTurnstile(siteKey: string) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!siteKey || !container) return;
    const render = () => {
      const api = turnstileApi();
      if (!api || widgetIdRef.current) return;
      widgetIdRef.current = api.render(container, {
        sitekey: siteKey,
        callback: (value) => { setToken(value); setFailed(false); },
        "expired-callback": () => setToken(""),
        "error-callback": () => { setToken(""); setFailed(true); },
      });
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true; script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    render();
    const loadedScript = script;
    return () => {
      loadedScript.removeEventListener("load", render);
      disposeTurnstileWidget(turnstileApi(), widgetIdRef.current);
      widgetIdRef.current = undefined;
      setToken("");
    };
  }, [siteKey, container]);

  const reset = useCallback(() => {
    setToken("");
    if (widgetIdRef.current) turnstileApi()?.reset(widgetIdRef.current);
  }, []);

  return { attachContainer: setContainer, token, failed, reset };
}
