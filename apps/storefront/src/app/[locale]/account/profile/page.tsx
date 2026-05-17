import { TextField } from "@snn/ui";
import { isLocale } from "@snn/i18n";
import { ensureCustomerProfile } from "@snn/customer";

import { updateProfileAction } from "../actions";
import { requireAccountSession } from "../account-auth";

type ProfilePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/profile`);
  const profile = await ensureCustomerProfile(user);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Profile</h2>
        <p className="account__muted__SW1aa">Your email is managed by the auth authority.</p>
      </header>

      <section className="account__panel__SW1ad">
        <form action={updateProfileAction.bind(null, safeLocale)} className="account__form__SW1ak">
          <TextField
            defaultValue={profile.firstName ?? ""}
            fullWidth
            label="First name"
            name="firstName"
            size="md"
          />
          <TextField
            defaultValue={profile.lastName ?? ""}
            fullWidth
            label="Last name"
            name="lastName"
            size="md"
          />
          <TextField
            defaultValue={profile.phone ?? ""}
            fullWidth
            label="Phone"
            name="phone"
            size="md"
            type="tel"
          />
          <TextField
            defaultValue={profile.email}
            disabled
            fullWidth
            label="Email"
            size="md"
            type="email"
          />
          <button className="accountServerButton__SW4d0" data-size="lg" type="submit">
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
}
