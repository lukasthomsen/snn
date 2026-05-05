import { isLocale } from "@snn/i18n";

import {
  getAccountAuthPath,
  resolvePostAuthCallbackURL,
} from "../auth-routing";
import { AuthUtilityPage } from "../components/auth-utility-page";
import { ResetPasswordForm } from "../components/password-forms";

type ResetPasswordPageProps = {
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
    helper: "Vælg en stærk ny adgangskode.",
    passwordConfirmLabel: "Bekræft ny adgangskode",
    passwordConfirmPlaceholder: "Gentag adgangskoden",
    passwordLabel: "Ny adgangskode",
    passwordPlaceholder: "Mindst 15 tegn",
    submitLabel: "Opdater adgangskode",
    successMessage: "Din adgangskode er opdateret. Vi sender dig tilbage til login.",
    title: "New password",
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
    helper: "Choose a strong new password.",
    passwordConfirmLabel: "Confirm new password",
    passwordConfirmPlaceholder: "Repeat password",
    passwordLabel: "New password",
    passwordPlaceholder: "At least 15 characters",
    submitLabel: "Update password",
    successMessage: "Your password has been updated. We will send you back to sign in.",
    title: "New password",
  },
} as const;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const content = copy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);
  const token = getFirstParam(resolvedSearchParams.token);
  const errorCode = getFirstParam(resolvedSearchParams.error);

  return (
    <AuthUtilityPage
      brandFooter={content.brandFooter}
      brandStatements={[...content.brandStatements]}
      brandTitle={content.brandTitle}
      helper={content.helper}
      title={content.title}
    >
      <ResetPasswordForm
        callbackURL={callbackURL}
        confirmPasswordLabel={content.passwordConfirmLabel}
        confirmPasswordPlaceholder={content.passwordConfirmPlaceholder}
        errorCode={errorCode}
        passwordLabel={content.passwordLabel}
        passwordPlaceholder={content.passwordPlaceholder}
        signInHref={getAccountAuthPath(safeLocale, "sign-in", callbackURL)}
        submitLabel={content.submitLabel}
        successMessage={content.successMessage}
        token={token}
      />
    </AuthUtilityPage>
  );
}
