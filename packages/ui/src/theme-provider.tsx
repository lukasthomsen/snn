"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CSSProperties } from "react";

import {
  nikeAppleBlendTheme,
  themeToCssVariables,
  type ThemeDefinition,
} from "./theme-definition";

const ThemeDefinitionContext = createContext<ThemeDefinition>(nikeAppleBlendTheme);

type ThemeScopeProps = {
  children: ReactNode;
  className?: string;
  name?: string;
  theme: ThemeDefinition;
};

export function ThemeScope({
  children,
  className,
  name = "mono",
  theme,
}: ThemeScopeProps) {
  return (
    <ThemeDefinitionContext.Provider value={theme}>
      <div
        className={className}
        data-theme={name}
        style={themeToCssVariables(theme) as CSSProperties}
      >
        {children}
      </div>
    </ThemeDefinitionContext.Provider>
  );
}

export function useThemeDefinition() {
  return useContext(ThemeDefinitionContext);
}
