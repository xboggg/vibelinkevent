// Rebuilt from scratch 2026-07-10 — matches /wedding-invitations pattern.
// Palette: sky/cyan/mint — soft, tender, celebratory but not clichéd baby-blue.
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
  Timer,
  Heart,
  HandHeart,
  Sparkles,
  Wallet,
  Cross,
  ClipboardList,
  Frame,
  Video,
  MapPin,
} from "lucide-react";
import heroImg from "@/assets/hero-naming.jpg";

const namingSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: Timer,
    category: "The Big Moment",
    shortLabel: "Reveal",
    title: "Baby Name Reveal Countdown",
    short: "A separate countdown just for the name.",
    description: "A dedicated mini-countdown ticking to the exact moment baby's name is announced — building anticipation for family and friends waiting to hear it, whether they're in Accra or the diaspora.",
    tint: "from-sky-400 to-cyan-500", soft: "bg-sky-50", accent: "text-sky-700", emoji: "⏳",
  },
  {
    n: 9, icon: Heart,
    category: "Parents",
    shortLabel: "Parents",
    title: "Meet the Parents Card",
    short: "Meet mum and dad, and their journey.",
    description: "A gentle card introducing baby's parents — photos, names, and their short story about becoming parents. Guests feel connected to the family behind the celebration.",
    tint: "from-rose-400 to-pink-500", soft: "bg-rose-50", accent: "text-rose-700", emoji: "💗",
  },
  {
    n: 16, icon: HandHeart,
    category: "Prayers",
    shortLabel: "Prayers",
    title: "Prayers for Baby",
    short: "A wall of blessings from every guest.",
    description: "Guests leave written prayers directly on the invitation — for baby's health, protection, wisdom, and future. Every prayer is kept forever, so baby grows up knowing they were prayed for from day one.",
    tint: "from-amber-400 to-orange-500", soft: "bg-amber-50", accent: "text-amber-700", emoji: "🙏",
  },
  {
    n: 17, icon: Sparkles,
    category: "Wishes",
    shortLabel: "Wishes",
    title: "Wishes for Baby's Future",
    short: "What every guest hopes for baby's life ahead.",
    description: "A dedicated wall where family and friends write their hopes for baby's future — success, joy, kindness, whatever their hearts wish. A gift baby unwraps when they can read.",
    tint: "from-fuchsia-400 to-purple-500", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🌟",
  },
  {
    n: 19, icon: Wallet,
    category: "Gifts",
    shortLabel: "MoMo",
    title: "Cash Gift via MoMo",
    short: "MTN, Telecel, AirtelTigo — for baby's future.",
    description: "Guests contribute cash gifts directly via Mobile Money — MTN, Telecel or AirtelTigo — with real-time tracking. Perfect for family who couldn't attend but want to support.",
    tint: "from-yellow-400 to-amber-500", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "💰",
  },
  {
    n: 25, icon: Cross,
    category: "Officiant",
    shortLabel: "Pastor",
    title: "Officiating Pastor / Priest Bio",
    short: "Who's blessing baby, and why.",
    description: "A dedicated card for the pastor, priest, or imam leading the dedication — with their photo, a short bio, and a personal note from the family explaining why they matter.",
    tint: "from-blue-500 to-indigo-600", soft: "bg-blue-50", accent: "text-blue-700", emoji: "⛪",
  },
  {
    n: 26, icon: ClipboardList,
    category: "Service",
    shortLabel: "Order",
    title: "Church Service Order",
    short: "The full dedication programme, at a glance.",
    description: "A beautifully laid-out order of service — welcome, hymns, scripture, dedication prayer, blessing — so guests know exactly what to expect and can follow along.",
    tint: "from-cyan-500 to-teal-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📜",
  },
  {
    n: 31, icon: Frame,
    category: "Guest Fun",
    shortLabel: "Frame",
    title: "Photo Booth Frame",
    short: "Custom 'It's a baby!' selfie frames.",
    description: "A shareable, custom-designed photo frame guests overlay on their selfies at the ceremony — turning every guest's phone into a walking piece of baby's outdooring day.",
    tint: "from-pink-400 to-fuchsia-500", soft: "bg-pink-50", accent: "text-pink-700", emoji: "🖼️",
  },
  {
    n: 33, icon: Video,
    category: "Memories",
    shortLabel: "Video",
    title: "Video Guestbook",
    short: "15-second video wishes for baby.",
    description: "Guests record short video wishes right from the invitation — grandma in London, cousin in New York, the whole family — all stacked into a memory reel baby watches when they grow up.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎥",
  },
  {
    n: 39, icon: MapPin,
    category: "Location",
    shortLabel: "Home",
    title: "Directions to Family Home",
    short: "One-tap navigation for the after-ceremony gathering.",
    description: "A Google Maps pin for the family home where the after-ceremony gathering happens — with parking notes, landmarks, and one-tap Uber/Bolt/Yango booking.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "🏡",
  },
];

