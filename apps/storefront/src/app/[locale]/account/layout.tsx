import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import { isLocale, type Locale } from "@snn/i18n";

import { accountSections, requireAccountSession } from "./account-auth";

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
      <section className="account__hero__SW1a1">
        <div className="account__hero-copy__SW1a2">
          <p className="account__eyebrow__SW1a3">Veloro account</p>
          <h1>Built around your daily stack.</h1>
          <p>
            Orders, liked items, addresses, and account security in one place.
          </p>
        </div>
      </section>

      <div className="account__layout__SW1a4">
        <aside className="account__nav__SW1a5" aria-label="Account navigation">
          {accountSections[safeLocale as Locale].map((item) => (
            <Link
              className="account__nav-link__SW1a6"
              href={`/${safeLocale}/${item.href}` as Route}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </aside>
        <section className="account__content__SW1a7">{children}</section>
      </div>
    </main>
  );
}
