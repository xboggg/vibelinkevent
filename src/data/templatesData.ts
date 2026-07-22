// Template catalogue for the /templates commerce page.
// Each template is mapped to one of the four existing pricing tiers (Starter/Classic/Prestige/Royal)
// and ships with a list of base features. Addons sit on top of the base price.

export type Tier = "Starter" | "Classic" | "Prestige" | "Royal";
export type Category = "Funeral" | "Wedding" | "Naming" | "Anniversary" | "Birthday" | "Graduation" | "Church" | "Corporate";

export interface TemplateItem {
  id: number;
  slug: string;
  name: string;
  tagline: string;          // 1-line vibe summary, shown on card
  category: Category;
  tier: Tier;
  basePrice: number;        // GHS — pulled from tier
  thumbnail: string;        // /templates-img/<slug>-thumb.jpg (atmospheric, 1200x630)
  hero?: string;            // optional, used on detail page if separate
  previewUrl: string;       // absolute or local path to a working demo HTML
  bestFor: string;          // who this template fits — shown on detail page
  features: string[];       // distinguishing features (shown on detail page)
  baseFeatures: string[];   // included in the tier (read-only)
  conceptStory: string;     // 2-3 sentence narrative for the detail page
  palette: string[];        // hex stops for the colour-palette swatch on detail page
  comingSoon?: boolean;     // true = no live preview yet; card shows "Coming Soon"
}

// Demo previews are hosted at this subdomain.
const DEMO_BASE = "https://demos.vibelinkevent.com/funeral";

// DEPRECATED tier model — VibeLink moved to event-based pricing in Jul 2026.
// These "tiers" are now used only as a complexity/design-elaborateness label
// on funeral templates (all funerals share the same GHS 2,000 package price).
// The "Royal" label maps to Bespoke (custom quote from GHS 4,500+).
// See src/data/eventPackages.ts for the canonical event-package pricing.
export const tierPrices: Record<Tier, number> = {
  Starter: 2000,   // Funeral package base
  Classic: 2000,   // Funeral package base
  Prestige: 2000,  // Funeral package base
  Royal: 4500,     // Bespoke starting price
};

// Base features included in each tier (mirrors vibelinkevent.com/pricing).
export const tierBaseFeatures: Record<Tier, string[]> = {
  Starter: [
    "1 hero banner image",
    "Pre-designed template",
    "Event details section",
    "Countdown timer",
    "Google Maps integration",
    "WhatsApp share button",
    "Mobile responsive",
    "30-day hosting",
    "1 revision round",
  ],
  Classic: [
    "Everything in Starter",
    "2 hero banner images",
    "Custom colour scheme",
    "Photo gallery (5 photos)",
    "RSVP tracking",
    "Background music",
    "White-label",
    "90-day hosting",
    "2 revision rounds",
  ],
  Prestige: [
    "Everything in Classic",
    "3 hero banner images",
    "Photo gallery (10 photos)",
    "Calendar sync",
    "MoMo donation link",
    "Priority WhatsApp support",
    "6-month hosting",
    "5 revisions",
  ],
  Royal: [
    "Everything in Prestige",
    "5 hero banner images",
    "Multiple event pages",
    "Advanced animations",
    "MoMo tracking dashboard",
    "Program booklet page",
    "Host dashboard",
    "Custom domain",
    "Book a ride",
    "Lost & found",
    "White-label (no branding)",
    "1-year hosting",
    "Unlimited revisions",
    "Dedicated account manager",
    "Professional consultation",
  ],
};

// =========================================================================
// 15 FUNERAL TEMPLATES — every demo from vibelink/events/funeraldemo1-10
// plus 5 new ones (11-15) that still need to be built.
// =========================================================================

