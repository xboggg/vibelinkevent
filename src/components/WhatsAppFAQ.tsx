import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";

// A single flat FAQ (used by most inline sections)
export interface WhatsAppFAQItem {
  question: string;
  answer: string;
}

// Categorised FAQs (used by the dedicated /faq page)
export interface WhatsAppFAQCategory {
  category: string;
  icon?: string; // emoji
  faqs: WhatsAppFAQItem[];
}

interface WhatsAppFAQProps {
  // Provide EITHER a flat list...
  faqs?: WhatsAppFAQItem[];
  // ...OR grouped categories with optional emoji + filter chips
  categories?: WhatsAppFAQCategory[];
  // Chat header + WhatsApp button href
  waNumber?: string; // digits only, no + (e.g. "4915757178561")
  // If true (default on categorised), render category chips + search input above chat
  showFilters?: boolean;
  // Custom intro bubble text
  intro?: string;
  // Container className passthrough
  className?: string;
}

// WhatsApp blue read-tick
const BlueTicks = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M0.5 5L3 7.5L7 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 5L9 7.5L13 3" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Deterministic-ish per-question timestamp so the chat feels alive but stable
const timeFor = (i: number) => {
  const base = 9 * 60 + 12; // 09:12
  const t = (base + i * 3) % (24 * 60);
  const hh = String(Math.floor(t / 60)).padStart(2, "0");
  const mm = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

export function WhatsAppFAQ({
  faqs,
  categories,
  waNumber = "4915757178561",
  showFilters,
  intro = "Hi there 👋 Tap any question below and we'll reply with the answer.",
  className = "",
}: WhatsAppFAQProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  // Normalise input: always work with categories internally
  const normalised: WhatsAppFAQCategory[] = useMemo(() => {
    if (categories && categories.length) return categories;
    if (faqs && faqs.length) return [{ category: "Questions", faqs }];
    return [];
  }, [categories, faqs]);

  const isCategorised = (categories?.length ?? 0) > 1;
  const showChips = showFilters ?? isCategorised;

  const allCategoryChips = ["All", ...normalised.map((c) => c.category)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalised
      .filter((cat) => category === "All" || cat.category === category)
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [normalised, category, query]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalFaqs = normalised.reduce((sum, c) => sum + c.faqs.length, 0);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Search + category chips */}
      {showChips && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative mb-3"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${totalFaqs} questions...`}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
        </>
      )}

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-[#efeae2] dark:bg-[#0b141a] shadow-2xl shadow-primary/10 border border-black/5 dark:border-white/5 overflow-hidden"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M20 20 Q30 15 40 20 T60 20 M60 30 Q70 25 80 30 T100 30 M20 50 Q30 45 40 50 T60 50 M20 80 Q30 75 40 80 T60 80 M60 70 Q70 65 80 70 T100 70'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {/* Chat header */}
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
          <MessageCircle className="h-5 w-5 text-gray-500" aria-hidden />
        </div>

        {/* Messages */}
        <div className="p-4 space-y-1">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-start mb-2"
          >
            <div className="max-w-[85%] px-3.5 py-2 rounded-lg rounded-tl-none bg-white dark:bg-[#202c33] shadow-sm">
              <p className="text-[11px] font-semibold text-primary mb-0.5">VibeLink Team</p>
              <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">{intro}</p>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1 text-right">{timeFor(0)}</span>
            </div>
          </motion.div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-9 w-9 text-muted-foreground/40 mb-2" />
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
                {/* Category "day pill" — only shown when categorised */}
                {isCategorised && (
                  <div className="flex justify-center my-4">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="px-3 py-1 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm text-[11px] font-medium text-gray-600 dark:text-gray-300 shadow-sm inline-flex items-center gap-1.5"
                    >
                      {cat.icon && <span>{cat.icon}</span>} {cat.category}
                    </motion.span>
                  </div>
                )}

                {cat.faqs.map((faq, i) => {
                  const id = `${cat.category}-${i}`;
                  const isOpen = openIds.has(id);
                  const messageIdx = catIdx * 10 + i;
                  return (
                    <div key={id} className="space-y-1.5 mb-2">
                      {/* User question — sent bubble */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.35 }}
                        className="flex justify-end"
                      >
                        <button onClick={() => toggleOpen(id)} className="text-left group focus:outline-none">
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

                      {/* Answer — received bubble */}
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

        {/* Fake compose bar */}
        <div className="px-3 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 flex items-center gap-2">
          <div className="flex-1 rounded-full bg-white dark:bg-[#2a3942] px-4 py-2 text-xs text-muted-foreground">
            Tap a question above to see the reply…
          </div>
          <a
            href={`https://wa.me/${waNumber}`}
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
    </div>
  );
}
