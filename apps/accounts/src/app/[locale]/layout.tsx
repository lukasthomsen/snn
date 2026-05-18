import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { isLocale, locales, type Locale } from "@snn/i18n";
import { ThemeScope, monoTheme, themeToCssVariables } from "@snn/ui";
import "@snn/ui/styles/base.css";

import "./styles.css";

const shouldRenderVercelInsights = process.env.VERCEL === "1";

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
  title: "SNN Accounts",
  description: "Central sign-in and account creation for SNN.",
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
    <html className={interFont.variable} lang={locale as Locale}>
      <body
        data-theme="mono"
        style={themeToCssVariables(monoTheme) as CSSProperties}
      >
        <ThemeScope theme={monoTheme}>{children}</ThemeScope>
        {shouldRenderVercelInsights ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
