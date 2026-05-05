import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  getStorefrontFooterURL,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthPage } from "../components/auth-page";

type SignInPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const signInCopy = {
  da: {
    appleLabel: "Fortsæt med Apple",
    body: "Log ind for at holde din rutine samlet og klar.",
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
    passkeyLabel: "Log ind med passkey",
    forgotPasswordLabel: "Glemt adgangskode?",
    passwordLabel: "Adgangskode",
    passwordPlaceholder: "Indtast din adgangskode",
    primaryAction: "Log ind",
    secondaryActionLabel: "Opret en",
    secondaryActionText: "Har du brug for en konto?",
    title: "Welcome back!",
    verificationCopy: "Vi har sendt et bekræftelseslink, hvis kontoen findes og skal bekræftes.",
  },
  en: {
    appleLabel: "Continue with Apple",
    body: "Sign in to keep your routine organized and ready.",
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
    passkeyLabel: "Sign in with passkey",
    forgotPasswordLabel: "Forgot password?",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    primaryAction: "Sign in",
    secondaryActionLabel: "Create one",
    secondaryActionText: "Need an account?",
    title: "Welcome back!",
    verificationCopy: "We sent a verification link if the account exists and needs verification.",
  },
} as const;

export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = signInCopy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const storefrontFooterURL = getStorefrontFooterURL(safeLocale);

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
          autoComplete: "current-password",
          label: copy.passwordLabel,
          name: "password",
          placeholder: copy.passwordPlaceholder,
          type: "password",
        },
      ]}
      finePrint={
        <>
          {safeLocale === "da"
            ? "Ved at logge ind accepterer du vores "
            : "By signing in, you agree to our "}
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
      forgotPasswordHref={getAccountAuthPath(safeLocale, "forgot-password", callbackURL)}
      forgotPasswordLabel={copy.forgotPasswordLabel}
      mode="sign-in"
      passkeyLabel={copy.passkeyLabel}
      primaryAction={copy.primaryAction}
      secondaryActionHref={getAccountAuthPath(safeLocale, "sign-up", callbackURL)}
      secondaryActionLabel={copy.secondaryActionLabel}
      secondaryActionText={copy.secondaryActionText}
      title={copy.title}
      twoFactorHref={getAccountAuthPath(safeLocale, "two-factor", callbackURL)}
      verificationCopy={copy.verificationCopy}
    />
  );
}
