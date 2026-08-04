// Regular Birthday page — kids' parties, casual 21sts, laid-back birthday
// get-togethers. Split from /milestone-birthday 2026-07-23 so 30/40/50/60/70
// celebrations get their own dedicated (and more valuable) product page.
// Palette: magenta/pink + gold/confetti-purple — festive, playful.
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
  PartyPopper,
  Sparkles,
  Images,
  MessageSquare,
  Radio,
  Flame,
  Star,
  Heart,
  Frame,
  Camera,
} from "lucide-react";
import heroImg from "@/assets/hero-birthday.jpg";

const birthdaySpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: PartyPopper,
    category: "Theme",
    shortLabel: "Theme",
    title: "Party-Theme Spotlight",
    short: "Barbie, Y2K, all-black, kente — matched.",
    description: "Whatever your birthday party theme, the invitation is themed to match. Colours, fonts, illustrations, mood — every detail dialled in so the invitation feels like part of the party, not an afterthought.",
    tint: "from-fuchsia-500 to-pink-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🎉",
  },
  {
    n: 4, icon: Sparkles,
    category: "Zodiac",
    shortLabel: "Zodiac",
    title: "Zodiac Sign / Month-Born Card",
    short: "The playful astrology card everyone loves.",
    description: "A fun zodiac and birth-month card — sign, element, personality traits, lucky colours. Because every birthday deserves a little bit of woo-woo alongside the confetti.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "♌",
  },
  {
    n: 7, icon: Images,
    category: "Journey",
    shortLabel: "Journey",
    title: "Photos Through the Years",
    short: "Baby → child → teen → today.",
    description: "A cinematic gallery of the birthday person from baby photos to today — every haircut, every era, every glow-up. The kind of scroll that ends in family group chat chaos.",
    tint: "from-rose-500 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "📸",
  },
  {
    n: 18, icon: MessageSquare,
    category: "Wishes",
    shortLabel: "Wishes",
    title: "Birthday Wishes Wall",
    short: "Every wish, from every guest — kept forever.",
    description: "Guests leave written birthday wishes right on the invitation, before or during the party. Every kind message from every friend, family member, and cousin — preserved in one place.",
    tint: "from-orange-500 to-amber-500", soft: "bg-orange-50", accent: "text-orange-700", emoji: "💌",
  },
  {
    n: 20, icon: Radio,
    category: "Live Ticker",
    shortLabel: "Live Ticker",
    title: "Live Wishes Ticker",
    short: "Wishes streaming onto the invitation live.",
    description: "As guests type their wishes, they scroll live across the invitation like a party ticker. A real-time celebration of how loved the birthday person is — happening right in front of everyone.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📡",
  },
  {
    n: 21, icon: Flame,
    category: "Roast",
    shortLabel: "Roast",
    title: "Roast Section (18+ / 21+)",
    short: "Friends leave the funny stories.",
    description: "A dedicated roast wall for close friends to leave the funny memories, embarrassing stories, and gentle jabs. The party's best moments — captured, curated, and read out at the toasts.",
    tint: "from-red-500 to-orange-600", soft: "bg-red-50", accent: "text-red-700", emoji: "🔥",
  },
  {
    n: 22, icon: Star,
    category: "Compliments",
    shortLabel: "Compliments",
    title: "Compliment Jar",
    short: "One compliment from every guest.",
    description: "Each guest leaves one compliment about the birthday person — a single kind thing they love about them. A jar of compliments that becomes the sweetest keepsake from the day.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "🌟",
  },
  {
    n: 23, icon: Heart,
    category: "Memories",
    shortLabel: "Memories",
    title: "Memory Contribution Wall",
    short: "A favourite memory, from every guest.",
    description: "Guests share a favourite memory they have with the birthday person — a road trip, a study group, a random Tuesday. A shared archive of the moments that mattered.",
    tint: "from-pink-500 to-fuchsia-600", soft: "bg-pink-50", accent: "text-pink-700", emoji: "💭",
  },
  {
    n: 24, icon: Frame,
    category: "Guest Fun",
    shortLabel: "Frame",
    title: "Photo Booth Frame",
    short: "Custom birthday selfie frames.",
    description: "A shareable, custom-designed photo frame guests overlay on their selfies at the party — turning every guest's phone into a walking piece of birthday branding.",
    tint: "from-fuchsia-500 to-purple-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🖼️",
  },
  {
    n: 48, icon: Camera,
    category: "After-Party",
    shortLabel: "Album",
    title: "After-Birthday Photo Gallery",
    short: "The curated party album, shared later.",
    description: "After the party, a beautifully curated gallery of all the photos and videos from the night — auto-collected from the live photo wall — shared with every guest via the same invitation link.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "📷",
  },
];

