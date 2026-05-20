"use server";

import { headers } from "next/headers";

import { getCustomerSession } from "@snn/customer";
import { tracePerformance } from "@snn/db";
import type { Locale } from "@snn/i18n";

type HeaderAuthStateInput = {
  locale: Locale;
};

type HeaderAuthStateResult = {
  isSignedIn: boolean;
};

export async function loadStorefrontHeaderStateAction(
  input: HeaderAuthStateInput,
): Promise<HeaderAuthStateResult> {
  return tracePerformance(
    "storefront.header.authState",
    {
      locale: input.locale,
    },
    async () => {
      const session = await getCustomerSession(await headers()).catch(() => null);

      return {
        isSignedIn: Boolean(
          session?.user && !session.user.banned && session.user.emailVerified,
        ),
      };
    },
  );
}
