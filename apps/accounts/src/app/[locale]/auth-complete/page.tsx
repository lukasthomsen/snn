import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureCustomerProfile, getCustomerSession } from "@snn/customer";
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
  const session = await getCustomerSession(requestHeaders).catch(() => null);

  if (!session?.user || session.user.banned) {
    redirect(
      getAccountAuthPath(safeLocale, "sign-in", callbackURL, {
        error: "auth_incomplete",
      }) as Route,
    );
  }

  await ensureCustomerProfile(session.user);
  redirect(callbackURL as Route);
}
