// Rebuilt from scratch 2026-07-10 — matches /wedding-invitations pattern.
// Palette: royal purple + gold + warm white — reverent, church-worthy.
// Note: 15 special features (not 10) — carousel auto-flows to 3x5 grid.
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
  Mic,
  UserCircle,
  ClipboardList,
  BookOpen,
  Sparkles,
  CalendarDays,
  Music,
  Users,
  ShieldCheck,
  Video,
  HandHeart,
  Radio,
  Images,
  UserPlus,
  Bell,
} from "lucide-react";
import heroImg from "@/assets/hero-church.jpg";

const churchSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: Mic,
    category: "The Message",
    shortLabel: "Sermon",
    title: "Sermon Topic + Preacher Bio",
    short: "The Word of the day, and who's bringing it.",
    description: "A dedicated section for the sermon topic — the anchor thought, the resident pastor's photo, bio, and a preview of what the Lord will minister through them.",
    tint: "from-purple-600 to-indigo-700", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎤",
  },
  {
    n: 2, icon: UserCircle,
    category: "Guest Minister",
    shortLabel: "Guest",
    title: "Guest Minister Bio",
    short: "The visiting speaker, properly introduced.",
    description: "A featured card for the guest minister — photo, ministry name, a short testimony of God's work through them. So congregants come expectant of what God will do.",
    tint: "from-amber-500 to-yellow-600", soft: "bg-amber-50", accent: "text-amber-800", emoji: "✝️",
  },
  {
    n: 3, icon: ClipboardList,
    category: "Order",
    shortLabel: "Programme",
    title: "Order of Service",
    short: "Opening → worship → offering → Word → altar call.",
    description: "The full timed order of service laid out beautifully — arrival, praise & worship, offering, sermon, altar call, benediction. So every congregant flows with the service.",
    tint: "from-blue-600 to-indigo-700", soft: "bg-blue-50", accent: "text-blue-800", emoji: "📋",
  },
  {
    n: 4, icon: BookOpen,
    category: "Scripture",
    shortLabel: "Anchor",
    title: "Scripture Theme / Anchor Verse",
    short: "The Word that carries the day.",
    description: "The anchor scripture displayed as the visual centrepiece — the verse that carries the service, styled beautifully so congregants meditate on it before, during and after.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-800", emoji: "📖",
  },
  {
    n: 6, icon: Sparkles,
    category: "Prophetic",
    shortLabel: "Season",
    title: "Word for the Season",
    short: "The prophetic word carried for the year.",
    description: "The prophetic declaration for the season — the year's theme, the church's direction, the promise God has given the house. Displayed with reverence and clarity.",
    tint: "from-fuchsia-500 to-purple-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🕊️",
  },
  {
    n: 9, icon: CalendarDays,
    category: "Multi-Day",
    shortLabel: "Days",
    title: "Multi-Day Programme",
    short: "Day 1 · Day 2 · Day 3 · and beyond.",
    description: "For conventions, revivals, camps and week-long events — a clear day-by-day breakdown with themes, ministers, and session times. So attendees plan every day well.",
    tint: "from-rose-500 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "📅",
  },
  {
    n: 12, icon: Music,
    category: "Choir",
    shortLabel: "Choir",
    title: "Choir & Praise Team Lineup",
    short: "Mass choir, worship team, guest artists.",
    description: "A dedicated lineup of the choir, worship team, and any guest gospel artists ministering — with names, photos, and the sets they'll be leading.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "🎵",
  },
  {
    n: 14, icon: Users,
    category: "Pastoral",
    shortLabel: "Pastors",
    title: "Pastoral Team Spotlight",
    short: "Every pastor, honoured with a card.",
    description: "The full pastoral team on display — senior pastor, associate pastors, youth pastor, women's ministry lead — each with a photo, name and area of ministry.",
    tint: "from-indigo-600 to-purple-700", soft: "bg-indigo-50", accent: "text-indigo-800", emoji: "👨‍👩‍👧‍👦",
  },
  {
    n: 15, icon: ShieldCheck,
    category: "Ushers",
    shortLabel: "Ushers",
    title: "Ushers & Protocol Team Info",
    short: "Who to look for on the day.",
    description: "Meet the head usher, protocol officers and welcome team — so first-timers and members alike know exactly who to approach for anything they need.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "🛡️",
  },
  {
    n: 16, icon: Video,
    category: "Media",
    shortLabel: "Media",
    title: "Media / Livestream Team Credits",
    short: "The hands behind every broadcast.",
    description: "A section honouring the media, sound, camera and livestream team — the servants who make it possible for every member and diaspora watcher to receive the service.",
    tint: "from-slate-600 to-slate-800", soft: "bg-slate-50", accent: "text-slate-700", emoji: "🎥",
  },
  {
    n: 17, icon: HandHeart,
    category: "Giving",
    shortLabel: "Seed",
    title: "Offering / Seed Link (MoMo)",
    short: "MTN, Vodafone, AirtelTigo — sow live.",
    description: "A direct Mobile Money giving link right on the invitation — MTN, Vodafone, AirtelTigo — so members can sow their seed during the service or from wherever they are. Tracked in real-time.",
    tint: "from-yellow-500 to-orange-600", soft: "bg-yellow-50", accent: "text-yellow-800", emoji: "🌱",
  },
  {
    n: 38, icon: Radio,
    category: "Livestream",
    shortLabel: "Livestream",
    title: "YouTube / Facebook Live Embed",
    short: "Watch the service from anywhere.",
    description: "The official YouTube or Facebook Live stream embedded right on the invitation page — one tap and members abroad or at home join the service, no app-hopping.",
    tint: "from-red-500 to-rose-600", soft: "bg-red-50", accent: "text-red-700", emoji: "📺",
  },
  {
    n: 41, icon: Images,
    category: "After",
    shortLabel: "Gallery",
    title: "Photo Gallery of the Event",
    short: "The curated album, shared after.",
    description: "A curated photo gallery from the event — the worship moments, the altar call, the after-service fellowship — shared with every member and first-timer via the same link.",
    tint: "from-pink-500 to-rose-600", soft: "bg-pink-50", accent: "text-pink-700", emoji: "📸",
  },
  {
    n: 43, icon: UserPlus,
    category: "First-Timers",
    shortLabel: "New Guests",
    title: "First-Timer Follow-Up Form",
    short: "Capture every new visitor gently.",
    description: "A dedicated first-timer form built into the invitation — name, contact, prayer request. So the follow-up team can reach out with love in the days after the service.",
    tint: "from-teal-500 to-emerald-600", soft: "bg-teal-50", accent: "text-teal-700", emoji: "🤝",
  },
  {
    n: 44, icon: Bell,
    category: "What's Next",
    shortLabel: "Next Event",
    title: "Next Event Announcement",
    short: "The next big date, already teased.",
    description: "A teaser card for the next major event — anniversary service, convention, or crusade — so momentum carries members from one moment of encounter to the next.",
    tint: "from-orange-500 to-red-600", soft: "bg-orange-50", accent: "text-orange-700", emoji: "🔔",
  },
];

