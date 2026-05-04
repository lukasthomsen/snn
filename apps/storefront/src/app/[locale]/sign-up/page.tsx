import { redirect } from "next/navigation";

import { isLocale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";

type SignUpPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const accountsHref = getAccountsHref(
    safeLocale,
    "sign-up",
  ) as Parameters<typeof redirect>[0];

  redirect(accountsHref);
}
