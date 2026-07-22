// Rebuilt from scratch 2026-07-10 — matches /wedding-invitations pattern.
// Palette: deep navy + gold — academic, distinguished, honour-worthy.
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
  Award,
  Mountain,
  MessageCircle,
  Flame,
  Heart,
  ClipboardList,
  Users,
  Images,
  Video,
  MessageSquare,
} from "lucide-react";
import heroImg from "@/assets/hero-graduation.jpg";

const graduationSpecialFeatures: SpecialFeature[] = [
  {
    n: 3, icon: Award,
    category: "Achievement",
    shortLabel: "Awards",
    title: "Achievement Showcase",
    short: "Awards, publications, competitions — all on show.",
    description: "A dedicated section for every honour earned along the way — deans' lists, competition trophies, published papers, scholarships. The receipts of a job well done.",
    tint: "from-amber-500 to-yellow-600", soft: "bg-amber-50", accent: "text-amber-800", emoji: "🏆",
  },
  {
    n: 5, icon: Mountain,
    category: "The Journey",
    shortLabel: "Struggle",
    title: "The Struggle Chapter",
    short: "What it took to get here — honestly.",
    description: "A personal note about the years behind this cap and gown. The late nights, the setbacks, the moments of doubt. Because the graduation is beautiful — but the journey was harder than anyone saw.",
    tint: "from-slate-600 to-slate-800", soft: "bg-slate-50", accent: "text-slate-700", emoji: "⛰️",
  },
  {
    n: 9, icon: MessageCircle,
    category: "Graduate's Voice",
    shortLabel: "Thank You",
    title: "Message from the Graduate",
    short: "A personal thank-you to family and sponsors.",
    description: "The graduate's own words — thanking the family, mentors and sponsors who made this moment possible. Warm, honest, and shared right on the invitation.",
    tint: "from-blue-600 to-indigo-700", soft: "bg-blue-50", accent: "text-blue-800", emoji: "💬",
  },
  {
    n: 13, icon: Flame,
    category: "Reflection",
    shortLabel: "What Kept Me",
    title: "What Kept Me Going",
    short: "The people, prayers, and moments that pushed you through.",
    description: "A reflective section for the graduate to name what carried them — the parent who prayed daily, the friend who checked in, the verse memorised in exam week. Everyone who mattered, honoured.",
    tint: "from-orange-500 to-red-600", soft: "bg-orange-50", accent: "text-orange-800", emoji: "🔥",
  },
  {
    n: 18, icon: Heart,
    category: "Supporters",
    shortLabel: "Thank Wall",
    title: "Thank-You Wall for Supporters",
    short: "Everyone who helped — named, one by one.",
    description: "A living thank-you wall listing family, sponsors, teachers, and prayer partners by name. Not a generic 'thanks to all' — every person who contributed, individually honoured.",
    tint: "from-rose-500 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "🙏",
  },
  {
    n: 21, icon: ClipboardList,
    category: "Ceremony",
    shortLabel: "Schedule",
    title: "Graduation Ceremony Schedule",
    short: "Order of events on the actual campus day.",
    description: "A clear timetable for the graduation itself — arrival, procession, speeches, conferment, recessional. Guests know when to arrive, where to sit, and when the graduate walks the stage.",
    tint: "from-purple-600 to-indigo-700", soft: "bg-purple-50", accent: "text-purple-800", emoji: "📋",
  },
  {
    n: 30, icon: Users,
    category: "Course-Mates",
    shortLabel: "Course-Mates",
    title: "Group Photo Memories",
    short: "Course-mates, roommates, hall memories.",
    description: "A curated gallery of the people who made university what it was — lecture theatre friends, hall-mates, group project teams, all-nighter squads. The community behind the certificate.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "👥",
  },
  {
    n: 31, icon: Images,
    category: "Live Photos",
    shortLabel: "Photo Wall",
    title: "Live Photo Wall",
    short: "Guest photos streaming onto the invitation during the party.",
    description: "As the party unfolds, guest photos stream live onto the invitation page — everyone's phones become one shared album. The night captured in real time, by everyone there.",
    tint: "from-pink-500 to-rose-600", soft: "bg-pink-50", accent: "text-pink-700", emoji: "📸",
  },
  {
    n: 33, icon: Video,
    category: "Video Wishes",
    shortLabel: "Video",
    title: "Video Guestbook",
    short: "15-second congratulatory video wishes.",
    description: "Guests record short videos of congratulations, advice, and blessings for the next chapter. Stacked into a memory reel the graduate keeps forever — proof of every voice that cheered them on.",
    tint: "from-fuchsia-500 to-purple-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🎥",
  },
  {
    n: 34, icon: MessageSquare,
    category: "Live Wishes",
    shortLabel: "Wishes",
    title: "Live Guestbook Wall",
    short: "Real-time messages streaming on the invitation.",
    description: "Wishes, prayers, and congratulations from guests stream onto the page live — from the ceremony hall, the after-party, or the diaspora. Every kind word from every guest, preserved in one place.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "💌",
  },
];

