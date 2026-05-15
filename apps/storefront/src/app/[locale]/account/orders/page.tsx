import { Button } from "@snn/ui";
import { getCustomerOrderCards } from "@snn/customer";
import { isLocale } from "@snn/i18n";

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
  const orders = await getCustomerOrderCards(user);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Orders</h1>
      </header>

      {orders.length > 0 ? (
        <>
          <div className="accountOrdersList__root__SW2j2">
            {orders.map((order) => (
              <OrderCard key={order.id} locale={safeLocale} order={order} />
            ))}
          </div>
          <div className="accountOrdersList__more__SW2j3">
            <Button disabled size="lg" type="button">
              Load more
            </Button>
          </div>
        </>
      ) : (
        <EmptyOrdersPanel locale={safeLocale} />
      )}
    </div>
  );
}
