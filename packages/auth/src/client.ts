import { dashClient } from "@better-auth/infra/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/plugins";

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
      twoFactorClient(twoFactorOptions),
      passkeyClient(),
    ],
  });
}
