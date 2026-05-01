import { getCanonicalAuthOrigin, getTurnstileSecretKey, getTurnstileSiteKey } from "@snn/config";

type SiteVerifyResponse = {
  success: boolean;
  action?: string;
  cdata?: string;
  challenge_ts?: string;
  hostname?: string;
  metadata?: {
    interactive?: boolean;
  };
  "error-codes"?: string[];
};

export type TurnstileValidationOptions = {
  expectedAction?: string;
  expectedHostname?: string;
  idempotencyKey?: string;
  remoteIp?: string;
  token: string;
};

export type TurnstileValidationResult =
  | {
      action?: string;
      challengeTs?: string;
      cdata?: string;
      hostname?: string;
      interactive: boolean;
      raw: SiteVerifyResponse;
      success: true;
    }
  | {
      action?: string;
      challengeTs?: string;
      errors: string[];
      hostname?: string;
      raw?: SiteVerifyResponse;
      success: false;
    };

export function getTurnstileConfig() {
  const siteKey = getTurnstileSiteKey();
  const secretKey = getTurnstileSecretKey();

  return {
    enabled: Boolean(siteKey && secretKey),
    siteKey,
    secretKey,
  };
}

function withTurnstileMetadata(result: SiteVerifyResponse) {
  return {
    ...(result.action ? { action: result.action } : {}),
    ...(result.challenge_ts ? { challengeTs: result.challenge_ts } : {}),
    ...(result.hostname ? { hostname: result.hostname } : {}),
  };
}

function getExpectedHostname(override?: string) {
  if (override) {
    return override;
  }

  return new URL(getCanonicalAuthOrigin()).hostname;
}

export async function validateTurnstileToken(
  options: TurnstileValidationOptions,
): Promise<TurnstileValidationResult> {
  const { secretKey } = getTurnstileConfig();

  if (!options.token) {
    return {
      errors: ["missing-turnstile-token"],
      success: false,
    };
  }

  if (!secretKey) {
    return {
      errors: ["turnstile-not-configured"],
      success: false,
    };
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: JSON.stringify({
        idempotency_key: options.idempotencyKey,
        remoteip: options.remoteIp,
        response: options.token,
        secret: secretKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(5_000),
    },
  );

  if (!response.ok) {
    return {
      errors: [`siteverify-http-${response.status}`],
      success: false,
    };
  }

  const result = (await response.json()) as SiteVerifyResponse;

  if (!result.success) {
    return {
      errors: result["error-codes"] ?? ["turnstile-verification-failed"],
      raw: result,
      success: false,
      ...withTurnstileMetadata(result),
    };
  }

  const expectedHostname = getExpectedHostname(options.expectedHostname);

  if (result.hostname !== expectedHostname) {
    return {
      errors: ["turnstile-hostname-mismatch"],
      raw: result,
      success: false,
      ...withTurnstileMetadata(result),
    };
  }

  if (options.expectedAction && result.action !== options.expectedAction) {
    return {
      errors: ["turnstile-action-mismatch"],
      raw: result,
      success: false,
      ...withTurnstileMetadata(result),
    };
  }

  return {
    ...(result.cdata ? { cdata: result.cdata } : {}),
    interactive: Boolean(result.metadata?.interactive),
    raw: result,
    success: true,
    ...withTurnstileMetadata(result),
  };
}
