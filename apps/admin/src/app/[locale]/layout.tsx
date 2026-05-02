import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Manrope, Oswald } from "next/font/google";
import type { CSSProperties } from "react";

import { isLocale, locales, type Locale } from "@snn/i18n";
import { ThemeScope, nikeAppleBlendTheme, themeToCssVariables } from "@snn/ui";
import "@snn/ui/styles/base.css";

const bodyFont = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
});

const displayFont = Oswald({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-oswald",
});

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
      <body style={themeToCssVariables(nikeAppleBlendTheme) as CSSProperties}>
        <ThemeScope theme={nikeAppleBlendTheme}>{children}</ThemeScope>
      </body>
    </html>
  );
}
