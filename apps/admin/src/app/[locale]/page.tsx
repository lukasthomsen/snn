import { roadmapPhases, staffPermissionGroups } from "@snn/commerce";
import { getDictionary, isLocale } from "@snn/i18n";
import { Badge, Card, Container, FormFrame, Grid, HeroFrame, Stack } from "@snn/ui";

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
    <main className="page__root__SW0hc">
      <Container className="shell__root__SW0hd" size="page">
        <HeroFrame
          description={copy.description}
          eyebrow={copy.eyebrow}
          media={
            <div aria-hidden="true" className="hero__visual__SW0hl">
              <div className="hero__panel__SW0hm" />
            </div>
          }
          title="Admin runtime ready for catalog and staff tools."
        />

        <Stack gap="var(--space-200)">
          <h2 className="section__heading__SW0he">{copy.phaseHeading}</h2>
          <p className="section__copy__SW0hf">{copy.phaseSummary}</p>
        </Stack>

        <Grid minItemWidth="18rem">
          <Card className="summary__card__SW0hg">
            <span className="summary__label__SW0hh">{copy.statusLabel}</span>
            <strong>{copy.statusValue}</strong>
            <Badge tone="accent">Prepared permission domains</Badge>
            <p className="section__copy__SW0hf">
              {Object.keys(staffPermissionGroups).join(", ")}
            </p>
          </Card>

          <Card className="summary__card__SW0hg" tone="muted">
            <span className="summary__label__SW0hh">Delivery order</span>
            <ol className="phase__list__SW0hi">
              {roadmapPhases.map((phase, index) => (
                <li key={phase} className="phase__item__SW0hj">
                  <span className="phase__index__SW0hk">{index + 1}</span>
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
          <p className="section__copy__SW0hf">
            Catalog, inventory, orders, and settings will all reuse the same size, tone, and
            surface primitives as the storefront instead of introducing a second visual system.
          </p>
        </FormFrame>
      </Container>
    </main>
  );
}
