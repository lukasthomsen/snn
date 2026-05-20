import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { isLocale, locales, type Locale } from "@snn/i18n";
import "@snn/ui/styles/base.css";
import "@snn/ui/styles/components.css";

import "./styles.css";

const shouldRenderVercelInsights = process.env.VERCEL === "1";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export const metadata: Metadata = {
  title: "SNN Accounts",
  description: "Central sign-in and account creation for SNN.",
  icons: {
    icon: [
      {
        type: "image/svg+xml",
        url: "/icon.svg",
      },
    ],
  },
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
    <html lang={locale as Locale}>
      <body data-theme="mono">
        {children}
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
