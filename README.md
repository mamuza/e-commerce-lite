# E-Commerce Lite

A minimal, production-style e-commerce app built with **Nuxt 3** as a full-stack framework. It demonstrates session-based auth, server-trusted pricing and inventory, and clean architecture using **Nuxt 3 + Node server + Prisma + PostgreSQL**.

## Features

- **Product catalog** — SSR product list and detail pages; only active products shown; pricing never trusted from the client
- **Cart** — Guest and authenticated users; cart persists across reloads; no prices stored client-side
- **Session-based auth** — Email/password login and logout; HTTP-only cookies; sessions stored in the database
- **Checkout & orders** — Auth-required checkout; server re-fetches products, validates stock, and calculates totals in a transaction
- **Order history** — Authenticated users see only their own orders
- **Admin dashboard** — Product management, order list, and analytics (admin role)

## Tech Stack

- **Nuxt 3** — Frontend and backend (Nitro, Node server)
- **Vue 3** — UI
- **Prisma** — ORM
- **PostgreSQL** — Database
- **Tailwind CSS** — Styling
- **bcrypt** — Password hashing

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** (local or Docker)

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd e-commerce-lite-2
   npm install
   ```

2. **Environment**

   Copy the example env and set your values:

   ```bash
   cp .env.example .env
   ```

   Required in `.env`:

   - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/ecommerce_lite?schema=public`)
   - `NUXT_SESSION_SECRET` — Long random string for session signing
   - Optional: `NUXT_SESSION_COOKIE_NAME`, `NUXT_SESSION_MAX_AGE` (see `.env.example`)

3. **Database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   App: [http://localhost:3000](http://localhost:3000)

## Scripts

| Script           | Description                |
|------------------|----------------------------|
| `npm run dev`    | Start dev server           |
| `npm run build`  | Production build           |
| `npm run preview`| Preview production build   |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate`  | Run migrations        |
| `npm run db:push`     | Push schema (no migrations) |
| `npm run db:studio`   | Open Prisma Studio    |
| `npm run db:seed`     | Seed database         |
| `npm run format`      | Format with Prettier  |
| `npm run format:check`| Check formatting      |

## Project Structure

```
├── app.vue
├── components/          # Vue components (e.g. ProductCard)
├── composables/         # useAuth, useCart
├── layouts/             # default, dashboard
├── pages/               # Routes: index, login, products, cart, checkout, orders, dashboard
├── prisma/              # Schema, migrations, seed
├── server/
│   ├── api/             # REST endpoints (auth, products, orders, admin)
│   ├── middleware/      # Auth, admin, redirects
│   └── utils/           # Prisma client, session, password helpers
├── types/
└── nuxt.config.ts
```

## Security

- **Pricing** — All prices and totals are computed on the server; the client never sends or trusts prices.
- **Sessions** — Stored in the database; HTTP-only cookies; expiration enforced server-side.
- **Orders** — Users can only access their own orders; admins use separate, role-gated APIs.

## License

Private / unlicensed.
