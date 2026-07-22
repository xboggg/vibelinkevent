import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import SEO, { createArticleSchema, createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import "@/styles/blog-content.css";
import { BlogAdSlot } from "@/components/blog/BlogAdSlot";
import { MagazineArticle, type MagazineArticleMeta } from "@/components/blog/MagazineArticle";
import { BlogComments } from "@/components/blog/BlogComments";

// Map blog post to a contextual CTA. Funeral readers get a memorial CTA,
// wedding readers get a wedding CTA, etc. Matches against category, title,
// and slug so articles tagged generically (e.g. "Event Planning") still get
// the right CTA based on subject keywords.
function getCategoryCTA(category?: string, title?: string, slug?: string) {
  const c = `${category || ""} ${title || ""} ${slug || ""}`.toLowerCase();
  if (c.includes("funeral") || c.includes("memorial")) {
    return {
      heading: "Lost someone you love?",
      pitch: "Build a dignified memorial page family can revisit forever — one link, shared via WhatsApp.",
      buttonText: "Build a Memorial Page",
      url: "/funeral-programs",
    };
  }
  if (c.includes("naming") || c.includes("outdooring") || c.includes("baby")) {
    return {
      heading: "Welcoming a new baby?",
      pitch: "Create an outdooring invitation diaspora family can open in one tap.",
      buttonText: "Start Your Outdooring Invite",
      url: "/naming-ceremony",
    };
  }
  if (c.includes("wedding") || c.includes("bride") || c.includes("couple")) {
    return {
      heading: "Planning your Ghanaian wedding?",
      pitch: "RSVP tracking, photo gallery, livestream, wish wall — all in one share-able link.",
      buttonText: "Create Your Wedding Invite",
      url: "/wedding-invitations",
    };
  }
  if (c.includes("church") || c.includes("harvest") || c.includes("thanksgiving")) {
    return {
      heading: "Hosting a church event?",
      pitch: "Get your members to actually show up — invitations, programmes and live updates.",
      buttonText: "Create Your Church Invite",
      url: "/church-events",
    };
  }
  if (c.includes("corporate") || c.includes("business") || c.includes("agm")) {
    return {
      heading: "Running a corporate event?",
      pitch: "Make a first impression that arrives before the day. RSVP-tracked, brand-aligned.",
      buttonText: "Create Your Corporate Invite",
      url: "/corporate-events",
    };
  }
  if (c.includes("birthday") || c.includes("anniversary")) {
    return {
      heading: "Marking a milestone?",
      pitch: "From 1st to 70th — a birthday invitation people actually open and remember.",
      buttonText: "Start Your Invite",
      url: "/birthday",
    };
  }
  if (c.includes("graduation") || c.includes("academic")) {
    return {
      heading: "Graduating soon?",
      pitch: "Family abroad shouldn't miss it. One link, photos, livestream, the whole moment.",
      buttonText: "Create Your Graduation Invite",
      url: "/graduation",
    };
  }
  return {
    heading: "Planning a Ghanaian event?",
    pitch: "Get a beautiful digital invitation your guests will never forget.",
    buttonText: "Start Your Invitation",
    url: "/get-started",
  };
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  tags: string[];
  series_slug: string | null;
  series_order: number | null;
}

interface BlogSeries {
  slug: string;
  title: string;
  description: string | null;
  post_count: number;
}

interface SeriesSibling {
  slug: string;
  title: string;
  series_order: number;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [series, setSeries] = useState<BlogSeries | null>(null);
  const [seriesSiblings, setSeriesSiblings] = useState<SeriesSibling[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    try {
      // Posts with published=true AND published_at in the future are scheduled —
      // we treat them as "not yet released" on the public site.
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .lte('published_at', nowIso)
        .single();

      if (error) throw error;
      setPost(data);

      if (data) {
        // Increment view count (fire-and-forget)
        supabase.rpc("increment_post_view", { p_slug: postSlug }).then(() => {});

        // Related posts — smarter ranking:
        //   1. Same category (excluding current + siblings in same series so
        //      we don't repeat what's already in the series nav)
        //   2. If <5, top up with posts sharing at least one tag
        //   3. If still <5, top up with most-recent posts in ANY category
        const seed: Record<string, BlogPost> = {};
        const addAll = (arr: BlogPost[] | null) => (arr || []).forEach((p) => {
          if (p.id !== data.id && !seed[p.id]) seed[p.id] = p;
        });

        const catQ = supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .lte("published_at", nowIso)
          .eq("category", data.category)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(6);
        // Exclude sibling series posts so we don't repeat them (they show in series nav)
        const { data: catPosts } = data.series_slug
          ? await catQ.or(`series_slug.is.null,series_slug.neq.${data.series_slug}`)
          : await catQ;
        addAll(catPosts as BlogPost[] | null);

        if (Object.keys(seed).length < 5 && data.tags?.length) {
          const { data: tagPosts } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("published", true)
            .lte("published_at", nowIso)
            .neq("id", data.id)
            .overlaps("tags", data.tags)
            .order("published_at", { ascending: false })
            .limit(6);
          addAll(tagPosts as BlogPost[] | null);
        }

        if (Object.keys(seed).length < 5) {
          const { data: latest } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("published", true)
            .lte("published_at", nowIso)
            .neq("id", data.id)
            .order("published_at", { ascending: false })
            .limit(6);
          addAll(latest as BlogPost[] | null);
        }

        setRelatedPosts(Object.values(seed).slice(0, 5));

        // If this post belongs to a series, fetch series meta + all siblings
        if (data.series_slug) {
          const [seriesRes, siblingsRes] = await Promise.all([
            supabase.from("blog_series").select("*").eq("slug", data.series_slug).single(),
            supabase
              .from("blog_posts")
              .select("slug, title, series_order")
              .eq("series_slug", data.series_slug)
              .eq("published", true)
              .lte("published_at", nowIso)
              .order("series_order", { ascending: true }),
          ]);
          setSeries(seriesRes.data || null);
          setSeriesSiblings(siblingsRes.data || []);
        } else {
          setSeries(null);
          setSeriesSiblings([]);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  // Legacy HTML support: inject ids on h2 tags for anchor scrolling.
  // Only used if content is HTML (starts with `<`). All new posts are
  // markdown and are handled by MagazineArticle instead.
  const contentWithIds = useMemo(() => {
    if (!post?.content) return "";
    let idx = 0;
    return post.content.replace(/<h2([^>]*)>/gi, () => `<h2$1 id="toc-${idx++}">`);
  }, [post?.content]);

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SEO 
          title="Article Not Found"
          description="The article you're looking for doesn't exist or has been removed."
          noindex={true}
        />
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Article not found
            </h1>
            <p className="text-muted-foreground mb-8">
              This article doesn't exist or is coming soon.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  // Use meta_description if available, fallback to excerpt
  const seoDescription = post.meta_description || post.excerpt;

  // OG / Twitter crawlers don't run JavaScript and they don't resolve
  // relative URLs against window.location — they need a fully-qualified
  // absolute URL. Convert post.image_url to absolute here.
  const siteOrigin = "https://vibelinkevent.com";
  const absoluteOgImage = post.image_url
    ? (post.image_url.startsWith("http") ? post.image_url : `${siteOrigin}${post.image_url.startsWith("/") ? "" : "/"}${post.image_url}`)
    : `${siteOrigin}/og-image.jpg`;
  
  // Build keywords from focus_keyword, category, and tags
  const keywordParts = [
    post.focus_keyword,
    post.category,
    ...(post.tags || []),
    'Ghana events',
    'VibeLink blog'
  ].filter(Boolean);
  const seoKeywords = keywordParts.join(', ');

  // Create rich BlogPosting schema for this article — feeds Google's rich
  // results for articles and helps E-E-A-T signals.
  const wordCount = post.content?.split(/\s+/).filter(Boolean).length;
  const articleSchema = createArticleSchema({
    title: post.title,
    description: seoDescription,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: "Edmund Adjekum",
    authorRole: "Founder & Lead Viber",
    image: post.image_url,
    url: `/blog/${slug}`,
    category: post.category,
    tags: post.tags,
    wordCount,
    seriesTitle: series?.title,
    seriesUrl: series ? `/blog/series/${series.slug}` : undefined,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  // Magazine renderer meta — Edmund's Supabase photo, series info if any.
  const magazineMeta: MagazineArticleMeta = {
    title: post.title,
    category: post.category,
    publishedAt: post.published_at || post.created_at,
    readTime: post.read_time,
    excerpt: post.excerpt,
    heroImage: post.image_url,
    author: {
      name: "Edmund Adjekum",
      role: "Founder & Lead Viber",
      photoUrl:
        "https://luuztlneysofymmuoxie.supabase.co/storage/v1/object/public/team-photos/4a4c13d6-ae68-4c1a-8346-e8b8228c5c10.jpg",
    },
    series: series
      ? {
          slug: series.slug,
          title: series.title,
          part: post.series_order || 1,
          total: series.post_count,
        }
      : undefined,
  };

  // Detect content type — new posts are markdown, legacy posts were HTML.
  // Everything after our 2026-07-18 re-seed is markdown.
  const isMarkdown = !post.content.trim().startsWith("<");

  // Prev/next in series
  const currentIdx = seriesSiblings.findIndex((s) => s.slug === slug);
  const prevInSeries = currentIdx > 0 ? seriesSiblings[currentIdx - 1] : null;
  const nextInSeries =
    currentIdx >= 0 && currentIdx < seriesSiblings.length - 1
      ? seriesSiblings[currentIdx + 1]
      : null;

  return (
    <Layout>
      <SEO
        title={post.title}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={`/blog/${slug}`}
        ogImage={absoluteOgImage}
        ogType="article"
        articleAuthor="Edmund Adjekum"
        articleSection={post.category}
        articleTags={post.tags}
        articlePublishedTime={post.published_at || post.created_at}
        articleModifiedTime={post.updated_at}
        rssUrl="https://vibelinkevent.com/blog/rss.xml"
        rssTitle="VibeLink Event Blog"
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      
      {/* Slim "back to blog" strip above the magazine article */}
      <div className="pt-24 lg:pt-28 pb-4 bg-gradient-to-b from-[#6B46C1] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary-foreground/85 hover:text-secondary transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>

      {/* ── Magazine article — hero + body + author card + share rail ── */}
      {isMarkdown ? (
        <MagazineArticle meta={magazineMeta} markdown={post.content} />
      ) : (
        <section className="py-8 lg:py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(contentWithIds, {
                  ADD_ATTR: ["style", "class"],
                  ADD_TAGS: ["aside"],
                }),
              }}
            />
          </div>
        </section>
      )}

      {/* ── Series navigation ── */}
      {series && (prevInSeries || nextInSeries) && (
        <section className="py-10 bg-gradient-to-b from-background to-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Part {post.series_order} of {series.post_count}
                </p>
                <h3 className="text-lg font-bold text-foreground">{series.title}</h3>
              </div>
              <Link
                to={`/blog/series/${series.slug}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-primary font-semibold hover:gap-2 transition-all"
              >
                See all in series <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {prevInSeries ? (
                <Link
                  to={`/blog/${prevInSeries.slug}`}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <ArrowLeft className="h-4 w-4 text-primary shrink-0 mt-1 group-hover:-translate-x-1 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Previous — Part {prevInSeries.series_order}
                    </p>
                    <p className="text-sm font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                      {prevInSeries.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextInSeries ? (
                <Link
                  to={`/blog/${nextInSeries.slug}`}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all md:text-right"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Next — Part {nextInSeries.series_order}
                    </p>
                    <p className="text-sm font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                      {nextInSeries.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Tags ── */}
      {post.tags && post.tags.length > 0 && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-foreground/80 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contextual CTA ── */}
      {(() => {
        const cta = getCategoryCTA(post.category, post.title, post.slug);
        return (
          <section className="py-10 bg-background">
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
              <div className="rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#44337A] p-8 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-secondary text-xs font-bold uppercase tracking-widest">VibeLink Event</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">{cta.heading}</h3>
                <p className="text-white/85 mb-6 leading-relaxed">{cta.pitch}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold gap-2">
                    <Link to={cta.url}>
                      {cta.buttonText} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── Related posts ── */}
      {relatedPosts.length > 0 && (
        <section className="py-14 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">More reads</p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trending in {post.category}</h2>
              </div>
              <Link
                to={`/blog?category=${encodeURIComponent(post.category)}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-primary font-semibold hover:gap-2 transition-all"
              >
                See all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.slice(0, 3).map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    <img
                      src={rp.image_url}
                      alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">{rp.category}</p>
                    <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rp.read_time}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Comments ── */}
      <BlogComments postId={post.id} />

      {/* ── Ad slots at the bottom ── */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl grid sm:grid-cols-2 gap-4">
          <BlogAdSlot size="300x250" />
          <BlogAdSlot size="300x250" />
        </div>
      </section>

    </Layout>
  );
};

export default BlogDetail;
