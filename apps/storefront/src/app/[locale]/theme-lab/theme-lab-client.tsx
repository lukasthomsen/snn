"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceTile,
  Cluster,
  Container,
  FormFrame,
  Grid,
  HeroFrame,
  PasswordField,
  ProductTileFrame,
  Radio,
  Select,
  Stack,
  TextField,
  Textarea,
  ThemeScope,
  mergeThemeDefinition,
  nikeAppleBlendTheme,
  serializeThemeDefinition,
  type ThemeDefinition,
} from "@snn/ui";

import styles from "./page.module.css";

type ThemeLabClientProps = {
  locale: string;
};

const themeStorageKey = "snn.theme-lab.v1";

const colorFields = [
  ["canvas", "Canvas", "color"],
  ["surface", "Surface", "color"],
  ["surfaceMuted", "Muted surface", "color"],
  ["surfaceStrong", "Strong surface", "color"],
  ["borderSubtle", "Border subtle", "color"],
  ["borderStrong", "Border strong", "color"],
  ["textPrimary", "Text primary", "color"],
  ["textSecondary", "Text secondary", "color"],
  ["textMuted", "Text muted", "color"],
  ["actionPrimaryBg", "Primary action", "color"],
  ["actionSecondaryBg", "Secondary surface", "color"],
  ["actionSecondaryBorder", "Secondary border", "color"],
  ["accent", "Accent", "color"],
  ["focusRing", "Focus ring", "color"],
  ["heroOverlayStart", "Hero overlay start", "text"],
  ["heroOverlayEnd", "Hero overlay end", "text"],
] as const;

const typographyFields = [
  ["hero", "Hero display", "text"],
  ["size5xl", "Display large", "text"],
  ["size3xl", "Section heading", "text"],
  ["sizeLg", "Body large", "text"],
  ["bodyFamily", "Body family", "text"],
  ["displayFamily", "Display family", "text"],
] as const;

const spacingFields = [
  ["spacing", "5xl", "Section gap"],
  ["spacing", "4xl", "Large section"],
  ["spacing", "lg", "Card padding"],
  ["spacing", "md", "Base space"],
  ["radius", "pill", "Pill radius"],
  ["radius", "lg", "Card radius"],
  ["layout", "heroMinHeight", "Hero min height"],
  ["layout", "pageMaxWidth", "Page max width"],
] as const;

