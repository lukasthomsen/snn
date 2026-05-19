"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Badge,
  BadgeAnchor,
  HeaderAction,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@snn/ui";

import { StorefrontBrandLogo } from "./storefront-brand";
import { useCartDrawer } from "./cart-drawer";
import { useNewsletterSignup } from "./newsletter-signup";

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

const accountLabels = {
  da: "Konto",
  en: "Account",
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

const promoCollapseScrollY = 300;

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

export function StorefrontHeader({
  authOrigin,
  isSignedIn,
  locale,
  storefrontOrigin,
}: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [docked, setDocked] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [previousPromoIndex, setPreviousPromoIndex] = useState<number | null>(
    null,
  );
  const { openNewsletterSignup } = useNewsletterSignup();
  const { itemCount, openCart } = useCartDrawer();
  const visibleItemCount = hasMounted ? itemCount : 0;
  const isAuthRoute = pathname.endsWith("/sign-in") || pathname.endsWith("/sign-up");
  const navigationItems = navigation[locale];
  const promoItems = promoMessages[locale];
  const activePromoMessage = promoItems[activePromoIndex] ?? promoItems[0];
  const previousPromoMessage =
    previousPromoIndex === null
      ? null
      : promoItems[previousPromoIndex] ?? promoItems[0];
  const accountHref = `/${locale}/account`;
  const accountCallbackURL = new URL(accountHref, storefrontOrigin).toString();
  const signUpHref = getAuthHref(authOrigin, locale, "sign-up", accountCallbackURL);
  const shouldUseAccountLinks = isSignedIn;
  const accountActionHref = shouldUseAccountLinks ? accountHref : signUpHref;
  const wishlistHref = `/${locale}/wishlist`;
  const productsHref = `/${locale}/products`;
  const cartLabel = visibleItemCount > 0 ? `Cart, ${visibleItemCount} items` : "Cart";
  const isWishlistActive =
    pathname === wishlistHref || pathname.startsWith(`${wishlistHref}/`);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (isAuthRoute) {
      document.documentElement.removeAttribute("data-storefront-header-docked");
      return;
    }

    function handleScroll() {
      const nextDocked = window.scrollY > promoCollapseScrollY;

      setDocked(nextDocked);
      document.documentElement.toggleAttribute(
        "data-storefront-header-docked",
        nextDocked,
      );
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.documentElement.removeAttribute("data-storefront-header-docked");
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthRoute]);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActivePromoIndex((currentIndex) => {
        setPreviousPromoIndex(currentIndex);

        return (currentIndex + 1) % promoMessages[locale].length;
      });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthRoute, locale]);

  useEffect(() => {
    if (previousPromoIndex === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviousPromoIndex(null);
    }, 520);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [previousPromoIndex]);

  if (isAuthRoute) {
    return null;
  }

  return (
    <header
      className="header__root__SW0ed"
      data-docked={docked ? "true" : undefined}
    >
      <div className="promo__banner__SW2p0" aria-live="off">
        <span
          className="promo__message__SW2p1"
          data-state={previousPromoIndex === null ? "idle" : "entering"}
          key={`active-${activePromoIndex}`}
        >
          {activePromoMessage.action === "newsletter" ? (
            <a
              className="promo__signup-link__SW2p2"
              href="#newsletter-signup"
              onClick={(event) => {
                event.preventDefault();
                openNewsletterSignup();
              }}
            >
              {activePromoMessage.label}
            </a>
          ) : (
            activePromoMessage.label
          )}
        </span>
        {previousPromoMessage ? (
          <span
            className="promo__message__SW2p1"
            data-state="leaving"
            key={`previous-${previousPromoIndex}`}
          >
            {previousPromoMessage.label}
          </span>
        ) : null}
      </div>
      <div className="header__nav__SW0ee">
        <div className="header__content__SW0ef">
          <Link aria-label="VELORO home" className="brand__link__SW0eg" href={`/${locale}`}>
            <StorefrontBrandLogo />
          </Link>

          <nav aria-label="Primary" className="header__links__SW0eh">
            {navigationItems.map((item) => (
              "href" in item ? (
                <Link
                  aria-current={
                    pathname === productsHref ||
                    pathname.startsWith(`${productsHref}/`)
                      ? "page"
                      : undefined
                  }
                  className="nav__link__SW0ek"
                  href={`/${locale}${item.href}`}
                  key={item.label}
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

          <div className="header__actions__SW0ei">
            <div className="action__links__SW0el">
              <HeaderAction
                ariaCurrent={isWishlistActive ? "page" : undefined}
                as="a"
                href={wishlistHref}
                isActive={isWishlistActive}
                label="Wishlist"
              >
                <HeartIcon />
              </HeaderAction>
              <HeaderAction
                as="a"
                href={accountActionHref}
                label={accountLabels[locale]}
              >
                <UserIcon />
              </HeaderAction>
              <HeaderAction
                label={cartLabel}
                onClick={openCart}
                type="button"
              >
                <BadgeAnchor>
                  <ShoppingBagIcon />
                  <Badge
                    color="blue"
                    content={visibleItemCount}
                    isInvisible={visibleItemCount <= 0}
                    max={99}
                    shape={visibleItemCount < 10 ? "circle" : "rectangle"}
                    size="sm"
                    variant="primary"
                  />
                </BadgeAnchor>
              </HeaderAction>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
