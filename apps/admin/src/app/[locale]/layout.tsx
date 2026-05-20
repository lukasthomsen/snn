import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAppOrigin } from "@snn/config";
import { CustomerAuthError, getStaffAccess } from "@snn/customer";
import { isLocale, locales, type Locale } from "@snn/i18n";
import "@snn/ui/styles/base.css";
import "@snn/ui/styles/components.css";
import "./styles.css";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export const metadata: Metadata = {
  title: "SNN Admin System",
  description: "Commerce foundation and shared theme system for the SNN admin runtime.",
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getAdminSignInURL(locale: Locale) {
  const callbackURL = new URL(`/${locale}`, getAppOrigin("admin"));
  const signInURL = new URL(`/${locale}/sign-in`, getAppOrigin("auth"));

  signInURL.searchParams.set("callbackURL", callbackURL.toString());

  return signInURL.toString();
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let accessError: CustomerAuthError | undefined;

  try {
    await getStaffAccess(await headers());
  } catch (error) {
    if (error instanceof CustomerAuthError && error.code === "AUTH_REQUIRED") {
      redirect(getAdminSignInURL(locale as Locale) as Parameters<typeof redirect>[0]);
    }

    if (error instanceof CustomerAuthError) {
      accessError = error;
    } else {
      throw error;
    }
  }

  return (
    <html lang={locale as Locale}>
      <body data-theme="mono">
        {accessError ? (
          <main className="admin__guard__SW1b0">
            <section className="admin__guard-card__SW1b1">
              <p>Admin access</p>
              <h1>{accessError.code === "MFA_REQUIRED" ? "MFA required" : "Staff access required"}</h1>
              <span>
                {accessError.code === "MFA_REQUIRED"
                  ? "Enable two-factor authentication before opening the admin runtime."
                  : "Your account does not have an active staff assignment."}
              </span>
            </section>
          </main>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
