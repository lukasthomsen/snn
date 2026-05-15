import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dryRun = process.argv.includes("--dry-run");
const removableDirectoryNames = new Set([".next", ".turbo"]);
const skipDirectoryNames = new Set([".git", "node_modules", ".pnpm-store"]);
const targets = new Set<string>();

function addTarget(target: string) {
  targets.add(path.resolve(target));
}

function walk(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (skipDirectoryNames.has(entry.name)) {
        continue;
      }

      if (removableDirectoryNames.has(entry.name)) {
        addTarget(absolutePath);
        continue;
      }

      walk(absolutePath);
      continue;
    }

    if (entry.isFile() && entry.name === ".DS_Store") {
      addTarget(absolutePath);
    }
  }
}

walk(repoRoot);

const sortedTargets = [...targets].sort((a, b) => a.localeCompare(b));

if (sortedTargets.length === 0) {
  console.log("No generated artifacts found.");
  process.exit(0);
}

for (const target of sortedTargets) {
  const relativeTarget = path.relative(repoRoot, target);

  if (!target.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error(`Refusing to remove path outside the repo: ${target}`);
  }

  if (dryRun) {
    console.log(`Would remove ${relativeTarget}`);
    continue;
  }

  const stat = statSync(target);

  rmSync(target, {
    force: true,
    recursive: stat.isDirectory(),
  });

  console.log(`Removed ${relativeTarget}`);
}
