"use client";

import { useState, type FormEvent } from "react";

import { Button, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

const passwordMinLength = 15;
const passwordMaxLength = 128;

type SignUpFormMessages = {
  disabled: string;
  mismatch: string;
  passwordLength: string;
  required: string;
};

type SignUpFormProps = {
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
};

function validatePassword(password: string) {
  return password.length >= passwordMinLength && password.length <= passwordMaxLength;
}

export function SignUpForm({
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
}: SignUpFormProps) {
  const [message, setMessage] = useState<string | undefined>();
  const [tone, setTone] = useState<"danger" | "success">("danger");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
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

    setTone("danger");
    setMessage(messages.disabled);
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
        fullWidth
        size="lg"
        type="submit"
      >
        <span>{primaryAction}</span>
        <span aria-hidden="true">→</span>
      </Button>

      <AuthStatusMessage message={message} tone={tone} />
    </form>
  );
}
