"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

const passwordMinLength = 15;
const passwordMaxLength = 128;

type ForgotPasswordFormProps = {
  emailLabel: string;
  emailPlaceholder: string;
  resetRedirectURL: string;
  submitLabel: string;
  successMessage: string;
};

type ResetPasswordFormProps = {
  callbackURL: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  errorCode?: string | undefined;
  passwordLabel: string;
  passwordPlaceholder: string;
  signInHref: string;
  submitLabel: string;
  successMessage: string;
  token?: string | undefined;
};

function getResetTokenError(errorCode: string | undefined, hasToken: boolean) {
  if (hasToken && !errorCode) {
    return undefined;
  }

  return "This password reset link is invalid or expired. Please request a new link.";
}

function validatePassword(password: string, confirmPassword: string) {
  if (password.length < passwordMinLength) {
    return `Password must be at least ${passwordMinLength} characters.`;
  }

  if (password.length > passwordMaxLength) {
    return `Password must be no more than ${passwordMaxLength} characters.`;
  }

  if (password !== confirmPassword) {
    return "Passwords must match.";
  }

  return undefined;
}

export function ForgotPasswordForm({
  emailLabel,
  emailPlaceholder,
  resetRedirectURL,
  submitLabel,
  successMessage,
}: ForgotPasswordFormProps) {
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

    try {
      await createSnnAuthClient().requestPasswordReset({
        email,
        redirectTo: resetRedirectURL,
      });

      setSuccess(successMessage);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
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
      <Button
        className="submit__button__SW0fx"
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        {submitLabel}
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

export function ResetPasswordForm({
  callbackURL,
  confirmPasswordLabel,
  confirmPasswordPlaceholder,
  errorCode,
  passwordLabel,
  passwordPlaceholder,
  signInHref,
  submitLabel,
  successMessage,
  token,
}: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>(
    getResetTokenError(errorCode, Boolean(token)),
  );
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError(getResetTokenError(errorCode, false));
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const passwordError = validatePassword(newPassword, confirmPassword);

    if (passwordError) {
      setError(passwordError);
      setIsPending(false);
      return;
    }

    try {
      const result = await createSnnAuthClient().resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        setError("This password reset link is invalid or expired. Please request a new link.");
        return;
      }

      setSuccess(successMessage);
      window.setTimeout(() => {
        window.location.assign(signInHref || callbackURL);
      }, 900);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <TextField
        autoComplete="new-password"
        disabled={isPending || !token}
        fullWidth
        label={passwordLabel}
        maxLength={passwordMaxLength}
        minLength={passwordMinLength}
        name="password"
        placeholder={passwordPlaceholder}
        required
        size="md"
        type="password"
      />
      <TextField
        autoComplete="new-password"
        disabled={isPending || !token}
        fullWidth
        label={confirmPasswordLabel}
        maxLength={passwordMaxLength}
        minLength={passwordMinLength}
        name="confirmPassword"
        placeholder={confirmPasswordPlaceholder}
        required
        size="md"
        type="password"
      />
      <Button
        className="submit__button__SW0fx"
        disabled={!token}
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        {submitLabel}
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
