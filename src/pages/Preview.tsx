import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { ChevronLeft, ChevronRight, ExternalLink, Check } from "lucide-react";
import { portfolioItems } from "@/data/portfolioItems";

// Pick 4 real portfolio items for the demos
const items = [
  portfolioItems.find((p) => p.slug === "baby-boy-coleman-christening"),
  portfolioItems.find((p) => p.slug === "atta-panyin-memorial"),
  portfolioItems.find((p) => p.slug === "pastor-mensah-retirement"),
  portfolioItems.find((p) => p.slug === "sarah-john-wedding"),
].filter(Boolean) as typeof portfolioItems;

// —— Section shell ———————————————————————————————————————
function DemoShell({
  letter,
  title,
  description,
  bg = "bg-background",
  children,
}: {
  letter: string;
  title: string;
  description: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`py-16 lg:py-20 ${bg} relative overflow-hidden`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg mb-3 shadow-lg">
            {letter}
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

// —— Phone frame (used by A) ——————————————————————————————
function PhoneFrame({
  image,
  title,
  type,
  className = "",
}: {
  image: string;
  title: string;
  type: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone bezel */}
      <div className="relative w-full aspect-[9/19] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
          <div className="w-8 h-1.5 rounded-full bg-gray-700" />
        </div>
        {/* Screen */}
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-4 pt-16 text-white">
            <p className="text-[10px] font-medium opacity-80 mb-0.5">{type}</p>
            <p className="text-sm font-bold leading-tight line-clamp-2">{title}</p>
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

// —— A · Phone-mockup carousel ————————————————————————————
function PhoneCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((prev) => (prev + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[520px] md:h-[600px] flex items-center justify-center">
      {items.map((item, i) => {
        const offset = i - active;
        const abs = Math.abs(offset);
        const isVisible = abs <= 2;
        return (
          <motion.div
            key={item.id}
            className="absolute cursor-pointer"
            style={{ zIndex: 10 - abs }}
            animate={{
              x: offset * 140,
              scale: offset === 0 ? 1 : 0.75 - abs * 0.05,
              opacity: isVisible ? (offset === 0 ? 1 : 0.5) : 0,
              rotateY: offset * -12,
              filter: offset === 0 ? "blur(0px)" : "blur(1px)",
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={() => setActive(i)}
          >
            <PhoneFrame
              image={(item as { thumbnail?: string }).thumbnail || item.image}
              title={item.title}
              type={item.type}
              className="w-[200px] md:w-[240px]"
            />
          </motion.div>
        );
      })}

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// —— B · WhatsApp share preview ————————————————————————————
function WhatsAppSharePreview() {
  return (
    <div
      className="max-w-2xl mx-auto rounded-3xl bg-[#efeae2] dark:bg-[#0b141a] shadow-2xl shadow-primary/10 border border-black/5 overflow-hidden"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M20 20 Q30 15 40 20 T60 20 M60 30 Q70 25 80 30 T100 30 M20 50 Q30 45 40 50 T60 50 M20 80 Q30 75 40 80 T60 80 M60 70 Q70 65 80 70 T100 70'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-black/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
          👨‍👩‍👧
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Family Group</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">147 members</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item, i) => {
          const thumb = (item as { thumbnail?: string }).thumbnail || item.image;
          const url = `vibelinkevent.com/${item.slug}`;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="flex justify-end"
            >
              <a
                href={item.demoUrl || `#${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[85%] block group"
              >
                <div className="rounded-lg rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] shadow-sm overflow-hidden group-hover:brightness-95 dark:group-hover:brightness-110 transition-all">
                  {/* Link preview card */}
                  <div className="p-1">
                    <div className="rounded overflow-hidden bg-white/60 dark:bg-black/30">
                      <div className="aspect-[16/9] overflow-hidden bg-gray-200">
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-[11px] font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-0.5">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 leading-tight">
                          Interactive digital invitation · RSVP · Gallery
                        </p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">vibelinkevent.com</p>
                      </div>
                    </div>
                  </div>
                  {/* Link text */}
                  <div className="px-2.5 py-1.5 text-[13px] text-blue-700 dark:text-blue-400 underline break-all">
                    https://{url}
                  </div>
                  {/* Time + ticks */}
                  <div className="flex items-center justify-end gap-1 px-2.5 pb-1.5 -mt-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-300">12:{30 + i * 3}</span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.5 5L3 7.5L7 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 5L9 7.5L13 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// —— C · Bento grid ————————————————————————————————————————
function BentoGrid() {
  // Item 0 is featured/large, others are smaller
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
      {items.map((item, i) => {
        const thumb = (item as { thumbnail?: string }).thumbnail || item.image;
        // Alternate sizes: item 0 spans 2x2, item 1 spans 2x1, item 2 spans 1x2, item 3 spans 1x1
        const span = [
          "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2",
          "col-span-2 row-span-1 lg:col-span-2 lg:row-span-1",
          "col-span-1 row-span-2 lg:col-span-1 lg:row-span-2",
          "col-span-1 row-span-1 lg:col-span-1 lg:row-span-1",
        ][i];
        return (
          <motion.a
            key={item.id}
            href={item.demoUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className={`group relative rounded-2xl overflow-hidden cursor-pointer ${span}`}
          >
            <img
              src={thumb}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
              {item.type}
            </span>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className={`font-bold leading-tight ${i === 0 ? "text-lg md:text-xl" : "text-sm"}`}>{item.title}</p>
              {i === 0 && (
                <p className="text-white/80 text-xs mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}

// —— D · Cinematic slideshow ——————————————————————————————
function CinematicSlideshow() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, []);

  const item = items[active];
  const thumb = (item as { thumbnail?: string }).thumbnail || item.image;

  return (
    <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 min-h-[400px] md:min-h-[500px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img src={thumb} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative grid md:grid-cols-2 gap-6 p-6 md:p-10 min-h-[400px] md:min-h-[500px]">
        {/* Left: text */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold uppercase tracking-wider mb-3">
                {item.type}
              </span>
              <h3 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-3">{item.title}</h3>
              <p className="text-white/80 text-sm md:text-base mb-5 line-clamp-3">{item.description}</p>
              <a
                href={item.demoUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-purple-900 font-semibold text-sm hover:bg-yellow-300 transition-colors"
              >
                Open Invitation <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: preview */}
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={thumb}
              alt={item.title}
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-sm rounded-2xl shadow-2xl object-cover aspect-[4/3]"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => setActive((p) => (p - 1 + items.length) % items.length)}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setActive((p) => (p + 1) % items.length)}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

// —— E · Marquee ticker ——————————————————————————————————
function MarqueeTicker() {
  // Duplicate items so the animation loops seamlessly
  const doubled = [...items, ...items, ...items];

  return (
    <div className="space-y-4 -mx-4 lg:-mx-8 overflow-hidden">
      {/* Row 1 — left-to-right */}
      <motion.div
        className="flex gap-4"
        animate={{ x: [0, -50 + "%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => {
          const thumb = (item as { thumbnail?: string }).thumbnail || item.image;
          return (
            <div
              key={`row1-${i}`}
              className="shrink-0 w-64 rounded-2xl overflow-hidden bg-card border border-border shadow-sm relative group"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.type}</span>
                <p className="font-semibold text-sm text-foreground leading-tight mt-0.5 line-clamp-1">{item.title}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Row 2 — right-to-left */}
      <motion.div
        className="flex gap-4"
        animate={{ x: [-50 + "%", 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => {
          const thumb = (item as { thumbnail?: string }).thumbnail || item.image;
          return (
            <div
              key={`row2-${i}`}
              className="shrink-0 w-64 rounded-2xl overflow-hidden bg-card border border-border shadow-sm relative group"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.type}</span>
                <p className="font-semibold text-sm text-foreground leading-tight mt-0.5 line-clamp-1">{item.title}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// —— Preview page ————————————————————————————————————————
const Preview = () => {
  const [pick, setPick] = useState<string | null>(null);

  return (
    <Layout>
      <SEO
        title="Homepage Portfolio — Preview Options"
        description="Preview 5 different ways to display portfolio items on the homepage."
        canonical="/portfolio-preview"
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-14 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <motion.div
          className="absolute top-10 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">
            Homepage · Portfolio Section
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Pick your{" "}
            <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">
              display
            </span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Five different ways to show "See It in Action" on the homepage. Try each — I'll ship the one you love.
          </p>
        </div>
      </section>

      {/* A */}
      <DemoShell
        letter="A"
        title="Phone-Mockup Carousel"
        description="Auto-scrolling 3D phone stack. Users see the invitation exactly as it appears on their guests' devices."
        bg="bg-gradient-to-b from-background via-purple-50/40 to-background dark:via-purple-950/10"
      >
        <PhoneCarousel />
      </DemoShell>

      {/* B */}
      <DemoShell
        letter="B"
        title="WhatsApp Share Preview"
        description="Mimics the exact moment someone shares your invitation link in WhatsApp. On-brand with your chat FAQ."
        bg="bg-muted/40"
      >
        <WhatsAppSharePreview />
      </DemoShell>

      {/* C */}
      <DemoShell
        letter="C"
        title="Bento Grid"
        description="Asymmetric mosaic — one large hero piece plus smaller supporting tiles. Premium magazine feel."
      >
        <BentoGrid />
      </DemoShell>

      {/* D */}
      <DemoShell
        letter="D"
        title="Cinematic Slideshow"
        description="Full-width auto-playing slideshow with parallax. Text-left, preview-right, prev/next controls and dots."
        bg="bg-slate-900/[0.03] dark:bg-slate-900/50"
      >
        <CinematicSlideshow />
      </DemoShell>

      {/* E */}
      <DemoShell
        letter="E"
        title="Marquee Ticker"
        description="Two infinite-scrolling rows in opposite directions. Great for showing many items at a glance."
      >
        <MarqueeTicker />
      </DemoShell>

      {/* Vote CTA */}
      <section className="py-14 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Which one wins?</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Tap the letter below — I'll ship it as the homepage portfolio display.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["A", "B", "C", "D", "E"].map((letter) => (
              <button
                key={letter}
                onClick={() => setPick(letter)}
                className={`w-12 h-12 rounded-2xl font-bold text-lg transition-all ${
                  pick === letter
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-110"
                    : "bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {pick === letter ? <Check className="w-5 h-5 mx-auto" /> : letter}
              </button>
            ))}
          </div>
          {pick && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-primary font-semibold text-sm"
            >
              You picked <span className="font-bold">{pick}</span>. Tell me in chat and I'll swap it on the homepage.
            </motion.p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Preview;
