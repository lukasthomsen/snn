import { isLocale } from "@snn/i18n";
import { getCustomerAccountOverview } from "@snn/customer";

import { requireAccountSession } from "./account-auth";

type AccountPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function formatMoney(amount: number, currencyCode: string | null) {
  return new Intl.NumberFormat("da-DK", {
    currency: currencyCode ?? "DKK",
    style: "currency",
  }).format(amount / 100);
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account`);
  const overview = await getCustomerAccountOverview(user, safeLocale);
  const recentOrders = overview.orders.slice(0, 3);
  const defaultAddress = overview.addresses.find((address) => address.isDefaultShipping);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <p className="account__muted__SW1aa">Signed in as {user.email}</p>
        <h2>Overview</h2>
      </header>

      <div className="account__stats__SW1ab">
        <article className="account__card__SW1ac">
          <span>Orders</span>
          <strong>{overview.orders.length}</strong>
        </article>
        <article className="account__card__SW1ac">
          <span>Liked items</span>
          <strong>{overview.likedProducts.length}</strong>
        </article>
        <article className="account__card__SW1ac">
          <span>Passkeys</span>
          <strong>{overview.security.passkeyCount}</strong>
        </article>
      </div>

      <section className="account__panel__SW1ad">
        <h3>Recent orders</h3>
        {recentOrders.length > 0 ? (
          <div className="account__list__SW1ae">
            {recentOrders.map((order) => (
              <article className="account__row__SW1af" key={order.id}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span>{order.status}</span>
                </div>
                <span>{formatMoney(order.totalAmount, order.currencyCode)}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="account__muted__SW1aa">No orders are linked to this account yet.</p>
        )}
      </section>

      <section className="account__panel__SW1ad">
        <h3>Default delivery</h3>
        {defaultAddress ? (
          <p className="account__muted__SW1aa">
            {defaultAddress.line1}, {defaultAddress.postalCode} {defaultAddress.city}
          </p>
        ) : (
          <p className="account__muted__SW1aa">Add an address to speed up checkout later.</p>
        )}
      </section>
    </div>
  );
}
