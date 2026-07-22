// Production /designs page — replaces the old /templates catalogue.
// Browse-all designs by event type. Real client work stays exclusively on
// /portfolio; this page merges the demo samples with the pro templates.
// - 8 tabs: Weddings & Engagements merged, plus 7 others
// - Cards use portfolio demos (existing) + will scale to the future 10-pro-per-service
// - Card CTAs: "Preview Live" (opens the sample invitation) + "Order This Design"
//   → /get-started?template=<slug>
// - No tier/price on cards; a small link under the header points to /pricing
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, Sparkles, Info } from "lucide-react";
import SEO from "@/components/SEO";
import { portfolioItems } from "@/data/portfolioItems";
import { templates as tieredTemplates } from "@/data/templatesData";

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
      {/* Category chip on image */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: item.imagePosition || "center" }}
          loading="lazy"
        />
        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${soft} ${accent} text-[10px] font-bold uppercase tracking-widest border border-white/60 backdrop-blur shadow-sm`}>
          <Sparkles className="w-3 h-3" /> {item.type}
        </div>
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
  const [activeKey, setActiveKey] = useState<string>("All");
  const activeTab = TABS.find((t) => t.key === activeKey) || TABS[0];

  // Designs page merges TWO sources:
  //  1. Demos from portfolioItems.ts (items WITHOUT demoLabel — real clients
  //     with demoLabel stay exclusively on /portfolio)
  //  2. The 15 pro templates from templatesData.ts (funerals for now, more to
  //     come by event type). Their tier/price is intentionally NOT shown here
  //     — pricing lives on /pricing.
  const allDesigns = useMemo<Design[]>(() => {
    // Portfolio-side demos → normalised into Design
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

    // Templates-side pro designs → normalised. `category` uses singular
    // ("Funeral") whereas the tabs use plural ("Funerals"), so map it.
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
    }));

    return [...demos, ...proTemplates];
  }, []);

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

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-10 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A] text-white">
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
                  onClick={() => setActiveKey(t.key)}
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
            <div className="max-w-md mx-auto text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">No designs here yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're adding more designs to this category soon. In the meantime, we can build a custom design just for you.
              </p>
              <Button asChild size="lg" className={`bg-gradient-to-r ${activeTab.tint} text-white border-0`}>
                <Link to="/get-started">
                  Start a Custom Design <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
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
