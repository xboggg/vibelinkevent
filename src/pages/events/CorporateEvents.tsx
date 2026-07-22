// Rebuilt from scratch 2026-07-11 — matches /wedding-invitations pattern.
// Palette: navy/slate + electric blue + gold — corporate, premium, professional.
// Note: 20 special features — carousel auto-flows to 4x5 grid on desktop.
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
  UserCircle,
  Star,
  Users,
  BookOpen,
  Award,
  Handshake,
  QrCode,
  Ticket,
  UsersRound,
  MessagesSquare,
  MessageCircleQuestion,
  BarChart3,
  Presentation,
  Video,
  FileText,
  Download,
  Trophy,
  Radio,
  ClipboardList,
  Hotel,
} from "lucide-react";
import heroImg from "@/assets/hero-corporate.jpg";

const corporateSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: UserCircle,
    category: "Speakers",
    shortLabel: "Speakers",
    title: "Speaker Profiles & Bios",
    short: "Every speaker — with LinkedIn, title, company.",
    description: "A curated grid of headline speakers — each with a photo, title, company, brief bio and LinkedIn link. Attendees know who they're coming to hear before they even arrive.",
    tint: "from-blue-600 to-indigo-700", soft: "bg-blue-50", accent: "text-blue-800", emoji: "🎤",
  },
  {
    n: 2, icon: Star,
    category: "Keynote",
    shortLabel: "Keynote",
    title: "Keynote Spotlight",
    short: "The flagship speaker, front and centre.",
    description: "A large, prominent spotlight card for the keynote — bio, previous talks, why they're speaking, why it matters. The biggest name gets the biggest stage on the page too.",
    tint: "from-amber-500 to-yellow-600", soft: "bg-amber-50", accent: "text-amber-800", emoji: "🌟",
  },
  {
    n: 3, icon: Users,
    category: "Panels",
    shortLabel: "Panels",
    title: "Panel Discussions Lineup",
    short: "Moderators + panellists, honoured together.",
    description: "A visual lineup of every panel — with moderator, panellists, topic, and time. Attendees pick which discussions to attend at a glance.",
    tint: "from-purple-500 to-indigo-600", soft: "bg-purple-50", accent: "text-purple-800", emoji: "🎙️",
  },
  {
    n: 4, icon: ClipboardList,
    category: "Agenda",
    shortLabel: "Agenda",
    title: "Agenda / Session Tracker",
    short: "The full timed programme with breakouts.",
    description: "A clear, timed programme — keynote, breakouts, breaks, panels, closing. Attendees plan their day and never miss a session they wanted to catch.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-800", emoji: "📅",
  },
  {
    n: 10, icon: Award,
    category: "Sponsors",
    shortLabel: "Sponsors",
    title: "Sponsor Showcase Wall",
    short: "Platinum · Gold · Silver · Bronze, honoured properly.",
    description: "A tiered wall showing every sponsor by level — Platinum on top, then Gold, Silver, Bronze. Sponsors see their brand honoured and get the visibility they paid for.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-800", emoji: "🏆",
  },
  {
    n: 12, icon: Handshake,
    category: "Partners",
    shortLabel: "Partners",
    title: "Partner Logos Row",
    short: "Media, technology, community partners.",
    description: "A dedicated row for media, technology, and community partners — the ecosystem around the event honoured alongside the paid sponsors.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-800", emoji: "🤝",
  },
  {
    n: 15, icon: QrCode,
    category: "Check-in",
    shortLabel: "QR Badge",
    title: "QR Check-in + Digital Badges",
    short: "Scannable entry with sponsor logos on every badge.",
    description: "Each attendee gets a personal QR badge with their name, company, and sponsor logos. Fast check-in at the door and a professional badge on every lanyard.",
    tint: "from-slate-600 to-slate-800", soft: "bg-slate-50", accent: "text-slate-700", emoji: "📱",
  },
  {
    n: 16, icon: Ticket,
    category: "Ticket Tiers",
    shortLabel: "Tiers",
    title: "Ticket Tier Selector",
    short: "General · VIP · Speaker · Press.",
    description: "A clear ticket-tier picker with what's included at each level — general admission, VIP lounge access, speaker breakfast, press box. Attendees pick and pay accordingly.",
    tint: "from-fuchsia-500 to-pink-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🎟️",
  },
  {
    n: 17, icon: UsersRound,
    category: "Group",
    shortLabel: "Group",
    title: "Group Registration",
    short: "Companies book multiple attendees in one flow.",
    description: "A dedicated group-registration path — HR or admin books a whole team in one transaction, with automated confirmations sent to each colleague.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "👥",
  },
  {
    n: 21, icon: MessagesSquare,
    category: "Directory",
    shortLabel: "Delegates",
    title: "Delegate Directory",
    short: "See who's attending — searchable, filterable.",
    description: "A searchable directory of confirmed attendees — filter by industry, role, or company. So you know who to look for before you even arrive.",
    tint: "from-teal-500 to-cyan-600", soft: "bg-teal-50", accent: "text-teal-700", emoji: "🔎",
  },
  {
    n: 22, icon: MessageCircleQuestion,
    category: "Networking",
    shortLabel: "Networking",
    title: "Attendee Networking / DM System",
    short: "Message other attendees before and during.",
    description: "A built-in messaging system so attendees can DM each other before, during, and after — book coffees, set up meetings, connect on LinkedIn. Networking without the awkward business-card exchange.",
    tint: "from-blue-500 to-cyan-600", soft: "bg-blue-50", accent: "text-blue-800", emoji: "💬",
  },
  {
    n: 26, icon: MessageCircleQuestion,
    category: "Live Q&A",
    shortLabel: "Live Q&A",
    title: "Live Q&A Submission",
    short: "Attendees submit questions to the speakers.",
    description: "Attendees submit questions in real-time — moderators surface the best ones for the speaker to answer live. No more shouting from the back of the hall.",
    tint: "from-orange-500 to-amber-600", soft: "bg-orange-50", accent: "text-orange-800", emoji: "❓",
  },
  {
    n: 27, icon: BarChart3,
    category: "Live Polls",
    shortLabel: "Polls",
    title: "Live Polling",
    short: "Audience polls during sessions.",
    description: "Speakers launch live polls mid-session — audience votes on their phones and results project in real-time. Engagement, gamified.",
    tint: "from-fuchsia-500 to-purple-600", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "📊",
  },
  {
    n: 28, icon: Presentation,
    category: "Slides",
    shortLabel: "Slides",
    title: "Slide Deck Downloads",
    short: "Presentations posted after every session.",
    description: "Every speaker's slide deck published after their session — attendees download for reference, share with colleagues who missed it, keep for later use.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "📽️",
  },
  {
    n: 29, icon: Video,
    category: "Recordings",
    shortLabel: "Replays",
    title: "Session Recording Links",
    short: "Video-on-demand of every talk.",
    description: "Every session recorded and posted after the event — attendees rewatch, share with their team, and refer back to key moments long after the day is done.",
    tint: "from-red-500 to-rose-600", soft: "bg-red-50", accent: "text-red-700", emoji: "🎥",
  },
  {
    n: 30, icon: Download,
    category: "Resources",
    shortLabel: "Whitepapers",
    title: "Whitepapers & Resources",
    short: "Downloadables from every sponsor and speaker.",
    description: "A resource library — whitepapers, case studies, e-books, product one-pagers from sponsors and speakers. Attendees walk away with a full folder of takeaways.",
    tint: "from-sky-500 to-blue-600", soft: "bg-sky-50", accent: "text-sky-700", emoji: "📄",
  },
  {
    n: 35, icon: Hotel,
    category: "Hotels",
    shortLabel: "Hotels",
    title: "Hotel Booking with Discount Code",
    short: "Partner hotel rates for out-of-town attendees.",
    description: "A curated list of partner hotels near the venue — with negotiated rates and one-tap booking codes. Out-of-town attendees stay comfortable without the search.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "🏨",
  },
  {
    n: 43, icon: Trophy,
    category: "Awards",
    shortLabel: "Winners",
    title: "Winners Announcement Page",
    short: "Populated live as awards are announced.",
    description: "For awards events — the winners page updates live as each category is announced. Attendees, sponsors and press get the results in real-time, right on the invitation.",
    tint: "from-amber-500 to-orange-600", soft: "bg-amber-50", accent: "text-amber-800", emoji: "🏆",
  },
  {
    n: 44, icon: Radio,
    category: "Hybrid",
    shortLabel: "Livestream",
    title: "Livestream for Remote Attendees",
    short: "Hybrid attendance — every session, streamed.",
    description: "Full livestream of every session for remote attendees — with the same live Q&A, polls, and chatroom access as in-person guests. The event, everywhere.",
    tint: "from-rose-500 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "📡",
  },
  {
    n: 49, icon: FileText,
    category: "Feedback",
    shortLabel: "Survey",
    title: "Post-Event Survey",
    short: "Feedback form for next year's improvement.",
    description: "A clean, quick post-event survey — session ratings, speaker feedback, venue thoughts, would-you-recommend. Organisers plan next year armed with data, not guesses.",
    tint: "from-cyan-500 to-teal-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📝",
  },
];

