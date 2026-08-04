import {
  Heart,
  Church,
  GraduationCap,
  Cake,
  Baby,
  Building2,
  PartyPopper,
  Flower2,
  Gem,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { EVENT_PACKAGES } from "./eventPackages";

export interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  popular: boolean;
  features: string[];
  heroImages: number;
  hosting: string;
  revisions: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  category: "delivery" | "design" | "features" | "language" | "hosting";
  // Optional. If present, the add-on is treated as ALREADY INCLUDED when the
  // customer's package ID appears in this list — AddOnsStep hides it from
  // the "extras" grid and shows it under "Already in your package" instead.
  // Package IDs come from EventPackageId in eventPackages.ts.
  includedInPackages?: string[];
  // Optional. If present, the add-on is ONLY offered when the customer's
  // package ID is in this list. Used to hide event-specific add-ons that
  // make no sense elsewhere (e.g. Memory Tribute Wall on a Wedding order).
  // Absent = available on all packages.
  applicableToPackages?: string[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  mood: string;
}

export interface StylePreference {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// Event types shown as the FIRST step of the order form. Selecting one
// determines which package the customer gets — one package per event type.
// IDs map 1:1 to EVENT_PACKAGES.id (see eventPackages.ts).
export const eventTypes: EventType[] = [
  { id: "wedding",             name: "Wedding",              icon: Heart,            description: "GHS 2,500 — Traditional + church + reception" },
  { id: "engagement",          name: "Engagement",           icon: Gem,              description: "GHS 2,000 — Customary marriage & knocking" },
  { id: "funeral",             name: "Funeral & Memorial",   icon: Flower2,          description: "GHS 2,000 — Full funeral or memorial" },
  { id: "corporate",           name: "Corporate Event",      icon: Building2,        description: "GHS 3,500 — Conferences, launches, AGMs" },
  { id: "naming",              name: "Naming / Outdooring",  icon: Baby,             description: "GHS 1,500 — 8-day baby naming" },
  { id: "milestone-birthday",  name: "Milestone Birthday",   icon: Cake,             description: "GHS 2,000 — 30th, 40th, 50th, 60th, 70th" },
  { id: "birthday",            name: "Regular Birthday",     icon: Cake,             description: "GHS 1,200 — Kids' parties, casual birthdays" },
  { id: "anniversary",         name: "Anniversary",          icon: PartyPopper,      description: "GHS 1,800 — Silver / Pearl / Gold / Diamond" },
  { id: "graduation",          name: "Graduation",           icon: GraduationCap,    description: "GHS 1,500 — Uni, secondary, professional" },
  { id: "church",              name: "Church Event",         icon: Church,           description: "GHS 2,000 — Harvest, convention, ordination" },
  { id: "bespoke",             name: "Bespoke / Custom",     icon: Sparkles,         description: "From GHS 4,500 — Anything unique" },
];

// Packages derived from the single-source EVENT_PACKAGES. Each event type has
// exactly ONE package; customer picks event, gets its package. No tier confusion.
export const packages: Package[] = EVENT_PACKAGES.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  description: p.tagline,
  popular: !!p.popular,
  heroImages: p.id === "bespoke" ? 5 : p.id === "wedding" ? 3 : p.id === "birthday" ? 1 : 2,
  hosting: p.hosting,
  revisions: p.revisions,
  features: p.features,
}));

