// Rebuilt from scratch 2026-07-09 — matches /wedding-invitations pattern.
// Palette intentionally muted (slate/stone/deep blue) — this is a dignity page.
// Copy tone honours grief without selling excitement.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { WhatsAppFAQ } from "@/components/WhatsAppFAQ";
import { CinematicHero } from "@/components/events/CinematicHero";
import { SpecialFeaturesCarousel, type SpecialFeature } from "@/components/events/SpecialFeaturesCarousel";
import { CommonFeaturesGrid } from "@/components/events/CommonFeaturesGrid";
import { EventTestimonials } from "@/components/events/EventTestimonials";
import {
  BookOpen,
  ScrollText,
  Quote,
  MapPin,
  MessageSquare,
  Users,
  Flame,
  Images,
  HandHeart,
  CalendarClock,
} from "lucide-react";
import heroImg from "@/assets/hero-funeral.jpg";

const funeralSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: BookOpen,
    category: "Obituary",
    shortLabel: "Obituary",
    title: "Obituary Section",
    short: "The formal life story, presented with dignity.",
    description: "A dedicated obituary section — dates of birth and passing, immediate family, the story of a life well lived. Laid out with the respect this moment deserves.",
    tint: "from-slate-600 to-slate-800", soft: "bg-slate-50", accent: "text-slate-700", emoji: "🕊️",
  },
  {
    n: 3, icon: ScrollText,
    category: "Life Story",
    shortLabel: "Biography",
    title: "Full Biography Page",
    short: "Education, career, communities served — a life honoured in full.",
    description: "A separate, longer biography page — the extended story of their journey: schooling, work, family, achievements. So future generations remember who they truly were.",
    tint: "from-stone-600 to-stone-800", soft: "bg-stone-50", accent: "text-stone-700", emoji: "📖",
  },
  {
    n: 7, icon: Quote,
    category: "Wisdom",
    shortLabel: "Quotes",
    title: "Quotes from the Departed",
    short: "Their favourite sayings, kept alive.",
    description: "A gentle section for the sayings, prayers, or wisdom they lived by — the words family and friends remember most. Displayed with quiet reverence.",
    tint: "from-amber-700 to-amber-900", soft: "bg-amber-50", accent: "text-amber-800", emoji: "💬",
  },
  {
    n: 14, icon: MapPin,
    category: "Location",
    shortLabel: "Grave",
    title: "Grave-Location Map",
    short: "A quiet pin for those who wish to visit.",
    description: "A Google Maps pin for the resting place — for family and friends who want to visit in the days, months, or years that follow. Kept respectfully at the bottom of the page.",
    tint: "from-emerald-700 to-teal-800", soft: "bg-emerald-50", accent: "text-emerald-800", emoji: "📍",
  },
  {
    n: 19, icon: MessageSquare,
    category: "Condolences",
    shortLabel: "Wall",
    title: "Condolence Wall",
    short: "Written words of comfort, from every guest.",
    description: "Guests leave written condolences directly on the invitation — messages of comfort, memories, blessings for the family. Every word is preserved for the family to read again in the years to come.",
    tint: "from-blue-700 to-indigo-800", soft: "bg-blue-50", accent: "text-blue-800", emoji: "🤍",
  },
  {
    n: 22, icon: Users,
    category: "Tributes",
    shortLabel: "Tributes",
    title: "Tributes from Friends",
    short: "Colleagues, church members, and community, honoured.",
    description: "A dedicated page where colleagues, church members, old classmates and communities can post their tributes — organised so nothing is lost in a WhatsApp group thread.",
    tint: "from-purple-700 to-indigo-800", soft: "bg-purple-50", accent: "text-purple-800", emoji: "🙏",
  },
  {
    n: 23, icon: Flame,
    category: "Ritual",
    shortLabel: "Candle",
    title: "Light a Candle",
    short: "A quiet, symbolic tap.",
    description: "A gentle 'light a candle' button — a small, symbolic gesture guests tap to leave a virtual candle burning on the memorial page. A quiet way to say 'I'm with you.'",
    tint: "from-orange-600 to-amber-700", soft: "bg-orange-50", accent: "text-orange-800", emoji: "🕯️",
  },
  {
    n: 24, icon: Images,
    category: "Memories",
    shortLabel: "Photos",
    title: "Memorial Photo Submissions",
    short: "Every guest can add their own memories.",
    description: "Guests upload their own photos of the departed — moments the family never saw, captured by friends over the years. All gathered in one honouring archive.",
    tint: "from-rose-700 to-pink-800", soft: "bg-rose-50", accent: "text-rose-800", emoji: "🖼️",
  },
  {
    n: 25, icon: HandHeart,
    category: "Support",
    shortLabel: "Donations",
    title: "Donation Link (MoMo)",
    short: "Support the family through Mobile Money.",
    description: "Guests contribute directly via MTN, Telecel or AirtelTigo to help the family with funeral expenses — kept private, tracked in real-time. Because grief shouldn't come with financial pressure.",
    tint: "from-teal-700 to-cyan-800", soft: "bg-teal-50", accent: "text-teal-800", emoji: "🤝",
  },
  {
    n: 31, icon: CalendarClock,
    category: "Remembrance",
    shortLabel: "1-Year",
    title: "1-Year Anniversary Memorial Page",
    short: "The yearly remembrance, kept alive.",
    description: "A dedicated one-year memorial section that surfaces on the anniversary of their passing — with a photo, a prayer, and a way for family to gather again. So they are never forgotten.",
    tint: "from-indigo-700 to-blue-800", soft: "bg-indigo-50", accent: "text-indigo-800", emoji: "🌹",
  },
];

