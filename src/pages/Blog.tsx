import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CTASection } from "@/components/sections/CTASection";
import { Clock, ArrowRight, BookOpen, Search, X, ChevronDown, Loader2, Tag, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const POSTS_PER_LOAD = 9;

const categories = [
  { name: "All",               icon: "✨", color: "bg-[#6B46C1] text-white",        inactive: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
  { name: "Wedding",           icon: "💒", color: "bg-rose-500 text-white",          inactive: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" },
  { name: "Funeral & Memorial",icon: "🕊️", color: "bg-slate-700 text-white",         inactive: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200" },
  { name: "Anniversaries",     icon: "💝", color: "bg-amber-500 text-white",         inactive: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" },
  { name: "Church",            icon: "⛪", color: "bg-violet-600 text-white",        inactive: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
  { name: "Community",         icon: "🤝", color: "bg-teal-500 text-white",          inactive: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100" },
  { name: "Ghanaian Culture",  icon: "🇬🇭", color: "bg-green-600 text-white",         inactive: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
  { name: "Event Planning",    icon: "📋", color: "bg-blue-600 text-white",          inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { name: "Naming Ceremonies", icon: "👶", color: "bg-sky-500 text-white",           inactive: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100" },
  { name: "Inspirations",      icon: "💡", color: "bg-yellow-500 text-white",        inactive: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100" },
  { name: "Tips & Guides",     icon: "📚", color: "bg-orange-500 text-white",        inactive: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string;
  read_time: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  tags: string[];
}

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag"));
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_LOAD);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) setActiveTag(tag);
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, image_url, read_time, featured, published_at, created_at, tags")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      (post.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          (post.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (activeCategory !== "All") {
      filtered = filtered.filter((post) => post.category === activeCategory);
    }

    if (activeTag) {
      filtered = filtered.filter((post) => (post.tags || []).includes(activeTag));
    }

    return filtered;
  }, [posts, searchQuery, activeCategory, activeTag]);

  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(POSTS_PER_LOAD);
  }, [searchQuery, activeCategory, activeTag]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_LOAD);
  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_LOAD;
    return filteredPosts.slice(start, start + POSTS_PER_LOAD);
  }, [filteredPosts, currentPage]);
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 4);
  const hasMorePosts = visibleCount < filteredPosts.length;
  const remainingPosts = filteredPosts.length - visibleCount;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("articles-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.icon || "📄";
  };

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return { active: cat?.color || "bg-primary text-white", inactive: cat?.inactive || "bg-muted text-muted-foreground border-border" };
  };

  return (
    <Layout>
      <SEO
        title="Blog - Event Planning Resources"
        description="Tips, guides and inspiration for planning your Ghanaian wedding, funeral, naming ceremony and more. Learn about traditions and modern event planning."
        keywords="Ghana event planning blog, wedding traditions Ghana, funeral planning tips, naming ceremony guide"
        canonical="/blog"
      />

      {/* Hero — clean, just title + search */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#322659] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-secondary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>VibeLink Event Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Event Planning <span className="text-secondary">Resources</span> & Inspiration
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              Your guide to beautiful Ghanaian ceremonies. Tips, traditions, and inspiration for every occasion.
            </p>
            {/* Search bar in hero */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search articles by title, topic, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-6 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 text-base"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category tabs — separate bar below hero, matching portfolio style */}
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, i) => (
              <motion.button
                key={category.name}
                onClick={() => { setActiveCategory(category.name); setActiveTag(null); }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ scale: 1.07, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border shadow-sm ${
                  activeCategory === category.name
                    ? `${category.color} shadow-md`
                    : category.inactive
                }`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </motion.button>
            ))}
          </div>
          {activeTag && (
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary">
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">{activeTag}</span>
                <button onClick={() => setActiveTag(null)} className="ml-1 hover:bg-secondary/20 rounded-full p-0.5">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Posts — Style B Editorial Split */}
      {!loading && featuredPosts.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-[#322659] to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <h2 className="text-xl font-bold text-white">Featured Stories</h2>
              <span className="ml-auto text-white/50 text-sm hidden lg:block">Editor's Selection</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">

              {/* LEFT — Big Feature (3/5 width) */}
              {featuredPosts[0] && (
                <motion.article
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-3 group relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{ minHeight: '520px' }}
                >
                  <Link to={`/blog/${featuredPosts[0].slug}`} className="block h-full">
                    <img
                      src={featuredPosts[0].image_url}
                      alt={featuredPosts[0].title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Multi-stop gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

                    {/* Top badges */}
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg">
                        ⭐ EDITOR'S PICK
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(featuredPosts[0].category).active} shadow-lg`}>
                        {getCategoryIcon(featuredPosts[0].category)} {featuredPosts[0].category}
                      </span>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-secondary transition-colors leading-snug">
                        {featuredPosts[0].title}
                      </h3>
                      <p className="text-white/70 text-sm lg:text-base line-clamp-2 mb-5 hidden sm:block">
                        {featuredPosts[0].excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(featuredPosts[0].published_at || featuredPosts[0].created_at)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {featuredPosts[0].read_time}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-secondary font-semibold text-sm group-hover:gap-2.5 transition-all">
                          Read Story <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              )}

              {/* RIGHT — 3 Stacked Editorial Cards (2/5 width) */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {featuredPosts.slice(1, 4).map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: (index + 1) * 0.12 }}
                    className="group"
                  >
                    <Link to={`/blog/${post.slug}`} className="flex gap-3 bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/blog/adinkra-symbols-ghana.jpg'; }}
                        />
                      </div>
                      {/* Text */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1.5 w-fit ${getCategoryColor(post.category).active}`}>
                          {getCategoryIcon(post.category)} {post.category}
                        </span>
                        <h3 className="text-foreground font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time}</span>
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* spacer removed — search/categories now in hero */}

      {/* Blog Grid */}
      <section id="articles-section" className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeCategory === "All" ? "All Articles" : activeCategory}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or browse our categories.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setActiveTag(null);
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map((post, index) => {
                  const catColor = getCategoryColor(post.category);
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.5) }}
                      whileHover={{ y: -4 }}
                      className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/8 hover:border-primary/25 transition-all duration-300"
                    >
                      <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Category badge — color coded */}
                          <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ${catColor.active}`}>
                            {getCategoryIcon(post.category)} {post.category}
                          </span>
                          {post.featured && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold shadow-md">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-grow p-5">
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>

                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.published_at || post.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.read_time}
                              </span>
                            </div>
                            <span className="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                              Read <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {/* Previous */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-11 h-11 md:w-10 md:h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;
                    if (showEllipsisBefore || showEllipsisAfter) {
                      return <span key={`ellipsis-${page}`} className="text-muted-foreground px-1">…</span>;
                    }
                    if (!showPage) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                          currentPage === page
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : "border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-11 h-11 md:w-10 md:h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Social CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stay Inspired
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Follow us on social media for daily tips, inspiration, and behind-the-scenes looks at beautiful celebrations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "https://instagram.com/vibelinkevent",  label: "Follow on Instagram", cls: "bg-gradient-to-r from-purple-500 to-pink-500" },
                { href: "https://facebook.com/vibelinkevent",   label: "Like on Facebook",    cls: "bg-blue-600" },
                { href: "https://twitter.com/vibelinkevent",    label: "Follow on X",         cls: "bg-black" },
                { href: "https://tiktok.com/@vibelinkevent",    label: "Follow on TikTok",    cls: "bg-gradient-to-r from-black to-[#ff0050]" },
                { href: "https://wa.me/4915757178561",          label: "Chat on WhatsApp",    cls: "bg-[#25D366]" },
              ].map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${s.cls} text-white font-medium shadow-md hover:shadow-lg transition-shadow`}
                >
                  {s.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Blog;