const testimonials = [
  { name: "Nana Yaw Owusu", location: "Legon, Accra", quote: "The 'struggle chapter' is the part everyone kept messaging me about. People I hadn't spoken to in years reached out — my journey resonated with theirs." },
  { name: "Ama Boateng, LLB", location: "KNUST, Kumasi", quote: "The thank-you wall listing every sponsor by name meant the world to my aunties who helped. They screenshot it and sent it to their family groups." },
  { name: "Kwame Mensah", location: "UK — postgrad", quote: "My family in Ghana couldn't fly to the UK graduation. The livestream and video guestbook meant they were part of it anyway — my dad's video message still makes me tear up." },
];

const faqs = [
  { question: "Can you match my university's colours?", answer: "Yes. We colour-match to Legon's blue-and-gold, KNUST's red, UCC's teal, or any institution's palette. Or design something entirely custom around your degree." },
  { question: "How long does a graduation invitation take?", answer: "Standard delivery is 4–6 business days. Rush delivery in 48 hours is available for a small additional fee." },
  { question: "Can we accept MoMo gifts for the next chapter?", answer: "Yes. Guests contribute directly via MTN, Vodafone or AirtelTigo — for a master's fund, a career kit, or an airfare fund. Tracked in real-time." },
  { question: "Can family abroad watch the ceremony?", answer: "Yes. We embed a livestream for parents and family who couldn't travel. The link works on any phone, anywhere." },
  { question: "Can we update details after it goes live?", answer: "Yes. Any change to venue, time, or after-party info is updated once and every guest sees the latest instantly." },
];

export default function GraduationInvitations() {
  return (
    <Layout>
      <SEO
        title="Graduation Invitations Ghana — Digital Ceremony & After-Party Cards"
        description="Beautiful digital graduation invitations for Ghanaian graduates. Achievement showcase, thank-you walls for sponsors, video guestbook, livestream — one link, every family and course-mate."
        keywords="graduation invitations Ghana, digital graduation card, university graduation invite Legon, KNUST graduation invitation, master's graduation card Ghana"
        canonical="/graduation"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian graduation ceremony"
        imageObjectPos="center 25%"
        chip="For Ghanaian Graduates"
        heading="Years of Work."
        headingHighlight="One Big Moment."
        subheading="From the struggle to the stage — celebrate the certificate, honour every sponsor, and share the day with everyone who prayed you through. One link, every family."
        primaryCta={{ label: "Start Your Graduation Invite", href: "/get-started?eventType=Graduation" }}
        secondaryCta={{ label: "See Graduation Examples", href: "/portfolio?type=graduation" }}
        trustRow={["120+ Ghanaian graduates", "Legon · KNUST · UCC · UPSA", "Every sponsor honoured"]}
        overlayGradient="linear-gradient(90deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.55) 45%, rgba(15,23,42,0.3) 100%)"
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={graduationSpecialFeatures}
        chip="Graduation-only features"
        heading="Built to Honour the Journey"
        subheading="Ten features shaped around what graduation really means in Ghana — the struggle, the sponsors, the people who carried you through, and the day it all pays off."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every graduation invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From graduates who chose VibeLink"
        subheading="Real feedback from real Ghanaian graduation celebrations."
        accentClass="from-blue-50/60 via-white to-amber-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-blue-100 text-blue-800">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Classic Vibe — GHS 1,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Ideal for graduations: custom design in your university's colours, RSVP tracking, photo gallery of the journey, background music, thank-you wall and 90-day hosting. For families who want MoMo gift link (master's fund) and video guestbook, Prestige Vibe (GHS 2,500) is the one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900">
                <Link to="/get-started?eventType=Graduation">
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
            intro="Hi 👋 Here are the top questions graduates and families ask us."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-100 via-amber-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              This degree cost more than tuition. Honour it properly.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital graduation invitation that names every sponsor, tells the real story, and gives your family a keepsake for life. Starting from GHS 1,000.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 shadow-2xl shadow-blue-900/30"
            >
              <Link to="/get-started?eventType=Graduation">
                Create My Graduation Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Draft in 24 hours · Money-back guarantee</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
