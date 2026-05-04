import type { Route } from "next";
import Link from "next/link";

import { isLocale } from "@snn/i18n";

type StorefrontPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const pageContent = {
  da: {
    body:
      "Daglige blends til fokus, bevægelse og restitution. Lavet til rutiner, der skal føles lette.",
    ctaPrimary: "Shop",
    intro: "SNN Daily Blend",
    title: "Stabil energi. Roligere dage.",
  },
  en: {
    body:
      "Daily blends for focus, movement, and recovery. Built for routines that should feel easy.",
    ctaPrimary: "Shop",
    intro: "SNN Daily Blend",
    title: "Steady energy. Softer days.",
  },
} as const;

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = pageContent[safeLocale];

  return (
    <main className="home__root__SW0fz">
      <section className="hero__section__SW0g0" id="hero">
        <div className="hero__stage__SW0g1">
          <div className="hero__inner__SW0g2">
            <div className="hero__copy__SW0g3">
              <p className="hero__intro__SW0g4">{copy.intro}</p>
              <h1 className="hero__title__SW0g5">{copy.title}</h1>
              <p className="hero__body__SW0g6">{copy.body}</p>
              <div className="hero__actions__SW0g7">
                <Link
                  className="hero__primary__SW0g8"
                  href={`/${safeLocale}/sign-up` as Route}
                >
                  {copy.ctaPrimary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
