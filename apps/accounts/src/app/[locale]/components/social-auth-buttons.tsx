"use client";

import { useEffect, useState } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { AppleLogoIcon, Button, GoogleLogoIcon } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type AuthProvider = "apple" | "google";
type ProviderAvailability = Record<AuthProvider, boolean>;

type SocialAuthButtonsProps = {
  appleLabel: string;
  callbackURL: string;
  googleLabel: string;
};

const inactiveAvailability: ProviderAvailability = {
  apple: false,
  google: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseAvailability(value: unknown): ProviderAvailability {
  if (!isRecord(value)) {
    return inactiveAvailability;
  }

  return {
    apple: value.apple === true,
    google: value.google === true,
  };
}

function parseRedirectURL(value: unknown) {
  if (!isRecord(value) || typeof value.url !== "string") {
    return undefined;
  }

  return value.url;
}

function getErrorCallbackURL() {
  const errorURL = new URL(window.location.href);

  errorURL.searchParams.set("error", "oauth_failed");

  return errorURL.toString();
}

export function SocialAuthButtons({
  appleLabel,
  callbackURL,
  googleLabel,
}: SocialAuthButtonsProps) {
  const [availability, setAvailability] =
    useState<ProviderAvailability>(inactiveAvailability);
  const [isChecking, setIsChecking] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const controller = new AbortController();

    async function checkProviders() {
      try {
        const response = await fetch("/api/auth/social-providers", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setAvailability(inactiveAvailability);
          return;
        }

        setAvailability(parseAvailability(await response.json()));
      } catch {
        if (!controller.signal.aborted) {
          setAvailability(inactiveAvailability);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsChecking(false);
        }
      }
    }

    void checkProviders();

    return () => {
      controller.abort();
    };
  }, []);

  async function continueWithProvider(provider: AuthProvider) {
    if (!availability[provider] || pendingProvider) {
      return;
    }

    setError(undefined);
    setPendingProvider(provider);

    try {
      const result = await createSnnAuthClient().signIn.social({
        callbackURL,
        errorCallbackURL: getErrorCallbackURL(),
        provider,
      });
      const redirectURL = parseRedirectURL(result.data);

      if (result.error || !redirectURL) {
        setAvailability((current) => ({
          ...current,
          [provider]: false,
        }));
        setError("This provider is not available right now.");
        return;
      }

      window.location.assign(redirectURL);
    } catch {
      setAvailability((current) => ({
        ...current,
        [provider]: false,
      }));
      setError("This provider is not available right now.");
    } finally {
      setPendingProvider(undefined);
    }
  }

  const isGoogleInactive = isChecking || pendingProvider !== undefined || !availability.google;
  const isAppleInactive = isChecking || pendingProvider !== undefined || !availability.apple;

  return (
    <div className="provider__buttons__SW0fs">
      <Button
        className="provider__button__SW0ft"
        disabled={isGoogleInactive}
        fullWidth
        loading={pendingProvider === "google"}
        onClick={() => void continueWithProvider("google")}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <GoogleLogoIcon size={18} />
        </span>
        <span>{googleLabel}</span>
      </Button>
      <Button
        className="provider__button__SW0ft"
        disabled={isAppleInactive}
        fullWidth
        loading={pendingProvider === "apple"}
        onClick={() => void continueWithProvider("apple")}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <AppleLogoIcon size={19} />
        </span>
        <span>{appleLabel}</span>
      </Button>
      <AuthStatusMessage message={error} tone="danger" />
    </div>
  );
}
