import Link from "next/link";

import { createEmptyCartSnapshot } from "../cart-data";
import { StorefrontBrandLogo } from "./storefront-brand";
import { StorefrontHeaderActions } from "./storefront-header-actions";

type StorefrontHeaderProps = {
  authOrigin: string;
  isSignedIn: boolean;
  locale: "da" | "en";
  storefrontOrigin: string;
};

const navigation = {
  da: [
    { label: "Produkter", href: "/products" },
    { label: "Nyheder" },
    { label: "Mænd" },
    { label: "Kvinder" },
    { label: "Accessories" },
    { label: "Sport" },
  ],
  en: [
    { label: "Products", href: "/products" },
    { label: "New" },
    { label: "Men" },
    { label: "Women" },
    { label: "Accessories" },
    { label: "Sport" },
  ],
} as const;

type PromoMessage = {
  action?: "newsletter";
  label: string;
};

const promoMessages: Record<
  "da" | "en",
  readonly [PromoMessage, PromoMessage, PromoMessage]
> = {
  da: [
    { label: "Fri standardlevering på ordrer over 550 DKK" },
    {
      action: "newsletter",
      label: "Få 10% rabat, når du tilmelder dig e-mails",
    },
    {
      label: "Giv en ven 86 kr. rabat, og få 86 kr. til din næste ordre",
    },
  ],
  en: [
    { label: "Free standard shipping on orders over 550 DKK" },
    {
      action: "newsletter",
      label: "Get 10% off when you sign up for emails",
    },
    {
      label: "Give a friend 86 kr. off and get 86 kr. toward your next order",
    },
  ],
} as const;

export function StorefrontHeader({
  authOrigin,
  isSignedIn,
  locale,
  storefrontOrigin,
}: StorefrontHeaderProps) {
  const navigationItems = navigation[locale];
  const promoMessage = promoMessages[locale][0];
  const initialCart = createEmptyCartSnapshot();

  return (
    <header className="header__root__SW0ed">
      <div className="promo__banner__SW2p0" aria-live="off">
        <span className="promo__message__SW2p1">
          {promoMessage.action === "newsletter" ? (
            <a className="promo__signup-link__SW2p2" href={`/${locale}#newsletter-signup`}>
              {promoMessage.label}
            </a>
          ) : (
            promoMessage.label
          )}
        </span>
      </div>
      <div className="header__nav__SW0ee">
        <div className="header__content__SW0ef">
          <Link
            aria-label="VELORO home"
            className="brand__link__SW0eg"
            href={`/${locale}`}
            prefetch={false}
          >
            <StorefrontBrandLogo />
          </Link>

          <nav aria-label="Primary" className="header__links__SW0eh">
            {navigationItems.map((item) => (
              "href" in item ? (
                <Link
                  className="nav__link__SW0ek"
                  href={`/${locale}${item.href}`}
                  key={item.label}
                  prefetch={false}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="nav__link__SW0ek"
                  key={item.label}
                >
                  {item.label}
                </span>
              )
            ))}
          </nav>

          <StorefrontHeaderActions
            authOrigin={authOrigin}
            initialCart={initialCart}
            isSignedIn={isSignedIn}
            locale={locale}
            storefrontOrigin={storefrontOrigin}
          />
        </div>
      </div>
    </header>
  );
}
