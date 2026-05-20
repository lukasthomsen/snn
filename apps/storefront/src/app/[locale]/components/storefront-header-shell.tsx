import { StorefrontHeader } from "./storefront-header";

type StorefrontHeaderShellProps = {
  authOrigin: string;
  locale: "da" | "en";
  storefrontOrigin: string;
};

export function StorefrontHeaderShell({
  authOrigin,
  locale,
  storefrontOrigin,
}: StorefrontHeaderShellProps) {
  return (
    <StorefrontHeader
      authOrigin={authOrigin}
      isSignedIn={false}
      locale={locale}
      storefrontOrigin={storefrontOrigin}
    />
  );
}
