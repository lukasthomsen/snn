import { isLocale } from "@snn/i18n";

import { resolvePostAuthCallbackURL } from "../auth-routing";
import { AuthUtilityPage } from "../components/auth-utility-page";
import { TwoFactorForm } from "../components/two-factor-form";

type TwoFactorPageProps = {
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
    codeLabel: "2FA-kode",
    codePlaceholder: "123456",
    helper: "Indtast din app- eller backupkode.",
    messages: {
      codeInvalid: "2FA-koden kunne ikke bekræftes.",
      codeRequired: "Indtast din 2FA-kode.",
      networkError: "Vi kunne ikke kontakte login-tjenesten. Prøv igen.",
    },
    submitLabel: "Bekræft",
    title: "Two-factor check",
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
    codeLabel: "2FA code",
    codePlaceholder: "123456",
    helper: "Enter your authenticator or backup code.",
    messages: {
      codeInvalid: "The two-factor code could not be verified.",
      codeRequired: "Enter your two-factor code.",
      networkError: "We could not reach the authentication service. Please try again.",
    },
    submitLabel: "Verify",
    title: "Two-factor check",
  },
} as const;

export default async function TwoFactorPage({
  params,
  searchParams,
}: TwoFactorPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const safeLocale = isLocale(locale) ? locale : "da";
  const content = copy[safeLocale];
  const callbackURL = resolvePostAuthCallbackURL(resolvedSearchParams, safeLocale);

  return (
    <AuthUtilityPage
      brandFooter={content.brandFooter}
      brandStatements={[...content.brandStatements]}
      brandTitle={content.brandTitle}
      helper={content.helper}
      title={content.title}
    >
      <TwoFactorForm
        callbackURL={callbackURL}
        codeLabel={content.codeLabel}
        codePlaceholder={content.codePlaceholder}
        messages={content.messages}
        submitLabel={content.submitLabel}
      />
    </AuthUtilityPage>
  );
}
