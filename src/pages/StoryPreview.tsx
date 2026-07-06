import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { FileText, Smartphone, Sparkles, Check, X, Circle, Zap, Users, Share2 } from "lucide-react";

// Real content from the About page
const eras = [
  {
    label: "The Paper Era",
    period: "1980s → 2000s",
    heading: "Traditional Printed Cards",
    body: "For generations, Ghanaians celebrated life's milestones with beautifully printed invitation cards. But paper came with limitations.",
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
    body: "Then came the digital shift. Designers created invitation flyers — JPEGs and PDFs shared via WhatsApp, email, and social media. Faster and cheaper, but with new problems.",
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
    body: "VibeLink Event was born to solve every problem above. We don't just design invitations — we create living, breathing event experiences. One simple link that does everything.",
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

// —— C · Side-by-side comparison ————————————————————————
function SampleC() {
  const columns = [
    {
      era: eras[0], colour: "amber", accent: "border-amber-200 bg-amber-50/50",
      chip: "bg-amber-100 text-amber-700", iconBg: "bg-amber-500", tag: "Then",
    },
    {
      era: eras[1], colour: "emerald", accent: "border-emerald-200 bg-emerald-50/50",
      chip: "bg-emerald-100 text-emerald-700", iconBg: "bg-emerald-500", tag: "Better",
    },
    {
      era: eras[2], colour: "purple", accent: "border-primary/40 bg-gradient-to-br from-purple-50 to-pink-50",
      chip: "bg-primary text-white", iconBg: "bg-gradient-to-br from-primary to-secondary", tag: "Now", highlight: true,
    },
  ];
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
      {columns.map((col, i) => {
        const Icon = col.era.icon;
        const list = col.era.pros.length ? col.era.pros : col.era.cons;
        const listIcon = col.era.pros.length ? Check : X;
        const listIconColour = col.era.pros.length ? "text-emerald-500" : "text-red-500";
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-2xl border-2 ${col.accent} p-6 ${col.highlight ? "shadow-xl shadow-primary/20 md:scale-105" : "shadow-sm"}`}
          >
            {col.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                You are here
              </span>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-2xl ${col.iconBg} flex items-center justify-center shadow-md`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${col.chip}`}>{col.tag}</span>
                <p className="text-[11px] text-muted-foreground mt-1">{col.era.period}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{col.era.label}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{col.era.body}</p>

            <ul className="space-y-2 text-sm">
              {list.slice(0, 6).map((item, j) => {
                const ListIcon = listIcon;
                return (
                  <li key={j} className="flex items-start gap-2 text-foreground/80">
                    <ListIcon className={`w-4 h-4 shrink-0 mt-0.5 ${listIconColour}`} />
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}
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

      {/* Vote CTA */}
      <section className="py-14 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Which one wins?</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">Tap a letter — I'll ship it to the About page.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["A", "B", "C"].map((letter) => (
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
