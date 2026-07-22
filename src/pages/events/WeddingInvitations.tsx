// Rebuilt from scratch 2026-07-08.
// Structure:
//   1. CinematicHero — full-bleed wedding photo backdrop
//   2. SpecialFeaturesCarousel — the 10 wedding-only features
//   3. CommonFeaturesGrid — the 6 essentials (shared across all events)
//   4. Testimonials
//   5. Recommended package
//   6. FAQ
//   7. Final CTA
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
  Heart,
  Video,
  PartyPopper,
  Flower2,
  Users,
  UserPlus,
  Award,
  Camera,
  Bell,
  Frame,
} from "lucide-react";
import heroImg from "@/assets/hero-wedding.jpg";

// The 10 wedding-only features
const weddingSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: Heart,
    category: "Setup",
    shortLabel: "Ceremonies",
    title: "Dual-Ceremony Support",
    short: "Traditional + white wedding, one link.",
    description: "Give guests separate pages for your traditional and white wedding — with their own colours, order of service, and dress codes — while keeping everything in a single, shareable invitation.",
    tint: "from-rose-400 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "💒",
  },
  {
    n: 28, icon: Video,
    category: "Memories",
    shortLabel: "Video",
    title: "Video Guestbook",
    short: "15-second video wishes stacked on a memory reel.",
    description: "Guests record short video wishes right from the invitation. Every clip stacks into a beautiful memory reel you keep forever — even the auntie in London gets to be part of the day.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎥",
  },
  {
    n: 21, icon: PartyPopper,
    category: "Private",
    shortLabel: "Bachelor",
    title: "Bachelor / Bachelorette Page",
    short: "A separate hidden link for close friends.",
    description: "A private, unlisted page for the pre-wedding party — details, dress code, secret plans — shared only with the inner circle. Never accidentally sent to your future mother-in-law.",
    tint: "from-amber-400 to-orange-600", soft: "bg-amber-50", accent: "text-amber-700", emoji: "🎉",
  },
  {
    n: 22, icon: Flower2,
    category: "Private",
    shortLabel: "Shower",
    title: "Bridal Shower Page",
    short: "A ladies-only invite, separate from the main event.",
    description: "A dedicated shower page — softer palette, own RSVP, own gift registry — that lives inside your main invitation but stays visible only to the ladies you invite.",
    tint: "from-pink-400 to-rose-500", soft: "bg-pink-50", accent: "text-pink-700", emoji: "💐",
  },
  {
    n: 3, icon: Users,
    category: "Party",
    shortLabel: "Party",
    title: "Meet the Wedding Party",
    short: "Bridesmaids, groomsmen, ring bearers, flower girls.",
    description: "Beautiful cards for every member of the wedding party — with photos, roles, and a short note from the couple about why each person is standing with you on your day.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "👰",
  },
  {
    n: 19, icon: UserPlus,
    category: "Family",
    shortLabel: "Family",
    title: "Family Tree",
    short: "Both families, with photos and roles.",
    description: "A shared family tree section showing parents, siblings, and grandparents of both families — with photos and titles — so every guest knows exactly who's who.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "👨‍👩‍👧",
  },
  {
    n: 20, icon: Award,
    category: "Ceremony",
    shortLabel: "Minister",
    title: "Officiating Minister Bio",
    short: "Priest, pastor, imam, or family spokesperson.",
    description: "A dedicated card for whoever is leading the ceremony — with their photo, a short bio, and a personal message from the couple explaining why they matter.",
    tint: "from-blue-500 to-cyan-600", soft: "bg-blue-50", accent: "text-blue-700", emoji: "🎓",
  },
  {
    n: 23, icon: Camera,
    category: "Gallery",
    shortLabel: "Gallery",
    title: "Engagement Photos Gallery",
    short: "Your pre-wedding shoot, front and centre.",
    description: "A cinematic gallery of your engagement shoot — full-screen, tap-to-zoom, background music optional — so guests get to know your story before they show up.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📸",
  },
  {
    n: 24, icon: Bell,
    category: "Teaser",
    shortLabel: "Save Date",
    title: "Save-the-Date Teaser",
    short: "An early tease before the full invite launches.",
    description: "Send a beautiful teaser weeks or months ahead — just the date, a photo, and a countdown. Guests block their calendars early; the full invitation drops closer to the day.",
    tint: "from-yellow-400 to-amber-500", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "📅",
  },
  {
    n: 26, icon: Frame,
    category: "Guest Fun",
    shortLabel: "Frame",
    title: "Photo Booth Frame",
    short: "Custom frames for guest selfies.",
    description: "A shareable, custom-designed photo frame guests overlay on their selfies at the event — turning every guest's phone into a walking piece of your wedding branding.",
    tint: "from-fuchsia-400 to-purple-500", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🖼️",
  },
];

