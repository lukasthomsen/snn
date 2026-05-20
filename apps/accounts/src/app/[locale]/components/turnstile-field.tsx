"use client";

import { useEffect, useRef, useState } from "react";

import type { AuthTurnstileAction } from "@snn/auth/policy";

type TurnstileApi = {
  remove?: (widgetId: string) => void;
  render: (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => string;
  reset?: (widgetId: string) => void;
};

declare global {
  interface Window {
    __snnTurnstileScript?: Promise<void>;
    turnstile?: TurnstileApi;
  }
}

export type TurnstileChallenge = {
  action: AuthTurnstileAction;
  requiredMessage: string;
  siteKey?: string | undefined;
  unavailableMessage: string;
};

type TurnstileFieldProps = {
  challenge?: TurnstileChallenge | undefined;
  disabled?: boolean | undefined;
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  window.__snnTurnstileScript ??= new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return window.__snnTurnstileScript;
}

export function TurnstileField({
  challenge,
  disabled = false,
  onTokenChange,
  resetSignal,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hasResetSignalMounted = useRef(false);
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!challenge?.siteKey || !containerRef.current) {
      onTokenChange(null);
      return;
    }

    let isMounted = true;

    void loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        setMessage(undefined);
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          action: challenge.action,
          appearance: "interaction-only",
          callback(token: string) {
            setMessage(undefined);
            onTokenChange(token);
          },
          "error-callback"() {
            onTokenChange(null);
            setMessage(challenge.unavailableMessage);
          },
          "expired-callback"() {
            onTokenChange(null);
          },
          sitekey: challenge.siteKey,
          theme: "light",
        });
      })
      .catch(() => {
        if (isMounted) {
          onTokenChange(null);
          setMessage(challenge.unavailableMessage);
        }
      });

    return () => {
      isMounted = false;

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [challenge, onTokenChange]);

  useEffect(() => {
    if (!hasResetSignalMounted.current) {
      hasResetSignalMounted.current = true;
      return;
    }

    onTokenChange(null);

    if (widgetIdRef.current) {
      window.turnstile?.reset?.(widgetIdRef.current);
    }
  }, [onTokenChange, resetSignal]);

  if (!challenge?.siteKey) {
    return null;
  }

  return (
    <div
      aria-busy={disabled}
      className="turnstile__root__SW0m0"
      data-disabled={disabled ? "true" : undefined}
    >
      <div className="turnstile__widget__SW0m1" ref={containerRef} />
      {message ? (
        <p className="form__notice__SW0hq" data-tone="danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