export const templates: TemplateItem[] = [
  // ─── SIMPLE DESIGN COMPLEXITY (funeral package GHS 2,000) ─────────────
  {
    id: 4,
    slug: "letter-from-a-loved-one",
    name: "Letter from a Loved One",
    tagline: "The page reads as a personal letter from the deceased to their family",
    category: "Funeral",
    tier: "Starter",
    basePrice: tierPrices.Starter,
    thumbnail: "/templates-img/letter-thumb.jpg",
    previewUrl: `${DEMO_BASE}/letter-from-a-loved-one/`,
    bestFor: "Pastors, teachers, parents — anyone who left last words their family should hear",
    features: [
      "Sepia paper aesthetic with typewriter typography",
      "Wax-seal splash that 'breaks' on tap",
      "Tributes appear as postscript notes",
      "Photo strip styled as clipped snapshots",
      "Handwritten salutation + signature",
    ],
    baseFeatures: tierBaseFeatures.Starter,
    conceptStory:
      "The entire page is structured as a letter the deceased wrote to those they left behind. " +
      "Visitors aren't browsing a memorial — they're reading a goodbye. Visitors leave postscripts " +
      "to the family in the same letter format.",
    palette: ["#f3e9d2", "#8a1f1f", "#5b3a1a", "#3d2817"],
  },
  {
    id: 5,
    slug: "field-of-memories",
    name: "Field of Memories",
    tagline: "NY-Times-style obituary feature: huge serifs, cream paper, pull quotes",
    category: "Funeral",
    tier: "Starter",
    basePrice: tierPrices.Starter,
    thumbnail: "/templates-img/field-thumb.jpg",
    previewUrl: `${DEMO_BASE}/field-of-memories/`,
    bestFor: "Artists, musicians, public figures, anyone deserving an editorial send-off",
    features: [
      "Broadsheet masthead with kicker → headline → dek pattern",
      "Magazine-spread layout with drop caps & pull quotes",
      "Black & white documentary-style lead image",
      "Tributes presented as 'letters to the editor'",
      "Asymmetric editorial typography",
    ],
    baseFeatures: tierBaseFeatures.Starter,
    conceptStory:
      "Treats the life as a feature obituary. Massive serif headlines, generous white space, " +
      "lead photograph in monochrome — the visual vocabulary of the New York Times or The Guardian. " +
      "Best for lives that deserve to be read like an article, not browsed like a website.",
    palette: ["#f4eee0", "#a31d1d", "#1a1a1a", "#5a5a5a"],
  },
  {
    id: 8,
    slug: "chapter-and-verse",
    name: "Chapter & Verse",
    tagline: "An antiquarian book — sections become numbered chapters with page-turn feel",
    category: "Funeral",
    tier: "Starter",
    basePrice: tierPrices.Starter,
    thumbnail: "/templates-img/chapter-thumb.jpg",
    previewUrl: `${DEMO_BASE}/chapter-and-verse/`,
    bestFor: "Academics, writers, librarians, anyone whose life was bookish",
    features: [
      "Splash is a closed leather book that 'opens' on tap",
      "Hero is a two-page spread with frontispiece + title page",
      "Each section is a numbered chapter with drop caps and ❦ flourishes",
      "Tributes appear as marginalia",
      "Closes with FINIS",
    ],
    baseFeatures: tierBaseFeatures.Starter,
    conceptStory:
      "The life as a published book. Visitors don't scroll — they turn pages. Drop caps, page folios, " +
      "marginalia, and a printed-press aesthetic. Perfect for lives spent in scholarship, writing, or reading.",
    palette: ["#f0e8d3", "#4a2818", "#b59342", "#6b1a1a"],
  },

  // ─── STANDARD DESIGN COMPLEXITY (funeral package GHS 2,000) ──────────
  {
    id: 1,
    slug: "cathedral-of-stars",
    name: "Cathedral of Stars",
    tagline: "Cosmic memorial — constellation forms their name; stars twinkle in the background",
    category: "Funeral",
    tier: "Classic",
    basePrice: tierPrices.Classic,
    thumbnail: "/templates-img/cathedral-thumb.jpg",
    previewUrl: `${DEMO_BASE}/cathedral-of-stars/`,
    bestFor: "Astronomers, philosophers, contemplative elders, chiefs",
    features: [
      "Animated constellation splash forming the deceased's name",
      "Always-on twinkling starfield background",
      "Arc-shaped programme timeline like the night sky",
      "Live countdown to the burial service",
      "Royal navy + brushed gold palette",
    ],
    baseFeatures: tierBaseFeatures.Classic,
    conceptStory:
      "A cosmic memorial. Visitors arrive to a single constellation drawing itself across the night sky, " +
      "spelling out the deceased's name. Best for lives spent looking up — or for chiefs and elders whose " +
      "passing feels universe-scale.",
    palette: ["#03050f", "#d9b65a", "#0e1438", "#efe7d4"],
  },
  {
    id: 9,
    slug: "tides-of-time",
    name: "Tides of Time",
    tagline: "Dawn shoreline — name written in sand as a wave gently washes",
    category: "Funeral",
    tier: "Classic",
    basePrice: tierPrices.Classic,
    thumbnail: "/templates-img/tides-thumb.jpg",
    previewUrl: `${DEMO_BASE}/tides-of-time/`,
    bestFor: "Sailors, fishermen, naval officers, coastal lives",
    features: [
      "Splash: sun rising as name appears in sand, wave washes",
      "Ship's-log style funeral programme",
      "Polaroid photos scattered across a beach background",
      "Tributes presented as 'bottles cast to sea'",
      "Tide-line dividers between sections",
    ],
    baseFeatures: tierBaseFeatures.Classic,
    conceptStory:
      "Coastal, contemplative, golden-hour. The page opens at dawn on a shoreline; the deceased's name " +
      "is written in sand and a wave gently washes over it. Built for lives shaped by the sea.",
    palette: ["#f3ecdf", "#2f5b66", "#e8a55a", "#7fa9ad"],
  },
  {
    id: 6,
    slug: "the-last-drum",
    name: "The Last Drum",
    tagline: "Animated drum splash with rippling sound — for traditional cultural figures",
    category: "Funeral",
    tier: "Classic",
    basePrice: tierPrices.Classic,
    thumbnail: "/templates-img/lastdrum-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-last-drum/`,
    bestFor: "Musicians, master drummers, traditional cultural figures",
    features: [
      "Animated atumpan drum strike with ripple effect on splash",
      "Soundwave SVG dividers between sections",
      "Portrait pulses with a heartbeat glow",
      "'Three Beats' rhythmic biography panel",
      "Horizontal scrolling photo strip",
    ],
    baseFeatures: tierBaseFeatures.Classic,
    conceptStory:
      "Built around the visual language of the Ghanaian atumpan drum. The splash shows a single drum strike " +
      "rippling outward. The whole page pulses with quiet rhythm. Made for lives that had a beat.",
    palette: ["#0a0506", "#d4471d", "#c89c3f", "#7a1818"],
  },
  {
    id: 13,
    slug: "the-hourglass",
    name: "The Hourglass",
    tagline: "Sand visibly falls between sections — life lived, legacy continuing",
    category: "Funeral",
    tier: "Classic",
    basePrice: tierPrices.Classic,
    thumbnail: "/templates-img/hourglass-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-hourglass/`,
    bestFor: "Centenarians, well-lived-life framings, dignified contemplative send-offs",
    features: [
      "Sand-flow animation triggered by scroll",
      "Two-part layout: 'life lived' (top) → 'legacy continuing' (bottom)",
      "Brass-and-glass aesthetic",
      "Time-themed section eyebrows ('In her decades…', 'In her hours…')",
      "Slow, deliberate scroll pacing",
    ],
    baseFeatures: tierBaseFeatures.Classic,
    conceptStory:
      "Time is the central metaphor. As you scroll, sand falls from the top half (life lived) to the bottom " +
      "half (legacy continuing). Built for the lives where the family's first thought was 'what a long, " +
      "good life'.",
    palette: ["#1a1209", "#c4a47a", "#5a3a1a", "#e8dfc4"],
    comingSoon: true,
  },
  {
    id: 14,
    slug: "the-marketplace",
    name: "The Marketplace",
    tagline: "Old account-ledger aesthetic — each section a ledger entry",
    category: "Funeral",
    tier: "Classic",
    basePrice: tierPrices.Classic,
    thumbnail: "/templates-img/marketplace-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-marketplace/`,
    bestFor: "Traders, market women, entrepreneurs, accountants",
    features: [
      "Hand-lined ledger paper aesthetic",
      "Each section presented as a numbered ledger entry",
      "Stamped/sealed sub-headers",
      "Strong serif typography",
      "Photo gallery laid out like market-day spread",
    ],
    baseFeatures: tierBaseFeatures.Classic,
    conceptStory:
      "For lives spent in the marketplace — selling, building, balancing books. The visual vocabulary is " +
      "old ledger paper, ink stamps, careful columns. Quietly powerful for traders and entrepreneurs.",
    palette: ["#f3ecd6", "#3a2818", "#a8420f", "#6e5a3a"],
    comingSoon: true,
  },

  // ─── ELEVATED DESIGN COMPLEXITY (funeral package GHS 2,000) ──────────
  {
    id: 2,
    slug: "the-river",
    name: "The River",
    tagline: "Horizontal-scroll journey — the page IS a river you travel down",
    category: "Funeral",
    tier: "Prestige",
    basePrice: tierPrices.Prestige,
    thumbnail: "/templates-img/river-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-river/`,
    bestFor: "Fishermen, coastal families, 'her life flowed through everyone' framings",
    features: [
      "Horizontal-scroll seven-bend journey on desktop, vertical on mobile",
      "Live animated water background with three wave layers",
      "Click-arrow + dot pagination + keyboard arrow navigation",
      "Floating polaroid gallery",
      "Tributes appear as ripples",
      "Touch-swipe support on mobile",
    ],
    baseFeatures: tierBaseFeatures.Prestige,
    conceptStory:
      "Visitors move through seven 'bends' of the river — left to right on desktop, top to bottom on mobile. " +
      "Each bend is a new chapter of the life. Photos appear as polaroids floating on the surface; tributes " +
      "ripple outward.",
    palette: ["#031824", "#13556a", "#c89a4f", "#a8d5e2"],
  },
  {
    id: 3,
    slug: "kente-codex",
    name: "Kente Codex",
    tagline: "Bold Ghanaian geometric — kente stripes and Adinkra symbols throughout",
    category: "Funeral",
    tier: "Prestige",
    basePrice: tierPrices.Prestige,
    thumbnail: "/templates-img/kente-thumb.jpg",
    previewUrl: `${DEMO_BASE}/kente-codex/`,
    bestFor: "Chiefs, royals, traditional leaders, deeply Ghanaian send-offs",
    features: [
      "Real kente stripe patterns as section dividers",
      "Each section headed by a different Adinkra symbol",
      "Geometric royal palette: crimson, gold, emerald",
      "Bold Bodoni typography",
      "Royal portrait framed in conic-gradient ring",
    ],
    baseFeatures: tierBaseFeatures.Prestige,
    conceptStory:
      "Heritage front and centre. Authentic kente stripe patterns form section dividers; Adinkra symbols head each chapter. " +
      "For lives that were unmistakably Ghanaian — chiefs, queens, royals, custodians.",
    palette: ["#0f0a06", "#a3171c", "#d4af37", "#0a6a3a"],
  },
  {
    id: 7,
    slug: "eternal-garden",
    name: "Eternal Garden",
    tagline: "Botanical watercolor — tributes literally bloom as flowers in a virtual garden",
    category: "Funeral",
    tier: "Prestige",
    basePrice: tierPrices.Prestige,
    thumbnail: "/templates-img/garden-thumb.jpg",
    previewUrl: `${DEMO_BASE}/eternal-garden/`,
    bestFor: "Teachers, gardeners, mothers, nature-lovers; tone is gentle rather than solemn",
    features: [
      "Dewdrop-and-leaves splash",
      "Tributes appear as blooming flowers in a virtual garden",
      "Multiple flower-color variants per tribute author",
      "Soft watercolor texture throughout",
      "Polaroid-frame gallery with slight tilt",
      "Vine-shaped timeline",
    ],
    baseFeatures: tierBaseFeatures.Prestige,
    conceptStory:
      "The gentlest of the funeral templates. Visitors don't 'leave a comment' — they plant a flower in " +
      "her garden. The garden fills with blooms over the weeks before the funeral, each a tribute. " +
      "Perfect for lives spent nurturing others.",
    palette: ["#f5f1e8", "#5e7a52", "#e8a8a0", "#c9a35a"],
  },
  {
    id: 10,
    slug: "the-family-tree",
    name: "The Family Tree",
    tagline: "An animated growing tree — each leaf a memory, visitors can hang their own",
    category: "Funeral",
    tier: "Prestige",
    basePrice: tierPrices.Prestige,
    thumbnail: "/templates-img/familytree-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-family-tree/`,
    bestFor: "Centenarians, matriarchs/patriarchs of large families, multi-generational gatherings",
    features: [
      "Animated 'seed grows into tree' splash",
      "SVG family tree showing 6 children + 32 grandchild dots + 87 great-grand blooms",
      "Visitors can 'hang a leaf' on the tree with their tribute",
      "Live counter of family generations",
      "Decade-by-decade biography",
      "Multi-tier flower variants by generation",
    ],
    baseFeatures: tierBaseFeatures.Prestige,
    conceptStory:
      "Built around an actual animated family tree. Visitors can see the size of the legacy at a glance — " +
      "six branches for the children, dozens of leaves for grandchildren, gold blooms for the great-grands. " +
      "Visitors hang their own leaves with tributes.",
    palette: ["#1d2a1e", "#3e5a3a", "#e8c267", "#f4ecd8"],
  },
  {
    id: 15,
    slug: "the-stained-glass",
    name: "The Stained Glass",
    tagline: "Each section viewed through a different SVG stained-glass panel — devout and reverent",
    category: "Funeral",
    tier: "Prestige",
    basePrice: tierPrices.Prestige,
    thumbnail: "/templates-img/stainedglass-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-stained-glass/`,
    bestFor: "Pastors, devout Christians, church elders, deacons",
    features: [
      "SVG stained-glass panels frame each section",
      "Scripture verses integrated as dividers",
      "Hymn-lyric tribute card option",
      "Jewel-tone palette: ruby, sapphire, amber, emerald",
      "Reverent serif typography",
      "Light-through-glass casting animation",
    ],
    baseFeatures: tierBaseFeatures.Prestige,
    conceptStory:
      "Built for the deeply devout. Each section is 'viewed through' a different stained-glass window — " +
      "biblical scenes, jewel tones, light filtering through. Hymns and scripture are woven into the tribute " +
      "experience.",
    palette: ["#0f0815", "#7a1430", "#d4a533", "#2a5a8a"],
    comingSoon: true,
  },

  // ─── LUXURY / BESPOKE DESIGN (upgrade to Bespoke, from GHS 4,500+) ────
  {
    id: 11,
    slug: "the-cinema",
    name: "The Cinema",
    tagline: "Page IS a film — cinematic transitions, optional tribute reel",
    category: "Funeral",
    tier: "Royal",
    basePrice: tierPrices.Royal,
    thumbnail: "/templates-img/cinema-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-cinema/`,
    bestFor: "Younger deceased, creatives, families that want emotional video integration",
    features: [
      "Cinematic splash with scene-cut transitions",
      "Optional tribute reel upload (video addon)",
      "Title-card section headers like film credits",
      "Soundtrack-style background music",
      "Dramatic lighting overlays",
      "End-credits style closing",
    ],
    baseFeatures: tierBaseFeatures.Royal,
    conceptStory:
      "The whole page reads like a film. Sections transition with scene cuts; headings appear like title cards. " +
      "Premium tier because it pairs naturally with video-tribute reels and bespoke soundtrack work.",
    palette: ["#0a0a0a", "#c41e3a", "#f5e6c8", "#3a3a3a"],
    comingSoon: true,
  },
  {
    id: 12,
    slug: "the-vinyl",
    name: "The Vinyl",
    tagline: "Spinning vinyl record plays their favourite song — album-cover layout",
    category: "Funeral",
    tier: "Royal",
    basePrice: tierPrices.Royal,
    thumbnail: "/templates-img/vinyl-thumb.jpg",
    previewUrl: `${DEMO_BASE}/the-vinyl/`,
    bestFor: "Musicians, music lovers, DJs, 'she always had the radio on'",
    features: [
      "Spinning vinyl record hero that plays their favourite song",
      "Album-cover style track-list of life events",
      "Liner-note style tribute layout",
      "B-side track switching",
      "Warm tungsten record-shop palette",
      "Custom album-art generator addon-eligible",
    ],
    baseFeatures: tierBaseFeatures.Royal,
    conceptStory:
      "Built around the visual language of vinyl. The hero is a record that actually spins and plays their " +
      "song. Tributes are styled as liner notes. The deepest premium pairing of music and memory.",
    palette: ["#0a0608", "#c89a4f", "#3a1f0a", "#e8d9b7"],
    comingSoon: true,
  },
];

