import { dashClient } from "@better-auth/infra/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/plugins";

import { authTurnstileHeaderName } from "./policy";

type SnnAuthClientOptions = {
  twoFactorPage?: string | undefined;
};

export function createSnnAuthClient(
  baseURL?: string,
  options?: SnnAuthClientOptions,
) {
  const twoFactorOptions = options?.twoFactorPage
    ? { twoFactorPage: options.twoFactorPage }
    : undefined;

  return createAuthClient({
    baseURL,
    plugins: [
      dashClient(),
      emailOTPClient(),
      twoFactorClient(twoFactorOptions),
      passkeyClient(),
    ],
  });
}

export function withTurnstileFetchOptions(token: string | null | undefined) {
  return token
    ? {
        fetchOptions: {
          headers: {
            [authTurnstileHeaderName]: token,
          },
        },
      }
    : {};
}
