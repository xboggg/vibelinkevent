# VibeLink Event — Architecture

## Stack

| Layer    | Choice                                          |
| -------- | ----------------------------------------------- |
| Frontend | React 18 + Vite + TypeScript                    |
| UI Kit   | Radix UI primitives + shadcn/ui + Tailwind      |
| Routing  | React Router (SPA)                              |
| State    | React Query + lightweight context               |
| Backend  | PHP 8 endpoints under `events/<event>/api/`     |
| Data     | Supabase Postgres (self-hosted) + per-event JSON|
| Email    | Resend (transactional)                          |
| Hosting  | Contabo 38.242.195.0, nginx, no app server      |
| Build    | Vite → dist/ → deploys to nginx root            |

There is no application server. The SPA is shipped as static files;
per-event PHP endpoints (e.g. condolences submission) are handled by
php-fpm via nginx. Supabase is contacted directly from the browser
(public anon key) for the booking and portfolio flows.

## Repo layout

```
src/                          The SPA
├── pages/                    Top-level routes
├── components/               Reusable UI
├── lib/                      Helpers (Supabase client, formatters, etc.)
├── data/                     Static datasets (portfolio, services...)
└── hooks/                    React Query hooks

public/                       Verbatim-copied to dist/
├── assets/                   Static images, fonts, OG cards
├── blog/                     Blog images
├── icons/                    PWA icons
└── nana60/                   Event-specific images (Nana 60)

events/                       Per-event mini-sites (NOT in vite build)
├── charlestaylor/            Charles Taylor memorial
│   ├── index.html            Custom event page
│   └── api/
│       └── condolences.php   PHP endpoint (saves condolences)
├── atta-panyin/
├── baby-adjoa/
├── ...
└── (each: own HTML + maybe own /api/*.php)

scripts/                       Build helpers
prerender.js                   Optional SEO prerender (puppeteer)
deploy-webhook.cjs             Legacy deploy webhook (superseded by GH Actions)
```

## Request lifecycle

```
client → Cloudflare → nginx (vibelinkevent.com)
                       ├── /events/<event>/api/*.php  → php-fpm
                       ├── /events/<event>/*          → static (event HTML)
                       ├── /portfolio/docs/*          → Basic-Auth gated wiki
                       ├── /assets/*                  → 1-year cache
                       ├── /deploy-webhook            → restricted to GH IPs (legacy)
                       └── /*                          → SPA shell + try_files
```

For SPA routes, nginx serves prerendered HTML where it exists
(`/about/index.html`, `/pricing/index.html`, etc. from
`prerender.js`), falling through to `/index.html` for everything else.

## Per-event mini-sites

Each event in `events/<event>/` is a self-contained mini-site with:
- One or more static HTML pages (custom design per event)
- Optionally a `/api/` folder with PHP endpoints (e.g. condolence
  submissions, RSVP forms)
- Asset folders for event-specific images

Event sites have their own DNS — e.g. `charlestaylor.vibelinkevent.com`
serves from `/var/www/charlestaylor.vibelinkevent.com/` (a sibling
vhost). The same content also lives at
`vibelinkevent.com/events/charlestaylor/`. Nginx mirrors both.

## Hardening

- All public marketing routes are prerendered for crawlers (better OG
  preview on WhatsApp, X, Facebook).
- Forms (booking, condolences) use:
  - Honeypot field
  - Server-side captcha (fail-closed in `events/charlestaylor/api/condolences.php`)
  - RPC email validation
- All admin / portfolio docs gated by Basic Auth.
- Supabase RLS policies enforce row-level access; admin-only mutations
  use a service-role key not exposed to the SPA.
- Deploy via locked SSH key (this hardening: 2026-06-07).
- Daily backup of webroot + Supabase Postgres to Google Drive.
