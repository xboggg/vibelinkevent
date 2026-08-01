// Production /designs page — replaces the old /templates catalogue.
// Browse-all designs by event type. Real client work stays exclusively on
// /portfolio; this page merges the demo samples with the pro templates.
// - 8 tabs: Weddings & Engagements merged, plus 7 others
// - Cards use portfolio demos (existing) + will scale to the future 10-pro-per-service
// - Card CTAs: "Preview Live" (opens the sample invitation) + "Order This Design"
//   → /get-started?template=<slug>
// - No tier/price on cards; a small link under the header points to /pricing
import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, Sparkles, Info, Inbox, Eye, EyeOff } from "lucide-react";
import SEO from "@/components/SEO";
import { portfolioItems } from "@/data/portfolioItems";
import { templates as tieredTemplates } from "@/data/templatesData";

// Admin-preview mode: /designs?admin=1 makes the 15 in-progress template
// designs visible so Edmund can screenshot, preview, or send demo links to
// specific clients privately. Public visitors never see them (thumbnails
// don't exist yet). Persisted in sessionStorage so the flag survives
// tab-switches within a session without needing the URL param each time.
const ADMIN_KEY = "vl_designs_admin";

// URL-slug → Designs tab key. Kept in lockstep with slugToCategoryMap in
// portfolioItems.ts so /portfolio?type=X and /designs?type=X mean the same
// category on both pages. Weddings & Engagements share the merged tab here.
const SLUG_TO_TAB_KEY: Record<string, string> = {
  wedding: "WeddingsEngagements",
  engagement: "WeddingsEngagements",
  funeral: "Funerals",
  naming: "Naming",
  anniversary: "Anniversaries",
  graduation: "Graduations",
  birthday: "Birthdays",
  church: "Church",
  corporate: "Corporate",
};
const TAB_KEY_TO_SLUG: Record<string, string> = {
  WeddingsEngagements: "wedding",
  Funerals: "funeral",
  Naming: "naming",
  Anniversaries: "anniversary",
  Graduations: "graduation",
  Birthdays: "birthday",
  Church: "church",
  Corporate: "corporate",
};

// Unified design item used on this page — normalises across the two sources.
interface Design {
  id: string;
  title: string;
  type: string;                 // one of the tab.types values (Weddings, Funerals, ...)
  description: string;
  image: string;
  imagePosition?: string;
  demoUrl?: string;
  slug: string;
  features: string[];
  isTemplate?: boolean;         // true for pro templates (admin-only visibility)
  hasThumbnail?: boolean;       // false = show palette-gradient placeholder card instead
  palette?: string[];           // hex stops for placeholder gradient (templates only)
}

// ── Tabs ────────────────────────────────────────────────────────────
// 8 tabs — Weddings & Engagements merged. Order roughly mirrors the homepage.
type Tab = { key: string; label: string; types: string[]; tint: string; soft: string; accent: string };
const TABS: Tab[] = [
  { key: "All",             label: "All Designs",             types: [],                             tint: "from-purple-600 to-indigo-700", soft: "bg-purple-50", accent: "text-purple-700" },
  { key: "WeddingsEngagements", label: "Weddings & Engagements", types: ["Weddings", "Engagements"], tint: "from-rose-500 to-pink-600",     soft: "bg-rose-50",   accent: "text-rose-700"   },
  { key: "Funerals",        label: "Funerals & Memorials",   types: ["Funerals"],                    tint: "from-slate-600 to-slate-800",   soft: "bg-slate-50",  accent: "text-slate-700"  },
  { key: "Naming",          label: "Naming & Outdooring",    types: ["Naming"],                      tint: "from-sky-500 to-cyan-600",      soft: "bg-sky-50",    accent: "text-sky-700"    },
  { key: "Anniversaries",   label: "Anniversaries",          types: ["Anniversaries"],               tint: "from-amber-500 to-yellow-600",  soft: "bg-amber-50",  accent: "text-amber-800"  },
  { key: "Graduations",     label: "Graduations",            types: ["Graduations"],                 tint: "from-blue-700 to-indigo-800",   soft: "bg-blue-50",   accent: "text-blue-800"   },
  { key: "Birthdays",       label: "Birthdays",              types: ["Birthdays"],                   tint: "from-fuchsia-500 to-pink-600",  soft: "bg-fuchsia-50",accent: "text-fuchsia-700"},
  { key: "Church",          label: "Church Events",          types: ["Church"],                      tint: "from-purple-600 to-indigo-700", soft: "bg-purple-50", accent: "text-purple-800" },
  { key: "Corporate",       label: "Corporate Events",       types: ["Corporate"],                   tint: "from-blue-700 to-slate-800",    soft: "bg-blue-50",   accent: "text-blue-800"   },
];

