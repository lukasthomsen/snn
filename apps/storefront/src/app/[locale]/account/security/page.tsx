import { getAppOrigin } from "@snn/config";
import { Heading, MetricCard } from "@snn/ui";
import { isLocale } from "@snn/i18n";
import { getCustomerSecurityState } from "@snn/customer";
import { tracePerformance } from "@snn/db";

import { revokeSessionAction } from "../actions";
import { requireAccountSession } from "../account-auth";
import { SecurityActions } from "./security-actions";

type SecurityPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/security`);
  const security = await tracePerformance(
    "storefront.account.security",
    { locale: safeLocale },
    () => getCustomerSecurityState(user),
  );
  const authOrigin = getAppOrigin("auth");
  const callbackURL = new URL(
    `/${safeLocale}/account/security`,
    getAppOrigin("storefront"),
  ).toString();
  const deleteCallbackURL = new URL(`/${safeLocale}`, getAppOrigin("storefront")).toString();

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <Heading as="h1">Sign-in & security</Heading>
        <p className="account__muted__SW1aa">
          Manage email verification, password access, passkeys, 2FA, and active sessions.
        </p>
      </header>

      <div className="account__stats__SW1ab">
        <MetricCard
          grow
          label="Email"
          size="lg"
          value={security.emailVerified ? "Verified" : "Needs verification"}
        />
        <MetricCard
          grow
          label="2FA"
          size="lg"
          value={security.twoFactorEnabled ? "On" : "Off"}
        />
        <MetricCard
          grow
          label="Passkeys"
          size="lg"
          value={security.passkeyCount}
        />
      </div>

      <SecurityActions
        authOrigin={authOrigin}
        callbackURL={callbackURL}
        deleteCallbackURL={deleteCallbackURL}
        email={security.email}
        emailManagedByProvider={security.emailManagedByProvider}
        emailManagedByProviderIds={security.emailManagedByProviderIds}
        emailVerified={security.emailVerified}
        hasPassword={security.hasPassword}
        linkedProviders={security.linkedProviders}
        locale={safeLocale}
        passkeyCount={security.passkeyCount}
        twoFactorEnabled={security.twoFactorEnabled}
      />

      <section className="account__panel__SW1ad">
        <Heading as="h2">Active sessions</Heading>
        {security.activeSessions.length > 0 ? (
          <div className="account__list__SW1ae">
            {security.activeSessions.map((session) => (
              <article className="account__row__SW1af" key={session.id}>
                <div>
                  <strong>{session.userAgent ?? "Unknown device"}</strong>
                  <span>
                    Created {formatDate(session.createdAt)} · Expires {formatDate(session.expiresAt)}
                  </span>
                </div>
                <form action={revokeSessionAction.bind(null, safeLocale, session.token)}>
                  <button className="accountServerButton__SW4d0" data-size="sm" data-tone="secondary" type="submit">
                    Revoke
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <p className="account__muted__SW1aa">No active sessions found.</p>
        )}
      </section>
    </div>
  );
}
