export {
  mergeThemeDefinition,
  nikeAppleBlendTheme,
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
  border: import("./theme-definition").ThemeBorderTokens;
  color: import("./theme-definition").ThemeColorTokens;
  layout: import("./theme-definition").ThemeLayoutTokens;
  motion: import("./theme-definition").ThemeMotionTokens;
  radius: import("./theme-definition").ThemeRadiusTokens;
  shadow: import("./theme-definition").ThemeShadowTokens;
  spacing: import("./theme-definition").ThemeSpacingTokens;
  typography: import("./theme-definition").ThemeTypographyTokens;
  zIndex: import("./theme-definition").ThemeZIndexTokens;
};
