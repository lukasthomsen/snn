"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { Locale } from "@snn/i18n";

type StorefrontChromeProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  locale: Locale;
};

export function StorefrontChrome({
  children,
  footer,
  header,
  locale,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const checkoutPath = `/${locale}/checkout`;
  const isCheckout = pathname === checkoutPath || pathname.startsWith(`${checkoutPath}/`);

  return (
    <>
      {isCheckout ? null : header}
      {children}
      {isCheckout ? null : footer}
    </>
  );
}
