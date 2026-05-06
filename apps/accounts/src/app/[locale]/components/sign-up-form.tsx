"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

const passwordMinLength = 15;
const passwordMaxLength = 128;

type SignUpFormMessages = {
  genericError: string;
  mismatch: string;
  networkError: string;
  passwordLength: string;
  required: string;
};

type SignUpFormProps = {
  callbackURL: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messages: SignUpFormMessages;
  nameLabel: string;
  namePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  primaryAction: string;
  verificationCopy: string;
};

function validatePassword(password: string) {
  return password.length >= passwordMinLength && password.length <= passwordMaxLength;
}

export function SignUpForm({
  callbackURL,
  confirmPasswordLabel,
  confirmPasswordPlaceholder,
  emailLabel,
  emailPlaceholder,
  messages,
  nameLabel,
  namePlaceholder,
  passwordLabel,
  passwordPlaceholder,
  primaryAction,
  verificationCopy,
}: SignUpFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name || !email || !password || !confirmPassword) {
      setError(messages.required);
      return;
    }

    if (!validatePassword(password)) {
      setError(messages.passwordLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(messages.mismatch);
      return;
    }

    setIsPending(true);

    try {
      const result = await createSnnAuthClient().signUp.email({
        callbackURL,
        email,
        name,
        password,
      });

      if (result.error) {
        setError(messages.genericError);
        return;
      }

      setSuccess(verificationCopy);
    } catch {
      setError(messages.networkError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <TextField
        autoComplete="name"
        disabled={isPending}
        fullWidth
        label={nameLabel}
        name="name"
        placeholder={namePlaceholder}
        required
        size="md"
      />
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
        autoComplete="new-password"
        disabled={isPending}
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
        disabled={isPending}
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
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        <span>{primaryAction}</span>
        <span aria-hidden="true">→</span>
      </Button>

      <AuthStatusMessage message={success} tone="success" />
      <AuthStatusMessage message={error} tone="danger" />
    </form>
  );
}
