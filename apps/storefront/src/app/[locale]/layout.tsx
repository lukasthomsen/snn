import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getAppOrigin } from "@snn/config";
import { isLocale, locales, type Locale } from "@snn/i18n";
import "@snn/ui/styles/base.css";

import { StorefrontFooter } from "./components/storefront-footer";
import { StorefrontHeaderShell } from "./components/storefront-header-shell";
import "./styles.css";

const shouldRenderVercelInsights = process.env.VERCEL === "1";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export const metadata: Metadata = {
  title: "SNN Storefront",
  description: "Editorial storefront foundation for the SNN runtime.",
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

  const safeLocale = locale as Locale;

  return (
    <html lang={safeLocale}>
      <body data-theme="mono">
        <StorefrontHeaderShell
          authOrigin={getAppOrigin("auth")}
          locale={safeLocale}
          storefrontOrigin={getAppOrigin("storefront")}
        />
        {children}
        <StorefrontFooter locale={safeLocale} />
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
