// SINGLE SOURCE OF TRUTH for all package pricing across VibeLink.
// Every /pricing card, /get-started option, /admin form, SEO schema, and AI
// chatbot response reads from THIS file. Never hardcode prices anywhere else.
//
// Model (as of 2026-07-22): event-type-based pricing. One package per event.
// Bespoke sits above all packages as the custom/luxury option.

export type EventPackageId =
  | "wedding"
  | "engagement"
  | "funeral"
  | "corporate"
  | "naming"
  | "milestone-birthday"
  | "birthday"
  | "anniversary"
  | "graduation"
  | "church"
  | "bespoke";

export interface EventPackage {
  id: EventPackageId;
  name: string;                // Display name
  slug: string;                // URL slug for /pricing/<slug>
  price: number;               // GH₵, canonical numeric
  priceLabel: string;          // Display price ("GHS 2,500" or "GHS 4,500+")
  priceSuffix?: string;        // Optional "+" for Bespoke
  quoteOnly?: boolean;         // Bespoke uses Contact CTA instead of Order
  eventPageRoute?: string;     // Which /events page this belongs to
  tagline: string;             // One-liner for the card
  idealFor: string;            // "Ideal for..." longer description
  culturalNote?: string;       // Optional Ghana-specific framing
  features: string[];          // Bulleted feature list
  addons: PackageAddon[];      // Event-specific add-ons
  hosting: string;             // Human-readable hosting duration
  revisions: string;           // Human-readable revision count
  color: string;               // Tailwind color hint (e.g. "rose", "emerald")
  icon?: string;               // Optional lucide icon name for the card
  popular?: boolean;           // Featured badge
}

