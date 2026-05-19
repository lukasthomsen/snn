import type { AuthTurnstileAction } from "@snn/auth/policy";
import { getTurnstileConfig } from "@snn/auth/turnstile";

type TurnstileCopy = {
  requiredMessage: string;
  unavailableMessage: string;
};

export function getAuthTurnstileChallenge(
  action: AuthTurnstileAction,
  copy: TurnstileCopy,
) {
  const config = getTurnstileConfig();

  if (!config.publicEnabled || !config.siteKey) {
    return undefined;
  }

  return {
    action,
    requiredMessage: copy.requiredMessage,
    siteKey: config.siteKey,
    unavailableMessage: copy.unavailableMessage,
  };
}
