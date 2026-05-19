import { redirect } from "next/navigation";

import { getStripePublishableKey } from "@snn/config";
import { isLocale, type Locale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";
import { loadCheckoutPrefill, loadExistingCartSnapshot } from "../cart-data";
import { StorefrontBrandLogo } from "../components/storefront-brand";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const [cart, prefill] = await Promise.all([
    loadExistingCartSnapshot(safeLocale),
    loadCheckoutPrefill(),
  ]);

  if (cart.lines.length === 0) {
    redirect(`/${safeLocale}/cart`);
  }

  return (
    <>
      <header className="checkoutHeader__root__SW6d2">
        <a href={`/${safeLocale}`}>
          <StorefrontBrandLogo className="checkoutHeader__logo__SW6d3" />
        </a>
      </header>
      <CheckoutForm
        cart={cart}
        locale={safeLocale}
        prefill={prefill}
        publishableKey={getStripePublishableKey() ?? null}
        signInHref={getAccountsHref(safeLocale, "sign-in", `/${safeLocale}/checkout`)}
      />
    </>
  );
}
