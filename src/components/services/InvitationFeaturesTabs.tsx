// Sample A from /services-preview extracted for use on the main /services
// page. Interactive tabs across the top; the panel below morphs to show the
// active category's features on the left + a live animated micro-demo on the
// right. Auto-cycles every 5s until the user interacts.
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, MapPin, Users, Camera, Heart, Calendar } from "lucide-react";

// ── Feature shape the component expects ─────────────────────────────
export interface InvitationFeature {
  name: string;
  description: string;
}

export interface InvitationCategory {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  features: InvitationFeature[];
  tint: string;          // gradient — "from-blue-400 to-blue-600"
  soft: string;          // background — "bg-blue-50"
  accent: string;        // text — "text-blue-700"
  demoKey: string;       // maps to a Demo component below
}

// ── Animated micro-demos ────────────────────────────────────────────
function Demo({ demoKey, tint }: { demoKey: string; tint: string }) {
  if (demoKey === "countdown") return <CountdownDemo tint={tint} />;
  if (demoKey === "map") return <MapDemo tint={tint} />;
  if (demoKey === "rsvp") return <RsvpDemo tint={tint} />;
  if (demoKey === "gallery") return <GalleryDemo tint={tint} />;
  if (demoKey === "messages") return <MessagesDemo tint={tint} />;
  if (demoKey === "livestream") return <LivestreamDemo tint={tint} />;
  if (demoKey === "memorial") return <MemorialDemo tint={tint} />;
  if (demoKey === "languages") return <LanguagesDemo tint={tint} />;
  if (demoKey === "thankyou") return <ThankYouDemo tint={tint} />;
  return null;
}

