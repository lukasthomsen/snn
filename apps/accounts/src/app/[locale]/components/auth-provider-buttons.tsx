"use client";

import { useEffect, useState } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { AppleLogoIcon, Button, GoogleLogoIcon } from "@snn/ui";

type AuthProvider = "apple" | "google";
type AuthAction = AuthProvider | "passkey";

type ProviderAvailability = Record<AuthProvider, boolean>;

type AuthProviderButtonsProps = {
  appleLabel: string;
  callbackURL: string;
  googleLabel: string;
  passkeyLabel?: string | undefined;
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

function parseProviderRedirect(value: unknown) {
  if (!isRecord(value) || typeof value.url !== "string") {
    return undefined;
  }

  return value.url;
}

export function AuthProviderButtons({
  appleLabel,
  callbackURL,
  googleLabel,
  passkeyLabel,
}: AuthProviderButtonsProps) {
  const [availability, setAvailability] =
    useState<ProviderAvailability>(inactiveAvailability);
  const [isChecking, setIsChecking] = useState(true);
  const [pendingAction, setPendingAction] = useState<AuthAction | undefined>();
  const [supportsPasskeys, setSupportsPasskeys] = useState(false);
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

    checkProviders();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setSupportsPasskeys(
      typeof window !== "undefined" &&
        "PublicKeyCredential" in window &&
        typeof window.PublicKeyCredential === "function",
    );
  }, []);

  async function continueWithProvider(provider: AuthProvider) {
    if (!availability[provider] || pendingAction) {
      return;
    }

    setError(undefined);
    setPendingAction(provider);

    try {
      const result = await createSnnAuthClient().signIn.social({
        callbackURL,
        errorCallbackURL: window.location.href,
        provider,
      });
      const redirectURL = parseProviderRedirect(result.data);

      if (result.error || !redirectURL) {
        setAvailability((current) => ({
          ...current,
          [provider]: false,
        }));
        setPendingAction(undefined);
        setError("This provider is not available right now.");
        return;
      }

      window.location.assign(redirectURL);
    } catch {
      setAvailability((current) => ({
        ...current,
        [provider]: false,
      }));
      setPendingAction(undefined);
      setError("This provider is not available right now.");
    }
  }

  async function continueWithPasskey() {
    if (!supportsPasskeys || pendingAction) {
      return;
    }

    setError(undefined);
    setPendingAction("passkey");

    try {
      const result = await createSnnAuthClient().signIn.passkey();

      if (result.error) {
        setPendingAction(undefined);
        setError("Passkey sign-in could not be completed.");
        return;
      }

      window.location.assign(callbackURL);
    } catch {
      setPendingAction(undefined);
      setError("Passkey sign-in was cancelled or unavailable.");
    }
  }

  const hasPasskeyButton = Boolean(passkeyLabel && supportsPasskeys);
  const isGoogleInactive = isChecking || pendingAction !== undefined || !availability.google;
  const isAppleInactive = isChecking || pendingAction !== undefined || !availability.apple;
  const isPasskeyInactive = pendingAction !== undefined || !supportsPasskeys;

  return (
    <div className="provider__buttons__SW0fs">
      <Button
        className="provider__button__SW0ft"
        disabled={isGoogleInactive}
        fullWidth
        loading={pendingAction === "google"}
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
        loading={pendingAction === "apple"}
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
      {hasPasskeyButton ? (
        <Button
          className="provider__button__SW0ft"
          disabled={isPasskeyInactive}
          fullWidth
          loading={pendingAction === "passkey"}
          onClick={() => void continueWithPasskey()}
          shape="field"
          size="md"
          tone="secondary"
          type="button"
        >
          <span>{passkeyLabel}</span>
        </Button>
      ) : null}
      {error ? (
        <p className="form__notice__SW0hq" data-tone="danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
