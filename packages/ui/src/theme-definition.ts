export type ThemeColorTokens = {
  accent: string;
  accentSoft: string;
  actionPrimaryBg: string;
  actionPrimaryBgHover: string;
  actionPrimaryBorder: string;
  actionPrimaryBorderHover: string;
  actionPrimaryText: string;
  actionSecondaryBg: string;
  actionSecondaryBgHover: string;
  actionSecondaryBorder: string;
  actionSecondaryBorderHover: string;
  actionSecondaryText: string;
  actionTertiaryText: string;
  accentBorder: string;
  accentBorderStrong: string;
  accentContrast: string;
  accentForeground: string;
  accentSolid: string;
  accentSolidHover: string;
  accentSolidStrong: string;
  accentSurface: string;
  accentSurfaceStrong: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundQuaternary: string;
  backgroundQuinary: string;
  backgroundInverseSubtle: string;
  backdropSoft: string;
  black: string;
  blueContrast: string;
  blueLighter: string;
  bluePrimary: string;
  blueSurface: string;
  blueGradient: string;
  borderInverse: string;
  borderInverseStrong: string;
  borderPrimary: string;
  borderSecondary: string;
  borderStrong: string;
  borderSubtle: string;
  borderTertiary: string;
  canvas: string;
  danger: string;
  dangerBorder: string;
  dangerBorderStrong: string;
  dangerContrast: string;
  dangerForeground: string;
  dangerRing: string;
  dangerSolid: string;
  dangerSolidHover: string;
  dangerSurface: string;
  dangerSurfaceStrong: string;
  focusOutline: string;
  focusRing: string;
  heroOverlayEnd: string;
  heroOverlayStart: string;
  neutral25: string;
  neutral50: string;
  neutral75: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral500: string;
  neutral700: string;
  neutral900: string;
  overlayScrim: string;
  overlayScrimSoft: string;
  overlayScrimStrong: string;
  success: string;
  successBorder: string;
  successForeground: string;
  successSurface: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  textDanger: string;
  textInverse: string;
  textInverseMuted: string;
  textMuted: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  warning: string;
  warningBorder: string;
  warningForeground: string;
  warningSurface: string;
  white: string;
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
  letterSpacingLarge: string;
  letterSpacingMedium: string;
  letterSpacingSmall: string;
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
  weightLight: string;
  weightMedium: string;
  weightRegular: string;
  weightSemibold: string;
};

export type ThemeSpacingTokens = {
  "0": string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
  "1200": string;
  lg: string;
  md: string;
  sm: string;
  xl: string;
  xs: string;
  xxs: string;
};

export type ThemeRadiusTokens = {
  "0": string;
  lg: string;
  md: string;
  pill: string;
  sm: string;
  xl: string;
  xs: string;
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
  easingEmphasis: string;
  easingExit: string;
  easingStandard: string;
  fast: string;
  slow: string;
};

