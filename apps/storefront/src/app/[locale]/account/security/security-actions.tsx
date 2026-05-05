"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { Button, TextField } from "@snn/ui";

type SecurityActionsProps = {
  authOrigin: string;
  homeHref: string;
  passkeyCount: number;
  twoFactorEnabled: boolean;
};

type TwoFactorSetup = {
  backupCodes: string[];
  secret: string | undefined;
  totpURI: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getErrorMessage(value: unknown) {
  if (isRecord(value) && typeof value.message === "string") {
    return value.message;
  }

  if (isRecord(value) && isRecord(value.error) && typeof value.error.message === "string") {
    return value.error.message;
  }

  return "We could not complete that request.";
}

export function SecurityActions({
  authOrigin,
  homeHref,
  passkeyCount,
  twoFactorEnabled,
}: SecurityActionsProps) {
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [currentPasskeyCount, setCurrentPasskeyCount] = useState(passkeyCount);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | undefined>();

  function parseTotpSecret(totpURI: string) {
    try {
      return new URL(totpURI).searchParams.get("secret") ?? undefined;
    } catch {
      return undefined;
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 15 || newPassword.length > 128) {
      setError("New password must be between 15 and 128 characters.");
      setIsPending(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords must match.");
      setIsPending(false);
      return;
    }

    try {
      const result = await createSnnAuthClient(authOrigin).changePassword({
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setError("We could not update the password. Check your current password and try again.");
        return;
      }

      event.currentTarget.reset();
      setMessage("Password updated and other sessions revoked.");
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleAddPasskey() {
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    try {
      const result = await createSnnAuthClient(authOrigin).passkey.addPasskey({
        name: "Veloro passkey",
      });

      if (result.error) {
        setError(result.error.message ?? "Passkey enrollment failed.");
        return;
      }

      setCurrentPasskeyCount((count) => count + 1);
      setMessage("Passkey added.");
    } catch {
      setError("Passkey enrollment was cancelled or unavailable.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleEnableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    try {
      const result = await createSnnAuthClient(authOrigin).twoFactor.enable({
        issuer: "Veloro",
        ...(password ? { password } : {}),
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      if (
        !isRecord(result.data) ||
        typeof result.data.totpURI !== "string" ||
        !Array.isArray(result.data.backupCodes)
      ) {
        setError("Two-factor setup could not be started.");
        return;
      }

      setTwoFactorSetup({
        backupCodes: result.data.backupCodes.filter((code): code is string => typeof code === "string"),
        secret: parseTotpSecret(result.data.totpURI),
        totpURI: result.data.totpURI,
      });
      setMessage("Scan the authenticator setup or enter the key, then verify your first code.");
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerifyTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();

    try {
      const result = await createSnnAuthClient(authOrigin).twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      setTwoFactorSetup(undefined);
      setMessage("Two-factor authentication is enabled.");
      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDisableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    try {
      const result = await createSnnAuthClient(authOrigin).twoFactor.disable(
        password ? { password } : {},
      );

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      setMessage("Two-factor authentication is disabled.");
      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setError("We could not reach the authentication service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleSignOut() {
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    try {
      await createSnnAuthClient(authOrigin).signOut();
      window.location.assign(homeHref);
    } catch {
      setError("We could not sign you out. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className="account__stack__SW1a8">
      <section className="account__panel__SW1ad">
        <h3>Two-factor authentication</h3>
        {twoFactorEnabled ? (
          <>
            <p className="account__muted__SW1aa">
              Two-factor authentication is enabled for this account.
            </p>
            <form className="account__form__SW1ak" noValidate onSubmit={(event) => void handleDisableTwoFactor(event)}>
              <TextField
                autoComplete="current-password"
                disabled={isPending}
                fullWidth
                label="Current password"
                name="password"
                placeholder="Required for password accounts"
                size="md"
                type="password"
              />
              <Button disabled={isPending} size="lg" tone="secondary" type="submit">
                Disable 2FA
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="account__muted__SW1aa">
              Use an authenticator app before entering admin or making sensitive changes.
            </p>
            <form className="account__form__SW1ak" noValidate onSubmit={(event) => void handleEnableTwoFactor(event)}>
              <TextField
                autoComplete="current-password"
                disabled={isPending}
                fullWidth
                label="Current password"
                name="password"
                placeholder="Required for password accounts"
                size="md"
                type="password"
              />
              <Button disabled={isPending} size="lg" type="submit">
                Start 2FA setup
              </Button>
            </form>
          </>
        )}

        {twoFactorSetup ? (
          <div className="account__stack__SW1a8">
            <div className="account__setup-key__SW1an">
              <span>Authenticator setup key</span>
              <code>{twoFactorSetup.secret ?? twoFactorSetup.totpURI}</code>
            </div>
            <form className="account__form__SW1ak" noValidate onSubmit={(event) => void handleVerifyTwoFactor(event)}>
              <TextField
                autoComplete="one-time-code"
                disabled={isPending}
                fullWidth
                inputMode="numeric"
                label="Verification code"
                name="code"
                placeholder="123456"
                required
                size="md"
              />
              <Button disabled={isPending} size="lg" type="submit">
                Verify and enable 2FA
              </Button>
            </form>
            <div className="account__recovery-codes__SW1am">
              <span>Backup codes</span>
              {twoFactorSetup.backupCodes.map((code) => (
                <code key={code}>{code}</code>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="account__panel__SW1ad">
        <h3>Passkeys</h3>
        <p className="account__muted__SW1aa">
          You currently have {currentPasskeyCount} passkey{currentPasskeyCount === 1 ? "" : "s"}.
          Add a device passkey for a faster, phishing-resistant sign-in option.
        </p>
        <Button disabled={isPending} onClick={() => void handleAddPasskey()} size="lg" type="button">
          Add passkey
        </Button>
      </section>

      <section className="account__panel__SW1ad">
        <h3>Change password</h3>
        <form className="account__form__SW1ak" noValidate onSubmit={(event) => void handlePasswordChange(event)}>
          <TextField
            autoComplete="current-password"
            disabled={isPending}
            fullWidth
            label="Current password"
            name="currentPassword"
            required
            size="md"
            type="password"
          />
          <TextField
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
            label="New password"
            maxLength={128}
            minLength={15}
            name="newPassword"
            required
            size="md"
            type="password"
          />
          <TextField
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
            label="Confirm new password"
            maxLength={128}
            minLength={15}
            name="confirmPassword"
            required
            size="md"
            type="password"
          />
          <Button disabled={isPending} size="lg" type="submit">
            Update password
          </Button>
        </form>
      </section>

      <section className="account__panel__SW1ad">
        <h3>Sign out</h3>
        <Button disabled={isPending} onClick={() => void handleSignOut()} size="lg" tone="secondary" type="button">
          Log out
        </Button>
      </section>

      {message ? (
        <p className="account__notice__SW1al" data-tone="success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="account__notice__SW1al" data-tone="danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
