import { isLocale } from "@snn/i18n";

import {
  getAccountAuthURL,
  getAccountAuthPath,
  getStorefrontFooterURL,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthPage } from "../components/auth-page";

type SignUpPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
    googleLabel: "Fortsæt med Google",
    passwordConfirmLabel: "Bekræft adgangskode",
    passwordConfirmPlaceholder: "Gentag adgangskoden",
    passwordLabel: "Adgangskode",
    passwordPlaceholder: "Opret en adgangskode",
    primaryAction: "Opret konto",
    secondaryActionLabel: "Log ind",
    secondaryActionText: "Har du allerede en konto?",
    title: "Join us!",
    verificationCopy: "Tjek din indbakke for at bekræfte din e-mailadresse.",
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
    googleLabel: "Continue with Google",
    passwordConfirmLabel: "Confirm password",
    passwordConfirmPlaceholder: "Repeat password",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    primaryAction: "Create account",
    secondaryActionLabel: "Sign in",
    secondaryActionText: "Already have an account?",
    title: "Join us!",
    verificationCopy: "Check your inbox to verify your email address.",
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
  const verificationCallbackURL = getAccountAuthURL(safeLocale, "verify-email", callbackURL);

  return (
    <AuthPage
      appleLabel={copy.appleLabel}
      body={copy.body}
      brandFooter={copy.brandFooter}
      brandStatements={[...copy.brandStatements]}
      brandTitle={copy.brandTitle}
      callbackURL={callbackURL}
      dividerText={copy.dividerText}
      fields={[
        {
          autoComplete: "email",
          label: copy.emailLabel,
          name: "email",
          placeholder: copy.emailPlaceholder,
          type: "email",
        },
        {
          autoComplete: "new-password",
          label: copy.passwordLabel,
          maxLength: 128,
          minLength: 15,
          name: "password",
          placeholder: copy.passwordPlaceholder,
          type: "password",
        },
        {
          autoComplete: "new-password",
          label: copy.passwordConfirmLabel,
          maxLength: 128,
          minLength: 15,
          name: "confirmPassword",
          placeholder: copy.passwordConfirmPlaceholder,
          type: "password",
        },
      ]}
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
      googleLabel={copy.googleLabel}
      mode="sign-up"
      primaryAction={copy.primaryAction}
      secondaryActionHref={getAccountAuthPath(safeLocale, "sign-in", callbackURL)}
      secondaryActionLabel={copy.secondaryActionLabel}
      secondaryActionText={copy.secondaryActionText}
      title={copy.title}
      twoFactorHref={getAccountAuthPath(safeLocale, "two-factor", callbackURL)}
      verificationCallbackURL={verificationCallbackURL}
      verificationCopy={copy.verificationCopy}
    />
  );
}
