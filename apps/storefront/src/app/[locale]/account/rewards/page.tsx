import {
  getCustomerAccountOverview,
  getCustomerDisplayName,
} from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  BackToAccountLink,
  RewardsHero,
  RewardsTierList,
} from "../account-components";
import { requireAccountSession } from "../account-auth";

type RewardsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RewardsPage({ params }: RewardsPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/rewards`);
  const overview = await getCustomerAccountOverview(user, safeLocale);
  const displayName = getCustomerDisplayName(user, overview.profile);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <RewardsHero
        displayName={displayName}
        locale={safeLocale}
        rewards={overview.rewards}
      />
      <section className="accountInfoPanel__root__SW2l0">
        <h2>Rewards</h2>
        <p>
          XP is a preview of the future personal activity system. As the account
          foundation grows, views, purchases, and member actions can feed this
          same rewards surface.
        </p>
      </section>
      <RewardsTierList rewards={overview.rewards} />
    </div>
  );
}