const testimonials = [
  { name: "Kwame & Adwoa Sarpong", location: "Kumasi", quote: "The name reveal countdown had our family in London refreshing the page every minute. When the name dropped, everyone screamed on the WhatsApp group." },
  { name: "Mrs. Efua Boateng", location: "Accra", quote: "Reading through the prayers guests left for our son still makes me cry. We're saving them so he can read them when he's older." },
  { name: "Yaw Owusu", location: "Toronto, Canada", quote: "I couldn't fly home but the video guestbook let me record my blessing. My daughter will grow up knowing her uncle was there — even from thousands of miles away." },
];

const faqs = [
  { question: "How long does a naming ceremony invitation take?", answer: "Standard delivery is 3–5 business days. Rush delivery in 24 hours is available for a small additional fee." },
  { question: "Can we keep the baby's name hidden until the day?", answer: "Yes. The name reveal countdown ticks down to the exact moment — and the name only unlocks on the invitation on the ceremony day itself." },
  { question: "Can we accept MoMo cash gifts?", answer: "Yes. Guests contribute directly via MTN, Telecel or AirtelTigo — tracked in real-time on your host dashboard." },
  { question: "Can family abroad watch the dedication?", answer: "Yes. We embed a livestream for grandparents and family abroad. The link works on any phone, anywhere." },
  { question: "Can I update details after it goes live?", answer: "Yes. Any change to venue, time, or dress code is updated once and every guest sees the latest instantly." },
];

export default function NamingCeremony() {
  return (
    <Layout>
      <SEO
        title="Naming & Outdooring Invitations Ghana — Digital Ceremony Pages"
        description="Beautiful digital naming and outdooring invitations for Ghanaian families. Baby name reveal countdown, prayers wall, MoMo gifts, video guestbook, church service order — one link, every guest."
        keywords="naming ceremony invitations Ghana, outdooring invite Ghana, baby dedication invitation, christening invitation Accra, digital naming ceremony card"
        canonical="/naming-ceremony"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian naming ceremony"
        imageObjectPos="center 25%"
        chip="For Ghanaian Naming Ceremonies"
        heading="A New Name."
        headingHighlight="Every Blessing."
        subheading="From the outdooring to the dedication — countdown, prayers, blessings, and memories for baby's first big moment. One link, every family member."
        primaryCta={{ label: "Start Baby's Invitation", href: "/get-started?eventType=Naming" }}
        secondaryCta={{ label: "See Ceremony Examples", href: "/portfolio?type=naming" }}
        trustRow={["8-day countdown from birth", "Din To tradition explainer", "Every prayer, kept forever"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={namingSpecialFeatures}
        chip="Naming-only features"
        heading="Built for Ghanaian Outdoorings"
        subheading="Ten features that turn the day into a keepsake — from the name reveal countdown to the video wishes baby will one day watch."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every naming invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From families who chose VibeLink"
        subheading="Real feedback from real Ghanaian naming ceremonies."
        accentClass="from-sky-50/60 via-white to-cyan-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-sky-100 text-sky-700">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Naming &amp; Outdooring Package — GHS 1,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Built for the 8-day naming ceremony (Din To) — auto-countdown from birth, baby photo gallery, RSVP, parents' story, tradition explainer for international family, background music, and program timeline. Add-ons available for libation ceremony order, extended tradition explainer, and baby time capsule.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700">
                <Link to="/get-started?eventType=Naming">
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
            intro="Hi 👋 Here are the top questions parents ask us about naming ceremony invitations."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Welcome baby to the world — in style.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital invitation baby will one day watch back — prayers, blessings, and every family voice, kept forever. Starting from GHS 1,500.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-2xl shadow-sky-900/30"
            >
              <Link to="/get-started?eventType=Naming">
                Create Baby's Invitation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Standard 5–7 days · 48h Rush +GHS 300 · Full deposit refund before design begins</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
