import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@snn/customer";
import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
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
    errors: {
      authIncomplete: "Vi kunne ikke færdiggøre log ind. Prøv igen.",
      generic: "Vi kunne ikke logge dig ind. Tjek dine oplysninger, bekræft din e-mail og prøv igen.",
      network: "Vi kunne ikke få forbindelse til login-tjenesten. Prøv igen.",
      oauthFailed: "Google-login kunne ikke færdiggøres. Prøv igen.",
      required: "E-mail og adgangskode er påkrævet.",
    },
    forgotPasswordLabel: "Glemt adgangskode?",
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
    errors: {
      authIncomplete: "We could not finish sign-in. Please try again.",
      generic: "We could not sign you in. Check your details, verify your email, and try again.",
      network: "We could not reach the authentication service. Please try again.",
      oauthFailed: "Google sign-in could not be completed. Please try again.",
      required: "Email and password are required.",
    },
    forgotPasswordLabel: "Forgot password?",
    googleLabel: "Continue with Google",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    primaryAction: "Sign in",
    secondaryActionLabel: "Create one",
    secondaryActionText: "Need an account?",
    title: "Welcome back!",
  },
} as const;

type SignInErrorCopy = {
  authIncomplete: string;
  generic: string;
  network: string;
  oauthFailed: string;
  required: string;
};

function getInitialError(
  error: string | undefined,
  errors: SignInErrorCopy,
) {
  if (error === "auth_incomplete") {
    return errors.authIncomplete;
  }

  if (error === "oauth_failed") {
    return errors.oauthFailed;
  }

  return undefined;
}

export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const [{ locale }, resolvedSearchParams, requestHeaders] = await Promise.all([
    params,
    searchParams,
    headers(),
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = signInCopy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const session = await getCustomerSession(requestHeaders).catch(() => null);

  if (session?.user && !session.user.banned) {
    redirect(callbackURL as Route);
  }

  const authCompleteURL = getAuthCompleteURL(safeLocale, callbackURL);
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
        googleLabel={copy.googleLabel}
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
        forgotPasswordHref={getAccountAuthPath(safeLocale, "forgot-password", callbackURL)}
        forgotPasswordLabel={copy.forgotPasswordLabel}
        initialError={getInitialError(
          getFirstParam(resolvedSearchParams.error),
          copy.errors,
        )}
        messages={{
          genericError: copy.errors.generic,
          networkError: copy.errors.network,
          required: copy.errors.required,
        }}
        passwordLabel={copy.passwordLabel}
        passwordPlaceholder={copy.passwordPlaceholder}
        primaryAction={copy.primaryAction}
        twoFactorHref={getAccountAuthPath(safeLocale, "two-factor", callbackURL)}
      />
    </AuthPage>
  );
}
