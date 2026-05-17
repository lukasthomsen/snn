"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type SignInFormMessages = {
  genericError: string;
  networkError: string;
  required: string;
  verificationRequired: string;
};

type SignInFormProps = {
  callbackURL: string;
  emailLabel: string;
  emailPlaceholder: string;
  forgotPasswordLabel: string;
  forgotPasswordHref: string;
  initialError?: string | undefined;
  messages: SignInFormMessages;
  passwordLabel: string;
  passwordPlaceholder: string;
  primaryAction: string;
  twoFactorHref: string;
};

export function SignInForm({
  callbackURL,
  emailLabel,
  emailPlaceholder,
  forgotPasswordLabel,
  forgotPasswordHref,
  initialError,
  messages,
  passwordLabel,
  passwordPlaceholder,
  primaryAction,
  twoFactorHref,
}: SignInFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | undefined>(initialError);
  const [tone, setTone] = useState<"danger" | "success">("danger");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setTone("danger");
      setMessage(messages.required);
      return;
    }

    setIsSubmitting(true);

    try {
      const authClient = createSnnAuthClient(undefined, {
        twoFactorPage: twoFactorHref,
      });
      const result = await authClient.signIn.email({
        callbackURL,
        email,
        password,
        rememberMe: true,
      });

      if (result.error) {
        const errorMessage = result.error.message ?? "";

        setTone("danger");
        setMessage(
          /verify|verification|unverified/i.test(errorMessage)
            ? messages.verificationRequired
            : messages.genericError,
        );
        return;
      }

      const signInData = result.data as
        | {
            twoFactorRedirect?: boolean;
            url?: string | undefined;
          }
        | null
        | undefined;

      if (signInData?.twoFactorRedirect) {
        window.location.assign(twoFactorHref);
        return;
      }

      window.location.assign(signInData?.url ?? callbackURL);
    } catch {
      setTone("danger");
      setMessage(messages.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-busy={isSubmitting}
      className="auth__form__SW0fp"
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <TextField
        autoComplete="email"
        autoFocus
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

      <a className="form__link__SW0hp" href={forgotPasswordHref}>
        {forgotPasswordLabel}
      </a>

      <Button
        disabled={isSubmitting}
        fullWidth
        loading={isSubmitting}
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
