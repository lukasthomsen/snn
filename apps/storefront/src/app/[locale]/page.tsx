import Link from "next/link";
import type { Route } from "next";

import { roadmapPhases } from "@snn/commerce";
import { getDictionary, isLocale } from "@snn/i18n";
import {
  Badge,
  Button,
  Card,
  Cluster,
  Container,
  Grid,
  HeroFrame,
  ProductTileFrame,
  Stack,
} from "@snn/ui";

import styles from "./page.module.css";

type StorefrontPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const copy = getDictionary("storefront", safeLocale);

  return (
    <main className={styles.page}>
      <Container className={styles.shell} size="page">
        <HeroFrame
          actions={
            <>
              <Link className={styles.buttonLink} href={`/${safeLocale}/theme-lab` as Route}>
                Open Theme Lab
              </Link>
              <Link
                className={`${styles.buttonLink} ${styles.buttonGhost}`}
                href={`/${safeLocale}` as Route}
              >
                Storefront foundation
              </Link>
            </>
          }
          description={copy.description}
          eyebrow={copy.eyebrow}
          media={
            <div aria-hidden="true" className={styles.heroVisual}>
              <div className={styles.heroOrb} />
              <div className={styles.heroStripe} />
              <div className={styles.heroFloor} />
            </div>
          }
          title="Theme system first. Front page next."
        />

        <Stack gap="var(--ui-space-lg)">
          <h2 className={styles.sectionHeading}>{copy.phaseHeading}</h2>
          <p className={styles.sectionCopy}>{copy.phaseSummary}</p>
        </Stack>

        <Grid minItemWidth="18rem">
          <Card className={styles.summaryCard}>
            <span className={styles.summaryLabel}>{copy.statusLabel}</span>
            <strong className={styles.summaryValue}>{copy.statusValue}</strong>
            <p className={styles.sectionCopy}>
              Media, auth, payments, and the theme runtime now live below the actual page work so
              we can build the storefront on stable rails.
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

        <Stack className={styles.productRail} gap="var(--ui-space-lg)">
          <Cluster justify="space-between">
            <h2 className={styles.sectionHeading}>Theme preview blocks</h2>
            <Badge tone="accent">Internal system preview</Badge>
          </Cluster>

          <Grid minItemWidth="16rem">
            <ProductTileFrame
              actions={<Button size="sm">Preview block</Button>}
              badge={<Badge>Quiet product card</Badge>}
              category="Mono retail"
              name="Gallery surface"
              price="Theme preset"
              visualColor="linear-gradient(135deg, #f6f6f2, #cfcfc8)"
            />
            <ProductTileFrame
              actions={<Button size="sm" tone="secondary">Compare shell</Button>}
              badge={<Badge tone="accent">Nike energy</Badge>}
              category="Editorial motion"
              name="Campaign frame"
              price="Hero language"
              visualColor="linear-gradient(135deg, #10100f, #3e3e39)"
            />
            <ProductTileFrame
              actions={<Button size="sm" tone="tertiary">Inspect tokens</Button>}
              badge={<Badge tone="inverse">Apple restraint</Badge>}
              category="Precision system"
              name="Auth form shell"
              price="Component set"
              visualColor="linear-gradient(135deg, #e8e8e2, #bcbcb4)"
            />
          </Grid>
        </Stack>
      </Container>
    </main>
  );
}