const testimonials = [
  { name: "Ama Sarpong", location: "Accra — 21st", quote: "The roast section had my friends crying with laughter reading it out at the toasts. And the compliment jar? I still read it when I'm having a bad day." },
  { name: "Kwame Boateng", location: "Kumasi — Kids party", quote: "For my son's 8th birthday, the photo booth frame was the highlight — every parent left with themed selfies. The kids loved seeing their names on the wishes wall too." },
  { name: "Efua Owusu", location: "London — 21st", quote: "The live wishes ticker was the whole vibe. Watching wishes scroll in real time as friends walked into the party — everyone was refreshing their phones." },
];

const faqs = [
  { question: "Is this right for a milestone birthday (30/40/50/60/70)?", answer: "The Regular Birthday package is best for kids' parties, teen birthdays, 21sts, and casual celebrations. For a milestone birthday — 30th, 40th, 50th, 60th, or 70th — the Milestone Birthday package (GHS 2,000) is purpose-built and includes the life-timeline photo journey, video guestbook add-on, MoMo gift tracker, and more. See /milestone-birthday for details." },
  { question: "Can you match my party theme?", answer: "Yes. Whatever the theme — Y2K, all-black, Barbie, kente, Great Gatsby — we design the invitation around it. Colours, fonts, and vibe all matched." },
  { question: "How long does a birthday invitation take?", answer: "Standard delivery is 3–5 business days. Rush delivery in 48 hours is available for a small additional fee." },
  { question: "Can I keep the roast page hidden from parents?", answer: "Yes. The roast section can be unlisted — only guests you share the private link with can see it. Keep it away from mum's WhatsApp." },
  { question: "Can I accept MoMo gifts?", answer: "Yes. Guests can send cash gifts directly via MTN, Vodafone or AirtelTigo. Tracked in real-time on your host dashboard." },
  { question: "Can I update details after it goes live?", answer: "Yes. Any change to venue, time, or dress code is updated once and every guest sees the latest instantly." },
];

export default function BirthdayInvitations() {
  return (
    <Layout>
      <SEO
        title="Birthday Invitations Ghana — Digital Party Cards for Every Age"
        description="Beautiful digital birthday invitations for Ghanaian celebrations. Party-theme spotlights, wishes wall, roast section, live photo wall, photo booth frame — one link, every friend. From GHS 1,200."
        keywords="birthday invitations Ghana, 21st birthday invite, kids birthday party invitation Ghana, digital birthday card, teen birthday invite Accra, birthday party invitation"
        canonical="/birthday"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian birthday celebration"
        imageObjectPos="center 30%"
        chip="For Ghanaian Birthdays"
        heading="Every Party."
        headingHighlight="Its Own Vibe."
        subheading="From the party-theme spotlight to the roast section — every wish, every memory, every compliment. Perfect for kids' parties, teen birthdays, 21sts, and casual celebrations."
        primaryCta={{ label: "Start Your Birthday Invite", href: "/get-started?eventType=Birthday" }}
        secondaryCta={{ label: "See Birthday Examples", href: "/portfolio?type=birthday" }}
        trustRow={["Theme-matched design", "Kids · Teens · 21sts", "Every wish, kept"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={birthdaySpecialFeatures}
        chip="Birthday party features"
        heading="Built for the Party of the Year"
        subheading="Ten features shaped around how Ghanaians throw birthday parties — from the theme spotlight to the roast section your best friend will read at the toast."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every birthday invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From birthday people who chose VibeLink"
        subheading="Real feedback from real Ghanaian birthday parties."
        accentClass="from-fuchsia-50/60 via-white to-pink-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-fuchsia-100 text-fuchsia-700">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Regular Birthday Package — GHS 1,200</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Perfect for kids' birthday parties, teen birthdays, 21st celebrations, and casual birthday get-togethers — single-page invitation with theme colours, RSVP with head-count, photo gallery, event details, Google Maps, WhatsApp share. Planning a 30th, 40th, 50th, 60th or 70th? The <Link to="/milestone-birthday" className="text-fuchsia-700 font-semibold underline underline-offset-2">Milestone Birthday package (GHS 2,000)</Link> is purpose-built for those.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700">
                <Link to="/get-started?eventType=Birthday">
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
            intro="Hi 👋 Here are the top questions people ask us about birthday invitations."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-fuchsia-100 via-pink-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Not another WhatsApp flyer. Your party deserves better.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital birthday invitation that's a full-blown party — wishes, memories, roasts, and every friend's voice, kept forever. Starting from GHS 1,200.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 shadow-2xl shadow-fuchsia-900/30"
            >
              <Link to="/get-started?eventType=Birthday">
                Create My Birthday Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Standard 5–7 days · 48h Rush +GHS 300 · Full deposit refund before design begins</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