const testimonials = [
  { name: "Pastor Kwame Owusu", location: "Accra — Harvest Service", quote: "The MoMo seed link tripled our offering compared to the previous harvest. Members overseas contributed for the first time, right from their phones." },
  { name: "Rev. Dr. Ama Boateng", location: "Kumasi — Convention", quote: "For our 3-day convention the multi-day programme kept every congregant on the same page. We saw record attendance across all sessions." },
  { name: "Deaconess Efua Mensah", location: "Tema — Anniversary", quote: "The first-timer follow-up form captured 47 new souls in one Sunday. Our follow-up team was thanking God — and thanking VibeLink." },
];

const faqs = [
  { question: "Can you match our church colours and theme?", answer: "Yes. We colour-match to your church's palette — royal purple, deep blue, kente-gold, or any theme you're running for the season." },
  { question: "How long does a church event invitation take?", answer: "Standard delivery is 4–6 business days. Rush delivery in 48 hours is available at an additional fee." },
  { question: "Can we accept MoMo offerings and seed?", answer: "Yes. A dedicated Mobile Money giving link — MTN, Vodafone, AirtelTigo — is embedded right on the invitation. Every seed is tracked and reported to the finance team." },
  { question: "Can members abroad join the service?", answer: "Yes. YouTube Live, Facebook Live, or Zoom — we embed whatever platform your church uses so diaspora members join with one tap." },
  { question: "Can we update details after it goes live?", answer: "Yes. Any change to venue, time, guest minister, or programme is updated once and every member sees the latest instantly." },
];

export default function ChurchEvents() {
  return (
    <Layout>
      <SEO
        title="Church Event Invitations Ghana — Harvest, Convention, Anniversary Services"
        description="Digital invitations for Ghanaian church events — harvests, thanksgivings, conventions, anniversaries. Sermon topic, guest minister bios, MoMo offering, livestream, first-timer follow-up. One link, every member."
        keywords="church event invitations Ghana, harvest service invite, convention invitation Ghana, church anniversary programme, digital church invite Accra, MoMo offering link"
        canonical="/church-events"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian church service"
        imageObjectPos="center 30%"
        chip="For Ghanaian Church Events"
        heading="Beyond the Noticeboard."
        headingHighlight="Every Member Reached."
        subheading="Harvest. Thanksgiving. Convention. Anniversary. A dignified digital programme with sermon, offering, livestream, and follow-up — held together in one respectful link."
        primaryCta={{ label: "Start Your Church Invite", href: "/get-started?eventType=Church" }}
        secondaryCta={{ label: "See Church Examples", href: "/portfolio?type=church" }}
        trustRow={["50+ Ghanaian churches served", "Harvest · Convention · Anniversary", "Every member, one link"]}
        overlayGradient="linear-gradient(90deg, rgba(31,17,63,0.85) 0%, rgba(31,17,63,0.6) 45%, rgba(31,17,63,0.3) 100%)"
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={churchSpecialFeatures}
        chip="Church-only features"
        heading="Built for the House of God"
        subheading="Fifteen features shaped around how Ghanaian churches run their biggest services — from the sermon topic to the first-timer follow-up form."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every church invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From churches who chose VibeLink"
        subheading="Real feedback from real Ghanaian ministries."
        accentClass="from-purple-50/60 via-white to-amber-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-purple-100 text-purple-800">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Prestige Vibe — GHS 2,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Ideal for major church events: custom design in your ministry colours, RSVP tracking, photo gallery, MoMo offering link, video/livestream integration, calendar sync and 6-month hosting. For multi-day conventions with custom domain, Royal Vibe (GHS 4,000+) is the one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                <Link to="/get-started?eventType=Church">
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
            intro="Hi 👋 Here are the top questions ministries ask us about church event invitations."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-purple-100 via-amber-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Your church event deserves more than a WhatsApp flyer.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital invitation that carries every member — from the sermon topic to the offering, from the livestream to the follow-up. Starting from GHS 1,500.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-2xl shadow-purple-900/30"
            >
              <Link to="/get-started?eventType=Church">
                Create My Church Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Draft in 24 hours · Money-back guarantee</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
