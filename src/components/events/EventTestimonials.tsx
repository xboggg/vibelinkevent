// Reusable testimonials section for the 9 dedicated event pages.
// Desktop: 3-column grid. Mobile: swipeable single card + dots.
import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Star } from "lucide-react";

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
}

interface Props {
  testimonials: Testimonial[];
  heading?: string;
  subheading?: string;
  accentClass?: string;   // e.g. "bg-rose-50/60" for background wash
}

export function EventTestimonials({
  testimonials,
  heading = "From families who chose VibeLink",
  subheading = "Real feedback from real events.",
  accentClass = "from-rose-50/60 via-white to-pink-50/40",
}: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (n: number) => {
    const next = ((n % testimonials.length) + testimonials.length) % testimonials.length;
    setDirection(next > idx || (idx === testimonials.length - 1 && next === 0) ? 1 : -1);
    setIdx(next);
  };
  const next = () => goTo(idx + 1);
  const prev = () => goTo(idx - 1);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) next();
    else if (info.offset.x > 60 || info.velocity.x > 400) prev();
  };

  return (
    <section className={`py-20 lg:py-24 bg-gradient-to-br ${accentClass}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{heading}</h2>
          <p className="text-muted-foreground text-base md:text-lg">{subheading}</p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile swipeable card */}
        <div className="md:hidden max-w-md mx-auto">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={idx}
                custom={direction}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-rose-100 cursor-grab active:cursor-grabbing touch-pan-y select-none"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic min-h-[120px]">"{testimonials[idx].quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{testimonials[idx].name}</p>
                  <p className="text-gray-400 text-xs">{testimonials[idx].location}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-8 bg-rose-500" : "w-1.5 bg-rose-200 hover:bg-rose-300"
                }`}
              />
            ))}
          </div>

          {/* Hint */}
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-3 font-semibold">
            ← Swipe to see more →
          </p>
        </div>
      </div>
    </section>
  );
}
