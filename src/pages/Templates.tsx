import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { templates, formatGHS, type Tier } from "@/data/templatesData";

const tierStyles: Record<Tier, { chip: string; ring: string; label: string }> = {
  Starter:  { chip: "bg-emerald-100 text-emerald-700 border-emerald-200",  ring: "ring-emerald-300/40",  label: "Starter Vibe"  },
  Classic:  { chip: "bg-sky-100 text-sky-700 border-sky-200",              ring: "ring-sky-300/40",      label: "Classic Vibe"  },
  Prestige: { chip: "bg-amber-100 text-amber-700 border-amber-200",        ring: "ring-amber-400/40",    label: "Prestige Vibe" },
  Royal:    { chip: "bg-purple-100 text-purple-700 border-purple-200",     ring: "ring-purple-400/40",   label: "Royal Vibe"    },
};

const tierFilters: Array<"All" | Tier> = ["All", "Starter", "Classic", "Prestige", "Royal"];

const Templates = () => {
  const [activeTier, setActiveTier] = useState<"All" | Tier>("All");

  const filtered = activeTier === "All" ? templates : templates.filter((t) => t.tier === activeTier);

  return (
    <Layout>
      <SEO
        title="Templates — Pick · Customise · Pay | VibeLink Event"
        description="Browse 15 funeral memorial templates. Pick one, choose addons, see your total. Designed by VibeLink Event."
        canonical="https://vibelinkevent.com/templates"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>15 funeral templates, more categories coming soon</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Pick a template.<br />
              <span className="text-secondary">We build it for you.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
              Preview any template live. Add the features you want. See your price update in real time.
              Pay via MoMo, and we&apos;ll launch your memorial page within 48 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TIER FILTER ──────────────────────────────────────────── */}
      <section className="pt-10 pb-2 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            {tierFilters.map((t) => {
              const active = activeTier === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTier(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    active
                      ? "bg-[#6B46C1] text-white border-[#6B46C1] shadow-md"
                      : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                  }`}
                >
                  {t === "All" ? "All Tiers" : `${t} · ${formatGHS(
                    t === "Starter" ? 1000 : t === "Classic" ? 1500 : t === "Prestige" ? 2500 : 4000
                  )}${t === "Royal" ? "+" : ""}`}
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Showing <strong className="text-gray-700">{filtered.length}</strong> of {templates.length} funeral templates
          </p>
        </div>
      </section>

      {/* ── TEMPLATE GRID ────────────────────────────────────────── */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {filtered.map((tpl, i) => {
              const t = tierStyles[tpl.tier];
              return (
                <motion.article
                  key={tpl.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden ring-1 ring-transparent hover:${t.ring}`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative h-48 lg:h-52 bg-cover bg-center bg-gray-100"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%), url(${tpl.thumbnail}), linear-gradient(135deg, ${tpl.palette[1]}, ${tpl.palette[3] || tpl.palette[0]})`,
                    }}
                  >
                    {/* Tier chip */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${t.chip}`}
                    >
                      {t.label}
                    </span>
                    {/* Price chip OR Coming Soon */}
                    {tpl.comingSoon ? (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900 shadow-sm">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-900 shadow-sm">
                        from {formatGHS(tpl.basePrice)}
                      </span>
                    )}
                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
                      <h3 className="text-xl font-bold leading-tight">{tpl.name}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 min-h-[2.6rem]">
                      {tpl.tagline}
                    </p>

                    {/* Palette swatch */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {tpl.palette.slice(0, 4).map((c, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ background: c }}
                          title={c}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">palette</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-5">
                      {tpl.comingSoon ? (
                        <div className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg cursor-not-allowed">
                          Notify me when ready
                        </div>
                      ) : (
                        <>
                          <a
                            href={tpl.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Preview
                          </a>
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 bg-[#6B46C1] hover:bg-[#553C9A]"
                          >
                            <Link to={`/templates/${tpl.slug}`}>
                              Start <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              No templates in this tier yet. Try another filter.
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS strip ───────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-600">Four simple steps from pick to live page.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { n: "1", t: "Pick a template", d: "Preview live, find the one that fits the life being honoured." },
              { n: "2", t: "Add features", d: "Voice tributes, candle altar, video, custom domain — your call." },
              { n: "3", t: "Pay via MoMo", d: "Send to our MoMo number. Order ID provided for reference." },
              { n: "4", t: "Live in 48 hours", d: "We swap in your names, photos, dates. You approve. We launch." },
            ].map((s) => (
              <div key={s.n} className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-[#6B46C1] text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.t}</h3>
                <p className="text-sm text-gray-600 leading-snug">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Templates;
