export type ThemeColorTokens = {
  accent: string;
  accentSoft: string;
  actionPrimaryBg: string;
  actionPrimaryText: string;
  actionSecondaryBg: string;
  actionSecondaryBorder: string;
  actionSecondaryText: string;
  actionTertiaryText: string;
  borderStrong: string;
  borderSubtle: string;
  canvas: string;
  danger: string;
  focusRing: string;
  heroOverlayEnd: string;
  heroOverlayStart: string;
  success: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  textInverse: string;
  textMuted: string;
  textPrimary: string;
  textSecondary: string;
  warning: string;
};

export type ThemeTypographyTokens = {
  bodyFamily: string;
  displayFamily: string;
  hero: string;
  label: string;
  letterSpacingCaps: string;
  lineHeightBase: string;
  lineHeightRelaxed: string;
  lineHeightTight: string;
  monoFamily: string;
  size2xl: string;
  size3xl: string;
  size4xl: string;
  size5xl: string;
  sizeLg: string;
  sizeMd: string;
  sizeSm: string;
  sizeXl: string;
  sizeXs: string;
  weightBold: string;
  weightMedium: string;
  weightRegular: string;
  weightSemibold: string;
};

export type ThemeSpacingTokens = {
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
  lg: string;
  md: string;
  sm: string;
  xl: string;
  xs: string;
  xxs: string;
};

export type ThemeRadiusTokens = {
  lg: string;
  md: string;
  pill: string;
  sm: string;
  xl: string;
};

export type ThemeBorderTokens = {
  strong: string;
  subtle: string;
};

export type ThemeShadowTokens = {
  overlay: string;
  raised: string;
  soft: string;
};

export type ThemeMotionTokens = {
  base: string;
  easingStandard: string;
  fast: string;
  slow: string;
};

export type ThemeLayoutTokens = {
  contentMaxWidth: string;
  heroMinHeight: string;
  navHeight: string;
  pageMaxWidth: string;
};

export type ThemeZIndexTokens = {
  dropdown: number;
  modal: number;
  overlay: number;
  sticky: number;
};

export type ThemeDefinition = {
  border: ThemeBorderTokens;
  color: ThemeColorTokens;
  layout: ThemeLayoutTokens;
  motion: ThemeMotionTokens;
  radius: ThemeRadiusTokens;
  shadow: ThemeShadowTokens;
  spacing: ThemeSpacingTokens;
  typography: ThemeTypographyTokens;
  zIndex: ThemeZIndexTokens;
};

export const nikeAppleBlendTheme: ThemeDefinition = {
  border: {
    strong: "1.5px",
    subtle: "1px",
  },
  color: {
    accent: "#0a59d1",
    accentSoft: "#dbe9ff",
    actionPrimaryBg: "#0c0c0b",
    actionPrimaryText: "#fbfbf8",
    actionSecondaryBg: "#ffffff",
    actionSecondaryBorder: "#1a1a17",
    actionSecondaryText: "#11110f",
    actionTertiaryText: "#11110f",
    borderStrong: "#1a1a17",
    borderSubtle: "#d7d7d0",
    canvas: "#f4f4f1",
    danger: "#b3261e",
    focusRing: "#1d68ff",
    heroOverlayEnd: "rgb(12 12 11 / 0.52)",
    heroOverlayStart: "rgb(12 12 11 / 0.02)",
    success: "#0d7a45",
    surface: "#ffffff",
    surfaceMuted: "#efefea",
    surfaceStrong: "#ddddd5",
    textInverse: "#fbfbf8",
    textMuted: "#71716b",
    textPrimary: "#10100f",
    textSecondary: "#4d4d47",
    warning: "#9b6a00",
  },
  layout: {
    contentMaxWidth: "78rem",
    heroMinHeight: "34rem",
    navHeight: "5rem",
    pageMaxWidth: "90rem",
  },
  motion: {
    base: "180ms",
    easingStandard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    fast: "120ms",
    slow: "280ms",
  },
  radius: {
    lg: "1.5rem",
    md: "1rem",
    pill: "999px",
    sm: "0.75rem",
    xl: "2rem",
  },
  shadow: {
    overlay: "0 24px 80px rgb(12 12 11 / 0.24)",
    raised: "0 18px 60px rgb(12 12 11 / 0.12)",
    soft: "0 10px 30px rgb(12 12 11 / 0.08)",
  },
  spacing: {
    "2xl": "2rem",
    "3xl": "3rem",
    "4xl": "4rem",
    "5xl": "6rem",
    lg: "1.5rem",
    md: "1rem",
    sm: "0.75rem",
    xl: "1.75rem",
    xs: "0.5rem",
    xxs: "0.25rem",
  },
  typography: {
    bodyFamily: 'var(--font-manrope), "Manrope", "Segoe UI", sans-serif',
    displayFamily: 'var(--font-oswald), "Oswald", "Arial Narrow", sans-serif',
    hero: "clamp(4rem, 9vw, 7.5rem)",
    label: "0.75rem",
    letterSpacingCaps: "0.14em",
    lineHeightBase: "1.5",
    lineHeightRelaxed: "1.75",
    lineHeightTight: "0.94",
    monoFamily: '"SFMono-Regular", ui-monospace, monospace',
    size2xl: "1.75rem",
    size3xl: "2.5rem",
    size4xl: "3.5rem",
    size5xl: "5rem",
    sizeLg: "1.125rem",
    sizeMd: "1rem",
    sizeSm: "0.875rem",
    sizeXl: "1.35rem",
    sizeXs: "0.75rem",
    weightBold: "700",
    weightMedium: "500",
    weightRegular: "400",
    weightSemibold: "600",
  },
  zIndex: {
    dropdown: 20,
    modal: 50,
    overlay: 40,
    sticky: 30,
  },
};

