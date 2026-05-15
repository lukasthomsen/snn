import type { ReactNode } from "react";

import { isLocale } from "@snn/i18n";

import { requireAccountSession } from "./account-auth";

type AccountLayoutProps = {
  children: ReactNode;
  params: Promise<unknown>;
};

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { locale } = (await params) as { locale?: string };
  const safeLocale = typeof locale === "string" && isLocale(locale) ? locale : "da";

  await requireAccountSession(safeLocale, `/${safeLocale}/account`);

  return (
    <main className="account__shell__SW1a0">
      {children}
    </main>
  );
}
