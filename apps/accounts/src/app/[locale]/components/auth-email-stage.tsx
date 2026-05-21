"use client";

import { useId, useRef, useState, type FormEvent } from "react";

import { createSnnAuthClient, withTurnstileFetchOptions } from "@snn/auth/client";
import { Button, Heading, InputOtp, LinkAction } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";
import {
  TurnstileField,
  type TurnstileChallenge,
  type TurnstileFieldHandle,
} from "./turnstile-field";

type AuthEmailStageProps = {
  backLabel: string;
  body: string;
  callbackURL: string;
  email: string;
  onBack: () => void;
  codeError: string;
  resendError: string;
  resendLabel: string;
  resendPrompt: string;
  resendSuccess: string;
  resendingLabel: string;
  title: string;
  verifyError: string;
  verifyLabel: string;
  verifyingLabel: string;
  turnstile?: TurnstileChallenge | undefined;
};

export function AuthEmailStage({
  backLabel,
  body,
  callbackURL,
  email,
  onBack,
  codeError,
  resendError,
  resendLabel,
  resendPrompt,
  resendSuccess,
  resendingLabel,
  title,
  verifyError,
  verifyLabel,
  verifyingLabel,
  turnstile,
}: AuthEmailStageProps) {
  const headingId = useId();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | undefined>();
  const [tone, setTone] = useState<"danger" | "success">("success");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const maskedEmail = maskEmail(email);

  async function handleResend() {
    setMessage(undefined);

    setIsResending(true);

    try {
      const verifiedTurnstileToken = turnstile?.siteKey
        ? await turnstileRef.current?.execute()
        : null;

      if (turnstile?.siteKey && !verifiedTurnstileToken) {
        setTone("danger");
        setMessage(turnstile.unavailableMessage);
        return;
      }

      const result = await createSnnAuthClient().emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
        ...withTurnstileFetchOptions(verifiedTurnstileToken ?? turnstileToken),
      });

      if (result.error) {
        setTone("danger");
        setMessage(result.error.message ?? resendError);
        return;
      }

      setTone("success");
      setMessage(resendSuccess);
    } catch {
      setTone("danger");
      setMessage(resendError);
    } finally {
      if (turnstile?.siteKey) {
        setTurnstileToken(null);
        setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      }

      setIsResending(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    const normalizedCode = normalizeOtpCode(code);

    if (normalizedCode.length !== 8) {
      setTone("danger");
      setMessage(codeError);
      return;
    }

    setIsVerifying(true);

    try {
      const result = await createSnnAuthClient().emailOtp.verifyEmail({
        email,
        otp: normalizedCode,
      });

      if (result.error) {
        setTone("danger");
        setMessage(verifyError);
        return;
      }

      window.location.assign(callbackURL);
    } catch {
      setTone("danger");
      setMessage(verifyError);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="auth-email-stage__root__SW0iu"
      aria-live="polite"
    >
      <form
        aria-busy={isVerifying || isResending}
        className="auth-email-stage__panel__SW0l2"
        onSubmit={(event) => void handleVerify(event)}
      >
        <div className="auth-email-stage__copy__SW0iw">
          <Heading as="h2" id={headingId}>{title}</Heading>
          <p>{body} <span>{maskedEmail}</span></p>
        </div>
        <InputOtp
          disabled={isVerifying || isResending}
          error={tone === "danger" ? message : undefined}
          fullWidth
          label="Verification code"
          length={8}
          name="verificationCode"
          onValueChange={(value) => {
            setCode(normalizeOtpCode(value));
            if (message) {
              setMessage(undefined);
            }
          }}
          separatorEvery={4}
          value={code}
        />
        {tone === "success" ? (
          <AuthStatusMessage message={message} tone={tone} />
        ) : null}
        <Button
          disabled={isVerifying || isResending}
          fullWidth
          loading={isVerifying}
          size="md"
          type="submit"
        >
          {isVerifying ? verifyingLabel : verifyLabel}
        </Button>
        <TurnstileField
          challenge={turnstile}
          disabled={isVerifying || isResending}
          onTokenChange={setTurnstileToken}
          ref={turnstileRef}
          resetSignal={turnstileResetSignal}
        />
        <p className="auth-email-stage__resend__SW0l4">
          {resendPrompt}{" "}
          <LinkAction
            disabled={isResending || isVerifying}
            onClick={() => void handleResend()}
            variant="underline"
          >
            {isResending ? resendingLabel : resendLabel}
          </LinkAction>
        </p>
        <div className="auth-email-stage__links__SW0l3">
          <LinkAction
            disabled={isResending || isVerifying}
            onClick={onBack}
            variant="underline"
          >
            {backLabel}
          </LinkAction>
        </div>
      </form>
    </section>
  );
}

function maskEmail(value: string) {
  const [localPart = "", domain = ""] = value.trim().split("@");
  const visible = localPart.slice(0, 1) || "*";
  const masked = `${visible}****`;

  return domain ? `${masked}@${domain}` : masked;
}

function normalizeOtpCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}
