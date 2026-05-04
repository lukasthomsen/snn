import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Public_Sans } from "next/font/google";
import type { CSSProperties } from "react";

import { isLocale, locales, type Locale } from "@snn/i18n";
import { ThemeScope, nikeAppleBlendTheme, themeToCssVariables } from "@snn/ui";
import "@snn/ui/styles/base.css";

import { StorefrontFooter } from "./components/storefront-footer";
import { StorefrontHeader } from "./components/storefront-header";
import "./styles.css";

const bodyFont = Public_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const displayFont = Archivo({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-archivo",
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

  return (
    <html className={`${bodyFont.variable} ${displayFont.variable}`} lang={locale as Locale}>
      <body
        data-theme="mono"
        style={themeToCssVariables(nikeAppleBlendTheme) as CSSProperties}
      >
        <ThemeScope theme={nikeAppleBlendTheme}>
          <StorefrontHeader locale={locale as Locale} />
          {children}
          <StorefrontFooter locale={locale as Locale} />
        </ThemeScope>
      </body>
    </html>
  );
}
