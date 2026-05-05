import { isLocale } from "@snn/i18n";
import { getCustomerOrders } from "@snn/customer";

import { requireAccountSession } from "../account-auth";

type OrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
  }).format(value);
}

function formatMoney(amount: number, currencyCode: string | null) {
  return new Intl.NumberFormat("da-DK", {
    currency: currencyCode ?? "DKK",
    style: "currency",
  }).format(amount / 100);
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/orders`);
  const orders = await getCustomerOrders(user);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Orders</h2>
        <p className="account__muted__SW1aa">
          Verified email orders are claimed automatically. Guest lookup stays separate.
        </p>
      </header>

      <section className="account__panel__SW1ad">
        {orders.length > 0 ? (
          <div className="account__list__SW1ae">
            {orders.map((order) => (
              <article className="account__row__SW1af" key={order.id}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span>{formatDate(order.placedAt)} · {order.status}</span>
                </div>
                <span>{formatMoney(order.totalAmount, order.currencyCode)}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="account__muted__SW1aa">No orders are visible for this account yet.</p>
        )}
      </section>
    </div>
  );
}
