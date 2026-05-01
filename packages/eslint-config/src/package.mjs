import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export function createPackageConfig(extraIgnores = []) {
  return tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      files: ["src/**/*.{ts,tsx,mts}"],
      ignores: ["dist/**", ...extraIgnores],
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir: process.cwd(),
        },
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
          },
        ],
      },
    },
  );
}

