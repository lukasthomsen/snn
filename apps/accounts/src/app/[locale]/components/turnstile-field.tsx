"use client";

import { useEffect, useRef, useState } from "react";

import type { AuthTurnstileAction } from "@snn/auth/policy";

type TurnstileApi = {
  getResponse?: (widgetId?: string) => string | undefined;
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
  const activeTokenRef = useRef<string | null>(null);
  const hasResetSignalMounted = useRef(false);
  const [hasChallengeFrame, setHasChallengeFrame] = useState(false);
  const [isFallbackVisible, setIsFallbackVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!challenge?.siteKey || !containerRef.current) {
      activeTokenRef.current = null;
      onTokenChange(null);
      return;
    }

    let isMounted = true;
    let responseSyncId: number | undefined;

    const publishToken = (token: string | null) => {
      activeTokenRef.current = token;
      onTokenChange(token);
    };

    const syncResponseToken = () => {
      if (!isMounted || !widgetIdRef.current || !window.turnstile?.getResponse) {
        return;
      }

      const token = window.turnstile.getResponse(widgetIdRef.current);

      if (token && token !== activeTokenRef.current) {
        setHasChallengeFrame(false);
        setIsFallbackVisible(false);
        setIsInteractive(false);
        setMessage(undefined);
        publishToken(token);
      }
    };

    void loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        setMessage(undefined);
        setHasChallengeFrame(false);
        setIsFallbackVisible(false);
        setIsInteractive(false);
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          action: challenge.action,
          "after-interactive-callback"() {
            setIsInteractive(false);
          },
          "before-interactive-callback"() {
            setHasChallengeFrame(Boolean(containerRef.current?.querySelector("iframe")));
            setIsInteractive(true);
          },
          callback(token: string) {
            setHasChallengeFrame(false);
            setIsFallbackVisible(false);
            setIsInteractive(false);
            setMessage(undefined);
            publishToken(token);
          },
          "error-callback"() {
            setHasChallengeFrame(false);
            setIsFallbackVisible(false);
            setIsInteractive(false);
            publishToken(null);
            setMessage(challenge.unavailableMessage);
          },
          "expired-callback"() {
            setHasChallengeFrame(false);
            setIsFallbackVisible(false);
            setIsInteractive(false);
            publishToken(null);

            if (widgetIdRef.current) {
              window.turnstile?.reset?.(widgetIdRef.current);
            }
          },
          "timeout-callback"() {
            setHasChallengeFrame(false);
            setIsFallbackVisible(false);
            setIsInteractive(false);
            publishToken(null);

            if (widgetIdRef.current) {
              window.turnstile?.reset?.(widgetIdRef.current);
            }
          },
          "unsupported-callback"() {
            setHasChallengeFrame(false);
            setIsFallbackVisible(false);
            setIsInteractive(false);
            publishToken(null);
            setMessage(challenge.unavailableMessage);
          },
          sitekey: challenge.siteKey,
          theme: "light",
        });
        syncResponseToken();
        responseSyncId = window.setInterval(syncResponseToken, 750);
      })
      .catch(() => {
        if (isMounted) {
          setHasChallengeFrame(false);
          setIsFallbackVisible(false);
          setIsInteractive(false);
          publishToken(null);
          setMessage(challenge.unavailableMessage);
        }
      });

    return () => {
      isMounted = false;

      if (responseSyncId !== undefined) {
        window.clearInterval(responseSyncId);
      }

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [challenge, onTokenChange]);

  useEffect(() => {
    if (!challenge?.siteKey || !containerRef.current) {
      setHasChallengeFrame(false);
      setIsFallbackVisible(false);
      return;
    }

    const container = containerRef.current;
    const syncChallengeFrame = () => {
      setHasChallengeFrame(Boolean(container.querySelector("iframe")));
    };
    const observer = new MutationObserver(syncChallengeFrame);

    syncChallengeFrame();
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [challenge?.siteKey]);

  useEffect(() => {
    if (!hasResetSignalMounted.current) {
      hasResetSignalMounted.current = true;
      return;
    }

    activeTokenRef.current = null;
    setIsFallbackVisible(true);
    onTokenChange(null);

    if (widgetIdRef.current) {
      window.turnstile?.reset?.(widgetIdRef.current);
    }
  }, [onTokenChange, resetSignal]);

  if (!challenge?.siteKey) {
    return null;
  }

  const isChallengeVisible = isFallbackVisible || (isInteractive && hasChallengeFrame);

  return (
    <div
      aria-busy={disabled}
      className="turnstile__root__SW0m0"
      data-challenge-visible={isChallengeVisible ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-visible={message || isChallengeVisible ? "true" : undefined}
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
