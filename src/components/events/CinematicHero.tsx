// Reusable cinematic hero for the 9 dedicated event pages.
// Full-bleed background image + dark overlay + slow zoom animation + overlaid text.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface CinematicHeroProps {
  image: string;
  imageAlt: string;
  imageObjectPos?: string;      // e.g. "center 25%"
  chip?: string;
  heading: string;
  headingHighlight?: string;    // last words to colour differently
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  trustRow?: string[];          // small stats/pill row at the bottom
  overlayGradient?: string;     // override the default overlay
}

export function CinematicHero({
  image,
  imageAlt,
  imageObjectPos = "center 30%",
  chip,
  heading,
  headingHighlight,
  subheading,
  primaryCta,
  secondaryCta,
  trustRow,
  overlayGradient,
}: CinematicHeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] lg:min-h-[640px] flex items-center">
      {/* Background image with slow zoom */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
          style={{ objectPosition: imageObjectPos }}
        />
      </motion.div>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: overlayGradient ||
            "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* Extra bottom gradient for readability on mobile */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent md:hidden" />

      {/* Content */}
      <div className="container mx-auto px-6 md:px-10 lg:px-12 xl:px-16 relative z-10 pt-24 pb-12 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">
        <div className="max-w-2xl text-white">
          {chip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-md border border-white/50 text-xs font-bold uppercase tracking-widest mb-5 shadow-lg text-white"
            >
              <Sparkles className="h-3.5 w-3.5" /> {chip}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-5 drop-shadow-lg"
          >
            {heading}{" "}
            {headingHighlight && (
              <span className="inline-block bg-gradient-to-r from-yellow-300 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                {headingHighlight}
              </span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-8 max-w-xl drop-shadow"
          >
            {subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-xl shadow-rose-900/30 border-0"
            >
              <Link to={primaryCta.href}>
                {primaryCta.label} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </motion.div>

          {trustRow && trustRow.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-white/80"
            >
              {trustRow.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-white/40 hidden md:block" />}
                  <span className="font-semibold tracking-wide">{item}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
