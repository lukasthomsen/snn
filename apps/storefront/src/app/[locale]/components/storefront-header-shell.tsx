import { headers } from "next/headers";

import { getCustomerSession } from "@snn/customer";

import { StorefrontHeader } from "./storefront-header";

type StorefrontHeaderShellProps = {
  authOrigin: string;
  locale: "da" | "en";
  storefrontOrigin: string;
};

export async function StorefrontHeaderShell({
  authOrigin,
  locale,
  storefrontOrigin,
}: StorefrontHeaderShellProps) {
  const session = await getCustomerSession(await headers()).catch(() => null);
  const isSignedIn = Boolean(session?.user && !session.user.banned);

  return (
    <StorefrontHeader
      authOrigin={authOrigin}
      isSignedIn={isSignedIn}
      locale={locale}
      storefrontOrigin={storefrontOrigin}
    />
  );
}
