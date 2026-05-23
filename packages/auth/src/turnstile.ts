import {
  getAuthTurnstileMode,
  getCanonicalAuthOrigin,
  getTurnstileSecretKey,
  getTurnstileSiteKey,
} from "@snn/config";

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
  idempotencyKey?: string | undefined;
  remoteIp?: string | undefined;
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
  const mode = getAuthTurnstileMode();

  return {
    enabled: Boolean(siteKey && secretKey),
    mode,
    publicEnabled: Boolean(siteKey && mode !== "off"),
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

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  );
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

  const requestBody: Record<string, string> = {
    response: options.token,
    secret: secretKey,
  };

  if (options.remoteIp) {
    requestBody.remoteip = options.remoteIp;
  }

  const idempotencyKey = options.idempotencyKey;

  if (isUuid(idempotencyKey)) {
    requestBody.idempotency_key = idempotencyKey;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: JSON.stringify(requestBody),
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
