import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isLocale } from "@snn/i18n";
import { getCustomerSession } from "@snn/customer";

import { getAccountsHref } from "../auth-links";

type SignInPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const session = await getCustomerSession(await headers());

  if (session?.user && !session.user.banned) {
    redirect(`/${safeLocale}/account` as Parameters<typeof redirect>[0]);
  }

  const accountsHref = getAccountsHref(
    safeLocale,
    "sign-in",
  ) as Parameters<typeof redirect>[0];

  redirect(accountsHref);
}
