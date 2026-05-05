import type { ReactNode } from "react";

import {
  AuthBrandCarousel,
  type AuthBrandStatement,
} from "./auth-brand-carousel";
import { AuthEmailForm } from "./auth-email-form";
import { AuthProviderButtons } from "./auth-provider-buttons";

export type AuthField = {
  autoComplete: string;
  label: string;
  maxLength?: number | undefined;
  minLength?: number | undefined;
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
  forgotPasswordHref?: string | undefined;
  forgotPasswordLabel?: string | undefined;
  googleLabel: string;
  mode: "sign-in" | "sign-up";
  passkeyLabel?: string | undefined;
  primaryAction: string;
  secondaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionText: string;
  title: string;
  twoFactorHref: string;
  verificationCallbackURL?: string | undefined;
  verificationCopy: string;
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
  forgotPasswordHref,
  forgotPasswordLabel,
  googleLabel,
  mode,
  passkeyLabel,
  primaryAction,
  secondaryActionHref,
  secondaryActionLabel,
  secondaryActionText,
  title,
  twoFactorHref,
  verificationCallbackURL,
  verificationCopy,
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
              passkeyLabel={passkeyLabel}
            />

            <div className="auth-divider__root__SW0fv">
              <span />
              <p>{dividerText}</p>
              <span />
            </div>

            <AuthEmailForm
              callbackURL={callbackURL}
              fields={fields}
              forgotPasswordHref={forgotPasswordHref}
              forgotPasswordLabel={forgotPasswordLabel}
              mode={mode}
              primaryAction={primaryAction}
              twoFactorHref={twoFactorHref}
              verificationCallbackURL={verificationCallbackURL}
              verificationCopy={verificationCopy}
            />

            <p className="legal__copy__SW0fy">{finePrint}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
