import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { WhatsAppFAQ, WhatsAppFAQCategory } from "@/components/WhatsAppFAQ";

const faqCategories: WhatsAppFAQCategory[] = [
  {
    category: "Getting Started",
    icon: "🚀",
    faqs: [
      {
        question: "How long does it take to create my digital invitation?",
        answer: "Standard delivery is 5–10 business days from when you provide all required details. Need it faster? We offer 48-hour express delivery at an additional fee.",
      },
      {
        question: "How do I place an order?",
        answer: "Simply click 'Get Started', fill in our quick 7-step form with your event details, choose your package, and complete payment. Our team will contact you via WhatsApp within 2 hours to confirm.",
      },
      {
        question: "What information do I need to provide?",
        answer: "Event type, date, time, venue, names of key people (couple, family etc.), your preferred colours and style, and any photos you'd like included. We'll guide you through everything.",
      },
    ],
  },
  {
    category: "Revisions & Changes",
    icon: "✏️",
    faqs: [
      {
        question: "Can I make changes after my invitation is created?",
        answer: "Yes — revisions are included in every package. Starter includes 1 round, Classic includes 2, Prestige includes 5, and Royal includes unlimited revisions. Additional rounds can be purchased as an add-on.",
      },
      {
        question: "Can I update event details after the invitation goes live?",
        answer: "Yes. Minor updates like venue changes, time corrections, or contact number updates can be made at any point before your event.",
      },
    ],
  },
  {
    category: "Sharing & Access",
    icon: "🔗",
    faqs: [
      {
        question: "How do guests access my digital invitation?",
        answer: "Your invitation comes with a unique link you can share via WhatsApp, SMS, email, or social media. Guests simply click the link — no app download or login required.",
      },
      {
        question: "Do you serve clients outside Ghana?",
        answer: "Absolutely. We serve clients across Africa, Europe, and beyond. With a presence in both Ghana and Germany, we understand diaspora needs well. Our invitations work on any device worldwide.",
      },
      {
        question: "How long does my invitation stay live?",
        answer: "Hosting duration depends on your package — Starter (30 days), Classic (90 days), Prestige (6 months), Royal (1 year). Extended hosting is available as an add-on.",
      },
    ],
  },
  {
    category: "Payment & Pricing",
    icon: "💳",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept MTN Mobile Money, bank transfers, and international card or bank transfer payments for clients outside Ghana.",
      },
      {
        question: "Can I pay in instalments?",
        answer: "Yes. You can pay a 50% deposit to start your project and the remaining 50% before delivery. Full payment upfront gets priority processing.",
      },
      {
        question: "Can I collect contributions through the invitation?",
        answer: "Yes. We can integrate Mobile Money collection directly into your invitation, making it easy for guests to contribute and for you to track all donations in real time.",
      },
    ],
  },
  {
    category: "Features & Add-ons",
    icon: "✨",
    faqs: [
      {
        question: "What features can my invitation include?",
        answer: "Depending on your package, features include RSVP tracking, countdown timer, photo gallery, guest messaging, live stream embed, Google Maps, background music, MoMo donation link, and more.",
      },
      {
        question: "Can I add a live stream to my invitation?",
        answer: "Yes. The Live Stream Embed add-on allows you to link a YouTube, Facebook Live, or Zoom stream directly on your invitation page so remote guests can watch in real time.",
      },
      {
        question: "Can guests RSVP through the invitation?",
        answer: "Yes — RSVP tracking is available on Classic packages and above. Guests click the RSVP button, fill a short form, and you see all responses in your dashboard.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((cat) =>
    cat.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    }))
  ),
};

const FAQ = () => {
  return (
    <Layout>
      <SEO
        title="Frequently Asked Questions"
        description="Everything you need to know about VibeLink Event's digital invitation service — delivery times, revisions, payment, features, and more."
        keywords="VibeLink FAQ, digital invitation questions, how long invitation takes Ghana, digital invite payment"
        canonical="/faq"
        jsonLd={faqSchema}
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        <motion.div
          className="absolute top-10 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400 inline-block"
              />
              Our team is online
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Ask us{" "}
              <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">
                anything
              </span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
              Read the chat below — every question people usually ask, answered in the same place you'll share your invitation.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            preserveAspectRatio="none"
            className="block w-full h-[40px] md:h-[60px]"
          >
            <path d="M0 60L1440 60L1440 20C1200 50 720 60 0 20Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Chat FAQ (shared component) */}
      <section className="py-14 lg:py-20 bg-gradient-to-b from-background via-purple-50/40 to-background dark:via-purple-950/10">
        <div className="container mx-auto px-4 lg:px-8">
          <WhatsAppFAQ categories={faqCategories} intro="Hi there 👋 Tap any question below and we'll reply with the answer. Search or filter above if you're looking for something specific." />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mt-8 text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Ready to start?
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Question we didn't cover?</h3>
            <p className="text-muted-foreground text-sm md:text-base mb-5">
              Skip the FAQ and message us directly. We reply within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md hover:shadow-lg shadow-primary/30">
                <Link to="/get-started">
                  Start Your Invitation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white shadow-md hover:shadow-lg shadow-green-500/30">
                <a href="https://wa.me/4915757178561" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
