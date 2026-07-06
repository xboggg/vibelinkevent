import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Search, Check, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";

// —— FAQ data (unchanged from before, still drives JSON-LD schema)  ——
const faqCategories = [
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

// Blue double-tick (WhatsApp "read" ticks) — tiny inline SVG
const BlueTicks = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 5L3 7.5L7 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 5L9 7.5L13 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FAQ = () => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const allCategoryChips = ["All", ...faqCategories.map((c) => c.category)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqCategories
      .filter((cat) => category === "All" || cat.category === category)
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [category, query]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Deterministic-ish per-question timestamp so the chat looks alive but stable
  const timeFor = (i: number) => {
    const base = 9 * 60 + 12; // 09:12
    const t = (base + i * 3) % (24 * 60);
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return (
    <Layout>
      <SEO
        title="Frequently Asked Questions"
        description="Everything you need to know about VibeLink Event's digital invitation service — delivery times, revisions, payment, features, and more."
        keywords="VibeLink FAQ, digital invitation questions, how long invitation takes Ghana, digital invite payment"
        canonical="/faq"
        jsonLd={faqSchema}
      />

      {/* Hero — animated orbs, gradient text, wave with width=100% */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] relative overflow-hidden">
        {/* Floating orbs */}
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
        {/* Subtle plus-pattern texture */}
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

        {/* Wave divider with width=100% so no seam on wide viewports */}
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

      {/* Chat FAQ */}
      <section className="py-14 lg:py-20 bg-gradient-to-b from-background via-purple-50/40 to-background dark:via-purple-950/10">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-4"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </motion.div>

          {/* Category chips (horizontal scroll on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {allCategoryChips.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  category === c
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/30"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </motion.div>

          {/* Chat window */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-3xl bg-[#efeae2] dark:bg-[#0b141a] shadow-2xl shadow-primary/10 border border-black/5 dark:border-white/5 overflow-hidden"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M20 20 Q30 15 40 20 T60 20 M60 30 Q70 25 80 30 T100 30 M20 50 Q30 45 40 50 T60 50 M20 80 Q30 75 40 80 T60 80 M60 70 Q70 65 80 70 T100 70'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            {/* WhatsApp-style chat header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-black/5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                  VL
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#f0f2f5] dark:border-[#202c33]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">VibeLink Team</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">online</p>
              </div>
              <MessageCircle className="h-5 w-5 text-gray-500" />
            </div>

            {/* Messages area */}
            <div className="p-4 space-y-1 min-h-[400px] max-h-[70vh] overflow-y-auto">
              {/* Intro bubble from VibeLink */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-start mb-2"
              >
                <div className="relative max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
                  <p className="text-[11px] font-semibold text-primary mb-0.5">VibeLink Team</p>
                  <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">
                    Hi there 👋 Tap any question below and we'll reply with the answer. Search or filter above if you're looking for something specific.
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1 text-right">{timeFor(0)}</span>
                </div>
              </motion.div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No questions match "<span className="font-medium">{query}</span>"
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((cat, catIdx) => (
                  <div key={cat.category}>
                    {/* Category "day pill" (WhatsApp date separator style) */}
                    <div className="flex justify-center my-4">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="px-3 py-1 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm text-[11px] font-medium text-gray-600 dark:text-gray-300 shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span>{cat.icon}</span> {cat.category}
                      </motion.span>
                    </div>

                    {cat.faqs.map((faq, i) => {
                      const id = `${cat.category}-${i}`;
                      const isOpen = openIds.has(id);
                      const messageIdx = catIdx * 10 + i;
                      return (
                        <div key={id} className="space-y-1.5 mb-2">
                          {/* User question — right, green bubble, clickable */}
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.35 }}
                            className="flex justify-end"
                          >
                            <button
                              onClick={() => toggleOpen(id)}
                              className="text-left group focus:outline-none"
                            >
                              <div
                                className={`relative max-w-[calc(100vw-6rem)] md:max-w-[420px] px-3.5 py-2 rounded-lg rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] shadow-sm group-hover:brightness-95 dark:group-hover:brightness-110 transition-all ${
                                  isOpen ? "ring-2 ring-primary/50" : ""
                                }`}
                              >
                                <p className="text-sm text-gray-900 dark:text-white leading-snug">{faq.question}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[10px] text-gray-500 dark:text-gray-300">{timeFor(messageIdx * 2 + 1)}</span>
                                  <BlueTicks />
                                </div>
                              </div>
                            </button>
                          </motion.div>

                          {/* Answer — left, white bubble, animates in on toggle */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key="answer"
                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="flex justify-start"
                              >
                                <div className="relative max-w-[calc(100vw-6rem)] md:max-w-[420px] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
                                  <p className="text-[11px] font-semibold text-primary mb-0.5">VibeLink Team</p>
                                  <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{faq.answer}</p>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1 text-right">
                                    {timeFor(messageIdx * 2 + 2)}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Fake compose bar — visual only */}
            <div className="px-3 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 flex items-center gap-2">
              <div className="flex-1 rounded-full bg-white dark:bg-[#2a3942] px-4 py-2 text-xs text-muted-foreground">
                Tap a question above to see the reply…
              </div>
              <a
                href="https://wa.me/4915757178561"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
                aria-label="Ask on WhatsApp"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Below-chat CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20"
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
