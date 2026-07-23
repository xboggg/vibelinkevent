import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Globe, Star, Zap, Heart } from "lucide-react";
import { useEffect, useRef } from "react";

const stats = [
  { value: 100, suffix: "+", label: "Invitations Created", icon: Heart },
  { value: 3, suffix: "", label: "Countries Reached", icon: Globe },
  { value: 98, suffix: "%", label: "Client Satisfaction", icon: Star },
  { value: 48, suffix: "hrs", label: "Rush Delivery", icon: Zap },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
    return controls.stop;
  }, [inView, value, count]);

  return (
    <span ref={ref} className="text-3xl lg:text-4xl font-bold text-white">
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

export function HomeClosingSection() {
  return (
    <section className="bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#322659] py-12 lg:py-14 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 mb-3">
                <s.icon className="h-5 w-5 text-secondary" />
              </div>
              <div className="mb-1">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-white/60 text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
