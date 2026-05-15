import { getCustomerAccountOverview } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  BackToAccountLink,
  RewardsTierList,
} from "../account-components";
import { requireAccountSession } from "../account-auth";

type LoyaltyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LoyaltyPage({ params }: LoyaltyPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/loyalty`);
  const overview = await getCustomerAccountOverview(user, safeLocale);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Loyalty overview</h1>
        <p>Every tier has a clear XP target and benefit set.</p>
      </header>
      <RewardsTierList rewards={overview.rewards} />
    </div>
  );
}
