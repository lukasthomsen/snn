import Link from "next/link";

import {
  MailPlusIcon,
  NewspaperIcon,
} from "@snn/ui";

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
      { href: "#footer", label: "Handelsbetingelser" },
      { href: "#footer", label: "Brugsvilkår" },
      { href: "/privacy", label: "Privatlivsmeddelelse" },
      { href: "#footer", label: "Cookiepolitik" },
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
      { href: "#footer", label: "Terms & Conditions" },
      { href: "#footer", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Notice" },
      { href: "#footer", label: "Cookie Policy" },
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

export function StorefrontFooter({ locale }: StorefrontFooterProps) {
  const content = footerContent[locale];

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
                title={(
                  <span className="footer-card__heading__SW4f5">
                    <NewspaperIcon
                      aria-hidden="true"
                      size={15}
                    />
                    {content.cards.blog.title}
                  </span>
                )}
              />
              <a
                className="storefront-card__root__SW3c0 footer-card__button__SW4f6"
                href={`/${locale}#newsletter-signup`}
              >
                <span className="storefront-card__copy__SW3c2">
                  <strong>
                    <span className="footer-card__heading__SW4f5">
                      <MailPlusIcon
                        aria-hidden="true"
                        size={15}
                      />
                      {content.cards.email.title}
                    </span>
                  </strong>
                  <span>{content.cards.email.copy}</span>
                </span>
              </a>
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
                <SocialIcon icon={social.icon} />
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-meta__root__SW0ex">
          <p>{content.copyright}</p>
          <div className="footer-meta__links__SW0ey">
            {content.legal.map((item) => (
              <Link
                className="footer__link__SW0ew"
                href={`/${locale}${item.href}`}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="country__picker__SW0ez" aria-label={content.countryLabel}>
            {languageOptions.map((option) => (
              <Link
                className="language-menu__option__SW4b3"
                data-selected={option.locale === locale ? "true" : undefined}
                href={`/${option.locale}`}
                key={option.locale}
              >
                <span
                  className="language-menu__flag__SW4b5"
                  data-locale={option.locale}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  icon,
}: {
  icon: typeof socialLinks[number]["icon"];
}) {
  if (icon === "youtube") {
    return (
      <svg aria-hidden="true" className="footer-social__icon__SW4f3" viewBox="0 0 24 24">
        <path d="M21.4 7.2a3 3 0 0 0-2.1-2.1C17.5 4.6 12 4.6 12 4.6s-5.5 0-7.3.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2.1 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.3.5 7.3.5s5.5 0 7.3-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "facebook") {
    return (
      <svg aria-hidden="true" className="footer-social__icon__SW4f3" viewBox="0 0 24 24">
        <path d="M14 8.4V6.8c0-.8.5-1.2 1.3-1.2h1.6V2.8c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.1v1.7H7.8v3.2h2.6v8.1H14v-8.1h2.5l.4-3.2H14Z" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "tiktok") {
    return (
      <svg aria-hidden="true" className="footer-social__icon__SW4f3" viewBox="0 0 24 24">
        <path d="M15.7 2.8c.4 2.4 1.8 3.8 4.1 4v3.4a7.5 7.5 0 0 1-4-1.1v5.7c0 3.2-2.2 5.9-5.6 5.9a5.4 5.4 0 0 1-5.7-5.5c0-3.3 2.7-5.7 6.1-5.5v3.5c-1.6-.2-2.7.7-2.7 2 0 1.2.9 2 2.1 2 1.4 0 2.2-.9 2.2-2.5V2.8h3.5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="footer-social__icon__SW4f3" viewBox="0 0 24 24">
      <path d="M5.3 8.3H2.2v11.1h3.1V8.3ZM3.8 3.1a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm15.9 9.9c0-3.3-1.8-4.9-4.1-4.9a3.5 3.5 0 0 0-3.1 1.7V8.3h-3v11.1h3.1v-5.5c0-1.5.8-2.5 2.1-2.5 1.2 0 1.9.8 1.9 2.4v5.6h3.1V13Z" fill="currentColor" />
    </svg>
  );
}
