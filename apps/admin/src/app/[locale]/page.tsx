import { roadmapPhases, staffPermissionGroups } from "@snn/commerce";
import { getDictionary, isLocale } from "@snn/i18n";
import { Badge, Card, Container, FormFrame, Grid, HeroFrame, Stack } from "@snn/ui";

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
      <Container className={styles.shell} size="page">
        <HeroFrame
          description={copy.description}
          eyebrow={copy.eyebrow}
          media={
            <div aria-hidden="true" className={styles.heroVisual}>
              <div className={styles.heroPanel} />
            </div>
          }
          title="Admin runtime ready for catalog and staff tools."
        />

        <Stack gap="var(--ui-space-lg)">
          <h2 className={styles.sectionHeading}>{copy.phaseHeading}</h2>
          <p className={styles.sectionCopy}>{copy.phaseSummary}</p>
        </Stack>

        <Grid minItemWidth="18rem">
          <Card className={styles.summaryCard}>
            <span className={styles.summaryLabel}>{copy.statusLabel}</span>
            <strong>{copy.statusValue}</strong>
            <Badge tone="accent">Prepared permission domains</Badge>
            <p className={styles.sectionCopy}>
              {Object.keys(staffPermissionGroups).join(", ")}
            </p>
          </Card>

          <Card className={styles.summaryCard} tone="muted">
            <span className={styles.summaryLabel}>Delivery order</span>
            <ol className={styles.phaseList}>
              {roadmapPhases.map((phase, index) => (
                <li key={phase} className={styles.phaseItem}>
                  <span className={styles.phaseIndex}>{index + 1}</span>
                  <span>{phase}</span>
                </li>
              ))}
            </ol>
          </Card>
        </Grid>

        <FormFrame
          description="The admin UI itself comes later. For now this shell confirms the shared design system, form primitives, and permission boundaries are ready."
          kicker="Internal shell"
          title="Staff tooling will land on the same token system."
        >
          <p className={styles.sectionCopy}>
            Catalog, inventory, orders, and settings will all reuse the same size, tone, and
            surface primitives as the storefront instead of introducing a second visual system.
          </p>
        </FormFrame>
      </Container>
    </main>
  );
}
