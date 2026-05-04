"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { HeartIcon, ShoppingBagIcon } from "@snn/ui";

type StorefrontHeaderProps = {
  locale: "da" | "en";
};

const navigation = {
  da: [
    { href: "/#hero", label: "Nyheder" },
    { href: "/#hero", label: "Shop" },
    { href: "/sign-up", label: "Medlemskab" },
    { href: "/#footer", label: "Support" },
  ],
  en: [
    { href: "/#hero", label: "New" },
    { href: "/#hero", label: "Shop" },
    { href: "/sign-up", label: "Membership" },
    { href: "/#footer", label: "Support" },
  ],
} as const;

function SnnLogo() {
  return (
    <svg
      aria-hidden="true"
      className="brand__logo__SW0ej"
      viewBox="0 0 132 24"
    >
      <path d="M4.5 17.75 10.9 6.25h4.7L9.25 17.75Z" fill="currentColor" />
      <path d="M13.3 17.75 19.7 6.25h4.7L18.05 17.75Z" fill="currentColor" />
      <circle cx="29.8" cy="12" r="2.8" fill="currentColor" />
      <text
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize="16"
        fontWeight="900"
        letterSpacing="-0.08em"
        x="41"
        y="17.2"
      >
        SNN
      </text>
    </svg>
  );
}

export function StorefrontHeader({ locale }: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [docked, setDocked] = useState(false);
  const isAuthRoute = pathname.endsWith("/sign-in") || pathname.endsWith("/sign-up");
  const navigationItems = navigation[locale];

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    function handleScroll() {
      setDocked(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthRoute]);

  if (isAuthRoute) {
    return null;
  }

  return (
    <header
      className="header__root__SW0ed"
      data-docked={docked ? "true" : undefined}
    >
      <div className="header__nav__SW0ee">
        <div className="header__content__SW0ef">
          <Link className="brand__link__SW0eg" href={`/${locale}`}>
            <SnnLogo />
          </Link>

          <nav aria-label="Primary" className="header__links__SW0eh">
            {navigationItems.map((item) => (
              <Link
                className="nav__link__SW0ek"
                href={`/${locale}${item.href}` as Route}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions__SW0ei">
            <div className="action__links__SW0el">
              <Link
                aria-label="Favorites"
                className="action__button__SW0em"
                href={`/${locale}/sign-in` as Route}
              >
                <HeartIcon className="header__icon__SW0en" />
              </Link>
              <Link
                aria-label="Bag"
                className="action__button__SW0em"
                href={`/${locale}/sign-up` as Route}
              >
                <ShoppingBagIcon className="header__icon__SW0en" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
