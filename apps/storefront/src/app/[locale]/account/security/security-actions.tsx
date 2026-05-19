"use client";

import { useState, type FormEvent } from "react";

import { createSnnAuthClient } from "@snn/auth/client";
import { authPasswordPolicy } from "@snn/auth/policy";
import type { Locale } from "@snn/i18n";
import { Alert, Button, Heading, InputOtp, PasswordField, TextField } from "@snn/ui";

import {
  changeCustomerEmailAction,
  changeCustomerPasswordAction,
  deleteCustomerAccountAction,
  disableCustomerTwoFactorAction,
  enableCustomerTwoFactorAction,
  sendAccountVerificationCodeAction,
  setCustomerPasswordAction,
  signOutCustomerAction,
  verifyCustomerTwoFactorAction,
} from "../actions";

const passwordMinLength = authPasswordPolicy.minLength;
const passwordMaxLength = authPasswordPolicy.maxLength;

type SecurityActionsProps = {
  authOrigin: string;
  callbackURL: string;
  deleteCallbackURL: string;
  email: string;
  emailManagedByProvider: boolean;
  emailManagedByProviderIds: string[];
  emailVerified: boolean;
  hasPassword: boolean;
  linkedProviders: string[];
  locale: Locale;
  passkeyCount: number;
  twoFactorEnabled: boolean;
};

type TwoFactorSetup = {
  backupCodes: string[];
  secret: string | undefined;
  totpURI: string;
};

