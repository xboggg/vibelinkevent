// Reusable "magazine-styled" blog article renderer.
// Takes a markdown body + article meta and renders a full magazine-quality
// reading experience: drop cap, pull quotes, callout boxes, series badges,
// TOC, reading progress bar, scroll-triggered animations, Adinkra dividers.
//
// The renderer parses markdown into custom React components so `**pull quote**`
// or fenced callouts render as beautiful blocks — not plain text.
//
// HTML from the parser is passed through DOMPurify before injection, so any
// future user-generated content (comments etc.) is safe as well.
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import DOMPurify from "dompurify";
import { Clock, Calendar, ArrowRight, ChevronUp, BookOpen, Sparkles, Share2, Copy, Check, Twitter, Facebook } from "lucide-react";

// Configure DOMPurify once — we only allow inline formatting tags in article
// bodies. No scripts, no iframes, no event handlers.
const sanitize = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "a", "br", "code", "sup", "sub"],
    ALLOWED_ATTR: ["href", "class", "target", "rel"],
  });

// ─── Types ──────────────────────────────────────────────────────────
export interface MagazineArticleMeta {
  title: string;
  category: string;
  categoryChip?: { bg: string; text: string };
  publishedAt: string;                          // ISO
  readTime: string;                             // e.g. "5 min read"
  author: { name: string; role: string; photoUrl?: string };
  heroImage: string;
  series?: {
    slug: string;
    title: string;
    part: number;
    total: number;
  };
  excerpt?: string;
}

interface Props {
  meta: MagazineArticleMeta;
  markdown: string;                             // article body in markdown
}

// ─── Block model ────────────────────────────────────────────────────
type Block =
  | { kind: "heading"; level: 2 | 3; text: string; id: string; chapterNum?: number }
  | { kind: "para"; html: string; isFirst: boolean }
  | { kind: "pullquote"; text: string }
  | { kind: "callout"; variant: "tip" | "tradition" | "mistake"; text: string }
  | { kind: "divider" }
  | { kind: "closing"; html: string };          // final italic paragraph — auto-styled as sign-off

// tiny inline markdown → HTML (bold + italic + links only)
function inlineMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline underline-offset-2 hover:text-primary/80">$1</a>');
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseBlocks(md: string): Block[] {
  // Strip the H1 title + the byline line since we render those from meta
  const lines = md
    .split("\n")
    .filter((l) => !/^#\s/.test(l) && !/^\*By .+ · .+ · .+read\*/.test(l));

  const blocks: Block[] = [];
  let buffer: string[] = [];
  let paraCount = 0;

  const flushPara = () => {
    if (buffer.length === 0) return;
    const text = buffer.join(" ").trim();
    buffer = [];
    if (!text) return;

    // Callouts inside blockquotes: > **[Pro Tip]** ... / [Tradition] / [Mistake]
    const calloutMatch = text.match(/^>\s*\*\*\[(Pro Tip|Tradition|Mistake)\]\*\*\s*(.+)$/i);
    if (calloutMatch) {
      const label = calloutMatch[1].toLowerCase();
      const cleanText = calloutMatch[2];
      const variant = label === "pro tip" ? "tip" : label === "tradition" ? "tradition" : "mistake";
      blocks.push({ kind: "callout", variant, text: sanitize(inlineMd(cleanText)) });
      return;
    }

    // Pull quote — paragraph fully wrapped in double-quotes and reasonably short
    if (text.startsWith('"') && text.endsWith('"') && text.length < 300) {
      blocks.push({ kind: "pullquote", text: text.slice(1, -1) });
      return;
    }

    // Sign-off: italic-only line late in the article
    if (/^\*.+\*$/.test(text) && paraCount > 3) {
      blocks.push({ kind: "closing", html: sanitize(inlineMd(text.replace(/^\*|\*$/g, ""))) });
      return;
    }

    paraCount++;
    blocks.push({ kind: "para", html: sanitize(inlineMd(text)), isFirst: paraCount === 1 });
  };

  let h2Counter = 0;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2) {
      flushPara();
      h2Counter += 1;
      blocks.push({ kind: "heading", level: 2, text: h2[1], id: slugify(h2[1]), chapterNum: h2Counter });
      blocks.push({ kind: "divider" });
      continue;
    }
    if (h3) {
      flushPara();
      blocks.push({ kind: "heading", level: 3, text: h3[1], id: slugify(h3[1]) });
      continue;
    }
    if (!line) {
      flushPara();
      continue;
    }
    buffer.push(line);
  }
  flushPara();

  return blocks;
}

