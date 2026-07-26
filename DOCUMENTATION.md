# VibeLink Event — Main Site Documentation

> Last updated: 2026-07-26
> Repo: `vibelink/` (this folder) · GitHub `xboggg/vibelinkevent`
> Live: https://vibelinkevent.com

---

## 1. What This Is

**VibeLink Event** is a Ghanaian digital-invitation platform. Real Ghanaian families (or corporate clients) commission custom-designed digital invitations for their events. Each real client gets:

- A cinematic web invitation on their own subdomain (e.g. `frankhannah.vibelinkevent.com`)
- Server-side data storage for RSVPs, wishes, tributes, voice guestbooks, donations
- A family admin panel with CSV exports

The **main marketing site** (this repo, `vibelinkevent.com`) is what visitors land on to browse, understand the offering, and place an order. It's built as a React SPA and includes the full sales journey: hero → services → designs → portfolio → pricing → order form.

---

## 2. Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + framer-motion + shadcn/ui
- **Backend:** Supabase (`luuztlneysofymmuoxie`) — used for blog posts, orders, portfolio meta
- **Hosting:** VPS server 38.242.195.0 (Contabo), served by nginx
- **Prerendering:** Puppeteer walks 46 routes at build time for SEO (`/opt/prerender/build-time-prerender.mjs`)
- **DNS + TLS:** Cloudflare-proxied; per-subdomain SSL certs on the server auto-renew via certbot

---

## 3. Where the Code Lives

