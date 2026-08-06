# AppCentre API

Node.js + Express + Prisma (PostgreSQL) backend for AppCentre Admin.

## Structure

```
backend/
  prisma/
    schema.prisma       # data model
    seed.js              # sample data matching the frontend mocks
  src/
    config/               # env loading, Prisma client singleton
    routes/                # Express routers, one file per resource
    controllers/             # request/response handling only
    services/                  # business logic + Prisma queries
    middleware/                  # auth, validation, error handling
    validators/                    # zod request schemas
    app.js                          # Express app assembly
    server.js                        # process entry point
```

Request flow: `route -> middleware (auth/validate) -> controller -> service -> Prisma`.

## Database

AppCentre has its own dedicated PostgreSQL database: **`appcentre_platform`**
(local Postgres, `localhost:5432`). This is deliberately a database AppCentre
owns rather than borrows — it's meant to be the shared hub going forward: a
future user panel and any other apps get added here too, not each spun up with
their own separate database.

(Earlier this shared a database called `aitransform` with a different,
unrelated project. That's been fully undone — AppCentre's schema was moved
here and cleanly dropped from `aitransform`, verified to leave that other
app's tables untouched. No trace of AppCentre remains over there.)

**How multiple apps share this one database safely:** every app gets its own
Postgres **schema**, set via `?schema=<name>` in that app's `DATABASE_URL`.
AppCentre's is `appcentre` (see `?schema=appcentre` in `.env`). A schema is a
real namespace — it isolates not just table names but also each app's own
`_prisma_migrations` history, which is non-configurable and would otherwise
collide the moment two Prisma-based apps share a schema. AppCentre's table
names are additionally prefixed `appcentre_` (via `@@map(...)` in
`schema.prisma`) for readability when browsing the database directly, but the
schema is what actually provides the isolation.

**Adding the next app (e.g. a user panel) to this database:** point its
`DATABASE_URL` at `appcentre_platform` with its own schema name, e.g.
`?schema=userpanel`. It will get its own tables and its own migration history,
completely isolated from AppCentre's `appcentre` schema, with zero setup
needed on AppCentre's side.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm run prisma:migrate    # creates the appcentre_* tables
npm run seed               # loads sample data + a default admin login
npm run dev
```

Default seeded admin login: `alex.morgan@appcentre.local` / `ChangeMe123!`

## Running in production (this machine)

Deployed locally on this machine only (not internet-reachable) via [PM2](https://pm2.keymetrics.io/),
which keeps the API running in the background, restarts it if it crashes, and
(via `pm2-windows-startup`) resurrects it automatically when you log into Windows.

```bash
npm run pm2:start     # start under PM2 (reads ecosystem.config.js)
npm run pm2:status    # check it's running
npm run pm2:logs      # tail logs
npm run pm2:stop      # stop it
npm run pm2:restart   # restart after a code change
```

After starting it for the first time, run `npx pm2 save` to persist the process
list — that's what `pm2-windows-startup` resurrects on login. Re-run `pm2 save`
any time you add/remove a PM2-managed process.

Logs go to `logs/out.log` and `logs/error.log` (gitignored).

**`npm run dev` runs on port 4002, not 4001.** The PM2 instance is normally
running on 4001 (its `.env`-configured port) at the same time - `npm run dev`
forces `PORT=4002` for itself specifically so the two can run side by side
without a `EADDRINUSE` crash. You don't need to stop PM2 to use `npm run dev`.

To remove the auto-start-on-login entry: `npx pm2-startup uninstall`.

Before deploying a code change: `npm run prisma:deploy` (not `prisma:migrate` —
that one is interactive and prompts for a migration name, wrong for a deploy
step) to apply any new migrations, then `npm run pm2:restart`.

## Implemented so far

- **Auth** (`/api/auth`): login, get current admin — full.
- **Users** (`/api/users`): list (search/filter/paginate), get, create, update, suspend/reinstate — full.
- **Adverts** (`/api/adverts`): list, get, update status — core actions only; amend/approve workflow notes, history entries, and payment linkage beyond the status change are not yet built.
- **Payments** (`/api/payments`): list, get — read-only so far.
- **Reviews** (`/api/reviews`): list, remove — read-only plus moderation delete; reported-vs-published workflow beyond that isn't built.
- **Enquiries** (`/api/enquiries`): list, update status — no reply/email sending yet.

Everything else visible in the admin frontend (Admin Users, Roles & Permissions, Audit Log, Reference Data, Advert Configuration, Homepage Content, News & Carousel, Help Knowledge Base, System Settings, Notifications, Action Centre) has no backend yet — the frontend pages still run on their own hardcoded mock data. The `AuditLog` and `AdminUser`/role models exist in the Prisma schema so those are ready to build against.

## Not done yet

- The 23 HTML admin pages still call nothing — none of their JS has been rewired to hit this API. Every page is still using its own hardcoded mock arrays.
- No refresh tokens (JWTs just expire; user has to log in again).
- No file/image upload handling for advert creatives.
- No rate limiting.
- No automated tests.
