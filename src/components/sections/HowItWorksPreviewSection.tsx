import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, CreditCard, Palette, CheckCircle, Share2, ArrowRight, Sparkles } from "lucide-react";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Fill Our Simple Form",
    description: "Tell us about your event in just 2 minutes.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.35)",
    bg: "#8b5cf6",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "We Confirm on WhatsApp",
    description: "WhatsApp confirmation within 24 hours to lock in your details.",
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.35)",
    bg: "#ec4899",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay & Confirm",
    description: "MoMo, bank transfer, or card — 50% deposit or pay in full.",
    gradient: "from-cyan-500 to-blue-500",
    glow: "rgba(6,182,212,0.35)",
    bg: "#06b6d4",
  },
  {
    number: "04",
    icon: Palette,
    title: "We Design Magic",
    description: "Beautiful invitation crafted in 5–7 days. Rush in 48hrs!",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.35)",
    bg: "#f59e0b",
  },
  {
    number: "05",
    icon: CheckCircle,
    title: "Review & Perfect",
    description: "Preview your draft, request changes. Revisions included.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.35)",
    bg: "#10b981",
  },
  {
    number: "06",
    icon: Share2,
    title: "Go Live & Share!",
    description: "Share your unique link on WhatsApp. RSVPs roll in!",
    gradient: "from-fuchsia-500 to-purple-500",
    glow: "rgba(217,70,239,0.35)",
    bg: "#d946ef",
  },
];

export function HowItWorksPreviewSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.1 });

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">

      {/* Subtle background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isHeaderInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary text-sm font-semibold">Simple 6-Step Process</span>
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            <AnimatedText text="From Inquiry to" className="justify-center" />
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            >
              Celebration
            </motion.span>
          </h2>

          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.5}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            We make creating your stunning digital invitation effortless.
            Here's how we bring your vision to life.
          </AnimatedHeading>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative max-w-6xl mx-auto mb-16">

          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-[42px] left-[8%] right-[8%] h-[2px] z-0">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4, #f59e0b, #10b981, #d946ef)" }}
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={isTimelineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                animate={isTimelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                {/* Node */}
                <div className="relative mb-5 z-10">
                  <motion.div
                    className={`w-[84px] h-[84px] rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110`}
                    style={{ boxShadow: `0 8px 30px ${step.glow}` }}
                    whileHover={{ boxShadow: `0 12px 40px ${step.glow.replace("0.35", "0.6")}` }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.5 + index * 0.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Number badge */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center text-[10px] font-black shadow-md z-10"
                    style={{ borderColor: step.bg, color: step.bg }}
                    initial={{ scale: 0 }}
                    animate={isTimelineInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 300 }}
                  >
                    {index + 1}
                  </motion.div>
                </div>

                {/* Text */}
                <motion.h3
                  className="font-bold text-foreground text-sm lg:text-[0.88rem] mb-1.5 leading-tight group-hover:text-primary transition-colors duration-300"
                >
                  {step.title}
                </motion.h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8">
              <Link to="/get-started">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Invitation
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/how-it-works" className="flex items-center gap-2">
                See Full Process
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Takes just 2 minutes to get started • WhatsApp response within 24 hours
          </motion.p>
        </motion.div>

      </div>
    </section>
  );
}
