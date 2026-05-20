import type { Route } from "next";

import {
  getCustomerAccountDashboard,
  getCustomerDisplayName,
} from "@snn/customer";
import { tracePerformance } from "@snn/db";
import { isLocale } from "@snn/i18n";

import {
  EmptyOrdersPanel,
  getAddressSummary,
  RecentOrdersPanel,
  RewardsHero,
} from "./account-components";
import { requireAccountSession } from "./account-auth";
import { WelcomeAccountModalLoader } from "./welcome-account-modal-loader";
import { StorefrontCard } from "../components/storefront-card";

type AccountPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountPage({
  params,
  searchParams,
}: AccountPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account`);
  const dashboard = await tracePerformance(
    "storefront.account.dashboard",
    { locale: safeLocale },
    () => getCustomerAccountDashboard(user),
  );
  const displayName = getCustomerDisplayName(user, dashboard.profile);
  const shouldShowWelcome = getFirstParam(resolvedSearchParams.welcome) === "1";

  return (
    <div
      className="accountDashboard__root__SW2i0"
      data-account-ready="true"
      data-perf-ready="true"
      data-perf-surface="account"
    >
      {shouldShowWelcome ? (
        <WelcomeAccountModalLoader
          locale={safeLocale}
          open={shouldShowWelcome}
          userId={user.id}
        />
      ) : null}

      <RewardsHero
        displayName={displayName}
        locale={safeLocale}
        rewards={dashboard.rewards}
      />

      <div className="accountDashboard__body__SW2i1">
        {dashboard.recentOrderCards.length > 0 ? (
          <RecentOrdersPanel locale={safeLocale} orders={dashboard.recentOrderCards} />
        ) : (
          <EmptyOrdersPanel locale={safeLocale} />
        )}

        <aside className="accountDashboard__menu__SW2i2" aria-label="Account menu">
          <StorefrontCard
            accountLink="addresses"
            description={getAddressSummary(dashboard.defaultAddress ?? undefined)}
            href={`/${safeLocale}/account/addresses` as Route}
            prefetch={false}
            size="medium"
            title="Address book"
          />
          <StorefrontCard
            description="Quick and simple returns from one place."
            href={`/${safeLocale}/account/returns` as Route}
            prefetch={false}
            size="medium"
            title="Returns"
          />
          <StorefrontCard
            description="Give your friends a reward and unlock one for your next order."
            href={`/${safeLocale}/account/refer` as Route}
            prefetch={false}
            size="medium"
            title="Refer a friend"
          />
          <StorefrontCard
            accountLink="rewards"
            description="Rewards, points history, and tier progress."
            href={`/${safeLocale}/account/rewards` as Route}
            icon="XP"
            prefetch={false}
            size="medium"
            title="Rewards"
          />
          <StorefrontCard
            description="See how this preview XP total is built."
            href={`/${safeLocale}/account/points-history` as Route}
            prefetch={false}
            size="medium"
            title="Points history"
          />
          <StorefrontCard
            description="Compare tiers, thresholds, and benefits."
            href={`/${safeLocale}/account/loyalty` as Route}
            prefetch={false}
            size="medium"
            title="Loyalty overview"
          />
          <StorefrontCard
            description="Profile, sign-in security, privacy, and sign out."
            href={`/${safeLocale}/account/settings` as Route}
            prefetch={false}
            size="medium"
            title="Account settings"
          />
          <form
            action={`/${safeLocale}/account/sign-out`}
            className="accountDashboardSignOut__root__SW4c0"
            method="post"
          >
            <button
              className="accountDashboardSignOut__button__SW4c1"
              data-account-sign-out="true"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
