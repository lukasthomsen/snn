import type { Route } from "next";
import Link from "next/link";

import { isLocale } from "@snn/i18n";

import { AuthPage } from "../components/auth-page";

type SignInPageProps = {
  params: Promise<{
    locale: string;
  }>;
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
    passwordLabel: "Adgangskode",
    passwordPlaceholder: "Indtast din adgangskode",
    primaryAction: "Log ind",
    secondaryActionLabel: "Opret en",
    secondaryActionText: "Har du brug for en konto?",
    title: "Welcome back!",
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
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    primaryAction: "Sign in",
    secondaryActionLabel: "Create one",
    secondaryActionText: "Need an account?",
    title: "Welcome back!",
  },
} as const;

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = signInCopy[safeLocale];

  return (
    <AuthPage
      appleLabel={copy.appleLabel}
      body={copy.body}
      brandFooter={copy.brandFooter}
      brandStatements={[...copy.brandStatements]}
      brandTitle={copy.brandTitle}
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
          <Link href={`/${safeLocale}#footer` as Route}>
            {safeLocale === "da" ? "vilkår" : "terms"}
          </Link>
          {" and "}
          <Link href={`/${safeLocale}#footer` as Route}>
            {safeLocale === "da" ? "privatlivspolitik" : "privacy policy"}
          </Link>
          .
        </>
      }
      googleLabel={copy.googleLabel}
      locale={safeLocale}
      primaryAction={copy.primaryAction}
      secondaryActionHref={`/${safeLocale}/sign-up` as Route}
      secondaryActionLabel={copy.secondaryActionLabel}
      secondaryActionText={copy.secondaryActionText}
      title={copy.title}
    />
  );
}
