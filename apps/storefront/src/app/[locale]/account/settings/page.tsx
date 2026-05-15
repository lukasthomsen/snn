import type { Route } from "next";

import { isLocale } from "@snn/i18n";

import { BackToAccountLink } from "../account-components";
import { requireAccountSession } from "../account-auth";
import { StorefrontCard } from "../../components/storefront-card";

type SettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";

  await requireAccountSession(safeLocale, `/${safeLocale}/account/settings`);

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Account settings</h1>
        <p>Profile, security, privacy, and sign-out tools live here.</p>
      </header>
      <div className="accountSettings__root__SW2n0">
        <StorefrontCard
          description="Name, phone number, and customer profile details."
          href={`/${safeLocale}/account/profile` as Route}
          size="medium"
          title="Profile"
        />
        <StorefrontCard
          description="Passkeys, 2FA, password, sessions, and sign out."
          href={`/${safeLocale}/account/security` as Route}
          size="medium"
          title="Security"
        />
        <StorefrontCard
          description="Access, export, correction, and deletion requests."
          href={`/${safeLocale}/account/privacy` as Route}
          size="medium"
          title="Privacy"
        />
      </div>
    </div>
  );
}