function formatProvider(providerId: string) {
  if (providerId === "credential" || providerId === "email-password") {
    return "Email and password";
  }

  if (providerId === "google") {
    return "Google";
  }

  if (providerId === "apple") {
    return "Apple";
  }

  return providerId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

export function SecurityActions({
  authOrigin,
  callbackURL,
  deleteCallbackURL,
  email,
  emailManagedByProvider,
  emailManagedByProviderIds,
  emailVerified,
  hasPassword,
  linkedProviders,
  locale,
  passkeyCount,
  twoFactorEnabled,
}: SecurityActionsProps) {
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [deleteConfirmationError, setDeleteConfirmationError] = useState<string | undefined>();
  const [deletePasswordError, setDeletePasswordError] = useState<string | undefined>();
  const [deleteFormError, setDeleteFormError] = useState<string | undefined>();
  const [setPasswordNewError, setSetPasswordNewError] = useState<string | undefined>();
  const [setPasswordConfirmError, setSetPasswordConfirmError] = useState<string | undefined>();
  const [setPasswordFormError, setSetPasswordFormError] = useState<string | undefined>();
  const [verificationCode, setVerificationCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(hasPassword);
  const [currentPasskeyCount, setCurrentPasskeyCount] = useState(passkeyCount);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | undefined>();
  const linkedProviderNames = emailManagedByProviderIds
    .map(formatProvider)
    .join(" or ");
  const visibleLinkedProviders = passwordEnabled &&
    !linkedProviders.some((providerId) =>
      providerId === "credential" || providerId === "email-password",
    )
    ? [...linkedProviders, "credential"]
    : linkedProviders;

  async function handleSendVerificationEmail() {
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);

    try {
      const result = await sendAccountVerificationCodeAction(locale, email);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage("Verification code sent. Enter the 8-digit code to finish.");
    } catch {
      setError("We could not send the verification code. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (verificationCode.length !== 8) {
      setError("Enter the 8-digit verification code.");
      return;
    }

    setIsPending(true);

    try {
      const result = await createSnnAuthClient(authOrigin).emailOtp.verifyEmail({
        email,
        otp: verificationCode,
      });

      if (result.error) {
        setError("The verification code is wrong or expired.");
        return;
      }

      setMessage("Email verified.");
      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setError("We could not verify the code. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (emailManagedByProvider) {
      setError(`Email is managed by ${linkedProviderNames || "your social provider"} sign-in for this account.`);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const newEmail = normalizeEmail(formData.get("newEmail"));

    if (!newEmail) {
      setError("Enter the new email address.");
      return;
    }

    if (newEmail === email.toLowerCase()) {
      setError("Enter an email address different from your current one.");
      return;
    }

    setIsPending(true);

    try {
      const result = await changeCustomerEmailAction(
        locale,
        callbackURL,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      event.currentTarget.reset();
      setMessage(
        emailVerified
          ? "Check your current email to approve the change. We will verify the new address after that."
          : "Check the new email address to verify the change.",
      );
    } catch {
      setError("We could not start the email change. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (!passwordEnabled) {
      setError("This account does not have an SNN password yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < passwordMinLength || newPassword.length > passwordMaxLength) {
      setError("New password must be between 10 and 128 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords must match.");
      return;
    }

    setIsPending(true);

    try {
      const result = await changeCustomerPasswordAction(locale, formData);

      if (!result.ok) {
        setError(result.message);
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

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setSetPasswordNewError(undefined);
    setSetPasswordConfirmError(undefined);
    setSetPasswordFormError(undefined);
    setIsPending(true);

    try {
      const result = await setCustomerPasswordAction(
        locale,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        if (result.field === "newPassword") {
          setSetPasswordNewError(result.message);
          return;
        }

        if (result.field === "confirmPassword") {
          setSetPasswordConfirmError(result.message);
          return;
        }

        setSetPasswordFormError(result.message);
        return;
      }

      event.currentTarget.reset();
      setPasswordEnabled(true);
      setMessage("Password set. You can now sign in with email and password too.");
    } catch {
      setSetPasswordFormError("We could not set the password. Please try again.");
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
        name: "SNN passkey",
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

    try {
      const result = await enableCustomerTwoFactorAction(
        locale,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setTwoFactorSetup(result.data);
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

    try {
      const result = await verifyCustomerTwoFactorAction(
        locale,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
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

    try {
      const result = await disableCustomerTwoFactorAction(
        locale,
        new FormData(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
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
      const result = await signOutCustomerAction(locale);

      if (result && !result.ok) {
        setError(result.message);
        setIsPending(false);
      }
    } catch {
      setError("We could not sign you out. Please try again.");
      setIsPending(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setDeleteConfirmationError(undefined);
    setDeletePasswordError(undefined);
    setDeleteFormError(undefined);

    const formData = new FormData(event.currentTarget);
    const confirmation = String(formData.get("deleteConfirmation") ?? "").trim();
    const password = String(formData.get("deletePassword") ?? "");

    if (confirmation !== "DELETE") {
      setDeleteConfirmationError("Type DELETE to confirm.");
      return;
    }

    if (passwordEnabled && !password) {
      setDeletePasswordError("Enter your current password.");
      return;
    }

    setIsPending(true);
    setIsDeleting(true);

    try {
      const result = await deleteCustomerAccountAction(
        locale,
        deleteCallbackURL,
        formData,
      );

      if (!result.ok) {
        if (result.field === "deletePassword") {
          setDeletePasswordError(result.message);
          return;
        }

        if (result.field === "deleteConfirmation") {
          setDeleteConfirmationError(result.message);
          return;
        }

        setDeleteFormError(result.message);
        return;
      }
    } catch {
      setDeleteFormError("We could not delete the account. Please try again.");
    } finally {
      setIsPending(false);
      setIsDeleting(false);
    }
  }

  return (
    <div className="account__stack__SW1a8">
      <section className="account__panel__SW1ad">
        <div className="accountSecurityEmail__header__SW8a0">
          <div>
            <Heading as="h2">Account email</Heading>
            <p className="account__muted__SW1aa">{email}</p>
          </div>
          <span className="accountSecurityEmail__status__SW8a1" data-verified={emailVerified ? "true" : "false"}>
            {emailVerified ? "Verified" : "Not verified"}
          </span>
        </div>

        <div className="accountProviderList__SW8a2" aria-label="Linked sign-in methods">
          {visibleLinkedProviders.length > 0 ? (
            visibleLinkedProviders.map((providerId) => (
              <span key={providerId}>{formatProvider(providerId)}</span>
            ))
          ) : (
            <span>Email and password</span>
          )}
        </div>

        {!emailVerified ? (
          <form
            aria-busy={isPending}
            className="account__form__SW1ak"
            noValidate
            onSubmit={(event) => void handleVerifyEmail(event)}
          >
            <InputOtp
              disabled={isPending}
              fullWidth
              label="Verification code"
              length={8}
              name="verificationCode"
              onValueChange={(value) => {
                setVerificationCode(value);
                setError(undefined);
              }}
              separatorEvery={4}
              value={verificationCode}
            />
            <Button disabled={isPending} loading={isPending} size="lg" type="submit">
              Verify email
            </Button>
            <Button
              disabled={isPending}
              loading={isPending}
              onClick={() => void handleSendVerificationEmail()}
              size="lg"
              tone="secondary"
              type="button"
            >
              Send verification code
            </Button>
          </form>
        ) : null}

        {emailManagedByProvider ? (
          <p className="account__muted__SW1aa">
            Email changes are managed through {linkedProviderNames || "your social provider"} because this account is linked to that sign-in method.
          </p>
        ) : (
          <form
            aria-busy={isPending}
            className="account__form__SW1ak"
            noValidate
            onSubmit={(event) => void handleEmailChange(event)}
          >
            <TextField
              autoComplete="email"
              disabled={isPending}
              fullWidth
              label="New email"
              name="newEmail"
              placeholder="you@example.com"
              required
              size="md"
              type="email"
            />
            <Button disabled={isPending} loading={isPending} size="lg" type="submit">
              Change email
            </Button>
          </form>
        )}
      </section>

      <section className="account__panel__SW1ad">
        <Heading as="h2">Two-factor authentication</Heading>
        {twoFactorEnabled ? (
          <>
            <p className="account__muted__SW1aa">
              Two-factor authentication is enabled for this account.
            </p>
            <form
              aria-busy={isPending}
              className="account__form__SW1ak"
              noValidate
              onSubmit={(event) => void handleDisableTwoFactor(event)}
            >
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
            <form
              aria-busy={isPending}
              className="account__form__SW1ak"
              noValidate
              onSubmit={(event) => void handleEnableTwoFactor(event)}
            >
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
            <form
              aria-busy={isPending}
              className="account__form__SW1ak"
              noValidate
              onSubmit={(event) => void handleVerifyTwoFactor(event)}
            >
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
        <Heading as="h2">Passkeys</Heading>
        <p className="account__muted__SW1aa">
          You currently have {currentPasskeyCount} passkey{currentPasskeyCount === 1 ? "" : "s"}.
          Add a device passkey for a faster, phishing-resistant sign-in option.
        </p>
        <Button disabled={isPending} onClick={() => void handleAddPasskey()} size="lg" type="button">
          Add passkey
        </Button>
      </section>

      <section className="account__panel__SW1ad">
        <Heading as="h2">Password</Heading>
        {passwordEnabled ? (
          <form
            aria-busy={isPending}
            className="account__form__SW1ak"
            noValidate
            onSubmit={(event) => void handlePasswordChange(event)}
          >
            <PasswordField
              autoComplete="current-password"
              disabled={isPending}
              fullWidth
              label="Current password"
              name="currentPassword"
              required
              size="md"
            />
            <PasswordField
              autoComplete="new-password"
              disabled={isPending}
              fullWidth
              label="New password"
              maxLength={passwordMaxLength}
              minLength={passwordMinLength}
              name="newPassword"
              required
              size="md"
            />
            <PasswordField
              autoComplete="new-password"
              disabled={isPending}
              fullWidth
              label="Confirm new password"
              maxLength={passwordMaxLength}
              minLength={passwordMinLength}
              name="confirmPassword"
              required
              size="md"
            />
            <Button disabled={isPending} size="lg" type="submit">
              Update password
            </Button>
          </form>
        ) : (
          <form
            aria-busy={isPending}
            className="account__form__SW1ak"
            noValidate
            onSubmit={(event) => void handleSetPassword(event)}
          >
            <p className="account__muted__SW1aa">
              Add an SNN password if you also want to sign in with email and password.
            </p>
            <PasswordField
              autoComplete="new-password"
              disabled={isPending}
              error={setPasswordNewError}
              fullWidth
              label="New password"
              maxLength={passwordMaxLength}
              minLength={passwordMinLength}
              name="newPassword"
              onChange={() => {
                setSetPasswordNewError(undefined);
                setSetPasswordFormError(undefined);
              }}
              required
              size="md"
            />
            <PasswordField
              autoComplete="new-password"
              disabled={isPending}
              error={setPasswordConfirmError}
              fullWidth
              label="Confirm new password"
              maxLength={passwordMaxLength}
              minLength={passwordMinLength}
              name="confirmPassword"
              onChange={() => {
                setSetPasswordConfirmError(undefined);
                setSetPasswordFormError(undefined);
              }}
              required
              size="md"
            />
            {setPasswordFormError ? (
              <p className="account__form-error__SW1ao" role="alert">{setPasswordFormError}</p>
            ) : null}
            <Button disabled={isPending} loading={isPending} size="lg" type="submit">
              Set SNN password
            </Button>
          </form>
        )}
      </section>

      <section className="account__panel__SW1ad">
        <Heading as="h2">Sign out</Heading>
        <Button disabled={isPending} onClick={() => void handleSignOut()} size="lg" tone="secondary" type="button">
          Log out
        </Button>
      </section>

      <section className="account__panel__SW1ad">
        <Heading as="h2">Delete account</Heading>
        <p className="account__muted__SW1aa">
          Permanently delete your sign-in, saved products, addresses, passkeys, 2FA setup, and active sessions.
          Orders can still be kept where legally required.
        </p>
        {!passwordEnabled ? (
          <p className="account__muted__SW1aa">
            This account signs in with a connected provider. You may need to sign in again first if this session is no longer recent.
          </p>
        ) : null}
        <form
          aria-busy={isDeleting}
          className="account__form__SW1ak"
          noValidate
          onSubmit={(event) => void handleDeleteAccount(event)}
        >
          <TextField
            autoComplete="off"
            disabled={isPending}
            error={deleteConfirmationError}
            fullWidth
            label="Type DELETE to confirm"
            name="deleteConfirmation"
            onChange={() => {
              setDeleteConfirmationError(undefined);
              setDeleteFormError(undefined);
            }}
            required
            size="md"
          />
          {passwordEnabled ? (
            <PasswordField
              autoComplete="current-password"
              disabled={isPending}
              error={deletePasswordError}
              fullWidth
              label="Current password"
              name="deletePassword"
              onChange={() => {
                setDeletePasswordError(undefined);
                setDeleteFormError(undefined);
              }}
              required
              size="md"
            />
          ) : null}
          {deleteFormError ? (
            <p className="account__form-error__SW1ao" role="alert">{deleteFormError}</p>
          ) : null}
          <Button disabled={isPending} loading={isDeleting} size="lg" tone="danger" type="submit">
            Delete account
          </Button>
        </form>
      </section>

      {message ? (
        <Alert status="success">{message}</Alert>
      ) : null}
      {error ? (
        <Alert status="danger">{error}</Alert>
      ) : null}
    </div>
  );
}