// ─── Adinkra SVG divider (Osrane ne Nsoromma) ───────────────────────
function AdinkraDivider() {
  return (
    <div className="flex items-center justify-center my-10 md:my-14 gap-4 text-primary/50" aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
      <svg viewBox="0 0 40 40" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4c8.8 0 16 7.2 16 16s-7.2 16-16 16S4 28.8 4 20c0-1.4.2-2.7.5-4A11 11 0 0 0 20 4z" opacity=".4"/>
        <path d="M20 14l2.4 4.8 5.3.8-3.9 3.7.9 5.3-4.7-2.5-4.7 2.5.9-5.3-3.9-3.7 5.3-.8L20 14z"/>
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
    </div>
  );
}

// ─── Callout box ─────────────────────────────────────────────────────
function Callout({ variant, text }: { variant: "tip" | "tradition" | "mistake"; text: string }) {
  const config = {
    tip:       { emoji: "💡", label: "Pro Tip",             bg: "bg-amber-50",  border: "border-amber-300", accent: "text-amber-800" },
    tradition: { emoji: "🇬🇭", label: "Ghanaian Tradition", bg: "bg-emerald-50",border: "border-emerald-300",accent: "text-emerald-800" },
    mistake:   { emoji: "⚠️", label: "Common Mistake",      bg: "bg-rose-50",   border: "border-rose-300",  accent: "text-rose-800" },
  }[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className={`my-8 rounded-2xl border-l-4 ${config.bg} ${config.border} shadow-sm p-5 md:p-6 flex gap-4`}
    >
      <div className="text-3xl md:text-4xl select-none">{config.emoji}</div>
      <div>
        <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ${config.accent}`}>
          {config.label}
        </div>
        <p className="text-foreground/85 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </motion.div>
  );
}

// ─── Pull quote ─────────────────────────────────────────────────────
function PullQuote({ text }: { text: string }) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative my-10 md:my-14 py-8 px-6 md:px-10 border-l-4 border-secondary bg-gradient-to-br from-amber-50/40 to-transparent"
    >
      <div className="absolute top-2 left-3 text-6xl font-serif text-secondary/25 select-none leading-none" aria-hidden>
        &ldquo;
      </div>
      <p className="relative text-xl md:text-2xl lg:text-3xl font-serif italic leading-snug text-foreground/90">
        {text}
      </p>
    </motion.blockquote>
  );
}

// ─── Reading progress bar ────────────────────────────────────────────
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary origin-left z-50"
      style={{ scaleX }}
      aria-hidden
    />
  );
}

// ─── Floating share / action rail ────────────────────────────────────
// Vertical column on desktop-left, subtle horizontal on mobile-top.
// Actions: WhatsApp share · Twitter share · Facebook share · Copy link.
function ShareRail({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(`${title} — via VibeLink Event`);
  const eUrl = encodeURIComponent(url);

  const links = [
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${text}%20${eUrl}`,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
      Icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: "Share on Twitter",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${eUrl}`,
      color: "hover:bg-black hover:text-white hover:border-black",
      Icon: <Twitter className="w-4 h-4" />,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${eUrl}`,
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
      Icon: <Facebook className="w-4 h-4" />,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Desktop vertical rail — left of content, appears after hero */}
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 bg-white/95 backdrop-blur border border-border rounded-full py-3 px-2 shadow-lg"
        aria-label="Share this article"
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ writingMode: "vertical-rl" }}>
          Share
        </span>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className={`w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground/70 transition-all ${l.color}`}
          >
            {l.Icon}
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className={`w-9 h-9 rounded-full flex items-center justify-center border border-border transition-all ${
            copied
              ? "bg-emerald-500 text-white border-emerald-500"
              : "text-foreground/70 hover:bg-primary hover:text-white hover:border-primary"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Mobile inline share bar — appears at bottom of the article body */}
      <div className="lg:hidden container mx-auto px-6 -mt-4 mb-10">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
            <Share2 className="w-3.5 h-3.5" /> Share
          </div>
          <div className="h-px flex-1 bg-border" />
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={l.label}
              className={`w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground/70 transition-all ${l.color}`}
            >
              {l.Icon}
            </a>
          ))}
          <button
            onClick={copyLink}
            aria-label="Copy link"
            className={`w-9 h-9 rounded-full flex items-center justify-center border border-border transition-all ${
              copied
                ? "bg-emerald-500 text-white border-emerald-500"
                : "text-foreground/70 hover:bg-primary hover:text-white hover:border-primary"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Back to top button ──────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
      className="fixed bottom-6 left-5 md:left-7 z-40 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-border text-foreground shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center"
      aria-label="Back to top"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <ChevronUp className="w-5 h-5" />
    </motion.button>
  );
}

