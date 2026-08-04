import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star } from "lucide-react";
import SEO, { createFAQSchema } from "@/components/SEO";
import { WhatsAppFAQ } from "@/components/WhatsAppFAQ";

export interface EventFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface EventTestimonial {
  name: string;
  location: string;
  quote: string;
}

export interface EventFaq {
  q: string;
  a: string;
}

export interface EventPageConfig {
  // SEO
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
  canonical: string;
  // Content
  eventLabel: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  heroSubheading: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  heroImageObjectPos?: string;
  // Colors — watercolour blobs
  blob1Color: string;
  blob2Color: string;
  blob3Color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  highlightGradient: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  cardTopGradient: string;
  ctaBtnClass: string;
  ctaBtnShadow: string;
  // Features
  features: EventFeature[];
  // Recommendation
  recommendedPackage: string;
  recommendedDesc: string;
  // Testimonials
  testimonials: EventTestimonial[];
  // FAQs
  faqs: EventFaq[];
  // CTA
  ctaHeadline: string;
  getStartedEventType: string;
}

interface Props {
  config: EventPageConfig;
}

export function EventPageTemplate({ config }: Props) {

  return (
    <Layout>
      <SEO
        title={config.seoTitle}
        description={config.seoDesc}
        keywords={config.seoKeywords}
        canonical={config.canonical}
        ogImage="https://vibelinkevent.com/og-image.jpg"
        jsonLd={
          config.faqs.length > 0
            ? createFAQSchema(config.faqs.map((f) => ({ question: f.q, answer: f.a })))
            : undefined
        }
      />

      {/* ── HERO ── */}
      <section className="min-height-screen relative overflow-hidden flex items-center justify-center text-center py-32 lg:py-40"
        style={{ background: "linear-gradient(145deg,#fefcff 0%,#fdf4ff 50%,#fffbf0 100%)", minHeight: "100vh" }}>
        {/* Watercolour blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{
            width: "550px", height: "380px", background: config.blob1Color,
            filter: "blur(80px)", opacity: 0.18, top: "-80px", left: "-120px",
            animation: "morphBlob1 14s ease-in-out infinite",
            borderRadius: "60% 40% 50% 70% / 50% 60% 40% 50%"
          }} />
          <div className="absolute rounded-full" style={{
            width: "450px", height: "320px", background: config.blob2Color,
            filter: "blur(80px)", opacity: 0.16, bottom: "-60px", right: "-80px",
            animation: "morphBlob2 16s ease-in-out infinite reverse",
            borderRadius: "40% 60% 70% 30% / 60% 30% 70% 40%"
          }} />
          <div className="absolute rounded-full" style={{
            width: "280px", height: "220px", background: config.blob3Color,
            filter: "blur(70px)", opacity: 0.12, top: "40%", left: "55%",
            animation: "morphBlob3 11s ease-in-out infinite 2s",
            borderRadius: "70% 30% 40% 60% / 30% 70% 50% 60%"
          }} />
        </div>

        <style>{`
          @keyframes morphBlob1 {
            0%,100% { border-radius: 60% 40% 50% 70% / 50% 60% 40% 50%; transform: scale(1) rotate(0deg); }
            33% { border-radius: 40% 60% 70% 30% / 60% 30% 70% 40%; transform: scale(1.05) rotate(4deg); }
            66% { border-radius: 70% 30% 40% 60% / 30% 70% 50% 60%; transform: scale(0.95) rotate(-3deg); }
          }
          @keyframes morphBlob2 {
            0%,100% { border-radius: 40% 60% 70% 30% / 60% 30% 70% 40%; transform: scale(1) rotate(0deg); }
            33% { border-radius: 70% 30% 40% 60% / 30% 70% 50% 60%; transform: scale(1.08) rotate(-5deg); }
            66% { border-radius: 60% 40% 50% 70% / 50% 60% 40% 50%; transform: scale(0.92) rotate(3deg); }
          }
          @keyframes morphBlob3 {
            0%,100% { border-radius: 50% 50% 60% 40% / 40% 60% 40% 60%; transform: scale(1); }
            50% { border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%; transform: scale(1.1); }
          }
        `}</style>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: config.badgeBg, border: `1px solid ${config.badgeBorder}`, color: config.badgeText }}>
              {config.eventLabel}
            </span>

            {/* Image */}
            <div className="relative w-full max-w-2xl mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: `0 30px 80px ${config.blob1Color.replace("linear-gradient(135deg,", "").split(",")[0]}40` }}>
              <img src={config.heroImage} alt={config.heroImageAlt}
                className="w-full h-64 md:h-80 object-cover"
                style={{ objectPosition: config.heroImageObjectPos ?? "center" }}
                loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Heading */}
            <h1 className="font-bold mb-4 leading-tight" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)" }}>
              <span className="text-gray-900">{config.heroHeading}{" "}</span>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: config.highlightGradient }}>
                {config.heroHeadingHighlight}
              </span>
            </h1>
            <p className="text-gray-500 text-lg font-light mb-3">{config.heroSubheading}</p>
            <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed mb-8">{config.heroDescription}</p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {config.features.slice(0, 8).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-default transition-all hover:scale-105"
                  style={{ background: config.pillBg, border: `1px solid ${config.pillBorder}`, color: config.pillText }}>
                  <span>{f.icon}</span> {f.title}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold px-8 text-white"
                style={{ background: config.highlightGradient, boxShadow: config.ctaBtnShadow }}>
                <Link to={`/get-started?eventType=${encodeURIComponent(config.getStartedEventType)}`}>
                  Create My Invitation <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link to="/portfolio">See Real Examples</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Everything packed into{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: config.highlightGradient }}>
                one link
              </span>
            </h2>
            <p className="text-gray-500 text-lg">Every feature your guests need — nothing they don't.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {config.features.map((feature, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-default relative overflow-hidden"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: config.cardTopGradient }} />
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">{feature.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 lg:py-28" style={{ background: "linear-gradient(135deg,#fefcff,#fdf4ff,#fffbf0)" }}>
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What clients say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {config.testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED PACKAGE ── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: config.pillBg, color: config.pillText }}>
              Our Recommendation
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.recommendedPackage}</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">{config.recommendedDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white"
                style={{ background: config.highlightGradient }}>
                <Link to={`/get-started?eventType=${encodeURIComponent(config.getStartedEventType)}`}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">Compare All Packages</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ (WhatsApp chat) ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked</h2>
            <p className="text-gray-500 text-sm">Tap a question — we'll reply below</p>
          </motion.div>
          <WhatsAppFAQ
            faqs={config.faqs.map((f) => ({ question: f.q, answer: f.a }))}
            intro="Hi 👋 Here are the top questions about this service — tap one to see the answer."
          />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#fefcff,#fdf4ff,#fffbf0)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width: "400px", height: "300px", background: config.blob1Color, filter: "blur(60px)", opacity: 0.2, top: "-50px", right: "-100px", borderRadius: "60% 40% 50% 70% / 50% 60% 40% 50%" }} />
          <div className="absolute rounded-full" style={{ width: "350px", height: "250px", background: config.blob2Color, filter: "blur(60px)", opacity: 0.15, bottom: "-50px", left: "-80px", borderRadius: "40% 60% 70% 30% / 60% 30% 70% 40%" }} />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {config.ctaHeadline}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
              Live, interactive and unforgettable. Packages starting from GHS 1,200.
            </p>
            <Button asChild size="lg" className="font-bold text-white px-10 py-6 text-lg"
              style={{ background: config.highlightGradient, boxShadow: config.ctaBtnShadow }}>
              <Link to={`/get-started?eventType=${encodeURIComponent(config.getStartedEventType)}`}>
                Create My Invitation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-400 text-sm mt-4">Free consultation · Standard 5–7 days · 48h Rush +GHS 300 · Full deposit refund before design begins</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
