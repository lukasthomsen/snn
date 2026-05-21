"use client";

import { useEffect, useMemo, useState } from "react";

import { createSnnAuthClient, withTurnstileFetchOptions } from "@snn/auth/client";
import { AppleLogoIcon, Button, GoogleLogoIcon } from "@snn/ui";
import type { ControlSize } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";
import { TurnstileField, type TurnstileChallenge } from "./turnstile-field";

export type SocialAuthButtonsProps = {
  appleLabel: string;
  callbackURL: string;
  errorCallbackURL: string;
  googleLabel: string;
  initialMessage?: string | undefined;
  messages: {
    genericError: string;
    unavailable: string;
  };
  newUserCallbackURL?: string | undefined;
  size?: ControlSize | undefined;
  turnstile?: TurnstileChallenge | undefined;
};

export function SocialAuthButtons({
  appleLabel,
  callbackURL,
  errorCallbackURL,
  googleLabel,
  initialMessage,
  messages,
  newUserCallbackURL,
  size = "sm",
  turnstile,
}: SocialAuthButtonsProps) {
  const [message, setMessage] = useState<string | undefined>(initialMessage);
  const [availability, setAvailability] = useState({
    apple: true,
    google: true,
  });
  const [pendingProvider, setPendingProvider] = useState<"apple" | "google" | null>(
    null,
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const authClient = useMemo(() => createSnnAuthClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadProviders() {
      try {
        const response = await fetch("/api/auth/social-providers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load social providers.");
        }

        const data = (await response.json()) as {
          apple?: boolean;
          google?: boolean;
        };

        if (isMounted) {
          setAvailability({
            apple: Boolean(data.apple),
            google: Boolean(data.google),
          });
        }
      } catch {
        if (isMounted) {
          setAvailability({
            apple: true,
            google: true,
          });
        }
      }
    }

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSocialSignIn(provider: "apple" | "google") {
    setMessage(undefined);

    if (!availability[provider]) {
      setMessage(messages.unavailable);
      return;
    }

    if (turnstile?.siteKey && !turnstileToken) {
      setMessage(turnstile.requiredMessage);
      setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      return;
    }

    setPendingProvider(provider);

    try {
      const result = await authClient.signIn.social({
        callbackURL,
        errorCallbackURL,
        ...(newUserCallbackURL ? { newUserCallbackURL } : {}),
        provider,
        ...withTurnstileFetchOptions(turnstileToken),
      });

      if (result.error) {
        setMessage(messages.genericError);
        return;
      }

      if (result.data?.url) {
        window.location.assign(result.data.url);
      }
    } catch {
      setMessage(messages.genericError);
    } finally {
      if (turnstile?.siteKey) {
        setTurnstileToken(null);
        setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      }

      setPendingProvider(null);
    }
  }

  return (
    <div className="provider__buttons__SW0fs">
      <Button
        disabled={pendingProvider !== null || !availability.google}
        fullWidth
        loading={pendingProvider === "google"}
        onClick={() => void handleSocialSignIn("google")}
        radius="sm"
        shape="field"
        size={size}
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <GoogleLogoIcon size={18} />
        </span>
        <span>{googleLabel}</span>
      </Button>
      <Button
        disabled={pendingProvider !== null || !availability.apple}
        fullWidth
        loading={pendingProvider === "apple"}
        onClick={() => void handleSocialSignIn("apple")}
        radius="sm"
        shape="field"
        size={size}
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <AppleLogoIcon size={19} />
        </span>
        <span>{appleLabel}</span>
      </Button>
      <TurnstileField
        challenge={turnstile}
        disabled={pendingProvider !== null}
        onTokenChange={setTurnstileToken}
        resetSignal={turnstileResetSignal}
      />
      <AuthStatusMessage message={message} tone="danger" />
    </div>
  );
}