const testimonials = [
  { name: "Isaac Ampomah, MD", location: "Accra — Product Launch", quote: "The digital badge and QR check-in cut our door queue from 20 minutes to zero. Our sponsors kept mentioning how professional the whole invitation felt." },
  { name: "The Ghana FinTech Summit team", location: "Kempinski, Accra", quote: "Delegate directory + attendee DMs turned our summit into a real networking event. Attendees booked coffees before they even landed in Accra." },
  { name: "Nana Yaa Owusu", location: "Corporate AGM organiser", quote: "Group registration for our 400-person AGM was seamless — HR teams booked their whole staff in one form. The client feedback survey went 3x higher than last year." },
];

const faqs = [
  { question: "Can you match our corporate brand colours?", answer: "Yes. We colour-match to your brand palette, use your fonts (or Google Font equivalents), and place your logo prominently. It looks like YOUR event, not a template." },
  { question: "How long does a corporate event invitation take?", answer: "Standard delivery is 5–7 business days. Rush delivery in 48 hours is available for a fee. For enterprise events with 500+ attendees, we recommend 2–3 weeks lead time." },
  { question: "Can we accept ticket payments through the invitation?", answer: "Yes. We integrate Paystack, Flutterwave, or Stripe for card + MoMo payments. Different ticket tiers (General / VIP / Speaker / Press) each with their own price and inclusions." },
  { question: "Do you support hybrid events with livestream?", answer: "Yes. We embed your Zoom, YouTube Live, or Vimeo stream so remote attendees join every session — with the same Q&A and polling as in-person attendees." },
  { question: "Can we update sessions and speakers after launch?", answer: "Yes. Any change to agenda, speakers, or venue is updated once and every attendee sees the latest instantly. No emails to resend." },
];

