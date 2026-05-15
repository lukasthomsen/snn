import { getCustomerAccountOverview } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  BackToAccountLink,
  formatAccountDate,
} from "../account-components";
import { requireAccountSession } from "../account-auth";

type PointsHistoryPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PointsHistoryPage({ params }: PointsHistoryPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(
    safeLocale,
    `/${safeLocale}/account/points-history`,
  );
  const overview = await getCustomerAccountOverview(user, safeLocale);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Points history</h1>
        <p>Preview XP events for the account foundation.</p>
      </header>

      <section className="accountHistory__root__SW2m0">
        {overview.rewards.history.map((item) => (
          <article className="accountHistory__item__SW2m1" key={item.id}>
            <div>
              <h2>{item.label}</h2>
              <p>{item.description} · {formatAccountDate(item.occurredAt)}</p>
            </div>
            <strong>+{item.points} XP</strong>
          </article>
        ))}
      </section>
    </div>
  );
}
