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
  AppleLogoIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceTile,
  Cluster,
  ColorField,
  Container,
  FormFrame,
  GoogleLogoIcon,
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
  monoTheme,
  serializeThemeDefinition,
  type ThemeDefinition,
} from "@snn/ui";

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
  ["actionPrimaryText", "Primary action text", "color"],
  ["actionSecondaryBg", "Secondary surface", "color"],
  ["actionSecondaryBorder", "Secondary border", "color"],
  ["actionSecondaryText", "Secondary text", "color"],
  ["actionTertiaryText", "Ghost/outline text", "color"],
  ["bluePrimary", "Blue primary", "color"],
  ["blueLighter", "Blue lighter", "color"],
  ["accent", "Accent", "color"],
  ["accentSoft", "Accent soft", "color"],
  ["warning", "Warning", "color"],
  ["danger", "Danger", "color"],
  ["focusRing", "Focus ring", "color"],
  ["heroOverlayStart", "Hero overlay start", "text"],
  ["heroOverlayEnd", "Hero overlay end", "text"],
] as const;

const typographyFields = [
  ["hero", "Hero display", "text"],
  ["h1", "Heading 1", "text"],
  ["h2", "Heading 2", "text"],
  ["h3", "Heading 3", "text"],
  ["size7xl", "Scale 56", "text"],
  ["size6xl", "Scale 48", "text"],
  ["size5xl", "Display large", "text"],
  ["size4xl", "Display medium", "text"],
  ["size3xlPlus", "Section heading plus", "text"],
  ["size3xl", "Section heading", "text"],
  ["size2xlPlus", "Title plus", "text"],
  ["size2xl", "Title", "text"],
  ["sizeXlPlus", "Body XL plus", "text"],
  ["sizeXl", "Body XL", "text"],
  ["sizeLgPlus", "Large plus", "text"],
  ["sizeLg", "Large", "text"],
  ["sizeMdPlus", "Regular plus", "text"],
  ["sizeMd", "Regular", "text"],
  ["sizeSmPlus", "Small plus", "text"],
  ["sizeSm", "Small", "text"],
  ["sizeXsPlus", "Tiny plus", "text"],
  ["sizeXs", "Tiny", "text"],
  ["size2xs", "Micro", "text"],
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

function parseStoredTheme(storedTheme: string | null) {
  if (!storedTheme) {
    return monoTheme;
  }

  try {
    return mergeThemeDefinition(JSON.parse(storedTheme));
  } catch {
    return monoTheme;
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
    <label className="field__row__SW0gl">
      <span className="field__label__SW0gm">{label}</span>
      {children}
    </label>
  );
}

export function ThemeLabClient({ locale }: ThemeLabClientProps) {
  const [hasLoadedStoredTheme, setHasLoadedStoredTheme] = useState(false);
  const [theme, setTheme] = useState<ThemeDefinition>(monoTheme);
  const [importDraft, setImportDraft] = useState(() => serializeThemeDefinition(monoTheme));
  const [statusMessage, setStatusMessage] = useState(
    "Edit tokens on the left, watch the previews update on the right, and use Copy JSON when the preset feels right.",
  );
  const deferredTheme = useDeferredValue(theme);
  const exportJson = useMemo(() => serializeThemeDefinition(theme), [theme]);

  const persistTheme = useEffectEvent((nextTheme: ThemeDefinition) => {
    window.localStorage.setItem(themeStorageKey, serializeThemeDefinition(nextTheme));
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextTheme = parseStoredTheme(window.localStorage.getItem(themeStorageKey));

      setTheme(nextTheme);
      setImportDraft(serializeThemeDefinition(nextTheme));
      setHasLoadedStoredTheme(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTheme) {
      return;
    }

    persistTheme(theme);
  }, [hasLoadedStoredTheme, theme]);

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
      setTheme(monoTheme);
      setImportDraft(serializeThemeDefinition(monoTheme));
    });

    setStatusMessage("Reset to the default monochrome preset.");
  }

  return (
    <main className="page__root__SW0g9">
      <ThemeScope theme={deferredTheme}>
        <Container size="wide">
          <div className="shell__root__SW0ga">
          <section className="intro__root__SW0gb">
            <h1 className="intro__title__SW0gd">Shape the system before we build the storefront.</h1>
            <p className="intro__copy__SW0ge">
              This page is the design workshop for the whole site. Change the tokens on the left,
              study the live previews on the right, and once the system feels right we lock this
              preset before building the real homepage, header, footer, and auth flows.
            </p>
            <Cluster>
              <Badge tone="accent">Monochrome retail preset</Badge>
              <Badge>Spacing before decoration</Badge>
              <Badge>Live token editing</Badge>
            </Cluster>
          </section>

          <div className="layout__grid__SW0gf">
            <aside className="control__rail__SW0gg">
              <Card gap="var(--space-75)">
                <h2 className="editor__heading__SW0gi">Status</h2>
                <p className="intro__copy__SW0ge">{statusMessage}</p>
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

              <Card gap="var(--space-75)" tone="muted">
                <h2 className="editor__heading__SW0gi">How to use it</h2>
                <Stack gap="var(--space-50)">
                  <p className="preview__copy__SW0gv">1. Adjust colors, type, spacing, and radius on the left.</p>
                  <p className="preview__copy__SW0gv">2. Watch the hero, product, PDP, and auth previews update.</p>
                  <p className="preview__copy__SW0gv">3. Copy the JSON when the preset feels right, then I lock it into the default theme.</p>
                </Stack>
              </Card>

              <Card gap="var(--space-75)">
                <h2 className="editor__heading__SW0gi">Color system</h2>
                <div className="field__grid__SW0gk">
                  {colorFields.map(([key, label, controlType]) => (
                    <FieldRow key={key} label={label}>
                      {controlType === "color" ? (
                        <ColorField
                          aria-label={label}
                          fullWidth
                          onChange={(event) => {
                            setColorToken(key, event.target.value);
                          }}
                          value={theme.color[key] as string}
                        />
                      ) : (
                        <TextField
                          aria-label={label}
                          fullWidth
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

              <Card gap="var(--space-75)">
                <h2 className="editor__heading__SW0gi">Typography</h2>
                <div className="field__grid__SW0gk">
                  {typographyFields.map(([key, label]) => (
                    <FieldRow key={key} label={label}>
                      <TextField
                        aria-label={label}
                        fullWidth
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

              <Card gap="var(--space-75)">
                <h2 className="editor__heading__SW0gi">Spacing, radius, layout</h2>
                <div className="field__grid__SW0gk">
                  {spacingFields.map(([group, key, label]) => {
                    const value =
                      group === "layout"
                        ? theme.layout[key as keyof ThemeDefinition["layout"]]
                        : group === "radius"
                          ? theme.radius[key as keyof ThemeDefinition["radius"]]
                          : theme.spacing[key as keyof ThemeDefinition["spacing"]];

                    return (
                      <FieldRow key={`${group}-${key}`} label={label}>
                        <TextField
                          aria-label={label}
                          fullWidth
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
                    <TextField
                      aria-label="Motion base"
                      fullWidth
                      onChange={(event) => {
                        setSpacingToken("motion", "base", event.target.value);
                      }}
                      type="text"
                      value={theme.motion.base}
                    />
                  </FieldRow>
                </div>
              </Card>

              <Card gap="var(--space-75)">
                <h2 className="editor__heading__SW0gi">Import JSON</h2>
                <Textarea
                  aria-label="Import JSON"
                  fullWidth
                  onChange={(event) => {
                    setImportDraft(event.target.value);
                  }}
                  value={importDraft}
                />
                <div className="json__actions__SW0hb">
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

            <section className="preview__region__SW0gs">
              <Card gap="var(--space-200)">
                <h2 className="preview__heading__SW0gu">Theme surface preview</h2>
                <p className="preview__copy__SW0gv">
                  This is not the final homepage. It is a controlled preview where we decide the
                  rules for tone, spacing, buttons, product framing, and auth styling before real
                  page building starts.
                </p>
              </Card>

              <div className="preview__backdrop__SW0gw">
                <Stack gap="var(--space-600)">
                  <HeroFrame
                    actions={
                      <>
                        <Button size="lg">Shop the collection</Button>
                        <Button size="lg" tone="secondary">
                          Explore the system
                        </Button>
                      </>
                    }
                    description="Large editorial display moments, quiet chrome, and pill actions sit on top of a stricter monochrome spacing system."
                    media={
                      <div aria-hidden="true" className="hero-preview__media__SW0gx">
                        <div className="hero-preview__ellipse__SW0gy" />
                        <div className="hero-preview__blade__SW0gz" />
                      </div>
                    }
                    title="Motion with restraint."
                  />

                  <Stack gap="var(--space-200)">
                    <Cluster justify="space-between">
                      <h2 className="preview__heading__SW0gu">Buttons and product cards</h2>
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
                            <Button size="sm" tone="outline">
                              Favorite
                            </Button>
                          </Cluster>
                        }
                        badge={<Badge>Secondary action</Badge>}
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
                    <Cluster>
                      <Button size="sm">Primary</Button>
                      <Button size="sm" tone="secondary">
                        Secondary
                      </Button>
                      <Button size="sm" tone="outline">
                        Outline
                      </Button>
                      <Button size="sm" tone="ghost">
                        Ghost
                      </Button>
                      <Button size="sm" tone="danger">
                        Danger
                      </Button>
                    </Cluster>
                  </Stack>

                  <Stack gap="var(--space-200)">
                    <Cluster justify="space-between">
                      <h2 className="preview__heading__SW0gu">PDP shell</h2>
                      <Badge>PDP preview</Badge>
                    </Cluster>
                    <div className="pdp__grid__SW0h5">
                      <div className="pdp__gallery__SW0h6">
                        <div className="pdp__thumbs__SW0h7">
                          <div className="pdp__thumb__SW0h8" />
                          <div className="pdp__thumb__SW0h8" />
                          <div className="pdp__thumb__SW0h8" />
                          <div className="pdp__thumb__SW0h8" />
                        </div>
                        <div className="pdp__hero-visual__SW0h9" />
                      </div>

                      <Stack gap="var(--space-100)">
                        <Badge>PDP controls</Badge>
                        <h2 className="preview__heading__SW0gu">Air Motion 01</h2>
                        <p className="preview__copy__SW0gv">
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

                  <Stack gap="var(--space-200)">
                    <Cluster justify="space-between">
                      <h2 className="preview__heading__SW0gu">Forms and auth shell</h2>
                      <Badge>Auth preview</Badge>
                    </Cluster>
                    <Grid minItemWidth="18rem">
                      <FormFrame
                        description="Calm entry flows, understated helper text, and precise monochrome surfaces keep the auth layer aligned with the storefront instead of feeling like a separate product."
                        title="Welcome back!"
                      >
                        <Stack gap="var(--space-75)">
                          <Button fullWidth shape="field" tone="secondary">
                            <GoogleLogoIcon size={18} />
                            Continue with Google
                          </Button>
                          <Button fullWidth shape="field" tone="secondary">
                            <AppleLogoIcon size={18} />
                            Continue with Apple
                          </Button>
                        </Stack>
                        <div className="auth-divider__root__SW0h3">
                          <span className="auth-divider__label__SW0h4">or continue with</span>
                        </div>
                        <TextField
                          description="We will continue to the next auth step after validation."
                          label="Email"
                          placeholder="name@example.com"
                        />
                        <PasswordField label="Password" placeholder="Enter your password" />
                        <Checkbox
                          description="Keep this browser signed in for the next checkout session."
                          label="Remember me"
                        />
                        <Button fullWidth size="lg">
                          Continue
                        </Button>
                      </FormFrame>

                      <Card>
                        <Stack gap="var(--space-100)">
                          <h3 className="preview__heading__SW0gu">Component gallery</h3>
                          <Cluster>
                            <Button size="sm">Primary</Button>
                            <Button size="sm" tone="secondary">
                              Secondary
                            </Button>
                            <Button size="sm" tone="outline">
                              Outline
                            </Button>
                            <Button size="sm" tone="ghost">
                              Ghost
                            </Button>
                            <Button size="sm" tone="danger">
                              Danger
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
          </div>
        </Container>
      </ThemeScope>
    </main>
  );
}
