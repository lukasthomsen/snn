"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  GlobeIcon,
  ListBox,
  MailPlusIcon,
  NewspaperIcon,
  Popover,
} from "@snn/ui";

import { useNewsletterSignup } from "./newsletter-signup";
import { StorefrontCard } from "./storefront-card";

type StorefrontFooterProps = {
  locale: "da" | "en";
};

type LanguageOption = {
  label: string;
  locale: "da" | "en";
};

const footerContent = {
  da: {
    columns: [
      {
        groups: [
          {
            heading: "Shop",
            links: [
              "Nyheder",
              "Kampagner",
              "Kommer snart",
              "Gavekort",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Lær",
            links: [
              "Startguide",
              "Ingrediensnoter",
              "Research notes",
              "Blog",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Konto",
            links: [
              "Log ind",
              "Opret konto",
              "Medlemskab",
              "Belønninger",
              "Ordrer",
              "Ønskeliste",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Support",
            links: [
              "Hjælpcenter",
              "Fragt og levering",
              "Returnering og refusion",
              "Reklamation og garanti",
              "Kontakt support",
            ],
          },
        ],
      },
    ],
    legal: [
      "Handelsbetingelser",
      "Brugsvilkår",
      "Privatlivsmeddelelse",
      "Cookiepolitik",
    ],
    countryLabel: "Danmark",
    copyright: "Copyright © 2026 SNN. Alle rettigheder forbeholdes.",
    footerHighlights: [
      "Fri fragt over 550 DKK",
      "30 dages returret",
      "Sikker betaling",
    ],
    moreHeading: "Mere om SNN",
    socialHeading: "Følg med",
    cards: {
      blog: {
        copy: "Guides, rutiner og ingrediensnoter til hverdagen.",
        title: "Blog",
      },
      email: {
        copy: "Lanceringer, restocks og din velkomstkode.",
        title: "E-mail tilmelding",
      },
    },
  },
  en: {
    columns: [
      {
        groups: [
          {
            heading: "Shop",
            links: [
              "New arrivals",
              "Campaigns",
              "Coming soon",
              "Gift cards",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Learn",
            links: [
              "Start guide",
              "Ingredient notes",
              "Research notes",
              "Blog",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Account",
            links: [
              "Sign in",
              "Create account",
              "Membership",
              "Rewards",
              "Orders",
              "Wishlist",
            ],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Support",
            links: [
              "Help center",
              "Shipping & Delivery",
              "Returns & Refunds",
              "Warranty & Complaints",
              "Contact support",
            ],
          },
        ],
      },
    ],
    legal: [
      "Terms & Conditions",
      "Terms of Use",
      "Privacy Notice",
      "Cookie Policy",
    ],
    countryLabel: "Denmark",
    copyright: "Copyright © 2026 SNN. All rights reserved.",
    footerHighlights: [
      "Free shipping over 550 DKK",
      "30-day returns",
      "Secure checkout",
    ],
    moreHeading: "More about SNN",
    socialHeading: "Follow along",
    cards: {
      blog: {
        copy: "Guides, routines, and ingredient notes for everyday use.",
        title: "Blog",
      },
      email: {
        copy: "Launches, restocks, and your welcome code.",
        title: "Email Sign Up",
      },
    },
  },
} as const;

const languageOptions: readonly [LanguageOption, LanguageOption] = [
  { label: "Dansk", locale: "da" },
  { label: "English", locale: "en" },
];

const socialLinks = [
  {
    icon: "youtube",
    label: "YouTube",
  },
  {
    icon: "facebook",
    label: "Facebook",
  },
  {
    icon: "tiktok",
    label: "TikTok",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
  },
] as const;

function getLanguageHref(pathname: string, targetLocale: "da" | "en") {
  const segments = pathname.split("/");

  if (segments[1] === "da" || segments[1] === "en") {
    segments[1] = targetLocale;

    return segments.join("/") || `/${targetLocale}`;
  }

  return `/${targetLocale}`;
}

export function StorefrontFooter({ locale }: StorefrontFooterProps) {
  const pathname = usePathname();
  const content = footerContent[locale];
  const [open, setOpen] = useState(false);
  const { openNewsletterSignup } = useNewsletterSignup();
  const isAuthRoute = pathname.endsWith("/sign-in") || pathname.endsWith("/sign-up");

  if (isAuthRoute) {
    return null;
  }

  return (
    <footer className="footer__root__SW0ep" id="footer">
      <div className="footer__inner__SW0eq">
        <div className="footer__primary__SW2f0">
          <div className="footer__columns__SW0er">
            {content.columns.map((column, columnIndex) => (
              <div className="footer__column__SW0es" key={`column-${columnIndex + 1}`}>
                {column.groups.map((group) => (
                  <div className="footer-group__root__SW0et" key={group.heading}>
                    <h2 className="footer-group__title__SW0ev">{group.heading}</h2>
                    <div className="footer-group__links__SW0eu">
                      {group.links.map((link) => (
                        <Link
                          className="footer__link__SW0ew"
                          href={`/${locale}#hero`}
                          key={link}
                        >
                          {link}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="storefront-card__section__SW3c5">
            <h2 className="footer-group__title__SW0ev">{content.moreHeading}</h2>
            <div className="storefront-card__grid__SW3c4">
              <StorefrontCard
                description={content.cards.blog.copy}
                href={`/${locale}#hero`}
                showChevron={false}
                size="small"
                title={
                    <span className="footer-card__heading__SW4f5">
                      <NewspaperIcon
                        aria-hidden="true"
                        size={15}
                      />
                      {content.cards.blog.title}
                    </span>
                }
              />
              <StorefrontCard
                description={content.cards.email.copy}
                onClick={openNewsletterSignup}
                showChevron={false}
                size="small"
                title={
                    <span className="footer-card__heading__SW4f5">
                      <MailPlusIcon
                        aria-hidden="true"
                        size={15}
                      />
                    {content.cards.email.title}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        <div className="footer-social__root__SW4f0">
          <div className="footer-social__copy__SW4f4">
            {content.footerHighlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="footer-social__links__SW4f1" aria-label={content.socialHeading}>
            {socialLinks.map((social) => (
              <Link
                aria-label={social.label}
                className="footer-social__link__SW4f2"
                href={`/${locale}#hero`}
                key={social.label}
              >
                <span
                  aria-hidden="true"
                  className="footer-social__icon__SW4f3"
                  data-icon={social.icon}
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-meta__root__SW0ex">
          <p>{content.copyright}</p>
          <div className="footer-meta__links__SW0ey">
            {content.legal.map((item) => (
              <Link className="footer__link__SW0ew" href={`/${locale}#hero`} key={item}>
                {item}
              </Link>
            ))}
          </div>
          <div className="country__picker__SW0ez">
            <Popover
              isOpen={open}
              onOpenChange={setOpen}
              placement="top"
              trigger={(
                <>
                  <span className="country-trigger__icon__SW0f1">
                    <GlobeIcon className="footer__icon__SW0eo" />
                  </span>
                  <span className="country-trigger__copy__SW0f3">
                    {content.countryLabel}
                  </span>
                </>
              )}
              triggerLabel={content.countryLabel}
              variant="text"
            >
              <ListBox aria-label="Language" selectedKey={locale}>
                {languageOptions.map((option) => {
                  const selected = option.locale === locale;

                  return (
                    <Link
                      className="language-menu__option__SW4b3"
                      data-selected={selected ? "true" : undefined}
                      href={getLanguageHref(pathname, option.locale) as Route}
                      key={option.locale}
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      <span
                        className="language-menu__flag__SW4b5"
                        data-locale={option.locale}
                        aria-hidden="true"
                      />
                      <span>{option.label}</span>
                    </Link>
                  );
                })}
              </ListBox>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  );
}
