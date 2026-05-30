import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/sections/CTASection";
import { ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter, Loader2, Tag, List, ArrowRight, Sparkles } from "lucide-react";
import SEO, { createArticleSchema, createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import DOMPurify from "dompurify";

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
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    try {
      // Fetch the main post
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setPost(data);

      // Fetch related posts from the same category
      if (data) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  // Extract H2 headings from HTML content for Table of Contents
  const tocItems = useMemo(() => {
    if (!post?.content) return [];
    const matches = [...post.content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    return matches.map((m, i) => ({
      id: `toc-${i}`,
      text: m[1].replace(/<[^>]+>/g, "").trim(),
    }));
  }, [post?.content]);

  // Inject IDs into h2 tags for anchor scrolling
  const contentWithIds = useMemo(() => {
    if (!post?.content) return "";
    let idx = 0;
    return post.content.replace(/<h2([^>]*)>/gi, () => `<h2$1 id="toc-${idx++}">`);
  }, [post?.content]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

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
  
  // Build keywords from focus_keyword, category, and tags
  const keywordParts = [
    post.focus_keyword,
    post.category,
    ...(post.tags || []),
    'Ghana events',
    'VibeLink blog'
  ].filter(Boolean);
  const seoKeywords = keywordParts.join(', ');

  // Create article schema for this blog post
  const articleSchema = createArticleSchema({
    title: post.title,
    description: seoDescription,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: post.author_name,
    image: post.image_url,
    url: `/blog/${slug}`,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  return (
    <Layout>
      <ReadingProgressBar />
      <SEO
        title={post.title}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={`/blog/${slug}`}
        ogImage={post.image_url}
        ogType="article"
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-8 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              {post.category}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/70">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.read_time}
              </span>
              <span className="text-primary-foreground/50">
                By {post.author_name}
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(tag => (
                  <Link 
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-xs hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

            {/* ── Left: Article content ── */}
            <div>
              {/* Featured image sits at the top of the content column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full rounded-2xl shadow-lg aspect-[16/9] object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {post.content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentWithIds) }}
                    className="[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ul>li]:text-muted-foreground [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>ol>li]:text-muted-foreground [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>a]:text-primary [&>a]:underline [&>img]:rounded-lg [&>img]:max-w-full"
                  />
                ) : (
                  <p className="text-muted-foreground">{post.excerpt}</p>
                )}
              </motion.div>

              {/* Share */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Share this article</h3>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleShare('facebook')} className="gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('twitter')} className="gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('copy')} className="gap-2">
                    <Share2 className="h-4 w-4" /> Copy Link
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Right: Sticky Sidebar ── */}
            <aside className="space-y-6 lg:sticky lg:top-24">

              {/* 1. Table of Contents */}
              {tocItems.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <List className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">In This Article</h3>
                  </div>
                  <ul className="space-y-2">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors leading-snug block py-1 border-l-2 border-transparent hover:border-primary pl-3"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2. Services CTA — contextualized to article category */}
              {(() => {
                const cta = getCategoryCTA(post.category, post.title, post.slug);
                return (
                  <div className="bg-gradient-to-br from-[#6B46C1] to-[#44337A] rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <span className="text-secondary text-xs font-bold uppercase tracking-wide">VibeLink Event</span>
                    </div>
                    <h3 className="font-bold text-base mb-2 leading-snug">{cta.heading}</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{cta.pitch}</p>
                    <Button asChild size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold gap-2">
                      <Link to={cta.url}>
                        {cta.buttonText} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                );
              })()}

              {/* 3. Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wide mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((rp) => (
                      <Link key={rp.id} to={`/blog/${rp.slug}`} className="group flex gap-3 hover:opacity-80 transition-opacity">
                        <img
                          src={rp.image_url}
                          alt={rp.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary mb-1">{rp.category}</p>
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {rp.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{rp.read_time}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </aside>
          </div>
        </div>
      </section>

      {/* Footer CTA — also contextualized */}
      {(() => {
        const cta = getCategoryCTA(post.category, post.title, post.slug);
        return (
          <section className="py-12 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-t border-border">
            <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
              <Sparkles className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-foreground mb-2">{cta.heading}</h3>
              <p className="text-muted-foreground mb-6">{cta.pitch}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Link to={cta.url}>{cta.buttonText} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </section>
        );
      })()}
    </Layout>
  );
};

export default BlogDetail;
