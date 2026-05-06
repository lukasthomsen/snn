"use client";

import { useState, type FormEvent } from "react";

import { Button, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type SignInFormMessages = {
  disabled: string;
  required: string;
};

type SignInFormProps = {
  emailLabel: string;
  emailPlaceholder: string;
  forgotPasswordLabel: string;
  messages: SignInFormMessages;
  passwordLabel: string;
  passwordPlaceholder: string;
  primaryAction: string;
};

export function SignInForm({
  emailLabel,
  emailPlaceholder,
  forgotPasswordLabel,
  messages,
  passwordLabel,
  passwordPlaceholder,
  primaryAction,
}: SignInFormProps) {
  const [message, setMessage] = useState<string | undefined>();
  const [tone, setTone] = useState<"danger" | "success">("danger");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setTone("danger");
      setMessage(messages.required);
      return;
    }

    setTone("danger");
    setMessage(messages.disabled);
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={handleSubmit}>
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
        autoComplete="current-password"
        fullWidth
        label={passwordLabel}
        name="password"
        placeholder={passwordPlaceholder}
        required
        size="md"
        type="password"
      />

      <button
        className="form__link__SW0hp"
        onClick={() => {
          setTone("danger");
          setMessage(messages.disabled);
        }}
        type="button"
      >
        {forgotPasswordLabel}
      </button>

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
