// /blog/series — index of every multi-part series on the blog.
// Cards show the series cover, title, description, and post count.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowRight, Sparkles, Loader2 } from "lucide-react";

// Per-series focal-point overrides (matches BlogSeriesDetail so the same
// image crops the same subject on both the index thumbnail and the hero).
const COVER_FOCUS: Record<string, string> = {
  "corporate-events-ghana": "30% 40%",
};
function coverFocus(slug: string): string {
  return COVER_FOCUS[slug] || "center 25%";
}

interface BlogSeries {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  post_count: number;
}

export default function BlogSeriesIndex() {
  const [series, setSeries] = useState<BlogSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("blog_series")
      .select("*")
      .order("post_count", { ascending: false });
    if (error) {
      // Distinguish real "no data" from a network/TLS/RLS failure. Empty state
      // should only show when the query genuinely returned 0 rows.
      console.error("[BlogSeriesIndex] load failed:", error);
      setLoadError(error.message || "Could not reach the series database.");
      setSeries([]);
    } else {
      setSeries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <SEO
        title="Series — VibeLink Event Blog"
        description="Deep-dives on Ghanaian weddings, funerals, naming ceremonies, graduations and more — organised as multi-part series for readers who want the full picture."
        canonical="/blog/series"
        rssUrl="https://vibelinkevent.com/blog/rss.xml"
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-14 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#322659]">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-secondary text-xs font-bold uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Multi-part reads
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Deep-Dives — Read the <span className="text-secondary">Full Story</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Every ceremony, every event type — unpacked in multi-part series so you get the whole picture, not just a headline.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 md:py-20 bg-background min-h-[400px]">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="max-w-md mx-auto text-center py-20">
              <BookOpen className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Couldn't load series</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Network or connection issue — often a VPN or TLS interception blocking the request.
                Try disabling any active VPN, or reload the page.
              </p>
              <button
                onClick={load}
                className="inline-flex items-center gap-1 text-primary font-semibold text-sm mr-4"
              >
                Try again
              </button>
              <Link to="/blog" className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
                Browse Blog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : series.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-20">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">No series yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Multi-part deep dives are coming soon. Meanwhile, browse the blog for standalone articles.
              </p>
              <Link to="/blog" className="inline-flex items-center gap-1 text-primary font-semibold">
                Browse Blog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {series.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    to={`/blog/series/${s.slug}`}
                    className="group block h-full rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all"
                  >
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {s.cover_image ? (
                        <img
                          src={s.cover_image}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          style={{ objectPosition: coverFocus(s.slug) }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-bold uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur">
                          <BookOpen className="w-3 h-3" /> {s.post_count} part{s.post_count === 1 ? "" : "s"}
                        </span>
                        {s.category && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary/90 text-secondary-foreground">
                            {s.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                      {s.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                      <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                        Read series <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
