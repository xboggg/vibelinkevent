import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ExternalLink, Inbox, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { portfolioItems, categories, slugToCategoryMap } from "@/data/portfolioItems";

const categoryStyles: Record<string, { active: string; inactive: string; dot: string }> = {
  All:           { active: "bg-[#6B46C1] text-white",         inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100",    dot: "bg-purple-400" },
  Weddings:      { active: "bg-rose-500 text-white",           inactive: "bg-rose-50 text-rose-600 hover:bg-rose-100",          dot: "bg-rose-400" },
  Engagements:   { active: "bg-yellow-600 text-white",         inactive: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",    dot: "bg-yellow-500" },
  Funerals:      { active: "bg-slate-700 text-white",          inactive: "bg-slate-100 text-slate-600 hover:bg-slate-200",      dot: "bg-slate-400" },
  Naming:        { active: "bg-sky-500 text-white",            inactive: "bg-sky-50 text-sky-600 hover:bg-sky-100",             dot: "bg-sky-400" },
  Anniversaries: { active: "bg-amber-500 text-white",          inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100",       dot: "bg-amber-400" },
  Graduations:   { active: "bg-emerald-600 text-white",        inactive: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", dot: "bg-emerald-400" },
  Church:        { active: "bg-violet-600 text-white",          inactive: "bg-violet-50 text-violet-700 hover:bg-violet-100",    dot: "bg-violet-400" },
  Birthdays:     { active: "bg-pink-500 text-white",           inactive: "bg-pink-50 text-pink-600 hover:bg-pink-100",          dot: "bg-pink-400" },
  Corporate:     { active: "bg-blue-700 text-white",           inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100",          dot: "bg-blue-500" },
  Other:         { active: "bg-gray-600 text-white",           inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200",         dot: "bg-gray-400" },
};

const Portfolio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  
  const initialCategory = typeParam ? (slugToCategoryMap[typeParam] || "All") : "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    if (typeParam) {
      const mappedCategory = slugToCategoryMap[typeParam];
      if (mappedCategory) {
        setActiveCategory(mappedCategory);
      }
    }
  }, [typeParam]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      setSearchParams({});
    } else {
      const slug = Object.entries(slugToCategoryMap).find(([_, cat]) => cat === category)?.[0];
      if (slug) {
        setSearchParams({ type: slug });
      } else {
        setSearchParams({});
      }
    }
  };

  // Portfolio shows REAL client work only. An item is a real client if it has
  // a demoLabel set (e.g. "Open Invitation", "Open Memorial"). Items without a
  // demoLabel are demos/samples and live on the Templates page.
  // Sorted newest-first (highest id first) so the latest work leads the page.
  const realClientItems = portfolioItems
    .filter((item) => !!item.demoLabel)
    .slice()
    .sort((a, b) => b.id - a.id);
  const filteredItems =
    activeCategory === "All"
      ? realClientItems
      : realClientItems.filter((item) => item.type === activeCategory);

  return (
    <Layout>
      <SEO 
        title="Portfolio"
        description="Browse our portfolio of stunning digital invitations for weddings, funerals, naming ceremonies & more. See real examples of our work for Ghanaian events."
        keywords="digital invitation examples Ghana, wedding invitation samples, funeral program examples"
        canonical="/portfolio"
        ogImage="https://vibelinkevent.com/og-portfolio.jpg"
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Our Work
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Our Portfolio
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              See why families across the world choose VibeLink for their biggest moments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => {
              const style = categoryStyles[category] || categoryStyles.Other;
              const isActive = activeCategory === category;
              return (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.07, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                    isActive ? style.active : style.inactive
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : style.dot}`} />
                  {category}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Grid — or generic empty-state when the active filter has
          zero entries. Triggered by count, not by category name, so any future
          category with no entries gets the same graceful message instead of
          rendering a blank white gap. */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl mx-auto text-center py-8 md:py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
                <Inbox className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                We&rsquo;re adding {activeCategory} examples soon
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-8">
                No public case studies for this category yet — but we build them.
                Browse everything we&rsquo;ve shipped so far, or start your own.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleCategoryChange("All")}
                  className="w-full sm:w-auto"
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  View all work
                </Button>
                <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
                  <Link to="/get-started">
                    Start Your Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Image — width/height reserve space so the tile never
                    collapses while loading (no more "broken image" flash on
                    slow connections). Skeleton placeholder shown behind the
                    <img> so a slow-loading image reveals a subtle shimmer
                    instead of empty white. onError falls back to full-size
                    image if the thumbnail is missing on the server. */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30 animate-pulse" aria-hidden />
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (item.thumbnail && item.image && img.src.endsWith(item.thumbnail)) {
                        img.src = item.image;
                      }
                    }}
                    className="relative w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent pointer-events-none" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {item.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {item.demoUrl ? (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant={item.demoLabel ? "default" : "gold"} size="sm" className="w-full">
                          {item.demoLabel || "View Live Demo"}
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Demo Coming Soon
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/portfolio/${item.slug}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="py-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works →</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">View Pricing →</Link>
            <Link to="/get-started" className="hover:text-primary transition-colors">Start Your Invitation →</Link>
          </div>
        </div>
      </section>
      <CTASection hideViewWork />
    </Layout>
  );
};

export default Portfolio;
