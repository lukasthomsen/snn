import type { Metadata } from "next";
import type { ReactNode } from "react";

import { isLocale, type Locale } from "@snn/i18n";

type PrivacyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type PrivacySection = {
  body: ReactNode;
  title: string;
};

const cloudflareTurnstilePrivacyURL =
  "https://www.cloudflare.com/cloudflare-customer-turnstile-terms/";

const privacyContent: Record<Locale, {
  intro: string;
  sections: PrivacySection[];
  title: string;
  updated: string;
}> = {
  da: {
    intro:
      "Denne meddelelse forklarer, hvordan SNN behandler oplysninger, når du bruger butikken, opretter konto, handler, tilmelder dig e-mail eller kontakter os.",
    sections: [
      {
        title: "Oplysninger vi behandler",
        body:
          "Vi behandler de oplysninger, du giver os, herunder navn, e-mailadresse, leveringsoplysninger, ordreoplysninger, kontoindstillinger og henvendelser til support.",
      },
      {
        title: "Konto, ordrer og betaling",
        body:
          "Konto- og ordredata bruges til at levere butiksfunktioner, opfylde køb, håndtere returneringer, beskytte kontoen og overholde bogførings- og forbrugerretlige krav. Kortbetalinger håndteres af vores betalingsudbyder, og SNN gemmer ikke fulde kortnumre.",
      },
      {
        title: "Sikkerhed og misbrugsbeskyttelse",
        body: (
          <>
            Vi bruger Cloudflare Turnstile på udvalgte formularer for at beskytte mod spam,
            automatiseret misbrug og uautoriserede loginforsøg. Turnstile kan behandle
            browser- og enhedssignaler for at afgøre, om en sikkerhedskontrol kan gennemføres
            i baggrunden. Se Cloudflares{" "}
            <a href={cloudflareTurnstilePrivacyURL} rel="noreferrer" target="_blank">
              Turnstile Privacy Addendum
            </a>
            .
          </>
        ),
      },
      {
        title: "Dine rettigheder",
        body:
          "Du kan anmode om indsigt, rettelse, sletning eller begrænsning af dine oplysninger. Log ind på din konto for at sende en privatlivsanmodning, eller kontakt os via de supportkanaler, der er angivet i butikken.",
      },
    ],
    title: "Privatlivsmeddelelse",
    updated: "Senest opdateret 21. maj 2026",
  },
  en: {
    intro:
      "This notice explains how SNN processes information when you use the store, create an account, place an order, sign up for email, or contact us.",
    sections: [
      {
        title: "Information we process",
        body:
          "We process information you provide to us, including name, email address, shipping details, order details, account settings, and support messages.",
      },
      {
        title: "Account, orders, and payment",
        body:
          "Account and order data is used to provide store features, fulfil purchases, handle returns, protect accounts, and comply with accounting and consumer-law requirements. Card payments are handled by our payment provider, and SNN does not store full card numbers.",
      },
      {
        title: "Security and abuse prevention",
        body: (
          <>
            We use Cloudflare Turnstile on selected forms to protect against spam,
            automated abuse, and unauthorized sign-in attempts. Turnstile may process
            browser and device signals to decide whether a security check can run in
            the background. See Cloudflare&apos;s{" "}
            <a href={cloudflareTurnstilePrivacyURL} rel="noreferrer" target="_blank">
              Turnstile Privacy Addendum
            </a>
            .
          </>
        ),
      },
      {
        title: "Your rights",
        body:
          "You can request access, correction, deletion, or restriction of your information. Sign in to your account to send a privacy request, or contact us through the support channels listed in the store.",
      },
    ],
    title: "Privacy Notice",
    updated: "Last updated May 21, 2026",
  },
};

export const metadata: Metadata = {
  title: "Privacy Notice | SNN",
};

export const revalidate = 3600;

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const copy = privacyContent[safeLocale];

  return (
    <main className="legalPage__root__SW7a0" data-perf-ready="true" data-perf-surface="privacy">
      <section className="legalPage__section__SW7a1">
        <p className="legalPage__eyebrow__SW7a2">{copy.updated}</p>
        <h1>{copy.title}</h1>
        <p className="legalPage__intro__SW7a3">{copy.intro}</p>
        <div className="legalPage__content__SW7a4">
          {copy.sections.map((section) => (
            <section className="legalPage__block__SW7a5" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
