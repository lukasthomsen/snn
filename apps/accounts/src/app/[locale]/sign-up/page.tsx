import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authTurnstileActions } from "@snn/auth/policy";
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
import { getAuthTurnstileChallenge } from "../auth-turnstile";
import { AuthPage } from "../components/auth-page";
import { SignUpFlow } from "../components/sign-up-flow";

type SignUpPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function addWelcomeParam(callbackURL: string) {
  const welcomeURL = new URL(callbackURL);

  welcomeURL.searchParams.set("welcome", "1");

  return welcomeURL.toString();
}

const signUpCopy = {
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
    dateOfBirthLabel: "Fødselsdato",
    birthdayCalendar: {
      monthLabel: "Måned",
      nextMonthLabel: "Næste måned",
      openLabel: "Vælg fødselsdato",
      previousMonthLabel: "Forrige måned",
      selectedLabel: "Valgt fødselsdato",
      yearLabel: "År",
    },
    emailLabel: "E-mailadresse",
    firstNameLabel: "Fornavn",
    lastNameLabel: "Efternavn",
    messages: {
      accountExists: "Der findes allerede en konto med denne e-mailadresse.",
      dateInvalid: "Angiv en gyldig fødselsdato.",
      emailManagedByProvider: "Denne e-mail er allerede forbundet med Google eller Apple. Log ind med den metode.",
      emailInvalid: "Angiv en gyldig e-mailadresse.",
      emailRequired: "E-mailadresse er påkrævet.",
      firstNameRequired: "Fornavn er påkrævet.",
      genericError: "Vi kunne ikke oprette kontoen. Prøv igen, eller log ind hvis kontoen allerede findes.",
      lastNameRequired: "Efternavn er påkrævet.",
      networkError: "Der opstod en forbindelsesfejl. Prøv igen om lidt.",
      oauthFailed: "Google-login blev ikke gennemført. Prøv igen.",
      passwordCompromised: "Denne adgangskode er fundet i et databrud. Vælg en anden.",
      passwordRequired: "Adgangskode er påkrævet.",
      passwordLength: "Adgangskoden opfylder ikke kravene.",
      required: "Fornavn, efternavn, e-mail og adgangskode er påkrævet.",
      serverError: "Vi kunne ikke færdiggøre oprettelsen lige nu. Prøv igen om lidt.",
      tooManyRequests: "For mange forsøg. Vent lidt, og prøv igen.",
      turnstileRequired: "Gennemfør sikkerhedstjekket for at fortsætte.",
      turnstileUnavailable: "Sikkerhedstjekket kunne ikke indlæses. Prøv igen.",
      unavailableProvider: "Denne login-metode er ikke klar endnu.",
    },
    googleLabel: "Fortsæt med Google",
    passwordLabel: "Adgangskode",
    passwordRules: {
      characterMix: "Mindst 3 af følgende:",
      length: "Mindst 10 tegn",
      lowercase: "Små bogstaver (a-z)",
      number: "Tal (0-9)",
      symbol: "Specialtegn (f.eks. !@#$%^&*)",
      title: "Din adgangskode skal indeholde:",
      uppercase: "Store bogstaver (A-Z)",
    },
    primaryAction: "Opret konto",
    secondaryActionLabel: "Log ind",
    secondaryActionText: "Har du allerede en konto?",
    title: "Opret konto nu!",
    verificationStage: {
      backLabel: "Brug en anden e-mail",
      body: "Vi har sendt en kode til",
      codeError: "Indtast den 8-cifrede kode.",
      resendError: "Vi kunne ikke sende en ny kode. Prøv igen om lidt.",
      resendLabel: "Send igen",
      resendPrompt: "Har du ikke modtaget en kode?",
      resendSuccess: "Ny bekræftelseskode sendt.",
      resendingLabel: "Sender...",
      title: "Bekræft konto",
      verifyError: "Koden er forkert eller udløbet.",
      verifyLabel: "Bekræft konto",
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
    dateOfBirthLabel: "Date of birth",
    birthdayCalendar: {
      monthLabel: "Month",
      nextMonthLabel: "Next month",
      openLabel: "Choose date of birth",
      previousMonthLabel: "Previous month",
      selectedLabel: "Selected date of birth",
      yearLabel: "Year",
    },
    emailLabel: "Email address",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    messages: {
      accountExists: "An account with this email already exists.",
      dateInvalid: "Enter a valid date of birth.",
      emailManagedByProvider: "This email is already connected to Google or Apple. Sign in with that method.",
      emailInvalid: "Enter a valid email address.",
      emailRequired: "Email address is required.",
      firstNameRequired: "First name is required.",
      genericError: "We could not create the account. Try again, or sign in if the account already exists.",
      lastNameRequired: "Last name is required.",
      networkError: "A connection error occurred. Please try again shortly.",
      oauthFailed: "Google sign-in was not completed. Please try again.",
      passwordCompromised: "This password has appeared in a data breach. Choose a different one.",
      passwordRequired: "Password is required.",
      passwordLength: "Password does not meet the requirements.",
      required: "First name, last name, email, and password are required.",
      serverError: "We could not finish creating the account right now. Try again shortly.",
      tooManyRequests: "Too many attempts. Wait a moment, then try again.",
      turnstileRequired: "Complete the security check to continue.",
      turnstileUnavailable: "The security check could not load. Please try again.",
      unavailableProvider: "This sign-in method is not ready yet.",
    },
    googleLabel: "Continue with Google",
    passwordLabel: "Password",
    passwordRules: {
      characterMix: "At least 3 of the following:",
      length: "At least 10 characters",
      lowercase: "Lower case letters (a-z)",
      number: "Numbers (0-9)",
      symbol: "Special characters (e.g. !@#$%^&*)",
      title: "Your password must contain:",
      uppercase: "Upper case letters (A-Z)",
    },
    primaryAction: "Create account",
    secondaryActionLabel: "Sign in",
    secondaryActionText: "Already have an account?",
    title: "Sign up now!",
    verificationStage: {
      backLabel: "Use a different email",
      body: "We've sent a code to",
      codeError: "Enter the 8-digit code.",
      resendError: "We could not send a new code. Please try again shortly.",
      resendLabel: "Resend",
      resendPrompt: "Didn't receive a code?",
      resendSuccess: "New verification code sent.",
      resendingLabel: "Sending...",
      title: "Verify account",
      verifyError: "The code is wrong or expired.",
      verifyLabel: "Verify account",
      verifyingLabel: "Verifying...",
    },
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
  const welcomeCallbackURL = addWelcomeParam(callbackURL);
  const authCompleteURL = getAuthCompleteURL(safeLocale, callbackURL);
  const newUserAuthCompleteURL = getAuthCompleteURL(safeLocale, welcomeCallbackURL);
  const session = await getCustomerSession(await headers()).catch(() => null);
  const storefrontFooterURL = getStorefrontFooterURL(safeLocale);
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
      <SignUpFlow
        dividerText={copy.dividerText}
        form={{
          birthdayCalendar: copy.birthdayCalendar,
          callbackURL: newUserAuthCompleteURL,
          dateOfBirthLabel: copy.dateOfBirthLabel,
          emailLabel: copy.emailLabel,
          firstNameLabel: copy.firstNameLabel,
          lastNameLabel: copy.lastNameLabel,
          locale: safeLocale,
          messages: {
            dateInvalid: copy.messages.dateInvalid,
            accountExists: copy.messages.accountExists,
            emailManagedByProvider: copy.messages.emailManagedByProvider,
            emailInvalid: copy.messages.emailInvalid,
            emailRequired: copy.messages.emailRequired,
            firstNameRequired: copy.messages.firstNameRequired,
            genericError: copy.messages.genericError,
            lastNameRequired: copy.messages.lastNameRequired,
            networkError: copy.messages.networkError,
            passwordCompromised: copy.messages.passwordCompromised,
            passwordRequired: copy.messages.passwordRequired,
            passwordLength: copy.messages.passwordLength,
            required: copy.messages.required,
            serverError: copy.messages.serverError,
            tooManyRequests: copy.messages.tooManyRequests,
          },
          passwordLabel: copy.passwordLabel,
          passwordRules: copy.passwordRules,
          primaryAction: copy.primaryAction,
          turnstile: getAuthTurnstileChallenge(
            authTurnstileActions.signUp,
            turnstileCopy,
          ),
        }}
        social={{
          appleLabel: copy.appleLabel,
          callbackURL: authCompleteURL,
          errorCallbackURL: getAccountAuthURL(safeLocale, "sign-up", callbackURL, {
            error: "oauth_failed",
          }),
          googleLabel: copy.googleLabel,
          initialMessage:
            getFirstParam(resolvedSearchParams.error) === "oauth_failed"
              ? copy.messages.oauthFailed
              : undefined,
          messages: {
            genericError: copy.messages.oauthFailed,
            unavailable: copy.messages.unavailableProvider,
          },
          newUserCallbackURL: newUserAuthCompleteURL,
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
