# VibeLink Event — Main Site Documentation

> Last updated: 2026-07-17
> Repo: `vibelink/` (this folder)
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

```bash
# From the vibelink/ local folder:
npm run build

# Package the dist output:
tar -czf /tmp/vibelink-dist.tar.gz -C dist .

# Ship to production:
scp /tmp/vibelink-dist.tar.gz root@38.242.195.0:/tmp/

# On the server (via ssh):
cd /var/www/vibelinkevent.com
# Nuke stale prerendered subroute HTMLs BEFORE untar (they'd conflict with new content):
find . -maxdepth 2 -name 'index.html' ! -path './index.html' -delete
tar -xzf /tmp/vibelink-dist.tar.gz -C /var/www/vibelinkevent.com/

# Rebuild prerendered HTML for SEO:
cd /opt/prerender && node build-time-prerender.mjs

# Reload nginx to serve fresh content:
systemctl reload nginx
```

The whole flow takes ~90 seconds. The prerender step (~30s) walks every route and captures the initial HTML with Puppeteer so search engines get real content.

### Service worker caveat
`public/sw.js` caches JS chunks aggressively. After a deploy, mobile users may see the OLD bundle until the SW updates. When shipping a fix that Edmund needs to test immediately:
- Test in incognito first (SW doesn't persist there)
- Otherwise, hard-refresh (Ctrl+Shift+R) or use "Clear Cache" in browser DevTools

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
| `/pricing` | `pages/Pricing.tsx` | 4 tiers: Starter (GHS 1,000) · Classic (GHS 1,500) · Prestige (GHS 2,500) · Royal (GHS 4,000+) |
| `/get-started` | `pages/GetStarted.tsx` | Order form wizard. Supports `?template=<slug>` → shows "You picked X" banner |
| `/contact`, `/faq`, `/how-it-works`, `/track-order`, etc. | Various | Supporting pages |

### 9 Dedicated Event Pages
All 9 built to the same pattern using shared components. Each has its own **cinematic hero** + **special-features carousel** (10–20 features) + **common-features grid** (6 essentials shared across all).

| Route | Palette | Features count |
|---|---|---|
| `/wedding-invitations` | rose/pink | 10 |
| `/engagement-invitations` | amber/orange | 10 |
| `/funeral-programs` | slate/muted | 10 |
| `/naming-ceremony` | sky/cyan | 10 |
| `/anniversary-invitations` | champagne/gold | 10 |
| `/graduation` | navy + gold | 10 |
| `/birthday` | fuchsia/pink | 10 |
| `/church-events` | royal purple + gold | 15 |
| `/corporate-events` | navy/slate + blue | 20 |

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

### `src/data/templatesData.ts`
15 pro funeral templates with tier + addons. Merged into `/designs` as regular cards (tier/price NOT shown on the card — that info surfaces on `/pricing` and `/get-started`).

### `src/pages/PortfolioDetail.tsx` (embedded data)
⚠️ **Gotcha:** PortfolioDetail has its own hardcoded object of per-item detail (image, story, features, package). Updating `portfolioItems.ts` alone does NOT update the detail page. Both must be edited.

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

1. **Service worker cache** — deploys don't reach mobile users immediately. Test in incognito.
2. **PortfolioDetail duplicates** — updating `portfolioItems.ts` does NOT update the detail page. Both files must be edited.
3. **VPN TLS interception on Edmund's setup** — `ERR_SSL_PROTOCOL_ERROR` in Chrome/Brave is 90% VPN, 10% actual issue. Ask "are you on VPN?" first.
4. **nginx warning `protocol options redefined for 0.0.0.0:443`** — pre-existing warning, ignorable.
5. **Aspect-ratio crop** — 4:3 cards crop the sides of wide 2:1 source images. Design source images with content centred.
6. **Cache-bust manual `?v=<n>`** — `public/*.png` files aren't hashed by Vite. Add `?v=2` to force browser + CDN refresh.

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

This doc is the source of truth. Three copies must stay in sync:

1. **Local:** `vibelink/DOCUMENTATION.md` (this file)
2. **Server:** `/var/www/vibelinkevent.com/DOCUMENTATION.md` (deployed with the site, but also kept separately for admin ref at `/root/vibelinkevent-docs/`)
3. **GitHub:** committed alongside code (if the repo is on GitHub — TODO verify)

To update:
```bash
# Edit locally, then push all three:
cp DOCUMENTATION.md /path/to/git/repo/
git add DOCUMENTATION.md && git commit -m "docs: update main documentation" && git push
scp DOCUMENTATION.md root@38.242.195.0:/root/vibelinkevent-docs/DOCUMENTATION.md
```

---

## 14. Session History

Highlights of what was built in the sessions leading up to today (2026-07-17):

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
