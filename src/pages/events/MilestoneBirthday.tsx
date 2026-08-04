// Milestone Birthday event page — 30th / 40th / 50th / 60th / 70th.
// Split from BirthdayInvitations 2026-07-23 because the two segments target
// different search intents and price points (Milestone GHS 2,000, Regular
// GHS 1,200). Palette: gold / amber / deep-purple — grown-up, celebratory,
// slightly regal to signal "milestone".
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
  Crown,
  Images,
  Video,
  MessageSquare,
  Sparkles,
  Users,
  Gift,
  Camera,
  Trophy,
  Heart,
} from "lucide-react";
import heroImg from "@/assets/hero-birthday.jpg";

const milestoneSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: Crown,
    category: "Milestone",
    shortLabel: "Milestone",
    title: "The Milestone Spotlight",
    short: "30. 40. 50. 60. 70. Honoured properly.",
    description: "A themed hero banner tuned to the milestone — the golden 50, the diamond 60, the platinum 70. Every big year gets the treatment it deserves, not just another birthday flyer.",
    tint: "from-amber-500 to-yellow-600", soft: "bg-amber-50", accent: "text-amber-800", emoji: "👑",
  },
  {
    n: 2, icon: Images,
    category: "Life Timeline",
    shortLabel: "Timeline",
    title: "Decade-by-Decade Photo Journey",
    short: "Your whole life, told in photos.",
    description: "An interactive life timeline — childhood, twenties, thirties, forties, all the way to today. Every haircut, every era, every glow-up. Your family will scroll it for hours and share it on WhatsApp for weeks.",
    tint: "from-purple-600 to-indigo-700", soft: "bg-purple-50", accent: "text-purple-800", emoji: "📸",
  },
  {
    n: 3, icon: Video,
    category: "Video Guestbook",
    shortLabel: "Video Book",
    title: "Video Guestbook",
    short: "15-second video wishes from everyone.",
    description: "Guests record 15-second video wishes right on the invitation — stitched into one continuous memory reel you'll rewatch for years. The kind of gift no cake or bottle of champagne can match.",
    tint: "from-rose-500 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "🎥",
  },
  {
    n: 4, icon: MessageSquare,
    category: "Wishes Wall",
    shortLabel: "Wishes",
    title: "Wishes Wall for Every Friend",
    short: "Every kind word, kept forever.",
    description: "A dedicated wall where guests leave written wishes — the sentimental notes from friends of forty years, the funny ones from your kids, the professional ones from work. Every message archived and searchable.",
    tint: "from-fuchsia-500 to-pink-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "💌",
  },
  {
    n: 5, icon: Trophy,
    category: "Achievements",
    shortLabel: "Legacy",
    title: "Life Achievements Highlight",
    short: "The wins, the milestones, the legacy.",
    description: "A tasteful section that honours the achievements of the milestone-holder — career highlights, family milestones, the wins that made this year worth celebrating. The Nana / Auntie / Uncle biography they deserve.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "🏆",
  },
  {
    n: 6, icon: Gift,
    category: "MoMo Gifts",
    shortLabel: "MoMo Gift",
    title: "MoMo Gift Link with Live Tracker",
    short: "Cash gifts sent directly, tracked live.",
    description: "A dedicated MoMo gift link (MTN / Vodafone / AirtelTigo) so friends and family can send cash gifts directly. A live tracker shows contributions coming in — no chasing, no bank runs, just a beautiful running total.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "💰",
  },
  {
    n: 7, icon: Users,
    category: "Guest Highlights",
    shortLabel: "Highlights",
    title: "Guest Highlight Roll",
    short: "Mention special attendees by name.",
    description: "Highlight special guests attending — parents flying in from London, uni friends coming from Kumasi, the retired boss making a rare appearance. A public thank-you to the people who showed up.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "⭐",
  },
  {
    n: 8, icon: Sparkles,
    category: "Era Music",
    shortLabel: "Music",
    title: "Era-Appropriate Playlist",
    short: "The soundtrack of your years.",
    description: "Background music that matches the era you're celebrating — the highlife of your parents, the palmwine of your youth, the afrobeats of today. The invitation plays like a personal soundtrack.",
    tint: "from-orange-500 to-red-600", soft: "bg-orange-50", accent: "text-orange-700", emoji: "🎵",
  },
  {
    n: 9, icon: Heart,
    category: "Roast Corner",
    shortLabel: "Roast",
    title: "Private Roast Corner",
    short: "Friends leave the funny stories.",
    description: "A private space friends can access with a code — where the roasts, embarrassing stories, and playful jabs live. Curated privately, read out at the toasts, then archived forever.",
    tint: "from-red-500 to-orange-600", soft: "bg-red-50", accent: "text-red-700", emoji: "🔥",
  },
  {
    n: 10, icon: Camera,
    category: "After-Party",
    shortLabel: "Gallery",
    title: "Post-Event Photo Gallery",
    short: "The curated album, shared with everyone.",
    description: "After the party, a beautifully curated gallery — auto-collected from guests' phones + your photographer — shared with every attendee via the same invitation link. The party keeps living long after the last dance.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📷",
  },
];

