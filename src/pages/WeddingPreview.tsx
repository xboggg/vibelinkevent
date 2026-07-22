// Preview page for the /wedding-invitations redesign.
// Shows 8 layout options for the "special features" section stacked, so
// Edmund can pick the winner before we touch the real page.
// Live at /wedding-preview.
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Video,
  Users,
  UserPlus,
  Award,
  PartyPopper,
  Flower2,
  Camera,
  Bell,
  Frame,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  Check,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

// ── The 10 special wedding features ──────────────────────────────────
type Feature = {
  n: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  short: string;
  description: string;
  tint: string;
  soft: string;
  accent: string;
  emoji: string;
};

const features: Feature[] = [
  {
    n: 1, icon: Heart,
    title: "Dual-Ceremony Support",
    short: "Traditional + white wedding, one link.",
    description: "Give guests separate pages for your traditional and white wedding — with their own colours, order of service, and dress codes — while keeping everything in a single, shareable invitation.",
    tint: "from-rose-400 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "💒",
  },
  {
    n: 28, icon: Video,
    title: "Video Guestbook",
    short: "15-second video wishes stacked on a memory reel.",
    description: "Guests record short video wishes right from the invitation. Every clip stacks into a beautiful memory reel you keep forever — even the auntie in London gets to be part of the day.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎥",
  },
  {
    n: 21, icon: PartyPopper,
    title: "Bachelor / Bachelorette Page",
    short: "A separate hidden link for close friends.",
    description: "A private, unlisted page for the pre-wedding party — details, dress code, secret plans — shared only with the inner circle. Never accidentally sent to your future mother-in-law.",
    tint: "from-amber-400 to-orange-600", soft: "bg-amber-50", accent: "text-amber-700", emoji: "🎉",
  },
  {
    n: 22, icon: Flower2,
    title: "Bridal Shower Page",
    short: "A ladies-only invite, separate from the main event.",
    description: "A dedicated shower page — softer palette, own RSVP, own gift registry — that lives inside your main invitation but stays visible only to the ladies you invite.",
    tint: "from-pink-400 to-rose-500", soft: "bg-pink-50", accent: "text-pink-700", emoji: "💐",
  },
  {
    n: 3, icon: Users,
    title: "Meet the Wedding Party",
    short: "Bridesmaids, groomsmen, ring bearers, flower girls.",
    description: "Beautiful cards for every member of the wedding party — with photos, roles, and a short note from the couple about why each person is standing with you on your day.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "👰",
  },
  {
    n: 19, icon: UserPlus,
    title: "Family Tree",
    short: "Both families, with photos and roles.",
    description: "A shared family tree section showing parents, siblings, and grandparents of both families — with photos and titles — so every guest knows exactly who's who.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "👨‍👩‍👧",
  },
  {
    n: 20, icon: Award,
    title: "Officiating Minister Bio",
    short: "Priest, pastor, imam, or family spokesperson.",
    description: "A dedicated card for whoever is leading the ceremony — with their photo, a short bio, and a personal message from the couple explaining why they matter.",
    tint: "from-blue-500 to-cyan-600", soft: "bg-blue-50", accent: "text-blue-700", emoji: "🎓",
  },
  {
    n: 23, icon: Camera,
    title: "Engagement Photos Gallery",
    short: "Your pre-wedding shoot, front and centre.",
    description: "A cinematic gallery of your engagement shoot — full-screen, tap-to-zoom, background music optional — so guests get to know your story before they show up.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📸",
  },
  {
    n: 24, icon: Bell,
    title: "Save-the-Date Teaser",
    short: "An early tease before the full invite launches.",
    description: "Send a beautiful teaser weeks or months ahead — just the date, a photo, and a countdown. Guests block their calendars early; the full invitation drops closer to the day.",
    tint: "from-yellow-400 to-amber-500", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "📅",
  },
  {
    n: 26, icon: Frame,
    title: "Photo Booth Frame",
    short: "Custom frames for guest selfies.",
    description: "A shareable, custom-designed photo frame guests overlay on their selfies at the event — turning every guest's phone into a walking piece of your wedding branding.",
    tint: "from-fuchsia-400 to-purple-500", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🖼️",
  },
];

