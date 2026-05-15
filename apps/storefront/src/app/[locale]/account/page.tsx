import type { Route } from "next";

import {
  getCustomerAccountOverview,
  getCustomerDisplayName,
} from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  EmptyOrdersPanel,
  getAddressSummary,
  RecentOrdersPanel,
  RewardsHero,
} from "./account-components";
import { requireAccountSession } from "./account-auth";
import { StorefrontCard } from "../components/storefront-card";

type AccountPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account`);
  const overview = await getCustomerAccountOverview(user, safeLocale);
  const displayName = getCustomerDisplayName(user, overview.profile);
  const defaultAddress =
    overview.addresses.find((address) => address.isDefaultShipping) ??
    overview.addresses[0];

  return (
    <div className="accountDashboard__root__SW2i0">
      <RewardsHero
        displayName={displayName}
        locale={safeLocale}
        rewards={overview.rewards}
      />

      <div className="accountDashboard__body__SW2i1">
        {overview.orderCards.length > 0 ? (
          <RecentOrdersPanel locale={safeLocale} orders={overview.orderCards} />
        ) : (
          <EmptyOrdersPanel locale={safeLocale} />
        )}

        <aside className="accountDashboard__menu__SW2i2" aria-label="Account menu">
          <StorefrontCard
            description={getAddressSummary(defaultAddress)}
            href={`/${safeLocale}/account/addresses` as Route}
            size="medium"
            title="Address book"
          />
          <StorefrontCard
            description="Quick and simple returns from one place."
            href={`/${safeLocale}/account/returns` as Route}
            size="medium"
            title="Returns"
          />
          <StorefrontCard
            description="Give your friends a reward and unlock one for your next order."
            href={`/${safeLocale}/account/refer` as Route}
            size="medium"
            title="Refer a friend"
          />
          <StorefrontCard
            description="Rewards, points history, and tier progress."
            href={`/${safeLocale}/account/rewards` as Route}
            icon="XP"
            size="medium"
            title="Rewards"
          />
          <StorefrontCard
            description="See how this preview XP total is built."
            href={`/${safeLocale}/account/points-history` as Route}
            size="medium"
            title="Points history"
          />
          <StorefrontCard
            description="Compare tiers, thresholds, and benefits."
            href={`/${safeLocale}/account/loyalty` as Route}
            size="medium"
            title="Loyalty overview"
          />
          <StorefrontCard
            description="Profile, security, privacy, and sign out."
            href={`/${safeLocale}/account/settings` as Route}
            size="medium"
            title="Account settings"
          />
        </aside>
      </div>
    </div>
  );
}