const testimonials = [
  { name: "Auntie Ama Owusu", location: "Accra — 60th", quote: "The life timeline had my children and grandchildren looking through photos of me from childhood. My 90-year-old mother watched the video wishes and cried. Worth every pesewa." },
  { name: "Dr. Kwame Boateng", location: "Kumasi — 50th", quote: "I invited three hundred people to my 50th and every single one used the invitation. The MoMo gift link tracked contributions live — my treasurer thanked me for the rest of the year." },
  { name: "Nana Efua", location: "London — 70th", quote: "For my 70th, my family in Ghana couldn't all fly over. The live wishes wall was their way of being there. I still open it every morning to read the messages." },
];

const faqs = [
  { question: "Which milestones does this package cover?", answer: "Every major milestone birthday — 30th, 40th, 50th, 60th, 70th, and beyond. Designed for the grown-up celebrations where the whole family, extended community, and diaspora friends are invited." },
  { question: "How is this different from the Regular Birthday package?", answer: "The Milestone package (GHS 2,000) includes the life timeline, video guestbook add-on, wishes wall, MoMo gift tracker, and era-appropriate playlist — features tuned for the biggest birthday celebrations. The Regular Birthday package (GHS 1,200) is a lighter option for kids' parties, casual 21sts, and less formal celebrations." },
  { question: "Can we hide certain sections from certain guests?", answer: "Yes. The private roast corner is code-gated — only guests you share the code with can see it. Perfect for keeping the funny stories away from parents or work colleagues." },
  { question: "How long does a milestone birthday invitation take?", answer: "Standard delivery is 5–7 business days. Rush delivery in 48 hours is available for a small additional fee — perfect if the party is next week." },
  { question: "Can we accept MoMo gifts?", answer: "Yes. Guests can send cash gifts directly via MTN, Vodafone, or AirtelTigo. Contributions are tracked in real-time on your host dashboard — you see the running total and every contributor by name." },
  { question: "Can I update details after it goes live?", answer: "Yes. Any change to venue, time, dress code, or guest list is updated once — and every guest sees the latest instantly. No more sending WhatsApp updates one by one." },
];

export default function MilestoneBirthday() {
  return (
    <Layout>
      <SEO
        title="Milestone Birthday Invitations Ghana — 30th, 40th, 50th, 60th, 70th"
        description="Digital milestone birthday invitations for Ghanaian celebrations. Life timeline, video guestbook, wishes wall, MoMo gift tracker, era playlist — the whole family, one link."
        keywords="milestone birthday invitation Ghana, 40th birthday invite, 50th birthday Ghana, 60th birthday invitation Accra, 70th birthday celebration, digital birthday card Ghana, life timeline invitation"
        canonical="/milestone-birthday"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian milestone birthday celebration"
        imageObjectPos="center 30%"
        chip="For Milestone Birthdays"
        heading="A Life Well-Lived."
        headingHighlight="Celebrated Properly."
        subheading="30th. 40th. 50th. 60th. 70th. The birthdays that gather the whole family, community, and diaspora. Your milestone deserves more than a WhatsApp flyer."
        primaryCta={{ label: "Start Your Milestone Invite", href: "/get-started?eventType=Milestone-Birthday" }}
        secondaryCta={{ label: "See Milestone Examples", href: "/portfolio?type=birthday" }}
        trustRow={["Life-timeline photo journey", "Video guestbook add-on", "MoMo gift tracker"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={milestoneSpecialFeatures}
        chip="Milestone-only features"
        heading="Built for the Birthdays That Matter"
        subheading="Ten features shaped around how Ghanaians celebrate the big milestones — from the life timeline to the MoMo gift tracker to the video guestbook that captures every wish."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every milestone invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the milestone."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From milestone celebrants who chose VibeLink"
        subheading="Real feedback from real Ghanaian milestone birthdays."
        accentClass="from-amber-50/60 via-white to-yellow-50/40"
      />

      {/* 5. Recommended package */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-amber-100 text-amber-800">
              Our Recommendation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Milestone Birthday Package — GHS 2,000</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Purpose-built for 30th, 40th, 50th, 60th, and 70th birthdays. Includes the life-timeline photo journey, wishes wall, MoMo gift link with live tracker, era-appropriate playlist, guest highlight roll, and 90-day hosting. For simple kids' parties and casual birthdays, the <Link to="/birthday" className="text-amber-700 font-semibold underline underline-offset-2">Regular Birthday package (GHS 1,200)</Link> is a lighter fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                <Link to="/get-started?eventType=Milestone-Birthday">
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
            intro="Hi 👋 Here are the top questions people ask us about milestone birthday invitations."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              A milestone worth celebrating deserves more than a flyer.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital milestone birthday invitation that captures the years — the life timeline, the video wishes, the family from home and abroad. Starting from GHS 2,000.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-2xl shadow-amber-900/30"
            >
              <Link to="/get-started?eventType=Milestone-Birthday">
                Create My Milestone Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Standard 5–7 days · 48h Rush +GHS 300 · Full deposit refund before design begins</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