export type ThemeLayoutTokens = {
  formWidth: string;
  headerTopOffset: string;
  heroMinHeight: string;
  navHeight: string;
  pageMaxWidth: string;
  pagePaddingDesktop: string;
  pagePaddingMobile: string;
  promoBannerSize: string;
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

export const monoTheme: ThemeDefinition = {
  border: {
    strong: "1px",
    subtle: "1px",
  },
  color: {
    accent: "#131313",
    accentBorder: "#dfdfdf",
    accentBorderStrong: "#131313",
    accentContrast: "#ffffff",
    accentForeground: "#131313",
    accentSoft: "#f4f4f4",
    accentSolid: "#131313",
    accentSolidHover: "#2c2c2c",
    accentSolidStrong: "#131313",
    accentSurface: "#f4f4f4",
    accentSurfaceStrong: "#ececec",
    actionPrimaryBg: "#131313",
    actionPrimaryBgHover: "#2c2c2c",
    actionPrimaryBorder: "#131313",
    actionPrimaryBorderHover: "#2c2c2c",
    actionPrimaryText: "#ffffff",
    actionSecondaryBg: "#ffffff",
    actionSecondaryBgHover: "#fafafa",
    actionSecondaryBorder: "#dfdfdf",
    actionSecondaryBorderHover: "#c7c7c7",
    actionSecondaryText: "#131313",
    actionTertiaryText: "#a1a1a1",
    backdropSoft:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.12))",
    backgroundPrimary: "#ffffff",
    backgroundSecondary: "#fafafa",
    backgroundTertiary: "#f4f4f4",
    backgroundQuaternary: "#ececec",
    backgroundQuinary: "#131313",
    backgroundInverseSubtle: "#202020",
    black: "#000000",
    blueContrast: "#ffffff",
    blueLighter: "#7fa7ea",
    bluePrimary: "#5f8fdd",
    blueSurface: "color-mix(in srgb, #7fa7ea 12%, #ffffff)",
    blueGradient: "linear-gradient(90deg, #5f8fdd, #7fa7ea)",
    borderInverse: "rgba(255, 255, 255, 0.12)",
    borderInverseStrong: "rgba(255, 255, 255, 0.58)",
    borderPrimary: "#dfdfdf",
    borderSecondary: "#c7c7c7",
    borderStrong: "#a1a1a1",
    borderSubtle: "rgba(19, 19, 19, 0.08)",
    borderTertiary: "rgba(19, 19, 19, 0.08)",
    canvas: "#ffffff",
    danger: "#8f332d",
    dangerBorder: "#e7beb9",
    dangerBorderStrong: "#c75d56",
    dangerContrast: "#fff7f5",
    dangerForeground: "#8f332d",
    dangerRing: "rgba(231, 190, 185, 0.88)",
    dangerSolid: "#b5443c",
    dangerSolidHover: "#9e3730",
    dangerSurface: "#fbe9e6",
    dangerSurfaceStrong: "#f8dbd8",
    focusOutline: "#5f8fdd",
    focusRing: "rgba(95, 143, 221, 0.18)",
    heroOverlayEnd: "rgba(19, 19, 19, 0.2)",
    heroOverlayStart: "rgba(19, 19, 19, 0.03)",
    neutral25: "#fafafa",
    neutral50: "#f4f4f4",
    neutral75: "#ececec",
    neutral100: "#dfdfdf",
    neutral200: "#c7c7c7",
    neutral300: "#a1a1a1",
    neutral500: "#444444",
    neutral700: "#2c2c2c",
    neutral900: "#131313",
    overlayScrim: "rgba(19, 19, 19, 0.62)",
    overlayScrimSoft: "rgba(19, 19, 19, 0.42)",
    overlayScrimStrong: "rgba(19, 19, 19, 0.78)",
    success: "#355d36",
    successBorder: "#bdd1b9",
    successForeground: "#355d36",
    successSurface: "#eef6ec",
    surface: "#ffffff",
    surfaceMuted: "#fafafa",
    surfaceStrong: "#f4f4f4",
    textDanger: "#8f332d",
    textInverse: "#ffffff",
    textInverseMuted: "rgba(255, 255, 255, 0.76)",
    textMuted: "#a1a1a1",
    textPrimary: "#131313",
    textSecondary: "#444444",
    textTertiary: "#a1a1a1",
    warning: "#666666",
    warningBorder: "#c7c7c7",
    warningForeground: "#666666",
    warningSurface: "#f4f4f4",
    white: "#ffffff",
  },
  layout: {
    formWidth: "384px",
    headerTopOffset: "max(0.8rem, env(safe-area-inset-top))",
    heroMinHeight: "41rem",
    navHeight: "4.75rem",
    pageMaxWidth: "86rem",
    pagePaddingDesktop: "1.8rem",
    pagePaddingMobile: "1rem",
    promoBannerSize: "3rem",
  },
  motion: {
    base: "220ms",
    easingEmphasis: "cubic-bezier(0.16, 1, 0.3, 1)",
    easingExit: "cubic-bezier(0.4, 0, 1, 1)",
    easingStandard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    fast: "140ms",
    slow: "320ms",
  },
  radius: {
    "0": "0px",
    lg: "18px",
    md: "12px",
    pill: "9999px",
    sm: "8px",
    xl: "24px",
    xs: "4px",
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
    "0": "0rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
    "4xl": "4rem",
    "5xl": "5rem",
    "1200": "8rem",
    lg: "1.25rem",
    md: "1rem",
    sm: "0.75rem",
    xl: "1.5rem",
    xs: "0.5rem",
    xxs: "0.25rem",
  },
  typography: {
    bodyFamily:
      'var(--font-inter, system-ui), "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    displayFamily:
      'var(--font-inter, system-ui), "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: "2.75rem",
    h2: "2.25rem",
    h3: "1.75rem",
    headingLetterSpacingFlat: "0em",
    headingLetterSpacingTight: "-0.005em",
    headingLineHeight: "1.1",
    hero: "2.75rem",
    label: "0.75rem",
    letterSpacingCaps: "0.08em",
    letterSpacingLarge: "-0.015em",
    letterSpacingMedium: "0.015em",
    letterSpacingSmall: "0.01em",
    lineHeightBase: "1.55",
    lineHeightRelaxed: "1.72",
    lineHeightTight: "1.1",
    monoFamily: '"Geist Mono", "SFMono-Regular", ui-monospace, monospace',
    onMediaBold: "clamp(2.4rem, 5vw, 2.75rem)",
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
    weightLight: "300",
    weightMedium: "500",
    weightRegular: "400",
    weightSemibold: "600",
  },
  zIndex: {
    dropdown: 20,
    modal: 78,
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

  const merged: T = { ...baseRecord };

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

export function mergeThemeDefinition(candidate: unknown, baseTheme: ThemeDefinition = monoTheme) {
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
  /*
    --layout-page-padding is intentionally left in tokens.css because it changes
    inside a media query. Emitting it inline would pin descendants to one value.
  */
  return {
    "--font-body": theme.typography.bodyFamily,
    "--font-display": theme.typography.displayFamily,
    "--font-mono": theme.typography.monoFamily,
    "--font-weight-light": theme.typography.weightLight,
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
    "--tracking-small": theme.typography.letterSpacingSmall,
    "--tracking-medium": theme.typography.letterSpacingMedium,
    "--tracking-large": theme.typography.letterSpacingLarge,
    "--tracking-caps": theme.typography.letterSpacingCaps,
    "--tracking-on-media": theme.typography.onMediaLetterSpacing,

    "--color-white": theme.color.white,
    "--color-black": theme.color.black,
    "--color-neutral-25": theme.color.neutral25,
    "--color-neutral-50": theme.color.neutral50,
    "--color-neutral-75": theme.color.neutral75,
    "--color-neutral-100": theme.color.neutral100,
    "--color-neutral-200": theme.color.neutral200,
    "--color-neutral-300": theme.color.neutral300,
    "--color-neutral-500": theme.color.neutral500,
    "--color-neutral-700": theme.color.neutral700,
    "--color-neutral-900": theme.color.neutral900,

    "--color-bg-primary": theme.color.backgroundPrimary,
    "--color-bg-secondary": theme.color.backgroundSecondary,
    "--color-bg-tertiary": theme.color.backgroundTertiary,
    "--color-bg-quaternary": theme.color.backgroundQuaternary,
    "--color-bg-quinary": theme.color.backgroundQuinary,
    "--color-bg-inverse": theme.color.backgroundQuinary,
    "--color-bg-inverse-subtle": theme.color.backgroundInverseSubtle,
    "--color-page": theme.color.canvas,
    "--color-page-soft": theme.color.surfaceMuted,
    "--color-page-muted": theme.color.surfaceStrong,
    "--color-surface": theme.color.surface,
    "--color-surface-soft": theme.color.surfaceStrong,
    "--color-inverse": theme.color.backgroundQuinary,
    "--color-inverse-soft": theme.color.backgroundInverseSubtle,
    "--color-text-primary": theme.color.textPrimary,
    "--color-text-secondary": theme.color.textSecondary,
    "--color-text-tertiary": theme.color.textTertiary,
    "--color-text-inverse": theme.color.textInverse,
    "--color-text-inverse-muted": theme.color.textInverseMuted,
    "--color-text-danger": theme.color.textDanger,
    "--color-border-primary": theme.color.borderPrimary,
    "--color-border-secondary": theme.color.borderSecondary,
    "--color-border-strong": theme.color.borderStrong,
    "--color-border-subtle": theme.color.borderSubtle,
    "--color-border-tertiary": theme.color.borderTertiary,
    "--color-border-inverse": theme.color.borderInverse,
    "--color-border-inverse-strong": theme.color.borderInverseStrong,
    "--color-blue-primary": theme.color.bluePrimary,
    "--color-blue-lighter": theme.color.blueLighter,
    "--color-blue-contrast": theme.color.blueContrast,
    "--color-blue-surface": theme.color.blueSurface,
    "--color-blue-gradient": theme.color.blueGradient,
    "--color-accent-solid": theme.color.accentSolid,
    "--color-accent-solid-hover": theme.color.accentSolidHover,
    "--color-accent-solid-strong": theme.color.accentSolidStrong,
    "--color-accent-contrast": theme.color.accentContrast,
    "--color-accent-surface": theme.color.accentSurface,
    "--color-accent-surface-strong": theme.color.accentSurfaceStrong,
    "--color-accent-border": theme.color.accentBorder,
    "--color-accent-border-strong": theme.color.accentBorderStrong,
    "--color-accent-foreground": theme.color.accentForeground,

    "--color-action-primary-bg": theme.color.actionPrimaryBg,
    "--color-action-primary-bg-hover": theme.color.actionPrimaryBgHover,
    "--color-action-primary-border": theme.color.actionPrimaryBorder,
    "--color-action-primary-border-hover": theme.color.actionPrimaryBorderHover,
    "--color-action-primary-text": theme.color.actionPrimaryText,
    "--color-action-secondary-bg": theme.color.actionSecondaryBg,
    "--color-action-secondary-bg-hover": theme.color.actionSecondaryBgHover,
    "--color-action-secondary-border": theme.color.actionSecondaryBorder,
    "--color-action-secondary-border-hover": theme.color.actionSecondaryBorderHover,
    "--color-action-secondary-text": theme.color.actionSecondaryText,
    "--color-action-tertiary-text": theme.color.actionTertiaryText,

    "--color-success-surface": theme.color.successSurface,
    "--color-success-border": theme.color.successBorder,
    "--color-success-foreground": theme.color.successForeground,
    "--color-warning-surface": theme.color.warningSurface,
    "--color-warning-border": theme.color.warningBorder,
    "--color-warning-foreground": theme.color.warningForeground,
    "--color-danger-solid": theme.color.dangerSolid,
    "--color-danger-solid-hover": theme.color.dangerSolidHover,
    "--color-danger-contrast": theme.color.dangerContrast,
    "--color-danger-surface": theme.color.dangerSurface,
    "--color-danger-surface-strong": theme.color.dangerSurfaceStrong,
    "--color-danger-border": theme.color.dangerBorder,
    "--color-danger-border-strong": theme.color.dangerBorderStrong,
    "--color-danger-foreground": theme.color.dangerForeground,
    "--color-danger-ring": theme.color.dangerRing,
    "--color-focus-outline": theme.color.backgroundInverseSubtle,
    "--color-focus-ring": theme.color.backgroundInverseSubtle,
    "--color-overlay-scrim-strong": theme.color.overlayScrimStrong,
    "--color-overlay-scrim": theme.color.overlayScrim,
    "--color-overlay-scrim-soft": theme.color.overlayScrimSoft,
    "--color-backdrop-soft": theme.color.backdropSoft,
    "--hero-overlay-start": theme.color.heroOverlayStart,
    "--hero-overlay-end": theme.color.heroOverlayEnd,

    "--space-0": theme.spacing["0"],
    "--space-25": theme.spacing.xxs,
    "--space-50": theme.spacing.xs,
    "--space-75": theme.spacing.sm,
    "--space-100": theme.spacing.md,
    "--space-150": theme.spacing.lg,
    "--space-200": theme.spacing.xl,
    "--space-300": theme.spacing["2xl"],
    "--space-400": theme.spacing["3xl"],
    "--space-600": theme.spacing["4xl"],
    "--space-800": theme.spacing["5xl"],
    "--space-1200": theme.spacing["1200"],
    "--space-xs": theme.spacing.xs,
    "--space-sm": theme.spacing.sm,
    "--space-md": theme.spacing.md,
    "--space-lg": theme.spacing.lg,
    "--space-xl": theme.spacing.xl,
    "--space-2xl": theme.spacing["2xl"],
    "--space-3xl": theme.spacing["3xl"],
    "--space-4xl": theme.spacing["4xl"],
    "--space-5xl": theme.spacing["5xl"],

    "--layout-page-max-width": theme.layout.pageMaxWidth,
    "--layout-form-width": theme.layout.formWidth,
    "--layout-page-padding-mobile": theme.layout.pagePaddingMobile,
    "--layout-page-padding-desktop": theme.layout.pagePaddingDesktop,
    "--layout-header-block-size": theme.layout.navHeight,
    "--layout-promo-banner-size": theme.layout.promoBannerSize,
    "--layout-header-clearance": `calc(${theme.layout.navHeight} + ${theme.layout.promoBannerSize})`,
    "--layout-header-top-offset": theme.layout.headerTopOffset,
    "--layout-hero-min-height": theme.layout.heroMinHeight,

    "--radius-0": theme.radius["0"],
    "--radius-xs": theme.radius.xs,
    "--radius-sm": theme.radius.sm,
    "--radius-md": theme.radius.md,
    "--radius-lg": theme.radius.lg,
    "--radius-xl": theme.radius.xl,
    "--radius-pill": theme.radius.pill,
    "--radius-large": theme.radius.lg,

    "--duration-fast": theme.motion.fast,
    "--duration-standard": theme.motion.base,
    "--duration-slow": theme.motion.slow,
    "--easing-standard": theme.motion.easingStandard,
    "--easing-emphasis": theme.motion.easingEmphasis,
    "--easing-exit": theme.motion.easingExit,

    "--shadow-1": theme.shadow.soft,
    "--shadow-2": theme.shadow.raised,
    "--shadow-frost": theme.shadow.overlay,
    "--shadow-floating": theme.shadow.soft,
    "--shadow-floating-strong": theme.shadow.raised,

    "--button-font-family": theme.typography.displayFamily,
    "--button-radius": theme.radius.pill,
    "--button-height-sm": "var(--control-height-sm)",
    "--button-height-md": "var(--control-height-md)",
    "--button-height-lg": "var(--control-height-lg)",
    "--control-height-sm": "40px",
    "--control-height-md": "46px",
    "--control-height-lg": "52px",
    "--control-radius": theme.radius.xs,
    "--control-disabled-opacity": "0.52",
    "--card-bg": theme.color.backgroundPrimary,
    "--card-border": theme.color.borderTertiary,
    "--card-radius": theme.radius.sm,
    "--card-shadow": "none",
    "--overlay-backdrop": theme.color.overlayScrim,
    "--overlay-backdrop-strong": theme.color.overlayScrimStrong,
    "--overlay-backdrop-soft": theme.color.overlayScrimSoft,
    "--overlay-surface": theme.color.backgroundPrimary,
    "--overlay-border": theme.color.borderTertiary,
    "--overlay-radius": theme.radius.md,
    "--overlay-shadow": theme.shadow.overlay,
    "--overlay-z-modal": String(theme.zIndex.modal),
    "--overlay-z-drawer": String(theme.zIndex.modal + 1),
    "--overlay-z-alert": String(theme.zIndex.modal + 2),
    "--overlay-z-toast": String(theme.zIndex.modal + 18),
    "--chrome-header-bg": "rgba(251, 251, 251, 0.8)",
    "--chrome-header-bg-docked": "rgba(251, 251, 251, 0.8)",
    "--chrome-header-backdrop-filter": "saturate(180%) blur(20px)",
    "--chrome-header-shadow": "none",
    "--chrome-footer-bg": theme.color.backgroundPrimary,
    "--chrome-footer-border": theme.color.borderPrimary,
  } satisfies Record<string, string>;
}

export function serializeThemeDefinition(theme: ThemeDefinition) {
  return JSON.stringify(theme, null, 2);
}