export default function CorporateEvents() {
  return (
    <Layout>
      <SEO
        title="Corporate Event Invitations Ghana — Conferences, Launches & AGMs"
        description="Premium digital invitations for Ghanaian corporate events. Speaker profiles, sponsor showcase, QR check-in, delegate networking, live Q&A, livestream — one link, every attendee."
        keywords="corporate event invitations Ghana, conference invite Accra, AGM digital invitation, product launch invite, business event Ghana, corporate summit invitation"
        canonical="/corporate-events"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian corporate event"
        imageObjectPos="center 30%"
        chip="For Ghanaian Corporates"
        heading="Every Delegate Reached."
        headingHighlight="Every Sponsor Honoured."
        subheading="Product launches. Conferences. AGMs. Awards nights. A premium digital invitation that carries every speaker, every sponsor, every delegate — held together in one professional link."
        primaryCta={{ label: "Start Your Corporate Invite", href: "/get-started?eventType=Corporate" }}
        secondaryCta={{ label: "See Corporate Examples", href: "/portfolio?type=corporate" }}
        trustRow={["80+ Ghanaian corporates", "Summits · AGMs · Launches", "Every delegate, one link"]}
        overlayGradient="linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.6) 45%, rgba(15,23,42,0.3) 100%)"
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={corporateSpecialFeatures}
        chip="Corporate-only features"
        heading="Built for Serious Business Events"
        subheading="Twenty features shaped around how Ghanaian corporates run their biggest events — from speaker showcases to hybrid livestreams to post-event feedback."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every corporate invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From companies who chose VibeLink"
        subheading="Real feedback from real Ghanaian corporate events."
        accentClass="from-blue-50/60 via-white to-slate-50/40"
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
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Royal Vibe — GHS 4,000+</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Built for enterprise events: custom domain, host dashboard, unlimited photos, video integration, MoMo tracking, priority WhatsApp support, and full 12-month hosting. For smaller corporate gatherings or single-session launches, Prestige Vibe (GHS 2,500) covers the essentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-blue-700 to-slate-800 hover:from-blue-800 hover:to-slate-900">
                <Link to="/get-started?eventType=Corporate">
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
            intro="Hi 👋 Here are the top questions our corporate clients ask us."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-100 via-slate-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Your delegates deserve more than a PDF and an Eventbrite link.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A premium digital invitation that carries every speaker, sponsor and delegate — from registration to post-event survey. Starting from GHS 1,500 for smaller launches.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-blue-700 to-slate-800 hover:from-blue-800 hover:to-slate-900 shadow-2xl shadow-blue-900/30"
            >
              <Link to="/get-started?eventType=Corporate">
                Create My Corporate Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Draft in 48 hours · Enterprise support available</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
