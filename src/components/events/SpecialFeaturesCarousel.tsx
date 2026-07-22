// Reusable "special features" carousel — Option C from the wedding preview.
// Big coloured card with arrow navigation + auto-cycle + thumbnail nav below.
// Used on each of the 9 dedicated event pages with its own feature list.
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface SpecialFeature {
  n: number;                                                    // internal id (not shown to user)
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;                                                // full feature name (heading on card)
  category: string;                                             // chip label above title — e.g. "SETUP", "MEMORIES"
  shortLabel: string;                                           // 1-2 word label under thumbnail
  short: string;                                                // one-line italic hook
  description: string;                                          // full paragraph
  tint: string;                                                 // gradient e.g. "from-rose-400 to-pink-600"
  soft: string;
  accent: string;
  emoji: string;
}

interface Props {
  features: SpecialFeature[];
  chip?: string;              // small chip above the heading — e.g. "Wedding-only features"
  heading: string;
  subheading?: string;
  autoRotateMs?: number;      // 0 to disable
}

export function SpecialFeaturesCarousel({
  features,
  chip = "Special features",
  heading,
  subheading,
  autoRotateMs = 6000,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [direction, setDirection] = useState(1);
  const cur = features[idx];
  const CurIcon = cur.icon;

  const goTo = (n: number) => {
    setInteracted(true);
    const next = ((n % features.length) + features.length) % features.length;
    setDirection(next > idx || (idx === features.length - 1 && next === 0) ? 1 : -1);
    setIdx(next);
  };

  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -400) next();
    else if (info.offset.x > threshold || info.velocity.x > 400) prev();
  };

  // Pause auto-cycle when the carousel is off-screen — otherwise it keeps
  // firing while the user has scrolled far past it, causing subtle repaints
  // that feel like the page "refreshing". Same-pattern fix as Services page.
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle until user interacts (and only while visible)
  useEffect(() => {
    if (interacted || autoRotateMs <= 0 || !inView) return;
    const id = setInterval(() => {
      setDirection(1);
      setIdx((p) => (p + 1) % features.length);
    }, autoRotateMs);
    return () => clearInterval(id);
  }, [interacted, autoRotateMs, features.length, inView]);

  // Note: no scrollIntoView here — thumbnails are now a static 5×2 grid, all
  // visible without scrolling. The old horizontal-strip scroll caused the
  // whole page to jump every 6s during auto-cycle.

  return (
    <section ref={sectionRef} className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-rose-50/20 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" /> {chip}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight">{heading}</h2>
          {subheading && (
            <p className="text-muted-foreground text-base md:text-lg">{subheading}</p>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Card + arrows share a relative wrapper so arrows sit exactly at the
              vertical middle of the card, not the whole section. */}
          <div className="relative">
            {/* Prev arrow — desktop only */}
            <button
              onClick={prev}
              aria-label="Previous feature"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-20 w-12 h-12 rounded-full bg-white border border-border shadow-xl items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next feature"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-20 w-12 h-12 rounded-full bg-white border border-border shadow-xl items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Big showcase card */}
            <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`rounded-3xl bg-gradient-to-br ${cur.tint} p-6 md:p-8 lg:p-10 pb-14 md:pb-12 shadow-2xl overflow-hidden text-white relative min-h-[440px] md:min-h-0 cursor-grab active:cursor-grabbing touch-pan-y select-none`}
          >
            {/* Soft animated shine */}
            <motion.div
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 pointer-events-none"
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={idx}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="grid md:grid-cols-2 gap-6 md:gap-10 items-center relative z-10"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
                    <CurIcon className="w-3.5 h-3.5" /> {cur.category}
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight drop-shadow">{cur.title}</h3>
                  <p className="text-white/95 font-semibold italic text-base md:text-lg mb-4 leading-snug">{cur.short}</p>
                  <p className="text-white/85 leading-relaxed text-sm md:text-base">{cur.description}</p>
                </div>
                <div className="flex items-center justify-center pointer-events-none min-h-[180px] md:min-h-0">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[10rem] sm:text-[11rem] md:text-[9rem] lg:text-[11rem] drop-shadow-2xl leading-none"
                  >
                    {cur.emoji}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots inside card */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === idx ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to feature ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
          </div>

          {/* Thumbnails — grid on all screens. For ≤10 items use up to 10 cols;
              for more, use 5 cols on desktop too so rows fill evenly. */}
          <div className={`mt-6 grid grid-cols-5 ${features.length > 10 ? 'lg:grid-cols-5' : 'lg:grid-cols-10'} gap-2`}>
            {features.map((f, i) => {
              const FIcon = f.icon;
              const active = i === idx;
              return (
                <button
                  key={f.n}
                  data-thumb-idx={i}
                  onClick={() => goTo(i)}
                  className={`p-2 md:p-2.5 rounded-xl border-2 transition-all text-center ${
                    active ? "border-rose-500 bg-rose-50 scale-105 shadow-md" : "border-transparent bg-white hover:bg-rose-50/50 hover:border-rose-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.tint} flex items-center justify-center mx-auto mb-1 shadow-sm`}>
                    <FIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`text-[10px] font-bold ${active ? "text-rose-700" : "text-foreground/70"} leading-tight`}>
                    {f.shortLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-4 font-semibold">
            <span className="md:hidden">← Swipe the card or tap a thumbnail →</span>
            <span className="hidden md:inline">Tap a thumbnail or use arrows to explore</span>
          </p>
        </div>
      </div>
    </section>
  );
}
