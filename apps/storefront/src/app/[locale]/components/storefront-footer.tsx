"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@snn/ui";

type StorefrontFooterProps = {
  locale: "da" | "en";
};

type CountryCode = "DK" | "DE" | "INT";

const footerContent = {
  da: {
    columns: [
      {
        groups: [
          {
            heading: "Shop",
            links: ["Nyheder", "Kampagner", "Kommer snart", "Journal"],
          },
          {
            heading: "Lær",
            links: ["Startguide", "Ingrediensnoter", "Research notes"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Konto",
            links: ["Log ind", "Opret konto", "Medlemskab", "Belønninger"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Support",
            links: ["Hjælpcenter", "Fragt", "Returneringer", "Kontakt support", "Handelsvilkår"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Standarder",
            links: ["Ingrediensstandarder", "Testning", "Brugsnoter", "FAQ"],
          },
          {
            heading: "Journal",
            links: ["Fokus", "Restitution", "Bevægelse"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Virksomhed",
            links: ["Om SNN", "Karriere", "Presse", "Bæredygtighed"],
          },
          {
            heading: "Juridisk",
            links: ["Privatlivspolitik", "Servicevilkår", "Cookiepolitik", "Tilgængelighed"],
          },
        ],
      },
    ],
    legal: ["Privatlivspolitik", "Brugsvilkår", "Salg og refusion", "Juridisk", "Sitemap"],
    countryLabel: "Danmark",
    countryNote: "Vises på Dansk",
    copyright: "Copyright © 2026 SNN. Alle rettigheder forbeholdes.",
    countryDescription: "Vælg det land og sprog, som storefronten skal vises i.",
  },
  en: {
    columns: [
      {
        groups: [
          {
            heading: "Shop",
            links: ["New arrivals", "Campaigns", "Coming soon", "Journal"],
          },
          {
            heading: "Learn",
            links: ["Start guide", "Ingredient notes", "Research notes"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Account",
            links: ["Sign in", "Create account", "Membership", "Rewards"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Support",
            links: ["Help center", "Shipping", "Returns", "Contact support", "Store policies"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Standards",
            links: ["Ingredient standards", "Testing", "Usage notes", "FAQ"],
          },
          {
            heading: "Journal",
            links: ["Focus", "Recovery", "Movement"],
          },
        ],
      },
      {
        groups: [
          {
            heading: "Company",
            links: ["About SNN", "Careers", "Press", "Sustainability"],
          },
          {
            heading: "Legal",
            links: ["Privacy Policy", "Terms of service", "Cookie policy", "Accessibility"],
          },
        ],
      },
    ],
    legal: ["Privacy Policy", "Terms", "Sales & refunds", "Legal", "Sitemap"],
    countryLabel: "Denmark",
    countryNote: "Shown in English",
    copyright: "Copyright © 2026 SNN. All rights reserved.",
    countryDescription: "Choose which country and storefront language to display.",
  },
} as const;

const countryOptions = {
  da: [
    { code: "DK", label: "Danmark", note: "Dansk" },
    { code: "DE", label: "Deutschland", note: "Deutsch" },
    { code: "INT", label: "International", note: "English" },
  ],
  en: [
    { code: "DK", label: "Denmark", note: "Danish" },
    { code: "DE", label: "Germany", note: "German" },
    { code: "INT", label: "International", note: "English" },
  ],
} as const;

export function StorefrontFooter({ locale }: StorefrontFooterProps) {
  const pathname = usePathname();
  const content = footerContent[locale];
  const options = countryOptions[locale];
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(options[0].code);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isAuthRoute = pathname.endsWith("/sign-in") || pathname.endsWith("/sign-up");

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isAuthRoute]);

  if (isAuthRoute) {
    return null;
  }

  return (
    <footer className="footer__root__SW0ep" id="footer">
      <div className="footer__inner__SW0eq">
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

        <div className="footer-meta__root__SW0ex">
          <p>{content.copyright}</p>
          <div className="footer-meta__links__SW0ey">
            {content.legal.map((item) => (
              <Link className="footer__link__SW0ew" href={`/${locale}#hero`} key={item}>
                {item}
              </Link>
            ))}
          </div>
          <div className="country__picker__SW0ez" ref={rootRef}>
            <button
              aria-expanded={open}
              className="country-trigger__root__SW0f0"
              onClick={() => {
                setOpen((current) => !current);
              }}
              type="button"
            >
              <span className="country-trigger__icon__SW0f1">
                <GlobeIcon className="footer__icon__SW0eo" />
              </span>
              <span className="country-trigger__copy__SW0f3">
                <span>{content.countryLabel}</span>
                <span>{content.countryNote}</span>
              </span>
              <span className="country-trigger__chevron__SW0f2">
                <ChevronDownIcon className="footer__icon__SW0eo" />
              </span>
            </button>

            {open ? (
              <div className="country__popover__SW0f4">
                <div className="country__dialog__SW0f5">
                  <div className="country__header__SW0f6">
                    <p className="country__description__SW0f8">
                      {content.countryDescription}
                    </p>
                  </div>
                  <div className="country__body__SW0f7">
                    <div className="country__list__SW0f9">
                      {options.map((option) => (
                        <button
                          className="country-option__root__SW0fa"
                          data-selected={selectedCountry === option.code ? "true" : undefined}
                          key={option.code}
                          onClick={() => {
                            setSelectedCountry(option.code);
                            setOpen(false);
                          }}
                          type="button"
                        >
                          <span className="country-option__copy__SW0fb">
                            <span>{option.label}</span>
                            <span>{option.note}</span>
                          </span>
                          <span className="country-option__icon__SW0fc">
                            {selectedCountry === option.code ? (
                              <CheckIcon className="footer__icon__SW0eo" />
                            ) : null}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
