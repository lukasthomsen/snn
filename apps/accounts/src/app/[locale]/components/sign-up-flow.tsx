"use client";

import { useState } from "react";

import { AuthEmailStage } from "./auth-email-stage";
import {
  SignUpForm,
  type SignUpFormProps,
} from "./sign-up-form";
import {
  SocialAuthButtons,
  type SocialAuthButtonsProps,
} from "./social-auth-buttons";
import type { TurnstileChallenge } from "./turnstile-field";

type VerificationStageCopy = {
  backLabel: string;
  body: string;
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
};

type SignUpFlowProps = {
  dividerText: string;
  form: Omit<SignUpFormProps, "onVerificationSent">;
  social: SocialAuthButtonsProps;
  stage: VerificationStageCopy;
  verificationTurnstile?: TurnstileChallenge | undefined;
};

export function SignUpFlow({
  dividerText,
  form,
  social,
  stage,
  verificationTurnstile,
}: SignUpFlowProps) {
  const [verificationEmail, setVerificationEmail] = useState<string | undefined>();

  if (verificationEmail) {
    return (
      <AuthEmailStage
        backLabel={stage.backLabel}
        body={stage.body}
        callbackURL={form.callbackURL}
        codeError={stage.codeError}
        email={verificationEmail}
        onBack={() => setVerificationEmail(undefined)}
        resendError={stage.resendError}
        resendLabel={stage.resendLabel}
        resendPrompt={stage.resendPrompt}
        resendSuccess={stage.resendSuccess}
        resendingLabel={stage.resendingLabel}
        title={stage.title}
        turnstile={verificationTurnstile}
        verifyError={stage.verifyError}
        verifyLabel={stage.verifyLabel}
        verifyingLabel={stage.verifyingLabel}
      />
    );
  }

  return (
    <>
      <SocialAuthButtons {...social} size="md" />

      <div className="auth-divider__root__SW0fv">
        <span />
        <p>{dividerText}</p>
        <span />
      </div>

      <SignUpForm
        {...form}
        onVerificationSent={(email) => setVerificationEmail(email)}
      />
    </>
  );
}
