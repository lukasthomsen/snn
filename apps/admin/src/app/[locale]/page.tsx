import { roadmapPhases, staffPermissionGroups } from "@snn/commerce";
import { getDictionary, isLocale } from "@snn/i18n";

import styles from "./page.module.css";

type AdminPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = getDictionary("admin", safeLocale);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>{copy.phaseHeading}</h2>
            <p className={styles.cardText}>{copy.phaseSummary}</p>
            <ol className={styles.phaseList}>
              {roadmapPhases.map((phase, index) => (
                <li key={phase} className={styles.phaseItem}>
                  <span className={styles.phaseIndex}>{index + 1}</span>
                  <span>{phase}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>{copy.statusLabel}</h2>
            <p className={styles.statusValue}>{copy.statusValue}</p>
            <p className={styles.cardText}>
              Prepared permission domains: {Object.keys(staffPermissionGroups).join(", ")}.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