// includedInPackages field: cross-referenced against every package's `features`
// list in eventPackages.ts. Any add-on whose function overlaps with a feature
// the package already ships gets that package ID in the list — AddOnsStep
// then hides it from the extras grid so the customer isn't asked to pay
// for something they already have. Bespoke ("All add-ons included") is
// present on nearly every add-on.
export const addOns: AddOn[] = [
  // Design
  { id: "video-integration", name: "Video Integration", price: 200, priceLabel: "GHS 200", category: "design", includedInPackages: ["wedding", "bespoke"] },
  { id: "extra-revision", name: "Extra Revision Round", price: 100, priceLabel: "GHS 100", category: "design", includedInPackages: ["bespoke"] },
  { id: "extra-photos", name: "Extra Photos (+10)", price: 100, priceLabel: "GHS 100", category: "design", includedInPackages: ["bespoke"] },
  // Features
  { id: "calendar-sync", name: "Calendar Sync", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["bespoke"] },
  { id: "momo-tracking", name: "MoMo Tracking Dashboard", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["wedding", "funeral", "milestone-birthday", "graduation", "church", "bespoke"] },
  { id: "program-booklet", name: "Program Booklet Page", price: 150, priceLabel: "GHS 150", category: "features", includedInPackages: ["church", "bespoke"] },
  { id: "host-dashboard", name: "Host Dashboard", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["corporate", "bespoke"] },
  { id: "rsvp", name: "RSVP Tracking", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["wedding", "engagement", "funeral", "corporate", "naming", "milestone-birthday", "birthday", "anniversary", "graduation", "church", "bespoke"] },
  { id: "qr-checkin", name: "QR Check-in System", price: 150, priceLabel: "GHS 150", category: "features", includedInPackages: ["bespoke"] },
  { id: "digital-guestbook", name: "Digital Guestbook", price: 150, priceLabel: "GHS 150", category: "features", includedInPackages: ["milestone-birthday", "bespoke"] },
  { id: "gift-acknowledgment", name: "Gift Acknowledgment Page", price: 150, priceLabel: "GHS 150", category: "features", includedInPackages: ["corporate", "graduation", "bespoke"] },
  { id: "livestream", name: "Live Stream Embed", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["wedding", "funeral", "church", "bespoke"] },
  { id: "thank-you", name: "Post-Event Thank You Page", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["corporate", "graduation", "bespoke"] },
  // Guest Messaging Wall is a richer, moderated live wall — distinct from a
  // package's simple condolence/wishes wall. Paid extra for everyone except Bespoke.
  { id: "messaging-wall", name: "Guest Messaging Wall", price: 150, priceLabel: "GHS 150", category: "features", includedInPackages: ["bespoke"] },
  { id: "photo-booth", name: "Photo Booth Frame", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["bespoke"] },
  // Event Timeline is a richer visual display — distinct from a package's
  // simple "Program timeline" text. Paid extra for everyone except Bespoke.
  { id: "timeline", name: "Event Timeline/Program Display", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["wedding", "engagement", "funeral", "corporate", "naming", "milestone-birthday", "anniversary", "graduation", "church", "bespoke"] },
  { id: "tribute-wall", name: "Memory Tribute Wall (funerals)", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["funeral", "bespoke"], applicableToPackages: ["funeral", "bespoke"] },
  // Background Music upgrade lets the customer pick their OWN track —
  // distinct from a package's default curated playlist. Paid extra for
  // everyone except Bespoke.
  { id: "bg-music", name: "Background Music", price: 50, priceLabel: "GHS 50", category: "features", includedInPackages: ["wedding", "engagement", "funeral", "naming", "milestone-birthday", "birthday", "anniversary", "church", "bespoke"] },
  { id: "lost-found", name: "Lost & Found", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["bespoke"] },
  { id: "nearby-accommodation", name: "Nearby Accommodation", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["bespoke"] },
  { id: "book-a-ride", name: "Book a Ride", price: 100, priceLabel: "GHS 100", category: "features", includedInPackages: ["bespoke"] },
  // Language
  { id: "extra-language", name: "Additional Language", price: 150, priceLabel: "GHS 150", category: "language", includedInPackages: ["engagement", "bespoke"] },
  { id: "bilingual-twi", name: "Bilingual (English + Twi)", price: 150, priceLabel: "GHS 150", category: "language", includedInPackages: ["engagement", "bespoke"] },
  { id: "bilingual-french", name: "Bilingual (English + French)", price: 150, priceLabel: "GHS 150", category: "language", includedInPackages: ["bespoke"] },
  // Hosting — prices must stay in lockstep with UNIVERSAL_ADDONS in
  // eventPackages.ts (the /pricing page's source of truth).
  { id: "hosting-6m", name: "Extended Hosting (6 months)", price: 300, priceLabel: "GHS 300", category: "hosting" },
  { id: "hosting-1y", name: "Extended Hosting (1 year) — best value", price: 500, priceLabel: "GHS 500", category: "hosting", includedInPackages: ["bespoke"] },
  { id: "custom-domain", name: "Custom Domain", price: 500, priceLabel: "GHS 500/yr", category: "hosting", includedInPackages: ["bespoke"] },
  // Memorial Page Renewal removed from order form — it's a future recurring
  // subscription (GHS 100/yr) that kicks in after the initial hosting period
  // ends, not an upfront add-on. Handled separately post-event.
  // Design / branding
  { id: "white-label", name: "White-Label (remove VibeLink badge)", price: 300, priceLabel: "GHS 300", category: "design", includedInPackages: ["bespoke"] },
  { id: "priority-support", name: "Priority WhatsApp Support", price: 200, priceLabel: "GHS 200", category: "features", includedInPackages: ["bespoke"] },
  { id: "ai-photo-restore", name: "AI Photo Restoration", price: 150, priceLabel: "GHS 150", category: "design", includedInPackages: ["bespoke"] },
];

