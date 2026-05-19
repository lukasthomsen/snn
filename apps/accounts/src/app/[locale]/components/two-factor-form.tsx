"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, InputOtp } from "@snn/ui";

type TwoFactorFormMessages = {
  codeInvalid: string;
  codeRequired: string;
  networkError: string;
};

type TwoFactorFormProps = {
  callbackURL: string;
  codeLabel: string;
  codePlaceholder: string;
  messages: TwoFactorFormMessages;
  submitLabel: string;
};

export function TwoFactorForm({
  callbackURL,
  codeLabel,
  codePlaceholder,
  messages,
  submitLabel,
}: TwoFactorFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setCodeError(undefined);

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    if (!code) {
      setCodeError(messages.codeRequired);
      return;
    }

    setIsPending(true);

    try {
      const authClient = createSnnAuthClient();
      const totpResult = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });

      if (totpResult.error) {
        const backupResult = await authClient.twoFactor.verifyBackupCode({
          code,
          trustDevice: true,
        });

        if (backupResult.error) {
          setCodeError(messages.codeInvalid);
          return;
        }
      }

      window.location.assign(callbackURL);
    } catch {
      setError(messages.networkError);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="auth__form__SW0fp" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <InputOtp
        autoComplete="one-time-code"
        description={codePlaceholder}
        disabled={isPending}
        error={codeError}
        fullWidth
        label={codeLabel}
        onValueChange={(nextCode) => {
          setCode(nextCode);
          setCodeError(undefined);
        }}
        size="md"
        value={code}
      />
      <input name="code" type="hidden" value={code} />
      {error ? (
        <p className="form__notice__SW0hq" data-tone="danger">
          {error}
        </p>
      ) : null}
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