// ─── Table of contents (desktop left rail) ──────────────────────────
function TableOfContents({ items }: { items: { id: string; text: string; level: 2 | 3 }[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0% -70% 0%", threshold: 0.1 }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block sticky top-32 self-start">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5" /> In this article
      </div>
      <nav className="space-y-1.5 border-l border-border pl-4">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`block text-xs leading-snug transition-colors ${
              it.level === 3 ? "pl-3" : ""
            } ${
              activeId === it.id
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {it.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

// ─── The magazine article ───────────────────────────────────────────
export function MagazineArticle({ meta, markdown }: Props) {
  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);
  const tocItems = useMemo(
    () =>
      blocks
        .filter((b): b is Extract<Block, { kind: "heading" }> => b.kind === "heading")
        .map((b) => ({ id: b.id, text: b.text, level: b.level })),
    [blocks]
  );

  const initials = meta.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const formattedDate = new Date(meta.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <>
      <ReadingProgress />

      <article className="bg-background">
        {/* ─── Hero ─── */}
        <header className="relative h-[70vh] md:h-[80vh] min-h-[500px] overflow-hidden">
          {/* Photo — slow zoom in over 12s */}
          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={meta.heroImage}
              alt={meta.title}
              className="w-full h-full object-cover"
              style={{
                // Duotone tint — subtle purple/gold cast so every hero feels curated
                filter: "saturate(1.05) contrast(1.05)",
              }}
            />
          </motion.div>

          {/* Duotone overlay — brand purple tinting the shadows,
              amber warmth in the mid-tones. Blends with the photo colours. */}
          <div
            className="absolute inset-0 mix-blend-multiply opacity-40"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 55%, hsl(var(--secondary)) 100%)" }}
            aria-hidden
          />

          {/* Editorial darkening for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/90" />

          {/* Film grain — barely-there noise for editorial feel */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.6'/></svg>\")",
            }}
            aria-hidden
          />

          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-14 md:pb-20">
            <div className="max-w-4xl mx-auto text-white">
              {/* Overline label — small, magazine-editorial */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3 mb-8"
              >
                <span className="h-px w-8 md:w-12 bg-white/50" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                  A VibeLink Story
                </span>
              </motion.div>

              {/* Chips — category + series */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-wrap items-center gap-3 mb-6"
              >
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${meta.categoryChip?.bg || "bg-secondary/90"} ${meta.categoryChip?.text || "text-secondary-foreground"}`}>
                  <Sparkles className="w-3.5 h-3.5" /> {meta.category}
                </span>
                {meta.series && (
                  <Link
                    to={`/blog/series/${meta.series.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white/25 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Part {meta.series.part} of {meta.series.total} · {meta.series.title}
                  </Link>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-8 drop-shadow-lg font-serif"
              >
                {meta.title}
              </motion.h1>

              {/* Byline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                {meta.author.photoUrl ? (
                  <img
                    src={meta.author.photoUrl}
                    alt={meta.author.name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-white/50 shadow-lg flex items-center justify-center font-bold text-white">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-base">{meta.author.name}</div>
                  <div className="text-xs md:text-sm text-white/70">{meta.author.role}</div>
                </div>
                <div className="hidden md:block h-8 w-px bg-white/30" />
                <div className="flex items-center gap-4 text-white/80 text-xs md:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {meta.readTime}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* ─── Body ─── */}
        <div className="container mx-auto px-6 py-14 md:py-20">
          <div className="grid xl:grid-cols-[240px_minmax(0,1fr)] gap-10 max-w-6xl mx-auto">
            <TableOfContents items={tocItems} />

            <div className="max-w-2xl mx-auto xl:mx-0 w-full">
              {meta.excerpt && (
                <p className="text-xl md:text-2xl leading-snug text-muted-foreground font-serif italic mb-10 pb-8 border-b border-border">
                  {meta.excerpt}
                </p>
              )}

              {blocks.map((b, i) => {
                switch (b.kind) {
                  case "heading":
                    return b.level === 2 ? (
                      <motion.div
                        key={i}
                        id={b.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6 }}
                        className="scroll-mt-24 mt-16 mb-8"
                      >
                        <div className="flex items-baseline gap-4 mb-3">
                          <span
                            className="text-5xl md:text-6xl font-black leading-none bg-gradient-to-b from-primary to-secondary bg-clip-text text-transparent select-none"
                            aria-hidden
                          >
                            {String(b.chapterNum || 1).padStart(2, "0")}
                          </span>
                          <div className="flex-1 flex items-center gap-3">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                              Chapter {b.chapterNum}
                            </span>
                            <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-serif text-foreground leading-[1.1]">
                          {b.text}
                        </h2>
                      </motion.div>
                    ) : (
                      <motion.h3
                        key={i}
                        id={b.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="scroll-mt-24 text-xl md:text-2xl font-bold mt-10 mb-4 text-foreground"
                      >
                        {b.text}
                      </motion.h3>
                    );

                  case "divider":
                    return <AdinkraDivider key={i} />;

                  case "para":
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5 }}
                        className={`text-base md:text-lg leading-[1.85] text-foreground/85 mb-6 font-serif ${
                          b.isFirst ? "first-para" : ""
                        }`}
                        dangerouslySetInnerHTML={{ __html: b.html }}
                      />
                    );

                  case "pullquote":
                    return <PullQuote key={i} text={b.text} />;

                  case "callout":
                    return <Callout key={i} variant={b.variant} text={b.text} />;

                  case "closing":
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-base md:text-lg leading-relaxed italic text-primary font-serif mt-10 pt-8 border-t border-border"
                        dangerouslySetInnerHTML={{ __html: b.html }}
                      />
                    );
                }
              })}
            </div>
          </div>
        </div>

        {/* Share rail — desktop fixed-left, mobile inline below body */}
        <ShareRail title={meta.title} />

        {/* ─── Author bio card ─── */}
        <section className="bg-gradient-to-br from-amber-50/40 via-background to-rose-50/30 border-y border-border">
          <div className="container mx-auto px-6 py-14 md:py-20 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
              {meta.author.photoUrl ? (
                <img
                  src={meta.author.photoUrl}
                  alt={meta.author.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg object-cover border-4 border-white shrink-0"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg flex items-center justify-center text-3xl font-bold text-white border-4 border-white shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Written by</div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{meta.author.name}</h3>
                <div className="text-sm text-primary font-semibold mb-3">{meta.author.role}</div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Founder of VibeLink Event — building beautiful digital invitations that honour the way Ghanaian families actually celebrate. From weddings in Kumasi to memorials in London, every event deserves an invitation as thoughtful as the moment.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:gap-2 transition-all"
                  >
                    More about VibeLink <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BackToTop />
      </article>

      <style>{`
        .first-para::first-letter {
          font-family: 'Fraunces', 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          float: left;
          font-size: 5.5em;
          line-height: 0.85;
          padding: 0.05em 0.1em 0 0;
          color: hsl(var(--primary));
          font-weight: 900;
          background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        article .font-serif {
          font-family: 'Fraunces', 'Cormorant Garamond', Georgia, serif;
        }
      `}</style>
    </>
  );
}
