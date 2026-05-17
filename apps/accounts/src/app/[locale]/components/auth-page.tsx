import type { ReactNode } from "react";

import {
  AuthBrandCarousel,
  type AuthBrandStatement,
} from "./auth-brand-carousel";

type AuthPageProps = {
  brandFooter: string;
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
        />
      </aside>

      <section className="auth__panel__SW0ff" aria-labelledby="auth-title">
        <div className="auth__card-frame__SW0fm">
          <div className="auth__card__SW0fn">
            <div className="auth__header__SW0fo">
              <p className="helper__copy__SW0fq">
                {secondaryActionText}{" "}
                <a
                  className="inline__link__SW0fw"
                  href={secondaryActionHref}
                >
                  {secondaryActionLabel}
                </a>
              </p>
              <h1 id="auth-title">{title}</h1>
            </div>

            {children}
            <p className="legal__copy__SW0fy">{finePrint}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