function getInitialTheme() {
  if (typeof window === "undefined") {
    return nikeAppleBlendTheme;
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (!storedTheme) {
    return nikeAppleBlendTheme;
  }

  try {
    return mergeThemeDefinition(JSON.parse(storedTheme));
  } catch {
    return nikeAppleBlendTheme;
  }
}

function updateThemeSection<
  TSection extends keyof ThemeDefinition,
  TKey extends keyof ThemeDefinition[TSection],
>(
  theme: ThemeDefinition,
  section: TSection,
  key: TKey,
  value: ThemeDefinition[TSection][TKey],
) {
  return {
    ...theme,
    [section]: {
      ...theme[section],
      [key]: value,
    },
  } satisfies ThemeDefinition;
}

function FieldRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export function ThemeLabClient({ locale }: ThemeLabClientProps) {
  const [theme, setTheme] = useState<ThemeDefinition>(() => getInitialTheme());
  const [importDraft, setImportDraft] = useState(() => serializeThemeDefinition(getInitialTheme()));
  const [statusMessage, setStatusMessage] = useState(
    "Local and preview environments keep the Theme Lab enabled by default.",
  );
  const deferredTheme = useDeferredValue(theme);
  const exportJson = useMemo(() => serializeThemeDefinition(theme), [theme]);

  const persistTheme = useEffectEvent((nextTheme: ThemeDefinition) => {
    window.localStorage.setItem(themeStorageKey, serializeThemeDefinition(nextTheme));
  });

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  function setColorToken(key: keyof ThemeDefinition["color"], value: string) {
    startTransition(() => {
      setTheme((currentTheme) => updateThemeSection(currentTheme, "color", key, value));
    });
  }

  function setTypographyToken(key: keyof ThemeDefinition["typography"], value: string) {
    startTransition(() => {
      setTheme((currentTheme) => updateThemeSection(currentTheme, "typography", key, value));
    });
  }

  function setSpacingToken(
    section: "layout" | "motion" | "radius" | "spacing",
    key: string,
    value: string,
  ) {
    startTransition(() => {
      setTheme((currentTheme) =>
        updateThemeSection(
          currentTheme,
          section,
          key as never,
          value as never,
        ),
      );
    });
  }

  async function copyThemeJson() {
    await navigator.clipboard.writeText(exportJson);
    setStatusMessage("Copied the current theme JSON to your clipboard.");
  }

  function applyImportedTheme() {
    try {
      const parsedTheme = mergeThemeDefinition(JSON.parse(importDraft));

      startTransition(() => {
        setTheme(parsedTheme);
      });

      setStatusMessage("Imported a new theme definition.");
    } catch {
      setStatusMessage("Import failed. Check the JSON and try again.");
    }
  }

  function resetTheme() {
    startTransition(() => {
      setTheme(nikeAppleBlendTheme);
      setImportDraft(serializeThemeDefinition(nikeAppleBlendTheme));
    });

    setStatusMessage("Reset to the default Nike-forward preset.");
  }

  return (
    <main className={styles.page}>
      <ThemeScope theme={deferredTheme}>
        <Container className={styles.shell} size="wide">
          <section className={styles.intro}>
            <span className={styles.introMeta}>SNN theme lab</span>
            <h1 className={styles.introTitle}>Edit the system before we build the pages.</h1>
            <p className={styles.introCopy}>
              This route is the control room for the corporate retail preset. It previews tokens,
              components, and shell-level blocks before we move into the actual homepage, header,
              footer, and auth page implementation.
            </p>
            <Cluster>
              <Badge tone="accent">Nike-forward direction</Badge>
              <Badge>Apple-grade spacing discipline</Badge>
              <Badge>Local storage persistence</Badge>
            </Cluster>
          </section>

          <div className={styles.layoutGrid}>
            <aside className={styles.controlRail}>
              <Card className={styles.editorSection}>
                <h2 className={styles.editorHeading}>Status</h2>
                <p className={styles.introCopy}>{statusMessage}</p>
                <Cluster>
                  <Button onClick={resetTheme} size="sm" tone="secondary">
                    Reset preset
                  </Button>
                  <Button onClick={copyThemeJson} size="sm">
                    Copy JSON
                  </Button>
                </Cluster>
                <Link href={`/${locale}` as Route} style={{ color: "inherit" }}>
                  Back to the foundation runtime
                </Link>
              </Card>

              <Card className={styles.editorSection}>
                <h2 className={styles.editorHeading}>Color system</h2>
                <div className={styles.fieldGrid}>
                  {colorFields.map(([key, label, controlType]) => (
                    <FieldRow key={key} label={label}>
                      {controlType === "color" ? (
                        <div className={styles.fieldCombo}>
                          <input
                            className={styles.swatchInput}
                            onChange={(event) => {
                              setColorToken(key, event.target.value);
                            }}
                            type="color"
                            value={theme.color[key] as string}
                          />
                          <input
                            className={styles.textInput}
                            onChange={(event) => {
                              setColorToken(key, event.target.value);
                            }}
                            type="text"
                            value={theme.color[key] as string}
                          />
                        </div>
                      ) : (
                        <input
                          className={styles.textInput}
                          onChange={(event) => {
                            setColorToken(key, event.target.value);
                          }}
                          type="text"
                          value={theme.color[key] as string}
                        />
                      )}
                    </FieldRow>
                  ))}
                </div>
              </Card>

              <Card className={styles.editorSection}>
                <h2 className={styles.editorHeading}>Typography</h2>
                <div className={styles.fieldGrid}>
                  {typographyFields.map(([key, label]) => (
                    <FieldRow key={key} label={label}>
                      <input
                        className={styles.textInput}
                        onChange={(event) => {
                          setTypographyToken(key, event.target.value);
                        }}
                        type="text"
                        value={theme.typography[key] as string}
                      />
                    </FieldRow>
                  ))}
                </div>
              </Card>

              <Card className={styles.editorSection}>
                <h2 className={styles.editorHeading}>Spacing, radius, layout</h2>
                <div className={styles.fieldGrid}>
                  {spacingFields.map(([group, key, label]) => {
                    const value =
                      group === "layout"
                        ? theme.layout[key as keyof ThemeDefinition["layout"]]
                        : group === "radius"
                          ? theme.radius[key as keyof ThemeDefinition["radius"]]
                          : theme.spacing[key as keyof ThemeDefinition["spacing"]];

                    return (
                      <FieldRow key={`${group}-${key}`} label={label}>
                        <input
                          className={styles.textInput}
                          onChange={(event) => {
                            setSpacingToken(group, key, event.target.value);
                          }}
                          type="text"
                          value={value as string}
                        />
                      </FieldRow>
                    );
                  })}

                  <FieldRow label="Motion base">
                    <input
                      className={styles.textInput}
                      onChange={(event) => {
                        setSpacingToken("motion", "base", event.target.value);
                      }}
                      type="text"
                      value={theme.motion.base}
                    />
                  </FieldRow>
                </div>
              </Card>

              <Card className={styles.editorSection}>
                <h2 className={styles.editorHeading}>Import JSON</h2>
                <textarea
                  className={styles.textarea}
                  onChange={(event) => {
                    setImportDraft(event.target.value);
                  }}
                  value={importDraft}
                />
                <div className={styles.jsonActions}>
                  <Button onClick={applyImportedTheme} size="sm">
                    Apply import
                  </Button>
                  <Button
                    onClick={() => {
                      setImportDraft(exportJson);
                    }}
                    size="sm"
                    tone="secondary"
                  >
                    Load current JSON
                  </Button>
                </div>
              </Card>
            </aside>

            <section className={styles.previewRegion}>
              <Card className={styles.previewShell}>
                <h2 className={styles.previewHeading}>Theme surface preview</h2>
                <p className={styles.previewCopy}>
                  The preview below is intentionally not the final homepage. It is a controlled
                  environment for making layout, component, and token decisions with the future
                  Nike-forward visual language already applied.
                </p>
              </Card>

              <div className={styles.previewBackdrop}>
                <Stack gap="var(--ui-space-4xl)">
                  <HeroFrame
                    actions={
                      <>
                        <Button size="lg">Shop the collection</Button>
                        <Button size="lg" tone="secondary">
                          Explore the system
                        </Button>
                      </>
                    }
                    description="Large editorial display moments, quiet chrome, and pill actions sit on top of a calmer Apple-like spacing system."
                    eyebrow="Homepage hero preview"
                    media={
                      <div aria-hidden="true" className={styles.heroPreviewMedia}>
                        <div className={styles.heroPreviewEllipse} />
                        <div className={styles.heroPreviewBlade} />
                      </div>
                    }
                    title="Motion with restraint."
                  />

                  <Stack className={styles.previewRail} gap="var(--ui-space-lg)">
                    <Cluster justify="space-between">
                      <h2 className={styles.previewHeading}>Buttons and product cards</h2>
                      <Badge tone="accent">Retail building blocks</Badge>
                    </Cluster>
                    <Grid minItemWidth="15rem">
                      <ProductTileFrame
                        actions={<Button size="sm">Choose options</Button>}
                        badge={<Badge>Primary card</Badge>}
                        category="Running"
                        name="Air Motion 01"
                        price="DKK 1,199"
                        visualColor="linear-gradient(135deg, #f7f7f4, #d4d4cc)"
                      />
                      <ProductTileFrame
                        actions={
                          <Cluster>
                            <Button size="sm" tone="secondary">
                              Details
                            </Button>
                            <Button size="sm" tone="tertiary">
                              Favorite
                            </Button>
                          </Cluster>
                        }
                        badge={<Badge tone="accent">Secondary action</Badge>}
                        category="Lifestyle"
                        name="Graphite Flow"
                        price="DKK 999"
                        visualColor="linear-gradient(135deg, #191917, #4a4a45)"
                      />
                      <ProductTileFrame
                        actions={<Button size="sm">Add to lookbook</Button>}
                        badge={<Badge>Quiet surface</Badge>}
                        category="Training"
                        name="Studio Shift"
                        price="DKK 849"
                        visualColor="linear-gradient(135deg, #e7e7e1, #b8b8b0)"
                      />
                    </Grid>
                  </Stack>

                  <Stack gap="var(--ui-space-lg)">
                    <Cluster justify="space-between">
                      <h2 className={styles.previewHeading}>PDP shell</h2>
                      <Badge>PDP preview</Badge>
                    </Cluster>
                    <div className={styles.pdpGrid}>
                      <div className={styles.pdpGallery}>
                        <div className={styles.pdpThumbs}>
                          <div className={styles.pdpThumb} />
                          <div className={styles.pdpThumb} />
                          <div className={styles.pdpThumb} />
                          <div className={styles.pdpThumb} />
                        </div>
                        <div className={styles.pdpHeroVisual} />
                      </div>

                      <Stack className={styles.pdpSide} gap="var(--ui-space-md)">
                        <Badge tone="accent">PDP controls</Badge>
                        <h2 className={styles.previewHeading}>Air Motion 01</h2>
                        <p className={styles.previewCopy}>
                          Clean product surfaces, structured copy, pill actions, and restrained
                          visual noise are the core rules we will reuse on the real PDP.
                        </p>
                        <Grid minItemWidth="8rem">
                          <ChoiceTile checked description="EU 42" label="Size" name="size-preview" />
                          <ChoiceTile description="EU 43" label="Size" name="size-preview" />
                          <ChoiceTile description="EU 44" label="Size" name="size-preview" />
                          <ChoiceTile description="EU 45" label="Size" name="size-preview" />
                        </Grid>
                        <Button fullWidth size="lg">
                          Add to bag
                        </Button>
                        <Button fullWidth size="lg" tone="secondary">
                          Favorite
                        </Button>
                      </Stack>
                    </div>
                  </Stack>

                  <Stack gap="var(--ui-space-lg)">
                    <Cluster justify="space-between">
                      <h2 className={styles.previewHeading}>Forms and auth shell</h2>
                      <Badge>Auth preview</Badge>
                    </Cluster>
                    <Grid minItemWidth="18rem">
                      <FormFrame
                        description="Simple single-column forms, strong labels, and minimal ornamentation keep account flows premium without becoming decorative."
                        kicker="Account entry"
                        title="Sign in faster."
                      >
                        <TextField hint="We will continue to the next auth step after validation." label="Email" placeholder="name@example.com" />
                        <PasswordField label="Password" placeholder="Enter your password" />
                        <Checkbox
                          description="Keep this browser signed in for the next checkout session."
                          label="Remember me"
                        />
                        <Cluster>
                          <Button>Continue</Button>
                          <Button tone="secondary">Google</Button>
                        </Cluster>
                      </FormFrame>

                      <Card>
                        <Stack gap="var(--ui-space-md)">
                          <h3 className={styles.previewHeading}>Component gallery</h3>
                          <Cluster>
                            <Button size="sm">Primary</Button>
                            <Button size="sm" tone="secondary">
                              Secondary
                            </Button>
                            <Button size="sm" tone="tertiary">
                              Tertiary
                            </Button>
                          </Cluster>
                          <Select defaultValue="da" label="Locale">
                            <option value="da">Danish</option>
                            <option value="en">English</option>
                          </Select>
                          <Textarea
                            label="Copy tone"
                            placeholder="Write a campaign note, PDP copy rule, or auth helper text."
                          />
                          <Radio description="Minimal and premium" label="Single-column auth" name="auth-layout" />
                        </Stack>
                      </Card>
                    </Grid>
                  </Stack>
                </Stack>
              </div>
            </section>
          </div>
        </Container>
      </ThemeScope>
    </main>
  );
}
