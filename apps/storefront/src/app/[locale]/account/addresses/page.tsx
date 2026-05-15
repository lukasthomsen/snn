import { Button, Checkbox, EmptyState, TextField } from "@snn/ui";
import { getCustomerAddresses } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  createAddressAction,
  deleteAddressAction,
  setMainAddressAction,
} from "../actions";
import { BackToAccountLink } from "../account-components";
import { requireAccountSession } from "../account-auth";

type AddressesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type AddressRecord = Awaited<ReturnType<typeof getCustomerAddresses>>[number];

function formatAddressLines(address: AddressRecord) {
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();

  return [
    name,
    address.line1,
    address.line2,
    `${address.postalCode} ${address.city}`,
    address.countryCode,
  ].filter(Boolean);
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/addresses`);
  const addresses = await getCustomerAddresses(user);
  const mainAddress =
    addresses.find((address) => address.isDefaultShipping) ?? addresses[0];

  return (
    <div className="accountSubpage__root__SW2j0">
      <BackToAccountLink locale={safeLocale} />
      <header className="accountSubpage__header__SW2j1">
        <h1>Address book</h1>
      </header>

      <div className="accountAddressBook__root__SW2k0">
        <aside className="accountAddressBook__main__SW2k1">
          <section className="accountAddressBook__mainCard__SW2k2">
            <h2>Main address</h2>
            {mainAddress ? (
              <address>
                {formatAddressLines(mainAddress).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p>No main address yet.</p>
            )}
          </section>

          <section className="accountAddressBook__add__SW2k3">
            <h2>Add an address</h2>
            <form action={createAddressAction.bind(null, safeLocale)}>
              <TextField fullWidth label="Label" name="label" placeholder="Home" size="md" />
              <TextField fullWidth label="First name" name="firstName" size="md" />
              <TextField fullWidth label="Last name" name="lastName" size="md" />
              <TextField fullWidth label="Address line" name="line1" required size="md" />
              <TextField fullWidth label="Address line 2" name="line2" size="md" />
              <TextField fullWidth label="Postal code" name="postalCode" required size="md" />
              <TextField fullWidth label="City" name="city" required size="md" />
              <TextField defaultValue="DK" fullWidth label="Country code" name="countryCode" required size="md" />
              <Checkbox
                label="Make this my main"
                name="isDefaultShipping"
              />
              <Button fullWidth shape="field" size="lg" type="submit">
                + Add an address
              </Button>
            </form>
          </section>
        </aside>

        <section className="accountAddressBook__list__SW2k5">
          <h2>Your addresses</h2>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <article className="accountAddressBook__card__SW2k6" key={address.id}>
                <address>
                  {formatAddressLines(address).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
                <div className="accountAddressBook__actions__SW2k7">
                  <Button disabled size="sm" tone="secondary" type="button">Edit</Button>
                  <form action={deleteAddressAction.bind(null, safeLocale, address.id)}>
                    <Button size="sm" tone="danger" type="submit">Delete</Button>
                  </form>
                  <form action={setMainAddressAction.bind(null, safeLocale, address.id)}>
                    <Button
                      data-active={address.isDefaultShipping ? "true" : undefined}
                      size="sm"
                      tone={address.isDefaultShipping ? "primary" : "secondary"}
                      type="submit"
                    >
                      Make this my main
                    </Button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No saved addresses yet." />
          )}
        </section>
      </div>
    </div>
  );
}