// ── Design card ─────────────────────────────────────────────────────
function DesignCard({ item, tint, soft, accent }: { item: Design; tint: string; soft: string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl bg-white border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all overflow-hidden flex flex-col"
    >
      {/* Image (or palette placeholder for admin-only templates without a
          real thumbnail yet). The placeholder uses the template's palette
          hex stops so it feels intentional, not broken. */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {item.isTemplate && !item.hasThumbnail && item.palette?.length ? (
          <div
            className="w-full h-full flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${item.palette.slice(0, 4).join(", ")})`,
            }}
          >
            <div className="text-center px-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm mb-2">
                <EyeOff className="w-3 h-3" /> Thumbnail pending
              </div>
              <div className="text-white font-serif italic text-lg drop-shadow-sm">
                {item.title}
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: item.imagePosition || "center" }}
            loading="lazy"
          />
        )}
        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${soft} ${accent} text-[10px] font-bold uppercase tracking-widest border border-white/60 backdrop-blur shadow-sm`}>
          <Sparkles className="w-3 h-3" /> {item.type}
        </div>
        {/* Admin-preview badge — makes it visually obvious which cards are
            template-catalogue vs shipped-portfolio, so screenshots and demo
            shares don't get mixed up. */}
        {item.isTemplate && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/95 text-white text-[9px] font-bold uppercase tracking-widest shadow-md">
            <Eye className="w-2.5 h-2.5" /> Admin preview
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-foreground mb-1.5 leading-tight">{item.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{item.description}</p>

        {/* Feature tags */}
        {item.features?.length ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.features.slice(0, 3).map((f) => (
              <span key={f} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${soft} ${accent}`}>
                {f}
              </span>
            ))}
            {item.features.length > 3 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                +{item.features.length - 3} more
              </span>
            )}
          </div>
        ) : null}

        {/* CTAs — Preview Live + Order This Design */}
        <div className="mt-auto flex gap-2 pt-2">
          {item.demoUrl && (
            <Button asChild size="sm" variant="outline" className="flex-1">
              <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview Live
              </a>
            </Button>
          )}
          <Button
            asChild
            size="sm"
            className={`flex-1 bg-gradient-to-r ${tint} text-white hover:opacity-90 border-0`}
          >
            <Link to={`/get-started?template=${item.slug}`}>
              Order <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────────────────
