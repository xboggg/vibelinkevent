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

events/                       SOURCE for per-event mini-sites (NOT in vite build,
                              NOT auto-deployed). Each subfolder is the source
                              for a SUBDOMAIN like charlestaylor.vibelinkevent.com.
├── charlestaylor/            Source for charlestaylor.vibelinkevent.com
│   ├── index.html
│   └── api/
│       └── condolences.php   PHP endpoint (saves condolences)
├── atta-panyin/              Source for attapanin.vibelinkevent.com
├── baby-adjoa/               Source for babyadjoa.vibelinkevent.com
├── ...
└── (each subfolder deploys MANUALLY via rsync to its own subdomain
   webroot — see OPERATIONS.md "Event subdomain deploys". The main
   GitHub Actions deploy does NOT touch event subdomains.)

scripts/                       Build helpers
prerender.js                   Optional SEO prerender (puppeteer)
deploy-webhook.cjs             Legacy deploy webhook (superseded by GH Actions)
```

## Request lifecycle

```
client → Cloudflare → nginx (vibelinkevent.com)        ← MAIN domain (SPA only)
                       ├── /portfolio/docs/*          → Basic-Auth gated wiki
                       ├── /assets/*                  → 1-year cache
                       ├── /deploy-webhook            → restricted to GH IPs (legacy)
                       └── /*                          → SPA shell + try_files

         → nginx (<event>.vibelinkevent.com)          ← SUBDOMAIN per event
                       ├── /api/*.php                 → php-fpm (condolences/RSVP)
                       └── /*                          → event-specific static HTML
```

For main-domain SPA routes, nginx serves prerendered HTML where it
exists (`/about/index.html`, `/pricing/index.html`, etc. from
`prerender.js`), falling through to `/index.html` for everything else.

## Per-event mini-sites

Each event in `events/<event>/` is a self-contained mini-site with:
- One or more static HTML pages (custom design per event)
- Optionally a `/api/` folder with PHP endpoints (e.g. condolence
  submissions, RSVP forms)
- Asset folders for event-specific images

Event sites have their own DNS and their own nginx vhost — e.g.
`charlestaylor.vibelinkevent.com` serves from
`/var/www/charlestaylor.vibelinkevent.com/`. There is **no** mirror on
the main `vibelinkevent.com/events/<event>/` path; that URL falls
through to the SPA shell. Always link users to the subdomain.

To update an event mini-site, manually rsync from local
`events/<event>/` to the matching `/var/www/<event>.vibelinkevent.com/`.
The main GitHub Actions deploy does NOT touch event subdomains. See
OPERATIONS.md for the subdomain mapping.

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
