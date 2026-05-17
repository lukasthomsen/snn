import { getAppOrigin } from "@snn/config";
import { MetricCard } from "@snn/ui";
import { isLocale } from "@snn/i18n";
import { getCustomerSecurityState } from "@snn/customer";

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
  const security = await getCustomerSecurityState(user);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Security</h2>
        <p className="account__muted__SW1aa">
          Email verification, passkeys, password changes, and session control.
        </p>
      </header>

      <div className="account__stats__SW1ab">
        <MetricCard
          grow
          label="Email verified"
          size="lg"
          value={security.emailVerified ? "Yes" : "No"}
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
        authOrigin={getAppOrigin("auth")}
        locale={safeLocale}
        passkeyCount={security.passkeyCount}
        twoFactorEnabled={security.twoFactorEnabled}
      />

      <section className="account__panel__SW1ad">
        <h3>Active sessions</h3>
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
