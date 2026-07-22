// The 6 essentials — shared across ALL 9 event pages.
// Same six features every VibeLink invitation ships with.
import { motion } from "framer-motion";
import { Link2, Users, Camera, Timer, MapPin, Palette, Check } from "lucide-react";

const commonFeatures = [
  {
    icon: Link2,
    title: "One WhatsApp-Ready Link",
    desc: "Share once on WhatsApp. Works on every phone. Guests tap, add to calendar, share with family — no app, no PDF.",
    tint: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "RSVP Tracking",
    desc: "Live attendance count, meal preferences and guest analytics — no more spreadsheets.",
    tint: "from-purple-500 to-indigo-600",
  },
  {
    icon: Camera,
    title: "Photo Gallery + Music",
    desc: "Pre-event photos with soft background music that plays automatically. Sets the mood on tap.",
    tint: "from-pink-500 to-rose-600",
  },
  {
    icon: Timer,
    title: "Live Countdown",
    desc: "Build excitement day-by-day, hour-by-hour — right up to the moment guests arrive.",
    tint: "from-orange-500 to-amber-500",
  },
  {
    icon: MapPin,
    title: "Google Maps + Ride",
    desc: "One-tap navigation to the venue. Book Uber, Bolt or Yango right from the invitation.",
    tint: "from-emerald-500 to-teal-600",
  },
  {
    icon: Palette,
    title: "Custom Colours & Design",
    desc: "Your event's colours, fonts and photos — every invitation looks unique to you, never generic.",
    tint: "from-fuchsia-500 to-pink-600",
  },
];

interface Props {
  chip?: string;
  heading?: string;
  subheading?: string;
}

export function CommonFeaturesGrid({
  chip = "Also included",
  heading = "The Essentials, Built In",
  subheading = "Six features every VibeLink invitation ships with — no matter the event type.",
}: Props) {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Check className="h-3.5 w-3.5" /> {chip}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight">{heading}</h2>
          <p className="text-muted-foreground text-base md:text-lg">{subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {commonFeatures.map((f, i) => {
            const FIcon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center shadow-md mb-4`}>
                  <FIcon className="h-6 w-6 text-white" strokeWidth={2.25} />
                </div>
                <h4 className="text-lg md:text-xl font-bold text-foreground mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${f.tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
