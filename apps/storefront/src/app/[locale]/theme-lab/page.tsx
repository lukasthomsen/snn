import { notFound } from "next/navigation";

import { isThemeLabEnabled } from "@snn/config";
import { isLocale } from "@snn/i18n";
import "@snn/ui/styles/components.css";

import { ThemeLabClient } from "./theme-lab-client";
import "./styles.css";

type ThemeLabPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ThemeLabPage({ params }: ThemeLabPageProps) {
  const { locale } = await params;

  if (!isLocale(locale) || !isThemeLabEnabled()) {
    notFound();
  }

  return <ThemeLabClient locale={locale} />;
}
