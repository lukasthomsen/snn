import { createAuthClient } from "better-auth/react";

export function createSnnAuthClient(baseURL?: string) {
  return createAuthClient({
    baseURL,
  });
}

export const createVeloroAuthClient = createSnnAuthClient;
