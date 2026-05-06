"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type SignInFormMessages = {
  genericError: string;
  networkError: string;
  required: string;
};

type SignInFormProps = {
  callbackURL: string;
  emailLabel: string;
  emailPlaceholder: string;
  forgotPasswordHref: string;
  forgotPasswordLabel: string;
  initialError?: string | undefined;
  messages: SignInFormMessages;
  passwordLabel: string;
  passwordPlaceholder: string;
  primaryAction: string;
  twoFactorHref: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getRedirectURL(value: unknown) {
  if (!isRecord(value) || typeof value.url !== "string") {
    return undefined;
  }

  return value.url;
}

function requiresTwoFactor(value: unknown) {
  return isRecord(value) && value.twoFactorRedirect === true;
}

export function SignInForm({
  callbackURL,
  emailLabel,
  emailPlaceholder,
  forgotPasswordHref,
  forgotPasswordLabel,
  initialError,
  messages,
  passwordLabel,
  passwordPlaceholder,
  primaryAction,
  twoFactorHref,
}: SignInFormProps) {
  const [error, setError] = useState<string | undefined>(initialError);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError(messages.required);
      return;
    }

    setIsPending(true);

    try {
      const result = await createSnnAuthClient(undefined, {
        twoFactorPage: twoFactorHref,
      }).signIn.email({
        callbackURL,
        email,
        password,
        rememberMe: true,
      });
      const data = result.data as unknown;

      if (requiresTwoFactor(data)) {
        window.location.assign(twoFactorHref);
        return;
      }

      if (result.error) {
        setError(messages.genericError);
        return;
      }

      window.location.assign(getRedirectURL(data) ?? callbackURL);
    } catch {
      setError(messages.networkError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <TextField
        autoComplete="email"
        disabled={isPending}
        fullWidth
        label={emailLabel}
        name="email"
        placeholder={emailPlaceholder}
        required
        size="md"
        type="email"
      />
      <TextField
        autoComplete="current-password"
        disabled={isPending}
        fullWidth
        label={passwordLabel}
        name="password"
        placeholder={passwordPlaceholder}
        required
        size="md"
        type="password"
      />

      <a className="form__link__SW0hp" href={forgotPasswordHref}>
        {forgotPasswordLabel}
      </a>

      <Button
        className="submit__button__SW0fx"
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        <span>{primaryAction}</span>
        <span aria-hidden="true">→</span>
      </Button>

      <AuthStatusMessage message={error} tone="danger" />
    </form>
  );
}
