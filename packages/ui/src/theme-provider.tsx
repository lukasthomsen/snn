"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CSSProperties } from "react";

import { themeToCssVariables, type ThemeDefinition, nikeAppleBlendTheme } from "./theme-definition";

const ThemeDefinitionContext = createContext<ThemeDefinition>(nikeAppleBlendTheme);

type ThemeScopeProps = {
  children: ReactNode;
  className?: string;
  theme: ThemeDefinition;
};

export function ThemeScope({ children, className, theme }: ThemeScopeProps) {
  return (
    <ThemeDefinitionContext.Provider value={theme}>
      <div className={className} style={themeToCssVariables(theme) as CSSProperties}>
        {children}
      </div>
    </ThemeDefinitionContext.Provider>
  );
}

export function useThemeDefinition() {
  return useContext(ThemeDefinitionContext);
}
