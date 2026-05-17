"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

import type { AuthField } from "./auth-page";

const passwordMinLength = 8;
const passwordMaxLength = 128;

type AuthEmailFormProps = {
  callbackURL: string;
  fields: AuthField[];
  forgotPasswordHref?: string | undefined;
  forgotPasswordLabel?: string | undefined;
  mode: "sign-in" | "sign-up";
  primaryAction: string;
  twoFactorHref: string;
  verificationCallbackURL?: string | undefined;
  verificationCopy: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getRedirectURL(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  return typeof value.url === "string" ? value.url : undefined;
}

function requiresTwoFactor(value: unknown) {
  return isRecord(value) && value.twoFactorRedirect === true;
}

function getFormError(mode: AuthEmailFormProps["mode"]) {
  return mode === "sign-in"
    ? "We could not sign you in. Check your details, verify your email, and try again."
    : "We could not create that account. Check the details and try again.";
}

function validatePassword(password: string) {
  if (password.length < passwordMinLength) {
    return `Password must be at least ${passwordMinLength} characters.`;
  }

  if (password.length > passwordMaxLength) {
    return `Password must be no more than ${passwordMaxLength} characters.`;
  }

  return undefined;
}

export function AuthEmailForm({
  callbackURL,
  fields,
  forgotPasswordHref,
  forgotPasswordLabel,
  mode,
  primaryAction,
  twoFactorHref,
  verificationCallbackURL,
  verificationCopy,
}: AuthEmailFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const passwordError = mode === "sign-up" ? validatePassword(password) : undefined;

    if (!email || !password) {
      setError("Email and password are required.");
      setIsPending(false);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      setIsPending(false);
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords must match.");
      setIsPending(false);
      return;
    }

    try {
      const authClient = createSnnAuthClient(undefined, {
        twoFactorPage: twoFactorHref,
      });
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({
              callbackURL,
              email,
              password,
              rememberMe: true,
            })
          : await authClient.signUp.email({
              callbackURL: verificationCallbackURL ?? callbackURL,
              email,
              name: email.split("@")[0] || email,
              password,
            });
      const data = result.data as unknown;

      if (requiresTwoFactor(data)) {
        window.location.assign(twoFactorHref);
        return;
      }

      if (result.error) {
        setError(getFormError(mode));
        return;
      }

      if (mode === "sign-up") {
        setSuccess(verificationCopy);
        return;
      }

      window.location.assign(getRedirectURL(data) ?? callbackURL);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      {fields.map((field) => (
        <TextField
          autoComplete={field.autoComplete}
          disabled={isPending}
          fullWidth
          key={field.name}
          label={field.label}
          name={field.name}
          placeholder={field.placeholder}
          required
          size="md"
          type={field.type ?? "text"}
          maxLength={field.maxLength}
          minLength={field.minLength}
        />
      ))}

      {forgotPasswordHref ? (
        <a className="form__link__SW0hp" href={forgotPasswordHref}>
          {forgotPasswordLabel ?? "Forgot password?"}
        </a>
      ) : null}

      <Button
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        <span>{primaryAction}</span>
        <span aria-hidden="true">→</span>
      </Button>

      {success ? (
        <p className="form__notice__SW0hq" data-tone="success">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="form__notice__SW0hq" data-tone="danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
