import type { ReactNode } from "react";

import { Heading, Link } from "@snn/ui";

import {
  AuthBrandCarousel,
  type AuthBrandStatement,
} from "./auth-brand-carousel";

type AuthPageProps = {
  brandFooter: string;
  brandPresentation?: "default" | "quote";
  brandStatements: AuthBrandStatement[];
  brandTitle: string;
  children: ReactNode;
  finePrint: ReactNode;
  secondaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionText: string;
  title: string;
};

export type AuthField = {
  autoComplete?: string;
  label: string;
  maxLength?: number;
  minLength?: number;
  name: string;
  placeholder?: string;
  type?: string;
};

export function AuthPage({
  brandFooter,
  brandPresentation = "default",
  brandStatements,
  brandTitle,
  children,
  finePrint,
  secondaryActionHref,
  secondaryActionLabel,
  secondaryActionText,
  title,
}: AuthPageProps) {
  return (
    <main className="auth__shell__SW0fd">
      <aside className="brand__panel__SW0fe" aria-label={brandTitle}>
        <AuthBrandCarousel
          fallbackTitle={brandTitle}
          footer={brandFooter}
          statements={brandStatements}
          variant={brandPresentation}
        />
      </aside>

      <section className="auth__panel__SW0ff" aria-labelledby="auth-title">
        <div className="auth__card-frame__SW0fm">
          <div className="auth__card__SW0fn">
            <div className="auth__header__SW0fo">
              <p className="helper__copy__SW0fq">
                {secondaryActionText}{" "}
                <Link href={secondaryActionHref} variant="underline">
                  {secondaryActionLabel}
                </Link>
              </p>
              <Heading as="h2" id="auth-title">{title}</Heading>
            </div>

            {children}
            <p className="legal__copy__SW0fy">{finePrint}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
