// Rebuilt from scratch 2026-07-10 — matches /wedding-invitations pattern.
// Palette: champagne/gold/rose-gold — timeless, milestone-worthy.
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
  Images,
  ScrollText,
  MessageCircle,
  BookOpen,
  Award,
  ClipboardList,
  Heart,
  Video,
  MessageSquare,
  Baby,
} from "lucide-react";
import heroImg from "@/assets/service-anniversary.jpg";

const anniversarySpecialFeatures: SpecialFeature[] = [
  {
    n: 1, icon: Images,
    category: "Then & Now",
    shortLabel: "Then/Now",
    title: "Then vs Now Photo Comparison",
    short: "Your wedding day, side-by-side with today.",
    description: "A beautiful before-and-after gallery — original wedding photos placed alongside today's photos of the same couple. Guests see a lifetime of love, one moment at a time.",
    tint: "from-amber-400 to-yellow-500", soft: "bg-amber-50", accent: "text-amber-700", emoji: "📷",
  },
  {
    n: 3, icon: ScrollText,
    category: "Origins",
    shortLabel: "Recap",
    title: "Wedding Day Recap Page",
    short: "The original photos, vows, and venue — all preserved.",
    description: "A dedicated section revisiting the original wedding — the church, the vows exchanged that day, the guests who were there. A living archive of where it all began.",
    tint: "from-yellow-500 to-amber-600", soft: "bg-yellow-50", accent: "text-yellow-800", emoji: "💒",
  },
  {
    n: 4, icon: MessageCircle,
    category: "The Story",
    shortLabel: "Our Story",
    title: "How We Made It Work",
    short: "A personal note from the couple.",
    description: "The couple's own words — what kept them going through the years, the lessons learned, the moments they'll never forget. Honest, warm, and shared with the family.",
    tint: "from-rose-400 to-pink-500", soft: "bg-rose-50", accent: "text-rose-700", emoji: "💌",
  },
  {
    n: 8, icon: BookOpen,
    category: "Chapters",
    shortLabel: "Chapters",
    title: "Chapter Cards",
    short: "Dating, newlyweds, parents, empty-nesters.",
    description: "Beautifully-designed chapter cards for each phase of the marriage — the dating years, the newlywed years, the parenting years, and the years since. A whole life, curated.",
    tint: "from-orange-400 to-amber-500", soft: "bg-orange-50", accent: "text-orange-700", emoji: "📖",
  },
  {
    n: 13, icon: Award,
    category: "Officiant",
    shortLabel: "Minister",
    title: "Officiating Minister Bio",
    short: "The pastor leading the renewal, honoured.",
    description: "A dedicated card for the pastor or priest leading the vow renewal — with their photo, short bio, and a personal note from the couple. Often the same minister who officiated the original wedding.",
    tint: "from-blue-500 to-indigo-600", soft: "bg-blue-50", accent: "text-blue-700", emoji: "⛪",
  },
  {
    n: 14, icon: ClipboardList,
    category: "Programme",
    shortLabel: "Order",
    title: "Order of Ceremony",
    short: "The full timed programme, at a glance.",
    description: "A clear order of service — arrival, renewal of vows, message, blessings, reception. Guests know exactly what to expect and when, no confusion at the door.",
    tint: "from-purple-500 to-indigo-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "📋",
  },
  {
    n: 15, icon: Heart,
    category: "Memories",
    shortLabel: "Memory Wall",
    title: "Guest Memory Wall",
    short: "Collect stories and memories from every guest.",
    description: "Guests write down memories they share with the couple — the wedding day, holidays together, moments they'll never forget. A living archive family members can revisit forever.",
    tint: "from-fuchsia-400 to-pink-500", soft: "bg-fuchsia-50", accent: "text-fuchsia-700", emoji: "💭",
  },
  {
    n: 17, icon: Video,
    category: "Video",
    shortLabel: "Video",
    title: "Video Guestbook",
    short: "15-second video wishes from every guest.",
    description: "Every guest records a short video message — congratulations, favourite memory, a blessing for the years ahead. Stacked into a memory reel the couple keeps forever.",
    tint: "from-purple-500 to-fuchsia-600", soft: "bg-purple-50", accent: "text-purple-700", emoji: "🎥",
  },
  {
    n: 18, icon: MessageSquare,
    category: "Wishes Wall",
    shortLabel: "Wishes",
    title: "Live Guestbook Wall",
    short: "Wishes streaming onto the invitation live.",
    description: "Real-time messages from guests as they arrive, RSVP, or watch from abroad — heartfelt wishes stream onto the invitation. Every kind word from every corner of the family, kept in one place.",
    tint: "from-teal-500 to-emerald-600", soft: "bg-teal-50", accent: "text-teal-700", emoji: "💬",
  },
  {
    n: 22, icon: Baby,
    category: "The Kids",
    shortLabel: "Kids' Note",
    title: "Message from the Children",
    short: "The kids write about their parents.",
    description: "A dedicated page where the couple's children — no matter their age — share what their parents' love has meant to them. Often the most-read section of the whole invitation.",
    tint: "from-emerald-500 to-teal-600", soft: "bg-emerald-50", accent: "text-emerald-700", emoji: "👶",
  },
];

