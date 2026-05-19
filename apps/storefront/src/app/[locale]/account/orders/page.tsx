import { getCustomerOrderCards } from "@snn/customer";
import { tracePerformance } from "@snn/db";
import { isLocale } from "@snn/i18n";
import { Heading } from "@snn/ui";

import {
  BackToAccountLink,
  EmptyOrdersPanel,
  OrderCard,
} from "../account-components";
import { requireAccountSession } from "../account-auth";

type OrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/orders`);
  const orders = await tracePerformance(
    "storefront.account.orders",
    { locale: safeLocale },
    () => getCustomerOrderCards(user),
  );

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <Heading as="h1">Orders</Heading>
      </header>

      {orders.length > 0 ? (
        <>
          <div className="accountOrdersList__root__SW2j2">
            {orders.map((order) => (
              <OrderCard key={order.id} locale={safeLocale} order={order} />
            ))}
          </div>
          <div className="accountOrdersList__more__SW2j3">
            <button className="accountServerButton__SW4d0" data-size="lg" disabled type="button">
              Load more
            </button>
          </div>
        </>
      ) : (
        <EmptyOrdersPanel locale={safeLocale} />
      )}
    </div>
  );
}