export const colorPalettes: ColorPalette[] = [
  { id: "elegant-gold", name: "Elegant Gold", colors: ["#D4AF37", "#1a1a2e", "#FFFAF0", "#8B7355"], mood: "Luxurious & Sophisticated" },
  { id: "romantic-blush", name: "Romantic Blush", colors: ["#E8B4B8", "#67595E", "#EED6D3", "#A49393"], mood: "Soft & Romantic" },
  { id: "royal-purple", name: "Royal Purple", colors: ["#6B46C1", "#1a1a2e", "#E9D5FF", "#9F7AEA"], mood: "Regal & Majestic" },
  { id: "natural-green", name: "Natural Green", colors: ["#2D5A27", "#F5F5DC", "#90B77D", "#42855B"], mood: "Organic & Fresh" },
  { id: "ocean-blue", name: "Ocean Blue", colors: ["#1E40AF", "#F0F9FF", "#60A5FA", "#1E3A5F"], mood: "Calm & Serene" },
  { id: "sunset-warm", name: "Sunset Warm", colors: ["#DC2626", "#FEF3C7", "#F59E0B", "#7C2D12"], mood: "Warm & Vibrant" },
  { id: "modern-mono", name: "Modern Mono", colors: ["#18181B", "#FFFFFF", "#71717A", "#F4F4F5"], mood: "Clean & Contemporary" },
  { id: "burgundy-classic", name: "Burgundy Classic", colors: ["#800020", "#F5F5DC", "#D4A373", "#3D0C11"], mood: "Timeless & Elegant" },
  { id: "teal-coral", name: "Teal & Coral", colors: ["#0D9488", "#FECACA", "#F97316", "#134E4A"], mood: "Fresh & Playful" },
  { id: "dusty-rose", name: "Dusty Rose", colors: ["#BE8A7C", "#FFF5F5", "#D4A5A5", "#8B5A5A"], mood: "Vintage & Delicate" },
  { id: "forest-gold", name: "Forest & Gold", colors: ["#14532D", "#FBBF24", "#F0FDF4", "#166534"], mood: "Nature & Luxury" },
  { id: "sage-terracotta", name: "Sage & Terracotta", colors: ["#87A96B", "#C67B5C", "#F5F0E8", "#4A5D3A"], mood: "Earthy & Modern" },
  { id: "champagne-cream", name: "Champagne & Cream", colors: ["#F7E7CE", "#FFFDD0", "#D4B896", "#8B7355"], mood: "Subtle & Refined" },
  { id: "sapphire-navy", name: "Sapphire Navy", colors: ["#0F172A", "#C0C0C0", "#E0F2FE", "#1E293B"], mood: "Deep & Formal" },
  { id: "rose-gold-glam", name: "Rose Gold Glam", colors: ["#B76E79", "#F8BBD0", "#FFF5E1", "#8B4A5A"], mood: "Modern & Chic" },
  { id: "custom", name: "Custom Colors", colors: ["#6B46C1", "#D4AF37", "#1a1a2e", "#FFFFFF"], mood: "Choose your own" },
];

export const stylePreferences: StylePreference[] = [
  { id: "minimalist", name: "Minimalist", description: "Clean lines, lots of white space, simple elegance" },
  { id: "luxurious", name: "Luxurious", description: "Gold accents, rich textures, opulent details" },
  { id: "romantic", name: "Romantic", description: "Soft florals, flowing scripts, dreamy vibes" },
  { id: "modern", name: "Modern", description: "Bold typography, geometric shapes, contemporary feel" },
  { id: "traditional", name: "Traditional", description: "Classic layouts, timeless patterns, formal elegance" },
  { id: "playful", name: "Playful", description: "Bright colors, fun elements, energetic design" },
  { id: "rustic", name: "Rustic", description: "Natural textures, earthy tones, organic feel" },
  { id: "cultural", name: "Cultural/Afrocentric", description: "Kente patterns, African motifs, heritage-inspired" },
  { id: "vintage", name: "Vintage", description: "Retro elegance, sepia tones, timeless nostalgia" },
  { id: "bohemian", name: "Bohemian", description: "Free-spirited florals, watercolour, whimsical charm" },
  { id: "art-deco", name: "Art Deco", description: "Geometric patterns, Gatsby-era glamour, symmetry" },
  { id: "executive", name: "Corporate Executive", description: "Polished, businesslike, boardroom-ready" },
];

export interface OrderFormData {
  // Step 1: Event Type
  eventType: string;

  // Step 2: Event Details
  eventTitle: string;
  eventDate: Date | null;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  celebrantNames: string;
  // Whose side is placing this order? Applies to wedding / engagement /
  // naming events where family-side matters for seating and MoMo tracking.
  // Values: "bride" | "groom" | "both" | "family" (for naming) | "".
  hostSide: string;
  additionalInfo: string;

  // Step 3: Style & Colors
  colorPalette: string;
  customColors: string[];
  stylePreference: string;
  referenceImages: File[];
  designNotes: string;

  // Step 4: Package Selection
  selectedPackage: string;

  // Step 5: Add-ons
  selectedAddOns: string[];

  // Step 6: Timeline
  deliveryUrgency: "standard" | "rush";
  preferredDeliveryDate: Date | null;

  // Step 7: Contact
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  hearAboutUs: string;

  // Referral
  referralCode: string;

  // Honeypot — hidden field; non-empty value indicates a bot.
  companyName: string;
}

export const initialFormData: OrderFormData = {
  eventType: "",
  eventTitle: "",
  eventDate: null,
  eventTime: "",
  eventVenue: "",
  eventAddress: "",
  celebrantNames: "",
  hostSide: "",
  additionalInfo: "",
  colorPalette: "",
  customColors: [],
  stylePreference: "",
  referenceImages: [],
  designNotes: "",
  selectedPackage: "",
  selectedAddOns: [],
  deliveryUrgency: "standard",
  preferredDeliveryDate: null,
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  hearAboutUs: "",
  referralCode: "",
  companyName: "",
};
