import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type JournalEntry = {
  idx: number;
  tag: string;
};

type Journal = {
  entries?: JournalEntry[];
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const migrationsDir = path.join(repoRoot, "drizzle");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");
const migrationFilePattern = /^(\d{4})_(.+)\.sql$/;
const snapshotFilePattern = /^(\d{4})_snapshot\.json$/;

function fail(message: string, details: string[] = []) {
  console.error(`Migration check failed: ${message}`);

  for (const detail of details) {
    console.error(`- ${detail}`);
  }

  process.exitCode = 1;
}

function collectDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return [...duplicates].sort();
}

function readJournal() {
  if (!existsSync(journalPath)) {
    fail("Drizzle journal is missing.", [path.relative(repoRoot, journalPath)]);
    return null;
  }

  try {
    return JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
  } catch (error) {
    fail("Drizzle journal is not valid JSON.", [error instanceof Error ? error.message : String(error)]);
    return null;
  }
}

function main() {
  const journal = readJournal();

  if (!journal) {
    return;
  }

  const entries = journal.entries ?? [];
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => migrationFilePattern.test(file))
    .sort();
  const snapshotFiles = readdirSync(path.join(migrationsDir, "meta"))
    .filter((file) => snapshotFilePattern.test(file))
    .sort();

  const migrationTags = migrationFiles.map((file) => file.replace(/\.sql$/, ""));
  const migrationNumbers = migrationFiles.map((file) => file.slice(0, 4));
  const journalTags = entries.map((entry) => entry.tag);
  const journalIndexes = entries.map((entry) => String(entry.idx).padStart(4, "0"));
  const snapshotIndexes = snapshotFiles.map((file) => file.slice(0, 4));
  const problems: string[] = [];

  for (const duplicate of collectDuplicates(migrationNumbers)) {
    problems.push(`Duplicate migration number ${duplicate}.`);
  }

  for (const duplicate of collectDuplicates(journalTags)) {
    problems.push(`Duplicate journal tag ${duplicate}.`);
  }

  for (const duplicate of collectDuplicates(journalIndexes)) {
    problems.push(`Duplicate journal index ${duplicate}.`);
  }

  for (let position = 0; position < entries.length; position += 1) {
    const entry = entries[position];

    if (!entry) {
      continue;
    }

    if (entry.idx !== position) {
      problems.push(`Journal entry ${entry.tag} has idx ${entry.idx}, expected ${position}.`);
    }
  }

  for (const tag of migrationTags) {
    if (!journalTags.includes(tag)) {
      problems.push(`Migration SQL is not listed in journal: drizzle/${tag}.sql.`);
    }
  }

  for (const tag of journalTags) {
    if (!migrationTags.includes(tag)) {
      problems.push(`Journal tag has no SQL file: ${tag}.`);
    }
  }

  for (const idx of journalIndexes) {
    if (!snapshotIndexes.includes(idx)) {
      problems.push(`Journal index ${idx} has no matching snapshot.`);
    }
  }

  for (const idx of snapshotIndexes) {
    if (!journalIndexes.includes(idx)) {
      problems.push(`Snapshot ${idx}_snapshot.json is not represented in the journal.`);
    }
  }

  if (problems.length > 0) {
    fail(`${problems.length} issue${problems.length === 1 ? "" : "s"} found.`, problems);
    return;
  }

  console.log(`Migration check passed. ${migrationFiles.length} migrations match ${snapshotFiles.length} snapshots.`);
}

main();
