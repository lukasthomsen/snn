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
  h1: string;
  h2: string;
  h3: string;
  headingLetterSpacingFlat: string;
  headingLetterSpacingTight: string;
  headingLineHeight: string;
  hero: string;
  label: string;
  letterSpacingCaps: string;
  lineHeightBase: string;
  lineHeightRelaxed: string;
  lineHeightTight: string;
  monoFamily: string;
  onMediaBold: string;
  onMediaLetterSpacing: string;
  onMediaLineHeight: string;
  size2xs: string;
  size2xl: string;
  size2xlPlus: string;
  size3xl: string;
  size3xlPlus: string;
  size4xl: string;
  size5xl: string;
  size6xl: string;
  size7xl: string;
  sizeLg: string;
  sizeLgPlus: string;
  sizeMd: string;
  sizeMdPlus: string;
  sizeSm: string;
  sizeSmPlus: string;
  sizeXl: string;
  sizeXlPlus: string;
  sizeXs: string;
  sizeXsPlus: string;
  weightBold: string;
  weightHeavy: string;
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
  heroMinHeight: string;
  navHeight: string;
  pageMaxWidth: string;
  pagePaddingDesktop: string;
  pagePaddingMobile: string;
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
    strong: "1px",
    subtle: "1px",
  },
  color: {
    accent: "#131313",
    accentSoft: "#f4f4f4",
    actionPrimaryBg: "#131313",
    actionPrimaryText: "#ffffff",
    actionSecondaryBg: "#ffffff",
    actionSecondaryBorder: "#dfdfdf",
    actionSecondaryText: "#131313",
    actionTertiaryText: "#131313",
    borderStrong: "#c7c7c7",
    borderSubtle: "#dfdfdf",
    canvas: "#ffffff",
    danger: "#8f332d",
    focusRing: "rgba(19, 19, 19, 0.1)",
    heroOverlayEnd: "rgba(19, 19, 19, 0.2)",
    heroOverlayStart: "rgba(19, 19, 19, 0.03)",
    success: "#355d36",
    surface: "#ffffff",
    surfaceMuted: "#fafafa",
    surfaceStrong: "#f4f4f4",
    textInverse: "#ffffff",
    textMuted: "#a1a1a1",
    textPrimary: "#131313",
    textSecondary: "#666666",
    warning: "#666666",
  },
  layout: {
    heroMinHeight: "41rem",
    navHeight: "4.75rem",
    pageMaxWidth: "86rem",
    pagePaddingDesktop: "1.8rem",
    pagePaddingMobile: "1rem",
  },
  motion: {
    base: "220ms",
    easingStandard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    fast: "140ms",
    slow: "320ms",
  },
  radius: {
    lg: "18px",
    md: "12px",
    pill: "9999px",
    sm: "8px",
    xl: "24px",
  },
  shadow: {
    overlay:
      "0 18px 40px rgba(19, 19, 19, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.64)",
    raised:
      "0 24px 52px rgba(19, 19, 19, 0.12), 0 4px 14px rgba(19, 19, 19, 0.06)",
    soft:
      "0 18px 40px rgba(19, 19, 19, 0.08), 0 2px 8px rgba(19, 19, 19, 0.04)",
  },
  spacing: {
    "2xl": "2rem",
    "3xl": "2.75rem",
    "4xl": "4.5rem",
    "5xl": "6rem",
    lg: "1.5rem",
    md: "1rem",
    sm: "0.75rem",
    xl: "1.25rem",
    xs: "0.5rem",
    xxs: "0.25rem",
  },
  typography: {
    bodyFamily:
      'var(--font-public-sans), "Public Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    displayFamily:
      'var(--font-archivo), "Archivo", "Arial Narrow", "Helvetica Neue", Arial, sans-serif',
    h1: "3.5rem",
    h2: "3rem",
    h3: "2.5rem",
    headingLetterSpacingFlat: "0em",
    headingLetterSpacingTight: "-0.005em",
    headingLineHeight: "1.1",
    hero: "3.5rem",
    label: "0.75rem",
    letterSpacingCaps: "0.08em",
    lineHeightBase: "1.55",
    lineHeightRelaxed: "1.72",
    lineHeightTight: "1.1",
    monoFamily: '"Geist Mono", "SFMono-Regular", ui-monospace, monospace',
    onMediaBold: "clamp(3.5rem, 7vw, 5.5rem)",
    onMediaLetterSpacing: "-0.03em",
    onMediaLineHeight: "0.92",
    size2xs: "0.6875rem",
    size2xl: "1.375rem",
    size2xlPlus: "1.5rem",
    size3xl: "1.75rem",
    size3xlPlus: "2rem",
    size4xl: "2.25rem",
    size5xl: "2.5rem",
    size6xl: "3rem",
    size7xl: "3.5rem",
    sizeLg: "1.0625rem",
    sizeLgPlus: "1.125rem",
    sizeMd: "0.9375rem",
    sizeMdPlus: "1rem",
    sizeSm: "0.8125rem",
    sizeSmPlus: "0.875rem",
    sizeXl: "1.1875rem",
    sizeXlPlus: "1.25rem",
    sizeXs: "0.75rem",
    sizeXsPlus: "0.78125rem",
    weightBold: "700",
    weightHeavy: "800",
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
    "--font-body": theme.typography.bodyFamily,
    "--font-display": theme.typography.displayFamily,
    "--font-mono": theme.typography.monoFamily,
    "--font-weight-normal": theme.typography.weightRegular,
    "--font-weight-medium": theme.typography.weightMedium,
    "--font-weight-semibold": theme.typography.weightSemibold,
    "--font-weight-bold": theme.typography.weightBold,
    "--font-weight-heavy": theme.typography.weightHeavy,

    "--text-2xs": theme.typography.size2xs,
    "--text-xs": theme.typography.sizeXs,
    "--text-xs-plus": theme.typography.sizeXsPlus,
    "--text-sm": theme.typography.sizeSm,
    "--text-sm-plus": theme.typography.sizeSmPlus,
    "--text-md": theme.typography.sizeMd,
    "--text-md-plus": theme.typography.sizeMdPlus,
    "--text-lg": theme.typography.sizeLg,
    "--text-lg-plus": theme.typography.sizeLgPlus,
    "--text-xl": theme.typography.sizeXl,
    "--text-xl-plus": theme.typography.sizeXlPlus,
    "--text-2xl": theme.typography.size2xl,
    "--text-2xl-plus": theme.typography.size2xlPlus,
    "--text-3xl": theme.typography.size3xl,
    "--text-3xl-plus": theme.typography.size3xlPlus,
    "--text-4xl": theme.typography.size4xl,
    "--text-5xl": theme.typography.size5xl,
    "--text-6xl": theme.typography.size6xl,
    "--text-7xl": theme.typography.size7xl,
    "--text-h3": theme.typography.h3,
    "--text-h2": theme.typography.h2,
    "--text-h1": theme.typography.h1,
    "--text-hero": theme.typography.hero,
    "--text-on-media": theme.typography.onMediaBold,
    "--text-small": theme.typography.sizeSm,
    "--text-small-plus": theme.typography.sizeSmPlus,
    "--text-regular": theme.typography.sizeMd,
    "--text-regular-plus": theme.typography.sizeMdPlus,
    "--text-large": theme.typography.sizeLg,
    "--text-large-plus": theme.typography.sizeLgPlus,

    "--line-tight": theme.typography.lineHeightTight,
    "--line-base": theme.typography.lineHeightBase,
    "--line-relaxed": theme.typography.lineHeightRelaxed,
    "--line-on-media": theme.typography.onMediaLineHeight,
    "--tracking-tight": theme.typography.headingLetterSpacingTight,
    "--tracking-flat": theme.typography.headingLetterSpacingFlat,
    "--tracking-caps": theme.typography.letterSpacingCaps,
    "--tracking-on-media": theme.typography.onMediaLetterSpacing,

    "--color-page": theme.color.canvas,
    "--color-page-soft": theme.color.surfaceMuted,
    "--color-page-muted": theme.color.surfaceStrong,
    "--color-surface": theme.color.surface,
    "--color-surface-soft": theme.color.surfaceStrong,
    "--color-inverse": "#131313",
    "--color-text-primary": theme.color.textPrimary,
    "--color-text-secondary": theme.color.textSecondary,
    "--color-text-tertiary": theme.color.textMuted,
    "--color-text-inverse": theme.color.textInverse,
    "--color-border-primary": theme.color.borderSubtle,
    "--color-border-secondary": theme.color.borderStrong,
    "--color-border-strong": theme.color.borderStrong,
    "--color-border-subtle": theme.color.borderSubtle,
    "--color-border-tertiary": theme.color.borderSubtle,
    "--color-accent-solid": theme.color.actionPrimaryBg,
    "--color-accent-solid-hover": theme.color.accent,
    "--color-accent-contrast": theme.color.actionPrimaryText,
    "--color-accent-surface": theme.color.accentSoft,
    "--color-accent-foreground": theme.color.actionTertiaryText,
    "--color-accent-border-strong": theme.color.actionPrimaryBg,
    "--color-success-foreground": theme.color.success,
    "--color-danger-foreground": theme.color.danger,
    "--color-danger-solid": theme.color.danger,
    "--color-danger-solid-hover": theme.color.danger,
    "--color-danger-border-strong": theme.color.danger,
    "--color-focus-ring": theme.color.focusRing,
    "--hero-overlay-start": theme.color.heroOverlayStart,
    "--hero-overlay-end": theme.color.heroOverlayEnd,

    "--space-25": theme.spacing.xxs,
    "--space-50": theme.spacing.xs,
    "--space-75": theme.spacing.sm,
    "--space-100": theme.spacing.md,
    "--space-150": theme.spacing.xl,
    "--space-200": theme.spacing.lg,
    "--space-300": theme.spacing["2xl"],
    "--space-400": theme.spacing["3xl"],
    "--space-600": theme.spacing["4xl"],
    "--space-800": theme.spacing["5xl"],

    "--layout-page-max-width": theme.layout.pageMaxWidth,
    "--layout-page-padding-mobile": theme.layout.pagePaddingMobile,
    "--layout-page-padding-desktop": theme.layout.pagePaddingDesktop,
    "--layout-header-block-size": theme.layout.navHeight,
    "--layout-header-clearance": theme.layout.navHeight,
    "--layout-hero-min-height": theme.layout.heroMinHeight,

    "--radius-sm": theme.radius.sm,
    "--radius-md": theme.radius.md,
    "--radius-lg": theme.radius.lg,
    "--radius-xl": theme.radius.xl,
    "--radius-pill": theme.radius.pill,

    "--duration-fast": theme.motion.fast,
    "--duration-standard": theme.motion.base,
    "--duration-slow": theme.motion.slow,
    "--easing-standard": theme.motion.easingStandard,

    "--shadow-1": theme.shadow.soft,
    "--shadow-2": theme.shadow.raised,
    "--shadow-frost": theme.shadow.overlay,
    "--shadow-floating": theme.shadow.soft,
    "--shadow-floating-strong": theme.shadow.raised,
  } satisfies Record<string, string>;
}

export function serializeThemeDefinition(theme: ThemeDefinition) {
  return JSON.stringify(theme, null, 2);
}