### Local
- Path: `c:\Users\CyberAware\OneDrive - Government of Ghana - CAGD\ZeroTrust\Visual Studio Code Workspace\vibelink\`
- OneDrive-synced (be careful with node_modules — sync excluded via `.nosync` if needed)

### Server (production)
- Docroot: `/var/www/vibelinkevent.com/`
- nginx config: `/etc/nginx/sites-enabled/vibelinkevent.com`
- SSL: `/etc/letsencrypt/live/vibelinkevent.com/`

### GitHub
- **TODO:** push a copy of this documentation to the vibelink GitHub repo if one exists (verify: `git remote -v` in the local folder)

---

## 4. Deploy Flow

**`git push origin main` IS the deploy.** GitHub Actions runs `.github/workflows/deploy.yml` on every push (paths-ignore covers `*.md`, `docs/**`, `LICENSE`, `.gitignore`). Full pipeline takes ~2–4 minutes end-to-end.

### The pipeline

1. Runner packages a **source** tarball (excludes `node_modules`, `dist`, `events`, `audio` → stays <10MB)
2. `scp`s tarball to server **144.91.71.106** (relay). Direct GH-runner → 38 scp times out at exactly 120s, which is why the relay exists.
3. `ssh`s to 144 to run `/usr/local/bin/vibelinkevent-forward`
4. That script `scp`s the tarball onward to 38 (144 → 38 is fast, ~12s for 70MB)
5. Then runs `/usr/local/bin/vibelinkevent-install` on 38, which:
   - Unpacks source into `/opt/vibelinkevent-build`
   - `npm ci --legacy-peer-deps` (only if package.json changed)
   - `npm run build`
   - Additive `rsync dist/ → /var/www/vibelinkevent.com/`
   - `chown -R www-data:www-data`
   - `nginx -t && systemctl reload nginx`

### GitHub secrets (repo `xboggg/vibelinkevent`)

- `DEPLOY_HOST=144.91.71.106` (the relay, NOT server 38)
- `DEPLOY_USER=root`
- `DEPLOY_SSH_KEY` — private ed25519, comment `github-actions-vibelink-deploy`. Public key authorized on both 144 and 38.

### Verify a deploy landed

```bash
gh run list --repo xboggg/vibelinkevent --workflow=deploy.yml --limit 3
ssh root@38.242.195.0 "grep -o 'index-[A-Za-z0-9_-]*\.js' /var/www/vibelinkevent.com/index.html"
ssh root@38.242.195.0 "ls -la /var/www/vibelinkevent.com/assets/index-*.js | sort -k6,7 | tail -3"
```

The bundle referenced in `index.html` should match the newest timestamp in `/var/www/vibelinkevent.com/assets/`.

### Manual deploy fallback (if Actions blocked)

```bash
npm run build
tar -czf /tmp/vibelink-dist.tar.gz -C dist .
scp /tmp/vibelink-dist.tar.gz root@38.242.195.0:/tmp/
ssh root@38.242.195.0 "cp -r /var/www/vibelinkevent.com /var/www/vibelinkevent.com.bak-\$(date +%Y%m%d-%H%M%S) && tar -xzf /tmp/vibelink-dist.tar.gz -C /var/www/vibelinkevent.com/ && chown -R www-data:www-data /var/www/vibelinkevent.com"
```

Skips the source-rebuild path and the prerender step. Prerender (`/opt/prerender/build-time-prerender.mjs` on 38) must be run manually if SEO HTML needs refreshing after a route change.

### ⚠️ Red herrings — ignore these

- `deploy-webhook.cjs` at the repo root — legacy, unused by the actual deploy
- `vibelink-webhook.service` systemd unit on server 38 — was stopped/disabled 2026-07-23; it pointed at deleted `/var/www/vibelink-new` and had been restart-looping 180k+ times since Jan 2026. **Nothing to do with the working GH Actions pipeline.**
- `/var/log/vibelink-deploy.log` — belongs to the dead systemd webhook, NOT GH Actions

### Service worker caveat

`public/sw.js` caches JS chunks aggressively. After a deploy, users may see the OLD bundle until the SW updates. **Always ask the user to try incognito before declaring a deploy failure** — most "the fix didn't work" reports turn out to be SW cache, not code. Hard-refresh (Ctrl+Shift+R) also bypasses.

---

## 5. Pages & Structure

### Public marketing pages
| Route | File | Purpose |
|---|---|---|
| `/` | `pages/Index.tsx` + `sections/HeroSection.tsx` + `PhoneCarousel.tsx` | Homepage — hero carousel, phone samples carousel, event types, features, testimonials |
| `/about` | `pages/About.tsx` | About page — "What We Believe", team, mission |
| `/services` | `pages/Services.tsx` | Services page — 9 event categories + tabbed feature explorer |
| `/portfolio` | `pages/Portfolio.tsx` | **Real client work only** (filtered by `demoLabel`) |
| `/portfolio/:slug` | `pages/PortfolioDetail.tsx` | Individual portfolio detail with story + features |
| `/designs` (was `/templates`) | `pages/Designs.tsx` | Browse-all catalogue — demos + pro templates, 8 tabs |
| `/templates` | → redirects to `/designs` | Back-compat |
| `/templates/:slug` | `pages/TemplateDetail.tsx` | Individual template detail |
| `/blog` | `pages/Blog.tsx` | Blog listing (Supabase-backed) |
| `/blog/:slug` | `pages/BlogDetail.tsx` | Blog post |
| `/pricing` | `pages/Pricing.tsx` | 11 event-based packages + Bespoke + interactive calculator + referral tiers. See §7A for full pricing. |
| `/get-started` | `pages/GetStarted.tsx` | Order form wizard (6 steps). Supports `?template=<slug>`, `?package=<slug>`, `?eventType=<Capitalized>`, `?addons=<csv>`, `?plan=<full\|split>`, `?ref=<code>` — all case-insensitive. Wizard skips step 1 when arriving with a package pre-selection. |
| `/contact`, `/faq`, `/how-it-works`, `/track-order`, etc. | Various | Supporting pages |

### 10 Dedicated Event Pages
All 10 built to the same pattern using shared components. Each has a **cinematic hero** + **special-features carousel** (10–20 features) + **common-features grid** (6 essentials shared across all).

| Route | Package (from `eventPackages.ts`) | Palette | Features count |
|---|---|---|---|
| `/wedding-invitations` | wedding — GHS 2,500 | rose/pink | 10 |
| `/engagement-invitations` | engagement — GHS 2,000 | amber/orange | 10 |
| `/funeral-programs` | funeral — GHS 2,000 | slate/muted | 10 |
| `/naming-ceremony` | naming — GHS 1,500 | sky/cyan | 10 |
| `/anniversary-invitations` | anniversary — GHS 1,800 | champagne/gold | 10 |
| `/graduation` | graduation — GHS 1,500 | navy + gold | 10 |
| `/birthday` | birthday — GHS 1,200 · **Regular Birthday only** (kids parties, teens, 21sts, casual). Cross-links to /milestone-birthday. | fuchsia/pink | 10 |
| `/milestone-birthday` | milestone-birthday — GHS 2,000 · **NEW 2026-07-23** — split from /birthday. 30/40/50/60/70 focus. | amber/gold | 10 |
| `/church-events` | church — GHS 2,000 | royal purple + gold | 15 |
| `/corporate-events` | corporate — GHS 3,500 | navy/slate + blue | 20 |

The **Bespoke** package (GHS 4,500+, quote-only) does not have a dedicated event page — visitors are routed to `/contact` for a custom quote.

### Preview pages (kept alive for internal use)
- `/portfolio-preview`, `/story-preview`, `/services-preview` — earlier design sandboxes
- `/wedding-preview` — 8 layout options tested before committing to Option C
- `/designs-preview` — new Designs page preview

### Admin
- `/admin` (gated by auth) — order management, blog manager, portfolio manager

---

## 6. Reusable Components

### Event page components (`src/components/events/`)
- **`CinematicHero.tsx`** — Full-bleed image hero with dark overlay, slow zoom, chip + heading + subheading + primary+secondary CTAs + trust row. Used by all 9 event pages.
- **`SpecialFeaturesCarousel.tsx`** — Big auto-cycling card + thumbnail grid + arrow nav + drag-to-swipe. Grid adjusts (5×2 for ≤10 features, 5×N for more).
- **`CommonFeaturesGrid.tsx`** — 6-card grid of the shared essentials (One WhatsApp-Ready Link · RSVP Tracking · Photo Gallery + Music · Live Countdown · Google Maps + Ride · Custom Colours & Design).
- **`EventTestimonials.tsx`** — Desktop 3-column grid, mobile swipeable carousel with dots.

### Services page component (`src/components/services/`)
- **`InvitationFeaturesTabs.tsx`** — 13-category tabbed explorer with animated micro-demos for each category. Auto-cycles every 5s, pauses when off-screen.

### Homepage components (`src/components/sections/`)
- **`HeroSection.tsx`** — Big hero carousel with 7s auto-cycle
- **`PhoneCarousel.tsx`** — Phone-frame carousel showing sample invitations; iframe upgrade on tap-to-try-live; iPhone-style back/home nav controls when live
- **`FeaturesSection.tsx`**, `EventTypesSection.tsx`, etc.

---

## 7. Data Files

### `src/data/portfolioItems.ts`
Single source of truth for both **real clients** AND **demos**.

- **Real clients** — items WITH `demoLabel: "Open Invitation"` or `"Open Memorial"` → shown ONLY on `/portfolio`
- **Demos** — items WITHOUT `demoLabel` → shown ONLY on `/designs`

Items are sorted newest-first on Portfolio by `id` descending.

Shape:
```ts
{
  id: number,
  title: string,
  type: "Weddings" | "Engagements" | "Funerals" | "Naming" | "Anniversaries" | "Graduations" | "Birthdays" | "Church" | "Corporate",
  description: string,
  image: string,        // /public/*.png or .jpg
  thumbnail?: string,
  demoUrl?: string,     // https://<subdomain>.vibelinkevent.com/
  slug: string,
  features: string[],
  imagePosition?: string,
  demoLabel?: string,   // presence = real client
}
```

### `src/data/eventPackages.ts` — CANONICAL PRICING (added 2026-07-22)

**Single source of truth for all package pricing across the entire site.** Every /pricing card, /get-started option, /admin form (OrderTemplates), SEO schema, and AI chatbot response reads from THIS file. **Never hardcode prices anywhere else** — they'll drift out of sync.

Exports:
- `EVENT_PACKAGES` — array of all 11 packages
- `UNIVERSAL_ADDONS` — 8 add-ons available on any non-Bespoke package (Custom Domain, Rush Delivery 48hrs, White-Label, +6mo hosting, +1yr hosting, AI Photo Restoration, Extra Revision, Priority Support)
- Each package also has its own `addons: PackageAddon[]` for event-specific extras (e.g. Voice Tribute Wall on Funeral, Bridal Party Hub on Wedding)
- Helpers: `getPackageById`, `getPackageByRoute`, `getBespoke`, `getNonBespokePackages`, `getStartingPrice`, `getStartingPriceLabel`

Files that consume it:
- `src/pages/Pricing.tsx` — 11-card grid + calculator
- `src/data/orderFormData.ts` — order-form `packages[]` and `eventTypes[]` derived from EVENT_PACKAGES
- Each `src/pages/events/*.tsx` — hero copy + recommended-package headline
- `supabase/functions/customer-chat/index.ts` — AI chatbot pricing knowledge (⚠️ deployed via Supabase Dashboard, not git-driven — remember to redeploy after edits)
- `src/components/customer/ReferralProgram.tsx` + `src/components/admin/ReferralsAdmin.tsx` — REFERRAL_REWARDS dict
- `src/components/order-form/OrderFormWizard.tsx` — `rewardAmounts` (MUST match ReferralsAdmin)
- `src/components/admin/OrderTemplates.tsx` — eventTypes + packageOptions (both derived — no more drift possible)

### `src/data/orderFormData.ts` — Order form catalogue

`packages[]` derives from EVENT_PACKAGES.map(). `eventTypes[]` has one entry per package (event ID matches package ID, e.g. `wedding`, `funeral`, `milestone-birthday`).

`addOns[]` is the ~28-entry catalogue shown on the wizard's add-ons step. **Each add-on has an optional `includedInPackages: string[]` field** — when the customer's package appears in that list, the add-on is hidden from the paid grid and shown instead under an "Already in your <Package> package" collapsible. Prevents double-charging + prevents customer confusion (e.g. Funeral customer doesn't see Live Stream Embed as a paid add-on because it's already in the Funeral package). Cross-referenced against every package's `features` list — see the mapping directly in `orderFormData.ts` for what maps to what.

### `src/data/templatesData.ts`
15 pro funeral templates with tier + addons. Merged into `/designs` as regular cards (tier/price NOT shown on the card — that info surfaces on `/pricing` and `/get-started`). The `tierPrices` export is **deprecated but kept for backward compat** — all values point to funeral GHS 2,000, Royal → 4,500 for Bespoke. The `Tier` type is now used only as a design-complexity classifier (Simple/Standard/Elevated/Luxury), NOT as pricing.

### `src/pages/PortfolioDetail.tsx` (embedded data)
⚠️ **Gotcha:** PortfolioDetail has its own hardcoded object of per-item detail (image, story, features, package). Updating `portfolioItems.ts` alone does NOT update the detail page. Both must be edited.

---

## 7A. Pricing Model (event-based, rebuilt 2026-07-22)

**Old model (deprecated, DO NOT reference):** 4 tiers — Starter Vibe / Classic Vibe / Prestige Vibe / Royal Vibe.

**Current model:** 11 event-specific packages + Bespoke. Customer picks the event they're planning, gets ONE package tuned for that event.

| Package | Price | Notes |
|---|---|---|
| Wedding | GHS 2,500 | Most popular. Traditional + church + reception |
| Engagement / Customary | GHS 2,000 | Knocking + engagement day |
| Funeral & Memorial | GHS 2,000 | Full funeral, Nsawa tracker, livestream, remembrance schedule |
| Corporate Event | GHS 3,500 | Conferences, launches, AGMs, galas |
| Naming / Outdooring | GHS 1,500 | 8-day naming (Din To) |
| Milestone Birthday | GHS 2,000 | 30/40/50/60/70 |
| Regular Birthday | GHS 1,200 | Kids' parties, 21st, casual |
| Anniversary / Vow Renewal | GHS 1,800 | Silver / Pearl / Gold / Diamond |
| Graduation | GHS 1,500 | Uni, secondary, professional |
| Church Event | GHS 2,000 | Harvest, convention, revival, ordination |
| Bespoke | GHS 4,500+ | Quote-only, custom domain, unlimited everything |

### Universal add-ons (available on any non-Bespoke package)

| Add-on | Price |
|---|---|
| Custom Domain | GHS 500 |
| Rush Delivery (48 hours) | GHS 300 |
| White-Label (remove VibeLink badge) | GHS 300 |
| Extra Hosting (+6 months) | GHS 500 |
| Extra Hosting (+1 year) | GHS 1,000 |
| AI Photo Restoration | GHS 150 |
| Extra Revision Round | GHS 100 |
| Priority WhatsApp Support | GHS 200 |

### Referral tiers (referrer's cash reward)

| Referred customer bought | Referrer earns |
|---|---|
| Small event (Regular Birthday, Graduation, Naming) | GHS 100 |
| Medium event (Anniversary, Milestone Birthday, Church, Engagement, Funeral) | GHS 200 |
| Large event (Wedding, Corporate) | GHS 300 |
| Bespoke | GHS 500 |

These values live in THREE files that must stay in lockstep (change one → change all):
- `src/pages/Pricing.tsx` (public display)
- `src/components/order-form/OrderFormWizard.tsx` — `rewardAmounts` dict
- `src/components/admin/ReferralsAdmin.tsx` — `REFERRAL_REWARDS` dict

### Payment channels

Fully integrated: **Paystack** (card + MoMo + bank transfer, all in one gateway). Supabase Edge Functions `paystack-initialize` + `paystack-verify` handle it. Also accept manual MoMo / bank transfers recorded via Admin.

Customer can choose **Full Payment** (priority + FREE Save-the-Date teaser) or **50% deposit / 50% balance**.

---

## 7B. Order Form Wizard (6 steps, was 7)

The Package selection step was removed 2026-07-23 — since each event has exactly ONE package (event ID = package ID), asking the customer to reconfirm was redundant. Now `EventTypeStep.tsx` sets both `eventType` AND `selectedPackage` on click.

**Current wizard:** Event → Details → Style → Add-ons → Timeline → Contact

Pre-fill URL params (all case-insensitive, all optional):
- `?package=<slug>` (from /pricing calculator + Bespoke card)
- `?eventType=<Capitalized>` (from event pages via `EventPageTemplate`) — both params resolve to the same package lookup
- `?addons=<csv>` — comma-separated calculator add-on IDs; only those with a clean equivalent in the order-form catalogue carry over (custom-domain, hosting-6mo/1yr, extra-revision, white-label, priority-support, ai-photo-restore). Rush 48h maps to Step 5's `deliveryUrgency=rush`.
- `?plan=full|split`
- `?ref=<code>`
- `?template=<slug>` — shows "You picked X design" banner

When any of these are present, the wizard **skips step 1** (Event Type) and drops the customer at Step 2 (Event Details) with everything pre-selected. A green banner explains what was carried over.

⚠️ **Stale draft bypass:** the wizard normally restores a saved draft from `localStorage.vibelink_order_draft`, but if the URL carries a fresh `?package=` selection, the saved draft is ignored — otherwise stale drafts silently overwrite the new selections and drop the customer back at step 1.

---

## 8. Performance Patterns

### Pause auto-cycles when off-screen
Every component with a `setInterval` cycle uses an IntersectionObserver so the timer clears when the section is scrolled off-screen. Prevents the "page refresh" flicker feel.

Applied in:
- `SpecialFeaturesCarousel` (6s cycle) — used on all 9 event pages
- `PhoneCarousel` (3.5s cycle) — homepage
- `HeroSection` (7s cycle) — homepage
- `InvitationFeaturesTabs` (5s cycle) — /services page

Pattern:
```ts
const sectionRef = useRef<HTMLElement | null>(null);
const [inView, setInView] = useState(true);
useEffect(() => {
  if (!sectionRef.current) return;
  const obs = new IntersectionObserver(
    ([entry]) => setInView(entry.isIntersecting),
    { threshold: 0.1 }
  );
  obs.observe(sectionRef.current);
  return () => obs.disconnect();
}, []);

useEffect(() => {
  if (interacted || !inView) return;
  const id = setInterval(() => { /* ... */ }, autoRotateMs);
  return () => clearInterval(id);
}, [interacted, inView]);
```

### Two-phase Blog fetch
`Blog.tsx` (fixed 2026-07-17):
- Phase 1: pulls first 24 posts (`INITIAL_FETCH`) with `.range(0, 23)` → page paints immediately
- Phase 2: if the first page filled up, background-fetches the rest so search/filter still reaches the whole archive

Before the fix, the page did `select(*)` with no limit → pulled the entire archive before rendering anything.

### Aspect-ratio-safe image crops
Portfolio and Designs cards use `aspect-[4/3]`. Wide 2:1 source images (like our Frank & Hannah + Eric & Sherita PNGs) get their sides cropped. Design source images to keep the important content in the centre 60%.

---

## 9. Homepage & UI Improvements Done

- **Homepage event types row**: Weddings & Engagements MERGED into one card (matches how Ghanaians actually plan) → 8 cards total instead of 9
- **Cinematic hero on event pages**: full-bleed backdrop images, slow-zoom parallax, dark overlay
- **Uniform hero height**: 620px on desktop (was drifting between 614-762px)
- **Chip contrast fix**: `bg-white/25` + `border-white/50` + explicit `text-white` — visible on both light and dark overlays
- **Arrow position fix on carousel**: arrows now vertically centre on the CARD, not the whole section wrapper (was being pushed down by thumbnails below)
- **iPhone-style phone-frame nav controls**: back arrow + home pill on the live iframe carousels, so visitors can navigate into an invitation and come back out

---

## 10. Blog Categories & Content Strategy

Categories on `/blog`:
- Wedding
- Funeral & Memorial
- Anniversaries
- Church
- Community
- Ghanaian Culture
- Event Planning
- Naming Ceremonies
- Inspirations
- Tips & Guides

Posts are managed via `/admin/blog` (protected by admin auth). Scheduled posts (published=true, published_at in the future) are hidden from the public until their release time.

---

## 11. Known Gotchas

1. **Service worker cache** — deploys don't reach mobile users immediately. Test in incognito FIRST before declaring anything broken.
2. **PortfolioDetail duplicates** — updating `portfolioItems.ts` does NOT update the detail page. Both files must be edited.
3. **VPN TLS interception on Edmund's setup** — `ERR_SSL_PROTOCOL_ERROR` in Chrome/Brave is 90% VPN, 10% actual issue. Ask "are you on VPN?" first.
4. **nginx warning `protocol options redefined for 0.0.0.0:443`** — pre-existing warning, ignorable.
5. **Aspect-ratio crop** — 4:3 cards crop the sides of wide 2:1 source images. Design source images with content centred.
6. **Cache-bust manual `?v=<n>`** — `public/*.png` files aren't hashed by Vite. Add `?v=2` to force browser + CDN refresh.
7. **Chatbot deploys are NOT git-driven** — `supabase/functions/customer-chat/index.ts` lives in the repo but Supabase Edge Functions must be redeployed via **Supabase Dashboard → Edge Functions → customer-chat → Code tab → paste → Deploy updates**. Simply pushing the git commit doesn't push to Supabase.
8. **Two URL param conventions for `/get-started`** — `?package=<slug>` (from calculator) and `?eventType=<Capitalized>` (from event pages). Both work + are case-insensitive. Don't add a third — extend the existing normalizer in `GetStarted.tsx`.
9. **Order-form add-on IDs ≠ calculator add-on IDs** — `orderFormData.ts` add-ons (hosting-6m, hosting-1y) use different slugs than `eventPackages.ts` UNIVERSAL_ADDONS (hosting-6mo, hosting-1yr). The mapping lives in `GetStarted.tsx` (`CALC_TO_FORM_ADDON`). If you add a new universal add-on, add the mapping too or it silently drops.
10. **Referral tier drift risk** — the reward numbers live in 3 files (see §7A). Change one, change all. There's no shared constants file yet (safe TODO).
11. **Add-on 'already included' mapping** — every add-on in `orderFormData.ts` has an optional `includedInPackages: string[]` field. If you add a new package, review each add-on to decide if it belongs in the new package's `includedInPackages` list. Otherwise all add-ons will show as paid for that package.
12. **DOCUMENTATION.md is not in the deploy** — the workflow's `paths-ignore` excludes `*.md`, so pushing this doc doesn't trigger a redeploy. Good for iterating on docs without wasting Actions minutes.

---

## 11A. Admin Panel — Cause & Solution Log (2026-07-25 → 2026-07-26)

Detailed record of bugs identified and fixed in the admin panel during a multi-day debugging exchange with an external code reviewer. Kept explicit so future-me doesn't have to re-derive the causes.

### Admin section persistence across page refresh

**Symptom:** refreshing any admin section always returned you to the Dashboard.

**Cause:** `activeSection` lived only in React `useState`. React state doesn't survive a page refresh — component unmounts, state destroyed, next render resets to the initial value `"dashboard"`.

**Fix (Admin.tsx):** three-tier restoration order:
1. **URL param** (`?section=blog`) — authoritative when present. Enables bookmarks and shareable links.
2. **localStorage** (`vibelink_admin_section`) — fallback for the initial visit on a new tab.
3. **`"dashboard"`** — final default.

`setActiveSection` wraps `useState`'s setter so URL + storage + state stay in lockstep. Uses `setSearchParams(…, { replace: true })` so switching sections doesn't spam the back-button history. `?section=dashboard` is omitted from the URL (kept clean for default). `VALID_SECTIONS` is derived from `navCategories` so unknown values fall back safely and future-added sections auto-validate. Containing sidebar category is auto-expanded on restore so the active item is visible.

### Admin scroll position lost on tab-switch

**Symptom:** scroll to the bottom of any admin section, switch to another browser tab, come back — page had jumped to the top.

This one took **7 iterations** because the root cause was masked by multiple layered bugs. Documenting each layer so the pattern is recognisable next time.

**Layer 1 (misdiagnosis — my `refetchOnWindowFocus` guess).** React Query defaults `refetchOnWindowFocus: true` — plausible cause of re-render → subtree remount → scrollTop reset. Turned off in `App.tsx` QueryClient. Real bug persisted, but this fix is worth keeping — spares the DB/network from a burst of duplicate queries on every Alt+Tab.

**Layer 2 (misdiagnosis — `scrollRestoration = 'manual'`).** Browser's `history.scrollRestoration` was `'auto'`, which the reviewer flagged as suspicious. Setting it to `'manual'` disabled the browser's built-in scroll memory but I hadn't added replacement logic — so refresh now went to top every time. Made the problem WORSE. Reverted to `'auto'` (browser default) as a safety net.

**Layer 3 (partial — fixed-timer restore).** Wrote a save/restore effect keyed per section: on scroll → save to sessionStorage; on section change → restore. Used a fixed 400ms retry timer. Worked when data loaded fast, failed when slow — the restore attempt fired before the page was tall enough, `scrollTo(target)` silently clamped, user stuck at top. Race condition.

**Layer 4 (partial — ResizeObserver retry).** Replaced the fixed timer with a `ResizeObserver` on `<body>` — every time the page grew (data streaming in, images arriving), the observer fired and re-attempted the scroll. Terminates when scroll lands within 4px of target, user scrolls first, or 10s hard cap fires. **This fixed the reload / section-change path — but not tab-switch.** Reason: on tab-refocus, the page height does NOT change (already fully rendered before hide), so the observer never fires.

**Layer 5 (partial — save/restore feedback loop caught).** Reviewer captured with instrumentation that on tab-refocus the browser fires an animated scroll cascade (`1591 → 477 → 154`) descending to 0. Every intermediate value got saved by the save-listener, progressively clobbering the real saved value. Added `isRestoring` state flag (all saves rejected while true) + `behavior: 'instant'` on restore scrollTo (no smooth-scroll cascade of our own) + 500ms post-refocus settling window. Still didn't fix it.

**Layer 6 (partial — dedicated rAF loop for refocus).** Reviewer proved with a `scrollTo` hook that the page-height-based ResizeObserver never fired on refocus. Added an independent `requestAnimationFrame`-driven retry loop that runs ONLY on visibility change, doesn't need any DOM signal. Terminated on "scrollY within 4px of target for 2 consecutive frames" — but that success check was FALSE POSITIVE at frame 1 because the browser hadn't reset scroll yet. Loop exited immediately, browser reset landed at t+41ms with nobody watching.

**Layer 7 (fixed — unconditional assert loop + late-reset watcher).** Reviewer's key insight: the reset lands ~40ms AFTER `visibilitychange` fires, so any state check at event-time is meaningless. Only unconditional time-based assertion works.

Final design:
- **Assert phase (600ms):** every animation frame, call `scrollTo(target, behavior: 'instant')` **unconditionally**. No "am I there?" check. The browser's late reset gets overwritten on the very next frame.
- **Watch phase (400ms after assert):** install a short-lived scroll listener. If scrollY drops below 100 → late reset arrived, re-apply target. If scrollY is far from both 0 and target → user is scrolling, hand control back. If scrollY stays near target → keep watching until timeout.
- **`isRestoring` freeze** stays true across the full assert+watch window so no spurious save can slip through.
- **Source of truth** for the last known good position is a REF (`lastGoodScrollRef`), not sessionStorage. sessionStorage is a persistence mirror so a fresh tab/refresh can seed the ref. A browser-fired 0 can't clobber a value living in a JS ref because the save listener checks the ref before writing.

Lives in `src/pages/Admin.tsx` inside a single big useEffect keyed on `activeSection`. **DO NOT introduce state checks like "am I at target?" into the refocus path** — they will pass at event-time and fail 40ms later. Time-based unconditional assertion is the only shape that works.

### Admin flash / unnecessary refetch on tab-return

**Symptom:** returning to the admin tab showed a full-screen spinner briefly before the content re-appeared.

**Cause:** Supabase's `onAuthStateChange` fires a `TOKEN_REFRESHED` event on tab-refocus (this is Supabase's default behaviour, unrelated to React Query). Each fire triggered:
- `checkAdminRole()` → `has_role` RPC. Fired 2× per refocus because `useAuth()` is called by Admin.tsx + useSessionTimeout + AdminAuth.tsx.
- Admin.tsx's `useEffect(() => fetchOrders(), [user, isAdmin])` fired because `setUser(session.user)` was called with a fresh user object reference (same underlying user).

**Fix (useAuth.ts):**
- Module-scoped `adminRoleCache` `Map<userId, boolean>`. Cache hit skips the RPC entirely — `TOKEN_REFRESHED` no longer re-queries a role we already know.
- Module-scoped `adminRoleInFlight` `Map<userId, Promise<boolean>>` to deduplicate concurrent lookups when multiple `useAuth()` consumers mount at once. One RPC round-trip shared across all callers.
- Both caches cleared on `signOut()` so a subsequent sign-in re-queries.

**Fix (Admin.tsx):** changed `useEffect(fetchOrders, [user, isAdmin])` → `useEffect(fetchOrders, [user?.id, isAdmin])`. Same underlying user id = no refetch.

**Result confirmed by reviewer's network capture:** `has_role` RPCs on refocus went from 2 → 0. `/orders` refetch went from 1 → 0.

### Blog Analytics — "Analytics load failed" red toast, all metrics at 0

**Symptom:** `/admin?section=blog-analytics` showed a destructive toast with the message `column blog_post_views.post_slug does not exist`, and every metric card read 0.

**Cause:** the query in `BlogAnalytics.tsx` was written against a **non-existent schema**:
- Selected `post_slug, viewed_at` — neither column exists
- Filtered by `viewed_at` — doesn't exist
- Counted raw row lengths — but `blog_post_views` is a pre-aggregated view, not a raw events table

**Verified real schema (probed live 2026-07-26):**
| Aspect | Actual |
|---|---|
| Table type | Pre-aggregated view (not raw events) |
| Real columns | `post_id`, `day` (ISO date), `view_count` |
| FK | `post_id` → `blog_posts.id` (PostgREST embed works) |
| `count` | ⚠ PostgREST reserved aggregate function, NOT a column. `select=count` returns `[{count: N}]` — a whole-table row count. Do NOT treat as a data column. |
| Canonical sum field | `view_count` |

**Fix (`BlogAnalytics.tsx`):**
- `select`: `post_slug, viewed_at` → `post_id, day, view_count, blog_posts(slug, title, category, published)` — the embed resolves slug/title/category in a single round-trip via the FK
- Filter: `.gte("viewed_at", isoString)` → `.gte("day", isoDate)` (YYYY-MM-DD, since `day` is a date column)
- Aggregation: was counting raw rows (`rows.length`); now sums `view_count` per row (source is pre-aggregated by `(post_id, day)`)
- Bucketing: keys off `row.day` (already ISO) instead of slicing `viewed_at`
- Defensive: skips orphan view rows where `blog_posts` embed is `null` (post deleted after view was recorded)
- Unread posts still surface: secondary `blog_posts` fetch seeds every published article into the "All articles" list with `total=0`

**Gotcha to remember:** if you ever probe `blog_post_views` from PostgREST, `select=count` looks like a valid column response but is actually the PostgREST count aggregate. Only `view_count` is a real column. If you see a 42803 GROUP BY error when selecting multiple columns, that's PostgREST confirming the table is a view/aggregate — plain multi-column selects on aggregate rows need explicit `group by`, which PostgREST doesn't do without an RPC.

### Chatbot Analytics + Follow-ups History — tables didn't exist at all

**Symptom:** `/admin?section=chatbot` and `/admin?section=follow-ups` both threw `PGRST205 "Could not find the table 'public.<name>'"` errors in the console and rendered empty. Metric cards read 0.

**Cause:** the admin panel components existed and their queries were correctly-formed — but the four backing tables were never created. Full external audit of the admin panel found these were the only remaining missing-table bugs after the BlogAnalytics fix above.

**Verified missing (probed 10 alternate names — none existed):**
- `chat_conversations` — one row per chatbot session
- `chat_messages` — one row per message in a conversation
- `chat_analytics` — topic → count aggregate ("wedding pricing asked 14 times")
- `follow_up_logs` — one row per follow-up email sent

**Fix:** created all four via `supabase/migrations/20260726_chat_and_followup_tables.sql`. Column shapes cross-referenced against the exact queries the code already fires:

| Table | Key columns | Notes |
|---|---|---|
| `chat_conversations` | `id`, `session_id`, `started_at`, `message_count` | Anon INSERT/UPDATE (customer chatbot writes as anon), admin SELECT |
| `chat_messages` | `id`, `conversation_id` (FK cascade), `role` (user/assistant/system), `content`, `suggestions` (jsonb), `created_at` | Anon INSERT + SELECT (unguessable UUID conversation_id acts as capability); admin ALL |
| `chat_analytics` | `topic` (PK), `count`, `last_asked_at` | Anon INSERT/UPDATE (chatbot increments on topic detection); admin SELECT |
| `follow_up_logs` | `id`, `order_id` (FK to `orders` cascade), `follow_up_type`, `sent_at`, `success`, `error_message`, `metadata` | Admin SELECT only. Writes come from the follow-up Edge Function via service_role, which bypasses RLS |

**How `follow_up_logs` was identified as CREATE (not repoint):** reviewer's captured query was `select=*,orders(client_name,client_email,event_title)&order=sent_at.desc` — the PostgREST embed and ordering by `sent_at` proved this was a per-send history table, not the existing `follow_up_settings` config table. `follow_up_settings` remains and continues to work for the settings page.

**Applied via Supabase Dashboard SQL Editor.** When Supabase's "Potential issue detected: query creates a table without RLS" dialog appears, click **"Run without RLS"** — the migration's `alter table ... enable row level security` + `create policy` lines a few rows below in the same block turn RLS on explicitly. Supabase's warning only reads the CREATE and doesn't see the RLS setup that follows.

**Also gotcha discovered:** Supabase SQL Editor's "Run" button can execute only the statement adjacent to the cursor, not the full editor contents, when the RLS-warning dialog interrupts. If a multi-block migration lands only partially, re-run the missing blocks explicitly (safe because migrations use `CREATE TABLE IF NOT EXISTS` and `DROP POLICY IF EXISTS`). Alternatively use Ctrl+Enter to run the whole editor.

### Admin router fallback — not actually broken

Reviewer flagged that unrecognized `?section=` slugs render Messages instead of a 404 state. **Verified not the case** in current code — `Admin.tsx` validates the URL param against `VALID_SECTIONS` (derived from `navCategories`) and falls back to `"dashboard"` on invalid, and the `renderStep` switch has an explicit `default: return null;`. Reviewer likely tested on a cached bundle predating the July 24 section-persistence fix. No change needed.

---

## 12. Roadmap Ideas (from Feature Enhancement doc)

Selected high-value items from the master feature-ideas doc:

### Near-term
- **AI blog writer** — add "AI Write" button to the BlogManager to generate SEO posts from a headline
- **Customer portal** — let customers log in, see their orders, request revisions
- **WhatsApp Business API integration** — auto-send order confirmations + updates directly to customers
- **SMS notifications** via Arkesel/Hubtel (popular in Ghana)
- **10 pro templates per event type** — currently only Funerals has 15. Build 10 wedding, 10 engagement, etc.
- **Referral/affiliate program** — customers refer friends for a discount

### Mid-term
- **Kanban order board** — drag-and-drop admin view of orders by status
- **Multi-currency support** — USD/EUR/GBP for diaspora customers
- **Installment payment plans** — for larger packages
- **Mobile Money direct integration** — MTN MoMo, Vodafone Cash, AirtelTigo Money
- **Advanced invoice generator** — branded PDFs with payment QR codes

### Nice-to-have
- **AI design suggestion generator** — customer describes event → AI suggests palette + typography
- **Multi-language toggle** — English / Twi / Ga
- **Kanban board** for admin order management

Full list in `~/Desktop/🚀 Feature Enhancement Ideas for VibeLink Ghana.docx`.

---

## 13. Editing This Doc

This doc is the source of truth. It lives at the repo root and in GitHub.

```bash
# Edit locally, then push:
git add DOCUMENTATION.md
git commit -m "docs: <what changed>"
git push origin main
```

The GitHub Actions workflow has `paths-ignore: ['**.md', 'docs/**', ...]` — so pushing markdown changes doesn't trigger a redeploy. The doc is preserved on GitHub for reference; the live site doesn't serve it.

If you want the doc on the server too (for `/root` reference), scp it manually — but the GitHub copy is authoritative.

---

## 14. Session History

### July 2026 session (2026-07-22 → 2026-07-24)

The big change: **complete pricing model rebuild** from 4 tiers to 11 event-based packages + Bespoke, plus a cascade of alignment fixes across the whole site to stay honest and consistent.

**Pricing model rebuild (2026-07-22, commit `2081017`):**
- Old: Starter Vibe / Classic Vibe / Prestige Vibe / Royal Vibe
- New: 11 event-specific packages + Bespoke. Canonical source: `src/data/eventPackages.ts`.
- 21 files updated in one commit — Pricing.tsx, all 9 event pages, order form data, wizard, referral admin, referral customer, terms of service, ai chatbot system prompt.

**Order form wizard simplified (7 → 6 steps):**
- Removed the redundant Package step — since event ID = package ID (1:1), EventTypeStep now sets both `eventType` and `selectedPackage` on click. Wizard is now Event → Details → Style → Add-ons → Timeline → Contact.
- Add-ons step now hides features already in the customer's package (via `includedInPackages` field), shows them under an "Already in your <package>" collapsible instead. No more double-charging for Live Stream on Funeral etc.
- Removed "Memorial Page Renewal" from order-form add-ons (it's a future recurring subscription, not an upfront checkbox).

**Calculator → order form pre-fill:**
- Clicking Get Started on the /pricing calculator now passes package + add-ons + payment plan via URL params, and the wizard skips to Step 2 with everything selected.
- Later extended to also accept `?eventType=<Capitalized>` from the 9 event-page CTAs (they used a different URL convention).
- Stale localStorage draft is bypassed when a fresh URL selection is present.

**Milestone Birthday split (2026-07-23, commit `9e881d8`):**
- New `/milestone-birthday` page for the 30/40/50/60/70 segment (GHS 2,000, amber/gold palette). Own SEO route, own copy.
- `/birthday` cleaned up to Regular Birthday only (GHS 1,200, kids/teens/casual). Cross-links to /milestone-birthday.
- Fixed pre-existing footer bug where "Anniversaries" link pointed at `/birthday` instead of `/anniversary-invitations`.
- Footer + sitemap updated.

**Homepage + Services alignment (2026-07-23):**
- Homepage "One Platform for Every Occasion" grid kept as clean 8 cards (no 9th Milestone card). Birthdays card subtitle changed from "Milestones worth celebrating" to "Regular · Milestone" so both are surfaced.
- /services Birthday Celebrations card gets an optional `crossLink` field rendering a subtle underlined text link to /milestone-birthday. No card duplication.

**Honesty pass on stats (2026-07-23):**
- Replaced fabricated site-wide stats: "500+ Events Created" → "100+ Invitations Created", "10+ Countries Reached" → "3 Countries Reached", kept "98% Satisfaction" + "48hrs Rush" (both real).
- Removed 9 fake per-category stat overlays on /services (500+ Weddings, 180+ Engagements, etc. — totalled 2,050+ "events" which was blatantly inconsistent with the 100+ homepage claim).
- Scaled down PortfolioDetail case-study numbers proportionally.

**Copy alignment (2026-07-23):**
- Steps 2 + 3 on the homepage/HowItWorks rewritten: Step 2 "WhatsApp reply within 2 hours with your custom quote" → "We Confirm on WhatsApp / Same-day WhatsApp confirmation". Step 3 "MoMo or Card" → "MoMo, bank transfer, or card — 50% deposit or pay in full" (Paystack integration confirmed real).
- Softened 2-hour SLA to same-day across Contact, BookConsultation, FAQ, GetStarted, OrderSummary, ThankYou — site isn't public yet so 2-hour promise was aspirational.
- Fixed stale "7-step form" references now that wizard is 6 steps.
- Business hours: Saturday changed to 10am-2pm (was 10am-4pm), added Saturday to SEO schema.
- Removed duplicate "Enhance Your Invitation" static add-ons grid from /pricing — the calculator directly above already handles it.
- Referral tiers on /pricing corrected: was 3 tiers with wrong Wedding/Corporate payout (250 shown, 300 actually paid). Now 4 tiers matching code source of truth.
- Add-on prices: hosting-6m 250 → 500, hosting-1y 600 → 1000, custom-domain 300 → 500 — aligned order-form catalogue with eventPackages.ts.

**Admin drift audit (2026-07-24):**
- `OrderTemplates.tsx` had "Baby Shower" (not offered) + generic "Basic/Standard/Premium/Custom Package" names (don't exist). Both lists now derive from `EVENT_PACKAGES` — cannot drift again.
- `AIEmailTemplates.tsx` + `FollowUpSettings.tsx` had "Premium Package" as hardcoded example — replaced with real package names.
- Everything else in admin reads dynamic data from Supabase — no other drift risk.

**Deploy pipeline correction (2026-07-23):**
- Discovered the actual deploy uses GitHub Actions (runner → 144 relay → 38 install), NOT the manual scp flow the previous docs described. The `deploy-webhook.cjs` and `vibelink-webhook.service` on server 38 are dead legacy — the service was restart-looping 180k+ times since Jan 2026 pointing at a deleted directory. Killed the service, corrected the memory + this doc.

### July 25-26 session — Admin fixes, blog images, misc

**Admin panel bug hunting** (see §11A for full cause & solution log):
- **Section persistence across refresh** — admin sidebar was resetting to Dashboard on refresh. `activeSection` now persists via URL param (`?section=blog`) → localStorage → dashboard default, in that order. Enables bookmarks + shareable admin links.
- **Scroll-position restore on tab-switch** — 7 iterations to find the real cause. Final fix is an unconditional rAF assert loop (600ms) + late-reset watcher (400ms) that runs on `visibilitychange`. Independent of the ResizeObserver-based path that handles reload/section-change. Do not add state checks to this loop — see §11A Layer 7 for why.
- **Refetch flash on tab-return** — Supabase `TOKEN_REFRESHED` was firing `has_role` RPC 2× on every refocus + re-triggering `fetchOrders` via useEffect. Fixed with a module-scoped admin-role cache in `useAuth.ts` and by keying Admin's fetchOrders effect on `user?.id` instead of the user object reference.
- **Blog Analytics broken with 400 error** — the query used `post_slug` and `viewed_at`, neither of which exist on `blog_post_views`. Real schema is a pre-aggregated view with `post_id, day, view_count`. Fixed by using the correct columns, filtering by `day`, summing `view_count` per row, and PostgREST-embedding `blog_posts` on the FK to resolve slug/title/category in one round-trip.
- **Chatbot Analytics + Follow-ups History broken with 404s** — external audit of the entire admin (~35 sections) found these two panels' backing tables never existed at all. Created 4 tables via migration `20260726_chat_and_followup_tables.sql`: `chat_conversations`, `chat_messages`, `chat_analytics`, `follow_up_logs`. Column shapes cross-checked against the exact queries the code already fires. Rest of the admin (32 sections) verified clean by the same audit — no other missing-table bugs.

**Blog feature images:** ~48 blog articles now have real DALL-E-3-generated feature images (previously all pointed at a broken shared placeholder). Batched by category, all optimized to ~150-250 KB JPEG q=82 progressive at 1600px max. Filenames follow slug convention in `public/blog-heros/`. Prompts drafted per-article by reading each article's excerpt for grounding — kept as reusable material in `scratchpad/blog-image-prompts/BATCH_*.md`.

**Documentation refresh** — DOCUMENTATION.md brought current with the July 2026 rebuilds. Also cleaned up 3 stale drift points in the admin (`OrderTemplates.tsx` had "Baby Shower" + generic "Basic/Standard/Premium Package" names → now derives from `EVENT_PACKAGES`; `AIEmailTemplates.tsx` and `FollowUpSettings.tsx` had "Premium Package" as hardcoded example → real names).

**Misc surface polish** (from earlier in the same exchange but part of this session's arc): stats-honesty pass (500+ → 100+ Invitations, removed 9 fake per-category stat overlays on /services), copy alignment (steps 2/3 on HowItWorks rewritten, Saturday hours 10am-2pm, "Enhance Your Invitation" duplicate section removed from /pricing, Milestone Birthday split off from /birthday with dedicated `/milestone-birthday` page).

### Prior sessions (up to 2026-07-17)

- **Wedding invitations page rebuild** — cinematic hero + 10 special features carousel + common grid
- **All 8 other event pages rebuilt** to the same pattern (engagement, funeral, naming, anniversary, graduation, birthday, church, corporate)
- **Homepage tweaks** — merged Weddings & Engagements card, fixed carousel arrow position, added iPhone-style phone-frame nav
- **Portfolio filter** — real clients only (was mixed with demos)
- **Templates → Designs rebuild** — new 8-tab browse catalogue, tiered pricing decoupled
- **Off-screen carousel pause** — IntersectionObserver added to 4 auto-cycling components
- **Blog pagination fix** — two-phase fetch, no more waiting for entire archive
- **Frank & Hannah + Eric & Sherita portfolio entries** — added with anonymity-friendly copy (no addresses, no Ghana Post codes)
- **/get-started confirmation banner** — shows "You picked X" when arriving with `?template=<slug>`
</content>
