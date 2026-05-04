import type { ReactNode } from "react";

import { Button, TextField } from "@snn/ui";

import {
  AuthBrandCarousel,
  type AuthBrandStatement,
} from "./auth-brand-carousel";
import { AuthProviderButtons } from "./auth-provider-buttons";

type AuthField = {
  autoComplete: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "email" | "password" | "text";
};

type AuthPageProps = {
  appleLabel: string;
  body: string;
  brandFooter: string;
  brandStatements: AuthBrandStatement[];
  brandTitle: string;
  callbackURL: string;
  dividerText: string;
  fields: AuthField[];
  finePrint: ReactNode;
  googleLabel: string;
  primaryAction: string;
  secondaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionText: string;
  title: string;
};

export function AuthPage({
  appleLabel,
  body,
  brandFooter,
  brandStatements,
  brandTitle,
  callbackURL,
  dividerText,
  fields,
  finePrint,
  googleLabel,
  primaryAction,
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
              <h3 id="auth-title">{title}</h3>
              <p className="auth__copy__SW0fr">{body}</p>
            </div>

            <AuthProviderButtons
              appleLabel={appleLabel}
              callbackURL={callbackURL}
              googleLabel={googleLabel}
            />

            <div className="auth-divider__root__SW0fv">
              <span />
              <p>{dividerText}</p>
              <span />
            </div>

            <form className="auth__form__SW0fp" noValidate>
              {fields.map((field) => (
                <TextField
                  autoComplete={field.autoComplete}
                  fullWidth
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  size="md"
                  type={field.type ?? "text"}
                />
              ))}

              <Button
                className="submit__button__SW0fx"
                fullWidth
                size="lg"
                type="button"
              >
                <span>{primaryAction}</span>
                <span aria-hidden="true">→</span>
              </Button>
            </form>

            <p className="legal__copy__SW0fy">{finePrint}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
