import { createAuthClient } from "better-auth/react";

export function createVeloroAuthClient(baseURL?: string) {
  return createAuthClient({
    baseURL,
  });
}

