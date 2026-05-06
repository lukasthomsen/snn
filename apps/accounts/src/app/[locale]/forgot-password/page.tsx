import { getAppOrigin } from "@snn/config";
import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthUtilityPage } from "../components/auth-utility-page";
import { ForgotPasswordForm } from "../components/password-forms";

type ForgotPasswordPageProps = {
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
    emailLabel: "E-mailadresse",
    emailPlaceholder: "dig@example.com",
    helper: "Kan du ikke komme ind?",
    signInLabel: "Tilbage til log ind",
    submitLabel: "Send reset-link",
    successMessage: "Hvis e-mailen findes, sender vi et reset-link.",
    title: "Reset password",
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
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    helper: "Having trouble getting in?",
    signInLabel: "Back to sign in",
    submitLabel: "Send reset link",
    successMessage: "If the email exists, we will send a reset link.",
    title: "Reset password",
  },
} as const;

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: ForgotPasswordPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const content = copy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const resetRedirect = new URL(`/${safeLocale}/reset-password`, getAppOrigin("auth"));
  resetRedirect.searchParams.set("callbackURL", callbackURL);
  const resetRedirectURL = resetRedirect.toString();

  return (
    <AuthUtilityPage
      brandFooter={content.brandFooter}
      brandStatements={[...content.brandStatements]}
      brandTitle={content.brandTitle}
      helper={
        <>
          <a className="inline__link__SW0fw" href={getAccountAuthPath(safeLocale, "sign-in", callbackURL)}>
            {content.signInLabel}
          </a>
        </>
      }
      title={content.title}
    >
      <ForgotPasswordForm
        emailLabel={content.emailLabel}
        emailPlaceholder={content.emailPlaceholder}
        resetRedirectURL={resetRedirectURL}
        submitLabel={content.submitLabel}
        successMessage={content.successMessage}
      />
    </AuthUtilityPage>
  );
}
