import type { Route } from "next";

import { getCustomerDisplayName, ensureCustomerProfile } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import { BackToAccountLink } from "../account-components";
import { requireAccountSession } from "../account-auth";
import { StorefrontCard } from "../../components/storefront-card";

type ReferPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ReferPage({ params }: ReferPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/refer`);
  const profile = await ensureCustomerProfile(user);
  const displayName = getCustomerDisplayName(user, profile);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Refer a friend</h1>
        <p>Give friends a reward and keep one ready for your next order.</p>
      </header>
      <section className="accountInfoPanel__root__SW2l0">
        <h2>{displayName}, your referral hub is almost ready.</h2>
        <p>
          The UI shell is ready for referral codes, reward tracking, and
          friend-invite history once the referral rules are finalized.
        </p>
      </section>
      <StorefrontCard
        description="See the reward tiers your referrals can help unlock."
        href={`/${safeLocale}/account/loyalty` as Route}
        size="medium"
        title="Loyalty overview"
      />
    </div>
  );
}
