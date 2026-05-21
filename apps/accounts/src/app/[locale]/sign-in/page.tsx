import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@snn/customer";
import { authTurnstileActions } from "@snn/auth/policy";
import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  getAccountAuthURL,
  getAuthCompleteURL,
  getFirstParam,
  getStorefrontFooterURL,
  getStorefrontPrivacyURL,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { getAuthTurnstileChallenge } from "../auth-turnstile";
import { AuthPage } from "../components/auth-page";
import { SignInFlow } from "../components/sign-in-flow";

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
    messages: {
      authIncomplete: "Login blev ikke gennemført. Prøv igen.",
      emailInvalid: "Angiv en gyldig e-mailadresse.",
      emailRequired: "E-mailadresse er påkrævet.",
      genericError: "Forkert e-mail eller adgangskode",
      networkError: "Der opstod en forbindelsesfejl. Prøv igen om lidt.",
      oauthFailed: "Google-login blev ikke gennemført. Prøv igen.",
      passwordRequired: "Adgangskode er påkrævet.",
      required: "E-mail og adgangskode er påkrævet.",
      unavailableProvider: "Denne login-metode er ikke klar endnu.",
      turnstileRequired: "Gennemfør sikkerhedstjekket for at fortsætte.",
      turnstileUnavailable: "Sikkerhedstjekket kunne ikke indlæses. Prøv igen.",
      verificationRequired: "Bekræft din e-mailadresse, før du logger ind.",
    },
    forgotPasswordLabel: "Glemt adgangskode?",
    googleLabel: "Fortsæt med Google",
    passwordLabel: "Adgangskode",
    primaryAction: "Log ind",
    secondaryActionLabel: "Opret en",
    secondaryActionText: "Har du brug for en konto?",
    title: "Velkommen tilbage!",
    verificationStage: {
      backLabel: "Tilbage til log ind",
      body: "Vi har sendt en kode til",
      codeError: "Indtast den 8-cifrede kode.",
      resendError: "Vi kunne ikke sende en ny kode. Prøv igen om lidt.",
      resendLabel: "Send igen",
      resendPrompt: "Har du ikke modtaget en kode?",
      resendSuccess: "Ny bekræftelseskode sendt.",
      resendingLabel: "Sender...",
      title: "Bekræft konto",
      verifyError: "Koden er forkert eller udløbet.",
      verifyLabel: "Bekræft e-mail",
      verifyingLabel: "Bekræfter...",
    },
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
    messages: {
      authIncomplete: "Sign-in was not completed. Please try again.",
      emailInvalid: "Enter a valid email address.",
      emailRequired: "Email address is required.",
      genericError: "Wrong email or password",
      networkError: "A connection error occurred. Please try again shortly.",
      oauthFailed: "Google sign-in was not completed. Please try again.",
      passwordRequired: "Password is required.",
      required: "Email and password are required.",
      unavailableProvider: "This sign-in method is not ready yet.",
      turnstileRequired: "Complete the security check to continue.",
      turnstileUnavailable: "The security check could not load. Please try again.",
      verificationRequired: "Verify your email address before signing in.",
    },
    forgotPasswordLabel: "Forgot password?",
    googleLabel: "Continue with Google",
    passwordLabel: "Password",
    primaryAction: "Sign in",
    secondaryActionLabel: "Create one",
    secondaryActionText: "Need an account?",
    title: "Welcome back!",
    verificationStage: {
      backLabel: "Back to sign in",
      body: "We've sent a code to",
      codeError: "Enter the 8-digit code.",
      resendError: "We could not send a new code. Please try again shortly.",
      resendLabel: "Resend",
      resendPrompt: "Didn't receive a code?",
      resendSuccess: "New verification code sent.",
      resendingLabel: "Sending...",
      title: "Verify account",
      verifyError: "The code is wrong or expired.",
      verifyLabel: "Verify email",
      verifyingLabel: "Verifying...",
    },
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
  const storefrontPrivacyURL = getStorefrontPrivacyURL(safeLocale);
  const initialError = getInitialError(
    getFirstParam(resolvedSearchParams.error),
    copy.messages,
  );
  const turnstileCopy = {
    requiredMessage: copy.messages.turnstileRequired,
    unavailableMessage: copy.messages.turnstileUnavailable,
  };

  if (session?.user && !session.user.banned && session.user.emailVerified) {
    redirect(callbackURL as Route);
  }

  return (
    <AuthPage
      brandFooter={copy.brandFooter}
      brandPresentation="quote"
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
          <a href={storefrontPrivacyURL}>
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
      <SignInFlow
        dividerText={copy.dividerText}
        form={{
          callbackURL: authCompleteURL,
          emailLabel: copy.emailLabel,
          forgotPasswordHref: getAccountAuthPath(
            safeLocale,
            "forgot-password",
            callbackURL,
          ),
          forgotPasswordLabel: copy.forgotPasswordLabel,
          initialError,
          messages: {
            emailInvalid: copy.messages.emailInvalid,
            emailRequired: copy.messages.emailRequired,
            genericError: copy.messages.genericError,
            networkError: copy.messages.networkError,
            passwordRequired: copy.messages.passwordRequired,
            required: copy.messages.required,
            verificationRequired: copy.messages.verificationRequired,
          },
          passwordLabel: copy.passwordLabel,
          primaryAction: copy.primaryAction,
          turnstile: getAuthTurnstileChallenge(
            authTurnstileActions.signIn,
            turnstileCopy,
          ),
          twoFactorHref: getAccountAuthPath(safeLocale, "two-factor", callbackURL),
        }}
        social={{
          appleLabel: copy.appleLabel,
          callbackURL: authCompleteURL,
          errorCallbackURL: getAccountAuthURL(safeLocale, "sign-in", callbackURL, {
            error: "oauth_failed",
          }),
          googleLabel: copy.googleLabel,
          messages: {
            genericError: copy.messages.oauthFailed,
            unavailable: copy.messages.unavailableProvider,
          },
          turnstile: getAuthTurnstileChallenge(
            authTurnstileActions.socialSignIn,
            turnstileCopy,
          ),
        }}
        stage={copy.verificationStage}
        verificationTurnstile={getAuthTurnstileChallenge(
          authTurnstileActions.emailVerification,
          turnstileCopy,
        )}
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