// Section header helper
function OptionLabel({ letter, name, tagline }: { letter: string; name: string; tagline: string }) {
  return (
    <div className="bg-slate-900 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3">
          <span className="inline-flex w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 items-center justify-center font-black text-lg shadow-lg">{letter}</span>
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Option {letter}</p>
            <p className="text-lg md:text-xl font-bold">{name}</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-2 max-w-2xl mx-auto">{tagline}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// A — Interactive Tabs
// ══════════════════════════════════════════════════════════════════════
function OptionATabs() {
  const [idx, setIdx] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const cur = features[idx];
  const CurIcon = cur.icon;

  useEffect(() => {
    if (interacted) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % features.length), 5000);
    return () => clearInterval(id);
  }, [interacted]);

  return (
    <section className="py-16 bg-gradient-to-b from-rose-50/30 via-white to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-5xl mx-auto">
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <button key={f.n} onClick={() => { setInteracted(true); setIdx(i); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i === idx ? `bg-gradient-to-r ${f.tint} text-white shadow-md` : "bg-white border border-border text-muted-foreground hover:border-rose-300"
                }`}>
                <FIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{f.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-border p-6 md:p-10 shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }} className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${cur.soft} ${cur.accent} text-xs font-bold uppercase tracking-widest mb-4`}>
                  <CurIcon className="w-3.5 h-3.5" /> Feature · #{cur.n}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{cur.title}</h3>
                <p className="text-rose-700 font-semibold italic mb-4">{cur.short}</p>
                <p className="text-muted-foreground leading-relaxed">{cur.description}</p>
              </div>
              <div className="flex items-center justify-center">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${cur.tint} shadow-2xl flex flex-col items-center justify-center text-white`}>
                  <div className="text-7xl mb-2 drop-shadow-lg">{cur.emoji}</div>
                  <div className="text-sm font-black uppercase tracking-widest px-4 text-center">{cur.title}</div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex gap-1">
            {features.map((_, i) => (
              <button key={i} onClick={() => { setInteracted(true); setIdx(i); }}
                className={`h-1 flex-1 rounded-full transition-all ${i === idx ? `bg-gradient-to-r ${cur.tint}` : "bg-border"}`}
                aria-label={`Feature ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// B — Hybrid: 3 hero + 7 grid
// ══════════════════════════════════════════════════════════════════════
function OptionBHybrid() {
  const stars = features.slice(0, 3);
  const rest = features.slice(3);
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="space-y-16 mb-16">
          {stars.map((f, i) => {
            const FIcon = f.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div key={f.n} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
                <div className={`${isEven ? "lg:order-1" : "lg:order-2"} space-y-4`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${f.soft} ${f.accent} text-xs font-bold uppercase tracking-widest`}>
                    <FIcon className="w-3.5 h-3.5" /> Feature · #{f.n}
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold">{f.title}</h3>
                  <p className="text-rose-700 font-semibold italic text-lg">{f.short}</p>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{f.description}</p>
                </div>
                <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}
                    className={`relative w-full aspect-[5/4] rounded-3xl bg-gradient-to-br ${f.tint} shadow-2xl flex flex-col items-center justify-center text-white overflow-hidden`}>
                    <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
                    <div className="text-8xl mb-3 drop-shadow-lg relative z-10">{f.emoji}</div>
                    <div className="text-sm font-black uppercase tracking-widest relative z-10 px-4 text-center">{f.title}</div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold">Seven more wedding-specific extras</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((f, i) => {
              const FIcon = f.icon;
              return (
                <motion.div key={f.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.06, duration: 0.4 }} whileHover={{ y: -6 }}
                  className="relative p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center shadow-md mb-4`}>
                    <FIcon className="h-6 w-6 text-white" strokeWidth={2.25} />
                  </div>
                  <div className={`inline-block text-[10px] font-bold uppercase tracking-widest ${f.accent} mb-1`}>Feature · #{f.n}</div>
                  <h4 className="text-lg font-bold mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.short}</p>
                  <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${f.tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// C — Big Carousel + Thumbnail Row
// ══════════════════════════════════════════════════════════════════════
function OptionCCarousel() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + features.length) % features.length);
  const next = () => setIdx((p) => (p + 1) % features.length);
  const cur = features[idx];
  const CurIcon = cur.icon;

  return (
    <section className="py-16 bg-gradient-to-b from-white via-rose-50/20 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto relative">
          <button onClick={prev} aria-label="Previous"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="Next"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className={`rounded-3xl bg-gradient-to-br ${cur.tint} p-8 md:p-12 shadow-2xl overflow-hidden text-white relative min-h-[380px]`}>
            <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-widest mb-4">
                  <CurIcon className="w-3.5 h-3.5" /> Feature · #{cur.n}
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-3">{cur.title}</h3>
                <p className="text-white/90 font-semibold italic text-lg mb-4">{cur.short}</p>
                <p className="text-white/80 leading-relaxed">{cur.description}</p>
              </div>
              <div className="flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="text-[8rem] md:text-[12rem] drop-shadow-2xl">
                  {cur.emoji}
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <button key={f.n} onClick={() => setIdx(i)}
                  className={`p-3 rounded-xl border-2 transition-all ${i === idx ? "border-rose-500 bg-rose-50 scale-105" : "border-transparent bg-white hover:bg-rose-50/50"}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.tint} flex items-center justify-center mx-auto mb-1`}>
                    <FIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[9px] font-bold text-foreground uppercase tracking-wide truncate">#{f.n}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// D — Vertical Timeline
// ══════════════════════════════════════════════════════════════════════
function OptionDTimeline() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 via-purple-300 to-pink-300 md:-translate-x-1/2" />
          <div className="space-y-8">
            {features.map((f, i) => {
              const FIcon = f.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div key={f.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
                  className={`relative md:grid md:grid-cols-2 md:gap-12 ${isEven ? "" : ""}`}>
                  {/* Number bubble */}
                  <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 top-4 w-8 h-8 rounded-full bg-gradient-to-br ${f.tint} text-white font-black text-xs flex items-center justify-center shadow-lg ring-4 ring-white z-10`}>
                    {i + 1}
                  </div>
                  {/* Content — alternating side on desktop */}
                  <div className={`pl-16 md:pl-0 ${isEven ? "md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"}`}>
                    <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full ${f.soft} ${f.accent} text-[10px] font-bold uppercase tracking-widest mb-2`}>
                      <FIcon className="w-3 h-3" /> #{f.n}
                    </div>
                    <h4 className="text-xl font-bold mb-1">{f.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// E — Bento Magazine Grid
// ══════════════════════════════════════════════════════════════════════
function OptionEBento() {
  // hand-tuned bento layout for 10 items
  const layout = [
    { f: features[0], span: "md:col-span-2 md:row-span-2", size: "big" },     // huge
    { f: features[1], span: "md:col-span-2", size: "med" },                    // wide
    { f: features[2], span: "", size: "sm" },
    { f: features[3], span: "", size: "sm" },
    { f: features[4], span: "md:col-span-2", size: "med" },                    // wide
    { f: features[5], span: "", size: "sm" },
    { f: features[6], span: "", size: "sm" },
    { f: features[7], span: "md:row-span-2", size: "tall" },                   // tall
    { f: features[8], span: "", size: "sm" },
    { f: features[9], span: "", size: "sm" },
  ];
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[180px]">
          {layout.map((item, i) => {
            const { f, span, size } = item;
            const FIcon = f.icon;
            return (
              <motion.div key={f.n} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.05, duration: 0.4 }} whileHover={{ scale: 1.02, y: -4 }}
                className={`${span} relative rounded-2xl bg-gradient-to-br ${f.tint} p-4 md:p-5 text-white shadow-lg hover:shadow-2xl transition-shadow overflow-hidden flex flex-col justify-between cursor-pointer`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <FIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">#{f.n}</span>
                </div>
                <div>
                  {size === "big" && <div className="text-6xl mb-2">{f.emoji}</div>}
                  <h4 className={`font-black ${size === "big" ? "text-xl md:text-2xl" : size === "med" ? "text-base md:text-lg" : "text-sm"} leading-tight mb-1`}>
                    {f.title}
                  </h4>
                  {(size === "big" || size === "med" || size === "tall") && (
                    <p className={`opacity-90 leading-snug ${size === "big" ? "text-sm" : "text-xs"}`}>{f.short}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// F — Interactive Phone Preview
// ══════════════════════════════════════════════════════════════════════
function OptionFPhone() {
  const [idx, setIdx] = useState(0);
  const cur = features[idx];
  const CurIcon = cur.icon;
  return (
    <section className="py-16 bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Left column — first 5 */}
          <div className="space-y-2 order-2 lg:order-1">
            {features.slice(0, 5).map((f, i) => {
              const FIcon = f.icon;
              const active = i === idx;
              return (
                <button key={f.n} onClick={() => setIdx(i)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${active ? `bg-gradient-to-r ${f.tint} text-white shadow-lg` : "bg-white border border-border hover:border-rose-300"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-white/20 backdrop-blur" : `bg-gradient-to-br ${f.tint}`}`}>
                    <FIcon className={`w-4 h-4 ${active ? "text-white" : "text-white"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[9px] font-bold uppercase tracking-widest ${active ? "text-white/80" : "text-muted-foreground"}`}>#{f.n}</div>
                    <div className="text-sm font-bold truncate">{f.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Phone */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-[260px] h-[540px] rounded-[3rem] bg-slate-900 p-3 shadow-2xl">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2.3rem] overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div key={idx} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-br ${cur.tint} flex flex-col items-center justify-center text-white p-6 text-center`}>
                    <div className="mb-4"><CurIcon className="w-8 h-8 text-white/80 mx-auto" /></div>
                    <div className="text-8xl mb-4 drop-shadow-2xl">{cur.emoji}</div>
                    <div className="text-xs uppercase tracking-widest opacity-80 mb-2">Feature #{cur.n}</div>
                    <h4 className="text-lg font-black mb-2 leading-tight">{cur.title}</h4>
                    <p className="text-xs opacity-90 leading-snug">{cur.short}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          {/* Right column — last 5 */}
          <div className="space-y-2 order-3">
            {features.slice(5).map((f, i) => {
              const FIcon = f.icon;
              const realIdx = i + 5;
              const active = realIdx === idx;
              return (
                <button key={f.n} onClick={() => setIdx(realIdx)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${active ? `bg-gradient-to-r ${f.tint} text-white shadow-lg` : "bg-white border border-border hover:border-rose-300"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-white/20 backdrop-blur" : `bg-gradient-to-br ${f.tint}`}`}>
                    <FIcon className={`w-4 h-4 text-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[9px] font-bold uppercase tracking-widest ${active ? "text-white/80" : "text-muted-foreground"}`}>#{f.n}</div>
                    <div className="text-sm font-bold truncate">{f.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// G — Horizontal Snap-Scroll Deck
// ══════════════════════════════════════════════════════════════════════
function OptionGSnapScroll() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scroll = (dir: 1 | -1) => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex justify-end gap-2 mb-4">
            <button onClick={() => scroll(-1)} aria-label="Prev" className="w-9 h-9 rounded-full bg-white border border-border shadow-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Next" className="w-9 h-9 rounded-full bg-white border border-border shadow-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div ref={scrollerRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4" style={{ scrollbarWidth: "thin" }}>
            {features.map((f) => {
              const FIcon = f.icon;
              return (
                <div key={f.n} className={`snap-start shrink-0 w-[85%] md:w-[45%] lg:w-[32%] rounded-3xl bg-gradient-to-br ${f.tint} p-6 md:p-8 text-white shadow-xl min-h-[420px] flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                      <FIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">#{f.n}</span>
                  </div>
                  <div className="text-7xl my-6 drop-shadow-lg text-center">{f.emoji}</div>
                  <div>
                    <h4 className="text-xl font-black mb-2">{f.title}</h4>
                    <p className="text-white/90 text-sm italic mb-3">{f.short}</p>
                    <p className="text-white/80 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// H — Accordion Reveal
// ══════════════════════════════════════════════════════════════════════
function OptionHAccordion() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-2">
          {features.map((f, i) => {
            const FIcon = f.icon;
            const isOpen = i === open;
            return (
              <div key={f.n} className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
                <button onClick={() => setOpen(isOpen ? -1 : i)}
                  className={`w-full flex items-center gap-4 p-4 md:p-5 text-left transition-colors ${isOpen ? f.soft : "hover:bg-slate-50"}`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center shrink-0 shadow-md`}>
                    <FIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${f.accent} mb-0.5`}>Feature · #{f.n}</div>
                    <div className="text-base md:text-lg font-bold text-foreground">{f.title}</div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className={`grid md:grid-cols-2 gap-6 p-5 md:p-8 items-center ${f.soft}`}>
                        <div>
                          <p className="text-rose-700 font-semibold italic mb-3">{f.short}</p>
                          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{f.description}</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className={`w-full max-w-xs aspect-[4/3] rounded-2xl bg-gradient-to-br ${f.tint} shadow-xl flex flex-col items-center justify-center text-white`}>
                            <div className="text-7xl mb-2 drop-shadow-lg">{f.emoji}</div>
                            <div className="text-xs font-black uppercase tracking-widest px-4 text-center">{f.title}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Common features grid — same for every option
// ══════════════════════════════════════════════════════════════════════
const commonFeatures = [
  { icon: Play, title: "One Shareable Link", desc: "WhatsApp-ready, works on every phone, no app needed.", tint: "from-blue-400 to-cyan-500" },
  { icon: Users, title: "RSVP Tracking", desc: "Attendance count, meal preferences, guest analytics.", tint: "from-purple-500 to-indigo-600" },
  { icon: Camera, title: "Photo Gallery + Music", desc: "Pre-event photos, ambient background music, cinematic vibes.", tint: "from-pink-500 to-rose-600" },
  { icon: Bell, title: "Live Countdown", desc: "Build excitement day-by-day right up to the moment.", tint: "from-orange-500 to-amber-500" },
  { icon: Award, title: "Google Maps + Ride", desc: "One-tap navigation to the venue, Uber/Bolt/Yango built in.", tint: "from-emerald-500 to-teal-600" },
  { icon: Sparkles, title: "WhatsApp Share + Calendar", desc: "One-tap share, add-to-calendar for every guest.", tint: "from-yellow-500 to-orange-500" },
];

function CommonFeaturesGrid() {
  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Check className="h-3.5 w-3.5" /> Also included
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">The Essentials, Built In</h2>
          <p className="text-muted-foreground">Six features every VibeLink invitation ships with — no matter the event.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {commonFeatures.map((f, i) => {
            const FIcon = f.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.06, duration: 0.4 }} whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center shadow-md mb-4`}>
                  <FIcon className="h-6 w-6 text-white" strokeWidth={2.25} />
                </div>
                <h4 className="text-lg font-bold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function WeddingPreview() {
  return (
    <Layout>
      {/* Intro hero */}
      <section className="py-14 bg-gradient-to-br from-rose-100 via-pink-50 to-white text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-rose-700 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Wedding Page Preview
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">Pick a layout for /wedding-invitations</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Eight options below for the "special features" section. Scroll through them, then tell me the letter (A–H) you want.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto">
            {[
              ["A", "Tabs"], ["B", "Hero+Grid"], ["C", "Carousel"], ["D", "Timeline"],
              ["E", "Bento"], ["F", "Phone"], ["G", "Snap-Scroll"], ["H", "Accordion"],
            ].map(([l, n]) => (
              <a key={l} href={`#opt-${l}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold hover:border-rose-400 hover:text-rose-700 transition-colors">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white text-[10px] font-black flex items-center justify-center">{l}</span>
                {n}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div id="opt-A"><OptionLabel letter="A" name="Interactive Tabs" tagline="Chips across the top, one big showcase card that swaps. Auto-cycles until you interact." /></div>
      <OptionATabs />

      <div id="opt-B"><OptionLabel letter="B" name="Hybrid — 3 Hero Rows + 7 Grid" tagline="Top 3 features get the alternating hero treatment; the remaining 7 sit in a tighter grid below." /></div>
      <OptionBHybrid />

      <div id="opt-C"><OptionLabel letter="C" name="Big Carousel + Thumbnails" tagline="One huge coloured card with arrows; 10 thumbnails below act as a mini-nav." /></div>
      <OptionCCarousel />

      <div id="opt-D"><OptionLabel letter="D" name="Vertical Timeline" tagline="Features stack top-to-bottom connected by a line; alternating left/right on desktop. Editorial feel." /></div>
      <OptionDTimeline />

      <div id="opt-E"><OptionLabel letter="E" name="Bento Magazine Grid" tagline="Mixed-size tiles — one huge, two wide, one tall, six small — a curated hierarchy on one screen." /></div>
      <OptionEBento />

      <div id="opt-F"><OptionLabel letter="F" name="Interactive Phone Preview" tagline="A phone frame in the middle; tapping a feature name rotates a screen mockup inside it." /></div>
      <OptionFPhone />

      <div id="opt-G"><OptionLabel letter="G" name="Horizontal Snap-Scroll Deck" tagline="Features render as swipeable full-cards like Stories/Reels. Very mobile-native." /></div>
      <OptionGSnapScroll />

      <div id="opt-H"><OptionLabel letter="H" name="Accordion Reveal" tagline="10 rows stacked; only the active one expands to show its preview + description." /></div>
      <OptionHAccordion />

      {/* Common — same for all */}
      <div className="bg-slate-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Below · Common Features Grid</p>
          <p className="text-white/80 text-sm mt-1">Same for every option — six essentials shared across all 9 event types.</p>
        </div>
      </div>
      <CommonFeaturesGrid />
    </Layout>
  );
}
