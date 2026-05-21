"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { createSnnAuthClient, withTurnstileFetchOptions } from "@snn/auth/client";
import { Button, Link, PasswordField, TextField } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";
import {
  hasFieldErrors,
  isValidEmail,
  removeFieldError,
  type FieldErrors,
} from "./form-validation";
import { TurnstileField, type TurnstileChallenge } from "./turnstile-field";

type SignInFieldName = "email" | "password";

export type SignInFormMessages = {
  emailInvalid: string;
  emailRequired: string;
  genericError: string;
  networkError: string;
  passwordRequired: string;
  required: string;
  verificationRequired: string;
};

export type SignInFormProps = {
  callbackURL: string;
  emailLabel: string;
  forgotPasswordLabel: string;
  forgotPasswordHref: string;
  initialError?: string | undefined;
  messages: SignInFormMessages;
  onVerificationRequired?: ((email: string) => void) | undefined;
  passwordLabel: string;
  primaryAction: string;
  turnstile?: TurnstileChallenge | undefined;
  twoFactorHref: string;
};

export function SignInForm({
  callbackURL,
  emailLabel,
  forgotPasswordLabel,
  forgotPasswordHref,
  initialError,
  messages,
  onVerificationRequired,
  passwordLabel,
  primaryAction,
  turnstile,
  twoFactorHref,
}: SignInFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | undefined>(initialError);
  const [tone, setTone] = useState<"danger" | "success">("danger");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInFieldName>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
  }, []);

  function clearFieldError(field: SignInFieldName) {
    setFieldErrors((currentErrors) => removeFieldError(currentErrors, field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const nextFieldErrors: FieldErrors<SignInFieldName> = {};

    if (!email) {
      nextFieldErrors.email = messages.emailRequired;
    } else if (!isValidEmail(email)) {
      nextFieldErrors.email = messages.emailInvalid;
    }

    if (!password) {
      nextFieldErrors.password = messages.passwordRequired;
    }

    setFieldErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    if (turnstile?.siteKey && !turnstileToken) {
      setTone("danger");
      setMessage(turnstile.requiredMessage);
      setTurnstileResetSignal((currentSignal) => currentSignal + 1);
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
        ...withTurnstileFetchOptions(turnstileToken),
      });

      if (result.error) {
        const authError = result.error as { code?: string; message?: string };
        const errorCode = authError.code ?? "";
        const errorMessage = authError.message ?? "";
        const isVerificationError =
          errorCode === "EMAIL_NOT_VERIFIED" ||
          /verify|verification|unverified/i.test(errorMessage);

        setTone("danger");
        if (isVerificationError) {
          onVerificationRequired?.(email);
          setMessage(onVerificationRequired ? undefined : messages.verificationRequired);
          return;
        }

        setMessage(messages.genericError);
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
      if (turnstile?.siteKey) {
        setTurnstileToken(null);
        setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      }

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
        error={fieldErrors.email}
        fullWidth
        label={emailLabel}
        labelMode="floating"
        name="email"
        onChange={() => clearFieldError("email")}
        required
        size="md"
        type="email"
      />
      <PasswordField
        autoComplete="current-password"
        error={fieldErrors.password}
        fullWidth
        label={passwordLabel}
        labelMode="floating"
        name="password"
        onChange={() => clearFieldError("password")}
        required
        size="md"
        type="password"
      />

      <AuthStatusMessage message={message} tone={tone} />

      <TurnstileField
        challenge={turnstile}
        disabled={isSubmitting}
        onTokenChange={setTurnstileToken}
        resetSignal={turnstileResetSignal}
      />

      <Link href={forgotPasswordHref} variant="underline">
        {forgotPasswordLabel}
      </Link>

      <Button
        disabled={isSubmitting}
        fullWidth
        loading={isSubmitting}
        size="md"
        type="submit"
      >
        {primaryAction}
      </Button>
    </form>
  );
}
