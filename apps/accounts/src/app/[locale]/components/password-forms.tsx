"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient, withTurnstileFetchOptions } from "@snn/auth/client";
import { authPasswordPolicy } from "@snn/auth/policy";
import { Button, TextField } from "@snn/ui";

import {
  hasFieldErrors,
  isValidEmail,
  removeFieldError,
  type FieldErrors,
} from "./form-validation";
import { TurnstileField, type TurnstileChallenge } from "./turnstile-field";

const passwordMinLength = authPasswordPolicy.minLength;
const passwordMaxLength = authPasswordPolicy.maxLength;

type ForgotPasswordFieldName = "email";
type ResetPasswordFieldName = "confirmPassword" | "password";

type ForgotPasswordFormMessages = {
  emailInvalid: string;
  emailRequired: string;
  networkError: string;
};

type ForgotPasswordFormProps = {
  emailLabel: string;
  emailPlaceholder: string;
  messages: ForgotPasswordFormMessages;
  resetRedirectURL: string;
  submitLabel: string;
  successMessage: string;
  turnstile?: TurnstileChallenge | undefined;
};

type ResetPasswordFormMessages = {
  confirmPasswordRequired: string;
  networkError: string;
  passwordMaxLength: string;
  passwordMinLength: string;
  passwordMismatch: string;
  passwordRequired: string;
  tokenInvalid: string;
};

type ResetPasswordFormProps = {
  callbackURL: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  errorCode?: string | undefined;
  messages: ResetPasswordFormMessages;
  passwordLabel: string;
  passwordPlaceholder: string;
  signInHref: string;
  submitLabel: string;
  successMessage: string;
  token?: string | undefined;
};

function getResetTokenError(
  errorCode: string | undefined,
  hasToken: boolean,
  messages: ResetPasswordFormMessages,
) {
  if (hasToken && !errorCode) {
    return undefined;
  }

  return messages.tokenInvalid;
}

function validatePassword(
  password: string,
  confirmPassword: string,
  messages: ResetPasswordFormMessages,
) {
  const nextFieldErrors: FieldErrors<ResetPasswordFieldName> = {};

  if (!password) {
    nextFieldErrors.password = messages.passwordRequired;
  } else if (password.length < passwordMinLength) {
    nextFieldErrors.password = messages.passwordMinLength;
  } else if (password.length > passwordMaxLength) {
    nextFieldErrors.password = messages.passwordMaxLength;
  }

  if (!confirmPassword) {
    nextFieldErrors.confirmPassword = messages.confirmPasswordRequired;
  } else if (password && password !== confirmPassword) {
    nextFieldErrors.confirmPassword = messages.passwordMismatch;
  }

  return nextFieldErrors;
}

export function ForgotPasswordForm({
  emailLabel,
  emailPlaceholder,
  messages,
  resetRedirectURL,
  submitLabel,
  successMessage,
  turnstile,
}: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ForgotPasswordFieldName>>({});
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  function clearFieldError(field: ForgotPasswordFieldName) {
    setFieldErrors((currentErrors) => removeFieldError(currentErrors, field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const nextFieldErrors: FieldErrors<ForgotPasswordFieldName> = {};

    if (!email) {
      nextFieldErrors.email = messages.emailRequired;
    } else if (!isValidEmail(email)) {
      nextFieldErrors.email = messages.emailInvalid;
    }

    setFieldErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    if (turnstile?.siteKey && !turnstileToken) {
      setError(turnstile.requiredMessage);
      return;
    }

    setIsPending(true);

    try {
      await createSnnAuthClient().requestPasswordReset({
        email,
        redirectTo: resetRedirectURL,
        ...withTurnstileFetchOptions(turnstileToken),
      });

      setSuccess(successMessage);
    } catch {
      setError(messages.networkError);
    } finally {
      if (turnstile?.siteKey) {
        setTurnstileToken(null);
        setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      }

      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <TextField
        autoComplete="email"
        disabled={isPending}
        error={fieldErrors.email}
        fullWidth
        label={emailLabel}
        name="email"
        onChange={() => clearFieldError("email")}
        placeholder={emailPlaceholder}
        required
        size="md"
        type="email"
      />
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
      <TurnstileField
        challenge={turnstile}
        disabled={isPending}
        onTokenChange={setTurnstileToken}
        resetSignal={turnstileResetSignal}
      />
      <Button
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({
  callbackURL,
  confirmPasswordLabel,
  confirmPasswordPlaceholder,
  errorCode,
  messages,
  passwordLabel,
  passwordPlaceholder,
  signInHref,
  submitLabel,
  successMessage,
  token,
}: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>(
    getResetTokenError(errorCode, Boolean(token), messages),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ResetPasswordFieldName>>({});
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  function clearFieldError(field: ResetPasswordFieldName) {
    setFieldErrors((currentErrors) => removeFieldError(currentErrors, field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError(getResetTokenError(errorCode, false, messages));
      return;
    }

    setError(undefined);
    setSuccess(undefined);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const nextFieldErrors = validatePassword(newPassword, confirmPassword, messages);
    setFieldErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    setIsPending(true);

    try {
      const result = await createSnnAuthClient().resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        setError(messages.tokenInvalid);
        return;
      }

      setSuccess(successMessage);
      window.setTimeout(() => {
        window.location.assign(signInHref || callbackURL);
      }, 900);
    } catch {
      setError(messages.networkError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <TextField
        autoComplete="new-password"
        disabled={isPending || !token}
        error={fieldErrors.password}
        fullWidth
        label={passwordLabel}
        maxLength={passwordMaxLength}
        minLength={passwordMinLength}
        name="password"
        onChange={() => clearFieldError("password")}
        placeholder={passwordPlaceholder}
        required
        size="md"
        type="password"
      />
      <TextField
        autoComplete="new-password"
        disabled={isPending || !token}
        error={fieldErrors.confirmPassword}
        fullWidth
        label={confirmPasswordLabel}
        maxLength={passwordMaxLength}
        minLength={passwordMinLength}
        name="confirmPassword"
        onChange={() => clearFieldError("confirmPassword")}
        placeholder={confirmPasswordPlaceholder}
        required
        size="md"
        type="password"
      />
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
      <Button
        disabled={!token}
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