// =========================================================================
// ADDON CATALOGUE — GHS prices, mapped to feature buckets
// =========================================================================

export type AddonCategory = "Content & Voice" | "Visual & Media" | "Logistics" | "Family / Admin" | "Localization" | "Infrastructure";

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: AddonCategory;
  price: number;        // GHS
  premium?: boolean;    // flag for "premium" badge
}

export const addons: Addon[] = [
  // ── Content & Voice ──
  { id: "voice-tribute-wall",   name: "Voice Tribute Wall",          description: "Visitors record 30-second audio tributes that play back on the page. Server-backed, downloadable as a ZIP keepsake.", category: "Content & Voice", price: 300, premium: true },
  { id: "live-candle-altar",    name: "Live Candle Altar",           description: "A virtual altar where every visitor can light a candle in real time. Live counter.", category: "Content & Voice", price: 250 },
  { id: "live-stream-embed",    name: "Live Stream Embed",           description: "Embed YouTube / Zoom live stream so diaspora family can watch the service in real time.", category: "Content & Voice", price: 200 },
  { id: "guest-messaging-wall", name: "Guest Messaging Wall",        description: "Public-facing message wall (different from condolences — short messages, real-time).", category: "Content & Voice", price: 200 },
  { id: "obituary-section",     name: "Full Obituary Section",       description: "Long-form life-story section with chapters and pull quotes.", category: "Content & Voice", price: 150 },

  // ── Visual & Media ──
  { id: "video-background",     name: "Video Background",            description: "Cinematic video loop in the hero. We edit the footage you provide; you supply ≤90s of source video.", category: "Visual & Media", price: 450, premium: true },
  { id: "custom-og-share",      name: "Custom OG / WhatsApp Card",   description: "We design a custom 1200×630 share card that previews when the link is shared on WhatsApp / Facebook.", category: "Visual & Media", price: 150 },
  { id: "gallery-extra-10",     name: "Extra 10 Photos in Gallery",  description: "Bigger photo gallery — useful for long lives or lots of family events.", category: "Visual & Media", price: 150 },
  { id: "gallery-extra-25",     name: "Extra 25 Photos in Gallery",  description: "For centenarians, public figures, or large extended families with deep photo archives.", category: "Visual & Media", price: 350 },
  { id: "photo-booth-frame",    name: "Photo Booth Frame",           description: "Downloadable PNG frame with funeral branding for guests to overlay on their photos.", category: "Visual & Media", price: 150 },

  // ── Logistics ──
  { id: "qr-checkin",           name: "QR Check-in System",          description: "Generate per-guest QR codes for venue check-in. Comes with admin dashboard for attendance.", category: "Logistics", price: 350 },
  { id: "lost-found",           name: "Lost & Found",                description: "Module for guests to report or claim items lost at the venue.", category: "Logistics", price: 200 },
  { id: "book-a-ride",          name: "Book a Ride Integration",     description: "One-tap to Uber / Bolt / Yango from the venue page.", category: "Logistics", price: 100 },
  { id: "meal-preferences",     name: "Meal Preferences Tracking",   description: "Collect dietary requirements on the RSVP form.", category: "Logistics", price: 200 },
  { id: "multiple-venues",      name: "Multiple Venue Support",      description: "Separate map + directions blocks for vigil / service / interment if they're in different places.", category: "Logistics", price: 150 },
  { id: "nearby-accommodation", name: "Nearby Accommodation List",   description: "Curated list of nearby hotels with rates and contact for out-of-town guests.", category: "Logistics", price: 120 },

  // ── Family / Admin ──
  { id: "host-dashboard",       name: "Host / Admin Dashboard",      description: "Family-only dashboard to view RSVPs, condolences, candles, and download exports.", category: "Family / Admin", price: 400, premium: true },
  { id: "momo-tracking",        name: "MoMo Donation Tracking Dashboard", description: "If donations are accepted via MoMo, this dashboard reconciles and tracks them.", category: "Family / Admin", price: 350 },
  { id: "guest-analytics",      name: "Guest Analytics",             description: "Views, shares, RSVPs over time. Useful for diaspora-engagement reporting.", category: "Family / Admin", price: 250 },
  { id: "calendar-sync",        name: "Calendar Sync (.ics)",        description: "Download a .ics file to add the funeral programme to Google / Outlook / Apple Calendar.", category: "Family / Admin", price: 80 },
  { id: "contact-cards",        name: "Contact Cards (vCard)",       description: "Family-contact cards downloadable as .vcf — saves straight to phone.", category: "Family / Admin", price: 80 },
  { id: "extra-revisions",      name: "Additional Revisions (+3)",   description: "More revision rounds beyond what your tier includes.", category: "Family / Admin", price: 200 },

  // ── Localization ──
  { id: "twi-translation",      name: "Twi Translation",             description: "Full Twi translation of all on-page text, toggle-able.", category: "Localization", price: 350 },
  { id: "ga-translation",       name: "Ga Translation",              description: "Full Ga translation of all on-page text, toggle-able.", category: "Localization", price: 350 },
  { id: "ewe-translation",      name: "Ewe Translation",             description: "Full Ewe translation of all on-page text, toggle-able.", category: "Localization", price: 350 },
  { id: "language-toggle-ui",   name: "Multi-language Toggle UI",    description: "Adds the language-switcher control to the page header. Required if you order any translation.", category: "Localization", price: 200 },

  // ── Infrastructure ──
  { id: "custom-domain",        name: "Custom Domain",               description: "Use your own .com / .com.gh domain instead of the free <subdomain>.vibelinkevent.com.", category: "Infrastructure", price: 500, premium: true },
  { id: "hosting-6mo",          name: "Extended Hosting +6 Months",  description: "Adds 6 months to the hosting included in your tier.", category: "Infrastructure", price: 200 },
  { id: "hosting-1yr",          name: "Extended Hosting +1 Year",    description: "Adds a full year to the hosting included in your tier.", category: "Infrastructure", price: 350 },
  { id: "annual-renewal",       name: "Memorial Page Renewal (Annual)", description: "Keeps the memorial page online indefinitely with annual renewal at this rate.", category: "Infrastructure", price: 400 },
  { id: "thank-you-page",       name: "Thank You Page",              description: "Post-funeral page family can publish thanking guests, sharing photos from the day.", category: "Infrastructure", price: 120 },
];

// =========================================================================
// Helpers
// =========================================================================

export const formatGHS = (n: number): string =>
  `GHS ${n.toLocaleString("en-GH")}`;

export const templatesByTier = (): Record<Tier, TemplateItem[]> => {
  const out: Record<Tier, TemplateItem[]> = { Starter: [], Classic: [], Prestige: [], Royal: [] };
  for (const t of templates) out[t.tier].push(t);
  return out;
};

export const findTemplateBySlug = (slug: string): TemplateItem | undefined =>
  templates.find((t) => t.slug === slug);

export const addonsByCategory = (): Record<AddonCategory, Addon[]> => {
  const out: Record<AddonCategory, Addon[]> = {
    "Content & Voice":  [],
    "Visual & Media":   [],
    "Logistics":        [],
    "Family / Admin":   [],
    "Localization":     [],
    "Infrastructure":   [],
  };
  for (const a of addons) out[a.category].push(a);
  return out;
};

// WhatsApp number that receives orders (primary support line).
export const ORDER_WHATSAPP = "+4915757178561";
