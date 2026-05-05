import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthUtilityPage } from "../components/auth-utility-page";

type VerifyEmailPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  da: {
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
    continueLabel: "Fortsæt til konto",
    errorHelper: "Linket er ugyldigt eller udløbet. Log ind for at få sendt et nyt bekræftelseslink.",
    errorTitle: "Linket kunne ikke bruges",
    signInLabel: "Tilbage til log ind",
    successHelper: "Din e-mailadresse er bekræftet, og kontoen er klar.",
    successTitle: "Email verified",
  },
  en: {
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
    continueLabel: "Continue to account",
    errorHelper: "The link is invalid or expired. Sign in to receive a new verification link.",
    errorTitle: "Link could not be used",
    signInLabel: "Back to sign in",
    successHelper: "Your email address is verified and the account is ready.",
    successTitle: "Email verified",
  },
} as const;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  params,
  searchParams,
}: VerifyEmailPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const content = copy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const hasError = Boolean(getFirstParam(resolvedSearchParams.error));

  return (
    <AuthUtilityPage
      brandFooter={content.brandFooter}
      brandStatements={[...content.brandStatements]}
      brandTitle={content.brandTitle}
      helper={hasError ? content.errorHelper : content.successHelper}
      title={hasError ? content.errorTitle : content.successTitle}
    >
      <p className="legal__copy__SW0fy">
        <a
          className="inline__link__SW0fw"
          href={
            hasError
              ? getAccountAuthPath(safeLocale, "sign-in", callbackURL)
              : callbackURL
          }
        >
          {hasError ? content.signInLabel : content.continueLabel}
        </a>
      </p>
    </AuthUtilityPage>
  );
}
