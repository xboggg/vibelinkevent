// /blog/series/:slug — a single series, showing every part in reading order.
// Reader lands here to browse the whole set, click any part to start reading.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Loader2, Sparkles } from "lucide-react";

// Per-series focal point for the cover image crop. Portrait mobile crops the
// sides, so images whose key subject isn't centred need a nudge left/right.
// Format: "<x>% <y>%" (CSS object-position). Default: "center 20%".
const COVER_FOCUS: Record<string, string> = {
  "corporate-events-ghana": "30% 40%",   // speaker sits at ~30% from left
  // add more overrides as needed
};
function coverFocus(slug: string): string {
  return COVER_FOCUS[slug] || "center 20%";
}

interface BlogSeries {
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  post_count: number;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  read_time: string;
  series_order: number | null;
  published_at: string | null;
  category: string;
}

export default function BlogSeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [series, setSeries] = useState<BlogSeries | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const nowIso = new Date().toISOString();
      const [sRes, pRes] = await Promise.all([
        supabase.from("blog_series").select("*").eq("slug", slug).single(),
        supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, image_url, read_time, series_order, published_at, category")
          .eq("series_slug", slug)
          .eq("published", true)
          .lte("published_at", nowIso)
          .order("series_order", { ascending: true }),
      ]);
      setSeries(sRes.data || null);
      setPosts(pRes.data || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (!series) {
    return (
      <Layout>
        <SEO title="Series not found" noindex />
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Series not found</h1>
            <p className="text-muted-foreground mb-8">This series doesn&apos;t exist or hasn&apos;t been published yet.</p>
            <Button asChild>
              <Link to="/blog/series"><ArrowLeft className="mr-2 h-4 w-4" /> All Series</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: "Series", url: "/blog/series" },
    { name: series.title, url: `/blog/series/${series.slug}` },
  ]);

  return (
    <Layout>
      <SEO
        title={`${series.title} — Series`}
        description={series.description || `A ${series.post_count}-part series on the VibeLink Event blog.`}
        canonical={`/blog/series/${series.slug}`}
        ogImage={series.cover_image ? `https://vibelinkevent.com${series.cover_image}` : undefined}
        rssUrl="https://vibelinkevent.com/blog/rss.xml"
        jsonLd={[breadcrumbSchema]}
      />

      {/* Cinematic hero */}
      <section className="relative h-[60vh] md:h-[70vh] min-h-[420px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {series.cover_image ? (
            <img
              src={series.cover_image}
              alt={series.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: coverFocus(series.slug) }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-primary" />
          )}
        </motion.div>
        <div
          className="absolute inset-0 mix-blend-multiply opacity-40"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 55%, hsl(var(--secondary)) 100%)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/90" />

        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-14 md:pb-20">
          <div className="max-w-4xl mx-auto text-white">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <Link to="/blog/series" className="text-white/70 hover:text-white inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <ArrowLeft className="w-3.5 h-3.5" /> All Series
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/90 text-secondary-foreground text-xs font-bold uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" /> Series · {series.post_count} parts
              </span>
              {series.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-bold uppercase tracking-widest">
                  {series.category}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-5 drop-shadow-lg font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {series.title}
            </motion.h1>

            {series.description && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-base md:text-lg text-white/85 max-w-2xl leading-relaxed"
              >
                {series.description}
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* Post list */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Reading order
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No posts published in this series yet.</p>
          ) : (
            <ol className="space-y-4">
              {posts.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Link
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col md:flex-row gap-4 md:gap-5 p-4 md:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4 md:contents">
                      <div
                        className="text-4xl md:text-5xl font-black leading-none shrink-0 bg-gradient-to-b from-primary to-secondary bg-clip-text text-transparent select-none"
                        aria-hidden
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {String(p.series_order || i + 1).padStart(2, "0")}
                      </div>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Part {p.series_order || i + 1}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold leading-snug text-foreground mb-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {p.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {p.read_time}</span>
                        <span className="inline-flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all ml-auto">
                          Read part <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ol>
          )}

          {posts.length > 0 && (
            <div className="mt-10 pt-10 border-t border-border text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Link to={`/blog/${posts[0].slug}`}>
                  Start from Part 1 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Or jump to any part above.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
