import type { Route } from "next";

import { isLocale } from "@snn/i18n";

import { BackToAccountLink } from "../account-components";
import { requireAccountSession } from "../account-auth";
import { StorefrontCard } from "../../components/storefront-card";

type ReturnsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ReturnsPage({ params }: ReturnsPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";

  await requireAccountSession(safeLocale, `/${safeLocale}/account/returns`);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Returns</h1>
        <p>Returns will connect to order eligibility once fulfillment logic is ready.</p>
      </header>
      <section className="accountInfoPanel__root__SW2l0">
        <h2>Quick, easy returns</h2>
        <p>
          This is the customer-facing shell for return requests. The next build
          can connect this to fulfilled order lines and return windows.
        </p>
      </section>
      <StorefrontCard
        description="Review the orders that can become return requests."
        href={`/${safeLocale}/account/orders` as Route}
        size="medium"
        title="View orders"
      />
    </div>
  );
}
