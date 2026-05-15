import type {
  ThemeBorderTokens,
  ThemeColorTokens,
  ThemeLayoutTokens,
  ThemeMotionTokens,
  ThemeRadiusTokens,
  ThemeShadowTokens,
  ThemeSpacingTokens,
  ThemeTypographyTokens,
  ThemeZIndexTokens,
} from "./theme-definition";

export {
  mergeThemeDefinition,
  monoTheme,
  serializeThemeDefinition,
  themeToCssVariables,
  type ThemeDefinition,
  type ThemeBorderTokens,
  type ThemeColorTokens,
  type ThemeLayoutTokens,
  type ThemeMotionTokens,
  type ThemeRadiusTokens,
  type ThemeShadowTokens,
  type ThemeSpacingTokens,
  type ThemeTypographyTokens,
  type ThemeZIndexTokens,
} from "./theme-definition";

export type ThemeTokenGroups = {
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
