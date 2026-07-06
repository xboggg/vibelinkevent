import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { FileText, Smartphone, Sparkles, Check, X, MapPin, Music, Camera, Radio, MessageCircle } from "lucide-react";

// Real content from the About page
const eras = [
  {
    label: "The Paper Era",
    period: "1980s → 2000s",
    heading: "Traditional Printed Cards",
    body: "For decades, our biggest moments were announced with beautifully printed cards — hand-delivered, gold-edged, kept as keepsakes. Paper did a lot. But it couldn't do everything.",
    icon: FileText,
    cons: [
      "Expensive to print in bulk",
      "Time-consuming to distribute by hand",
      "Cannot reach loved ones abroad",
      "Must reprint if details change",
    ],
    pros: [],
    tone: "paper",
  },
  {
    label: "The WhatsApp Era",
    period: "2010s → 2024",
    heading: "JPEG & PDF Flyers",
    body: "Then the phone changed everything. Designers replaced ink with pixels, and JPEG flyers started flying through WhatsApp groups and family chats. Faster. Cheaper. But something got lost in the compression.",
    icon: Smartphone,
    cons: [
      "Images get compressed and lose quality",
      "Gets buried in busy WhatsApp chats",
      "No way to track who's coming",
      "Must reshare if details change",
      "No directions to venue",
      "Just a static picture — no interactivity",
    ],
    pros: [],
    tone: "whatsapp",
  },
  {
    label: "The VibeLink Era",
    period: "2025 → Now",
    heading: "Live, Interactive Invitations",
    body: "Not a picture. Not a PDF. A living, breathing event page — one link that holds your whole event and updates the moment you do. Your guests are anywhere in the world. So is your invitation.",
    icon: Sparkles,
    cons: [],
    pros: [
      "Update details anytime, guests see it instantly",
      "Track RSVPs in real-time",
      "Google Maps directions built-in",
      "Photo galleries, music, live streams",
      "Works on every phone, no app to download",
      "Reaches loved ones anywhere in the world",
    ],
    tone: "vibelink",
  },
];

