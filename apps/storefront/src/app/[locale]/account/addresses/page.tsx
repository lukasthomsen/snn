import { Button, TextField } from "@snn/ui";
import { isLocale } from "@snn/i18n";
import { getCustomerAddresses } from "@snn/customer";

import { createAddressAction, deleteAddressAction } from "../actions";
import { requireAccountSession } from "../account-auth";

type AddressesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/addresses`);
  const addresses = await getCustomerAddresses(user);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Addresses</h2>
        <p className="account__muted__SW1aa">Reusable delivery and billing details.</p>
      </header>

      <section className="account__panel__SW1ad">
        {addresses.length > 0 ? (
          <div className="account__list__SW1ae">
            {addresses.map((address) => (
              <article className="account__row__SW1af" key={address.id}>
                <div>
                  <strong>{address.label ?? "Address"}</strong>
                  <span>
                    {address.line1}, {address.postalCode} {address.city}
                  </span>
                </div>
                <form action={deleteAddressAction.bind(null, safeLocale, address.id)}>
                  <button className="account__text-button__SW1aj" type="submit">
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <p className="account__muted__SW1aa">No saved addresses yet.</p>
        )}
      </section>

      <section className="account__panel__SW1ad">
        <h3>Add address</h3>
        <form action={createAddressAction.bind(null, safeLocale)} className="account__form__SW1ak">
          <TextField fullWidth label="Label" name="label" placeholder="Home" size="md" />
          <TextField fullWidth label="First name" name="firstName" size="md" />
          <TextField fullWidth label="Last name" name="lastName" size="md" />
          <TextField fullWidth label="Address line" name="line1" required size="md" />
          <TextField fullWidth label="Address line 2" name="line2" size="md" />
          <TextField fullWidth label="Postal code" name="postalCode" required size="md" />
          <TextField fullWidth label="City" name="city" required size="md" />
          <TextField defaultValue="DK" fullWidth label="Country code" name="countryCode" required size="md" />
          <Button size="lg" type="submit">
            Save address
          </Button>
        </form>
      </section>
    </div>
  );
}
