import { redirect } from "next/navigation";

import { isLocale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";

type SignInPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const accountsHref = getAccountsHref(
    safeLocale,
    "sign-in",
  ) as Parameters<typeof redirect>[0];

  redirect(accountsHref);
}