function CountdownDemo({ tint }: { tint: string }) {
  const [t, setT] = useState({ d: 12, h: 8, m: 32, s: 45 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let s = p.s - 1;
        let m = p.m, h = p.h, d = p.d;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) return { d: 12, h: 8, m: 32, s: 45 };
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {[
        { label: "days", n: t.d },
        { label: "hrs", n: t.h },
        { label: "min", n: t.m },
        { label: "sec", n: t.s },
      ].map((c, i) => (
        <div key={i} className={`rounded-xl bg-gradient-to-br ${tint} p-3 text-center text-white shadow-md`}>
          <div className="text-2xl md:text-3xl font-black tabular-nums leading-none">{String(c.n).padStart(2, "0")}</div>
          <div className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-80 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function MapDemo({ tint }: { tint: string }) {
  return (
    <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 shadow-inner">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
        <path d="M0 40 L300 60" stroke="rgba(255,255,255,0.7)" strokeWidth="6" />
        <path d="M0 110 L300 130" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
        <path d="M80 0 L100 180" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
        <path d="M200 0 L220 180" stroke="rgba(255,255,255,0.7)" strokeWidth="6" />
      </svg>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
      >
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tint} flex items-center justify-center shadow-xl ring-4 ring-white`}>
          <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="w-1.5 h-4 bg-emerald-700 mx-auto rounded-b" />
      </motion.div>
      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow-md">
        <p className="text-[10px] text-emerald-800 font-semibold">📍 Labadi Beach Hotel</p>
        <p className="text-[9px] text-emerald-800/70">Accra — one-tap navigation</p>
      </div>
    </div>
  );
}

function RsvpDemo({ tint }: { tint: string }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((p) => (p + 1) % 4), 1600);
    return () => clearInterval(id);
  }, []);
  const stats = [
    { label: "Attending", value: 148, colour: "text-emerald-600" },
    { label: "Maybe", value: 22, colour: "text-amber-600" },
    { label: "Meals: Chicken", value: 92, colour: "text-purple-600" },
    { label: "Meals: Vegetarian", value: 34, colour: "text-pink-600" },
  ];
  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center`}>
          <Users className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= stage ? 1 : 0.3 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-600">{s.label}</span>
            <span className={`font-black tabular-nums ${s.colour}`}>{s.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GalleryDemo({ tint: _tint }: { tint: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % 5), 1600);
    return () => clearInterval(id);
  }, []);
  const gradients = [
    "from-pink-300 to-purple-400",
    "from-amber-300 to-rose-400",
    "from-emerald-300 to-teal-400",
    "from-blue-300 to-indigo-400",
    "from-orange-300 to-red-400",
  ];
  return (
    <div className="w-full aspect-[5/3] rounded-xl overflow-hidden relative shadow-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-br ${gradients[idx]} flex items-center justify-center`}
        >
          <Camera className="w-10 h-10 text-white/80" strokeWidth={1.5} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
        {gradients.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

function MessagesDemo({ tint }: { tint: string }) {
  const messages = [
    { who: "Ama K.", text: "Wishing you both a lifetime of joy! 💖", side: "left" as const },
    { who: "You", text: "Thanks Ama! Can't wait to see you.", side: "right" as const },
    { who: "Kwame O.", text: "Congrats! See you Saturday 🙏", side: "left" as const },
  ];
  return (
    <div className="w-full rounded-xl bg-orange-50/50 p-3 shadow-md border border-orange-200 space-y-2 min-h-[140px]">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.4, duration: 0.4 }}
          className={`flex ${m.side === "right" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-[11px] shadow-sm ${
              m.side === "right"
                ? `bg-gradient-to-br ${tint} text-white`
                : "bg-white text-gray-800"
            }`}
          >
            {m.side !== "right" && <p className="text-[9px] font-bold text-orange-700 mb-0.5">{m.who}</p>}
            <p className="leading-snug">{m.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function LivestreamDemo({ tint }: { tint: string }) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 shadow-md">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${tint} flex items-center justify-center shadow-2xl`}
        >
          <Play className="w-6 h-6 text-white ml-1 fill-white" />
        </motion.button>
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-white"
        />
        Live
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white/80 text-[10px]">
        <span>👀 142 watching</span>
        <span>Diaspora inclusive</span>
      </div>
    </div>
  );
}

function MemorialDemo({ tint: _tint }: { tint: string }) {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-slate-100 to-stone-100 p-4 shadow-md border border-slate-300 min-h-[140px] relative overflow-hidden">
      <div className="flex flex-col items-center mb-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-3 h-4 rounded-full bg-gradient-to-t from-orange-400 to-yellow-200 shadow-[0_0_16px_4px_rgba(251,191,36,0.6)]"
        />
        <div className="w-1.5 h-8 bg-slate-200 border border-slate-400" />
      </div>
      <p className="text-[10px] font-serif italic text-slate-600 text-center leading-snug mb-2">"In loving memory of Mr. Wilson Atta Krofah"</p>
      <div className="space-y-1">
        {[
          { who: "Rev. Owusu", text: "May his soul rest in perfect peace 🙏" },
          { who: "Ama K.", text: "Grateful for his life and legacy." },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.4 }}
            className="text-[10px] bg-white/70 rounded-lg px-2 py-1 shadow-sm"
          >
            <span className="font-bold text-slate-800">{m.who}: </span>
            <span className="text-slate-600">{m.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LanguagesDemo({ tint }: { tint: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % 4), 1600);
    return () => clearInterval(id);
  }, []);
  const langs = [
    { code: "EN", flag: "🇬🇧", label: "English", sample: "You are cordially invited to our wedding" },
    { code: "TWI", flag: "🇬🇭", label: "Twi", sample: "Yɛfrɛ wo bɛka yɛn ayɛforohyia" },
    { code: "FR", flag: "🇫🇷", label: "French", sample: "Vous êtes cordialement invité à notre mariage" },
    { code: "AR", flag: "🇸🇦", label: "Arabic", sample: "أنت مدعو بأدب إلى حفل زفافنا" },
  ];
  const cur = langs[idx];
  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md border border-teal-200 min-h-[140px]">
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {langs.map((l, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
              i === idx ? `bg-gradient-to-r ${tint} text-white shadow-md` : "bg-slate-100 text-slate-600"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.code}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`text-sm font-serif italic text-slate-700 text-center ${cur.code === "AR" ? "text-right" : ""}`}
          dir={cur.code === "AR" ? "rtl" : "ltr"}
        >
          "{cur.sample}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ThankYouDemo({ tint }: { tint: string }) {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-md border border-amber-200 min-h-[140px] relative overflow-hidden text-center">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={`inline-flex w-12 h-12 rounded-full bg-gradient-to-br ${tint} items-center justify-center shadow-lg mb-2`}
      >
        <Heart className="w-6 h-6 text-white fill-white" strokeWidth={0} />
      </motion.div>
      <p className="text-sm font-serif italic text-amber-900 mb-1">"Thank you for celebrating with us."</p>
      <p className="text-[10px] text-amber-800/70 mb-3">— Kofi & Ama</p>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-amber-300 text-[10px] font-semibold text-amber-800 shadow-sm">
        <Calendar className="w-3 h-3" />
        Add to calendar
      </div>
    </div>
  );
}

// ── The main component ──────────────────────────────────────────────
export function InvitationFeaturesTabs({
  categories,
  autoRotateMs = 5000,
}: {
  categories: InvitationCategory[];
  autoRotateMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const cur = categories[idx];
  const Icon = cur.icon;

  useEffect(() => {
    if (userInteracted || autoRotateMs <= 0) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % categories.length), autoRotateMs);
    return () => clearInterval(id);
  }, [userInteracted, autoRotateMs, categories.length]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c, i) => {
          const CIcon = c.icon;
          return (
            <button
              key={i}
              onClick={() => {
                setUserInteracted(true);
                setIdx(i);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                i === idx
                  ? `bg-gradient-to-r ${c.tint} text-white shadow-lg`
                  : "bg-card border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              <CIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{c.title.split(" & ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="rounded-3xl bg-card border border-border p-6 md:p-10 shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${cur.soft} ${cur.accent} text-xs font-bold uppercase tracking-widest mb-4`}>
                <Icon className="w-3.5 h-3.5" /> Category
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{cur.title}</h3>
              <ul className="space-y-4">
                {cur.features.map((f, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + j * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${cur.tint} flex items-center justify-center shrink-0 mt-1`}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm md:text-base leading-tight">{f.name}</p>
                      <p className="text-muted-foreground text-xs md:text-sm mt-0.5 leading-snug">{f.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx + "-demo"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="w-full max-w-sm">
                <Demo demoKey={cur.demoKey} tint={cur.tint} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 flex gap-1">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setUserInteracted(true);
                setIdx(i);
              }}
              className={`h-1 flex-1 rounded-full transition-all ${i === idx ? `bg-gradient-to-r ${cur.tint}` : "bg-border"}`}
              aria-label={`Tab ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
