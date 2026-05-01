# Neon Setup

## Decision

SNN uses one shared Neon project for both the storefront and admin applications.

We are **not** using Neon's one-click Vercel preview integration as the primary setup right now.

Reason:

- SNN has two separate Vercel projects: `snn-storefront` and `snn-admin`
- Neon-managed Vercel integration is one Neon project to one Vercel project
- We want one shared commerce database estate, not two unrelated databases

This means the most stable foundation is:

1. One Neon project
2. One production database and role set
3. Shared environment variables injected into both Vercel projects
4. A later custom preview-branch automation for both projects together

## Region

Use a European Neon region to match the primary audience and runtime location.

Recommended:

- `AWS eu-central-1 (Frankfurt)`

The Vercel app projects are configured to run in `fra1` for lower app-to-database latency.

## Neon Project

Create a Neon project with:

- Project name: `snn`
- Region: `AWS eu-central-1 (Frankfurt)`
- Postgres version: latest stable default offered by Neon

Use `production` as the primary branch and add a `development` branch for local work.

## Roles And Database

Create:

- Database: `snn`
- Runtime role: `snn_app`
- Migration role: `snn_migrator`
- Owner role: `snn_owner`

Use strong unique passwords for both roles.

Suggested SQL:

```sql
CREATE ROLE snn_app LOGIN PASSWORD 'replace-with-generated-password';
CREATE ROLE snn_migrator LOGIN PASSWORD 'replace-with-generated-password';

CREATE DATABASE snn;

GRANT CONNECT ON DATABASE snn TO snn_app;
GRANT CONNECT ON DATABASE snn TO snn_migrator;
```

After connecting to the `snn` database as the project owner or admin role:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO snn_migrator;
GRANT USAGE ON SCHEMA public TO snn_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO snn_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO snn_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO snn_migrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO snn_migrator;
```

For the foundation phase, using `snn_migrator` for both runtime and migrations is acceptable if you want the simpler path first. The more secure target state is separate runtime and migration roles.

Drizzle migration bookkeeping should stay in `public` so the migrator role does not need broad database-level schema creation privileges.

## Connection Strings

From Neon, collect two connection strings for the same branch, database, and role:

- Pooled connection string for runtime
- Direct connection string for migrations

Mapping:

- `DATABASE_URL` = pooled Neon connection string
- `DATABASE_URL_UNPOOLED` = direct Neon connection string

Why:

- The app uses the Neon serverless driver and should use pooled runtime traffic
- Drizzle migrations should use a direct connection

## Vercel Setup

Add the same database variables to both Vercel projects:

- `snn-storefront`
- `snn-admin`

For each project, set:

- Development: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- Production: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`

Do not create fake Preview values yet.

For now, Preview deployments can remain database-light until we implement shared preview branch automation for both Vercel projects together.

## Local Setup

The repository uses two local env layers:

- Root `.env.local` for shared repo tooling such as `pnpm db:generate`, `pnpm db:migrate`, and Drizzle config
- App-local `.env.local` files for the Next.js runtimes in `apps/storefront` and `apps/admin`

After the Vercel variables are added, pull them locally:

```bash
cd /Users/lukasthomsen/Desktop/snn/apps/storefront
vercel env pull .env.local --environment=development

cd /Users/lukasthomsen/Desktop/snn/apps/admin
vercel env pull .env.local --environment=development
```

## Verification

Once the variables exist locally:

```bash
cd /Users/lukasthomsen/Desktop/snn
pnpm db:generate
pnpm db:migrate
```

If migrations succeed, the Neon foundation is connected correctly.

## Future Preview Strategy

Because both storefront and admin are separate Vercel projects, the correct future setup is custom preview automation:

- create one Neon branch per PR
- write branch-specific preview database URLs to both Vercel projects
- remove the branch when the PR closes

That will be more correct for SNN than using a one-to-one marketplace integration on only one of the apps.