function mergeRecord<T extends Record<string, string | number>>(
  baseRecord: T,
  candidate: unknown,
): T {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return baseRecord;
  }

  const merged = { ...baseRecord } as T;

  for (const [key, value] of Object.entries(candidate)) {
    if (!(key in baseRecord)) {
      continue;
    }

    const typedKey = key as keyof T;
    const currentValue = baseRecord[typedKey];

    if (typeof currentValue === "number") {
      if (typeof value === "number" && Number.isFinite(value)) {
        merged[typedKey] = value as T[keyof T];
      }

      continue;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      merged[typedKey] = value as T[keyof T];
    }
  }

  return merged;
}

export function mergeThemeDefinition(candidate: unknown, baseTheme: ThemeDefinition = nikeAppleBlendTheme) {
  const parsed =
    candidate && typeof candidate === "object" && !Array.isArray(candidate)
      ? (candidate as Partial<ThemeDefinition>)
      : {};

  return {
    border: mergeRecord(baseTheme.border, parsed.border),
    color: mergeRecord(baseTheme.color, parsed.color),
    layout: mergeRecord(baseTheme.layout, parsed.layout),
    motion: mergeRecord(baseTheme.motion, parsed.motion),
    radius: mergeRecord(baseTheme.radius, parsed.radius),
    shadow: mergeRecord(baseTheme.shadow, parsed.shadow),
    spacing: mergeRecord(baseTheme.spacing, parsed.spacing),
    typography: mergeRecord(baseTheme.typography, parsed.typography),
    zIndex: mergeRecord(baseTheme.zIndex, parsed.zIndex),
  } satisfies ThemeDefinition;
}

