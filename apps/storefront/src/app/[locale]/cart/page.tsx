import { isLocale, type Locale } from "@snn/i18n";

import { loadExistingCartSnapshot } from "../cart-data";
import { CartPageClient } from "./cart-page-client";

export const dynamic = "force-dynamic";

type CartPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const cart = await loadExistingCartSnapshot(safeLocale);

  return <CartPageClient initialCart={cart} locale={safeLocale} />;
}