const testimonials = [
  { name: "Abena Owusu", location: "Accra", quote: "When I shared the link people were calling me asking who made it. The RSVP feature alone saved me so many headaches." },
  { name: "Sandra & David Nortey", location: "Tema", quote: "The countdown timer got people more excited than anything else. People were sending screenshots in the family group." },
  { name: "Afia Mensah", location: "London, UK", quote: "Planning from the UK for a Ghana event was stressful. VibeLink made the invitation side effortless." },
];

const faqs = [
  { question: "How long does a wedding invitation take?", answer: "Standard delivery is 5–7 business days. Rush delivery in 48 hours is available at an additional fee." },
  { question: "Can guests RSVP through the invitation?", answer: "Yes. Guests click RSVP, fill a short form, and you see all responses in real time — guest count, meal preferences and messages." },
  { question: "Can both ceremony and reception have separate maps?", answer: "Yes. We add Google Maps for every venue — guests tap and navigate directly from the invitation." },
  { question: "Can family abroad access it?", answer: "Absolutely. The link works on any device anywhere. You can also embed a livestream so they can watch the ceremony live." },
  { question: "Can I update details after it goes live?", answer: "Yes. If venue or time changes, we update it immediately. The link stays the same so you don't need to reshare." },
];

export default function WeddingInvitations() {
  return (
    <Layout>
      <SEO
        title="Wedding Invitations Ghana — Digital, Live & Interactive"
        description="Stop sending JPEGs. VibeLink creates live, interactive wedding invitations for Ghanaian couples — dual-ceremony support, video guestbook, bridal shower & bachelor pages, live countdown, RSVP tracking. One link. Every guest."
        keywords="digital wedding invitations Ghana, wedding invitation link WhatsApp, RSVP wedding Ghana, interactive wedding invite Accra, traditional white wedding invitation"
        canonical="/wedding-invitations"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian wedding celebration"
        imageObjectPos="center 15%"
        chip="For Ghanaian Weddings"
        heading="Your Wedding."
        headingHighlight="One Perfect Link."
        subheading="Traditional. White. Both. Every guest, every moment, every detail — held together by a single, beautiful invitation."
        primaryCta={{ label: "Start Your Wedding Invitation", href: "/get-started?eventType=Wedding" }}
        secondaryCta={{ label: "See Wedding Examples", href: "/portfolio?type=wedding" }}
        trustRow={["200+ Ghanaian couples", "10+ countries reached", "One link · every guest"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={weddingSpecialFeatures}
        chip="Wedding-only features"
        heading="Built for Ghanaian Weddings"
        subheading="Ten features you won't find on any generic invitation platform — each one built around how Ghanaian families actually celebrate."
      />

      {/* 3. Common features grid — the six essentials */}
      <CommonFeaturesGrid
        chip="Also included in every wedding invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials — swipeable on mobile */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From couples who chose VibeLink"
        subheading="Real feedback from real Ghanaian weddings."
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-rose-100 text-rose-700">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Prestige Vibe — GHS 2,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Most couples choose Prestige — it includes photo gallery, RSVP tracking, MoMo donation link, video integration and 5 revisions. For larger weddings with custom domain, Royal Vibe is the one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                <Link to="/get-started?eventType=Wedding">
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
            intro="Hi 👋 Here are the top questions couples ask about wedding invitations — tap one to see the answer."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Your guests deserve better than a JPEG.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Live, interactive and unforgettable. Weddings from GHS 1,000.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-2xl shadow-rose-900/30"
            >
              <Link to="/get-started?eventType=Wedding">
                Create My Invitation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Draft in 24 hours · Money-back guarantee</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
