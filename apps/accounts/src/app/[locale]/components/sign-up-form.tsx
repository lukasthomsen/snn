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
  const [message, setMessage] = useState<string | undefined>();
  const [tone, setTone] = useState<"danger" | "success">("danger");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name || !email || !password || !confirmPassword) {
      setTone("danger");
      setMessage(messages.required);
      return;
    }

    if (!validatePassword(password)) {
      setTone("danger");
      setMessage(messages.passwordLength);
      return;
    }

    if (password !== confirmPassword) {
      setTone("danger");
      setMessage(messages.mismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSnnAuthClient().signUp.email({
        callbackURL,
        email,
        name,
        password,
      });

      if (result.error) {
        setTone("danger");
        setMessage(messages.genericError);
        return;
      }

      setTone("success");
      setMessage(verificationCopy);
    } catch {
      setTone("danger");
      setMessage(messages.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={handleSubmit}>
      <TextField
        autoComplete="name"
        fullWidth
        label={nameLabel}
        name="name"
        placeholder={namePlaceholder}
        required
        size="md"
      />
      <TextField
        autoComplete="email"
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
        disabled={isSubmitting}
        fullWidth
        size="lg"
        type="submit"
      >
        <span>{isSubmitting ? `${primaryAction}...` : primaryAction}</span>
        <span aria-hidden="true">→</span>
      </Button>

      <AuthStatusMessage message={message} tone={tone} />
    </form>
  );
}
