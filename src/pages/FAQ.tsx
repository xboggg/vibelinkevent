import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";

const faqCategories = [
  {
    category: "Getting Started",
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
  mainEntity: faqCategories.flatMap(cat =>
    cat.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
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
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-4">
              Got Questions?
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Everything you need to know about our digital invitation service. Can't find your answer? WhatsApp us.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 50 720 60 0 20Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {faqCategories.map((cat, catIndex) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="mb-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary inline-block" />
                {cat.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {cat.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`${catIndex}-${i}`}
                    className="rounded-xl border border-border bg-card px-5 overflow-hidden data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}

          {/* Still have questions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
          >
            <h3 className="text-2xl font-bold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">Our team typically responds within 2 hours on WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
                <Link to="/get-started">
                  Start Your Invitation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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