export interface PackageAddon {
  id: string;
  name: string;
  price: number;
  description: string;
  badge?: string;              // Optional label ("best value", etc.)
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ADD-ONS — available on any non-Bespoke package
// ─────────────────────────────────────────────────────────────────────────────
export const UNIVERSAL_ADDONS: PackageAddon[] = [
  { id: "custom-domain",     name: "Custom Domain",              price: 500,  description: "Use your own domain (e.g. kwameandama.com) instead of a subdomain" },
  { id: "rush-48h",          name: "Rush Delivery (48 hours)",   price: 300,  description: "Skip the queue — your invitation ready in 48 hours" },
  { id: "white-label",       name: "White-Label",                price: 300,  description: "Remove the small 'Powered by VibeLink' badge" },
  { id: "hosting-6mo",       name: "Extra Hosting (+6 months)",  price: 300,  description: "Extend your invitation's live period by 6 months" },
  { id: "hosting-1yr",       name: "Extra Hosting (+1 year)",    price: 500,  description: "Extend your invitation's live period by a full year", badge: "best value" },
  { id: "ai-photo-restore",  name: "AI Photo Restoration",       price: 150,  description: "Blurry family photos → sharp, print-ready originals" },
  { id: "extra-revision",    name: "Extra Revision Round",       price: 100,  description: "One additional round of design changes" },
  { id: "priority-support",  name: "Priority WhatsApp Support",  price: 200,  description: "Front-of-queue response from our team" },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENT-SPECIFIC ADD-ONS
// ─────────────────────────────────────────────────────────────────────────────
const WEDDING_ADDONS: PackageAddon[] = [
  { id: "save-the-date",     name: "Save-the-Date Teaser Page",  price: 500, description: "Tease the wedding weeks/months ahead with a countdown + hint page" },
  { id: "bridal-party-hub",  name: "Bridal Party Coordination Hub", price: 300, description: "Private page for bridesmaids/groomsmen — outfit colors, fittings, rehearsal schedule" },
  { id: "livestream-pro",    name: "Livestream Production Setup", price: 500, description: "We help configure YouTube/Zoom stream + embed to your invitation" },
  { id: "seating-chart",     name: "Interactive Seating Chart",   price: 200, description: "Guests see 'You're at Table 7' when they open the invitation" },
  { id: "twi-subtitles",     name: "Twi / Ga / Ewe Subtitles",    price: 200, description: "Full invitation available in a second Ghanaian language" },
];

const ENGAGEMENT_ADDONS: PackageAddon[] = [
  { id: "engagement-checklist", name: "Engagement Item Checklist",   price: 150, description: "Interactive family checklist for drinks, cloths, tools, etc." },
  { id: "bride-price-private",  name: "Private Ti Nsa Section",     price: 200, description: "Sacred bride price section visible only to immediate family" },
  { id: "twi-subtitles",        name: "Twi / Ga / Ewe Subtitles",   price: 200, description: "Full invitation available in a second Ghanaian language" },
  { id: "knocking-teaser",      name: "Knocking (Kokooko) Teaser",  price: 200, description: "Separate mini-invite for the intimate knocking ceremony" },
];

const FUNERAL_ADDONS: PackageAddon[] = [
  { id: "voice-tribute-wall",   name: "Voice Tribute Wall",         price: 300, description: "Guests record 30-second audio tributes — compiled as a keepsake" },
  { id: "nsawa-dashboard",      name: "Nsawa MoMo Tracking Dashboard", price: 250, description: "Real-time tracking of all family contributions with contributor ledger" },
  { id: "obituary-extended",    name: "Full Life-Story Obituary",   price: 150, description: "Long-form chapters covering their life, achievements, family" },
  { id: "livestream-pro",       name: "Livestream Production Setup", price: 500, description: "Help configure YouTube/Zoom stream for diaspora family" },
  { id: "1yr-anniversary",      name: "1-Year Anniversary Auto-Page", price: 200, description: "System auto-emails family a memorial page on the 1-year anniversary" },
];

const CORPORATE_ADDONS: PackageAddon[] = [
  { id: "sponsor-tiers",        name: "Sponsor Tier Logos & Recognition", price: 200, description: "Platinum/Gold/Silver sponsor sections with logos and links" },
  { id: "attendee-analytics",   name: "Attendee Analytics Dashboard", price: 300, description: "Live registration counts, engagement heatmaps, source tracking" },
  { id: "post-event-survey",    name: "Post-Event Survey Automation", price: 150, description: "Auto-sent 24hrs after event — 5-star ratings on speakers, venue, food" },
  { id: "sub-domain",           name: "Custom Sub-Domain",          price: 400, description: "yourevent.company.com" },
  { id: "delegate-badges-print", name: "Delegate Badge PDFs",       price: 200, description: "Auto-generated printable badges per registered attendee" },
];

const MILESTONE_BIRTHDAY_ADDONS: PackageAddon[] = [
  { id: "video-guestbook",      name: "Video Guestbook",            price: 250, description: "Guests record 15-sec video wishes — stitched into a memory reel" },
  { id: "life-timeline",        name: "Extended Life Timeline",     price: 200, description: "Interactive decade-by-decade photo journey" },
  { id: "roast-corner",         name: "Roast Corner",               price: 150, description: "Private space for friends to leave playful roasts" },
];

const ANNIVERSARY_ADDONS: PackageAddon[] = [
  { id: "then-vs-now",          name: "Then-vs-Now Photo Comparison", price: 200, description: "Original wedding photos next to today's photos, styled beautifully" },
  { id: "kids-tributes",        name: "Kids' Tribute Messages",     price: 150, description: "Dedicated page for children's messages to their parents" },
  { id: "vow-renewal-service",  name: "Vow Renewal Service Program", price: 200, description: "Full order-of-service booklet for the renewal ceremony" },
];

const NAMING_ADDONS: PackageAddon[] = [
  { id: "tradition-explainer",  name: "8-Day Tradition Explainer",  price: 100, description: "Educates non-Ghanaian family about the Din To ceremony" },
  { id: "libation-order",       name: "Libation Ceremony Order",    price: 150, description: "Traditional or Christian variations, editable per family" },
  { id: "baby-time-capsule",    name: "Baby Time Capsule",          price: 200, description: "Guests leave letters to be opened on baby's 18th birthday" },
];

const GRADUATION_ADDONS: PackageAddon[] = [
  { id: "sponsor-recognition",  name: "Sponsor Recognition Wall",   price: 200, description: "Beautiful thank-you page for parents/aunties/uncles who paid fees" },
  { id: "journey-timeline",     name: "Educational Journey Timeline", price: 150, description: "From nursery to graduation — photo timeline of the whole journey" },
  { id: "masters-fund",         name: "Master's Degree MoMo Fund",  price: 100, description: "Set up a contribution goal for the next degree" },
];

const CHURCH_ADDONS: PackageAddon[] = [
  { id: "multi-day-agenda",     name: "Multi-Day Program Agenda",   price: 200, description: "For revivals/conventions running 3-7 days" },
  { id: "offering-dashboard",   name: "Offering MoMo Dashboard",    price: 200, description: "Track offerings across the entire event with contributor thank-yous" },
  { id: "sermon-notes-hub",     name: "Sermon Notes Download Hub",  price: 150, description: "Preacher notes/handouts available for download per session" },
];

// ─────────────────────────────────────────────────────────────────────────────
// THE 11 PACKAGES
// ─────────────────────────────────────────────────────────────────────────────
export const EVENT_PACKAGES: EventPackage[] = [
  {
    id: "wedding",
    name: "Wedding",
    slug: "wedding",
    price: 2500,
    priceLabel: "GHS 2,500",
    eventPageRoute: "/wedding-invitations",
    tagline: "Everything a Ghanaian wedding needs",
    idealFor: "Traditional wedding, church wedding, and reception coordinated on one link — for the couple, families, and every guest at home and abroad.",
    culturalNote: "Built for the Ghanaian wedding weekend flow — from Friday's engagement to Saturday's reception.",
    features: [
      "Multi-day timeline (traditional + church + reception)",
      "RSVP with meal preferences and dietary needs",
      "20-photo gallery (pre-wedding, engagement, family)",
      "Video integration (love story film, save-the-date reel)",
      "Background music (curated Ghanaian playlist)",
      "MoMo gift link with contribution tracker",
      "Livestream embed for diaspora family",
      "Interactive seating chart preview",
      "Love story timeline (how we met → proposal)",
      "Guest Q&A / FAQ section",
      "WhatsApp share + open-in-app button",
      "Mobile-optimized for 3G networks",
      "6-month hosting",
      "3 revision rounds",
    ],
    addons: WEDDING_ADDONS,
    hosting: "6 months",
    revisions: "3 rounds",
    color: "rose",
    icon: "Heart",
    popular: true,
  },
  {
    id: "engagement",
    name: "Engagement / Customary",
    slug: "engagement",
    price: 2000,
    priceLabel: "GHS 2,000",
    eventPageRoute: "/engagement-invitations",
    tagline: "Traditional, family-focused, respectful",
    idealFor: "Customary marriage (engagement day), including the knocking ceremony and the exchange of drinks, cloths, and tools.",
    culturalNote: "Designed with elders in mind — clean typography, respectful tone, dual-language options.",
    features: [
      "Dual-language option (English + Twi/Ga/Ewe)",
      "Engagement item checklist for the family",
      "Private guest list visible only to immediate family",
      "15-photo gallery (couple + families)",
      "RSVP with head-count for family sides",
      "Program timeline (arrival → libation → item presentation)",
      "Background music (highlife, palmwine, hymns)",
      "Elder-friendly large-text mode",
      "WhatsApp share + open-in-app button",
      "90-day hosting",
      "3 revision rounds",
    ],
    addons: ENGAGEMENT_ADDONS,
    hosting: "90 days",
    revisions: "3 rounds",
    color: "amber",
    icon: "Gem",
  },
  {
    id: "funeral",
    name: "Funeral & Memorial",
    slug: "funeral",
    price: 2000,
    priceLabel: "GHS 2,000",
    eventPageRoute: "/funeral-programs",
    tagline: "Dignified, thorough, family-first",
    idealFor: "Full funerals, one-week celebrations, memorials, and remembrance services — designed to honor the departed and unite the extended family.",
    culturalNote: "Includes Ghanaian funeral flow — one-week, burial, 40-day, and 1-year auto-remembrance.",
    features: [
      "Full obituary with biography and life story",
      "Condolence wall (guests leave written tributes)",
      "MoMo Nsawa contribution tracker (visible to family)",
      "Livestream embed for diaspora family",
      "15-photo tribute gallery",
      "Service program (church + burial + reception)",
      "RSVP with meal head-count",
      "One-week, 40-day, and 1-year auto-remembrance",
      "Elder-friendly large-text mode",
      "WhatsApp share for wide family reach",
      "6-month hosting (extendable)",
      "3 revision rounds",
    ],
    addons: FUNERAL_ADDONS,
    hosting: "6 months",
    revisions: "3 rounds",
    color: "slate",
    icon: "Users",
  },
  {
    id: "corporate",
    name: "Corporate Event",
    slug: "corporate",
    price: 3500,
    priceLabel: "GHS 3,500",
    eventPageRoute: "/corporate-events",
    tagline: "For conferences, launches, AGMs, galas",
    idealFor: "Product launches, annual general meetings, industry conferences, corporate galas, and sponsor-driven events with delegate registration and sponsor recognition.",
    features: [
      "Multi-session agenda (main + breakouts)",
      "Delegate registration with confirmation emails",
      "Sponsor tier logos and recognition sections",
      "Speaker bios and session-by-session line-up",
      "RSVP with dietary + accessibility requirements",
      "Meeting-room / breakout-room maps",
      "Post-event survey automation",
      "Live analytics dashboard (registrations, opens, RSVPs)",
      "Sponsor thank-you page",
      "Professional design in your brand colours",
      "90-day hosting",
      "3 revision rounds",
    ],
    addons: CORPORATE_ADDONS,
    hosting: "90 days",
    revisions: "3 rounds",
    color: "indigo",
    icon: "Building",
  },
  {
    id: "naming",
    name: "Naming / Outdooring",
    slug: "naming",
    price: 1500,
    priceLabel: "GHS 1,500",
    eventPageRoute: "/naming-ceremony",
    tagline: "Compact, joyful, ready for the 8th day",
    idealFor: "Naming ceremonies (Din To) — the 8-day-old celebration where baby is formally welcomed to the family and community.",
    culturalNote: "Auto-countdown from birth date; tradition explainer for non-Ghanaian family.",
    features: [
      "8-day countdown from birth date",
      "Baby photo gallery",
      "RSVP with head-count",
      "Parents' story (how they met, journey to baby)",
      "Tradition explainer (Din To for international family)",
      "Background music (lullabies, hymns)",
      "Program timeline (libation → naming → blessings)",
      "WhatsApp share + open-in-app button",
      "60-day hosting",
      "2 revision rounds",
    ],
    addons: NAMING_ADDONS,
    hosting: "60 days",
    revisions: "2 rounds",
    color: "emerald",
    icon: "Baby",
  },
  {
    id: "milestone-birthday",
    name: "Milestone Birthday",
    slug: "milestone-birthday",
    price: 2000,
    priceLabel: "GHS 2,000",
    eventPageRoute: "/birthday-invitations",
    tagline: "For 30th, 40th, 50th, 60th, 70th",
    idealFor: "Big-number birthdays — where the whole family, extended community, and diaspora friends are invited to celebrate a life well-lived so far.",
    features: [
      "Life-timeline photo journey (decade by decade)",
      "Wishes wall (guests leave messages)",
      "MoMo gift link with contribution tracker",
      "RSVP with dress code and dietary needs",
      "Background music (era-appropriate playlist)",
      "Program timeline (arrival → speeches → cake → dance)",
      "Photo gallery (up to 20 photos)",
      "Guest highlight roll (mention special attendees)",
      "WhatsApp share + open-in-app button",
      "90-day hosting",
      "3 revision rounds",
    ],
    addons: MILESTONE_BIRTHDAY_ADDONS,
    hosting: "90 days",
    revisions: "3 rounds",
    color: "pink",
    icon: "Cake",
  },
  {
    id: "birthday",
    name: "Regular Birthday",
    slug: "birthday",
    price: 1200,
    priceLabel: "GHS 1,200",
    eventPageRoute: "/birthday-invitations",
    tagline: "Simple, fun, party-focused",
    idealFor: "Kids' parties, 21st birthdays, casual birthday get-togethers — a beautiful invitation without the extras of a milestone celebration.",
    features: [
      "Single-page invitation with theme colours",
      "RSVP with head-count",
      "Photo gallery (up to 8 photos)",
      "Event details (date, time, venue, dress code)",
      "Google Maps integration",
      "WhatsApp share button",
      "Mobile responsive",
      "30-day hosting",
      "1 revision round",
    ],
    addons: [],
    hosting: "30 days",
    revisions: "1 round",
    color: "purple",
    icon: "Cake",
  },
  {
    id: "anniversary",
    name: "Anniversary / Vow Renewal",
    slug: "anniversary",
    price: 1800,
    priceLabel: "GHS 1,800",
    eventPageRoute: "/anniversary-invitations",
    tagline: "For 10th, 25th, 50th anniversaries",
    idealFor: "Milestone wedding anniversaries — silver, pearl, gold, diamond — with the whole family gathering to celebrate a marriage that lasted.",
    features: [
      "Then-vs-now photo comparison (wedding day → today)",
      "Love-story timeline (updated with kids, grandkids, milestones)",
      "Kids' tribute messages page",
      "RSVP with meal head-count",
      "Background music (your first-dance song + more)",
      "Program timeline (arrival → renewal → dinner → dance)",
      "Photo gallery (family through the years)",
      "WhatsApp share + open-in-app button",
      "90-day hosting",
      "3 revision rounds",
    ],
    addons: ANNIVERSARY_ADDONS,
    hosting: "90 days",
    revisions: "3 rounds",
    color: "yellow",
    icon: "Heart",
  },
  {
    id: "graduation",
    name: "Graduation",
    slug: "graduation",
    price: 1500,
    priceLabel: "GHS 1,500",
    eventPageRoute: "/graduation",
    tagline: "Celebrate the achievement, honour the sponsors",
    idealFor: "University graduations, secondary school, professional certifications — where the whole family and the aunties/uncles who paid fees deserve their moment.",
    features: [
      "Journey photos (childhood → graduation)",
      "Sponsor thank-you page (parents, aunties, uncles)",
      "RSVP with head-count and meal preferences",
      "MoMo master's-fund contribution link",
      "Program details (ceremony → dinner → dance)",
      "Photo gallery (up to 15 photos)",
      "Background music",
      "WhatsApp share + open-in-app button",
      "60-day hosting",
      "2 revision rounds",
    ],
    addons: GRADUATION_ADDONS,
    hosting: "60 days",
    revisions: "2 rounds",
    color: "green",
    icon: "GraduationCap",
  },
  {
    id: "church",
    name: "Church Event",
    slug: "church",
    price: 2000,
    priceLabel: "GHS 2,000",
    eventPageRoute: "/church-events",
    tagline: "Harvests, conventions, ordinations, revivals",
    idealFor: "Multi-day church programs — harvest thanksgiving, conventions, revivals, ordinations, church anniversaries — where members and visitors need clear program details and a way to give.",
    features: [
      "Multi-day agenda (day-by-day session details)",
      "Offering MoMo link with per-day tracking",
      "Livestream embed for members abroad",
      "Digital program booklet (downloadable)",
      "Sermon topics and speaker bios per day",
      "RSVP with head-count",
      "Background music (praise & worship playlist)",
      "Directions with parking info",
      "Sunday School / kids' program details",
      "WhatsApp share + open-in-app button",
      "90-day hosting",
      "3 revision rounds",
    ],
    addons: CHURCH_ADDONS,
    hosting: "90 days",
    revisions: "3 rounds",
    color: "blue",
    icon: "Building",
  },
  {
    id: "bespoke",
    name: "Bespoke",
    slug: "bespoke",
    price: 4500,
    priceLabel: "GHS 4,500+",
    priceSuffix: "+",
    quoteOnly: true,
    tagline: "Custom, luxury, everything included",
    idealFor: "High-end weddings, celebrity events, multi-venue corporate galas, or any event with unique requirements. Custom-designed, custom-priced, dedicated team.",
    features: [
      "Every feature from any package (mix and match)",
      "Custom domain included (yourevent.com)",
      "Unlimited photos, videos, and revisions",
      "White-label (no VibeLink branding anywhere)",
      "Dedicated account manager (WhatsApp direct line)",
      "1-year hosting included",
      "Priority WhatsApp support (front-of-queue)",
      "All AI features (photo restoration, translations, etc.)",
      "All add-ons included",
      "Custom design consultation with our design team",
      "Multi-venue and multi-day support",
      "Sponsor-tier customization for corporate/gala events",
      "Post-event legacy website (permanent family archive)",
    ],
    addons: [],
    hosting: "1 year",
    revisions: "Unlimited",
    color: "amber",
    icon: "Sparkles",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function getPackageById(id: EventPackageId): EventPackage | undefined {
  return EVENT_PACKAGES.find((p) => p.id === id);
}

export function getPackageByRoute(route: string): EventPackage | undefined {
  return EVENT_PACKAGES.find((p) => p.eventPageRoute === route);
}

export function getBespoke(): EventPackage {
  return EVENT_PACKAGES.find((p) => p.id === "bespoke")!;
}

export function getNonBespokePackages(): EventPackage[] {
  return EVENT_PACKAGES.filter((p) => p.id !== "bespoke");
}

// Cheapest non-Bespoke price — for "Starting from" copy across the site
export function getStartingPrice(): number {
  return Math.min(...getNonBespokePackages().map((p) => p.price));
}

export function getStartingPriceLabel(): string {
  return `GHS ${getStartingPrice().toLocaleString()}`;
}