export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialKey = typeParam ? SLUG_TO_TAB_KEY[typeParam] || "All" : "All";
  const [activeKey, setActiveKey] = useState<string>(initialKey);
  const activeTab = TABS.find((t) => t.key === activeKey) || TABS[0];

  // Admin-preview mode. Enabled by ?admin=1 (persisted in sessionStorage).
  // Disabled by ?admin=0. Public visitors never trigger either.
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ADMIN_KEY) === "1";
  });
  useEffect(() => {
    const flag = searchParams.get("admin");
    if (flag === "1") {
      sessionStorage.setItem(ADMIN_KEY, "1");
      setIsAdmin(true);
    } else if (flag === "0") {
      sessionStorage.removeItem(ADMIN_KEY);
      setIsAdmin(false);
    }
  }, [searchParams]);

  // Keep tab state in sync if the URL param changes (browser back/forward,
  // or a category-matched deep link from the Portfolio empty-state).
  useEffect(() => {
    if (typeParam) {
      const mapped = SLUG_TO_TAB_KEY[typeParam];
      if (mapped) setActiveKey(mapped);
    } else {
      setActiveKey("All");
    }
  }, [typeParam]);

  // Clicking a tab updates the URL so it can be shared / deep-linked.
  const handleTabClick = (key: string) => {
    setActiveKey(key);
    if (key === "All") {
      setSearchParams({});
    } else {
      const slug = TAB_KEY_TO_SLUG[key];
      if (slug) setSearchParams({ type: slug });
      else setSearchParams({});
    }
  };

  // Designs page merges TWO sources:
  //  1. Demos from portfolioItems.ts (items WITHOUT demoLabel — real clients
  //     with demoLabel stay exclusively on /portfolio). ALWAYS visible.
  //  2. The 15 pro templates from templatesData.ts. ADMIN-ONLY for now —
  //     their thumbnails haven't been produced yet. When you generate them
  //     and drop into public/templates-img/, flip `hasThumbnail: true` per
  //     template so they become publicly visible.
  const allDesigns = useMemo<Design[]>(() => {
    // Portfolio-side demos → normalised into Design (always public)
    const demos: Design[] = portfolioItems
      .filter((it) => !it.demoLabel)
      .map((it) => ({
        id: `portfolio-${it.id}`,
        title: it.title,
        type: it.type,
        description: it.description,
        image: it.image,
        imagePosition: it.imagePosition,
        demoUrl: it.demoUrl || undefined,
        slug: it.slug,
        features: it.features || [],
      }));

    // Public visitors only see portfolio demos — early return skips templates.
    if (!isAdmin) return demos;

    // Admin gets the 15 pro templates too. `category` uses singular ("Funeral")
    // whereas the tabs use plural ("Funerals"), so map it.
    const categoryToType: Record<string, string> = {
      Funeral: "Funerals",
      Wedding: "Weddings",
      Naming: "Naming",
      Anniversary: "Anniversaries",
      Birthday: "Birthdays",
      Graduation: "Graduations",
      Church: "Church",
      Corporate: "Corporate",
    };
    const proTemplates: Design[] = tieredTemplates.map((t) => ({
      id: `template-${t.id}`,
      title: t.name,
      type: categoryToType[t.category] || t.category,
      description: t.tagline,
      image: t.thumbnail,
      demoUrl: t.comingSoon ? undefined : t.previewUrl,
      slug: t.slug,
      features: t.features || [],
      isTemplate: true,
      hasThumbnail: false, // flip to true per-template once real thumbnail exists
      palette: t.palette,
    }));

    return [...demos, ...proTemplates];
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (activeTab.types.length === 0) return allDesigns;
    return allDesigns.filter((d) => activeTab.types.includes(d.type));
  }, [activeTab.types, allDesigns]);

  return (
    <Layout>
      <SEO
        title="Designs — Browse Invitation Designs Ghana | VibeLink Event"
        description="Browse VibeLink Event invitation designs by event type — weddings, funerals, naming ceremonies, birthdays, corporate and more. Preview any design live, then order it — priced separately at /pricing."
        keywords="invitation designs Ghana, digital invitation templates, wedding invitation designs, funeral memorial designs, VibeLink designs catalogue"
        canonical="/designs"
      />

      {/* Admin-mode indicator bar — only visible when ?admin=1 flag active.
          Persists across the session; one-click 'exit preview' to see what
          public visitors see. */}
      {isAdmin && (
        <div className="bg-amber-500 text-white pt-24 lg:pt-28 pb-2">
          <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-3 text-xs md:text-sm">
            <div className="inline-flex items-center gap-2 font-semibold">
              <Eye className="w-4 h-4" /> Admin preview mode — you can see all
              {" "}{tieredTemplates.length} pro templates (public visitors don't)
            </div>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(ADMIN_KEY);
                setIsAdmin(false);
                const next = new URLSearchParams(searchParams);
                next.set("admin", "0");
                setSearchParams(next);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 hover:bg-white/40 font-semibold transition-colors"
            >
              <EyeOff className="w-3 h-3" /> Exit preview
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`${isAdmin ? "pt-4" : "pt-24 lg:pt-32"} pb-10 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A] text-white`}>
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" /> Browse All Designs
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">
            Pick a Design.<br />
            <span className="text-secondary">We Build It For You.</span>
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed mb-6">
            Every design here is a working sample. Tap "Preview Live" to explore it in a real invitation. Tap "Order" to make it yours.
          </p>
          <p className="text-sm text-white/70">
            <Info className="w-3.5 h-3.5 inline-block mr-1" />
            Pricing is separate —{" "}
            <Link to="/pricing" className="underline underline-offset-2 hover:text-white font-semibold">
              see all packages
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 md:-mx-8 md:px-8 md:justify-center">
            {TABS.map((t) => {
              const active = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabClick(t.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    active
                      ? `bg-gradient-to-r ${t.tint} text-white shadow-md`
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 md:py-14 bg-slate-50/40 min-h-[600px]">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Count line */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
              {activeKey === "All" ? "designs across all events" : `${activeTab.label.toLowerCase()} designs`}
            </p>
          </div>

          {filtered.length === 0 ? (
            // Empty-state mirrors the Portfolio one so the two pages read as
            // a matched pair. Falls back to "View all designs" that clears
            // the filter, plus the primary Get Started CTA. Fires by count,
            // not by category, so any future empty tab handles itself.
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl mx-auto text-center py-8 md:py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
                <Inbox className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                We&rsquo;re adding {activeTab.label} soon
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-8">
                No designs for this category yet — but we build custom ones from scratch.
                Browse everything on offer, or tell us your vibe and we&rsquo;ll craft it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleTabClick("All")}
                  className="w-full sm:w-auto"
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  View all designs
                </Button>
                <Button
                  asChild
                  size="lg"
                  className={`bg-gradient-to-r ${activeTab.tint} text-white border-0 w-full sm:w-auto`}
                >
                  <Link to="/get-started">
                    Start Your Invitation <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
              >
                {filtered.map((item) => (
                  <DesignCard
                    key={item.id}
                    item={item}
                    tint={activeTab.tint}
                    soft={activeTab.soft}
                    accent={activeTab.accent}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-white border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Don't see the vibe you want?</h2>
          <p className="text-muted-foreground mb-6">
            We design custom invitations from scratch. Tell us your event, colours, and story — we'll build something unique.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
              <Link to="/get-started">
                Start a Custom Design <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
