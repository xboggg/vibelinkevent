// Rebuilt from scratch 2026-07-09 — matches /wedding-invitations pattern.
// Structure: CinematicHero → SpecialFeaturesCarousel (10 engagement-only)
//   → CommonFeaturesGrid → EventTestimonials → Recommended package → FAQ → CTA
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
  DoorOpen,
  ListOrdered,
  Mic,
  Heart,
  Users,
  Camera,
  Frame,
  MessageSquare,
  Bell,
  Music,
} from "lucide-react";
import heroImg from "@/assets/hero-engagement.jpg";

const engagementSpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: DoorOpen,
    category: "Tradition",
    shortLabel: "Knocking",
    title: "Knocking Ceremony Page",
    short: "The formal 'kokooko' rite, given its own home.",
    description: "A dedicated section for the knocking ceremony — dates, times, families invited, order of the rite. Keep this respectful moment separate from the celebration but stitched into the same invitation.",
    tint: "from-amber-500 to-orange-600", soft: "bg-amber-50", accent: "text-amber-700", emoji: "🚪",
  },
  {
    n: 3, icon: ListOrdered,
    category: "Order",
    shortLabel: "Schedule",
    title: "Cultural Rites Schedule",
    short: "Knocking, prayer, introductions, presentation, celebration.",
    description: "A clear, timed order of events — so uncles, aunties and young ones know exactly what happens and when. Presented beautifully, not as a boring PDF.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "📜",
  },
  {
    n: 8, icon: Mic,
    category: "Spokesperson",
    shortLabel: "Linguist",
    title: "Family Spokesperson (Abusuapanin) Bio",
    short: "Who's speaking for which side, and why.",
    description: "A dedicated card for the family spokesperson or linguist on each side — with their photo, role and a short note explaining the honour of the position.",
    tint: "from-purple-500 to-indigo-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎙️",
  },
  {
    n: 11, icon: Heart,
    category: "Parents",
    shortLabel: "Parents",
    title: "Meet the Parents Cards",
    short: "Both sets of parents, honoured properly.",
    description: "Beautiful cards for each set of parents — with photos, names, and a short line from the couple thanking them for making this day possible.",
    tint: "from-rose-400 to-pink-600", soft: "bg-rose-50", accent: "text-rose-700", emoji: "💗",
  },
  {
    n: 12, icon: Users,
    category: "Family",
    shortLabel: "Family",
    title: "Family Tree",
    short: "Both families, side by side, with photos and roles.",
    description: "A shared family tree section — parents, siblings, uncles, aunties, grandparents — from both families. So no guest is ever confused about who's who at the ceremony.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "👨‍👩‍👧‍👦",
  },
  {
    n: 15, icon: Camera,
    category: "Gallery",
    shortLabel: "Pre-Shoot",
    title: "Pre-Engagement Photos Gallery",
    short: "Your couple shoot, front and centre.",
    description: "A cinematic gallery of your pre-engagement shoot — full-screen, tap-to-zoom, background music optional — so guests see the love before they show up to celebrate it.",
    tint: "from-cyan-500 to-blue-600", soft: "bg-cyan-50", accent: "text-cyan-700", emoji: "📸",
  },
  {
    n: 24, icon: Frame,
    category: "Guest Fun",
    shortLabel: "Frame",
    title: "Photo Booth Frame",
    short: "Custom frames for engagement selfies.",
    description: "A shareable, custom-designed photo frame guests overlay on their selfies at the ceremony — turning every guest's phone into a walking piece of your engagement branding.",
    tint: "from-fuchsia-400 to-purple-500", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "🖼️",
  },
  {
    n: 25, icon: MessageSquare,
    category: "Guest Book",
    shortLabel: "Wishes",
    title: "Live Guestbook Wall",
    short: "Wishes and blessings, live on the invitation.",
    description: "Guests leave real-time wishes, prayers and blessings that stream onto the invitation. Every kind word from every family member — kept forever, in one place.",
    tint: "from-orange-400 to-amber-500", soft: "bg-orange-50", accent: "text-orange-700", emoji: "💌",
  },
  {
    n: 26, icon: Bell,
    category: "What's Next",
    shortLabel: "Wedding",
    title: "Save-the-Date for the Wedding",
    short: "The engagement invite links to what's next.",
    description: "A linked teaser for the wedding day — dates, countdown, one-tap to the full wedding invitation once it drops. Guests never miss the follow-up.",
    tint: "from-yellow-400 to-amber-500", soft: "bg-yellow-50", accent: "text-yellow-700", emoji: "📅",
  },
  {
    n: 32, icon: Music,
    category: "Private",
    shortLabel: "After-Party",
    title: "After-Party Page",
    short: "A private link for the reception.",
    description: "A separate, unlisted page for the after-party or reception — details, dress code, playlist request — shared only with the close friends and cousins invited to stay on.",
    tint: "from-indigo-500 to-purple-600", soft: "bg-indigo-50", accent: "text-indigo-700", emoji: "🎶",
  },
];