const testimonials = [
  { name: "Nana Ama & Kofi Mensah", location: "Accra", quote: "The 'then vs now' photo section had everyone in tears at the reception. Our kids were the ones who cried the most — and their message to us was the highlight of the whole day." },
  { name: "Auntie Grace Boateng", location: "Kumasi", quote: "For our silver anniversary, having the original wedding photos next to today's was magical. Cousins we hadn't seen since our wedding came back for the renewal." },
  { name: "Kwabena & Efua Owusu", location: "London, UK", quote: "Family in Ghana who couldn't fly to London watched the vow renewal live and left video wishes. It felt like everyone was together, wherever they were." },
];

const faqs = [
  { question: "Can you match the anniversary theme (silver / gold / diamond)?", answer: "Yes. We colour-match the invitation to your milestone — silver for 25, gold for 50, diamond for 60. Or design something entirely custom for you." },
  { question: "How long does an anniversary invitation take?", answer: "Standard delivery is 4–6 business days. Rush delivery in 48 hours is available for a small additional fee." },
  { question: "Can we include the original wedding photos?", answer: "Absolutely. Just send us the originals — we'll place them beside your today photos in the 'Then vs Now' gallery, or feature them on their own recap page." },
  { question: "Can family abroad watch the vow renewal?", answer: "Yes. We embed a livestream for family in the diaspora — grown children, grandchildren, extended family. Everyone joins from wherever they are." },
  { question: "Can we update details after it goes live?", answer: "Yes. Any change to venue, time, or dress code is updated once and every guest sees the latest instantly." },
];

export default function AnniversaryInvitations() {
  return (
    <Layout>
      <SEO
        title="Anniversary Invitations Ghana — Silver, Gold, Diamond Digital Cards"
        description="Digital anniversary invitations for Ghanaian couples celebrating 25, 50, or 60 years. Then-vs-now galleries, vow renewal, message from the children, video guestbook — one link, every guest."
        keywords="anniversary invitations Ghana, silver wedding invitation Ghana, golden wedding invite, vow renewal invitation Accra, 25th anniversary card, 50th anniversary invite"
        canonical="/anniversary-invitations"
        ogImage="https://vibelinkevent.com/og-image.jpg"
      />

      {/* 1. Cinematic hero */}
      <CinematicHero
        image={heroImg}
        imageAlt="Ghanaian couple celebrating anniversary"
        imageObjectPos="center 25%"
        chip="For Milestone Anniversaries"
        heading="Years That Matter."
        headingHighlight="Honoured With Grace."
        subheading="Silver. Gold. Diamond. Every year of love, remembered — the wedding day recap, the children's tributes, the vow renewal. All held together in one timeless link."
        primaryCta={{ label: "Start Your Anniversary Invite", href: "/get-started?eventType=Anniversary" }}
        secondaryCta={{ label: "See Anniversary Examples", href: "/portfolio?type=anniversary" }}
        trustRow={["100+ milestones celebrated", "Silver · Gold · Diamond", "Every year, remembered"]}
      />

      {/* 2. Special features carousel */}
      <SpecialFeaturesCarousel
        features={anniversarySpecialFeatures}
        chip="Anniversary-only features"
        heading="Built for Milestone Anniversaries"
        subheading="Ten features that turn the day into a keepsake — from then-vs-now photos to the messages your children write about you."
      />

      {/* 3. Common features grid */}
      <CommonFeaturesGrid
        chip="Also included in every anniversary invitation"
        heading="The Essentials, Built In"
        subheading="Six features every VibeLink invitation ships with — no matter the event type."
      />

      {/* 4. Testimonials */}
      <EventTestimonials
        testimonials={testimonials}
        heading="From couples who chose VibeLink"
        subheading="Real feedback from real Ghanaian anniversary celebrations."
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
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Prestige Vibe — GHS 2,500</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-base md:text-lg">
              Ideal for milestone anniversaries: 10-photo gallery for then-vs-now, video integration, MoMo gift link, custom design, 5 revisions and 6-month hosting. For diamond anniversaries or bigger family celebrations, Royal Vibe (GHS 4,000+) adds a custom domain and full host dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                <Link to="/get-started?eventType=Anniversary">
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
            intro="Hi 👋 Here are the top questions couples ask us about anniversary invitations."
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
              Your love story deserves more than a WhatsApp flyer.
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              A digital anniversary invitation that honours the years — with your original wedding photos, your children's words, and every memory kept forever. Starting from GHS 1,000.
            </p>
            <Button
              asChild
              size="lg"
              className="font-bold text-white px-10 py-6 text-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-2xl shadow-amber-900/30"
            >
              <Link to="/get-started?eventType=Anniversary">
                Create My Anniversary Invite <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-gray-500 text-sm mt-4">Free consultation · Draft in 24 hours · Money-back guarantee</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
