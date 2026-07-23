import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Users, Baby, Star, GraduationCap, Radio, Building, Cake, ArrowRight } from "lucide-react";
import { useRef } from "react";

const eventTypes = [
  {
    icon: Heart,
    title: "Weddings & Engagements",
    desc: "Knocking, traditional & white",
    slug: "wedding",
    href: "/wedding-invitations",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    hover: "hover:bg-rose-500 hover:text-white hover:border-rose-500",
    iconBg: "bg-rose-200 group-hover:bg-rose-400",
  },
  {
    icon: Users,
    title: "Funerals",
    desc: "Dignified memorial programs",
    slug: "funeral",
    href: "/funeral-programs",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    hover: "hover:bg-slate-700 hover:text-white hover:border-slate-700",
    iconBg: "bg-slate-200 group-hover:bg-slate-500",
  },
  {
    icon: Radio,
    title: "Church Events",
    desc: "Harvest, thanksgiving & more",
    slug: "church",
    href: "/church-events",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    hover: "hover:bg-violet-600 hover:text-white hover:border-violet-600",
    iconBg: "bg-violet-100 group-hover:bg-violet-400",
  },
  {
    icon: Baby,
    title: "Naming Ceremonies",
    desc: "Outdooring & christenings",
    slug: "naming",
    href: "/naming-ceremony",
    color: "bg-sky-50 text-sky-600 border-sky-100",
    hover: "hover:bg-sky-500 hover:text-white hover:border-sky-500",
    iconBg: "bg-sky-100 group-hover:bg-sky-400",
  },
  {
    icon: Cake,
    title: "Birthdays",
    // Card links to /birthday (Regular Birthday) which cross-links to
    // /milestone-birthday. Subtitle hints both types exist so we can keep
    // an even 8-card grid rather than 9 (Milestone as a separate card).
    desc: "Regular · Milestone",
    slug: "birthday",
    href: "/birthday",
    color: "bg-pink-50 text-pink-600 border-pink-100",
    hover: "hover:bg-pink-500 hover:text-white hover:border-pink-500",
    iconBg: "bg-pink-100 group-hover:bg-pink-400",
  },
  {
    icon: Star,
    title: "Anniversaries",
    desc: "Couples & institutions",
    slug: "anniversary",
    href: "/anniversary-invitations",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    hover: "hover:bg-amber-500 hover:text-white hover:border-amber-500",
    iconBg: "bg-amber-100 group-hover:bg-amber-400",
  },
  {
    icon: GraduationCap,
    title: "Graduations",
    desc: "Academic achievements",
    slug: "graduation",
    href: "/graduation",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hover: "hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
    iconBg: "bg-emerald-100 group-hover:bg-emerald-400",
  },
  {
    icon: Building,
    title: "Corporate Events",
    desc: "Conferences & launches",
    slug: "corporate",
    href: "/corporate-events",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    hover: "hover:bg-blue-700 hover:text-white hover:border-blue-700",
    iconBg: "bg-blue-100 group-hover:bg-blue-500",
  },
];

export function EventTypesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 text-secondary text-sm font-semibold mb-4">
            What We Cover
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            One Platform for{" "}
            <span className="text-secondary">Every Occasion</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From weddings to memorials — every celebration and ceremony, beautifully delivered to every guest.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3"
        >
          {eventTypes.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={event.href}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${event.color} ${event.hover}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 ${event.iconBg}`}>
                  <event.icon className="h-5 w-5 transition-colors duration-300" />
                </div>
                <span className="text-sm font-bold leading-tight mb-1">{event.title}</span>
                <span className="text-[11px] opacity-60 leading-tight">{event.desc}</span>
                <ArrowRight className="h-3.5 w-3.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
