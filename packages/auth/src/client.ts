import { dashClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";

export function createSnnAuthClient(baseURL?: string) {
  return createAuthClient({
    baseURL,
    plugins: [dashClient()],
  });
}
