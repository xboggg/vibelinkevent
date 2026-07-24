# VibeLink Event — Main Site Documentation

> Last updated: 2026-07-24
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
