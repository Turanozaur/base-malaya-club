# BASE Malaya Club

Website for the BASE jumping community of Malaysia: history, objects, events, news, gallery, education and closed membership by application.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (light / dark theme)
- **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Auth.js (next-auth v5)** — email + password sign-in, roles and application statuses
- Hosting: **Vercel** (planned), media storage: **Cloudflare R2** (planned)

## Requirements

- Node.js **22.x LTS** (pinned in `.nvmrc`). With nvm: `nvm use`.
- PostgreSQL (local or cloud).

## Quick start

```bash
nvm use                  # switch to the correct Node version (22.22.3)
npm install
cp .env.example .env     # then fill in the values
```

Required `.env` values:

- `DATABASE_URL` — PostgreSQL connection string.
- `AUTH_SECRET` — generate with `openssl rand -base64 33`.

Apply the schema and seed the first admin:

```bash
# development (creates a versioned migration):
npm run db:migrate -- --name init
# or quick prototype without migrations:
npm run db:push

# create the bootstrap admin (reads SEED_ADMIN_* from .env):
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

### Auth flow

- `/register` — membership application (creates a user with status `PENDING`).
- `/login` — sign in. Only `APPROVED` users can log in (e.g. the admin from `db:seed`).
- `/me` — profile and sign-out (authenticated users only).

> `PENDING` applications can be approved manually via `npm run db:studio`
> (set `status` to `APPROVED`). A full admin panel is the next milestone.

## Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create and apply a new migration |
| `npm run db:push` | Push schema without a migration file |
| `npm run db:seed` | Seed the bootstrap admin |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

## Project structure

```
prisma/schema.prisma       data model (all tables, enums, relations)
prisma.config.ts           Prisma config (reads DATABASE_URL via dotenv)
src/generated/prisma       generated Prisma client (gitignored)
src/lib/prisma.ts          PrismaClient singleton + pg driver adapter
src/lib/permissions.ts     RBAC helpers (hasPermission, isAdmin)
src/lib/validations/       Zod schemas for forms
src/auth.ts                Auth.js configuration
src/app/                   Routes and pages (App Router)
src/components/            UI components, header, footer, theme
```

## Roadmap (MVP)

| Stage | Description | Status |
|---|---|---|
| 0 | Project scaffold | ✅ done |
| 1 | Auth, roles, application approval | ✅ done |
| 1.5 | Media foundation (Cloudflare R2, avatars) | ✅ done |
| 2 | Admin panel (applications, permissions, content) | ✅ done |
| 3 | Content sections (members, objects, news, history, education) | ✅ done |
| 4 | Events and registration (wall of fame, photo uploads, email notifications) | ✅ done |
| 5 | Gallery (photos, per-event photographers, filters, lightbox) | ✅ done |
