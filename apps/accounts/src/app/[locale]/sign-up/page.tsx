import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  getAccountAuthURL,
  getAuthCompleteURL,
  getFirstParam,
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
      checkingProviders: "Tjekker...",
      genericError: "Vi kunne ikke oprette kontoen. Prøv igen, eller log ind hvis kontoen allerede findes.",
      mismatch: "Adgangskoderne skal være ens.",
      networkError: "Der opstod en forbindelsesfejl. Prøv igen om lidt.",
      oauthFailed: "Google-login blev ikke gennemført. Prøv igen.",
      passwordLength: "Adgangskoden skal være mellem 15 og 128 tegn.",
      required: "Navn, e-mail og adgangskode er påkrævet.",
      unavailableProvider: "Denne login-metode er ikke klar endnu.",
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
    verificationCopy: "Tjek din e-mail for at bekræfte kontoen.",
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
      checkingProviders: "Checking...",
      genericError: "We could not create the account. Try again, or sign in if the account already exists.",
      mismatch: "Passwords must match.",
      networkError: "A connection error occurred. Please try again shortly.",
      oauthFailed: "Google sign-in was not completed. Please try again.",
      passwordLength: "Password must be between 15 and 128 characters.",
      required: "Name, email, and password are required.",
      unavailableProvider: "This sign-in method is not ready yet.",
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
    verificationCopy: "Check your email to verify your account.",
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
  const authCompleteURL = getAuthCompleteURL(safeLocale, callbackURL);
  const session = await getCustomerSession(await headers()).catch(() => null);
  const storefrontFooterURL = getStorefrontFooterURL(safeLocale);

  if (session?.user && !session.user.banned && session.user.emailVerified) {
    redirect(callbackURL as Route);
  }

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
        callbackURL={authCompleteURL}
        errorCallbackURL={getAccountAuthURL(safeLocale, "sign-up", callbackURL, {
          error: "oauth_failed",
        })}
        googleLabel={copy.googleLabel}
        initialMessage={
          getFirstParam(resolvedSearchParams.error) === "oauth_failed"
            ? copy.messages.oauthFailed
            : undefined
        }
        messages={{
          checking: copy.messages.checkingProviders,
          genericError: copy.messages.oauthFailed,
          unavailable: copy.messages.unavailableProvider,
        }}
      />

      <div className="auth-divider__root__SW0fv">
        <span />
        <p>{copy.dividerText}</p>
        <span />
      </div>

      <SignUpForm
        callbackURL={authCompleteURL}
        confirmPasswordLabel={copy.passwordConfirmLabel}
        confirmPasswordPlaceholder={copy.passwordConfirmPlaceholder}
        emailLabel={copy.emailLabel}
        emailPlaceholder={copy.emailPlaceholder}
        messages={{
          genericError: copy.messages.genericError,
          mismatch: copy.messages.mismatch,
          networkError: copy.messages.networkError,
          passwordLength: copy.messages.passwordLength,
          required: copy.messages.required,
        }}
        nameLabel={copy.nameLabel}
        namePlaceholder={copy.namePlaceholder}
        passwordLabel={copy.passwordLabel}
        passwordPlaceholder={copy.passwordPlaceholder}
        primaryAction={copy.primaryAction}
        verificationCopy={copy.verificationCopy}
      />
    </AuthPage>
  );
}