// Reusable section shell
function DemoShell({
  letter, title, description, bg = "bg-background", children,
}: { letter: string; title: string; description: string; bg?: string; children: React.ReactNode }) {
  return (
    <section className={`py-16 lg:py-20 ${bg} relative overflow-hidden`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg mb-3 shadow-lg">{letter}</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

// —— A · Tight polish ————————————————————————————————
function SampleA() {
  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Gradient timeline rail */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-sky-400 via-emerald-400 to-primary" />

      {eras.map((era, i) => {
        const Icon = era.icon;
        const isRight = i % 2 === 1; // 0=left, 1=right, 2=left
        const colours = [
          { chip: "bg-sky-100 text-sky-700 border-sky-200", icon: "from-sky-400 to-sky-600", ring: "ring-sky-100" },
          { chip: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "from-emerald-400 to-emerald-600", ring: "ring-emerald-100" },
          { chip: "bg-purple-100 text-purple-700 border-purple-200", icon: "from-primary via-purple-500 to-secondary", ring: "ring-purple-100" },
        ][i];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative flex flex-col md:flex-row ${isRight ? "md:flex-row-reverse" : ""} items-start gap-6 md:gap-10 mb-12 last:mb-0 pl-16 md:pl-0`}
          >
            {/* Icon on the rail */}
            <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${colours.icon} flex items-center justify-center shadow-lg ring-4 ring-background z-10`}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2.25} />
            </div>

            {/* Card */}
            <div className="flex-1 md:max-w-[calc(50%-3rem)]">
              <div className="rounded-2xl bg-card border border-border shadow-md p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colours.chip} border`}>{era.label}</span>
                  <span className="text-[11px] font-medium text-muted-foreground">{era.period}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{era.heading}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{era.body}</p>

                {era.cons.length > 0 && (
                  <ul className="space-y-2">
                    {era.cons.map((c, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {era.pros.length > 0 && (
                  <ul className="space-y-2">
                    {era.pros.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="hidden md:block flex-1 md:max-w-[calc(50%-3rem)]" />
          </motion.div>
        );
      })}
    </div>
  );
}

// —— B · Evolution showcase (each era has its own personality) ————————
function SampleB() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Paper Era — muted, subtle paper texture, cool blue tone */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative rounded-2xl p-6 md:p-8 border border-amber-200/60 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #fdf6e3 0%, #f5ebc8 100%)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a08a5c' fill-opacity='0.06'%3E%3Ccircle cx='20' cy='20' r='0.6'/%3E%3Ccircle cx='0' cy='0' r='0.6'/%3E%3Ccircle cx='40' cy='40' r='0.6'/%3E%3C/g%3E%3C/svg%3E\"), linear-gradient(135deg, #fdf6e3 0%, #f5ebc8 100%)",
        }}
      >
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl bg-amber-100/70 border border-amber-300/50 flex items-center justify-center shadow-inner">
            <FileText className="w-10 h-10 text-amber-800/70" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800/70">Era 01 · 1980s → 2000s</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif text-amber-950 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Paper Era</h3>
            <p className="text-amber-900/70 text-sm md:text-base leading-relaxed mb-4">Beautifully printed invitation cards. Reliable. But every one required paper, ink, and a hand-delivered journey.</p>
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {eras[0].cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Era — green tint, chat-bubble motif */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
        className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/60 shadow-sm"
      >
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
          {/* WhatsApp-style bubble icon */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Smartphone className="w-10 h-10 text-white" strokeWidth={2} />
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">99+</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Era 02 · 2010s → 2024</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-emerald-950 mb-2">The WhatsApp Era</h3>
            <p className="text-emerald-900/80 text-sm md:text-base leading-relaxed mb-4">JPEGs and PDFs replaced paper. Cheaper, faster — but each one was a lifeless picture buried in a busy chat.</p>
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {eras[1].cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-900/80">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* VibeLink Era — full glass + gradient, alive */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
        className="relative rounded-3xl p-[2px] bg-gradient-to-r from-primary via-purple-500 to-secondary shadow-2xl shadow-primary/30"
      >
        <div className="relative rounded-[calc(1.5rem-2px)] p-6 md:p-8 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 overflow-hidden text-white">
          {/* Animated glow blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-secondary/30 blur-3xl" />

          <div className="relative grid md:grid-cols-[auto_1fr] gap-6 items-start">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/50">
              <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Era 03 · 2025 → Now · Live</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                The{" "}
                <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">VibeLink</span>{" "}
                Era
              </h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4">Not a picture. A living, breathing event page. One link that RSVPs, remembers, updates, streams, connects the diaspora.</p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                {eras[2].pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                    </div>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// —— C · Side-by-side comparison (colour-refreshed) ——————————————
// Paper: warm amber/orange/rose gradient. WhatsApp: emerald/teal/cyan
// gradient. VibeLink: full glass/gradient treatment reused from Sample B.
function SampleC() {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6 items-stretch">
      {/* PAPER — warm amber → orange → rose */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl border-2 border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/30">
            <FileText className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900">Then</span>
            <p className="text-[11px] text-amber-900/70 mt-1">{eras[0].period}</p>
          </div>
        </div>
        <h3 className="text-xl font-bold text-amber-950 mb-0.5">{eras[0].label}</h3>
        <p className="text-[13px] font-semibold text-amber-800/90 italic mb-3">{eras[0].heading}</p>
        <p className="text-amber-900/70 text-sm leading-relaxed mb-4">{eras[0].body}</p>
        <ul className="space-y-2 text-sm">
          {eras[0].cons.slice(0, 6).map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-amber-900/80">
              <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* WHATSAPP — emerald → teal → cyan */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl border-2 border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <Smartphone className="w-7 h-7 text-white" strokeWidth={2} />
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">99+</span>
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900">Better</span>
            <p className="text-[11px] text-emerald-900/70 mt-1">{eras[1].period}</p>
          </div>
        </div>
        <h3 className="text-xl font-bold text-emerald-950 mb-0.5">{eras[1].label}</h3>
        <p className="text-[13px] font-semibold text-emerald-800/90 italic mb-3">{eras[1].heading}</p>
        <p className="text-emerald-900/70 text-sm leading-relaxed mb-4">{eras[1].body}</p>
        <ul className="space-y-2 text-sm">
          {eras[1].cons.slice(0, 6).map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-emerald-900/80">
              <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* VIBELINK — dark glass + gradient border (reused from Sample B) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-2xl p-[2px] bg-gradient-to-r from-primary via-purple-500 to-secondary shadow-2xl shadow-primary/30 md:scale-105"
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg z-10">
          You are here
        </span>

        <div className="relative rounded-[calc(1rem-2px)] p-6 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 overflow-hidden text-white h-full">
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.4, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60"
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary/20 border border-secondary/40 text-secondary">
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  BEST
                </span>
                <p className="text-[11px] text-white/60 mt-1">NOW</p>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-0.5">
              The{" "}
              <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">VibeLink</span>{" "}
              Era
            </h3>
            <p className="text-[13px] font-semibold text-secondary/90 italic mb-3">{eras[2].heading}</p>
            <p className="text-white/70 text-sm leading-relaxed mb-4">{eras[2].body}</p>
            <ul className="space-y-2 text-sm">
              {eras[2].pros.slice(0, 6).map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-white/90">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// —— D · Interactive year slider ————————————————————————————
// Drag a slider from 1985 → Now; the content changes with each stop.
function SampleD() {
  const stops = [
    { year: 1985, era: eras[0], gradient: "from-amber-50 to-orange-100", accent: "text-amber-700", icon: FileText, iconBg: "bg-amber-500" },
    { year: 2015, era: eras[1], gradient: "from-emerald-50 to-green-100", accent: "text-emerald-700", icon: Smartphone, iconBg: "bg-emerald-500" },
    { year: 2026, era: eras[2], gradient: "from-purple-50 to-pink-100", accent: "text-primary", icon: Sparkles, iconBg: "bg-gradient-to-br from-primary to-secondary" },
  ];
  const [step, setStep] = useState(2);
  const cur = stops[step];
  const CurIcon = cur.icon;
  const list = cur.era.pros.length ? cur.era.pros : cur.era.cons;
  const ListIcon = cur.era.pros.length ? Check : X;
  const listIconColour = cur.era.pros.length ? "text-emerald-500" : "text-red-500";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Year slider */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between mb-3">
          {stops.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} className={`text-xs md:text-sm font-bold transition-colors ${i === step ? cur.accent : "text-muted-foreground/50"}`}>
              {s.year}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="h-1.5 bg-muted rounded-full" />
          <motion.div
            className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-primary"
            initial={false}
            animate={{ width: `${(step / (stops.length - 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
          {stops.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{ left: `${(i / (stops.length - 1)) * 100}%` }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 transition-all ${i <= step ? "bg-primary border-primary shadow-lg scale-100" : "bg-background border-border scale-90"} ${i === step ? "ring-4 ring-primary/30" : ""}`}
              aria-label={`Jump to ${stops[i].year}`}
            />
          ))}
        </div>
      </div>

      {/* Content that changes on drag */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`rounded-3xl bg-gradient-to-br ${cur.gradient} border border-border p-6 md:p-10 shadow-lg`}
      >
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <div className={`w-20 h-20 rounded-2xl ${cur.iconBg} flex items-center justify-center shadow-lg`}>
            <CurIcon className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${cur.accent} mb-1`}>{cur.era.period} · {cur.era.label}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{cur.era.heading}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">{cur.era.body}</p>
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {list.slice(0, 6).map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                  <ListIcon className={`w-4 h-4 shrink-0 mt-0.5 ${listIconColour}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground mt-4">Tap a year to travel through the evolution</p>
    </div>
  );
}

// —— E · Full-bleed split 'then vs now' —————————————————————————
// Big diagonal cut across the middle. Left = old world (paper + JPEGs),
// right = new world (VibeLink). A single visual argument, no scrolling.
function SampleE() {
  return (
    <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border">
      <div className="grid md:grid-cols-2 relative">
        {/* Left — THEN (paper + WhatsApp era, muted) */}
        <div className="relative bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 p-6 md:p-10 order-2 md:order-1">
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <span className="inline-block px-3 py-1 rounded-full bg-stone-800/10 text-stone-700 text-[10px] font-bold uppercase tracking-widest">Then · 1985–2024</span>
          </div>

          <div className="pt-14">
            {/* Faux paper card */}
            <div className="relative rounded-lg bg-white p-5 shadow-md border border-stone-200 mb-4 -rotate-2">
              <p className="text-[10px] font-serif text-stone-500 text-center tracking-widest mb-1">— YOU ARE CORDIALLY INVITED —</p>
              <p className="text-lg font-serif text-stone-800 text-center leading-tight">Mr. & Mrs. Boateng<br/>request the pleasure of your company</p>
              <p className="text-[10px] font-serif text-stone-500 text-center mt-2">10th April · Accra</p>
            </div>
            {/* Faux WhatsApp thumbnail */}
            <div className="rounded-lg bg-emerald-100/60 border border-emerald-200 p-3 rotate-1 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">📎</div>
                <span className="text-[11px] text-stone-600">wedding-invite-final-v3.jpeg</span>
              </div>
              <div className="h-16 rounded bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-500 text-[10px]">Blurry JPEG · 800×600</div>
            </div>

            <div className="mt-6 space-y-1.5">
              {["Cannot change details", "Cannot track RSVPs", "Buried in busy chats", "No directions to venue"].map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — NOW (VibeLink, vibrant) */}
        <div className="relative bg-gradient-to-br from-primary via-purple-800 to-slate-900 text-white p-6 md:p-10 order-1 md:order-2 overflow-hidden">
          <motion.div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-secondary/30 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-pink-500/30 blur-3xl" animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 7, repeat: Infinity }} />

          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Now · 2025 →
            </span>
          </div>

          <div className="relative pt-14">
            {/* Mini phone mockup */}
            <div className="relative w-40 mx-auto rounded-2xl bg-black p-1.5 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 aspect-[9/16] p-3 text-white flex flex-col justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-80">Live invitation</p>
                  <p className="text-sm font-bold leading-tight mt-1">Mr. & Mrs. Boateng</p>
                  <p className="text-[10px] opacity-90">10th April · Accra</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[MapPin, Camera, Music, Radio].map((I, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
                      <I className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mt-6 text-center">
              A living{" "}
              <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">invitation</span>
            </h3>

            <div className="mt-4 space-y-1.5">
              {["Update anytime, guests see instantly", "Real-time RSVP tracking", "Google Maps built-in", "Photos, music, livestream"].map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-white/90">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// —— F · The story told as a WhatsApp conversation ————————————————
// On-brand with the FAQ chat + WhatsApp share preview. Two 'friends'
// chat about invitations, and their messages narrate the evolution.
function SampleF() {
  return (
    <div
      className="max-w-2xl mx-auto rounded-3xl bg-[#efeae2] dark:bg-[#0b141a] shadow-2xl border border-black/5 overflow-hidden"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Cpath d='M20 20 Q30 15 40 20 T60 20 M60 30 Q70 25 80 30 T100 30 M20 50 Q30 45 40 50 T60 50 M20 80 Q30 75 40 80 T60 80'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-black/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">👵</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Grandma & Ama</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">The evolution of invitations, one message at a time</p>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Grandma — Paper Era */}
        <div className="flex justify-start">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
            <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Grandma · 1985</p>
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">"Ama, in my time we printed cards. Beautiful gold-edged cards. Delivered by hand or by post. Very special."</p>
            <span className="text-[10px] text-gray-500 block mt-1 text-right">09:12</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] shadow-sm">
            <p className="text-sm text-gray-900 dark:text-white leading-snug">But what if guests were abroad? Or you needed to change the venue? 🥲</p>
            <span className="text-[10px] text-gray-500 dark:text-gray-300 block mt-1 text-right">09:14</span>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">Then you reprinted. Or wrote a new one. Or sadly, they missed it.</p>
            <span className="text-[10px] text-gray-500 block mt-1 text-right">09:15</span>
          </div>
        </div>

        {/* Day pill */}
        <div className="flex justify-center py-2">
          <span className="px-3 py-1 rounded-lg bg-white/80 dark:bg-black/40 text-[11px] font-medium text-gray-600 dark:text-gray-300 shadow-sm">📱 2015 · The WhatsApp Era</span>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] shadow-sm">
            <p className="text-sm text-gray-900 dark:text-white leading-snug">Now we just design a JPEG and forward it in WhatsApp. Easy!</p>
            <span className="text-[10px] text-gray-500 dark:text-gray-300 block mt-1 text-right">09:20</span>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">Ah but Grandma, guests still miss it — buried in 200 other messages 😩 And nobody knows who's actually coming.</p>
            <span className="text-[10px] text-gray-500 block mt-1 text-right">09:22</span>
          </div>
        </div>

        {/* Day pill */}
        <div className="flex justify-center py-2">
          <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-[11px] font-bold text-primary shadow-sm inline-flex items-center gap-1">
            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            2025 · The VibeLink Era
          </span>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] shadow-sm">
            <p className="text-sm text-gray-900 dark:text-white leading-snug">One link. Guests tap it and everything's there — the story, the RSVP, the map, the music, the livestream. Update anytime. ✨</p>
            <span className="text-[10px] text-gray-500 dark:text-gray-300 block mt-1 text-right">09:30</span>
          </div>
        </div>

        {/* VibeLink Team joins */}
        <div className="flex justify-start">
          <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-primary/20 shadow-sm">
            <p className="text-[11px] font-semibold text-primary mb-0.5 flex items-center gap-1">VibeLink Team <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></p>
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">Not a picture. Not a card. A living event page — one link that does everything, for anyone, anywhere.</p>
            <span className="text-[10px] text-gray-500 block mt-1 text-right">09:31</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 text-center">
        <p className="text-[11px] text-muted-foreground">A story told the way Ghanaian families actually chat</p>
      </div>
    </div>
  );
}

// —— The preview page ——————————————————————————————————————
const StoryPreview = () => {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <Layout>
      <SEO title="Our Story — Design Samples" description="Three design directions for the Our Story section." canonical="/story-preview" />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-14 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <motion.div className="absolute top-10 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">About page · 'Our Story' section</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Pick your{" "}
            <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">story style</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">Three ways to tell 'The evolution of invitations in Ghana'. Same content, three levels of polish.</p>
        </div>
      </section>

      <DemoShell letter="A" title="Tight polish" description="Same timeline layout, but every element gets a proper design pass — real cards, styled bullets, thicker gradient rail, era chips with dates. Safest option, dramatic read-improvement.">
        <SampleA />
      </DemoShell>

      <DemoShell letter="B" title="Evolution showcase" description="Each era gets its own personality: paper-textured for Era 1, WhatsApp-green for Era 2, glass-gradient-purple-live for Era 3. The design itself tells the evolution story." bg="bg-muted/40">
        <SampleB />
      </DemoShell>

      <DemoShell letter="C" title="Side-by-side comparison" description="Three columns like a pricing table: Then | Better | Now. Very scannable. The 'Now' column pops with a 'You are here' badge and scales up on desktop.">
        <SampleC />
      </DemoShell>

      <DemoShell letter="D" title="Interactive year slider" description="Drag or tap the year (1985 · 2015 · 2026) and watch the era switch below. Tactile, cinematic, one card at a time — users literally travel through the evolution." bg="bg-muted/40">
        <SampleD />
      </DemoShell>

      <DemoShell letter="E" title="Full-bleed split · Then vs Now" description="A single dramatic split-screen. Left half is faded 'then' (paper card mockup + WhatsApp JPEG). Right half is vibrant 'now' (mini phone mockup with live features + gradient glow). The whole argument in one visual.">
        <SampleE />
      </DemoShell>

      <DemoShell letter="F" title="The story told in a WhatsApp chat" description="Grandma and Ama chat about invitations across three decades. Then VibeLink Team joins with the punchline. On-brand with your FAQ chat + culturally intimate — this is how Ghanaian families actually talk." bg="bg-muted/40">
        <SampleF />
      </DemoShell>

      {/* Vote CTA */}
      <section className="py-14 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Which one wins?</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">Tap a letter — I'll ship it to the About page.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["A", "B", "C", "D", "E", "F"].map((letter) => (
              <button
                key={letter}
                onClick={() => setPick(letter)}
                className={`w-12 h-12 rounded-2xl font-bold text-lg transition-all ${pick === letter ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-110" : "bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary"}`}
              >
                {pick === letter ? <Check className="w-5 h-5 mx-auto" /> : letter}
              </button>
            ))}
          </div>
          {pick && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-primary font-semibold text-sm">
              You picked <span className="font-bold">{pick}</span>. Tell me in chat and I'll swap it into /about.
            </motion.p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StoryPreview;
