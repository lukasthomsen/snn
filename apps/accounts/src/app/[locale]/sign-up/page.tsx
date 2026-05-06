import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  getStorefrontFooterURL,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthPage } from "../components/auth-page";
import { SignUpForm } from "../components/sign-up-form";
import { SocialAuthButtons } from "../components/social-auth-buttons";

type SignUpPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const signUpCopy = {
  da: {
    appleLabel: "Fortsæt med Apple",
    body: "Opret en konto for at komme i gang.",
    brandFooter: "2026 SNN. Alle rettigheder forbeholdes.",
    brandStatements: [
      {
        statement: "Bygget til den daglige stack.",
        substatement: "Daglige essentials til styrke, restitution og stabil performance.",
      },
      {
        statement: "Skarp fra første scoop.",
        substatement: "Rene formler, der holder rutinen enkel, fokuseret og nem at gentage.",
      },
      {
        statement: "Klar når du er.",
        substatement: "Restitution, energi og basics, der passer ind i den rytme du allerede har.",
      },
    ],
    brandTitle: "Bygget til den daglige stack.",
    dividerText: "eller fortsæt med",
    emailLabel: "E-mailadresse",
    emailPlaceholder: "dig@example.com",
    messages: {
      disabled: "Kontooprettelse er midlertidigt slået fra, mens vi bygger autentificeringen op igen.",
      mismatch: "Adgangskoderne skal være ens.",
      passwordLength: "Adgangskoden skal være mellem 15 og 128 tegn.",
      required: "Navn, e-mail og adgangskode er påkrævet.",
    },
    googleLabel: "Fortsæt med Google",
    nameLabel: "Navn",
    namePlaceholder: "Dit navn",
    passwordConfirmLabel: "Bekræft adgangskode",
    passwordConfirmPlaceholder: "Gentag adgangskoden",
    passwordLabel: "Adgangskode",
    passwordPlaceholder: "Opret en adgangskode",
    primaryAction: "Opret konto",
    secondaryActionLabel: "Log ind",
    secondaryActionText: "Har du allerede en konto?",
    title: "Join us!",
  },
  en: {
    appleLabel: "Continue with Apple",
    body: "Create an account to get started.",
    brandFooter: "2026 SNN. All rights reserved.",
    brandStatements: [
      {
        statement: "Built for the daily stack.",
        substatement: "Daily essentials for strength, recovery, and steady performance.",
      },
      {
        statement: "Sharp from the first scoop.",
        substatement: "Clean formulas that keep the routine simple, focused, and easy to repeat.",
      },
      {
        statement: "Ready when you are.",
        substatement: "Recovery, energy, and basics that fit the rhythm you already live in.",
      },
    ],
    brandTitle: "Built for the daily stack.",
    dividerText: "or continue with",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    messages: {
      disabled: "Account creation is temporarily disabled while we rebuild authentication.",
      mismatch: "Passwords must match.",
      passwordLength: "Password must be between 15 and 128 characters.",
      required: "Name, email, and password are required.",
    },
    googleLabel: "Continue with Google",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    passwordConfirmLabel: "Confirm password",
    passwordConfirmPlaceholder: "Repeat password",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    primaryAction: "Create account",
    secondaryActionLabel: "Sign in",
    secondaryActionText: "Already have an account?",
    title: "Join us!",
  },
} as const;

export default async function SignUpPage({
  params,
  searchParams,
}: SignUpPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = signUpCopy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const storefrontFooterURL = getStorefrontFooterURL(safeLocale);

  return (
    <AuthPage
      body={copy.body}
      brandFooter={copy.brandFooter}
      brandStatements={[...copy.brandStatements]}
      brandTitle={copy.brandTitle}
      finePrint={
        <>
          {safeLocale === "da"
            ? "Ved at oprette en konto accepterer du vores "
            : "By creating an account, you agree to our "}
          <a href={storefrontFooterURL}>
            {safeLocale === "da" ? "vilkår" : "terms"}
          </a>
          {safeLocale === "da" ? " og " : " and "}
          <a href={storefrontFooterURL}>
            {safeLocale === "da" ? "privatlivspolitik" : "privacy policy"}
          </a>
          .
        </>
      }
      secondaryActionHref={getAccountAuthPath(safeLocale, "sign-in", callbackURL)}
      secondaryActionLabel={copy.secondaryActionLabel}
      secondaryActionText={copy.secondaryActionText}
      title={copy.title}
    >
      <SocialAuthButtons
        appleLabel={copy.appleLabel}
        disabledMessage={copy.messages.disabled}
        googleLabel={copy.googleLabel}
      />

      <div className="auth-divider__root__SW0fv">
        <span />
        <p>{copy.dividerText}</p>
        <span />
      </div>

      <SignUpForm
        confirmPasswordLabel={copy.passwordConfirmLabel}
        confirmPasswordPlaceholder={copy.passwordConfirmPlaceholder}
        emailLabel={copy.emailLabel}
        emailPlaceholder={copy.emailPlaceholder}
        messages={{
          disabled: copy.messages.disabled,
          mismatch: copy.messages.mismatch,
          passwordLength: copy.messages.passwordLength,
          required: copy.messages.required,
        }}
        nameLabel={copy.nameLabel}
        namePlaceholder={copy.namePlaceholder}
        passwordLabel={copy.passwordLabel}
        passwordPlaceholder={copy.passwordPlaceholder}
        primaryAction={copy.primaryAction}
      />
    </AuthPage>
  );
}
