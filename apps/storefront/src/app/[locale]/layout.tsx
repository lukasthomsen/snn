import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { Suspense, type CSSProperties } from "react";

import { getAppOrigin } from "@snn/config";
import { isLocale, locales, type Locale } from "@snn/i18n";
import { ThemeScope, monoTheme, themeToCssVariables } from "@snn/ui";
import "@snn/ui/styles/base.css";

import { createEmptyCartSnapshot, loadExistingCartSnapshot } from "./cart-data";
import { CartDrawerProvider } from "./components/cart-drawer";
import { NewsletterSignupProvider } from "./components/newsletter-signup";
import { StorefrontChrome } from "./components/storefront-chrome";
import { StorefrontFooter } from "./components/storefront-footer";
import { StorefrontHeaderShell } from "./components/storefront-header-shell";
import "./styles.css";

const interFont = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export const metadata: Metadata = {
  title: "SNN Storefront",
  description: "Editorial storefront foundation for the SNN runtime.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const safeLocale = locale as Locale;
  const initialCart = await loadExistingCartSnapshot(safeLocale).catch(() => (
    createEmptyCartSnapshot()
  ));

  return (
    <html className={interFont.variable} lang={safeLocale}>
      <body
        data-theme="mono"
        style={themeToCssVariables(monoTheme) as CSSProperties}
      >
        <ThemeScope theme={monoTheme}>
          <NewsletterSignupProvider locale={safeLocale}>
            <CartDrawerProvider initialCart={initialCart} locale={safeLocale}>
              <StorefrontChrome
                footer={<StorefrontFooter locale={safeLocale} />}
                header={(
                  <Suspense fallback={null}>
                    <StorefrontHeaderShell
                      authOrigin={getAppOrigin("auth")}
                      locale={safeLocale}
                      storefrontOrigin={getAppOrigin("storefront")}
                    />
                  </Suspense>
                )}
                locale={safeLocale}
              >
                {children}
              </StorefrontChrome>
            </CartDrawerProvider>
          </NewsletterSignupProvider>
        </ThemeScope>
      </body>
    </html>
  );
}