export function themeToCssVariables(theme: ThemeDefinition) {
  return {
    "--ui-border-strong": theme.border.strong,
    "--ui-border-subtle": theme.border.subtle,
    "--ui-color-accent": theme.color.accent,
    "--ui-color-accent-soft": theme.color.accentSoft,
    "--ui-color-action-primary-bg": theme.color.actionPrimaryBg,
    "--ui-color-action-primary-text": theme.color.actionPrimaryText,
    "--ui-color-action-secondary-bg": theme.color.actionSecondaryBg,
    "--ui-color-action-secondary-border": theme.color.actionSecondaryBorder,
    "--ui-color-action-secondary-text": theme.color.actionSecondaryText,
    "--ui-color-action-tertiary-text": theme.color.actionTertiaryText,
    "--ui-color-border-strong": theme.color.borderStrong,
    "--ui-color-border-subtle": theme.color.borderSubtle,
    "--ui-color-canvas": theme.color.canvas,
    "--ui-color-danger": theme.color.danger,
    "--ui-color-focus-ring": theme.color.focusRing,
    "--ui-color-hero-overlay-end": theme.color.heroOverlayEnd,
    "--ui-color-hero-overlay-start": theme.color.heroOverlayStart,
    "--ui-color-success": theme.color.success,
    "--ui-color-surface": theme.color.surface,
    "--ui-color-surface-muted": theme.color.surfaceMuted,
    "--ui-color-surface-strong": theme.color.surfaceStrong,
    "--ui-color-text-inverse": theme.color.textInverse,
    "--ui-color-text-muted": theme.color.textMuted,
    "--ui-color-text-primary": theme.color.textPrimary,
    "--ui-color-text-secondary": theme.color.textSecondary,
    "--ui-color-warning": theme.color.warning,
    "--ui-layout-content-max-width": theme.layout.contentMaxWidth,
    "--ui-layout-hero-min-height": theme.layout.heroMinHeight,
    "--ui-layout-nav-height": theme.layout.navHeight,
    "--ui-layout-page-max-width": theme.layout.pageMaxWidth,
    "--ui-motion-base": theme.motion.base,
    "--ui-motion-easing-standard": theme.motion.easingStandard,
    "--ui-motion-fast": theme.motion.fast,
    "--ui-motion-slow": theme.motion.slow,
    "--ui-radius-lg": theme.radius.lg,
    "--ui-radius-md": theme.radius.md,
    "--ui-radius-pill": theme.radius.pill,
    "--ui-radius-sm": theme.radius.sm,
    "--ui-radius-xl": theme.radius.xl,
    "--ui-shadow-overlay": theme.shadow.overlay,
    "--ui-shadow-raised": theme.shadow.raised,
    "--ui-shadow-soft": theme.shadow.soft,
    "--ui-space-2xl": theme.spacing["2xl"],
    "--ui-space-3xl": theme.spacing["3xl"],
    "--ui-space-4xl": theme.spacing["4xl"],
    "--ui-space-5xl": theme.spacing["5xl"],
    "--ui-space-lg": theme.spacing.lg,
    "--ui-space-md": theme.spacing.md,
    "--ui-space-sm": theme.spacing.sm,
    "--ui-space-xl": theme.spacing.xl,
    "--ui-space-xs": theme.spacing.xs,
    "--ui-space-xxs": theme.spacing.xxs,
    "--ui-typography-body-family": theme.typography.bodyFamily,
    "--ui-typography-display-family": theme.typography.displayFamily,
    "--ui-typography-hero": theme.typography.hero,
    "--ui-typography-label": theme.typography.label,
    "--ui-typography-letter-spacing-caps": theme.typography.letterSpacingCaps,
    "--ui-typography-line-height-base": theme.typography.lineHeightBase,
    "--ui-typography-line-height-relaxed": theme.typography.lineHeightRelaxed,
    "--ui-typography-line-height-tight": theme.typography.lineHeightTight,
    "--ui-typography-mono-family": theme.typography.monoFamily,
    "--ui-typography-size-2xl": theme.typography.size2xl,
    "--ui-typography-size-3xl": theme.typography.size3xl,
    "--ui-typography-size-4xl": theme.typography.size4xl,
    "--ui-typography-size-5xl": theme.typography.size5xl,
    "--ui-typography-size-lg": theme.typography.sizeLg,
    "--ui-typography-size-md": theme.typography.sizeMd,
    "--ui-typography-size-sm": theme.typography.sizeSm,
    "--ui-typography-size-xl": theme.typography.sizeXl,
    "--ui-typography-size-xs": theme.typography.sizeXs,
    "--ui-typography-weight-bold": theme.typography.weightBold,
    "--ui-typography-weight-medium": theme.typography.weightMedium,
    "--ui-typography-weight-regular": theme.typography.weightRegular,
    "--ui-typography-weight-semibold": theme.typography.weightSemibold,
    "--ui-z-dropdown": String(theme.zIndex.dropdown),
    "--ui-z-modal": String(theme.zIndex.modal),
    "--ui-z-overlay": String(theme.zIndex.overlay),
    "--ui-z-sticky": String(theme.zIndex.sticky),
  } satisfies Record<string, string>;
}

export function serializeThemeDefinition(theme: ThemeDefinition) {
  return JSON.stringify(theme, null, 2);
}
