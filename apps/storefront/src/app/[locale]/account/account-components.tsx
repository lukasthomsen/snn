import type { Route } from "next";
import Link from "next/link";

import type {
  CustomerOrderCard,
  CustomerRewardTier,
  CustomerRewardsPreview,
} from "@snn/customer";
import type { Locale } from "@snn/i18n";
import { ProgressBar, StatusChip } from "@snn/ui";

import { StorefrontImage } from "../components/storefront-image";

export function formatAccountDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function formatAccountMoney(amount: number, currencyCode: string | null) {
  return new Intl.NumberFormat("da-DK", {
    currency: currencyCode ?? "DKK",
    style: "currency",
  }).format(amount / 100);
}

export function getAddressSummary(
  address:
    | {
        city: string;
        countryCode: string;
        firstName: string | null;
        lastName: string | null;
        line1: string;
        postalCode: string;
      }
    | undefined,
) {
  if (!address) {
    return "Add a main address to make checkout faster.";
  }

  const name = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();
  const location = `${address.line1}, ${address.postalCode} ${address.city}, ${address.countryCode}`;

  return name ? `${name}, ${location}` : location;
}

function getStatusTone(status: string) {
  if (["canceled", "cancelled", "refunded"].includes(status)) {
    return "danger";
  }

  if (["fulfilled", "delivered", "confirmed"].includes(status)) {
    return "success";
  }

  return "pending";
}

function getStatusColor(status: string) {
  const tone = getStatusTone(status);

  if (tone === "danger") {
    return "danger";
  }

  if (tone === "success") {
    return "success";
  }

  return "warning";
}

function getStatusCopy(status: string) {
  const copy: Record<string, string> = {
    canceled: "Cancelled",
    confirmed: "Confirmed",
    draft: "Draft",
    fulfilled: "It’s fulfilled",
    partially_fulfilled: "Partially fulfilled",
    pending: "Processing",
    refunded: "Refunded",
  };

  return copy[status] ?? status.replaceAll("_", " ");
}

function OrderThumbs({ order }: { order: CustomerOrderCard }) {
  const thumbs = order.items.length > 0
    ? order.items
    : [
        {
          id: `${order.id}-placeholder`,
          imageUrl: null,
          title: order.orderNumber,
        },
      ];

  return (
    <div className="accountThumbs__root__SW2c0" aria-label={`${order.orderNumber} items`}>
      {thumbs.map((item) => (
        <div className="accountThumbs__item__SW2c1" key={item.id}>
          {item.imageUrl ? (
            <StorefrontImage alt={item.title} src={item.imageUrl} />
          ) : (
            <span>{item.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
      ))}
      {order.overflowItemCount > 0 ? (
        <div className="accountThumbs__more__SW2c2">+{order.overflowItemCount}</div>
      ) : null}
    </div>
  );
}

export function BackToAccountLink({ locale }: { locale: Locale }) {
  return (
    <Link
      className="accountBack__link__SW2b0"
      href={`/${locale}/account` as Route}
      prefetch={false}
    >
      <span aria-hidden="true">‹</span>
      Back to account
    </Link>
  );
}

export function RewardsHero({
  displayName,
  locale,
  rewards,
}: {
  displayName: string;
  locale: Locale;
  rewards: CustomerRewardsPreview;
}) {
  return (
    <section className="accountHero__root__SW2a0">
      <div className="accountHero__inner__SW2a9">
        <div className="accountHero__name__SW2a1">
          <p>Account dashboard</p>
          <h1>{displayName}</h1>
          <span>{rewards.currentTier.label} member</span>
        </div>

        <div className="accountHero__xp__SW2a2">
          <div className="accountHero__xpNumber__SW2a3">
            <strong>{rewards.currentXp}</strong>
            <span>XP</span>
          </div>
          <div className="accountHero__progress__SW2a4">
            <ProgressBar
              aria-label="Reward progress"
              showValueLabel={false}
              size="sm"
              value={rewards.progressPercent}
            />
          </div>
          <div className="accountHero__progressMeta__SW2a5">
            <strong>{rewards.currentXp}XP</strong>
            {rewards.nextTier ? <span>{rewards.xpToNextTier}XP to go</span> : <span>Top tier</span>}
          </div>
          <Link
            className="accountHero__rewardLink__SW2a6"
            href={`/${locale}/account/rewards` as Route}
            prefetch={false}
          >
            {rewards.isLocked ? "Unlock XP & rewards" : "View rewards"}
          </Link>
        </div>

        <div className="accountHero__benefits__SW2a7">
          <p>{rewards.currentTier.label} benefits</p>
          {rewards.benefits.map((benefit) => (
            <div className="accountHero__benefit__SW2a8" key={benefit}>
              <span aria-hidden="true">✓</span>
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmptyOrdersPanel({ locale }: { locale: Locale }) {
  return (
    <section className="accountOrdersEmpty__root__SW2e0">
      <h2>Orders</h2>
      <div className="accountOrdersEmpty__illustration__SW2e1" aria-hidden="true">
        <span />
        <i />
        <b />
      </div>
      <p>You haven’t made any orders yet. When you make an order it’ll show up here.</p>
      <div className="accountOrdersEmpty__actions__SW2e2">
        <Link href={`/${locale}/#hero` as Route} prefetch={false}>Shop women</Link>
        <Link href={`/${locale}/#hero` as Route} prefetch={false}>Shop men</Link>
      </div>
    </section>
  );
}

export function RecentOrdersPanel({
  locale,
  orders,
}: {
  locale: Locale;
  orders: CustomerOrderCard[];
}) {
  return (
    <section className="accountRecentOrders__root__SW2f0">
      <div className="accountRecentOrders__header__SW2f1">
        <h2>Orders</h2>
        <Link href={`/${locale}/account/orders` as Route} prefetch={false}>View all</Link>
      </div>
      <div className="accountRecentOrders__list__SW2f2">
        {orders.slice(0, 2).map((order) => (
          <article className="accountRecentOrders__item__SW2f3" key={order.id}>
            <OrderThumbs order={order} />
            <p>Ordered on {formatAccountDate(order.placedAt)}</p>
        <StatusChip color={getStatusColor(order.status)}>{getStatusCopy(order.status)}</StatusChip>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OrderCard({
  locale,
  order,
}: {
  locale: Locale;
  order: CustomerOrderCard;
}) {
  const tone = getStatusTone(order.status);

  return (
    <article className="accountOrderCard__root__SW2g0" id={order.id}>
      <div className="accountOrderCard__copy__SW2g1">
        <h3>Order {order.orderNumber}</h3>
        <p>Ordered on {formatAccountDate(order.placedAt)}</p>
        <strong>Status</strong>
        <span className="accountOrderCard__bar__SW2g2" data-tone={tone} />
        <p>{getStatusCopy(order.status)}</p>
      </div>
      <div className="accountOrderCard__side__SW2g3">
        <OrderThumbs order={order} />
        <Link href={`/${locale}/account/orders#${order.id}` as Route} prefetch={false}>
          View order
        </Link>
      </div>
    </article>
  );
}

export function RewardsTierList({ rewards }: { rewards: CustomerRewardsPreview }) {
  return (
    <div className="accountTierList__root__SW2h0">
      {rewards.tiers.map((tier: CustomerRewardTier) => (
        <article
          className="accountTierList__item__SW2h1"
          data-current={tier.id === rewards.currentTier.id ? "true" : undefined}
          key={tier.id}
        >
          <div>
            <h3>{tier.label}</h3>
            <p>{tier.threshold} XP</p>
          </div>
          <ul>
            {tier.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
