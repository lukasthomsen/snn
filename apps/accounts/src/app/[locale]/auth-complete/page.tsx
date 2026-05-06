import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CustomerAuthError, ensureCustomerProfile, getCustomerSession } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  resolvePostAuthCallbackURL,
} from "../auth-routing";

type AuthCompletePageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function AuthCompletePage({
  params,
  searchParams,
}: AuthCompletePageProps) {
  const [{ locale }, resolvedSearchParams, requestHeaders] = await Promise.all([
    params,
    searchParams,
    headers(),
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const signInPath = getAccountAuthPath(safeLocale, "sign-in", callbackURL, {
    error: "auth_incomplete",
  });
  const verificationPath = getAccountAuthPath(safeLocale, "sign-in", callbackURL, {
    error: "verification_required",
  });

  const session = await getCustomerSession(requestHeaders).catch(() => null);

  if (!session?.user) {
    redirect(signInPath as Route);
  }

  if (session.user.banned) {
    redirect(signInPath as Route);
  }

  if (!session.user.emailVerified) {
    redirect(verificationPath as Route);
  }

  try {
    await ensureCustomerProfile(session.user);
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      redirect(signInPath as Route);
    }

    throw error;
  }

  redirect(callbackURL as Route);
}
