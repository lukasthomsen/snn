"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Alert, Button, InputOtp } from "@snn/ui";

type TwoFactorFormProps = {
  callbackURL: string;
  codeLabel: string;
  codePlaceholder: string;
  submitLabel: string;
};

export function TwoFactorForm({
  callbackURL,
  codeLabel,
  codePlaceholder,
  submitLabel,
}: TwoFactorFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

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
          setError("The two-factor code could not be verified.");
          return;
        }
      }

      window.location.assign(callbackURL);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
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
        fullWidth
        label={codeLabel}
        onValueChange={setCode}
        size="md"
        value={code}
      />
      <input name="code" type="hidden" value={code} />
      <Button
        fullWidth
        loading={isPending}
        size="lg"
        type="submit"
      >
        {submitLabel}
      </Button>
      {error ? <Alert status="danger">{error}</Alert> : null}
    </form>
  );
}
