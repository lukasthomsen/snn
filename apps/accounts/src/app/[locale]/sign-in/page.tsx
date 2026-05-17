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
import { SignInForm } from "../components/sign-in-form";
import { SocialAuthButtons } from "../components/social-auth-buttons";

type SignInPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

const signInCopy = {
  da: {
    appleLabel: "Fortsæt med Apple",
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
      authIncomplete: "Login blev ikke gennemført. Prøv igen.",
      checkingProviders: "Tjekker...",
      genericError: "Vi kunne ikke logge dig ind. Tjek oplysningerne og prøv igen.",
      networkError: "Der opstod en forbindelsesfejl. Prøv igen om lidt.",
      oauthFailed: "Google-login blev ikke gennemført. Prøv igen.",
      required: "E-mail og adgangskode er påkrævet.",
      unavailableProvider: "Denne login-metode er ikke klar endnu.",
      verificationRequired: "Bekræft din e-mailadresse, før du logger ind.",
    },
    forgotPasswordLabel: "Glemt adgangskode?",
    googleLabel: "Fortsæt med Google",
    passwordLabel: "Adgangskode",
    passwordPlaceholder: "Indtast din adgangskode",
    primaryAction: "Log ind",
    secondaryActionLabel: "Opret en",
    secondaryActionText: "Har du brug for en konto?",
    title: "Log ind på SNN",
  },
  en: {
    appleLabel: "Continue with Apple",
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
      authIncomplete: "Sign-in was not completed. Please try again.",
      checkingProviders: "Checking...",
      genericError: "We could not sign you in. Check your details and try again.",
      networkError: "A connection error occurred. Please try again shortly.",
      oauthFailed: "Google sign-in was not completed. Please try again.",
      required: "Email and password are required.",
      unavailableProvider: "This sign-in method is not ready yet.",
      verificationRequired: "Verify your email address before signing in.",
    },
    forgotPasswordLabel: "Forgot password?",
    googleLabel: "Continue with Google",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    primaryAction: "Sign in",
    secondaryActionLabel: "Create one",
    secondaryActionText: "Need an account?",
    title: "Sign in to SNN",
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
  const authCompleteURL = getAuthCompleteURL(safeLocale, callbackURL);
  const session = await getCustomerSession(await headers()).catch(() => null);
  const storefrontFooterURL = getStorefrontFooterURL(safeLocale);
  const initialError = getInitialError(
    getFirstParam(resolvedSearchParams.error),
    copy.messages,
  );

  if (session?.user && !session.user.banned && session.user.emailVerified) {
    redirect(callbackURL as Route);
  }

  return (
    <AuthPage
      brandFooter={copy.brandFooter}
      brandStatements={[...copy.brandStatements]}
      brandTitle={copy.brandTitle}
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
      secondaryActionHref={getAccountAuthPath(safeLocale, "sign-up", callbackURL)}
      secondaryActionLabel={copy.secondaryActionLabel}
      secondaryActionText={copy.secondaryActionText}
      title={copy.title}
    >
      <SocialAuthButtons
        appleLabel={copy.appleLabel}
        callbackURL={authCompleteURL}
        errorCallbackURL={getAccountAuthURL(safeLocale, "sign-in", callbackURL, {
          error: "oauth_failed",
        })}
        googleLabel={copy.googleLabel}
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

      <SignInForm
        callbackURL={authCompleteURL}
        emailLabel={copy.emailLabel}
        emailPlaceholder={copy.emailPlaceholder}
        forgotPasswordLabel={copy.forgotPasswordLabel}
        forgotPasswordHref={getAccountAuthPath(
          safeLocale,
          "forgot-password",
          callbackURL,
        )}
        initialError={initialError}
        messages={{
          genericError: copy.messages.genericError,
          networkError: copy.messages.networkError,
          required: copy.messages.required,
          verificationRequired: copy.messages.verificationRequired,
        }}
        passwordLabel={copy.passwordLabel}
        passwordPlaceholder={copy.passwordPlaceholder}
        primaryAction={copy.primaryAction}
        twoFactorHref={getAccountAuthPath(safeLocale, "two-factor", callbackURL)}
      />
    </AuthPage>
  );
}

function getInitialError(
  error: string | undefined,
  messages: (typeof signInCopy)[keyof typeof signInCopy]["messages"],
) {
  if (error === "auth_incomplete") {
    return messages.authIncomplete;
  }

  if (error === "oauth_failed") {
    return messages.oauthFailed;
  }

  if (error === "verification_required") {
    return messages.verificationRequired;
  }

  return undefined;
}
