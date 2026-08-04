import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    n: "01",
    tag: "SHARING",
    title: "One Link. Every Guest.",
    description: "Your entire event — RSVP, gallery, directions, music, dress code — in a single link that opens on any phone. No app to download. No PDF to save. Just tap.",
    pill: "🔗 WhatsApp-ready",
  },
  {
    n: "02",
    tag: "FLEXIBILITY",
    title: "Change Anything, Anytime.",
    description: "Venue moved? Time changed? Update once after sharing and every guest sees the latest instantly. No reprints. No reshares. No confusion at the gate.",
    pill: "🔄 Live updates",
  },
  {
    n: "03",
    tag: "CULTURE",
    title: "Made for How We Celebrate.",
    description: "Kente palettes, outdoorings, funeral programs, one-week ceremonies — every feature is designed around Ghanaian events, not adapted from someone else's playbook.",
    pill: "🇬🇭 Built for Ghana",
  },
  {
    n: "04",
    tag: "DIASPORA",
    title: "Everyone Included. Everywhere.",
    description: "Your cousin in London opens the same beautiful link as your neighbour in Accra. Livestream, timezone info, WhatsApp — the whole diaspora feels part of the day.",
    pill: "🌍 3 countries reached",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 tracking-wide">
            Why VibeLink
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Four Reasons Families{" "}
            <span className="text-secondary">Choose Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature is built around how Ghanaian families actually celebrate — from Accra to the diaspora.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-card border border-border rounded-2xl p-7 overflow-hidden hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25 transition-all duration-300"
            >
              {/* Ghost number */}
              <span
                className="absolute top-2 right-4 text-[5.5rem] font-black leading-none pointer-events-none select-none text-foreground/[0.04] group-hover:text-foreground/[0.07] transition-colors"
                aria-hidden="true"
              >
                {f.n}
              </span>

              {/* Left accent border */}
              <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Tag + Number */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-primary text-[0.65rem] font-bold tracking-[2.5px] uppercase">{f.n}</span>
                <span className="text-border text-[0.65rem]">—</span>
                <span className="text-muted-foreground text-[0.65rem] font-bold tracking-[2px] uppercase">{f.tag}</span>
              </div>

              {/* Title */}
              <h3 className="text-foreground text-lg font-bold mb-3 leading-snug group-hover:text-primary transition-colors duration-300">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {f.description}
              </p>

              {/* Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">
                {f.pill}
              </span>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
