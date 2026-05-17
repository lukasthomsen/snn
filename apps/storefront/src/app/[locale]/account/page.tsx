import type { Route } from "next";
import Link from "next/link";

import {
  getCustomerAccountDashboard,
  getCustomerDisplayName,
} from "@snn/customer";
import { tracePerformance } from "@snn/db";
import { isLocale } from "@snn/i18n";
import {
  BadgePercentIcon,
  BookOpenIcon,
  Clock3Icon,
  HeartIcon,
  PackageOpenIcon,
  ProgressBar,
  ShareIcon,
  ShoppingBagIcon,
  StarIcon,
  StatusChip,
  TruckIcon,
} from "@snn/ui";

import {
  formatAccountDate,
  formatAccountMoney,
  getAddressSummary,
} from "./account-components";
import { signOutCustomerAction } from "./actions";
import { requireAccountSession } from "./account-auth";

type AccountPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getOrderStatusColor(status: string) {
  if (["canceled", "cancelled", "refunded"].includes(status)) {
    return "danger" as const;
  }

  if (["fulfilled", "delivered", "confirmed"].includes(status)) {
    return "success" as const;
  }

  return "warning" as const;
}

function getOrderStatusCopy(status: string) {
  const copy: Record<string, string> = {
    canceled: "Cancelled",
    confirmed: "Confirmed",
    draft: "Draft",
    fulfilled: "Fulfilled",
    partially_fulfilled: "Partially fulfilled",
    pending: "Processing",
    refunded: "Refunded",
  };

  return copy[status] ?? status.replaceAll("_", " ");
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account`);
  const dashboard = await tracePerformance("storefront.account.dashboard", {
    locale: safeLocale,
  }, () => getCustomerAccountDashboard(user));
  const displayName = getCustomerDisplayName(user, dashboard.profile);
  const rewards = dashboard.rewards;
  async function signOutFormAction() {
    "use server";

    await signOutCustomerAction(safeLocale);
  }
  const quickLinks = [
    {
      description:
        dashboard.orderCount > 0
          ? `${dashboard.orderCount} order${dashboard.orderCount === 1 ? "" : "s"} saved`
          : "Orders will appear here.",
      href: `/${safeLocale}/account/orders` as Route,
      icon: <ShoppingBagIcon size={22} />,
      id: "orders",
      title: "Orders",
    },
    {
      description:
        dashboard.addressCount > 0
          ? `${dashboard.addressCount} saved address${dashboard.addressCount === 1 ? "" : "es"}`
          : "Add a main address for checkout.",
      href: `/${safeLocale}/account/addresses` as Route,
      icon: <TruckIcon size={22} />,
      id: "addresses",
      title: "Address book",
    },
    {
      description: "Start or follow a return.",
      href: `/${safeLocale}/account/returns` as Route,
      icon: <PackageOpenIcon size={22} />,
      id: "returns",
      title: "Returns",
    },
    {
      description: "Share rewards with friends.",
      href: `/${safeLocale}/account/refer` as Route,
      icon: <ShareIcon size={22} />,
      id: "refer",
      title: "Refer a friend",
    },
    {
      description: `${rewards.currentTier.label} · ${rewards.currentXp} XP`,
      href: `/${safeLocale}/account/rewards` as Route,
      icon: <StarIcon size={22} />,
      id: "rewards",
      title: "Rewards",
    },
    {
      description: "XP events and activity.",
      href: `/${safeLocale}/account/points-history` as Route,
      icon: <Clock3Icon size={22} />,
      id: "points",
      title: "Points history",
    },
    {
      description: "Tier thresholds and benefits.",
      href: `/${safeLocale}/account/loyalty` as Route,
      icon: <BadgePercentIcon size={22} />,
      id: "loyalty",
      title: "Loyalty overview",
    },
    {
      description:
        dashboard.likedProductCount > 0
          ? `${dashboard.likedProductCount} saved item${dashboard.likedProductCount === 1 ? "" : "s"}`
          : "Saved products for later.",
      href: `/${safeLocale}/account/liked` as Route,
      icon: <HeartIcon size={22} />,
      id: "liked",
      title: "Liked items",
    },
  ];

  return (
    <div
      className="accountDashboard__root__SW4a0"
      data-account-ready="true"
      data-perf-ready="true"
      data-perf-surface="account"
    >
      <section className="accountDashboardHero__root__SW4a1" aria-labelledby="account-dashboard-heading">
        <div className="accountDashboardHero__copy__SW4a2">
          <p>{rewards.currentTier.label}</p>
          <h1 id="account-dashboard-heading">{displayName}</h1>
          <div className="accountDashboardHero__summary__SW4a3" aria-label="Account summary">
            <span>
              <strong>{dashboard.orderCount}</strong>
              Orders
            </span>
            <span>
              <strong>{dashboard.addressCount}</strong>
              Addresses
            </span>
            <span>
              <strong>{dashboard.likedProductCount}</strong>
              Liked
            </span>
          </div>
        </div>

        <div className="accountDashboardHero__xp__SW4a4">
          <div className="accountDashboardHero__xpNumber__SW4a5">
            <strong>{rewards.currentXp}</strong>
            <span>XP</span>
          </div>
          <ProgressBar
            aria-label="Reward progress"
            showValueLabel={false}
            size="sm"
            value={rewards.progressPercent}
          />
          <div className="accountDashboardHero__progressMeta__SW4a6">
            <span>{rewards.currentTier.label}</span>
            <span>{rewards.nextTier ? `${rewards.xpToNextTier} XP to ${rewards.nextTier.label}` : "Top tier"}</span>
          </div>
        </div>

        <div className="accountDashboardHero__benefits__SW4a7" aria-label="Current tier benefits">
          <BookOpenIcon aria-hidden="true" size={24} />
          <div>
            <p>{rewards.currentTier.label} benefits</p>
            <ul>
              {rewards.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="accountDashboardTierTrack__SW4a8" aria-label="Loyalty tiers">
        {rewards.tiers.map((tier) => (
          <Link
            className="accountDashboardTierTrack__item__SW4a9"
            data-current={tier.id === rewards.currentTier.id ? "true" : undefined}
            href={`/${safeLocale}/account/loyalty` as Route}
            key={tier.id}
          >
            <span>{tier.label}</span>
            <strong>{tier.threshold} XP</strong>
          </Link>
        ))}
      </section>

      <div className="accountDashboard__body__SW4b0">
        <section className="accountDashboardPanel__root__SW4b1" aria-labelledby="account-dashboard-actions">
          <div className="accountDashboardPanel__header__SW4b2">
            <h2 id="account-dashboard-actions">Account</h2>
            <p>{getAddressSummary(dashboard.defaultAddress ?? undefined)}</p>
          </div>
          <div className="accountDashboardActions__grid__SW4b3">
            {quickLinks.map((link) => (
              <Link
                className="accountDashboardActions__link__SW4b4"
                data-account-link={link.id}
                href={link.href}
                key={link.id}
              >
                <span className="accountDashboardActions__icon__SW4b5" aria-hidden="true">
                  {link.icon}
                </span>
                <span>
                  <strong>{link.title}</strong>
                  <small>{link.description}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="accountDashboardPanel__root__SW4b1" aria-labelledby="account-dashboard-orders">
          <div className="accountDashboardPanel__header__SW4b2">
            <h2 id="account-dashboard-orders">Recent orders</h2>
            <Link href={`/${safeLocale}/account/orders` as Route}>View all</Link>
          </div>
          {dashboard.recentOrders.length > 0 ? (
            <div className="accountDashboardOrders__list__SW4b6">
              {dashboard.recentOrders.map((order) => (
                <article className="accountDashboardOrders__item__SW4b7" key={order.id}>
                  <div>
                    <h3>Order {order.orderNumber}</h3>
                    <p>{formatAccountDate(order.placedAt)}</p>
                  </div>
                  <div>
                    <strong>{formatAccountMoney(order.totalAmount, order.currencyCode)}</strong>
                    <StatusChip color={getOrderStatusColor(order.status)}>
                      {getOrderStatusCopy(order.status)}
                    </StatusChip>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="accountDashboardOrders__empty__SW4b8">
              <ShoppingBagIcon aria-hidden="true" size={28} />
              <p>You have no orders yet.</p>
              <Link href={`/${safeLocale}/products` as Route}>Shop products</Link>
            </div>
          )}
        </section>
      </div>

      <form action={signOutFormAction} className="accountDashboardSignOut__root__SW4c0">
        <button
          className="accountDashboardSignOut__button__SW4c1"
          data-account-sign-out="true"
          type="submit"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