const testimonials = [
  { name: "Nana & Kojo Boateng", location: "Kumasi", quote: "The knocking ceremony page was exactly what our families needed. Both sides felt honoured, and the elders were impressed with how organised it looked." },
  { name: "Efua Owusu", location: "Cape Coast", quote: "My aunties in the UK could see everything — even the pre-engagement photos. They felt like they were part of the day." },
  { name: "Kwabena Asare", location: "Accra", quote: "The family spokesperson bios were a beautiful touch. Our okyeame was so proud to see himself featured on the invitation." },
];

const faqs = [
  { question: "How long does an engagement invitation take?", answer: "Standard delivery is 4–6 business days. Rush delivery in 48 hours is available for an additional fee." },
  { question: "Can we separate the knocking from the main engagement?", answer: "Yes. We build a dedicated page for the knocking ceremony that's clearly distinct from the main engagement day, with its own schedule and family listing." },
  { question: "Can we hide the after-party page from the general invite?", answer: "Absolutely. The after-party page is unlisted — only guests you share the private link with can access it." },
  { question: "Can family abroad access it?", answer: "Yes. The link works on any device anywhere. Aunties in London or cousins in New York can view every detail and RSVP." },
  { question: "Can we update details after it goes live?", answer: "Yes. Venue, time, dress code — any change is updated once and every guest sees the latest." },
];

export default function EngagementInvitations() {
  return (
    <Layout>
      <SEO
        title="Engagement Invitations Ghana — Customary Marriage & Knocking Ceremonies"
        description="Beautiful digital engagement invitations for Ghanaian customary marriages and knocking ceremonies. Family spokesperson cards, dowry lists, kente-inspired designs, RSVP tracking — one link, every relative."
        keywords="engagement invitations Ghana, customary marriage invitation, knocking ceremony invite, traditional wedding invitation Ghana, digital engagement invitation Accra, abusuapanin, okyeame"
        canonical="/engagement-invitations"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian engagement ceremony"
        imageObjectPos="center 30%"
        chip="For Ghanaian Engagements"
        heading="Two Families."
        headingHighlight="One Dignified Invite."
        subheading="From the knocking to the customary — kente-honoured, family-first, and elder-approved. One link, every uncle and aunty can open."
        primaryCta={{ label: "Start Your Engagement Invitation", href: "/get-started?eventType=Engagement" }}
        secondaryCta={{ label: "See Engagement Examples", href: "/portfolio?type=engagement" }}
        trustRow={["150+ Ghanaian couples", "Kente-honoured designs", "Every family, every uncle"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={engagementSpecialFeatures}
        chip="Engagement-only features"
        heading="Built for Ghanaian Engagements"
        subheading="Ten features that honour the tradition — from the knocking to the after-party — each one shaped around how our families actually do it."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every engagement invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From families who chose VibeLink"
        subheading="Real feedback from real Ghanaian engagement ceremonies."
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
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Prestige Vibe — GHS 2,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Ideal for engagements: kente-inspired design, family cards, knocking ceremony page, RSVP tracking, MoMo contributions and 5 revisions. Perfect for both the knocking and the customary day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Link to="/get-started?eventType=Engagement">
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
            intro="Hi 👋 Here are the top questions couples ask about engagement invitations — tap one to see the answer."
          />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-white">
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Honour the tradition. Impress every family.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital engagement invitation your uncles and aunties will actually be proud to share. Starting from GHS 1,500.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-2xl shadow-amber-900/30"
            >
              <Link to="/get-started?eventType=Engagement">
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
