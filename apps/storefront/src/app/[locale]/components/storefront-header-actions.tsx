import type { CartSnapshot } from "@snn/commerce";

import { HeaderCartEnhancer } from "./header-cart-enhancer";

type StorefrontHeaderActionsProps = {
  authOrigin: string;
  initialCart: CartSnapshot;
  isSignedIn: boolean;
  locale: "da" | "en";
  storefrontOrigin: string;
};

const accountLabels = {
  da: "Konto",
  en: "Account",
} as const;

type HeaderIconProps = {
  className?: string;
};

function HeartIcon({ className }: HeaderIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M20.8 4.6c-2.1-2-5.4-1.8-7.3.5L12 6.8l-1.5-1.7c-1.9-2.3-5.2-2.5-7.3-.5-2.4 2.3-2.5 6.1-.2 8.5l8 8.1c.6.6 1.5.6 2.1 0l8-8.1c2.2-2.4 2.1-6.2-.3-8.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShoppingBagIcon({ className }: HeaderIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M6.2 8.5h11.6l1.1 12H5.1l1.1-12Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UserIcon({ className }: HeaderIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M12 12a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.8 20.2c1.2-3.4 3.7-5.1 7.2-5.1s6 1.7 7.2 5.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function getAuthHref(
  authOrigin: string,
  locale: "da" | "en",
  route: "sign-in" | "sign-up",
  callbackURL: string,
) {
  const authURL = new URL(`/${locale}/${route}`, authOrigin);

  authURL.searchParams.set("callbackURL", callbackURL);

  return authURL.toString();
}

export function StorefrontHeaderActions({
  authOrigin,
  initialCart,
  isSignedIn,
  locale,
  storefrontOrigin,
}: StorefrontHeaderActionsProps) {
  const accountHref = `/${locale}/account`;
  const accountCallbackURL = new URL(accountHref, storefrontOrigin).toString();
  const signUpHref = getAuthHref(authOrigin, locale, "sign-up", accountCallbackURL);
  const accountActionHref = isSignedIn ? accountHref : signUpHref;
  const wishlistHref = `/${locale}/wishlist`;
  const cartHref = `/${locale}/cart`;
  const visibleItemCount = initialCart.itemCount;
  const cartLabel = visibleItemCount > 0 ? `Cart, ${visibleItemCount} items` : "Cart";

  return (
    <div className="header__actions__SW0ei">
      <div className="action__links__SW0el">
        <a
          aria-label="Wishlist"
          className="header-action__root__SW0em"
          href={wishlistHref}
        >
          <HeartIcon />
        </a>
        <a
          aria-label={accountLabels[locale]}
          className="header-action__root__SW0em"
          href={accountActionHref}
        >
          <UserIcon />
        </a>
        <a
          aria-label={cartLabel}
          className="header-action__root__SW0em"
          data-header-cart-trigger="true"
          href={cartHref}
        >
          <span className="header-action__badge-anchor__SW0en">
            <ShoppingBagIcon />
            <span
              className="header-action__badge__SW0eo"
              data-hidden={visibleItemCount <= 0 ? "true" : undefined}
            >
              {visibleItemCount > 99 ? "99+" : visibleItemCount}
            </span>
          </span>
        </a>
      </div>
      <HeaderCartEnhancer initialCart={initialCart} locale={locale} />
    </div>
  );
}
