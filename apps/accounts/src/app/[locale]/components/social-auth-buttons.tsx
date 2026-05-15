"use client";

import { useEffect, useMemo, useState } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { AppleLogoIcon, Button, GoogleLogoIcon } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type SocialAuthButtonsProps = {
  appleLabel: string;
  callbackURL: string;
  errorCallbackURL: string;
  googleLabel: string;
  initialMessage?: string | undefined;
  messages: {
    checking: string;
    genericError: string;
    unavailable: string;
  };
};

export function SocialAuthButtons({
  appleLabel,
  callbackURL,
  errorCallbackURL,
  googleLabel,
  initialMessage,
  messages,
}: SocialAuthButtonsProps) {
  const [message, setMessage] = useState<string | undefined>(initialMessage);
  const [availability, setAvailability] = useState({
    apple: false,
    google: false,
  });
  const [isChecking, setIsChecking] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<"apple" | "google" | null>(
    null,
  );
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
            apple: false,
            google: false,
          });
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
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

    setPendingProvider(provider);

    try {
      const result = await authClient.signIn.social({
        callbackURL,
        errorCallbackURL,
        provider,
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
      setPendingProvider(null);
    }
  }

  return (
    <div className="provider__buttons__SW0fs">
      <Button
        disabled={isChecking || pendingProvider !== null || !availability.google}
        fullWidth
        onClick={() => void handleSocialSignIn("google")}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <GoogleLogoIcon size={18} />
        </span>
        <span>
          {isChecking
            ? messages.checking
            : pendingProvider === "google"
              ? `${googleLabel}...`
              : googleLabel}
        </span>
      </Button>
      <Button
        disabled={isChecking || pendingProvider !== null || !availability.apple}
        fullWidth
        onClick={() => void handleSocialSignIn("apple")}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <AppleLogoIcon size={19} />
        </span>
        <span>
          {isChecking
            ? messages.checking
            : pendingProvider === "apple"
              ? `${appleLabel}...`
              : appleLabel}
        </span>
      </Button>
      <AuthStatusMessage message={message} tone="danger" />
    </div>
  );
}
