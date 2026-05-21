"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import type { AuthTurnstileAction } from "@snn/auth/policy";

type TurnstileApi = {
  execute?: (container: HTMLElement | string) => void;
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

export type TurnstileFieldHandle = {
  execute: () => Promise<string | null>;
  reset: () => void;
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

export const TurnstileField = forwardRef<TurnstileFieldHandle, TurnstileFieldProps>(function TurnstileField({
  challenge,
  disabled = false,
  onTokenChange,
  resetSignal,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const activeTokenRef = useRef<string | null>(null);
  const hasResetSignalMounted = useRef(false);
  const pendingTokenResolversRef = useRef<Array<(token: string | null) => void>>([]);
  const readyPromiseRef = useRef<Promise<boolean> | null>(null);
  const resolveReadyRef = useRef<((ready: boolean) => void) | null>(null);
  const [hasChallengeFrame, setHasChallengeFrame] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const resolvePendingTokenRequests = useCallback((token: string | null) => {
    const resolvers = pendingTokenResolversRef.current.splice(0);

    for (const resolve of resolvers) {
      resolve(token);
    }
  }, []);

  const publishToken = useCallback((token: string | null) => {
    activeTokenRef.current = token;
    onTokenChange(token);
    resolvePendingTokenRequests(token);
  }, [onTokenChange, resolvePendingTokenRequests]);

  const resolveReady = useCallback((ready: boolean) => {
    resolveReadyRef.current?.(ready);
    readyPromiseRef.current = Promise.resolve(ready);
    resolveReadyRef.current = null;
  }, []);

  const waitForReady = useCallback(() => {
    if (!challenge?.siteKey) {
      return Promise.resolve(false);
    }

    if (widgetIdRef.current && window.turnstile) {
      return Promise.resolve(true);
    }

    readyPromiseRef.current ??= new Promise<boolean>((resolve) => {
      resolveReadyRef.current = resolve;
    });

    return readyPromiseRef.current;
  }, [challenge?.siteKey]);

  const resetChallenge = useCallback(() => {
    activeTokenRef.current = null;
    onTokenChange(null);
    resolvePendingTokenRequests(null);
    setHasChallengeFrame(false);
    setIsInteractive(false);

    if (widgetIdRef.current) {
      window.turnstile?.reset?.(widgetIdRef.current);
    }
  }, [onTokenChange, resolvePendingTokenRequests]);

  const executeChallenge = useCallback(async () => {
    if (!challenge?.siteKey) {
      return null;
    }

    if (activeTokenRef.current) {
      return activeTokenRef.current;
    }

    setMessage(undefined);
    const isReady = await waitForReady();

    const container = containerRef.current;
    const turnstile = window.turnstile;
    const execute = turnstile?.execute;

    if (!isReady || !container || !turnstile || !execute) {
      setMessage(challenge.unavailableMessage);
      return null;
    }

    return new Promise<string | null>((resolve) => {
      let hasSettled = false;

      const settle = (token: string | null) => {
        if (hasSettled) {
          return;
        }

        hasSettled = true;
        window.clearTimeout(timeoutId);
        resolve(token);
      };

      pendingTokenResolversRef.current.push(settle);
      const timeoutId = window.setTimeout(() => {
        pendingTokenResolversRef.current = pendingTokenResolversRef.current.filter(
          (resolver) => resolver !== settle,
        );
        setMessage(challenge.unavailableMessage);
        settle(null);
      }, 15000);

      try {
        execute.call(turnstile, container);
      } catch {
        pendingTokenResolversRef.current = pendingTokenResolversRef.current.filter(
          (resolver) => resolver !== settle,
        );
        setMessage(challenge.unavailableMessage);
        settle(null);
      }
    });
  }, [challenge?.siteKey, challenge?.unavailableMessage, waitForReady]);

  useImperativeHandle(ref, () => ({
    execute: executeChallenge,
    reset: resetChallenge,
  }), [executeChallenge, resetChallenge]);

  useEffect(() => {
    if (!challenge?.siteKey || !containerRef.current) {
      activeTokenRef.current = null;
      onTokenChange(null);
      resolveReady(false);
      return;
    }

    let isMounted = true;
    let responseSyncId: number | undefined;

    const syncResponseToken = () => {
      if (!isMounted || !widgetIdRef.current || !window.turnstile?.getResponse) {
        return;
      }

      const token = window.turnstile.getResponse(widgetIdRef.current);

      if (token && token !== activeTokenRef.current) {
        setHasChallengeFrame(false);
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
        setIsInteractive(false);
        activeTokenRef.current = null;
        onTokenChange(null);
        readyPromiseRef.current = new Promise<boolean>((resolve) => {
          resolveReadyRef.current = resolve;
        });
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          action: challenge.action,
          appearance: "interaction-only",
          "after-interactive-callback"() {
            setIsInteractive(false);
          },
          "before-interactive-callback"() {
            setHasChallengeFrame(Boolean(containerRef.current?.querySelector("iframe")));
            setIsInteractive(true);
          },
          callback(token: string) {
            setHasChallengeFrame(false);
            setIsInteractive(false);
            setMessage(undefined);
            publishToken(token);
          },
          "error-callback"() {
            setHasChallengeFrame(false);
            setIsInteractive(false);
            publishToken(null);
            setMessage(challenge.unavailableMessage);
            return true;
          },
          execution: "execute",
          "expired-callback"() {
            setHasChallengeFrame(false);
            setIsInteractive(false);
            publishToken(null);

            if (widgetIdRef.current) {
              window.turnstile?.reset?.(widgetIdRef.current);
            }
          },
          "timeout-callback"() {
            setHasChallengeFrame(false);
            setIsInteractive(false);
            publishToken(null);

            if (widgetIdRef.current) {
              window.turnstile?.reset?.(widgetIdRef.current);
            }
          },
          "unsupported-callback"() {
            setHasChallengeFrame(false);
            setIsInteractive(false);
            publishToken(null);
            setMessage(challenge.unavailableMessage);
            return true;
          },
          sitekey: challenge.siteKey,
          theme: "light",
        });
        resolveReady(true);
        syncResponseToken();
        responseSyncId = window.setInterval(syncResponseToken, 750);
      })
      .catch(() => {
        if (isMounted) {
          setHasChallengeFrame(false);
          setIsInteractive(false);
          publishToken(null);
          resolveReady(false);
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

      resolvePendingTokenRequests(null);
      widgetIdRef.current = null;
    };
  }, [
    challenge,
    onTokenChange,
    publishToken,
    resolvePendingTokenRequests,
    resolveReady,
  ]);

  useEffect(() => {
    if (!challenge?.siteKey || !containerRef.current) {
      setHasChallengeFrame(false);
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

    resetChallenge();
  }, [resetChallenge, resetSignal]);

  if (!challenge?.siteKey) {
    return null;
  }

  const isChallengeVisible = isInteractive && hasChallengeFrame;

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
});