const testimonials = [
  { name: "The Owusu Family", location: "Kumasi", quote: "During such a painful time, having one link to send to everyone was a relief. The condolence wall meant we didn't miss a single message." },
  { name: "Mrs. Adjoa Mensah", location: "Accra", quote: "My father would have loved his biography page. Family who couldn't travel from abroad said it felt like they were with us." },
  { name: "Kofi Boadu", location: "London, UK", quote: "The livestream and the 1-year memorial page have given my mother's memory a place that lives on. Thank you." },
];

const faqs = [
  { question: "How quickly can a funeral program be delivered?", answer: "We deliver in 24–48 hours for funeral programs — we understand time is short. Rush requests are prioritised without extra fees." },
  { question: "Can we keep it dignified and simple?", answer: "Yes. The design uses muted tones (no bright colours, no confetti). Every element is chosen to honour rather than distract." },
  { question: "Can family abroad watch the burial?", answer: "Yes. We embed a livestream of the service and burial for family who cannot travel. The link works on any phone, anywhere." },
  { question: "Will the page stay online after the funeral?", answer: "Yes. Memorial pages remain online with an optional annual renewal, so the family can revisit and remember on the 1-year anniversary and beyond." },
  { question: "Can we accept donations to help with expenses?", answer: "Yes. A MoMo donation link (MTN, Telecel, AirtelTigo) can be added privately — tracked in real-time." },
];

export default function FuneralPrograms() {
  return (
    <Layout>
      <SEO
        title="Funeral Programs Ghana — Dignified Digital Memorial Pages"
        description="Dignified digital funeral programs and memorial pages for Ghanaian families. Obituary, condolence wall, tributes, MoMo donations, livestream, 1-year memorial — all in one respectful link."
        keywords="digital funeral programs Ghana, memorial page Ghana, funeral invitation Accra, online tribute page, obituary Ghana, condolence wall"
        canonical="/funeral-programs"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero — muted overlay */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian memorial service"
        imageObjectPos="center 30%"
        chip="For Ghanaian Families"
        heading="A Life Well Lived."
        headingHighlight="Honoured With Dignity."
        subheading="A quiet, respectful memorial page for the ones we love — obituary, condolences, tributes, and remembrance, all held together in one gentle link."
        primaryCta={{ label: "Create a Memorial Page", href: "/get-started?eventType=Funeral" }}
        secondaryCta={{ label: "See Memorial Examples", href: "/portfolio?type=funeral" }}
        trustRow={["Nsawa MoMo tracker", "Livestream for diaspora", "One-week · 40-day · 1-year"]}
        overlayGradient="linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.65) 45%, rgba(15,23,42,0.5) 100%)"
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={funeralSpecialFeatures}
        chip="Memorial-only features"
        heading="Honouring a Life, Fully"
        subheading="Ten features shaped around how Ghanaian families remember — from the obituary to the 1-year memorial, each one built to preserve, not distract."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every memorial page"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink page ships with — no matter the occasion."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From families who chose VibeLink"
        subheading="Words shared with us in the hardest of moments."
        accentClass="from-slate-100/60 via-white to-blue-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-slate-100 text-slate-700">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Funeral &amp; Memorial Package — GHS 2,000</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              A dignified digital tribute with full obituary, biography, condolence wall, MoMo Nsawa tracker, livestream for diaspora, 15-photo tribute gallery, and auto-remembrance at one-week, 40-day and 1-year. For families needing a custom domain, voice tribute wall or full life-story chapters, upgrade to Bespoke (from GHS 4,500).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black">
                <Link to="/get-started?eventType=Funeral">
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

      {/* 6. FAQ */}
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Frequently Asked</h2>
            <p className="text-muted-foreground text-sm md:text-base">Tap a question — we'll reply below.</p>
          </motion.div>
          <WhatsAppFAQ
            faqs={faqs}
            intro="Hi — we know this is a difficult moment. Here are the answers families most often ask us."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              A memorial that lasts. Not just for a day.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A dignified digital tribute that lives on — and returns to remind the family every year. Starting from GHS 2,000.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black shadow-2xl shadow-slate-900/30"
            >
              <Link to="/get-started?eventType=Funeral">
                Create a Memorial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Delivered within 48 hours · Preserved forever</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
