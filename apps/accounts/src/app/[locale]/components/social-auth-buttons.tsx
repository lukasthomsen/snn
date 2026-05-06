"use client";

import { useState } from "react";

import { AppleLogoIcon, Button, GoogleLogoIcon } from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";

type SocialAuthButtonsProps = {
  appleLabel: string;
  disabledMessage: string;
  googleLabel: string;
};

export function SocialAuthButtons({
  appleLabel,
  disabledMessage,
  googleLabel,
}: SocialAuthButtonsProps) {
  const [message, setMessage] = useState<string | undefined>();

  return (
    <div className="provider__buttons__SW0fs">
      <Button
        className="provider__button__SW0ft"
        fullWidth
        onClick={() => setMessage(disabledMessage)}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <GoogleLogoIcon size={18} />
        </span>
        <span>{googleLabel}</span>
      </Button>
      <Button
        className="provider__button__SW0ft"
        fullWidth
        onClick={() => setMessage(disabledMessage)}
        shape="field"
        size="md"
        tone="secondary"
        type="button"
      >
        <span className="provider__mark__SW0fu">
          <AppleLogoIcon size={19} />
        </span>
        <span>{appleLabel}</span>
      </Button>
      <AuthStatusMessage message={message} tone="danger" />
    </div>
  );
}
